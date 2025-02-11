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

# 開発用サーバーを起動
CMD ["node", "src/server.js"]
# CMD ["ts-node-dev", "src/server.js"]

# ポート3001番を開放する
EXPOSE 3001