import { pieceCss } from "@/components/classic/assembleParts";

// 안쪽 판의 조립 연출. 11-26 메인과 같은 방식으로 맞췄다(사용자 "작은 부품 컴포넌트가 조립되는 느낌, 지금은 도장 찍는 느낌").
// 부품 상자(.bd-in)는 통째로 나타나지 않는다. 바탕이 비스듬한 판 세 조각으로 맞물리고, 그 안의 제목, 설명, 금액, 그림이 하나씩 제자리에 끼워진다.
// 움직임은 BoardGate가 붙인다(assembleParts의 asm-piece). 여기서는 차례가 오기 전까지 상자를 숨겨 두는 일만 한다.
//  - 스크립트가 돌지 않으면 3초 뒤 그대로 보인다. 움직임 줄이기 설정이면 처음부터 보인다
//  - 새로고침 전까지 판마다 한 번만(BoardGate가 data-built를 붙인다)
export const assembleCss = `${pieceCss}
@keyframes bd-late { to { opacity: 1; } }
.bd-in { position: relative; }
.bd-in:not([data-go]) { opacity: 0; animation: bd-late 0.3s ease-out 3s forwards; }
.bd-in .asm-plate { z-index: -1; }
[data-live] .bd-in:not([data-go]) { animation: none; }
/* 날아오는 조각이 화면 옆으로 나가도 가로 스크롤이 생기지 않게 */
[data-live] { overflow-x: clip; }
[data-built] .bd-in { opacity: 1; animation: none; }
@media (prefers-reduced-motion: reduce) { .bd-in:not([data-go]) { opacity: 1; animation: none; } }
`;
