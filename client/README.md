# Vue 3 + Vite

This template should help get you started developing with Vue 3 in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

## Environment Configuration

The application uses environment variables to configure the base URL. 

### Local Development

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update the `VITE_BASE_URL` in `.env` as needed (ensure it ends with a trailing slash `/`):
   ```
   VITE_BASE_URL=http://127.0.0.1:8080/
   ```

### Docker Build

The base URL is configured via build arguments in `docker compose.yaml`. To change it, update the `VITE_BASE_URL` argument in the frontend service:

```yaml
frontend:
  build:
    args:
      VITE_BASE_URL: "http://your-domain:8080/"
```

**Important**: Always ensure the `VITE_BASE_URL` ends with a trailing slash (`/`).

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin).

