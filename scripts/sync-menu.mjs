/**
 * cafe apart - メニューデータ同期スクリプト
 *
 * ホームページ (cafe-apart-hp) と同じ Google スプレッドシートから CSV を取得し、
 * data/menu.csv と data/menu-data.js を書き出す。
 *
 *   npm run sync                 … スプレッドシートから取得
 *   node scripts/sync-menu.mjs path/to/menu.csv   … ローカルの CSV から生成
 */
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const SPREADSHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vS3obFx_eeJzUPLGj1btfJrzDKeo4tq9XUJcnB3yKRqMsxK1uw3z4_o4m7fMVkQbg2iFf3BD_EtBoic/pub?output=csv";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// クォート内のカンマ・改行・"" エスケープに対応した CSV パーサー
function parseCsv(text) {
    const rows = [];
    let row = [], field = '', inQuotes = false;
    for (let i = 0; i < text.length; i++) {
        const c = text[i];
        if (inQuotes) {
            if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
            else if (c === '"') inQuotes = false;
            else field += c;
        } else if (c === '"') inQuotes = true;
        else if (c === ',') { row.push(field); field = ''; }
        else if (c === '\n' || c === '\r') {
            if (c === '\r' && text[i + 1] === '\n') i++;
            row.push(field); rows.push(row); row = []; field = '';
        } else field += c;
    }
    if (field || row.length) { row.push(field); rows.push(row); }
    return rows;
}

async function main() {
    const localPath = process.argv[2];
    let csv;
    if (localPath) {
        csv = await readFile(localPath, 'utf8');
        console.log(`ローカルファイルから読み込み: ${localPath}`);
    } else {
        const res = await fetch(SPREADSHEET_CSV_URL);
        if (!res.ok) throw new Error(`スプレッドシートの取得に失敗しました (HTTP ${res.status})`);
        csv = await res.text();
        console.log('Google スプレッドシートから取得しました');
    }

    // ホームページ (script.js) と同じ列構成: category,img,title,desc,price,note,memo
    const items = parseCsv(csv).slice(1)
        .map(r => r.map(v => (v || '').trim()))
        .filter(r => r[2])
        .map(([category, img, title, desc, price, note]) => ({
            category: (category || '').toLowerCase(),
            img: (img || '').replace(/\\/g, '/'),
            title,
            desc: desc || '',
            price: price || '',
            note: note || '',
        }));

    if (!localPath) await writeFile(path.join(root, 'data/menu.csv'), csv);
    const js = `// 自動生成ファイル: npm run sync で更新されます（直接編集しないでください）\n` +
        `// 生成日時: ${new Date().toISOString()}\n` +
        `window.MENU_DATA = ${JSON.stringify(items, null, 2)};\n`;
    await writeFile(path.join(root, 'data/menu-data.js'), js);

    const counts = items.reduce((acc, it) => (acc[it.category] = (acc[it.category] || 0) + 1, acc), {});
    console.log(`${items.length} 品を書き出しました`, counts);
}

main().catch(err => { console.error(err.message); process.exit(1); });
