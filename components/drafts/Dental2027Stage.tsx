"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Phone } from "lucide-react";

// 치과 2027 종이 무대(11-25). 실제 공간 사진을 깊이별로 세 겹(뒤 벽, 가운데, 앞 물건)으로 오려 흰 종이 테두리와 그림자를 입히고,
// 종이 무대(디오라마)처럼 세운다. 스크롤하면 작은 무대가 다가와 화면을 채우고, 겹이 벌어지며 그 사이로 걸어 들어간다.
// 장면 순서(사용자 확인): 1 종이 바탕 위 작은 무대(접수대)와 병원 이름 2 무대 안으로 3 대기실, 진료실, 상담 무대를 차례로 4 오시는 길과 예약 버튼.
// 3D 라이브러리 없이 CSS 3D만(휴대폰 가볍게). 층 이미지는 scripts/stage-cut.py로 만든다(public/images/drafts/dent27s).
// 사진: 접수 Unsplash ECBg5FQkBXI, 대기실 Unsplash pxOQ-P97sA8(액자 글자 지움), 진료실 Pexels 9062525, 거울 Unsplash rubu_NvklJE.

const NAME = "온담치과의원";
const TEL = "02-000-0000";
const IMG = "/images/drafts/dent27s";
const PAPER = "#ece9e4";
const C = { ink: "#161514", sub: "#5f5b55", key: "#0f6b5c" };
const P = 1000; // 원근 거리(px)

const SCENES = ["rec", "wait", "room", "mirror"] as const;
const SPAN = 0.9 / SCENES.length; // 장면 하나가 차지하는 진행값, 0.9 뒤는 끝 화면

const HOURS = [
  ["평일", "10:00 ~ 19:00"],
  ["수요일 야간", "10:00 ~ 21:00"],
  ["토요일", "10:00 ~ 15:00"],
];
const CARE = ["충치 치료", "신경치료", "임플란트", "잇몸 치료", "치아교정", "스케일링"];

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => x * x * (3 - 2 * x);

function Layer({ k, n }: { k: string; n: 0 | 1 | 2 }) {
  const ext = n === 0 ? "jpg" : "webp";
  return (
    <picture>
      <source media="(orientation: portrait)" srcSet={`${IMG}/${k}-s${n}-m.${ext}`} />
      <img src={`${IMG}/${k}-s${n}.${ext}`} alt="" className="absolute inset-0 h-full w-full object-cover" decoding="async" draggable={false} />
    </picture>
  );
}

export function Dental2027Stage() {
  const box = useRef<HTMLElement>(null);
  const stages = useRef<(HTMLDivElement | null)[]>([]);
  const layers = useRef<(HTMLDivElement | null)[][]>(SCENES.map(() => []));
  const [scene, setScene] = useState(-1);
  const [hero, setHero] = useState(true);
  const [white, setWhite] = useState(0);

  useEffect(() => {
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let target = 0;
    let cur = 0;
    let raf = 0;
    let last = { scene: -2, white: -1, hero: true };
    const paint = (p: number) => {
      const narrow = innerWidth < 768;
      SCENES.forEach((_, i) => {
        const el = stages.current[i];
        if (!el) return;
        const a = i * SPAN;
        const t = (p - a) / SPAN; // 이 장면 안에서 0~1
        // 앞 장면이 빨려 나가는 동안 다음 장면이 작은 무대로 들어온다
        const vis = t > -0.2 && t < 1.05;
        el.style.visibility = vis ? "visible" : "hidden";
        if (!vis) return;
        const inT = ease(clamp01(t / 0.3)); // 작은 무대에서 화면 가득으로
        const outT = ease(clamp01((t - 0.78) / 0.22)); // 앞 겹을 지나 다음 장면으로
        const pre = clamp01((t + 0.2) / 0.2); // 앞 장면이 나가는 동안 나타남
        const mini = narrow ? 0.62 : 0.56;
        const scale = still ? 1 : (mini + (1 - mini) * inT) * (1 + outT * 0.45);
        const spread = still ? 0 : (narrow ? 130 : 220) * (1 - inT * 0.7) + outT * 160;
        const rotY = still ? 0 : (1 - inT) * (narrow ? -20 : -26) + inT * (t - 0.5) * 6;
        const rotX = still ? 0 : (1 - inT) * 10;
        const lift = still ? 0 : (1 - inT) * (narrow ? 6 : 4);
        el.style.opacity = String(Math.min(i === 0 ? 1 : pre, 1 - clamp01((t - 0.92) / 0.08)));
        el.style.transform = `translateY(${lift}vh) scale(${scale}) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
        el.style.zIndex = String(10 - i);
        // 겹마다 앞뒤로 벌리고, 원근 때문에 작아지거나 커진 만큼 크기를 되돌려 처음에는 한 장의 사진처럼 맞물리게 한다
        layers.current[i].forEach((ly, n) => {
          if (!ly) return;
          const z = (n - 1) * spread;
          const comp = (P - z) / P;
          ly.style.transform = `translateZ(${z}px) scale(${comp})`;
          if (n === 2) ly.style.opacity = String(1 - outT);
        });
        // 종이 무대 틀(테두리, 그림자)은 작을 때만
        el.style.setProperty("--frame", String(1 - inT + outT * 0));
      });
      const sc = p >= 0.9 ? -1 : Math.min(SCENES.length - 1, Math.floor(p / SPAN));
      const tIn = (p - sc * SPAN) / SPAN;
      const showText = sc >= 0 && tIn > 0.32 && tIn < 0.8 ? sc : -1;
      const wh = Math.round(clamp01((p - 0.88) / 0.04) * 20) / 20;
      const h = p < 0.05;
      if (showText !== last.scene || wh !== last.white || h !== last.hero) {
        last = { scene: showText, white: wh, hero: h };
        setScene(showText);
        setWhite(wh);
        setHero(h);
      }
    };
    const loop = () => {
      cur += (target - cur) * (still ? 1 : 0.12);
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
      on();
      paint(cur);
    };
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
    opacity: scene === i ? 1 : 0,
    transform: `translateY(${scene === i ? 0 : 20}px) rotate(${scene === i ? -1 : 0}deg)`,
    transition: "opacity .5s, transform .5s",
  });

  return (
    <div className="text-[16px] leading-[1.7] md:text-[17px]" style={{ background: PAPER, color: C.ink }}>
      <section ref={box} aria-label="치과 둘러보기" className="relative" style={{ height: "760vh" }}>
        <div className="sticky top-0 h-[100svh] overflow-hidden" style={{ perspective: `${P}px`, background: PAPER }}>
          {SCENES.map((k, i) => (
            <div
              key={k}
              ref={(el) => void (stages.current[i] = el)}
              className="absolute inset-0 will-change-transform"
              style={{ transformStyle: "preserve-3d", visibility: i === 0 ? "visible" : "hidden" }}
            >
              {/* 무대 틀: 작을 때 보이는 흰 종이 테두리와 바닥 그림자 */}
              <div
                className="absolute inset-0"
                style={{ transform: `translateZ(${-P * 0.02}px)`, boxShadow: "0 0 0 14px #fff, 0 40px 80px rgba(0,0,0,.25)", opacity: "var(--frame, 1)" as unknown as number }}
              />
              {[0, 1, 2].map((n) => (
                <div key={n} ref={(el) => void (layers.current[i][n] = el)} className="absolute inset-0" style={{ transformStyle: "preserve-3d" }}>
                  <Layer k={k} n={n as 0 | 1 | 2} />
                </div>
              ))}
            </div>
          ))}

          {/* 1 첫 화면: 종이 바탕 위 작은 무대와 병원 이름 */}
          <div className="pointer-events-none absolute inset-x-0 top-[7svh] z-20 mx-auto max-w-[1320px] px-5 text-center md:top-[5svh] md:px-10" style={{ opacity: hero ? 1 : 0, transition: "opacity .5s" }}>
            <p className="text-[14px] font-bold md:text-[15px]" style={{ color: C.sub }}>
              서울 마포구 합정역 3번 출구 앞
            </p>
            <h1 className="mt-1 text-[40px] font-[900] leading-[1.05] tracking-[-0.05em] md:text-[76px]">{NAME}</h1>
          </div>
          <p className="pointer-events-none absolute inset-x-0 bottom-[5svh] z-20 text-center text-[14px] font-semibold" style={{ color: C.sub, opacity: hero ? 1 : 0, transition: "opacity .5s" }}>
            내리면 무대 안으로 들어갑니다
          </p>

          {/* 장면 글: 종이 쪽지처럼 */}
          <Note style={show(0)} label="접수" title="합정역 3번 출구 앞, 건물 2층">
            <p className="mt-3 text-[15px]" style={{ color: C.sub }}>
              처음 오시면 접수대에서 문진표를 같이 적습니다.
            </p>
          </Note>
          <Note style={show(1)} label="대기실" title="기다림이 짧도록 예약 간격을 넉넉히 둡니다">
            <dl className="mt-4">
              {HOURS.map(([d, t]) => (
                <div key={d} className="flex justify-between border-b border-black/10 py-2 text-[15px] md:text-[16px]">
                  <dt className="font-semibold">{d}</dt>
                  <dd className="tabular-nums" style={{ color: C.sub }}>
                    {t}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-2 text-[13px]" style={{ color: C.sub }}>
              점심시간 13:00 ~ 14:00, 일요일과 공휴일 휴진
            </p>
          </Note>
          <Note style={show(2)} label="진료실" title="진료실은 모두 문이 닫히는 1인실입니다">
            <ul className="mt-4 flex flex-wrap gap-2">
              {CARE.map((c) => (
                <li key={c} className="rounded-full border border-black/15 px-3 py-1 text-[14px] font-semibold md:text-[15px]">
                  {c}
                </li>
              ))}
            </ul>
          </Note>
          <Note style={show(3)} label="상담" title="치료 계획은 CT를 같이 보며 정합니다">
            <p className="mt-3 text-[15px]" style={{ color: C.sub }}>
              치료 순서와 기간, 비용을 먼저 적어 드립니다. 결정은 집에 가서 하셔도 됩니다.
            </p>
          </Note>

          {/* 끝: 종이 바탕 위 오시는 길 */}
          <div className="absolute inset-0 z-30 flex items-center" style={{ background: `rgba(236,233,228,${white})`, pointerEvents: white > 0.9 ? "auto" : "none" }}>
            <div className="mx-auto w-full max-w-[1320px] px-5 md:px-10" style={{ opacity: white, transition: "opacity .4s" }}>
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
                <span className="inline-flex h-14 items-center gap-2 rounded-full px-7 text-[17px] font-bold text-white" style={{ background: "#03c75a" }}>
                  네이버 예약 <ArrowUpRight size={18} aria-hidden />
                </span>
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

/** 종이 쪽지 모양 글 상자. 휴대폰은 아래, 넓은 화면은 왼쪽 아래 */
function Note({ style, label, title, children }: { style: React.CSSProperties; label: string; title: string; children?: React.ReactNode }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-[5svh] z-20 mx-auto max-w-[1320px] px-4 md:bottom-[8svh] md:px-10">
      <div style={{ ...style, boxShadow: "0 1px 0 rgba(0,0,0,.04), 0 18px 40px rgba(0,0,0,.18)" }} className="max-w-[420px] bg-[#fbfaf7] p-6 md:p-7">
        <p className="text-[13px] font-bold tracking-[0.02em]" style={{ color: C.key }}>
          {label}
        </p>
        <p className="mt-1.5 break-keep text-[22px] font-[800] leading-[1.25] tracking-[-0.03em] md:text-[28px]">{title}</p>
        {children}
      </div>
    </div>
  );
}
