#!/usr/bin/env python3
"""
HyperFlux.io ロゴギャラリーサーバー
"""

import http.server
import socketserver
import os
import webbrowser
from urllib.parse import urlparse, parse_qs

# ポート設定
PORT = 54869

class LogoGalleryHandler(http.server.SimpleHTTPRequestHandler):
    """ロゴギャラリー用のHTTPハンドラー"""
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=os.path.join(os.getcwd(), "logos"), **kwargs)
    
    def do_GET(self):
        """GETリクエストを処理"""
        # ルートパスの場合はギャラリーにリダイレクト
        if self.path == '/':
            self.path = '/gallery.html'
        return super().do_GET()

def main():
    """メイン関数"""
    # サーバーを起動
    with socketserver.TCPServer(("", PORT), LogoGalleryHandler) as httpd:
        print(f"ロゴギャラリーサーバーを起動しました: http://localhost:{PORT}")
        print("終了するには Ctrl+C を押してください")
        
        # ブラウザでギャラリーを開く
        webbrowser.open(f"http://localhost:{PORT}")
        
        # サーバーを実行
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nサーバーを終了します")
            httpd.shutdown()

if __name__ == "__main__":
    main()