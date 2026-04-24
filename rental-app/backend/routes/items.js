const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Item = require('../models/Item');
const { auth } = require('../middleware/auth');

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname.replace(/\s/g, '_'));
  }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// Get all items (with filters)
router.get('/', async (req, res) => {
  try {
    const { category, type, search, minPrice, maxPrice, location, sort, page = 1, limit = 12 } = req.query;
    const query = { isSold: false };

    if (category && category !== 'All') query.category = category;
    if (type === 'rent') query.availableForRent = true;
    if (type === 'buy') query.availableForSale = true;
    if (location) query.location = new RegExp(location, 'i');
    if (minPrice || maxPrice) {
      query.pricePerDay = {};
      if (minPrice) query.pricePerDay.$gte = Number(minPrice);
      if (maxPrice) query.pricePerDay.$lte = Number(maxPrice);
    }
    if (search) query.$text = { $search: search };

    let sortObj = { createdAt: -1 };
    if (sort === 'price_asc') sortObj = { pricePerDay: 1 };
    if (sort === 'price_desc') sortObj = { pricePerDay: -1 };
    if (sort === 'rating') sortObj = { rating: -1 };
    if (sort === 'popular') sortObj = { views: -1 };

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Item.find(query).populate('owner', 'name avatar rating location').sort(sortObj).skip(skip).limit(Number(limit)),
      Item.countDocuments(query)
    ]);

    res.json({ items, total, pages: Math.ceil(total / limit), currentPage: Number(page) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single item
router.get('/:id', async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true })
      .populate('owner', 'name avatar rating location phone bio totalRatings createdAt');
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create item
router.post('/', auth, upload.array('images', 5), async (req, res) => {
  try {
    const { title, description, category, pricePerDay, pricePerWeek, pricePerMonth, salePrice, availableForRent, availableForSale, condition, location, tags } = req.body;
    const images = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];

    const item = new Item({
      title, description, category, pricePerDay, pricePerWeek, pricePerMonth, salePrice,
      availableForRent: availableForRent === 'true',
      availableForSale: availableForSale === 'true',
      condition, location,
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      images,
      owner: req.user._id
    });

    await item.save();
    await item.populate('owner', 'name avatar rating location');
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update item
router.put('/:id', auth, upload.array('images', 5), async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    if (item.owner.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });

    const updates = { ...req.body };
    if (req.files && req.files.length > 0) updates.images = req.files.map(f => `/uploads/${f.filename}`);
    if (updates.availableForRent) updates.availableForRent = updates.availableForRent === 'true';
    if (updates.availableForSale) updates.availableForSale = updates.availableForSale === 'true';
    if (updates.tags) updates.tags = updates.tags.split(',').map(t => t.trim());

    const updated = await Item.findByIdAndUpdate(req.params.id, updates, { new: true }).populate('owner', 'name avatar rating location');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete item
router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    if (item.owner.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });
    await item.deleteOne();
    res.json({ message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get user's items
router.get('/user/:userId', async (req, res) => {
  try {
    const items = await Item.find({ owner: req.params.userId }).populate('owner', 'name avatar rating').sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
