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

// サーバーを作成
const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);
  
  // APIリクエストはノードサーバーに転送
  if (req.url.startsWith('/info') || req.url.startsWith('/transactions')) {
    // CORSヘッダーを設定
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // OPTIONSリクエストに対応
    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      res.end();
      return;
    }
    
    // デモ用のモックレスポンス
    if (req.url === '/info') {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        id: 'node-' + Math.random().toString(36).substring(2, 10),
        status: 'Running',
        tps: Math.random() * 1000 + 500,
        shard_count: 256,
        confirmed_transactions: Math.floor(Math.random() * 10000)
      }));
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
});

// サーバーを起動
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});