FROM rust:1.81 as builder

WORKDIR /app

# Copy the Cargo.toml and Cargo.lock files
COPY Cargo.toml ./

# Create a dummy main.rs to build dependencies
RUN mkdir -p src && \
    echo "fn main() {}" > src/main.rs && \
    cargo update && \
    cargo build --release && \
    rm -rf src

# Copy the actual source code
COPY src ./src

# Build the application with cross-platform support
RUN rustup target add aarch64-unknown-linux-gnu x86_64-unknown-linux-gnu
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc-aarch64-linux-gnu libc6-dev-arm64-cross

# Build for the current architecture
RUN cargo build --release

# Create the runtime image
FROM debian:bookworm-slim

WORKDIR /app

# Install dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    ca-certificates \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy the binary from the builder
COPY --from=builder /app/target/release/hyperflux /app/hyperflux

# Make sure the binary is executable
RUN chmod +x /app/hyperflux

# Expose the API port
EXPOSE 54867

# Run the application
CMD ["/app/hyperflux"]