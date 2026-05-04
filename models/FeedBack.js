const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  userName:    { type: String, default: 'Anonymous' },
  productName: { type: String, required: true },
  rating:      { type: Number, min: 1, max: 5, required: true },
  review:      { type: String },
  isFake:      { type: Boolean, default: false },
  alertReason: { type: String, default: '' },
  likes:       { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('FeedBack', feedbackSchema);