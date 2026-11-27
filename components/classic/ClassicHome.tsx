import Image from "next/image";
import { Suspense } from "react";
import { ArrowUpRight, Check, Mail, Phone } from "lucide-react";
import { NavLink } from "@/components/classic/NavLink";
import { ContactForm } from "@/components/classic/contact/ContactForm";
import { HeroBuild } from "@/components/classic/HeroBuild";
import { Assemble } from "@/components/classic/Assemble";
import { appPlans, manwon, plans } from "@/data/classic/pricing";
import { profile } from "@/data/classic/profile";
import { NewTabMark } from "@/components/classic/NewTab";
import { cssMin } from "@/lib/cssMin";

// 11-25 메인: 조립형 한 페이지(사용자 "면과 선이 조합되며 완성되는, 합체 로봇처럼 조립되는 메인").
// 첫 화면(HeroBuild)은 글자, 선, 둥근 부품과 3D 마을이 조립되고, 그 아래 칸은 부품이 제각각 날아와 맞물린다(Assemble).
// 11-25 밤 다시 짬: 흰 바탕용 칸에 색만 뒤집어 덧칠하던 것을 버리고 어두운 바탕 기준으로 처음부터.
//  - 첫 문장 "Build, Run, Care." 순서대로: 만듭니다(색이 다른 큰 판 4장) > 운영합니다(사이트 지킴이, 거래장부) > 돌봅니다(이럴 때 맡기세요, 큰 숫자 줄)
//    > 진행 방식(파란 바탕, 흐르는 선 위의 원 5개) > 프로젝트 문의(흰 신청서). 11-27 자주 묻는 질문 칸은 뺐다(대표 "글이 너무 많다")
//  - 색: 바탕 #0b0d12, 파랑 #256ef4, 하늘 #7aa7ff, 흰색, 포인트 노랑 #ffd84d
// 비교용이던 한국형, 일본형, 미국형 첫 화면과 ?v= 장치는 지웠다. 신청은 이 페이지 맨 아래 신청서에서 끝낸다.
// 11-25 밤 사용자 결정: 샘플(카탈로그) 포트폴리오는 실적이 아니라 메인에서 내리고, 직접 만들어 운영하는 사이트 지킴이와 거래장부를 보여 준다.
// 기술 이름을 늘어놓은 띠는 뺐다(사용자 "고객이 봐도 모르는 기술 스택").
// 문의 버튼은 머리글과 첫 화면에 하나씩, 그리고 맨 아래 신청서뿐(칸마다 달던 문의하기는 "남발"이라 뺌).

const wrap = "mx-auto w-full max-w-[1248px] px-4 md:px-6";
const h2c = "break-keep text-[32px] font-[800] leading-[1.18] tracking-[-0.05em] md:text-[54px]";

// 다크모드 규칙 중 keep-light를 보지 않는 것(입력 칸 바탕과 글자색)을 메인에서 되돌리고, 진행 방식의 흐르는 선을 정의한다
// 아래 스타일 설명(11-26 점검: 스타일 문자열 안의 주석은 공개 파일에 그대로 실려서 밖으로 뺐다)
// 스크롤을 칸마다 붙이는 것(scroll snap)은 넣었다가 뺐다(11-25 밤 사용자 "힘들어 보이는 느낌"). 원래 문제는 휴대폰에서 3D 창이 보이기 전에 지나가는 것이었고, 창을 제목 바로 아래로 올려 해결했다(HeroBuild)
// 11-25 사용자: 메인의 휴대폰 화면에서는 아래에 떠 있는 전화, 카카오톡 상담 바도 뺀다(카카오톡은 바닥글에, 견적은 맨 아래 신청서에). 바 높이만큼 비워 두던 바닥글 여백도 없앤다
const homeCss = `
html:has(.gp-home) [aria-label="전화와 카카오톡 상담"] { display: none; }
@media (max-width: 767px) { html:has(.gp-home) footer { padding-bottom: 0; } }
@keyframes gp-flow { to { stroke-dashoffset: -32; } }
.gp-flow { animation: gp-flow 1.1s linear infinite; }
@media (prefers-reduced-motion: reduce) { .gp-flow { animation: none; } .gp-flow-dot { display: none; } }
`;

type Tone = "blue" | "white" | "yellow" | "line";
// 11-28 대표 문구: 제작은 급한 당일 오픈, 시스템은 개선점 도출과 단계 오픈, 앱은 사내용부터 스토어까지 기술 검토, 유지보수는 매월 분석과 함께 개선
const services: { no: string; name: string; body: string; price: string; href: string; tone: Tone; span: string }[] = [
  { no: "01", name: "웹사이트 제작", body: "미완성 사이트도 급하면 당일 오픈합니다", price: `${manwon(plans[0].price)}부터`, href: "/make", tone: "blue", span: "md:col-span-4" },
  { no: "02", name: "업무 시스템 개발", body: "개선 사항을 도출해 단계적으로 오픈합니다", price: "요구사항 확인 후 견적", href: "/make", tone: "white", span: "md:col-span-2" },
  { no: "03", name: "앱 개발", body: "기술 검토 후 사내용부터 스토어 앱까지 개발합니다", price: `${manwon(appPlans[0].price)}부터`, href: "/make", tone: "yellow", span: "md:col-span-2" },
  { no: "04", name: "유지보수와 고도화", body: "매월 분석해 개선점을 찾고 함께 고도화합니다", price: "건별 30,000원부터", href: "/maintenance", tone: "line", span: "md:col-span-4" },
];
const tones: Record<Tone, { box: string; sub: string; no: string; arrow: string }> = {
  blue: { box: "bg-[#256ef4] text-white hover:bg-[#1f63e6]", sub: "text-white", no: "text-white", arrow: "bg-white text-[#256ef4]" },
  white: { box: "bg-white text-[#0b0d12] hover:bg-[#f1f5ff]", sub: "text-[#3d4450]", no: "text-[#256ef4]", arrow: "bg-[#0b0d12] text-white" },
  yellow: { box: "bg-[#ffd84d] text-[#0b0d12] hover:bg-[#ffcf24]", sub: "text-[#2f2c14]", no: "text-[#0b0d12]/70", arrow: "bg-[#0b0d12] text-white" },
  line: { box: "border border-[#7aa7ff]/45 bg-[#121722] text-white hover:border-[#7aa7ff]", sub: "text-[#aab2bf]", no: "text-[#7aa7ff]", arrow: "bg-white text-[#0b0d12]" },
};

// 업체 자랑 대신 고객이 겪는 상황에서 시작한다(11-25 밤 사용자 "돈 안 내고 싶겠다"). 11-27 대표 "글이 너무 많다": 상황 제목만 두고 본문은 뺐다(값은 유지보수, 제작 페이지에)
const reasons = [
  { name: "만든 업체와 연락이 안 될 때", c: "#7aa7ff" },
  { name: "문구 하나 수정에 며칠씩 걸릴 때", c: "#ffd84d" },
  { name: "비용을 몰라 미루고 있을 때", c: "#ffffff" },
  { name: "문의 받고 답하고 정리하는 일을 사람이 다 할 때", c: "#7aa7ff" },
];

// 직접 기획하고 만들어 운영하는 서비스. 문구는 각 서비스 사이트의 소개 문장에서 가져온다
const products = [
  {
    name: "사이트 지킴이",
    href: "https://jikimi.gompartner.co.kr/",
    img: "/images/products/jikimi.jpg",
    lead: "웹사이트 장애와 SSL 인증서, 도메인 만료를 미리 알려 주는 모니터링 서비스",
    facts: ["10분 주기 가용성 점검", "SSL 인증서와 도메인 만료 단계별 알림", "사이트 3개까지 무료"],
    light: true,
  },
  {
    name: "거래장부",
    href: "https://jangbu.gompartner.co.kr/",
    img: "/images/products/jangbu-1126.jpg",
    lead: "거래명세서를 링크로 발송하고 거래처의 수령 확인을 받는 업무 도구",
    facts: ["가입 없이 작성과 PDF 저장", "거래처 지문 인증으로 수령 확인", "외상 거래처 미수금과 월 합계"],
    light: false,
  },
];

// 11-27 단계 이름만(설명은 뺐다)
const steps = [{ name: "상담" }, { name: "견적" }, { name: "제작" }, { name: "오픈" }, { name: "운영" }];
// 원 다섯 개의 가운데를 지나는 물결 선(가로 1000 기준, 원 가운데 x는 100, 300, 500, 700, 900)
const flowPath = "M100 70 C 200 70, 200 130, 300 130 S 400 70, 500 70 S 600 130, 700 130 S 800 70, 900 70";


export function ClassicHome() {
  return (
    // keep-light: 메인은 색을 직접 정한 화면이라 사이트 다크모드(기기 설정을 따라 켜짐)가 흰 부품과 입력 칸을 어둡게 바꾸지 않게 한다
    <div className="keep-light gp-home">
      <style>{cssMin(homeCss)}</style>
      <div className="bg-[#0b0d12] bg-[linear-gradient(rgba(122,167,255,.05)_1px,transparent_1px),linear-gradient(90deg,rgba(122,167,255,.05)_1px,transparent_1px)] bg-[size:48px_48px] text-white">
        <HeroBuild />
        <Assemble>
          <Services />
          <Products />
          <Why />
          <Process />
          <Apply />
        </Assemble>
      </div>
    </div>
  );
}

/** 칸 머리: 번호, 가는 선, 영어 이름, 큰 제목 */
function Head({ no, en, title, id, onBlue = false }: { no: string; en: string; title: string; id: string; onBlue?: boolean }) {
  return (
    <div data-part="text">
      <p className={`flex items-center gap-3 text-[13px] font-bold tracking-[0.18em] md:text-[14px] ${onBlue ? "text-white" : "text-[#7aa7ff]"}`}>
        <span className="tabular-nums">{no}</span>
        <span aria-hidden className="h-px w-10 bg-current" />
        {en}
      </p>
      <h2 id={id} className={`${h2c} mt-4`}>
        {title}
      </h2>
    </div>
  );
}

/** 서비스 판 구석의 면과 선 무늬 */
function Motif({ tone }: { tone: Tone }) {
  // 좁은 판(흰색, 노랑)에서는 글자와 겹치지 않게 작게, 구석으로
  const narrow = tone === "white" || tone === "yellow";
  const cls = `pointer-events-none absolute -z-10 ${narrow ? "-bottom-10 -right-10 h-[170px] w-[170px] md:h-[210px] md:w-[210px]" : "-bottom-6 -right-6 h-[210px] w-[210px] md:h-[300px] md:w-[300px]"}`;
  if (tone === "blue")
    return (
      <svg aria-hidden viewBox="0 0 300 300" className={cls} fill="none" stroke="#fff">
        <circle cx="170" cy="170" r="120" strokeOpacity=".4" strokeWidth="1.5" />
        <circle cx="170" cy="170" r="72" strokeOpacity=".4" strokeWidth="1.5" />
        <circle cx="170" cy="170" r="26" fill="#fff" fillOpacity=".22" stroke="none" />
        <path d="M0 170 H300 M170 0 V300" strokeOpacity=".25" />
      </svg>
    );
  if (tone === "white")
    return (
      <svg aria-hidden viewBox="0 0 300 300" className={cls} fill="none" stroke="#256ef4">
        <path d="M60 80 H300 M60 130 H300 M60 180 H300 M60 230 H300 M60 80 V300 M140 80 V300 M220 80 V300" strokeOpacity=".28" strokeWidth="1.5" />
        <rect x="140" y="130" width="80" height="50" fill="#256ef4" fillOpacity=".16" stroke="none" />
        <circle cx="60" cy="80" r="6" fill="#256ef4" stroke="none" />
      </svg>
    );
  if (tone === "yellow")
    return (
      <svg aria-hidden viewBox="0 0 300 300" className={cls} fill="none" stroke="#0b0d12">
        <rect x="120" y="50" width="130" height="250" rx="26" strokeOpacity=".4" strokeWidth="2" />
        <path d="M165 76 H205" strokeOpacity=".4" strokeWidth="4" strokeLinecap="round" />
        <circle cx="90" cy="210" r="46" fill="#0b0d12" fillOpacity=".1" stroke="none" />
      </svg>
    );
  return (
    <svg aria-hidden viewBox="0 0 300 300" className={cls} fill="none" stroke="#7aa7ff">
      <path d="M60 240 L130 150 L210 190 L270 80" strokeOpacity=".6" strokeWidth="1.5" />
      <circle cx="60" cy="240" r="7" fill="#7aa7ff" stroke="none" />
      <circle cx="130" cy="150" r="7" fill="#0b0d12" strokeWidth="2" />
      <circle cx="210" cy="190" r="7" fill="#0b0d12" strokeWidth="2" />
      <circle cx="270" cy="80" r="10" fill="#ffd84d" stroke="none" />
      <circle cx="170" cy="170" r="130" strokeOpacity=".18" />
    </svg>
  );
}

function Services() {
  return (
    <section id="services" aria-labelledby="c-services" className={`${wrap} scroll-mt-20 py-20 md:py-32`}>
      <Head no="01" en="BUILD" title="만들어 드립니다" id="c-services" />
      <ul className="mt-10 grid gap-3 md:mt-14 md:grid-cols-6 md:gap-4" role="list">
        {services.map((s) => {
          const t = tones[s.tone];
          return (
            <li key={s.name} data-part className={`rounded-[28px] ${s.span}`}>
              {/* 판 전체가 상세 페이지로 가는 링크. 문의 버튼은 두지 않는다(맨 아래 신청서와 머리글에 있다) */}
              <NavLink href={s.href} className={`group relative isolate flex h-full min-h-[250px] flex-col overflow-hidden rounded-[28px] p-7 transition-colors md:min-h-[310px] md:p-9 ${t.box}`}>
                <Motif tone={s.tone} />
                <span aria-hidden className={`absolute right-6 top-6 grid h-11 w-11 place-items-center rounded-full transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none md:right-8 md:top-8 ${t.arrow}`}>
                  <ArrowUpRight size={20} />
                </span>
                <span className={`text-[15px] font-bold tabular-nums ${t.no}`}>{s.no}</span>
                <h3 className="mt-3 break-keep pr-12 text-[28px] font-[800] leading-[1.2] tracking-[-0.045em] md:text-[38px]">{s.name}</h3>
                <p className={`mt-3 max-w-[460px] break-keep text-[16px] leading-[1.65] md:text-[17px] ${t.sub}`}>{s.body}</p>
                <span className="mt-auto block pt-8 text-[22px] font-[800] tracking-[-0.03em] md:text-[26px]">{s.price}</span>
              </NavLink>
            </li>
          );
        })}
      </ul>
      <p className="mt-4 text-[15px] text-[#aab2bf]">금액은 부가세 별도입니다.</p>
    </section>
  );
}

function Why() {
  return (
    <section id="care" aria-labelledby="c-why" className="scroll-mt-20 border-y border-white/10 bg-[#0f131b]">
      <div className={`${wrap} grid gap-12 py-20 md:py-32 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16`}>
        <div className="lg:sticky lg:top-28 lg:self-start">
          <Head no="03" en="CARE" title="관리해 드립니다" id="c-why" />
          <p data-part="text" className="mt-6 max-w-[420px] break-keep text-[17px] leading-[1.7] text-[#aab2bf]">
            이럴 때 맡기세요.
          </p>
        </div>
        <ol role="list">
          {reasons.map((r, i) => (
            <li key={r.name} data-part="text" className="grid grid-cols-[64px_1fr] gap-4 border-t border-white/15 py-8 first:border-t-0 first:pt-0 md:grid-cols-[120px_1fr] md:gap-6 md:py-10">
              <span aria-hidden className="text-[56px] font-[800] leading-[0.9] tracking-[-0.06em] text-transparent md:text-[92px]" style={{ WebkitTextStroke: `1.5px ${r.c}` }}>
                {i + 1}
              </span>
              <div>
                <h3 className="break-keep text-[22px] font-[800] leading-[1.3] tracking-[-0.04em] md:text-[29px]">{r.name}</h3>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Products() {
  return (
    <section id="products" aria-labelledby="c-products" className={`${wrap} scroll-mt-20 py-20 md:py-32`}>
      <Head no="02" en="RUN" title="운영해 드립니다" id="c-products" />
      <p data-part="text" className="mt-4 max-w-[560px] break-keep text-[15px] leading-[1.7] text-[#aab2bf] md:mt-6 md:text-[17px]">
        직접 개발해 운영 중인 서비스입니다.
      </p>
      <ul className="mt-8 grid gap-3 md:mt-14 md:gap-4 lg:grid-cols-2" role="list">
        {products.map((p) => (
          <li key={p.name} data-part className={`flex flex-col overflow-hidden rounded-[28px] ${p.light ? "bg-[#e6eeff] text-[#0b0d12]" : "border border-[#7aa7ff]/45 bg-[#121722] text-white"}`}>
            {/* 11-28 대표 "모바일에서 줄여줘": 휴대폰은 글자, 여백, 화면 그림을 줄인다 */}
            <div className="p-6 md:p-9">
              <h3 className="text-[24px] font-[800] leading-[1.2] tracking-[-0.045em] md:text-[38px]">{p.name}</h3>
              <p className={`mt-2 max-w-[460px] break-keep text-[15px] leading-[1.6] md:mt-3 md:text-[17px] ${p.light ? "text-[#3d4450]" : "text-[#aab2bf]"}`}>{p.lead}</p>
              <ul className="mt-4 space-y-1.5 md:mt-6 md:space-y-2.5" role="list">
                {p.facts.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-[15px] font-bold md:text-[17px]">
                    <span aria-hidden className={`grid h-5 w-5 shrink-0 place-items-center rounded-full ${p.light ? "bg-[#256ef4] text-white" : "bg-[#7aa7ff]/20 text-[#7aa7ff]"}`}>
                      <Check size={13} strokeWidth={3} />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <a href={p.href} target="_blank" rel="noopener noreferrer" className={`mt-3 inline-flex min-h-11 items-center gap-1 text-[15px] font-bold md:mt-7 md:text-[16px] underline-offset-4 hover:underline ${p.light ? "text-[#0b50d0]" : "text-[#7aa7ff]"}`}>
                {p.name} 바로가기 <NewTabMark size={16} />
              </a>
            </div>
            <div className="mt-auto px-6 md:px-9">
              <span className="relative block aspect-[16/8] overflow-hidden md:aspect-[3/2] rounded-t-[16px] border border-b-0 border-black/10 bg-white shadow-[0_-8px_30px_rgba(0,0,0,.18)]">
                <Image src={p.img} alt={`${p.name} 화면`} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover object-top" />
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Process() {
  return (
    <section id="process" aria-labelledby="c-process" className="scroll-mt-20 bg-[#1f5fe0] text-white">
      <div className={`${wrap} py-20 md:py-32`}>
        <Head no="04" en="PROCESS" title="진행 방식" id="c-process" onBlue />
        <div className="relative mt-8 md:mt-20">
          {/* 원 다섯 개를 지나 흐르는 선과 그 위를 달리는 점(넓은 화면) */}
          <svg aria-hidden viewBox="0 0 1000 200" preserveAspectRatio="none" className="absolute inset-x-0 top-0 hidden h-[200px] w-full md:block" fill="none">
            <path className="gp-flow" d={flowPath} stroke="#fff" strokeOpacity=".7" strokeWidth="2" strokeDasharray="8 8" vectorEffect="non-scaling-stroke" />
            <circle className="gp-flow-dot" r="7" fill="#ffd84d">
              <animateMotion dur="7s" repeatCount="indefinite" path={flowPath} />
            </circle>
          </svg>
          {/* 좁은 화면도 PC처럼 지그재그(11-28 대표). 작은 원 다섯 개, 짝수 단계는 28px 내리고 원 가운데(위 26px, 아래 54px)를 흐르는 점선으로 잇는다 */}
          <svg aria-hidden viewBox="0 0 500 80" preserveAspectRatio="none" className="absolute inset-x-0 top-0 h-[80px] w-full md:hidden" fill="none">
            <path className="gp-flow" d="M50 26 L150 54 L250 26 L350 54 L450 26" stroke="#fff" strokeOpacity=".7" strokeWidth="2" strokeDasharray="6 6" vectorEffect="non-scaling-stroke" />
          </svg>
          <ol className="relative grid grid-cols-5 gap-1 md:gap-4" role="list">
            {steps.map((s, i) => (
              <li key={s.name} data-part="text" className={`flex flex-col items-center text-center ${i % 2 ? "pt-7 md:pt-[60px]" : ""}`}>
                <span className="grid h-[52px] w-[52px] shrink-0 place-items-center rounded-full bg-white text-[#1f5fe0] shadow-[0_6px_18px_rgba(8,26,74,.35)] md:h-[140px] md:w-[140px] md:shadow-[0_10px_30px_rgba(8,26,74,.35)]">
                  <span>
                    <span className="hidden text-center text-[13px] font-bold tracking-[0.14em] md:block">STEP</span>
                    <span className="block text-center text-[22px] font-[800] leading-none tabular-nums md:text-[56px]">{i + 1}</span>
                  </span>
                </span>
                <span className="mt-3 block md:mt-6">
                  <span className="block text-[16px] font-[800] tracking-[-0.03em] md:text-[23px]">{s.name}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

function Apply() {
  return (
    <section id="apply" aria-labelledby="c-apply" className="scroll-mt-20 border-t border-white/10 bg-[#0f131b]">
      <div className={`${wrap} grid gap-10 py-20 md:py-32 lg:grid-cols-[1fr_560px] lg:gap-16`}>
        <div>
          <Head no="05" en="CONTACT" title="무료 견적 받기" id="c-apply" />
          <p data-part="text" className="mt-6 max-w-[480px] break-keep text-[17px] leading-[1.7] text-[#aab2bf]">
            원하시는 것을 한 줄만 남겨 주세요. 범위와 금액, 일정을 정리해 회신합니다.
          </p>
          <ul data-part="text" className="mt-9 space-y-3" role="list">
            <li>
              <a href={`mailto:${profile.email}`} className="inline-flex min-h-11 items-center gap-3 text-[17px] font-bold text-white hover:text-[#7aa7ff]">
                <span aria-hidden className="grid h-10 w-10 place-items-center rounded-full bg-white/10">
                  <Mail size={18} />
                </span>
                {profile.email}
              </a>
            </li>
            <li>
              <a href={`tel:${profile.phone}`} className="inline-flex min-h-11 items-center gap-3 text-[17px] font-bold text-white hover:text-[#7aa7ff]">
                <span aria-hidden className="grid h-10 w-10 place-items-center rounded-full bg-white/10">
                  <Phone size={18} />
                </span>
                {profile.phone}
              </a>
            </li>
          </ul>
          <p className="mt-8 text-[14px] leading-[1.6] text-[#8a94a6]">곰파트너, 사업자등록번호 {profile.bizNo}</p>
        </div>
        {/* use-dark: 어두운 화면에서는 이 카드도 어두운 카드로 나온다(11-26 사용자 "메인에 톤이 흰색 맞나", "메인 상담하기는 고민 좀"). 밝은 화면에서는 흰 카드 그대로 */}
        <div data-part className="use-dark min-w-0 rounded-[28px] border border-[#e6e9ee] bg-white p-5 text-[#15171c] md:p-9">
          {/* 폼이 주소의 ?site= 를 읽어서(useSearchParams) 정적 내보내기에는 Suspense가 있어야 한다 */}
          <Suspense fallback={null}>
            <ContactForm compact />
          </Suspense>
        </div>
      </div>
    </section>
  );
}
