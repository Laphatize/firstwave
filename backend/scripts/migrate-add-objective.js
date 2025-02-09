const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const Campaign = require('../models/Campaign');

async function addObjectiveField() {
  try {
    // Update all existing campaigns to have a default objective
    await Campaign.updateMany(
      { objective: { $exists: false } },
      { $set: { objective: 'Default objective - please update' } }
    );
    
    console.log('Successfully added objective field to existing campaigns');
    process.exit(0);
  } catch (error) {
    console.error('Error updating campaigns:', error);
    process.exit(1);
  }
}

addObjectiveField(); 