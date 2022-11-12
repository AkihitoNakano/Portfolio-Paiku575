FROM node:16
WORKDIR /app
COPY package.json .

ARG NODE_ENV
RUN npm install --only=production

COPY . ./
ENV PORT 8080
EXPOSE $PORT
ENV HOST 0.0.0.0

CMD ["node", "src/server.js"]