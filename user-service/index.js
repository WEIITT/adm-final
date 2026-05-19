const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3002;
const MONGO_URL = process.env.MONGO_URL || 'mongodb://mongo-service:27017/usersdb';

mongoose.connect(MONGO_URL)
  .then(() => console.log('User Service ligado ao MongoDB'))
  .catch(err => console.error('Erro MongoDB User Service:', err.message));

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

function publicUser(user) {
  return { id: user._id, name: user.name, email: user.email, createdAt: user.createdAt };
}

app.get('/health', (req, res) => res.json({ service: 'user-service', status: 'OK' }));

app.post('/users', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Nome, email e password são obrigatórios.' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: 'Já existe um utilizador com este email.' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash });
    res.status(201).json({ message: 'Utilizador criado com sucesso.', user: publicUser(user) });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar utilizador.', error: error.message });
  }
});

app.get('/users', async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.json(users.map(publicUser));
});

app.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Utilizador não encontrado.' });
    res.json(publicUser(user));
  } catch (error) {
    res.status(400).json({ message: 'ID inválido.' });
  }
});

app.put('/users/:id', async (req, res) => {
  try {
    const update = {};
    if (req.body.name) update.name = req.body.name;
    if (req.body.email) update.email = req.body.email;
    if (req.body.password) update.passwordHash = await bcrypt.hash(req.body.password, 10);

    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!user) return res.status(404).json({ message: 'Utilizador não encontrado.' });
    res.json({ message: 'Utilizador atualizado com sucesso.', user: publicUser(user) });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar utilizador.', error: error.message });
  }
});

app.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'Utilizador não encontrado.' });
    res.json({ message: 'Utilizador eliminado com sucesso.' });
  } catch (error) {
    res.status(400).json({ message: 'ID inválido.' });
  }
});

app.post('/users/verify', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: 'Credenciais inválidas.' });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: 'Credenciais inválidas.' });

  res.json({ user: publicUser(user) });
});

app.listen(PORT, () => console.log(`User Service a correr na porta ${PORT}`));
