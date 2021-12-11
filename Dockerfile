#docker run -v /home/nick/NFT/nft-minter-tutorial/minter-starter-files/build/:/app/public -d -p5000:5000 nft-site
FROM node:alpine
WORKDIR /app
COPY package.json.server /app/package.json
COPY server.js /app/server.js
RUN npm i
#COPY ./ ./
CMD ["node", "server.js"]
