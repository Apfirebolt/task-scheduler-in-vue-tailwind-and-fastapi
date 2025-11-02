# Copilot Instructions for Task Scheduler (Vue, Tailwind, FastAPI)

## Big Picture Architecture
- **Monorepo** with two main components:
  - `backend/`: FastAPI app (Python) for API, business logic, and DB access
  - `client/`: Vue 3 SPA (JavaScript) for UI, built with Vite and styled with TailwindCSS
- **Database**: PostgreSQL, managed via SQLAlchemy and Alembic migrations
- **API**: RESTful endpoints for tasks, user management, and notifications
- **Frontend**: Custom calendar and Kanban board using Dayjs, Vue Router, and reusable components

## Developer Workflows
- **Backend**
  - Start server: `python main.py` or `uvicorn main:app --reload`
  - Install dependencies: `pip install -r requirements.txt`
  - Run Alembic migrations: `alembic upgrade head`
- **Frontend**
  - Install dependencies: `cd client && npm install`
  - Start dev server: `npm run dev` (default port: 8080)
  - Build for production: `npm run build` (output in `client/dist/`)
- **Integration**
  - CORS enabled for `localhost:8080` and `localhost:3000` (see `main.py`)
  - API endpoints mounted under `/` and `/docs` (Swagger UI)

## Project-Specific Patterns
- **Backend**
  - Routers are defined in `backend/tasks/router.py` and included in `main.py`
  - Models: SQLAlchemy (`backend/tasks/model.py`), Schemas: Pydantic (`backend/tasks/schema.py`)
  - Services layer for business logic (`backend/tasks/services.py`)
  - Notifications via FastAPI `BackgroundTasks` (see `main.py`)
- **Frontend**
  - Pages in `client/src/pages/`, components in `client/src/components/`
  - Routing in `client/src/routes.js`
  - State and API calls handled in page components (no global store by default)
  - Calendar and Kanban logic use Dayjs and custom drag-and-drop
- **Docker**
  - docker compose has no version parameter (deprecated)

## Integration Points & External Dependencies
- **Alembic**: DB migrations in `alembic/versions/`
- **TailwindCSS**: Config in `client/tailwind.config.js`, styles in `client/src/index.css`
- **Vite**: Config in `client/vite.config.js`, enables fast HMR and build
- **Dayjs**: Used for date manipulation in calendar views
- **Axios**: Used for API calls from frontend

## Key Files & Directories
- `main.py`: FastAPI app entrypoint, CORS, router mounting
- `backend/tasks/`: All backend logic for tasks
- `client/src/pages/`: Main UI views
- `client/src/components/`: Reusable UI components
- `alembic/`: DB migration scripts
- `requirements.txt` & `client/package.json`: Dependency manifests

## Example Patterns
- Add new API route: create in `backend/tasks/router.py`, import in `main.py`
- Add new frontend page: create in `client/src/pages/`, add route in `client/src/routes.js`
- Update DB schema: edit model in `backend/tasks/model.py`, generate Alembic migration