const express    = require('express');
const router     = express.Router();
const CropHealth = require('../models/CropHealth');
const auth       = require('../middleware/auth');

function getFertilizers(nitrogen, phosphorus, potassium, ph) {
  const list = [];
  if (nitrogen < 30)   list.push('Apply Urea (46-0-0) for nitrogen boost');
  if (phosphorus < 20) list.push('Apply DAP (18-46-0) for phosphorus');
  if (potassium < 25)  list.push('Apply MOP/Potash (0-0-60) for potassium');
  if (ph < 6)          list.push('Add agricultural lime to raise pH');
  if (ph > 7.5)        list.push('Add sulfur to lower pH');
  if (list.length === 0) list.push('Soil is balanced. Continue current practices.');
  return list;
}

// POST /api/crophealth/add
router.post('/add', auth, async (req, res) => {
  try {
    const { cropName, soilPh, moisture, nitrogen, phosphorus, potassium } = req.body;
    const fertilizers = getFertilizers(nitrogen, phosphorus, potassium, soilPh);
    let status = 'Healthy';
    if (nitrogen < 20 || phosphorus < 15 || potassium < 15) status = 'Critical';
    else if (nitrogen < 30 || phosphorus < 20 || potassium < 20) status = 'Warning';

    const report = await CropHealth.create({
      userId: req.user.id, cropName, soilPh, moisture,
      nitrogen, phosphorus, potassium,
      fertilizers, status,
      recommendation: fertilizers.join('. ')
    });
    res.json({ success: true, report, fertilizers, status });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/crophealth/history
router.get('/history', auth, async (req, res) => {
  try {
    const reports = await CropHealth.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, reports });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/crophealth/report/:id
router.get('/report/:id', auth, async (req, res) => {
  try {
    const report = await CropHealth.findById(req.params.id);
    if (!report) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, report });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;