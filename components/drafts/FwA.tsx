"use client";

import Image from "next/image";

// 가구 공방 시안 A 맞춤 제작형(11-22 사례 분석: DAAN처럼 여백, 원목 결 사진, 맞춤 제작 요청 메뉴를 둔다. 맞춤 가구 손님은 어떤 나무가 있는지, 얼마나 걸리는지, 치수를 어떻게 정하는지 묻는다). 흰 바탕, 검정과 월넛 갈색. 인물 없음. 메인 한 장, 기능 없음.
// 사진: Unsplash 무료 라이선스(public/images/drafts/fw/a-*)
const IMG = "/images/drafts/fw";
const C = { ink: "#171411", sub: "#68625b", line: "#e9e5df", soft: "#f5f3f0", walnut: "#6b4428" };

const WOODS = [
  ["월넛", "#5a3a24", "짙은 갈색, 결이 부드럽습니다"],
  ["화이트 오크", "#c9a777", "곧은 결, 단단해 식탁에 많이 씁니다"],
  ["체리", "#a8613d", "쓸수록 붉게 짙어집니다"],
  ["메이플", "#e3cfa6", "밝고 결이 고와 아이 방 가구에"],
];

export function FwA() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.75] md:text-[17px]" style={{ color: C.ink }}>
      <header className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur" style={{ borderColor: C.line }}>
        <div className="mx-auto flex h-[72px] max-w-[1320px] items-center justify-between px-5 md:px-10">
          <p className="text-[19px] font-bold tracking-[0.1em]">NAMU WORKS</p>
          <nav aria-label="주 메뉴" className="hidden gap-9 text-[15px] font-semibold lg:flex" style={{ color: "#4a4540" }}>
            {["수종", "제작 순서", "작업실", "맞춤 문의"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </nav>
          <span className="inline-flex h-11 items-center px-5 text-[15px] font-bold text-white" style={{ background: C.ink }}>
            맞춤 문의
          </span>
        </div>
      </header>

      <section className="px-5 pt-12 md:px-10 md:pt-20">
        <div className="mx-auto grid max-w-[1320px] gap-10 md:grid-cols-[1fr_1.4fr] md:items-end">
          <div className="pb-2">
            <h1 className="text-[38px] font-bold leading-[1.2] tracking-[-0.05em] md:text-[64px]">
              집 치수에 맞춰
              <br />
              한 점씩 짭니다
            </h1>
            <p className="mt-6 max-w-[380px]" style={{ color: C.sub }}>
              식탁, 책장, 수납장을 원목으로 만듭니다. 상판은 통판 대신 결을 맞춰 집성해 휘지 않게 합니다.
            </p>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden">
            <Image src={`${IMG}/a-hero.jpg`} alt="월넛 원목 테이블 위 마른 꽃 화병" fill priority sizes="(min-width: 768px) 58vw, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-[1320px]">
          <h2 className="text-[30px] font-bold tracking-[-0.04em] md:text-[44px]">수종</h2>
          <ul className="mt-10 grid gap-px sm:grid-cols-2 lg:grid-cols-4" style={{ background: C.line }}>
            {WOODS.map(([t, color, d]) => (
              <li key={t} className="bg-white p-6 md:p-8">
                <span className="block h-3 w-full" style={{ background: color }} aria-hidden />
                <h3 className="mt-5 text-[22px] font-bold tracking-[-0.03em]">{t}</h3>
                <p className="mt-1 text-[15px]" style={{ color: C.sub }}>{d}</p>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-[15px]" style={{ color: C.sub }}>모든 가구는 천연 오일로 마감합니다. 북미산 FAS 등급 목재를 씁니다.</p>
        </div>
      </section>

      <section className="px-5 md:px-10" style={{ background: C.soft }}>
        <div className="mx-auto grid max-w-[1320px] items-center gap-10 py-20 md:grid-cols-2 md:gap-16 md:py-28">
          <div>
            <h2 className="text-[28px] font-bold leading-[1.35] tracking-[-0.04em] md:text-[38px]">제작 순서</h2>
            <p className="mt-3" style={{ color: C.sub }}>상담부터 설치까지 보통 4 ~ 6주가 걸립니다.</p>
            <ol className="mt-7 grid gap-4">
              {[
                ["상담", "놓을 자리 사진과 치수, 쓰는 사람 수"],
                ["도면", "평면도, 측면도, 수종 견본 확인"],
                ["재단과 집성", "결을 맞춰 상판을 붙입니다"],
                ["가공과 마감", "짜맞춤, 샌딩, 오일 3회"],
                ["배송과 설치", "직접 싣고 가서 수평을 맞춥니다"],
              ].map(([k, v], i) => (
                <li key={k} className="flex gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center text-[15px] font-bold text-white" style={{ background: C.walnut }}>{i + 1}</span>
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
              <Image src={`${IMG}/a-tools.jpg`} alt="벽에 걸린 대패와 끌" fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
            </div>
            <div className="relative aspect-[3/4] overflow-hidden">
              <Image src={`${IMG}/a-rings.jpg`} alt="통나무 단면의 나이테" fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto grid max-w-[1320px] gap-4 md:grid-cols-2">
          <div className="border p-8 md:p-10" style={{ borderColor: C.line }}>
            <h2 className="text-[24px] font-bold tracking-[-0.04em] md:text-[30px]">작업실</h2>
            <ul className="mt-5 grid gap-2.5" style={{ color: C.sub }}>
              <li className="border-b pb-2.5" style={{ borderColor: C.line }}>평일 10:00 ~ 18:00, 방문은 전화로 시간을 정합니다</li>
              <li className="border-b pb-2.5" style={{ borderColor: C.line }}>완성 가구와 수종 견본을 직접 만져 볼 수 있습니다</li>
              <li>A/S 1년, 오일 재마감은 언제든 무료</li>
            </ul>
          </div>
          <div className="flex flex-col justify-between gap-8 p-8 text-white md:p-10" style={{ background: C.walnut }}>
            <div>
              <h2 className="text-[24px] font-bold tracking-[-0.04em] md:text-[30px]">맞춤 문의</h2>
              <p className="mt-3 text-white/80">놓을 자리 사진과 가로, 세로, 높이를 보내 주시면 수종별 견적을 이틀 안에 드립니다.</p>
            </div>
            <p className="text-[28px] font-bold tabular-nums">031-000-0000</p>
          </div>
        </div>
      </section>

      <footer className="border-t px-5 py-10 text-[14px] md:px-10" style={{ borderColor: C.line, color: C.sub }}>
        <div className="mx-auto flex max-w-[1320px] flex-col gap-2 md:flex-row md:justify-between">
          <p>NAMU WORKS 나무웍스, 경기도 파주시 일대. 사업자등록번호 000-00-00000</p>
          <p>031-000-0000</p>
        </div>
      </footer>
    </div>
  );
}
