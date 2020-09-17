FROM node:buster as build

WORKDIR /

RUN git clone https://github.com/TheodoreKrypton/javscript.git && \
  cd /javscript && git submodule update --init --remote --recursive && \
  cd /javscript/frontend/ && npm install && npm run build && \
  cd /javscript && npm install && npm run build

FROM debian:buster-slim

COPY --from=build /javscript/build/javscript-linux .

CMD ["./javscript-linux"]
