"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Phone } from "lucide-react";

// 피부과 시안 C 2026 터치 인터랙션(11-25). 2026 흐름: 손으로 만지는 3D, 스크롤에 따라 바뀌는 장면, 큰 글자.
// 장면 순서(사용자 확인): 1 화면 가득 피부결, 쓸면 매끈해짐 2 레이저 토닝(빛줄기, 잡티 옅어짐), 리프팅(빛이 한 점에 모임, 잔주름 펴짐), 보습(물방울이 스며듦)
// 3 표면이 정리되며 원장 소개, 진료 시간, 오시는 길, 네이버 예약 버튼. 시술 전후 사진, 효과 장담 문구는 넣지 않는다(의료광고).
const Skin3D = dynamic(() => import("./skin3d/Skin3D"), { ssr: false });

const NAME = "새결피부과의원";
const TEL = "02-000-0000";
const C = { ink: "#1e1a18", sub: "#6b605a", line: "#e6dcd5", key: "#b5523b", bg: "#f8f3ef" };

const STEPS = [
  { n: "01", t: "레이저 토닝", d: "낮은 에너지의 레이저를 고르게 나눠 쏘는 색소 치료입니다. 기미, 잡티의 깊이를 먼저 보고 횟수와 간격을 정합니다.", at: [0.22, 0.4] },
  { n: "02", t: "리프팅", d: "초음파나 고주파 에너지를 피부 아래 한 층에 모아 전달합니다. 처진 정도와 피부 두께에 따라 장비를 고릅니다.", at: [0.44, 0.6] },
  { n: "03", t: "보습 관리", d: "건조해진 피부 장벽을 채우는 관리입니다. 시술 뒤 붉어짐이 오래가지 않도록 같이 진행합니다.", at: [0.64, 0.8] },
];
const HOURS = [
  ["월, 화, 목, 금", "10:00 ~ 19:00"],
  ["수요일", "10:00 ~ 21:00"],
  ["토요일", "10:00 ~ 15:00"],
  ["점심시간", "13:00 ~ 14:00"],
];

export function SkinC2026() {
  const box = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const [p, setP] = useState(0);
  const [env, setEnv] = useState<{ still: boolean; low: boolean } | null>(null);

  useEffect(() => {
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const low = (navigator.hardwareConcurrency ?? 8) <= 4 || innerWidth < 768;
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
        setP(Math.round(v * 400) / 400);
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

  const hero = 1 - Math.min(1, Math.max(0, (p - 0.1) / 0.08));
  const step = STEPS.findIndex((s) => p >= s.at[0] && p < s.at[1]);

  return (
    <div className="text-[16px] leading-[1.7] md:text-[17px]" style={{ background: C.bg, color: C.ink }}>
      <header className="absolute inset-x-0 z-30">
        <div className="mx-auto flex h-[72px] max-w-[1320px] items-center justify-between px-5 md:px-10">
          <p className="text-[19px] font-[800] tracking-[-0.03em] md:text-[21px]">{NAME}</p>
          <nav aria-label="주 메뉴" className="hidden gap-9 text-[15px] font-semibold lg:flex" style={{ color: "#3a322e" }}>
            {["병원 소개", "색소 치료", "리프팅", "피부 관리", "오시는 길"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </nav>
          <a href={`tel:${TEL.replace(/-/g, "")}`} className="inline-flex h-10 items-center gap-1.5 rounded-full px-4 text-[14px] font-bold text-white md:text-[15px]" style={{ background: C.ink }}>
            <Phone size={15} aria-hidden /> {TEL}
          </a>
        </div>
      </header>

      <section ref={box} aria-label="피부결" className="relative" style={{ height: "520vh" }}>
        <div className="sticky top-0 h-[100svh] overflow-hidden">
          <div className="absolute inset-0">{env && <Skin3D progress={progress} still={env.still} low={env.low} />}</div>
          <div className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(248,243,239,.7) 0%, rgba(248,243,239,.2) 40%, rgba(248,243,239,0) 60%)" }} />

          {/* 1 첫 화면 */}
          <div className="pointer-events-none absolute inset-x-0 bottom-[8svh] mx-auto max-w-[1320px] px-5 md:bottom-auto md:top-[24svh] md:px-10" style={{ opacity: hero, transform: `translateY(${(1 - hero) * -24}px)` }}>
            <p className="text-[14px] font-bold md:text-[15px]" style={{ color: C.key }}>
              서울 강남구 신사동, 피부과 전문의 진료
            </p>
            <h1 className="mt-3 text-[46px] font-[800] leading-[1.06] tracking-[-0.05em] md:text-[104px]">
              결부터
              <br />
              봅니다
            </h1>
            <p className="mt-5 max-w-[400px] break-keep text-[16px] md:text-[18px]" style={{ color: C.sub }}>
              같은 잡티라도 깊이와 피부 두께가 다릅니다. 진료는 확대 진단으로 피부결을 먼저 보고 시작합니다.
            </p>
            <p className="mt-6 text-[13px] font-semibold" style={{ color: C.sub }}>
              화면을 손으로 쓸어 보세요
            </p>
          </div>

          {/* 2 시술 단계 */}
          <div className="pointer-events-none absolute inset-x-0 bottom-[6svh] mx-auto h-[34svh] max-w-[1320px] px-5 md:bottom-auto md:top-[26svh] md:h-auto md:px-10">
            {STEPS.map((x, i) => (
              <div
                key={x.n}
                aria-hidden={step !== i}
                className="absolute bottom-0 left-5 right-5 max-w-[440px] transition-all duration-500 md:bottom-auto md:left-10 md:top-0"
                style={{ opacity: step === i ? 1 : 0, transform: `translateY(${step === i ? 0 : step > i ? -24 : 24}px)` }}
              >
                <p className="text-[15px] font-bold tabular-nums" style={{ color: C.key }}>
                  {x.n} / 03
                </p>
                <p className="mt-2 text-[44px] font-[800] leading-[1.05] tracking-[-0.05em] md:text-[84px]">{x.t}</p>
                <p className="mt-4 break-keep text-[16px] md:text-[18px]" style={{ color: C.sub }}>
                  {x.d}
                </p>
              </div>
            ))}
          </div>

          <div className="absolute inset-x-0 bottom-0 h-1" style={{ background: C.line }}>
            <div className="h-full" style={{ width: `${p * 100}%`, background: C.key }} />
          </div>
        </div>
      </section>

      <section aria-labelledby="s26-doc" className="mx-auto grid max-w-[1320px] gap-10 px-5 py-20 md:grid-cols-[1fr_1.2fr] md:gap-20 md:px-10 md:py-32">
        <div>
          <p className="text-[15px] font-bold" style={{ color: C.key }}>
            원장 소개
          </p>
          <h2 id="s26-doc" className="mt-3 text-[34px] font-[800] leading-[1.15] tracking-[-0.04em] md:text-[56px]">
            시술 전에
            <br />
            진단부터 합니다
          </h2>
        </div>
        <div className="md:pt-10">
          <p className="text-[22px] font-bold tracking-[-0.02em]">대표원장 윤서진</p>
          <ul className="mt-4 space-y-2 border-t pt-5 text-[16px]" style={{ borderColor: C.line, color: C.sub }}>
            <li>피부과 전문의</li>
            <li>대한피부과학회 정회원</li>
            <li>상담과 시술을 원장이 직접 진행</li>
          </ul>
        </div>
      </section>

      <section aria-labelledby="s26-time" className="border-t" style={{ borderColor: C.line }}>
        <div className="mx-auto grid max-w-[1320px] gap-10 px-5 py-20 md:grid-cols-2 md:gap-20 md:px-10 md:py-28">
          <div>
            <h2 id="s26-time" className="text-[30px] font-[800] tracking-[-0.04em] md:text-[44px]">
              진료 시간
            </h2>
            <dl className="mt-6">
              {HOURS.map(([d, t]) => (
                <div key={d} className="flex justify-between border-b py-4 text-[17px]" style={{ borderColor: C.line }}>
                  <dt className="font-semibold">{d}</dt>
                  <dd className="tabular-nums" style={{ color: C.sub }}>
                    {t}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-[15px]" style={{ color: C.sub }}>
              일요일, 공휴일 휴진
            </p>
          </div>
          <div>
            <h2 className="text-[30px] font-[800] tracking-[-0.04em] md:text-[44px]">오시는 길</h2>
            <p className="mt-6 text-[17px] font-semibold">서울특별시 강남구 신사동 일대, 신사역 8번 출구 앞 건물 4층</p>
            <p className="mt-2 text-[16px]" style={{ color: C.sub }}>
              건물 지하 주차장 1시간 무료
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
      </section>

      <footer className="py-10 text-[13px]" style={{ background: C.ink, color: "#a59a93" }}>
        <div className="mx-auto max-w-[1320px] px-5 md:px-10">
          <p className="font-bold text-white">{NAME}</p>
          <p className="mt-2">서울특별시 강남구 일대 | 대표원장 윤서진 | 사업자등록번호 000-00-00000 | {TEL}</p>
        </div>
      </footer>
    </div>
  );
}
