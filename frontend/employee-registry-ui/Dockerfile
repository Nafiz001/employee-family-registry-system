# Build Stage
FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies, ensuring legacy peers are respected for Tailwind CSS compatibility
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Copy everything and build the React Vite application
COPY . .
RUN npm run build

# Serving Stage
FROM nginx:alpine
# Copy custom Nginx configuration to proxy /api requests to backend
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled dist folder to Nginx's serve directory
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
