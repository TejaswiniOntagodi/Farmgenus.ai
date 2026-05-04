const express = require('express');
const router = express.Router();
const SoilReport = require('../models/SoilReport');

const cropData = {
  rice:      { n: 'Urea (46-0-0) — 60 kg/acre',    p: 'DAP (18-46-0) — 30 kg/acre', k: 'MOP — 20 kg/acre',  tip: 'Split Urea into 3 doses. Maintain 5cm water level.' },
  wheat:     { n: 'Urea — 65 kg/acre',              p: 'SSP — 50 kg/acre',           k: 'MOP — 25 kg/acre',  tip: 'Apply full P & K at sowing. Half N at sowing, rest at CRI stage.' },
  tomato:    { n: 'Calcium Nitrate — 20 kg/acre',   p: 'DAP — 25 kg/acre',           k: 'K2SO4 — 20 kg/acre',tip: 'Apply Calcium Nitrate to prevent Blossom End Rot.' },
  maize:     { n: 'Urea — 70 kg/acre',              p: 'DAP — 35 kg/acre',           k: 'MOP — 20 kg/acre',  tip: 'Top dress Urea at knee-high stage (V6).' },
  cotton:    { n: 'Ammonium Sulfate — 40 kg/acre',  p: 'DAP — 30 kg/acre',           k: 'MOP — 25 kg/acre',  tip: 'Add Boron 1 kg/acre for boll development.' },
  sugarcane: { n: 'Urea — 100 kg/acre',             p: 'SSP — 60 kg/acre',           k: 'MOP — 40 kg/acre',  tip: 'Apply in furrows. Top dress at 60 & 120 days.' },
  potato:    { n: 'Urea — 55 kg/acre',              p: 'DAP — 40 kg/acre',           k: 'MOP — 50 kg/acre',  tip: 'High Potassium needed for tuber quality. Avoid fresh manure.' }
};

const phAdvice = {
  acidic:   'Apply Agricultural Lime (2-3 bags/acre) 2 weeks before sowing to raise pH.',
  neutral:  'Soil pH is ideal (6.0-7.0). No pH correction needed.',
  alkaline: 'Apply Gypsum (2 bags/acre) or Elemental Sulfur to lower pH.'
};

const moistureTips = {
  dry:      'Install drip irrigation. Apply organic mulch 3-4 inches thick to retain moisture.',
  moderate: 'Moisture is good. Maintain current irrigation schedule.',
  wet:      'Improve drainage immediately. Create field channels. Delay fertilizer application.'
};

// POST /api/soil/analyze
router.post('/analyze', async (req, res) => {
  try {
    const { crop, soilType, ph, moisture, season, userId } = req.body;

    if (!crop || !soilType || !ph || !moisture || !season) {
      return res.status(400).json({ success: false, message: 'All soil parameters are required' });
    }

    if (!cropData[crop]) {
      return res.status(400).json({ success: false, message: 'Invalid crop type' });
    }

    const rec = cropData[crop];
    const recommendation = {
      nitrogen:    rec.n,
      phosphorus:  rec.p,
      potassium:   rec.k,
      phAdvice:    phAdvice[ph]    || 'Maintain your current pH.',
      moistureTip: moistureTips[moisture] || 'Monitor moisture regularly.',
      cropTip:     rec.tip
    };

    // Save to MongoDB
    const report = await SoilReport.create({
      userId: userId || null,
      inputs: { crop, soilType, ph, moisture, season },
      recommendation
    });

    res.status(201).json({
      success: true,
      message: 'Soil analysis complete',
      reportId: report._id,
      recommendation
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/soil/reports/:userId
router.get('/reports/:userId', async (req, res) => {
  try {
    const reports = await SoilReport.find({ userId: req.params.userId })
      .sort({ createdAt: -1 })
      .limit(10);
    res.json({ success: true, count: reports.length, reports });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/soil/report/:id — get single report
router.get('/report/:id', async (req, res) => {
  try {
    const report = await SoilReport.findById(req.params.id);
    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });
    res.json({ success: true, report });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;