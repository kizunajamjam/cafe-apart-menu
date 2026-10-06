/**
 * cafe apart - ブックメニュー レンダリング
 * data/menu-data.js (window.MENU_DATA) と photos/manifest.js (window.BOOK_PHOTOS) から各ページを生成する。
 * 写真がある商品は写真カード、ない商品は文字だけのリストで載せる (ドリンクは写真なし)。
 */

// ページ構成 (8ページ = 4の倍数で中綴じできる)。
// 順番: 表紙 → ドリンク → T2 → フード(2) → スイーツ(2) → キッズ(裏表紙)。フード・スイーツは4ページに収める。
// フード・スイーツは種類と雰囲気でグループ分けする (items: スプレッドシートの商品名)。
// どのグループにも入っていない商品は、rest: true のグループ (「その他」) に自動で入る。
// cols は写真カードの列数。photos: false のセクションは写真を使わず文字だけで載せる。
// inlineList: true は、写真のない商品を写真カードの空いた枠に並べる。horizontal: true は横長カード (写真左・文字右)。
const PAGES = [
    { type: 'cover' },
    { label: 'Drinks', sub: 'ドリンク', sections: [
        { key: 'drink', photos: false, title: 'Coffee & Latte', sub: 'コーヒー・ラテ', mood: 'ほっと一息つきたい時に',
          items: ['気合の一杯', 'カフェアメリカーノ', 'エスプレッソ', 'エスプレッソトニック', 'カフェラテ', '抹茶ラテ'] },
        { key: 'drink', photos: false, title: 'Juice & Soda', sub: 'ジュース・ソーダ', mood: 'さっぱりリフレッシュ',
          items: ['自家製レモネード', '手作りバナナジュース', 'オレンジジュース', 'アップルジュース', 'ジンジャーエール', 'コカ・コーラ', 'クリームソーダ'] },
        { key: 'drink', photos: false, title: 'Alcohol', sub: 'アルコール', mood: 'ゆっくり過ごす午後に',
          items: ['瓶ビール', 'ハイボール'] },
        { key: 'drink', photos: false, title: 'Others', sub: 'その他', rest: true },
    ] },
    // T2 は1ページの特集 (t2: true)。上部に写真、ティーセレクションはイメージイラスト付き (t2-art.js)、
    // アレンジティーは写真付きで載せる
    { label: 'T2 Tea', sub: 'オーストラリア発の紅茶ブランド', t2: true,
      hero: { img: 'assets/t2-hero.jpg', en: 'From Melbourne, Australia',
              text: 'cafe apart は、オーストラリア発の紅茶ブランド「T2」の取扱い店です。\n香りの違うティーを、カップでもポットでもお楽しみいただけます。' },
      sections: [
        { key: 't2', groupPrice: true, title: 'Tea Selection', sub: 'ティーセレクション',
          items: ['ふんわりバニラのメルボルンブレックファースト', 'フローラルなフレンチアールグレイ', 'フルーティーなパックス・ア・ピーチ', 'スパイシーなオーガニックチャイ'] },
        { key: 't2', title: 'Arrange', sub: 'アレンジティー', rest: true },
    ] },
    // フード・スイーツは大小を付けた配置 (layout)。hero の商品を大きく、ほかを小さく並べる
    //   side:       主役を左に大きく、ほかを右に縦に並べる
    //   side-right: 主役を右に大きく、ほかを左に縦に並べる
    //   top:        主役をページ幅いっぱいに大きく、ほかを下に横に並べる
    //   trio:       主役3品を大きく横に並べ、ほかを下に小さく並べる (hero に3品を指定)
    //   wide:       主役を幅の約2/3で大きく、ほかを右に縦に積む
    //   pair:       主役 (幅の約6割) と1品を横に並べ、写真の高さと文字の位置をそろえる
    // badge を指定すると、主役の写真にバッジを付ける
    { label: 'Food', sub: 'フード', sections: [
        { key: 'food', layout: 'pair', hero: '華麗なカレーとドライなカレー', badge: 'RECOMMEND', title: 'Curry & Udon', sub: 'カレー・うどん', mood: 'しっかり食べたい日に',
          items: ['華麗なカレーとドライなカレー', 'クリームどんちゃん'] },
        { key: 'food', layout: 'side', hero: 'たまごっちサンド', badge: 'RECOMMEND', title: 'Sandwich & Hotdog', sub: 'サンド・ホットドッグ', mood: '片手で気軽に',
          items: ['ニューヨークホットドック', 'あんバターサンド', 'たまごっちサンド'] },
    ] },
    { label: 'Food', sub: 'フード', sections: [
        { key: 'food', layout: 'wide', hero: 'ブルックリンブランチ', badge: 'RECOMMEND', title: 'Toast', sub: 'トースト', mood: 'ブランチにぴったりの一皿',
          items: ['ブルックリンブランチ', 'ピザトースト(バゲット)'] },
        { key: 'food', cols: 2, title: 'Light & Side', sub: '軽食・サイド', mood: '小腹がすいた時や、みんなでシェアに',
          items: ['バタートースト', 'マクドみたいなポテト', 'ポテトチップス'] },
        { key: 'food', cols: 3, title: 'Others', sub: 'その他', rest: true },
    ] },
    { label: 'Sweets', sub: 'スイーツ', sections: [
        { key: 'sweets', layout: 'side', hero: 'クレープ', title: 'Crepe', sub: 'クレープ', mood: '甘いひとときに',
          items: ['クレープ', 'シングルクレープ（バナナ）', 'シングルクレープ（レモン）', 'シングルクレープ(白玉抹茶)'] },
        { key: 'sweets', layout: 'trio', hero: ['手作りキャロットケーキ', '手作りフロランタン', '手作り焦がしミルクチョコブラウニー'],
          badge: 'HOMEMADE', title: 'Cake & Baked', sub: 'ケーキ・焼き菓子', mood: 'コーヒーや紅茶のお供に',
          items: ['手作りキャロットケーキ', 'チーズケーキ', '手作りフロランタン', '手作り焦がしミルクチョコブラウニー'] },
    ] },
    { label: 'Sweets', sub: 'スイーツ', sections: [
        { key: 'sweets', cols: 2, title: 'Ice & Parfait', sub: 'アイス・パフェ', mood: 'ひんやり冷たいデザート',
          items: ['アイスクリーム', 'チャンキーアイスクリーム', 'アフォガート', 'ティラミス風パフェ'] },
        { key: 'food', horizontal: true, title: 'Sweet Toast', sub: '甘いトースト', mood: 'おやつにも',
          items: ['ブルーチーズバナナトースト'] },
        { key: 'sweets', cols: 2, title: 'Others', sub: 'その他', rest: true },
    ] },
    // 裏表紙
    { label: 'Kids', sub: 'キッズメニュー',
      intro: '米粉を使用した、アレルギーに配慮したデザートです。',
      sections: [
        { key: 'kids', photos: false, large: true, groupPrice: true, hideNote: true, title: 'Kids Dessert', sub: 'キッズデザート' },
    ] },
];
// 店舗情報は表紙の下に載せる

// 長い商品名の改行位置 (| の位置でだけ改行する)
const BREAK_HINTS = {
    '手作り焦がしミルクチョコブラウニー': '手作り焦がし|ミルクチョコブラウニー',
    'ニューヨークホットドック': 'ニューヨーク|ホットドック',
    'ブルーチーズバナナトースト': 'ブルーチーズ|バナナトースト',
    'シングルクレープ（バナナ）': 'シングルクレープ|（バナナ）',
    'シングルクレープ（レモン）': 'シングルクレープ|（レモン）',
    'シングルクレープ(白玉抹茶)': 'シングルクレープ|(白玉抹茶)',
    '華麗なカレーとドライなカレー': '華麗なカレーと|ドライなカレー',
};
const nameHtml = title => BREAK_HINTS[title]
    ? `<span class="keep-words">${BREAK_HINTS[title].split('|').map(escapeHtml).join('<wbr>')}</span>`
    : escapeHtml(title);

// スプレッドシート（ホームページ）には載せるが、メニューには出さない品目
const HIDDEN_TITLES = ['頑張るアルバイトさん'];

// 別の商品として載せず、元の商品にまとめるもの
//   label: 「〜に変更可能」と書く (価格差は自動)
//   size:  サイズ違いとして価格を並べる (例: フル ¥700 / ハーフ ¥500)
const VARIANTS = {
    '華麗なカレーとドライなカレー': [{ title: '華麗なカレーと激ウマバケット', label: 'ドライカレーをバゲットに変更可能' }],
    'たまごっちサンド': [{ title: 'たまごっちハーフ', size: 'ハーフ', baseSize: 'フル' }],
};
const VARIANT_TITLES = Object.values(VARIANTS).flat().map(v => v.title);

// サイズ違いの価格を並べる (フル ¥700 / ハーフ ¥500)
function sizedPrice(base, allData) {
    const sizes = (VARIANTS[base.title] || []).filter(v => v.size);
    if (!sizes.length) return '';
    const parts = [`${sizes[0].baseSize} ${formatPrice(base.price)}`];
    sizes.forEach(v => {
        const item = allData.find(it => it.title === v.title);
        if (item) parts.push(`${v.size} ${formatPrice(item.price)}`);
    });
    return parts.join(' / ');
}

// 変更後の価格の差 (同じなら「同価格」、高ければ「+¥100」)
function optionText(base, variant, allData) {
    const v = allData.find(it => it.title === variant.title);
    const toNum = p => parseInt(String(p || '').replace(/[^\d]/g, ''), 10);
    if (!v || isNaN(toNum(v.price)) || isNaN(toNum(base.price))) return variant.label;
    const diff = toNum(v.price) - toNum(base.price);
    return `${variant.label}（${diff === 0 ? '同価格' : (diff > 0 ? '+' : '−') + '¥' + Math.abs(diff).toLocaleString()}）`;
}

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
// 写真ごとの切り抜き位置と拡大率 (photos/manifest.js)
const PHOTOS = window.BOOK_PHOTOS || {};
const hasPhoto = it => photoKey(it.img) in PHOTOS;
// 元写真のまま保存してあるので、表示する枠に合わせてここで1回だけ切り抜く
function photoImg(it) {
    const key = photoKey(it.img);
    const f = PHOTOS[key] || {};
    const pos = `${Math.round((f.x ?? 0.5) * 100)}% ${Math.round((f.y ?? 0.5) * 100)}%`;
    const zoom = f.zoom && f.zoom !== 1 ? ` transform: scale(${f.zoom}); transform-origin: ${pos};` : '';
    return `<img src="photos/${key}.jpg" alt="${escapeHtml(it.title)}" style="object-position: ${pos};${zoom}">`;
}

// 2品以上で共通する最頻値 (価格・英語名)。共通価格は見出しに出し、共通の英語名は省略する
function commonValue(items, field) {
    const counts = {};
    items.forEach(it => { if (it[field]) counts[it[field]] = (counts[it[field]] || 0) + 1; });
    const [top] = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return top && top[1] > 1 ? top[0] : '';
}

// 英語名の「(iced/hot)」などから、アイス・ホットを選べるかを読み取る (スプレッドシートの英語名に書く)
function temps(desc) {
    const m = (desc || '').match(/\s*\(([^)]*\b(?:iced?|hot)\b[^)]*)\)\s*/i);
    if (!m) return { list: [], desc: desc || '' };
    const list = [];
    if (/\bice/i.test(m[1])) list.push('ICE');
    if (/\bhot\b/i.test(m[1])) list.push('HOT');
    return { list, desc: desc.replace(m[0], ' ').trim() };
}
const tempBadges = list => list.map(t => `<span class="temp temp-${t.toLowerCase()}">${t}</span>`).join('');

function itemText(it, conf, shared) {
    const price = sizedPrice(it, window.MENU_DATA || []) || (it.price && it.price !== shared.price ? formatPrice(it.price) : '');
    const t = temps(it.desc !== shared.desc ? it.desc : '');
    const desc = t.desc;
    const note = conf.hideNote ? '' : it.note;
    return `
        <div class="item-line">
            <span class="item-name">${nameHtml(it.title)}</span>${tempBadges(t.list)}
            ${price ? `<span class="leader"></span><span class="item-price">${escapeHtml(price)}</span>` : ''}
        </div>
        ${desc ? `<div class="item-en">${escapeHtml(desc)}</div>` : ''}
        ${note ? `<div class="item-note">${escapeHtml(note)}</div>` : ''}
        ${(VARIANTS[it.title] || []).filter(v => v.label).map(v => `<div class="item-option">${escapeHtml(optionText(it, v, window.MENU_DATA || []))}</div>`).join('')}`;
}

function renderSection(conf, items) {
    const shared = conf.groupPrice
        ? { price: commonValue(items, 'price'), desc: commonValue(items, 'desc') }
        : { price: '', desc: '' };
    const usePhoto = it => conf.photos !== false && hasPhoto(it);
    const withPhoto = items.filter(usePhoto);
    const textOnly = items.filter(it => !usePhoto(it));

    // layout 指定がある時は、主役 (hero, 1品または複数) を先頭に
    const heroes = conf.layout ? [].concat(conf.hero || []) : [];
    if (heroes.length) {
        const rank = it => { const i = heroes.indexOf(it.title); return i < 0 ? heroes.length : i; };
        withPhoto.sort((a, b) => rank(a) - rank(b));
    }
    const isHero = it => heroes.includes(it.title);
    const heroCount = withPhoto.filter(isHero).length;
    const cards = withPhoto.map(it => `
        <article class="card${isHero(it) ? ' is-hero' : ''}">
            <div class="card-photo">
                ${photoImg(it)}
                ${conf.badge && isHero(it) ? `<span class="photo-badge">${escapeHtml(conf.badge)}</span>` : ''}
            </div>
            <div class="card-body">${itemText(it, conf, shared)}</div>
        </article>`).join('');

    const list = textOnly.map(it => `<li class="list-item">${itemText(it, conf, shared)}</li>`).join('');

    return `
        <section class="section section-${conf.key}${conf.photos === false ? ' is-text' : ''}${conf.large ? ' is-large' : ''}${conf.horizontal ? ' is-horizontal' : ''}">
            ${conf.title ? `
            <h3 class="section-title">
                <span class="section-en">${escapeHtml(conf.title)}</span>
                ${conf.sub ? `<span class="section-note">${escapeHtml(conf.sub)}</span>` : ''}
                ${conf.mood ? `<span class="section-mood">${escapeHtml(conf.mood)}</span>` : ''}
                ${shared.price ? `<span class="section-price">${escapeHtml(formatPrice(shared.price))}</span>` : ''}
            </h3>` : ''}
            ${cards ? `<div class="cards${conf.layout ? ` layout-${conf.layout}` : ''}" style="--cols: ${conf.cols || 3}; --rest: ${Math.max(1, withPhoto.length - heroCount)}">${cards}${conf.inlineList && list ? `<ul class="list list-inline">${list}</ul>` : ''}</div>` : ''}
            ${list && !(conf.inlineList && cards) ? `<ul class="list">${list}</ul>` : ''}
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

// 「ふんわりバニラのメルボルンブレックファースト」→ 添え書き「ふんわりバニラの」+ 名前「メルボルンブレックファースト」
function teaTitle(title) {
    const m = title.match(/^(.+?[のな])(.{4,})$/);
    return m
        ? `<p class="tea-lead">${escapeHtml(m[1])}</p><h4 class="tea-name">${escapeHtml(m[2])}</h4>`
        : `<h4 class="tea-name">${escapeHtml(title)}</h4>`;
}

// T2 特集ページの本文
function renderT2(page, data) {
    const [selConf, arrConf] = page.sections;
    const sel = sectionItems(selConf, data);
    const arr = sectionItems(arrConf, data);
    const shared = { price: commonValue(sel, 'price'), desc: commonValue(sel, 'desc') };
    const heading = (conf, price) => `
        <h3 class="section-title">
            ${window.T2_SPARKLE ? `<span class="t2-spark">${window.T2_SPARKLE('#f39800')}</span>` : ''}
            <span class="section-en">${escapeHtml(conf.title)}</span>
            <span class="section-note">${escapeHtml(conf.sub)}</span>
            ${price ? `<span class="t2-price">${escapeHtml(formatPrice(price))}</span>` : ''}
        </h3>`;

    const teas = sel.map(it => {
        const art = (window.T2_ART || {})[it.title] || window.T2_ART_DEFAULT;
        const price = it.price !== shared.price ? formatPrice(it.price) : '';
        return `
            <article class="tea">
                <div class="tea-art">${art.svg}</div>
                <div class="tea-body">
                    ${teaTitle(it.title)}${price ? `<span class="item-price">${escapeHtml(price)}</span>` : ''}
                    ${art.tags.length ? `<div class="tea-tags">${art.tags.map(t => `<span>${escapeHtml(t)}</span>`).join('')}</div>` : ''}
                    ${it.note ? `<p class="tea-note">${escapeHtml(it.note)}</p>` : ''}
                </div>
            </article>`;
    }).join('');

    const arranges = arr.map(it => `
        <article class="arrange">
            ${hasPhoto(it) ? `<div class="arrange-photo">${photoImg(it)}</div>` : ''}
            <div class="arrange-body">${itemText(it, {}, { price: '', desc: '' })}</div>
        </article>`).join('');

    return `
        <div class="t2-hero">
            <img src="${escapeHtml(page.hero.img)}" alt="T2 のティーセット">
            <div class="t2-hero-text">
                <p class="t2-hero-en">${escapeHtml(page.hero.en)}</p>
                <p>${page.hero.text.split('\n').map(escapeHtml).join('<br>')}</p>
            </div>
        </div>
        ${sel.length ? `<section class="section t2-selection">${heading(selConf, shared.price)}<div class="tea-grid">${teas}</div></section>` : ''}
        ${arr.length ? `<section class="section t2-arrange">${heading(arrConf)}<div class="arrange-grid">${arranges}</div></section>` : ''}`;
}

function render() {
    const data = (window.MENU_DATA || []).filter(it => !HIDDEN_TITLES.includes(it.title) && !VARIANT_TITLES.includes(it.title));
    document.getElementById('book').innerHTML = PAGES.map(page => {
        if (page.type === 'cover') return renderCover();
        const body = page.t2 ? renderT2(page, data) : page.sections
            .map(conf => [conf, sectionItems(conf, data)])
            .filter(([, items]) => items.length)
            .map(([conf, items]) => renderSection(conf, items))
            .join('');
        return `
            <section class="page${page.t2 ? ' page-t2' : ''}" data-group="${escapeHtml(page.label + ':' + page.sections.map(c => c.layout || c.cols || 0).join(','))}">
                <header class="page-header">
                    <h2 class="page-title">${escapeHtml(page.label)}</h2>
                    <span class="page-sub">${escapeHtml(page.sub || '')}</span>
                    <img src="../assets/logo.png" alt="" class="page-logo">
                </header>
                ${page.intro ? `<p class="page-intro">${page.intro.split('\n').map(escapeHtml).join('<br>')}</p>` : ''}
                <div class="page-body">${body}</div>
            </section>`;
    }).join('');
}

// ページからはみ出す場合は、写真の高さ (--ph) → 文字 (--fs) の順に縮めて収める。
// 写真のないページは、余白がある時に文字を大きくする
function fitPages() {
    document.querySelectorAll('.page').forEach(page => {
        const body = page.querySelector('.page-body');
        if (!body) return;
        // 中身の高さ (各グループ + 最小の間隔) がページ本文の高さを超えるか。
        // 端数の誤差ではみ出さないよう 4px の余裕を持たせる
        const overflows = () => {
            const items = [...body.children];
            const gap = parseFloat(getComputedStyle(body).rowGap) || 0;
            const need = items.reduce((sum, el) => sum + el.offsetHeight, 0) + gap * Math.max(0, items.length - 1);
            return need > body.clientHeight - 4;
        };
        let ph = 1, fs = 1;
        page.style.removeProperty('--ph');
        page.style.removeProperty('--fs');
        // 写真の縦横比は 4:3 で固定。収まらない時だけ少し横長にして縮める
        while (overflows() && ph > 0.7) { ph = +(ph - 0.03).toFixed(2); page.style.setProperty('--ph', ph); }
        if (!page.querySelector('.card')) {
            const maxFs = page.classList.contains('page-t2') ? 1.25 : 1.6;
            while (!overflows() && fs < maxFs) { fs = +(fs + 0.02).toFixed(2); page.style.setProperty('--fs', fs); }
        }
        while (overflows() && fs > 0.8) { fs = +(fs - 0.02).toFixed(2); page.style.setProperty('--fs', fs); }
    });

    // 同じタイトルで列構成も同じページは、写真と文字の大きさをそろえる (小さい方に合わせる)
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
// フォントや画像の読み込みが遅れて高さが変わることがあるので、少し後にもう一度確かめる
[500, 1500, 3000].forEach(ms => setTimeout(() => {
    const overflowing = [...document.querySelectorAll('.page-body')].some(b => b.scrollHeight > b.clientHeight + 1);
    if (overflowing) fitPages();
}, ms));
window.addEventListener('beforeprint', fitPages);
