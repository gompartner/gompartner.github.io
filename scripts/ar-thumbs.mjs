// AR 카탈로그 대표 사진을 한꺼번에 찍습니다.
// 사용: public 폴더를 로컬 서버로 띄운 뒤  node scripts/ar-thumbs.mjs http://localhost:8731  [제품id ...]
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';

const base = (process.argv[2] || 'http://localhost:8731').replace(/\/$/, '');
const only = process.argv.slice(3);
const out = fileURLToPath(new URL('../public/3d/ar/thumbs/', import.meta.url));

const b = await chromium.launch({ channel: 'chrome', args: ['--use-gl=angle', '--ignore-gpu-blocklist'] });
const p = await b.newPage({ viewport: { width: 400, height: 400 }, deviceScaleFactor: 1 });
const list = await (async () => {
  await p.goto(base + '/3d/ar/');
  return p.evaluate(async () => (await import('./engine.js')).PRODUCTS.map(x => x.id));
})();
let fail = 0;
for (const id of list.filter(x => !only.length || only.includes(x))) {
  await p.goto(`${base}/3d/ar/p.html?id=${id}&shot=1`);
  try {
    await p.waitForFunction(() => document.getElementById('mv').loaded, null, { timeout: 15000 });
    await p.waitForTimeout(900);
    await p.screenshot({ path: out + id + '.jpg', type: 'jpeg', quality: 86 });
    console.log('ok', id);
  } catch (e) { fail++; console.log('fail', id, e.message.split('\n')[0]); }
}
await b.close();
console.log(`${list.length}개 중 실패 ${fail}`);
