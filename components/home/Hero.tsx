import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { HeroMockup } from "@/components/home/HeroMockup";

// 서버 컴포넌트 + CSS 애니메이션.
// H1은 LCP 요소라 애니메이션 없이 즉시 렌더하고, 보조 요소만 fade-up으로 등장시킨다.
export function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pt-24 pb-20 md:px-12 md:pt-32 md:pb-24 lg:px-24 lg:pt-36">
      {/* 배경 그라디언트 */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_50%_at_30%_-10%,rgba(0,113,227,0.1),transparent)] dark:bg-[radial-gradient(ellipse_70%_50%_at_30%_-10%,rgba(41,151,255,0.14),transparent)]"
      />

      <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="flex flex-col items-start gap-6">
          <span
            className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-1.5 text-sm text-foreground-secondary"
            style={{ animationDelay: "0.1s" }}
          >
            <span
              className="h-2 w-2 rounded-full bg-success animate-pulse motion-reduce:animate-none"
              aria-hidden
            />
            AI 활용 · 15년+ 운영 개발
          </span>

          <h1 className="text-4xl font-semibold leading-[1.15] tracking-tight text-foreground sm:text-5xl lg:text-[3.4rem]">
            사업에 필요한 웹사이트,
            <br />
            <span className="bg-gradient-to-r from-accent to-accent-hover bg-clip-text text-transparent">
              빠르게 만들고 오래 운영합니다
            </span>
          </h1>

          <p
            className="animate-fade-up max-w-xl text-lg leading-relaxed text-foreground-secondary"
            style={{ animationDelay: "0.18s" }}
          >
            소상공인·1인 사업자를 위한 홈페이지, 랜딩페이지, 예약·관리 시스템.
            AI를 적극 활용하는 15년차 운영 개발자가 제작부터 유지보수, 자동화,
            SEO까지 함께합니다.
          </p>

          <div
            className="animate-fade-up flex flex-wrap items-center gap-3 pt-1"
            style={{ animationDelay: "0.26s" }}
          >
            <Button href="/contact" data-gtm-cta="hero_contact">
              상담 문의하기
              <ArrowRight size={18} aria-hidden />
            </Button>
            <Button href="#showcase" variant="outline" data-gtm-cta="hero_demo">
              데모 직접 체험
            </Button>
          </div>

          <p
            className="animate-fade-up text-sm text-foreground-tertiary"
            style={{ animationDelay: "0.34s" }}
          >
            상담과 견적은 무료입니다.
          </p>
        </div>

        {/* 목업은 데스크톱에서만 — 모바일 LCP 보호 */}
        <div className="animate-fade-up hidden lg:block" style={{ animationDelay: "0.3s" }}>
          <HeroMockup />
        </div>
      </div>
    </section>
  );
}
