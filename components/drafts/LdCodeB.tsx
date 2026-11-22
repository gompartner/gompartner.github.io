"use client";

import Image from "next/image";

// 코딩 교실 특강 모집 랜딩 시안 B 학부모 안내문형(11-22. 시안 A는 기존 모집 랜딩. 학원 방학 특강 안내문처럼 반별 요일, 시간, 정원, 수업료를 표 한 장으로 먼저 보여 주고, 4주 결과물을 주차별로 짧게). 흰 바탕, 보라와 노랑. 인물 없음. 메인 한 장, 신청 폼은 모양만.
// 사진: Unsplash 무료 라이선스(public/images/drafts/ld/code-*)
const IMG = "/images/drafts/ld";
const C = { ink: "#1b1530", sub: "#615b75", line: "#e8e5f0", soft: "#f6f4fb", violet: "#5b3fd1", yellow: "#ffd23f" };

const CLASSES = [
  ["블록 코딩반", "월, 수 16:00 ~ 17:30", "초2 ~ 초3", "8명"],
  ["게임 만들기반", "화, 목 16:00 ~ 17:30", "초4 ~ 초6", "8명"],
  ["로봇 코딩반", "토 10:00 ~ 13:00", "초3 ~ 초6", "6명"],
];

const WEEKS = [
  ["1주", "깃발을 눌러 캐릭터 움직이기"],
  ["2주", "장애물에 닿으면 처음 자리로"],
  ["3주", "별을 모아 점수와 다음 판"],
  ["4주", "게임 완성, 가족 앞 발표"],
];

export function LdCodeB() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.75] md:text-[17px]" style={{ color: C.ink }}>
      <section className="px-5 pb-14 pt-12 md:px-8 md:pb-20 md:pt-16">
        <div className="mx-auto grid max-w-[1120px] items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <p className="text-[15px] font-bold" style={{ color: C.violet }}>별빛 코딩 교실, 겨울방학 특강</p>
            <h1 className="mt-4 text-[36px] font-bold leading-[1.24] tracking-[-0.045em] md:text-[56px]">
              4주 동안
              <br />
              게임 하나를 완성합니다
            </h1>
            <p className="mt-5 max-w-[460px]" style={{ color: C.sub }}>초등 2학년부터 6학년까지, 한 반 8명. 마지막 날 가족 앞에서 직접 만든 게임을 소개합니다.</p>
            <p className="mt-6 inline-flex rounded-full px-4 py-1.5 text-[15px] font-bold" style={{ background: C.yellow }}>12월 20일 모집 마감</p>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[24px] bg-white">
            <Image src={`${IMG}/code-hero.jpg`} alt="흰 바탕 위에 나란히 선 양철 로봇 장난감들" fill priority sizes="(min-width: 1024px) 45vw, 100vw" className="object-contain" />
          </div>
        </div>
      </section>

      <section className="px-5 py-16 md:px-8 md:py-24" style={{ background: C.soft }}>
        <div className="mx-auto max-w-[1120px]">
          <h2 className="text-[28px] font-bold tracking-[-0.04em] md:text-[40px]">반과 시간</h2>
          <ul className="mt-8 overflow-hidden rounded-[20px] bg-white">
            {CLASSES.map(([t, d, a, n]) => (
              <li key={t} className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 border-b px-6 py-5 last:border-b-0 md:grid-cols-[1fr_1.2fr_0.8fr_0.4fr] md:items-center md:px-8" style={{ borderColor: C.line }}>
                <span className="text-[19px] font-bold">{t}</span>
                <span className="text-right font-semibold tabular-nums md:order-none md:text-left" style={{ color: C.violet }}>{n}</span>
                <span className="tabular-nums" style={{ color: C.sub }}>{d}</span>
                <span className="text-right md:text-left" style={{ color: C.sub }}>{a}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[15px]" style={{ color: C.sub }}>4주 수업료 24만 원, 교재와 노트북 대여 포함. 교습비는 학원 안에 게시합니다.</p>
        </div>
      </section>

      <section className="px-5 py-16 md:px-8 md:py-24">
        <div className="mx-auto grid max-w-[1120px] items-center gap-10 md:grid-cols-[1fr_1fr] md:gap-14">
          <div>
            <h2 className="text-[26px] font-bold tracking-[-0.04em] md:text-[34px]">주차별로 만드는 것</h2>
            <ol className="mt-6 grid gap-3">
              {WEEKS.map(([w, d]) => (
                <li key={w} className="flex gap-4 border-b pb-3" style={{ borderColor: C.line }}>
                  <span className="w-[36px] shrink-0 font-bold" style={{ color: C.violet }}>{w}</span>
                  <span>{d}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="relative aspect-[3/4] overflow-hidden rounded-[18px]">
              <Image src={`${IMG}/code-laptop.jpg`} alt="코드가 열린 노트북과 화분" fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
            </div>
            <div className="relative aspect-[3/4] overflow-hidden rounded-[18px]">
              <Image src={`${IMG}/code-robot.jpg`} alt="회색 바탕 앞 파란 양철 로봇" fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 pb-20 md:px-8 md:pb-28">
        <div className="mx-auto max-w-[1120px] rounded-[24px] p-8 text-white md:p-12" style={{ background: C.violet }}>
          <h2 className="text-[26px] font-bold tracking-[-0.04em] md:text-[34px]">특강 신청</h2>
          <div className="mt-6 grid gap-3 md:grid-cols-4">
            {["학생 이름", "학년", "희망 반", "보호자 연락처"].map((f) => (
              <div key={f} className="rounded-xl bg-white/12 px-4 py-3 text-[15px] text-white/80">{f}</div>
            ))}
          </div>
          <button type="button" className="mt-5 h-14 w-full rounded-xl text-[17px] font-bold md:w-auto md:px-10" style={{ background: C.yellow, color: C.ink }}>
            자리 맡기
          </button>
        </div>
      </section>

      <footer className="border-t px-5 py-10 text-[14px] md:px-8" style={{ borderColor: C.line, color: C.sub }}>
        <div className="mx-auto max-w-[1120px]">별빛 코딩 교실, 경기도 성남시 분당구 일대. 학원 등록번호 제000호, 02-000-0000</div>
      </footer>
    </div>
  );
}
