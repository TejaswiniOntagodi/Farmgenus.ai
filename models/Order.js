const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId:   { type: Number, required: true },
  productName: { type: String, required: true },
  price:       { type: Number, required: true },
  quantity:    { type: Number, required: true, min: 1 },
  total:       { type: Number, required: true }
});

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  orderId: {
    type: String,
    unique: true
  },
  items:        [orderItemSchema],
  totalAmount:  { type: Number, required: true },
  paymentMode:  { type: String, default: 'Cash on Delivery' },
  status: {
    type: String,
    enum: ['Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Placed'
  },
  deliveryAddress: {
    name:     { type: String, default: '' },
    phone:    { type: String, default: '' },
    address:  { type: String, default: '' },
    city:     { type: String, default: '' },
    state:    { type: String, default: '' },
    pincode:  { type: String, default: '' }
  },
  estimatedDelivery: {
    type: Date,
    default: () => new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
  },
  placedAt: {
    type: Date,
    default: Date.now
  }
});

// Auto-generate order ID before saving
orderSchema.pre('save', function(next) {
  if (!this.orderId) {
    this.orderId = 'FG' + Date.now() + Math.floor(Math.random() * 1000);
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);