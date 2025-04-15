# Use an official Node.js runtime as the base image
FROM node:20

# Install pnpm globally
RUN npm install -g pnpm

# Set the working directory in the container
WORKDIR /app

# Copy package.json and pnpm-lock.yaml to install dependencies
COPY package.json pnpm-lock.yaml* ./

# Install dependencies (including devDependencies for build)
RUN pnpm install

# Copy the rest of the application code
COPY . .

# Compile TypeScript to JavaScript
RUN pnpm run build

# Expose the port the app runs on
EXPOSE 3000

# Command to run the app
CMD ["node", "dist/server.js"]


