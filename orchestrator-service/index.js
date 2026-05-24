const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://auth-service:3001';
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://user-service:3002';
const TASK_SERVICE_URL = process.env.TASK_SERVICE_URL || 'http://task-service:3003';
const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || "http://notification-service:3004";

async function validateToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'Token não enviado.' });

    const response = await axios.post(`${AUTH_SERVICE_URL}/auth/validate`, {}, {
      headers: { Authorization: authHeader }
    });

    req.user = response.data.user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token inválido ou expirado.' });
  }
}

function handleError(error, res) {
  const status = error.response?.status || 500;
  res.status(status).json(error.response?.data || { message: 'Erro no orquestrador.' });
}

app.get('/health', (req, res) => res.json({ service: 'orchestrator-service', status: 'OK' }));

app.post('/api/register', async (req, res) => {
  try {
    const response = await axios.post(`${USER_SERVICE_URL}/users`, req.body);
    res.status(response.status).json(response.data);
  } catch (error) {
    handleError(error, res);
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const response = await axios.post(`${AUTH_SERVICE_URL}/auth/login`, req.body);
    res.status(response.status).json(response.data);
  } catch (error) {
    handleError(error, res);
  }
});

app.get('/api/users', validateToken, async (req, res) => {
  try {
    const response = await axios.get(`${USER_SERVICE_URL}/users`);
    res.json(response.data);
  } catch (error) {
    handleError(error, res);
  }
});

app.get('/api/users/:id', validateToken, async (req, res) => {
  try {
    const response = await axios.get(`${USER_SERVICE_URL}/users/${req.params.id}`);
    res.json(response.data);
  } catch (error) {
    handleError(error, res);
  }
});

app.put('/api/users/:id', validateToken, async (req, res) => {
  try {
    const response = await axios.put(`${USER_SERVICE_URL}/users/${req.params.id}`, req.body);
    res.json(response.data);
  } catch (error) {
    handleError(error, res);
  }
});

app.delete('/api/users/:id', validateToken, async (req, res) => {
  try {
    const response = await axios.delete(`${USER_SERVICE_URL}/users/${req.params.id}`);
    res.json(response.data);
  } catch (error) {
    handleError(error, res);
  }
});

app.post('/api/tasks', validateToken, async (req, res) => {
  try {
    const body = { ...req.body, userId: req.user.id };
    const response = await axios.post(`${TASK_SERVICE_URL}/tasks`, body);
    res.status(response.status).json(response.data);
  } catch (error) {
    handleError(error, res);
  }
});

app.get('/api/tasks', validateToken, async (req, res) => {
  try {
    const response = await axios.get(`${TASK_SERVICE_URL}/tasks`, {
      params: { userId: req.user.id }
    });
    res.json(response.data);
  } catch (error) {
    handleError(error, res);
  }
});

app.get('/api/tasks/:id', validateToken, async (req, res) => {
  try {
    const response = await axios.get(`${TASK_SERVICE_URL}/tasks/${req.params.id}`);
    if (response.data.userId !== req.user.id) return res.status(403).json({ message: 'Não tens permissão para ver esta tarefa.' });
    res.json(response.data);
  } catch (error) {
    handleError(error, res);
  }
});

app.put('/api/tasks/:id', validateToken, async (req, res) => {
  try {
    const existing = await axios.get(`${TASK_SERVICE_URL}/tasks/${req.params.id}`);
    if (existing.data.userId !== req.user.id) return res.status(403).json({ message: 'Não tens permissão para editar esta tarefa.' });

    const response = await axios.put(`${TASK_SERVICE_URL}/tasks/${req.params.id}`, req.body);
    res.json(response.data);
  } catch (error) {
    handleError(error, res);
  }
});

app.delete('/api/tasks/:id', validateToken, async (req, res) => {
  try {
    const existing = await axios.get(`${TASK_SERVICE_URL}/tasks/${req.params.id}`);
    if (existing.data.userId !== req.user.id) return res.status(403).json({ message: 'Não tens permissão para apagar esta tarefa.' });

    const response = await axios.delete(`${TASK_SERVICE_URL}/tasks/${req.params.id}`);
    res.json(response.data);
  } catch (error) {
    handleError(error, res);
  }
});

app.listen(PORT, () => console.log(`Orchestrator Service a correr na porta ${PORT}`));

app.get("/notifications/:userId", async (req, res) => {
  try {
    const response = await axios.get(`${NOTIFICATION_SERVICE_URL}/notifications/${req.params.userId}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({
      message: "Erro ao comunicar com o Notification Service",
      error: error.message
    });
  }
});
