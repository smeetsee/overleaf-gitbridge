FROM node:lts-slim

WORKDIR /var/olgitbridge/
RUN apt-get update && \
    apt-mark install git ca-certificates && \
    apt-get dselect-upgrade -y --no-install-recommends && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*
RUN git config --global user.name "Overleaf" && \
    git config --global user.email "overleaf@smeets.ee"
COPY . .
RUN npm install

EXPOSE 5000
ENTRYPOINT [ "node", "src/server.js" ]

