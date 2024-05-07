FROM node:lts-slim

WORKDIR /var/olgitbridge/
RUN apt-get update && apt-get upgrade -y && apt-get install --no-install-recommends git ca-certificates -y && apt-get clean
RUN git config --global user.email "overleaf@smeets.ee" && git config --global user.name "Overleaf"
COPY . .
RUN npm install

EXPOSE 5000
ENTRYPOINT [ "node", "src/server.js" ]

