"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Phone } from "lucide-react";

// 치과 2027형(11-25 다시 만듦). 2027 흐름: 빛과 재질. 유리처럼 투명한 치아가 스크롤에 따라 책처럼 열리고 층마다 진료 과목이 붙는다.
// 장면 순서(사용자 확인): 1 첫 화면 유리 치아가 돌고 병원 이름만 크게 2 단면이 열리며 법랑질 충치 치료, 상아질 레진과 라미네이트,
// 신경 신경치료, 잇몸과 뼈 잇몸 치료와 임플란트 3 다시 닫히며 실제 치아 질감으로, 원장 소개 4 진료 시간, 오시는 길, 네이버 예약 버튼.
// 첫 시안(걸어 들어가는 3D 병원)은 목업 같고 모바일에서 약해 뺐다.
const Tooth3D = dynamic(() => import("./dental3d/Tooth3D"), { ssr: false });

const NAME = "온담치과의원";
const TEL = "02-000-0000";
const C = { bg: "#f2f3f4", ink: "#111214", sub: "#5e6166", line: "#dcdee1" };

const LAYERS = [
  { k: "법랑질", t: "충치 치료", d: "치아 겉을 덮은 가장 단단한 층입니다. 충치가 이 안에서 멈췄다면 조금만 덜어 내고 레진으로 메웁니다." },
  { k: "상아질", t: "레진, 라미네이트", d: "법랑질 아래 누런빛 층으로, 찬물에 시린 증상이 여기서 시작됩니다. 깨지거나 벌어진 앞니는 레진이나 라미네이트로 모양을 되찾습니다." },
  { k: "신경", t: "신경치료", d: "충치가 신경까지 닿으면 염증이 생긴 신경을 덜어 내고 속을 채운 뒤 크라운을 씌웁니다. 보통 서너 번 내원합니다." },
  { k: "잇몸과 뼈", t: "잇몸 치료, 임플란트", d: "치아를 붙잡아 주는 자리입니다. 잇몸에서 피가 나면 스케일링과 잇몸 치료부터 하고, 빠진 자리는 CT로 뼈를 보고 임플란트를 심습니다." },
];
const BANDS: [number, number][] = [
  [0.24, 0.36],
  [0.36, 0.48],
  [0.48, 0.6],
  [0.6, 0.72],
];
const HOURS = [
  ["평일", "10:00 ~ 19:00"],
  ["수요일 야간", "10:00 ~ 21:00"],
  ["토요일", "10:00 ~ 15:00"],
  ["점심시간", "13:00 ~ 14:00"],
];

const fade = (a: number, b: number, x: number) => Math.min(1, Math.max(0, (x - a) / (b - a)));

export function Dental2027() {
  const box = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const [p, setP] = useState(0);
  const [env, setEnv] = useState<{ still: boolean; low: boolean } | null>(null);

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

  const hero = 1 - fade(0.06, 0.13, p);
  const layer = BANDS.findIndex(([a, b]) => p >= a && p < b);
  const doc = fade(0.82, 0.88, p);

  return (
    <div className="text-[16px] leading-[1.7] md:text-[17px]" style={{ background: C.bg, color: C.ink }}>
      <header className="absolute inset-x-0 z-30">
        <div className="mx-auto flex h-[72px] max-w-[1320px] items-center justify-between px-5 md:px-10">
          <p className="text-[19px] font-[800] tracking-[-0.03em] md:text-[21px]">{NAME}</p>
          <a href={`tel:${TEL.replace(/-/g, "")}`} className="inline-flex h-10 items-center gap-1.5 rounded-full border px-4 text-[14px] font-bold md:text-[15px]" style={{ borderColor: C.ink }}>
            <Phone size={15} aria-hidden /> {TEL}
          </a>
        </div>
      </header>

      <section ref={box} aria-label="치아 단면" className="relative" style={{ height: "600vh" }}>
        <div className="sticky top-0 h-[100svh] overflow-hidden">
          <div className="absolute inset-x-0 top-[56px] bottom-[40svh] md:inset-0 md:left-[34%]">{env && <Tooth3D progress={progress} still={env.still} low={env.low} />}</div>

          {/* 1 첫 화면: 이름만 크게 */}
          <div className="pointer-events-none absolute inset-x-0 bottom-[6svh] mx-auto max-w-[1320px] px-5 md:bottom-[12svh] md:px-10" style={{ opacity: hero, transform: `translateY(${(1 - hero) * -24}px)` }}>
            <p className="text-[14px] font-semibold md:text-[15px]" style={{ color: C.sub }}>
              합정역 3번 출구 앞, 보존 치료 중심 치과
            </p>
            <h1 className="mt-2 text-[52px] font-[800] leading-[1.02] tracking-[-0.06em] md:text-[132px]">
              온담
              <br />
              치과의원
            </h1>
            <p className="mt-5 text-[14px] font-semibold" style={{ color: C.sub }}>
              내리면 치아 단면을 보여 드립니다
            </p>
          </div>

          {/* 2 층마다 진료 과목 */}
          <div className="pointer-events-none absolute inset-x-0 bottom-[5svh] mx-auto h-[33svh] max-w-[1320px] px-5 md:bottom-auto md:top-[28svh] md:h-auto md:px-10">
            {LAYERS.map((x, i) => (
              <div
                key={x.k}
                aria-hidden={layer !== i}
                className="absolute bottom-0 left-5 right-5 max-w-[430px] transition-all duration-500 md:bottom-auto md:left-10 md:top-0"
                style={{ opacity: layer === i ? 1 : 0, transform: `translateY(${layer === i ? 0 : layer > i ? -20 : 20}px)` }}
              >
                <p className="text-[15px] font-bold" style={{ color: C.sub }}>
                  {x.k}
                </p>
                <p className="mt-1 break-keep text-[40px] font-[800] leading-[1.08] tracking-[-0.05em] md:text-[76px]">{x.t}</p>
                <p className="mt-4 break-keep text-[15px] md:text-[18px]" style={{ color: C.sub }}>
                  {x.d}
                </p>
              </div>
            ))}
          </div>

          {/* 3 닫힌 뒤 원장 소개 */}
          <div className="pointer-events-none absolute inset-x-0 bottom-[5svh] mx-auto max-w-[1320px] px-5 md:bottom-auto md:top-[28svh] md:px-10" style={{ opacity: doc, transform: `translateY(${(1 - doc) * 20}px)` }}>
            <p className="text-[15px] font-bold" style={{ color: C.sub }}>
              대표원장 한지오
            </p>
            <h2 className="mt-1 break-keep text-[34px] font-[800] leading-[1.12] tracking-[-0.05em] md:text-[64px]">
              살릴 수 있는 치아는
              <br />
              먼저 살립니다
            </h2>
            <ul className="mt-5 space-y-1.5 text-[15px] md:text-[17px]" style={{ color: C.sub }}>
              <li>보건복지부 인정 치과보존과 전문의</li>
              <li>충치, 신경치료를 원장이 직접 진료</li>
              <li>치료 전 CT와 구강 사진으로 설명</li>
            </ul>
          </div>

          <ol className="pointer-events-none absolute right-10 top-1/2 hidden -translate-y-1/2 flex-col gap-3 text-[13px] font-bold lg:flex" style={{ opacity: layer >= 0 ? 1 : 0, transition: "opacity .4s" }}>
            {LAYERS.map((x, i) => (
              <li key={x.k} className="flex items-center justify-end gap-2" style={{ opacity: layer === i ? 1 : 0.4 }}>
                {x.k}
                <span className="h-px" style={{ background: C.ink, width: layer === i ? 36 : 16, transition: "width .4s" }} />
              </li>
            ))}
          </ol>

          <div className="absolute inset-x-0 bottom-0 h-[3px]" style={{ background: C.line }}>
            <div className="h-full" style={{ width: `${p * 100}%`, background: C.ink }} />
          </div>
        </div>
      </section>

      {/* 4 진료 시간, 오시는 길 */}
      <section aria-labelledby="d27-time" className="bg-white">
        <div className="mx-auto grid max-w-[1320px] gap-12 px-5 py-20 md:grid-cols-2 md:gap-20 md:px-10 md:py-28">
          <div>
            <h2 id="d27-time" className="text-[30px] font-[800] tracking-[-0.04em] md:text-[44px]">
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
            <p className="mt-6 text-[17px] font-semibold">서울특별시 마포구 일대, 합정역 3번 출구 앞 건물 2층</p>
            <p className="mt-2 text-[16px]" style={{ color: C.sub }}>
              건물 뒤편 주차장 1시간 무료
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

      <footer className="py-10 text-[13px]" style={{ background: C.ink, color: "#9a9ea5" }}>
        <div className="mx-auto max-w-[1320px] px-5 md:px-10">
          <p className="font-bold text-white">{NAME}</p>
          <p className="mt-2">서울특별시 마포구 일대 | 대표원장 한지오 | 사업자등록번호 000-00-00000 | {TEL}</p>
        </div>
      </footer>
    </div>
  );
}
