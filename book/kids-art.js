/**
 * cafe apart - キッズメニュー (裏表紙) のイラストとアレルギー情報
 * イラストは T2 ページと同じ色 (ロゴのオレンジ・ティール + マスタード・クリーム・ネイビー) で、
 * キッズ向けに顔を付けた、ちょっと遊び心のあるフラットなイラスト。
 *
 * キーはスプレッドシートの商品名。name を書くと、メニューではその名前で表示する。
 * allergens はアレルギー物質 (28品目中) の該当品目。
 */
(() => {
    const C = {
        orange: '#f39800', teal: '#14a596', mustard: '#e8b53a', cream: '#fbf3e2', navy: '#2c3e50',
        cocoa: '#7a4a2a', pink: '#f4a3a0', peach: '#f8d5bd',
    };

    // にっこり顔 (目・口・ほっぺ)
    const face = (x, y, s = 1) => `
        <g transform="translate(${x} ${y}) scale(${s})">
            <circle cx="-6" cy="0" r="1.8" fill="${C.navy}"/>
            <circle cx="6" cy="0" r="1.8" fill="${C.navy}"/>
            <path d="M-3.5 3.5 Q 0 7 3.5 3.5" stroke="${C.navy}" stroke-width="1.6" fill="none" stroke-linecap="round"/>
            <ellipse cx="-10" cy="4" rx="2.6" ry="1.6" fill="${C.pink}" opacity="0.85"/>
            <ellipse cx="10" cy="4" rx="2.6" ry="1.6" fill="${C.pink}" opacity="0.85"/>
        </g>`;
    const sparkle = (x, y, s, color) =>
        `<path transform="translate(${x} ${y}) scale(${s})" fill="${color}" d="M0 -10 L2.2 -2.2 L10 0 L2.2 2.2 L0 10 L-2.2 2.2 L-10 0 L-2.2 -2.2 Z"/>`;
    const svg = (bg, body) => `
        <svg viewBox="0 0 100 100" aria-hidden="true">
            <circle cx="50" cy="50" r="47" fill="${bg}"/>
            ${body}
        </svg>`;
    // タルト生地 (ふちがギザギザ)
    const tartShell = (fill = '#e9b878', edge = '#d39a55') => `
        <path d="M18 56 Q 50 50 82 56 L 76 78 Q 50 84 24 78 Z" fill="${fill}"/>
        <path d="M18 56 ${Array.from({ length: 9 }, (_, i) => `Q ${21.5 + i * 7.2} ${51} ${25 + i * 7.2} ${56}`).join(' ')}" stroke="${edge}" stroke-width="2.4" fill="none"/>`;

    const art = {
        // バナナスティックケーキ
        banana: svg(C.mustard, `
            <rect x="16" y="46" width="68" height="24" rx="12" fill="#e7a95a"/>
            <rect x="16" y="46" width="68" height="9" rx="4.5" fill="#c9843f"/>
            ${[30, 46, 62].map(x => `<ellipse cx="${x}" cy="44" rx="7" ry="5" fill="${C.cream}"/><circle cx="${x}" cy="44" r="1.6" fill="${C.mustard}"/>`).join('')}
            ${face(50, 61, 0.9)}
            ${sparkle(82, 24, 0.6, C.cream)}
        `),
        // 国産豆乳プリンタルト
        pudding: svg(C.peach, `
            ${tartShell()}
            <ellipse cx="50" cy="56" rx="29" ry="7" fill="#fbe08a"/>
            <ellipse cx="50" cy="55" rx="22" ry="4.5" fill="#fff2b8"/>
            <circle cx="62" cy="47" r="5" fill="#e0453a"/><path d="M60 42 q2 -3 4 0" stroke="${C.teal}" stroke-width="2" fill="none"/>
            ${face(48, 69, 0.85)}
            ${sparkle(20, 26, 0.6, C.orange)}
        `),
        // ガトーショコラ (カップ入り)
        chocolat: svg(C.teal, `
            <path d="M26 52 L 74 52 L 68 82 L 32 82 Z" fill="${C.pink}"/>
            ${[32, 40, 48, 56, 64].map(x => `<line x1="${x}" y1="53" x2="${x + 1.5}" y2="81" stroke="#e58c89" stroke-width="1.4"/>`).join('')}
            <path d="M24 54 Q 26 30 50 30 Q 74 30 76 54 Z" fill="${C.cocoa}"/>
            <circle cx="58" cy="32" r="5" fill="#e0453a"/><circle cx="50" cy="30" r="3.5" fill="#8a3a8a"/>
            ${face(50, 44, 0.85).replace(/#2c3e50/g, C.cream)}
            ${sparkle(82, 26, 0.6, C.mustard)}
        `),
        // 国産りんごのタルト
        apple: svg(C.cream, `
            ${tartShell()}
            <ellipse cx="50" cy="56" rx="29" ry="7" fill="#f2c26b"/>
            ${[34, 44, 54, 64].map(x => `<path d="M${x - 6} 56 Q ${x} 46 ${x + 6} 56 Z" fill="#f6dc9a" stroke="#e0453a" stroke-width="1.6"/>`).join('')}
            <circle cx="70" cy="34" r="9" fill="#e0453a"/><path d="M70 25 q1 -4 4 -5" stroke="${C.cocoa}" stroke-width="2" fill="none"/><path d="M71 25 q6 -4 9 0 q-5 3 -9 0z" fill="${C.teal}"/>
            ${face(48, 69, 0.85)}
            ${sparkle(22, 28, 0.6, C.teal)}
        `),
        // さつまいもと栗のタルト
        sweetpotato: svg(C.orange, `
            ${tartShell('#f0c98a', '#d39a55')}
            <path d="M28 56 Q 30 40 42 44 Q 46 30 58 38 Q 70 34 72 56 Z" fill="#f7d36b"/>
            <path d="M36 50 Q 50 44 64 50" stroke="#e8b53a" stroke-width="2" fill="none"/>
            <path d="M50 30 Q 42 34 44 40 Q 50 44 56 40 Q 58 34 50 30 Z" fill="${C.cocoa}"/>
            <path d="M44 39 Q 50 43 56 39" stroke="#c99a6a" stroke-width="2" fill="none"/>
            ${face(48, 69, 0.85)}
            ${sparkle(80, 26, 0.6, C.cream)}
        `),
        // クレープ (みかん)
        crepe: svg(C.peach, `
            <path d="M18 74 L 50 26 L 82 74 Z" fill="#f5d590"/>
            <path d="M18 74 L 50 26 L 82 74" stroke="#e2b25e" stroke-width="2" fill="none"/>
            <path d="M30 56 Q 50 48 70 56 L 76 66 Q 50 58 24 66 Z" fill="#fff8ec"/>
            ${[38, 50, 62].map(x => `<circle cx="${x}" cy="54" r="5.5" fill="${C.orange}"/><path d="M${x} 49 v10 M${x - 5} 54 h10" stroke="#ffd08a" stroke-width="1"/>`).join('')}
            ${face(50, 68, 0.8)}
            ${sparkle(20, 26, 0.6, C.teal)}
        `),
        // キッズドリンク (ストロー付きのカップ)。juice の色で中身を変える
        drink: juice => `
            <svg viewBox="0 0 60 80" aria-hidden="true">
                <path d="M34 4 L 30 22" stroke="${C.teal}" stroke-width="3.5" stroke-linecap="round"/>
                <path d="M12 22 h36 l-4 50 q-14 5 -28 0 z" fill="${C.cream}" stroke="${C.navy}" stroke-width="2"/>
                <path d="M14 36 h32 l-3 34 q-13 4 -26 0 z" fill="${juice}"/>
                ${face(30, 50, 0.7).replace(/#2c3e50/g, C.cream)}
            </svg>`,
    };

    window.KIDS_MENU = {
        'バナナスティックケーキ': { art: art.banana, allergens: ['大豆', 'バナナ'] },
        '国産豆乳プリンタルト': { art: art.pudding, allergens: ['大豆'] },
        'ガトーショコラ': { art: art.chocolat, allergens: ['大豆'] },
        '国産りんごのタルト': { art: art.apple, allergens: ['大豆', 'りんご'] },
        'さつまいもと栗のタルト': { art: art.sweetpotato, allergens: ['大豆'] },
        // スプレッドシートは「みかんorヨーグルト」だが、今はみかんのみ
        'クレープ(みかんorヨーグルト)': { name: 'クレープ（みかん）', art: art.crepe, allergens: ['大豆'] },
    };
    // キッズドリンクは2種類から選べる
    window.KIDS_DRINKS = [
        { name: 'オレンジ', art: art.drink(C.orange) },
        { name: 'アップル', art: art.drink('#e8c64a') },
    ];
})();
