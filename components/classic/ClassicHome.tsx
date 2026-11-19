import { NavLink } from "@/components/classic/NavLink";
import {
  ArrowUpRight,
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
import { Suspense } from "react";
import { ContactForm } from "@/components/classic/contact/ContactForm";
import { PriceBand } from "@/components/classic/PriceBand";
import { maintenanceServices } from "@/data/classic/maintenance";

// 11-19 리뉴얼: 고객 화면은 짧게. 문장 한 줄(사용자 말 그대로), 주소 입력, 서비스 이름, 시작 금액, 납품 기준 이름만.
// 서비스 설명, 진행 절차, 자주 묻는 질문은 상세 페이지, /faq, llms.txt에 그대로 있다.

const NAVY = "#0f1b3d";

const serviceIcon: Record<string, LucideIcon> = { fix: Wrench, takeover: Repeat, update: ShieldCheck, monthly: CalendarCheck };

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

const strengths = ["원본 소스 제공", "점검 결과표", "인계 문서", "1개월 무상 관리"];

export function ClassicHome() {
  return (
    <div className="bg-white text-[#15171c]">
      <Hero />
      <Services />
      <PriceBand />
      <Strengths />
      <Contact />
    </div>
  );
}

function Hero() {
  return (
    <section aria-labelledby="c-hero" className="relative overflow-hidden text-white" style={{ backgroundColor: NAVY }}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div className="relative mx-auto w-full max-w-[1248px] px-4 py-20 md:px-6 md:py-32">
        <h1
          id="c-hero"
          className="max-w-[900px] break-keep text-[40px] font-[800] leading-[1.2] tracking-[-0.05em] md:text-[64px]"
        >
          번거로운 홈페이지 일, 맡기세요.
        </h1>
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

// 11-19 상담 신청서를 메인 맨 아래에 바로 둔다(버튼으로 다른 화면에 보내지 않기)
function Contact() {
  return (
    <section id="contact" aria-labelledby="c-contact" className="scroll-mt-20 border-t border-[#e6e9ee] bg-[#f6f7f9]">
      <div className="mx-auto w-full max-w-[1248px] px-4 py-16 md:px-6 md:py-24">
        <h2 id="c-contact" className="text-[30px] font-[800] leading-[1.25] tracking-[-0.04em] md:text-[40px]">
          맡기기
        </h2>
        <div className="mt-8 max-w-[720px]">
          <Suspense fallback={null}>
            <ContactForm />
          </Suspense>
        </div>
      </div>
    </section>
  );
}
