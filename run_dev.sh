#!/bin/bash

# 開発環境用の起動スクリプト

# 環境変数を設定
export RUST_LOG=info

# ノードサーバーをバックグラウンドで起動
echo "ノードサーバーを起動中..."
cd "$(dirname "$0")"
cargo run &
NODE_PID=$!

# ノードサーバーが起動するまで少し待機
sleep 2

# Webサーバーを起動
echo "Webサーバーを起動中..."
cd "$(dirname "$0")/web"
node server.js &
WEB_PID=$!

# 終了時の処理
function cleanup {
    echo "アプリケーションを終了中..."
    kill $NODE_PID
    kill $WEB_PID
    exit 0
}

# Ctrl+Cで終了時にクリーンアップ
trap cleanup INT

echo "HyperFlux.io 開発サーバーが起動しました"
echo "ブラウザで http://localhost:54867 にアクセスしてください"
echo "終了するには Ctrl+C を押してください"

# プロセスが終了するまで待機
wait