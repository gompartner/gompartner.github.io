"use client";

import Image from "next/image";

// 캠핑장 시안 B 글램핑형(11-22 사례 분석: Forest Glam처럼 텐트 사진을 크게, 동별 정보. 글램핑 손님은 장비 없이 가도 되는지, 텐트 안에 무엇이 있는지, 바비큐와 난방을 묻는다). 흰 바탕, 따뜻한 갈색. 인물 없음. 메인 한 장, 기능 없음.
// 사진: Unsplash 무료 라이선스(public/images/drafts/cp/b-*)
const IMG = "/images/drafts/cp";
const C = { ink: "#1d1914", sub: "#6a6259", line: "#ece6de", soft: "#f7f4f0", tan: "#9a6b3c", tanSoft: "#f4ebe0" };

const TENTS = [
  { f: "b-hero", alt: "잔디 위에 선 흰 벨 텐트", t: "벨 텐트", p: "2인 기준, 최대 4인", d: "지름 5m, 퀸 침대, 개별 데크" },
  { f: "b-dome", alt: "나무 데크 위 흰 돔 텐트와 산 전망", t: "돔 텐트", p: "2인 기준, 최대 3인", d: "전면 투명창, 숲 전망, 개별 화장실" },
  { f: "b-bubble", alt: "언덕 위 투명 버블 텐트", t: "버블 텐트", p: "2인 전용", d: "천장 투명, 누워서 별 보기" },
];

export function CpB() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.75] md:text-[17px]" style={{ color: C.ink }}>
      <header className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur" style={{ borderColor: C.line }}>
        <div className="mx-auto flex h-[70px] max-w-[1200px] items-center justify-between px-5 md:px-8">
          <p className="text-[19px] font-bold tracking-[0.06em]">
            STAR <span style={{ color: C.tan }}>FIELD</span>
          </p>
          <nav aria-label="주 메뉴" className="hidden gap-9 text-[15px] font-semibold lg:flex" style={{ color: "#4b443c" }}>
            {["텐트", "준비된 것", "바비큐", "문의"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </nav>
        </div>
      </header>

      <section className="px-5 pb-16 pt-10 md:px-8 md:pb-24 md:pt-14">
        <div className="mx-auto max-w-[1200px]">
          <div className="grid gap-6 md:grid-cols-[1.2fr_1fr] md:items-end">
            <h1 className="text-[36px] font-bold leading-[1.24] tracking-[-0.045em] md:text-[60px]">
              장비 없이 와서
              <br />
              별 보고 잡니다
            </h1>
            <p className="max-w-[420px] text-[17px]" style={{ color: C.sub }}>
              침구, 난방, 바비큐 그릴까지 텐트마다 준비해 둡니다. 옷과 먹을 것만 챙겨 오시면 됩니다.
            </p>
          </div>
          <div className="relative mt-10 aspect-[4/3] overflow-hidden rounded-[28px] md:aspect-[21/9]">
            <Image src={`${IMG}/b-hero.jpg`} alt="잔디 위에 선 흰 벨 텐트" fill priority sizes="100vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28" style={{ background: C.soft }}>
        <div className="mx-auto max-w-[1200px]">
          <h2 className="text-[30px] font-bold tracking-[-0.04em] md:text-[44px]">텐트</h2>
          <ul className="mt-10 grid gap-4 md:grid-cols-3">
            {TENTS.map((x) => (
              <li key={x.t} className="overflow-hidden rounded-[24px] bg-white">
                <div className="relative aspect-[4/3]">
                  <Image src={`${IMG}/${x.f}.jpg`} alt={x.alt} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" />
                </div>
                <div className="p-6 md:p-7">
                  <span className="inline-flex rounded-full px-3 py-0.5 text-[14px] font-bold" style={{ background: C.tanSoft, color: C.tan }}>{x.p}</span>
                  <h3 className="mt-3 text-[22px] font-bold tracking-[-0.03em]">{x.t}</h3>
                  <p className="mt-1 text-[15px]" style={{ color: C.sub }}>{x.d}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-[1200px]">
          <h2 className="text-[28px] font-bold leading-[1.35] tracking-[-0.04em] md:text-[38px]">텐트 안에 준비된 것</h2>
          <ul className="mt-7 flex flex-wrap gap-2">
            {["퀸 침대, 거위털 이불", "전기 난방 매트", "온풍기(11월 ~ 3월)", "냉장고", "전기포트, 컵", "수건, 세면도구", "바비큐 그릴, 숯", "캠핑 의자 2개"].map((m) => (
              <li key={m} className="rounded-full border px-4 py-1.5 font-semibold" style={{ borderColor: C.line }}>{m}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-5 pb-20 md:px-8 md:pb-28">
        <div className="mx-auto grid max-w-[1200px] gap-4 md:grid-cols-2">
          <div className="rounded-[28px] p-8 md:p-10" style={{ background: C.tanSoft }}>
            <h2 className="text-[24px] font-bold tracking-[-0.04em] md:text-[30px]">바비큐와 이용 시간</h2>
            <ul className="mt-5 grid gap-2.5" style={{ color: C.sub }}>
              <li>입실 15:00, 퇴실 11:00</li>
              <li>바비큐 숯불은 17:00 ~ 21:00, 텐트 앞 데크에서</li>
              <li>고기 세트는 하루 전까지 주문하시면 준비해 둡니다</li>
            </ul>
          </div>
          <div className="flex flex-col justify-between rounded-[28px] p-8 text-white md:p-10" style={{ background: C.tan }}>
            <div>
              <h2 className="text-[24px] font-bold tracking-[-0.04em] md:text-[30px]">문의</h2>
              <p className="mt-3 text-white/85">날짜와 인원, 원하시는 텐트를 알려 주시면 남은 자리를 바로 알려 드립니다.</p>
            </div>
            <p className="mt-8 text-[30px] font-bold tabular-nums tracking-[-0.02em]">041-000-0000</p>
          </div>
        </div>
      </section>

      <footer className="border-t px-5 py-10 text-[14px] md:px-8" style={{ borderColor: C.line, color: C.sub }}>
        <div className="mx-auto flex max-w-[1200px] flex-col gap-2 md:flex-row md:justify-between">
          <p>스타필드 글램핑, 충청남도 태안군 일대. 야영장업 등록번호 제000호</p>
          <p>041-000-0000</p>
        </div>
      </footer>
    </div>
  );
}
