import { NavLink } from "@/components/classic/NavLink";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import { Suspense } from "react";
import { ContactForm } from "@/components/classic/contact/ContactForm";
import { appPlans, kioskPlans, landingPlans, manwon, plans } from "@/data/classic/pricing";

// 11-25 랜딩 수준 메인(사용자 "랜딩 수준으로 심플하게, 카탈로그, 웹 지식 별도 서비스로 분리"): 건별 수정 띠, 한 줄 소개와 상담 버튼, 파는 것과 시작 금액, 납품 기준, 원페이지 무료 제작 (마지막 상담 띠는 공통 바닥글 위에 이미 있다).
// 시안 고르기(SiteBuilder)와 포트폴리오는 카탈로그(/works)로, 웹 지식은 /knowledge로 따로 둔다.
// 서비스 설명, 비용 상세, 자주 묻는 질문은 각 페이지에 그대로 있고 여기서는 링크로 잇는다.

const wrap = "mx-auto w-full max-w-[1248px] px-4 md:px-6";
const h2c = "text-[26px] font-[800] tracking-[-0.05em] md:text-[38px]";

const make = [
  { href: "/homepage", name: "홈페이지 제작", body: "병원, 매장, 전문직, 기업, 학원", price: manwon(plans[0].price), from: true },
  { href: "/landing-page", name: "랜딩페이지 제작", body: "광고 상담과 예약 신청 접수", price: manwon(landingPlans[0].price), from: true },
  { href: "/program", name: "업무 프로그램 제작", body: "엑셀 반복 업무를 웹 프로그램으로", price: "견적 문의", from: false },
  { href: "/app", name: "앱 제작", body: "예약, 주문, 적립, 현장 보고", price: manwon(appPlans[0].price), from: true },
  { href: "/kiosk", name: "키오스크 화면 제작", body: "접수, 출결, 안내", price: manwon(kioskPlans[0].price), from: true },
  { href: "/3d", name: "3D 웹 제작", body: "제품 옵션 견적과 공간 3D", price: "180만 원", from: true },
];

const care = [
  { href: "/maintenance/fix", name: "유지보수", body: "수정 요청 건별 처리" },
  { href: "/maintenance/monthly", name: "유지관리", body: "정기 점검과 월간 보고" },
  { href: "/maintenance/perf", name: "성능 개선", body: "속도 진단과 쿼리 튜닝" },
  { href: "/maintenance/ai-site", name: "고도화", body: "MVP와 시제품 완제품화" },
];


const strengths = ["원본 소스 제공", "점검 결과표", "인계 문서", "무상 하자보수"];

export function ClassicHome() {
  return (
    <div className="bg-white text-[#15171c]">
      <Hero />
      <Products />
      <Promise />
      <Apply />
    </div>
  );
}

function Hero() {
  return (
    <section aria-labelledby="c-hero" className="border-b border-[#e6e9ee]">
      {/* 11-25 첫 주문 입구: 건별 수정(유지보수 페이지와 같은 금액) */}
      <div className="bg-[#15171c] text-white">
        <div className={`${wrap} flex flex-col gap-3 py-4 md:flex-row md:items-center md:justify-between`}>
          <p className="break-keep text-[16px] leading-[1.5] md:text-[18px]">
            <b className="font-[800]">홈페이지 수정 1건 10,000원부터.</b>{" "}
            <span className="text-[#c9ced6]">아임웹, 카페24, 워드프레스, AI로 만든 사이트까지 금액을 먼저 안내합니다.</span>
          </p>
          <div className="flex shrink-0 gap-2">
            <a href="#apply" className="inline-flex min-h-[44px] items-center rounded-md bg-white px-4 text-[15px] font-bold text-[#15171c] hover:bg-[#e8ecf2]">
              수정 요청하기
            </a>
            <NavLink href="/maintenance/fix" className="inline-flex min-h-[44px] items-center rounded-md border border-[#5b6370] px-4 text-[15px] font-bold text-white hover:border-white">
              금액 보기
            </NavLink>
          </div>
        </div>
      </div>
      <div className={`${wrap} pb-14 pt-12 md:pb-24 md:pt-20`}>
        <h1 id="c-hero" className="break-keep text-[34px] font-[800] leading-[1.2] tracking-[-0.05em] md:text-[56px]">
          홈페이지 제작과 유지보수
        </h1>
        <p className="mt-4 max-w-[640px] break-keep text-[17px] leading-[1.6] text-[#3d4450] md:mt-5 md:text-[20px]">
          새로 만들 때도, 이미 있는 사이트를 고칠 때도 금액과 일정을 먼저 안내하고 시작합니다. 원본 소스와 인계 문서까지 드립니다.
        </p>
        <div className="mt-7 flex flex-wrap gap-2.5 md:mt-9">
          <a href="#apply" data-gtm-cta="classic_hero_contact" className="inline-flex min-h-[52px] items-center rounded-md bg-[#256ef4] px-6 text-[17px] font-bold text-white hover:bg-[#0b50d0]">
            상담 신청
          </a>
          <NavLink href="/works" data-gtm-cta="classic_hero_catalog" className="inline-flex min-h-[52px] items-center gap-1 rounded-md border-2 border-[#15171c] px-6 text-[17px] font-bold text-[#15171c] hover:bg-[#f4f6fa]">
            카탈로그 보기 <ArrowUpRight size={19} aria-hidden />
          </NavLink>
        </div>
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
      {/* 11-25 메뉴 순서와 같게 유지보수 먼저(11-06, 11-12 대표 결정) */}
      <div className="mt-8 grid gap-x-12 md:mt-10 md:grid-cols-[1fr_1.6fr]">
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
      <h3 className="mt-12 text-[16px] font-bold text-[#256ef4] md:mt-16">제작</h3>
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

function Apply() {
  return (
    <section id="apply" aria-labelledby="c-apply" className="scroll-mt-20 bg-[#f4f6fa]">
      <div className={`${wrap} grid gap-8 py-14 md:grid-cols-[1fr_1.4fr] md:gap-12 md:py-24`}>
        <div>
          <h2 id="c-apply" className={h2c}>
            상담 신청
          </h2>
          <p className="mt-3 break-keep text-[17px] leading-[1.6] text-[#3d4450]">
            이름과 연락처, 어떤 일인지 한 줄만 남겨 주세요. 확인 후 금액과 일정을 먼저 안내합니다.
          </p>
        </div>
        <div className="min-w-0 rounded-[10px] border border-[#e6e9ee] bg-white p-5 md:p-8">
          {/* 폼이 주소의 ?site= 를 읽어서(useSearchParams) 정적 내보내기에는 Suspense가 있어야 한다 */}
          <Suspense fallback={null}>
            <ContactForm />
          </Suspense>
        </div>
      </div>
    </section>
  );
}
