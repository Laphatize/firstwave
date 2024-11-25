const puppeteer = require('puppeteer');
const OpenAI = require("openai");
const browserStreamingService = require('../services/browserStreaming');

class Attack {
  constructor(testId, organizationId, type, scope, permissions, context) {
    this.testId = testId;
    this.organizationId = organizationId;
    this.type = type;
    this.scope = scope;
    this.permissions = permissions;
    this.context = context;
    this.state = 'Starting Soon';
    
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    this.db = require('../config/firebase');
    this.browser = null;
    this.page = null;
    this.streaming = false;
    
    this.queuePosition = null;
    this.scheduledTime = null;
    this.status = 'QUEUED'; // QUEUED, IN_PROGRESS, COMPLETED, FAILED
    this.retryCount = 0;
    this.maxRetries = 3;
    
    this.liveViewMessages = [];
    this.lastMessageTimestamp = null;
    this.currentStep = null;
    this.recoveryPoint = null;
    this.researchData = null;
    this.attackPlan = null;
    
    this.recoveryAttempted = false;
    
    this.initializeWithRecovery();
  }

  async initializeWithRecovery() {
    try {
      const recovered = await this.recoverFromCheckpoint();
      if (recovered) {
        await this.logMessage('System', 'Recovered state from previous session', 'info');
        
        if (this.status === 'IN_PROGRESS') {
          await this.resumeAttack();
        }
      }
    } catch (error) {
      console.error('Recovery failed during initialization:', error);
    }
  }

  async resumeAttack() {
    try {
      // Initialize browser with streaming if needed
      if (!this.browser) {
        const initialized = await this.initBrowser();
        if (!initialized) {
          throw new Error('Failed to initialize browser');
        }
      }

      switch (this.currentStep) {
        case 'research':
          await this.performResearch();
          break;
        case 'analysis':
          await this.analyzeTarget(this.researchData);
          break;
        case 'phishing':
          await this.executePhishingStep();
          break;
        case 'social_media':
          await this.executeSocialMediaStep();
          break;
        default:
          await this.logMessage('System', 'No specific step to resume, starting from beginning', 'info');
          await this.executeAttack();
      }
    } catch (error) {
      await this.logMessage('System', `Error resuming attack: ${error.message}`, 'error');
      await this.updateQueueStatus('FAILED');
      throw error;
    }
  }

  async updateTestState(newState) {
    try {
      await this.db.collection('organizations')
        .doc(this.organizationId)
        .collection('tests')
        .doc(this.testId)
        .update({ state: newState });

      this.state = newState;
    } catch (error) {
      console.error('Error updating test state:', error);
      throw error;
    }
  }

  async initBrowser() {
    try {
      // Launch browser with specific debugging port
      this.browser = await puppeteer.launch({
        headless: false,
        defaultViewport: {
          width: 1280,
          height: 720
        },
        args: [
          '--window-size=1280,720',
          '--remote-debugging-port=9222',
          '--no-sandbox'
        ]
      });
      
      this.page = await this.browser.newPage();
      await this.page.setViewport({ width: 1280, height: 720 });

      // Get the browser's WebSocket endpoint
      const browserWSEndpoint = this.browser.wsEndpoint();
      
      // Start streaming the browser window with the WebSocket endpoint
      await browserStreamingService.startStreaming(this.testId, this.page, browserWSEndpoint);
      this.streaming = true;

      await this.logMessage('System', 'Browser initialized and streaming started', 'info');
      return true;
    } catch (error) {
      console.error('Browser initialization failed:', error.message);
      await this.logMessage('System', `Browser initialization failed: ${error.message}`, 'error');
      return false;
    }
  }

  async login() {
    await this.page.goto('https://www.linkedin.com/');
    await this.page.waitForSelector('.nav__button-secondary');
    await this.page.click('.nav__button-secondary');
    
    await this.page.waitForSelector('#username');
    await this.page.type('#username', process.env.LINKEDIN_USERNAME);
    await this.page.type('#password', process.env.LINKEDIN_PASSWORD);
    await this.page.click('.btn__primary--large');
    
    await this.page.waitForNavigation();
  }

  async generateMessage(target, conversationHistory = []) {
    try {
      const messages = [
        {
          role: "system",
          content: `You are simulating a social engineering attack as part of an authorized security test. 
                   Context: ${this.context}
                   Target: ${target}
                   Test Type: ${this.type}`
        },
        ...conversationHistory.map((msg, index) => ({
          role: index % 2 === 0 ? "user" : "assistant",
          content: msg
        }))
      ];

      const completion = await this.openai.chat.completions.create({
        messages,
        model: "gpt-4",
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.error("Error generating message:", error);
      throw error;
    }
  }

  async addToQueue() {
    try {
      const queueRef = this.db.collection('attackQueue');
      
      const queueSnapshot = await queueRef.orderBy('queuePosition', 'desc').limit(1).get();
      const lastPosition = queueSnapshot.empty ? 0 : queueSnapshot.docs[0].data().queuePosition;
      
      this.queuePosition = lastPosition + 1;
      this.scheduledTime = new Date(Date.now() + (this.queuePosition * 30 * 60 * 1000));
      
      await queueRef.doc(this.testId).set({
        testId: this.testId,
        organizationId: this.organizationId,
        type: this.type,
        queuePosition: this.queuePosition,
        scheduledTime: this.scheduledTime,
        status: this.status,
        retryCount: this.retryCount
      });

      await this.updateTestState('Queued');
      return this.queuePosition;
    } catch (error) {
      console.error('Error adding attack to queue:', error);
      throw error;
    }
  }

  async updateQueueStatus(status) {
    try {
      const queueRef = this.db.collection('attackQueue').doc(this.testId);
      
      // Check if document exists, if not create it
      const doc = await queueRef.get();
      if (!doc.exists) {
        await queueRef.set({
          testId: this.testId,
          organizationId: this.organizationId,
          status: status,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      } else {
        await queueRef.update({
          status: status,
          updatedAt: new Date()
        });
      }
      
      await this.updateTestState(status === 'COMPLETED' ? 'Live' : status);
    } catch (error) {
      console.error('Error updating queue status:', error);
      throw error;
    }
  }

  async executeAttack() {
    try {
      if (!this.recoveryAttempted) {
        const recovered = await this.recoverFromCheckpoint();
        if (recovered) {
          await this.logMessage('System', 'Recovered from previous checkpoint', 'info');
          return await this.resumeAttack();
        }
      }

      // Initialize browser with streaming
      if (!this.browser) {
        const initialized = await this.initBrowser();
        if (!initialized) {
          throw new Error('Failed to initialize browser');
        }
      }

      // Create queue document first
      await this.db.collection('attackQueue').doc(this.testId).set({
        testId: this.testId,
        organizationId: this.organizationId,
        status: 'IN_PROGRESS',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await this.updateQueueStatus('IN_PROGRESS');
      await this.logMessage('Agent', `I understand the scope. I am going to utilize the research function for ${this.scope}.`);
      
      // Research phase
      await this.logMessage('Function Runner', 'Waiting on LinkedIn search...');
      const researchData = await this.performResearch();
      await this.logMessage('Function Runner', 'LinkedIn search is done, handing off to agent.');
      
      // Analysis phase
      const analysis = await this.analyzeTarget(researchData);
      await this.logMessage('Agent', analysis);
      
      // Execute attack steps based on permissions
      if (this.permissions.includes('send phishing emails')) {
        await this.executePhishingStep();
      }
      
      if (this.permissions.includes('social engineering phone')) {
        await this.executePhoneStep();
      }
      
      await this.updateQueueStatus('COMPLETED');
      return true;
    } catch (error) {
      await this.logMessage('System', `Error: ${error.message}`, 'error');
      await this.updateQueueStatus('FAILED');
      throw error;
    } finally {
      // Clean up streaming when attack ends
      if (this.streaming) {
        await browserStreamingService.stopStreaming(this.testId);
        this.streaming = false;
      }
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
        this.page = null;
      }
    }
  }

  async logMessage(role, content, type = 'info') {
    const message = {
      role,
      content,
      type,
      timestamp: new Date(),
      testId: this.testId
    };

    // Add to local array
    this.liveViewMessages.push(message);
    this.lastMessageTimestamp = message.timestamp;

    // Save to Firebase
    await this.db.collection('organizations')
      .doc(this.organizationId)
      .collection('tests')
      .doc(this.testId)
      .collection('liveView')
      .add(message);

    // Update recovery point
    await this.updateRecoveryPoint();
  }

  async updateRecoveryPoint() {
    const recoveryData = {
      currentStep: this.currentStep,
      lastMessageTimestamp: this.lastMessageTimestamp,
      status: this.status,
      queuePosition: this.queuePosition,
      retryCount: this.retryCount,
      researchData: this.researchData,
      attackPlan: this.attackPlan,
      liveViewMessages: this.liveViewMessages,
      updatedAt: new Date(),
      recoveryAttempted: true
    };

    await this.db.collection('organizations')
      .doc(this.organizationId)
      .collection('tests')
      .doc(this.testId)
      .update({ 
        recoveryPoint: recoveryData,
        state: this.state
      });
  }

  async recoverFromCheckpoint() {
    try {
      const testDoc = await this.db.collection('organizations')
        .doc(this.organizationId)
        .collection('tests')
        .doc(this.testId)
        .get();

      const recoveryPoint = testDoc.data()?.recoveryPoint;
      if (!recoveryPoint) {
        console.log('No recovery point found');
        return false;
      }

      // Restore all state properties
      Object.keys(recoveryPoint).forEach(key => {
        if (this.hasOwnProperty(key)) {
          this[key] = recoveryPoint[key];
        }
      });

      // Re-initialize browser if needed
      if (this.currentStep && !this.browser) {
        await this.initBrowser();
      }

      await this.logMessage('System', 'Successfully recovered from checkpoint', 'info');
      return true;
    } catch (error) {
      console.error('Error recovering from checkpoint:', error);
      await this.logMessage('System', `Recovery failed: ${error.message}`, 'error');
      return false;
    }
  }

  // Implementation stubs for different attack vectors
  async sendPhishingEmails() {
    // Implementation for sending phishing emails
  }

  async performPhoneSocialEngineering() {
    // Implementation for phone-based social engineering
  }

  async createSocialMediaProfiles() {
    // Implementation for creating fake social media profiles
  }

  async performResearch() {
    try {
      await this.logMessage('Function Runner', 'Waiting on LinkedIn search...');
      
      // Initialize browser if needed
      if (!this.browser) {
        this.browser = await puppeteer.launch({
          headless: false,
          args: ['--no-sandbox']
        });
        this.page = await this.browser.newPage();
      }

      // Search LinkedIn with updated selector
      await this.page.goto('https://www.linkedin.com/search/results/companies/');
      await this.page.waitForSelector('input.search-global-typeahead__input');
      await this.page.type('input.search-global-typeahead__input', this.scope);
      await this.page.keyboard.press('Enter');
      await this.page.waitForNavigation();

      // Extract company information
      const companyData = await this.page.evaluate(() => {
        const companies = document.querySelectorAll('.search-result-item');
        return Array.from(companies).map(company => ({
          name: company.querySelector('.company-name')?.textContent?.trim(),
          description: company.querySelector('.company-description')?.textContent?.trim(),
          employeeCount: company.querySelector('.employee-count')?.textContent?.trim(),
          location: company.querySelector('.company-location')?.textContent?.trim()
        }));
      });

      await this.logMessage('Function Runner', 'LinkedIn search is done, handing off to agent.');

      // Generate company overview using AI
      const overview = await this.generateCompanyOverview(companyData[0]);
      await this.logMessage('Agent', overview);

      return companyData[0];
    } catch (error) {
      await this.logMessage('System', `Research error: ${error.message}`, 'error');
      throw error;
    }
  }

  async generateCompanyOverview(companyData) {
    const prompt = `Based on this company data: ${JSON.stringify(companyData)}, 
                   generate a brief overview focusing on potential security implications. 
                   Format it with these sections: Company Overview, Platform, Location, Size and Network.`;

    const completion = await this.openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4-turbo-preview",
    });

    return completion.choices[0].message.content;
  }

  async generateAttackPlan() {
    const prompt = `Given this company: ${JSON.stringify(this.researchData)}
                   and these permissions: ${JSON.stringify(this.permissions)},
                   create a detailed but ethical attack plan.
                   Consider the context: ${this.context}`;

    const completion = await this.openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4-turbo-preview",
    });

    this.attackPlan = completion.choices[0].message.content;
    await this.logMessage('Agent', this.attackPlan);
  }

  async analyzeTarget(researchData) {
    this.currentStep = 'analysis';
    // Implementation for target analysis
    return '';
  }

  async executePhishingStep() {
    this.currentStep = 'phishing';
    // Implementation for phishing attack
  }

  async executeSocialMediaStep() {
    this.currentStep = 'social_media';
    // Implementation for social media attack
  }

  // Add cleanup method for proper resource management
  async cleanup() {
    try {
      if (this.streaming) {
        await browserStreamingService.stopStreaming(this.testId);
        this.streaming = false;
      }
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
        this.page = null;
      }
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }
}

module.exports = Attack;
