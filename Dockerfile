# マルチステージビルド - ビルダーステージ
FROM rust:1.81 as builder

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

# クロスプラットフォームサポートの設定
# 環境変数ARGを使用して、ビルド時にターゲットアーキテクチャを指定可能に
ARG TARGETARCH

# アーキテクチャの検出と設定
RUN if [ "$(uname -m)" = "aarch64" ] || [ "$(uname -m)" = "arm64" ] || [ "$TARGETARCH" = "arm64" ]; then \
        echo "Building for ARM64 architecture"; \
        rustup target add aarch64-unknown-linux-gnu; \
        apt-get update && apt-get install -y --no-install-recommends \
            gcc-aarch64-linux-gnu libc6-dev-arm64-cross; \
        export CARGO_TARGET_AARCH64_UNKNOWN_LINUX_GNU_LINKER=aarch64-linux-gnu-gcc; \
        export CC_aarch64_unknown_linux_gnu=aarch64-linux-gnu-gcc; \
        export CXX_aarch64_unknown_linux_gnu=aarch64-linux-gnu-g++; \
        cargo build --release --target aarch64-unknown-linux-gnu; \
    else \
        echo "Building for x86_64 architecture"; \
        rustup target add x86_64-unknown-linux-gnu; \
        cargo build --release --target x86_64-unknown-linux-gnu; \
    fi

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
COPY --from=builder /app/target/aarch64-unknown-linux-gnu/release/hyperflux /app/hyperflux.arm64 || true
COPY --from=builder /app/target/x86_64-unknown-linux-gnu/release/hyperflux /app/hyperflux.x86_64 || true

# アーキテクチャに応じて適切なバイナリを選択
RUN if [ "$(uname -m)" = "aarch64" ] || [ "$(uname -m)" = "arm64" ]; then \
        if [ -f "/app/hyperflux.arm64" ]; then \
            mv /app/hyperflux.arm64 /app/hyperflux; \
        else \
            echo "ARM64バイナリが見つかりません"; \
            exit 1; \
        fi; \
    else \
        if [ -f "/app/hyperflux.x86_64" ]; then \
            mv /app/hyperflux.x86_64 /app/hyperflux; \
        else \
            echo "x86_64バイナリが見つかりません"; \
            exit 1; \
        fi; \
    fi

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