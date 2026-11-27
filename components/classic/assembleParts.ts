// 조립 연출에서 메인(Assemble)과 안쪽 판(BoardGate)이 함께 쓰는 것: 부품이 날아와 끼워지는 움직임(CSS)과 작은 부품을 고르는 방법.
// "use client"를 붙이지 않는다. CSS 문자열을 서버 컴포넌트(board/ui.tsx)에서도 그대로 읽어야 한다.

export const pieceCss = `
@keyframes asm-piece {
  0% { opacity: 0; transform: translate(var(--px), var(--py)) rotate(var(--pr)) scale(var(--ps)); animation-timing-function: ease-out; }
  40% { opacity: 1; transform: translate(calc(var(--px) * 0.75), calc(var(--py) * 0.75)) rotate(calc(var(--pr) * 0.75)) scale(1); filter: brightness(1); animation-timing-function: cubic-bezier(0.85, 0, 1, 0.45); }
  78% { opacity: 1; transform: translate(0px, 0px) rotate(0deg) scale(1); filter: brightness(1.9); animation-timing-function: ease-out; }
  100% { opacity: 1; transform: translate(0px, 0px) rotate(0deg) scale(1); filter: brightness(1); }
}
.asm-piece { animation: asm-piece var(--pt, 0.46s) linear both; animation-delay: var(--pd); will-change: transform, opacity; }
.asm-plate { position: absolute; inset: 0; pointer-events: none; }
`;

export const rnd = (a: number, b: number) => a + Math.random() * (b - a);
export const MAX = 14;
// 카드 바탕을 나누는 판 조각. 11-28 대표 "처음 입장했을 때 슬래시된 조각 패턴이 같다": 예전에는 모든 카드가 같은 세 조각(같은 자리, 같은 기울기)이었다.
// 이제 카드마다 조각 수(2~4), 자르는 방향(세로 7, 가로 3), 자르는 자리와 기울기 방향을 새로 정한다. 조각은 자기 자리 쪽 바깥에서 날아온다.
export type Slice = { clip: string; px: number; py: number; pr: number };
export function slices(): Slice[] {
  const n = 2 + Math.floor(Math.random() * 3);
  const across = Math.random() < 0.7; // true: 세로로 자른다(조각이 좌우로), false: 가로로 자른다(조각이 위아래로)
  // 자르는 선 n-1개: 고른 간격에 조금씩 흔들고, 선마다 기울기 방향을 따로 정한다(간격 25% 이상, 흔들림 4%, 기울기 12% 이하라 선끼리 겹치지 않는다)
  const a = [0], b = [0];
  for (let k = 1; k < n; k++) {
    const base = (k / n) * 100 + rnd(-4, 4);
    const tilt = rnd(5, 12) * (Math.random() < 0.5 ? -1 : 1);
    a.push(base + tilt / 2);
    b.push(base - tilt / 2);
  }
  a.push(100);
  b.push(100);
  const f = (v: number) => `${v.toFixed(1)}%`;
  return Array.from({ length: n }, (_, i) => {
    const mid = (a[i] + a[i + 1] + b[i] + b[i + 1]) / 4;
    const out = ((mid - 50) / 50) * rnd(70, 110);
    const clip = across
      ? `polygon(${f(a[i])} 0%, ${f(a[i + 1])} 0%, ${f(b[i + 1])} 100%, ${f(b[i])} 100%)`
      : `polygon(0% ${f(a[i])}, 0% ${f(a[i + 1])}, 100% ${f(b[i + 1])}, 100% ${f(b[i])})`;
    return {
      clip,
      px: Math.round(across ? out : rnd(-40, 40)),
      py: Math.round(across ? rnd(-60, 50) : out * 0.7),
      pr: +rnd(-8, 8).toFixed(1),
    };
  });
}
export const clear = (c: string) => c === "transparent" || c === "rgba(0, 0, 0, 0)";

/** 조립할 작은 요소를 고른다: 글자를 직접 품었거나, 작거나(원, 버튼, 아이콘), 안에 블록 요소가 없으면 그 자체가 부품. 아니면 안으로 더 들어간다 */
export function pieces(root: Element, out: HTMLElement[], depth: number, max = MAX) {
  for (const child of Array.from(root.children) as HTMLElement[]) {
    if (out.length >= max) return;
    if (child.classList.contains("asm-plate") || child.tagName === "STYLE") continue;
    const display = getComputedStyle(child).display;
    if (display === "none" || display === "inline") continue;
    if (display === "contents") {
      pieces(child, out, depth, max);
      continue;
    }
    const r = child.getBoundingClientRect();
    const text = Array.from(child.childNodes).some((n) => n.nodeType === 3 && (n.textContent ?? "").trim().length > 0);
    const blocks = (Array.from(child.children) as HTMLElement[]).filter((c) => !["inline", "none"].includes(getComputedStyle(c).display));
    const small = r.width < 150 && r.height < 150;
    if (text || small || blocks.length === 0 || depth >= 3 || child.tagName.toLowerCase() === "svg") out.push(child);
    else pieces(child, out, depth + 1, max);
  }
}
