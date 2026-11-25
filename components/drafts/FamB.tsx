"use client";

import Image from "next/image";
import { ArrowRight, Clock } from "lucide-react";

// 이혼 법률사무소 시안 B 재산분할, 양육 쟁점형(11-22 사례 분석: 태준, 로유처럼 쟁점별 카드와 사례 분류. 상담 전 손님은 "무엇이 나눌 재산인지, 양육비는 얼마인지, 언제까지 청구하는지"를 찾는다. 승소율, 전문 표기 없음). 흰 바탕, 짙은 자주. 인물 없음. 메인 한 장, 기능 없음.
// 사진: Unsplash 무료 라이선스(public/images/drafts/fam/b-*)
const IMG = "/images/drafts/fam";
const C = { ink: "#1d1619", sub: "#675d61", line: "#ece5e8", soft: "#f8f4f6", plum: "#6b2f4a", plumSoft: "#f3e7ec" };

export function FamB() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.75] md:text-[17px]" style={{ color: C.ink }}>
      <header className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur" style={{ borderColor: C.line }}>
        <div className="mx-auto flex h-[70px] max-w-[1200px] items-center justify-between px-5 md:px-8">
          <p className="text-[20px] font-bold tracking-[-0.03em]">
            <span style={{ color: C.plum }}>다온</span> 법률사무소
          </p>
          <nav aria-label="주 메뉴" className="hidden gap-9 text-[15px] font-semibold lg:flex" style={{ color: "#4a4045" }}>
            {["재산분할", "양육비", "청구 기한", "상담"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </nav>
        </div>
      </header>

      <section className="px-5 pb-16 pt-10 md:px-8 md:pb-24 md:pt-14">
        <div className="mx-auto grid max-w-[1200px] items-center gap-8 overflow-hidden rounded-[32px] lg:grid-cols-2" style={{ background: C.plumSoft }}>
          <div className="px-7 pt-10 md:px-14 lg:py-16">
            <p className="inline-flex rounded-full bg-white px-3 py-1 text-[14px] font-bold" style={{ color: C.plum }}>재산분할, 양육 사건</p>
            <h1 className="mt-5 text-[34px] font-bold leading-[1.25] tracking-[-0.045em] md:text-[50px]">
              이혼 뒤의 생활을
              <br />
              먼저 계산합니다
            </h1>
            <p className="mt-4 max-w-[430px] text-[16px] md:text-[18px]" style={{ color: C.sub }}>
              집, 예금, 퇴직금, 자녀 양육비까지 이혼 뒤 남는 것을 숫자로 정리해 드리고, 그 숫자로 협의와 소송을 준비합니다.
            </p>
          </div>
          <div className="relative min-h-[280px] self-stretch md:min-h-[440px]">
            <Image src={`${IMG}/b-hero.jpg`} alt="소파와 안락의자가 놓인 아늑한 거실" fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto grid max-w-[1200px] gap-10 md:grid-cols-[1fr_1.2fr] md:gap-16">
          <div>
            <h2 className="text-[30px] font-bold tracking-[-0.04em] md:text-[44px]">나누는 재산</h2>
            <p className="mt-3" style={{ color: C.sub }}>명의가 누구인지보다 혼인 중에 함께 모았는지를 봅니다.</p>
            <div className="relative mt-8 aspect-[4/3] overflow-hidden rounded-[24px]">
              <Image src={`${IMG}/b-house.jpg`} alt="열쇠 옆에 놓인 작은 집 모형" fill sizes="(min-width: 768px) 40vw, 100vw" className="object-cover" />
            </div>
          </div>
          <div className="grid content-start gap-3">
            {[
              ["대상이 되는 것", "부동산, 예금, 주식, 퇴직금, 연금, 사업체, 전세보증금", true],
              ["다툼이 많은 것", "혼인 전 재산이 늘어난 부분, 부모님께 받은 재산", false],
              ["빚도 나눕니다", "혼인생활을 위해 생긴 대출, 카드 대금", false],
            ].map(([k, v, on]) => (
              <div key={k as string} className="rounded-[20px] p-6 md:p-7" style={{ background: on ? C.plum : C.soft, color: on ? "#fff" : C.ink }}>
                <p className="text-[19px] font-bold">{k}</p>
                <p className="mt-1 text-[15px]" style={{ color: on ? "rgba(255,255,255,0.8)" : C.sub }}>{v}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28" style={{ background: C.soft }}>
        <div className="mx-auto max-w-[1200px]">
          <h2 className="text-[30px] font-bold tracking-[-0.04em] md:text-[44px]">양육비와 면접교섭</h2>
          <ul className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              ["양육비 기준", "법원의 양육비 산정기준표로 부모 소득 합계와 자녀 나이에 따라 정합니다."],
              ["받지 못할 때", "이행명령, 직접지급명령, 담보제공명령으로 받을 수 있습니다."],
              ["면접교섭", "만나는 주기, 장소, 방학과 명절을 합의서에 구체적으로 적습니다."],
            ].map(([t, d]) => (
              <li key={t} className="flex flex-col rounded-[24px] bg-white p-7 md:p-8">
                <h3 className="text-[21px] font-bold tracking-[-0.03em]">{t}</h3>
                <p className="mt-2 flex-1 text-[15px]" style={{ color: C.sub }}>{d}</p>
                <p className="mt-6 inline-flex items-center gap-1.5 text-[15px] font-bold" style={{ color: C.plum }}>
                  자세히 보기 <ArrowRight size={16} aria-hidden />
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto grid max-w-[1200px] items-center gap-10 md:grid-cols-[1.1fr_1fr] md:gap-16">
          <div>
            <h2 className="text-[28px] font-bold leading-[1.35] tracking-[-0.04em] md:text-[38px]">청구 기한</h2>
            <dl className="mt-7 border-t" style={{ borderColor: C.ink }}>
              {[
                ["재산분할 청구", "이혼한 날부터 2년"],
                ["위자료 청구", "손해와 가해자를 안 날부터 3년"],
                ["상간자 위자료", "부정행위를 안 날부터 3년"],
                ["과거 양육비", "사안에 따라 달라 상담 때 확인"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 border-b py-4" style={{ borderColor: C.line }}>
                  <dt className="font-semibold">{k}</dt>
                  <dd className="flex items-center gap-1.5 text-right font-bold" style={{ color: C.plum }}>
                    <Clock size={15} aria-hidden className="shrink-0" /> {v}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[24px]">
            <Image src={`${IMG}/b-keys.jpg`} alt="나무 탁자 위에 놓인 열쇠 꾸러미" fill sizes="(min-width: 768px) 45vw, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      <footer className="border-t px-5 py-10 text-[14px] md:px-8" style={{ borderColor: C.line, color: C.sub }}>
        <div className="mx-auto flex max-w-[1200px] flex-col gap-2 md:flex-row md:justify-between">
          <p>다온 법률사무소, 경기도 수원시 영통구 일대. 변호사, 광고 책임 변호사 000</p>
          <p>평일 09:00 ~ 19:00, 031-000-0000</p>
        </div>
      </footer>
    </div>
  );
}
