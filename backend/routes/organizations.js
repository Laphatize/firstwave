const express = require('express');
const router = express.Router();
const Organization = require('../models/Organization');
const auth = require('../middleware/auth');

// Get all organizations for the current user
router.get('/', auth, async (req, res) => {
  try {
    const organizations = await Organization.find({
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id }
      ]
    }).populate('owner', 'email')
      .populate('members.user', 'email');

    res.json(organizations);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new organization
router.post('/', auth, async (req, res) => {
  try {
    const { name, description } = req.body;

    const organization = new Organization({
      name,
      description,
      owner: req.user._id,
      members: [{ user: req.user._id, role: 'admin' }]
    });

    await organization.save();
    
    // Populate the owner and members before sending response
    await organization.populate('owner', 'email');
    await organization.populate('members.user', 'email');

    res.status(201).json(organization);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Generate an invite code for an organization
router.post('/:id/invite', auth, async (req, res) => {
  try {
    const { expiresInHours = 24, maxUses = 1 } = req.body;

    const organization = await Organization.findOne({
      _id: req.params.id,
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id, 'members.role': 'admin' }
      ]
    });

    if (!organization) {
      return res.status(404).json({ message: 'Organization not found or unauthorized' });
    }

    // Clean up expired codes before generating new one
    organization.cleanupInviteCodes();

    const inviteCode = organization.generateInviteCode(
      req.user._id,
      expiresInHours,
      maxUses
    );

    await organization.save();

    res.json({ code: inviteCode });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Join an organization using an invite code
router.post('/join', auth, async (req, res) => {
  try {
    const { inviteCode } = req.body;

    // Find organization with matching invite code
    const organization = await Organization.findOne({
      'inviteCodes.code': inviteCode
    });

    if (!organization) {
      return res.status(404).json({ message: 'Invalid invite code' });
    }

    // Check if user is already a member
    if (
      organization.owner.equals(req.user._id) ||
      organization.members.some(member => member.user.equals(req.user._id))
    ) {
      return res.status(400).json({ message: 'You are already a member of this organization' });
    }

    // Validate and use the invite code
    if (!organization.useInviteCode(inviteCode)) {
      return res.status(400).json({ message: 'Invalid or expired invite code' });
    }

    // Add user as member
    organization.members.push({
      user: req.user._id,
      role: 'member'
    });

    await organization.save();
    
    await organization.populate('owner', 'email');
    await organization.populate('members.user', 'email');

    res.json(organization);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get a specific organization
router.get('/:id', auth, async (req, res) => {
  try {
    const organization = await Organization.findOne({
      _id: req.params.id,
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id }
      ]
    }).populate('owner', 'email')
      .populate('members.user', 'email');

    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    res.json(organization);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update an organization
router.patch('/:id', auth, async (req, res) => {
  try {
    const organization = await Organization.findOne({
      _id: req.params.id,
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id, 'members.role': 'admin' }
      ]
    });

    if (!organization) {
      return res.status(404).json({ message: 'Organization not found or unauthorized' });
    }

    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'description'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).json({ message: 'Invalid updates' });
    }

    updates.forEach(update => organization[update] = req.body[update]);
    await organization.save();
    
    await organization.populate('owner', 'email');
    await organization.populate('members.user', 'email');

    res.json(organization);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete an organization
router.delete('/:id', auth, async (req, res) => {
  try {
    const organization = await Organization.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!organization) {
      return res.status(404).json({ message: 'Organization not found or unauthorized' });
    }

    res.json(organization);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a member to an organization
router.post('/:id/members', auth, async (req, res) => {
  try {
    const { userId, role = 'member' } = req.body;

    const organization = await Organization.findOne({
      _id: req.params.id,
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id, 'members.role': 'admin' }
      ]
    });

    if (!organization) {
      return res.status(404).json({ message: 'Organization not found or unauthorized' });
    }

    // Check if user is already a member
    if (organization.members.some(member => member.user.toString() === userId)) {
      return res.status(400).json({ message: 'User is already a member' });
    }

    organization.members.push({ user: userId, role });
    await organization.save();
    
    await organization.populate('owner', 'email');
    await organization.populate('members.user', 'email');

    res.json(organization);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Remove a member from an organization
router.delete('/:id/members/:userId', auth, async (req, res) => {
  try {
    const organization = await Organization.findOne({
      _id: req.params.id,
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id, 'members.role': 'admin' }
      ]
    });

    if (!organization) {
      return res.status(404).json({ message: 'Organization not found or unauthorized' });
    }

    // Cannot remove the owner
    if (organization.owner.toString() === req.params.userId) {
      return res.status(400).json({ message: 'Cannot remove the organization owner' });
    }

    organization.members = organization.members.filter(
      member => member.user.toString() !== req.params.userId
    );

    await organization.save();
    
    await organization.populate('owner', 'email');
    await organization.populate('members.user', 'email');

    res.json(organization);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 