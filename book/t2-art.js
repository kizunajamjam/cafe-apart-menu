/**
 * cafe apart - T2 ティーのイメージイラスト (SVG)
 * 商品名ごとに、香りのイメージを描いた丸いイラストと、香りのキーワードを持つ。
 * 新しいティーを追加した時は、ここに同じ商品名で追加する (無い場合はティーカップの絵になる)。
 */
window.T2_ART = {
    // バニラの花とバニラビーンズ
    'ふんわりバニラのメルボルンブレックファースト': {
        tags: ['バニラ', 'まろやか'],
        svg: `
        <svg viewBox="0 0 100 100" aria-hidden="true">
            <circle cx="50" cy="50" r="48" fill="#f6ecd2"/>
            <path d="M22 78 C 38 60, 52 46, 80 30" stroke="#5a3a22" stroke-width="4.5" fill="none" stroke-linecap="round"/>
            <path d="M28 82 C 44 66, 60 52, 84 40" stroke="#6e4a2c" stroke-width="3.5" fill="none" stroke-linecap="round"/>
            <g transform="translate(44 44)">
                <g fill="#fffaf0" stroke="#d8b768" stroke-width="1.6">
                    <ellipse rx="7" ry="15" transform="rotate(0) translate(0 -12)"/>
                    <ellipse rx="7" ry="15" transform="rotate(72) translate(0 -12)"/>
                    <ellipse rx="7" ry="15" transform="rotate(144) translate(0 -12)"/>
                    <ellipse rx="7" ry="15" transform="rotate(216) translate(0 -12)"/>
                    <ellipse rx="7" ry="15" transform="rotate(288) translate(0 -12)"/>
                </g>
                <circle r="6" fill="#f2c94c"/>
                <circle r="2.6" fill="#e0a92e"/>
            </g>
            <path d="M70 66 q 6 -4 10 2" stroke="#8fae6a" stroke-width="3" fill="none" stroke-linecap="round"/>
        </svg>`,
    },
    // ベルガモットとラベンダー
    'フローラルなフレンチアールグレイ': {
        tags: ['ベルガモット', 'フローラル'],
        svg: `
        <svg viewBox="0 0 100 100" aria-hidden="true">
            <circle cx="50" cy="50" r="48" fill="#e8e4f2"/>
            <g stroke="#6e8f4e" stroke-width="2.2" stroke-linecap="round">
                <line x1="72" y1="84" x2="66" y2="30"/>
                <line x1="80" y1="82" x2="80" y2="38"/>
            </g>
            <g fill="#8d73c4">
                <ellipse cx="66" cy="32" rx="3" ry="4.5"/><ellipse cx="67" cy="40" rx="3" ry="4.5"/>
                <ellipse cx="67.5" cy="48" rx="3" ry="4.5"/><ellipse cx="68" cy="56" rx="3" ry="4.5"/>
                <ellipse cx="80" cy="40" rx="3" ry="4.5"/><ellipse cx="80" cy="48" rx="3" ry="4.5"/>
                <ellipse cx="80" cy="56" rx="3" ry="4.5"/>
            </g>
            <path d="M44 22 q 12 -8 20 2 q -10 6 -20 -2 z" fill="#7fa45a"/>
            <circle cx="40" cy="54" r="24" fill="#d9df6e"/>
            <circle cx="40" cy="54" r="24" fill="none" stroke="#b9c24a" stroke-width="2"/>
            <circle cx="33" cy="47" r="6" fill="#eef3a8" opacity="0.8"/>
            <path d="M40 30 q 2 -6 6 -9" stroke="#6e8f4e" stroke-width="2.4" fill="none" stroke-linecap="round"/>
        </svg>`,
    },
    // 桃と葉
    'フルーティーなパックス・ア・ピーチ': {
        tags: ['ピーチ', 'フルーティー'],
        svg: `
        <svg viewBox="0 0 100 100" aria-hidden="true">
            <defs>
                <radialGradient id="t2-peach" cx="38%" cy="38%" r="70%">
                    <stop offset="0" stop-color="#ffd2a8"/>
                    <stop offset="0.55" stop-color="#f7a072"/>
                    <stop offset="1" stop-color="#e8705f"/>
                </radialGradient>
            </defs>
            <circle cx="50" cy="50" r="48" fill="#fde6da"/>
            <path d="M50 30 C 22 26, 16 62, 34 76 C 42 82, 50 80, 50 80 C 50 80, 58 82, 66 76 C 84 62, 78 26, 50 30 Z" fill="url(#t2-peach)"/>
            <path d="M50 32 C 46 46, 46 64, 50 80" stroke="#d9654f" stroke-width="1.8" fill="none" opacity="0.6"/>
            <path d="M50 31 q -2 -8 2 -14" stroke="#7a5233" stroke-width="3" fill="none" stroke-linecap="round"/>
            <path d="M52 22 C 62 12, 78 14, 82 22 C 72 30, 58 28, 52 22 Z" fill="#8fb36a"/>
            <path d="M54 22 C 64 21, 72 21, 80 22" stroke="#6e9450" stroke-width="1.2" fill="none"/>
        </svg>`,
    },
    // シナモンスティックとスターアニス
    'スパイシーなオーガニックチャイ': {
        tags: ['スパイス', 'オーガニック'],
        svg: `
        <svg viewBox="0 0 100 100" aria-hidden="true">
            <circle cx="50" cy="50" r="48" fill="#f1e1cd"/>
            <g transform="rotate(-28 50 50)">
                <rect x="18" y="38" width="62" height="10" rx="5" fill="#a5642f"/>
                <rect x="18" y="38" width="62" height="10" rx="5" fill="none" stroke="#7c4620" stroke-width="1.4"/>
                <ellipse cx="18" cy="43" rx="3" ry="5" fill="#d79a5e" stroke="#7c4620" stroke-width="1.2"/>
                <rect x="22" y="52" width="58" height="9" rx="4.5" fill="#b8733a"/>
                <rect x="22" y="52" width="58" height="9" rx="4.5" fill="none" stroke="#7c4620" stroke-width="1.4"/>
                <ellipse cx="22" cy="56.5" rx="2.8" ry="4.5" fill="#d79a5e" stroke="#7c4620" stroke-width="1.2"/>
            </g>
            <g transform="translate(66 68)">
                <g fill="#6b3b1f">
                    <path d="M0 0 L -3 -14 L 0 -16 L 3 -14 Z" transform="rotate(0)"/>
                    <path d="M0 0 L -3 -14 L 0 -16 L 3 -14 Z" transform="rotate(45)"/>
                    <path d="M0 0 L -3 -14 L 0 -16 L 3 -14 Z" transform="rotate(90)"/>
                    <path d="M0 0 L -3 -14 L 0 -16 L 3 -14 Z" transform="rotate(135)"/>
                    <path d="M0 0 L -3 -14 L 0 -16 L 3 -14 Z" transform="rotate(180)"/>
                    <path d="M0 0 L -3 -14 L 0 -16 L 3 -14 Z" transform="rotate(225)"/>
                    <path d="M0 0 L -3 -14 L 0 -16 L 3 -14 Z" transform="rotate(270)"/>
                    <path d="M0 0 L -3 -14 L 0 -16 L 3 -14 Z" transform="rotate(315)"/>
                </g>
                <circle r="3.2" fill="#c98a4a"/>
            </g>
            <g fill="#8a5a33"><circle cx="30" cy="72" r="2.4"/><circle cx="36" cy="77" r="2"/><circle cx="26" cy="79" r="1.8"/></g>
        </svg>`,
    },
};

// イラストが無いティー用 (ティーカップ)
window.T2_ART_DEFAULT = {
    tags: [],
    svg: `
    <svg viewBox="0 0 100 100" aria-hidden="true">
        <circle cx="50" cy="50" r="48" fill="#efe9df"/>
        <path d="M26 44 h 40 v 10 a 20 20 0 0 1 -40 0 z" fill="#fff" stroke="#2c3e50" stroke-width="2"/>
        <path d="M66 48 a 8 8 0 0 1 0 14" fill="none" stroke="#2c3e50" stroke-width="2"/>
        <ellipse cx="46" cy="44" rx="20" ry="4" fill="#c8814a"/>
        <path d="M20 76 h 52" stroke="#2c3e50" stroke-width="2" stroke-linecap="round"/>
        <path d="M40 34 q -4 -6 0 -12 M50 34 q -4 -6 0 -12" stroke="#b9a58c" stroke-width="2" fill="none" stroke-linecap="round"/>
    </svg>`,
};
