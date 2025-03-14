#!/usr/bin/env python3
"""
HyperFlux.io ロゴジェネレーター
様々なスタイルのロゴを生成します
"""

import os
import random
import math
import colorsys
from typing import List, Tuple, Dict, Any

# ロゴを保存するディレクトリを作成
os.makedirs("logos", exist_ok=True)

# カラーパレット
COLOR_PALETTES = [
    # グラデーションパレット
    [("#6a11cb", "#2575fc"), ("#FF416C", "#FF4B2B"), ("#8E2DE2", "#4A00E0"), ("#4776E6", "#8E54E9")],
    # フラットパレット
    [("#3498db", "#2980b9"), ("#2ecc71", "#27ae60"), ("#e74c3c", "#c0392b"), ("#9b59b6", "#8e44ad")],
    # ダークパレット
    [("#2c3e50", "#4ca1af"), ("#000428", "#004e92"), ("#434343", "#000000"), ("#232526", "#414345")],
    # ライトパレット
    [("#ddd6f3", "#faaca8"), ("#fdfcfb", "#e2d1c3"), ("#74ebd5", "#ACB6E5"), ("#ff9a9e", "#fad0c4")],
    # ビビッドパレット
    [("#ff0844", "#ffb199"), ("#fbab7e", "#f7ce68"), ("#0acffe", "#495aff"), ("#f857a6", "#ff5858")]
]

# フォントファミリー
FONT_FAMILIES = [
    "Arial, sans-serif", 
    "'Segoe UI', sans-serif", 
    "Roboto, sans-serif", 
    "Helvetica, sans-serif", 
    "'Open Sans', sans-serif",
    "'Montserrat', sans-serif",
    "'Raleway', sans-serif",
    "'Poppins', sans-serif",
    "'Ubuntu', sans-serif",
    "'Lato', sans-serif"
]

# ロゴスタイル
LOGO_STYLES = [
    "minimal",       # ミニマルスタイル
    "geometric",     # 幾何学的スタイル
    "wave",          # 波形スタイル
    "circuit",       # 回路スタイル
    "tech",          # テクノロジースタイル
    "gradient",      # グラデーションスタイル
    "flat",          # フラットスタイル
    "3d",            # 3Dスタイル
    "retro",         # レトロスタイル
    "futuristic"     # 未来的スタイル
]

# ロゴ形状
LOGO_SHAPES = [
    "circle",        # 円形
    "square",        # 四角形
    "rounded",       # 角丸四角形
    "hexagon",       # 六角形
    "shield",        # シールド形
    "custom"         # カスタム形状
]

def generate_logo_svg(index: int, style: str, shape: str, colors: Tuple[str, str], font: str) -> str:
    """SVGロゴを生成する関数"""
    width, height = 500, 500
    svg = f'<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n'
    svg += f'<svg width="{width}" height="{height}" viewBox="0 0 {width} {height}" fill="none" xmlns="http://www.w3.org/2000/svg">\n'
    
    # スタイルを追加
    svg += '  <style>\n'
    svg += f'    .text {{ font-family: {font}; font-weight: bold; }}\n'
    svg += '    .gradient-bg { fill: url(#gradient); }\n'
    svg += '    @media (prefers-color-scheme: dark) {\n'
    svg += '      .text { fill: white; }\n'
    svg += '    }\n'
    svg += '  </style>\n'
    
    # グラデーション定義
    svg += '  <defs>\n'
    svg += f'    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">\n'
    svg += f'      <stop offset="0%" stop-color="{colors[0]}" />\n'
    svg += f'      <stop offset="100%" stop-color="{colors[1]}" />\n'
    svg += '    </linearGradient>\n'
    
    # 波形グラデーション
    if style in ["wave", "tech", "futuristic"]:
        svg += '    <linearGradient id="waveGradient" x1="0%" y1="0%" x2="0%" y2="100%">\n'
        svg += f'      <stop offset="0%" stop-color="{colors[0]}" stop-opacity="0.8" />\n'
        svg += f'      <stop offset="100%" stop-color="{colors[1]}" stop-opacity="0.2" />\n'
        svg += '    </linearGradient>\n'
    
    svg += '  </defs>\n'
    
    # 背景形状
    if shape == "circle":
        svg += f'  <circle cx="{width/2}" cy="{height/2}" r="{min(width, height)/2 - 10}" class="gradient-bg" />\n'
    elif shape == "square":
        svg += f'  <rect x="10" y="10" width="{width-20}" height="{height-20}" class="gradient-bg" />\n'
    elif shape == "rounded":
        svg += f'  <rect x="10" y="10" width="{width-20}" height="{height-20}" rx="60" class="gradient-bg" />\n'
    elif shape == "hexagon":
        points = []
        for i in range(6):
            angle = i * math.pi / 3
            x = width/2 + (width/2 - 20) * math.cos(angle)
            y = height/2 + (height/2 - 20) * math.sin(angle)
            points.append(f"{x},{y}")
        svg += f'  <polygon points="{" ".join(points)}" class="gradient-bg" />\n'
    elif shape == "shield":
        svg += f'  <path d="M{width/2},{20} L{width-20},{height/4} C{width-20},{height/2} {width/2},{height-20} {width/2},{height-20} C{width/2},{height-20} {20},{height/2} {20},{height/4} Z" class="gradient-bg" />\n'
    else:  # custom
        if style == "minimal":
            svg += f'  <rect x="50" y="50" width="{width-100}" height="{height-100}" rx="20" class="gradient-bg" />\n'
        elif style == "geometric":
            points = []
            sides = random.randint(5, 8)
            for i in range(sides):
                angle = i * 2 * math.pi / sides
                x = width/2 + (width/2 - 30) * math.cos(angle)
                y = height/2 + (height/2 - 30) * math.sin(angle)
                points.append(f"{x},{y}")
            svg += f'  <polygon points="{" ".join(points)}" class="gradient-bg" />\n'
        else:
            svg += f'  <rect x="10" y="10" width="{width-20}" height="{height-20}" rx="40" class="gradient-bg" />\n'
    
    # スタイル固有の要素
    if style == "wave":
        # 波形
        for i in range(3):
            opacity = 1.0 - i * 0.3
            y_offset = 250 + i * 40
            svg += f'  <path d="M0,{y_offset} C50,{y_offset-40} 100,{y_offset-50} 150,{y_offset-30} C200,{y_offset-10} 250,{y_offset-40} 300,{y_offset-20} C350,{y_offset} 400,{y_offset-30} 500,{y_offset-10}" \n'
            svg += f'        stroke="white" stroke-width="{15-i*3}" fill="none" stroke-linecap="round" stroke-opacity="{opacity}" />\n'
    
    elif style == "circuit":
        # 回路パターン
        for i in range(10):
            x1, y1 = random.randint(50, width-50), random.randint(50, height-50)
            x2, y2 = random.randint(50, width-50), random.randint(50, height-50)
            svg += f'  <line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="white" stroke-width="2" stroke-opacity="0.3" />\n'
            svg += f'  <circle cx="{x1}" cy="{y1}" r="5" fill="white" fill-opacity="0.5" />\n'
            svg += f'  <circle cx="{x2}" cy="{y2}" r="5" fill="white" fill-opacity="0.5" />\n'
    
    elif style == "tech":
        # テクノロジーパターン
        for i in range(5):
            cx, cy = width/2, height/2
            r = 50 + i * 30
            svg += f'  <circle cx="{cx}" cy="{cy}" r="{r}" stroke="white" stroke-width="2" fill="none" stroke-opacity="{0.8-i*0.15}" />\n'
            
            # 接続線
            for j in range(3):
                angle = random.uniform(0, 2 * math.pi)
                x1 = cx + r * math.cos(angle)
                y1 = cy + r * math.sin(angle)
                x2 = cx + (r + 30) * math.cos(angle)
                y2 = cy + (r + 30) * math.sin(angle)
                svg += f'  <line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="white" stroke-width="2" stroke-opacity="0.3" />\n'
    
    elif style == "3d":
        # 3D効果
        offset = 15
        if shape == "circle":
            svg += f'  <circle cx="{width/2+offset}" cy="{height/2+offset}" r="{min(width, height)/2 - 10}" fill="rgba(0,0,0,0.3)" />\n'
        elif shape in ["square", "rounded"]:
            rx = 0 if shape == "square" else 60
            svg += f'  <rect x="{10+offset}" y="{10+offset}" width="{width-20}" height="{height-20}" rx="{rx}" fill="rgba(0,0,0,0.3)" />\n'
    
    elif style == "retro":
        # レトロパターン
        for i in range(5):
            svg += f'  <rect x="{50+i*20}" y="{50+i*20}" width="{width-100-i*40}" height="{height-100-i*40}" fill="none" stroke="white" stroke-width="2" stroke-opacity="{0.8-i*0.15}" />\n'
    
    elif style == "futuristic":
        # 未来的パターン
        svg += f'  <path d="M{width/4},{height/4} L{width*3/4},{height/4} L{width*3/4},{height*3/4} L{width/4},{height*3/4} Z" fill="none" stroke="white" stroke-width="2" stroke-opacity="0.5" />\n'
        svg += f'  <path d="M{width/4-20},{height/4-20} L{width*3/4+20},{height/4-20} L{width*3/4+20},{height*3/4+20} L{width/4-20},{height*3/4+20} Z" fill="none" stroke="white" stroke-width="1" stroke-opacity="0.3" />\n'
        
        # 波形
        svg += f'  <path d="M{width/4},{height*2/3} C{width*3/8},{height*2/3-30} {width*5/8},{height*2/3+30} {width*3/4},{height*2/3}" stroke="white" stroke-width="3" fill="none" />\n'
    
    # ロゴテキスト
    if style in ["minimal", "flat"]:
        # シンプルなテキスト配置
        svg += f'  <text x="{width/2}" y="{height/2-20}" font-size="60" text-anchor="middle" class="text">HyperFlux</text>\n'
        svg += f'  <text x="{width/2}" y="{height/2+40}" font-size="40" text-anchor="middle" class="text">.io</text>\n'
    elif style in ["geometric", "tech", "3d"]:
        # 中央配置
        svg += f'  <text x="{width/2}" y="{height/2}" font-size="60" text-anchor="middle" class="text">HF</text>\n'
    elif style in ["wave", "circuit"]:
        # 上部配置
        svg += f'  <text x="{width/2}" y="{height/3}" font-size="60" text-anchor="middle" class="text">HyperFlux</text>\n'
        svg += f'  <text x="{width/2}" y="{height/3+60}" font-size="40" text-anchor="middle" class="text">.io</text>\n'
    else:
        # デフォルト配置
        svg += f'  <text x="{width/2}" y="{height/2-20}" font-size="50" text-anchor="middle" class="text">HyperFlux</text>\n'
        svg += f'  <text x="{width/2}" y="{height/2+40}" font-size="30" text-anchor="middle" class="text">.io</text>\n'
    
    svg += '</svg>'
    return svg

def main():
    """メイン関数"""
    logo_count = 50
    logos_info = []
    
    for i in range(logo_count):
        # ランダムなスタイル、形状、色、フォントを選択
        style = random.choice(LOGO_STYLES)
        shape = random.choice(LOGO_SHAPES)
        palette = random.choice(COLOR_PALETTES)
        colors = random.choice(palette)
        font = random.choice(FONT_FAMILIES)
        
        # ロゴを生成
        svg_content = generate_logo_svg(i, style, shape, colors, font)
        
        # ファイルに保存
        filename = f"logos/logo_{i+1:02d}_{style}_{shape}.svg"
        with open(filename, "w", encoding="utf-8") as f:
            f.write(svg_content)
        
        # ロゴ情報を記録
        logos_info.append({
            "id": i+1,
            "filename": filename,
            "style": style,
            "shape": shape,
            "colors": colors,
            "font": font
        })
    
    # HTMLギャラリーを生成
    generate_gallery_html(logos_info)
    
    print(f"{logo_count}個のロゴを生成しました。")
    print("logos/gallery.htmlを開いて選択してください。")

def generate_gallery_html(logos_info: List[Dict[str, Any]]):
    """ロゴギャラリーのHTMLを生成する関数"""
    html = """<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HyperFlux.io ロゴギャラリー</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f8f9fa;
            padding: 20px;
        }
        .logo-card {
            cursor: pointer;
            transition: all 0.3s ease;
            margin-bottom: 20px;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .logo-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
        }
        .logo-card.selected {
            border: 3px solid #6a11cb;
            transform: scale(1.05);
        }
        .logo-container {
            background-color: white;
            padding: 20px;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 250px;
        }
        .logo-container img {
            max-width: 100%;
            max-height: 200px;
        }
        .logo-info {
            padding: 15px;
            background-color: #f8f9fa;
            border-top: 1px solid #e9ecef;
        }
        .header {
            background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
            color: white;
            padding: 2rem 0;
            margin-bottom: 2rem;
            border-radius: 10px;
        }
        .filters {
            margin-bottom: 20px;
            padding: 15px;
            background-color: white;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        #selected-logo-display {
            position: sticky;
            top: 20px;
            background-color: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            margin-bottom: 20px;
            display: none;
        }
        #selected-logo-display img {
            max-width: 100%;
            max-height: 300px;
        }
        .download-btn {
            margin-top: 15px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header text-center">
            <h1>HyperFlux.io ロゴギャラリー</h1>
            <p class="lead">以下の50種類のロゴから選択してください</p>
        </div>
        
        <div class="row">
            <div class="col-md-3">
                <div id="selected-logo-display">
                    <h4>選択したロゴ</h4>
                    <div id="selected-logo-container" class="text-center"></div>
                    <div id="selected-logo-info" class="mt-3"></div>
                    <div class="d-grid gap-2">
                        <button id="download-svg" class="btn btn-primary download-btn">SVGをダウンロード</button>
                        <button id="copy-path" class="btn btn-secondary download-btn">パスをコピー</button>
                    </div>
                </div>
                
                <div class="filters">
                    <h4>フィルター</h4>
                    <div class="mb-3">
                        <label for="style-filter" class="form-label">スタイル</label>
                        <select id="style-filter" class="form-select">
                            <option value="">すべて</option>
"""
    
    # スタイルオプションを追加
    for style in LOGO_STYLES:
        html += f'                            <option value="{style}">{style}</option>\n'
    
    html += """                        </select>
                    </div>
                    <div class="mb-3">
                        <label for="shape-filter" class="form-label">形状</label>
                        <select id="shape-filter" class="form-select">
                            <option value="">すべて</option>
"""
    
    # 形状オプションを追加
    for shape in LOGO_SHAPES:
        html += f'                            <option value="{shape}">{shape}</option>\n'
    
    html += """                        </select>
                    </div>
                    <button id="reset-filters" class="btn btn-outline-secondary w-100">フィルターをリセット</button>
                </div>
            </div>
            
            <div class="col-md-9">
                <div class="row" id="logo-gallery">
"""
    
    # ロゴカードを追加
    for logo in logos_info:
        html += f"""                    <div class="col-md-4 logo-card-container" data-style="{logo['style']}" data-shape="{logo['shape']}">
                        <div class="logo-card" data-id="{logo['id']}" data-filename="{logo['filename']}">
                            <div class="logo-container">
                                <img src="{logo['filename']}" alt="Logo {logo['id']}">
                            </div>
                            <div class="logo-info">
                                <h5>Logo {logo['id']}</h5>
                                <p class="mb-1"><strong>スタイル:</strong> {logo['style']}</p>
                                <p class="mb-1"><strong>形状:</strong> {logo['shape']}</p>
                            </div>
                        </div>
                    </div>
"""
    
    html += """                </div>
            </div>
        </div>
    </div>
    
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            // ロゴ選択の処理
            const logoCards = document.querySelectorAll('.logo-card');
            const selectedLogoDisplay = document.getElementById('selected-logo-display');
            const selectedLogoContainer = document.getElementById('selected-logo-container');
            const selectedLogoInfo = document.getElementById('selected-logo-info');
            const downloadSvgBtn = document.getElementById('download-svg');
            const copyPathBtn = document.getElementById('copy-path');
            
            let selectedLogo = null;
            
            logoCards.forEach(card => {
                card.addEventListener('click', function() {
                    // 以前の選択をクリア
                    logoCards.forEach(c => c.classList.remove('selected'));
                    
                    // 新しい選択を設定
                    this.classList.add('selected');
                    selectedLogo = {
                        id: this.dataset.id,
                        filename: this.dataset.filename
                    };
                    
                    // 選択したロゴを表示
                    selectedLogoDisplay.style.display = 'block';
                    selectedLogoContainer.innerHTML = `<img src="${selectedLogo.filename}" alt="Selected Logo">`;
                    selectedLogoInfo.innerHTML = `
                        <p class="mb-1"><strong>ロゴID:</strong> ${selectedLogo.id}</p>
                        <p class="mb-1"><strong>ファイル名:</strong> ${selectedLogo.filename}</p>
                    `;
                    
                    // スクロール
                    selectedLogoDisplay.scrollIntoView({ behavior: 'smooth', block: 'start' });
                });
            });
            
            // ダウンロードボタンの処理
            downloadSvgBtn.addEventListener('click', function() {
                if (selectedLogo) {
                    const link = document.createElement('a');
                    link.href = selectedLogo.filename;
                    link.download = `hyperflux_logo_${selectedLogo.id}.svg`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }
            });
            
            // パスコピーボタンの処理
            copyPathBtn.addEventListener('click', function() {
                if (selectedLogo) {
                    navigator.clipboard.writeText(selectedLogo.filename).then(() => {
                        alert('パスをクリップボードにコピーしました！');
                    }).catch(err => {
                        console.error('クリップボードへのコピーに失敗しました:', err);
                    });
                }
            });
            
            // フィルター処理
            const styleFilter = document.getElementById('style-filter');
            const shapeFilter = document.getElementById('shape-filter');
            const resetFiltersBtn = document.getElementById('reset-filters');
            
            function applyFilters() {
                const styleValue = styleFilter.value;
                const shapeValue = shapeFilter.value;
                
                document.querySelectorAll('.logo-card-container').forEach(container => {
                    const style = container.dataset.style;
                    const shape = container.dataset.shape;
                    
                    const styleMatch = !styleValue || style === styleValue;
                    const shapeMatch = !shapeValue || shape === shapeValue;
                    
                    if (styleMatch && shapeMatch) {
                        container.style.display = 'block';
                    } else {
                        container.style.display = 'none';
                    }
                });
            }
            
            styleFilter.addEventListener('change', applyFilters);
            shapeFilter.addEventListener('change', applyFilters);
            
            resetFiltersBtn.addEventListener('click', function() {
                styleFilter.value = '';
                shapeFilter.value = '';
                applyFilters();
            });
        });
    </script>
</body>
</html>
"""
    
    with open("logos/gallery.html", "w", encoding="utf-8") as f:
        f.write(html)

if __name__ == "__main__":
    main()