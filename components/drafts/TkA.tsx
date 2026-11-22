"use client";

import Image from "next/image";
import { Bus, Clock } from "lucide-react";

// 태권도장 시안 A 유초등 생활체육형(11-22 사례 분석: 아임웹 사례 없음. 당근 프로필의 유치부, 초등부 분리 수업, 학부모 대상 글에서 거리, 차량 운행, 부별 시간을 먼저 본다). 흰 바탕, 파랑과 빨강. 인물 없음. 메인 한 장, 기능 없음.
// 사진: Unsplash 무료 라이선스(public/images/drafts/tk/a-*)
const IMG = "/images/drafts/tk";
const C = { ink: "#111a2b", sub: "#5a6476", line: "#e2e7ef", soft: "#f2f5fa", blue: "#1747a6", red: "#e0342e" };

const TIME = [
  ["유치부", "14:00 ~ 14:50", "6 ~ 7세"],
  ["초등 1부", "15:00 ~ 15:50", "1 ~ 2학년"],
  ["초등 2부", "16:00 ~ 16:50", "3 ~ 4학년"],
  ["초등 3부", "17:00 ~ 17:50", "5 ~ 6학년"],
  ["중등, 품새반", "18:30 ~ 19:30", "승품, 승단 준비"],
];

export function TkA() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.75] md:text-[17px]" style={{ color: C.ink }}>
      <header className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur" style={{ borderColor: C.line }}>
        <div className="mx-auto flex h-[70px] max-w-[1200px] items-center justify-between px-5 md:px-8">
          <p className="text-[20px] font-bold tracking-[-0.03em]">
            <span style={{ color: C.blue }}>바른</span> 태권도
          </p>
          <nav aria-label="주 메뉴" className="hidden gap-9 text-[15px] font-semibold lg:flex" style={{ color: "#3c4557" }}>
            {["부별 시간표", "차량 운행", "수업 구성", "심사"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </nav>
          <span className="inline-flex h-11 items-center rounded-full px-5 text-[15px] font-bold text-white" style={{ background: C.red }}>
            체험 수업
          </span>
        </div>
      </header>

      <section className="px-5 pb-16 pt-10 md:px-8 md:pb-24 md:pt-14">
        <div className="mx-auto grid max-w-[1200px] items-center gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-14">
          <div>
            <p className="text-[15px] font-bold" style={{ color: C.blue }}>유치부, 초등부 분리 수업</p>
            <h1 className="mt-4 text-[36px] font-bold leading-[1.24] tracking-[-0.045em] md:text-[56px]">
              인사부터 배우고
              <br />
              끝까지 해 보는 힘
            </h1>
            <p className="mt-5 max-w-[460px] text-[17px] md:text-[18px]" style={{ color: C.sub }}>
              학년별로 반을 나눠 50분 수업합니다. 학교와 유치원 앞에서 차량으로 모시고, 수업이 끝나면 집 앞까지 모셔다 드립니다.
            </p>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[28px]">
            <Image src={`${IMG}/a-hero.jpg`} alt="파란색과 빨간색 매트가 깔린 넓은 실내 수련장" fill priority sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28" style={{ background: C.soft }}>
        <div className="mx-auto max-w-[1200px]">
          <h2 className="flex items-center gap-3 text-[30px] font-bold tracking-[-0.04em] md:text-[44px]">
            <Clock size={30} style={{ color: C.blue }} aria-hidden /> 부별 시간표
          </h2>
          <p className="mt-3" style={{ color: C.sub }}>월 ~ 금 주 5회, 토요일은 격주 특별 수업(줄넘기 대회, 체험 활동)</p>
          <ul className="mt-10 overflow-hidden rounded-[22px] bg-white">
            {TIME.map(([t, h, a]) => (
              <li key={t} className="grid grid-cols-[1fr_auto] gap-x-4 border-b px-6 py-5 last:border-b-0 md:grid-cols-[1fr_1fr_1fr] md:px-8" style={{ borderColor: C.line }}>
                <span className="text-[19px] font-bold">{t}</span>
                <span className="text-right text-[17px] font-bold tabular-nums md:text-left" style={{ color: C.blue }}>{h}</span>
                <span className="text-[15px] md:text-right" style={{ color: C.sub }}>{a}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto grid max-w-[1200px] gap-4 md:grid-cols-[1.2fr_1fr]">
          <div className="rounded-[28px] p-8 text-white md:p-10" style={{ background: C.blue }}>
            <p className="flex items-center gap-2 text-[15px] font-bold text-white/80">
              <Bus size={18} aria-hidden /> 차량 운행
            </p>
            <h2 className="mt-3 text-[26px] font-bold tracking-[-0.04em] md:text-[34px]">학교, 유치원 앞에서 모십니다</h2>
            <ul className="mt-6 grid gap-2.5 text-white/85">
              <li className="border-b border-white/20 pb-2.5">운행 구역: 상계1 ~ 10동, 중계본동</li>
              <li className="border-b border-white/20 pb-2.5">초등학교 4곳, 유치원 6곳 하교 시간 맞춤</li>
              <li className="border-b border-white/20 pb-2.5">동승 선생님 탑승, 하차 확인 문자 발송</li>
              <li>어린이 통학버스 신고 차량 2대</li>
            </ul>
          </div>
          <div className="flex flex-col rounded-[28px] p-8 md:p-10" style={{ background: C.soft }}>
            <h2 className="text-[24px] font-bold tracking-[-0.04em] md:text-[30px]">50분 수업 구성</h2>
            <ol className="mt-5 grid gap-3">
              {[
                ["10분", "인사, 준비운동"],
                ["20분", "품새, 발차기 기본기"],
                ["15분", "줄넘기, 체력 놀이"],
                ["5분", "정리, 바른 자세 인사"],
              ].map(([t, d]) => (
                <li key={d} className="flex gap-4">
                  <span className="w-[48px] shrink-0 font-bold tabular-nums" style={{ color: C.red }}>{t}</span>
                  <span>{d}</span>
                </li>
              ))}
            </ol>
            <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-[18px]">
              <Image src={`${IMG}/a-rope.jpg`} alt="흰 바탕 위에 매듭지은 초록 줄" fill sizes="(min-width: 768px) 35vw, 100vw" className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t px-5 py-10 text-[14px] md:px-8" style={{ borderColor: C.line, color: C.sub }}>
        <div className="mx-auto flex max-w-[1200px] flex-col gap-2 md:flex-row md:justify-between">
          <p>바른 태권도, 서울특별시 노원구 일대. 국기원 공인 도장, 체육도장업 신고번호 000</p>
          <p>02-000-0000</p>
        </div>
      </footer>
    </div>
  );
}
