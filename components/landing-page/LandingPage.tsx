"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";
import { formatWon, landingPlans, manwon, planCommon } from "@/data/pricing";
import { projects } from "@/data/projects";
import { profile } from "@/data/profile";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { LeadForm, type PackageName } from "./LeadForm";
import { OwnerPreview } from "./OwnerPreview";

/*
  곰파트너 자신의 '광고 신청 접수 랜딩'. 파는 상품과 같은 모양으로 만들었다.
  메뉴 없이 한 줄로 내려가고, 끝에 진짜 상담 신청 폼이 있다(Apps Script로 접수).
  상호작용: 1. 패키지 카드에서 고르면 폼에 그대로 들어감  2. 시트 상태 칸(패널 안)
  3. 광고·패키지 칩  4. 자주 묻는 질문 펼치기  5. 아래 고정 신청 바(첫 화면을 지나면 뜨고 폼이 보이면 숨음)
*/

const container = "mx-auto w-full max-w-[1200px] px-4 md:px-6";
const h2 = "text-[28px] font-bold leading-[1.35] tracking-[-0.02em] md:text-[36px]";

const FOR_WHOM = [
  "광고비는 매달 나가는데 신청이 메일, 문자, 카톡으로 흩어져 들어오는 분",
  "신청을 받고 바로 전화하지 못해 다른 업체에 손님을 뺏긴 적이 있는 분",
  "네이버와 메타 중 어디서 계약이 나오는지 몰라 광고비를 나눠 쓰는 분",
  "홈페이지 전체보다 신청 받는 한 쪽이 먼저 필요한 분",
];

const SAMPLE_IDS = ["landing-water-rental", "landing-coding-camp", "landing-move-clean"];

const FAQ: [string, string][] = [
  [
    "문자나 카톡 알림은 따로 돈이 드나요?",
    "발송 업체 요금이 건당 20원 안팎으로 들고, 의뢰인 계정에서 나갑니다. 카톡 알림톡은 사업자 인증을 받은 카카오톡 채널과 알림 문구 심사가 필요해서 며칠 더 걸립니다. 메일 알림은 무료입니다.",
  ],
  [
    "신청 내용은 어디에 저장되나요?",
    "의뢰인 구글 계정의 구글 시트에만 저장됩니다. 접수 스크립트도 의뢰인 계정에서 돌아가서, 곰파트너가 신청 내용을 따로 보관하지 않습니다.",
  ],
  [
    "매달 드는 돈이 있나요?",
    "무료 정적 호스팅에 올리면 월 비용이 없습니다. 도메인은 의뢰인 명의로 직접 사고, 1년 2만 원 안팎입니다(패키지 금액 별도).",
  ],
  ["받지 않는 업종이 있나요?", "대부·대출 중개, 주식·코인 리딩처럼 광고 규제가 있는 업종은 진행하지 않습니다."],
  [
    "얼마나 걸리나요?",
    `자료를 받은 날부터 ${landingPlans.map((p) => `${p.title} ${p.days}일`).join(", ")}입니다. 수정은 패키지 횟수 안에서 반영합니다.`,
  ],
];

const PLAN_TO_PKG: Record<string, PackageName> = {
  "landing-basic": "신청 접수 랜딩",
  "landing-standard": "상담 관리 랜딩",
  "landing-premium": "광고 성과 랜딩",
};

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
    <div className="min-h-screen bg-background text-foreground">
      <header className={`${container} flex h-16 items-center`}>
        <Link href="/" className="flex items-center gap-2 text-[18px] font-bold">
          <Image src="/images/logo.svg" alt="" width={26} height={26} className="h-[26px] w-[26px]" />
          {profile.name}
        </Link>
      </header>

      <main>
        {/* 1. 첫 화면 */}
        <section ref={heroRef} aria-labelledby="hero-title" className={`${container} pb-16 pt-8 md:pb-24 md:pt-16`}>
          <p className="text-[17px] font-bold text-accent">광고 신청 접수 랜딩페이지 제작</p>
          <h1 id="hero-title" className="mt-3 text-[36px] font-bold leading-[1.3] tracking-[-0.03em] md:text-[56px]">
            광고 보고 남긴 신청,
            <br />
            통화했는지 계약했는지까지
            <br />
            남겨 드립니다
          </h1>
          <p className="mt-5 max-w-[640px] text-[17px] leading-[1.6] text-foreground-secondary md:text-[19px]">
            신청이 들어오면 바로 알리고, 구글 시트에 상담 상태를 적고, 광고별로 계약이 몇 건 나왔는지 묶어 보여 드립니다. 시트에 쌓아 두기만 하는 랜딩과 다른 점입니다.
          </p>
          <p className="mt-6 text-[22px] font-bold tabular-nums md:text-[26px]">
            {manwon(basic.price)}부터 · 작업 {basic.days}일
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" onClick={toForm} className="flex h-14 items-center rounded-[6px] bg-accent px-7 text-[18px] font-bold text-accent-foreground transition-colors hover:bg-accent-hover">
              상담 신청
            </button>
            <a href="#samples" className="flex h-14 items-center rounded-[6px] border border-border px-7 text-[18px] font-bold transition-colors hover:border-accent hover:text-accent">
              샘플 써 보기
            </a>
          </div>
        </section>

        {/* 2. 이런 분께 */}
        <section aria-labelledby="whom-title" className="border-t border-border bg-surface py-16 md:py-24">
          <div className={container}>
            <h2 id="whom-title" className={h2}>
              이런 분께 맞습니다
            </h2>
            <ul className="mt-8 grid gap-3 md:grid-cols-2">
              {FOR_WHOM.map((t) => (
                <li key={t} className="flex gap-3 rounded-[10px] border border-border bg-background p-5 text-[17px] leading-[1.6]">
                  <Check size={22} strokeWidth={2.5} className="mt-0.5 shrink-0 text-accent" aria-hidden />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 3. 사장님 쪽 화면 */}
        <section aria-labelledby="owner-title" className="py-16 md:py-24">
          <div className={container}>
            <h2 id="owner-title" className={h2}>
              신청 한 건이 들어오면
            </h2>
            <p className="mt-3 max-w-[720px] text-[17px] leading-[1.6] text-foreground-secondary">
              휴대폰으로 바로 알림이 오고, 시트에 한 줄이 생깁니다. 시트의 상담 상태를 눌러 바꿔 보세요. 30분 동안 통화 전으로 남아 있으면 한 번 더 알려 드립니다.
            </p>
            <div className="mt-8 rounded-[12px] border border-border bg-surface p-2 md:p-4">
              <OwnerPreview />
            </div>
          </div>
        </section>

        {/* 4. 패키지 */}
        <section aria-labelledby="plans-title" className="border-t border-border bg-surface py-16 md:py-24">
          <div className={container}>
            <h2 id="plans-title" className={h2}>
              패키지
            </h2>
            <ul className="mt-8 grid gap-4 md:grid-cols-3">
              {landingPlans.map((plan) => (
                <li key={plan.id} className="flex flex-col rounded-[10px] border border-border bg-background p-6">
                  <p className="text-[17px] font-bold">
                    {plan.title} <span className="font-normal text-foreground-secondary">· {plan.days}일</span>
                  </p>
                  <p className="mt-1 text-[32px] font-bold leading-[1.3] tabular-nums">{formatWon(plan.price)}</p>
                  <p className="mt-1 text-[17px] leading-[1.6] text-foreground-secondary">{plan.summary}</p>
                  <ul className="mt-5 space-y-2 border-t border-border pt-5 text-[17px]">
                    {[...plan.includes, `수정 ${plan.revisions}회`, ...planCommon].map((item) => (
                      <li key={item} className="flex gap-2 leading-[1.5]">
                        <Check size={20} strokeWidth={2.5} className="mt-[3px] shrink-0 text-accent" aria-hidden />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto pt-6">
                    <button
                      type="button"
                      onClick={() => pickPlan(plan.id)}
                      className="flex h-12 w-full items-center justify-center rounded-[6px] border border-accent text-[17px] font-bold text-accent transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      이 패키지로 상담
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 5. 샘플 */}
        <section id="samples" aria-labelledby="samples-title" className="scroll-mt-6 py-16 md:py-24">
          <div className={container}>
            <h2 id="samples-title" className={h2}>
              샘플에서 직접 신청해 보세요
            </h2>
            <p className="mt-3 max-w-[720px] text-[17px] leading-[1.6] text-foreground-secondary">
              신청을 마치면 사장님 쪽 알림과 시트 화면까지 보입니다. 상호와 정보는 가상입니다.
            </p>
            <ul className="mt-8 grid gap-4 md:grid-cols-3">
              {samples.map((p) => (
                <li key={p.id}>
                  <Link href={p.demoUrl} className="group block overflow-hidden rounded-[10px] border border-border bg-background transition-colors hover:border-accent">
                    <Image src={p.imageUrl} alt={p.imageAlt} width={1440} height={900} className="aspect-[16/10] w-full object-cover object-top" />
                    <div className="p-5">
                      <p className="text-[15px] font-bold text-accent">{p.layout}</p>
                      <p className="mt-1 text-[18px] font-bold leading-[1.4] group-hover:underline">{p.title}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 6. 자주 묻는 질문 */}
        <section aria-labelledby="faq-title" className="border-t border-border py-16 md:py-24">
          <div className={`${container} max-w-[880px]`}>
            <h2 id="faq-title" className={h2}>
              자주 묻는 질문
            </h2>
            <div className="mt-8 divide-y divide-border border-y border-border">
              {FAQ.map(([q, a]) => (
                <details key={q} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[18px] font-bold leading-[1.5] [&::-webkit-details-marker]:hidden">
                    {q}
                    <ChevronDown size={22} className="shrink-0 transition-transform group-open:rotate-180" aria-hidden />
                  </summary>
                  <p className="mt-3 text-[17px] leading-[1.7] text-foreground-secondary">{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* 7. 상담 신청 */}
        <LeadForm ref={formRef} pkg={pkg} onPkg={setPkg} />
      </main>

      <footer className="border-t border-border py-10 pb-28 md:pb-10">
        <div className={`${container} flex flex-wrap items-center gap-x-6 gap-y-2 text-[15px] text-foreground-secondary`}>
          <span className="font-bold text-foreground">{profile.name}</span>
          <span>{profile.email}</span>
          <Link href="/privacy" className="underline-offset-4 hover:underline">
            개인정보처리방침
          </Link>
          <Link href="/" className="underline-offset-4 hover:underline">
            홈페이지 제작
          </Link>
        </div>
      </footer>

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
            <div className="mx-auto flex h-14 max-w-[520px] items-center gap-3 rounded-[10px] bg-foreground pl-4 pr-2 text-background shadow-[0_8px_24px_rgba(0,0,0,0.2)]">
              <p className="min-w-0 flex-1 truncate text-[16px] font-bold tabular-nums">
                {manwon(basic.price)}부터 · {basic.days}일
              </p>
              <button type="button" onClick={toForm} className="h-10 shrink-0 rounded-[6px] bg-accent px-5 text-[16px] font-bold text-accent-foreground">
                상담 신청
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
