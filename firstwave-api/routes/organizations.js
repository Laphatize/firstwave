const express = require('express');
const router = express.Router();
const db = require('../config/firebase');

// Create Organization
router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;
    const orgRef = await db.collection('organizations').add({
      name,
      description,
      createdAt: new Date(),
    });
    res.status(201).json({ id: orgRef.id, message: 'Organization created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create organization' });
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