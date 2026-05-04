const express = require('express');
const router = express.Router();
const ScanResult = require('../models/ScanResult');

// Disease knowledge base
const diseaseDB = [
  {
    diseaseName: 'Leaf Blight Disease',
    severity: 'Moderate',
    cause: 'Fungal infection (Alternaria species) due to excess moisture and poor air circulation.',
    treatment: 'Apply copper-based fungicide every 7 days. Remove infected leaves immediately. Avoid overhead irrigation.',
    prevention: 'Ensure proper plant spacing. Use drip irrigation. Rotate crops every season.',
    products: ['Copper Fungicide Spray', 'Neem Oil Solution', 'Organic Compost']
  },
  {
    diseaseName: 'Powdery Mildew',
    severity: 'Mild',
    cause: 'Fungal spores spread by wind. Thrives in warm, dry conditions with high humidity.',
    treatment: 'Spray diluted neem oil or baking soda solution. Apply sulfur-based fungicide.',
    prevention: 'Improve air circulation. Avoid wetting foliage. Plant in sunny locations.',
    products: ['Neem Oil Spray', 'Sulfur Fungicide', 'Potassium Bicarbonate Spray']
  },
  {
    diseaseName: 'Bacterial Leaf Spot',
    severity: 'Moderate',
    cause: 'Xanthomonas bacteria spread through rain splash and infected tools.',
    treatment: 'Apply copper-based bactericide. Remove infected plant parts. Avoid working with wet plants.',
    prevention: 'Use certified disease-free seeds. Rotate crops. Disinfect tools regularly.',
    products: ['Copper Bactericide', 'Trichoderma Bio-fungicide', 'Garden Disinfectant']
  },
  {
    diseaseName: 'Root Rot',
    severity: 'Severe',
    cause: 'Caused by Phytophthora or Fusarium fungi in waterlogged soil with poor drainage.',
    treatment: 'Improve drainage immediately. Apply Metalaxyl fungicide. Remove severely infected plants.',
    prevention: 'Avoid overwatering. Use raised beds. Plant in well-drained soil.',
    products: ['Metalaxyl Fungicide', 'Trichoderma Granules', 'Drainage Pipes']
  },
  {
    diseaseName: 'Healthy Crop',
    severity: 'Healthy',
    cause: 'No disease detected.',
    treatment: 'No treatment needed. Keep up the good farming practices!',
    prevention: 'Continue regular monitoring. Maintain proper irrigation and fertilization schedule.',
    products: ['Organic Compost', 'NPK Fertilizer', 'Neem Oil (preventive spray)']
  }
];

// POST /api/disease/scan
router.post('/scan', async (req, res) => {
  try {
    const { imageBase64, cropType, userId } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ success: false, message: 'Image is required' });
    }

    // Simulate AI detection (pick random disease for demo)
    const detected = diseaseDB[Math.floor(Math.random() * diseaseDB.length)];

    // Save result to MongoDB
    const scanResult = await ScanResult.create({
      userId: userId || null,
      cropType: cropType || 'Unknown',
      result: detected
    });

    res.status(201).json({
      success: true,
      message: 'Scan completed successfully',
      scanId: scanResult._id,
      result: detected
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/disease/history/:userId
router.get('/history/:userId', async (req, res) => {
  try {
    const scans = await ScanResult.find({ userId: req.params.userId })
      .sort({ scannedAt: -1 })
      .limit(20);

    res.json({ success: true, count: scans.length, scans });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/disease/stats
router.get('/stats', async (req, res) => {
  try {
    const total = await ScanResult.countDocuments();
    const byDisease = await ScanResult.aggregate([
      { $group: { _id: '$result.diseaseName', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    res.json({ success: true, totalScans: total, byDisease });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;