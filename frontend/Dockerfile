# Step 1: Build stage
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Step 2: Serve stage
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80 for serving HTTP
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
