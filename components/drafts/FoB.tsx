"use client";

import Image from "next/image";

// 식품 OEM 시안 B 건강기능식품 ODM형(11-22 사례 분석: 채움바이오처럼 "정제, 분말, 스틱포" 제형과 원스톱(R&D, 제조, 디자인), 제작 소요 기간 카드. 건강식품 브랜드 준비자는 어떤 제형이 되는지, 개별인정형 원료를 쓸 수 있는지, 표시, 광고 심의까지 도와주는지 묻는다). 흰 바탕, 보라와 남색. 인물 없음. 메인 한 장, 기능 없음.
// 사진: Unsplash 무료 라이선스(public/images/drafts/fo/b-*)
const IMG = "/images/drafts/fo";
const C = { ink: "#141629", sub: "#5f6276", line: "#e5e6ef", soft: "#f4f4f9", violet: "#4c3bb4", violetSoft: "#ecebfa" };

const FORMS = [
  ["정제", "1일 2 ~ 4정, 코팅 가능"],
  ["경질 캡슐", "분말 원료 그대로"],
  ["연질 캡슐", "오메가3, 루테인 같은 오일"],
  ["분말 스틱", "물에 타 먹는 3g 스틱포"],
  ["액상 파우치", "20mL 젤리, 액상"],
  ["환", "홍삼, 한방 원료"],
];

const STEPS = [
  ["기획", "1주", "기능성, 원료, 제형, 목표 단가"],
  ["처방 개발", "3 ~ 4주", "배합비 설계, 시제품 2회"],
  ["안정성, 표시", "2주", "표시사항 작성, 기능성 문구 검토"],
  ["생산", "3 ~ 4주", "GMP 라인 생산, 품질검사"],
];

export function FoB() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.75] md:text-[17px]" style={{ color: C.ink }}>
      <header className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur" style={{ borderColor: C.line }}>
        <div className="mx-auto flex h-[70px] max-w-[1200px] items-center justify-between px-5 md:px-8">
          <p className="text-[19px] font-bold tracking-[0.04em]">
            NUTRI<span style={{ color: C.violet }}>FORM</span>
          </p>
          <nav aria-label="주 메뉴" className="hidden gap-9 text-[15px] font-semibold lg:flex" style={{ color: "#454860" }}>
            {["제형", "개발 순서", "품질", "상담"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </nav>
          <span className="inline-flex h-11 items-center rounded-full px-5 text-[15px] font-bold text-white" style={{ background: C.violet }}>
            개발 상담
          </span>
        </div>
      </header>

      <section className="px-5 pb-16 pt-10 md:px-8 md:pb-24 md:pt-14">
        <div className="mx-auto grid max-w-[1200px] items-center gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-14">
          <div>
            <p className="inline-flex rounded-full px-3 py-1 text-[14px] font-bold" style={{ background: C.violetSoft, color: C.violet }}>건강기능식품 GMP</p>
            <h1 className="mt-5 text-[36px] font-bold leading-[1.24] tracking-[-0.045em] md:text-[56px]">
              원료 선택부터
              <br />
              표시사항까지 함께
            </h1>
            <p className="mt-5 max-w-[460px] text-[17px] md:text-[18px]" style={{ color: C.sub }}>
              기능성 원료와 제형을 고르고, 배합을 설계해 GMP 라인에서 생산합니다. 첫 생산은 1만 정부터 가능합니다.
            </p>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[28px]">
            <Image src={`${IMG}/b-hero.jpg`} alt="계량 스쿱에서 쏟아진 미색 분말" fill priority sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28" style={{ background: C.soft }}>
        <div className="mx-auto max-w-[1200px]">
          <h2 className="text-[30px] font-bold tracking-[-0.04em] md:text-[44px]">제형</h2>
          <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {FORMS.map(([t, d]) => (
              <li key={t} className="rounded-[20px] bg-white p-6">
                <h3 className="text-[21px] font-bold tracking-[-0.03em]">{t}</h3>
                <p className="mt-1 text-[15px]" style={{ color: C.sub }}>{d}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-[1200px]">
          <h2 className="text-[30px] font-bold tracking-[-0.04em] md:text-[44px]">개발 순서</h2>
          <p className="mt-3" style={{ color: C.sub }}>기획부터 첫 출고까지 보통 10 ~ 12주가 걸립니다.</p>
          <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(([t, w, d], i) => (
              <li key={t} className="rounded-[22px] border p-6" style={{ borderColor: C.line }}>
                <p className="text-[14px] font-bold tabular-nums" style={{ color: C.violet }}>STEP {i + 1}, {w}</p>
                <h3 className="mt-2 text-[21px] font-bold tracking-[-0.03em]">{t}</h3>
                <p className="mt-1 text-[15px]" style={{ color: C.sub }}>{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="px-5 pb-20 md:px-8 md:pb-28">
        <div className="mx-auto grid max-w-[1200px] gap-4 md:grid-cols-[1.1fr_1fr]">
          <div className="grid grid-cols-2 gap-3">
            <div className="relative aspect-[3/4] overflow-hidden rounded-[22px]">
              <Image src={`${IMG}/b-jar.jpg`} alt="흰 바탕 위 붉은 연질 캡슐이 든 투명 병" fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
            </div>
            <div className="relative aspect-[3/4] overflow-hidden rounded-[22px]">
              <Image src={`${IMG}/b-pills.jpg`} alt="초록 바탕 위 쏟아진 흰 정제" fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
            </div>
          </div>
          <div className="flex flex-col justify-between rounded-[28px] p-8 text-white md:p-10" style={{ background: C.violet }}>
            <div>
              <h2 className="text-[24px] font-bold tracking-[-0.04em] md:text-[30px]">개발 상담</h2>
              <p className="mt-3 text-white/85">원하는 기능성과 목표 판매가, 판매 채널을 알려 주세요. 맞는 원료와 제형, 예상 단가를 일주일 안에 제안합니다.</p>
            </div>
            <p className="mt-8 text-[30px] font-bold tabular-nums tracking-[-0.02em]">031-000-0000</p>
          </div>
        </div>
      </section>

      <footer className="border-t px-5 py-10 text-[14px] md:px-8" style={{ borderColor: C.line, color: C.sub }}>
        <div className="mx-auto flex max-w-[1200px] flex-col gap-2 md:flex-row md:justify-between">
          <p>(주)뉴트리폼, 경기도 화성시 일대. 건강기능식품전문제조업 영업등록번호 제000호, GMP 적용</p>
          <p>031-000-0000</p>
        </div>
      </footer>
    </div>
  );
}
