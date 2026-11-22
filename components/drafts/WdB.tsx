"use client";

import Image from "next/image";

// 스몰웨딩 시안 B 레스토랑 가족 예식형(11-22 사례 분석: 현율컴퍼니처럼 진행, 사회를 묶어 문의 버튼을 크게. 가족끼리 식사 겸 예식을 원하는 부부는 인원별 공간, 1인 식대, 무엇을 직접 준비하는지, 예약 순서를 묻는다). 흰 바탕, 연분홍과 금색. 인물 없음. 메인 한 장, 기능 없음.
// 사진: Unsplash 무료 라이선스(public/images/drafts/wd/b-*)
const IMG = "/images/drafts/wd";
const C = { ink: "#1d1718", sub: "#6b6163", line: "#efe6e7", soft: "#faf6f6", rose: "#b4606c", roseSoft: "#f8eaec", gold: "#a8823e" };

const ROOMS = [
  ["룸 A", "12 ~ 20명", "양가 부모님, 형제 중심"],
  ["룸 B", "20 ~ 40명", "친척까지, 원형 테이블 5개"],
  ["홀 전체", "40 ~ 70명", "레스토랑 단독 대관, 주말 점심"],
];

export function WdB() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.75] md:text-[17px]" style={{ color: C.ink }}>
      <header className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur" style={{ borderColor: C.line }}>
        <div className="mx-auto flex h-[70px] max-w-[1200px] items-center justify-between px-5 md:px-8">
          <p className="text-[20px] font-bold tracking-[-0.03em]">
            오늘<span style={{ color: C.rose }}>식탁</span> 웨딩
          </p>
          <nav aria-label="주 메뉴" className="hidden gap-9 text-[15px] font-semibold lg:flex" style={{ color: "#4d4446" }}>
            {["공간", "포함 사항", "준비 순서", "상담"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </nav>
          <span className="inline-flex h-11 items-center rounded-full px-5 text-[15px] font-bold text-white" style={{ background: C.rose }}>
            상담 신청
          </span>
        </div>
      </header>

      <section className="px-5 pb-16 pt-10 md:px-8 md:pb-24 md:pt-14">
        <div className="mx-auto grid max-w-[1200px] items-center gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-14">
          <div>
            <p className="inline-flex rounded-full px-3 py-1 text-[14px] font-bold" style={{ background: C.roseSoft, color: C.rose }}>12명부터 70명까지</p>
            <h1 className="mt-5 text-[36px] font-bold leading-[1.24] tracking-[-0.045em] md:text-[56px]">
              밥 한 끼 나누며
              <br />
              올리는 결혼식
            </h1>
            <p className="mt-5 max-w-[460px] text-[17px] md:text-[18px]" style={{ color: C.sub }}>
              레스토랑 한 공간에서 예식과 코스 식사를 함께 합니다. 하객 한 분 한 분과 인사할 시간이 남습니다.
            </p>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[28px]">
            <Image src={`${IMG}/b-hero.jpg`} alt="흰 식탁보 위 금색 커트러리와 냅킨" fill priority sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28" style={{ background: C.soft }}>
        <div className="mx-auto max-w-[1200px]">
          <h2 className="text-[30px] font-bold tracking-[-0.04em] md:text-[44px]">인원별 공간</h2>
          <ul className="mt-10 grid gap-4 md:grid-cols-3">
            {ROOMS.map(([t, n, d]) => (
              <li key={t} className="flex flex-col rounded-[24px] bg-white p-7 md:p-8">
                <span className="self-start rounded-full px-3 py-0.5 text-[14px] font-bold tabular-nums" style={{ background: C.roseSoft, color: C.rose }}>{n}</span>
                <h3 className="mt-4 text-[23px] font-bold tracking-[-0.03em]">{t}</h3>
                <p className="mt-1 text-[15px]" style={{ color: C.sub }}>{d}</p>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-[15px]" style={{ color: C.sub }}>코스 식사 1인 7만 원부터, 대관료는 받지 않습니다.</p>
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto grid max-w-[1200px] items-center gap-10 md:grid-cols-[1.1fr_1fr] md:gap-16">
          <div className="grid grid-cols-2 gap-3">
            <div className="relative aspect-[3/4] overflow-hidden rounded-[22px]">
              <Image src={`${IMG}/b-plate.jpg`} alt="라탄 매트 위 접시와 들꽃 장식 냅킨" fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
            </div>
            <div className="relative aspect-[3/4] overflow-hidden rounded-[22px]">
              <Image src={`${IMG}/b-lawn.jpg`} alt="잔디 위 꽃 장식을 단 의자 두 개" fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
            </div>
          </div>
          <div>
            <h2 className="text-[28px] font-bold leading-[1.35] tracking-[-0.04em] md:text-[38px]">포함 사항</h2>
            <ul className="mt-7 flex flex-wrap gap-2">
              {["테이블 꽃 장식", "예식 진행, 사회", "음향, 마이크", "웰컴 보드", "케이크 커팅", "하객 주차 2시간"].map((m) => (
                <li key={m} className="rounded-full border px-4 py-1.5 font-semibold" style={{ borderColor: C.line }}>{m}</li>
              ))}
            </ul>
            <p className="mt-6 text-[15px]" style={{ color: C.sub }}>드레스, 메이크업, 사진은 원하시는 곳을 쓰시면 됩니다. 자주 함께하는 업체 목록도 드립니다.</p>
          </div>
        </div>
      </section>

      <section className="px-5 pb-20 md:px-8 md:pb-28">
        <div className="mx-auto grid max-w-[1200px] gap-4 md:grid-cols-2">
          <div className="rounded-[28px] p-8 md:p-10" style={{ background: C.roseSoft }}>
            <h2 className="text-[24px] font-bold tracking-[-0.04em] md:text-[30px]">준비 순서</h2>
            <ol className="mt-5 grid gap-2.5" style={{ color: C.sub }}>
              <li><b style={{ color: C.gold }}>3 ~ 6개월 전</b> 공간 투어, 날짜 확정</li>
              <li><b style={{ color: C.gold }}>2개월 전</b> 코스 메뉴 시식</li>
              <li><b style={{ color: C.gold }}>2주 전</b> 하객 수, 좌석 배치 확정</li>
              <li><b style={{ color: C.gold }}>당일</b> 예식 1시간 전 리허설</li>
            </ol>
          </div>
          <div className="flex flex-col justify-between rounded-[28px] p-8 text-white md:p-10" style={{ background: C.rose }}>
            <div>
              <h2 className="text-[24px] font-bold tracking-[-0.04em] md:text-[30px]">상담 신청</h2>
              <p className="mt-3 text-white/85">원하시는 달과 예상 하객 수를 알려 주시면 가능한 날짜와 공간을 안내해 드립니다.</p>
            </div>
            <p className="mt-8 text-[30px] font-bold tabular-nums tracking-[-0.02em]">02-000-0000</p>
          </div>
        </div>
      </section>

      <footer className="border-t px-5 py-10 text-[14px] md:px-8" style={{ borderColor: C.line, color: C.sub }}>
        <div className="mx-auto flex max-w-[1200px] flex-col gap-2 md:flex-row md:justify-between">
          <p>오늘식탁 웨딩, 서울특별시 서초구 일대. 사업자등록번호 000-00-00000</p>
          <p>02-000-0000</p>
        </div>
      </footer>
    </div>
  );
}
