// 조립 연출(사이트 컨셉). 11-26 사용자 "조립이라고": 부품이 날아오거나 끌려와 붙는 것이 아니라,
// 그 자리에서 선이 먼저 그어지고(틀), 면이 비스듬히 차오르며(내용이 드러남), 한 번 밝아진 뒤 선이 사라진다. 참고 영상(빛줄기와 면)과 같은 순서.
// 메인 아래 칸(Assemble의 [data-part][data-go])과 안쪽 판(.bd-in)이 함께 쓴다.
//  - 상자 부품: 둥근 테두리 선이 마주 보는 두 모서리에서 자라 만난다
//  - 글 부품(data-part="text", .bd-text): 윗선 한 줄이 그어진다
//  - 면: 바탕색 덮개(--asm-bg)가 비스듬한 경계로 걷히며 내용이 드러난다. 덮개는 부품 차례가 올 때까지 내용을 가린다
// 시작 시각은 --d(판) 또는 --delay(메인). 새로고침 전까지 한 번만은 BoardGate와 Assemble이 맡는다.
const PART = ":is(.bd-in, [data-asm] [data-part][data-go]:not([data-instant]))";
const TEXT = ':is(.bd-text, [data-part="text"])';

export const assembleCss = `
@property --asm-a { syntax: "<angle>"; inherits: false; initial-value: 180deg; }
@keyframes asm-sweep { from { --asm-a: 0deg; } to { --asm-a: 180deg; } }
@keyframes asm-rule { from { transform: scaleX(0); } to { transform: scaleX(1); } }
@keyframes asm-out { to { opacity: 0; } }
@keyframes asm-face { from { clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%); } to { clip-path: polygon(118% 0%, 118% 0%, 100% 100%, 100% 100%); } }
@keyframes asm-flash { 0% { filter: brightness(1); } 40% { filter: brightness(1.5); } 100% { filter: none; } }
${PART} { position: relative; --asm-t: var(--d, var(--delay, 0s)); animation: asm-flash 0.4s ease-out both; animation-delay: calc(var(--asm-t) + 0.55s); }
${PART}::before {
  content: ""; position: absolute; inset: -2px; z-index: 1; pointer-events: none; background: var(--asm-bg, #0b0d12);
  animation: asm-face 0.42s cubic-bezier(0.6, 0, 0.2, 1) both; animation-delay: calc(var(--asm-t) + 0.3s);
}
${PART}::after {
  content: ""; position: absolute; inset: 0; z-index: 2; pointer-events: none; border-radius: inherit; border: 1.5px solid #9dbdff; --asm-a: 180deg;
  -webkit-mask: conic-gradient(from 225deg, #000 0 var(--asm-a), transparent var(--asm-a) 180deg, #000 180deg calc(180deg + var(--asm-a)), transparent calc(180deg + var(--asm-a)) 360deg);
  mask: conic-gradient(from 225deg, #000 0 var(--asm-a), transparent var(--asm-a) 180deg, #000 180deg calc(180deg + var(--asm-a)), transparent calc(180deg + var(--asm-a)) 360deg);
  animation: asm-sweep 0.42s cubic-bezier(0.6, 0, 0.2, 1) both, asm-out 0.3s ease-out forwards; animation-delay: var(--asm-t), calc(var(--asm-t) + 0.75s);
}
${PART}${TEXT}::after {
  inset: 0 0 auto 0; height: 0; border: 0; border-top: 1.5px solid #9dbdff; border-radius: 0; -webkit-mask: none; mask: none; transform-origin: left;
  animation: asm-rule 0.42s cubic-bezier(0.6, 0, 0.2, 1) both, asm-out 0.3s ease-out forwards; animation-delay: var(--asm-t), calc(var(--asm-t) + 0.75s);
}
[data-built] .bd-in { animation: none; }
[data-built] .bd-in::before, [data-built] .bd-in::after { display: none; }
@media (prefers-reduced-motion: reduce) {
  ${PART} { animation: none; }
  ${PART}::before, ${PART}::after { display: none; }
}
`;
