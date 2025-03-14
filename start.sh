#!/bin/bash

# 色の定義
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# ロゴを表示
echo -e "${BLUE}"
echo "  _   _                       _____ _            _       "
echo " | | | |_   _ _ __   ___ _ __|  ___| |_   ___  _(_) ___  "
echo " | |_| | | | | '_ \\ / _ \\ '__| |_  | | | | \\ \\/ / |/ _ \\ "
echo " |  _  | |_| | |_) |  __/ |  |  _| | | |_| |>  <| | (_) |"
echo " |_| |_|\\__, | .__/ \\___|_|  |_|   |_|\\__,_/_/\\_\\_|\\___/ "
echo "        |___/|_|                                         "
echo -e "${NC}"

# 既存のプロセスをクリーンアップ
echo -e "${YELLOW}既存のプロセスをクリーンアップしています...${NC}"
pkill -f "cargo run" || true
pkill -f "node server.js" || true

# ノードをバックグラウンドで起動
echo -e "${YELLOW}HyperFlux.ioノードを起動しています...${NC}"
cd /workspace/HyperFlux.io
RUST_LOG=info cargo run > node.log 2>&1 &
NODE_PID=$!

# ノードが起動するまで待機
echo -e "${YELLOW}ノードの起動を待機しています...${NC}"
sleep 5

# ノードが正常に起動したか確認
if ps -p $NODE_PID > /dev/null; then
    echo -e "${GREEN}ノードが正常に起動しました！ (PID: $NODE_PID)${NC}"
else
    echo -e "${RED}ノードの起動に失敗しました。node.logを確認してください。${NC}"
    exit 1
fi

# Webサーバーをバックグラウンドで起動
echo -e "${YELLOW}Webサーバーを起動しています...${NC}"
cd /workspace/HyperFlux.io/web
node server.js > ../web.log 2>&1 &
WEB_PID=$!

# Webサーバーが起動するまで待機
echo -e "${YELLOW}Webサーバーの起動を待機しています...${NC}"
sleep 3

# Webサーバーが正常に起動したか確認
if ps -p $WEB_PID > /dev/null; then
    echo -e "${GREEN}Webサーバーが正常に起動しました！ (PID: $WEB_PID)${NC}"
else
    echo -e "${RED}Webサーバーの起動に失敗しました。web.logを確認してください。${NC}"
    exit 1
fi

# 起動完了メッセージ
echo -e "${GREEN}HyperFlux.ioが正常に起動しました！${NC}"
echo -e "${BLUE}ノードAPI: ${NC}http://localhost:54868"
echo -e "${BLUE}Webインターフェース: ${NC}http://localhost:54867"
echo ""
echo -e "${YELLOW}CLIを起動するには、別のターミナルで以下のコマンドを実行してください:${NC}"
echo -e "  ${GREEN}node cli.js${NC}"
echo ""
echo -e "${YELLOW}ログを確認するには:${NC}"
echo -e "  ${GREEN}tail -f node.log${NC} (ノードログ)"
echo -e "  ${GREEN}tail -f web.log${NC} (Webサーバーログ)"
echo ""
echo -e "${YELLOW}サービスを停止するには:${NC}"
echo -e "  ${GREEN}pkill -f \"cargo run\"${NC} (ノード停止)"
echo -e "  ${GREEN}pkill -f \"node server.js\"${NC} (Webサーバー停止)"
echo ""
echo -e "${BLUE}コマンドラインインターフェースを起動します...${NC}"

# CLIを起動
cd /workspace/HyperFlux.io
node cli.js