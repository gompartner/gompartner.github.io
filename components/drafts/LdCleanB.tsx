"use client";

import Image from "next/image";

// 입주청소 견적 랜딩 시안 B 가격표 우선형(11-22. 시안 A는 기존 견적 계산기 랜딩. 청소요정처럼 머리글에 전화번호와 청소 종류, 숨고 청소 업체 글처럼 평형별 가격과 추가 요금 조건을 첫 화면 바로 아래 표로. 계산기 대신 표 한 장). 흰 바탕, 민트와 검정. 인물 없음. 메인 한 장, 신청 폼은 모양만.
// 사진: Unsplash 무료 라이선스(public/images/drafts/ld/clean-*)
const IMG = "/images/drafts/ld";
const C = { ink: "#101816", sub: "#5c6865", line: "#e1ebe8", soft: "#f1f7f5", mint: "#12a37f" };

const PRICE = [
  ["20평대", "38만 원", "2명, 5시간"],
  ["30평대", "52만 원", "3명, 5시간"],
  ["40평대", "68만 원", "3명, 6시간"],
  ["50평대 이상", "평당 1.4만 원", "4명부터"],
];

const EXTRA = [
  ["베란다 확장 안 된 집", "+3만 원"],
  ["새집증후군 케어", "평당 3천 원"],
  ["욕실 곰팡이 제거", "+5만 원"],
  ["붙박이장, 냉장고장 안쪽", "+3만 원"],
];

export function LdCleanB() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.75] md:text-[17px]" style={{ color: C.ink }}>
      <header className="border-b" style={{ borderColor: C.line }}>
        <div className="mx-auto flex h-16 max-w-[1120px] items-center justify-between px-5 md:px-8">
          <p className="text-[18px] font-bold tracking-[-0.03em]">맑은집 <span style={{ color: C.mint }}>입주청소</span></p>
          <span className="text-[15px] font-bold tabular-nums">031-000-0000</span>
        </div>
      </header>
      <section className="relative flex min-h-[560px] items-end overflow-hidden bg-[#dfe6e4] md:h-[80svh]">
        <Image src={`${IMG}/clean-hero.jpg`} alt="창으로 빛이 드는 텅 빈 흰 방" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent" aria-hidden />
        <div className="relative mx-auto w-full max-w-[1120px] px-5 pb-12 md:px-8 md:pb-16">
          <ul className="flex flex-wrap gap-2 text-[14px] font-bold">
            {["입주청소", "이사청소", "거주청소"].map((t) => (
              <li key={t} className="rounded-full bg-white px-3 py-1" style={{ color: C.mint }}>{t}</li>
            ))}
          </ul>
          <h1 className="mt-3 text-[38px] font-bold leading-[1.22] tracking-[-0.045em] md:text-[64px]">
            30평대 52만 원,
            <br />
            현장 추가 요금 없이
          </h1>
        </div>
      </section>

      <section className="px-5 py-16 md:px-8 md:py-24">
        <div className="mx-auto grid max-w-[1120px] gap-10 md:grid-cols-2 md:gap-14">
          <div>
            <h2 className="text-[26px] font-bold tracking-[-0.04em] md:text-[34px]">평형별 가격</h2>
            <dl className="mt-6 border-t-2" style={{ borderColor: C.ink }}>
              {PRICE.map(([k, p, n]) => (
                <div key={k} className="grid grid-cols-[1fr_auto] gap-x-4 border-b py-4" style={{ borderColor: C.line }}>
                  <dt className="font-bold">{k}</dt>
                  <dd className="text-right text-[19px] font-bold tabular-nums" style={{ color: C.mint }}>{p}</dd>
                  <dd className="col-span-2 text-[15px]" style={{ color: C.sub }}>{n}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div>
            <h2 className="text-[26px] font-bold tracking-[-0.04em] md:text-[34px]">추가 요금이 붙는 경우</h2>
            <dl className="mt-6 border-t-2" style={{ borderColor: C.ink }}>
              {EXTRA.map(([k, p]) => (
                <div key={k} className="grid grid-cols-[1fr_auto] gap-x-4 border-b py-4" style={{ borderColor: C.line }}>
                  <dt>{k}</dt>
                  <dd className="text-right font-bold tabular-nums">{p}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-[15px]" style={{ color: C.sub }}>여기 없는 금액은 현장에서 받지 않습니다.</p>
          </div>
        </div>
      </section>

      <section className="px-5 py-16 md:px-8 md:py-24" style={{ background: C.soft }}>
        <div className="mx-auto grid max-w-[1120px] items-center gap-10 md:grid-cols-[1.1fr_1fr] md:gap-14">
          <div className="grid grid-cols-2 gap-3">
            <div className="relative aspect-[3/4] overflow-hidden rounded-[18px]">
              <Image src={`${IMG}/clean-spray.jpg`} alt="레몬 옆 세정제 분무기" fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
            </div>
            <div className="relative aspect-[3/4] overflow-hidden rounded-[18px]">
              <Image src={`${IMG}/clean-room.jpg`} alt="나무 바닥이 깔린 빈 거실" fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
            </div>
          </div>
          <div>
            <h2 className="text-[26px] font-bold tracking-[-0.04em] md:text-[34px]">끝난 뒤에도</h2>
            <ul className="mt-6 grid gap-3">
              {["청소 전후를 같은 자리에서 사진으로 보내 드립니다", "고객님과 방마다 같이 둘러보고 그 자리에서 다시 닦습니다", "3일 안에 빠진 곳을 알려 주시면 재방문, 비용 없음"].map((x) => (
                <li key={x} className="border-b pb-3" style={{ borderColor: C.line }}>{x}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-[1120px] rounded-[24px] bg-black p-8 text-white md:p-12">
          <h2 className="text-[26px] font-bold tracking-[-0.04em] md:text-[34px]">날짜 잡기</h2>
          <div className="mt-6 grid gap-3 md:grid-cols-4">
            {["입주 날짜", "평수", "주소(동까지)", "연락처"].map((f) => (
              <div key={f} className="rounded-xl bg-white/10 px-4 py-3 text-[15px] text-white/75">{f}</div>
            ))}
          </div>
          <button type="button" className="mt-5 h-14 w-full rounded-xl text-[17px] font-bold text-white md:w-auto md:px-10" style={{ background: C.mint }}>
            가능한 날짜 받기
          </button>
        </div>
      </section>

      <footer className="border-t px-5 py-10 text-[14px] md:px-8" style={{ borderColor: C.line, color: C.sub }}>
        <div className="mx-auto max-w-[1120px]">맑은집 입주청소, 경기도 화성시 동탄 일대. 사업자등록번호 000-00-00000, 031-000-0000</div>
      </footer>
    </div>
  );
}
