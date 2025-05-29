FROM node:lts-slim

WORKDIR /var/olgitbridge/
RUN echo "path-exclude=/usr/share/man/*" > /etc/dpkg/dpkg.cfg.d/01_nodocs && \
    echo "path-exclude=/usr/share/doc/*" >> /etc/dpkg/dpkg.cfg.d/01_nodocs && \
    echo "path-exclude=/usr/share/info/*" >> /etc/dpkg/dpkg.cfg.d/01_nodocs && \
    apt-get update && \
    apt-mark install git ca-certificates && \
    apt-get dselect-upgrade -y --no-install-recommends && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* && \
    rm /etc/dpkg/dpkg.cfg.d/01_nodocs
RUN git config --global user.name "Overleaf" && \
    git config --global user.email "overleaf@smeets.ee"
COPY . .
RUN npm install

EXPOSE 5000
ENTRYPOINT [ "node", "src/server.js" ]

