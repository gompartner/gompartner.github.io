"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Phone } from "lucide-react";

// 치과 2027형(11-25). 2027 흐름: 페이지가 아니라 공간. 스크롤하면 카메라가 치과 안으로 걸어 들어가고, 그 자리에서 설명이 떠오른다.
// 장면 순서(사용자 확인): 1 3D 입구, 스크롤하면 문이 열리고 들어감 2 대기실(진료 시간), 진료실(진료 과목), 상담실을 차례로 지남
// 3 마지막 방에서 밝아지며 오시는 길과 예약 버튼 4 성능이 낮은 기기와 움직임 줄이기 설정은 같은 장면을 정지 그림으로.
const Clinic3D = dynamic(() => import("./dental3d/Clinic3D"), { ssr: false });

const NAME = "온담치과의원";
const TEL = "02-000-0000";
const C = { ink: "#1b1a17", sub: "#5f5a52", green: "#1f4d3a", paper: "#f6f2ec" };
const IMG = "/images/drafts/dent27";

const HOURS = [
  ["평일", "10:00 ~ 19:00"],
  ["수요일 야간", "10:00 ~ 21:00"],
  ["토요일", "10:00 ~ 15:00"],
];
const CARE = ["임플란트", "신경치료", "충치 치료", "잇몸 치료", "치아교정", "스케일링"];

// 진행값 구간마다 보여 줄 장면 글(0 입구, 1 대기실, 2 진료실, 3 상담실, 4 끝)
const STAGES: [number, number][] = [
  [0, 0.1],
  [0.22, 0.4],
  [0.46, 0.64],
  [0.7, 0.86],
  [0.9, 1.01],
];

export function Dental2027() {
  const box = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const [p, setP] = useState(0);
  const [lite, setLite] = useState<boolean | null>(null);

  useEffect(() => {
    // 움직임 줄이기 설정, 코어 4개 이하 기기는 3D 대신 정지 그림
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const weak = (navigator.hardwareConcurrency ?? 8) <= 4;
    setLite(reduce || weak);
    let raf = 0;
    const on = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = box.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const v = Math.min(1, Math.max(0, -r.top / (r.height - innerHeight)));
        progress.current = v;
        setP(v);
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

  const stage = STAGES.findIndex(([a, b]) => p >= a && p < b);
  const show = (i: number) => ({
    opacity: stage === i ? 1 : 0,
    transform: `translateY(${stage === i ? 0 : 16}px)`,
    transition: "opacity .5s, transform .5s",
  });
  const white = Math.min(1, Math.max(0, (p - 0.86) / 0.06));

  return (
    <div className="text-[16px] leading-[1.7] md:text-[17px]" style={{ background: C.paper, color: C.ink }}>
      <header className="absolute inset-x-0 z-30">
        <div className="mx-auto flex h-[72px] max-w-[1320px] items-center justify-between px-5 md:px-10">
          <p className="text-[19px] font-[800] tracking-[-0.03em] text-white md:text-[21px]" style={{ textShadow: "0 1px 10px rgba(0,0,0,.25)" }}>
            {NAME}
          </p>
          <a href={`tel:${TEL.replace(/-/g, "")}`} className="inline-flex h-10 items-center gap-1.5 rounded-full bg-white px-4 text-[14px] font-bold md:text-[15px]" style={{ color: C.ink }}>
            <Phone size={15} aria-hidden /> {TEL}
          </a>
        </div>
      </header>

      <section ref={box} aria-label="치과 둘러보기" className="relative" style={{ height: "640vh" }}>
        <div className="sticky top-0 h-[100svh] overflow-hidden">
          {lite === false && (
            <div className="absolute inset-0">
              <Clinic3D progress={progress} />
            </div>
          )}
          {lite && (
            // 정지 그림: 지금 장면에 맞는 한 장을 겹쳐 바꾼다
            <div className="absolute inset-0">
              {["enter", "wait", "room", "consult", "consult"].map((k, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={`${IMG}/${k}.jpg`} alt="" className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700" style={{ opacity: Math.max(stage, 0) === i ? 1 : 0 }} />
              ))}
            </div>
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/20" style={{ opacity: 1 - white }} />

          {/* 0 입구 */}
          <div className="pointer-events-none absolute inset-x-0 bottom-[10svh] mx-auto max-w-[1320px] px-5 text-white md:px-10" style={show(0)}>
            <p className="text-[15px] font-bold opacity-90">서울 마포구 합정역 3번 출구 앞</p>
            <h1 className="mt-2 text-[46px] font-[800] leading-[1.06] tracking-[-0.05em] md:text-[104px]">{NAME}</h1>
            <p className="mt-4 text-[15px] font-semibold opacity-90">내리면 안으로 들어갑니다</p>
          </div>

          {/* 1 대기실: 진료 시간 */}
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

          {/* 2 진료실: 진료 과목 */}
          <Panel style={show(2)} label="진료실" title="진료실은 모두 문이 닫히는 1인실입니다" right>
            <ul className="mt-5 flex flex-wrap gap-2">
              {CARE.map((c) => (
                <li key={c} className="rounded-full border border-black/15 px-3.5 py-1.5 text-[15px] font-semibold">
                  {c}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[15px]" style={{ color: C.sub }}>
              치료 중에는 모니터로 지금 하는 일을 보여 드립니다.
            </p>
          </Panel>

          {/* 3 상담실 */}
          <Panel style={show(3)} label="상담실" title="치료 계획은 CT를 같이 보며 정합니다">
            <p className="mt-4 text-[16px]" style={{ color: C.sub }}>
              치료 순서와 기간, 비용을 먼저 적어 드리고 결정은 집에 가서 하셔도 됩니다.
            </p>
          </Panel>

          {/* 4 끝: 밝아지며 오시는 길 */}
          <div className="absolute inset-0 flex items-center" style={{ background: `rgba(246,242,236,${white})`, pointerEvents: white > 0.9 ? "auto" : "none" }}>
            <div className="mx-auto w-full max-w-[1320px] px-5 md:px-10" style={show(4)}>
              <p className="text-[15px] font-bold" style={{ color: C.green }}>
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

          <ol className="pointer-events-none absolute right-5 top-1/2 hidden -translate-y-1/2 flex-col gap-3 text-[13px] font-bold md:flex md:right-10" style={{ opacity: 1 - white }}>
            {["입구", "대기실", "진료실", "상담실"].map((t, i) => (
              <li key={t} className="flex items-center justify-end gap-2 text-white" style={{ opacity: stage === i ? 1 : 0.5 }}>
                {t}
                <span className="h-px w-6 bg-white" style={{ width: stage === i ? 36 : 16, transition: "width .4s" }} />
              </li>
            ))}
          </ol>
        </div>
      </section>

      <footer className="py-10 text-[13px]" style={{ background: C.green, color: "#bcd0c6" }}>
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
      <div style={style} className={`max-w-[440px] rounded-2xl bg-white/90 p-6 shadow-[0_20px_60px_rgba(0,0,0,.18)] backdrop-blur md:p-8 ${right ? "md:ml-auto md:mr-16" : ""}`}>
        <p className="text-[14px] font-bold" style={{ color: C.green }}>
          {label}
        </p>
        <p className="mt-2 break-keep text-[24px] font-[800] leading-[1.25] tracking-[-0.03em] md:text-[30px]">{title}</p>
        {children}
      </div>
    </div>
  );
}
