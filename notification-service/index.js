const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

const TASK_SERVICE_URL = process.env.TASK_SERVICE_URL || "http://task-service:3003";

app.get("/health", (req, res) => {
  res.json({ service: "notification-service", status: "OK" });
});

app.get("/notifications/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const response = await axios.get(`${TASK_SERVICE_URL}/tasks`);
    const allTasks = response.data;

    const tasks = allTasks.filter(task => {
      return String(task.userId) === String(userId);
    });

    const today = new Date();

    const notifications = tasks
      .filter(task => task.deadline && task.status !== "completed")
      .map(task => {
        const deadline = new Date(task.deadline);
        const diffTime = deadline.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
          return {
            taskId: task._id || task.id,
            title: task.title,
            message: `A tarefa "${task.title}" está atrasada.`
          };
        }

        if (diffDays <= 2) {
          return {
            taskId: task._id || task.id,
            title: task.title,
            message: `A tarefa "${task.title}" termina em ${diffDays} dia(s).`
          };
        }

        return null;
      })
      .filter(Boolean);
    
    if (notifications.length === 0) {
      notifications.push({
        taskId: null,
        title: "Sem alertas urgentes",
        message: "Não existem tarefas atrasadas ou próximas da data limite."
      });
    }

    res.json(notifications);
  } catch (error) {
    res.status(500).json({
      message: "Erro ao obter notificações",
      error: error.message
    });
  }
});

const PORT = process.env.PORT || 3004;

app.listen(PORT, () => {
  console.log(`Notification Service running on port ${PORT}`);
});
