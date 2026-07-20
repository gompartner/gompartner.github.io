import Link from "next/link";
import { ArrowRight } from "lucide-react";

// meetzi 컨셉 POC — 밝은 연블루 배경 + 플레이풀 포인트 도형 + 컬러풀 플랫 일러스트.
// (실제 unDraw 캐릭터 일러스트는 확정 후 우측 일러스트 자리에 교체 예정)
export function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#f3f6ff] px-6 pt-16 pb-24 md:px-12 md:pt-20 lg:px-24">
      {/* 흩뿌린 포인트 도형 (doodles) */}
      <svg aria-hidden className="pointer-events-none absolute left-[6%] top-[22%] h-6 w-6 -rotate-12 text-[#ffc63b]" viewBox="0 0 24 24" fill="none">
        <path d="M12 2 22 20 2 20Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
      </svg>
      <svg aria-hidden className="pointer-events-none absolute right-[8%] top-[10%] h-7 w-7 text-[#ff6b5e]" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" />
      </svg>
      <svg aria-hidden className="pointer-events-none absolute left-[46%] top-[8%] h-8 w-8 text-[#17c3b2]" viewBox="0 0 40 24" fill="none">
        <path d="M2 14C6 4 12 4 16 12s10 8 14-2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
      <div aria-hidden className="pointer-events-none absolute top-[46%] left-[2%] hidden grid-cols-4 gap-1.5 lg:grid">
        {Array.from({ length: 16 }).map((_, i) => (
          <span key={i} className="h-1.5 w-1.5 rounded-full bg-[#4f5be6]/45" />
        ))}
      </div>
      <svg aria-hidden className="pointer-events-none absolute bottom-[20%] right-[6%] h-7 w-7 text-[#4f5be6]" viewBox="0 0 24 24" fill="none">
        <path d="M12 4v16M4 12h16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      </svg>

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
        {/* 좌 — 카피 */}
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-[#4f5be6] shadow-sm ring-1 ring-[#4f5be6]/10">
            <span className="h-2 w-2 rounded-full bg-[#17c3b2]" />
            소상공인 웹사이트 파트너
          </span>

          <h1 className="mt-6 break-keep text-[clamp(2.5rem,5.6vw,4.25rem)] font-light leading-[1.12] tracking-tight text-[#1b2150]">
            웹사이트 제작,
            <br />
            <span className="font-extrabold text-[#4f5be6]">쉽고 빠르게.</span>
          </h1>

          <p className="mt-6 max-w-md break-keep text-lg leading-relaxed text-[#6b7194]">
            소상공인·1인 사업자를 위한 홈페이지·랜딩페이지 제작. 상담부터 유지보수·운영까지 직접 챙깁니다.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              href="/contact"
              data-gtm-cta="hero_contact"
              className="inline-flex items-center gap-2 rounded-full bg-[#4f5be6] px-7 py-3.5 font-semibold text-white shadow-[0_14px_30px_-10px_rgba(79,91,230,0.7)] transition-all hover:bg-[#3b46c9] active:scale-[0.98]"
            >
              무료 상담 시작
              <ArrowRight size={18} aria-hidden />
            </Link>
            <Link
              href="/portfolio"
              data-gtm-cta="hero_portfolio"
              className="inline-flex items-center gap-2 rounded-full border-2 border-[#4f5be6]/25 px-7 py-3.5 font-semibold text-[#4f5be6] transition-colors hover:border-[#4f5be6]"
            >
              포트폴리오 보기
            </Link>
          </div>

          <p className="mt-5 text-sm text-[#9096b5]">궁금한 것만 물어보셔도 괜찮아요.</p>
        </div>

        {/* 우 — 컬러풀 플랫 일러스트 (브라우저 + 떠 있는 요소) */}
        <div className="relative mx-auto w-full max-w-[480px]">
          {/* 브라우저 창 */}
          <div className="relative z-10 overflow-hidden rounded-2xl bg-white shadow-[0_40px_80px_-30px_rgba(27,33,80,0.35)] ring-1 ring-[#1b2150]/5">
            <div className="flex items-center gap-1.5 bg-[#f3f6ff] px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ff6b5e]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#ffc63b]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#34d17d]" />
              <div className="ml-3 h-5 flex-1 rounded-full bg-white" />
            </div>
            <div className="space-y-4 p-5">
              {/* 미니 히어로 */}
              <div className="grid grid-cols-[1.2fr_1fr] items-center gap-3">
                <div className="space-y-2">
                  <div className="h-3 w-4/5 rounded-full bg-[#1b2150]" />
                  <div className="h-3 w-3/5 rounded-full bg-[#c9cff5]" />
                  <div className="mt-2 h-6 w-24 rounded-full bg-[#4f5be6]" />
                </div>
                <div className="aspect-square rounded-xl bg-[linear-gradient(135deg,#17c3b2,#4f5be6)]" />
              </div>
              {/* 컬러 카드 3개 */}
              <div className="grid grid-cols-3 gap-3">
                {["#ffedd0", "#d5f7f2", "#e6e8ff"].map((c, i) => (
                  <div key={i} className="space-y-2 rounded-xl p-3" style={{ backgroundColor: c }}>
                    <div className="h-7 w-7 rounded-lg" style={{ backgroundColor: ["#ffc63b", "#17c3b2", "#4f5be6"][i] }} />
                    <div className="h-1.5 w-full rounded-full bg-white/70" />
                    <div className="h-1.5 w-3/5 rounded-full bg-white/70" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 떠 있는 차트 카드 */}
          <div className="absolute -bottom-6 -left-6 z-20 flex items-end gap-1.5 rounded-2xl bg-white p-3 shadow-[0_20px_40px_-16px_rgba(27,33,80,0.3)]">
            {[40, 62, 50, 78, 92].map((h, i) => (
              <span key={i} className="w-2.5 rounded-full" style={{ height: h / 3.2, backgroundColor: ["#c9cff5", "#c9cff5", "#17c3b2", "#4f5be6", "#4f5be6"][i] }} />
            ))}
          </div>

          {/* 떠 있는 채팅 버블 */}
          <div className="absolute -right-4 -top-5 z-20 flex items-center gap-2 rounded-2xl bg-white px-4 py-3 shadow-[0_20px_40px_-16px_rgba(27,33,80,0.3)]">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#34d17d]/15 text-sm text-[#34d17d]">✓</span>
            <div className="space-y-1">
              <div className="h-1.5 w-16 rounded-full bg-[#1b2150]/70" />
              <div className="h-1.5 w-10 rounded-full bg-[#c9cff5]" />
            </div>
          </div>

          {/* 배경 블롭 */}
          <div aria-hidden className="absolute -inset-6 -z-0 rounded-[3rem] bg-[radial-gradient(60%_60%_at_60%_40%,rgba(79,91,230,0.14),transparent_70%)]" />
        </div>
      </div>
    </section>
  );
}
