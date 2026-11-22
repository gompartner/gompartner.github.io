"use client";

import Image from "next/image";
import { Music } from "lucide-react";

// 피아노 학원 시안 A 어린이 피아노(11-22 사례 분석: 드림뮤직처럼 교육 프로그램 칸과 공간 사진. 어린이 학부모는 진도, 수업 구성, 시간표, 연주회를 본다). 흰 바탕, 청록. 인물 없음. 메인 한 장, 기능 없음.
// 사진: Unsplash 무료 라이선스(public/images/drafts/pia/a-*)
const IMG = "/images/drafts/pia";
const C = { ink: "#14201f", sub: "#5c6866", line: "#e1eae9", soft: "#f1f7f6", teal: "#147a72", tealSoft: "#e0f1ef", yellow: "#f2b632" };

const STEPS = [
  ["입문", "5 ~ 7세", "건반 이름, 손 모양, 쉬운 동요"],
  ["바이엘", "초등 1 ~ 2학년", "양손 연주, 악보 읽기"],
  ["체르니 100", "초등 2 ~ 4학년", "손가락 독립, 소나티네 시작"],
  ["체르니 30", "초등 고학년", "소나타, 연주곡 완성"],
];

export function PiaA() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.75] md:text-[17px]" style={{ color: C.ink }}>
      <header className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur" style={{ borderColor: C.line }}>
        <div className="mx-auto flex h-[70px] max-w-[1200px] items-center justify-between px-5 md:px-8">
          <p className="flex items-center gap-2 text-[20px] font-bold tracking-[-0.03em]">
            <Music size={20} style={{ color: C.teal }} aria-hidden /> 도레미 피아노
          </p>
          <nav aria-label="주 메뉴" className="hidden gap-9 text-[15px] font-semibold lg:flex" style={{ color: "#3d4947" }}>
            {["진도 안내", "수업 구성", "시간표", "연주회"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </nav>
          <span className="inline-flex h-11 items-center rounded-full px-5 text-[15px] font-bold text-white" style={{ background: C.teal }}>
            상담 신청
          </span>
        </div>
      </header>

      <section className="px-5 pb-16 pt-10 md:px-8 md:pb-24 md:pt-14">
        <div className="mx-auto grid max-w-[1200px] items-center gap-8 overflow-hidden rounded-[32px] lg:grid-cols-2" style={{ background: C.tealSoft }}>
          <div className="px-7 pt-10 md:px-14 lg:py-16">
            <p className="inline-flex rounded-full bg-white px-3 py-1 text-[14px] font-bold" style={{ color: C.teal }}>5세부터 초등 6학년까지</p>
            <h1 className="mt-5 text-[34px] font-bold leading-[1.25] tracking-[-0.045em] md:text-[52px]">
              매일 조금씩,
              <br />
              한 곡을 끝까지
            </h1>
            <p className="mt-4 max-w-[430px] text-[16px] md:text-[18px]" style={{ color: C.sub }}>
              개인 레슨, 이론, 연습을 하루 50분 안에 나눠 합니다. 진도표는 매달 보호자께 보내 드립니다.
            </p>
          </div>
          <div className="relative min-h-[280px] self-stretch md:min-h-[440px]">
            <Image src={`${IMG}/a-hero.jpg`} alt="창가 햇빛 아래 놓인 그랜드 피아노" fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-[1200px]">
          <h2 className="text-[30px] font-bold tracking-[-0.04em] md:text-[44px]">진도 안내</h2>
          <p className="mt-3" style={{ color: C.sub }}>나이보다 손과 악보 읽기 수준에 맞춰 시작합니다.</p>
          <ol className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(([t, a, d], i) => (
              <li key={t} className="rounded-[22px] p-6 md:p-7" style={{ background: C.soft }}>
                <span className="flex h-9 w-9 items-center justify-center rounded-full text-[15px] font-bold" style={{ background: C.yellow }}>{i + 1}</span>
                <h3 className="mt-4 text-[22px] font-bold tracking-[-0.03em]">{t}</h3>
                <p className="text-[14px] font-bold" style={{ color: C.teal }}>{a}</p>
                <p className="mt-2 text-[15px]" style={{ color: C.sub }}>{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28" style={{ background: C.soft }}>
        <div className="mx-auto grid max-w-[1200px] items-center gap-10 md:grid-cols-[1.1fr_1fr] md:gap-16">
          <div className="grid grid-cols-2 gap-3">
            <div className="relative aspect-[3/4] overflow-hidden rounded-[22px]">
              <Image src={`${IMG}/a-upright.jpg`} alt="스탠드 옆 갈색 업라이트 피아노" fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
            </div>
            <div className="relative aspect-[3/4] overflow-hidden rounded-[22px]">
              <Image src={`${IMG}/a-sheet.jpg`} alt="악보 위에 흩어진 음표 퍼즐 조각" fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
            </div>
          </div>
          <div>
            <h2 className="text-[28px] font-bold leading-[1.35] tracking-[-0.04em] md:text-[38px]">하루 50분 수업</h2>
            <ul className="mt-7 grid gap-3">
              {[
                ["개인 레슨", "15분", "선생님과 1대1, 이번 주 곡"],
                ["연습", "25분", "개인 연습실, 연습 횟수 체크"],
                ["이론", "10분", "음표, 박자, 계이름 학습지"],
              ].map(([k, t, v]) => (
                <li key={k} className="grid grid-cols-[1fr_auto] gap-x-4 border-b pb-3" style={{ borderColor: C.line }}>
                  <span className="font-bold">{k}</span>
                  <span className="font-bold tabular-nums" style={{ color: C.teal }}>{t}</span>
                  <span className="col-span-2 text-[15px]" style={{ color: C.sub }}>{v}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto grid max-w-[1200px] gap-10 md:grid-cols-2 md:gap-16">
          <div>
            <h2 className="text-[28px] font-bold leading-[1.35] tracking-[-0.04em] md:text-[38px]">시간표</h2>
            <dl className="mt-7 border-t" style={{ borderColor: C.ink }}>
              {[
                ["유치부", "월 ~ 금 13:00 ~ 15:00"],
                ["초등 저학년", "월 ~ 금 14:00 ~ 17:00"],
                ["초등 고학년", "월 ~ 금 16:00 ~ 19:30"],
                ["주 3회반", "월, 수, 금 또는 화, 목 포함 선택"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 border-b py-4" style={{ borderColor: C.line }}>
                  <dt className="font-semibold">{k}</dt>
                  <dd className="text-right tabular-nums" style={{ color: C.sub }}>{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-[14px]" style={{ color: C.sub }}>교습비는 교육지원청에 신고한 금액이며 학원 안에 게시합니다.</p>
          </div>
          <div className="flex flex-col justify-between overflow-hidden rounded-[28px] text-white" style={{ background: C.teal }}>
            <div className="p-8 md:p-10">
              <h2 className="text-[26px] font-bold tracking-[-0.04em] md:text-[32px]">연주회</h2>
              <p className="mt-3 text-white/80">매년 12월 작은 공연장을 빌려 연주회를 엽니다. 한 사람이 한 곡씩, 처음부터 끝까지 무대에서 칩니다.</p>
            </div>
            <div className="relative aspect-[16/9]">
              <Image src={`${IMG}/a-keys.jpg`} alt="흰 건반과 검은 건반" fill sizes="(min-width: 768px) 45vw, 100vw" className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t px-5 py-10 text-[14px] md:px-8" style={{ borderColor: C.line, color: C.sub }}>
        <div className="mx-auto flex max-w-[1200px] flex-col gap-2 md:flex-row md:justify-between">
          <p>도레미 피아노 교습소, 서울특별시 은평구 일대. 학원 등록번호 제000호</p>
          <p>02-000-0000</p>
        </div>
      </footer>
    </div>
  );
}
