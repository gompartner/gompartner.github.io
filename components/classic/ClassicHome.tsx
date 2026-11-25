import Image from "next/image";
import { NavLink } from "@/components/classic/NavLink";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import { Suspense } from "react";
import { ContactForm } from "@/components/classic/contact/ContactForm";
import { manwon, plans } from "@/data/classic/pricing";

// 11-25 메인은 랜딩페이지(사용자 "랜딩페이지로 구성"). 한 페이지 안에서 신청까지 끝낸다.
// 순서: 첫 화면(방문자 문제로 시작하는 제목, 약속 3가지, 신청서) > 맡기는 일과 금액 > 만든 화면 4장(카탈로그 샘플) > 진행 순서 > 자주 묻는 질문 > 마지막 신청 버튼.
// 머리글은 로고와 상담 신청만(ClassicHeader의 landing). 서비스 상세, 카탈로그, 웹 지식은 바닥글 링크로 남는다.

const wrap = "mx-auto w-full max-w-[1248px] px-4 md:px-6";
const h2c = "break-keep text-[26px] font-[800] leading-[1.3] tracking-[-0.05em] md:text-[38px]";

const promises = ["작업 전에 금액부터 안내", "제작 결과물의 원본 소스와 인계 문서 제공", "계약서와 세금계산서 발행"];

const jobs = [
  { name: "문구, 이미지 수정", body: "아임웹, 카페24, 워드프레스, 그누보드 사이트의 글과 사진 교체", price: "10,000원부터" },
  { name: "오류 해결", body: "화면 깨짐, 신청서 미접수, 결제 오류, 접속 장애의 원인 확인과 수정", price: "원인 확인 후 견적" },
  { name: "새 홈페이지 제작", body: "병원, 매장, 학원, 기업 소개 홈페이지. 반응형 화면과 검색엔진 등록 포함", price: `${manwon(plans[0].price)}부터` },
  { name: "AI 도구로 만든 사이트 마무리", body: "Lovable, Cursor 등으로 만든 서비스의 서버 이전, 결제 연동, 오류 수정, 오픈 준비", price: "범위 확인 후 견적" },
];

// 카탈로그 샘플(실제로 만든 화면). 누르면 그 샘플로 간다
const works = [
  { href: "/sample/dental-homepage", img: "/images/demos/dental-homepage.jpg", kind: "홈페이지", name: "치과 홈페이지" },
  { href: "/sample/bakery-cafe", img: "/images/demos/bakery-cafe.jpg", kind: "홈페이지", name: "베이커리 홈페이지" },
  { href: "/sample/landing-move-clean", img: "/images/demos/landing-move-clean.jpg", kind: "랜딩페이지", name: "입주 청소 상담 신청" },
  { href: "/sample/app-pilates", img: "/images/demos/app-pilates.jpg", kind: "앱", name: "필라테스 예약 앱" },
];

const steps = [
  { name: "신청", body: "신청서에 어떤 일인지 남깁니다." },
  { name: "금액 안내", body: "사이트를 확인하고 금액과 일정을 먼저 알려 드립니다." },
  { name: "작업", body: "동의하신 범위만 작업합니다. 작업 전 변경 대상은 백업합니다." },
  { name: "확인과 인계", body: "결과를 확인하시면 마무리합니다. 제작은 원본 소스와 인계 문서를 함께 드립니다." },
];

const faqs = [
  { q: "어떤 사이트까지 손볼 수 있나요?", a: "아임웹, 카페24, 워드프레스, 그누보드 같은 빌더와 설치형 사이트, 직접 개발한 사이트(PHP, Next.js 등)까지 확인합니다. 작업이 어려운 경우에는 비용 없이 바로 알려 드립니다." },
  { q: "금액은 언제 정해지나요?", a: "작업 전에 정합니다. 사이트를 확인한 뒤 금액과 일정을 안내하고, 동의하신 뒤에 시작합니다." },
  { q: "계약서와 세금계산서를 받을 수 있나요?", a: "개인사업자(일반과세) 곰파트너 명의로 계약서와 세금계산서를 발행합니다." },
  { q: "작업이 끝난 뒤 문제가 생기면요?", a: "곰파트너가 작업한 부분의 결함은 상품별 하자보수 기간 동안 무상으로 고칩니다. 그 뒤의 수정은 건별로 받습니다." },
];

export function ClassicHome() {
  return (
    <div className="bg-white text-[#15171c]">
      <Hero />
      <Jobs />
      <Works />
      <Steps />
      <Faq />
      <Closing />
    </div>
  );
}

function Hero() {
  return (
    <section aria-labelledby="c-hero" className="border-b border-[#e6e9ee] bg-[#f4f6fa]">
      <div className={`${wrap} grid gap-10 py-10 md:py-16 lg:grid-cols-[1fr_520px] lg:gap-14`}>
        <div className="lg:pt-6">
          <p className="text-[16px] font-bold text-[#256ef4] md:text-[18px]">홈페이지 제작과 유지보수, 곰파트너</p>
          <h1 id="c-hero" className="mt-3 break-keep text-[34px] font-[800] leading-[1.2] tracking-[-0.05em] md:text-[52px]">
            고칠 곳이 보이는데
            <br />
            맡길 곳이 없을 때
          </h1>
          <p className="mt-4 max-w-[560px] break-keep text-[17px] leading-[1.65] text-[#3d4450] md:text-[19px]">
            <b className="text-[#15171c]">수정 1건 10,000원부터.</b> 고칠 것을 한 줄만 남겨 주세요. 사이트를 확인하고 금액과 일정을 먼저 안내합니다. 새 홈페이지 제작도 같은 신청서로 받습니다.
          </p>
          <ul className="mt-7 space-y-3" role="list">
            {promises.map((p) => (
              <li key={p} className="flex items-center gap-2.5 text-[17px] font-bold tracking-[-0.02em] md:text-[18px]">
                <CheckCircle2 aria-hidden className="size-5 shrink-0 text-[#256ef4] md:size-6" />
                {p}
              </li>
            ))}
          </ul>
          <p className="mt-7 text-[14px] leading-[1.6] text-[#5b6370]">사업자등록번호 725-40-01614, 곰파트너(개인 일반과세)</p>
        </div>
        <div id="apply" className="min-w-0 scroll-mt-20 rounded-[10px] border border-[#e6e9ee] bg-white p-5 shadow-[0_8px_24px_rgba(21,23,28,.06)] md:p-7">
          <h2 className="text-[21px] font-[800] tracking-[-0.03em]">상담 신청</h2>
          <p className="mt-1 text-[15px] text-[#5b6370]">1분이면 됩니다. 신청 후 금액을 먼저 안내합니다.</p>
          {/* 폼이 주소의 ?site= 를 읽어서(useSearchParams) 정적 내보내기에는 Suspense가 있어야 한다 */}
          <Suspense fallback={null}>
            <ContactForm compact />
          </Suspense>
        </div>
      </div>
    </section>
  );
}

function Jobs() {
  return (
    <section aria-labelledby="c-jobs" className={`${wrap} py-14 md:py-24`}>
      <h2 id="c-jobs" className={h2c}>
        이런 일을 맡기세요
      </h2>
      <ul className="mt-8 grid gap-4 md:mt-10 md:grid-cols-2" role="list">
        {jobs.map((j) => (
          <li key={j.name} className="flex flex-col gap-3 rounded-[10px] border border-[#d9dee5] p-5 md:p-7">
            <span className="text-[20px] font-[800] tracking-[-0.03em] md:text-[23px]">{j.name}</span>
            <span className="break-keep text-[16px] leading-[1.6] text-[#5b6370]">{j.body}</span>
            <span className="mt-auto text-[19px] font-[800] tracking-[-0.03em] text-[#256ef4] md:text-[21px]">{j.price}</span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-[15px] text-[#5b6370]">금액은 부가세 별도입니다.</p>
    </section>
  );
}

function Works() {
  return (
    <section aria-labelledby="c-works" className={`${wrap} pb-14 md:pb-24`}>
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="c-works" className={h2c}>
          만든 화면
        </h2>
        <NavLink href="/works" className="flex min-h-11 items-center gap-1 text-[16px] font-bold text-[#5b6370] hover:text-[#256ef4]">
          카탈로그 전체 <ArrowUpRight size={18} aria-hidden />
        </NavLink>
      </div>
      <ul className="mt-8 grid grid-cols-2 gap-x-3 gap-y-6 md:mt-10 md:grid-cols-4 md:gap-x-5" role="list">
        {works.map((w) => (
          <li key={w.href}>
            <NavLink href={w.href} className="group block">
              <span className="relative block aspect-[16/10] overflow-hidden rounded-[10px] border border-[#e6e9ee] bg-[#f4f6fa]">
                <Image src={w.img} alt={`${w.name} 화면`} fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none" />
              </span>
              <span className="mt-2.5 block text-[13px] font-bold text-[#256ef4] md:text-[14px]">{w.kind}</span>
              <span className="block break-keep text-[16px] font-[800] tracking-[-0.03em] md:text-[18px]">{w.name}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Steps() {
  return (
    <section aria-labelledby="c-steps" className="border-y border-[#e6e9ee] bg-[#f4f6fa]">
      <div className={`${wrap} py-14 md:py-24`}>
        <h2 id="c-steps" className={h2c}>
          진행 순서
        </h2>
        <ol className="mt-8 grid gap-4 md:mt-10 md:grid-cols-4" role="list">
          {steps.map((s, i) => (
            <li key={s.name} className="rounded-[10px] bg-white p-5 md:p-6">
              <span className="text-[15px] font-bold tabular-nums text-[#256ef4]">{i + 1}단계</span>
              <span className="mt-1 block text-[20px] font-[800] tracking-[-0.03em]">{s.name}</span>
              <span className="mt-2 block break-keep text-[16px] leading-[1.6] text-[#5b6370]">{s.body}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section aria-labelledby="c-faq" className={`${wrap} py-14 md:py-24`}>
      <h2 id="c-faq" className={h2c}>
        자주 묻는 질문
      </h2>
      <div className="mt-8 border-t-2 border-[#15171c] md:mt-10">
        {faqs.map((f) => (
          <details key={f.q} className="group border-b border-[#d9dee5]">
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 text-[17px] font-[800] tracking-[-0.02em] md:text-[19px] [&::-webkit-details-marker]:hidden">
              {f.q}
              <span aria-hidden className="text-[22px] font-bold text-[#6b7280] group-open:rotate-45 motion-safe:transition-transform">
                +
              </span>
            </summary>
            <p className="break-keep pb-5 text-[16px] leading-[1.7] text-[#3d4450]">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function Closing() {
  return (
    <section aria-labelledby="c-closing" className="bg-[#256ef4] text-white">
      <div className={`${wrap} flex flex-col gap-6 py-12 md:flex-row md:items-center md:justify-between md:py-16`}>
        <h2 id="c-closing" className="break-keep text-[24px] font-[800] leading-[1.3] tracking-[-0.04em] md:text-[32px]">
          고칠 것이 있으면 한 줄만 남겨 주세요
        </h2>
        <a href="#apply" data-gtm-cta="classic_closing_contact" className="inline-flex min-h-[52px] shrink-0 items-center justify-center rounded-md bg-white px-7 text-[17px] font-bold text-[#15171c] hover:bg-[#e8efff]">
          상담 신청하기
        </a>
      </div>
    </section>
  );
}
