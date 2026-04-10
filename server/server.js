require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');


const carbonRoutes = require('./Routes/carbonRoutes');
const authRoutes = require('./Routes/authRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/carbon', carbonRoutes);
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
    res.send('The Carbon Tracker API is running!');
});

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/carbon-tracker')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));