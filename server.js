const express = require('express');
const mongoose = require('mongoose');
const app = express();
app.use(express.json());

mongoose.connect('mongodb+srv://odairjosfernandess:Dve3g6OGAYxn3n6y@profitminer.rbnoy.mongodb.net/', { useNewUrlParser: true, useUnifiedTopology: true });

const profitSchema = new mongoose.Schema({
  userId: String,
  planId: String,
  profit: Number,
  startTime: { type: Date, default: Date.now }
});
const Profit = mongoose.model('Profit', profitSchema);

app.post('/saveProfit', async (req, res) => {
  const { userId, planId, profit } = req.body;
  let profitData = await Profit.findOne({ userId, planId });
  
  if (!profitData) {
    profitData = new Profit({ userId, planId, profit, startTime: new Date() });
  } else {
    profitData.profit = profit;
    profitData.startTime = new Date();
  }
  await profitData.save();
  res.json({ message: 'Profit saved', profit: profitData.profit });
});

app.get('/getProfit', async (req, res) => {
  const { userId, planId } = req.query;
  const profitData = await Profit.findOne({ userId, planId });
  if(profitData) {
    res.json({ profit: profitData.profit, startTime: profitData.startTime });
  } else {
    res.json({ profit: 0, startTime: new Date() });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));
