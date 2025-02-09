const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Campaign = require('../models/Campaign');
const puppeteer = require('puppeteer');
const OpenAI = require("openai");
const path = require('path');
const fs = require('fs');

const openai = new OpenAI({
  apiKey: "sk-R_jpm9H9LFCHTZEVX1mBBCOfns16EBe17V2SrXlOtUT3BlbkFJMLYzrYwYzRxC3nnIJJAodZjLNOT93vzKy1WS52IlkA",
});

// Create screenshots directory if it doesn't exist
const screenshotsDir = path.join(__dirname, '../screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir);
}

let currentBrowser = null;
let currentPage = null;

// Store active sessions
const activeSessions = new Map();

// Validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Create a new campaign
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, objective, testConfig } = req.body;

    if (!name || !description || !testConfig) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Validate recipients if they exist
    if (testConfig.recipients && testConfig.recipients.length > 0) {
      for (const recipient of testConfig.recipients) {
        if (!recipient.name || !recipient.email) {
          return res.status(400).json({
            message: 'Each recipient must have both name and email'
          });
        }
        if (!isValidEmail(recipient.email)) {
          return res.status(400).json({
            message: `Invalid email format for recipient: ${recipient.name}`
          });
        }
      }
    }

    const campaign = new Campaign({
      name,
      description,
      objective,
      testConfig,
      user: req.user.id
    });

    const savedCampaign = await campaign.save();
    res.status(201).json(savedCampaign);
  } catch (error) {
    console.error('Error creating campaign:', error);
    res.status(500).json({ message: 'Error creating campaign' });
  }
});

// Get all campaigns for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const campaigns = await Campaign.find({ user: req.user.id })
      .sort({ createdAt: -1 });
    res.json(campaigns);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({ message: 'Error fetching campaigns' });
  }
});

// Get a specific campaign
router.get('/:id', auth, async (req, res) => {
  try {
    const campaign = await Campaign.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    res.json(campaign);
  } catch (error) {
    console.error('Error fetching campaign:', error);
    res.status(500).json({ message: 'Error fetching campaign' });
  }
});

// Update a campaign
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, description, objective, testConfig } = req.body;

    // Validate recipients if they exist
    if (testConfig && testConfig.recipients && testConfig.recipients.length > 0) {
      for (const recipient of testConfig.recipients) {
        if (!recipient.name || !recipient.email) {
          return res.status(400).json({
            message: 'Each recipient must have both name and email'
          });
        }
        if (!isValidEmail(recipient.email)) {
          return res.status(400).json({
            message: `Invalid email format for recipient: ${recipient.name}`
          });
        }
      }
    }

    const campaign = await Campaign.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { name, description, objective, testConfig },
      { new: true }
    );

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    res.json(campaign);
  } catch (error) {
    console.error('Error updating campaign:', error);
    res.status(500).json({ message: 'Error updating campaign' });
  }
});

// Delete a campaign
router.delete('/:id', auth, async (req, res) => {
  try {
    const campaign = await Campaign.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    res.json({ message: 'Campaign deleted successfully' });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    res.status(500).json({ message: 'Error deleting campaign' });
  }
});

async function startCampaignAutomation(campaign) {
  try {
    // Message System
    currentBrowser = await puppeteer.launch({
      headless: false,
      startMaximized: true,
      defaultViewport: {
        width: 1480,
        height: 800
      },
      args: [
        "--window-size=1480,720",
        "--no-sandbox",
        "--disable-setuid-sandbox",
      ],
    });

    let currentPage = await currentBrowser.newPage();


    //await currentPage.setViewport({ width: 1480, height: 720 });


    let name = campaign.testConfig.recipients[0].name;
    let company = campaign.testConfig.recipients[0].company;
    let position = campaign.testConfig.recipients[0].position || "Employee";
    let school = campaign.testConfig.recipients[0].school || "N/A";
    let objective = campaign.objective || "N/A";

    //currentPage = await currentBrowser.newPage();

    // Start screenshot interval
    const sessionId = campaign._id.toString();
    const screenshotPath = path.join(screenshotsDir, `${sessionId}.png`);
    
    activeSessions.set(sessionId, {
      browser: currentBrowser,
      page: currentPage,
      screenshotPath,
      status: 'running'
    });

    // Start screenshot interval
    const screenshotInterval = setInterval(async () => {
      try {
        if (currentPage) {
          await currentPage.screenshot({ path: screenshotPath });
        }
      } catch (error) {
        console.error('Screenshot error:', error);
      }
    }, 1000);

    try {
      await currentPage.goto('https://www.linkedin.com/');

      // Wait for and click the "Sign in" button
      await currentPage.waitForSelector('.nav__button-secondary');
      await currentPage.click('.nav__button-secondary');

      // Wait for the login form and enter credentials
      await currentPage.waitForSelector('#username');
      await currentPage.type('#username', 'pranavramesh2022@gmail.com');
      await currentPage.type('#password', 'PR@4563A');
      await currentPage.click('.btn__primary--large');

      // Wait for navigation after login
      await currentPage.waitForNavigation();

      // Navigate to messages
      await currentPage.goto('https://www.linkedin.com/messaging/');
      await currentPage.waitForNavigation();
      // Search for the person
      await currentPage.waitForSelector('#search-conversations');
      await currentPage.type('#search-conversations', name);

      // Wait for and click on the first conversation in the list
      await currentPage.waitForSelector('.msg-conversation-listitem__link');
      await currentPage.click('.msg-conversation-listitem__link');

      // Before clicking any button, scroll it into view
      const conversationItem = await currentPage.waitForSelector('.msg-conversation-listitem__link');
      await conversationItem.evaluate(el => el.scrollIntoView({ behavior: 'smooth', block: 'center' }));
      await currentPage.click('.msg-conversation-listitem__link');

      // Scroll and click message input
      const messageInput = await currentPage.waitForSelector('.msg-form__contenteditable');
      await messageInput.evaluate(el => el.scrollIntoView({ behavior: 'smooth', block: 'center' }));
      await currentPage.type('.msg-form__contenteditable', "Hi, Kshitij. I'm a junior at Penn State looking for internship opportunities in the field of AI and ML.");

      // Scroll and click send button
      const sendButton = await currentPage.waitForSelector('.msg-form__send-button');
      await sendButton.evaluate(el => el.scrollIntoView({ behavior: 'smooth', block: 'center' }));
      await currentPage.click('.msg-form__send-button');

      // Initialize conversation history
      let conversationHistory = [];

      while (true) {
        console.log('Waiting for new messages...');

        // Wait for and get any new messages
        await currentPage.waitForSelector('.msg-s-event-listitem__message-bubble');
        const messages = await currentPage.$$eval('.msg-s-event-listitem__message-bubble', elements =>
          elements.map(el => ({
            text: el.innerText,
            isOther: el.closest('.msg-s-event-listitem--other') !== null
          }))
        );

        // Get the latest message
        const latestMessage = messages[messages.length - 1];

        // Only respond if it's a new message from the other person
        if (latestMessage.isOther && !conversationHistory.includes(latestMessage.text)) {
          console.log('New message received:', latestMessage.text);
          conversationHistory.push(latestMessage.text);

          // Generate response using GPT-4 API
          const response = await generateGPTResponse(conversationHistory, name, company, position, school, objective);

          // Type and send response
          await currentPage.waitForSelector('.msg-form__contenteditable');
          await currentPage.type('.msg-form__contenteditable', response);
          // wait like 2 sec
          await new Promise(resolve => setTimeout(resolve, 2000));
          // Click the send button
          await currentPage.waitForSelector('.msg-form__send-button');
          await currentPage.click('.msg-form__send-button');

          conversationHistory.push(response);
          console.log('Response sent:', response);
        }

        // Add a small delay to prevent excessive polling
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

    } catch (error) {
      console.error('An error occurred:', error);
      activeSessions.get(sessionId).status = 'error';
    } finally {
      clearInterval(screenshotInterval);
      activeSessions.get(sessionId).status = 'completed';
      // Don't close the browser here, let it be handled by the cleanup endpoint
    }

    return { sessionId, status: 'running' };
  } catch (error) {
    console.error('Error starting campaign test:', error);
    throw error;
  }
}

// Get latest screenshot
router.get('/:id/screenshot', auth, async (req, res) => {
  const sessionId = req.params.id;
  const session = activeSessions.get(sessionId);
  
  if (!session) {
    return res.status(404).json({ message: 'Session not found' });
  }

  const screenshotPath = path.join(screenshotsDir, `${sessionId}.png`);
  
  if (fs.existsSync(screenshotPath)) {
    res.sendFile(screenshotPath);
  } else {
    res.status(404).json({ message: 'Screenshot not found' });
  }
});

// Get session status
router.get('/:id/status', auth, async (req, res) => {
  const sessionId = req.params.id;
  const session = activeSessions.get(sessionId);
  
  if (!session) {
    return res.status(404).json({ message: 'Session not found' });
  }

  res.json({ status: session.status });
});

// Cleanup endpoint
router.post('/:id/cleanup', auth, async (req, res) => {
  const sessionId = req.params.id;
  const session = activeSessions.get(sessionId);
  
  if (session) {
    if (session.browser) {
      await session.browser.close();
    }
    activeSessions.delete(sessionId);
    
    // Delete screenshot file
    const screenshotPath = path.join(screenshotsDir, `${sessionId}.png`);
    if (fs.existsSync(screenshotPath)) {
      fs.unlinkSync(screenshotPath);
    }
  }
  
  res.json({ message: 'Session cleaned up' });
});

// Start a campaign test
router.post('/:id/test', auth, async (req, res) => {
  try {
    const campaign = await Campaign.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    console.log('Starting campaign automation for campaign:', campaign._id);
    const response = await startCampaignAutomation(campaign);
    console.log('Campaign automation started with response:', response);
    res.json({ sessionId: campaign._id.toString(), status: 'running' });
  } catch (error) {
    console.error('Error starting campaign test:', error);
    res.status(500).json({ message: 'Error starting campaign test' });
  }
});

async function generateGPTResponse(conversationHistory, name, company, position, school, objective) {
  try {
    // Format conversation history into messages array
    const messages = conversationHistory.map((msg, index) => ({
      role: index % 2 === 0 ? "user" : "assistant",
      content: msg
    }));

    // Add the latest message with a student persona
    messages.push({
      role: "user",
      content: conversationHistory[conversationHistory.length - 1]
    });

    // Use the parameters directly instead of redeclaring them
    const personInfo = {
      person: name || "N/A",
      company: company || "N/A",
      role: position || "Employee",
      school: school || "N/A",
      objective: objective || "N/A"
    };

    // Add a prompt to guide the AI
    messages.push({
      role: "user",
      content: `Message Context: You're goal as an AI model is to pretend to be Pranav Ramesh, a student at Penn State University, to get as much information from someone called ${personInfo.person} as possible about the company (${personInfo.company}) he works for (ACTIVELY as an ${personInfo.role}). As far as he is concerned he should not know that he conversing with an AI model but rather an enthusiastic student interested in the company. You're goal is to get as much information about the company as possible, ideally tailored to the ${personInfo.objective}. Your goal is to get as much information about the company as possible. Try to keep messages some what short and sweet - and make sure to adapt your tone based of the conversation.`
    });

    const completion = await openai.chat.completions.create({
      messages: messages,
      model: "gpt-4",
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error("Error generating GPT response:", error);
    return "I apologize, but I'm having trouble generating a response right now.";
  }
}

// Get campaign test status
router.get('/:id/test', auth, async (req, res) => {
  try {

    console.log(req.params.id);
    const taskStatusResponse = await fetch(`https://api.browser-use.com/api/v1/task/${req.params.id}`, {
      method: 'GET',
      headers: {
        Authorization: 'Bearer bu_owEUw88eCfvGQyzvfDyga2AxolZpP1IdiSl9DYObumk'
      }
    });

    console.log(taskStatusResponse);

    return res.send(taskStatusResponse);
  } catch (error) {
    console.error('Error getting test status:', error);
    res.status(500).json({ message: 'Error getting test status' });
  }
});

module.exports = router; 