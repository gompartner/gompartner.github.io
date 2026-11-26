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
// 카드 바탕을 나누는 비스듬한 판 세 조각
export const SLICES = ["polygon(0% 0%, 40% 0%, 28% 100%, 0% 100%)", "polygon(40% 0%, 74% 0%, 62% 100%, 28% 100%)", "polygon(74% 0%, 100% 0%, 100% 100%, 62% 100%)"];
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
