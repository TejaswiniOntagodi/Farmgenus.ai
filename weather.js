const express = require('express');
const router  = express.Router();

// GET /api/weather?city=Kakinada
router.get('/', async (req, res) => {
  try {
    const { city } = req.query;
    const apiKey = process.env.WEATHER_API_KEY;
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    const response = await fetch(url);
    const data = await response.json();
    res.json({ success: true, weather: data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;