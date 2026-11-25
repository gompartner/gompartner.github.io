// 조립이 끝날 때까지 아래로 내려가는 스크롤을 잠깐 붙잡는다(11-26 사용자 "모션이 끝날 때까지 스크롤 대기가 필요, 아니면 뭐가 있는지 모르고 지나간다").
// 위로 올라가는 것은 막지 않는다. 한 번에 하나만: 새로 붙잡으면 앞의 것은 푼다. 돌려주는 함수를 부르면 바로 풀린다.
let current: (() => void) | null = null;

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
  // 손가락을 뗀 뒤 관성으로 내려가는 것은 위 이벤트로 못 막아서 자리를 되돌려 붙잡는다
  const clamp = () => {
    if (window.scrollY > y + 2) window.scrollTo(0, y);
  };
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
    if (current === done) current = null;
  };
  timer = window.setTimeout(done, ms);
  current = done;
  return done;
}
