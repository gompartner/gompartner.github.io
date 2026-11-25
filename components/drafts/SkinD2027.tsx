"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { Phone } from "lucide-react";
import type { DropScene } from "./skin3d/DropLens";

// 피부과 시안 D 2027 리퀴드 글래스(11-25). 2027 흐름 예상: 진짜 공간 사진을 크게, 그 위에 맑은 유리와 물의 재질.
// 장면 순서(사용자 확인): 1 실제 피부과 라운지 사진 위 큰 물방울 하나(굴절, 확대) 2 물방울이 흘러가며 시술실, 화장품 선반, 세럼을 확대해 보여 주고 설명이 붙음
// 3 물방울 안에 다음 공간이 비치다가 화면 가득 커지며 넘어감 4 밝아지며 오시는 길. 시술 전후 사진, 효과 장담 문구는 넣지 않는다.
// 사진: 라운지 Unsplash X8Y3CJA0aNs, 시술실 Pexels 16571735, 선반 Unsplash uaD-0u_DwQw, 세럼 Unsplash yXcBwMp05Us(병 글자 지움).
const DropLens = dynamic(() => import("./skin3d/DropLens"), { ssr: false });

const NAME = "윤슬피부과의원";
const TEL = "02-000-0000";
const IMG = "/images/drafts/skin27";
const C = { ink: "#14181c", sub: "#5a636c", key: "#2f6f8f" };

// 물방울이 지나는 길(화면 비율 x, y)
const SCENES: DropScene[] = [
  { k: "lounge", path: [[0.66, 0.45], [0.42, 0.52], [0.3, 0.56]] },
  { k: "room", path: [[0.7, 0.4], [0.58, 0.55], [0.52, 0.62]] },
  { k: "shelf", path: [[0.72, 0.3], [0.7, 0.5], [0.66, 0.62]] },
  { k: "serum", path: [[0.5, 0.35], [0.5, 0.45], [0.5, 0.5]] },
];
const SPAN = 0.9 / SCENES.length;
const TREAT = ["레이저 토닝", "리프팅", "여드름 치료", "흉터 치료", "보습 관리", "제모"];
const HOURS = [
  ["평일", "10:00 ~ 20:00"],
  ["토요일", "10:00 ~ 16:00"],
  ["점심시간", "13:00 ~ 14:00"],
];

export function SkinD2027() {
  const box = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const [scene, setScene] = useState(-1);
  const [hero, setHero] = useState(true);
  const [white, setWhite] = useState(0);
  const [still, setStill] = useState<boolean | null>(null);
  const [ready, setReady] = useState(false);
  const onReady = useCallback(() => setReady(true), []);

  useEffect(() => {
    queueMicrotask(() => setStill(matchMedia("(prefers-reduced-motion: reduce)").matches));
    let last = { s: -2, w: -1, h: true };
    const on = () => {
      const el = box.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, -r.top / (r.height - innerHeight)));
      progress.current = p;
      const i = Math.min(SCENES.length - 1, Math.floor(Math.min(p, 0.8999) / SPAN));
      const t = (p - i * SPAN) / SPAN;
      const s = p < 0.9 && t > 0.12 && t < 0.62 ? i : -1;
      const w = Math.round(Math.min(1, Math.max(0, (p - 0.9) / 0.04)) * 20) / 20;
      const h = p < 0.04;
      if (s !== last.s || w !== last.w || h !== last.h) {
        last = { s, w, h };
        setScene(s);
        setWhite(w);
        setHero(h);
      }
    };
    on();
    addEventListener("scroll", on, { passive: true });
    addEventListener("resize", on);
    return () => {
      removeEventListener("scroll", on);
      removeEventListener("resize", on);
    };
  }, []);

  const show = (i: number) => ({
    opacity: scene === i ? 1 : 0,
    transform: `translateY(${scene === i ? 0 : 18}px)`,
    transition: "opacity .5s, transform .5s",
  });

  return (
    <div className="text-[16px] leading-[1.7] md:text-[17px]" style={{ background: "#fff", color: C.ink }}>
      <section ref={box} aria-label="병원 둘러보기" className="relative" style={{ height: "680vh" }}>
        <div className="sticky top-0 h-[100svh] overflow-hidden bg-[#eef1f3]">
          {/* 사진을 다 받기 전에는 첫 장면 사진을 깔아 둔다 */}
          {!ready && (
            <picture>
              <source media="(orientation: portrait)" srcSet={`${IMG}/lounge-m.jpg`} />
              <img src={`${IMG}/lounge-sm.jpg`} alt="" className="absolute inset-0 h-full w-full object-cover" />
            </picture>
          )}
          {still !== null && <DropLens progress={progress} scenes={SCENES} base={IMG} still={still} onReady={onReady} />}

          <header className="pointer-events-none absolute inset-x-0 top-0 z-20">
            <div className="mx-auto flex h-[72px] max-w-[1320px] items-center justify-between px-5 md:px-10">
              <p className="text-[19px] font-[800] tracking-[-0.03em] md:text-[21px]">{NAME}</p>
              <a href={`tel:${TEL.replace(/-/g, "")}`} className="pointer-events-auto inline-flex h-10 items-center gap-1.5 rounded-full bg-white/80 px-4 text-[14px] font-bold ring-1 ring-black/10 md:text-[15px]">
                <Phone size={15} aria-hidden /> {TEL}
              </a>
            </div>
          </header>

          {/* 첫 화면 */}
          <div className="pointer-events-none absolute inset-x-0 top-[13svh] z-10 mx-auto max-w-[1320px] px-5 md:top-[16svh] md:px-10" style={{ opacity: hero ? 1 : 0, transition: "opacity .5s" }}>
            <p className="text-[14px] font-bold md:text-[15px]" style={{ color: C.key }}>
              서울 성동구 성수동, 피부과 전문의 진료
            </p>
            <h1 className="mt-2 text-[46px] font-[800] leading-[1.06] tracking-[-0.05em] md:text-[96px]">
              맑게,
              <br />
              오래
            </h1>
            <p className="mt-4 text-[14px] font-semibold" style={{ color: C.sub }}>
              내리면 물방울이 병원 안을 비춰 봅니다
            </p>
          </div>

          <Card style={show(0)} label="라운지" title="처음 오시면 피부 상태부터 사진으로 남깁니다">
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
              일요일, 공휴일 휴진
            </p>
          </Card>
          <Card style={show(1)} label="시술실" title="시술실은 모두 문이 닫히는 1인실입니다">
            <ul className="mt-4 flex flex-wrap gap-2">
              {TREAT.map((c) => (
                <li key={c} className="rounded-full border border-black/15 px-3 py-1 text-[14px] font-semibold md:text-[15px]">
                  {c}
                </li>
              ))}
            </ul>
          </Card>
          <Card style={show(2)} label="홈케어 안내" title="시술 뒤 집에서 바를 것까지 적어 드립니다">
            <p className="mt-3 text-[15px]" style={{ color: C.sub }}>
              피부 타입에 맞는 세안, 보습, 자외선 차단 순서를 한 장으로 정리해 드립니다.
            </p>
          </Card>
          <Card style={show(3)} label="상담" title="횟수와 비용을 먼저 적어 드립니다">
            <p className="mt-3 text-[15px]" style={{ color: C.sub }}>
              같은 시술도 피부 두께와 색소 깊이에 따라 횟수가 다릅니다. 결정은 집에 가서 하셔도 됩니다.
            </p>
          </Card>

          {/* 끝 */}
          <div className="absolute inset-0 z-30 flex items-center" style={{ background: `rgba(255,255,255,${white})`, pointerEvents: white > 0.9 ? "auto" : "none" }}>
            <div className="mx-auto w-full max-w-[1320px] px-5 md:px-10" style={{ opacity: white, transition: "opacity .4s" }}>
              <p className="text-[15px] font-bold" style={{ color: C.key }}>
                오시는 길
              </p>
              <h2 className="mt-3 text-[36px] font-[800] leading-[1.15] tracking-[-0.04em] md:text-[72px]">
                성수역 3번 출구,
                <br />
                건물 3층입니다
              </h2>
              <p className="mt-5 text-[16px] md:text-[18px]" style={{ color: C.sub }}>
                서울특별시 성동구 성수동 일대. 건물 지하 주차장 2시간 무료
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

      <footer className="py-10 text-[13px]" style={{ background: C.ink, color: "#9aa3ab" }}>
        <div className="mx-auto max-w-[1320px] px-5 md:px-10">
          <p className="font-bold text-white">{NAME}</p>
          <p className="mt-2">서울특별시 성동구 일대 | 대표원장 서하윤 | 사업자등록번호 000-00-00000 | {TEL}</p>
        </div>
      </footer>
    </div>
  );
}

/** 맑은 유리판 같은 글 상자(흐림 효과 없이 반투명 흰색과 얇은 테두리) */
function Card({ style, label, title, children }: { style: React.CSSProperties; label: string; title: string; children?: React.ReactNode }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-[5svh] z-10 mx-auto max-w-[1320px] px-4 md:bottom-[9svh] md:px-10">
      <div style={{ ...style, boxShadow: "inset 0 1px 0 rgba(255,255,255,.9), 0 20px 50px rgba(20,30,40,.18)" }} className="max-w-[420px] rounded-[22px] border border-white/70 bg-white/85 p-6 md:p-7">
        <p className="text-[13px] font-bold" style={{ color: C.key }}>
          {label}
        </p>
        <p className="mt-1.5 break-keep text-[22px] font-[800] leading-[1.25] tracking-[-0.03em] md:text-[28px]">{title}</p>
        {children}
      </div>
    </div>
  );
}
