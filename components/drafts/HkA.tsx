"use client";

import Image from "next/image";
import { Leaf } from "lucide-react";

// 한옥 카페 시안 A 전통 찻집형(11-22 사례 분석: 한옥호텔 담처럼 처마와 대나무 사진, 먹 산수 같은 여백, 한옥 스테이 사례는 큰 사진과 공간 설명 중심. 찻집 손님은 차 종류, 계절 디저트, 좌식인지 입식인지를 묻는다). 흰 바탕, 먹색과 황토. 인물 없음. 메인 한 장, 기능 없음.
// 사진: Unsplash 무료 라이선스(public/images/drafts/hk/a-*)
const IMG = "/images/drafts/hk";
const C = { ink: "#1b1a17", sub: "#66625a", line: "#ebe7df", soft: "#f6f4ef", ochre: "#9a6a2f", ochreSoft: "#f3ebdf" };

const TEA = [
  ["쌍화차", "열두 가지 약재를 여덟 시간 달여 냅니다", "8,000원"],
  ["대추차", "대추를 걸쭉하게 갈아 잣을 띄웁니다", "7,500원"],
  ["오미자차", "여름은 차갑게, 겨울은 따뜻하게", "7,000원"],
  ["작설차", "하동 우전 녹차, 다기 한 벌로", "9,000원"],
];

export function HkA() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.75] md:text-[17px]" style={{ color: C.ink }}>
      <header className="absolute inset-x-0 z-20 text-white">
        <div className="mx-auto flex h-[78px] max-w-[1320px] items-center justify-between px-5 md:px-10">
          <p className="text-[19px] font-bold tracking-[0.08em]">다래헌</p>
          <nav aria-label="주 메뉴" className="hidden gap-10 text-[15px] font-medium text-white/85 lg:flex">
            {["차", "계절 디저트", "공간", "오시는 길"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </nav>
          <span className="inline-flex h-10 items-center border border-white/70 px-5 text-[14px] font-bold">단체 문의</span>
        </div>
      </header>

      <section className="relative flex min-h-[620px] items-end overflow-hidden bg-black text-white md:h-[96svh]">
        <Image src={`${IMG}/a-hero.jpg`} alt="기와지붕과 나무 문살이 있는 한옥 대청" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/40" aria-hidden />
        <div className="relative mx-auto flex w-full max-w-[1320px] flex-col gap-6 px-5 pb-16 md:flex-row md:items-end md:justify-between md:px-10 md:pb-24">
          <h1 className="text-[38px] font-bold leading-[1.22] tracking-[-0.045em] md:text-[68px]">
            백 년 된 대청에서
            <br />
            차 한 잔
          </h1>
          <p className="max-w-[360px] text-white/75">1930년대 도시 한옥을 고쳐 찻집으로 꾸몄습니다. 마루에 앉아 마당을 보며 차를 드실 수 있습니다.</p>
        </div>
      </section>

      <section className="px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-[1320px]">
          <p className="flex items-center gap-2 text-[14px] font-bold tracking-[0.2em]" style={{ color: C.ochre }}>
            <Leaf size={16} aria-hidden /> TEA
          </p>
          <h2 className="mt-4 text-[32px] font-bold tracking-[-0.04em] md:text-[46px]">차</h2>
          <ul className="mt-12 border-t" style={{ borderColor: C.ink }}>
            {TEA.map(([t, d, p]) => (
              <li key={t} className="grid gap-1 border-b py-6 md:grid-cols-[0.8fr_2fr_0.6fr] md:items-center md:gap-8" style={{ borderColor: C.line }}>
                <h3 className="text-[24px] font-bold tracking-[-0.03em]">{t}</h3>
                <p style={{ color: C.sub }}>{d}</p>
                <p className="font-bold tabular-nums md:text-right" style={{ color: C.ochre }}>{p}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-5 md:px-10" style={{ background: C.soft }}>
        <div className="mx-auto max-w-[1320px] py-20 md:py-28">
          <h2 className="text-[32px] font-bold tracking-[-0.04em] md:text-[46px]">계절 디저트</h2>
          <div className="mt-10 grid gap-3 md:grid-cols-3">
            {[
              { f: "a-tea", alt: "나무 쟁반 위 백자 찻주전자와 찻잔", t: "다식과 차", d: "사계절, 송화 다식과 깨 다식" },
              { f: "a-redbean", alt: "팥과 인절미를 올린 그릇", t: "단팥죽", d: "10월 ~ 3월, 국산 팥, 찹쌀 새알" },
              { f: "a-bingsu", alt: "곱게 간 얼음 위에 견과를 올린 빙수", t: "인절미 빙수", d: "5월 ~ 9월, 우유 얼음, 콩고물" },
            ].map((x) => (
              <div key={x.t} className="bg-white">
                <div className="relative aspect-[4/3]">
                  <Image src={`${IMG}/${x.f}.jpg`} alt={x.alt} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" />
                </div>
                <div className="p-6 md:p-7">
                  <h3 className="text-[21px] font-bold tracking-[-0.03em]">{x.t}</h3>
                  <p className="mt-1 text-[15px]" style={{ color: C.sub }}>{x.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto grid max-w-[1320px] gap-10 md:grid-cols-[1.2fr_1fr] md:gap-16">
          <div>
            <h2 className="text-[28px] font-bold leading-[1.35] tracking-[-0.04em] md:text-[38px]">공간</h2>
            <dl className="mt-7 border-t" style={{ borderColor: C.ink }}>
              {[
                ["대청마루", "좌식, 방석과 낮은 상 6개"],
                ["사랑방", "입식, 4인 테이블 3개"],
                ["마당", "봄, 가을 평상 2개"],
                ["단체", "10인 이상은 사랑방을 통째로 내어 드립니다"],
              ].map(([k, v]) => (
                <div key={k} className="grid grid-cols-[100px_1fr] gap-3 border-b py-4" style={{ borderColor: C.line }}>
                  <dt className="font-bold">{k}</dt>
                  <dd style={{ color: C.sub }}>{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="flex flex-col justify-between gap-8 p-8 md:p-10" style={{ background: C.ochreSoft }}>
            <div>
              <h3 className="text-[24px] font-bold tracking-[-0.03em]">오시는 길</h3>
              <p className="mt-3" style={{ color: C.sub }}>매일 11:00 ~ 21:00, 마지막 주문 20:30. 안국역 2번 출구에서 골목으로 5분, 주차는 공영주차장을 이용해 주세요.</p>
            </div>
            <p className="text-[28px] font-bold tabular-nums" style={{ color: C.ochre }}>02-000-0000</p>
          </div>
        </div>
      </section>

      <footer className="border-t px-5 py-10 text-[14px] md:px-10" style={{ borderColor: C.line, color: C.sub }}>
        <div className="mx-auto flex max-w-[1320px] flex-col gap-2 md:flex-row md:justify-between">
          <p>다래헌, 서울특별시 종로구 북촌 일대. 사업자등록번호 000-00-00000</p>
          <p>02-000-0000</p>
        </div>
      </footer>
    </div>
  );
}
