/**
 * cafe apart - メニュー表レンダリング
 * data/menu-data.js (window.MENU_DATA) を各ページの data-sections に流し込む。
 */

const SECTIONS = {
    drink:   { title: 'Coffee & Drinks', subtitle: 'コーヒー・ドリンク' },
    t2:      { title: 'T2 Tea',          subtitle: 'オーストラリア発の紅茶ブランド', groupPrice: true },
    limited: { title: 'Limited',         subtitle: '期間限定' },
    food:    { title: 'Food',            subtitle: 'フード' },
    sweets:  { title: 'Sweets',          subtitle: 'スイーツ' },
    kids:    { title: 'Kids',            subtitle: '米粉を使用したアレルギー配慮メニュー', groupPrice: true, hideNote: true },
};

// スプレッドシート（ホームページ）には載せるが、印刷メニューには出さない品目
const HIDDEN_TITLES = ['頑張るアルバイトさん'];

// 別の商品として載せず、元の商品にまとめるもの
//   label: 「〜に変更可能」と書く (価格差は自動)
//   size:  サイズ違いとして価格を並べる (例: フル ¥700 / ハーフ ¥500)
const VARIANTS = {
    '華麗なカレーとドライなカレー': [{ title: '華麗なカレーと激ウマバケット', label: 'ドライカレーをバゲットに変更可能' }],
    'たまごっちサンド': [{ title: 'たまごっちハーフ', size: 'ハーフ', baseSize: 'フル' }],
};

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
const VARIANT_TITLES = Object.values(VARIANTS).flat().map(v => v.title);

// 変更後の価格の差 (同じなら「同価格」、高ければ「+¥100」)
function optionText(base, variant, allData) {
    const v = allData.find(it => it.title === variant.title);
    const toNum = p => parseInt(String(p || '').replace(/[^\d]/g, ''), 10);
    if (!v || isNaN(toNum(v.price)) || isNaN(toNum(base.price))) return variant.label;
    const diff = toNum(v.price) - toNum(base.price);
    return `${variant.label}（${diff === 0 ? '同価格' : (diff > 0 ? '+' : '−') + '¥' + Math.abs(diff).toLocaleString()}）`;
}

const escapeHtml = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// ホームページと同じく 4桁以上の数字にカンマを付ける (¥1000 → ¥1,000)
const formatPrice = price => (price || '').replace(/\d{4,}/g, m => parseInt(m, 10).toLocaleString());

// 2品以上で共通する最頻値 (価格・英語名) を返す。共通価格は見出しに出し、共通の英語名は省略する
function commonValue(items, field) {
    const counts = {};
    items.forEach(it => { if (it[field]) counts[it[field]] = (counts[it[field]] || 0) + 1; });
    const [top] = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return top && top[1] > 1 ? top[0] : '';
}

function renderSection(key, items) {
    const conf = SECTIONS[key] || { title: key, subtitle: '' };
    const shared = conf.groupPrice ? commonValue(items, 'price') : '';
    const sharedDesc = conf.groupPrice ? commonValue(items, 'desc') : '';

    const rows = items.map(it => {
        const price = sizedPrice(it, window.MENU_DATA || []) || (it.price && it.price !== shared ? formatPrice(it.price) : '');
        const desc = it.desc !== sharedDesc ? it.desc : '';
        const note = conf.hideNote ? '' : it.note;
        return `
            <li class="item">
                <div class="item-line">
                    <span class="item-name">${escapeHtml(it.title)}</span>
                    ${price ? `<span class="leader"></span><span class="item-price">${escapeHtml(price)}</span>` : ''}
                </div>
                ${desc || note ? `<div class="item-sub">${desc ? `<span class="item-en">${escapeHtml(desc)}</span>` : ''}${note ? `<span class="item-note">${escapeHtml(note)}</span>` : ''}</div>` : ''}
                ${(VARIANTS[it.title] || []).filter(v => v.label).map(v => `<div class="item-option">${escapeHtml(optionText(it, v, window.MENU_DATA || []))}</div>`).join('')}
            </li>`;
    }).join('');

    return `
        <div class="section section-${key}">
            <h2 class="section-title">
                <span class="section-en">${escapeHtml(conf.title)}</span>
                ${shared ? `<span class="section-price">${escapeHtml(formatPrice(shared))}</span>` : ''}
            </h2>
            ${conf.subtitle ? `<p class="section-sub">${escapeHtml(conf.subtitle)}</p>` : ''}
            <ul class="items">${rows}</ul>
        </div>`;
}

function render() {
    const data = (window.MENU_DATA || []).filter(it => !HIDDEN_TITLES.includes(it.title) && !VARIANT_TITLES.includes(it.title));
    document.querySelectorAll('[data-sections]').forEach(el => {
        el.innerHTML = el.dataset.sections.split(/\s+/)
            .map(key => [key, data.filter(it => it.category === key)])
            .filter(([, items]) => items.length)
            .map(([key, items]) => renderSection(key, items))
            .join('');
    });
}

// 各ページで、列の中身がキッズ帯・フッターに食い込む場合は文字倍率 --fs を下げて収める
function fitPages() {
    document.querySelectorAll('.page').forEach(page => {
        const overflows = () => {
            const limit = (page.querySelector('.band:not(:empty)') || page.querySelector('.page-footer')).getBoundingClientRect().top;
            const columnsOver = [...page.querySelectorAll('.column')].some(col => {
                const last = col.lastElementChild;
                return last && last.getBoundingClientRect().bottom > limit - 2;
            });
            return columnsOver || page.scrollHeight > page.clientHeight + 1;
        };
        let fs = 1;
        page.style.removeProperty('--fs');
        while (overflows() && fs > 0.75) {
            fs = Math.round((fs - 0.02) * 100) / 100;
            page.style.setProperty('--fs', fs);
        }
    });
}

render();
fitPages();
// Web フォント読み込み後・印刷直前に寸法が変わるため再計算する
if (document.fonts) document.fonts.ready.then(fitPages);
window.addEventListener('beforeprint', fitPages);
