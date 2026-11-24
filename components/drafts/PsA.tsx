"use client";

import Image from "next/image";

// 아파트 분양 시안 A 분양 정보형(11-22 사례 분석: 오산세교 하우스토리처럼 사업 개요, 입지, 단지 정보를 앞에, 쌍용 더퍼스트처럼 타입별 면적과 세대수. 청약자는 공급 규모, 타입별 전용면적과 세대수, 분양 일정, 견본주택 위치를 먼저 찾는다). 흰 바탕, 남색과 하늘색. 인물 없음. 메인 한 장, 방문 예약 기능 없음.
// 사진: Unsplash 무료 라이선스(public/images/drafts/ps/a-*)
const IMG = "/images/drafts/ps";
const C = { ink: "#0f1a2b", sub: "#5a6577", line: "#e1e7ef", soft: "#f2f5f9", navy: "#173a6b", sky: "#2f7fd0" };

const TYPES = [
  ["59A", "59.98㎡", "4베이 판상형", "186세대"],
  ["74A", "74.92㎡", "드레스룸 특화", "142세대"],
  ["84A", "84.97㎡", "4베이, 팬트리", "238세대"],
  ["84B", "84.91㎡", "타워형, 2면 개방", "96세대"],
];

const SCHEDULE = [
  ["입주자모집공고", "12. 4(목)"],
  ["특별공급", "12. 15(월)"],
  ["1순위 청약", "12. 16(화)"],
  ["당첨자 발표", "12. 23(화)"],
  ["계약", "1. 5(월) ~ 1. 7(수)"],
];

export function PsA() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.75] md:text-[17px]" style={{ color: C.ink }}>
      <header className="absolute inset-x-0 z-20 text-white">
        <div className="mx-auto flex h-[78px] max-w-[1320px] items-center justify-between px-5 md:px-10">
          <p className="text-[18px] font-bold tracking-[-0.02em]">한강 리버뷰 더센트럴</p>
          <nav aria-label="주 메뉴" className="hidden gap-10 text-[15px] font-medium text-white/85 lg:flex">
            {["사업개요", "입지환경", "단지안내", "세대안내", "분양일정"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </nav>
          <span className="hidden h-10 items-center px-4 text-[15px] font-bold tabular-nums sm:inline-flex" style={{ background: C.sky }}>
            1600-0000
          </span>
        </div>
      </header>

      <section className="relative flex min-h-[620px] items-end overflow-hidden bg-black text-white md:h-[96svh]">
        <Image src={`${IMG}/a-hero.jpg`} alt="하늘을 배경으로 한 흰 외관의 아파트" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/40" aria-hidden />
        <div className="relative mx-auto w-full max-w-[1320px] px-5 pb-16 md:px-10 md:pb-24">
          <p className="text-[15px] font-bold text-white/85">지하 2층 ~ 지상 29층, 7개 동, 총 662세대</p>
          <h1 className="mt-4 text-[40px] font-bold leading-[1.2] tracking-[-0.045em] md:text-[72px]">
            한강까지 걸어서 7분,
            <br />
            역세권 새 아파트
          </h1>
        </div>
      </section>

      <section className="px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto grid max-w-[1320px] gap-10 md:grid-cols-[1fr_1.4fr] md:gap-16">
          <h2 className="text-[32px] font-bold tracking-[-0.04em] md:text-[46px]">사업개요</h2>
          <dl className="border-t" style={{ borderColor: C.ink }}>
            {[
              ["위치", "경기도 구리시 토평동 일대"],
              ["규모", "지하 2층 ~ 지상 29층, 7개 동"],
              ["세대수", "총 662세대(일반분양 512세대)"],
              ["주차", "세대당 1.45대, 지상 차 없는 단지"],
              ["입주", "2029년 3월 예정"],
            ].map(([k, v]) => (
              <div key={k} className="grid grid-cols-[88px_1fr] gap-3 border-b py-4" style={{ borderColor: C.line }}>
                <dt className="font-bold">{k}</dt>
                <dd style={{ color: C.sub }}>{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="px-5 md:px-10" style={{ background: C.soft }}>
        <div className="mx-auto max-w-[1320px] py-20 md:py-28">
          <h2 className="text-[30px] font-bold tracking-[-0.04em] md:text-[44px]">세대안내</h2>
          <ul className="mt-10 grid gap-px sm:grid-cols-2 lg:grid-cols-4" style={{ background: C.line }}>
            {TYPES.map(([t, a, d, n]) => (
              <li key={t} className="bg-white p-6 md:p-8">
                <h3 className="text-[34px] font-bold tracking-[-0.03em]" style={{ color: C.navy }}>{t}</h3>
                <p className="mt-1 font-semibold tabular-nums">전용 {a}</p>
                <p className="text-[15px]" style={{ color: C.sub }}>{d}</p>
                <p className="mt-5 border-t pt-3 font-bold tabular-nums" style={{ borderColor: C.line, color: C.sky }}>{n}</p>
              </li>
            ))}
          </ul>
          <div className="relative mt-4 aspect-[16/9] overflow-hidden md:aspect-[21/9]">
            <Image src={`${IMG}/a-living.jpg`} alt="큰 창과 소파가 놓인 밝은 거실" fill sizes="100vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto grid max-w-[1320px] items-center gap-10 md:grid-cols-2 md:gap-16">
          <div className="relative aspect-[4/3] overflow-hidden">
            <Image src={`${IMG}/a-river.jpg`} alt="강과 다리 너머로 보이는 도시 풍경" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
          </div>
          <div>
            <h2 className="text-[28px] font-bold leading-[1.35] tracking-[-0.04em] md:text-[38px]">입지환경</h2>
            <ul className="mt-7 grid gap-3">
              {[
                ["교통", "8호선 연장 역 도보 5분, 강변북로 진입 3분"],
                ["교육", "초등학교 단지 앞, 중학교 도보 10분"],
                ["자연", "한강 공원, 왕숙천 산책로"],
                ["생활", "대형마트, 종합병원 차로 10분 안"],
              ].map(([k, v]) => (
                <li key={k} className="flex gap-4 border-b pb-3" style={{ borderColor: C.line }}>
                  <span className="w-[44px] shrink-0 font-bold" style={{ color: C.sky }}>{k}</span>
                  <span>{v}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="px-5 pb-20 md:px-10 md:pb-28">
        <div className="mx-auto grid max-w-[1320px] gap-4 md:grid-cols-[1.2fr_1fr]">
          <div className="border p-8 md:p-10" style={{ borderColor: C.line }}>
            <h2 className="text-[24px] font-bold tracking-[-0.04em] md:text-[30px]">분양일정</h2>
            <dl className="mt-5">
              {SCHEDULE.map(([k, v]) => (
                <div key={k} className="grid grid-cols-[1fr_auto] gap-3 border-b py-3 last:border-b-0" style={{ borderColor: C.line }}>
                  <dt className="font-semibold">{k}</dt>
                  <dd className="font-bold tabular-nums" style={{ color: C.navy }}>{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="flex flex-col justify-between gap-8 p-8 text-white md:p-10" style={{ background: C.navy }}>
            <div>
              <h2 className="text-[24px] font-bold tracking-[-0.04em] md:text-[30px]">견본주택</h2>
              <p className="mt-3 text-white/75">구리시 인창동 일대, 매일 10:00 ~ 18:00. 59A, 84A 유니트를 전시하고 있습니다.</p>
            </div>
            <p className="text-[28px] font-bold tabular-nums">1600-0000</p>
          </div>
        </div>
      </section>

      <footer className="border-t px-5 py-10 text-[13px] md:px-10" style={{ borderColor: C.line, color: C.sub }}>
        <div className="mx-auto flex max-w-[1320px] flex-col gap-2">
          <p>시행 (주)리버뷰개발, 시공 한결건설. 사진과 이미지는 이해를 돕기 위한 것으로 실제와 다를 수 있으며, 정확한 내용은 입주자모집공고를 따릅니다.</p>
          <p>분양문의 1600-0000</p>
        </div>
      </footer>
    </div>
  );
}
