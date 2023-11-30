ARG ARCH=
# FROM node:20-alpine
FROM ${ARCH}node:20-alpine

# Create app directory
WORKDIR /app

# Copy over source code
COPY . .

# Install dependencies
RUN npm install

# Build app
RUN npm run build

# Expose port 3000
EXPOSE 3000

# Start app
CMD ["node", "build"]