const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Campaign = require('../models/Campaign');
const Steel = require('steel-sdk');
const { chromium } = require('playwright');
const { v4: uuidv4 } = require('uuid');

const steelClient = new Steel({
  steelAPIKey: process.env.STEEL_KEY
});

// Validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Create a new campaign
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, testConfig } = req.body;
    
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
      testConfig,
      user: req.user.id
    });

    await campaign.save();
    res.status(201).json(campaign);
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
    const { name, description, testConfig } = req.body;
    
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
      { name, description, testConfig },
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

// Run a campaign test
router.post('/:id/test', auth, async (req, res) => {
  try {
    const campaign = await Campaign.findOne({
      _id: req.params.id,
      user: req.user.id
    });
    
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    // Create a Steel session with proxy and captcha solving
    const session = await steelClient.sessions.create({
      useProxy: true,
      solveCaptcha: true,
      metadata: {
        campaignId: campaign._id.toString(),
        userId: req.user.id.toString()
      }
    });

    // Send initial response with session details
    res.json({
      sessionId: session.id,
      viewerUrl: session.sessionViewerUrl,
      status: 'initializing'
    });

    // Start the automation process in the background
    startCampaignAutomation(campaign, session.id);

  } catch (error) {
    console.error('Error starting campaign test:', error);
    res.status(500).json({ message: 'Error starting campaign test' });
  }
});

async function startCampaignAutomation(campaign, sessionId) {
  try {
    // Connect to Steel session with Playwright
    const browser = await chromium.connectOverCDP(
      `wss://connect.steel.dev?apiKey=${process.env.STEEL_KEY}&sessionId=${sessionId}`
    );

    // Get the existing context and page
    const context = browser.contexts()[0];
    const page = context.pages()[0];

    // Navigate to LinkedIn
    await page.goto('https://www.linkedin.com');

    // TODO: Implement the actual LinkedIn automation steps
    // This will include:
    // 1. Logging in to LinkedIn
    // 2. Searching for target company
    // 3. Finding employees
    // 4. Sending connection requests
    // 5. Sending messages
    // etc.

    // Clean up
    await browser.close();
    await steelClient.sessions.release(sessionId);

  } catch (error) {
    console.error('Error in campaign automation:', error);
    await steelClient.sessions.release(sessionId);
  }
}

// Get campaign test status
router.get('/:id/test/:sessionId', auth, async (req, res) => {
  try {
    const session = await steelClient.sessions.retrieve(req.params.sessionId);
    res.json(session);
  } catch (error) {
    console.error('Error getting test status:', error);
    res.status(500).json({ message: 'Error getting test status' });
  }
});

module.exports = router; 