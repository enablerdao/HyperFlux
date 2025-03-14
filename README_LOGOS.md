# HyperFlux.io ロゴ選択ガイド

## 概要

このリポジトリには、HyperFlux.ioプロジェクト用に生成された50種類のロゴが含まれています。様々なスタイルと形状のロゴから、プロジェクトに最適なものを選択してください。

## ロゴギャラリーの表示方法

### 方法1: ウェブサーバーを使用する（推奨）

以下のコマンドを実行して、ロゴギャラリーを表示するためのウェブサーバーを起動します：

```bash
cd /workspace/HyperFlux.io
python3 serve_logos.py
```

これにより、ブラウザが自動的に開き、ロゴギャラリーが表示されます。表示されない場合は、手動でブラウザを開き、以下のURLにアクセスしてください：

```
http://localhost:54869
```

### 方法2: HTMLファイルを直接開く

`logos/gallery.html` ファイルをブラウザで直接開くこともできます。

## ロゴの選択方法

1. ギャラリーページで、気に入ったロゴをクリックします。
2. 選択したロゴが画面左側に表示されます。
3. 「SVGをダウンロード」ボタンをクリックしてロゴをダウンロードするか、「パスをコピー」ボタンをクリックしてファイルパスをコピーします。

## フィルター機能

ロゴは以下の基準でフィルタリングできます：

- **スタイル**: minimal, geometric, wave, circuit, tech, gradient, flat, 3d, retro, futuristic
- **形状**: circle, square, rounded, hexagon, shield, custom

## 選択したロゴの使用方法

選択したロゴを使用するには、以下の手順に従ってください：

1. 選択したロゴのSVGファイルを `/workspace/HyperFlux.io/web/assets/logo.svg` にコピーします：

```bash
cp /workspace/HyperFlux.io/logos/選択したロゴのファイル名 /workspace/HyperFlux.io/web/assets/logo.svg
```

2. 必要に応じて、ファビコンとしても使用できます：

```bash
cp /workspace/HyperFlux.io/logos/選択したロゴのファイル名 /workspace/HyperFlux.io/web/assets/favicon.svg
```

3. 変更をコミットしてプッシュします：

```bash
cd /workspace/HyperFlux.io
git add web/assets/logo.svg web/assets/favicon.svg
git commit -m "Update logo and favicon"
git push origin main
```

## カスタムロゴの作成

さらに多くのバリエーションが必要な場合は、ロゴジェネレーターを再実行できます：

```bash
cd /workspace/HyperFlux.io
python3 logo_generator.py
```

これにより、新しい50種類のロゴが生成されます。

## 技術的な詳細

ロゴは以下の技術を使用して生成されています：

- SVG (Scalable Vector Graphics)
- グラデーション効果
- レスポンシブデザイン（ダークモード対応）
- 様々なスタイルと形状のバリエーション

各ロゴは、HyperFlux.ioのビジョンである「トランザクションが川の流れのように速く、スムーズに動くブロックチェーン」を表現するようにデザインされています。