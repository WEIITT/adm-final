# Projeto ADM Final — Sistema de Gestão de Tarefas com Microsserviços

Este projeto implementa um sistema de gestão de tarefas com arquitetura de microsserviços, comunicação REST síncrona, modelo Request/Response, serviço orquestrador, Docker e Kubernetes local com Minikube.

## Microsserviços

- `orchestrator-service` — ponto de entrada central para todos os pedidos.
- `auth-service` — autenticação de utilizadores com JWT.
- `user-service` — criação, leitura, edição e remoção de utilizadores.
- `task-service` — criação, leitura, edição e remoção de tarefas.
- `mongo-service` — base de dados MongoDB usada pelos serviços de utilizadores e tarefas.

## Arquitetura

```txt
Cliente/Postman/Frontend
        |
        v
Orchestrator Service :3000
        |
        |------> Auth Service :3001
        |------> User Service :3002
        |------> Task Service :3003
                    |
                    v
                MongoDB :27017
```

## Endpoints principais pelo Orchestrator

### Registar utilizador

```http
POST /api/register
Content-Type: application/json

{
  "name": "Joao",
  "email": "joao@email.com",
  "password": "123456"
}
```

### Login

```http
POST /api/login
Content-Type: application/json

{
  "email": "joao@email.com",
  "password": "123456"
}
```

A resposta devolve um `token`. Usa esse token nas rotas protegidas:

```http
Authorization: Bearer TOKEN_AQUI
```

### Criar tarefa

```http
POST /api/tasks
Authorization: Bearer TOKEN_AQUI
Content-Type: application/json

{
  "title": "Estudar Kubernetes",
  "description": "Preparar a apresentação do projeto",
  "status": "pending",
  "dueDate": "2026-06-01"
}
```

### Listar tarefas do utilizador autenticado

```http
GET /api/tasks
Authorization: Bearer TOKEN_AQUI
```

### Atualizar tarefa

```http
PUT /api/tasks/ID_DA_TAREFA
Authorization: Bearer TOKEN_AQUI
Content-Type: application/json

{
  "status": "done"
}
```

### Apagar tarefa

```http
DELETE /api/tasks/ID_DA_TAREFA
Authorization: Bearer TOKEN_AQUI
```

## Teste local com Docker Compose

Na pasta principal do projeto:

```bash
docker compose up --build
```

Depois testa:

```bash
curl http://localhost:3000/health
```

## Executar no Minikube

### 1. Iniciar Minikube

```bash
minikube start
```

### 2. Usar o Docker interno do Minikube

No Linux/macOS:

```bash
eval $(minikube docker-env)
```

No Windows PowerShell:

```powershell
minikube docker-env | Invoke-Expression
```

### 3. Construir as imagens dentro do Minikube

```bash
docker build -t adm-auth-service:latest ./auth-service
docker build -t adm-user-service:latest ./user-service
docker build -t adm-task-service:latest ./task-service
docker build -t adm-orchestrator-service:latest ./orchestrator-service
```

### 4. Aplicar os ficheiros Kubernetes

```bash
kubectl apply -f k8s/
```

### 5. Verificar pods e serviços

```bash
kubectl get pods
kubectl get services
```

### 6. Abrir o Orchestrator no browser

```bash
minikube service orchestrator-service
```

Ou usar o IP do Minikube com a porta NodePort:

```bash
minikube ip
```

Depois aceder a:

```txt
http://IP_DO_MINIKUBE:30080/health
```

## Testes rápidos com curl

### Criar utilizador

```bash
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Joao","email":"joao@email.com","password":"123456"}'
```

### Login

```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"joao@email.com","password":"123456"}'
```

### Criar tarefa

Substitui `TOKEN_AQUI` pelo token recebido no login.

```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_AQUI" \
  -d '{"title":"Estudar microsserviços","description":"Preparar defesa","status":"pending","dueDate":"2026-06-01"}'
```

### Listar tarefas

```bash
curl http://localhost:3000/api/tasks \
  -H "Authorization: Bearer TOKEN_AQUI"
```

## Observações para o relatório

Este projeto cumpre as funcionalidades mínimas:

- FM01: Serviço Orquestrador implementado.
- FM02: Serviço de Autenticação com JWT implementado.
- FM03: Serviço de Utilizadores implementado.
- FM04: Serviço de Tarefas implementado.
- Todos os serviços têm Dockerfile individual.
- Todos os serviços têm integração Kubernetes/Minikube.
- Comunicação REST com Request/Response.
- Arquitetura com orquestração centralizada.
