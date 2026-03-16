FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy the frontend files (The UI)
COPY ../index.html ./public/
COPY ../gate.css ./public/
COPY ../manifest.json ./public/
COPY ../sw.js ./public/
COPY ../flagship.js ./public/
COPY ../js/ ./public/js/

# Copy the backend files (The Local Substrate Proxy)
COPY package.json .
COPY local-worker.js .

# Install dependencies for the local proxy
RUN npm install

# Expose the local substrate port
EXPOSE 8080

# Start the local substrate proxy
CMD ["node", "local-worker.js"]
