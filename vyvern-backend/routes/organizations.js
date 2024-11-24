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

module.exports = router;