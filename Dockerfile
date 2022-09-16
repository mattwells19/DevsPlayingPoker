FROM node:current-alpine AS build

WORKDIR /usr/app

COPY ./web ./web
COPY ./server ./server

WORKDIR /usr/app/web
RUN npm install && npm run build

FROM denoland/deno:1.25.2 AS run

EXPOSE 1337

COPY --from=build /usr/app/server /usr/app

WORKDIR /usr/app
RUN deno cache deps.ts
RUN deno cache server.ts

CMD ["deno", "run", "--allow-net", "--allow-env", "--allow-read", "server.ts"]