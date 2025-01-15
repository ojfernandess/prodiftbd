// Import required modules
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // Loads environment variables from .env file

// Initialize Express app
const app = express();

// Middleware
app.use(express.json()); // for parsing application/json
app.use(cors()); // Enable CORS

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Could not connect to MongoDB:', err));

// Define Mongoose Schema
const profitSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  planId: { type: String, required: true },
  profit: { type: Number, required: true },
  startTime: { type: Date, default: Date.now }
});

// Create Model
const Profit = mongoose.model('Profit', profitSchema);

// Routes
app.post('/saveProfit', async (req, res) => {
  try {
    const { userId, planId, profit } = req.body;
    
    if (!userId || !planId || profit === undefined) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    let profitData = await Profit.findOne({ userId, planId });
    
    if (!profitData) {
      profitData = new Profit({ userId, planId, profit });
    } else {
      profitData.profit = profit;
      profitData.startTime = new Date();
    }

    await profitData.save();
    res.status(200).json({ message: 'Profit saved', profit: profitData.profit });
  } catch (error) {
    console.error('Error saving profit:', error);
    res.status(500).json({ message: 'An error occurred while saving profit', error: error.message });
  }
});

app.get('/getProfit', async (req, res) => {
  try {
    const { userId, planId } = req.query;

    if (!userId || !planId) {
      return res.status(400).json({ message: 'Missing userId or planId' });
    }

    const profitData = await Profit.findOne({ userId, planId });
    if(profitData) {
      res.status(200).json({ profit: profitData.profit, startTime: profitData.startTime });
    } else {
      res.status(200).json({ profit: 0, startTime: new Date() });
    }
  } catch (error) {
    console.error('Error fetching profit:', error);
    res.status(500).json({ message: 'An error occurred while fetching profit', error: error.message });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});