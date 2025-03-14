#!/bin/bash

# インタラクティブモードの確認
if [ -t 0 ]; then
    INTERACTIVE=true
else
    INTERACTIVE=false
fi

# 色の定義
if [ "$INTERACTIVE" = true ]; then
    GREEN='\033[0;32m'
    BLUE='\033[0;34m'
    YELLOW='\033[1;33m'
    RED='\033[0;31m'
    NC='\033[0m' # No Color
else
    GREEN=''
    BLUE=''
    YELLOW=''
    RED=''
    NC=''
fi

# ロゴを表示
echo -e "${BLUE}"
echo "  _   _                       _____ _            _       "
echo " | | | |_   _ _ __   ___ _ __|  ___| |_   ___  _(_) ___  "
echo " | |_| | | | | '_ \\ / _ \\ '__| |_  | | | | \\ \\/ / |/ _ \\ "
echo " |  _  | |_| | |_) |  __/ |  |  _| | | |_| |>  <| | (_) |"
echo " |_| |_|\\__, | .__/ \\___|_|  |_|   |_|\\__,_/_/\\_\\_|\\___/ "
echo "        |___/|_|                                         "
echo -e "${NC}"
echo -e "${GREEN}HyperFlux.io インストーラー${NC}"
echo ""

# OSの検出
OS="unknown"
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="linux"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macos"
elif [[ "$OSTYPE" == "cygwin" ]]; then
    OS="windows"
elif [[ "$OSTYPE" == "msys" ]]; then
    OS="windows"
elif [[ "$OSTYPE" == "win32" ]]; then
    OS="windows"
fi

echo -e "${YELLOW}検出されたOS: ${OS}${NC}"

# Dockerのチェック
echo -e "${YELLOW}Dockerをチェックしています...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Dockerがインストールされていません。${NC}"
    
    case $OS in
        linux)
            echo -e "${YELLOW}Dockerをインストールしますか？ (y/n)${NC}"
            read -r install_docker
            if [[ "$install_docker" == "y" ]]; then
                echo -e "${YELLOW}Dockerをインストールしています...${NC}"
                curl -fsSL https://get.docker.com -o get-docker.sh
                sudo sh get-docker.sh
                sudo usermod -aG docker $USER
                echo -e "${GREEN}Dockerがインストールされました。ログアウトして再ログインしてください。${NC}"
                echo -e "${YELLOW}その後、このスクリプトを再度実行してください。${NC}"
                exit 0
            else
                echo -e "${YELLOW}Dockerのインストール手順については https://docs.docker.com/engine/install/ を参照してください。${NC}"
                exit 1
            fi
            ;;
        macos)
            echo -e "${YELLOW}macOSの場合は、Docker Desktopをインストールしてください: https://www.docker.com/products/docker-desktop${NC}"
            exit 1
            ;;
        windows)
            echo -e "${YELLOW}Windowsの場合は、Docker Desktopをインストールしてください: https://www.docker.com/products/docker-desktop${NC}"
            exit 1
            ;;
        *)
            echo -e "${YELLOW}お使いのOSに対応するDockerのインストール手順については https://docs.docker.com/engine/install/ を参照してください。${NC}"
            exit 1
            ;;
    esac
fi

# Docker Composeのチェック
echo -e "${YELLOW}Docker Composeをチェックしています...${NC}"
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}Docker Composeがインストールされていません。${NC}"
    
    case $OS in
        linux)
            echo -e "${YELLOW}Docker Composeをインストールしますか？ (y/n)${NC}"
            read -r install_compose
            if [[ "$install_compose" == "y" ]]; then
                echo -e "${YELLOW}Docker Composeをインストールしています...${NC}"
                sudo curl -L "https://github.com/docker/compose/releases/download/v2.18.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
                sudo chmod +x /usr/local/bin/docker-compose
                echo -e "${GREEN}Docker Composeがインストールされました。${NC}"
            else
                echo -e "${YELLOW}Docker Composeのインストール手順については https://docs.docker.com/compose/install/ を参照してください。${NC}"
                exit 1
            fi
            ;;
        *)
            echo -e "${YELLOW}Docker Composeのインストール手順については https://docs.docker.com/compose/install/ を参照してください。${NC}"
            exit 1
            ;;
    esac
fi

# Dockerデーモンが実行中かチェック
echo -e "${YELLOW}Dockerデーモンをチェックしています...${NC}"
if ! docker info &> /dev/null; then
    echo -e "${RED}Dockerデーモンが実行されていません。${NC}"
    
    case $OS in
        linux)
            echo -e "${YELLOW}Dockerデーモンを起動しますか？ (y/n)${NC}"
            read -r start_docker
            if [[ "$start_docker" == "y" ]]; then
                echo -e "${YELLOW}Dockerデーモンを起動しています...${NC}"
                sudo systemctl start docker || sudo service docker start || sudo dockerd > /dev/null 2>&1 &
                sleep 5
                if ! docker info &> /dev/null; then
                    echo -e "${RED}Dockerデーモンの起動に失敗しました。手動で起動してください。${NC}"
                    exit 1
                fi
                echo -e "${GREEN}Dockerデーモンが起動しました。${NC}"
            else
                echo -e "${YELLOW}Dockerデーモンを手動で起動してください。${NC}"
                exit 1
            fi
            ;;
        *)
            echo -e "${YELLOW}Dockerデーモンを手動で起動してください。${NC}"
            exit 1
            ;;
    esac
fi

# HyperFlux.ioのクローンまたは更新
REPO_DIR="HyperFlux"
if [ -d "$REPO_DIR" ]; then
    echo -e "${YELLOW}既存のHyperFlux.ioリポジトリを更新しています...${NC}"
    cd $REPO_DIR
    git pull
else
    echo -e "${YELLOW}HyperFlux.ioリポジトリをクローンしています...${NC}"
    git clone https://github.com/enablerdao/HyperFlux.git
    cd $REPO_DIR
fi

# アーキテクチャの検出
ARCH=$(uname -m)
if [[ "$ARCH" == "arm64" ]] || [[ "$ARCH" == "aarch64" ]]; then
    echo -e "${YELLOW}ARM64アーキテクチャが検出されました。${NC}"
    export TARGETARCH=arm64
elif [[ "$ARCH" == "x86_64" ]] || [[ "$ARCH" == "amd64" ]]; then
    echo -e "${YELLOW}x86_64アーキテクチャが検出されました。${NC}"
    export TARGETARCH=amd64
else
    echo -e "${YELLOW}未知のアーキテクチャ: $ARCH${NC}"
    echo -e "${YELLOW}デフォルトのx86_64を使用します。${NC}"
    export TARGETARCH=amd64
fi

# 起動方法の選択
if [ "$INTERACTIVE" = true ]; then
    echo -e "${YELLOW}HyperFlux.ioの起動方法を選択してください:${NC}"
    echo -e "1) ${GREEN}開発モード${NC} - フォアグラウンドで実行（ログを表示）"
    echo -e "2) ${GREEN}バックグラウンドモード${NC} - バックグラウンドで実行"
    echo -e "3) ${GREEN}本番モード${NC} - 本番設定でバックグラウンドで実行"
    echo -e "4) ${GREEN}終了${NC}"
    echo -n "選択 (1-4): "
    read -r choice
else
    # 非インタラクティブモードではデフォルトでバックグラウンドモードを使用
    echo "非インタラクティブモードでは、デフォルトでバックグラウンドモードを使用します。"
    choice="2"
fi

case $choice in
    "1")
        echo -e "${YELLOW}開発モードでHyperFlux.ioを起動しています...${NC}"
        docker-compose up --build
        ;;
    "2")
        echo -e "${YELLOW}バックグラウンドモードでHyperFlux.ioを起動しています...${NC}"
        docker-compose up -d --build
        
        # 起動確認
        sleep 5
        echo -e "${GREEN}HyperFlux.ioが起動しました！${NC}"
        echo -e "${BLUE}ノードAPI: ${NC}http://localhost:54868"
        echo -e "${BLUE}Webインターフェース: ${NC}http://localhost:54867"
        echo ""
        echo -e "${YELLOW}ログを確認するには:${NC}"
        echo -e "  ${GREEN}docker-compose logs -f${NC}"
        echo -e "${YELLOW}サービスを停止するには:${NC}"
        echo -e "  ${GREEN}docker-compose down${NC}"
        ;;
    "3")
        if [ -f "docker-compose.prod.yml" ]; then
            echo -e "${YELLOW}本番モードでHyperFlux.ioを起動しています...${NC}"
            docker-compose -f docker-compose.prod.yml up -d --build
            
            # 起動確認
            sleep 5
            echo -e "${GREEN}HyperFlux.io（本番モード）が起動しました！${NC}"
            echo -e "${BLUE}ノードAPI: ${NC}http://localhost:54868"
            echo -e "${BLUE}Webインターフェース: ${NC}http://localhost:54867"
            echo -e "${BLUE}HTTPS (Nginx): ${NC}https://localhost"
            echo ""
            echo -e "${YELLOW}ログを確認するには:${NC}"
            echo -e "  ${GREEN}docker-compose -f docker-compose.prod.yml logs -f${NC}"
            echo -e "${YELLOW}サービスを停止するには:${NC}"
            echo -e "  ${GREEN}docker-compose -f docker-compose.prod.yml down${NC}"
        else
            echo -e "${RED}docker-compose.prod.ymlが見つかりません。${NC}"
            echo -e "${YELLOW}代わりに開発モードで起動します...${NC}"
            docker-compose up -d --build
            
            # 起動確認
            sleep 5
            echo -e "${GREEN}HyperFlux.ioが起動しました！${NC}"
            echo -e "${BLUE}ノードAPI: ${NC}http://localhost:54868"
            echo -e "${BLUE}Webインターフェース: ${NC}http://localhost:54867"
            echo ""
            echo -e "${YELLOW}ログを確認するには:${NC}"
            echo -e "  ${GREEN}docker-compose logs -f${NC}"
            echo -e "${YELLOW}サービスを停止するには:${NC}"
            echo -e "  ${GREEN}docker-compose down${NC}"
        fi
        ;;
    "4")
        echo -e "${YELLOW}インストーラーを終了します。${NC}"
        exit 0
        ;;
    *)
        # デフォルトでバックグラウンドモードを選択
        echo -e "${YELLOW}有効な選択肢ではありません。デフォルトでバックグラウンドモードを使用します。${NC}"
        echo -e "${YELLOW}バックグラウンドモードでHyperFlux.ioを起動しています...${NC}"
        docker-compose up -d --build
        
        # 起動確認
        sleep 5
        echo -e "${GREEN}HyperFlux.ioが起動しました！${NC}"
        echo -e "${BLUE}ノードAPI: ${NC}http://localhost:54868"
        echo -e "${BLUE}Webインターフェース: ${NC}http://localhost:54867"
        echo ""
        echo -e "${YELLOW}ログを確認するには:${NC}"
        echo -e "  ${GREEN}docker-compose logs -f${NC}"
        echo -e "${YELLOW}サービスを停止するには:${NC}"
        echo -e "  ${GREEN}docker-compose down${NC}"
        ;;
esac