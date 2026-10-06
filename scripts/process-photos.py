"""
ブックメニュー用の写真を統一する。

  python3 scripts/process-photos.py            … 全写真を処理
  python3 scripts/process-photos.py --sheet    … 確認用の一覧画像 (photos/contact-sheet.jpg) も作る

photos/source/<名前>.jpg を読み、次の処理をして book/photos/<名前>.jpg に書き出す。
  1. 4:3 の横長にトリミング (位置・拡大率は photos/crop.json で商品ごとに調整)
  2. 色味をそろえる (ホワイトバランス・明るさ・コントラスト・彩度を控えめに補正)
料理の形や盛り付けは変えない (補正は色と明るさだけ)。
"""
import json, os, sys
import numpy as np
from PIL import Image, ImageDraw, ImageEnhance, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'photos', 'source')
OUT = os.path.join(ROOT, 'book', 'photos')
CROP_CONFIG = os.path.join(ROOT, 'photos', 'crop.json')

RATIO = 4 / 3
OUT_W = 1200            # 印刷で幅 約90mm × 340dpi
TARGET_LUMA = 0.56      # 明るさのそろえ先 (中央値)


def crop(im, conf):
    """x, y: 切り抜き中心 (0〜1)、zoom: 1 = 4:3 で取れる最大範囲、>1 で寄る"""
    x, y, zoom = conf.get('x', 0.5), conf.get('y', 0.5), conf.get('zoom', 1.0)
    w, h = im.size
    cw = min(w, h * RATIO) / zoom
    ch = cw / RATIO
    left = min(max(x * w - cw / 2, 0), w - cw)
    top = min(max(y * h - ch / 2, 0), h - ch)
    return im.crop((round(left), round(top), round(left + cw), round(top + ch)))


def normalize_color(im):
    a = np.asarray(im).astype(np.float32) / 255
    luma = a @ np.array([0.299, 0.587, 0.114], dtype=np.float32)

    # ホワイトバランス: 中間調の平均がグレーに近づくよう半分だけ寄せる
    mid = (luma > 0.2) & (luma < 0.85)
    means = a[mid].mean(axis=0) if mid.any() else a.reshape(-1, 3).mean(axis=0)
    gains = np.clip(1 + 0.5 * (means.mean() / means - 1), 0.88, 1.12)
    a = np.clip(a * gains, 0, 1)

    # 明るさ: 中央値を目標値へガンマで寄せる
    med = float(np.median(a @ np.array([0.299, 0.587, 0.114], dtype=np.float32)))
    gamma = np.clip(np.log(TARGET_LUMA) / np.log(max(min(med, 0.95), 0.05)), 0.75, 1.3)
    a = a ** gamma

    # 少しだけ暖色に (お店の木のテーブルの雰囲気に合わせる)
    a = np.clip(a * np.array([1.02, 1.0, 0.97], dtype=np.float32), 0, 1)

    out = Image.fromarray((a * 255 + 0.5).astype(np.uint8))
    out = ImageOps.autocontrast(out, cutoff=0.5)
    out = ImageEnhance.Color(out).enhance(1.06)
    return out


def main():
    os.makedirs(OUT, exist_ok=True)
    config = json.load(open(CROP_CONFIG, encoding='utf-8')) if os.path.exists(CROP_CONFIG) else {}
    names = sorted(f for f in os.listdir(SRC) if f.lower().endswith(('.jpg', '.jpeg', '.png')))
    results = []
    for f in names:
        key = os.path.splitext(f)[0]
        im = ImageOps.exif_transpose(Image.open(os.path.join(SRC, f))).convert('RGB')
        out = normalize_color(crop(im, config.get(key, {})))
        if out.width > OUT_W:
            out = out.resize((OUT_W, round(OUT_W / RATIO)), Image.LANCZOS)
        out.save(os.path.join(OUT, key + '.jpg'), quality=86, optimize=True, progressive=True)
        low = out.width < 700
        results.append((key, out))
        print(f'  {key:28} {out.width}x{out.height}{"  ※解像度低め (撮り直し推奨)" if low else ""}')

    # ブック側で「写真がある商品」を判定するための一覧
    with open(os.path.join(OUT, 'manifest.js'), 'w', encoding='utf-8') as fh:
        fh.write('// 自動生成ファイル: scripts/process-photos.py で更新されます\n')
        fh.write('window.BOOK_PHOTOS = ' + json.dumps([k for k, _ in results]) + ';\n')

    if '--sheet' in sys.argv:
        T, cols = 300, 6
        sheet = Image.new('RGB', (cols * T, ((len(results) + cols - 1) // cols) * (round(T / RATIO) + 22)), 'white')
        d = ImageDraw.Draw(sheet)
        for i, (key, im) in enumerate(results):
            x, y = (i % cols) * T, (i // cols) * (round(T / RATIO) + 22)
            sheet.paste(im.resize((T - 6, round((T - 6) / RATIO))), (x + 3, y))
            d.text((x + 4, y + round(T / RATIO) + 4), key, fill='black')
        sheet.save(os.path.join(ROOT, 'photos', 'contact-sheet.jpg'), quality=82)
        print('一覧: photos/contact-sheet.jpg')


if __name__ == '__main__':
    main()
