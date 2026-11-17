// 곰파트너 AR 카탈로그 엔진
// 틀(TPL) 4개가 3D 모델을 만들고, 제품(PRODUCTS)은 치수 범위, 옵션, 가격 규칙만 적습니다.
// 새 제품은 PRODUCTS에 한 칸 추가하면 카탈로그, 3D, AR, 견적이 같이 생깁니다.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

// ---------- 공통 옵션 ----------
const FRAME = [
  { id: 'k', name: '블랙', hex: '#262626', metal: 0.5, rough: 0.4, add: 0 },
  { id: 'w', name: '화이트', hex: '#efeeea', metal: 0.15, rough: 0.42, add: 0 },
  { id: 'b', name: '브론즈', hex: '#5d4838', metal: 0.7, rough: 0.36, add: 40000 },
  { id: 'c', name: '샴페인골드', hex: '#c4ad80', metal: 0.82, rough: 0.3, add: 60000 }
];
const GLASS = [
  { id: 'b', name: '브론즈', hex: '#7d6a58', color: '#5e5044', opacity: 0.5, rough: 0.06, rate: 65000 },
  { id: 'c', name: '투명', hex: '#dbe6e4', color: '#e4eeec', opacity: 0.18, rough: 0.05, rate: 0 },
  { id: 's', name: '샤틴', hex: '#e6e9e6', color: '#e3e8e6', opacity: 0.82, rough: 0.75, rate: 55000 },
  { id: 'a', name: '아쿠아', hex: '#cfdcdb', color: '#d5e2e0', opacity: 0.66, rough: 0.28, rate: 65000 }
];
const WOOD = [
  { id: 'o', name: '내추럴 오크', hex: '#c9a477', rough: 0.7, add: 0 },
  { id: 'w', name: '월넛', hex: '#6b4a33', rough: 0.65, add: 0.12 },
  { id: 'h', name: '화이트', hex: '#f0eee9', rough: 0.55, add: 0 },
  { id: 'g', name: '웜 그레이', hex: '#9a958c', rough: 0.6, add: 0 }
];
const STONE = [
  { id: 'o', name: '내추럴 오크', hex: '#c9a477', rough: 0.7, add: 0 },
  { id: 'w', name: '월넛', hex: '#6b4a33', rough: 0.65, add: 0.15 },
  { id: 'm', name: '세라믹 화이트', hex: '#ecebe7', rough: 0.25, add: 0.35 },
  { id: 'k', name: '세라믹 블랙', hex: '#2b2b2b', rough: 0.3, add: 0.35 }
];
const SIGNC = [
  { id: 'n', name: '남색', hex: '#1b2a4a', ink: '#ffffff', add: 0 },
  { id: 'k', name: '블랙', hex: '#1f1f1f', ink: '#f2d27a', add: 0 },
  { id: 'w', name: '화이트', hex: '#f4f4f2', ink: '#1b2a4a', add: 0 },
  { id: 'r', name: '레드', hex: '#b3261e', ink: '#ffffff', add: 0 }
];
const LIGHT = [
  { id: 'l', name: 'LED 조명', add: 1 },
  { id: 'n', name: '조명 없음', add: 0 }
];

export const PALETTES = { FRAME, GLASS, WOOD, STONE, SIGNC, LIGHT };

export const CATS = [
  { id: 'door', name: '중문, 파티션' },
  { id: 'store', name: '수납 가구' },
  { id: 'table', name: '테이블' },
  { id: 'sign', name: '간판' },
  { id: 'etc', name: '기타' }
];

// 치수 칸 만들기
const R = (k, label, min, max, def, step = 10) => ({ k, label, type: 'range', min, max, def, step });
const C = (k, label, options, def) => ({ k, label, type: 'color', options, def: def || options[0].id });
const G = (k, label, options, def) => ({ k, label, type: 'seg', options, def: def || options[0].id });
const T = (k, label, def, max = 8) => ({ k, label, type: 'text', def, max });
const m2 = (s) => s.w * s.h / 1e6;
const by = (arr, id) => arr.find(x => x.id === id) || arr[0];
const r1000 = n => Math.round(n / 1000) * 1000;

// ---------- 제품 ----------
const DOOR = (id, name, desc, slide, leaves, base, perW, wMin, wMax) => ({
  id, cat: 'door', tpl: 'panel', name, desc,
  fixed: { slide, leaves, glassy: true },
  params: [R('w', '폭', wMin, wMax, Math.max(wMin, 1200)), R('h', '높이', 2000, 2500, 2300), C('frame', '프레임 색', FRAME), C('glass', '유리', GLASS),
    G('bar', '간살', [{ id: 'h1', name: '가로 1줄', add: 0 }, { id: 'n', name: '통유리', add: 0 }, { id: 'v', name: '세로 간살', add: 60000 }, { id: 'g', name: '격자', add: 110000 }])],
  price(s) {
    const sw = Math.max(0, Math.ceil((s.w - 1000) / 100)), sh = Math.max(0, Math.ceil((s.h - 2300) / 100));
    const L = [{ name: `기본 제품가, ${name}`, sub: '폭 1,000mm, 높이 2,300mm까지', price: base }];
    if (sw || sh) L.push({ name: '치수 추가', sub: '100mm 단위 가산', price: sw * perW + sh * 25000 });
    const f = by(FRAME, s.frame), g = by(GLASS, s.glass), b = this.params[4].options.find(x => x.id === s.bar);
    if (f.add) L.push({ name: `프레임 ${f.name}`, sub: '아노다이징 색상 가산', price: f.add });
    if (g.rate) L.push({ name: `유리 ${g.name}`, sub: '유리 면적 기준', price: r1000(g.rate * m2(s)) });
    if (b.add) L.push({ name: b.name, sub: '프레임 분할', price: b.add });
    L.push({ name: '시공비', sub: '실측, 설치, 실리콘 마감', price: 145000 });
    return L;
  }
});

export const PRODUCTS = [
  DOOR('door-3', '3연동 중문', '문짝 3장이 한쪽으로 겹쳐 열리는 슬라이딩 중문', true, 3, 720000, 33000, 1000, 2000),
  DOOR('door-1', '원슬라이딩 중문', '문짝 1장과 고정창 1장으로 된 슬라이딩 중문', true, 2, 620000, 30000, 900, 1800),
  DOOR('door-s', '스윙 중문', '한쪽 경첩으로 열리는 여닫이 중문', false, 1, 850000, 28000, 900, 1600),
  DOOR('door-d', '양개 중문', '문짝 2장이 양쪽으로 열리는 여닫이 중문', false, 2, 690000, 30000, 1100, 2000),
  {
    id: 'partition', cat: 'door', tpl: 'panel', name: '유리 파티션', desc: '사무실, 매장 공간을 나누는 고정 유리 칸막이',
    fixed: { slide: false, leaves: 0, glassy: true, panes: true },
    params: [R('w', '폭', 1200, 6000, 3000, 50), R('h', '높이', 2100, 2800, 2400), G('n', '분할', [{ id: '3', name: '3분할' }, { id: '2', name: '2분할' }, { id: '4', name: '4분할' }, { id: '5', name: '5분할' }]), C('frame', '프레임 색', FRAME), C('glass', '유리', GLASS, 'c')],
    price(s) { const g = by(GLASS, s.glass), f = by(FRAME, s.frame); return [
      { name: '강화유리 파티션', sub: '10T 강화유리, 제곱미터당 210,000원', price: r1000(210000 * m2(s)) },
      { name: '알루미늄 프레임', sub: `${s.n}분할`, price: 40000 * (+s.n + 1) + (f.add || 0) },
      ...(g.rate ? [{ name: `유리 ${g.name}`, sub: '유리 면적 기준', price: r1000(g.rate * m2(s)) }] : []),
      { name: '시공비', sub: '실측, 설치', price: 250000 }]; }
  },
  {
    id: 'closet-door', cat: 'door', tpl: 'panel', name: '붙박이장 슬라이딩 도어', desc: '드레스룸, 붙박이장 앞을 막는 슬라이딩 도어',
    fixed: { slide: true, glassy: false },
    params: [R('w', '폭', 1200, 3600, 2400, 50), R('h', '높이', 2000, 2600, 2300), G('leaves', '문짝 수', [{ id: '2', name: '2짝' }, { id: '3', name: '3짝' }, { id: '4', name: '4짝' }]), C('frame', '프레임 색', FRAME, 'w'), C('wood', '문짝 면재', WOOD, 'h')],
    price(s) { const w = by(WOOD, s.wood); return [
      { name: '슬라이딩 도어', sub: `${s.leaves}짝, 제곱미터당 160,000원`, price: r1000(160000 * m2(s) * (1 + (w.add || 0))) },
      { name: '상부 레일, 하부 가이드', sub: '소프트 클로징', price: 90000 + 30000 * (+s.leaves) },
      { name: '시공비', sub: '실측, 설치', price: 120000 }]; }
  },
  {
    id: 'shower', cat: 'door', tpl: 'panel', name: '샤워 부스', desc: '욕실 일자형 샤워 부스, 고정 유리와 여닫이 문',
    fixed: { slide: false, leaves: 2, glassy: true, shower: true },
    params: [R('w', '폭', 900, 1800, 1200), R('h', '높이', 1800, 2100, 1900), C('frame', '프레임 색', FRAME), C('glass', '유리', GLASS, 'c')],
    price(s) { const f = by(FRAME, s.frame), g = by(GLASS, s.glass); return [
      { name: '샤워 부스 일자형', sub: '8T 강화유리, 여닫이 1짝', price: r1000(380000 + 150000 * m2(s)) },
      ...(f.add ? [{ name: `프레임 ${f.name}`, sub: '색상 가산', price: f.add }] : []),
      ...(g.rate ? [{ name: `유리 ${g.name}`, sub: '유리 면적 기준', price: r1000(g.rate * m2(s)) }] : []),
      { name: '시공비', sub: '실리콘 방수 마감', price: 130000 }]; }
  },

  ...[
    ['bookshelf', '오픈 책장', '문 없는 칸칸 책장, 벽 폭에 맞춰 제작', { doors: 'none' }, 800, 3000, 1600, 900, 2400, 2100, 250, 400, 300, 150000],
    ['shoe', '신발장', '현관 벽에 맞춘 키 큰 신발장', { doors: 'solid' }, 600, 2400, 1200, 1800, 2400, 2300, 300, 400, 350, 220000],
    ['tv', '거실 수납장', '낮은 TV 거실장, 서랍형 문', { doors: 'solid', low: true }, 1200, 3000, 1800, 350, 600, 450, 350, 450, 400, 160000],
    ['wall-cab', '주방 상부장', '싱크대 위에 다는 상부 수납장', { doors: 'solid', wall: true }, 600, 3000, 1800, 600, 900, 700, 300, 350, 330, 180000],
    ['vitrine', '유리 진열장', '매장, 거실용 유리문 진열장', { doors: 'glass' }, 600, 2000, 1000, 1500, 2200, 1900, 350, 450, 400, 280000],
    ['shop-shelf', '매장 벽 선반', '편의점, 매장용 철제 벽 선반', { doors: 'none', metal: true }, 900, 4000, 2400, 1500, 2400, 1800, 300, 500, 400, 120000],
    ['wardrobe', '옷장', '키 큰 여닫이 옷장, 붙박이 맞춤', { doors: 'solid', hang: true }, 800, 3600, 1800, 2000, 2600, 2300, 550, 650, 600, 250000]
  ].map(([id, name, desc, fixed, wMin, wMax, wDef, hMin, hMax, hDef, dMin, dMax, dDef, base]) => ({
    id, cat: 'store', tpl: 'box', name, desc, fixed,
    params: [R('w', '폭', wMin, wMax, wDef), R('h', '높이', hMin, hMax, hDef), R('d', '깊이', dMin, dMax, dDef, 10),
      fixed.metal ? C('frame', '색', FRAME.slice(0, 2)) : C('wood', '색', WOOD)],
    price(s) {
      const w = fixed.metal ? { add: 0, name: by(FRAME, s.frame).name } : by(WOOD, s.wood);
      const face = s.w * s.h / 1e6, rate = fixed.doors === 'glass' ? 420000 : fixed.doors === 'solid' ? 330000 : fixed.metal ? 160000 : 260000;
      const L = [{ name: `${name} 본체`, sub: `정면 제곱미터당 ${rate.toLocaleString('ko-KR')}원, 깊이 ${s.d}mm`, price: r1000(rate * face * (0.8 + s.d / 1000)) }];
      if (w.add) L.push({ name: `${w.name} 마감`, sub: '마감재 가산', price: r1000(rate * face * w.add) });
      L.push({ name: '배송, 설치', sub: '수도권 기준', price: base > 200000 ? 120000 : 80000 });
      return L;
    }
  })),

  ...[
    ['dining', '식탁', '4~8인 원목 식탁', 'rect', 1200, 2400, 1600, 800, 1000, 900, 750, 'legs', 260000],
    ['cafe', '카페 원형 테이블', '카페, 매장용 원형 테이블', 'round', 600, 1000, 700, 600, 1000, 700, 750, 'ped', 140000],
    ['desk', '책상', '서재, 사무실 일자 책상', 'rect', 1000, 2000, 1400, 600, 800, 700, 730, 'panel', 180000],
    ['meeting', '회의 테이블', '6~12인 회의실 테이블', 'rect', 1800, 4000, 2400, 1000, 1400, 1200, 740, 'panel', 420000]
  ].map(([id, name, desc, shape, wMin, wMax, wDef, dMin, dMax, dDef, h, leg, base]) => ({
    id, cat: 'table', tpl: 'table', name, desc, fixed: { shape, h, leg },
    params: [R('w', shape === 'round' ? '지름' : '길이', wMin, wMax, wDef), ...(shape === 'round' ? [] : [R('d', '폭', dMin, dMax, dDef)]),
      C('top', '상판', STONE), C('frame', '다리 색', FRAME.slice(0, 3))],
    price(s) {
      const t = by(STONE, s.top), d = shape === 'round' ? s.w : s.d, area = s.w * d / 1e6;
      const L = [{ name: `${name} 상판`, sub: `${t.name}, 제곱미터당 ${(base * 1.4).toLocaleString('ko-KR')}원`, price: r1000(base * 1.4 * area * (1 + t.add)) },
        { name: '다리, 프레임', sub: by(FRAME, s.frame).name + ' 분체도장', price: r1000(base * 0.45) },
        { name: '배송, 조립', sub: '수도권 기준', price: 60000 }];
      return L;
    }
  })),

  ...[
    ['galva', '갈바 간판', '건물 외벽 가로형 갈바 박스 간판', 'box', 2000, 8000, 4000, 600, 1200, 900, '베이커리'],
    ['channel', '채널 간판', '글자마다 따로 세우는 입체 채널 간판', 'channel', 1500, 6000, 3000, 400, 900, 600, '카페'],
    ['blade', '돌출 간판', '벽에서 튀어나온 세로형 양면 간판', 'blade', 500, 900, 600, 900, 2400, 1500, '약'],
    ['aframe', '입간판', '가게 앞에 세우는 A형 입간판', 'aframe', 500, 700, 600, 900, 1200, 1050, '오늘의 메뉴']
  ].map(([id, name, desc, kind, wMin, wMax, wDef, hMin, hMax, hDef, text]) => ({
    id, cat: 'sign', tpl: 'sign', name, desc, fixed: { kind },
    params: [T('text', '간판 글자', text, kind === 'blade' ? 4 : 8), R('w', '폭', wMin, wMax, wDef, 50), R('h', '높이', hMin, hMax, hDef, 50), C('color', '바탕 색', SIGNC), ...(kind === 'aframe' ? [] : [G('light', '조명', LIGHT)])],
    price(s) {
      const area = s.w * s.h / 1e6, lit = s.light === 'l';
      const rate = { box: 180000, channel: 0, blade: 420000, aframe: 0 }[kind];
      const L = [];
      if (kind === 'channel') L.push({ name: '채널 글자', sub: `${[...s.text].length}자, 글자 높이 ${s.h}mm`, price: r1000([...s.text].length * (60000 + s.h * 160)) });
      else if (kind === 'aframe') L.push({ name: 'A형 입간판', sub: '양면 실사 출력 포함', price: r1000(90000 + area * 120000) });
      else L.push({ name: `${name} 본체`, sub: `제곱미터당 ${rate.toLocaleString('ko-KR')}원`, price: r1000(Math.max(1, area) * rate) });
      if (lit) L.push({ name: 'LED 조명', sub: '방수 LED, 타이머', price: r1000(kind === 'channel' ? [...s.text].length * 25000 : 60000 + area * 40000) });
      if (kind !== 'aframe') L.push({ name: '설치비', sub: '고소 작업, 전기 연결', price: kind === 'blade' ? 200000 : 250000 });
      return L;
    }
  }))
];

export const byIdP = id => PRODUCTS.find(p => p.id === id);

// ---------- 등록 도구로 만든 제품 (데이터만, 가격은 규칙표) ----------
// rule: { base, area: { keys: ['w','h'], rate }, steps: [{ k, from, unit, price }], install }
// 옵션의 add: 1 이상이면 원, 1 미만이면 본체 금액 대비 비율. rate: 제곱미터당 원
export function rulePrice(p, s) {
  const r = p.rule || {}, won = n => n.toLocaleString('ko-KR');
  const sz = p.tpl === 'model' ? (p.params.find(x => x.k === 'size')?.options.find(o => o.id === s.size) || {}) : s;
  const keys = r.area?.keys || ['w', 'h'];
  const area = (sz[keys[0]] || 0) * (sz[keys[1]] || 0) / 1e6;
  const L = [{ name: `기본 제품가, ${p.name}`, sub: r.baseSub || '기본 규격', price: +r.base || 0 }];
  if (r.area?.rate) L.push({ name: '면적 가산', sub: `제곱미터당 ${won(+r.area.rate)}원`, price: r1000(r.area.rate * area) });
  for (const st of r.steps || []) {
    const n = Math.max(0, Math.ceil(((+s[st.k] || 0) - st.from) / (st.unit || 100)));
    if (n) L.push({ name: '치수 추가', sub: `${st.from.toLocaleString('ko-KR')}mm 넘는 ${st.unit || 100}mm당 ${won(+st.price)}원`, price: n * st.price });
  }
  const body = L.reduce((a, l) => a + l.price, 0);
  for (const x of p.params) if (x.options) {
    const o = x.options.find(o => o.id === s[x.k]); if (!o) continue;
    const add = +o.add || 0, rate = +o.rate || 0;
    const v = add >= 1 ? add : add > 0 ? r1000(body * add) : rate ? r1000(rate * area) : 0;
    if (v) L.push({ name: `${x.label} ${o.name}`, sub: rate ? '면적 기준 가산' : '옵션 가산', price: v });
  }
  if (+r.install) L.push({ name: '설치비', sub: r.installSub || '실측, 설치', price: +r.install });
  return L;
}
// 외부에서 들어온 제품 데이터는 모양을 확인한 뒤에만 받습니다
function valid(d) {
  const str = v => typeof v === 'string', id = v => str(v) && /^[\w-]{1,40}$/.test(v);
  if (!d || !id(d.id) || !str(d.name) || (d.desc != null && !str(d.desc)) || !['panel', 'box', 'table', 'sign', 'model'].includes(d.tpl)) return false;
  if (d.thumb != null && !(str(d.thumb) && (/^data:image\/(jpeg|png|webp);base64,/.test(d.thumb) || /^[\w./-]+$/.test(d.thumb)))) return false;
  if (d.file != null && !(str(d.file) && (/^idb:[\w-]+$/.test(d.file) || /^models\/[\w.-]+\.(glb|gltf)$/.test(d.file)))) return false;
  if (!Array.isArray(d.params)) return false;
  for (const x of d.params) {
    if (!x || !id(x.k) || !str(x.label)) return false;
    if (x.options && !(Array.isArray(x.options) && x.options.every(o => o && id(o.id) && str(o.name) && (o.hex == null || /^(#[0-9a-fA-F]{3,8})?$/.test(o.hex))))) return false;
  }
  return true;
}
export function addProduct(d) {
  if (!valid(d)) return null;
  const p = { ...d, price(s) { return rulePrice(this, s); }, extra: true };
  const i = PRODUCTS.findIndex(x => x.id === p.id);
  if (i >= 0) PRODUCTS[i] = p; else PRODUCTS.push(p);
  return p;
}
// 정식 등록분(products.json)과 이 기기에서 등록한 것(브라우저 저장)을 불러옵니다
export async function loadExtra() {
  try { const r = await fetch(new URL('products.json', import.meta.url)); if (r.ok) for (const d of await r.json()) addProduct(d); } catch (e) {}
  try { for (const d of JSON.parse(localStorage.getItem('ar-local') || '[]')) addProduct({ ...d, local: true }); } catch (e) {}
}

// 3D 파일 저장소 (이 기기, IndexedDB)
function idb() { return new Promise((ok, no) => { const r = indexedDB.open('ar-files', 1); r.onupgradeneeded = () => r.result.createObjectStore('f'); r.onsuccess = () => ok(r.result); r.onerror = () => no(r.error); }); }
export async function putFile(key, blob) { const db = await idb(); return new Promise((ok, no) => { const t = db.transaction('f', 'readwrite'); t.objectStore('f').put(blob, key); t.oncomplete = ok; t.onerror = () => no(t.error); }); }
export async function getFile(key) { const db = await idb(); return new Promise((ok, no) => { const q = db.transaction('f').objectStore('f').get(key); q.onsuccess = () => ok(q.result); q.onerror = () => no(q.error); }); }
export function defaults(p) { const s = {}; for (const x of p.params) s[x.k] = x.def; return s; }
export function quote(p, s) { const lines = p.price(s); return { lines, total: lines.reduce((a, l) => a + l.price, 0) }; }
// 가장 작은 치수에서 옵션마다 가장 싼 것을 고른 금액 ("~부터")
export function fromPrice(p) {
  const s = defaults(p);
  for (const x of p.params) if (x.type === 'range') s[x.k] = x.min;
  for (const x of p.params) if (x.options) {
    let best = null;
    for (const o of x.options) { const t = quote(p, { ...s, [x.k]: o.id }).total; if (!best || t < best.t) best = { id: o.id, t }; }
    s[x.k] = best.id;
  }
  return quote(p, s).total;
}

// ---------- 3D 틀 ----------
function std(hex, metal = 0, rough = 0.6, extra = {}) { return new THREE.MeshStandardMaterial({ color: hex, metalness: metal, roughness: rough, ...extra }); }
function maker(root) {
  return (w, h, d, m, x, y, z) => {
    const r = Math.min(w, h, d) * 0.3;
    const o = new THREE.Mesh(r > 0.002 ? new RoundedBoxGeometry(w, h, d, 2, r) : new THREE.BoxGeometry(w, h, d), m);
    o.position.set(x, y, z); root.add(o); return o;
  };
}
function glassMat(g) { return new THREE.MeshStandardMaterial({ color: g.color, roughness: g.rough, transparent: true, opacity: g.opacity, side: THREE.DoubleSide, depthWrite: false }); }

const TPL = {
  panel(p, s) {
    const root = new THREE.Group(), box = maker(root);
    const f = by(FRAME, s.frame), fm = std(f.hex, f.metal, f.rough);
    const W = s.w / 1000, H = s.h / 1000, fx = p.fixed;
    const fill = fx.glassy ? glassMat(by(GLASS, s.glass)) : std(by(WOOD, s.wood).hex, 0, by(WOOD, s.wood).rough);
    const F = 0.045, D = fx.shower ? 0.06 : 0.1;
    box(F, H, D, fm, -W / 2 + F / 2, H / 2, 0); box(F, H, D, fm, W / 2 - F / 2, H / 2, 0);
    box(W, fx.slide ? 0.08 : F, D + 0.02, fm, 0, H - (fx.slide ? 0.04 : F / 2), 0);
    if (fx.slide || fx.panes) box(W - 2 * F, 0.02, D, fm, 0, 0.01, 0);
    const n = fx.panes ? +s.n : fx.leaves || +s.leaves, cw = W - 2 * F, top = H - (fx.slide ? 0.08 : F), lh = top - 0.02;
    const lw = fx.slide ? (cw + (n - 1) * 0.05) / n : cw / n;
    for (let i = 0; i < n; i++) {
      const x = fx.slide ? -cw / 2 + lw / 2 + i * (lw - 0.05) : -cw / 2 + lw / 2 + i * lw;
      const z = fx.slide ? (i - (n - 1) / 2) * 0.03 : 0, S = fx.panes || fx.shower ? 0.025 : 0.04, y0 = 0.012;
      if (fx.panes && i > 0) box(0.03, lh, D * 0.8, fm, x - lw / 2, y0 + lh / 2, 0);
      if (!fx.panes) {
        box(S, lh, 0.03, fm, x - lw / 2 + S / 2, y0 + lh / 2, z); box(S, lh, 0.03, fm, x + lw / 2 - S / 2, y0 + lh / 2, z);
        box(lw, S, 0.03, fm, x, y0 + S / 2, z); box(lw, S, 0.03, fm, x, y0 + lh - S / 2, z);
      }
      if (fx.glassy) {
        const pl = new THREE.Mesh(new THREE.PlaneGeometry(lw - 2 * S + 0.01, lh - 2 * S + 0.01), fill); pl.position.set(x, y0 + lh / 2, z); root.add(pl);
      } else box(lw - 2 * S + 0.004, lh - 2 * S + 0.004, 0.018, fill, x, y0 + lh / 2, z);
      if (s.bar === 'h1' || s.bar === 'g') box(lw - 0.02, 0.025, 0.025, fm, x, y0 + 0.95, z);
      if (s.bar === 'g') { box(lw - 0.02, 0.025, 0.025, fm, x, y0 + 1.6, z); box(lw - 0.02, 0.025, 0.025, fm, x, y0 + 0.35, z); }
      if (s.bar === 'v' || s.bar === 'g') box(0.025, lh - 0.04, 0.025, fm, x, y0 + lh / 2, z);
      const hm = std('#c9cdd2', 0.9, 0.25);
      const last = i === n - 1;
      if (!fx.panes && (fx.slide ? last : fx.shower ? last : n === 1 || i < 2)) {
        const hx = fx.slide ? x - lw / 2 + 0.09 : (n === 1 || fx.shower ? x - lw / 2 + 0.09 : (i === 0 ? x + lw / 2 - 0.08 : x - lw / 2 + 0.08));
        const hl = fx.glassy ? 0.9 : 0.3;
        box(0.02, hl, 0.02, hm, hx, 1.05, z + 0.035); box(0.02, hl, 0.02, hm, hx, 1.05, z - 0.035);
      }
    }
    return root;
  },

  box(p, s) {
    const root = new THREE.Group(), box = maker(root), fx = p.fixed;
    const W = s.w / 1000, H = s.h / 1000, D = s.d / 1000;
    const mat = fx.metal ? std(by(FRAME, s.frame).hex, 0.4, 0.45) : std(by(WOOD, s.wood).hex, 0, by(WOOD, s.wood).rough);
    const y0 = fx.wall ? 1.45 : 0, T = fx.metal ? 0.025 : 0.018, plinth = fx.wall || fx.metal ? 0 : 0.06;
    const cols = Math.max(1, Math.round(W / (fx.hang ? 0.5 : fx.low ? 0.6 : 0.45)));
    const rows = fx.low ? 1 : Math.max(1, Math.round((H - plinth) / (fx.doors === 'solid' && !fx.wall ? 0.6 : 0.36)));
    if (plinth) box(W - 0.02, plinth, D - 0.04, std('#2a2a2a', 0, 0.8), 0, y0 + plinth / 2, -0.02);
    box(T, H - plinth, D, mat, -W / 2 + T / 2, y0 + plinth + (H - plinth) / 2, 0);
    box(T, H - plinth, D, mat, W / 2 - T / 2, y0 + plinth + (H - plinth) / 2, 0);
    if (!fx.metal) box(W, T, D, mat, 0, y0 + H - T / 2, 0);
    box(W, T, D, mat, 0, y0 + plinth + T / 2, 0);
    box(W - 2 * T, H - plinth - 2 * T, 0.008, fx.metal ? std('#d9d9d6', 0.2, 0.6) : mat, 0, y0 + plinth + (H - plinth) / 2, -D / 2 + 0.004);
    const cw = (W - T) / cols, ih = (H - plinth - T) / rows;
    for (let c = 1; c < cols; c++) if (!fx.metal || c % 1 === 0) box(T, H - plinth - 2 * T, D - (fx.doors === 'none' ? 0 : 0.02), mat, -W / 2 + T / 2 + c * cw, y0 + plinth + (H - plinth) / 2, -0.01);
    for (let r = 1; r < rows; r++) if (!fx.hang) box(W - 2 * T, T, D - 0.02, mat, 0, y0 + plinth + T / 2 + r * ih, -0.01);
    if (fx.doors === 'none' && !fx.metal) {
      // 책 몇 권
      const pal = ['#8a3b2e', '#2f4b6e', '#d9c9a6', '#4d6b4f', '#3b3b3b', '#b6875a'];
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        if ((r * 7 + c * 3) % 4 === 3) continue;
        let x = -W / 2 + T + c * cw + 0.03, k = 0;
        const end = x + cw * (0.35 + ((r + c) % 3) * 0.15);
        while (x < end) { const bw = 0.025 + ((k * 13 + r) % 4) * 0.008, bh = Math.min(ih - 0.05, 0.2 + ((k * 7 + c) % 5) * 0.025);
          box(bw, bh, D * 0.75, std(pal[(k + r + c) % 6], 0, 0.8), x + bw / 2, y0 + plinth + T + r * ih + bh / 2, 0); x += bw + 0.003; k++; }
      }
    }
    if (fx.metal) for (let r = 0; r <= rows; r++) for (let c = 0; c < cols; c++) if (r < rows && (r + c) % 2 === 0)
      for (let k = 0; k < 4; k++) box(cw / 5.5, ih * 0.45, D * 0.6, std(['#d8604a', '#e9b949', '#4f86c6', '#6fae6a'][(k + r + c) % 4], 0, 0.7), -W / 2 + T + c * cw + cw * (0.15 + k * 0.22), y0 + T + r * ih + ih * 0.23 + T, 0);
    if (fx.doors !== 'none') {
      const dm = fx.doors === 'glass' ? glassMat(by(GLASS, 'c')) : mat, hm = std('#b9bcc0', 0.9, 0.3);
      const dn = fx.low ? cols * 1 : cols;
      const dw = (W - 0.004) / dn;
      for (let c = 0; c < dn; c++) {
        const x = -W / 2 + dw / 2 + c * dw + 0.002;
        if (fx.low) {
          box(dw - 0.004, H - plinth - 0.006, 0.018, dm, x, y0 + plinth + (H - plinth) / 2, D / 2 + 0.009);
          box(dw * 0.4, 0.012, 0.02, hm, x, y0 + H - 0.05, D / 2 + 0.025);
        } else {
          const dh = H - plinth - 0.006;
          if (fx.doors === 'glass') {
            const fr = std(by(WOOD, s.wood).hex, 0, 0.6);
            box(0.04, dh, 0.02, fr, x - dw / 2 + 0.022, y0 + plinth + dh / 2, D / 2 + 0.01); box(0.04, dh, 0.02, fr, x + dw / 2 - 0.022, y0 + plinth + dh / 2, D / 2 + 0.01);
            box(dw - 0.004, 0.04, 0.02, fr, x, y0 + plinth + 0.02, D / 2 + 0.01); box(dw - 0.004, 0.04, 0.02, fr, x, y0 + plinth + dh - 0.02, D / 2 + 0.01);
            const pl = new THREE.Mesh(new THREE.PlaneGeometry(dw - 0.08, dh - 0.08), dm); pl.position.set(x, y0 + plinth + dh / 2, D / 2 + 0.01); root.add(pl);
          } else box(dw - 0.004, dh, 0.018, dm, x, y0 + plinth + dh / 2, D / 2 + 0.009);
          const hx = c % 2 ? x - dw / 2 + 0.04 : x + dw / 2 - 0.04;
          const hy = fx.wall ? y0 + 0.08 : y0 + plinth + Math.min(1.05, dh * 0.5);
          box(0.014, fx.wall ? 0.12 : 0.3, 0.02, hm, hx, hy, D / 2 + 0.03);
        }
      }
    }
    return root;
  },

  table(p, s) {
    const root = new THREE.Group(), box = maker(root), fx = p.fixed;
    const W = s.w / 1000, Dp = (fx.shape === 'round' ? s.w : s.d) / 1000, H = fx.h / 1000;
    const t = by(STONE, s.top), top = std(t.hex, 0, t.rough), f = by(FRAME, s.frame), fm = std(f.hex, f.metal, f.rough);
    const tt = 0.03;
    if (fx.shape === 'round') {
      const o = new THREE.Mesh(new THREE.CylinderGeometry(W / 2, W / 2, tt, 64), top); o.position.y = H - tt / 2; root.add(o);
    } else box(W, tt, Dp, top, 0, H - tt / 2, 0);
    const lh = H - tt;
    if (fx.leg === 'ped') {
      const c = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, lh, 24), fm); c.position.y = lh / 2; root.add(c);
      const b = new THREE.Mesh(new THREE.CylinderGeometry(W * 0.3, W * 0.32, 0.02, 48), fm); b.position.y = 0.01; root.add(b);
    } else if (fx.leg === 'panel') {
      for (const sx of [-1, 1]) {
        box(0.05, lh, Dp * 0.8, fm, sx * (W / 2 - 0.12), lh / 2, 0);
      }
      box(W - 0.3, 0.12, 0.02, fm, 0, lh - 0.1, -Dp * 0.3);
    } else {
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(0.05, lh, 0.05, fm, sx * (W / 2 - 0.08), lh / 2, sz * (Dp / 2 - 0.08));
      box(W - 0.2, 0.06, 0.03, fm, 0, lh - 0.04, Dp / 2 - 0.08); box(W - 0.2, 0.06, 0.03, fm, 0, lh - 0.04, -Dp / 2 + 0.08);
    }
    return root;
  },

  sign(p, s) {
    const root = new THREE.Group(), box = maker(root), kind = p.fixed.kind;
    const c = by(SIGNC, s.color), W = s.w / 1000, H = s.h / 1000, lit = s.light === 'l';
    const bg = std(c.hex, 0.2, 0.5);
    const face = (w, h, text, transparent) => {
      const cv = document.createElement('canvas'), k = 512 / Math.max(w, h);
      cv.width = Math.max(64, Math.round(w * k)); cv.height = Math.max(64, Math.round(h * k));
      const g = cv.getContext('2d');
      if (!transparent) { g.fillStyle = c.hex; g.fillRect(0, 0, cv.width, cv.height); }
      g.fillStyle = transparent ? c.hex : c.ink; g.textAlign = 'center'; g.textBaseline = 'middle';
      const vertical = kind === 'blade';
      const chars = [...(text || ' ')];
      if (vertical) {
        const fs = Math.min(cv.width * 0.72, cv.height / chars.length * 0.82);
        g.font = `800 ${fs}px Pretendard, "Apple SD Gothic Neo", sans-serif`;
        chars.forEach((ch, i) => g.fillText(ch, cv.width / 2, cv.height / 2 + (i - (chars.length - 1) / 2) * fs * 1.1));
      } else {
        let fs = cv.height * (kind === 'aframe' ? 0.16 : kind === 'channel' ? 0.92 : 0.62);
        g.font = `800 ${fs}px Pretendard, "Apple SD Gothic Neo", sans-serif`;
        const mw = g.measureText(text).width; if (mw > cv.width * 0.86) fs *= cv.width * 0.86 / mw;
        g.font = `800 ${fs}px Pretendard, "Apple SD Gothic Neo", sans-serif`;
        if (kind === 'aframe') {
          g.fillText(text, cv.width / 2, cv.height * 0.16);
          g.font = `500 ${cv.width * 0.075}px Pretendard, sans-serif`;
          ['아메리카노  4,000', '카페라테  4,500', '바닐라라테  5,000', '오늘의 빵  3,500'].forEach((l, i) => g.fillText(l, cv.width / 2, cv.height * (0.38 + i * 0.13)));
        } else g.fillText(text, cv.width / 2, cv.height / 2);
      }
      const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
      const m = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.45, transparent: !!transparent, emissive: lit ? (transparent ? c.hex : '#ffffff') : '#000000', emissiveMap: lit ? tex : null, emissiveIntensity: lit ? 0.35 : 0 });
      return new THREE.Mesh(new THREE.PlaneGeometry(w, h), m);
    };
    // 간판이 붙을 벽 일부
    const wallM = std('#d9d5cc', 0, 0.9);
    if (kind === 'box' || kind === 'channel') {
      const y = 3.2;
      box(W + 1.2, H + 1.2, 0.04, wallM, 0, y, -0.02);
      if (kind === 'box') { box(W, H, 0.12, bg, 0, y, 0.06); const f = face(W - 0.02, H - 0.02, s.text); f.position.set(0, y, 0.1205); root.add(f); }
      else { box(W, 0.1, 0.06, std('#8d8a84', 0.5, 0.5), 0, y - H / 2 + 0.05, 0.03); const f = face(W, H, s.text, true); f.position.set(0, y, 0.11); root.add(f); }
    } else if (kind === 'blade') {
      const y = 2.6 + H / 2;
      box(0.5, H + 0.8, 0.04, wallM, 0, y, -0.02);
      box(0.05, 0.05, W + 0.15, std('#555', 0.6, 0.4), 0, y + H / 2 + 0.06, W / 2 + 0.06);
      box(0.05, 0.05, W + 0.15, std('#555', 0.6, 0.4), 0, y - H / 2 - 0.06, W / 2 + 0.06);
      box(0.14, H, W, bg, 0, y, W / 2 + 0.12);
      for (const sx of [-1, 1]) { const f = face(W - 0.02, H - 0.02, s.text); f.rotation.y = sx * Math.PI / 2; f.position.set(sx * 0.0705, y, W / 2 + 0.12); root.add(f); }
    } else {
      const ang = 0.18, L = H / Math.cos(ang);
      for (const sz of [-1, 1]) {
        // 위에서 맞붙고 아래가 벌어지는 A형
        const g = new THREE.Group(); g.position.y = H; g.rotation.x = -sz * ang; root.add(g);
        const b = new THREE.Mesh(new RoundedBoxGeometry(W, L, 0.025, 2, 0.006), bg); b.position.set(0, -L / 2, sz * 0.0125); g.add(b);
        const f = face(W - 0.06, L - 0.1, s.text); f.position.set(0, -L / 2 - 0.01, sz * 0.026); if (sz < 0) f.rotation.y = Math.PI; g.add(f);
      }
    }
    return root;
  }
};

// 3D 파일 틀: 파일을 불러와 고른 규격의 실제 치수(mm)에 맞춰 크기를 맞춥니다
const loaded = new Map();
async function modelScene(p) {
  const key = p.file;
  if (!loaded.has(key)) loaded.set(key, (async () => {
    let src = key;
    if (key.startsWith('idb:')) { const b = await getFile(key.slice(4)); if (!b) throw new Error('3D 파일 없음'); src = URL.createObjectURL(b); }
    else src = new URL(key, import.meta.url).href;
    // 스캔 앱, AI 생성 파일은 압축(Draco, meshopt)된 경우가 많습니다
    const ld = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder)
      .setDRACOLoader(new DRACOLoader().setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/libs/draco/gltf/'));
    return (await ld.loadAsync(src)).scene;
  })());
  return loaded.get(key);
}
TPL.model = async (p, s) => {
  const src = (await modelScene(p)).clone(true);
  const sz = p.params.find(x => x.k === 'size')?.options.find(o => o.id === s.size);
  const box = new THREE.Box3().setFromObject(src), dim = box.getSize(new THREE.Vector3()), c = box.getCenter(new THREE.Vector3());
  src.position.set(-c.x, -box.min.y, -c.z);
  const g = new THREE.Group(); g.add(src);
  // 실물을 찍은 모델이라 비율은 그대로 두고 높이에 맞춰 키운다. 폭, 깊이는 15% 안에서만 맞춘다
  if (sz && dim.x && dim.y && dim.z) {
    const k = sz.h / 1000 / dim.y, fit = (want, have) => Math.min(1.15, Math.max(0.85, want / 1000 / (have * k)));
    g.scale.set(k * (sz.w ? fit(sz.w, dim.x) : 1), k, k * (sz.d ? fit(sz.d, dim.z) : 1));
  }
  const col = p.params.find(x => x.k === 'tint')?.options.find(o => o.id === s.tint);
  if (col && col.hex) g.traverse(o => { if (o.isMesh) { o.material = o.material.clone(); o.material.color.set(col.hex); } });
  const root = new THREE.Group(); root.add(g); return root;
};

export function build(p, s) { return TPL[p.tpl](p, s); }
