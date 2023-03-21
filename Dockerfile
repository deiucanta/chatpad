# Build the react project
FROM node:18-alpine as builder
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Install the node_modules first
COPY package*.json ./
RUN npm ci

# Copy the rest of the files
COPY . .

# Build the react application
RUN npm run build

# Runner image
FROM nginx:1.23.3-alpine

# Copy the nginx configuration
COPY ./docker/default.conf.template /etc/nginx/templates/default.conf.template

# Copy the built react application to the nginx folder
COPY --from=builder /app/dist /usr/share/nginx/html

# Required NGINX env variables
ENV NGINX_ENVSUBST_OUTPUT_DIR=/etc/nginx/conf.d

# Default env variables
ENV PORT=80
ENV HOST=0.0.0.0
