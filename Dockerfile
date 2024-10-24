FROM node

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package.json ./
RUN npm install

# Bundle app source
COPY . .

# Expose the port the app runs in
EXPOSE 8000

# Run the app
CMD ["npm", "start"]