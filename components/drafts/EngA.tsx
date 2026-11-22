"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";

// 영어 회화 학원 시안 A 성인 회화형(11-22 사례 분석: 파고다처럼 과정을 회화, 토익, 비즈니스로 나누고 수강 신청을 앞에 둔다. 직장인은 레벨, 반 인원, 출근 전과 퇴근 뒤 시간을 먼저 본다). 흰 바탕, 검정과 빨강. 인물 없음. 메인 한 장, 기능 없음.
// 사진: Unsplash 무료 라이선스(public/images/drafts/eng/a-*)
const IMG = "/images/drafts/eng";
const C = { ink: "#141414", sub: "#666", line: "#e7e7e7", soft: "#f5f5f5", red: "#e23b2e" };

const LEVELS = [
  ["Level 1", "자기소개, 길 묻기, 주문하기"],
  ["Level 2", "하루 일과, 경험을 과거형으로"],
  ["Level 3", "의견 말하기, 이유 붙이기"],
  ["Level 4", "회의, 전화, 이메일 표현"],
  ["Level 5", "프레젠테이션, 협상"],
  ["Level 6", "시사 토론, 즉석 발표"],
];

const CLASSES = [
  ["원어민 소그룹", "최대 4명", "주 2회 50분, 레벨별 반 편성"],
  ["1대1 회화", "강사 1명", "주 1 ~ 3회, 업무 상황 맞춤"],
  ["비즈니스 영어", "최대 6명", "이메일, 회의, 발표 실습"],
];

export function EngA() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.75] md:text-[17px]" style={{ color: C.ink }}>
      <header className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur" style={{ borderColor: C.line }}>
        <div className="mx-auto flex h-[72px] max-w-[1320px] items-center justify-between px-5 md:px-10">
          <p className="text-[19px] font-bold tracking-[-0.02em]">
            말길 <span style={{ color: C.red }}>영어회화</span>
          </p>
          <nav aria-label="주 메뉴" className="hidden gap-9 text-[15px] font-semibold lg:flex" style={{ color: "#444" }}>
            {["레벨", "반 구성", "시간표", "레벨 테스트"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </nav>
          <span className="inline-flex h-11 items-center px-5 text-[15px] font-bold text-white" style={{ background: C.red }}>
            레벨 테스트
          </span>
        </div>
      </header>

      <section className="px-5 pt-12 md:px-10 md:pt-20">
        <div className="mx-auto max-w-[1320px]">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <h1 className="text-[38px] font-bold leading-[1.2] tracking-[-0.05em] md:text-[72px]">
              출근 전 50분,
              <br />
              말하는 시간을 늘립니다
            </h1>
            <p className="max-w-[380px]" style={{ color: C.sub }}>
              한 반 4명까지만 받습니다. 수업 시간의 절반 이상을 수강생이 말하도록 짭니다.
            </p>
          </div>
          <div className="relative mt-10 aspect-[4/3] overflow-hidden md:aspect-[21/9]">
            <Image src={`${IMG}/a-hero.jpg`} alt="나무 책상 위 노트와 펜, 커피 한 잔" fill priority sizes="100vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-[1320px]">
          <h2 className="text-[30px] font-bold tracking-[-0.04em] md:text-[44px]">6단계 레벨</h2>
          <p className="mt-3" style={{ color: C.sub }}>첫 방문 때 원어민 강사와 20분 대화로 레벨을 정합니다.</p>
          <ol className="mt-10 grid gap-px sm:grid-cols-2 lg:grid-cols-3" style={{ background: C.line }}>
            {LEVELS.map(([t, d]) => (
              <li key={t} className="bg-white p-6 md:p-8">
                <p className="text-[14px] font-bold tracking-[0.08em]" style={{ color: C.red }}>{t}</p>
                <p className="mt-2 text-[19px] font-bold tracking-[-0.03em]">{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="px-5 md:px-10" style={{ background: C.soft }}>
        <div className="mx-auto max-w-[1320px] py-20 md:py-28">
          <h2 className="text-[30px] font-bold tracking-[-0.04em] md:text-[44px]">반 구성</h2>
          <ul className="mt-10 border-t" style={{ borderColor: C.ink }}>
            {CLASSES.map(([t, n, d]) => (
              <li key={t} className="grid gap-1 border-b py-6 md:grid-cols-[1.2fr_0.6fr_1.6fr_auto] md:items-center md:gap-6" style={{ borderColor: "#dcdcdc" }}>
                <h3 className="text-[23px] font-bold tracking-[-0.03em]">{t}</h3>
                <p className="font-bold" style={{ color: C.red }}>{n}</p>
                <p style={{ color: C.sub }}>{d}</p>
                <ArrowRight size={20} className="hidden md:block" aria-hidden />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto grid max-w-[1320px] gap-10 md:grid-cols-[1.2fr_1fr] md:gap-16">
          <div>
            <h2 className="text-[28px] font-bold leading-[1.35] tracking-[-0.04em] md:text-[38px]">시간표</h2>
            <dl className="mt-7 border-t" style={{ borderColor: C.ink }}>
              {[
                ["새벽반", "07:00 ~ 07:50"],
                ["점심반", "12:20 ~ 13:10"],
                ["저녁 1부", "19:30 ~ 20:20"],
                ["저녁 2부", "20:40 ~ 21:30"],
                ["주말반", "토요일 10:00 ~ 12:00"],
              ].map(([k, v]) => (
                <div key={k} className="grid grid-cols-[110px_1fr] gap-3 border-b py-4" style={{ borderColor: C.line }}>
                  <dt className="font-bold">{k}</dt>
                  <dd className="tabular-nums" style={{ color: C.sub }}>{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-[14px]" style={{ color: C.sub }}>4주 단위로 등록합니다. 교습비는 학원 안에 게시합니다.</p>
          </div>
          <div className="flex flex-col bg-black text-white">
            <div className="relative aspect-[16/9]">
              <Image src={`${IMG}/a-desk.jpg`} alt="노트북 옆 커피잔과 펜, 이어폰" fill sizes="(min-width: 768px) 40vw, 100vw" className="object-cover" />
            </div>
            <div className="p-8">
              <h3 className="text-[22px] font-bold">무료 레벨 테스트 20분</h3>
              <p className="mt-2 text-white/70">말하기, 듣기를 확인하고 맞는 반과 시간을 바로 알려 드립니다. 강남역 11번 출구 앞.</p>
              <p className="mt-5 text-[26px] font-bold tabular-nums">02-000-0000</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t px-5 py-10 text-[14px] md:px-10" style={{ borderColor: C.line, color: C.sub }}>
        <div className="mx-auto flex max-w-[1320px] flex-col gap-2 md:flex-row md:justify-between">
          <p>말길 영어회화, 서울특별시 강남구 일대. 학원 등록번호 제000호</p>
          <p>02-000-0000</p>
        </div>
      </footer>
    </div>
  );
}
