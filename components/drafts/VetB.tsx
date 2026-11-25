"use client";

import Image from "next/image";
import { ArrowRight, Clock } from "lucide-react";

// 동물병원 시안 B 동네 주치의형(11-22 사례 분석: 루벨, 동행하는 동물병원처럼 밝은 톤, 둥근 카드, 예방접종과 건강검진 일정, 진료시간). 흰 바탕, 초록. 사람 없음. 메인 한 장, 기능 없음.
// 사진: Unsplash 무료 라이선스(public/images/drafts/vet/b-*)
const IMG = "/images/drafts/vet";
const C = { ink: "#18201b", sub: "#5f6a63", line: "#e4ebe6", soft: "#f2f7f3", green: "#2e8b57", greenSoft: "#e3f3e9" };

const VAC: [string, string][] = [
  ["6 ~ 8주", "종합백신 1차, 코로나 장염 1차"],
  ["10 ~ 12주", "종합백신 2차, 심장사상충 예방 시작"],
  ["14 ~ 16주", "종합백신 3차, 켄넬코프"],
  ["16주 이후", "광견병, 인플루엔자, 동물등록"],
  ["매년", "추가 접종, 1년 건강검진"],
];

export function VetB() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.75] md:text-[17px]" style={{ color: C.ink }}>
      <header className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur" style={{ borderColor: C.line }}>
        <div className="mx-auto flex h-[70px] max-w-[1200px] items-center justify-between px-5 md:px-8">
          <p className="text-[20px] font-bold tracking-[-0.03em]">
            <span style={{ color: C.green }}>초록</span> 동물병원
          </p>
          <nav aria-label="주 메뉴" className="hidden gap-9 text-[15px] font-semibold lg:flex" style={{ color: "#3f4842" }}>
            {["진료 안내", "예방접종", "건강검진", "오시는 길"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </nav>
        </div>
      </header>

      <section className="px-5 pb-14 pt-10 md:px-8 md:pb-20 md:pt-14">
        <div className="mx-auto grid max-w-[1200px] items-center gap-8 overflow-hidden rounded-[32px] lg:grid-cols-2" style={{ background: C.greenSoft }}>
          <div className="px-7 pt-10 md:px-14 lg:py-16">
            <p className="inline-flex rounded-full bg-white px-3 py-1 text-[14px] font-bold" style={{ color: C.green }}>개, 고양이 진료</p>
            <h1 className="mt-5 text-[34px] font-bold leading-[1.25] tracking-[-0.045em] md:text-[52px]">
              처음 데려온 날부터
              <br />
              나이 들 때까지
            </h1>
            <p className="mt-4 max-w-[430px] text-[16px] md:text-[18px]" style={{ color: C.sub }}>
              접종 날짜를 문자로 미리 알려 드립니다. 진료 기록은 수첩 대신 병원에서 보관합니다.
            </p>
          </div>
          <div className="relative min-h-[280px] self-stretch md:min-h-[440px]">
            <Image src={`${IMG}/b-hero.jpg`} alt="나무 바닥에 엎드린 보더콜리" fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto grid max-w-[1200px] gap-10 md:grid-cols-[1fr_1.2fr] md:gap-16">
          <div>
            <h2 className="text-[30px] font-bold tracking-[-0.04em] md:text-[44px]">강아지 예방접종 일정</h2>
            <p className="mt-3" style={{ color: C.sub }}>고양이는 종합백신 3회와 광견병, 이후 매년 추가 접종입니다. 아이 상태에 따라 날짜를 조정합니다.</p>
            <div className="relative mt-8 aspect-[4/3] overflow-hidden rounded-[24px]">
              <Image src={`${IMG}/b-sleep.jpg`} alt="이불 위에서 잠든 강아지" fill sizes="(min-width: 768px) 40vw, 100vw" className="object-cover" />
            </div>
          </div>
          <ol className="grid content-start gap-3">
            {VAC.map(([w, d], i) => (
              <li key={w} className="flex items-center gap-5 rounded-[20px] p-5 md:p-6" style={{ background: C.soft }}>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white font-bold" style={{ color: C.green }}>{i + 1}</span>
                <div>
                  <p className="text-[19px] font-bold">{w}</p>
                  <p className="text-[15px]" style={{ color: C.sub }}>{d}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28" style={{ background: C.soft }}>
        <div className="mx-auto max-w-[1200px]">
          <h2 className="text-[30px] font-bold tracking-[-0.04em] md:text-[44px]">건강검진</h2>
          <ul className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              ["기본 검진", "1 ~ 6세", "신체검사, 혈액검사, 분변검사"],
              ["정밀 검진", "7세 이상", "기본 검진에 흉복부 엑스레이, 복부 초음파"],
              ["고양이 검진", "전 연령", "신장 수치(SDMA), 갑상선, 심장 초음파"],
            ].map(([t, a, d]) => (
              <li key={t} className="flex flex-col rounded-[24px] bg-white p-7 md:p-8">
                <span className="self-start rounded-full px-3 py-0.5 text-[14px] font-bold" style={{ background: C.greenSoft, color: C.green }}>{a}</span>
                <h3 className="mt-4 text-[22px] font-bold tracking-[-0.03em]">{t}</h3>
                <p className="mt-2 flex-1 text-[15px]" style={{ color: C.sub }}>{d}</p>
                <p className="mt-6 inline-flex items-center gap-1.5 text-[15px] font-bold" style={{ color: C.green }}>
                  항목 보기 <ArrowRight size={16} aria-hidden />
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto grid max-w-[1200px] items-center gap-10 md:grid-cols-[1fr_1.1fr] md:gap-16">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[24px]">
            <Image src={`${IMG}/b-cat.jpg`} alt="위를 올려다보는 고등어 무늬 고양이" fill sizes="(min-width: 768px) 45vw, 100vw" className="object-cover" />
          </div>
          <div>
            <p className="flex items-center gap-2 text-[15px] font-bold" style={{ color: C.green }}>
              <Clock size={18} aria-hidden /> 진료시간
            </p>
            <dl className="mt-5 border-t" style={{ borderColor: C.ink }}>
              {[
                ["평일", "09:30 ~ 19:30"],
                ["토, 일", "10:00 ~ 17:00"],
                ["점심시간", "13:00 ~ 14:00"],
                ["휴진", "설, 추석 당일"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 border-b py-4" style={{ borderColor: C.line }}>
                  <dt style={{ color: C.sub }}>{k}</dt>
                  <dd className="font-bold tabular-nums">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-6 text-[32px] font-bold tabular-nums tracking-[-0.02em]" style={{ color: C.green }}>031-000-0000</p>
          </div>
        </div>
      </section>

      <footer className="border-t px-5 py-10 text-[14px] md:px-8" style={{ borderColor: C.line, color: C.sub }}>
        <div className="mx-auto flex max-w-[1200px] flex-col gap-2 md:flex-row md:justify-between">
          <p>초록 동물병원, 경기도 용인시 수지구 일대, 1층 (건물 앞 주차)</p>
          <p>대표전화 031-000-0000</p>
        </div>
      </footer>
    </div>
  );
}
