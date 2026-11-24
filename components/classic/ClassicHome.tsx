import Image from "next/image";
import { NavLink } from "@/components/classic/NavLink";
import {
  ArrowUpRight,
  Bot,
  Box,
  CalendarCheck,
  CheckCircle2,
  Megaphone,
  MonitorSmartphone,
  Workflow,
  Repeat,
  Smartphone,
  TabletSmartphone,
  ShieldCheck,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { OnepageFreePromo } from "@/components/classic/OnepageFreePromo";
import { PriceBand } from "@/components/classic/PriceBand";
import { maintenanceServices } from "@/data/classic/maintenance";

// 11-19 리뉴얼: 고객 화면은 짧게. 문장 한 줄(사용자 말 그대로), 주소 입력, 서비스 이름, 시작 금액, 납품 기준 이름만.
// 서비스 설명, 진행 절차, 자주 묻는 질문은 상세 페이지, /faq, llms.txt에 그대로 있다.

const serviceIcon: Record<string, LucideIcon> = { fix: Wrench, takeover: Repeat, "ai-site": Bot, update: ShieldCheck, monthly: CalendarCheck };

const care = [...maintenanceServices]
  .sort((a, b) => (b.id === "takeover" ? 1 : 0) - (a.id === "takeover" ? 1 : 0))
  .map((m) => ({ href: `/maintenance/${m.id}`, name: m.h1, icon: serviceIcon[m.id] ?? Wrench }));

const make = [
  { href: "/homepage", name: "홈페이지 제작", icon: MonitorSmartphone },
  { href: "/landing-page", name: "랜딩페이지 제작", icon: Megaphone },
  { href: "/program", name: "업무 프로그램 제작", icon: Workflow },
  { href: "/app", name: "앱 제작", icon: Smartphone },
  { href: "/kiosk", name: "키오스크 화면 제작", icon: TabletSmartphone },
  { href: "/3d", name: "3D 웹 제작", icon: Box },
];

const strengths = ["원본 소스 제공", "점검 결과표", "인계 문서", "100일 무상 유지보수"];

export function ClassicHome() {
  return (
    <div className="bg-white text-[#15171c]">
      <Hero />
      <Portfolio />
      <Process />
      <OnepageFreePromo />
      <Services />
      <PriceBand />
      <Strengths />
    </div>
  );
}

function Hero() {
  return (
    <section aria-labelledby="c-hero" className="border-b border-[#e6e9ee]">
      <div className="mx-auto w-full max-w-[1248px] px-4 pb-12 pt-14 md:px-6 md:pb-20 md:pt-24">
        <h1 id="c-hero" className="max-w-[15em] break-keep text-[36px] font-[800] leading-[1.2] tracking-[-0.055em] md:text-[68px]">
          <span className="inline-block">홈페이지, 앱 제작과</span>{" "}
          <span className="inline-block shadow-[inset_0_-0.34em_0_#cfe0ff] [.gp-dark_&]:shadow-[inset_0_-0.34em_0_#1f3f8a]">오픈 후 100일</span>{" "}
          <span className="inline-block shadow-[inset_0_-0.34em_0_#cfe0ff] [.gp-dark_&]:shadow-[inset_0_-0.34em_0_#1f3f8a]">무상 유지보수</span>
        </h1>
        <div className="mt-8 flex flex-wrap gap-2.5 md:mt-10">
          <NavLink href="/contact" data-gtm-cta="classic_hero_contact" className="inline-flex h-14 items-center rounded-md bg-[#256ef4] px-7 text-[17px] font-bold text-white transition-colors hover:bg-[#0b50d0] md:text-[18px]">
            상담 신청
          </NavLink>
          <NavLink href="/works" data-gtm-cta="classic_hero_works" className="inline-flex h-14 items-center rounded-md px-7 text-[17px] font-bold shadow-[inset_0_0_0_1.5px_#15171c] [.gp-dark_&]:shadow-[inset_0_0_0_1.5px_#e8ebf0] md:text-[18px]">
            포트폴리오 보기
          </NavLink>
        </div>
      </div>
    </section>
  );
}

// 11-24 첫 화면에 만든 화면을 먼저 보여 준다. 3D 견적을 맨 앞에 크게 둔다.
const portfolio = [
  { href: "/3d/sofa/", img: "/3d/assets/thumb/sofa.jpg", kind: "3D 웹", name: "가구 3D 견적", alt: "소파 구성을 바꾸면 폭과 금액이 바뀌는 3D 견적 화면" },
  { href: "/sample/app-pilates", img: "/images/demos/app-pilates.jpg", kind: "앱", name: "필라테스 예약, 회원권 앱", alt: "필라테스 예약, 회원권 앱 화면" },
  { href: "/sample/kiosk-clinic", img: "/images/demos/kiosk-clinic.jpg", kind: "키오스크", name: "병원 접수 키오스크", alt: "병원 접수 키오스크 화면" },
  { href: "/sample/bakery-cafe", img: "/images/demos/bakery-cafe.jpg", kind: "홈페이지", name: "베이커리 홈페이지", alt: "베이커리 홈페이지 화면" },
  { href: "/sample/landing-water-rental", img: "/images/demos/landing-water-rental.jpg", kind: "랜딩페이지", name: "정수기 렌탈 상담 신청", alt: "정수기 렌탈 상담 랜딩페이지 화면" },
];

function Portfolio() {
  return (
    <section aria-labelledby="c-portfolio" className="mx-auto w-full max-w-[1248px] px-4 py-14 md:px-6 md:py-24">
      <div className="mb-7 flex items-baseline justify-between gap-3 md:mb-9">
        <h2 id="c-portfolio" className="text-[26px] font-[800] tracking-[-0.05em] md:text-[36px]">
          포트폴리오
        </h2>
        <NavLink href="/works" className="flex min-h-11 items-center gap-1 text-[16px] font-bold text-[#5b6370] hover:text-[#256ef4]">
          전체 보기 <ArrowUpRight size={18} aria-hidden />
        </NavLink>
      </div>
      <ul className="grid gap-7 md:grid-cols-2 md:gap-x-7 md:gap-y-10" role="list">
        {portfolio.map((p, i) => (
          <li key={p.href} className={i === 0 ? "md:col-span-2" : ""}>
            <NavLink href={p.href} data-gtm-cta={`classic_portfolio_${p.href.split("/").filter(Boolean).pop()}`} className="group block">
              <span className="relative block aspect-[16/10] overflow-hidden rounded-[10px] bg-[#f4f6fa]">
                <Image src={p.img} alt={p.alt} fill priority={i === 0} sizes={i === 0 ? "(min-width: 1248px) 1200px, 100vw" : "(min-width: 768px) 50vw, 100vw"} className="object-cover transition-transform duration-500 ease-[cubic-bezier(.2,.7,.2,1)] group-hover:scale-[1.025] motion-reduce:transition-none" />
              </span>
              <span className="flex items-baseline gap-2.5 pt-3">
                <span className="shrink-0 text-[14px] font-bold text-[#256ef4]">{p.kind}</span>
                <span className="min-w-0 flex-1 text-[19px] font-[800] tracking-[-0.04em] md:text-[21px]">{p.name}</span>
                <span className="shrink-0 text-[15px] font-bold text-[#5b6370] group-hover:text-[#256ef4]">상세보기</span>
              </span>
            </NavLink>
          </li>
        ))}
      </ul>
    </section>
  );
}

const steps = [
  { when: "계약~오픈", name: "제작", body: "기획, 디자인, 퍼블리싱, 개발, 검수" },
  { when: "오픈 후 100일", name: "100일 무상 유지보수", body: "기능 수정, 개선, 접속 통계 분석, 주간 보고", on: true },
  { when: "이후", name: "월 유지보수", body: "정기 점검, 수정 요청 처리, 월간 점검 보고서" },
];

function Process() {
  return (
    <section aria-labelledby="c-process" className="border-t border-[#e6e9ee]">
      <div className="mx-auto w-full max-w-[1248px] px-4 py-14 md:px-6 md:py-24">
        <h2 id="c-process" className="mb-7 text-[26px] font-[800] tracking-[-0.05em] md:mb-9 md:text-[36px]">
          진행 절차
        </h2>
        <ol className="grid border-t-2 border-[#15171c] lg:grid-cols-3 lg:gap-7 lg:border-t-0" role="list">
          {steps.map((s) => (
            <li key={s.name} className="border-b border-[#d9dee5] py-5 lg:border-b-0 lg:border-t-2 lg:border-[#15171c]">
              <p className={`text-[15px] font-bold ${s.on ? "text-[#256ef4]" : "text-[#5b6370]"}`}>{s.when}</p>
              <h3 className="mt-1 text-[21px] font-[800] tracking-[-0.04em] md:text-[23px]">
                {s.on ? <span className="shadow-[inset_0_-0.34em_0_#cfe0ff] [.gp-dark_&]:shadow-[inset_0_-0.34em_0_#1f3f8a]">{s.name}</span> : s.name}
              </h3>
              <p className="mt-1.5 text-[16px] text-[#5b6370] md:text-[17px]">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Services() {
  return (
    <section
      aria-labelledby="c-services"
      className="mx-auto w-full max-w-[1248px] px-4 py-16 md:px-6 md:py-24"
    >
      <h2 id="c-services" className="sr-only">
        서비스
      </h2>
      <div className="grid gap-12 md:grid-cols-2 md:gap-16">
        {[
          { label: "유지보수", items: care },
          { label: "제작", items: make },
        ].map((g) => (
          <div key={g.label}>
            <h3 className="mb-4 text-[15px] font-bold text-[#256ef4]">{g.label}</h3>
            <ul className="border-t-2 border-[#15171c]" role="list">
              {g.items.map((s) => (
                <li key={s.name} className="border-b border-[#d9dee5]">
                  <NavLink
                    href={s.href}
                    data-gtm-cta={`classic_service_${s.href.split("/").filter(Boolean).pop()}`}
                    className="group flex min-h-16 items-center gap-3 py-4"
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#e8efff] text-[#256ef4]">
                      <s.icon aria-hidden className="size-5" />
                    </span>
                    <span className="flex-1 text-[18px] font-[800] tracking-[-0.03em] transition-colors group-hover:text-[#256ef4] md:text-[20px]">
                      {s.name}
                    </span>
                    <ArrowUpRight
                      size={22}
                      aria-hidden
                      className="text-[#6b7280] transition-[color,transform] duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#256ef4]"
                    />
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

function Strengths() {
  return (
    <section aria-labelledby="c-strengths" className="border-t border-[#e6e9ee]">
      <h2 id="c-strengths" className="sr-only">
        납품 기준
      </h2>
      <ul
        className="mx-auto grid w-full max-w-[1248px] grid-cols-2 gap-x-4 gap-y-3 px-4 py-10 md:px-6 md:py-14 lg:grid-cols-4"
        role="list"
      >
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
