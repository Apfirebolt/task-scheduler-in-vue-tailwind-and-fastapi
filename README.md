# Task Scheduler using Vue, Tailwind, Vite and Fast API

A task scheduler app which allows anonymous users to add tasks and view them in a custom calendar created using dayjs library.

![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Vue.js](https://img.shields.io/badge/vuejs-%2335495e.svg?style=for-the-badge&logo=vuedotjs&logoColor=%234FC08D)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)

## 💻 Tech Stack 

The project back-end is created using Fast API in Python and Vue is used for the front-end. Tailwind CSS classes are used to style the UI components. For the database "Postgres" has been used.

## 📄 Introduction

It is a simple Kanban board application where you have four status 'To Do', 'In Progress', 'In Review' and 'Done'. You can create a generic task item and then through Kanban drag and drop dashboard, you can move items and save the updated status.

It has supoort for multi-user authentication.

## ✏️ Updates

27/12/22 : Added Admin panel with support of being able to add users and tasks, modify any user or task for admin role user type.

## 📷 Screenshots

The style might be a subject to change in the future for this project. But, as of now this is how few pages look like

Add Task form.

![alt text](./screenshots/1.png)

Schduler which displays tasks in a calendar form.

![alt text](./screenshots/2.png)

List of all tasks, calendar view and table view

![alt text](./screenshots/3.png)

![alt text](./screenshots/4.png)


Mobile menu view, a sidebar opens which displays menu items on smaller screens.

![alt text](./screenshots/mobile_menu.png)

## 🐳 Deployment using Docker Containers

The application is fully containerized using Docker and Docker Compose, making it easy to deploy and run in any environment.

### Quick Start

```powershell
# Clone the repository
git clone <repository-url>
cd task-scheduler-in-vue-tailwind-and-fastapi

# Build and start all services
docker-compose up --build

# Access the application
# Frontend: http://localhost:8080
# Backend API: http://localhost:8000
# API Documentation: http://localhost:8000/docs
```

### Prerequisites

- Docker Desktop (Windows/Mac) or Docker Engine (Linux)
- Docker Compose (included with Docker Desktop)

### 📚 Documentation

Complete documentation is available in the `docs/` folder:

- **[Complete Documentation Guide](./docs/DOCUMENTATION.md)** - Start here for full overview
- **[Docker Configuration & Deployment](./docs/DOCKER.md)** - Docker setup, Dockerfiles, and services
- **[CORS & API Reverse Proxy](./docs/CORS.md)** - How CORS issues are avoided and API routing

### Common Commands

| Command | Description |
|---------|-------------|
| `docker-compose up --build` | Build and start all services |
| `docker-compose up -d` | Start in background |
| `docker-compose down` | Stop all services |
| `docker-compose logs -f` | View real-time logs |
| `docker-compose ps` | Check service status |

### Architecture

Three containerized services:

1. **PostgreSQL Database** - Port 5432 (internal)
2. **FastAPI Backend** - Port 8000
3. **Vue.js + Nginx Frontend** - Port 8080

### For More Information

👉 **See [docs/DOCUMENTATION.md](./docs/DOCUMENTATION.md)** for:
- Complete setup guide
- Architecture diagrams
- Troubleshooting
- Development guidelines
- Environment configuration
- Production deployment

### Key Features

- ✅ Fully containerized with Docker
- ✅ CORS-free architecture via Nginx reverse proxy
- ✅ Automatic database migrations
- ✅ Persistent data storage
- ✅ Health checks and service dependencies
- ✅ Production-ready configuration
