FROM node:current-alpine AS build

WORKDIR /usr/app

COPY ./web ./web
COPY ./server ./server

WORKDIR /usr/app/web
RUN npm install && npm run build

FROM denoland/deno:1.30.3 AS run

EXPOSE 5555

COPY --from=build /usr/app/server /usr/app

WORKDIR /usr/app
RUN deno cache server.ts

CMD ["deno", "task", "run:deploy"]