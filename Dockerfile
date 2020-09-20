FROM node:buster as build

COPY . /javscript

RUN cd /javscript && npm install && npm install -g pkg && npm run build

FROM debian:buster-slim

COPY --from=build /javscript/build/javpy-linux .

CMD ["./javpy-linux"]
