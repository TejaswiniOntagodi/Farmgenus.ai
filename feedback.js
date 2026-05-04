const express  = require('express');
const router   = express.Router();
const FeedBack = require('../models/FeedBack');

// POST /api/feedback/add
router.post('/add', async (req, res) => {
  try {
    const { userId, userName, productName, rating, review, isFake, alertReason } = req.body;
    const fb = await FeedBack.create({ userId, userName, productName, rating, review, isFake, alertReason });
    res.json({ success: true, feedback: fb });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/feedback/all
router.get('/all', async (req, res) => {
  try {
    const feedbacks = await FeedBack.find().sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, feedbacks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/feedback/alerts (fake product alerts)
router.get('/alerts', async (req, res) => {
  try {
    const alerts = await FeedBack.find({ isFake: true }).sort({ createdAt: -1 });
    res.json({ success: true, alerts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/feedback/like/:id
router.patch('/like/:id', async (req, res) => {
  try {
    const fb = await FeedBack.findByIdAndUpdate(req.params.id, { $inc: { likes: 1 } }, { new: true });
    res.json({ success: true, likes: fb.likes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;