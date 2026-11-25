"use client";

import { useEffect, useRef, useState } from "react";
import { Phone } from "lucide-react";

// 치과 2027 글자 창문(11-25). 2027 흐름 예상: 진짜 공간 사진을 크게, 첫 장면은 글자 하나로 강하게.
// 장면 순서(사용자 확인): 1 흰 화면에 큰 "온담", 글자 속으로만 접수대 사진이 보임 2 스크롤하면 글자가 화면 밖까지 커지며 안으로 들어가고 공간이 펼쳐짐
// 3 다음 공간(대기실, 진료실, 상담)이 둥근 창으로 열리며 바뀜 4 밝아지며 오시는 길.
// 3D 라이브러리 없이 CSS와 2D 캔버스만 쓴다(휴대폰 가볍게). 글자 창문은 캔버스에 흰 판을 칠하고 글자 모양을 지워 구멍을 낸다.
// 사진: 접수 Unsplash ECBg5FQkBXI, 대기실 Unsplash pxOQ-P97sA8(액자 글자 지움), 진료실 Pexels 9062525, 거울 Unsplash rubu_NvklJE.

const NAME = "온담치과의원";
const WORD = "온담";
const TEL = "02-000-0000";
const IMG = "/images/drafts/dent27";
const C = { ink: "#111", sub: "#5c5c5c", key: "#0f6b5c" };

// 장면: 사진, 둥근 창이 열리는 구간, 창이 열리는 자리(가로 사진, 세로 사진)
const SCENES = [
  { k: "rec", open: [0, 0], at: [50, 50], atM: [50, 50] },
  { k: "wait", open: [0.36, 0.45], at: [40, 62], atM: [42, 70] },
  { k: "room", open: [0.58, 0.67], at: [42, 60], atM: [36, 62] },
  { k: "mirror", open: [0.78, 0.86], at: [62, 62], atM: [56, 60] },
] as const;
// 글 구간: 0 접수(공간이 펼쳐진 뒤), 1 대기실, 2 진료실, 3 상담, 4 끝
const TEXT: [number, number][] = [
  [0.22, 0.35],
  [0.46, 0.57],
  [0.68, 0.77],
  [0.86, 0.9],
  [0.92, 1.01],
];
const HOURS = [
  ["평일", "10:00 ~ 19:00"],
  ["수요일 야간", "10:00 ~ 21:00"],
  ["토요일", "10:00 ~ 15:00"],
];
const CARE = ["충치 치료", "신경치료", "임플란트", "잇몸 치료", "치아교정", "스케일링"];

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

/** 흰 판에 글자 모양 구멍을 뚫어 그린다. 글자 획 가운데(o)를 중심으로 s배 키운다 */
function drawCover(ctx: CanvasRenderingContext2D, W: number, H: number, fam: string, s: number, o: { x: number; y: number }) {
  const fs = Math.min(W * 0.42, H * 0.52);
  ctx.globalCompositeOperation = "source-over";
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = "destination-out";
  ctx.translate(o.x, o.y);
  ctx.scale(s, s);
  ctx.translate(-o.x, -o.y);
  ctx.font = `900 ${fs}px ${fam}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  const m = ctx.measureText(WORD);
  ctx.fillText(WORD, W / 2, H / 2 + (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2);
  ctx.globalCompositeOperation = "source-over";
}

/** 같은 방식으로 작게 그려 글자 획 속에서 가장 굵은 점을 찾는다. 그 점을 중심으로 키우면 획이 화면을 다 덮는다 */
function strokeCenter(W: number, H: number, fam: string) {
  const k = 300 / Math.max(W, H);
  const w = Math.ceil(W * k);
  const h = Math.ceil(H * k);
  const cv = document.createElement("canvas");
  cv.width = w;
  cv.height = h;
  const ctx = cv.getContext("2d", { willReadFrequently: true });
  if (!ctx) return { x: W / 2, y: H / 2, r: 4 };
  ctx.scale(k, k);
  drawCover(ctx, W, H, fam, 1, { x: 0, y: 0 });
  const d = ctx.getImageData(0, 0, w, h).data;
  const hole = (x: number, y: number) => x >= 0 && y >= 0 && x < w && y < h && d[(Math.round(y) * w + Math.round(x)) * 4 + 3] < 40;
  let best = { x: w / 2, y: h / 2, r: 0 };
  for (let y = 1; y < h; y++)
    for (let x = 1; x < w; x++) {
      if (!hole(x, y)) continue;
      let r = 1;
      const ok = (r: number) => [0, 1, 2, 3, 4, 5, 6, 7].every((i) => hole(x + Math.cos((i * Math.PI) / 4) * r, y + Math.sin((i * Math.PI) / 4) * r));
      while (r < 60 && ok(r)) r++;
      const score = r - Math.hypot(x - w / 2, y - h / 2) * 0.01;
      if (score > best.r) best = { x, y, r: score };
    }
  return { x: best.x / k, y: best.y / k, r: Math.max(2, best.r / k) };
}

function Photo({ k, style }: { k: string; style?: React.CSSProperties }) {
  return (
    <picture>
      <source media="(orientation: portrait)" srcSet={`${IMG}/${k}-m.jpg`} />
      <source media="(max-width: 1100px)" srcSet={`${IMG}/${k}-sm.jpg`} />
      <img src={`${IMG}/${k}.jpg`} alt="" className="absolute inset-0 h-full w-full object-cover" style={style} decoding="async" />
    </picture>
  );
}

export function Dental2027Window() {
  const box = useRef<HTMLElement>(null);
  const word = useRef<HTMLSpanElement>(null);
  const cover = useRef<HTMLCanvasElement>(null);
  const photos = useRef<(HTMLDivElement | null)[]>([]);
  const imgs = useRef<(HTMLDivElement | null)[]>([]);
  const [stage, setStage] = useState(-1);
  const [hero, setHero] = useState(true);
  const [white, setWhite] = useState(0);

  useEffect(() => {
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let origin = { x: 0, y: 0, r: 10 };
    let tall = innerHeight > innerWidth * 1.1;
    let fam = "sans-serif";
    let W = innerWidth;
    let H = innerHeight;
    const dpr = Math.min(2, devicePixelRatio || 1);
    const measure = () => {
      tall = innerHeight > innerWidth * 1.1;
      const cv = cover.current;
      if (!cv) return;
      W = cv.clientWidth;
      H = cv.clientHeight;
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      if (word.current) fam = getComputedStyle(word.current).fontFamily;
      origin = strokeCenter(W, H, fam);
    };
    // 스크롤 값을 바로 쓰지 않고 따라가게 해 휴대폰에서도 미끄러지듯 움직인다
    let target = 0;
    let cur = 0;
    let raf = 0;
    let last = { stage: -2, white: -1 };
    const paint = (p: number) => {
      // 1 글자 창문: 0.03~0.2 사이 글자 획이 화면을 다 덮을 만큼 커진다
      const z = ease(clamp01((p - 0.03) / 0.17));
      const need = Math.hypot(innerWidth, innerHeight) / origin.r;
      const sc = still ? 1 : Math.pow(need * 1.3, z);
      const cv = cover.current;
      if (cv) {
        const op = still ? 1 - clamp01((p - 0.12) / 0.05) : 1 - clamp01((p - 0.17) / 0.04);
        cv.style.opacity = String(op);
        cv.style.visibility = op <= 0 ? "hidden" : "visible";
        const ctx = cv.getContext("2d");
        if (ctx && op > 0) {
          ctx.save();
          ctx.scale(dpr, dpr);
          drawCover(ctx, W, H, fam, sc, origin);
          ctx.restore();
        }
      }
      // 2 사진마다 천천히 다가가고, 다음 사진은 둥근 창으로 열린다
      SCENES.forEach((s, i) => {
        const el = photos.current[i];
        const im = imgs.current[i];
        if (!el || !im) return;
        const next = SCENES[i + 1];
        const start = i === 0 ? 0 : s.open[0];
        const end = next ? next.open[1] : 1;
        const local = clamp01((p - start) / (end - start));
        const visible = p >= start - 0.001 && (!next || p < end + 0.001);
        el.style.visibility = visible ? "visible" : "hidden";
        if (!visible) return;
        const zoom = i === 0 ? 1.35 - 0.25 * ease(clamp01(p / 0.22)) - 0.1 * local : 1.18 - 0.16 * local;
        im.style.transform = still ? "none" : `scale(${zoom})`;
        if (i > 0) {
          const o = ease(clamp01((p - s.open[0]) / (s.open[1] - s.open[0])));
          const [ax, ay] = tall ? s.atM : s.at;
          el.style.clipPath = o >= 1 ? "none" : `circle(${o * 150}% at ${ax}% ${ay}%)`;
        }
      });
      const st = TEXT.findIndex(([a, b]) => p >= a && p < b);
      const wh = Math.round(clamp01((p - 0.9) / 0.03) * 20) / 20;
      if (st !== last.stage || wh !== last.white) {
        last = { stage: st, white: wh };
        setStage(st);
        setWhite(wh);
      }
      setHero(p < 0.04);
    };
    const loop = () => {
      cur += (target - cur) * (still ? 1 : 0.14);
      if (Math.abs(target - cur) < 0.00005) cur = target;
      paint(cur);
      raf = cur === target ? 0 : requestAnimationFrame(loop);
    };
    const on = () => {
      const el = box.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      target = clamp01(-r.top / (r.height - innerHeight));
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const resize = () => {
      measure();
      on();
      paint(cur);
    };
    // 글꼴을 받은 뒤 다시 재야 글자 모양과 획 중심이 맞는다
    document.fonts.load(`900 100px ${getComputedStyle(word.current ?? document.body).fontFamily}`).then(resize, resize);
    resize();
    addEventListener("scroll", on, { passive: true });
    addEventListener("resize", resize);
    return () => {
      removeEventListener("scroll", on);
      removeEventListener("resize", resize);
      cancelAnimationFrame(raf);
    };
  }, []);

  const show = (i: number) => ({
    opacity: stage === i ? 1 : 0,
    transform: `translateY(${stage === i ? 0 : 24}px)`,
    transition: "opacity .6s, transform .6s",
  });

  return (
    <div className="text-[16px] leading-[1.7] md:text-[17px]" style={{ background: "#fff", color: C.ink }}>
      <section ref={box} aria-label="치과 둘러보기" className="relative" style={{ height: "700vh" }}>
        <div className="sticky top-0 h-[100svh] overflow-hidden bg-white">
          {SCENES.map((s, i) => (
            <div key={s.k} ref={(el) => void (photos.current[i] = el)} className="absolute inset-0 overflow-hidden" style={{ visibility: i === 0 ? "visible" : "hidden" }}>
              <div ref={(el) => void (imgs.current[i] = el)} className="absolute inset-0 will-change-transform">
                <Photo k={s.k} />
              </div>
            </div>
          ))}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/25" style={{ opacity: stage >= 0 && stage < 4 ? 1 : 0, transition: "opacity .6s" }} />

          {/* 1 글자 창문: 흰 판에 글자 모양 구멍을 뚫은 캔버스. 구멍으로 사진이 보이고, 글자를 키우면 그 안으로 들어간다 */}
          <canvas ref={cover} className="absolute inset-0 h-full w-full" aria-hidden />
          <span ref={word} className="pointer-events-none absolute opacity-0" aria-hidden>
            {WORD}
          </span>
          <div className="pointer-events-none absolute inset-x-0 top-0 mx-auto flex h-[72px] max-w-[1320px] items-center justify-between px-5 md:px-10" style={{ opacity: hero ? 1 : 0, transition: "opacity .4s" }}>
            <h1 className="text-[17px] font-[800] tracking-[-0.02em] md:text-[19px]">{NAME}</h1>
            <p className="text-[14px] font-semibold" style={{ color: C.sub }}>
              합정역 3번 출구 앞
            </p>
          </div>
          <p className="pointer-events-none absolute inset-x-0 bottom-[7svh] text-center text-[14px] font-semibold" style={{ color: C.sub, opacity: hero ? 1 : 0, transition: "opacity .4s" }}>
            내리면 글자 안으로 들어갑니다
          </p>

          {/* 접수 */}
          <Big style={show(0)} label="합정역 3번 출구 앞, 2층" title={NAME} />

          {/* 대기실 */}
          <Big style={show(1)} label="대기실" title="기다림이 짧도록 예약 간격을 넉넉히 둡니다">
            <dl className="mt-5 grid max-w-[420px] gap-1 text-[15px] md:text-[17px]">
              {HOURS.map(([d, t]) => (
                <div key={d} className="flex justify-between border-b border-white/25 py-2">
                  <dt className="font-semibold">{d}</dt>
                  <dd className="tabular-nums opacity-85">{t}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-[14px] opacity-80">점심시간 13:00 ~ 14:00, 일요일과 공휴일 휴진</p>
          </Big>

          {/* 진료실 */}
          <Big style={show(2)} label="진료실" title="진료실은 모두 문이 닫히는 1인실입니다">
            <ul className="mt-5 flex max-w-[520px] flex-wrap gap-2">
              {CARE.map((c) => (
                <li key={c} className="rounded-full border border-white/50 px-3.5 py-1.5 text-[15px] font-semibold">
                  {c}
                </li>
              ))}
            </ul>
          </Big>

          {/* 상담 */}
          <Big style={show(3)} label="상담" title="치료 계획은 CT를 같이 보며 정합니다">
            <p className="mt-4 max-w-[460px] text-[15px] opacity-90 md:text-[17px]">치료 순서와 기간, 비용을 먼저 적어 드립니다. 결정은 집에 가서 하셔도 됩니다.</p>
          </Big>

          {/* 끝: 밝아지며 오시는 길 */}
          <div className="absolute inset-0 flex items-center" style={{ background: `rgba(255,255,255,${white})`, pointerEvents: white > 0.9 ? "auto" : "none" }}>
            <div className="mx-auto w-full max-w-[1320px] px-5 md:px-10" style={show(4)}>
              <p className="text-[15px] font-bold" style={{ color: C.key }}>
                오시는 길
              </p>
              <h2 className="mt-3 text-[36px] font-[800] leading-[1.15] tracking-[-0.04em] md:text-[72px]">
                합정역 3번 출구,
                <br />
                건물 2층입니다
              </h2>
              <p className="mt-5 text-[16px] md:text-[18px]" style={{ color: C.sub }}>
                서울특별시 마포구 일대. 건물 뒤편 주차장 1시간 무료
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href={`tel:${TEL.replace(/-/g, "")}`} className="inline-flex h-14 items-center gap-2 rounded-full border-2 px-7 text-[17px] font-bold" style={{ borderColor: C.ink }}>
                  <Phone size={17} aria-hidden /> 전화 상담
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-10 text-[13px]" style={{ background: C.ink, color: "#9a9a9a" }}>
        <div className="mx-auto max-w-[1320px] px-5 md:px-10">
          <p className="font-bold text-white">{NAME}</p>
          <p className="mt-2">서울특별시 마포구 일대 | 대표원장 한지오 | 사업자등록번호 000-00-00000 | {TEL}</p>
        </div>
      </footer>
    </div>
  );
}

/** 사진 위 큰 글자(흰색). 휴대폰은 아래, 넓은 화면은 왼쪽 아래 */
function Big({ style, label, title, children }: { style: React.CSSProperties; label: string; title: string; children?: React.ReactNode }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-[7svh] mx-auto max-w-[1320px] px-5 text-white md:bottom-[10svh] md:px-10" style={style}>
      <p className="text-[14px] font-bold opacity-90 md:text-[15px]">{label}</p>
      <p className="mt-2 max-w-[900px] break-keep text-[34px] font-[800] leading-[1.12] tracking-[-0.045em] md:text-[72px]" style={{ textShadow: "0 2px 24px rgba(0,0,0,.25)" }}>
        {title}
      </p>
      {children}
    </div>
  );
}
