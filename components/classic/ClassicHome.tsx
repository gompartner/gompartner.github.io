import Image from "next/image";
import { NavLink } from "@/components/classic/NavLink";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import { Suspense } from "react";
import { ContactForm } from "@/components/classic/contact/ContactForm";
import { JobApply } from "@/components/classic/JobApply";
import { HeroSwitch } from "@/components/classic/HeroSwitch";
import { HeroBuild } from "@/components/classic/HeroBuild";
import { appPlans, manwon, plans } from "@/data/classic/pricing";

// 11-25 메인은 전문 개발사 홈페이지 형식의 한 페이지(사용자 "랜딩페이지로", "트렌드에 맞게", "전문 개발사 홈페이지").
// 순서: 첫 화면(미국 개발사 형식: 어두운 배경, 결과 중심 한 줄, 15분 상담, 결과물 띠) > 서비스 4가지와 시작 금액 > 맡기는 이유 4가지 > 기술 > 포트폴리오 > 진행 방식 > 납품 기준 > 자주 묻는 질문 > 프로젝트 문의 신청서.
// 머리글은 로고와 상담 신청만(ClassicHeader의 landing). 신청은 이 페이지 맨 아래 신청서에서 끝낸다.

const wrap = "mx-auto w-full max-w-[1248px] px-4 md:px-6";
const h2c = "break-keep text-[28px] font-[800] leading-[1.25] tracking-[-0.05em] md:text-[44px]";
const eyebrow = "text-[14px] font-bold uppercase tracking-[0.08em] text-[#256ef4] md:text-[15px]";

// 결과물 띠와 포트폴리오에 쓰는 실제 샘플 화면(카탈로그)
const works = [
  { href: "/sample/dental-homepage", img: "/images/demos/dental-homepage.jpg", kind: "홈페이지", name: "치과 홈페이지" },
  { href: "/sample/logistics", img: "/images/demos/logistics.jpg", kind: "기업 홈페이지", name: "물류 기업 홈페이지" },
  { href: "/sample/saas-startup", img: "/images/demos/saas-startup.jpg", kind: "서비스 소개", name: "SaaS 서비스 소개" },
  { href: "/sample/app-pilates", img: "/images/demos/app-pilates.jpg", kind: "앱", name: "필라테스 예약 앱" },
  { href: "/sample/tax-office", img: "/images/demos/tax-office.jpg", kind: "전문직", name: "세무사무소 홈페이지" },
  { href: "/sample/online-store", img: "/images/demos/online-store.jpg", kind: "쇼핑몰", name: "온라인 쇼핑몰" },
  { href: "/sample/kiosk-clinic", img: "/images/demos/kiosk-clinic.jpg", kind: "키오스크", name: "병원 접수 키오스크" },
  { href: "/sample/landing-move-clean", img: "/images/demos/landing-move-clean.jpg", kind: "랜딩페이지", name: "입주 청소 상담 신청" },
];

const services = [
  { name: "웹사이트 제작", body: "기업, 병원, 전문직, 쇼핑몰 홈페이지와 광고용 랜딩페이지. 반응형 화면과 검색엔진 등록까지", price: `${manwon(plans[0].price)}부터`, href: "/homepage", big: true },
  { name: "업무 시스템 개발", body: "엑셀로 하던 정산, 재고, 접수, 견적 업무를 웹 관리자 화면으로", price: "요구사항 확인 후 견적", href: "/program", big: false },
  { name: "앱 개발", body: "예약, 주문, 적립, 현장 보고 앱", price: `${manwon(appPlans[0].price)}부터`, href: "/app", big: false },
  { name: "유지보수와 고도화", body: "수정 건별 처리, 오류 해결, 서버 이전, AI 도구로 만든 서비스의 운영 준비", price: "건별 10,000원부터", href: "/maintenance", big: true },
];

// 11-25 개발사 고르는 기준(운영 중인 포트폴리오, 실제 참여 인력, 투입 구조)에 맞춘 이유 4가지. 숫자, 고객사 로고는 실제 실적이 생기면 넣는다
const reasons = [
  { name: "상담한 사람이 직접 개발합니다", body: "중간 관리자 없이 개발 책임자가 요구사항 정의부터 배포까지 맡습니다. 전달 과정에서 빠지는 내용이 없습니다." },
  { name: "견적을 작업 항목별로 나눕니다", body: "화면, 기능, 데이터 정리, 유지보수를 항목별 금액으로 보여 드립니다. 무엇에 비용이 드는지 계약 전에 확인할 수 있습니다." },
  { name: "운영을 기준으로 설계합니다", body: "오픈 뒤 수정, 백업, 서버 이전까지 고려해 구조를 잡습니다. 유지보수 비용이 덜 드는 방식으로 만듭니다." },
  { name: "소스와 계정은 고객 것입니다", body: "원본 소스, 서버, 도메인 계정을 고객 명의로 인계합니다. 다른 업체로 옮겨도 그대로 이어서 쓸 수 있습니다." },
];

const stack = ["Next.js", "React", "TypeScript", "Node.js", "PHP", "PostgreSQL", "MySQL", "Cloudflare", "AWS", "워드프레스", "그누보드", "아임웹", "카페24"];

const steps = [
  { name: "요구사항 정의", body: "만들 범위와 우선순위를 문서로 정리합니다." },
  { name: "견적과 일정", body: "범위에 맞춘 금액과 일정을 먼저 확정합니다." },
  { name: "설계와 개발", body: "화면 설계를 확인받은 뒤 개발하고 중간 결과를 공유합니다." },
  { name: "테스트와 배포", body: "점검 결과표로 확인한 뒤 운영 서버에 배포합니다." },
  { name: "인계와 운영", body: "원본 소스와 인계 문서를 드리고 하자보수 기간 동안 무상으로 고칩니다." },
];

const deliver = ["원본 소스 제공", "점검 결과표", "인계 문서", "무상 하자보수", "계약서와 세금계산서"];

const faqs = [
  { q: "어떤 사이트까지 손볼 수 있나요?", a: "아임웹, 카페24, 워드프레스, 그누보드 같은 빌더와 설치형 사이트, 직접 개발한 사이트(PHP, Next.js 등)까지 확인합니다. 작업이 어려운 경우에는 비용 없이 바로 알려 드립니다." },
  { q: "금액은 언제 정해지나요?", a: "작업 전에 정합니다. 요구사항이나 사이트를 확인한 뒤 금액과 일정을 안내하고, 동의하신 뒤에 시작합니다." },
  { q: "계약서와 세금계산서를 받을 수 있나요?", a: "개인사업자(일반과세) 곰파트너 명의로 계약서와 세금계산서를 발행합니다." },
  { q: "개발 후 소스와 계정은 누구 것인가요?", a: "원본 소스와 서버, 도메인 계정은 모두 고객 명의로 인계합니다." },
];

export function ClassicHome() {
  return (
    <div className="bg-white text-[#15171c]">
      <Suspense fallback={<HeroUs />}>
        <HeroSwitch kr={<HeroKr />} jp={<HeroJp />} us={<HeroUs />} build={<HeroBuild />} />
      </Suspense>
      <Services />
      <Why />
      <Stack />
      <Portfolio />
      <Process />
      <Faq />
      <Apply />
    </div>
  );
}

function HeroUs() {
  const strip = [...works, ...works];
  return (
    // 11-25 미국 개발사 홈페이지 흐름: 어두운 첫 화면, 결과 중심 한 줄, 통화 상담 버튼, 움직이는 결과물 화면
    <section aria-labelledby="c-hero" className="relative isolate overflow-hidden bg-[#0b0d12] text-white">
      {/* 위쪽 가운데 은은한 파란 빛(색 하나, 보라 그러데이션 없음) */}
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-[-260px] -z-10 h-[620px] w-[1100px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(37,110,244,.35),transparent)]" />
      <div className={`${wrap} pb-12 pt-16 text-center md:pb-16 md:pt-28`}>
        <p className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-1.5 text-[14px] font-bold text-[#c9ced6] md:text-[15px]">
          웹, 앱 개발과 유지보수
        </p>
        <h1 id="c-hero" className="mx-auto mt-6 max-w-[900px] break-keep text-[38px] font-[800] leading-[1.12] tracking-[-0.055em] md:text-[76px]">
          아이디어를
          <br />
          운영되는 서비스로
        </h1>
        <p className="mx-auto mt-6 max-w-[640px] break-keep text-[17px] leading-[1.7] text-[#aab2bf] md:text-[20px]">
          홈페이지, 업무 시스템, 앱을 기획부터 오픈, 운영까지 맡습니다. 개발 책임자가 직접 만들고 원본 소스와 인계 문서까지 드립니다.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-2.5 md:mt-11">
          <a href="#apply" data-gtm-cta="classic_hero_contact" className="inline-flex min-h-[54px] items-center rounded-full bg-white px-7 text-[17px] font-bold text-[#0b0d12] hover:bg-[#e8ecf2]">
            15분 무료 상담 신청
          </a>
          <a href="#portfolio" className="inline-flex min-h-[54px] items-center rounded-full border border-white/25 px-7 text-[17px] font-bold text-white hover:border-white">
            포트폴리오 보기
          </a>
        </div>
      </div>
      <div aria-hidden className="pb-16 md:pb-24 [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
        <ul className="gp-marquee flex w-max gap-4 md:gap-6" role="list">
          {strip.map((w, i) => (
            <li key={`${w.href}-${i}`} className="relative aspect-[16/10] w-[260px] shrink-0 overflow-hidden rounded-[12px] border border-white/10 md:w-[420px]">
              <Image src={w.img} alt="" fill sizes="420px" className="object-cover" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// 한국 개발사형(똑똑한개발자 등): 밝은 배경, 왼쪽 정렬 큰 제목, 문의와 포트폴리오 버튼, 결과물 띠
function HeroKr() {
  const strip = [...works, ...works];
  return (
    <section aria-labelledby="c-hero" className="overflow-hidden bg-white">
      <div className={`${wrap} pb-12 pt-14 md:pb-16 md:pt-24`}>
        <p className={eyebrow}>Web, App Development</p>
        <h1 id="c-hero" className="mt-4 break-keep text-[38px] font-[800] leading-[1.15] tracking-[-0.055em] md:text-[72px]">
          웹과 앱을 만들고
          <br />
          운영까지 맡습니다
        </h1>
        <p className="mt-6 max-w-[640px] break-keep text-[17px] leading-[1.7] text-[#3d4450] md:text-[20px]">
          홈페이지, 업무 시스템, 앱 개발과 유지보수. 개발 책임자가 상담부터 배포, 운영까지 직접 맡고 원본 소스와 인계 문서까지 드립니다.
        </p>
        <div className="mt-8 flex flex-wrap gap-2.5 md:mt-10">
          <a href="#apply" data-gtm-cta="classic_hero_contact" className="inline-flex min-h-[54px] items-center rounded-md bg-[#256ef4] px-7 text-[17px] font-bold text-white hover:bg-[#0b50d0]">
            프로젝트 문의
          </a>
          <a href="#portfolio" className="inline-flex min-h-[54px] items-center rounded-md border-2 border-[#15171c] px-7 text-[17px] font-bold text-[#15171c] hover:bg-[#f4f6fa]">
            포트폴리오 보기
          </a>
        </div>
      </div>
      <div aria-hidden className="pb-14 md:pb-20">
        <ul className="gp-marquee flex w-max gap-4 md:gap-6" role="list">
          {strip.map((w, i) => (
            <li key={`${w.href}-${i}`} className="relative aspect-[16/10] w-[260px] shrink-0 overflow-hidden rounded-[10px] border border-[#e6e9ee] shadow-[0_6px_18px_rgba(21,23,28,.08)] md:w-[400px]">
              <Image src={w.img} alt="" fill sizes="400px" className="object-cover" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// 일본 기업 사이트형: 넓은 여백, 영어 큰 글자와 한국어 한 줄, 번호 붙은 소제목, 가는 선, 차분한 색, 오른쪽에 결과물 한 장
function HeroJp() {
  return (
    <section aria-labelledby="c-hero" className="border-b border-[#d9dee5] bg-[#fafaf8]">
      <div className={`${wrap} grid gap-12 pb-20 pt-20 md:pb-32 md:pt-32 lg:grid-cols-[1.1fr_1fr] lg:items-end`}>
        <div>
          <p className="flex items-center gap-3 text-[13px] font-bold tracking-[0.2em] text-[#5b6370]">
            <span className="h-px w-10 bg-[#5b6370]" aria-hidden />
            GOMPARTNER WEB DEVELOPMENT
          </p>
          <p aria-hidden className="mt-8 text-[56px] font-[300] leading-[1.02] tracking-[-0.04em] text-[#15171c] md:text-[104px]">
            Build,
            <br />
            Run, Care.
          </p>
          <h1 id="c-hero" className="mt-8 break-keep text-[22px] font-[700] leading-[1.6] tracking-[-0.03em] md:text-[28px]">
            만들고, 운영하고, 돌봅니다.
          </h1>
          <p className="mt-4 max-w-[520px] break-keep text-[16px] leading-[1.9] text-[#5b6370] md:text-[17px]">
            홈페이지, 업무 시스템, 앱을 기획부터 오픈, 운영까지 개발 책임자가 직접 맡습니다. 오래 쓰는 시스템을 기준으로 설계합니다.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-6">
            <a href="#apply" data-gtm-cta="classic_hero_contact" className="inline-flex min-h-[54px] items-center gap-3 border-b-2 border-[#15171c] pb-1 text-[17px] font-bold text-[#15171c] hover:text-[#256ef4] hover:border-[#256ef4]">
              Contact <span className="text-[15px] font-normal">프로젝트 문의</span>
            </a>
            <a href="#portfolio" className="inline-flex min-h-[54px] items-center gap-3 border-b border-[#9aa3b0] pb-1 text-[17px] font-bold text-[#5b6370] hover:text-[#15171c]">
              Works <span className="text-[15px] font-normal">포트폴리오</span>
            </a>
          </div>
        </div>
        <div className="relative aspect-[4/3] w-full overflow-hidden border border-[#d9dee5] bg-white">
          <Image src={works[1].img} alt={`${works[1].name} 화면`} fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
          <span className="absolute bottom-0 left-0 bg-[#15171c] px-3 py-1.5 text-[12px] font-bold tracking-[0.15em] text-white">01 / WORKS</span>
        </div>
      </div>
    </section>
  );
}

function Services() {
  return (
    <section id="services" aria-labelledby="c-services" className={`${wrap} scroll-mt-20 py-16 md:py-28`}>
      <p className={eyebrow}>Services</p>
      <h2 id="c-services" className={`${h2c} mt-3`}>
        하는 일
      </h2>
      <ul className="mt-10 grid gap-4 md:mt-14 md:grid-cols-3" role="list">
        {services.map((s) => (
          <li key={s.name} className={`flex flex-col gap-4 rounded-[14px] p-6 md:p-8 ${s.big ? "bg-[#0f1115] text-white md:col-span-2" : "border border-[#d9dee5] bg-white"}`}>
            <span className="text-[22px] font-[800] tracking-[-0.04em] md:text-[28px]">{s.name}</span>
            <span className={`break-keep text-[16px] leading-[1.65] md:text-[17px] ${s.big ? "text-[#c9ced6]" : "text-[#5b6370]"}`}>{s.body}</span>
            <span className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-4">
              <span className={`text-[20px] font-[800] tracking-[-0.03em] md:text-[24px] ${s.big ? "text-white" : "text-[#256ef4]"}`}>{s.price}</span>
              <span className="flex gap-2">
                <NavLink href={s.href} className={`inline-flex min-h-11 items-center gap-1 rounded-md px-3 text-[15px] font-bold ${s.big ? "text-[#c9ced6] hover:text-white" : "text-[#5b6370] hover:text-[#256ef4]"}`}>
                  자세히 <ArrowUpRight size={16} aria-hidden />
                </NavLink>
                <JobApply job={s.name} dark={s.big} />
              </span>
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-[15px] text-[#5b6370]">금액은 부가세 별도입니다.</p>
    </section>
  );
}

function Why() {
  return (
    <section aria-labelledby="c-why" className="bg-[#f4f6fa]">
      <div className={`${wrap} py-16 md:py-28`}>
        <p className={eyebrow}>Why Gompartner</p>
        <h2 id="c-why" className={`${h2c} mt-3`}>
          곰파트너에 맡기는 이유
        </h2>
        <ul className="mt-10 grid gap-4 md:mt-14 md:grid-cols-2" role="list">
          {reasons.map((r, i) => (
            <li key={r.name} className="rounded-[14px] bg-white p-6 md:p-8">
              <span className="text-[15px] font-bold tabular-nums text-[#256ef4]">{String(i + 1).padStart(2, "0")}</span>
              <span className="mt-2 block break-keep text-[21px] font-[800] tracking-[-0.04em] md:text-[25px]">{r.name}</span>
              <span className="mt-3 block break-keep text-[16px] leading-[1.7] text-[#5b6370] md:text-[17px]">{r.body}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Stack() {
  return (
    <section aria-labelledby="c-stack" className="border-b border-[#e6e9ee] bg-white">
      <div className={`${wrap} flex flex-col gap-5 py-10 md:flex-row md:items-center md:gap-10 md:py-12`}>
        <h2 id="c-stack" className="shrink-0 text-[17px] font-[800] tracking-[-0.02em] md:text-[19px]">
          다루는 기술과 플랫폼
        </h2>
        <ul className="flex flex-wrap gap-2" role="list">
          {stack.map((t) => (
            <li key={t} className="rounded-full border border-[#d9dee5] bg-white px-3.5 py-1.5 text-[15px] font-bold text-[#3d4450]">
              {t}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Portfolio() {
  return (
    <section id="portfolio" aria-labelledby="c-portfolio" className={`${wrap} scroll-mt-20 py-16 md:py-28`}>
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className={eyebrow}>Portfolio</p>
          <h2 id="c-portfolio" className={`${h2c} mt-3`}>
            만든 화면
          </h2>
        </div>
        <NavLink href="/works" className="flex min-h-11 items-center gap-1 text-[16px] font-bold text-[#5b6370] hover:text-[#256ef4]">
          카탈로그 전체 <ArrowUpRight size={18} aria-hidden />
        </NavLink>
      </div>
      <ul className="mt-10 grid grid-cols-2 gap-x-3 gap-y-8 md:mt-14 md:grid-cols-4 md:gap-x-6" role="list">
        {works.map((w) => (
          <li key={w.href}>
            <NavLink href={w.href} className="group block">
              <span className="relative block aspect-[16/10] overflow-hidden rounded-[10px] border border-[#e6e9ee] bg-[#f4f6fa]">
                <Image src={w.img} alt={`${w.name} 화면`} fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none" />
              </span>
              <span className="mt-3 block text-[13px] font-bold text-[#256ef4] md:text-[14px]">{w.kind}</span>
              <span className="block break-keep text-[16px] font-[800] tracking-[-0.03em] md:text-[18px]">{w.name}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Process() {
  return (
    <section id="process" aria-labelledby="c-process" className="scroll-mt-20 bg-[#0f1115] text-white">
      <div className={`${wrap} py-16 md:py-28`}>
        <p className={eyebrow}>Process</p>
        <h2 id="c-process" className={`${h2c} mt-3`}>
          진행 방식
        </h2>
        <ol className="mt-10 grid gap-px overflow-hidden rounded-[14px] bg-white/10 md:mt-14 md:grid-cols-5" role="list">
          {steps.map((s, i) => (
            <li key={s.name} className="bg-[#0f1115] p-6 md:p-7">
              <span className="text-[15px] font-bold tabular-nums text-[#7aa7ff]">{String(i + 1).padStart(2, "0")}</span>
              <span className="mt-2 block text-[19px] font-[800] tracking-[-0.03em]">{s.name}</span>
              <span className="mt-2 block break-keep text-[15px] leading-[1.65] text-[#c9ced6]">{s.body}</span>
            </li>
          ))}
        </ol>
        <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-3" role="list">
          {deliver.map((d) => (
            <li key={d} className="flex items-center gap-2 text-[16px] font-bold md:text-[18px]">
              <CheckCircle2 aria-hidden className="size-5 shrink-0 text-[#7aa7ff]" />
              {d}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section id="faq" aria-labelledby="c-faq" className={`${wrap} scroll-mt-20 py-16 md:py-28`}>
      <p className={eyebrow}>FAQ</p>
      <h2 id="c-faq" className={`${h2c} mt-3`}>
        자주 묻는 질문
      </h2>
      <div className="mt-10 border-t-2 border-[#15171c] md:mt-14">
        {faqs.map((f) => (
          <details key={f.q} className="group border-b border-[#d9dee5]">
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-5 text-[17px] font-[800] tracking-[-0.02em] md:text-[20px] [&::-webkit-details-marker]:hidden">
              {f.q}
              <span aria-hidden className="text-[24px] font-bold text-[#6b7280] group-open:rotate-45 motion-safe:transition-transform">
                +
              </span>
            </summary>
            <p className="break-keep pb-6 text-[16px] leading-[1.7] text-[#3d4450] md:text-[17px]">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function Apply() {
  return (
    <section id="apply" aria-labelledby="c-apply" className="scroll-mt-20 bg-[#0b0d12] text-white">
      <div className={`${wrap} grid gap-10 py-16 md:py-28 lg:grid-cols-[1fr_560px] lg:gap-16`}>
        <div>
          <p className={eyebrow}>Contact</p>
          <h2 id="c-apply" className={`${h2c} mt-3`}>
            프로젝트 문의
          </h2>
          <p className="mt-5 max-w-[480px] break-keep text-[17px] leading-[1.7] text-[#aab2bf]">
            만들거나 고칠 것을 한 줄만 남겨 주세요. 15분 통화로 범위를 듣고 금액과 일정을 먼저 안내합니다. 안내 전에는 비용이 생기지 않습니다.
          </p>
          <p className="mt-8 text-[14px] leading-[1.6] text-[#8a94a6]">곰파트너, 사업자등록번호 725-40-01614(개인 일반과세)</p>
        </div>
        <div className="min-w-0 rounded-[14px] bg-white p-5 text-[#15171c] md:p-8">
          {/* 폼이 주소의 ?site= 를 읽어서(useSearchParams) 정적 내보내기에는 Suspense가 있어야 한다 */}
          <Suspense fallback={null}>
            <ContactForm compact />
          </Suspense>
        </div>
      </div>
    </section>
  );
}
