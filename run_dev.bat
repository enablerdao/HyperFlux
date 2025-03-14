@echo off
REM 開発環境用の起動スクリプト（Windows用）

REM 環境変数を設定
set RUST_LOG=info

REM ノードサーバーをバックグラウンドで起動
echo ノードサーバーを起動中...
start /B cmd /c "cargo run"

REM ノードサーバーが起動するまで少し待機
timeout /t 2 /nobreak > nul

REM Webサーバーを起動
echo Webサーバーを起動中...
cd web
start /B cmd /c "node server.js"

echo HyperFlux.io 開発サーバーが起動しました
echo ブラウザで http://localhost:57273 にアクセスしてください
echo 終了するには このウィンドウを閉じてください

REM 無限ループで待機
:loop
timeout /t 10 /nobreak > nul
goto loop