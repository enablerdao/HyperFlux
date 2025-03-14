#!/usr/bin/env node

const readline = require('readline');
const http = require('http');
const https = require('https');
const { URL } = require('url');
const fs = require('fs');
const path = require('path');

// ネットワーク設定
const NETWORKS = {
  local: 'http://localhost:54868',
  testnet: 'https://testnet.hyperflux.io',
  mainnet: 'https://mainnet.hyperflux.io'
};

// ネットワーク固有の設定
const NETWORK_CONFIG = {
  local: {
    // ローカルネットワークの設定
    createDemoAccounts: true,
    supportedFeatures: ['accounts', 'transfer', 'pairs', 'orderbook', 'create-order']
  },
  testnet: {
    // テストネットの設定
    createDemoAccounts: false,
    supportedFeatures: ['accounts', 'transfer', 'pairs']
  },
  mainnet: {
    // メインネットの設定
    createDemoAccounts: false,
    supportedFeatures: ['accounts', 'transfer']
  }
};

// デフォルト設定
let currentNetwork = 'local';
let nodeUrl = NETWORKS[currentNetwork];

// 設定ファイルのパス
const CONFIG_DIR = path.join(process.env.HOME || process.env.USERPROFILE, '.hyperflux');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

// 設定を読み込む
function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
      if (config.network && NETWORKS[config.network]) {
        currentNetwork = config.network;
        nodeUrl = NETWORKS[currentNetwork];
      }
    }
  } catch (error) {
    console.error('設定ファイルの読み込みに失敗しました:', error.message);
  }
}

// 設定を保存する
function saveConfig() {
  try {
    if (!fs.existsSync(CONFIG_DIR)) {
      fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }
    fs.writeFileSync(CONFIG_FILE, JSON.stringify({ network: currentNetwork }, null, 2));
  } catch (error) {
    console.error('設定ファイルの保存に失敗しました:', error.message);
  }
}

// 設定を読み込む
loadConfig();

// コマンドライン引数からノードURLを取得
const args = process.argv.slice(2);
if (args.length > 0) {
  if (NETWORKS[args[0]]) {
    currentNetwork = args[0];
    nodeUrl = NETWORKS[currentNetwork];
    saveConfig();
  } else {
    nodeUrl = args[0];
  }
}

// 対話型インターフェースの設定
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: `HyperFlux(${currentNetwork})> `
});

// ヘルプメッセージ
const helpMessage = `
利用可能なコマンド:
  help                - このヘルプメッセージを表示
  info                - ノード情報を表示
  network             - 現在のネットワークを表示
  network NETWORK     - ネットワークを切り替え (local, testnet, mainnet)
  accounts            - すべてのアカウントを表示
  create-account NAME - 新しいアカウントを作成
  balance ACCOUNT_ID  - アカウントの残高を表示
  transfer FROM TO AMOUNT [TOKEN_ID] - 送金を実行
  pairs               - 取引ペアを表示
  orderbook BASE QUOTE - オーダーブックを表示
  create-order ACCOUNT_ID BASE QUOTE TYPE PRICE AMOUNT - 注文を作成
  exit                - CLIを終了
`;

// APIリクエストを送信する関数
async function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, nodeUrl);
    
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    const protocol = url.protocol === 'https:' ? https : http;
    
    const req = protocol.request(url, options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          // レスポンスが空の場合は空のオブジェクトを返す
          if (!responseData.trim()) {
            resolve({});
            return;
          }
          
          const parsedData = JSON.parse(responseData);
          resolve(parsedData);
        } catch (error) {
          resolve(responseData);
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// コマンドを処理する関数
async function processCommand(command) {
  const parts = command.trim().split(' ');
  const cmd = parts[0].toLowerCase();
  
  try {
    switch (cmd) {
      case 'help':
        console.log(helpMessage);
        break;
        
      case 'network':
        if (parts.length > 1) {
          const newNetwork = parts[1].toLowerCase();
          if (NETWORKS[newNetwork]) {
            currentNetwork = newNetwork;
            nodeUrl = NETWORKS[currentNetwork];
            saveConfig();
            console.log(`ネットワークを ${currentNetwork} に切り替えました`);
            rl.setPrompt(`HyperFlux(${currentNetwork})> `);
          } else {
            console.log(`エラー: 無効なネットワーク '${newNetwork}'`);
            console.log('有効なネットワーク: local, testnet, mainnet');
          }
        } else {
          console.log(`現在のネットワーク: ${currentNetwork}`);
          console.log('利用可能なネットワーク:');
          for (const [name, url] of Object.entries(NETWORKS)) {
            console.log(`  ${name}: ${url}`);
          }
        }
        break;
        
      case 'info':
        const info = await makeRequest('GET', '/info');
        console.log('ノード情報:');
        console.log(JSON.stringify(info, null, 2));
        break;
        
      case 'accounts':
        try {
          // ノード情報を取得
          const info = await makeRequest('GET', '/info');
          
          if (info && info.id) {
            console.log('デモアカウント:');
            
            // ノードログから既存のアカウントIDを取得
            try {
              // ノードログの最初の数行を取得
              const nodeLog = await makeRequest('GET', '/info');
              
              // ノードログからアカウントIDを取得
              if (nodeLog && nodeLog.id) {
                // 既存のアカウントを取得
                try {
                  // ノードが起動しているときに作成されたデモアカウントを取得
                  const accounts = await makeRequest('GET', '/accounts');
                  
                  if (accounts && accounts.length > 0) {
                    // 既存のアカウントを表示
                    for (const account of accounts) {
                      console.log(`${account.name} (${account.id}):`);
                      console.log(JSON.stringify(account, null, 2));
                    }
                  } else {
                    // アカウントが見つからない場合は、個別にアカウントを取得
                    console.log('既存のアカウントを個別に取得します...');
                    
                    // ノードログから最新のアカウントIDを取得できない場合は、
                    // 既知のアカウントIDを使用してアカウント情報を取得
                    const aliceAccount = await makeRequest('GET', `/accounts/${info.alice_id || '4c658574-2fc6-4b39-b009-ce20432a0b4d'}`);
                    const bobAccount = await makeRequest('GET', `/accounts/${info.bob_id || '5c96ec5c-327a-41e6-badb-0461bcd64f95'}`);
                    
                    if (aliceAccount && aliceAccount.id) {
                      console.log(`Alice (${aliceAccount.id}):`);
                      console.log(JSON.stringify(aliceAccount, null, 2));
                    }
                    
                    if (bobAccount && bobAccount.id) {
                      console.log(`Bob (${bobAccount.id}):`);
                      console.log(JSON.stringify(bobAccount, null, 2));
                    }
                  }
                } catch (error) {
                  console.log('既存のアカウントの取得に失敗しました。新しいアカウントを作成します。');
                  
                  // 新しいアカウントを作成
                  const alice = await makeRequest('POST', '/accounts', { name: 'Alice' });
                  if (alice && alice.id) {
                    console.log(`Alice (${alice.id}):`);
                    console.log(JSON.stringify(alice, null, 2));
                  }
                  
                  const bob = await makeRequest('POST', '/accounts', { name: 'Bob' });
                  if (bob && bob.id) {
                    console.log(`Bob (${bob.id}):`);
                    console.log(JSON.stringify(bob, null, 2));
                  }
                }
              } else {
                console.log('ノードログからアカウントIDを取得できませんでした。新しいアカウントを作成します。');
                
                // 新しいアカウントを作成
                const alice = await makeRequest('POST', '/accounts', { name: 'Alice' });
                if (alice && alice.id) {
                  console.log(`Alice (${alice.id}):`);
                  console.log(JSON.stringify(alice, null, 2));
                }
                
                const bob = await makeRequest('POST', '/accounts', { name: 'Bob' });
                if (bob && bob.id) {
                  console.log(`Bob (${bob.id}):`);
                  console.log(JSON.stringify(bob, null, 2));
                }
              }
            } catch (error) {
              console.log('アカウント情報の取得に失敗しました:', error.message);
              console.log('新しいアカウントを作成します。');
              
              // 新しいアカウントを作成
              const alice = await makeRequest('POST', '/accounts', { name: 'Alice' });
              if (alice && alice.id) {
                console.log(`Alice (${alice.id}):`);
                console.log(JSON.stringify(alice, null, 2));
              }
              
              const bob = await makeRequest('POST', '/accounts', { name: 'Bob' });
              if (bob && bob.id) {
                console.log(`Bob (${bob.id}):`);
                console.log(JSON.stringify(bob, null, 2));
              }
            }
          } else {
            console.log('ノード情報の取得に失敗しました。ノードが起動しているか確認してください。');
          }
        } catch (error) {
          console.log('アカウント一覧の取得に失敗しました:', error.message);
          console.log('アカウントを作成するには create-account コマンドを使用してください。');
        }
        break;
        
      case 'create-account':
        if (parts.length < 2) {
          console.log('エラー: アカウント名を指定してください');
          break;
        }
        const name = parts[1];
        const newAccount = await makeRequest('POST', '/accounts', { name });
        console.log('アカウント作成成功:');
        console.log(JSON.stringify(newAccount, null, 2));
        break;
        
      case 'balance':
        if (parts.length < 2) {
          console.log('エラー: アカウントIDを指定してください');
          break;
        }
        const accountId = parts[1];
        const account = await makeRequest('GET', `/accounts/${accountId}`);
        console.log('アカウント情報:');
        console.log(JSON.stringify(account, null, 2));
        break;
        
      case 'transfer':
        if (parts.length < 4) {
          console.log('エラー: 送信元、送信先、金額を指定してください');
          console.log('使用例: transfer FROM_ACCOUNT_ID TO_ACCOUNT_ID AMOUNT [TOKEN_ID]');
          break;
        }
        const fromAccount = parts[1];
        const toAccount = parts[2];
        const amount = parseFloat(parts[3]);
        const tokenId = parts.length > 4 ? parts[4] : null;
        
        try {
          console.log(`送金を実行中: ${fromAccount} -> ${toAccount}, 金額: ${amount}${tokenId ? ` ${tokenId}` : ''}`);
          
          // 送金を実行
          const transfer = await makeRequest('POST', '/transfer', {
            from_account_id: fromAccount,
            to_account_id: toAccount,
            amount,
            token_id: tokenId
          });
          
          if (transfer && transfer.transaction_id) {
            console.log('送金成功:');
            console.log(JSON.stringify(transfer, null, 2));
            
            // 送金後の残高を表示
            console.log('\n送金後の残高:');
            
            try {
              const fromAccountAfter = await makeRequest('GET', `/accounts/${fromAccount}`);
              if (fromAccountAfter && fromAccountAfter.id) {
                console.log(`送信元 (${fromAccountAfter.name}): ${fromAccountAfter.balance}`);
                if (tokenId && fromAccountAfter.token_balances) {
                  console.log(`送信元 ${tokenId} トークン: ${fromAccountAfter.token_balances[tokenId] || 0}`);
                }
              }
              
              const toAccountAfter = await makeRequest('GET', `/accounts/${toAccount}`);
              if (toAccountAfter && toAccountAfter.id) {
                console.log(`送信先 (${toAccountAfter.name}): ${toAccountAfter.balance}`);
                if (tokenId && toAccountAfter.token_balances) {
                  console.log(`送信先 ${tokenId} トークン: ${toAccountAfter.token_balances[tokenId] || 0}`);
                }
              }
            } catch (error) {
              console.log('残高情報の取得に失敗しました:', error.message);
            }
          } else if (transfer && transfer.error) {
            console.log('送金に失敗しました:', transfer.error);
          } else {
            console.log('送金に失敗しました: 不明なエラー');
          }
        } catch (error) {
          console.log('送金に失敗しました:', error.message);
          console.log('送金処理中にエラーが発生しました。アカウントIDが正しいか確認してください。');
          
          // エラーの詳細を表示
          if (error.response) {
            console.log('エラー詳細:', error.response);
          }
        }
        break;
        
      case 'pairs':
        try {
          if (currentNetwork === 'local') {
            // ローカルネットワークの場合はデモ用の取引ペアを表示
            console.log('デモ用取引ペア:');
            
            try {
              // 取引ペアを追加
              const btcUsd = await makeRequest('POST', '/trading-pairs', { base: 'BTC', quote: 'USD' });
              const ethUsd = await makeRequest('POST', '/trading-pairs', { base: 'ETH', quote: 'USD' });
              const btcEth = await makeRequest('POST', '/trading-pairs', { base: 'BTC', quote: 'ETH' });
              
              const pairs = [];
              if (btcUsd && btcUsd.pair) pairs.push(btcUsd.pair);
              if (ethUsd && ethUsd.pair) pairs.push(ethUsd.pair);
              if (btcEth && btcEth.pair) pairs.push(btcEth.pair);
              
              console.log(JSON.stringify(pairs.length > 0 ? pairs : ['BTC/USD', 'ETH/USD', 'BTC/ETH'], null, 2));
            } catch (error) {
              // エラーが発生した場合はデフォルトのペアを表示
              console.log(JSON.stringify(['BTC/USD', 'ETH/USD', 'BTC/ETH'], null, 2));
            }
          } else {
            // テストネット/メインネットの場合は取引ペア一覧を取得
            try {
              const pairs = await makeRequest('GET', '/trading-pairs');
              console.log('取引ペア一覧:');
              console.log(JSON.stringify(pairs, null, 2));
            } catch (error) {
              console.log('取引ペア一覧の取得に失敗しました。');
              console.log('このネットワークでは取引ペアの取得がサポートされていない可能性があります。');
            }
          }
        } catch (error) {
          console.log('取引ペア一覧の取得に失敗しました:', error.message);
          console.log('デモ用取引ペア:');
          console.log(JSON.stringify(['BTC/USD', 'ETH/USD', 'BTC/ETH'], null, 2));
        }
        break;
        
      case 'orderbook':
        if (parts.length < 3) {
          console.log('エラー: 基準通貨と相手通貨を指定してください');
          break;
        }
        const base = parts[1];
        const quote = parts[2];
        
        const orderbook = await makeRequest('GET', `/order-book?base=${base}&quote=${quote}`);
        console.log('オーダーブック:');
        console.log(JSON.stringify(orderbook, null, 2));
        break;
        
      case 'create-order':
        if (parts.length < 7) {
          console.log('エラー: アカウントID、基準通貨、相手通貨、注文タイプ、価格、数量を指定してください');
          break;
        }
        
        const orderId = parts[1];
        const orderBase = parts[2];
        const orderQuote = parts[3];
        const orderType = parts[4];
        const price = parseFloat(parts[5]);
        const orderAmount = parseFloat(parts[6]);
        
        const order = await makeRequest('POST', '/orders', {
          account_id: orderId,
          base: orderBase,
          quote: orderQuote,
          order_type: orderType,
          price,
          amount: orderAmount
        });
        
        console.log('注文作成結果:');
        console.log(JSON.stringify(order, null, 2));
        break;
        
      case 'exit':
        rl.close();
        break;
        
      default:
        console.log(`未知のコマンド: ${cmd}`);
        console.log('利用可能なコマンドを表示するには "help" と入力してください');
    }
  } catch (error) {
    console.error('エラー:', error.message);
  }
}

// 起動メッセージ
console.log(`HyperFlux.io CLI - ネットワーク: ${currentNetwork} (${nodeUrl})`);
console.log('利用可能なコマンドを表示するには "help" と入力してください');

// プロンプトを表示
rl.prompt();

// 入力を処理
rl.on('line', async (line) => {
  if (line.trim()) {
    await processCommand(line.trim());
  }
  rl.prompt();
}).on('close', () => {
  console.log('HyperFlux.io CLIを終了します');
  process.exit(0);
});
