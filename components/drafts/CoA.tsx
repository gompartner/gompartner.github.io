"use client";

import Image from "next/image";

// 정밀가공 제조업 시안 A 가공 사양형(11-22 리뉴얼. 기존 샘플의 설비현황, 가공 사양 표, 도면 첨부 견적, 한영 전환 틀을 따른다. 사례 분석: 금강엠앤에스처럼 검정과 파랑, 메트로게이트처럼 사양 비교표. 구매 담당자는 보유 설비, 가공 크기와 공차, 소재, 납기, 도면 보내는 법을 묻는다). 흰 바탕, 검정과 파랑. 인물 없음. 메인 한 장, 기능 없음.
// 사진: Unsplash 무료 라이선스(public/images/drafts/co/a-*)
const IMG = "/images/drafts/co";
const C = { ink: "#10141c", sub: "#5c6370", line: "#e2e6ec", soft: "#f2f4f7", blue: "#1f56c9" };

const EQUIP = [
  ["5축 머시닝센터", "2대", "X 650 / Y 520 / Z 475mm"],
  ["대형 수직 머시닝센터", "6대", "X 1,300 / Y 650 / Z 600mm"],
  ["CNC 선반", "8대", "최대 지름 320mm, 길이 600mm"],
  ["와이어 방전가공기", "6대", "두께 300mm까지"],
  ["3차원 측정기", "2대", "측정 범위 700 x 1,000 x 600mm"],
];

export function CoA() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.75] md:text-[17px]" style={{ color: C.ink }}>
      <header className="absolute inset-x-0 z-20 text-white">
        <div className="mx-auto flex h-[78px] max-w-[1320px] items-center justify-between px-5 md:px-10">
          <p className="text-[18px] font-bold tracking-[0.04em]">
            (주)대성<span style={{ color: "#7fa5ff" }}>정밀</span>
          </p>
          <nav aria-label="주 메뉴" className="hidden gap-10 text-[15px] font-medium text-white/85 lg:flex">
            {["회사소개", "설비현황", "가공 사양", "견적문의"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </nav>
          <span className="inline-flex h-10 items-center gap-3 text-[14px] font-bold">
            <span className="text-white">KOR</span>
            <span className="text-white/50">ENG</span>
          </span>
        </div>
      </header>

      <section className="relative flex min-h-[600px] items-end overflow-hidden bg-black text-white md:h-[90svh]">
        <Image src={`${IMG}/a-hero.jpg`} alt="절삭유를 뿌리며 알루미늄을 깎는 머시닝센터" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/40" aria-hidden />
        <div className="relative mx-auto w-full max-w-[1320px] px-5 pb-16 md:px-10 md:pb-24">
          <h1 className="text-[40px] font-bold leading-[1.2] tracking-[-0.045em] md:text-[72px]">
            공차 ±0.005mm,
            <br />
            시제품 1개부터
          </h1>
          <p className="mt-6 max-w-[540px] text-white/75">반도체 장비, 의료기기, 로봇 부품을 가공합니다. 도면을 받은 날 가공 가능 여부와 납기를 회신합니다.</p>
        </div>
      </section>

      <section className="px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-[1320px]">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="text-[32px] font-bold tracking-[-0.04em] md:text-[46px]">설비현황</h2>
            <p style={{ color: C.sub }}>가공기 22대, 측정기 5대</p>
          </div>
          <ul className="mt-10 border-t" style={{ borderColor: C.ink }}>
            {EQUIP.map(([t, n, r]) => (
              <li key={t} className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 border-b py-5 md:grid-cols-[1.2fr_0.4fr_1.6fr] md:items-center" style={{ borderColor: C.line }}>
                <span className="text-[18px] font-bold">{t}</span>
                <span className="text-right font-bold tabular-nums md:text-left" style={{ color: C.blue }}>{n}</span>
                <span className="col-span-2 tabular-nums md:col-span-1" style={{ color: C.sub }}>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-5 md:px-10" style={{ background: C.soft }}>
        <div className="mx-auto grid max-w-[1320px] items-center gap-10 py-20 md:grid-cols-2 md:gap-16 md:py-28">
          <div className="grid grid-cols-2 gap-3">
            <div className="relative aspect-[3/4] overflow-hidden">
              <Image src={`${IMG}/a-drawing.jpg`} alt="도면 위에 놓인 가공 부품" fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
            </div>
            <div className="relative aspect-[3/4] overflow-hidden">
              <Image src={`${IMG}/a-part.jpg`} alt="회색 바탕 위 알루미늄 브래킷 부품" fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
            </div>
          </div>
          <div>
            <h2 className="text-[28px] font-bold leading-[1.35] tracking-[-0.04em] md:text-[38px]">가공 사양</h2>
            <dl className="mt-7 border-t" style={{ borderColor: C.ink }}>
              {[
                ["소재", "AL6061, AL7075, SUS304, SUS316, SKD11, 엔지니어링 플라스틱"],
                ["공차", "일반 ±0.01mm, 정밀 ±0.005mm"],
                ["표면", "아노다이징, 무전해 니켈, 연마"],
                ["수량", "시제품 1개 ~ 양산 로트당 500개"],
                ["검사", "3차원 측정 성적서 첨부"],
              ].map(([k, v]) => (
                <div key={k} className="grid grid-cols-[64px_1fr] gap-3 border-b py-4" style={{ borderColor: "#dadfe6" }}>
                  <dt className="font-bold">{k}</dt>
                  <dd style={{ color: C.sub }}>{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-[15px]" style={{ color: C.sub }}>가공 사례는 고객사 보안을 위해 형상을 공개하지 않습니다.</p>
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto grid max-w-[1320px] gap-4 md:grid-cols-2">
          <div className="border p-8 md:p-10" style={{ borderColor: C.line }}>
            <h2 className="text-[24px] font-bold tracking-[-0.04em] md:text-[30px]">도면으로 견적받기</h2>
            <ol className="mt-5 grid gap-2.5" style={{ color: C.sub }}>
              <li>1. 도면(DWG, STEP, PDF)과 수량을 메일로 보내 주세요</li>
              <li>2. 당일 가공 가능 여부, 2일 안에 견적서 회신</li>
              <li>3. 발주 확인 뒤 시제품 7일, 양산 일정 협의</li>
            </ol>
          </div>
          <div className="flex flex-col justify-between gap-8 p-8 text-white md:p-10" style={{ background: C.ink }}>
            <div>
              <h2 className="text-[24px] font-bold tracking-[-0.04em] md:text-[30px]">견적문의</h2>
              <p className="mt-3 text-white/70">영업팀 평일 08:30 ~ 17:30. 화성 정밀산업단지, ISO 9001 인증.</p>
            </div>
            <p className="text-[28px] font-bold tabular-nums" style={{ color: "#7fa5ff" }}>031-000-0000</p>
          </div>
        </div>
      </section>

      <footer className="border-t px-5 py-10 text-[14px] md:px-10" style={{ borderColor: C.line, color: C.sub }}>
        <div className="mx-auto flex max-w-[1320px] flex-col gap-2 md:flex-row md:justify-between">
          <p>(주)대성정밀, 경기도 화성시 일대. 사업자등록번호 000-00-00000</p>
          <p>031-000-0000</p>
        </div>
      </footer>
    </div>
  );
}
