# Documentation Organization

## Overview

This project uses a centralized documentation structure with all guides organized in the `docs/` folder. The documentation has been consolidated to eliminate redundancy and provide clear navigation paths.

## 📚 Documentation Structure

### 📘 Main Documentation Hub
**[DOCUMENTATION.md](./DOCUMENTATION.md)** - **START HERE**
- **Purpose**: Central entry point for all documentation
- **Contains**: Complete table of contents, getting started, architecture overview, troubleshooting, and links to detailed guides
- **Read this if**: You're new to the project or need to navigate to specific topics

### 🧪 Testing & Quality Assurance
**[testing/TESTING_GUIDE.md](./testing/TESTING_GUIDE.md)** - **COMPREHENSIVE TESTING**
- **Purpose**: Single comprehensive source for all testing documentation
- **Contains**: Docker-based testing, frontend testing, backend testing, E2E testing, coverage requirements
- **Read this if**: You need to understand or run any tests (all testing is Docker-based)

**Other testing docs**:
- **[testing/TESTING_BEST_PRACTICES.md](./testing/TESTING_BEST_PRACTICES.md)** - Testing guidelines and standards
- **[testing/TESTING_CONTRIBUTING.md](./testing/TESTING_CONTRIBUTING.md)** - How to contribute to testing
- **[testing/E2E_TESTING.md](./testing/E2E_TESTING.md)** - End-to-end testing with Playwright
- **[testing/PLAYWRIGHT_SETUP_SUMMARY.md](./testing/PLAYWRIGHT_SETUP_SUMMARY.md)** - Playwright configuration

### 🚀 Deployment & Infrastructure
**[deployment/DOCKER.md](./deployment/DOCKER.md)** - **DOCKER DEPLOYMENT**
- **Purpose**: Complete Docker configuration and deployment guide
- **Contains**: Docker architecture, Dockerfiles, docker compose setup, commands, troubleshooting
- **Read this for**: Understanding Docker setup, deployment, and container configuration

**[deployment/CICD_PIPELINE.md](./deployment/CICD_PIPELINE.md)** - **CI/CD AUTOMATION**
- **Purpose**: Continuous integration and deployment setup
- **Contains**: GitHub Actions workflows, deployment pipeline, automated testing
- **Read this for**: Understanding CI/CD configuration and deployment automation

**[deployment/CI_CD_SETUP.md](./deployment/CI_CD_SETUP.md)** - **CI/CD CONFIGURATION**
- **Purpose**: Detailed CI/CD configuration instructions
- **Contains**: Setup steps, configuration files, troubleshooting
- **Read this for**: Setting up CI/CD from scratch

### 🔄 Core Architecture
**[CORS.md](./CORS.md)** - **CORS & API REVERSE PROXY**
- **Purpose**: CORS solution and API reverse proxy documentation
- **Contains**: CORS problem explanation, Nginx proxy setup, API routing, request flow diagrams
- **Read this for**: Understanding how CORS issues are avoided and how the API is configured

### 🛠️ Development Environment
**[development/DEVELOPMENT_SETUP.md](./development/DEVELOPMENT_SETUP.md)** - **DEVELOPMENT SETUP**
- **Purpose**: Development environment configuration
- **Contains**: Local development setup, tools, debugging
- **Read this for**: Setting up your development environment

### 🐛 Troubleshooting & Fixes
**[troubleshooting/TROUBLESHOOTING.md](./troubleshooting/TROUBLESHOOTING.md)** - **TROUBLESHOOTING**
- **Purpose**: Common issues and solutions
- **Contains**: Troubleshooting guide for Docker, database, API, and frontend issues
- **Read this for**: Resolving common problems

**[troubleshooting/307_REDIRECT_FIX.md](./troubleshooting/307_REDIRECT_FIX.md)** - **HISTORICAL FIXES**
- **Purpose**: HTTP 307 redirect issue resolution
- **Contains**: Specific fix documentation for redirect issues
- **Read this for**: Understanding resolved technical issues

### 📋 Project Management
**[project/PRD.md](./project/PRD.md)** - **PRODUCT REQUIREMENTS**
- **Purpose**: Product requirements document
- **Contains**: Project requirements, features, user stories
- **Read this for**: Understanding project scope and requirements

**[project/TASKS.md](./project/TASKS.md)** - **DEVELOPMENT TASKS**
- **Purpose**: Development task tracking
- **Contains**: Current development tasks, progress tracking
- **Read this for**: Understanding current development work

### 🤖 External Tools
**[../CLAUDE.md](../CLAUDE.md)** - **AI ASSISTANT**
- **Purpose**: AI assistant development guidelines (project root)
- **Contains**: Claude Code AI development instructions and common commands
- **Read this for**: AI-assisted development workflow

### 📋 Documentation Navigation
**[DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md)** - **COMPLETE INDEX**
- **Purpose**: Complete index of all documentation
- **Contains**: Categorized list of all docs with descriptions
- **Read this for**: Finding specific documentation quickly

## 🎯 Quick Navigation

### I want to...

| Goal | Read This |
|------|-----------|
| **Get started quickly** | README.md → Quick Start |
| **Understand the project** | DOCUMENTATION.md |
| **Run tests** | testing/TESTING_GUIDE.md (all testing is Docker-based) |
| **Deploy with Docker** | deployment/DOCKER.md |
| **Set up CI/CD** | deployment/CICD_PIPELINE.md |
| **Fix CORS/API issues** | CORS.md |
| **Troubleshoot problems** | troubleshooting/TROUBLESHOOTING.md |
| **Set up for development** | development/DEVELOPMENT_SETUP.md |
| **Deploy to production** | deployment/DOCKER.md + deployment/CICD_PIPELINE.md |
| **Find specific documentation** | DOCUMENTATION_INDEX.md |

## 📁 Organized File Structure

```
project-root/
├── README.md                 # Quick start and overview
├── CLAUDE.md                 # AI assistant guidelines
└── docs/                     # All documentation here
    ├── README.md             # This file - documentation overview
    ├── DOCUMENTATION.md      # Main hub - START HERE
    ├── DOCUMENTATION_INDEX.md # Complete index of all docs
    ├── CORS.md               # Core architecture - CORS & API
    ├── testing/              # 🧪 All testing documentation
    │   ├── TESTING_GUIDE.md  # Comprehensive testing guide
    │   ├── TESTING_BEST_PRACTICES.md
    │   ├── TESTING_CONTRIBUTING.md
    │   ├── E2E_TESTING.md
    │   └── PLAYWRIGHT_SETUP_SUMMARY.md
    ├── deployment/           # 🚀 Docker & CI/CD
    │   ├── DOCKER.md
    │   ├── CICD_PIPELINE.md
    │   └── CI_CD_SETUP.md
    ├── development/          # 🛠️ Development environment
    │   └── DEVELOPMENT_SETUP.md
    ├── project/              # 📋 Project management
    │   ├── PRD.md
    │   └── TASKS.md
    └── troubleshooting/      # 🐛 Issues & fixes
        ├── TROUBLESHOOTING.md
        └── 307_REDIRECT_FIX.md
```

## 🎯 Key Documentation Paths

### For Testing (All Docker-based)
**Path**: testing/TESTING_GUIDE.md → [Docker Testing Environment](./testing/TESTING_GUIDE.md#docker-testing-environment)
**Primary Commands**:
```bash
docker compose -f docker/docker-compose.test.yaml up -d --build
docker compose exec test-frontend npm test
docker compose exec test-backend python -m pytest tests/ -v
```

### For Development Setup
**Path**: development/DEVELOPMENT_SETUP.md → [Local Development](./development/DEVELOPMENT_SETUP.md#local-development)
**Alternative**: Use Docker compose as specified in CLAUDE.md

### For Production Deployment
**Path**: deployment/DOCKER.md → [Production Deployment](./deployment/DOCKER.md#production-considerations) + deployment/CICD_PIPELINE.md

### For CI/CD Configuration
**Path**: deployment/CICD_PIPELINE.md → [Pipeline Setup](./deployment/CICD_PIPELINE.md#pipeline-setup) + deployment/CI_CD_SETUP.md

### For Troubleshooting
**Path**: troubleshooting/TROUBLESHOOTING.md → [Common Issues](./troubleshooting/TROUBLESHOOTING.md#common-issues)

## What Each File Covers

### DOCUMENTATION.md
- Getting started
- System architecture
- Quick start commands
- Docker deployment overview
- CORS & API overview
- Development guide
- Troubleshooting
- Technology stack
- Additional resources

### DOCKER.md
- Docker architecture details
- Configuration files (backend/config.py, docker compose.yaml, etc.)
- Backend Dockerfile explanation
- Frontend Dockerfile explanation
- Nginx configuration
- Docker Compose services
- Common commands
- Database persistence
- Production considerations
- Security best practices
- Detailed troubleshooting

### CORS.md
- CORS problem explanation
- Nginx reverse proxy solution
- Request flow diagrams
- Frontend configuration (axios setup)
- Files modified for CORS fix
- API endpoint examples (before/after)
- Benefits of reverse proxy approach
- Testing instructions
- Detailed troubleshooting
- Production deployment notes

## 📋 Documentation Principles

1. **Central Hub**: DOCUMENTATION.md is the main entry point
2. **Consolidated Structure**: Each topic has one comprehensive source (no redundancy)
3. **Cross-Referenced**: Documents link to each other when relevant
4. **Complete Coverage**: All aspects of the project are documented
5. **Docker-First Testing**: All testing documentation emphasizes Docker-based execution
6. **Easy Navigation**: Clear paths to find information with quick navigation tables
7. **Practical Examples**: Code snippets and commands included
8. **Visual Aids**: Architecture diagrams and flow charts where helpful

## 🆘 Getting Help

1. **Start with**: README.md for quick overview
2. **Go to**: DOCUMENTATION.md for complete navigation
3. **For Testing**: TESTING_GUIDE.md for all testing-related questions
4. **Refer to**: Specific guide for detailed information
5. **Search with**: Ctrl+F to find specific topics within documents
6. **Check Index**: DOCUMENTATION_INDEX.md for categorized documentation listing

## 🔄 Updates and Maintenance

All documentation is maintained in the `docs/` folder. When making changes:

1. Update the relevant documentation file(s)
2. Ensure cross-references are still accurate
3. Update DOCUMENTATION.md if adding new sections
4. Update DOCUMENTATION_INDEX.md when adding/removing docs
5. Keep README.md in sync with major changes
6. Maintain the consolidation principle - avoid creating redundant documentation

## 📚 Documentation History

- **October 27, 2025**: Major documentation consolidation and folder organization
  - Created comprehensive TESTING_GUIDE.md consolidating all testing documentation
  - Organized all documentation into logical folders: testing/, deployment/, development/, project/, troubleshooting/
  - Updated DOCUMENTATION_INDEX.md to reflect new folder structure
  - Updated docs/README.md with organized navigation and file structure
  - Removed redundant files: TESTING.md, DOCKER_TEST_COMMANDS.md, QUICK_TEST_GUIDE.md, TEST_RESULTS.md, COMPREHENSIVE_TEST_REPORT.md
  - Removed redundant root-level files: TODO.md, TEST_IMPLEMENTATION_PROGRESS.md, DOCKER_TEST_IMPLEMENTATION_COMPLETE.md
  - Implemented hierarchical folder structure for better organization
  - Reduced root-level clutter from 17 files to 4 core documents

- **October 19, 2025**: Initial documentation consolidation into docs/ folder
  - Created DOCUMENTATION.md as main hub
  - Moved Docker content to DOCKER.md
  - Moved CORS content to CORS.md
  - Updated README.md with links to docs
  - Removed redundant root-level markdown files

---

**For the complete guide, start with [DOCUMENTATION.md](./DOCUMENTATION.md)**
