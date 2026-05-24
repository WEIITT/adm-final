# Sistema de Gestão de Tarefas com Microsserviços

Projeto desenvolvido no âmbito da unidade curricular de Arquiteturas Distribuídas e Microsserviços.

O objetivo principal deste projeto consiste no desenvolvimento de um sistema de gestão de tarefas baseado numa arquitetura de microsserviços, utilizando comunicação REST, Docker, MongoDB e Kubernetes com Minikube.

---

# Tecnologias Utilizadas

* Node.js
* Express.js
* MongoDB
* JWT (JSON Web Token)
* Docker
* Docker Compose
* Kubernetes
* Minikube
* HTML
* CSS
* JavaScript

---

# Estrutura do Projeto

```txt
adm-final/
├── auth-service/
├── user-service/
├── task-service/
├── notification-service/
├── orchestrator-service/
├── frontend/
├── k8s/
├── docker-compose.yml
└── README.md
```

---

# Arquitetura do Sistema

O sistema foi desenvolvido segundo uma arquitetura de microsserviços.

Cada microsserviço executa uma funcionalidade específica:

| Serviço              | Porta | Função                          |
| -------------------- | ----- | ------------------------------- |
| orchestrator-service | 3000  | Serviço central de orquestração |
| auth-service         | 3001  | Autenticação e JWT              |
| user-service         | 3002  | Gestão de utilizadores          |
| task-service         | 3003  | Gestão de tarefas               |
| notification-service | 3004  | Gestão de notificações          |
| frontend             | 8081  | Interface Web                   |

---

# Funcionalidades Implementadas

## Funcionalidades Mínimas

### FM01 — Serviço Orquestrador

O `orchestrator-service` é responsável por receber os pedidos externos e encaminhá-los para os serviços adequados.

---

### FM02 — Serviço de Autenticação

O `auth-service` implementa autenticação baseada em JWT.

Funcionalidades:

* Login
* Geração de token JWT
* Validação de autenticação

---

### FM03 — Serviço de Utilizadores

O `user-service` permite:

* Criar utilizadores
* Consultar utilizadores
* Atualizar utilizadores
* Eliminar utilizadores

---

### FM04 — Serviço de Tarefas

O `task-service` permite:

* Criar tarefas
* Listar tarefas
* Atualizar tarefas
* Eliminar tarefas

---

# Funcionalidades Extra

## FA01 — Serviço de Notificações

O `notification-service` gera notificações relacionadas com:

* tarefas próximas da data limite;
* tarefas atrasadas.

---

## FA02 — Interface Web

Foi desenvolvida uma interface Web simples utilizando:

* HTML
* CSS
* JavaScript

---

# Base de Dados

O sistema utiliza MongoDB.

Coleções utilizadas:

* users
* tasks

---

# Execução do Projeto

## 1. Entrar na pasta do projeto

```bash
cd /media/sf_adm-final
```

---

## 2. Executar os containers Docker

```bash
docker-compose up --build
```

---

## 3. Verificar containers

```bash
docker ps
```

Resultado esperado:

```txt
orchestrator-service
auth-service
user-service
task-service
notification-service
mongo-service
```

---

# Teste do Backend

## Verificar serviço principal

```bash
curl http://localhost:3000/health
```

Resultado esperado:

```json
{"service":"orchestrator-service","status":"OK"}
```

---

# Execução do Frontend

## Entrar na pasta frontend

```bash
cd /media/sf_adm-final/frontend
```

---

## Iniciar servidor Web

```bash
python3 -m http.server 8081 --bind 0.0.0.0
```

---

## Abrir no browser

```txt
http://192.168.1.165:8081
```

---

# Funcionalidades do Frontend

A interface permite:

* criar utilizadores;
* efetuar login;
* criar tarefas;
* listar tarefas;
* eliminar tarefas;
* eliminar utilizadores;
* visualizar notificações.

---

# Endpoints REST

## Autenticação

### Login

```http
POST /api/login
```

---

## Utilizadores

### Criar utilizador

```http
POST /api/register
```

### Listar utilizadores

```http
GET /api/users
```

### Eliminar utilizador

```http
DELETE /api/users/:id
```

---

## Tarefas

### Criar tarefa

```http
POST /api/tasks
```

### Listar tarefas

```http
GET /api/tasks
```

### Eliminar tarefa

```http
DELETE /api/tasks/:id
```

---

## Notificações

### Obter notificações

```http
GET /notifications/:userId
```

---

# Docker Compose

O projeto utiliza Docker Compose para gerir os containers.

Serviços definidos:

* mongo
* auth-service
* user-service
* task-service
* notification-service
* orchestrator-service

---

# Kubernetes e Minikube

## Iniciar Minikube

```bash
minikube start --driver=docker
```

---

## Configurar Docker do Minikube

```bash
eval $(minikube docker-env)
```

---

## Construir imagens Docker

```bash
docker build -t adm-auth-service ./auth-service
docker build -t adm-user-service ./user-service
docker build -t adm-task-service ./task-service
docker build -t adm-notification-service ./notification-service
docker build -t adm-orchestrator-service ./orchestrator-service
```

---

## Aplicar configurações Kubernetes

```bash
kubectl apply -f k8s/
```

---

## Verificar Pods

```bash
kubectl get pods
```

---

## Verificar Serviços

```bash
kubectl get services
```

---

## Abrir serviço principal

```bash
minikube service orchestrator-service
```

---

# Fluxo das Notificações

O sistema de notificações funciona da seguinte forma:

```txt
Frontend
   ↓
Orchestrator Service
   ↓
Notification Service
   ↓
Task Service
   ↓
MongoDB
```

As notificações são geradas quando:

* a tarefa está atrasada;
* a tarefa termina em menos de 2 dias.

---

# Segurança

O sistema utiliza JWT para autenticação.

O token é necessário para:

* listar tarefas;
* criar tarefas;
* eliminar tarefas;
* eliminar utilizadores.

---

# Testes Realizados

Foram realizados testes às seguintes funcionalidades:

* criação de utilizadores;
* autenticação;
* criação de tarefas;
* listagem de tarefas;
* eliminação de tarefas;
* eliminação de utilizadores;
* notificações;
* comunicação entre microsserviços;
* execução em Docker;
* integração com Kubernetes.

---

# Conclusão

O projeto implementa um sistema distribuído baseado numa arquitetura de microsserviços, utilizando REST e Docker.

A solução permite a execução independente de cada serviço e a sua integração através de Kubernetes com Minikube.

O sistema demonstra conceitos importantes relacionados com:

* microsserviços;
* contentorização;
* autenticação JWT;
* orquestração;
* Docker;
* Kubernetes;
* comunicação REST.
