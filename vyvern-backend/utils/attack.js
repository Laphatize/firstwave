const puppeteer = require('puppeteer');
const WebSocket = require('ws');
const OpenAI = require('openai');

let LinkedInResearchAgent = null;

async function initializeLinkedIn() {
  try {
    // Dynamic import of the LinkedIn client
    const { LinkedInClient } = await import('linkedin-api-fetch');
    
    LinkedInResearchAgent = new LinkedInClient({
      email: process.env.LINKEDIN_USERNAME,
      password: process.env.LINKEDIN_PASSWORD,
      throttle: false
    });

    await LinkedInResearchAgent.ensureAuthenticated();
    console.log("LinkedInResearchAgent initialized and authenticated");
    return true;
  } catch (error) {
    console.error("Error initializing LinkedInResearchAgent:", error);
    return false;
  }
}

class Attack {
  constructor(
    testId,
    organizationId,
    type,
    scope,
    permissions,
    context,
    targets,
    companyContext,
    name
  ) {
    this.testId = testId;
    this.organizationId = organizationId;
    this.type = type;
    this.scope = scope;
    this.permissions = Array.isArray(permissions) ? permissions : [];
    this.context = context;
    this.state = "Starting Soon";
    this.targets = targets || [];
    this.companyContext = companyContext || {
      name: scope,
      emails: [],
      industry: null,
      size: null,
      location: null
    };

    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.db = require("../config/firebase");
    this.browser = null;
    this.page = null;
    this.streaming = false;
    this.name = name;
    this.queuePosition = null;
    this.scheduledTime = null;
    this.status = "QUEUED"; // QUEUED, IN_PROGRESS, COMPLETED, FAILED
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
        await this.logMessage(
          "System",
          "Recovered state from previous session",
          "info",
        );

        if (this.status === "IN_PROGRESS") {
          await this.resumeAttack();
        }
      }
    } catch (error) {
      console.error("Recovery failed during initialization:", error);
    }
  }

  async resumeAttack() {
    try {
      // Initialize browser with streaming if needed
      if (!this.browser) {
        const initialized = await this.initBrowser();
        if (!initialized) {
          throw new Error("Failed to initialize browser");
        }
      }

      switch (this.currentStep) {
        case "research":
          await this.performResearch();
          break;
        case "analysis":
          await this.analyzeTarget(this.researchData);
          break;
        case "phishing":
          await this.executePhishingStep();
          break;
        case "social_media":
          await this.executeSocialMediaStep();
          break;
        default:
          await this.logMessage(
            "System",
            "No specific step to resume, starting from beginning",
            "info",
          );
     //     await this.executeAttack();
          await this.executeAPILevelAttack();
      }
    } catch (error) {
      await this.logMessage(
        "System",
        `Error resuming attack: ${error.message}`,
        "error",
      );
      await this.updateQueueStatus("FAILED");
      throw error;
    }
  }

  async updateTestState(newState) {
    try {
      await this.db
        .collection("organizations")
        .doc(this.organizationId)
        .collection("tests")
        .doc(this.testId)
        .update({ state: newState });

      this.state = newState;
    } catch (error) {
      console.error("Error updating test state:", error);
      throw error;
    }
  }

  async initBrowser() {
    try {
      console.log("Starting browser initialization...");

      this.browser = await puppeteer.launch({
        headless: false,
        defaultViewport: {
          width: 1280,
          height: 720,
        },
        args: [
          "--window-size=1280,720",
          "--no-sandbox",
          "--disable-setuid-sandbox",
        ],
      });

      this.page = await this.browser.newPage();
      await this.page.setViewport({ width: 1280, height: 720 });

      // Navigate to a blank page to ensure we have content
      await this.page.goto("about:blank");

      this.streaming = true;
      // Start screenshot loop in background
      this.startScreenshotLoop().catch(console.error);

      // Update test status
      await this.db
        .collection("organizations")
        .doc(this.organizationId)
        .collection("tests")
        .doc(this.testId)
        .update({
          streamActive: true,
          state: "Live",
        });

      await this.logMessage("Agent", "I am ready to surf the web.", "info");
      return true;
    } catch (error) {
      console.error("Browser initialization failed:", error);
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
        this.page = null;
      }
      await this.logMessage(
        "System",
        `Browser initialization failed: ${error.message}`,
        "error",
      );
      return false;
    }
  }

  async startScreenshotLoop() {
    console.log("Starting screenshot loop...");

    while (this.streaming && this.page) {
      try {
        // Skip if page is busy with evaluation
        if (this.page._isEvaluating) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          continue;
        }

        const screenshot = await this.page.screenshot({
          type: "jpeg",
          quality: 70,
          encoding: "binary",
        });

        // Debug log
        //console.log(`Screenshot taken, size: ${screenshot.length} bytes`);

        if (global.wss && global.wss.clients) {
          global.wss.clients.forEach((client) => {
            if (
              client.testId === this.testId &&
              client.readyState === WebSocket.OPEN
            ) {
              client.send(screenshot, { binary: true });
            }
          });
        }

        // Add a small delay between screenshots (30 FPS)
        await new Promise((resolve) => setTimeout(resolve, 33));
      } catch (error) {
        console.error("Error in screenshot loop:", error);
        await this.logMessage(
          "System",
          `Screenshot error: ${error.message}`,
          "error",
        );
      }
    }

    console.log("Screenshot loop ended");
  }

  async login() {
    try {
      await this.logMessage(
        "Function Runner",
        "Starting LinkedIn login process",
        "info",
      );

      try {
        await this.page.goto("https://www.linkedin.com/login");
      } catch (error) {
        await this.logMessage(
          "Function Runner",
          `Failed to load LinkedIn homepage: ${error.message}`,
          "error",
        );
        return false;
      }

      try {
        await this.page.waitForSelector("#username");
        await this.page.type("#username", process.env.LINKEDIN_USERNAME);
        await this.page.type("#password", process.env.LINKEDIN_PASSWORD);
        await this.logMessage(
          "Function Runner",
          `Credentials have been typed in. Now to click login.`,
          "info",
        );
      } catch (error) {
        await this.logMessage(
          "Function Runner",
          `Failed to input credentials: ${error.message}`,
          "error",
        );
        return false;
      }

      try {
        await this.page.waitForSelector(
          'button[data-litms-control-urn="login-submit"]',
        );
        await new Promise((resolve) => setTimeout(resolve, 3000));
        await this.page.click('button[data-litms-control-urn="login-submit"]');
        await this.page.waitForNavigation();
      } catch (error) {
        await this.logMessage(
          "Function Runner",
          `Failed to submit login form: ${error}`,
          "error",
        );
        return false;
      }

      await this.logMessage(
        "Function Runner",
        "Successfully logged into LinkedIn",
        "info",
      );
      return true;
    } catch (error) {
      await this.logMessage(
        "Function Runner",
        `LinkedIn login failed: ${error.message}`,
        "error",
      );
      return false;
    }
  }

  async generateMessage(target, conversationHistory = []) {
    try {
      const messages = [
        {
          role: "system",
          content: `You are simulating a social engineering attack as part of an authorized security test.
                   Context: ${this.name}
                   Target: ${target}
                   Test Type: ${this.type}`,
        },
        ...conversationHistory.map((msg, index) => ({
          role: index % 2 === 0 ? "user" : "assistant",
          content: msg,
        })),
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
      const queueRef = this.db.collection("attackQueue");

      const queueSnapshot = await queueRef
        .orderBy("queuePosition", "desc")
        .limit(1)
        .get();
      const lastPosition = queueSnapshot.empty
        ? 0
        : queueSnapshot.docs[0].data().queuePosition;

      this.queuePosition = lastPosition + 1;
      this.scheduledTime = new Date(
        Date.now() + this.queuePosition * 30 * 60 * 1000,
      );

      await queueRef.doc(this.testId).set({
        testId: this.testId,
        organizationId: this.organizationId,
        type: this.type,
        queuePosition: this.queuePosition,
        scheduledTime: this.scheduledTime,
        status: this.status,
        retryCount: this.retryCount,
      });

      await this.updateTestState("Queued");
      return this.queuePosition;
    } catch (error) {
      console.error("Error adding attack to queue:", error);
      throw error;
    }
  }

  async updateQueueStatus(status) {
    try {
      const queueRef = this.db.collection("attackQueue").doc(this.testId);

      // Check if document exists, if not create it
      const doc = await queueRef.get();
      if (!doc.exists) {
        await queueRef.set({
          testId: this.testId,
          organizationId: this.organizationId,
          status: status,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      } else {
        await queueRef.update({
          status: status,
          updatedAt: new Date(),
        });
      }

      await this.updateTestState(status === "COMPLETED" ? "Live" : status);
    } catch (error) {
      console.error("Error updating queue status:", error);
      throw error;
    }
  }

  async executeAttack() {
    try {
      if (!this.recoveryAttempted) {
        const recovered = await this.recoverFromCheckpoint();
        if (recovered) {
          await this.logMessage(
            "System",
            "Recovered from previous checkpoint",
            "info",
          );
          return await this.resumeAttack();
        }
      }

      // Initialize browser with streaming
      if (!this.browser) {
        const initialized = await this.initBrowser();
        if (!initialized) {
          throw new Error("Failed to initialize browser");
        }
      }

      // Create queue document first
      await this.db.collection("attackQueue").doc(this.testId).set({
        testId: this.testId,
        organizationId: this.organizationId,
        status: "IN_PROGRESS",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await this.updateQueueStatus("IN_PROGRESS");
      await this.logMessage(
        "Agent",
        `I understand the scope. I am going to utilize the research function for ${this.scope}.`,
      );

      // Research phase
      await this.logMessage("Function Runner", "Waiting on LinkedIn search...");
      const researchData = await this.performResearch();
      await this.logMessage(
        "Function Runner",
        "LinkedIn search is done, handing off to agent.",
      );

      // Analysis phase
      const analysis = await this.analyzeTarget(researchData);
      await this.logMessage("Agent", analysis);

      // Execute attack steps based on permissions (with null check)
      if (this.permissions?.includes("send phishing emails")) {
        try {
          await this.executePhishingStep();
        } catch (error) {
          await this.logMessage(
            "System",
            `Phishing step failed: ${error.message}`,
            "error",
          );
        }
      }

      if (this.permissions?.includes("social engineering phone")) {
        try {
          await this.executePhoneStep();
        } catch (error) {
          await this.logMessage(
            "System",
            `Phone step failed: ${error.message}`,
            "error",
          );
        }
      }

      await this.updateQueueStatus("COMPLETED");
      return true;
    } catch (error) {
      await this.logMessage(
        "System",
        `Attack execution error: ${error.message}`,
        "error",
      );
      await this.updateQueueStatus("FAILED");
      return false;
    } finally {
      // Clean up streaming when attack ends
      if (this.streaming) {
        this.streaming = false; // This will stop the screenshot loop

        // Update the test document to reflect streaming status
        await this.db
          .collection("organizations")
          .doc(this.organizationId)
          .collection("tests")
          .doc(this.testId)
          .update({
            streamActive: false,
          });
      }

      if (this.browser) {
        await this.browser.close();
        this.browser = null;
        this.page = null;
      }
    }
  }

  async executeAPILevelAttack() {
    if (this.isExecuting) {
      await this.logMessage(
        "System",
        "Attack already in progress, please wait...",
        "warning"
      );
      return;
    }

    this.isExecuting = true;
    
    try {
      // Initialize if needed
      if (!LinkedInResearchAgent) {
        await this.logMessage(
          "Function Runner",
          "Initializing LinkedIn client...",
          "info"
        );
        
        const initialized = await initializeLinkedIn();
        if (!initialized) {
          throw new Error("Failed to initialize LinkedIn client");
        }
      }

      let companyName = this.companyContext.name;
      
      await this.logMessage(
        "Function Runner", 
        `Searching for company: ${companyName}`,
        "info"
      );

      try {
        // Add delay between requests (random 1-5 seconds)
        const delay = Math.floor(Math.random() * 4000) + 1000;
        await new Promise(resolve => setTimeout(resolve, delay));

        // Use the proper method from the library
        const company = await LinkedInResearchAgent.getCompany(companyName);
        
        if (!company) {
          throw new Error('No company data found');
        }

        // Store the research data
        this.researchData = {
          companyInfo: company,
          retrievedAt: new Date().toISOString()
        };

        await this.logMessage(
          "Function Runner",
          "Successfully retrieved company data",
          "info"
        );

        // Log relevant company details with safe access
        const companyDetails = {
          name: company?.name || 'Unknown',
          industry: company?.industry || 'Unknown',
          description: company?.description || 'No description available',
          employeeCount: company?.employeeCount || 'Unknown',
          headquarters: company?.headquarters || 'Unknown'
        };

        await this.logMessage(
          "Function Runner",
          `Company Details: ${JSON.stringify(companyDetails, null, 2)}`,
          "info"
        );

      } catch (apiError) {
        // Check for specific error types
        if (apiError.message?.includes('CHALLENGE')) {
          await this.logMessage(
            "System",
            "LinkedIn requires manual verification. Please log in through a browser first.",
            "error"
          );
        } else if (apiError.response?.status === 401) {
          await this.logMessage(
            "System",
            "Authentication failed. Please verify credentials and try logging in through a browser.",
            "error"
          );
        }
        throw apiError;
      }

    } catch (error) {
      console.error("Error in executeAPILevelAttack:", error);
      await this.logMessage(
        "System",
        `API level attack error: ${error.message}`,
        "error"
      );
      
      await this.updateQueueStatus("FAILED");
    } finally {
      this.isExecuting = false;
    }
  }

  async logMessage(role, content, type = "info") {
    const message = {
      role,
      content,
      type,
      timestamp: new Date(),
      testId: this.testId,
    };

    // Add to local array
    this.liveViewMessages.push(message);
    this.lastMessageTimestamp = message.timestamp;

    // Save to Firebase
    await this.db
      .collection("organizations")
      .doc(this.organizationId)
      .collection("tests")
      .doc(this.testId)
      .collection("liveView")
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
      recoveryAttempted: true,
    };

    await this.db
      .collection("organizations")
      .doc(this.organizationId)
      .collection("tests")
      .doc(this.testId)
      .update({
        recoveryPoint: recoveryData,
        state: this.state,
      });
  }

  async recoverFromCheckpoint() {
    try {
      const testDoc = await this.db
        .collection("organizations")
        .doc(this.organizationId)
        .collection("tests")
        .doc(this.testId)
        .get();

      const recoveryPoint = testDoc.data()?.recoveryPoint;
      if (!recoveryPoint) {
        console.log("No recovery point found");
        return false;
      }

      // Restore all state properties
      Object.keys(recoveryPoint).forEach((key) => {
        if (this.hasOwnProperty(key)) {
          this[key] = recoveryPoint[key];
        }
      });

      // Re-initialize browser if needed
      if (this.currentStep && !this.browser) {
        await this.initBrowser();
      }

      await this.logMessage(
        "System",
        "Successfully recovered from checkpoint",
        "info",
      );
      return true;
    } catch (error) {
      console.error("Error recovering from checkpoint:", error);
      await this.logMessage(
        "System",
        `Recovery failed: ${error.message}`,
        "error",
      );
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
      await this.logMessage("Function Runner", "Starting LinkedIn research...");

      // Initialize browser if needed
      if (!this.browser) {
        const initialized = await this.initBrowser();
        if (!initialized) {
          throw new Error("Failed to initialize browser");
        }
      }

      // Only login if not already logged in
      if (!this.linkedInLoggedIn) {
        const loginSuccess = await this.login();
        if (!loginSuccess) {
          throw new Error("LinkedIn login failed");
        }
        this.linkedInLoggedIn = true;
      }

      const companyName = this.companyContext.name;
      await this.logMessage(
        "Function Runner",
        `Searching for company: ${companyName}`
      );

      // Search for company
      await this.page.goto("https://www.linkedin.com/search/results/companies/");
      await this.page.waitForSelector('input[aria-label="Search"]');
      await this.page.type('input[aria-label="Search"]', companyName);
      await this.page.keyboard.press("Enter");
      
      // Wait for search results and click the first company
      await this.page.waitForSelector(".artdeco-card", { timeout: 10000 });
      
      // Click on the first company result
      await this.page.click(".artdeco-card .linked-area");
      
      // Wait for company page to load
      await this.page.waitForSelector(".org-top-card", { timeout: 10000 });

      // Get the page content for AI analysis
      const pageContent = await this.page.evaluate(() => {
        return document.body.innerText;
      });

      await this.logMessage(
        "Function Runner",
        "Analyzing company page with AI..."
      );

      // Use OpenAI to analyze the page content
      const analysis = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a security researcher analyzing a company's LinkedIn page. Extract key information that could be useful for social engineering."
          },
          {
            role: "user",
            content: `Analyze this LinkedIn company page content and extract key details about the company, its employees, and potential attack vectors: ${pageContent}`
          }
        ]
      });

      const researchData = analysis.choices[0].message.content;

      await this.logMessage(
        "Function Runner",
        `AI Analysis completed: ${researchData}`
      );

      // Store the research data
      this.researchData = researchData;

      return researchData;
    } catch (error) {
      await this.logMessage(
        "System",
        `Research error: ${error.message}`,
        "error"
      );
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
              4. Security Recommendations`,
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${data.screenshot}`,
              },
            },
          ],
        },
      ],
      model: "gpt-4o",
      max_tokens: 1000,
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
              2. Leverages available permissions (${this.permissions.join(", ")})
              3. Uses company-specific information for targeted approaches
              4. Maintains ethical boundaries
              5. Includes specific success metrics`,
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${data.screenshots.overview}`,
              },
            },
          ],
        },
      ],
      model: "gpt-4-vision-preview",
      max_tokens: 1500,
    };

    const completion = await this.openai.chat.completions.create(prompt);
    return completion.choices[0].message.content;
  }

  async analyzeTarget(researchData) {
    this.currentStep = "analysis";
    // Implementation for target analysis
    return "";
  }

  async executePhishingStep() {
    this.currentStep = "phishing";
    // Implementation for phishing attack
  }

  async executeSocialMediaStep() {
    this.currentStep = "social_media";
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
        await this.db
          .collection("organizations")
          .doc(this.organizationId)
          .collection("tests")
          .doc(this.testId)
          .update({
            streamActive: false,
          });
      }
    } catch (error) {
      console.error("Cleanup error:", error);
    }
  }

  async fullRestart() {
    try {
      // Check if already executing
      if (this.isExecuting) {
        await this.logMessage(
          "System",
          "Attack already in progress, please wait...",
          "warning"
        );
        return;
      }

      this.isExecuting = true;

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
     // return await this.executeAttack();
      return await this.executeAPILevelAttack();
    } catch (error) {
      await this.logMessage(
        "System",
        `Full restart error: ${error.message}`,
        "error",
      );
      await this.updateQueueStatus("FAILED");
      throw error;
    }
  }

  async searchCompany(companyName) {
    try {
      if (!this.page._isEvaluating) {
        await this.page.goto("https://www.linkedin.com/search/results/companies/");
        await this.page.waitForSelector('input[aria-label="Search"]');
        await this.page.type('input[aria-label="Search"]', companyName);
        await this.page.keyboard.press("Enter");
        
        // Wait for any results to load
        await this.page.waitForSelector(".artdeco-card", { timeout: 10000 });
      }

      // Get any first company result
      const result = await this.page.evaluate(() => {
        // Try multiple possible selectors to find a company link
        const selectors = [
          ".artdeco-card .linked-area",
          ".search-results-container a",
          "[data-chameleon-result-urn]",
          ".entity-result__title-text a"
        ];

        for (const selector of selectors) {
          const element = document.querySelector(selector);
          if (element && element.href) {
            return element.href;
          }
        }
        return null;
      });

      // Log what we found
      console.log("Search result for", companyName, ":", result);

      // Always return the result, even if it's not an exact match
      this.page._isEvaluating = false;
      return result || "https://www.linkedin.com/company/microsoft"; // Fallback to a known company if nothing found

    } catch (error) {
      console.error("Error in searchCompany:", error);
      this.page._isEvaluating = false;
      // Return a fallback company profile instead of null
      return "https://www.linkedin.com/company/microsoft";
    }
  }



}

module.exports = Attack;
