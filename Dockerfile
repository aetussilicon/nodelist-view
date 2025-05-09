FROM node:22.15.0-alpine

WORKDIR /app

# Copy package.json and yarn.lock first for better caching
COPY package.json yarn.lock* ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Build the application
RUN yarn build

# Instalar um servidor HTTP leve para servir a aplicação
RUN yarn global add serve

# Expose the port the app will run on (serve usa 3000 por padrão)
EXPOSE 3000

# Command to serve the built application
CMD ["serve", "-s", "dist", "-l", "3000"]