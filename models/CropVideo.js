const mongoose = require('mongoose');

const cropVideoSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName:    { type: String },
  title:       { type: String, required: true },
  description: { type: String },
  videoUrl:    { type: String, required: true },
  thumbnail:   { type: String },
  crop:        { type: String },
  likes:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name:   { type: String },
    text:   { type: String },
    date:   { type: Date, default: Date.now }
  }],
}, { timestamps: true });

module.exports = mongoose.model('CropVideo', cropVideoSchema);