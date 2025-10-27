# Task Scheduler - Full-Stack Application

A modern task scheduler application built with Vue.js 3, FastAPI, and PostgreSQL. Features include task creation, management, calendar views, and multiple display formats with a responsive design.

![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![Vue.js](https://img.shields.io/badge/vuejs-%2335495e.svg?style=for-the-badge&logo=vuedotjs&logoColor=%234FC08D)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

## 🚀 Quick Start

### Prerequisites
- Docker Desktop (Windows/Mac) or Docker Engine (Linux)
- Docker Compose (included with Docker Desktop)

### Installation & Setup

```bash
# Clone the repository
git clone <repository-url>
cd task-scheduler-in-vue-tailwind-and-fastapi

# Build and start all services
docker compose -f docker/docker-compose.yaml up --build

# Access the application
# Frontend: http://localhost:8080
# Backend API: http://localhost:8000
# API Documentation: http://localhost:8000/docs
```

## 📚 Documentation

This project has comprehensive documentation organized in the `docs/` folder:

### 🚀 Getting Started
- **[📖 Complete Documentation Guide](docs/DOCUMENTATION.md)** - Start here for full overview
- **[🐳 Docker Setup Guide](docs/DOCKER.md)** - Docker configuration and deployment
- **[🔧 Development Setup](docs/DEVELOPMENT_SETUP.md)** - Development environment setup

### 🧪 Testing & Quality
- **[🧪 Testing Guide](docs/TESTING_GUIDE.md)** - Complete testing overview
- **[🐳 Docker Test Commands](docs/testing/DOCKER_TEST_COMMANDS.md)** - Docker testing reference
- **[📊 Comprehensive Test Report](docs/COMPREHENSIVE_TEST_REPORT.md)** - Full test analysis and results
- **[⚡ Quick Test Guide](docs/QUICK_TEST_GUIDE.md)** - Quick testing reference

### 🎭 End-to-End Testing
- **[🎭 E2E Testing Guide](docs/E2E_TESTING.md)** - Playwright E2E testing setup
- **[🎪 Playwright Setup Summary](docs/PLAYWRIGHT_SETUP_SUMMARY.md)** - Playwright configuration

### 🔧 Advanced Topics
- **[🚀 CI/CD Pipeline](docs/CICD_PIPELINE.md)** - Continuous integration setup
- **[🔧 CI/CD Setup Guide](docs/CI_CD_SETUP.md)** - CI/CD configuration
- **[🌐 CORS Configuration](docs/CORS.md)** - CORS handling and API routing
- **[🐛 Troubleshooting](docs/TROUBLESHOOTING.md)** - Common issues and solutions

### 📋 Project Management
- **[📋 Product Requirements](docs/PRD.md)** - Product requirements document
- **[🤝 Contributing Guide](docs/TESTING_CONTRIBUTING.md)** - How to contribute
- **[🎯 Testing Best Practices](docs/TESTING_BEST_PRACTICES.md)** - Testing guidelines

## 🏗️ Architecture Overview

### Technology Stack
- **Frontend**: Vue.js 3 + Composition API, Tailwind CSS, Vite
- **Backend**: FastAPI with Python 3.10+, SQLAlchemy ORM
- **Database**: PostgreSQL 15
- **Reverse Proxy**: Nginx (eliminates CORS)
- **Containerization**: Docker & Docker Compose

### Service Architecture
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │     Nginx        │    │    Backend      │
│   (Vue.js)      │────│   Reverse Proxy  │────│   (FastAPI)     │
│   Port: 8080    │    │   Port: 8080     │    │   Port: 8000    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                      │
                                              ┌─────────────────┐
                                              │   PostgreSQL     │
                                              │   Port: 5432     │
                                              └─────────────────┘
```

## 🎯 Key Features

- **📅 Calendar View** - Custom calendar using Dayjs for intuitive task scheduling
- **📊 Multiple Views** - Calendar, table, and list views for task management
- **🎨 Modern UI** - Responsive design with Tailwind CSS and FontAwesome icons
- **🚀 Full-Stack** - Vue.js 3 frontend with FastAPI backend
- **🐳 Containerized** - Docker-based deployment with all services
- **🔗 CORS-Free** - Nginx reverse proxy eliminates cross-origin issues
- **📱 Mobile Responsive** - Optimized for desktop and mobile devices

## 🧪 Testing Overview

This project includes comprehensive testing:

- **56 Backend Tests** with 97% coverage
- **Frontend Unit Tests** with Vitest
- **E2E Tests** with Playwright
- **Performance Tests** with Locust
- **Separate Development/Production Containers**

### Quick Test Commands

```bash
# Development Environment (with testing tools)
./scripts/run-dev-tests.sh setup          # Start dev environment
./scripts/run-dev-tests.sh backend       # Run backend tests
./scripts/run-dev-tests.sh performance   # Run performance tests

# Production Environment
docker compose -f docker/docker-compose.yaml exec backend python -m pytest  # Run backend tests
```

## 🔗 Useful Links

### Application Access
- **Frontend Application**: http://localhost:8080
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

### Development Tools
- **AI Development Assistant**: See [docs/CLAUDE.md](docs/CLAUDE.md) for AI-guided development
- **Task Management**: See [docs/TASKS.md](docs/TASKS.md) for current development tasks

### External Documentation
- **Vue.js Documentation**: https://vuejs.org/
- **FastAPI Documentation**: https://fastapi.tiangolo.com/
- **Tailwind CSS**: https://tailwindcss.com/
- **Docker Documentation**: https://docs.docker.com/

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

**💡 Tip**: Start with the [Complete Documentation Guide](docs/DOCUMENTATION.md) for a comprehensive overview of the project structure, setup, and features.