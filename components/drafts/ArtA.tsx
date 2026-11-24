"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";

// 미술 학원 시안 A 입시 미술형(11-22 사례 분석: WN 미술학원처럼 연필과 종이 사진, 하이파이브처럼 대학별 실기 중심. 합격자 이름, 근거 없는 합격률 대신 전공별 실기와 평가 방식을 보여 준다). 흰 바탕, 검정과 주황. 인물 없음. 메인 한 장, 기능 없음.
// 사진: Unsplash 무료 라이선스(public/images/drafts/art/a-*)
const IMG = "/images/drafts/art";
const C = { ink: "#121212", sub: "#666", line: "#e6e6e6", soft: "#f5f5f5", orange: "#e8571e" };

const MAJORS = [
  ["기초디자인", "시각, 산업, 공예 디자인", "주제 사물을 화면에 구성, 채색"],
  ["소묘", "회화, 조소", "석고, 정물, 인물 묘사"],
  ["발상과 표현", "디자인 계열", "제시어를 해석해 장면으로"],
  ["사고의 전환", "디자인 계열", "제시 사물의 형태를 바꿔 표현"],
  ["애니메이션", "만화, 애니메이션", "캐릭터, 칸 연출, 상황 표현"],
];

export function ArtA() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.75] md:text-[17px]" style={{ color: C.ink }}>
      <header className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur" style={{ borderColor: C.line }}>
        <div className="mx-auto flex h-[72px] max-w-[1320px] items-center justify-between px-5 md:px-10">
          <p className="text-[19px] font-bold tracking-[-0.02em]">
            선과면 <span style={{ color: C.orange }}>미술학원</span>
          </p>
          <nav aria-label="주 메뉴" className="hidden gap-9 text-[15px] font-semibold lg:flex" style={{ color: "#444" }}>
            {["전공별 실기", "평가", "시간표", "입시 상담"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </nav>
          <span className="inline-flex h-11 items-center px-5 text-[15px] font-bold text-white" style={{ background: C.ink }}>
            입시 상담
          </span>
        </div>
      </header>

      <section className="px-5 pt-12 md:px-10 md:pt-20">
        <div className="mx-auto max-w-[1320px]">
          <h1 className="text-[38px] font-bold leading-[1.2] tracking-[-0.05em] md:text-[76px]">
            대학마다 다른 실기,
            <br />
            학교별로 준비합니다
          </h1>
          <div className="relative mt-10 aspect-[4/3] overflow-hidden md:aspect-[21/9]">
            <Image src={`${IMG}/a-hero.jpg`} alt="나무 이젤 위에 줄지어 선 흰 캔버스" fill priority sizes="100vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-[1320px]">
          <h2 className="text-[30px] font-bold tracking-[-0.04em] md:text-[44px]">전공별 실기</h2>
          <ul className="mt-10 border-t" style={{ borderColor: C.ink }}>
            {MAJORS.map(([t, m, d]) => (
              <li key={t} className="grid gap-1 border-b py-6 md:grid-cols-[1fr_1fr_1.6fr_auto] md:items-center md:gap-6" style={{ borderColor: C.line }}>
                <h3 className="text-[23px] font-bold tracking-[-0.03em]">{t}</h3>
                <p className="text-[15px] font-bold" style={{ color: C.orange }}>{m}</p>
                <p style={{ color: C.sub }}>{d}</p>
                <ArrowRight size={20} className="hidden md:block" aria-hidden />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-5 md:px-10" style={{ background: C.soft }}>
        <div className="mx-auto grid max-w-[1320px] items-center gap-10 py-20 md:grid-cols-2 md:gap-16 md:py-28">
          <div className="grid grid-cols-2 gap-3">
            <div className="relative aspect-[3/4] overflow-hidden">
              <Image src={`${IMG}/a-sphere.jpg`} alt="연필로 명암을 넣은 구 소묘" fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
            </div>
            <div className="relative aspect-[3/4] overflow-hidden">
              <Image src={`${IMG}/a-persp.jpg`} alt="자와 지우개 옆 투시 도형 연필 스케치" fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
            </div>
          </div>
          <div>
            <h2 className="text-[28px] font-bold leading-[1.35] tracking-[-0.04em] md:text-[38px]">매달 모의 실기 평가</h2>
            <p className="mt-3" style={{ color: C.sub }}>목표 대학의 시간과 재료, 출제 방식 그대로 시험을 봅니다.</p>
            <ol className="mt-7 grid gap-4">
              {[
                ["실기 시험", "대학별 시간 그대로, 4 ~ 5시간"],
                ["강사 합평", "전공 강사 3명이 함께 채점"],
                ["개별 피드백", "작품마다 고칠 점 기록, 보호자 공유"],
              ].map(([k, v], i) => (
                <li key={k} className="flex gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center text-[15px] font-bold text-white" style={{ background: C.orange }}>{i + 1}</span>
                  <div>
                    <p className="text-[18px] font-bold">{k}</p>
                    <p className="text-[15px]" style={{ color: C.sub }}>{v}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto grid max-w-[1320px] gap-10 md:grid-cols-[1.2fr_1fr] md:gap-16">
          <div>
            <h2 className="text-[28px] font-bold leading-[1.35] tracking-[-0.04em] md:text-[38px]">시간표</h2>
            <dl className="mt-7 border-t" style={{ borderColor: C.ink }}>
              {[
                ["예비 고1, 고1", "주 2회, 화, 목 18:00 ~ 22:00"],
                ["고2", "주 3회, 평일 18:00 ~ 22:00"],
                ["고3, 재수", "주 5회 이상, 평일 오후, 토요일 종일"],
                ["방학 특강", "매일 10:00 ~ 18:00"],
              ].map(([k, v]) => (
                <div key={k} className="grid gap-1 border-b py-4 sm:grid-cols-[150px_1fr]" style={{ borderColor: C.line }}>
                  <dt className="font-bold">{k}</dt>
                  <dd style={{ color: C.sub }}>{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-[14px]" style={{ color: C.sub }}>교습비는 교육지원청에 신고한 금액이며 학원 안에 게시합니다.</p>
          </div>
          <div className="flex flex-col justify-between bg-black text-white">
            <div className="relative aspect-[16/9]">
              <Image src={`${IMG}/a-brush.jpg`} alt="물감이 묻은 붓 여러 자루" fill sizes="(min-width: 768px) 40vw, 100vw" className="object-cover" />
            </div>
            <div className="p-8">
              <h3 className="text-[22px] font-bold">입시 상담</h3>
              <p className="mt-2 text-white/70">지금까지 그린 그림 3장을 가져오시면 전공과 준비 기간을 함께 정합니다.</p>
              <p className="mt-5 text-[26px] font-bold tabular-nums">02-000-0000</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t px-5 py-10 text-[14px] md:px-10" style={{ borderColor: C.line, color: C.sub }}>
        <div className="mx-auto flex max-w-[1320px] flex-col gap-2 md:flex-row md:justify-between">
          <p>선과면 미술학원, 서울특별시 마포구 일대. 학원 등록번호 제000호</p>
          <p>02-000-0000</p>
        </div>
      </footer>
    </div>
  );
}
