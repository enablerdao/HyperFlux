FROM node:18-alpine

WORKDIR /app

# パッケージ依存関係をコピー
COPY package*.json ./

# 依存関係をインストール
RUN npm install --no-fund --no-audit --loglevel=error

# アプリケーションのソースをコピー
COPY . .

# ポートを公開
EXPOSE 54867

# アプリケーションを起動
CMD ["node", "server.js"]