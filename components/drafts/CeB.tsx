"use client";

import Image from "next/image";

// 시험인증기관 시안 B 시험분석 의뢰형(11-22 사례 분석: 과학기술경제연구소, 인증포럼처럼 정보 정리형. 식품, 화장품, 소재 회사 품질 담당자는 어떤 항목을 분석하는지, 시료는 얼마나 보내는지, 며칠 걸리는지, 성적서를 어떻게 받는지 묻는다). 흰 바탕, 검정과 보라. 인물 없음. 메인 한 장, 기능 없음.
// 사진: Unsplash 무료 라이선스(public/images/drafts/ce/b-*)
const IMG = "/images/drafts/ce";
const C = { ink: "#14121c", sub: "#625f6e", line: "#e6e4ec", soft: "#f4f3f8", violet: "#4b3aa8", violetSoft: "#ecebfa" };

const TESTS = [
  ["식품", "영양성분, 잔류농약, 중금속, 미생물", "7 ~ 10일"],
  ["화장품", "유해물질, 방부제, pH, 미생물 한도", "5 ~ 7일"],
  ["환경", "수질, 토양 중금속, 실내공기질", "7 ~ 14일"],
  ["소재", "인장강도, 경도, 성분 분석(ICP, FT-IR)", "5 ~ 10일"],
];

export function CeB() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.75] md:text-[17px]" style={{ color: C.ink }}>
      <header className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur" style={{ borderColor: C.line }}>
        <div className="mx-auto flex h-[70px] max-w-[1200px] items-center justify-between px-5 md:px-8">
          <p className="text-[19px] font-bold tracking-[0.04em]">
            ANALAB <span style={{ color: C.violet }}>분석센터</span>
          </p>
          <nav aria-label="주 메뉴" className="hidden gap-9 text-[15px] font-semibold lg:flex" style={{ color: "#46434f" }}>
            {["분석 분야", "시료 보내기", "성적서", "문의"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </nav>
          <span className="inline-flex h-11 items-center rounded-full px-5 text-[15px] font-bold text-white" style={{ background: C.violet }}>
            분석 의뢰
          </span>
        </div>
      </header>

      <section className="px-5 pb-16 pt-10 md:px-8 md:pb-24 md:pt-14">
        <div className="mx-auto grid max-w-[1200px] items-center gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-14">
          <div>
            <p className="inline-flex rounded-full px-3 py-1 text-[14px] font-bold" style={{ background: C.violetSoft, color: C.violet }}>KOLAS 공인 시험기관</p>
            <h1 className="mt-5 text-[36px] font-bold leading-[1.24] tracking-[-0.045em] md:text-[56px]">
              시료를 보내 주시면
              <br />
              성적서로 회신합니다
            </h1>
            <p className="mt-5 max-w-[460px] text-[17px] md:text-[18px]" style={{ color: C.sub }}>
              식품, 화장품, 환경, 소재 분석 300여 항목. 접수하면 담당 연구원이 정해지고 진행 상황을 문자로 알려 드립니다.
            </p>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[28px]">
            <Image src={`${IMG}/b-hero.jpg`} alt="흰 실험대 위 현미경 대물렌즈" fill priority sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28" style={{ background: C.soft }}>
        <div className="mx-auto max-w-[1200px]">
          <h2 className="text-[30px] font-bold tracking-[-0.04em] md:text-[44px]">분석 분야</h2>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2">
            {TESTS.map(([t, d, w]) => (
              <li key={t} className="rounded-[24px] bg-white p-7 md:p-8">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-[23px] font-bold tracking-[-0.03em]">{t}</h3>
                  <span className="rounded-full px-3 py-0.5 text-[14px] font-bold tabular-nums" style={{ background: C.violetSoft, color: C.violet }}>{w}</span>
                </div>
                <p className="mt-2 text-[15px]" style={{ color: C.sub }}>{d}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto grid max-w-[1200px] items-center gap-10 md:grid-cols-[1fr_1.1fr] md:gap-16">
          <div>
            <h2 className="text-[28px] font-bold leading-[1.35] tracking-[-0.04em] md:text-[38px]">시료 보내기</h2>
            <ol className="mt-7 grid gap-3">
              {[
                ["의뢰서", "분석 항목과 시료 정보를 적어 메일로"],
                ["포장", "식품 500g, 화장품 100mL 이상, 밀봉"],
                ["발송", "택배 또는 방문 접수, 냉장 시료는 아이스박스"],
                ["접수 확인", "도착한 날 접수번호를 문자로"],
              ].map(([k, v]) => (
                <li key={k} className="flex gap-4 border-b pb-3" style={{ borderColor: C.line }}>
                  <span className="w-[72px] shrink-0 font-bold" style={{ color: C.violet }}>{k}</span>
                  <span>{v}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="relative aspect-[3/4] overflow-hidden rounded-[22px]">
              <Image src={`${IMG}/b-tubes.jpg`} alt="나무 거치대에 꽂힌 여러 색 시험관" fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
            </div>
            <div className="relative aspect-[3/4] overflow-hidden rounded-[22px]">
              <Image src={`${IMG}/b-plate.jpg`} alt="분주 팁이 꽂힌 시료 플레이트" fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 pb-20 md:px-8 md:pb-28">
        <div className="mx-auto grid max-w-[1200px] gap-4 md:grid-cols-2">
          <div className="rounded-[28px] p-8 md:p-10" style={{ background: C.violetSoft }}>
            <h2 className="text-[24px] font-bold tracking-[-0.04em] md:text-[30px]">성적서</h2>
            <ul className="mt-5 grid gap-2.5" style={{ color: C.sub }}>
              <li>PDF 성적서를 메일로, 원본은 요청 시 등기로</li>
              <li>국문, 영문 성적서 동시 발행 가능</li>
              <li>발행번호로 진위확인을 요청할 수 있습니다</li>
            </ul>
          </div>
          <div className="flex flex-col justify-between rounded-[28px] p-8 text-white md:p-10" style={{ background: C.ink }}>
            <div>
              <h2 className="text-[24px] font-bold tracking-[-0.04em] md:text-[30px]">분석 의뢰</h2>
              <p className="mt-3 text-white/70">항목이 정해지지 않았으면 제품과 용도만 알려 주세요. 필요한 분석 항목부터 같이 정합니다.</p>
            </div>
            <p className="mt-8 text-[30px] font-bold tabular-nums tracking-[-0.02em]">042-000-0000</p>
          </div>
        </div>
      </section>

      <footer className="border-t px-5 py-10 text-[14px] md:px-8" style={{ borderColor: C.line, color: C.sub }}>
        <div className="mx-auto flex max-w-[1200px] flex-col gap-2 md:flex-row md:justify-between">
          <p>ANALAB 분석센터, 대전광역시 유성구 일대. KOLAS 인정번호 KT000</p>
          <p>042-000-0000</p>
        </div>
      </footer>
    </div>
  );
}
