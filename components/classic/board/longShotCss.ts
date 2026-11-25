// 긴 화면 캡처가 창 안에서 저절로 내려가는 움직임(LongShot.tsx). 판 틀(board/ui.tsx)의 style에 함께 넣는다.
export const longShotCss = `
@keyframes ls-pan { 0%, 7% { transform: translateY(0); animation-timing-function: cubic-bezier(.4, 0, .6, 1); } 90%, 97% { transform: translateY(calc(-100% + 100cqh)); animation-timing-function: cubic-bezier(.6, 0, .2, 1); } 100% { transform: translateY(0); } }
@keyframes ls-bar { 0%, 7% { transform: translateY(0); animation-timing-function: cubic-bezier(.4, 0, .6, 1); } 90%, 97% { transform: translateY(calc(100cqh - 100% - 12px)); animation-timing-function: cubic-bezier(.6, 0, .2, 1); } 100% { transform: translateY(0); } }
.ls { container-type: size; }
.ls-img { animation: ls-pan var(--ls-dur) linear infinite paused; will-change: transform; }
.ls-bar { animation: ls-bar var(--ls-dur) linear infinite paused; }
.ls[data-on] :is(.ls-img, .ls-bar) { animation-play-state: running; }
@media (hover: hover) { .ls[data-on]:hover :is(.ls-img, .ls-bar) { animation-play-state: paused; } }
@media (prefers-reduced-motion: reduce) { .ls-img, .ls-bar { animation: none; } }
`;
