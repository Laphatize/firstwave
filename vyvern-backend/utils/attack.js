const puppeteer = require('puppeteer');
const CDP = require('chrome-remote-interface');
const OpenAI = require("openai");
const WebSocket = require('ws');

class Attack {
  constructor(testId, organizationId, type, scope, permissions, context) {
    this.testId = testId;
    this.organizationId = organizationId;
    this.type = type;
    this.scope = scope;
    this.permissions = Array.isArray(permissions) ? permissions : [];
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
    this.linkedInLoggedIn = false;
    
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
      console.log('Starting browser initialization...');
      
      this.browser = await puppeteer.launch({
        headless: true,
        defaultViewport: {
          width: 1280,
          height: 720
        },
        args: [
          '--window-size=1280,720',
          '--no-sandbox',
          '--disable-setuid-sandbox'
        ]
      });
      
      this.page = await this.browser.newPage();
      await this.page.setViewport({ width: 1280, height: 720 });
      
      // Navigate to a blank page to ensure we have content
      await this.page.goto('about:blank');

      this.streaming = true;
      // Start screenshot loop in background
      this.startScreenshotLoop().catch(console.error);

      // Update test status
      await this.db.collection('organizations')
        .doc(this.organizationId)
        .collection('tests')
        .doc(this.testId)
        .update({ 
          streamActive: true,
          state: 'Live'
        });

      await this.logMessage('Agent', 'I am ready to surf the web.', 'info');
      return true;

    } catch (error) {
      console.error('Browser initialization failed:', error);
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
        this.page = null;
      }
      await this.logMessage('System', `Browser initialization failed: ${error.message}`, 'error');
      return false;
    }
  }

  async startScreenshotLoop() {
    console.log('Starting screenshot loop...');
    
    while (this.streaming && this.page) {
      try {
        // Skip if page is busy with evaluation
        if (this.page._isEvaluating) {
          await new Promise(resolve => setTimeout(resolve, 100));
          continue;
        }

        const screenshot = await this.page.screenshot({
          type: 'jpeg',
          quality: 70,
          encoding: 'binary'
        });

        // Debug log
        console.log(`Screenshot taken, size: ${screenshot.length} bytes`);

        if (global.wss && global.wss.clients) {
          global.wss.clients.forEach((client) => {
            if (client.testId === this.testId && client.readyState === WebSocket.OPEN) {
              client.send(screenshot, { binary: true });
            }
          });
        }

        // Add a small delay between screenshots (30 FPS)
        await new Promise(resolve => setTimeout(resolve, 33));
      } catch (error) {
        console.error('Error in screenshot loop:', error);
        await this.logMessage('System', `Screenshot error: ${error.message}`, 'error');
      }
    }
    
    console.log('Screenshot loop ended');
  }

  async login() {
    try {
      await this.logMessage('Function Runner', 'Starting LinkedIn login process', 'info');
      
      try {
        await this.page.goto('https://www.linkedin.com/login');
      } catch (error) {
        await this.logMessage('Function Runner', `Failed to load LinkedIn homepage: ${error.message}`, 'error');
        return false;
      }

      try {
        await this.page.waitForSelector('#username');
        await this.page.type('#username', process.env.LINKEDIN_USERNAME);
        await this.page.type('#password', process.env.LINKEDIN_PASSWORD);
        await this.logMessage('Function Runner', `Credentials have been typed in. Now to click login.`, 'info');
      } catch (error) {
        await this.logMessage('Function Runner', `Failed to input credentials: ${error.message}`, 'error');
        return false;
      }

      try {
        await this.page.waitForSelector('button[data-litms-control-urn="login-submit"]');
        await new Promise(resolve => setTimeout(resolve, 3000));
        await this.page.click('button[data-litms-control-urn="login-submit"]');
        await this.page.waitForNavigation();
      } catch (error) {
        await this.logMessage('Function Runner', `Failed to submit login form: ${error.message}`, 'error');
        return false;
      }

      await this.logMessage('Function Runner', 'Successfully logged into LinkedIn', 'info');
      return true;
    } catch (error) {
      await this.logMessage('Function Runner', `LinkedIn login failed: ${error.message}`, 'error');
      return false;
    }
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
      
      // Execute attack steps based on permissions (with null check)
      if (this.permissions?.includes('send phishing emails')) {
        try {
          await this.executePhishingStep();
        } catch (error) {
          await this.logMessage('System', `Phishing step failed: ${error.message}`, 'error');
        }
      }
      
      if (this.permissions?.includes('social engineering phone')) {
        try {
          await this.executePhoneStep();
        } catch (error) {
          await this.logMessage('System', `Phone step failed: ${error.message}`, 'error');
        }
      }
      
      await this.updateQueueStatus('COMPLETED');
      return true;
    } catch (error) {
      await this.logMessage('System', `Attack execution error: ${error.message}`, 'error');
      await this.updateQueueStatus('FAILED');
      return false;
    } finally {
      // Clean up streaming when attack ends
      if (this.streaming) {
        this.streaming = false;  // This will stop the screenshot loop
        
        // Update the test document to reflect streaming status
        await this.db.collection('organizations')
          .doc(this.organizationId)
          .collection('tests')
          .doc(this.testId)
          .update({ 
            streamActive: false 
          });
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
      await this.logMessage('Function Runner', 'Starting LinkedIn research...');
      
      // Initialize browser if needed
      if (!this.browser) {
        const initialized = await this.initBrowser();
        if (!initialized) {
          throw new Error('Failed to initialize browser');
        }
      }

      // Only login if not already logged in
      if (!this.linkedInLoggedIn) {
        const loginSuccess = await this.login();
        if (!loginSuccess) {
          throw new Error('LinkedIn login failed');
        }
        this.linkedInLoggedIn = true;
      }

      // Perform the search
      await this.page.goto('https://www.linkedin.com/search/results/companies/');
      await this.page.waitForSelector('input.search-global-typeahead__input');
      await this.page.type('input.search-global-typeahead__input', this.scope);
      await this.page.keyboard.press('Enter');
      await this.page.waitForNavigation();

      // Set evaluation flag before complex operation
      this.page._isEvaluating = true;
      
      const companyLink = await this.page.evaluate((scope) => {
        const companies = document.querySelectorAll('.entity-result');
        let bestMatch = {
          score: 0,
          link: null
        };

        // Simple similarity score function
        const getSimilarity = (str1, str2) => {
          str1 = str1.toLowerCase();
          str2 = str2.toLowerCase();
          
          if (str1 === str2) return 1;
          if (str1.includes(str2) || str2.includes(str1)) return 0.8;
          
          const words1 = str1.split(/\s+/);
          const words2 = str2.split(/\s+/);
          const commonWords = words1.filter(word => words2.includes(word));
          return commonWords.length / Math.max(words1.length, words2.length);
        }; 

        // Get first company link as fallback
        let firstCompanyLink = null;
        const firstCompany = companies[0]?.querySelector('.entity-result__title-line a');
        if (firstCompany) {
          firstCompanyLink = firstCompany.href;
        }

        companies.forEach(company => {
          const nameElement = company.querySelector('.entity-result__title-line .artdeco-button__text, .entity-result__title-line a');
          if (nameElement?.textContent) {
            const score = getSimilarity(nameElement.textContent.trim(), scope);
            if (score > bestMatch.score) {
              bestMatch = {
                score: score,
                link: nameElement.closest('a').href
              };
            }
          }
        });

        // Return best match if score > 0.3, otherwise return first company
        return bestMatch.score > 0.3 ? bestMatch.link : firstCompanyLink;
      }, this.scope);

      if (!companyLink) {
        throw new Error(`No companies found for "${this.scope}"`);
      }

      // Clear evaluation flag after operation
      this.page._isEvaluating = false;

      await this.page.goto(companyLink);
      await this.page.waitForSelector('.org-top-card'); // Wait for company page to load

      // Take screenshots of key sections
      const screenshots = {
        overview: await this.page.screenshot({
          type: 'jpeg',
          quality: 80,
          encoding: 'base64'
        })
      };

      // Extract detailed company information
      const companyData = await this.page.evaluate(() => ({
        name: document.querySelector('.org-top-card-summary__title')?.textContent?.trim(),
        industry: document.querySelector('.org-top-card-summary-info-list__info-item')?.textContent?.trim(),
        employeeCount: document.querySelector('.org-top-card-summary-info-list__info-item:nth-child(2)')?.textContent?.trim(),
        location: document.querySelector('.org-top-card-summary-info-list__info-item:nth-child(3)')?.textContent?.trim(),
        about: document.querySelector('.org-about-us-organization-description')?.textContent?.trim(),
        website: document.querySelector('.org-about-us-company-module__website')?.textContent?.trim(),
        specialties: document.querySelector('.org-about-us-organization-module__specialties')?.textContent?.trim()
      }));

      // Generate comprehensive analysis using AI
      const analysis = await this.generateCompanyOverview({
        companyData,
        screenshots
      });

      await this.logMessage('Agent', analysis);

      // Generate attack plan based on the research
      const attackPlan = await this.generateAttackPlan({
        companyData,
        analysis,
        screenshots
      });

      await this.logMessage('Agent', 'Based on my research, here is my proposed attack plan:');
      await this.logMessage('Agent', attackPlan);
      await this.logMessage('Function Runner', 'Research and planning completed');

      // Store all research data
      this.researchData = {
        companyData,
        screenshots,
        analysis,
        attackPlan,
        timestamp: new Date()
      };

      return this.researchData;
    } catch (error) {
      await this.logMessage('System', `Research error: ${error.message}`, 'error');
      throw error;
    }
  }

  async generateCompanyOverview(data) {
    const prompt = {
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this company data and screenshot for potential security implications:
              
              Company Data: ${JSON.stringify(data.companyData)}
              
              Please analyze the visual information and company structure visible in the search results.
              
              Format your analysis with these sections:
              1. Company Overview
              2. Digital Footprint
              3. Potential Attack Vectors
              4. Security Recommendations`
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${data.screenshot}`
              }
            }
          ]
        }
      ],
      model: "gpt-4o",
      max_tokens: 1000
    };

    const completion = await this.openai.chat.completions.create(prompt);
    return completion.choices[0].message.content;
  }

  async generateAttackPlan(data) {
    const prompt = {
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Based on this company research, create a detailed but ethical attack plan.
              
              Company Data: ${JSON.stringify(data.companyData)}
              Previous Analysis: ${data.analysis}
              
              Available Permissions: ${JSON.stringify(this.permissions)}
              Test Context: ${this.context}
              
              Create a step-by-step attack plan that:
              1. Identifies high-value targets based on company structure
              2. Leverages available permissions (${this.permissions.join(', ')})
              3. Uses company-specific information for targeted approaches
              4. Maintains ethical boundaries
              5. Includes specific success metrics`
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${data.screenshots.overview}`
              }
            }
          ]
        }
      ],
      model: "gpt-4-vision-preview",
      max_tokens: 1500
    };

    const completion = await this.openai.chat.completions.create(prompt);
    return completion.choices[0].message.content;
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
      this.streaming = false; // Stop screenshot loop
      this.linkedInLoggedIn = false; // Reset login state
      
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
        this.page = null;
        
        // Update test status
        await this.db.collection('organizations')
          .doc(this.organizationId)
          .collection('tests')
          .doc(this.testId)
          .update({ 
            streamActive: false 
          });
      }
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }

  async fullRestart() {
    try {
      // Reset all state except browser session
      this.currentStep = null;
      this.recoveryPoint = null;
      this.researchData = null;
      this.attackPlan = null;
      this.liveViewMessages = [];
      this.lastMessageTimestamp = null;
      this.recoveryAttempted = false;
      // Don't reset linkedInLoggedIn flag
      
      // Start fresh attack
      return await this.executeAttack();
    } catch (error) {
      await this.logMessage('System', `Full restart error: ${error.message}`, 'error');
      await this.updateQueueStatus('FAILED');
      throw error;
    }
  }
}

module.exports = Attack;
