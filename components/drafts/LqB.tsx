"use client";

import Image from "next/image";

// 주류 가게 시안 B 전통주 보틀샵형(11-22 사례 분석: 금군양조, 오늘 쌀소주처럼 전통주는 양조장과 원료 이야기, 제품 정보 중심. 전통주 손님은 종류(탁주, 약주, 증류주, 과실주), 도수, 어느 양조장인지, 명절 선물 세트를 묻는다. 청소년 판매 금지와 과음 경고 문구). 흰 바탕, 청자색과 먹색. 인물 없음. 메인 한 장, 기능 없음.
// 사진: Unsplash 무료 라이선스(public/images/drafts/lq/b-*)
const IMG = "/images/drafts/lq";
const C = { ink: "#161a19", sub: "#5f6766", line: "#e2e9e7", soft: "#f2f6f5", celadon: "#3f7d73", celadonSoft: "#e1efec" };

const KINDS = [
  ["탁주", "막걸리", "6 ~ 12도", "포천, 양평, 해남 양조장 생막걸리"],
  ["약주와 청주", "맑은 술", "13 ~ 16도", "누룩 향, 찬 음식과"],
  ["증류식 소주", "증류주", "25 ~ 45도", "쌀, 보리를 상압, 감압 증류"],
  ["과실주", "과실주", "8 ~ 14도", "오미자, 복분자, 사과"],
];

export function LqB() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.75] md:text-[17px]" style={{ color: C.ink }}>
      <header className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur" style={{ borderColor: C.line }}>
        <div className="mx-auto flex h-[70px] max-w-[1200px] items-center justify-between px-5 md:px-8">
          <p className="text-[20px] font-bold tracking-[-0.03em]">
            <span style={{ color: C.celadon }}>술익는</span> 상점
          </p>
          <nav aria-label="주 메뉴" className="hidden gap-9 text-[15px] font-semibold lg:flex" style={{ color: "#414846" }}>
            {["종류", "양조장", "선물 세트", "매장"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </nav>
          <span className="inline-flex h-11 items-center rounded-full px-5 text-[15px] font-bold text-white" style={{ background: C.celadon }}>
            선물 문의
          </span>
        </div>
      </header>

      <section className="px-5 pb-16 pt-10 md:px-8 md:pb-24 md:pt-14">
        <div className="mx-auto grid max-w-[1200px] items-center gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-14">
          <div>
            <p className="text-[15px] font-bold" style={{ color: C.celadon }}>전국 양조장 48곳</p>
            <h1 className="mt-4 text-[36px] font-bold leading-[1.24] tracking-[-0.045em] md:text-[56px]">
              동네마다 다른
              <br />
              우리 술을 모았습니다
            </h1>
            <p className="mt-5 max-w-[460px] text-[17px] md:text-[18px]" style={{ color: C.sub }}>
              막걸리부터 증류식 소주까지 220여 종. 병마다 양조장과 원료, 마시기 좋은 온도를 붙여 두었습니다.
            </p>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[28px]">
            <Image src={`${IMG}/b-hero.jpg`} alt="청자색 도자기 병들이 빼곡히 놓인 모습" fill priority sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28" style={{ background: C.soft }}>
        <div className="mx-auto max-w-[1200px]">
          <h2 className="text-[30px] font-bold tracking-[-0.04em] md:text-[44px]">종류</h2>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2">
            {KINDS.map(([t, k, abv, d]) => (
              <li key={t} className="rounded-[24px] bg-white p-7 md:p-8">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-[23px] font-bold tracking-[-0.03em]">{t}</h3>
                  <span className="rounded-full px-3 py-0.5 text-[14px] font-bold tabular-nums" style={{ background: C.celadonSoft, color: C.celadon }}>{abv}</span>
                </div>
                <p className="mt-1 text-[15px] font-semibold">{k}</p>
                <p className="mt-2 text-[15px]" style={{ color: C.sub }}>{d}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto grid max-w-[1200px] items-center gap-10 md:grid-cols-[1.1fr_1fr] md:gap-16">
          <div className="grid grid-cols-2 gap-3">
            <div className="relative aspect-[3/4] overflow-hidden rounded-[22px]">
              <Image src={`${IMG}/b-bottle.jpg`} alt="어두운 벽 앞 회색 도자기 술병" fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
            </div>
            <div className="relative aspect-[3/4] overflow-hidden rounded-[22px]">
              <Image src={`${IMG}/b-bowl.jpg`} alt="흰 바탕 위 미색 사발" fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
            </div>
          </div>
          <div>
            <h2 className="text-[28px] font-bold leading-[1.35] tracking-[-0.04em] md:text-[38px]">명절 선물 세트</h2>
            <dl className="mt-7">
              {[
                ["막걸리 3종", "냉장 배송 불가, 매장 수령"],
                ["약주, 청주 2병", "오동나무 상자"],
                ["증류주 2병", "도자기 병, 보자기 포장"],
              ].map(([k, v]) => (
                <div key={k} className="grid grid-cols-[120px_1fr] gap-3 border-b py-3" style={{ borderColor: C.line }}>
                  <dt className="font-bold">{k}</dt>
                  <dd style={{ color: C.sub }}>{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-[15px]" style={{ color: C.sub }}>10세트 이상 회사 선물은 2주 전까지 받습니다.</p>
          </div>
        </div>
      </section>

      <section className="px-5 pb-20 md:px-8 md:pb-28">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-6 rounded-[28px] p-8 text-white md:flex-row md:items-center md:justify-between md:p-12" style={{ background: C.celadon }}>
          <div>
            <h2 className="text-[26px] font-bold tracking-[-0.04em] md:text-[34px]">매장</h2>
            <p className="mt-2 text-white/85">화 ~ 일 11:00 ~ 21:00. 익선동 골목 안 한옥 1층, 주말에는 양조장 시음 행사가 열립니다.</p>
          </div>
          <p className="shrink-0 text-[28px] font-bold tabular-nums">02-000-0000</p>
        </div>
      </section>

      <footer className="border-t px-5 py-10 text-[14px] md:px-8" style={{ borderColor: C.line, color: C.sub }}>
        <div className="mx-auto flex max-w-[1200px] flex-col gap-2">
          <div className="flex flex-col gap-2 md:flex-row md:justify-between">
            <p>술익는 상점, 서울특별시 종로구 익선동 일대. 주류소매업 신고번호 000</p>
            <p>02-000-0000</p>
          </div>
          <p>19세 미만 청소년에게는 주류를 판매하지 않습니다. 지나친 음주는 건강을 해칩니다.</p>
        </div>
      </footer>
    </div>
  );
}
