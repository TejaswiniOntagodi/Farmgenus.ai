const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// Full product catalog
const products = [
  { id:1,  name:'Tomato Seeds (Hybrid F1)',     icon:'🍅', price:120,  original:180,  category:'seeds',      desc:'High yield, disease resistant' },
  { id:2,  name:'Rice Seeds (Basmati 1121)',    icon:'🌾', price:250,  original:320,  category:'seeds',      desc:'Premium long grain basmati' },
  { id:3,  name:'Wheat Seeds (HD-2967)',         icon:'🌿', price:180,  original:220,  category:'seeds',      desc:'High yield rabi variety' },
  { id:4,  name:'Maize Seeds (Hybrid)',          icon:'🌽', price:200,  original:260,  category:'seeds',      desc:'Early maturing hybrid' },
  { id:5,  name:'Cotton Seeds (BT)',             icon:'🌸', price:450,  original:550,  category:'seeds',      desc:'Bollworm resistant BT variety' },
  { id:6,  name:'Urea Fertilizer (50 kg)',      icon:'🧪', price:350,  original:400,  category:'fertilizer', desc:'46% Nitrogen for fast growth' },
  { id:7,  name:'DAP Fertilizer (50 kg)',       icon:'⚗️', price:1400, original:1600, category:'fertilizer', desc:'Best for root development' },
  { id:8,  name:'MOP / Potash (50 kg)',         icon:'🟤', price:800,  original:950,  category:'fertilizer', desc:'Improves fruit & grain quality' },
  { id:9,  name:'Organic Compost (25 kg)',      icon:'🌱', price:300,  original:350,  category:'fertilizer', desc:'100% natural soil enricher' },
  { id:10, name:'Micronutrient Mix (1 kg)',     icon:'✨', price:220,  original:280,  category:'fertilizer', desc:'Zinc, Boron, Iron blend' },
  { id:11, name:'Neem Oil Spray (1 L)',         icon:'🌿', price:180,  original:230,  category:'pesticide',  desc:'Organic natural pesticide' },
  { id:12, name:'Copper Fungicide (500 g)',     icon:'🔵', price:220,  original:270,  category:'pesticide',  desc:'Controls fungal diseases' },
  { id:13, name:'Insecticide Spray (1 L)',      icon:'🐛', price:280,  original:340,  category:'pesticide',  desc:'Broad spectrum pest control' },
  { id:14, name:'Bio-Fungicide Tricho (1 kg)',  icon:'🍄', price:350,  original:420,  category:'pesticide',  desc:'Biological disease control' },
  { id:15, name:'Hand Pressure Sprayer (5L)',  icon:'💧', price:450,  original:580,  category:'tools',      desc:'Durable, leak-proof design' },
  { id:16, name:'Garden Hoe (Heavy Duty)',      icon:'⛏️', price:350,  original:420,  category:'tools',      desc:'High carbon steel blade' },
  { id:17, name:'Drip Irrigation Kit (1 acre)', icon:'🚿', price:2500, original:3200, category:'tools',      desc:'Complete setup with pipes' },
  { id:18, name:'Soil Testing Kit',             icon:'🧬', price:599,  original:799,  category:'tools',      desc:'Test pH, N, P, K at home' }
];

// GET /api/shop/products — get all or filter by category/search
router.get('/products', (req, res) => {
  const { category, search } = req.query;
  let result = [...products];

  if (category && category !== 'all') {
    result = result.filter(p => p.category === category);
  }

  if (search) {
    const q = search.toLowerCase();
    result = result.filter(p =>
      p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q)
    );
  }

  res.json({ success: true, count: result.length, products: result });
});

// GET /api/shop/products/:id
router.get('/products/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  res.json({ success: true, product });
});

// POST /api/shop/order — place an order (Cash on Delivery)
router.post('/order', async (req, res) => {
  try {
    const { userId, cartItems, deliveryAddress, paymentMode } = req.body;

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    const orderItems = [];
    let totalAmount = 0;

    for (const item of cartItems) {
      const product = products.find(p => p.id === item.productId);
      if (!product) {
        return res.status(400).json({ success: false, message: `Product ${item.productId} not found` });
      }
      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;
      orderItems.push({
        productId:   product.id,
        productName: product.name,
        price:       product.price,
        quantity:    item.quantity,
        total:       itemTotal
      });
    }

    const order = await Order.create({
      userId:          userId || null,
      items:           orderItems,
      totalAmount,
      paymentMode:     paymentMode || 'Cash on Delivery',
      deliveryAddress: deliveryAddress || {}
    });

    res.status(201).json({
      success:           true,
      message:           'Order placed successfully! 🎉',
      orderId:           order.orderId,
      total:             totalAmount,
      estimatedDelivery: order.estimatedDelivery,
      order
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/shop/create-order — Razorpay online payment
router.post('/create-order', async (req, res) => {
  try {
    // Check if Razorpay keys are configured
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(400).json({
        success: false,
        message: 'Online payment not configured. Please use Cash on Delivery.'
      });
    }

    const { amount } = req.body;
    const Razorpay = require('razorpay');
    const razorpay = new Razorpay({
      key_id:     process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const order = await razorpay.orders.create({
      amount:   amount * 100, // convert to paise
      currency: 'INR',
      receipt:  'receipt_' + Date.now(),
    });

    res.json({ success: true, order });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/shop/orders/:userId — get all orders for a user
router.get('/orders/:userId', async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId })
      .sort({ placedAt: -1 });
    res.json({ success: true, count: orders.length, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/shop/order/:orderId — track a specific order
router.get('/order/:orderId', async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/shop/order/:orderId/status — update order status
router.patch('/order/:orderId/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const order = await Order.findOneAndUpdate(
      { orderId: req.params.orderId },
      { status },
      { new: true }
    );

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, message: `Order status updated to ${status}`, order });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;