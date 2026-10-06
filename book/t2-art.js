/**
 * cafe apart - T2 ティーのイメージイラスト (SVG)
 * お店のコンセプト「Groove & Still」(ミッドセンチュリー × ヒップホップジャズ) に合わせた、
 * ミッドセンチュリー調のフラットなイラスト。色はロゴのオレンジ・ティールを軸に、少ない色数に絞る。
 * 図形を少しずらして重ねた「版ずれ」風の影と、アトミック調の星・水玉がアクセント。
 *
 * 商品名ごとに、イラストと香りのキーワードを持つ。
 * 新しいティーを追加した時は、ここに同じ商品名で追加する (無い場合はティーカップの絵になる)。
 */
(() => {
    const C = {
        orange: '#f39800',  // ロゴのオレンジ
        teal: '#14a596',    // ロゴのティール
        mustard: '#e8b53a',
        cream: '#fbf3e2',
        navy: '#2c3e50',
        peach: '#f8d5bd',   // オレンジの淡い色 (桃の背景)
    };

    // 背景の不定形 (ミッドセンチュリーの「ブロブ」)
    const BLOBS = [
        'M52 5 C 78 3, 97 24, 94 52 C 91 79, 70 97, 44 94 C 18 91, 3 70, 6 44 C 9 19, 28 7, 52 5 Z',
        'M47 4 C 74 6, 96 20, 95 49 C 94 76, 76 96, 50 95 C 22 94, 5 77, 5 50 C 5 24, 22 3, 47 4 Z',
        'M55 6 C 80 8, 95 30, 92 55 C 89 80, 66 96, 41 92 C 16 88, 4 66, 8 41 C 12 18, 32 4, 55 6 Z',
        'M50 3 C 72 3, 94 18, 96 46 C 98 74, 78 97, 50 96 C 24 95, 4 78, 4 50 C 4 22, 26 3, 50 3 Z',
    ];

    // アトミック調の星
    const sparkle = (x, y, s, color) =>
        `<path transform="translate(${x} ${y}) scale(${s})" fill="${color}" d="M0 -10 L2.2 -2.2 L10 0 L2.2 2.2 L0 10 L-2.2 2.2 L-10 0 L-2.2 -2.2 Z"/>`;
    const dots = (pts, color) => pts.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}"/>`).join('');

    // 版ずれ風の影: 同じ図形を色を変えて少しずらして先に描く
    const offset = (shape, color, dx = 2.4, dy = 2.4) =>
        `<g transform="translate(${dx} ${dy})" fill="${color}" stroke="${color}">${shape}</g>`;

    const svg = (blob, bg, body) => `
        <svg viewBox="0 0 100 100" aria-hidden="true">
            <path d="${blob}" fill="${bg}"/>
            ${body}
        </svg>`;

    // ---- バニラの花とバニラビーンズ ----
    const vanillaPetals = [0, 72, 144, 216, 288]
        .map(r => `<ellipse rx="7.5" ry="15" transform="rotate(${r}) translate(0 -12)"/>`).join('');
    const vanilla = svg(BLOBS[0], C.mustard, `
        <path d="M18 80 C 36 62, 54 48, 82 30" stroke="${C.navy}" stroke-width="5" fill="none" stroke-linecap="round"/>
        <path d="M26 86 C 44 68, 62 54, 86 42" stroke="${C.navy}" stroke-width="4" fill="none" stroke-linecap="round"/>
        <g transform="translate(44 44)">
            ${offset(vanillaPetals, C.orange)}
            <g fill="${C.cream}">${vanillaPetals}</g>
            <circle r="6.5" fill="${C.orange}"/>
            <circle r="2.4" fill="${C.navy}"/>
        </g>
        ${sparkle(80, 18, 0.7, C.cream)}
        ${dots([[16, 30, 1.8], [22, 24, 1.3], [84, 68, 1.6]], C.cream)}
    `);

    // ---- ベルガモット (柑橘の輪切り) とラベンダー ----
    const slice = `
        <circle cx="0" cy="0" r="22"/>`;
    const segments = [0, 45, 90, 135, 180, 225, 270, 315]
        .map(r => `<path transform="rotate(${r})" d="M0 0 L -6.5 -16 A 17 17 0 0 1 6.5 -16 Z"/>`).join('');
    const earlGrey = svg(BLOBS[1], C.teal, `
        <g transform="translate(42 56)">
            ${offset(slice, C.navy)}
            <g fill="${C.mustard}">${slice}</g>
            <circle r="18.5" fill="${C.cream}"/>
            <g fill="${C.mustard}" opacity="0.9">${segments}</g>
            <circle r="2.5" fill="${C.cream}"/>
        </g>
        <g stroke="${C.cream}" stroke-width="2" stroke-linecap="round">
            <line x1="74" y1="86" x2="72" y2="30"/>
            <line x1="84" y1="82" x2="84" y2="40"/>
        </g>
        <g fill="${C.navy}">
            ${[30, 37, 44, 51, 58].map(y => `<ellipse cx="${72 + (y - 30) * 0.04}" cy="${y}" rx="3.2" ry="4.2"/>`).join('')}
            ${[40, 47, 54, 61].map(y => `<ellipse cx="84" cy="${y}" rx="3" ry="4"/>`).join('')}
        </g>
        ${sparkle(20, 22, 0.75, C.orange)}
        ${dots([[30, 16, 1.6], [14, 34, 1.3]], C.cream)}
    `);

    // ---- 桃と葉 ----
    const peachShape = `<path d="M50 32 C 22 28, 16 64, 34 78 C 42 84, 50 82, 50 82 C 50 82, 58 84, 66 78 C 84 64, 78 28, 50 32 Z"/>`;
    const peach = svg(BLOBS[2], C.peach, `
        ${offset(peachShape, C.navy)}
        <g fill="${C.orange}">${peachShape}</g>
        <path d="M50 34 C 45 48, 45 66, 50 82" stroke="${C.mustard}" stroke-width="2.4" fill="none"/>
        <ellipse cx="38" cy="50" rx="5" ry="8" fill="${C.mustard}" opacity="0.85" transform="rotate(20 38 50)"/>
        <path d="M50 33 q -2 -9 3 -15" stroke="${C.navy}" stroke-width="3.2" fill="none" stroke-linecap="round"/>
        <path d="M53 22 C 63 11, 80 13, 84 22 C 73 31, 59 29, 53 22 Z" fill="${C.teal}"/>
        <path d="M56 22 C 66 21, 74 21, 82 22" stroke="${C.cream}" stroke-width="1.2" fill="none"/>
        ${sparkle(20, 24, 0.8, C.teal)}
        ${sparkle(84, 74, 0.55, C.orange)}
        ${dots([[16, 64, 1.8], [24, 86, 1.4]], C.orange)}
    `);

    // ---- シナモンスティックとスターアニス ----
    const stick = (y, len) => `
        <rect x="${88 - len}" y="${y}" width="${len}" height="10" rx="5"/>`;
    // スターアニス (八角): 先のとがった8本の莢と、莢ごとの種
    const star = [0, 45, 90, 135, 180, 225, 270, 315]
        .map(r => `<path transform="rotate(${r})" d="M0 -17 L 4.2 -6 L 0 -1 L -4.2 -6 Z"/>`).join('');
    const seeds = [0, 45, 90, 135, 180, 225, 270, 315]
        .map(r => `<ellipse transform="rotate(${r})" cx="0" cy="-7" rx="1.3" ry="2"/>`).join('');
    const chai = svg(BLOBS[3], C.navy, `
        <g transform="rotate(-26 50 50)">
            ${offset(stick(36, 64) + stick(51, 58), C.teal)}
            <g fill="${C.orange}">${stick(36, 64)}</g>
            <g fill="${C.mustard}">${stick(51, 58)}</g>
            <ellipse cx="${88 - 64}" cy="41" rx="3" ry="5" fill="${C.cream}"/>
            <ellipse cx="${88 - 58}" cy="56" rx="3" ry="5" fill="${C.cream}"/>
        </g>
        <g transform="translate(68 70)">
            ${offset(star, C.teal, 1.8, 1.8)}
            <g fill="${C.cream}">${star}</g>
            <g fill="${C.orange}">${seeds}</g>
            <circle r="2.2" fill="${C.navy}"/>
        </g>
        ${sparkle(24, 22, 0.75, C.mustard)}
        ${dots([[28, 78, 2], [20, 70, 1.4], [36, 86, 1.5]], C.cream)}
    `);

    // ---- イラストが無いティー用 (ティーカップ) ----
    const cupShape = `<path d="M24 44 h 42 v 10 a 21 21 0 0 1 -42 0 z"/>`;
    const teacup = svg(BLOBS[0], C.cream, `
        ${offset(cupShape, C.teal)}
        <g fill="${C.orange}">${cupShape}</g>
        <path d="M66 48 a 8 8 0 0 1 0 14" fill="none" stroke="${C.orange}" stroke-width="3"/>
        <path d="M18 78 h 56" stroke="${C.navy}" stroke-width="3" stroke-linecap="round"/>
        <path d="M38 34 q -4 -6 0 -12 M50 34 q -4 -6 0 -12" stroke="${C.navy}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
        ${sparkle(80, 22, 0.7, C.mustard)}
    `);

    window.T2_ART = {
        'ふんわりバニラのメルボルンブレックファースト': { tags: ['バニラ', 'まろやか'], svg: vanilla },
        'フローラルなフレンチアールグレイ': { tags: ['ベルガモット', 'フローラル'], svg: earlGrey },
        'フルーティーなパックス・ア・ピーチ': { tags: ['ピーチ', 'フルーティー'], svg: peach },
        'スパイシーなオーガニックチャイ': { tags: ['スパイス', 'オーガニック'], svg: chai },
    };
    window.T2_ART_DEFAULT = { tags: [], svg: teacup };
    window.T2_SPARKLE = color => `<svg viewBox="-10 -10 20 20" aria-hidden="true">${sparkle(0, 0, 1, color)}</svg>`;
})();
