const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Item = require('../models/Item');
const Rental = require('../models/Rental');

// Get user profile
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    const items = await Item.find({ owner: req.params.id, isSold: false });
    res.json({ user, items });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
