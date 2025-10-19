# Documentation Organization

## Overview

This project uses a centralized documentation structure with all guides organized in the `docs/` folder.

## Documentation Files

### 📘 Main Documentation Hub
**[DOCUMENTATION.md](./DOCUMENTATION.md)**
- **Purpose**: Central entry point for all documentation
- **Contains**: Table of contents, getting started, architecture overview, troubleshooting, and links to detailed guides
- **Start here if**: You're new to the project or need to navigate to specific topics

### 🐳 Docker Guide
**[DOCKER.md](./DOCKER.md)**
- **Purpose**: Complete Docker configuration and deployment guide
- **Contains**: Docker architecture, Dockerfiles, docker-compose setup, commands, troubleshooting
- **Read this for**: Understanding Docker setup, deployment, and container configuration

### 🔄 CORS & API Guide
**[CORS.md](./CORS.md)**
- **Purpose**: CORS solution and API reverse proxy documentation
- **Contains**: CORS problem explanation, Nginx proxy setup, API routing, request flow diagrams
- **Read this for**: Understanding how CORS issues are avoided and how the API is configured

## Quick Navigation

### I want to...

| Goal | Read This |
|------|-----------|
| Get started quickly | README.md → Quick Start |
| Understand the project | DOCUMENTATION.md |
| Deploy with Docker | DOCKER.md |
| Fix CORS/API issues | CORS.md |
| Troubleshoot problems | DOCUMENTATION.md → Troubleshooting, then specific guide |
| Set up for development | DOCUMENTATION.md → Development Guide |
| Deploy to production | DOCKER.md & CORS.md → Production sections |

## File Locations

```
project-root/
├── README.md                 # Quick start and overview
└── docs/                     # All documentation here
    ├── DOCUMENTATION.md      # Main hub - START HERE
    ├── DOCKER.md            # Docker guide
    ├── CORS.md              # CORS & API guide
    └── README.md            # This file
```

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
- Configuration files (backend/config.py, docker-compose.yaml, etc.)
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

## Documentation Principles

1. **Central Hub**: DOCUMENTATION.md is the main entry point
2. **Cross-Referenced**: Documents link to each other when relevant
3. **Complete Coverage**: All aspects of the project are documented
4. **No Duplication**: Each topic covered in one place
5. **Easy Navigation**: Clear paths to find information
6. **Practical Examples**: Code snippets and commands included
7. **Visual Aids**: Architecture diagrams and flow charts

## Getting Help

1. **Start with**: README.md for quick overview
2. **Go to**: DOCUMENTATION.md for complete navigation
3. **Refer to**: Specific guide (DOCKER.md or CORS.md) for details
4. **Search with**: Ctrl+F to find specific topics within documents

## Updates and Maintenance

All documentation is maintained in the `docs/` folder. When making changes:

1. Update the relevant documentation file(s)
2. Ensure cross-references are still accurate
3. Update DOCUMENTATION.md if adding new sections
4. Keep README.md in sync with major changes

## Documentation History

- **October 19, 2025**: Documentation consolidated into docs/ folder
  - Created DOCUMENTATION.md as main hub
  - Moved Docker content to DOCKER.md
  - Moved CORS content to CORS.md
  - Updated README.md with links to docs
  - Removed redundant root-level markdown files

---

**For the complete guide, start with [DOCUMENTATION.md](./DOCUMENTATION.md)**
