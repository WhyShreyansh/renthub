const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: ['Electronics', 'Vehicles', 'Tools', 'Furniture', 'Sports', 'Clothing', 'Books', 'Cameras', 'Music', 'Other'],
    required: true
  },
  images: [{ type: String }],
  pricePerDay: { type: Number, required: true },
  pricePerWeek: { type: Number },
  pricePerMonth: { type: Number },
  salePrice: { type: Number },
  availableForRent: { type: Boolean, default: true },
  availableForSale: { type: Boolean, default: false },
  condition: {
    type: String,
    enum: ['New', 'Like New', 'Good', 'Fair', 'Poor'],
    default: 'Good'
  },
  location: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isAvailable: { type: Boolean, default: true },
  isSold: { type: Boolean, default: false },
  tags: [{ type: String }],
  rating: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

itemSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Item', itemSchema);
