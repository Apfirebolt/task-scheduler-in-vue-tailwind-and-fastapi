# AI Development Workflow for FastAPI + Vue/Tailwind Projects

This repository contains a reusable Claude Code **plugin** that automates
development tasks across full‑stack projects built with FastAPI,
Vue 3, Tailwind CSS, PostgreSQL and Qdrant.  The goal of this plugin
is to provide a consistent workflow that can be applied to any
project sharing this technology stack.  It leverages Claude Code’s
multi‑agent support, Model Context Protocol (MCP) servers and
modern best practices described in the official
documentation【952268146422966†L423-L463】 and in popular community
plugins.

## Why use this plugin?

- **Database‑aware coding** – Before writing any code, the plugin reads
  your live database schema through an MCP server.  This prevents
  hallucinating columns or tables and ensures migrations are accurate.
- **Test‑driven development (TDD)** – Every new feature starts with a
  failing test.  Tests clarify requirements and guard against
  regressions.
- **Docker‑based testing** – The entire test suite is executed in an
  isolated container, ensuring reproducible results across machines.
- **Automated Git management** – Branch creation, commits and pull
  requests are performed by a reviewer agent via the GitHub MCP.
- **Modular architecture** – Each agent and skill has a single
  responsibility, following the principle of granular, single‑purpose
  plugins.  This minimises the amount of
  context loaded and makes the plugin easy to maintain and extend.

## Expected project layout

The plugin assumes your project follows a three‑tier architecture:

- **Backend**: FastAPI application with asynchronous endpoints,
  Pydantic models and SQLAlchemy for database interaction.  Migrations
  are managed via Alembic.
- **Frontend**: Vue 3 application built with Vite, using the
  Composition API, Pinia for state management and Tailwind CSS for
  styling.  API calls are made to relative paths (e.g. `/api/tasks`),
  and Nginx proxies these calls to the backend to avoid CORS issues.
- **Database**: PostgreSQL, started via Docker Compose.  A vector
  database (Qdrant) may also be included for semantic search.

This structure mirrors the example described in the project
documentation.  If your project differs slightly (e.g. file names or
service names), the agents should adapt, but you may need to update
the paths referenced in tests and code.

## Workflow overview

1. **Schema inspection** – When you request a new feature, the
   `@coder` agent first examines the current database.  It uses the
   `db:list_tables` and `db:get_table_schema` MCP calls to list tables
   and view the schema of specific tables.  This ensures any code
   changes align with the real database state.

2. **Write a failing test** – The `@test‑automator` agent writes a
   test that captures the desired behaviour.  Backend tests live in
   `backend/tests/` and use Pytest; frontend tests live in
   `frontend/tests/` and may use Vitest or Playwright.  The test
   should fail until the feature is implemented.

3. **Implement the feature** – The `@coder` agent modifies the
   backend and/or frontend code to satisfy the test.  On the backend,
   update SQLAlchemy models, Pydantic schemas, routes and services.
   On the frontend, adjust Vue components, Pinia stores and API calls.
   Always use Tailwind classes for styling and follow existing
   conventions.  Do not run the tests yourself; leave that to the
   reviewer.

4. **Run tests and review** – The `@reviewer` agent executes the
   entire test suite using the Docker MCP.  If tests fail, the agent
   retrieves logs and reports the errors.  If they pass, it creates
   a new Git branch, commits the changes, pushes the branch and opens
   a pull request.  The reviewer does not write code—it only runs
   tests and manages Git operations.

5. **Document** – After the PR is created, the `@documenter` agent
   updates the project documentation (README, API docs, migration
   notes) to reflect the changes.

## Best practices and guidelines

- **Follow the standard plugin layout.**  A Claude Code plugin must
  include `agents/`, `skills/`, `hooks/` and `.mcp.json` at the
  plugin root; these should not be nested inside `.claude-plugin/`
  directories【952268146422966†L423-L463】.  All paths in the plugin
  should be relative, not absolute, to avoid portability issues
 【952268146422966†L460-L463】.
- **Keep agents single‑purpose.**  Community plugins emphasise small,
  focused agents and skills to minimise token usage and make tasks
  composable.  Resist the temptation to put
  all guidance into one agent; instead, extract reusable knowledge
  into skills.
- **Use environment variables for secrets.**  The MCP server
  definitions in `.mcp.json` reference environment variables (such as
  `GITHUB_TOKEN` and `DB_URL`) rather than hard‑coding credentials.
  This aligns with the plugin reference’s recommendation to avoid
  absolute paths and embed dynamic values via variables【952268146422966†L460-L463】.
- **Test in isolation.**  Run tests inside Docker containers.  To
  build and start services, run `docker compose -f docker/docker-compose.yaml up --build`.
  View logs with `docker compose -f docker/docker-compose.yaml logs -f` and stop
  services with `docker compose -f docker/docker-compose.yaml down`.  These
  commands ensure a clean environment.
- **Document everything.**  After implementing a feature, update
  relevant documentation files.  Clear documentation helps other
  developers understand your changes and is part of the plugin’s
  workflow.

For more details on plugin development, refer to the official Claude
Code plugin documentation【952268146422966†L423-L463】 and the
community repository that demonstrates modular, single‑purpose plugins.
