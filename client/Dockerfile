# syntax=docker/dockerfile:1
ARG NODE_VERSION=20-alpine
ARG NGINX_VERSION=1.25-alpine

# ----- Build stage -----
FROM node:${NODE_VERSION} AS builder
WORKDIR /app

# Accept build argument for base URL
ARG VITE_BASE_URL=http://127.0.0.1:8080/

# Install dependencies and build
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci
COPY . .

# Create .env file with the build argument
RUN echo "VITE_BASE_URL=${VITE_BASE_URL}" > .env

RUN npm run build

# ----- Serve stage -----
FROM nginxinc/nginx-unprivileged:${NGINX_VERSION} AS runner
USER nginx
COPY nginx.conf /etc/nginx/nginx.conf
# Copy the build output to nginx's html directory
COPY --chown=nginx:nginx --from=builder /app/dist /usr/share/nginx/html
EXPOSE 8080
ENTRYPOINT ["nginx", "-c", "/etc/nginx/nginx.conf"]
CMD ["-g", "daemon off;"]
