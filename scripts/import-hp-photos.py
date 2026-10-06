"""
ホームページ (../cafe-apart-hp) の git 履歴から、メニュー写真の最も解像度が高い版を
photos/source/ に取り込む。HP の写真は圧縮されているが、履歴には元写真が残っているため。

  python3 scripts/import-hp-photos.py [HPリポジトリのパス]

ファイル名はスプレッドシートの img 列のファイル名を slug 化したもの
(例: "Egg Sandwich HALF.jpg" → egg-sandwich-half.jpg)。
撮り直した写真は、同じ名前で photos/source/ に置けば差し替わる。
"""
import csv, io, os, re, subprocess, sys
from PIL import Image, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HP = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, '..', 'cafe-apart-hp'))
OUT = os.path.join(ROOT, 'photos', 'source')
MAX_EDGE = 2400

# スプレッドシートの img 名と、HP 上の実ファイル名が違うもの
FILE_ALIASES = {'creamy-salmon.jpg': 'salmon-cream-udon.jpg'}


def slug(filename):
    base = os.path.splitext(os.path.basename(filename.replace('\\', '/')))[0]
    return re.sub(r'[^a-z0-9]+', '-', base.lower()).strip('-')


def git(*args):
    return subprocess.run(['git', '-C', HP, *args], capture_output=True, check=True).stdout


def best_version(path):
    best = None
    for commit in git('log', '--format=%h', '--all', '--', path).decode().split():
        try:
            data = git('show', f'{commit}:{path}')
        except subprocess.CalledProcessError:
            continue
        w, h = Image.open(io.BytesIO(data)).size
        if not best or w * h > best[0]:
            best = (w * h, data)
    return best and best[1]


def main():
    os.makedirs(OUT, exist_ok=True)
    with open(os.path.join(ROOT, 'data', 'menu.csv'), encoding='utf-8') as f:
        rows = [r for r in csv.DictReader(f) if r.get('img')]
    for r in rows:
        name = os.path.basename(r['img'].replace('\\', '/'))
        data = best_version('assets/images/' + FILE_ALIASES.get(name, name))
        if not data:
            print(f'  見つからない: {r["title"]} ({name})')
            continue
        im = ImageOps.exif_transpose(Image.open(io.BytesIO(data))).convert('RGB')
        im.thumbnail((MAX_EDGE, MAX_EDGE), Image.LANCZOS)
        dest = os.path.join(OUT, slug(name) + '.jpg')
        im.save(dest, quality=92)
        print(f'  {r["title"]:24} → photos/source/{slug(name)}.jpg ({im.width}x{im.height})')


if __name__ == '__main__':
    main()
