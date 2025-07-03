FROM tencentyun/cloudbase-node:18

WORKDIR /app

COPY package*.json ./
RUN npm install --only=production

COPY . .

CMD ["node", "server.js"] 