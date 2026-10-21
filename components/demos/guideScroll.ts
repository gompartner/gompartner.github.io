// 샘플 사용법 가이드가 비출 영역으로 옮기는 도구. DemoDock과 프라이빗 짐 데모가 같이 쓴다.

/** 안내 영역으로 바로 옮긴다. 사이트 전체의 부드러운 스크롤을 잠시 꺼서 휴대폰 사파리에서도 미끄러지지 않게 하고,
 *  화면보다 큰 구역은 가운데 대신 머리글 아래에 윗부분을 맞춘다. */
export function jumpTo(el: HTMLElement) {
  const root = document.documentElement;
  const prev = root.style.scrollBehavior;
  root.style.scrollBehavior = "auto";
  const r = el.getBoundingClientRect();
  const vh = window.innerHeight;
  const top = r.height > vh * 0.6 ? window.scrollY + r.top - 80 : window.scrollY + r.top - (vh - r.height) / 2;
  window.scrollTo(0, Math.max(top, 0));
  root.style.scrollBehavior = prev;
}

/** 스크롤이 멈출 때까지(연속 6프레임 같은 위치, 최대 0.8초) 기다렸다가 done을 부른다.
 *  휴대폰에서 주소창이 줄거나 이미지가 늦게 떠 위치가 흔들리는 동안 가이드를 띄우지 않기 위해서다. */
export function afterSettle(done: () => void) {
  const t0 = performance.now();
  let last = window.scrollY;
  let still = 0;
  const tick = () => {
    const y = window.scrollY;
    still = y === last ? still + 1 : 0;
    last = y;
    if (still >= 6 || performance.now() - t0 > 800) done();
    else requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
