/**
 * cafe apart - ブックメニュー レンダリング
 * data/menu-data.js (window.MENU_DATA) と photos/manifest.js (window.BOOK_PHOTOS) から各ページを生成する。
 * 写真がある商品は写真カード、ない商品は文字だけのリストで載せる。
 */

// ページ構成。cols は写真カードの列数、photos は [開始, 終了) で写真カードを複数ページに分ける
// (文字だけの品目は、そのカテゴリの最後のページに載る)。8ページ (4の倍数) で中綴じ製本できる
const PAGES = [
    { type: 'cover' },
    { label: 'Food',   sub: 'フード',   sections: [{ key: 'food', cols: 2, photos: [0, 6] }] },
    { label: 'Food',   sub: 'フード',   sections: [{ key: 'food', cols: 2, photos: [6] }] },
    { label: 'Sweets', sub: 'スイーツ', sections: [{ key: 'sweets', cols: 2, photos: [0, 6] }] },
    { label: 'Sweets', sub: 'スイーツ', sections: [{ key: 'sweets', cols: 2, photos: [6] }] },
    { label: 'Drinks', sub: 'ドリンク', sections: [{ key: 'drink', cols: 4 }] },
    { label: 'Tea & More', sub: 'T2ティー・期間限定・キッズ', sections: [
        { key: 't2', title: 'T2 Tea', note: 'オーストラリア発の紅茶ブランド', cols: 3, groupPrice: true },
        { key: 'limited', title: 'Limited', note: '期間限定', cols: 3 },
        { key: 'kids', title: 'Kids', note: '米粉を使用したアレルギー配慮メニュー', groupPrice: true, hideNote: true },
    ] },
    { type: 'back' },
];

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
    const [start, end] = conf.photos || [0];
    const withPhoto = items.filter(hasPhoto).slice(start, end);
    const isLastPart = end === undefined;
    const textOnly = isLastPart ? items.filter(it => !hasPhoto(it)) : [];

    const cards = withPhoto.map(it => `
        <article class="card">
            <div class="card-photo"><img src="photos/${photoKey(it.img)}.jpg" alt="${escapeHtml(it.title)}"></div>
            <div class="card-body">${itemText(it, conf, shared)}</div>
        </article>`).join('');

    const list = textOnly.map(it => `<li class="list-item">${itemText(it, conf, shared)}</li>`).join('');

    return `
        <section class="section section-${conf.key}">
            ${conf.title ? `
            <h3 class="section-title">
                <span class="section-en">${escapeHtml(conf.title)}</span>
                ${conf.note ? `<span class="section-note">${escapeHtml(conf.note)}</span>` : ''}
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
            <p class="cover-foot">Ibaraki, Osaka</p>
        </section>`;
}

function renderBack() {
    return `
        <section class="page page-back">
            <div class="back-inner">
                <img src="../assets/logo.png" alt="cafe apart" class="back-logo">
                <dl class="info">
                    <dt>Address</dt><dd>${escapeHtml(SHOP.address)}</dd>
                    <dt>Open</dt><dd>${escapeHtml(SHOP.hours)}<br>${escapeHtml(SHOP.closed)}</dd>
                    <dt>Information</dt><dd>ペット同伴可<br>T2 オーストラリア発紅茶 取扱い店</dd>
                    <dt>Instagram</dt><dd>${escapeHtml(SHOP.instagram)}</dd>
                </dl>
            </div>
        </section>`;
}

function render() {
    const data = (window.MENU_DATA || []).filter(it => !HIDDEN_TITLES.includes(it.title));
    let pageNo = 0;
    document.getElementById('book').innerHTML = PAGES.map(page => {
        pageNo++;
        if (page.type === 'cover') return renderCover();
        if (page.type === 'back') return renderBack();
        const body = page.sections
            .map(conf => [conf, data.filter(it => it.category === conf.key)])
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
                <div class="page-body">${body}</div>
                <footer class="page-footer">${pageNo}</footer>
            </section>`;
    }).join('');
}

// ページからはみ出す場合は、写真の高さ (--ph) → 文字 (--fs) の順に縮めて収める
function fitPages() {
    document.querySelectorAll('.page').forEach(page => {
        const body = page.querySelector('.page-body');
        if (!body) return;
        const overflows = () => body.scrollHeight > body.clientHeight + 1;
        let ph = 1, fs = 1;
        page.style.removeProperty('--ph');
        page.style.removeProperty('--fs');
        while (overflows() && ph > 0.7) { ph = +(ph - 0.03).toFixed(2); page.style.setProperty('--ph', ph); }
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
