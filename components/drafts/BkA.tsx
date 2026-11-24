"use client";

import Image from "next/image";
import { Clock } from "lucide-react";

// 베이커리 시안 A 동네 빵집형(11-22 사례 분석: 빵아빵아처럼 메뉴와 매장 정보를 쉽게 찾게 둔다. 동네 손님은 몇 시에 무슨 빵이 나오는지, 케이크는 며칠 전에 주문하는지를 묻는다). 흰 바탕, 갈색과 빨강. 인물 없음. 메인 한 장, 기능 없음.
// 사진: Unsplash 무료 라이선스(public/images/drafts/bk/a-*)
const IMG = "/images/drafts/bk";
const C = { ink: "#1e1712", sub: "#6a6058", line: "#ece6e0", soft: "#f7f4f1", brown: "#8a4b22", red: "#c8402e" };

const BAKE = [
  ["08:00", "식빵, 우유식빵, 통밀식빵"],
  ["10:00", "크루아상, 뺑오쇼콜라"],
  ["12:00", "바게트, 캄파뉴"],
  ["15:00", "소금빵, 앙버터, 단팥빵"],
];

export function BkA() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.75] md:text-[17px]" style={{ color: C.ink }}>
      <header className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur" style={{ borderColor: C.line }}>
        <div className="mx-auto flex h-[70px] max-w-[1200px] items-center justify-between px-5 md:px-8">
          <p className="text-[20px] font-bold tracking-[-0.03em]">
            <span style={{ color: C.brown }}>밀알</span> 베이커리
          </p>
          <nav aria-label="주 메뉴" className="hidden gap-9 text-[15px] font-semibold lg:flex" style={{ color: "#4a423b" }}>
            {["굽는 시간", "대표 빵", "케이크 주문", "매장"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </nav>
          <span className="inline-flex h-11 items-center rounded-full px-5 text-[15px] font-bold text-white" style={{ background: C.brown }}>
            케이크 주문
          </span>
        </div>
      </header>

      <section className="px-5 pb-16 pt-10 md:px-8 md:pb-24 md:pt-14">
        <div className="mx-auto grid max-w-[1200px] items-center gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-14">
          <div>
            <p className="text-[15px] font-bold" style={{ color: C.red }}>매일 새벽 5시 반죽</p>
            <h1 className="mt-4 text-[36px] font-bold leading-[1.24] tracking-[-0.045em] md:text-[56px]">
              아침 8시,
              <br />
              첫 식빵이 나옵니다
            </h1>
            <p className="mt-5 max-w-[460px] text-[17px] md:text-[18px]" style={{ color: C.sub }}>
              그날 구운 빵은 그날 팝니다. 저녁 8시 이후 남은 빵은 반값에 드립니다.
            </p>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[28px]">
            <Image src={`${IMG}/a-hero.jpg`} alt="나무 선반에 줄지어 놓인 식빵" fill priority sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28" style={{ background: C.soft }}>
        <div className="mx-auto max-w-[1200px]">
          <h2 className="flex items-center gap-3 text-[30px] font-bold tracking-[-0.04em] md:text-[44px]">
            <Clock size={30} style={{ color: C.brown }} aria-hidden /> 빵 나오는 시간
          </h2>
          <ul className="mt-10 overflow-hidden rounded-[22px] bg-white">
            {BAKE.map(([t, d]) => (
              <li key={t} className="grid grid-cols-[76px_1fr] gap-x-4 border-b px-6 py-5 last:border-b-0 md:grid-cols-[140px_1fr] md:px-8" style={{ borderColor: C.line }}>
                <span className="text-[19px] font-bold tabular-nums" style={{ color: C.brown }}>{t}</span>
                <span className="text-[17px] font-semibold">{d}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-[1200px]">
          <h2 className="text-[30px] font-bold tracking-[-0.04em] md:text-[44px]">대표 빵</h2>
          <ul className="mt-10 grid gap-4 md:grid-cols-2">
            {[
              { f: "a-baguette", alt: "도마 위 바게트 두 개", t: "바게트", d: "프랑스 밀가루, 저온 숙성 18시간", p: "4,500원" },
              { f: "a-croissant", alt: "종이 위에 놓인 크루아상", t: "버터 크루아상", d: "발효 버터 27겹", p: "4,000원" },
            ].map((x) => (
              <li key={x.t} className="overflow-hidden rounded-[24px] border" style={{ borderColor: C.line }}>
                <div className="relative aspect-[16/10]">
                  <Image src={`${IMG}/${x.f}.jpg`} alt={x.alt} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
                </div>
                <div className="flex items-end justify-between gap-4 p-7">
                  <div>
                    <h3 className="text-[22px] font-bold tracking-[-0.03em]">{x.t}</h3>
                    <p className="mt-1 text-[15px]" style={{ color: C.sub }}>{x.d}</p>
                  </div>
                  <p className="shrink-0 text-[19px] font-bold tabular-nums">{x.p}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-5 pb-20 md:px-8 md:pb-28">
        <div className="mx-auto grid max-w-[1200px] gap-4 md:grid-cols-[1.1fr_1fr]">
          <div className="overflow-hidden rounded-[28px]" style={{ background: C.soft }}>
            <div className="relative aspect-[16/9]">
              <Image src={`${IMG}/a-cake.jpg`} alt="진열장 안 딸기 생크림 케이크" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
            </div>
            <div className="p-8 md:p-10">
              <h2 className="text-[24px] font-bold tracking-[-0.04em] md:text-[30px]">케이크 주문</h2>
              <ul className="mt-5 grid gap-2.5" style={{ color: C.sub }}>
                <li>3일 전까지 전화로 주문, 크기는 1호와 2호</li>
                <li>딸기 생크림, 초코, 고구마 세 가지</li>
                <li>케이크 문구는 열 글자까지 써 드립니다</li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col justify-between rounded-[28px] p-8 text-white md:p-10" style={{ background: C.brown }}>
            <div>
              <h2 className="text-[24px] font-bold tracking-[-0.04em] md:text-[30px]">매장</h2>
              <p className="mt-3 text-white/80">매일 07:30 ~ 21:00, 매주 월요일 쉽니다. 시장 입구 건너편 1층.</p>
            </div>
            <p className="mt-8 text-[30px] font-bold tabular-nums tracking-[-0.02em]">02-000-0000</p>
          </div>
        </div>
      </section>

      <footer className="border-t px-5 py-10 text-[14px] md:px-8" style={{ borderColor: C.line, color: C.sub }}>
        <div className="mx-auto flex max-w-[1200px] flex-col gap-2 md:flex-row md:justify-between">
          <p>밀알 베이커리, 서울특별시 성북구 일대. 사업자등록번호 000-00-00000</p>
          <p>02-000-0000</p>
        </div>
      </footer>
    </div>
  );
}
