const mongoose = require('mongoose');

const cropHealthSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  cropName: { type: String, required: true },
  status:   { type: String, enum: ['Healthy','Warning','Critical'], default: 'Healthy' },
  soilPh:       { type: Number },
  moisture:     { type: Number },
  nitrogen:     { type: Number },
  phosphorus:   { type: Number },
  potassium:    { type: Number },
  fertilizers:  [{ type: String }],
  recommendation: { type: String },
  reportDate: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('CropHealth', cropHealthSchema);