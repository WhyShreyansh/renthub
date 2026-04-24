const express = require('express');
const router = express.Router();
const Rental = require('../models/Rental');
const Item = require('../models/Item');
const { auth } = require('../middleware/auth');

// Create rental/purchase request
router.post('/', auth, async (req, res) => {
  try {
    const { itemId, type, startDate, endDate, message } = req.body;
    const item = await Item.findById(itemId).populate('owner');
    if (!item) return res.status(404).json({ message: 'Item not found' });
    if (item.owner._id.toString() === req.user._id.toString()) return res.status(400).json({ message: 'Cannot rent/buy your own item' });
    if (!item.isAvailable) return res.status(400).json({ message: 'Item not available' });

    let totalAmount = 0, totalDays = 0;
    if (type === 'rent') {
      if (!startDate || !endDate) return res.status(400).json({ message: 'Dates required for rental' });
      const start = new Date(startDate);
      const end = new Date(endDate);
      totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      if (totalDays < 1) return res.status(400).json({ message: 'Invalid date range' });

      if (totalDays >= 30 && item.pricePerMonth) totalAmount = Math.ceil(totalDays / 30) * item.pricePerMonth;
      else if (totalDays >= 7 && item.pricePerWeek) totalAmount = Math.ceil(totalDays / 7) * item.pricePerWeek;
      else totalAmount = totalDays * item.pricePerDay;
    } else {
      totalAmount = item.salePrice;
    }

    const rental = new Rental({
      item: itemId, renter: req.user._id, owner: item.owner._id,
      type, startDate, endDate, totalDays, totalAmount, message
    });
    await rental.save();
    await rental.populate(['item', 'renter', 'owner']);
    res.status(201).json(rental);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get my rentals (as renter)
router.get('/my-rentals', auth, async (req, res) => {
  try {
    const rentals = await Rental.find({ renter: req.user._id })
      .populate('item').populate('owner', 'name avatar phone').sort({ createdAt: -1 });
    res.json(rentals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get requests for my items (as owner)
router.get('/my-requests', auth, async (req, res) => {
  try {
    const rentals = await Rental.find({ owner: req.user._id })
      .populate('item').populate('renter', 'name avatar phone rating').sort({ createdAt: -1 });
    res.json(rentals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update rental status (owner actions)
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status, ownerResponse } = req.body;
    const rental = await Rental.findById(req.params.id);
    if (!rental) return res.status(404).json({ message: 'Rental not found' });
    if (rental.owner.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });

    rental.status = status;
    if (ownerResponse) rental.ownerResponse = ownerResponse;

    if (status === 'approved') rental.paymentStatus = 'paid';
    if (status === 'approved' && rental.type === 'buy') {
      await Item.findByIdAndUpdate(rental.item, { isSold: true, isAvailable: false });
    }
    if (status === 'active') rental.paymentStatus = 'paid';

    await rental.save();
    await rental.populate(['item', 'renter', 'owner']);
    res.json(rental);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Cancel rental (renter)
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id);
    if (!rental) return res.status(404).json({ message: 'Not found' });
    if (rental.renter.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });
    if (!['pending', 'approved'].includes(rental.status)) return res.status(400).json({ message: 'Cannot cancel at this stage' });
    rental.status = 'cancelled';
    await rental.save();
    res.json(rental);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add review
router.post('/:id/review', auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const rental = await Rental.findById(req.params.id);
    if (!rental) return res.status(404).json({ message: 'Not found' });
    if (rental.renter.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });
    if (!['completed', 'approved'].includes(rental.status)) return res.status(400).json({ message: 'Can only review completed rentals' });

    rental.review = { rating, comment, createdAt: new Date() };
    await rental.save();

    // Update item rating
    const item = await Item.findById(rental.item);
    const newTotal = item.totalRatings + 1;
    item.rating = ((item.rating * item.totalRatings) + rating) / newTotal;
    item.totalRatings = newTotal;
    await item.save();

    res.json(rental);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
