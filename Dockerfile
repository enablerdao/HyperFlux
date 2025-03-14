# マルチステージビルド - ビルダーステージ
FROM rust:1.70 as builder

WORKDIR /app

# キャッシュ最適化のためにまずCargo.tomlとCargo.lockをコピー
COPY Cargo.toml Cargo.lock* ./

# 依存関係のみをビルドするためのダミーソースを作成
RUN mkdir -p src && \
    echo "fn main() {println!(\"Dummy build\");}" > src/main.rs && \
    cargo build --release && \
    rm -rf src

# 実際のソースコードをコピー
COPY src ./src

# 標準的なリリースビルドを実行
RUN cargo build --release

# ランタイムステージ - 軽量なベースイメージを使用
FROM debian:bookworm-slim

WORKDIR /app

# 必要な依存関係のみをインストール
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    ca-certificates \
    libssl-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# データディレクトリを作成
RUN mkdir -p /app/data && chmod 777 /app/data

# ビルダーステージからバイナリをコピー
COPY --from=builder /app/target/release/hyperflux /app/hyperflux

# バイナリが実行可能であることを確認
RUN chmod +x /app/hyperflux

# APIポートを公開
EXPOSE 54867

# ヘルスチェック設定
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:54867/info || exit 1

# 環境変数の設定
ENV RUST_LOG=info
ENV DATA_DIR=/app/data

# アプリケーションを実行
CMD ["/app/hyperflux"]