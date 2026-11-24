"use client";

import Image from "next/image";

// 도자기 공방 쇼핑몰 시안 A 상품 진열형(11-22 사례 분석: 흙담처럼 미니멀한 상품 사진과 넓은 여백, DISHE처럼 상품 이미지 중심. 손님은 유약 색과 크기, 각인이 되는지, 수작업이라 생기는 차이, 배송과 교환을 묻는다). 흰 바탕, 먹색과 흙색. 인물 없음. 메인 한 장, 장바구니 등 기능 없음.
// 사진: Unsplash 무료 라이선스(public/images/drafts/os/a-*)
const IMG = "/images/drafts/os";
const C = { ink: "#1c1a17", sub: "#6b665f", line: "#ebe7e1", soft: "#f6f4f1", clay: "#a0623a" };

const ITEMS = [
  { f: "a-mug", alt: "나무 탁자 위 회백색 머그", t: "분청 머그", s: "350mL", p: "32,000원", g: ["#d9d6cf", "#7f8a86", "#3b3a36"] },
  { f: "a-bowl", alt: "안쪽에 풀잎 무늬를 그린 사발", t: "풀잎 사발", s: "지름 18cm", p: "38,000원", g: ["#e9e2d3", "#b8653d"] },
  { f: "a-plate", alt: "겹쳐 놓은 회백색 접시", t: "백자 접시", s: "지름 21cm", p: "29,000원", g: ["#eeebe4", "#c9c4ba"] },
  { f: "a-vase", alt: "청록 유약을 입힌 화병들", t: "청유 화병", s: "높이 22cm", p: "56,000원", g: ["#6fb3a3", "#2f6e64"] },
];

export function OsA() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.75] md:text-[17px]" style={{ color: C.ink }}>
      <header className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur" style={{ borderColor: C.line }}>
        <div className="mx-auto flex h-[70px] max-w-[1320px] items-center justify-between px-5 md:px-10">
          <p className="text-[19px] font-bold tracking-[0.12em]">흙과불</p>
          <nav aria-label="주 메뉴" className="hidden gap-9 text-[15px] font-semibold lg:flex" style={{ color: "#4b4741" }}>
            {["머그와 컵", "사발과 접시", "화병", "각인 선물", "배송 안내"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </nav>
          <span className="text-[15px] font-bold" style={{ color: C.clay }}>
            신상품
          </span>
        </div>
      </header>

      <section className="px-5 pt-10 md:px-10 md:pt-14">
        <div className="mx-auto max-w-[1320px]">
          <div className="relative aspect-[4/3] overflow-hidden md:aspect-[21/9]">
            <Image src={`${IMG}/a-hero.jpg`} alt="검은 배경 앞 흰 유약 컵 여러 개" fill priority sizes="100vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" aria-hidden />
            <div className="absolute bottom-0 left-0 p-6 text-white md:p-12">
              <h1 className="text-[34px] font-bold leading-[1.22] tracking-[-0.045em] md:text-[60px]">
                하나씩 빚어
                <br />
                하나씩 굽습니다
              </h1>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-[1320px]">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-[30px] font-bold tracking-[-0.04em] md:text-[44px]">이번 가마</h2>
            <p className="text-[15px]" style={{ color: C.sub }}>4종</p>
          </div>
          <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
            {ITEMS.map((x) => (
              <li key={x.t}>
                <div className="relative aspect-square overflow-hidden" style={{ background: C.soft }}>
                  <Image src={`${IMG}/${x.f}.jpg`} alt={x.alt} fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" />
                </div>
                <h3 className="mt-4 text-[17px] font-bold md:text-[19px]">{x.t}</h3>
                <p className="text-[14px]" style={{ color: C.sub }}>{x.s}</p>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <p className="font-bold tabular-nums">{x.p}</p>
                  <span className="flex gap-1" aria-label="유약 색">
                    {x.g.map((c) => (
                      <span key={c} className="h-3.5 w-3.5 rounded-full border" style={{ background: c, borderColor: "#d9d3ca" }} aria-hidden />
                    ))}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-5 md:px-10" style={{ background: C.soft }}>
        <div className="mx-auto grid max-w-[1320px] gap-10 py-20 md:grid-cols-3 md:gap-8 md:py-28">
          {[
            ["유약과 크기", "같은 유약이라도 가마 안 자리에 따라 색이 조금씩 다릅니다. 상품마다 실제 굽힌 사진을 올립니다."],
            ["각인", "굽 바닥에 이름이나 날짜를 새깁니다. 한글 6자, 영문 10자까지, 제작 기간 7일이 더해집니다."],
            ["선물 포장", "오동나무 상자와 한지 포장, 손글씨 카드를 무료로 넣어 드립니다."],
          ].map(([t, d]) => (
            <div key={t}>
              <h2 className="text-[22px] font-bold tracking-[-0.03em] md:text-[26px]">{t}</h2>
              <p className="mt-3" style={{ color: C.sub }}>{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto grid max-w-[1320px] gap-10 md:grid-cols-[1.2fr_1fr] md:gap-16">
          <div>
            <h2 className="text-[28px] font-bold leading-[1.35] tracking-[-0.04em] md:text-[38px]">배송과 교환 안내</h2>
            <dl className="mt-7 border-t" style={{ borderColor: C.ink }}>
              {[
                ["배송", "주문 뒤 2 ~ 3일 안에 출고, 5만 원 이상 무료"],
                ["포장", "완충재 3겹, 깨짐 사고는 사진 보내 주시면 새 상품으로"],
                ["교환", "받은 날부터 7일 안, 사용하지 않은 상품"],
                ["차이", "기포, 철점, 유약 흐름은 수작업 특성이라 교환 사유가 아닙니다"],
              ].map(([k, v]) => (
                <div key={k} className="grid grid-cols-[64px_1fr] gap-3 border-b py-4" style={{ borderColor: C.line }}>
                  <dt className="font-bold">{k}</dt>
                  <dd style={{ color: C.sub }}>{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="flex flex-col justify-between gap-8 p-8 text-white md:p-10" style={{ background: C.ink }}>
            <div>
              <h3 className="text-[24px] font-bold tracking-[-0.03em]">공방 문의</h3>
              <p className="mt-3 text-white/70">단체 주문, 카페 납품 그릇은 수량과 쓰실 곳을 알려 주시면 견본을 보내 드립니다. 평일 10:00 ~ 17:00.</p>
            </div>
            <p className="text-[28px] font-bold tabular-nums" style={{ color: "#d9a37c" }}>031-000-0000</p>
          </div>
        </div>
      </section>

      <footer className="border-t px-5 py-10 text-[14px] md:px-10" style={{ borderColor: C.line, color: C.sub }}>
        <div className="mx-auto flex max-w-[1320px] flex-col gap-2 md:flex-row md:justify-between">
          <p>흙과불 도예공방, 경기도 이천시 신둔면 일대. 사업자등록번호 000-00-00000, 통신판매업 신고 제0000-경기이천-0000호</p>
          <p>031-000-0000</p>
        </div>
      </footer>
    </div>
  );
}
