"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, ChevronLeft, ChevronRight, Pause, Play, Plus } from "lucide-react";
import { ChannelTalkButton } from "@/components/layout/ChannelTalk";
import { industries } from "@/data/classic/industries";
import { processSteps } from "@/data/classic/faq";
import { projects } from "@/data/classic/projects";
import { blogPosts } from "@/data/classic/stories";
import { tools } from "@/data/classic/tools";
import { estimateFor, landingPlans, manwon, plans, previewDetail, previewPromise } from "@/data/classic/pricing";
import { fieldsById } from "@/data/classic/workFilters";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { cn } from "@/lib/utils";

// 클래식 보기의 첫 화면. 웹 에이전시형 회사 홈페이지 구성:
// 큰 배너 슬라이드(실제 샘플 화면) → 서비스 → 업종별 샘플 → 진행 절차 → 제작 일지·자료실 → 문의 띠배너.
// 내용은 클래식 전용 데이터(data/classic)를 쓴다. 웹툰 쪽과 따로 고친다.

const INK = "#15171c";
const NAVY = "#0f1b3d";
const BLUE = "#256ef4";

const slugOf = (demoUrl: string) => demoUrl.replace("/demo/", "");
const byId = (id: string) => projects.find((p) => p.id === id)!;
const priceOf = (id: string) => {
  const est = estimateFor(id);
  return est ? `이 샘플 기준 ${manwon(est.total)}, ${est.days}일` : null;
};

const slides = [
  { id: "company", headline: "회사 홈페이지 제작" },
  { id: "dental-homepage", headline: "병원 홈페이지 제작" },
  { id: "online-store", headline: "자사 쇼핑몰 제작" },
].map((s) => ({ ...s, project: byId(s.id) }));

const services = [
  { href: "/landing", name: "광고 랜딩페이지", price: `${manwon(landingPlans[0].price)}부터`, what: "광고 보고 온 사람의 신청을 받는 한 페이지" },
  { href: "/classic/pricing", name: "홈페이지 제작", price: `${manwon(plans[0].price)}부터`, what: "회사와 가게 소개, 문의와 예약을 받는 홈페이지" },
  { href: "/classic/maintenance", name: "유지보수", price: "월 5만 원부터", what: "만든 홈페이지 수정과 오류 수정" },
  { href: "/classic/works", name: "업무 프로그램", price: "별도 견적", what: "엑셀로 하던 일을 화면으로 옮기기" },
];

const h2 = "text-[30px] font-extrabold leading-[1.25] tracking-[-0.04em] md:text-[44px]";
const more = "inline-flex items-center gap-1 text-[15px] font-bold text-[#5b6370] hover:text-[#15171c]";

export function ClassicHome() {
  return (
    <div className="bg-white text-[#15171c]">
      <h1 className="sr-only">곰파트너 홈페이지 제작</h1>
      <Hero />
      <Services />
      <Samples />
      <Process />
      <Boards />
      <Band />
    </div>
  );
}

function Hero() {
  const reduce = useReducedMotionSafe();
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hold, setHold] = useState(false);
  const go = (n: number) => setI((n + slides.length) % slides.length);

  useEffect(() => {
    if (reduce || paused || hold) return;
    const t = window.setTimeout(() => setI((v) => (v + 1) % slides.length), 6000);
    return () => window.clearTimeout(t);
  }, [i, reduce, paused, hold]);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="대표 샘플"
      className="relative overflow-hidden text-white"
      style={{ backgroundColor: NAVY }}
      onMouseEnter={() => setHold(true)}
      onMouseLeave={() => setHold(false)}
      onFocus={() => setHold(true)}
      onBlur={() => setHold(false)}
    >
      <div className="mx-auto grid w-full max-w-[1248px] items-center gap-10 px-4 pb-24 pt-12 md:min-h-[600px] md:grid-cols-[1fr_1.15fr] md:gap-12 md:px-6 md:py-20">
        <div className="relative min-h-[260px] md:min-h-[320px]">
          {slides.map((s, n) => (
            <div
              key={s.id}
              aria-hidden={n !== i}
              className={cn("absolute inset-0 transition-opacity duration-500 motion-reduce:transition-none", n === i ? "opacity-100" : "pointer-events-none opacity-0")}
            >
              <p className="text-[15px] font-bold text-[#8fb4ff] md:text-[17px]">{s.project.title}</p>
              <p className="mt-4 text-[44px] font-extrabold leading-[1.08] tracking-[-0.05em] md:text-[76px]">{s.headline}</p>
              {priceOf(s.id) && <p className="mt-5 text-[17px] text-[#c9d3e6] md:text-[19px]">{priceOf(s.id)}</p>}
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href={`/classic/sample/${slugOf(s.project.demoUrl)}`}
                  tabIndex={n === i ? 0 : -1}
                  data-gtm-cta={`classic_hero_${s.id}`}
                  className="inline-flex h-12 items-center rounded-md bg-white px-6 text-[16px] font-bold text-[#15171c] transition-colors hover:bg-[#e8efff]"
                >
                  샘플 보기
                </Link>
                <ChannelTalkButton
                  cta={`classic_hero_chat_${s.id}`}
                  message={`${s.project.title} 샘플을 보고 문의합니다.`}
                  className="inline-flex h-12 items-center rounded-md border border-white/40 px-6 text-[16px] font-bold text-white transition-colors hover:bg-white/10"
                >
                  채팅 상담
                </ChannelTalkButton>
              </div>
            </div>
          ))}
        </div>

        {/* PC 화면 위에 휴대폰 화면을 겹친다. 슬라이드마다 실제 샘플 캡처 */}
        <div className="relative aspect-[16/11] w-full">
          {slides.map((s, n) => (
            <div
              key={s.id}
              aria-hidden
              className={cn(
                "absolute inset-0 transition-[opacity,transform] duration-700 motion-reduce:transition-none",
                n === i ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
              )}
            >
              <div className="absolute left-0 top-0 w-[88%] overflow-hidden rounded-lg bg-white shadow-[0_30px_60px_rgba(0,0,0,.35)]">
                <div className="flex h-6 items-center gap-1.5 bg-[#e9ecf1] px-3">
                  <span className="h-2 w-2 rounded-full bg-[#c5cbd4]" />
                  <span className="h-2 w-2 rounded-full bg-[#c5cbd4]" />
                  <span className="h-2 w-2 rounded-full bg-[#c5cbd4]" />
                </div>
                <Image src={s.project.imageUrl} alt="" width={1440} height={900} priority={n === 0} sizes="(min-width: 768px) 600px, 90vw" className="aspect-[16/10] w-full object-cover object-top" />
              </div>
              <div className="absolute bottom-0 right-0 w-[27%] overflow-hidden rounded-[18px] border-[5px] border-[#1c2a52] bg-white shadow-[0_24px_48px_rgba(0,0,0,.4)]">
                <Image src={`/images/demos/m/${slugOf(s.project.demoUrl)}.jpg`} alt="" width={390} height={844} sizes="180px" className="aspect-[9/17] w-full object-cover object-top" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-6">
        <div className="mx-auto flex w-full max-w-[1248px] items-center gap-2 px-4 md:px-6">
          <span className="mr-2 text-[14px] tabular-nums text-[#c9d3e6]">
            <span className="font-bold text-white">{i + 1}</span> / {slides.length}
          </span>
          {[
            { label: "이전 샘플", icon: <ChevronLeft size={18} aria-hidden />, on: () => go(i - 1) },
            { label: "다음 샘플", icon: <ChevronRight size={18} aria-hidden />, on: () => go(i + 1) },
          ].map((b) => (
            <button key={b.label} type="button" onClick={b.on} aria-label={b.label} className="grid h-9 w-9 place-items-center rounded-full border border-white/30 hover:bg-white/10">
              {b.icon}
            </button>
          ))}
          {!reduce && (
            <button
              type="button"
              onClick={() => setPaused((v) => !v)}
              aria-label={paused ? "자동 넘김 켜기" : "자동 넘김 멈추기"}
              className="grid h-9 w-9 place-items-center rounded-full border border-white/30 hover:bg-white/10"
            >
              {paused ? <Play size={15} aria-hidden /> : <Pause size={15} aria-hidden />}
            </button>
          )}
          <span className="ml-3 hidden h-[3px] flex-1 max-w-[160px] bg-white/20 md:block">
            <span className="block h-full bg-white transition-[width] duration-300" style={{ width: `${((i + 1) / slides.length) * 100}%` }} />
          </span>
        </div>
      </div>
    </section>
  );
}

function Services() {
  return (
    <section aria-labelledby="c-services" className="mx-auto w-full max-w-[1248px] px-4 py-20 md:px-6 md:py-28">
      <h2 id="c-services" className={h2}>
        서비스
      </h2>
      <ul className="mt-10 border-t-2 border-[#15171c]" role="list">
        {services.map((s) => (
          <li key={s.name} className="border-b border-[#d9dee5]">
            <Link
              href={s.href}
              data-gtm-cta={`classic_service_${s.href.split("/").pop()}`}
              className="group grid grid-cols-[1fr_auto] items-center gap-x-6 gap-y-1 py-6 md:grid-cols-[minmax(0,360px)_1fr_auto_auto] md:py-8"
            >
              <span className="col-start-1 row-start-1 text-[24px] font-extrabold tracking-[-0.04em] transition-colors group-hover:text-[#256ef4] md:text-[34px]">{s.name}</span>
              <span className="col-span-2 col-start-1 row-start-2 text-[16px] text-[#5b6370] md:col-span-1 md:col-start-2 md:row-start-1 md:text-[17px]">{s.what}</span>
              <span className="col-start-2 row-start-1 text-right text-[16px] font-bold tabular-nums md:col-start-3 md:text-[19px]">{s.price}</span>
              <ArrowUpRight
                size={28}
                aria-hidden
                className="hidden text-[#8a929e] md:col-start-4 md:row-start-1 transition-[color,transform] duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#256ef4] md:block"
              />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Samples() {
  const [tab, setTab] = useState<string>("all");
  const field = industries.find((x) => x.slug === tab)?.field;
  const list = projects
    .filter((p) => p.demoUrl.startsWith("/demo/") && (!field || fieldsById[p.id]?.includes(field)))
    .slice(0, 8);
  const tabs = [{ slug: "all", label: "전체" }, ...industries.map((x) => ({ slug: x.slug, label: x.label }))];

  return (
    <section aria-labelledby="c-samples" className="bg-[#f4f6f9]">
      <div className="mx-auto w-full max-w-[1248px] px-4 py-20 md:px-6 md:py-28">
        <div className="flex items-end justify-between gap-4">
          <h2 id="c-samples" className={h2}>
            샘플
          </h2>
          <Link href={tab === "all" ? "/classic/works" : `/classic/works/${tab}`} className={more}>
            더보기 <Plus size={15} strokeWidth={2.5} aria-hidden />
          </Link>
        </div>

        <div role="tablist" aria-label="업종" className="-mx-4 mt-8 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:px-0">
          {tabs.map((t) => (
            <button
              key={t.slug}
              type="button"
              role="tab"
              aria-selected={tab === t.slug}
              onClick={() => setTab(t.slug)}
              className={cn(
                "h-10 shrink-0 rounded-full border px-4 text-[15px] font-bold transition-colors",
                tab === t.slug ? "border-[#15171c] bg-[#15171c] text-white" : "border-[#d9dee5] bg-white text-[#3d4450] hover:border-[#15171c]"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4 md:gap-x-6 md:gap-y-12" role="list">
          {list.map((p) => {
            const est = estimateFor(p.id);
            return (
              <li key={p.id}>
                <Link href={`/classic/sample/${slugOf(p.demoUrl)}`} className="group block">
                  <span className="block overflow-hidden rounded-md border border-[#e1e5eb] bg-white">
                    <Image
                      src={`/images/demos/sm/${slugOf(p.demoUrl)}.jpg`}
                      alt={p.imageAlt}
                      width={720}
                      height={450}
                      sizes="(min-width: 768px) 290px, 45vw"
                      className="aspect-[16/10] w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.04] motion-reduce:transition-none"
                    />
                  </span>
                  <span className="mt-3 block text-[13px] font-bold text-[#256ef4] md:text-[14px]">{p.category}</span>
                  <span className="mt-1 block text-[16px] font-bold leading-[1.4] tracking-[-0.02em] group-hover:underline md:text-[18px]">{p.title}</span>
                  {est && <span className="mt-1 block text-[14px] tabular-nums text-[#5b6370] md:text-[15px]">{manwon(est.total)}, {est.days}일</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

function Process() {
  return (
    <section aria-labelledby="c-process" className="mx-auto w-full max-w-[1248px] px-4 py-20 md:px-6 md:py-28">
      <h2 id="c-process" className={h2}>
        진행 절차
      </h2>
      <ol className="mt-10 grid gap-8 md:grid-cols-5 md:gap-6">
        {processSteps.map((s, n) => (
          <li key={s.title} className="border-t-2 border-[#15171c] pt-5">
            <span className="text-[15px] font-bold tabular-nums text-[#256ef4]">{n + 1}단계</span>
            <p className="mt-2 text-[21px] font-extrabold tracking-[-0.03em]">{s.title}</p>
            <p className="mt-2 text-[15px] leading-[1.65] text-[#5b6370]">{s.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Boards() {
  const posts = Object.entries(blogPosts)
    .map(([slug, url]) => ({ url, project: projects.find((p) => p.demoUrl === `/demo/${slug}`) }))
    .filter((x) => x.project)
    .sort((a, b) => Number(b.url.split("/").pop()) - Number(a.url.split("/").pop()))
    .slice(0, 5);
  const row = "flex items-center justify-between gap-4 border-b border-[#e6e9ee] py-4 text-[16px] hover:text-[#256ef4]";

  return (
    <section aria-label="제작 일지와 자료실" className="border-t border-[#e6e9ee]">
      <div className="mx-auto grid w-full max-w-[1248px] gap-14 px-4 py-20 md:grid-cols-2 md:gap-12 md:px-6 md:py-24">
        <div>
          <div className="flex items-end justify-between border-b-2 border-[#15171c] pb-4">
            <h2 className="text-[24px] font-extrabold tracking-[-0.03em]">제작 일지</h2>
            <a href="https://gompartner.tistory.com" target="_blank" rel="noopener noreferrer" className={more}>
              더보기 <Plus size={15} strokeWidth={2.5} aria-hidden />
            </a>
          </div>
          <ul role="list">
            {posts.map((x) => (
              <li key={x.url}>
                <a href={x.url} target="_blank" rel="noopener noreferrer" className={row}>
                  <span className="truncate">{x.project!.title} 만든 이야기</span>
                  <span className="shrink-0 text-[14px] text-[#8a929e]">티스토리</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="flex items-end justify-between border-b-2 border-[#15171c] pb-4">
            <h2 className="text-[24px] font-extrabold tracking-[-0.03em]">자료실</h2>
            <Link href="/classic/tools" className={more}>
              더보기 <Plus size={15} strokeWidth={2.5} aria-hidden />
            </Link>
          </div>
          <ul role="list">
            {tools.slice(0, 5).map((t) => (
              <li key={t.href}>
                <Link href={t.href} className={row}>
                  <span className="truncate">{t.title}</span>
                  <span className="shrink-0 text-[14px] text-[#8a929e]">{t.category}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Band() {
  return (
    <section aria-labelledby="c-band" className="text-white" style={{ backgroundColor: BLUE }}>
      <div className="mx-auto flex w-full max-w-[1248px] flex-col gap-8 px-4 py-16 md:flex-row md:items-center md:justify-between md:px-6 md:py-20">
        <div className="max-w-[640px]">
          <h2 id="c-band" className="text-[30px] font-extrabold leading-[1.25] tracking-[-0.04em] md:text-[40px]">
            {previewPromise}
          </h2>
          <p className="mt-3 text-[16px] leading-[1.65] text-white/85 md:text-[17px]">{previewDetail}</p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-3">
          <ChannelTalkButton cta="classic_band_chat" className="inline-flex h-14 items-center rounded-md bg-white px-7 text-[17px] font-bold" >
            <span style={{ color: INK }}>채팅 상담</span>
          </ChannelTalkButton>
          <Link href="/landing" data-gtm-cta="classic_band_landing" className="inline-flex h-14 items-center rounded-md border border-white/60 px-7 text-[17px] font-bold hover:bg-white/10">
            상담 신청
          </Link>
        </div>
      </div>
    </section>
  );
}
