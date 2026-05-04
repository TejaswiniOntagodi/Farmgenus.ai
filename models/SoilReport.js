const mongoose = require('mongoose');

const soilReportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  inputs: {
    crop:     { type: String, required: true },
    soilType: { type: String, required: true },
    ph:       { type: String, required: true },
    moisture: { type: String, required: true },
    season:   { type: String, required: true }
  },
  recommendation: {
    nitrogen:    { type: String, default: '' },
    phosphorus:  { type: String, default: '' },
    potassium:   { type: String, default: '' },
    phAdvice:    { type: String, default: '' },
    moistureTip: { type: String, default: '' },
    cropTip:     { type: String, default: '' }
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SoilReport', soilReportSchema);