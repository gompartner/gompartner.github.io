"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronsLeftRight } from "lucide-react";

// 인테리어 시안 A 시공 사례형(11-24 다시 만듦). 실제 인테리어 업체 사이트 방식: 첫 화면이 시공 사례이고, 같은 방의 시공 전후를 밀어서 비교한다.
// 다른 시안의 어두운 사진 위 두 줄 제목, 영어 한 줄, 둥근 사진 카드 구성을 쓰지 않는다. 견적 계산 같은 기능은 넣지 않는다. 메인 한 장, 인물 없음.
// 사진: public/images/demo-interior(같은 방의 시공 전후, 국내 아파트 거실, 주방, 욕실, 붙박이장)
const IMG = "/images/demo-interior";
const C = { ink: "#161616", sub: "#6e6e6e", line: "#161616", hair: "#dedede", soft: "#f5f5f3", wood: "#8a6a45" };
const TEL = "02-000-0000";

const CASES = [
  { img: "case2", alt: "흰 상부장과 아일랜드 식탁이 있는 주방", t: "목동 32평", d: "주방 확장, 아일랜드 식탁" },
  { img: "case3", alt: "회색 타일과 유리 샤워 부스가 있는 욕실", t: "잠실 34평", d: "욕실 2곳, 건식 세면대" },
  { img: "hero", alt: "벽 전체에 붙박이장을 짠 방", t: "분당 25평", d: "붙박이장, 도배, 바닥" },
  { img: "case1", alt: "강마루를 깐 밝은 거실", t: "성수 24평", d: "샷시, 강마루, 조명" },
];

const STEPS = [
  ["상담, 실측", "현장 방문, 무료"],
  ["설계, 견적", "도면, 공정별 견적서"],
  ["계약", "공사 기간, 자재 명시"],
  ["시공", "공정별 현장 사진 공유"],
  ["입주, A/S", "하자보수 1년"],
];

function Compare() {
  const [pos, setPos] = useState(52);
  return (
    <div className="relative aspect-[4/3] select-none overflow-hidden bg-[#eee]">
      <Image src={`${IMG}/after.jpg`} alt="시공 후: 흰 벽과 원목 바닥으로 마감한 거실" fill priority sizes="(min-width: 1024px) 62vw, 100vw" className="object-cover" />
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        <Image src={`${IMG}/before.jpg`} alt="시공 전: 벽지와 몰딩이 낡은 거실" fill priority sizes="(min-width: 1024px) 62vw, 100vw" className="object-cover" />
      </div>
      <span className="absolute left-3 top-3 bg-white px-2.5 py-1 text-[13px] font-bold md:left-4 md:top-4 md:text-[14px]" style={{ color: C.ink }}>시공 전</span>
      <span className="absolute right-3 top-3 px-2.5 py-1 text-[13px] font-bold text-white md:right-4 md:top-4 md:text-[14px]" style={{ background: C.ink }}>시공 후</span>
      <div className="pointer-events-none absolute inset-y-0 w-px bg-white" style={{ left: `${pos}%` }} aria-hidden>
        <span className="absolute left-1/2 top-1/2 grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white shadow-[0_2px_10px_rgba(0,0,0,0.25)]" style={{ color: C.ink }}>
          <ChevronsLeftRight size={20} />
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        aria-label="시공 전후 비교"
        className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
      />
    </div>
  );
}

const H2 = "text-[24px] font-bold tracking-[-0.04em] md:text-[34px]";

export function InteriorA() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.7] md:text-[17px]" style={{ color: C.ink }}>
      <header className="border-b" style={{ borderColor: C.line }}>
        <div className="mx-auto flex h-[60px] max-w-[1280px] items-center justify-between gap-4 px-5 md:h-[72px] md:px-8">
          <p className="text-[19px] font-bold tracking-[-0.03em] md:text-[21px]">리모델링 인테리어</p>
          <nav aria-label="주 메뉴" className="flex gap-5 text-[15px] font-semibold md:gap-9 md:text-[16px]">
            <span className="border-b-2 pb-0.5" style={{ borderColor: C.ink }}>시공 사례</span>
            <span className="hidden sm:inline" style={{ color: C.sub }}>진행 과정</span>
            <span style={{ color: C.sub }}>견적 문의</span>
          </nav>
        </div>
      </header>

      <section className="border-b" style={{ borderColor: C.line }}>
        <div className="mx-auto max-w-[1280px] lg:grid lg:grid-cols-[1.65fr_1fr]">
          <Compare />
          <div className="flex flex-col justify-between gap-8 px-5 py-8 md:px-8 md:py-10 lg:border-l lg:pr-[104px]" style={{ borderColor: C.line }}>
            <div>
              <p className="text-[14.5px] font-bold" style={{ color: C.wood }}>아파트 리모델링 시공 사례</p>
              <h1 className="mt-2 text-[30px] font-bold leading-[1.25] tracking-[-0.05em] md:text-[40px]">
                목동 32평,
                <br />
                1998년 준공 아파트
              </h1>
            </div>
            <dl className="border-t" style={{ borderColor: C.line }}>
              {[
                ["공사 범위", "전체 리모델링"],
                ["공정", "철거, 샷시, 목공, 도배, 바닥"],
                ["공사 기간", "6주"],
                ["입주", "2026년 10월"],
              ].map(([k, v]) => (
                <div key={k} className="flex items-baseline justify-between gap-4 border-b py-3" style={{ borderColor: C.hair }}>
                  <dt className="shrink-0 text-[15px]" style={{ color: C.sub }}>{k}</dt>
                  <dd className="text-right text-[16.5px] font-bold md:text-[17.5px]">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-5 py-14 md:px-8 md:py-24">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
          <h2 className={H2}>시공 사례</h2>
          <p className="flex gap-4 text-[15px] font-semibold md:gap-6 md:text-[16px]">
            {["전체", "20평대", "30평대", "40평대"].map((t, i) => (
              <span key={t} className={i === 0 ? "border-b-2 pb-0.5" : ""} style={{ borderColor: C.ink, color: i === 0 ? C.ink : C.sub }}>{t}</span>
            ))}
          </p>
        </div>
        <ul className="mt-8 grid grid-cols-2 gap-x-3 gap-y-8 md:mt-10 md:grid-cols-4 md:gap-x-5" role="list">
          {CASES.map((c, i) => (
            <li key={c.t} className={i % 2 === 1 ? "md:mt-14" : ""}>
              <div className="relative aspect-[3/4] overflow-hidden bg-[#eee]">
                <Image src={`${IMG}/${c.img}.jpg`} alt={c.alt} fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
              </div>
              <p className="mt-3 text-[18px] font-bold tracking-[-0.03em] md:text-[20px]">{c.t}</p>
              <p className="text-[14.5px] md:text-[15.5px]" style={{ color: C.sub }}>{c.d}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-y" style={{ borderColor: C.line, background: C.soft }}>
        <div className="mx-auto max-w-[1280px] px-5 py-14 md:px-8 md:py-20">
          <h2 className={H2}>진행 과정</h2>
          <ol className="mt-7 grid border-t md:mt-9 md:grid-cols-5 md:border-l md:border-t-0" style={{ borderColor: C.line }} role="list">
            {STEPS.map(([t, d], i) => (
              <li key={t} className="flex items-baseline gap-4 border-b py-4 md:block md:border-b-0 md:border-r md:px-5 md:py-2" style={{ borderColor: C.hair }}>
                <span className="w-6 shrink-0 text-[17px] font-bold tabular-nums md:block md:text-[19px]" style={{ color: C.wood }}>{i + 1}</span>
                <span className="flex-1 md:mt-2 md:block">
                  <b className="block text-[18px] font-bold tracking-[-0.03em] md:text-[20px]">{t}</b>
                  <span className="text-[14.5px] md:text-[15px]" style={{ color: C.sub }}>{d}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-5 py-14 md:px-8 md:py-20">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className={H2}>견적 문의</h2>
            <p className="mt-2 text-[16px] md:text-[17px]" style={{ color: C.sub }}>평형과 공사 범위를 알려 주시면 방문 실측 후 공정별 견적서를 드립니다.</p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-[24px] font-bold tabular-nums tracking-[-0.02em] md:text-[28px]">{TEL}</span>
            <span className="inline-flex h-[52px] items-center px-7 text-[16.5px] font-bold text-white" style={{ background: C.ink }}>견적 문의</span>
          </div>
        </div>
      </section>

      <footer className="border-t px-5 py-7 text-[14px] md:px-8" style={{ borderColor: C.line, color: C.sub }}>
        <div className="mx-auto flex max-w-[1280px] flex-col gap-1 md:flex-row md:justify-between">
          <p>리모델링 인테리어 | 서울 양천구 | 실내건축공사업 등록</p>
          <p>견적 문의 {TEL}</p>
        </div>
      </footer>
    </div>
  );
}
