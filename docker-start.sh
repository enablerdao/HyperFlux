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

# 引数の解析
ENVIRONMENT="dev"
REBUILD=false

# ヘルプメッセージ
function show_help {
    echo "使用方法: $0 [オプション]"
    echo ""
    echo "オプション:"
    echo "  -e, --env ENV      環境を指定 (dev または prod) [デフォルト: dev]"
    echo "  -r, --rebuild      イメージを再ビルド"
    echo "  -h, --help         このヘルプメッセージを表示"
    echo ""
    echo "例:"
    echo "  $0                  開発環境で起動"
    echo "  $0 -e prod          本番環境で起動"
    echo "  $0 -r               開発環境でイメージを再ビルドして起動"
    echo "  $0 -e prod -r       本番環境でイメージを再ビルドして起動"
    exit 0
}

# 引数の処理
while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--env)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -r|--rebuild)
            REBUILD=true
            shift
            ;;
        -h|--help)
            show_help
            ;;
        *)
            echo "不明なオプション: $1"
            show_help
            ;;
    esac
done

# 環境の検証
if [[ "$ENVIRONMENT" != "dev" && "$ENVIRONMENT" != "prod" ]]; then
    echo -e "${RED}エラー: 環境は 'dev' または 'prod' でなければなりません。${NC}"
    exit 1
fi

# Docker Composeファイルの選択
if [[ "$ENVIRONMENT" == "prod" ]]; then
    COMPOSE_FILE="docker-compose.prod.yml"
    echo -e "${YELLOW}本番環境で起動します...${NC}"
else
    COMPOSE_FILE="docker-compose.yml"
    echo -e "${YELLOW}開発環境で起動します...${NC}"
fi

# Dockerが起動しているか確認
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}エラー: Dockerが実行されていません。Dockerを起動してください。${NC}"
    exit 1
fi

# コンテナを停止
echo -e "${YELLOW}既存のコンテナを停止しています...${NC}"
docker-compose -f $COMPOSE_FILE down

# イメージの再ビルド
if [[ "$REBUILD" == true ]]; then
    echo -e "${YELLOW}イメージを再ビルドしています...${NC}"
    docker-compose -f $COMPOSE_FILE build --no-cache
fi

# コンテナの起動
echo -e "${YELLOW}コンテナを起動しています...${NC}"
docker-compose -f $COMPOSE_FILE up -d

# 起動確認
echo -e "${YELLOW}サービスの起動を確認しています...${NC}"
sleep 5

# ノードの状態確認
NODE_CONTAINER=$(docker-compose -f $COMPOSE_FILE ps -q node)
if [[ -z "$NODE_CONTAINER" ]]; then
    echo -e "${RED}エラー: ノードコンテナが起動していません。${NC}"
    docker-compose -f $COMPOSE_FILE logs node
    exit 1
fi

# Webサーバーの状態確認
WEB_CONTAINER=$(docker-compose -f $COMPOSE_FILE ps -q web)
if [[ -z "$WEB_CONTAINER" ]]; then
    echo -e "${RED}エラー: Webコンテナが起動していません。${NC}"
    docker-compose -f $COMPOSE_FILE logs web
    exit 1
fi

# 起動成功メッセージ
echo -e "${GREEN}HyperFlux.ioが正常に起動しました！${NC}"

if [[ "$ENVIRONMENT" == "prod" ]]; then
    echo -e "${BLUE}本番環境URL: ${NC}https://localhost"
    echo -e "${BLUE}ノードAPI: ${NC}https://localhost/api"
else
    echo -e "${BLUE}ノードAPI: ${NC}http://localhost:54868"
    echo -e "${BLUE}Webインターフェース: ${NC}http://localhost:54867"
fi

echo ""
echo -e "${YELLOW}ログを確認するには:${NC}"
echo -e "  ${GREEN}docker-compose -f $COMPOSE_FILE logs -f${NC} (すべてのログ)"
echo -e "  ${GREEN}docker-compose -f $COMPOSE_FILE logs -f node${NC} (ノードログ)"
echo -e "  ${GREEN}docker-compose -f $COMPOSE_FILE logs -f web${NC} (Webサーバーログ)"
echo ""
echo -e "${YELLOW}サービスを停止するには:${NC}"
echo -e "  ${GREEN}docker-compose -f $COMPOSE_FILE down${NC}"
echo ""
echo -e "${BLUE}CLIを起動するには:${NC}"
echo -e "  ${GREEN}node cli.js${NC}"