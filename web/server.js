const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 57273;

// MIMEタイプのマッピング
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml'
};

// リクエストハンドラ関数（テスト可能にするために分離）
function handleRequest(req, res) {
  console.log(`${req.method} ${req.url}`);
  
  // CORSヘッダーを設定する関数
  function setCorsHeaders(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }
  
  // モックデータを生成する関数
  function generateMockData() {
    return {
      id: 'node-' + Math.random().toString(36).substring(2, 10),
      status: 'Running',
      tps: Math.random() * 1000 + 500,
      shard_count: 256,
      confirmed_transactions: Math.floor(Math.random() * 10000)
    };
  }
  
  // テストデータを生成する関数
  function generateTestData() {
    return {
      id: 'test-node-' + Math.random().toString(36).substring(2, 10),
      status: 'Testing',
      tps: Math.random() * 5000 + 10000, // テストデータは高いTPS
      shard_count: 512, // テストデータは最大シャード数
      confirmed_transactions: Math.floor(Math.random() * 100000 + 50000)
    };
  }
  
  // APIリクエストを処理
  if (req.url.startsWith('/info') || 
      req.url.startsWith('/transactions') || 
      req.url.startsWith('/mock-info') || 
      req.url.startsWith('/mock-transactions') || 
      req.url.startsWith('/test-info') || 
      req.url.startsWith('/test-transactions')) {
    
    // CORSヘッダーを設定
    setCorsHeaders(res);
    
    // OPTIONSリクエストに対応
    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      res.end();
      return;
    }
    
    // モックデータのエンドポイント
    if (req.url === '/mock-info') {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(generateMockData()));
      return;
    }
    
    if (req.url === '/mock-transactions' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      
      req.on('end', () => {
        try {
          const data = JSON.parse(body);
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            id: Math.random().toString(36).substring(2, 10) + '-' + Date.now(),
            status: 'success'
          }));
        } catch (e) {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: 'Invalid JSON' }));
        }
      });
      return;
    }
    
    // テストデータのエンドポイント - 実際のノードデータをシミュレート
    if (req.url === '/test-info') {
      // 実際のノードデータを模倣した固定テストデータ
      const testData = {
        id: 'test-node-' + Math.floor(Math.random() * 1000).toString().padStart(3, '0'),
        status: 'Testing',
        tps: 45678.92,  // 高いTPS値
        shard_count: 512,  // 最大シャード数
        confirmed_transactions: 987654  // 多数のトランザクション
      };
      
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(testData));
      return;
    }
    
    if (req.url === '/test-transactions' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      
      req.on('end', () => {
        try {
          const data = JSON.parse(body);
          
          // 実際のトランザクション処理をシミュレート
          // 実際のノードでは、ここでトランザクションの検証と処理が行われる
          const txId = 'test-tx-' + Date.now().toString(16) + '-' + Math.floor(Math.random() * 1000000).toString(16);
          
          // 処理時間をシミュレート
          setTimeout(() => {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              id: txId,
              status: 'success',
              timestamp: Date.now(),
              shard: Math.floor(Math.random() * 512),
              confirmation_time: Math.random() * 0.5  // 0.5秒以内の確認時間
            }));
          }, 100);  // 100msの処理時間
          
        } catch (e) {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: 'Invalid JSON', details: e.message }));
        }
      });
      return;
    }
    
    // 実ノードのエンドポイント（プロキシとして機能）
    if (req.url === '/info') {
      // 実際のノードに接続を試みる
      const http = require('http');
      
      // ノードサーバーへのリクエスト
      const nodeReq = http.request({
        hostname: 'localhost',
        port: 54868,
        path: '/info',
        method: 'GET',
        timeout: 1000  // 1秒のタイムアウト
      }, (nodeRes) => {
        let data = '';
        
        nodeRes.on('data', (chunk) => {
          data += chunk;
        });
        
        nodeRes.on('end', () => {
          try {
            // ノードからのレスポンスをそのまま返す
            res.setHeader('Content-Type', 'application/json');
            res.end(data);
          } catch (e) {
            // JSONパースエラーなどの場合はフォールバック
            console.error('Error parsing node response:', e);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              id: 'node-' + Math.random().toString(36).substring(2, 10),
              status: 'Error',
              tps: 0,
              shard_count: 256,
              confirmed_transactions: 0,
              error: 'Failed to parse node response'
            }));
          }
        });
      });
      
      nodeReq.on('error', (e) => {
        console.error('Error connecting to node:', e);
        // ノード接続エラーの場合はエラーステータスを返す
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          id: 'node-offline',
          status: 'Offline',
          tps: 0,
          shard_count: 256,
          confirmed_transactions: 0,
          error: e.message
        }));
      });
      
      nodeReq.on('timeout', () => {
        nodeReq.destroy();
        // タイムアウトの場合もエラーステータスを返す
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          id: 'node-timeout',
          status: 'Timeout',
          tps: 0,
          shard_count: 256,
          confirmed_transactions: 0,
          error: 'Connection timeout'
        }));
      });
      
      nodeReq.end();
      return;
    }
    
    if (req.url === '/transactions' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      
      req.on('end', () => {
        try {
          const data = JSON.parse(body);
          
          // 実際のノードに接続を試みる
          const http = require('http');
          
          const nodeReq = http.request({
            hostname: 'localhost',
            port: 54868,
            path: '/transactions',
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            timeout: 2000  // 2秒のタイムアウト
          }, (nodeRes) => {
            let responseData = '';
            
            nodeRes.on('data', (chunk) => {
              responseData += chunk;
            });
            
            nodeRes.on('end', () => {
              try {
                // ノードからのレスポンスをそのまま返す
                res.setHeader('Content-Type', 'application/json');
                res.end(responseData);
              } catch (e) {
                // JSONパースエラーなどの場合はフォールバック
                console.error('Error parsing node response:', e);
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                  id: 'error-' + Date.now(),
                  status: 'error',
                  error: 'Failed to parse node response'
                }));
              }
            });
          });
          
          nodeReq.on('error', (e) => {
            console.error('Error connecting to node:', e);
            // ノード接続エラーの場合はエラーステータスを返す
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              id: 'error-' + Date.now(),
              status: 'error',
              error: e.message
            }));
          });
          
          nodeReq.on('timeout', () => {
            nodeReq.destroy();
            // タイムアウトの場合もエラーステータスを返す
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              id: 'error-' + Date.now(),
              status: 'error',
              error: 'Connection timeout'
            }));
          });
          
          // リクエストボディを送信
          nodeReq.write(JSON.stringify(data));
          nodeReq.end();
          
        } catch (e) {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: 'Invalid JSON', details: e.message }));
        }
      });
      return;
    }
  }
  
  // 静的ファイルの提供
  let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
  const extname = path.extname(filePath);
  let contentType = MIME_TYPES[extname] || 'application/octet-stream';
  
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // ファイルが見つからない場合は404を返す
        fs.readFile(path.join(__dirname, '404.html'), (err, content) => {
          res.writeHead(404, { 'Content-Type': 'text/html' });
          res.end(content || '404 Not Found');
        });
      } else {
        // サーバーエラーの場合は500を返す
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      // 成功した場合はファイルを返す
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });

// サーバーを作成
const server = http.createServer(handleRequest);

// モジュールとして実行された場合のみサーバーを起動
if (require.main === module) {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}/`);
  });
}

// テスト用にエクスポート
module.exports = {
  handleRequest
};