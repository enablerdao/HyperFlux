# HyperFlux.io

## ビジョン
「トランザクションが川の流れのように速く、スムーズに動くブロックチェーン。」

## 概要
HyperFlux.ioは高速処理、スケーラビリティ、セキュリティを兼ね備えた次世代ブロックチェーンプラットフォームです。
初期フェーズでは50,000 TPS（1秒あたりのトランザクション数）を目標とし、フェーズ2では100,000 TPSを目指します。

## 特徴
- **Proof of Flow (PoF)**: DAG、PoH、PoSを組み合わせた革新的なコンセンサスアルゴリズム
- **動的シャーディング**: トラフィックに応じて自動的にシャード数を調整
- **AI駆動型トランザクション管理**: 優先順位付けと予測によるスマートな処理
- **高度なセキュリティ**: AES-256暗号化とマルチシグネチャによる堅牢な保護

## 技術アーキテクチャ

### 1. コンセンサスメカニズム: Proof of Flow (PoF)
PoFは以下の3つの技術を組み合わせた革新的なコンセンサスメカニズムです：

1. **有向非巡回グラフ (DAG)**
   - ブロックチェーンの代わりにDAG構造を採用
   - トランザクションは過去のトランザクションを参照し、並列処理が可能
   - 実装: `src/transaction.rs`の`DAG`構造体

2. **Proof of History (PoH)**
   - 各トランザクションに暗号学的に検証可能なタイムスタンプを付与
   - 時間の経過を証明し、トランザクションの順序を保証
   - 実装: `src/transaction.rs`の`Transaction`構造体の`timestamp`フィールド

3. **Proof of Stake (PoS)**
   - バリデータがステークを保有し、トランザクションを検証
   - 悪意のある行動に対してはステークが没収される仕組み
   - 実装: `src/consensus.rs`の`Validator`トレイトと`SimpleValidator`構造体

### 2. スケーラビリティ: 動的シャーディング
トラフィック量に応じて自動的にシャード数を調整する仕組みを実装：

1. **シャード割り当て**
   - トランザクションIDのハッシュ値に基づいてシャードを決定
   - 実装: `src/sharding.rs`の`ShardingManager::assign_shard`メソッド

2. **動的調整**
   - 負荷に応じてシャード数を256から最大512まで動的に調整
   - 実装: `src/sharding.rs`の`ShardingManager::adjust_shards`メソッド

3. **クロスシャード通信**
   - 異なるシャード間でのトランザクション転送を効率的に処理
   - 実装: `src/sharding.rs`の`CrossShardManager`構造体

### 3. AI駆動型トランザクション管理
AIを活用してトランザクションの優先順位付けと予測を行います：

1. **優先順位付け**
   - トランザクションの特性（サイズ、親数、タイムスタンプなど）に基づいて優先度を計算
   - 実装: `src/ai.rs`の`AIPriorityManager::calculate_priority`メソッド

2. **優先キュー**
   - 優先度の高いトランザクションから処理するためのキュー管理
   - 実装: `src/ai.rs`の`PrioritizedTransaction`構造体と`BinaryHeap`

### 4. ノードアーキテクチャ
各ノードは以下のコンポーネントで構成されています：

1. **コアコンポーネント**
   - DAG: トランザクションの保存と管理
   - コンセンサスエンジン: トランザクションの検証と承認
   - シャーディングマネージャ: シャードの割り当てと調整
   - AI優先度マネージャ: トランザクションの優先順位付け
   - 実装: `src/node.rs`の`Node`構造体

2. **APIサーバー**
   - RESTful APIによるノードとの対話
   - トランザクションの送信と状態確認のエンドポイント
   - 実装: `src/api.rs`の`ApiServer`構造体

3. **Webインターフェース**
   - ノードの状態とパフォーマンスの可視化
   - トランザクションの作成と監視
   - 実装: `web/index.html`と`web/server.js`

## クイックスタート

### ワンクリックデプロイ

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/enablerdao/HyperFlux)
[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/enablerdao/HyperFlux)

### 1コマンドでの起動（すべてのOS対応）

以下の1コマンドで、HyperFlux.ioのノードとWebインターフェースを起動できます：

```bash
git clone https://github.com/enablerdao/HyperFlux.git && cd HyperFlux && docker-compose up --build
```

これにより、以下のサービスが起動します：
- ノードサーバー: http://localhost:54868
- Webインターフェース: http://localhost:54867

### コマンドラインインターフェース (CLI)

HyperFlux.ioはコマンドラインからの操作も可能です：

```bash
# CLIを起動
npm run cli

# または直接実行
node cli.js
```

CLIで利用可能なコマンド：
- `help` - ヘルプメッセージを表示
- `info` - ノード情報を表示
- `accounts` - すべてのアカウントを表示
- `create-account NAME` - 新しいアカウントを作成
- `balance ACCOUNT_ID` - アカウントの残高を表示
- `transfer FROM TO AMOUNT [TOKEN_ID]` - 送金を実行
- `pairs` - 取引ペアを表示
- `orderbook BASE QUOTE` - オーダーブックを表示
- `create-order ACCOUNT_ID BASE QUOTE TYPE PRICE AMOUNT` - 注文を作成
- `exit` - CLIを終了

### npm スクリプト

package.jsonに定義されたスクリプトを使用して、簡単に操作できます：

```bash
# すべてのサービスを1つのターミナルで起動（ノード、Web、CLI）
npm run all

# Rustノードを起動
npm start

# Webサーバーを起動
npm run web

# CLIを起動
npm run cli

# Docker関連のコマンド
npm run docker              # Dockerでノードとウェブサーバーを起動（フォアグラウンド）
npm run docker-build        # Dockerイメージをビルド
npm run docker-stop         # Dockerコンテナを停止

# 改善されたDocker起動スクリプト
npm run docker:dev          # 開発環境でDockerを起動（バックグラウンド）
npm run docker:prod         # 本番環境でDockerを起動（バックグラウンド）
npm run docker:dev:rebuild  # 開発環境でイメージを再ビルドして起動
npm run docker:prod:rebuild # 本番環境でイメージを再ビルドして起動
```

### 直接スクリプトを実行

```bash
# すべてのサービスを1つのターミナルで起動
./start.sh

# Dockerサービスを起動（オプション指定可能）
./docker-start.sh [オプション]

# オプション:
#   -e, --env ENV      環境を指定 (dev または prod) [デフォルト: dev]
#   -r, --rebuild      イメージを再ビルド
#   -h, --help         ヘルプメッセージを表示

# 例:
./docker-start.sh                  # 開発環境で起動
./docker-start.sh -e prod          # 本番環境で起動
./docker-start.sh -r               # 開発環境でイメージを再ビルドして起動
./docker-start.sh -e prod -r       # 本番環境でイメージを再ビルドして起動
```

### 前提条件
- Git
- Docker と Docker Compose
- Node.js (CLIを使用する場合)

### クロスプラットフォームサポート

HyperFlux.ioは以下のプラットフォームで動作します：

- **Linux**: x86_64およびARM64アーキテクチャ（Ubuntu、Debian、CentOS、Alpine）
- **macOS**: Intel ChipおよびApple Silicon（M1/M2/M3）
- **Windows**: WSL2（Windows Subsystem for Linux 2）経由

Dockerfileはマルチアーキテクチャビルドをサポートしており、ビルド時に自動的に適切なアーキテクチャを検出します。ARM64プラットフォーム（Raspberry Pi、Apple Silicon Macなど）でビルドする場合は、以下のコマンドを使用します：

```bash
# ARM64向けにビルド
TARGETARCH=arm64 docker-compose build
```

または、docker-start.shスクリプトを使用する場合：

```bash
# 環境変数を設定してスクリプトを実行
TARGETARCH=arm64 ./docker-start.sh -r
```

## 詳細な実装ガイド

### 各OSでの環境構築

#### Linux (Ubuntu/Debian)

1. **Dockerのインストール**
```bash
# 前提パッケージのインストール
sudo apt-get update
sudo apt-get install -y apt-transport-https ca-certificates curl gnupg lsb-release

# Dockerの公式GPGキーを追加
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# リポジトリを設定
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Dockerをインストール
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Docker Composeをインストール
sudo curl -L "https://github.com/docker/compose/releases/download/v2.18.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# ユーザーをdockerグループに追加（sudo不要でDockerを実行可能に）
sudo usermod -aG docker $USER
```

2. **プロジェクトのクローンと起動**
```bash
git clone https://github.com/enablerdao/HyperFlux.git
cd HyperFlux
docker-compose up --build
```

#### macOS

1. **Dockerのインストール**
   - [Docker Desktop for Mac](https://www.docker.com/products/docker-desktop)をダウンロードしてインストール
   - または、Homebrewを使用してインストール:
   ```bash
   brew install --cask docker
   ```

2. **プロジェクトのクローンと起動**
```bash
git clone https://github.com/enablerdao/HyperFlux.git
cd HyperFlux
docker-compose up --build
```

#### Windows

1. **Dockerのインストール**
   - [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop)をダウンロードしてインストール
   - WSL2が有効になっていることを確認（Windows 10/11）

2. **プロジェクトのクローンと起動**
```bash
git clone https://github.com/enablerdao/HyperFlux.git
cd HyperFlux
docker-compose up --build
```

### Docker不要の開発環境構築

Docker環境を使用せずに開発する場合は、以下の手順で環境を構築できます：

#### 前提条件
- Rust (1.75以上)
- Node.js (v14以上)

#### Rustのインストール
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source "$HOME/.cargo/env"  # Linux/macOS
# Windowsの場合は、インストーラーの指示に従ってください
```

#### Node.jsのインストール
```bash
# Ubuntuの場合
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# macOSの場合
brew install node

# Windowsの場合
# https://nodejs.org/からインストーラーをダウンロードしてインストール
```

#### プロジェクトのクローンと構築

```bash
# リポジトリのクローン
git clone https://github.com/enablerdao/HyperFlux.git
cd HyperFlux

# Rustの依存関係をインストール
cargo build

# Webサーバーの依存関係をインストール
cd web
npm install
cd ..
```

#### 開発モードでの実行

```bash
# 開発モードでノードとWebサーバーを起動
./run_dev.sh  # Linux/macOS
# Windowsの場合は、run_dev.batを実行
```

### データソースの切り替え

Webインターフェースでは、以下の3つのデータソースを切り替えることができます：

1. **モックデータ**: ランダムに生成されたデータを表示（デフォルト）
2. **テストデータ**: 高負荷テスト用の大きな値を持つデータを表示
3. **実ノード接続**: ローカルで実行中のノードに接続してリアルデータを表示

データソースは、Webインターフェース上部の「データソース」ドロップダウンメニューから切り替えることができます。

### 主要コンポーネントの実装詳細

#### 1. トランザクション処理
トランザクション処理の流れは以下の通りです：

1. クライアントがAPIを通じてトランザクションを送信
2. AIがトランザクションの優先度を計算し、優先キューに追加
3. シャーディングマネージャがトランザクションの所属シャードを決定
4. 所属シャードがローカルの場合、コンセンサスエンジンが処理
5. バリデータがトランザクションを検証し、過半数の承認で確定
6. DAGにトランザクションが追加され、状態が「確認済み」に更新

実装例（トランザクション送信）:
```rust
// トランザクションの作成
let tx = Transaction::new(
    vec!["parent1", "parent2"], // 親トランザクションID
    payload.as_bytes().to_vec(), // ペイロード
    signature.as_bytes().to_vec(), // 署名
);

// ノードにトランザクションを送信
node.submit_transaction(tx).await?;
```

#### 2. シャーディングの実装
シャーディングの実装は以下の通りです：

1. トランザクションIDのハッシュ値を計算
2. ハッシュ値を現在のシャード数で割った余りがシャードID
3. 負荷に応じてシャード数を動的に調整（256〜512）
4. 異なるシャードへのトランザクション転送はメッセージキューを使用

実装例（シャード割り当て）:
```rust
// トランザクションのシャードを決定
let shard_id = sharding_manager.assign_shard(&tx);

// 別のシャードに転送が必要な場合
if shard_id != current_shard_id {
    cross_shard_manager.send_cross_shard(tx, shard_id).await?;
}
```

#### 3. AIによる優先順位付け
AIによる優先順位付けの実装は以下の通りです：

1. トランザクションの特性（サイズ、親数、タイムスタンプ）を分析
2. 特性に基づいて優先スコアを計算
3. 優先スコアに基づいてバイナリヒープでトランザクションを管理
4. 優先度の高いトランザクションから順に処理

実装例（優先度計算）:
```rust
// トランザクションの優先度を計算
let size_score = 1000 - tx.payload.len().min(1000) as u32;
let parent_score = tx.parent_ids.len() as u32 * 100;
let time_score = (current_time - tx.timestamp).min(1000) as u32;

// 総合スコアを計算
let priority = size_score + parent_score + time_score;
```

### テスト方法

#### 単体テスト
```bash
# すべてのテストを実行
cargo test

# 特定のモジュールのテストを実行
cargo test --package hyperflux --lib transaction
```

#### 性能テスト
```bash
# TPSベンチマークを実行
cargo bench --bench tps_benchmark
```

#### 負荷テスト
```bash
# 100ノードでの負荷テスト（Dockerが必要）
./scripts/load_test.sh 100
```

## デプロイガイド

### ローカル環境へのデプロイ
```bash
# 開発モードで実行
./run_dev.sh

# または、Dockerで実行
docker-compose up
```

### 本番環境へのデプロイ
```bash
# 本番用の設定ファイルを使用
cp config/production.toml config/config.toml

# Dockerで本番モードで実行
docker-compose -f docker-compose.prod.yml up -d
```

### Webインターフェースのデプロイ
Webインターフェースは以下の方法でデプロイできます：

1. **Netlify**
   - GitHubリポジトリと連携
   - ビルドディレクトリを`web`に設定
   - 自動デプロイの設定

2. **Vercel**
   - GitHubリポジトリと連携
   - ルートディレクトリを`web`に設定
   - 自動デプロイの設定

3. **AWS S3 + CloudFront**
   - S3バケットにwebディレクトリの内容をアップロード
   - CloudFrontでCDN配信を設定

## 開発ロードマップ

### フェーズ1（現在）
- 基本的なノード構造とP2P通信
- シンプルなトランザクション処理
- Webインターフェースによるシステム監視
- 目標: 50,000 TPS

### フェーズ2
- スケーラビリティの向上
- AIモデルの高度化
- セキュリティの強化
- 目標: 100,000 TPS

### フェーズ3
- 本番環境へのデプロイ
- エコシステムの拡大
- サードパーティ開発者向けSDKの提供
- 目標: グローバル規模での採用

## トラブルシューティング

### よくある問題と解決策

1. **ノードが起動しない**
   - ログを確認: `RUST_LOG=debug cargo run`
   - ポートの競合を確認: `lsof -i :54867`
   - 依存関係を更新: `cargo update`

2. **トランザクションが処理されない**
   - バリデータの状態を確認
   - ネットワーク接続を確認
   - シャーディング設定を確認

3. **パフォーマンスが低い**
   - システムリソースを確認
   - ログレベルを下げる: `RUST_LOG=info`
   - シャード数を増やす: 設定ファイルで`initial_shards`を調整

## コントリビューションガイド

1. このリポジトリをフォーク
2. 機能ブランチを作成: `git checkout -b feature/amazing-feature`
3. 変更をコミット: `git commit -m 'Add amazing feature'`
4. ブランチをプッシュ: `git push origin feature/amazing-feature`
5. プルリクエストを作成

## ライセンス
MIT