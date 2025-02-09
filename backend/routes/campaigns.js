const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Campaign = require('../models/Campaign');

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
    // First API call to start the task
    const startTaskResponse = await fetch('https://api.browser-use.com/api/v1/run-task', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer bu_owEUw88eCfvGQyzvfDyga2AxolZpP1IdiSl9DYObumk',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        task: `You are an AI social engineer with the following objective provided by the client: ${campaign.objective}. Now based of this objective, you must social engineer the following user: ${campaign.testConfig.recipients[0].name}. You are to use LinkedIn messaging to social engineer this user. You must first login to LinkedIn via the username pranavramesh2022@gmail.com and the password PR@4563A. Then search for the user in the search bar and send them a message. Sometimes, you may need to send a connection request. In which case, make sure you send a convincing connection note.`
      })
    });

    const startTaskData = await startTaskResponse.json();
    console.log(startTaskData);
    
    if (!startTaskData.id) {
      throw new Error('No task_id received from API');
    }

    // Second API call to get task status
    const taskStatusResponse = await fetch(`https://api.browser-use.com/api/v1/task/${startTaskData.id}`, {
      method: 'GET',
      headers: {
        Authorization: 'Bearer bu_owEUw88eCfvGQyzvfDyga2AxolZpP1IdiSl9DYObumk'
      }
    });

    const taskStatusData = await taskStatusResponse.json();
    return taskStatusData;

  } catch (error) {
    console.error('Error in startCampaignAutomation:', error);
    throw error;  // Re-throw to be handled by the route handler
  }
}

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

    const response = await startCampaignAutomation(campaign);
    res.json(response);
  } catch (error) {
    console.error('Error starting campaign test:', error);
    res.status(500).json({ message: 'Error starting campaign test' });
  }
});

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