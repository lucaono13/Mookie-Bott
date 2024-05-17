FROM node:20
LABEL org.opencontainers.image.source="https://github.com/dctaylor/mookiebot"

# Create app directory
WORKDIR /app

# ENV Variables
ENV CLIENT_ID 0
ENV CLIENT_TOKEN 0
ENV MONGODB_URL="mongodb://"
ENV MUSIC_DB=music
ENV MUSIC_COLLECTION=music
ENV SERVER_ID=
ENV MUSIC_CHANNEL_NAME=music
ENV TZ="America/Los_Angeles"

# Copy package.json and package-lock.json
COPY package*.json ./
COPY yarn*.lock ./

RUN yarn set version berry
# Install packages
RUN yarn install

# Copy the app code
COPY . .

RUN yarn install

# Build the project
RUN yarn run build

# RUN yarn run commands:register

# Expose ports
EXPOSE 3001

# Run the application
CMD [ "node", "dist/start-bot.js" ]
