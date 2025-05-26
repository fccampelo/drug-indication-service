# Use Node.js 20 Alpine as base image
FROM node:20-alpine AS base

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package*.json ./

RUN npm install --omit=dev --ignore-scripts && npm cache clean --force

FROM node:20-alpine AS development 

WORKDIR /app

COPY . .

RUN npm install

EXPOSE 3000

CMD ["npm", "run", "dev"]
