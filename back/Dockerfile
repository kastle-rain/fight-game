# ベースイメージを指定
FROM node:18

# node.js の環境変数を定義する
# 本番環境では production
ENV NODE_ENV=development

# 作業ディレクトリの設定
WORKDIR /usr/src/app

# package.json と package-lock.json をコピー
COPY package*.json ./

# 依存関係をインストール
RUN npm install

# アプリケーションコードをコピー
COPY . .

# wait-for-it.sh スクリプトを追加
COPY wait-for-it.sh /usr/src/app/wait-for-it.sh
RUN chmod +x /usr/src/app/wait-for-it.sh

# PostgreSQLが起動するまで待機してからアプリケーションを起動
CMD ./wait-for-it.sh postgres:5432 -- node src/server.js
# または、開発環境で `ts-node-dev` を使う場合
# CMD ./wait-for-it.sh postgres:5432 -- ts-node-dev src/server.js

# ポート3001番を開放する
EXPOSE 3001
