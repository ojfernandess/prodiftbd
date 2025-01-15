require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB Connection settings
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      connectTimeoutMS: 30000, // Increase timeout if necessary
      socketTimeoutMS: 30000, // Increase socket timeout
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Could not connect to MongoDB:', error);
    process.exit(1); // Exit if we cannot connect to the database
  }
};

// Mongoose Schema for profits
const profitSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  planId: { type: String, required: true },
  profit: { type: Number, required: true },
  startTime: { type: Date, default: Date.now }
});

const Profit = mongoose.model('Profit', profitSchema);

// Connect to database before starting the server
connectDB().then(() => {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});

// Routes
app.post('/saveProfit', async (req, res) => {
  try {
    const { userId, planId, profit } = req.body;
    
    if (!userId || !planId || profit === undefined) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    let profitData = await Profit.findOne({ userId, planId }).exec(); // Use .exec() for explicit promise
    
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

    const profitData = await Profit.findOne({ userId, planId }).exec();
    if (profitData) {
      res.status(200).json({ profit: profitData.profit, startTime: profitData.startTime });
    } else {
      res.status(200).json({ profit: 0, startTime: new Date() });
    }
  } catch (error) {
    console.error('Error fetching profit:', error);
    res.status(500).json({ message: 'An error occurred while fetching profit', error: error.message });
  }
});
