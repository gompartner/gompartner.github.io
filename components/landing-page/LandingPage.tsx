"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Footer } from "@/components/layout/Footer";
import { AnimatePresence, motion } from "framer-motion";
import { BellRing, Check, ChevronDown, Mail, MessageCircle, MessageSquareText } from "lucide-react";
import { estimateFor, formatWon, landingPlans, manwon, planCommon, samplesForPlan } from "@/data/pricing";
import { projects } from "@/data/projects";
import { profile } from "@/data/profile";
import { SMALL_IMAGE_HEIGHT, SMALL_IMAGE_WIDTH, smallImage } from "@/lib/images";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { Bubble, Gutter, Narration, Panel, Sfx, ink } from "@/components/renewal/ui";
import { LeadForm, type PackageName } from "./LeadForm";
import { OwnerPreview } from "./OwnerPreview";

/*
  곰파트너 자신의 '광고 신청 접수 랜딩'. 메인과 같은 세로 웹툰 한 편으로 읽힌다.
  컷 순서: 밤늦게 신청을 세는 사장님(첫 화면) → 메일·문자·톡톡으로 흩어진 신청 → 놓친 상담 → 곰이 고쳐 줌
  → 띠링 알림 → 사장님 쪽 화면 → 가격 → 샘플 → 자주 묻는 질문 → 마지막 컷이 진짜 상담 신청 폼(Apps Script로 접수).
  상호작용: 1. 패키지 카드에서 고르면 폼에 그대로 들어감  2. 시트 상태 칸(패널 안)
  3. 광고·패키지 칩  4. 자주 묻는 질문 펼치기  5. 아래 고정 신청 바(첫 화면을 지나면 뜨고 폼이 보이면 숨음)
*/

const strip = "px-4 md:px-8";
const h2 = "font-[family-name:var(--font-sfx)] text-[30px] font-normal leading-[1.25] md:text-[38px]";
const pressable =
  "border-[3px] shadow-[4px_4px_0_#1d1d1f] transition-[transform,box-shadow,background-color] duration-150 ease-out hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#1d1d1f] active:translate-x-1 active:translate-y-1 active:shadow-none motion-reduce:transition-none motion-reduce:hover:translate-x-0 motion-reduce:hover:translate-y-0";
const sampleHref = (demoUrl: string) => demoUrl.replace("/demo/", "/sample/");

const FOR_WHOM = [
  "광고 신청을 메일과 문자로 따로 확인하는 경우",
  "신청 확인이 늦어 상담을 놓치는 경우",
  "광고별 계약 건수를 확인하기 어려운 경우",
  "홈페이지보다 신청 페이지가 먼저 필요한 경우",
];

const SAMPLE_IDS = ["landing-water-rental", "landing-coding-camp", "landing-move-clean", "landing-popup-store", "landing-stamp-tour", "landing-zine-fair", "landing-leather-class"];

const FAQ: [string, string][] = [
  ["문자·카톡 알림 비용은 별도인가요?", "발송 비용은 건당 20원 내외이며 고객 부담입니다. 카카오 알림톡은 비즈니스 채널 인증과 템플릿 심사가 필요합니다. 메일 알림은 무료입니다."],
  ["신청 내용은 어디에 저장되나요?", "고객 구글 계정의 구글 시트에 저장됩니다. 곰파트너는 신청 내용을 보관하지 않습니다."],
  ["월 비용이 있나요?", "무료 호스팅을 사용하여 월 비용은 없습니다. 도메인은 고객 명의로 직접 구매하며 연 2만 원 내외입니다."],
  ["진행하지 않는 업종이 있나요?", "대부 중개 및 주식·코인 리딩 업종은 진행하지 않습니다."],
  ["작업 기간은 얼마나 걸리나요?", `자료 전달일 기준 ${landingPlans.map((p) => `${p.title} ${p.days}일`).join(" / ")}입니다.`],
];

const PLAN_TO_PKG: Record<string, PackageName> = {
  "landing-basic": "랜딩 기본",
  "landing-standard": "랜딩 표준",
  "landing-premium": "랜딩 고급",
};

const LEAKS = [
  [Mail, "메일", "[홈페이지] 문의가 접수되었습니다", "오후 2:14"],
  [MessageSquareText, "문자", "정수기 상담 원해요 010-77**", "오후 6:40"],
  [MessageCircle, "톡톡", "렌탈료 한 달에 얼마예요?", "오후 9:03"],
] as const;

export function LandingPage() {
  const [pkg, setPkg] = useState<PackageName | "">("");
  const heroRef = useRef<HTMLElement>(null);
  const formRef = useRef<HTMLElement>(null);
  const [heroOut, setHeroOut] = useState(false);
  const [formIn, setFormIn] = useState(false);
  const reduce = useReducedMotionSafe();

  useEffect(() => {
    const hero = heroRef.current;
    const form = formRef.current;
    if (!hero || !form) return;
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.target === hero) setHeroOut(!e.isIntersecting);
        if (e.target === form) setFormIn(e.isIntersecting);
      }
    });
    io.observe(hero);
    io.observe(form);
    return () => io.disconnect();
  }, []);

  const toForm = () => formRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  const pickPlan = (planId: string) => {
    setPkg(PLAN_TO_PKG[planId]);
    toForm();
  };

  const basic = landingPlans[0];
  const samples = SAMPLE_IDS.map((id) => projects.find((p) => p.id === id)).filter((p): p is (typeof projects)[number] => !!p);

  return (
    <div className="wt min-h-screen overflow-x-clip text-foreground">
      <div className="md:px-4 md:py-8">
        <div className="mx-auto max-w-[720px] bg-[#fffdf8] pb-20 shadow-[0_0_0_3px_#1d1d1f] md:pb-24">
          <header className={`${strip} flex h-16 items-center border-b-[3px]`} style={{ borderColor: ink }}>
            <Link href="/" className="flex items-center gap-2 font-[family-name:var(--font-sfx)] text-[22px]">
              <Image src="/images/bear-avatar.webp" alt="" width={34} height={34} className="h-[34px] w-[34px] rounded-full border-2 border-[#1d1d1f] bg-[#fffdf8] object-cover" />
              {profile.name}
            </Link>
          </header>

          <main>
            {/* 1. 첫 화면: 밤늦게 신청을 세는 사장님 */}
            <section ref={heroRef} aria-labelledby="hero-title" className={`${strip} pt-4 md:pt-6`}>
              <Panel img="/images/webtoon/night-phone.jpg" alt="밤늦게 가게 계산대에서 휴대폰을 보는 사장님" className="shadow-[5px_5px_0_#1d1d1f]">
                <Narration className="absolute left-3 top-3">밤 11시</Narration>
                <Bubble className="absolute bottom-16 left-4 md:bottom-20" tail="top-right">
                  광고비는 나갔는데 오늘 신청이 몇 건이었지?
                </Bubble>
              </Panel>
              <motion.h1
                id="hero-title"
                initial={reduce ? false : { opacity: 0, y: 24, rotate: -6 }}
                animate={{ opacity: 1, y: 0, rotate: -2 }}
                transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.3 }}
                className="relative z-10 -mt-10 text-center text-[40px] leading-[1.1] text-white min-[400px]:text-[46px] md:-mt-14 md:text-[64px]"
                style={{ WebkitTextStroke: `8px ${ink}`, paintOrder: "stroke fill" }}
              >
                광고 신청 접수
                <br />
                <span className="text-accent">랜딩페이지 제작</span>
              </motion.h1>
              <p className="mt-5 text-center text-[20px] font-bold tabular-nums md:text-[24px]">
                {manwon(basic.price)}부터 · 작업 {basic.days}일
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <button type="button" onClick={toForm} className={`${pressable} flex h-14 items-center rounded-[6px] bg-accent px-7 text-[18px] font-bold text-white`} style={{ borderColor: ink }}>
                  상담 신청
                </button>
                <a href="#samples" className={`${pressable} flex h-14 items-center rounded-[6px] bg-white px-7 text-[18px] font-bold hover:bg-[#fff3b0]`} style={{ borderColor: ink }}>
                  샘플
                </a>
              </div>
            </section>

            {/* 2. 신청이 새는 장면 */}
            <div className={`${strip} pt-16 md:pt-24`}>
              <Panel bg="#20252b" className="px-5 py-7 md:px-10 md:py-10">
                <ul className="mx-auto grid max-w-[360px] grid-cols-[minmax(0,1fr)] gap-2.5 text-[15px]">
                  {LEAKS.map(([I, from, text, at], i) => (
                    <motion.li
                      key={from}
                      initial={reduce ? false : { opacity: 0, x: i % 2 ? 24 : -24 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, amount: 0.8 }}
                      transition={{ duration: 0.25, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                      className="flex items-start gap-3 rounded-[14px] bg-white/95 px-4 py-3"
                    >
                      <I size={20} aria-hidden className="mt-0.5 shrink-0 text-foreground-secondary" />
                      <span className="min-w-0 flex-1">
                        <b className="block text-[13px] text-foreground-tertiary">{from}</b>
                        <span className="block truncate font-bold">{text}</span>
                      </span>
                      <span className="shrink-0 text-[12px] text-foreground-tertiary">{at}</span>
                    </motion.li>
                  ))}
                </ul>
                <Narration className="mx-auto mt-6">신청은 메일, 문자, 톡톡에 따로 들어왔다</Narration>
              </Panel>
              <Gutter size="sm" />
              <Panel bg="#f4f5f6" className="px-5 pb-10 pt-14 md:px-10">
                <Narration className="absolute left-3 top-3">다음 날 아침</Narration>
                <div className="flex flex-col items-end gap-3 pb-16 md:pb-0">
                  <Bubble tail="bottom-right">어제 신청했는데 연락이 없네요.</Bubble>
                  <Bubble tail="bottom-right" delay={0.35}>
                    다른 데서 하기로 했어요.
                  </Bubble>
                </div>
                <Sfx className="bottom-4 left-6 text-[72px] md:text-[88px]" color="#ff5a4e" rotate={-6} delay={0.8}>
                  뚝
                </Sfx>
              </Panel>

              {/* 3. 곰이 고쳐 준다 */}
              <Gutter size="lg" />
              <Panel img="/images/webtoon/bear-work.jpg" alt="노트북으로 작업하는 곰파트너 곰">
                <Bubble className="absolute left-4 top-4" tail="bottom-right" tone="blue">
                  신청이 들어오면 바로 휴대폰이 울리게 할게요.
                </Bubble>
                <Sfx className="bottom-6 right-5 text-[44px] md:text-[56px]" rotate={6}>
                  타닥타닥
                </Sfx>
              </Panel>
              <Gutter size="sm" />
              <Panel img="/images/webtoon/happy-ding.jpg" alt="새 신청 알림을 받고 놀란 사장님">
                <div className="absolute inset-x-3 top-3 rounded-[16px] border-[3px] bg-white/95 px-4 py-3 md:inset-x-6" style={{ borderColor: ink }}>
                  <p className="flex items-center gap-1.5 text-[13px] font-bold text-foreground-tertiary">
                    <BellRing size={15} aria-hidden /> 문자 · 지금
                  </p>
                  <p className="mt-0.5 text-[16px] font-bold">[곰파트너 렌탈] 새 신청 1건</p>
                  <p className="text-[15px] text-foreground-secondary">김ㅎ늘 · 010-1234-**** · 정수기 · 네이버 검색광고</p>
                </div>
                <Sfx className="bottom-6 left-5 text-[64px] md:text-[80px]" color="#ffd43b" rotate={-10} delay={0.3}>
                  띠링!
                </Sfx>
              </Panel>
            </div>

            {/* 4. 이런 경우에 맞다 */}
            <section aria-labelledby="whom-title" className={`${strip} pt-16 md:pt-24`}>
              <Panel img="/images/webtoon/bear-point.jpg" alt="손가락으로 가리키는 곰파트너 곰">
                <Bubble className="absolute right-4 top-5" tail="bottom-left" tone="blue">
                  <span id="whom-title">이럴 때 쓰시면 좋아요</span>
                </Bubble>
              </Panel>
              <Gutter size="sm" />
              <Panel className="px-5 py-6 md:px-8 md:py-8">
                <ul className="grid gap-3">
                  {FOR_WHOM.map((t) => (
                    <li key={t} className="flex gap-3 text-[17px] font-bold leading-[1.55]">
                      <span aria-hidden className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 bg-accent text-white" style={{ borderColor: ink }}>
                        <Check size={14} strokeWidth={3.5} />
                      </span>
                      {t}
                    </li>
                  ))}
                </ul>
              </Panel>
            </section>

            {/* 5. 사장님 쪽 화면 */}
            <section aria-labelledby="owner-title" className={`${strip} pt-16 md:pt-24`}>
              <h2 id="owner-title" className={h2}>
                신청 접수 화면
              </h2>
              <Bubble className="mt-4" tail="bottom-left">
                상태 칸은 눌러서 바꿀 수 있어요
              </Bubble>
              <div className="h-5" aria-hidden />
              <Panel className="shadow-[5px_5px_0_#1d1d1f]">
                <OwnerPreview />
              </Panel>
            </section>

            {/* 6. 패키지 */}
            <section aria-labelledby="plans-title" className={`${strip} pt-16 md:pt-24`}>
              <h2 id="plans-title" className={h2}>
                가격
              </h2>
              <ul className="mt-6 grid gap-6">
                {landingPlans.map((plan) => {
                  const planSamples = samplesForPlan(plan.id).slice(0, 2);
                  return (
                    <li key={plan.id} className="flex flex-col border-[3px] bg-white shadow-[5px_5px_0_#1d1d1f]" style={{ borderColor: ink }}>
                      <div className="flex items-center justify-between gap-3 border-b-[3px] bg-[#fff3b0] px-5 py-3" style={{ borderColor: ink }}>
                        <p className="text-[18px] font-bold">{plan.title}</p>
                        <p className="shrink-0 text-[15px] font-bold">작업 {plan.days}일</p>
                      </div>
                      <div className="flex flex-1 flex-col p-5 md:p-6">
                        <p className="text-[34px] font-bold leading-[1.2] tabular-nums text-accent">{formatWon(plan.price)}</p>
                        <p className="mt-1 text-[16px] text-foreground-secondary">{plan.summary}</p>
                        <ul className="mt-5 grid gap-2 border-t-2 pt-4 text-[16px] md:grid-cols-2 md:gap-x-6 md:text-[17px]" style={{ borderColor: ink }}>
                          {[...plan.includes, `수정 ${plan.revisions}회`, ...planCommon].map((item) => (
                            <li key={item} className="flex gap-2">
                              <Check size={20} strokeWidth={3} className="mt-[2px] shrink-0 text-accent" aria-hidden />
                              {item}
                            </li>
                          ))}
                        </ul>
                        {planSamples.length > 0 && (
                          <div className="mt-5">
                            <p className="text-[14px] font-bold text-foreground-secondary">이 패키지로 만든 샘플</p>
                            <ul className="mt-2 grid grid-cols-2 gap-2">
                              {planSamples.map((s) => {
                                const p = projects.find((x) => x.id === s.id)!;
                                const est = estimateFor(s.id)!;
                                return (
                                  <li key={s.id} className="min-w-0">
                                    <Link href={sampleHref(p.demoUrl)} prefetch={false} className="group block overflow-hidden border-[2.5px] bg-white" style={{ borderColor: ink }}>
                                      <Image src={smallImage(p.imageUrl)} alt="" width={SMALL_IMAGE_WIDTH} height={SMALL_IMAGE_HEIGHT} className="aspect-[16/10] h-auto w-full object-cover object-top transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none" />
                                      <span className="block border-t-[2.5px] px-2 py-1.5 text-[13px] font-bold leading-[1.35]" style={{ borderColor: ink }}>
                                        <span className="line-clamp-1">{p.title}</span>
                                        <span className="tabular-nums text-accent">{manwon(est.total)}</span>
                                      </span>
                                    </Link>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        )}
                        <div className="mt-auto pt-6">
                          <button
                            type="button"
                            onClick={() => pickPlan(plan.id)}
                            className="flex h-12 w-full items-center justify-center rounded-[6px] border-[2.5px] bg-white text-[17px] font-bold shadow-[3px_3px_0_#1d1d1f] transition-[transform,box-shadow,background-color] duration-150 hover:bg-[#fff3b0] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none motion-reduce:transition-none"
                            style={{ borderColor: ink }}
                          >
                            이 패키지로 상담
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>

            {/* 7. 샘플 */}
            <section id="samples" aria-labelledby="samples-title" className={`${strip} scroll-mt-6 pt-16 md:pt-24`}>
              <h2 id="samples-title" className={h2}>
                샘플
              </h2>
              <ul className="mt-6 grid gap-5 sm:grid-cols-2">
                {samples.map((p, i) => (
                  <li key={p.id} className="min-w-0">
                    <Link
                      href={p.demoUrl}
                      className={`${pressable} group block overflow-hidden bg-white`}
                      style={{ borderColor: ink, rotate: `${i % 2 ? 0.8 : -0.8}deg` }}
                    >
                      <Image src={smallImage(p.imageUrl)} alt={p.imageAlt} width={SMALL_IMAGE_WIDTH} height={SMALL_IMAGE_HEIGHT} className="aspect-[16/10] h-auto w-full border-b-[3px] object-cover object-top" style={{ borderColor: ink }} />
                      <span className="block p-4">
                        <span className="block text-[14px] font-bold text-accent">{p.layout}</span>
                        <span className="mt-0.5 block text-[17px] font-bold leading-[1.4] group-hover:underline">{p.title}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            {/* 8. 자주 묻는 질문 */}
            <section aria-labelledby="faq-title" className={`${strip} pt-16 md:pt-24`}>
              <h2 id="faq-title" className={h2}>
                자주 묻는 질문
              </h2>
              <div className="mt-6 divide-y-2 border-[3px] bg-white" style={{ borderColor: ink }}>
                {FAQ.map(([q, a]) => (
                  <details key={q} className="group px-5 py-4 [border-color:#1d1d1f] md:px-6">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[17px] font-bold leading-[1.5] md:text-[18px] [&::-webkit-details-marker]:hidden">
                      {q}
                      <span aria-hidden className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-[2.5px] bg-white transition-colors group-open:bg-accent group-open:text-white" style={{ borderColor: ink }}>
                        <ChevronDown size={18} strokeWidth={3} className="transition-transform group-open:rotate-180 motion-reduce:transition-none" />
                      </span>
                    </summary>
                    <p className="mt-3 border-[3px] bg-[#fff3b0] px-4 py-3 text-[16px] leading-[1.7] md:text-[17px]" style={{ borderColor: ink }}>
                      {a}
                    </p>
                  </details>
                ))}
              </div>
            </section>

            {/* 9. 마지막 컷: 상담 신청 */}
            <div className={`${strip} pt-16 md:pt-24`}>
              <Panel img="/images/webtoon/bear-hello.jpg" alt="노트북을 들고 손을 흔드는 곰파트너 곰">
                <Bubble className="absolute right-4 top-5" tail="bottom-left" tone="blue">
                  남겨 주시면 하루 안에 연락드릴게요
                </Bubble>
              </Panel>
            </div>
            <LeadForm ref={formRef} pkg={pkg} onPkg={setPkg} />
          </main>
        </div>
      </div>

      {/* 사이트 공용 바닥글. 아래 고정 신청 바에 가리지 않게 여백을 둔다. */}
      <div className="pb-24 md:pb-0">
        <Footer />
      </div>

      <AnimatePresence>
        {heroOut && !formIn && (
          <motion.div
            className="fixed inset-x-0 z-40 px-4"
            style={{ bottom: "max(12px, env(safe-area-inset-bottom))" }}
            initial={reduce ? false : { y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { y: 24, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="mx-auto flex h-14 max-w-[520px] items-center gap-3 rounded-[10px] border-[3px] bg-white pl-4 pr-2 shadow-[4px_4px_0_#1d1d1f]" style={{ borderColor: ink }}>
              <p className="min-w-0 flex-1 truncate text-[16px] font-bold tabular-nums">
                {manwon(basic.price)}부터 · {basic.days}일
              </p>
              <button type="button" onClick={toForm} className="h-10 shrink-0 rounded-[6px] border-[2.5px] bg-accent px-5 text-[16px] font-bold text-white" style={{ borderColor: ink }}>
                상담 신청
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
