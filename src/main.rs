mod ai;
mod api;
mod consensus;
mod node;
mod sharding;
mod transaction;

use api::ApiServer;
use log::info;
use node::{Node, NodeConfig};
use std::sync::Arc;
use tokio::sync::Mutex;

#[tokio::main]
async fn main() {
    // ロガーを初期化
    env_logger::init_from_env(env_logger::Env::default().default_filter_or("info"));
    
    info!("Starting HyperFlux.io node...");
    
    // ノード設定を作成
    let config = NodeConfig::default();
    
    // ノードを作成
    let mut node = Node::new(config);
    
    // ノードを起動
    node.start().await;
    
    // APIサーバーを作成
    let node = Arc::new(Mutex::new(node));
    let api_server = ApiServer::new(Arc::clone(&node), 54867);
    
    // APIサーバーを起動
    api_server.start().await;
}
