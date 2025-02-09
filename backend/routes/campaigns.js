const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Campaign = require('../models/Campaign');
const puppeteer = require('puppeteer');
const OpenAI = require("openai");
const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');
let conversationHistory = [];

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
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

router.get('/history', auth, async (req, res) => {
  res.json({ messages: session.messages || [] });
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

// Get message history for a session
router.get('/:id/messages', auth, async (req, res) => {
  const sessionId = req.params.id;
  const session = activeSessions.get(sessionId);
  
  if (!session) {
    return res.status(404).json({ message: 'Session not found' });
  }

  res.json({ messages: session.messages || [] });
});

async function startCampaignAutomation(campaign) {
  try {
    // Connect to existing Chrome instance if possible, otherwise launch new browser
    if (!currentBrowser) {
      try {
        currentBrowser = await puppeteer.connect({
          browserURL: 'http://localhost:9222',
          defaultViewport: {
            width: 1480,
            height: 900,
            deviceScaleFactor: 1,
          }
        });
      } catch (err) {
        console.log('Could not connect to existing Chrome, launching new instance:', err);
        currentBrowser = await puppeteer.launch({
          headless: false,
          defaultViewport: null,
          args: ['--start-maximized', '--disable-notifications']
        });
      }
    }

    let currentPage = await currentBrowser.newPage();


    let name = campaign.testConfig.recipients[0].name || "N/A";
    let company = campaign.testConfig.recipients[0].company || "N/A";
    let position = campaign.testConfig.recipients[0].position || "Employee";
    let school = campaign.testConfig.recipients[0].school || "N/A";
    let objective = campaign.objective || "N/A";

    // Start screenshot interval
    const sessionId = campaign._id.toString();
    const screenshotPath = path.join(screenshotsDir, `${sessionId}.png`);
    
    activeSessions.set(sessionId, {
      browser: currentBrowser,
      page: currentPage,
      screenshotPath,
      status: 'running',
      messages: [], // Initialize empty messages array
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
      await currentPage.goto('https://www.linkedin.com/messaging/');
   //   await currentPage.waitForNavigation();

      // Add system message for session start
      const session = activeSessions.get(sessionId);
      session.messages.push({
        type: 'system',
        text: 'Session started - Navigating to LinkedIn Messages',
        timestamp: new Date().toISOString()
      });

      // Search for the person
      await currentPage.waitForSelector('#search-conversations');
      await currentPage.type('#search-conversations', name);

      session.messages.push({
        type: 'system',
        text: `Searching for conversation with ${name}`,
        timestamp: new Date().toISOString()
      });

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
      const initialMessage = `Hi, ${name.split(' ')[0]}. I'm a junior at Penn State looking for internship opportunities in the field of AI and ML.`;
      await currentPage.type('.msg-form__contenteditable', initialMessage);

      // Add the sent message to history
      session.messages.push({
        type: 'sent',
        text: initialMessage,
        timestamp: new Date().toISOString()
      });

      // Scroll and click send button
      const sendButton = await currentPage.waitForSelector('.msg-form__send-button');
      await sendButton.evaluate(el => el.scrollIntoView({ behavior: 'smooth', block: 'center' }));

      // Wait for a second before clicking send
      await new Promise(resolve => setTimeout(resolve, 1000));
      await currentPage.click('.msg-form__send-button');

      // Initialize conversation history for GPT
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

          // Add received message to session history
          session.messages.push({
            type: 'received',
            text: latestMessage.text,
            timestamp: new Date().toISOString()
          });

          // Generate response using GPT-4 API
          const response = await generateGPTResponse(conversationHistory, name, company, position, school, objective);

          // Type and send response
          await currentPage.waitForSelector('.msg-form__contenteditable');
          await currentPage.type('.msg-form__contenteditable', response);
          
          // Add sent message to session history
          session.messages.push({
            type: 'sent',
            text: response,
            timestamp: new Date().toISOString()
          });

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
      const session = activeSessions.get(sessionId);
      session.status = 'error';
      session.messages.push({
        type: 'system',
        text: `Error: ${error.message}`,
        timestamp: new Date().toISOString()
      });
    } finally {
      clearInterval(screenshotInterval);
      const session = activeSessions.get(sessionId);
      session.status = 'completed';
      session.messages.push({
        type: 'system',
        text: 'Session completed',
        timestamp: new Date().toISOString()
      });
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
        Authorization: 'sss'
      }
    });

    console.log(taskStatusResponse);

    return res.send(taskStatusResponse);
  } catch (error) {
    console.error('Error getting test status:', error);
    res.status(500).json({ message: 'Error getting test status' });
  }
});

// Generate AI analysis report for a session
router.get('/:id/analysis', auth, async (req, res) => {
  try {
    const sessionId = req.params.id;
    const session = activeSessions.get(sessionId);
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    const messages = session.messages || [];
    
    // Prepare conversation history for analysis
    const conversationText = messages
      .map(msg => `${msg.type.toUpperCase()}: ${msg.text}`)
      .join('\n');

    // Generate analysis using GPT-4
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a security analyst reviewing a phishing test conversation. Analyze the effectiveness of the attempt and what information was successfully collected. Focus on: 1) Information gathered about the company 2) Potential security vulnerabilities revealed 3) Social engineering tactics used 4) Recommendations for security improvements."
        },
        {
          role: "user",
          content: `Please analyze this conversation from a phishing test and provide a detailed report:\n\n${conversationText}`
        }
      ],
      model: "gpt-4",
    });

    const analysis = completion.choices[0].message.content;

    // Structure the response
    const report = {
      timestamp: new Date().toISOString(),
      sessionId,
      messageCount: messages.length,
      analysis,
      conversationSummary: conversationText
    };

    res.json(report);
  } catch (error) {
    console.error('Error generating analysis:', error);
    res.status(500).json({ message: 'Error generating analysis report' });
  }
});

// Handle follow-up questions about the analysis
router.post('/:id/analysis/followup', auth, async (req, res) => {
  try {
    const sessionId = req.params.id;
    const { question } = req.body;
    const session = activeSessions.get(sessionId);
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    const messages = session.messages || [];
    
    // Prepare conversation history for context
    const conversationText = messages
      .map(msg => `${msg.type.toUpperCase()}: ${msg.text}`)
      .join('\n');

    // Generate follow-up analysis using GPT-4
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a security analyst reviewing a phishing test conversation. You will answer follow-up questions about the conversation and its security implications. Be specific and reference actual parts of the conversation when relevant. Format your response in markdown for better readability."
        },
        {
          role: "user",
          content: `Here is the conversation to analyze:\n\n${conversationText}\n\nFollow-up question: ${question}`
        }
      ],
      model: "gpt-4",
    });

    const analysis = completion.choices[0].message.content;

    res.json({
      timestamp: new Date().toISOString(),
      question,
      answer: analysis
    });
  } catch (error) {
    console.error('Error generating follow-up analysis:', error);
    res.status(500).json({ message: 'Error generating follow-up analysis' });
  }
});

// Generate PDF report for analysis
router.get('/:id/analysis/pdf', auth, async (req, res) => {
  try {
    const sessionId = req.params.id;
    const session = activeSessions.get(sessionId);
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    const messages = session.messages || [];
    
    // Prepare conversation history for analysis
    const conversationText = messages
      .map(msg => `${msg.type.toUpperCase()}: ${msg.text}`)
      .join('\n');

    // Generate analysis using GPT-4
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a security analyst reviewing a phishing test conversation. Analyze the effectiveness of the attempt and what information was successfully collected. Focus on: 1) Information gathered about the company 2) Potential security vulnerabilities revealed 3) Social engineering tactics used 4) Recommendations for security improvements."
        },
        {
          role: "user",
          content: `Please analyze this conversation from a phishing test and provide a detailed report:\n\n${conversationText}`
        }
      ],
      model: "gpt-4",
    });

    const analysis = completion.choices[0].message.content;

    // Create PDF document
    const doc = new PDFDocument();
    
    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=phishing-analysis-${sessionId}.pdf`);
    
    // Pipe the PDF document to the response
    doc.pipe(res);

    // Add content to PDF
    doc
      .fontSize(20)
      .text('Phishing Test Analysis Report', { align: 'center' })
      .moveDown(2);

    doc
      .fontSize(12)
      .text(`Generated: ${new Date().toLocaleString()}`)
      .text(`Session ID: ${sessionId}`)
      .text(`Messages Analyzed: ${messages.length}`)
      .moveDown(2);

    doc
      .fontSize(16)
      .text('Analysis', { underline: true })
      .moveDown(1);

    doc
      .fontSize(12)
      .text(analysis)
      .moveDown(2);

    doc
      .fontSize(16)
      .text('Conversation History', { underline: true })
      .moveDown(1);

    doc
      .fontSize(12)
      .text(conversationText);

    // Finalize PDF
    doc.end();

  } catch (error) {
    console.error('Error generating PDF analysis:', error);
    res.status(500).json({ message: 'Error generating PDF analysis report' });
  }
});

module.exports = router; 