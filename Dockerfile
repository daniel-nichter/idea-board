FROM node:0.10

ADD idea-board.tar.gz /root

WORKDIR /root/bundle

RUN cd programs/server && npm install

ENV MONGO_URL mongodb://mongo-ideas:27017/ideas
ENV ROOT_URL http://127.0.0.1
ENV PORT 3000

EXPOSE 3000

CMD ["node", "./main.js"]
