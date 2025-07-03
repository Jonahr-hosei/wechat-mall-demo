FROM node:18-bullseye

WORKDIR /app

COPY package*.json ./
RUN apt-get update && apt-get install -y ca-certificates
RUN npm install --only=production

COPY . .

CMD ["node", "server.js"] 