# dev 
FROM node:18-slim as dev

# Create dir for app and node_modules and give perm to user node
RUN mkdir -p /api/node_modules && chown -R node:node /api
WORKDIR /api

COPY package*.json ./

RUN npm install

COPY --chown=node:node . .

EXPOSE 4000

CMD [ "npm", "run", "dev" ]
