"use client";

import Image from "next/image";
import { Clock } from "lucide-react";

// 요양병원 시안 B 생활 안내형(11-22 사례 분석: 꽃피는요양원처럼 밝은 휴게실 사진, 비용, 입소 안내. 보호자는 하루를 어떻게 보내는지, 식사, 면회, 연락을 궁금해한다. 의료법상 후기, 최고 표현 없음). 흰 바탕, 따뜻한 주황. 인물 없음. 메인 한 장, 기능 없음.
// 사진: Unsplash 무료 라이선스(public/images/drafts/nh/b-*)
const IMG = "/images/drafts/nh";
const C = { ink: "#211a14", sub: "#695f56", line: "#eee7e0", soft: "#faf6f2", orange: "#c8682c", orangeSoft: "#fbeee4" };

const DAY = [
  ["07:00", "기상, 혈압, 혈당 확인"],
  ["08:00", "아침 식사, 복약"],
  ["10:00", "재활치료와 산책"],
  ["12:00", "점심 식사"],
  ["14:00", "인지 프로그램, 노래, 미술"],
  ["17:30", "저녁 식사, 복약"],
  ["21:00", "취침과 야간 순회"],
];

export function NhB() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.75] md:text-[17px]" style={{ color: C.ink }}>
      <header className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur" style={{ borderColor: C.line }}>
        <div className="mx-auto flex h-[70px] max-w-[1200px] items-center justify-between px-5 md:px-8">
          <p className="text-[20px] font-bold tracking-[-0.03em]">
            <span style={{ color: C.orange }}>햇살</span> 요양병원
          </p>
          <nav aria-label="주 메뉴" className="hidden gap-9 text-[15px] font-semibold lg:flex" style={{ color: "#4b4239" }}>
            {["하루 일과", "식사", "면회", "입원 상담"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </nav>
          <span className="inline-flex h-11 items-center rounded-full px-5 text-[15px] font-bold text-white" style={{ background: C.orange }}>
            입원 상담
          </span>
        </div>
      </header>

      <section className="px-5 pb-16 pt-10 md:px-8 md:pb-24 md:pt-14">
        <div className="mx-auto grid max-w-[1200px] items-center gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-14">
          <div>
            <p className="inline-flex rounded-full px-3 py-1 text-[14px] font-bold" style={{ background: C.orangeSoft, color: C.orange }}>보호자 안내</p>
            <h1 className="mt-5 text-[36px] font-bold leading-[1.24] tracking-[-0.045em] md:text-[54px]">
              부모님의 하루를
              <br />
              매주 알려 드립니다
            </h1>
            <p className="mt-5 max-w-[460px] text-[17px] md:text-[18px]" style={{ color: C.sub }}>
              담당 간호사가 매주 금요일 식사량, 치료 내용, 컨디션을 보호자께 문자로 보내 드립니다. 상태가 바뀌면 그날 바로 전화합니다.
            </p>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[28px]">
            <Image src={`${IMG}/b-hero.jpg`} alt="큰 창가 옆 소파가 놓인 밝은 휴게실" fill priority sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28" style={{ background: C.soft }}>
        <div className="mx-auto grid max-w-[1200px] gap-10 md:grid-cols-[1fr_1.2fr] md:gap-16">
          <div>
            <h2 className="text-[30px] font-bold tracking-[-0.04em] md:text-[44px]">하루 일과</h2>
            <p className="mt-3" style={{ color: C.sub }}>환자 상태에 따라 치료 시간과 프로그램을 조정합니다.</p>
            <div className="relative mt-8 aspect-[4/3] overflow-hidden rounded-[24px]">
              <Image src={`${IMG}/b-hall.jpg`} alt="벤치가 놓인 밝은 병동 복도" fill sizes="(min-width: 768px) 40vw, 100vw" className="object-cover" />
            </div>
          </div>
          <ol className="grid content-start gap-2.5">
            {DAY.map(([t, d]) => (
              <li key={t} className="flex items-center gap-5 rounded-[18px] bg-white p-5">
                <span className="w-[60px] shrink-0 text-[18px] font-bold tabular-nums" style={{ color: C.orange }}>{t}</span>
                <span>{d}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto grid max-w-[1200px] items-center gap-10 md:grid-cols-[1.1fr_1fr] md:gap-16">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[24px]">
            <Image src={`${IMG}/b-meal.jpg`} alt="쟁반 위에 놓인 두부 된장국" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
          </div>
          <div>
            <h2 className="text-[28px] font-bold leading-[1.35] tracking-[-0.04em] md:text-[38px]">식사</h2>
            <p className="mt-3" style={{ color: C.sub }}>영양사가 환자별로 식단을 나눠 하루 세 끼와 간식을 준비합니다.</p>
            <ul className="mt-7 grid gap-3">
              {[
                ["일반식", "제철 반찬, 국과 밥"],
                ["치료식", "당뇨식, 저염식, 신장식"],
                ["연하식", "삼키기 어려운 분께 다진 죽, 갈음식"],
                ["경관식", "콧줄, 위루관 영양 공급"],
              ].map(([k, v]) => (
                <li key={k} className="flex justify-between gap-4 border-b pb-3" style={{ borderColor: C.line }}>
                  <span className="font-bold">{k}</span>
                  <span className="text-right" style={{ color: C.sub }}>{v}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="px-5 pb-20 md:px-8 md:pb-28">
        <div className="mx-auto grid max-w-[1200px] gap-4 md:grid-cols-2">
          <div className="rounded-[28px] p-8 md:p-10" style={{ background: C.orangeSoft }}>
            <p className="flex items-center gap-2 text-[15px] font-bold" style={{ color: C.orange }}>
              <Clock size={17} aria-hidden /> 면회
            </p>
            <h2 className="mt-3 text-[26px] font-bold tracking-[-0.04em] md:text-[32px]">매일 10:00 ~ 20:00</h2>
            <ul className="mt-5 grid gap-2" style={{ color: C.sub }}>
              <li>1층 면회실, 한 번에 보호자 3명까지</li>
              <li>거동이 어려우신 분은 병실 면회 가능</li>
              <li>감염병 유행 시기에는 영상 면회로 바뀝니다</li>
            </ul>
          </div>
          <div className="flex flex-col justify-between rounded-[28px] p-8 text-white md:p-10" style={{ background: C.ink }}>
            <div>
              <h2 className="text-[26px] font-bold tracking-[-0.04em] md:text-[32px]">입원 상담</h2>
              <p className="mt-3 text-white/70">지금 계신 병원의 진료의뢰서와 최근 검사 결과를 가져오시면 상담이 빨라집니다.</p>
            </div>
            <p className="mt-8 text-[32px] font-bold tabular-nums tracking-[-0.02em]">031-000-0000</p>
          </div>
        </div>
      </section>

      <footer className="border-t px-5 py-10 text-[14px] md:px-8" style={{ borderColor: C.line, color: C.sub }}>
        <div className="mx-auto flex max-w-[1200px] flex-col gap-2 md:flex-row md:justify-between">
          <p>햇살 요양병원, 경기도 화성시 일대. 대표자 000, 건물 주차 40대</p>
          <p>입원 상담 031-000-0000</p>
        </div>
      </footer>
    </div>
  );
}
