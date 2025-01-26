FROM node:20-alpine

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

# 開発用サーバーを起動
CMD ["npm", "start"]