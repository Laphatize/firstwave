const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { Steel } = require('steel-sdk');
const { auth } = require('../middleware/auth');
const Campaign = require('../models/Campaign');

// Initialize Steel client
const steel = new Steel(process.env.STEEL_API_KEY);

// Store active sessions
const activeSessions = new Map();

// Start a new campaign test
router.post('/:id/test', auth, async (req, res) => {
  try {
    const campaignId = req.params.id;
    
    if (!campaignId) {
      return res.status(400).json({ message: 'Campaign ID is required' });
    }

    const campaign = await Campaign.findOne({
      _id: campaignId,
      user: req.user._id
    });
    
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    // Create a new Steel session
    const session = await steel.sessions.create({
      proxy: true,
      captchaSolver: true,
    });

    const sessionId = uuidv4();
    
    // Store session information
    activeSessions.set(sessionId, {
      steelSessionId: session.id,
      status: 'initializing',
      campaign,
      startedAt: new Date(),
    });

    // Start campaign automation in the background
    startCampaignAutomation(sessionId, session, campaign);

    res.json({
      sessionId,
      status: 'initializing',
      viewerUrl: session.viewerUrl,
    });
  } catch (error) {
    console.error('Error starting campaign test:', error);
    res.status(500).json({ message: 'Failed to start campaign test' });
  }
});

// Get campaign test status
router.get('/:id/test/:sessionId', auth, async (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    const session = activeSessions.get(sessionId);

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    res.json({
      status: session.status,
      progress: session.progress,
      error: session.error,
    });
  } catch (error) {
    console.error('Error fetching campaign test status:', error);
    res.status(500).json({ message: 'Failed to fetch test status' });
  }
});

async function startCampaignAutomation(sessionId, steelSession, campaign) {
  try {
    const session = activeSessions.get(sessionId);
    session.status = 'running';

    // Connect to the Steel session
    const browser = await steelSession.connect();
    const page = await browser.newPage();

    // Navigate to LinkedIn
    await page.goto('https://www.linkedin.com');
    
    // Login using Steel's built-in LinkedIn authentication
    await steel.linkedin.login(page, {
      email: process.env.LINKEDIN_EMAIL,
      password: process.env.LINKEDIN_PASSWORD,
    });

    // Update session status
    session.status = 'logged_in';
    session.progress = 'Successfully logged into LinkedIn';

    // Process each recipient
    for (const recipient of campaign.recipients) {
      try {
        // Search for the recipient
        await page.goto(`https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(recipient.name)}`);
        await page.waitForSelector('.search-results');

        // Find the most likely match based on name and company
        const results = await page.$$('.search-result');
        for (const result of results) {
          const name = await result.$eval('.name', el => el.textContent);
          const company = await result.$eval('.company', el => el.textContent);
          
          if (name.includes(recipient.name)) {
            // Send connection request
            await result.$eval('.connect-button', button => button.click());
            await page.waitForSelector('.send-invite-modal');
            
            // Add a note to the connection request
            await page.type('.custom-message', campaign.connectionMessage);
            await page.click('.send-invite-button');
            
            // Update progress
            session.progress = `Sent connection request to ${recipient.name}`;
            break;
          }
        }
      } catch (error) {
        console.error(`Error processing recipient ${recipient.name}:`, error);
        session.progress = `Failed to process ${recipient.name}: ${error.message}`;
      }
    }

    // Mark session as completed
    session.status = 'completed';
    session.progress = 'Campaign automation completed';

    // Close the browser
    await browser.close();
  } catch (error) {
    console.error('Error in campaign automation:', error);
    const session = activeSessions.get(sessionId);
    session.status = 'error';
    session.error = error.message;
  }
}

module.exports = router; 