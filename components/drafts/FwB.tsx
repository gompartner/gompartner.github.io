"use client";

import Image from "next/image";

// 가구 공방 시안 B 쇼룸 컬렉션형(11-22 사례 분석: DAAN의 시즌 셀렉션, 베스트 제품처럼 완성 가구를 치수, 가격과 함께 보여 준다. 기성품을 고르는 손님은 크기, 가격, 받기까지 기간, 쇼룸 위치를 묻는다). 흰 바탕, 연한 회색과 올리브. 인물 없음. 메인 한 장, 기능 없음.
// 사진: Unsplash 무료 라이선스(public/images/drafts/fw/b-*)
const IMG = "/images/drafts/fw";
const C = { ink: "#1a1b17", sub: "#666860", line: "#e6e7e2", soft: "#f4f4f1", olive: "#5d6b3a", oliveSoft: "#eef0e6" };

const ITEMS = [
  { f: "b-hero", alt: "밝은 바탕 위 원목 의자 한 개", t: "소반 체어", s: "W440 x D480 x H780", w: "오크와 월넛", p: "38만 원부터" },
  { f: "b-table", alt: "검은 다리를 단 원목 콘솔 테이블", t: "결 콘솔", s: "W1200 x D350 x H760", w: "월넛과 레진 라인", p: "96만 원부터" },
  { f: "b-burl", alt: "옹이 무늬가 드러난 원목 단면", t: "옹이 사이드 테이블", s: "W450 x D450 x H520", w: "메이플 버얼", p: "54만 원부터" },
];

export function FwB() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.75] md:text-[17px]" style={{ color: C.ink }}>
      <header className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur" style={{ borderColor: C.line }}>
        <div className="mx-auto flex h-[70px] max-w-[1200px] items-center justify-between px-5 md:px-8">
          <p className="text-[20px] font-bold tracking-[-0.03em]">
            결 <span style={{ color: C.olive }}>목공소</span>
          </p>
          <nav aria-label="주 메뉴" className="hidden gap-9 text-[15px] font-semibold lg:flex" style={{ color: "#45473f" }}>
            {["컬렉션", "주문 기간", "관리", "쇼룸"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </nav>
          <span className="inline-flex h-11 items-center rounded-full px-5 text-[15px] font-bold text-white" style={{ background: C.olive }}>
            쇼룸 방문
          </span>
        </div>
      </header>

      <section className="px-5 pb-16 pt-10 md:px-8 md:pb-24 md:pt-14">
        <div className="mx-auto grid max-w-[1200px] items-center gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-14">
          <div>
            <p className="inline-flex rounded-full px-3 py-1 text-[14px] font-bold" style={{ background: C.oliveSoft, color: C.olive }}>2026 겨울 컬렉션</p>
            <h1 className="mt-5 text-[36px] font-bold leading-[1.24] tracking-[-0.045em] md:text-[56px]">
              오래 앉아도
              <br />
              편한 의자부터
            </h1>
            <p className="mt-5 max-w-[460px] text-[17px] md:text-[18px]" style={{ color: C.sub }}>
              의자, 콘솔, 사이드 테이블 세 가지를 이번 시즌에 만듭니다. 쇼룸에서 앉아 보고 고르실 수 있습니다.
            </p>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[28px]">
            <Image src={`${IMG}/b-hero.jpg`} alt="밝은 바탕 위 원목 의자 한 개" fill priority sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28" style={{ background: C.soft }}>
        <div className="mx-auto max-w-[1200px]">
          <h2 className="text-[30px] font-bold tracking-[-0.04em] md:text-[44px]">컬렉션</h2>
          <ul className="mt-10 grid gap-4 md:grid-cols-3">
            {ITEMS.map((x) => (
              <li key={x.t} className="overflow-hidden rounded-[24px] bg-white">
                <div className="relative aspect-[4/3]">
                  <Image src={`${IMG}/${x.f}.jpg`} alt={x.alt} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" />
                </div>
                <div className="p-6 md:p-7">
                  <h3 className="text-[21px] font-bold tracking-[-0.03em]">{x.t}</h3>
                  <dl className="mt-3 grid gap-1 text-[15px]">
                    <div className="flex gap-3"><dt className="w-10 shrink-0" style={{ color: C.sub }}>크기</dt><dd className="tabular-nums">{x.s}</dd></div>
                    <div className="flex gap-3"><dt className="w-10 shrink-0" style={{ color: C.sub }}>수종</dt><dd>{x.w}</dd></div>
                  </dl>
                  <p className="mt-4 border-t pt-3 font-bold" style={{ borderColor: C.line, color: C.olive }}>{x.p}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto grid max-w-[1200px] gap-4 md:grid-cols-2">
          <div className="rounded-[28px] border p-8 md:p-10" style={{ borderColor: C.line }}>
            <h2 className="text-[24px] font-bold tracking-[-0.04em] md:text-[30px]">주문 기간</h2>
            <dl className="mt-5">
              {[
                ["쇼룸 재고", "1주 안에 배송"],
                ["주문 제작", "3 ~ 4주"],
                ["크기 변경", "가로, 높이 10cm 안, 4 ~ 5주"],
              ].map(([k, v]) => (
                <div key={k} className="grid grid-cols-[100px_1fr] gap-3 border-b py-3 last:border-b-0" style={{ borderColor: C.line }}>
                  <dt className="font-bold">{k}</dt>
                  <dd style={{ color: C.sub }}>{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="rounded-[28px] p-8 md:p-10" style={{ background: C.oliveSoft }}>
            <h2 className="text-[24px] font-bold tracking-[-0.04em] md:text-[30px]">관리</h2>
            <ul className="mt-5 grid gap-2.5" style={{ color: C.sub }}>
              <li>물기는 바로 마른 천으로 닦아 주세요</li>
              <li>6개월에 한 번 동봉한 오일로 얇게 바릅니다</li>
              <li>찍힘, 긁힘은 1년 안에 무료로 손봐 드립니다</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="px-5 pb-20 md:px-8 md:pb-28">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-6 rounded-[28px] p-8 text-white md:flex-row md:items-center md:justify-between md:p-12" style={{ background: C.olive }}>
          <div>
            <h2 className="text-[26px] font-bold tracking-[-0.04em] md:text-[34px]">쇼룸</h2>
            <p className="mt-2 text-white/80">목 ~ 일 12:00 ~ 19:00. 성수동 공방 1층이 쇼룸, 2층이 작업실입니다.</p>
          </div>
          <p className="shrink-0 text-[28px] font-bold tabular-nums">02-000-0000</p>
        </div>
      </section>

      <footer className="border-t px-5 py-10 text-[14px] md:px-8" style={{ borderColor: C.line, color: C.sub }}>
        <div className="mx-auto flex max-w-[1200px] flex-col gap-2 md:flex-row md:justify-between">
          <p>결 목공소, 서울특별시 성동구 성수동 일대. 사업자등록번호 000-00-00000</p>
          <p>02-000-0000</p>
        </div>
      </footer>
    </div>
  );
}
