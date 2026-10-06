"""
ブックメニュー用の写真を統一する。

  python3 scripts/process-photos.py            … 全写真を処理
  python3 scripts/process-photos.py --sheet    … 確認用の一覧画像 (photos/contact-sheet.jpg) も作る

photos/source/<名前>.jpg を読み、次の処理をして book/photos/<名前>.jpg に書き出す。
  1. 色味をそろえる (ホワイトバランス・明るさ・コントラスト・彩度を控えめに補正)
  2. 長辺 1600px に縮小 (構図は切り抜かず、元写真のまま)
切り抜きはメニュー側で表示する枠に合わせて1回だけ行う。どこを中心に切り抜くか (x, y) と
拡大率 (zoom) は photos/crop.json で商品ごとに調整し、book/photos/manifest.js に書き出す。
料理の形や盛り付けは変えない (補正は色と明るさだけ)。
"""
import json, os, sys
import numpy as np
from PIL import Image, ImageDraw, ImageEnhance, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'photos', 'source')
OUT = os.path.join(ROOT, 'book', 'photos')
CROP_CONFIG = os.path.join(ROOT, 'photos', 'crop.json')

MAX_EDGE = 1600         # 印刷で幅 約120mm × 340dpi
RATIO = 4 / 3           # 確認用一覧の枠
TARGET_LUMA = 0.56      # 明るさのそろえ先 (中央値)


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


def preview(im, f, w, h):
    """メニューの表示 (object-fit: cover + 中心 + 拡大率) と同じ切り抜き"""
    scale = max(w / im.width, h / im.height) * f['zoom']
    r = im.resize((round(im.width * scale), round(im.height * scale)))
    left = min(max(f['x'] * r.width - w / 2, 0), r.width - w)
    top = min(max(f['y'] * r.height - h / 2, 0), r.height - h)
    return r.crop((round(left), round(top), round(left) + w, round(top) + h))


def main():
    os.makedirs(OUT, exist_ok=True)
    config = json.load(open(CROP_CONFIG, encoding='utf-8')) if os.path.exists(CROP_CONFIG) else {}
    names = sorted(f for f in os.listdir(SRC) if f.lower().endswith(('.jpg', '.jpeg', '.png')))
    results = []
    focus = {}
    for f in names:
        key = os.path.splitext(f)[0]
        im = ImageOps.exif_transpose(Image.open(os.path.join(SRC, f))).convert('RGB')
        out = normalize_color(im)
        out.thumbnail((MAX_EDGE, MAX_EDGE), Image.LANCZOS)
        out.save(os.path.join(OUT, key + '.jpg'), quality=86, optimize=True, progressive=True)
        low = min(out.size) < 700
        conf = config.get(key, {})
        focus[key] = {'x': conf.get('x', 0.5), 'y': conf.get('y', 0.5), 'zoom': conf.get('zoom', 1)}
        results.append((key, out))
        print(f'  {key:28} {out.width}x{out.height}{"  ※解像度低め (撮り直し推奨)" if low else ""}')

    # ブック側で「写真がある商品」を判定するための一覧
    with open(os.path.join(OUT, 'manifest.js'), 'w', encoding='utf-8') as fh:
        fh.write('// 自動生成ファイル: scripts/process-photos.py で更新されます\n')
        fh.write('// 写真ごとの切り抜きの中心 (x, y: 0〜1) と拡大率 (zoom)。photos/crop.json から\n')
        fh.write('window.BOOK_PHOTOS = ' + json.dumps(focus, ensure_ascii=False, indent=1) + ';\n')

    if '--sheet' in sys.argv:
        T, cols = 300, 6
        sheet = Image.new('RGB', (cols * T, ((len(results) + cols - 1) // cols) * (round(T / RATIO) + 22)), 'white')
        d = ImageDraw.Draw(sheet)
        for i, (key, im) in enumerate(results):
            x, y = (i % cols) * T, (i // cols) * (round(T / RATIO) + 22)
            sheet.paste(preview(im, focus[key], T - 6, round((T - 6) / RATIO)), (x + 3, y))
            d.text((x + 4, y + round(T / RATIO) + 4), key, fill='black')
        sheet.save(os.path.join(ROOT, 'photos', 'contact-sheet.jpg'), quality=82)
        print('一覧: photos/contact-sheet.jpg')


if __name__ == '__main__':
    main()
