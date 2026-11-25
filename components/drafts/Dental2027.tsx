"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUpRight, Phone } from "lucide-react";
import type { Scene } from "./dental3d/PhotoSpace3D";

// 치과 2027형(11-25 세 번째). 2027 흐름 예상: AI로 만든 비슷한 사이트가 넘치는 만큼 "진짜 공간"이 차별점이 된다.
// 실제 병원 사진을 깊이 지도로 입체로 세우고, 스크롤하면 사진 속으로 걸어 들어간다(실제 납품은 그 병원을 휴대폰으로 찍어 같은 방식).
// 장면 순서: 1 대기실 전체와 병원 이름 2 대기실 안으로, 진료 시간 3 진료실, 진료 과목 4 진료 의자, 설명 방식 5 밝아지며 오시는 길과 예약 버튼.
// 코드로 지은 3D 병원(목업 느낌)과 유리 치아(2026형과 같은 틀)는 사용자가 거절해 뺐다.
const PhotoSpace3D = dynamic(() => import("./dental3d/PhotoSpace3D"), { ssr: false });

const NAME = "온담치과의원";
const TEL = "02-000-0000";
const C = { ink: "#141414", sub: "#5c5c5c", key: "#0f6b5c" };
const IMG = "/images/drafts/dent27";

const SCENES: Scene[] = [
  { k: "wait", from: 0, to: 0.42, focus: 0.5, push: 2.4 },
  { k: "room", from: 0.42, to: 0.72, focus: 0.6, push: 1.9 },
  { k: "chair", from: 0.72, to: 1.0, focus: 0.42, push: 1.6 },
];
// 진행값 구간마다 보여 줄 글(0 첫 화면, 1 대기실, 2 진료실, 3 진료 의자, 4 끝)
const STAGES: [number, number][] = [
  [0, 0.12],
  [0.17, 0.4],
  [0.47, 0.7],
  [0.76, 0.88],
  [0.9, 1.01],
];
const HOURS = [
  ["평일", "10:00 ~ 19:00"],
  ["수요일 야간", "10:00 ~ 21:00"],
  ["토요일", "10:00 ~ 15:00"],
];
const CARE = ["충치 치료", "신경치료", "임플란트", "잇몸 치료", "치아교정", "스케일링"];

export function Dental2027() {
  const box = useRef<HTMLElement>(null);
  const progress = useRef(0);
  // 화면 글은 구간(stage)과 밝아짐(white)만 쓰므로 그 값이 바뀔 때만 다시 그린다
  const [view, setView] = useState({ stage: 0, white: 0 });
  const [env, setEnv] = useState<{ still: boolean; low: boolean } | null>(null);
  const [ready, setReady] = useState(false);
  const onReady = useCallback(() => setReady(true), []);

  useEffect(() => {
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const low = (navigator.hardwareConcurrency ?? 8) <= 4;
    queueMicrotask(() => setEnv({ still, low }));
    let raf = 0;
    const on = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = box.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const v = Math.min(1, Math.max(0, -r.top / (r.height - innerHeight)));
        progress.current = v;
        const stage = STAGES.findIndex(([a, b]) => v >= a && v < b);
        const white = Math.round(Math.min(1, Math.max(0, (v - 0.86) / 0.06)) * 20) / 20;
        setView((o) => (o.stage === stage && o.white === white ? o : { stage, white }));
      });
    };
    on();
    addEventListener("scroll", on, { passive: true });
    addEventListener("resize", on);
    return () => {
      removeEventListener("scroll", on);
      removeEventListener("resize", on);
      cancelAnimationFrame(raf);
    };
  }, []);

  const { stage, white } = view;
  const show = (i: number) => ({
    opacity: stage === i ? 1 : 0,
    transform: `translateY(${stage === i ? 0 : 16}px)`,
    transition: "opacity .5s, transform .5s",
  });

  return (
    <div className="text-[16px] leading-[1.7] md:text-[17px]" style={{ background: "#fff", color: C.ink }}>
      <header className="absolute inset-x-0 z-30">
        <div className="mx-auto flex h-[72px] max-w-[1320px] items-center justify-between px-5 md:px-10">
          <p className="text-[19px] font-[800] tracking-[-0.03em] text-white md:text-[21px]" style={{ textShadow: "0 1px 10px rgba(0,0,0,.3)" }}>
            {NAME}
          </p>
          <a href={`tel:${TEL.replace(/-/g, "")}`} className="inline-flex h-10 items-center gap-1.5 rounded-full bg-white px-4 text-[14px] font-bold md:text-[15px]" style={{ color: C.ink }}>
            <Phone size={15} aria-hidden /> {TEL}
          </a>
        </div>
      </header>

      <section ref={box} aria-label="치과 둘러보기" className="relative" style={{ height: "600vh" }}>
        <div className="sticky top-0 h-[100svh] overflow-hidden bg-[#111]">
          {/* 첫 그림은 사진으로 먼저 깔아 3D가 늦게 떠도 빈 화면이 없게 한다 */}
          {/* 3D가 사진을 다 받기 전까지만 정지 사진을 보여 주고, 준비되면 치운다(뒤에 겹쳐 비치지 않게) */}
          {!ready && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={`${IMG}/wait-sm.jpg`} alt="" className="absolute inset-0 h-full w-full object-cover" />
          )}
          <div className="absolute inset-0 transition-opacity duration-500" style={{ opacity: ready ? 1 : 0 }}>
            {env && <PhotoSpace3D progress={progress} scenes={SCENES} still={env.still} low={env.low} onReady={onReady} />}
          </div>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-black/30" style={{ opacity: 1 - white }} />

          {/* 0 첫 화면 */}
          <div className="pointer-events-none absolute inset-x-0 bottom-[9svh] mx-auto max-w-[1320px] px-5 text-white md:px-10" style={show(0)}>
            <p className="text-[15px] font-bold opacity-90">서울 마포구 합정역 3번 출구 앞</p>
            <h1 className="mt-2 text-[48px] font-[800] leading-[1.04] tracking-[-0.05em] md:text-[112px]">{NAME}</h1>
            <p className="mt-4 text-[15px] font-semibold opacity-90">내리면 안으로 들어갑니다</p>
          </div>

          <Panel style={show(1)} label="대기실" title="기다림이 짧도록 예약 간격을 넉넉히 둡니다">
            <dl className="mt-5">
              {HOURS.map(([d, t]) => (
                <div key={d} className="flex justify-between border-b border-black/10 py-2.5 text-[16px]">
                  <dt className="font-semibold">{d}</dt>
                  <dd className="tabular-nums" style={{ color: C.sub }}>
                    {t}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-[14px]" style={{ color: C.sub }}>
              점심시간 13:00 ~ 14:00, 일요일과 공휴일 휴진
            </p>
          </Panel>

          <Panel style={show(2)} label="진료실" title="진료실은 모두 문이 닫히는 1인실입니다" right>
            <ul className="mt-5 flex flex-wrap gap-2">
              {CARE.map((c) => (
                <li key={c} className="rounded-full border border-black/15 px-3.5 py-1.5 text-[15px] font-semibold">
                  {c}
                </li>
              ))}
            </ul>
          </Panel>

          <Panel style={show(3)} label="진료 의자" title="치료하는 동안 모니터로 같이 봅니다">
            <p className="mt-4 text-[16px]" style={{ color: C.sub }}>
              치료 계획은 CT를 같이 보며 정합니다. 순서와 기간, 비용을 먼저 적어 드리고 결정은 집에 가서 하셔도 됩니다.
            </p>
          </Panel>

          {/* 4 끝: 밝아지며 오시는 길 */}
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
                <span className="inline-flex h-14 items-center gap-2 rounded-full px-7 text-[17px] font-bold text-white" style={{ background: "#03c75a" }}>
                  네이버 예약 <ArrowUpRight size={18} aria-hidden />
                </span>
                <a href={`tel:${TEL.replace(/-/g, "")}`} className="inline-flex h-14 items-center gap-2 rounded-full border-2 px-7 text-[17px] font-bold" style={{ borderColor: C.ink }}>
                  <Phone size={17} aria-hidden /> 전화 상담
                </a>
              </div>
            </div>
          </div>

          <ol className="pointer-events-none absolute right-10 top-1/2 hidden -translate-y-1/2 flex-col gap-3 text-[13px] font-bold lg:flex" style={{ opacity: 1 - white }}>
            {["대기실", "진료실", "진료 의자"].map((t, i) => (
              <li key={t} className="flex items-center justify-end gap-2 text-white" style={{ opacity: stage === i + 1 ? 1 : 0.5 }}>
                {t}
                <span className="h-px bg-white" style={{ width: stage === i + 1 ? 36 : 16, transition: "width .4s" }} />
              </li>
            ))}
          </ol>
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

function Panel({ style, label, title, right, children }: { style: React.CSSProperties; label: string; title: string; right?: boolean; children: React.ReactNode }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-[5svh] mx-auto max-w-[1320px] px-4 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:px-10">
      <div style={style} className={`max-w-[440px] rounded-2xl bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,.22)] md:p-8 ${right ? "md:ml-auto md:mr-24" : ""}`}>
        <p className="text-[14px] font-bold" style={{ color: C.key }}>
          {label}
        </p>
        <p className="mt-2 break-keep text-[24px] font-[800] leading-[1.25] tracking-[-0.03em] md:text-[30px]">{title}</p>
        {children}
      </div>
    </div>
  );
}
