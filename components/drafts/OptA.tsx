"use client";

import Image from "next/image";


// 안경원 시안 A 누진 다초점 검안형(11-22 사례 분석: 아임웹 납품 사례 없음. 지역 기사에 나온 누진 다초점 안경원은 정밀 검사, 동공간거리와 독서 거리 측정, 적응 기간 안내를 내세운다). 흰 바탕, 남색. 인물 없음. 메인 한 장, 기능 없음.
// 사진: Unsplash 무료 라이선스(public/images/drafts/opt/a-*)
const IMG = "/images/drafts/opt";
const C = { ink: "#121a26", sub: "#5c6575", line: "#e3e7ee", soft: "#f3f5f9", navy: "#1d3366" };

const LENS = [
  ["표준형", "처음 누진을 쓰시는 분, 일상 생활", "가까운 거리 시야가 좁은 편"],
  ["개인 맞춤형", "착용 각도, 얼굴 굴곡까지 측정해 설계", "적응이 빠르고 주변 흔들림이 적음"],
  ["실내 중근용", "컴퓨터, 독서, 사무 업무", "운전에는 맞지 않음"],
];

export function OptA() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.75] md:text-[17px]" style={{ color: C.ink }}>
      <header className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur" style={{ borderColor: C.line }}>
        <div className="mx-auto flex h-[72px] max-w-[1240px] items-center justify-between px-5 md:px-8">
          <p className="text-[20px] font-bold tracking-[-0.03em]" style={{ color: C.navy }}>
            맑은시야 안경원
          </p>
          <nav aria-label="주 메뉴" className="hidden gap-9 text-[15px] font-semibold lg:flex" style={{ color: "#3c4556" }}>
            {["누진 다초점", "검사 순서", "렌즈 종류", "오시는 길"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </nav>
        </div>
      </header>

      <section className="px-5 pt-10 md:px-8 md:pt-16">
        <div className="mx-auto grid max-w-[1240px] items-end gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
          <div className="pb-2 lg:pb-14">
            <p className="text-[15px] font-bold" style={{ color: C.navy }}>누진 다초점 렌즈</p>
            <h1 className="mt-4 text-[36px] font-bold leading-[1.24] tracking-[-0.045em] md:text-[56px]">
              멀리도 가까이도,
              <br />
              안경 하나로
            </h1>
            <p className="mt-5 max-w-[470px] text-[17px] md:text-[18px]" style={{ color: C.sub }}>
              누진 렌즈는 검사와 측정이 맞아야 어지럽지 않습니다. 한 분당 40분 이상 검사하고, 평소 독서 거리와 운전 습관까지 묻습니다.
            </p>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden lg:aspect-[5/4]">
            <Image src={`${IMG}/a-hero.jpg`} alt="안경테 진열장이 이어진 밝은 안경원 매장" fill priority sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-[1240px]">
          <h2 className="text-[30px] font-bold tracking-[-0.04em] md:text-[44px]">검사 순서</h2>
          <ol className="mt-10 grid gap-px sm:grid-cols-2 lg:grid-cols-5" style={{ background: C.line }}>
            {[
              ["상담", "쓰는 안경, 불편한 점, 생활 거리"],
              ["굴절 검사", "먼 거리, 가까운 거리 도수"],
              ["양안 검사", "두 눈이 함께 초점 맞추는 힘"],
              ["피팅 측정", "동공간거리, 눈과 렌즈 사이 거리"],
              ["적응 확인", "착용 2주 뒤 다시 확인"],
            ].map(([k, v], i) => (
              <li key={k} className="bg-white p-6 md:p-7">
                <p className="text-[14px] font-bold tabular-nums" style={{ color: C.navy }}>0{i + 1}</p>
                <p className="mt-2 text-[20px] font-bold tracking-[-0.03em]">{k}</p>
                <p className="mt-1 text-[15px]" style={{ color: C.sub }}>{v}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28" style={{ background: C.soft }}>
        <div className="mx-auto grid max-w-[1240px] gap-10 md:grid-cols-[1fr_1.3fr] md:gap-16">
          <div>
            <h2 className="text-[30px] font-bold leading-[1.35] tracking-[-0.04em] md:text-[42px]">렌즈 종류</h2>
            <p className="mt-4" style={{ color: C.sub }}>렌즈 등급에 따라 또렷하게 보이는 범위가 달라집니다. 생활 거리에 맞춰 권해 드립니다.</p>
            <div className="relative mt-8 aspect-[4/3] overflow-hidden">
              <Image src={`${IMG}/a-lens.jpg`} alt="손글씨 메모 위에 놓인 둥근 금속테 안경" fill sizes="(min-width: 768px) 40vw, 100vw" className="object-cover" />
            </div>
          </div>
          <ul className="grid content-start gap-3">
            {LENS.map(([t, d, n]) => (
              <li key={t} className="bg-white p-6 md:p-8">
                <h3 className="text-[22px] font-bold tracking-[-0.03em]">{t}</h3>
                <p className="mt-1" style={{ color: C.sub }}>{d}</p>
                <p className="mt-4 border-t pt-3 text-[15px] font-semibold" style={{ borderColor: C.line, color: C.navy }}>{n}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto grid max-w-[1240px] items-center gap-10 md:grid-cols-2 md:gap-16">
          <div>
            <h2 className="text-[28px] font-bold leading-[1.35] tracking-[-0.04em] md:text-[38px]">적응이 어려우시면</h2>
            <ul className="mt-7 grid gap-3">
              {[
                "처음 1 ~ 2주는 계단에서 고개를 숙여 보세요",
                "2주가 지나도 어지러우면 다시 측정합니다",
                "도수 재조정은 착용 후 3개월 안에 1회 무료입니다",
              ].map((x) => (
                <li key={x} className="border-b pb-3" style={{ borderColor: C.line }}>{x}</li>
              ))}
            </ul>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden">
            <Image src={`${IMG}/a-frames.jpg`} alt="흰 판 위에 줄지어 놓인 갈색, 검정 안경테" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      <footer className="px-5 py-10 text-[14px] text-white/70 md:px-8" style={{ background: C.navy }}>
        <div className="mx-auto flex max-w-[1240px] flex-col gap-2 md:flex-row md:justify-between">
          <p>맑은시야 안경원, 경기도 성남시 분당구 일대. 안경사, 사업자등록번호 000-00-00000</p>
          <p>매일 10:00 ~ 21:00, 031-000-0000</p>
        </div>
      </footer>
    </div>
  );
}
