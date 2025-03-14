#!/usr/bin/env node

const readline = require('readline');
const http = require('http');
const https = require('https');
const { URL } = require('url');

// デフォルト設定
const DEFAULT_NODE_URL = 'http://localhost:54868';

// コマンドライン引数からノードURLを取得
const args = process.argv.slice(2);
const nodeUrl = args.length > 0 ? args[0] : DEFAULT_NODE_URL;

// 対話型インターフェースの設定
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: 'HyperFlux> '
});

// ヘルプメッセージ
const helpMessage = `
利用可能なコマンド:
  help                - このヘルプメッセージを表示
  info                - ノード情報を表示
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
        
      case 'info':
        const info = await makeRequest('GET', '/info');
        console.log('ノード情報:');
        console.log(JSON.stringify(info, null, 2));
        break;
        
      case 'accounts':
        const accounts = await makeRequest('GET', '/accounts');
        console.log('アカウント一覧:');
        console.log(JSON.stringify(accounts, null, 2));
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
          break;
        }
        const fromAccount = parts[1];
        const toAccount = parts[2];
        const amount = parseFloat(parts[3]);
        const tokenId = parts.length > 4 ? parts[4] : null;
        
        const transfer = await makeRequest('POST', '/transfer', {
          from_account_id: fromAccount,
          to_account_id: toAccount,
          amount,
          token_id: tokenId
        });
        
        console.log('送金結果:');
        console.log(JSON.stringify(transfer, null, 2));
        break;
        
      case 'pairs':
        const pairs = await makeRequest('GET', '/dex/pairs');
        console.log('取引ペア一覧:');
        console.log(JSON.stringify(pairs, null, 2));
        break;
        
      case 'orderbook':
        if (parts.length < 3) {
          console.log('エラー: 基準通貨と相手通貨を指定してください');
          break;
        }
        const base = parts[1];
        const quote = parts[2];
        
        const orderbook = await makeRequest('GET', `/dex/orderbook?base=${base}&quote=${quote}`);
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
        
        const order = await makeRequest('POST', '/dex/orders', {
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
console.log(`HyperFlux.io CLI - ノード: ${nodeUrl}`);
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