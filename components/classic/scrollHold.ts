// 조립이 끝날 때까지 아래로 내려가는 스크롤을 잠깐 붙잡는다(11-26 사용자 "모션이 끝날 때까지 스크롤 대기가 필요, 아니면 뭐가 있는지 모르고 지나간다").
// 위로 올라가는 것은 막지 않는다. 한 번에 하나만: 새로 붙잡으면 앞의 것은 푼다. 돌려주는 함수를 부르면 바로 풀린다.
// 11-26 손가락으로 넘기는 기기(아이패드, 휴대폰)는 자리를 되돌리는 방식(scrollTo)을 쓰지 않는다. 아이패드 크롬에서 위쪽 주소 막대가
// 접혔다 펴지며 화면이 흔들렸다(사용자 "아이패드 크롬은 잘 안 돼, 위에 상태바 있어서"). 대신 그 자리에서 페이지 스크롤을 잠갔다 푼다.
let current: (() => void) | null = null;

export const coarsePointer = () => typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;

export function holdScroll(y: number, ms: number) {
  current?.();
  const wheel = (e: WheelEvent) => {
    if (e.deltaY > 0) e.preventDefault();
  };
  let ty = 0;
  const tstart = (e: TouchEvent) => {
    ty = e.touches[0]?.clientY ?? 0;
  };
  const tmove = (e: TouchEvent) => {
    if ((e.touches[0]?.clientY ?? 0) < ty && e.cancelable) e.preventDefault();
  };
  const key = (e: KeyboardEvent) => {
    if (["ArrowDown", "PageDown", "End", " "].includes(e.key) && !(e.target as HTMLElement)?.closest?.("input, textarea, select, button, a, summary")) e.preventDefault();
  };
  // 마우스, 휠: 휠 밖의 방법(스크롤 막대 등)으로 내려가면 자리를 되돌려 붙잡는다
  const touch = coarsePointer();
  const clamp = () => {
    if (!touch && window.scrollY > y + 2) window.scrollTo(0, y);
  };
  // 손가락: 관성으로 내려가는 것은 이벤트로 못 막는다. 페이지 스크롤을 잠가 그 자리에 세운다
  const html = document.documentElement;
  const prev = [html.style.overflow, html.style.touchAction];
  if (touch) {
    html.style.overflow = "hidden";
    html.style.touchAction = "none";
  }
  window.addEventListener("wheel", wheel, { passive: false });
  window.addEventListener("touchstart", tstart, { passive: true });
  window.addEventListener("touchmove", tmove, { passive: false });
  window.addEventListener("keydown", key);
  window.addEventListener("scroll", clamp, { passive: true });
  let timer = 0;
  const done = () => {
    window.removeEventListener("wheel", wheel);
    window.removeEventListener("touchstart", tstart);
    window.removeEventListener("touchmove", tmove);
    window.removeEventListener("keydown", key);
    window.removeEventListener("scroll", clamp);
    window.clearTimeout(timer);
    if (touch) {
      html.style.overflow = prev[0];
      html.style.touchAction = prev[1];
    }
    if (current === done) current = null;
  };
  timer = window.setTimeout(done, ms);
  current = done;
  return done;
}
