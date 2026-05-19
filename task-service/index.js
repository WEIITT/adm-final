const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3003;
const MONGO_URL = process.env.MONGO_URL || 'mongodb://mongo-service:27017/tasksdb';

mongoose.connect(MONGO_URL)
  .then(() => console.log('Task Service ligado ao MongoDB'))
  .catch(err => console.error('Erro MongoDB Task Service:', err.message));

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'in_progress', 'done'], default: 'pending' },
  dueDate: { type: Date },
  userId: { type: String, required: true }
}, { timestamps: true });

const Task = mongoose.model('Task', taskSchema);

app.get('/health', (req, res) => res.json({ service: 'task-service', status: 'OK' }));

app.post('/tasks', async (req, res) => {
  try {
    const { title, description, status, dueDate, userId } = req.body;
    if (!title || !userId) return res.status(400).json({ message: 'Título e userId são obrigatórios.' });

    const task = await Task.create({ title, description, status, dueDate, userId });
    res.status(201).json({ message: 'Tarefa criada com sucesso.', task });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar tarefa.', error: error.message });
  }
});

app.get('/tasks', async (req, res) => {
  const filter = req.query.userId ? { userId: req.query.userId } : {};
  const tasks = await Task.find(filter).sort({ createdAt: -1 });
  res.json(tasks);
});

app.get('/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Tarefa não encontrada.' });
    res.json(task);
  } catch (error) {
    res.status(400).json({ message: 'ID inválido.' });
  }
});

app.put('/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!task) return res.status(404).json({ message: 'Tarefa não encontrada.' });
    res.json({ message: 'Tarefa atualizada com sucesso.', task });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar tarefa.', error: error.message });
  }
});

app.delete('/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: 'Tarefa não encontrada.' });
    res.json({ message: 'Tarefa eliminada com sucesso.' });
  } catch (error) {
    res.status(400).json({ message: 'ID inválido.' });
  }
});

app.listen(PORT, () => console.log(`Task Service a correr na porta ${PORT}`));
