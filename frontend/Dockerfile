FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 4173

CMD ["npm", "run", "dev", "--", "--host"]
