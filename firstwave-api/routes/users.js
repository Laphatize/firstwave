const express = require('express');
const router = express.Router();
const db = require('../config/firebase');

// Get User Profile
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userDoc = await db.collection('users').doc(id).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ id: userDoc.id, ...userDoc.data() });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update User Profile
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;
    await db.collection('users').doc(id).update({
      name,
      email,
      updatedAt: new Date(),
    });
    res.status(200).json({ message: 'User updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

module.exports = router;
