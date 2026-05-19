const express = require('express');
const cors = require('cors');
const axios = require('axios');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'adm-final-secret';
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://user-service:3002';

app.get('/health', (req, res) => res.json({ service: 'auth-service', status: 'OK' }));

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email e password são obrigatórios.' });

    const response = await axios.post(`${USER_SERVICE_URL}/users/verify`, { email, password });
    const user = response.data.user;

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.json({ message: 'Login efetuado com sucesso.', token, user });
  } catch (error) {
    const status = error.response?.status || 500;
    res.status(status).json({ message: error.response?.data?.message || 'Erro na autenticação.' });
  }
});

app.post('/auth/validate', (req, res) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = req.body.token || authHeader.replace('Bearer ', '');
    if (!token) return res.status(401).json({ valid: false, message: 'Token não enviado.' });

    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ valid: true, user: decoded });
  } catch (error) {
    res.status(401).json({ valid: false, message: 'Token inválido ou expirado.' });
  }
});

app.listen(PORT, () => console.log(`Auth Service a correr na porta ${PORT}`));
