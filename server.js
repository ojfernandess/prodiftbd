const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

// Configuração da conexão com MongoDB
mongoose.connect('mongodb+srv://odairjosfernandess:Dve3g6OGAYxn3n6y@profitminer.rbnoy.mongodb.net/', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Conexão com MongoDB estabelecida com sucesso.'))
.catch(err => console.error('Erro ao conectar com MongoDB:', err));

// Definição do Schema do Profit
const profitSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  planId: { type: String, required: true },
  profit: { type: Number, required: true },
  startTime: { type: Date, default: Date.now }
});

const Profit = mongoose.model('Profit', profitSchema);

// Rota para salvar lucro
app.post('/saveProfit', async (req, res) => {
  try {
    const { userId, planId, profit } = req.body;
    if (!userId || !planId || profit === undefined) {
      return res.status(400).json({ message: 'Dados incompletos' });
    }

    let profitData = await Profit.findOne({ userId, planId });
    
    if (!profitData) {
      profitData = new Profit({ userId, planId, profit });
    } else {
      profitData.profit = profit;
      profitData.startTime = new Date(); // Atualiza o startTime ao atualizar o lucro
    }
    
    await profitData.save();
    res.status(200).json({ message: 'Profit saved', profit: profitData.profit });
  } catch (error) {
    console.error('Erro ao salvar lucro:', error);
    res.status(500).json({ message: 'Erro ao salvar o lucro', error: error.message });
  }
});

// Rota para obter lucro
app.get('/getProfit', async (req, res) => {
  try {
    const { userId, planId } = req.query;
    if (!userId || !planId) {
      return res.status(400).json({ message: 'userId e planId são obrigatórios' });
    }

    const profitData = await Profit.findOne({ userId, planId });
    if (profitData) {
      res.json({ profit: profitData.profit, startTime: profitData.startTime });
    } else {
      // Aqui, em vez de enviar uma data atual, você pode optar por não enviar startTime
      res.json({ profit: 0 });
    }
  } catch (error) {
    console.error('Erro ao obter lucro:', error);
    res.status(500).json({ message: 'Erro ao obter o lucro', error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
