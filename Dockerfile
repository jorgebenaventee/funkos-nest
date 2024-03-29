
FROM node:16-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run test
RUN npm run build
RUN npm prune --production


FROM node:16-alpine AS run

WORKDIR /app
COPY --from=build /app/node_modules/ /app/node_modules/
COPY --from=build /app/dist/ /app/dist/
COPY --from=build /app/cert /app/
COPY package*.json /app/
EXPOSE 3000
ENTRYPOINT ["npm", "run", "start:prod"]