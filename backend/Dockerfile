# Node.js runtime
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install Python3 and pip for agent scripts
RUN apk add --no-cache python3 py3-pip

# Copy agent requirements and install
COPY agent/requirements.txt /tmp/agent-requirements.txt
RUN pip3 install --no-cache-dir -r /tmp/agent-requirements.txt || echo "No agent requirements or install failed"

# Install Node dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Expose port
EXPOSE 3001

# Start server
CMD ["npm", "start"]
