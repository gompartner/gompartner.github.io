"use client";

import Image from "next/image";

// 식품 OEM 시안 A 소스, 가공식품 OEM형(11-22 사례 분석: 삼진푸드처럼 공장 사진과 B2B 영역 분리, 채움바이오처럼 "제작 소요 기간, 소량 생산" 강점 카드. 브랜드를 내려는 사장님은 어떤 포장으로 만들 수 있는지, 최소 몇 개부터인지, 샘플은 얼마나 걸리는지를 묻는다). 흰 바탕, 초록과 주황. 인물 없음. 메인 한 장, 기능 없음.
// 사진: Unsplash 무료 라이선스(public/images/drafts/fo/a-*)
const IMG = "/images/drafts/fo";
const C = { ink: "#15201a", sub: "#5c6a62", line: "#e1ebe5", soft: "#f2f7f4", green: "#1f6f46", orange: "#e0742a" };

const FORMS = [
  ["파우치", "소스, 드레싱, 국물 베이스", "3,000개"],
  ["유리병", "잼, 청, 장아찌", "2,000개"],
  ["스틱", "분말 차, 시즈닝", "10,000개"],
  ["레토르트", "카레, 덮밥 소스, 죽", "5,000개"],
];

export function FoA() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.75] md:text-[17px]" style={{ color: C.ink }}>
      <header className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur" style={{ borderColor: C.line }}>
        <div className="mx-auto flex h-[72px] max-w-[1320px] items-center justify-between px-5 md:px-10">
          <p className="text-[18px] font-bold tracking-[-0.02em]">
            (주)바른<span style={{ color: C.green }}>식품공방</span>
          </p>
          <nav aria-label="주 메뉴" className="hidden gap-9 text-[15px] font-semibold lg:flex" style={{ color: "#414c45" }}>
            {["제조 품목", "최소 수량", "생산 공정", "샘플 의뢰"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </nav>
          <span className="inline-flex h-11 items-center px-5 text-[15px] font-bold text-white" style={{ background: C.green }}>
            샘플 의뢰
          </span>
        </div>
      </header>

      <section className="px-5 pt-12 md:px-10 md:pt-20">
        <div className="mx-auto max-w-[1320px]">
          <div className="mt-4 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <h1 className="text-[38px] font-bold leading-[1.2] tracking-[-0.05em] md:text-[72px]">
              레시피만 가져오시면
              <br />
              제품으로 만듭니다
            </h1>
            <p className="max-w-[380px]" style={{ color: C.sub }}>
              HACCP 인증 공장에서 소스, 청, 분말, 레토르트를 위탁 생산합니다. 식품 표시사항과 품목제조보고까지 맡습니다.
            </p>
          </div>
          <div className="relative mt-10 aspect-[4/3] overflow-hidden md:aspect-[21/9]">
            <Image src={`${IMG}/a-hero.jpg`} alt="스테인리스 설비가 놓인 밝은 식품 생산 라인" fill priority sizes="100vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-[1320px]">
          <h2 className="text-[30px] font-bold tracking-[-0.04em] md:text-[44px]">포장 형태별 제조 품목</h2>
          <ul className="mt-10 grid gap-px sm:grid-cols-2 lg:grid-cols-4" style={{ background: C.line }}>
            {FORMS.map(([t, d, moq]) => (
              <li key={t} className="flex flex-col bg-white p-6 md:p-8">
                <h3 className="text-[23px] font-bold tracking-[-0.03em]">{t}</h3>
                <p className="mt-1 text-[15px]" style={{ color: C.sub }}>{d}</p>
                <p className="mt-6 border-t pt-3 text-[15px]" style={{ borderColor: C.line, color: C.sub }}>
                  최소 <b className="text-[18px] tabular-nums" style={{ color: C.green }}>{moq}</b>
                </p>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-[15px]" style={{ color: C.sub }}>최소 주문 수량은 맛 한 가지 기준입니다. 첫 생산은 절반 수량으로 시험 생산할 수 있습니다.</p>
        </div>
      </section>

      <section className="px-5 md:px-10" style={{ background: C.soft }}>
        <div className="mx-auto grid max-w-[1320px] items-center gap-10 py-20 md:grid-cols-2 md:gap-16 md:py-28">
          <div>
            <h2 className="text-[28px] font-bold leading-[1.35] tracking-[-0.04em] md:text-[38px]">생산 공정</h2>
            <ol className="mt-7 grid gap-4">
              {[
                ["원료 입고, 검사", "원산지, 이물, 미생물 검사"],
                ["배합과 가열", "레시피대로 계량, 살균 온도 기록"],
                ["충전과 밀봉", "파우치, 병, 스틱 자동 충전"],
                ["금속 검출, 포장", "전수 검사 뒤 박스 포장"],
                ["출하", "로트별 시험성적서 첨부"],
              ].map(([k, v], i) => (
                <li key={k} className="flex gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center text-[15px] font-bold text-white" style={{ background: C.green }}>{i + 1}</span>
                  <div>
                    <p className="text-[18px] font-bold">{k}</p>
                    <p className="text-[15px]" style={{ color: C.sub }}>{v}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="relative aspect-[3/4] overflow-hidden">
              <Image src={`${IMG}/a-jars.jpg`} alt="주황빛 소스와 잼이 담긴 유리병들" fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
            </div>
            <div className="relative aspect-[3/4] overflow-hidden">
              <Image src={`${IMG}/a-pipe.jpg`} alt="스테인리스 배관과 설비" fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto grid max-w-[1320px] gap-4 md:grid-cols-2">
          <div className="border p-8 md:p-10" style={{ borderColor: C.line }}>
            <h2 className="text-[24px] font-bold tracking-[-0.04em] md:text-[30px]">샘플 의뢰</h2>
            <ul className="mt-5 grid gap-2.5" style={{ color: C.sub }}>
              <li className="border-b pb-2.5" style={{ borderColor: C.line }}>레시피, 원하는 포장, 예상 판매가를 보내 주세요</li>
              <li className="border-b pb-2.5" style={{ borderColor: C.line }}>샘플 2회 수정까지 2 ~ 3주</li>
              <li>샘플 확정 뒤 첫 생산까지 3 ~ 4주</li>
            </ul>
          </div>
          <div className="flex flex-col justify-between gap-8 p-8 text-white md:p-10" style={{ background: C.green }}>
            <div>
              <h2 className="text-[24px] font-bold tracking-[-0.04em] md:text-[30px]">상담</h2>
              <p className="mt-3 text-white/80">레시피가 아직 없어도 됩니다. 원하는 맛과 판매처를 말씀해 주시면 연구원이 시제품부터 함께 만듭니다.</p>
            </div>
            <p className="text-[28px] font-bold tabular-nums">043-000-0000</p>
          </div>
        </div>
      </section>

      <footer className="border-t px-5 py-10 text-[14px] md:px-10" style={{ borderColor: C.line, color: C.sub }}>
        <div className="mx-auto flex max-w-[1320px] flex-col gap-2 md:flex-row md:justify-between">
          <p>(주)바른식품공방, 충청북도 음성군 일대. 식품제조가공업 영업등록번호 제000호, HACCP 지정</p>
          <p>043-000-0000</p>
        </div>
      </footer>
    </div>
  );
}
