mod ai;
mod api;
mod api_handlers;
mod consensus;
mod dex;
mod node;
mod sharding;
mod transaction;
mod wallet;

use api::ApiServer;
use dex::DexManager;
use log::info;
use node::{Node, NodeConfig};
use std::sync::Arc;
use tokio::sync::Mutex;
use wallet::WalletManager;

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
    
    // ノードをArcでラップ
    let node = Arc::new(Mutex::new(node));
    
    // ウォレットマネージャーを作成
    let wallet_manager = Arc::new(WalletManager::new());
    
    // DEXマネージャーを作成
    let dex_manager = Arc::new(DexManager::new(Arc::clone(&wallet_manager)));
    
    // 初期データを設定
    initialize_demo_data(&wallet_manager, &dex_manager).await;
    
    // APIサーバーを作成
    let api_server = ApiServer::new(
        Arc::clone(&node),
        Arc::clone(&wallet_manager),
        Arc::clone(&dex_manager),
        54868 // ポート番号を変更
    );
    
    // APIサーバーを起動
    api_server.start().await;
}

/// デモデータを初期化する関数
async fn initialize_demo_data(wallet_manager: &WalletManager, dex_manager: &DexManager) {
    info!("Initializing demo data...");
    
    // デモアカウントを作成
    let alice = wallet_manager.create_account("Alice".to_string()).unwrap();
    let bob = wallet_manager.create_account("Bob".to_string()).unwrap();
    
    // デモアカウントに初期残高を追加
    wallet_manager.update_account_balance(&alice.id, 10000.0).unwrap();
    wallet_manager.update_account_token_balance(&alice.id, "BTC", 1000.0).unwrap();
    wallet_manager.update_account_token_balance(&alice.id, "ETH", 5000.0).unwrap();
    
    wallet_manager.update_account_balance(&bob.id, 10000.0).unwrap();
    wallet_manager.update_account_token_balance(&bob.id, "BTC", 500.0).unwrap();
    wallet_manager.update_account_token_balance(&bob.id, "ETH", 2500.0).unwrap();
    
    info!("Created demo accounts: Alice ({}), Bob ({})", alice.id, bob.id);
    
    // 取引ペアを追加
    let btc_usd = dex_manager.add_trading_pair("BTC".to_string(), "USD".to_string());
    let eth_usd = dex_manager.add_trading_pair("ETH".to_string(), "USD".to_string());
    let btc_eth = dex_manager.add_trading_pair("BTC".to_string(), "ETH".to_string());
    
    info!("Added trading pairs: {}, {}, {}", btc_usd.to_string(), eth_usd.to_string(), btc_eth.to_string());
}
