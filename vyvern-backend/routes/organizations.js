const express = require('express');
const router = express.Router();
const db = require('../config/firebase');
const { getOrganizationById, createOrganization, getTestsByOrgId } = require('../utils/organizations');
const { doc, collection, addDoc } = require('firebase-admin/firestore');

// Create Organization

// Create a test under an organization
router.post('/:orgId/tests', async (req, res) => {
  try {
    const { orgId } = req.params;
    const { type, scope, context, permissions } = req.body;

    // Check if the organization exists
    let organization = await getOrganizationById(orgId);
    if (!organization) {
      // Create the organization if it doesn't exist
      const orgData = { name: 'Default Name', description: 'Default Description', id: orgId }; // You might want to customize this
      const newOrgId = await createOrganization(orgData);
      organization = { id: newOrgId, ...orgData };
    }

    const testRef = await db.collection('organizations').doc(organization.id).collection('tests').add({
      type,
      active: true,
      state: "Starting Soon",
      context,
      scope,
      permissions,
      createdAt: new Date(),
    });

    const Attack = require('../utils/attack');
    const attack = new Attack(
      testRef.id,
      organization.id,
      type,
      scope,
      permissions,
      context
    );

    // Execute attack without catch block (let Attack class handle it)
    attack.executeAttack();

    res.status(201).json({ id: testRef.id, message: 'Test created successfully and attack initiated' });
  } catch (error) {
    console.error('Error creating test:', error);
    res.status(500).json({ error: 'Failed to create test' });
  }
});

// Fetch tests under an org
router.get('/:orgId/tests', async (req, res) => {
  const { orgId } = req.params;
  const tests = await getTestsByOrgId(orgId);
  res.status(200).json(tests);
});

// Add this route to get a single test
router.get('/:orgId/tests/:testId', async (req, res) => {
  try {
    const { orgId, testId } = req.params;
    const testDoc = await db.collection('organizations')
      .doc(orgId)
      .collection('tests')
      .doc(testId)
      .get();
    
    if (!testDoc.exists) {
      return res.status(404).json({ error: 'Test not found' });
    }
    
    res.status(200).json({ id: testDoc.id, ...testDoc.data() });
  } catch (error) {
    console.error('Error fetching test:', error);
    res.status(500).json({ error: 'Failed to fetch test details' });
  }
});

// Get All Organizations
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('organizations').get();
    const organizations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(organizations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch organizations' });
  }
});

// Add this route to restart a failed test
router.post('/:orgId/tests/:testId/restart', async (req, res) => {
  try {
    const { orgId, testId } = req.params;
    
    // Get test reference
    const testRef = db.collection('organizations')
      .doc(orgId)
      .collection('tests')
      .doc(testId);

    // Get test data
    const testDoc = await testRef.get();
    if (!testDoc.exists) {
      return res.status(404).json({ error: 'Test not found' });
    }

    const testData = testDoc.data();
    if (testData.state !== 'FAILED') {
      return res.status(400).json({ error: 'Only failed tests can be restarted' });
    }

    // Update test state
    await testRef.update({
      state: 'Starting Soon',
      updatedAt: new Date()
    });

    // Create new attack instance
    const Attack = require('../utils/attack');
    const attack = new Attack(
      testId,
      orgId,
      testData.type,
      testData.scope,
      testData.permissions,
      testData.context
    );

    // Execute attack without catch block (let Attack class handle it)
    attack.executeAttack();

    res.status(200).json({ message: 'Test restart initiated' });
  } catch (error) {
    console.error('Error restarting test:', error);
    res.status(500).json({ error: 'Failed to restart test' });
  }
});

router.post('/:orgId/tests/:testId/full-restart', async (req, res) => {
  try {
    const { orgId, testId } = req.params;
    
    const testRef = db.collection('organizations')
      .doc(orgId)
      .collection('tests')
      .doc(testId);

    const testDoc = await testRef.get();
    if (!testDoc.exists) {
      return res.status(404).json({ error: 'Test not found' });
    }

    const testData = testDoc.data();

    // Clear recovery point and update state
    await testRef.update({
      state: 'Starting Soon',
      updatedAt: new Date(),
      recoveryPoint: null, // Clear recovery point for full restart
      currentStep: null    // Reset current step
    });

    const Attack = require('../utils/attack');
    const attack = new Attack(
      testId,
      orgId,
      testData.type,
      testData.scope,
      testData.permissions,
      testData.context
    );

    attack.fullRestart();

    res.status(200).json({ message: 'Full test restart initiated' });
  } catch (error) {
    console.error('Error restarting test:', error);
    res.status(500).json({ error: 'Failed to restart test' });
  }
});

// Add this route near the top of the file, after the imports
router.post('/setup', async (req, res) => {
  try {
    const {
      industry,
      size,
      location,
      securityConcerns,
      communicationChannels,
      previousIncidents,
      regulatoryRequirements,
      userId,
      organizationId
    } = req.body;

    // Validate required fields
    if (!industry || !size || !location || !organizationId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get organization reference - using the db instance directly
    const orgRef = db.collection('organizations').doc(organizationId);

    // Update organization with setup data
    await orgRef.set({
      industry,
      size: parseInt(size),
      location,
      securityConcerns: securityConcerns || [],
      communicationChannels: communicationChannels || [],
      previousIncidents: previousIncidents || false,
      regulatoryRequirements: regulatoryRequirements || [],
      setupCompleted: true,
      setupDate: new Date(),
      updatedAt: new Date(),
      userId
    }, { merge: true });

    res.status(200).json({ message: 'Organization setup completed successfully' });
  } catch (error) {
    console.error('Error in organization setup:', error);
    res.status(500).json({ error: 'Failed to complete organization setup' });
  }
});

// Add this route near the top with other organization routes
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const orgDoc = await db.collection('organizations').doc(id).get();

        if (!orgDoc.exists) {
            return res.status(404).json({ error: 'Organization not found' });
        }

        res.status(200).json({ id: orgDoc.id, ...orgDoc.data() });
    } catch (error) {
        console.error('Error fetching organization:', error);
        res.status(500).json({ error: 'Failed to fetch organization' });
    }
});

module.exports = router;