const mongoose = require('mongoose');

const rentalSchema = new mongoose.Schema({
  item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  renter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['rent', 'buy'], required: true },
  startDate: { type: Date },
  endDate: { type: Date },
  totalDays: { type: Number },
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'approved', 'active', 'completed', 'cancelled', 'rejected'],
    default: 'pending'
  },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' },
  message: { type: String },
  ownerResponse: { type: String },
  review: {
    rating: { type: Number, min: 1, max: 5 },
    comment: { type: String },
    createdAt: { type: Date }
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Rental', rentalSchema);
