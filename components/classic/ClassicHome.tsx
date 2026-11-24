import Image from "next/image";
import { NavLink } from "@/components/classic/NavLink";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import { OnepageFreePromo } from "@/components/classic/OnepageFreePromo";
import { SiteBuilder } from "@/components/classic/SiteBuilder";
import { builderItems } from "@/components/classic/works/samples";
import { manualLog } from "@/data/classic/archive";
import { appPlans, kioskPlans, landingPlans, manwon, plans } from "@/data/classic/pricing";

// 11-24 원페이지 메인(사용자 "임팩트 있는 원페이지"): 첫 화면 3D 견적, 파는 것(제작, 유지보수와 시작 금액), 100일 무상 유지보수, 포트폴리오, 웹 지식.
// 서비스 설명, 비용 상세, 자주 묻는 질문은 각 페이지에 그대로 있고 여기서는 링크로 잇는다.

const wrap = "mx-auto w-full max-w-[1248px] px-4 md:px-6";
const h2c = "text-[26px] font-[800] tracking-[-0.05em] md:text-[38px]";

const make = [
  { href: "/homepage", name: "홈페이지 제작", body: "병원, 매장, 전문직, 기업, 학원", price: manwon(plans[0].price), from: true },
  { href: "/landing-page", name: "랜딩페이지 제작", body: "광고 상담, 예약 신청 접수", price: manwon(landingPlans[0].price), from: true },
  { href: "/program", name: "업무 프로그램 제작", body: "엑셀 반복 업무를 웹 프로그램으로", price: "견적 문의", from: false },
  { href: "/app", name: "앱 제작", body: "예약, 주문, 적립, 현장 보고", price: manwon(appPlans[0].price), from: true },
  { href: "/kiosk", name: "키오스크 화면 제작", body: "접수, 출결, 안내", price: manwon(kioskPlans[0].price), from: true },
  { href: "/3d", name: "3D 웹 제작", body: "제품 옵션 견적, 공간 3D", price: "180만 원", from: true },
];

const care = [
  { href: "/maintenance/fix", name: "유지보수", body: "수정 요청 건별 처리" },
  { href: "/maintenance/monthly", name: "유지관리", body: "정기 점검, 월간 보고" },
  { href: "/maintenance/perf", name: "성능 개선", body: "속도 진단, 쿼리 튜닝" },
  { href: "/maintenance/ai-site", name: "고도화", body: "MVP, 시제품 완제품화" },
];

const portfolio = [
  { href: "/sample/app-pilates", img: "/images/demos/app-pilates.jpg", kind: "앱", name: "필라테스 예약, 회원권 앱", alt: "필라테스 예약, 회원권 앱 화면" },
  { href: "/sample/kiosk-clinic", img: "/images/demos/kiosk-clinic.jpg", kind: "키오스크", name: "병원 접수 키오스크", alt: "병원 접수 키오스크 화면" },
  { href: "/sample/bakery-cafe", img: "/images/demos/bakery-cafe.jpg", kind: "홈페이지", name: "베이커리 홈페이지", alt: "베이커리 홈페이지 화면" },
  { href: "/sample/landing-water-rental", img: "/images/demos/landing-water-rental.jpg", kind: "랜딩페이지", name: "정수기 렌탈 상담 신청", alt: "정수기 렌탈 상담 랜딩페이지 화면" },
];

const strengths = ["원본 소스 제공", "점검 결과표", "인계 문서", "무상 하자보수"];

export function ClassicHome() {
  return (
    <div className="bg-white text-[#15171c]">
      <Hero />
      <Products />
      <Promise />
      <Portfolio />
      <OnepageFreePromo />
      <Knowledge />
    </div>
  );
}

function Hero() {
  return (
    <section aria-labelledby="c-hero" className="border-b border-[#e6e9ee]">
      <div className={`${wrap} pb-10 pt-8 md:pb-16 md:pt-12`}>
        <h1 id="c-hero" className="mb-6 break-keep text-[17px] font-bold tracking-[-0.02em] text-[#3d4450] md:mb-8 md:text-[19px]">
          홈페이지, 앱 제작과 유지보수
        </h1>
        <SiteBuilder items={builderItems()} />
      </div>
    </section>
  );
}

function Products() {
  return (
    <section aria-labelledby="c-products" className={`${wrap} py-14 md:py-24`}>
      <h2 id="c-products" className={h2c}>
        서비스
      </h2>
      <h3 className="mt-8 text-[16px] font-bold text-[#256ef4] md:mt-10">제작</h3>
      <ul className="mt-3 grid grid-cols-2 border-l border-t border-[#15171c] lg:grid-cols-3" role="list">
        {make.map((s) => (
          <li key={s.href} className="border-b border-r border-[#15171c]">
            <NavLink href={s.href} data-gtm-cta={`classic_service_${s.href.slice(1)}`} className="group flex h-full flex-col gap-4 px-3.5 py-4 sm:gap-6 sm:px-5 sm:py-6 md:px-7 md:py-8">
              <span className="flex items-start justify-between gap-3">
                <span>
                  <span className="block break-keep text-[17px] font-[800] leading-[1.3] tracking-[-0.04em] transition-colors group-hover:text-[#256ef4] sm:text-[21px] md:text-[24px]">{s.name}</span>
                  <span className="mt-1 hidden text-[15.5px] text-[#5b6370] sm:block md:text-[16px]">{s.body}</span>
                </span>
                <ArrowUpRight size={22} aria-hidden className="mt-1 hidden shrink-0 text-[#6b7280] transition-[color,transform] sm:block duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#256ef4] motion-reduce:transition-none" />
              </span>
              <span className="mt-auto whitespace-nowrap text-[19px] font-[800] tracking-[-0.04em] tabular-nums sm:text-[22px] md:text-[26px]">
                {s.price}
                {s.from ? <span className="ml-1 text-[13px] font-bold tracking-[-0.02em] sm:text-[15px] md:text-[16px]">부터</span> : null}
              </span>
            </NavLink>
          </li>
        ))}
      </ul>
      <div className="mt-10 grid gap-x-12 md:mt-14 md:grid-cols-[1fr_1.6fr]">
        <div>
          <h3 className="text-[16px] font-bold text-[#256ef4]">유지보수</h3>
          <p className="mt-3 text-[30px] font-[800] leading-none tracking-[-0.04em] tabular-nums md:text-[40px]">
            건별 10,000원<span className="ml-1.5 text-[18px] font-bold tracking-[-0.02em]">부터</span>
          </p>
          <p className="mt-2 text-[15px] text-[#5b6370]">부가세 별도</p>
        </div>
        <ul className="mt-6 border-t-2 border-[#15171c] md:mt-0" role="list">
          {care.map((s) => (
            <li key={s.href} className="border-b border-[#d9dee5]">
              <NavLink href={s.href} data-gtm-cta={`classic_service_${s.href.split(/[/#]/).pop()}`} className="group flex min-h-14 items-center justify-between gap-3 py-3.5">
                <span className="flex flex-wrap items-baseline gap-x-3"><span className="text-[17px] font-[800] tracking-[-0.03em] transition-colors group-hover:text-[#256ef4] md:text-[19px]">{s.name}</span><span className="text-[15px] text-[#5b6370]">{s.body}</span></span>
                <ArrowUpRight size={20} aria-hidden className="shrink-0 text-[#6b7280] group-hover:text-[#256ef4]" />
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Promise() {
  return (
    <section aria-labelledby="c-promise" className="border-y border-[#e6e9ee] bg-[#f4f6fa]">
      <h2 id="c-promise" className="sr-only">
        납품 기준
      </h2>
      <ul className={`${wrap} grid grid-cols-2 gap-x-4 gap-y-3 py-9 md:py-12 lg:grid-cols-4`} role="list">
        {strengths.map((s) => (
          <li key={s} className="flex items-center gap-2 text-[16px] font-[800] tracking-[-0.03em] md:text-[19px]">
            <CheckCircle2 aria-hidden className="size-5 shrink-0 text-[#256ef4] md:size-6" />
            {s}
          </li>
        ))}
      </ul>
    </section>
  );
}

function Portfolio() {
  return (
    <section aria-labelledby="c-portfolio" className={`${wrap} py-14 md:py-24`}>
      <div className="mb-7 flex items-baseline justify-between gap-3 md:mb-9">
        <h2 id="c-portfolio" className={h2c}>
          포트폴리오
        </h2>
        <NavLink href="/works" className="flex min-h-11 items-center gap-1 text-[16px] font-bold text-[#5b6370] hover:text-[#256ef4]">
          전체 보기 <ArrowUpRight size={18} aria-hidden />
        </NavLink>
      </div>
      <ul className="grid grid-cols-2 gap-x-3 gap-y-6 md:gap-x-7 md:gap-y-10" role="list">
        {portfolio.map((p) => (
          <li key={p.href}>
            <NavLink href={p.href} data-gtm-cta={`classic_portfolio_${p.href.split("/").filter(Boolean).pop()}`} className="group block">
              <span className="relative block aspect-[16/10] overflow-hidden rounded-[10px] bg-[#f4f6fa]">
                <Image src={p.img} alt={p.alt} fill sizes="50vw" className="object-cover transition-transform duration-500 ease-[cubic-bezier(.2,.7,.2,1)] group-hover:scale-[1.025] motion-reduce:transition-none" />
              </span>
              <span className="block pt-2.5 md:flex md:items-baseline md:gap-2.5 md:pt-3">
                <span className="block shrink-0 text-[13px] font-bold text-[#256ef4] md:text-[14px]">{p.kind}</span>
                <span className="block min-w-0 flex-1 break-keep text-[16px] font-[800] leading-[1.35] tracking-[-0.04em] md:text-[21px]">{p.name}</span>
                <span className="hidden shrink-0 text-[15px] font-bold text-[#5b6370] group-hover:text-[#256ef4] md:block">상세보기</span>
              </span>
            </NavLink>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Knowledge() {
  const posts = manualLog.slice(0, 4);
  return (
    <section aria-labelledby="c-knowledge" className={`${wrap} py-14 md:py-24`}>
      <div className="mb-6 flex items-baseline justify-between gap-3 md:mb-8">
        <h2 id="c-knowledge" className={h2c}>
          웹 지식
        </h2>
        <NavLink href="/knowledge" className="flex min-h-11 items-center gap-1 text-[16px] font-bold text-[#5b6370] hover:text-[#256ef4]">
          전체 보기 <ArrowUpRight size={18} aria-hidden />
        </NavLink>
      </div>
      <ul className="border-t-2 border-[#15171c]" role="list">
        {posts.map((p) => (
          <li key={p.href} className="border-b border-[#d9dee5]">
            <NavLink href={p.href} className="group grid gap-x-6 gap-y-0.5 py-4 md:grid-cols-[110px_1fr_auto] md:items-baseline md:py-5">
              <span className="text-[14px] font-bold text-[#256ef4] md:text-[15px]">{p.kind}</span>
              <span className="break-keep text-[17px] font-[800] tracking-[-0.03em] transition-colors group-hover:text-[#256ef4] md:text-[19px]">{p.title}</span>
              <span className="text-[14px] tabular-nums text-[#5b6370]">{p.date.replaceAll("-", ".")}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </section>
  );
}
