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
        const price = it.price && it.price !== shared ? formatPrice(it.price) : '';
        const desc = it.desc !== sharedDesc ? it.desc : '';
        const note = conf.hideNote ? '' : it.note;
        return `
            <li class="item">
                <div class="item-line">
                    <span class="item-name">${escapeHtml(it.title)}</span>
                    ${price ? `<span class="leader"></span><span class="item-price">${escapeHtml(price)}</span>` : ''}
                </div>
                ${desc || note ? `<div class="item-sub">${desc ? `<span class="item-en">${escapeHtml(desc)}</span>` : ''}${note ? `<span class="item-note">${escapeHtml(note)}</span>` : ''}</div>` : ''}
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
    const data = (window.MENU_DATA || []).filter(it => !HIDDEN_TITLES.includes(it.title));
    document.querySelectorAll('[data-sections]').forEach(el => {
        el.innerHTML = el.dataset.sections.split(/\s+/)
            .map(key => [key, data.filter(it => it.category === key)])
            .filter(([, items]) => items.length)
            .map(([key, items]) => renderSection(key, items))
            .join('');
    });
}

render();
