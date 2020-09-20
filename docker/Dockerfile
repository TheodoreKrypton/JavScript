FROM node:buster as build

COPY . /javscript

RUN cd /javscript && npm install --only=prod && npm run build

FROM debian:buster-slim

COPY --from=build /javscript/build/javscript-linux .

CMD ["./javscript-linux"]
