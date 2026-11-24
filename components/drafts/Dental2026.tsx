"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Phone } from "lucide-react";

// 치과 2026형(11-25). 2026 흐름: 손으로 돌려 보는 3D 물건, 스크롤에 따라 움직이는 장면, 크고 굵은 글자, 한 가지 강한 색.
// 장면 순서(사용자 확인): 1 첫 화면 임플란트가 돌고 손으로 돌려 봄 2 스크롤하면 크라운, 지대주, 픽스처로 나뉘며 설명
// 3 다시 붙은 치아가 비켜나며 진료 과목이 큰 글씨로 지나감 4 원장 소개, 오시는 길, 네이버 예약 버튼.
// 예약, 달력 같은 기능은 넣지 않는다(네이버 예약 연결 버튼 하나).
const Implant3D = dynamic(() => import("./dental3d/Implant3D"), { ssr: false });

const NAME = "바른결치과의원";
const TEL = "02-000-0000";
const C = { bg: "#eef1ef", ink: "#101413", sub: "#5d6663", line: "#d5dbd8", key: "#0b7a6f" };

const PARTS = [
  { n: "01", t: "크라운", d: "씹는 면은 지르코니아로 만들고, 옆 치아 색에 맞춰 색을 입힙니다." },
  { n: "02", t: "지대주", d: "뿌리와 크라운을 잇는 기둥입니다. 잇몸 두께에 맞춰 높이를 고릅니다." },
  { n: "03", t: "픽스처", d: "잇몸뼈에 심는 티타늄 뿌리입니다. 뼈와 단단히 붙을 때까지 기다린 뒤 크라운을 올립니다." },
];
const CARE = ["임플란트", "치아교정", "라미네이트", "신경치료", "잇몸 치료", "스케일링"];
const HOURS = [
  ["월, 수, 금", "09:30 ~ 18:30"],
  ["화, 목", "09:30 ~ 21:00"],
  ["토요일", "09:30 ~ 14:00"],
  ["점심시간", "13:00 ~ 14:00"],
];

const smooth = (a: number, b: number, x: number) => Math.min(1, Math.max(0, (x - a) / (b - a)));

export function Dental2026() {
  const box = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const drag = useRef(0);
  const [p, setP] = useState(0);
  const [still, setStill] = useState(false);

  useEffect(() => {
    const still0 = matchMedia("(prefers-reduced-motion: reduce)").matches;
    queueMicrotask(() => setStill(still0));
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

  const hero = 1 - smooth(0.08, 0.16, p);
  const part = p < 0.2 || p > 0.6 ? -1 : p < 0.33 ? 0 : p < 0.46 ? 1 : 2;
  const care = smooth(0.62, 0.7, p);
  const slide = smooth(0.62, 1, p);

  return (
    <div className="text-[16px] leading-[1.7] md:text-[17px]" style={{ background: C.bg, color: C.ink }}>
      <header className="absolute inset-x-0 z-30">
        <div className="mx-auto flex h-[72px] max-w-[1320px] items-center justify-between px-5 md:px-10">
          <p className="text-[19px] font-[800] tracking-[-0.03em] md:text-[21px]">{NAME}</p>
          <nav aria-label="주 메뉴" className="hidden gap-9 text-[15px] font-semibold lg:flex" style={{ color: "#2c3331" }}>
            {["병원 소개", "임플란트", "진료 과목", "진료 시간", "오시는 길"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </nav>
          <a href={`tel:${TEL.replace(/-/g, "")}`} className="inline-flex h-10 items-center gap-1.5 rounded-full px-4 text-[14px] font-bold text-white md:text-[15px]" style={{ background: C.ink }}>
            <Phone size={15} aria-hidden /> {TEL}
          </a>
        </div>
      </header>

      {/* 스크롤 장면: 높이 420vh 안에서 화면 한 장을 붙잡아 두고 진행값으로 3D와 글자를 바꾼다 */}
      <section ref={box} aria-label="임플란트 구조" className="relative" style={{ height: "420vh" }}>
        <div className="sticky top-0 h-[100svh] overflow-hidden">
          <div className="absolute inset-x-0 top-[56px] bottom-[36svh] md:inset-0 md:left-[30%]">
            <Implant3D progress={progress} dragRef={drag} still={still} />
          </div>

          {/* 1 첫 화면 */}
          <div className="pointer-events-none absolute inset-x-0 bottom-[5svh] mx-auto max-w-[1320px] px-5 md:bottom-auto md:top-[26svh] md:px-10" style={{ opacity: hero, transform: `translateY(${(1 - hero) * -30}px)` }}>
            <p className="text-[14px] font-bold md:text-[15px]" style={{ color: C.key }}>
              서울 송파구 임플란트, 보존 치료
            </p>
            <h1 className="mt-3 text-[44px] font-[800] leading-[1.08] tracking-[-0.05em] md:text-[96px]">
              잇몸 아래
              <br />
              뿌리부터
            </h1>
            <p className="mt-5 max-w-[420px] break-keep text-[16px] md:text-[18px]" style={{ color: C.sub }}>
              임플란트는 보이지 않는 뿌리가 오래 갑니다. CT로 뼈를 먼저 보고 심을 자리를 정합니다.
            </p>
            <p className="mt-6 hidden text-[13px] font-semibold md:block" style={{ color: C.sub }}>
              끌어서 돌려 보세요. 내리면 안이 보입니다.
            </p>
          </div>

          {/* 2 분해 설명 */}
          <div className="pointer-events-none absolute inset-x-0 bottom-[5svh] mx-auto h-[30svh] max-w-[1320px] px-5 md:bottom-auto md:top-[30svh] md:h-auto md:px-10">
            {PARTS.map((x, i) => (
              <div
                key={x.n}
                className="absolute bottom-0 left-5 right-5 max-w-[440px] transition-all duration-500 md:bottom-auto md:left-10 md:top-0"
                style={{ opacity: part === i ? 1 : 0, transform: `translateY(${part === i ? 0 : part > i ? -24 : 24}px)` }}
                aria-hidden={part !== i}
              >
                <p className="text-[15px] font-bold tabular-nums" style={{ color: C.key }}>
                  {x.n} / 03
                </p>
                <p className="mt-2 text-[44px] font-[800] leading-[1.05] tracking-[-0.05em] md:text-[88px]">{x.t}</p>
                <p className="mt-4 break-keep text-[16px] md:text-[19px]" style={{ color: C.sub }}>
                  {x.d}
                </p>
              </div>
            ))}
          </div>

          {/* 3 진료 과목이 큰 글씨로 지나간다 */}
          <div className="pointer-events-none absolute inset-x-0 bottom-[12svh] md:bottom-auto md:top-[22svh]" style={{ opacity: care }}>
            <p className="mx-auto max-w-[1320px] px-5 text-[15px] font-bold md:px-10" style={{ color: C.key }}>
              진료 과목
            </p>
            <ul
              className="mt-4 flex w-max gap-8 whitespace-nowrap pl-5 text-[56px] font-[800] leading-[1.05] tracking-[-0.05em] md:gap-14 md:pl-10 md:text-[128px]"
              style={{ transform: `translateX(${-slide * 62}%)` }}
            >
              {CARE.map((c, i) => (
                <li key={c} style={{ color: i % 2 ? C.ink : C.key }}>
                  {c}
                </li>
              ))}
            </ul>
          </div>

          <div className="absolute inset-x-0 bottom-0 h-1" style={{ background: C.line }}>
            <div className="h-full" style={{ width: `${p * 100}%`, background: C.key }} />
          </div>
        </div>
      </section>

      {/* 4 원장 소개, 진료 시간, 오시는 길 */}
      <section aria-labelledby="d26-doc" className="mx-auto grid max-w-[1320px] gap-10 px-5 py-20 md:grid-cols-[1fr_1.2fr] md:gap-20 md:px-10 md:py-32">
        <div>
          <p className="text-[15px] font-bold" style={{ color: C.key }}>
            원장 소개
          </p>
          <h2 id="d26-doc" className="mt-3 text-[34px] font-[800] leading-[1.15] tracking-[-0.04em] md:text-[56px]">
            처음 상담한 원장이
            <br />
            끝까지 봅니다
          </h2>
        </div>
        <div className="md:pt-10">
          <p className="text-[22px] font-bold tracking-[-0.02em]">대표원장 정민우</p>
          <ul className="mt-4 space-y-2 border-t pt-5 text-[16px]" style={{ borderColor: C.line, color: C.sub }}>
            <li>보건복지부 인정 통합치의학과 전문의</li>
            <li>대한구강악안면임플란트학회 정회원</li>
            <li>상담, 수술, 보철까지 한 원장이 진료</li>
          </ul>
        </div>
      </section>

      <section aria-labelledby="d26-time" className="border-t" style={{ borderColor: C.line }}>
        <div className="mx-auto grid max-w-[1320px] gap-10 px-5 py-20 md:grid-cols-2 md:gap-20 md:px-10 md:py-28">
          <div>
            <h2 id="d26-time" className="text-[30px] font-[800] tracking-[-0.04em] md:text-[44px]">
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
            <p className="mt-6 text-[17px] font-semibold">서울특별시 송파구 일대, 잠실역 8번 출구 앞 건물 5층</p>
            <p className="mt-2 text-[16px]" style={{ color: C.sub }}>
              건물 지하 주차장 2시간 무료
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

      <footer className="py-10 text-[13px]" style={{ background: C.ink, color: "#9aa5a1" }}>
        <div className="mx-auto max-w-[1320px] px-5 md:px-10">
          <p className="font-bold text-white">{NAME}</p>
          <p className="mt-2">서울특별시 송파구 일대 | 대표원장 정민우 | 사업자등록번호 000-00-00000 | {TEL}</p>
        </div>
      </footer>
    </div>
  );
}
