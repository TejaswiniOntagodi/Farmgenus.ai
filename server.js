require('dotenv').config();
const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const app      = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ✅ Existing routes
app.use('/api/auth',       require('./routes/auth'));
app.use('/api/chat',       require('./routes/chat'));
app.use('/api/shop',       require('./routes/shop'));
app.use('/api/soil',       require('./routes/soil'));
app.use('/api/disease',    require('./routes/disease'));

// 🆕 New routes
app.use('/api/crophealth', require('./routes/crophealth'));
app.use('/api/feedback',   require('./routes/feedback'));
app.use('/api/social',     require('./routes/social'));
app.use('/api/weather',    require('./routes/weather'));

app.get('/', (req, res) => {
  res.json({ message: '🌾 FarmGenius AI Running!' });
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected!');
    app.listen(process.env.PORT || 5000, () => {
      console.log(`🚀 Server on port ${process.env.PORT || 5000}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB failed:', err.message);
    process.exit(1);
  });