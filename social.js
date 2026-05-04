const express   = require('express');
const router    = express.Router();
const CropVideo = require('../models/CropVideo');
const auth      = require('../middleware/auth');

// POST /api/social/post
router.post('/post', auth, async (req, res) => {
  try {
    const { title, description, videoUrl, thumbnail, crop } = req.body;
    const post = await CropVideo.create({
      userId: req.user.id, userName: req.user.name || 'Farmer',
      title, description, videoUrl, thumbnail, crop
    });
    res.json({ success: true, post });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/social/feed
router.get('/feed', async (req, res) => {
  try {
    const posts = await CropVideo.find().sort({ createdAt: -1 }).populate('userId', 'name');
    res.json({ success: true, posts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/social/like/:id
router.patch('/like/:id', auth, async (req, res) => {
  try {
    const post  = await CropVideo.findById(req.params.id);
    const liked = post.likes.includes(req.user.id);
    if (liked) post.likes.pull(req.user.id);
    else post.likes.push(req.user.id);
    await post.save();
    res.json({ success: true, likes: post.likes.length, liked: !liked });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/social/comment/:id
router.post('/comment/:id', auth, async (req, res) => {
  try {
    const { text } = req.body;
    const post = await CropVideo.findByIdAndUpdate(
      req.params.id,
      { $push: { comments: { userId: req.user.id, name: req.user.name, text } } },
      { new: true }
    );
    res.json({ success: true, comments: post.comments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;