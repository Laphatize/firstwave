require('dotenv').config();
const express = require('express');
const app = express();
const organizationsRoute = require('./routes/organizations');
const usersRoute = require('./routes/users');
const cors = require('cors');
const queueProcessor = require('./services/queueProcessor');
const db = require('./config/firebase');
const Attack = require('./utils/attack');
const WebSocket = require('ws');
global.wss = new WebSocket.Server({ 
  port: 3002,
  perMessageDeflate: false // Disable compression for better performance
});

// Middleware setup
app.use(cors());
app.use(express.json());

async function recoverInProgressAttacks() {
  try {
    // Get all IN_PROGRESS attacks from the queue
    const queueSnapshot = await db.collection('attackQueue')
      .where('status', '==', 'IN_PROGRESS')
      .get();

    console.log(`Found ${queueSnapshot.size} attacks to recover`);

    // Recover each attack
    for (const doc of queueSnapshot.docs) {
      const attackData = doc.data();
      const attack = new Attack(
        attackData.testId,
        attackData.organizationId,
        attackData.type,
        attackData.scope,
        attackData.permissions,
        attackData.context,
        attackData.name,
        null, // targets
        // attackData.companyContext || {
        //   name: attackData.scope,
        //   industry: null,
        //   size: null,
        //   location: null
        // }
      );
      
      // Recovery will happen automatically through constructor
      console.log(`Recovering attack ${attackData.testId}`);
    }
  } catch (error) {
    console.error('Error recovering attacks:', error);
  }
}

// Start server and initialize recovery
const PORT = process.env.PORT || 3001;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  
  // Recover any in-progress attacks
  await recoverInProgressAttacks();
  
  // Start queue processor
  await queueProcessor.start();
});

// Add shutdown handler
process.on('SIGTERM', async () => {
  await queueProcessor.stop();
  // ... other cleanup ...
  process.exit(0);
});

// Routes
app.use('/api/organizations', organizationsRoute);
app.use('/api/users', usersRoute);

global.wss.on('connection', (ws, req) => {
  const testId = req.url.split('/').pop();
  console.log(`New WebSocket connection for test ${testId}`);
  ws.testId = testId;
  
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
  
  ws.on('close', () => {
    console.log(`Client disconnected from test ${testId}`);
  });
});

