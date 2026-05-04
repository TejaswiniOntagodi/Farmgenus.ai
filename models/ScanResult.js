const mongoose = require('mongoose');

const scanResultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  imageBase64: {
    type: String,
    default: ''
  },
  cropType: {
    type: String,
    default: 'Unknown'
  },
  result: {
    diseaseName:  { type: String, required: true },
    severity:     { type: String, enum: ['Healthy', 'Mild', 'Moderate', 'Severe'], default: 'Mild' },
    cause:        { type: String, default: '' },
    treatment:    { type: String, default: '' },
    prevention:   { type: String, default: '' },
    products:     [String]
  },
  scannedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ScanResult', scanResultSchema);