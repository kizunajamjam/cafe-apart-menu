/**
 * cafe apart - ブックメニュー レンダリング
 * data/menu-data.js (window.MENU_DATA) と photos/manifest.js (window.BOOK_PHOTOS) から各ページを生成する。
 * 写真がある商品は写真カード、ない商品は文字だけのリストで載せる (ドリンクは写真なし)。
 */

// ページ構成。
// フード・スイーツは種類と雰囲気でグループ分けする (items: スプレッドシートの商品名)。
// どのグループにも入っていない商品は、rest: true のグループ (「その他」) に自動で入る。
// cols は写真カードの列数。photos: false のセクションは写真を使わず文字だけで載せる。
const PAGES = [
    { type: 'cover' },
    { label: 'Food', sub: 'フード', sections: [
        { key: 'food', cols: 3, title: 'Curry & Udon', sub: 'カレー・うどん', mood: 'しっかり食べたい日に',
          items: ['華麗なカレーとドライなカレー', '華麗なカレーと激ウマバケット', 'クリームどんちゃん'] },
        { key: 'food', cols: 3, title: 'Toast', sub: 'トースト', mood: 'ブランチにぴったりの一皿',
          items: ['ブルーチーズバナナトースト', 'ピザトースト(バゲット)', 'ブルックリンブランチ'] },
    ] },
    { label: 'Food', sub: 'フード', sections: [
        { key: 'food', cols: 3, title: 'Sandwich & Hotdog', sub: 'サンド・ホットドッグ', mood: '片手で気軽に',
          items: ['ニューヨークホットドック', 'あんバターサンド', 'たまごっちサンド'] },
        { key: 'food', cols: 3, title: 'Light & Side', sub: '軽食・サイド', mood: '小腹がすいた時や、みんなでシェアに',
          items: ['バタートースト', 'たまごっちハーフ', 'マクドみたいなポテト', 'ポテトチップス'] },
        { key: 'food', cols: 3, title: 'Others', sub: 'その他', rest: true },
    ] },
    { label: 'Sweets', sub: 'スイーツ', sections: [
        { key: 'sweets', cols: 2, title: 'Crepe', sub: 'クレープ', mood: '甘いひとときに',
          items: ['クレープ', 'シングルクレープ（バナナ）', 'シングルクレープ（レモン）', 'シングルクレープ(白玉抹茶)'] },
    ] },
    { label: 'Sweets', sub: 'スイーツ', sections: [
        { key: 'sweets', cols: 2, title: 'Cake & Baked', sub: 'ケーキ・焼き菓子', mood: 'コーヒーや紅茶のお供に',
          items: ['手作りキャロットケーキ', 'チーズケーキ', '手作りフロランタン', '手作り焦がしミルクチョコブラウニー'] },
    ] },
    { label: 'Sweets', sub: 'スイーツ', sections: [
        { key: 'sweets', cols: 2, title: 'Ice & Parfait', sub: 'アイス・パフェ', mood: 'ひんやり冷たいデザート',
          items: ['アイスクリーム', 'チャンキーアイスクリーム', 'アフォガート', 'ティラミス風パフェ'] },
        { key: 'sweets', cols: 2, title: 'Others', sub: 'その他', rest: true },
        { key: 'limited', cols: 2, title: 'Limited', sub: '期間限定', mood: 'いまだけのお楽しみ' },
    ] },
    { label: 'Drinks', sub: 'ドリンク', sections: [
        { key: 'drink', photos: false, title: 'Coffee & Drinks', sub: 'コーヒー・ドリンク' },
    ] },
    // T2 は1ページの特集。large: 1列・大きめの文字
    { label: 'T2 Tea', sub: 'オーストラリア発の紅茶ブランド',
      intro: 'cafe apart は、オーストラリア発の紅茶ブランド「T2」の取扱い店です。\n香りの違うティーを、カップでもポットでもお楽しみいただけます。',
      sections: [
        { key: 't2', photos: false, large: true, groupPrice: true, title: 'Tea Selection', sub: 'ティーセレクション',
          items: ['ふんわりバニラのメルボルンブレックファースト', 'フローラルなフレンチアールグレイ', 'フルーティーなパックス・ア・ピーチ', 'スパイシーなオーガニックチャイ'] },
        { key: 't2', photos: false, large: true, title: 'Arrange', sub: 'アレンジティー', rest: true },
    ] },
];
// 店舗情報は表紙の下に載せる (8ページ = 4の倍数で中綴じできるよう、裏表紙は作らない)

// スプレッドシート（ホームページ）には載せるが、メニューには出さない品目
const HIDDEN_TITLES = ['頑張るアルバイトさん'];

const SHOP = {
    address: '大阪府茨木市駅前4-6-7（JR・阪急茨木駅 徒歩10分）',
    hours: '9:30 – 18:30（L.O. 18:00）',
    closed: '定休日：火曜日',
    instagram: '@cafe.apart',
};

const escapeHtml = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const formatPrice = price => (price || '').replace(/\d{4,}/g, m => parseInt(m, 10).toLocaleString());

// scripts/import-hp-photos.py と同じ規則でファイル名を slug 化
const photoKey = img => {
    const base = (img || '').replace(/\\/g, '/').split('/').pop().replace(/\.[^.]+$/, '');
    return base.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
};
const photos = new Set(window.BOOK_PHOTOS || []);
const hasPhoto = it => photos.has(photoKey(it.img));

// 2品以上で共通する最頻値 (価格・英語名)。共通価格は見出しに出し、共通の英語名は省略する
function commonValue(items, field) {
    const counts = {};
    items.forEach(it => { if (it[field]) counts[it[field]] = (counts[it[field]] || 0) + 1; });
    const [top] = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return top && top[1] > 1 ? top[0] : '';
}

function itemText(it, conf, shared) {
    const price = it.price && it.price !== shared.price ? formatPrice(it.price) : '';
    const desc = it.desc !== shared.desc ? it.desc : '';
    const note = conf.hideNote ? '' : it.note;
    return `
        <div class="item-line">
            <span class="item-name">${escapeHtml(it.title)}</span>
            ${price ? `<span class="leader"></span><span class="item-price">${escapeHtml(price)}</span>` : ''}
        </div>
        ${desc ? `<div class="item-en">${escapeHtml(desc)}</div>` : ''}
        ${note ? `<div class="item-note">${escapeHtml(note)}</div>` : ''}`;
}

function renderSection(conf, items) {
    const shared = conf.groupPrice
        ? { price: commonValue(items, 'price'), desc: commonValue(items, 'desc') }
        : { price: '', desc: '' };
    const usePhoto = it => conf.photos !== false && hasPhoto(it);
    const withPhoto = items.filter(usePhoto);
    const textOnly = items.filter(it => !usePhoto(it));

    const cards = withPhoto.map(it => `
        <article class="card">
            <div class="card-photo"><img src="photos/${photoKey(it.img)}.jpg" alt="${escapeHtml(it.title)}"></div>
            <div class="card-body">${itemText(it, conf, shared)}</div>
        </article>`).join('');

    const list = textOnly.map(it => `<li class="list-item">${itemText(it, conf, shared)}</li>`).join('');

    return `
        <section class="section section-${conf.key}${conf.photos === false ? ' is-text' : ''}${conf.large ? ' is-large' : ''}">
            ${conf.title ? `
            <h3 class="section-title">
                <span class="section-en">${escapeHtml(conf.title)}</span>
                ${conf.sub ? `<span class="section-note">${escapeHtml(conf.sub)}</span>` : ''}
                ${conf.mood ? `<span class="section-mood">${escapeHtml(conf.mood)}</span>` : ''}
                ${shared.price ? `<span class="section-price">${escapeHtml(formatPrice(shared.price))}</span>` : ''}
            </h3>` : ''}
            ${cards ? `<div class="cards" style="--cols: ${conf.cols || 3}">${cards}</div>` : ''}
            ${list ? `<ul class="list">${list}</ul>` : ''}
        </section>`;
}

function renderCover() {
    return `
        <section class="page page-cover">
            <div class="cover-inner">
                <img src="../assets/logo.png" alt="cafe apart" class="cover-logo">
                <p class="cover-title">Menu</p>
                <p class="cover-sub">居心地のよい、いつもの場所。</p>
            </div>
            <div class="cover-foot">
                <p>${escapeHtml(SHOP.address)}</p>
                <p>${escapeHtml(SHOP.hours)}　${escapeHtml(SHOP.closed)}</p>
                <p>ペット同伴可　／　T2 オーストラリア発紅茶 取扱い店　／　Instagram ${escapeHtml(SHOP.instagram)}</p>
            </div>
        </section>`;
}

// グループに指定された商品名の順で並べる。rest: true は、どのグループにも入っていない商品
function sectionItems(conf, data) {
    const inCategory = data.filter(it => it.category === conf.key);
    if (conf.items) return conf.items.map(t => inCategory.find(it => it.title === t)).filter(Boolean);
    if (conf.rest) {
        const claimed = new Set(PAGES.flatMap(p => p.sections || []).flatMap(c => c.key === conf.key && c.items ? c.items : []));
        return inCategory.filter(it => !claimed.has(it.title));
    }
    return inCategory;
}

function render() {
    const data = (window.MENU_DATA || []).filter(it => !HIDDEN_TITLES.includes(it.title));
    let pageNo = 0;
    document.getElementById('book').innerHTML = PAGES.map(page => {
        pageNo++;
        if (page.type === 'cover') return renderCover();
        const body = page.sections
            .map(conf => [conf, sectionItems(conf, data)])
            .filter(([, items]) => items.length)
            .map(([conf, items]) => renderSection(conf, items))
            .join('');
        return `
            <section class="page" data-group="${escapeHtml(page.label)}">
                <header class="page-header">
                    <h2 class="page-title">${escapeHtml(page.label)}</h2>
                    <span class="page-sub">${escapeHtml(page.sub || '')}</span>
                    <img src="../assets/logo.png" alt="" class="page-logo">
                </header>
                ${page.intro ? `<p class="page-intro">${page.intro.split('\n').map(escapeHtml).join('<br>')}</p>` : ''}
                <div class="page-body">${body}</div>
                <footer class="page-footer">${pageNo}</footer>
            </section>`;
    }).join('');
}

// ページからはみ出す場合は、写真の高さ (--ph) → 文字 (--fs) の順に縮めて収める。
// 余白がある時は写真を大きく、写真のないページは文字を大きくする
function fitPages() {
    document.querySelectorAll('.page').forEach(page => {
        const body = page.querySelector('.page-body');
        if (!body) return;
        const overflows = () => body.scrollHeight > body.clientHeight + 1;
        let ph = 1, fs = 1;
        page.style.removeProperty('--ph');
        page.style.removeProperty('--fs');
        // 余白があれば写真を縦に大きく (最大で正方形)、はみ出すなら小さく
        while (!overflows() && ph < 1.33) { ph = +(ph + 0.03).toFixed(2); page.style.setProperty('--ph', ph); }
        while (overflows() && ph > 0.7) { ph = +(ph - 0.03).toFixed(2); page.style.setProperty('--ph', ph); }
        if (!page.querySelector('.card')) {
            while (!overflows() && fs < 1.3) { fs = +(fs + 0.02).toFixed(2); page.style.setProperty('--fs', fs); }
        }
        while (overflows() && fs > 0.8) { fs = +(fs - 0.02).toFixed(2); page.style.setProperty('--fs', fs); }
    });

    // 同じタイトルのページ (Food 1・2 など) は写真と文字の大きさをそろえる (小さい方に合わせる)
    const groups = {};
    document.querySelectorAll('.page[data-group]').forEach(page => (groups[page.dataset.group] ||= []).push(page));
    Object.values(groups).forEach(pages => {
        for (const prop of ['--ph', '--fs']) {
            const min = Math.min(...pages.map(pg => parseFloat(pg.style.getPropertyValue(prop)) || 1));
            pages.forEach(pg => pg.style.setProperty(prop, min));
        }
    });
}

render();
fitPages();
if (document.fonts) document.fonts.ready.then(fitPages);
window.addEventListener('load', fitPages);
window.addEventListener('beforeprint', fitPages);
