"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight, List } from "lucide-react";
import { landingPlans, manwon, plans } from "@/data/pricing";
import { maintenanceServices } from "@/data/maintenance";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { AdEpisode, CompanyEpisode, MaintenanceEpisode, ProgramEpisode } from "./episodes";
import { Bubble, Gutter, Panel, ink } from "./ui";

// 리뉴얼 시안: 사이트 전체를 세로 웹툰 한 편으로 읽는다.
// 표지 → 곰이 "어떤 일로 오셨어요?" 묻는 컷 → 방문자가 자기 상황(답 말풍선)을 고르면 그 이야기가 이어진다.
// 이야기를 읽기 싫은 사람을 위해 같은 내용을 목록으로도 볼 수 있다.

type Key = "ad" | "company" | "fix" | "program";

const choices: { key: Key; say: string; service: string; price: string }[] = [
  { key: "ad", say: "광고 신청이 자꾸 새요", service: "광고 랜딩페이지", price: `${manwon(landingPlans[0].price)}부터` },
  { key: "company", say: "회사 홈페이지가 너무 오래됐어요", service: "홈페이지 제작", price: `${manwon(plans[0].price)}부터` },
  { key: "fix", say: "만든 홈페이지가 고장 났어요", service: "유지보수", price: maintenanceServices.find((s) => s.title === "오류 수정")!.price },
  { key: "program", say: "엑셀로 하는 일이 너무 많아요", service: "업무 프로그램", price: "별도 견적" },
];

const links: Record<Key, string> = { ad: "/landing", company: "/pricing", fix: "/maintenance", program: "/works" };

const episodes: Record<Key, () => React.ReactNode> = {
  ad: () => <AdEpisode />,
  company: () => <CompanyEpisode />,
  fix: () => <MaintenanceEpisode />,
  program: () => <ProgramEpisode />,
};

const coverShots = [
  ["/images/webtoon/night-phone.jpg", -4],
  ["/images/webtoon/factory.jpg", 3],
  ["/images/webtoon/cafe-broken.jpg", 2.5],
  ["/images/webtoon/excel.jpg", -3],
] as const;

/** 표지: 네 장면이 한 장씩 찍히듯 떨어지고(120ms 간격) 그 위에 제목이 얹힌다. */
function Cover() {
  const reduce = useReducedMotionSafe();
  return (
    <header className="relative px-4 pb-14 pt-4 md:px-8 md:pb-20 md:pt-6">
      <div className="grid grid-cols-2 gap-3 md:gap-4">
        {coverShots.map(([src, r], i) => (
          <motion.div
            key={src}
            initial={reduce ? false : { opacity: 0, scale: 1.25, rotate: r * 3 }}
            animate={{ opacity: 1, scale: 1, rotate: r }}
            transition={{ type: "spring", stiffness: 380, damping: 22, delay: 0.1 + i * 0.12 }}
            className="overflow-hidden border-[3px] bg-white"
            style={{ borderColor: ink, boxShadow: `5px 5px 0 ${ink}` }}
          >
            <Image src={src} alt="" width={900} height={900} sizes="(min-width: 768px) 300px, 50vw" priority={i < 2} className="block h-auto w-full" />
          </motion.div>
        ))}
      </div>
      <motion.h1
        initial={reduce ? false : { opacity: 0, y: 30, rotate: -8 }}
        animate={{ opacity: 1, y: 0, rotate: -3 }}
        transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.7 }}
        className="relative z-10 -mt-12 text-center font-[family-name:var(--font-sfx)] text-[72px] leading-none text-accent md:-mt-16 md:text-[112px]"
        style={{ WebkitTextStroke: `9px ${ink}`, paintOrder: "stroke fill" }}
      >
        곰파트너
      </motion.h1>
      <p className="mt-4 text-center text-[16px] font-bold md:text-[18px]">랜딩페이지, 홈페이지, 유지보수, 업무 프로그램</p>
    </header>
  );
}

export function Webtoon() {
  const reduce = useReducedMotionSafe();
  const [pick, setPick] = useState<Key | null>(null);
  const [listMode, setListMode] = useState(false);
  const askRef = useRef<HTMLElement>(null);
  const storyRef = useRef<HTMLDivElement>(null);

  // 상황을 고르면 이어지는 첫 컷으로 내려간다
  useEffect(() => {
    if (pick) storyRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }, [pick, reduce]);

  const toAsk = () => askRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });

  return (
    <div className="overflow-x-clip md:px-4 md:py-8">
      <div className="mx-auto max-w-[720px] bg-[#fffdf8] pb-24 shadow-[0_0_0_3px_#1d1d1f]">
        <div className="flex justify-end px-4 pt-4 md:px-8">
          <button
            type="button"
            onClick={() => {
              setListMode((v) => !v);
              setTimeout(toAsk, 0);
            }}
            aria-pressed={listMode}
            className="flex h-10 items-center gap-1.5 rounded-full border-[2.5px] bg-white px-4 text-[15px] font-bold transition-colors hover:bg-[#fff3b0]"
            style={{ borderColor: ink }}
          >
            <List size={18} aria-hidden />
            {listMode ? "이야기로 보기" : "목록으로 보기"}
          </button>
        </div>
        <Cover />

        <section ref={askRef} aria-labelledby="ask-title" className="scroll-mt-20 px-4 md:px-8">
          {listMode ? (
            <div className="py-6">
              <h2 id="ask-title" className="text-[24px] font-bold md:text-[28px]">
                서비스
              </h2>
              <ul className="mt-5 divide-y-2 border-y-[3px]" style={{ borderColor: ink }}>
                {choices.map((c) => (
                  <li key={c.key}>
                    <Link href={links[c.key]} className="flex items-center justify-between gap-4 py-4 hover:bg-[#fff3b0]">
                      <span className="text-[18px] font-bold">{c.service}</span>
                      <span className="text-[16px] font-bold tabular-nums text-accent">{c.price}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <>
              <Panel img="/images/webtoon/bear-hello.jpg" alt="노트북을 들고 손을 흔드는 곰파트너 곰">
                <Bubble className="absolute right-4 top-5" tail="bottom-left" tone="blue">
                  <span id="ask-title">사장님, 어떤 일로 오셨어요?</span>
                </Bubble>
                <Bubble className="absolute bottom-5 right-4" tail="top-left" tone="blue" delay={0.35}>
                  하나 골라 주세요
                </Bubble>
              </Panel>
              <Gutter size="sm" />
              <ul className="flex flex-col items-end gap-3" aria-labelledby="ask-title">
                {choices.map((c, i) => {
                  const on = pick === c.key;
                  return (
                    <motion.li
                      key={c.key}
                      initial={reduce ? false : { opacity: 0, x: 40 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, amount: 0.8 }}
                      transition={{ type: "spring", stiffness: 420, damping: 28, delay: i * 0.08 }}
                    >
                      {/* 누르는 말풍선: 먹색 그림자가 깔린 버튼 모양, 누르면 그림자 쪽으로 눌린다(150ms). */}
                      <button
                        type="button"
                        onClick={() => setPick(c.key)}
                        aria-pressed={on}
                        className={`group flex items-center gap-3 rounded-[26px] rounded-br-[6px] border-[3px] py-3 pl-5 pr-3 text-left shadow-[4px_4px_0_#1d1d1f] transition-[transform,box-shadow,background-color] duration-150 ease-out hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#1d1d1f] active:translate-x-1 active:translate-y-1 active:shadow-none ${on ? "bg-accent text-white" : pick ? "bg-white/70 text-foreground-secondary" : "bg-white hover:bg-[#fff3b0]"}`}
                        style={{ borderColor: ink }}
                      >
                        <span>
                          <span className="block text-[17px] font-bold md:text-[19px]">{c.say}</span>
                          <span className={`block text-[13px] font-bold md:text-[14px] ${on ? "text-white/85" : "text-foreground-tertiary"}`}>
                            {c.service}, {c.price}
                          </span>
                        </span>
                        <motion.span
                          aria-hidden
                          animate={reduce || pick ? { x: 0 } : { x: [0, 5, 0] }}
                          transition={{ duration: 0.6, ease: "easeInOut", repeat: reduce || pick ? 0 : Infinity, repeatDelay: 1.4, delay: 1 + i * 0.15 }}
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-[2.5px] ${on ? "bg-white text-accent" : "bg-accent text-white"}`}
                          style={{ borderColor: ink }}
                        >
                          <ChevronRight size={18} strokeWidth={3} />
                        </motion.span>
                      </button>
                    </motion.li>
                  );
                })}
              </ul>
            </>
          )}
        </section>

        {pick && !listMode && (
          <div ref={storyRef} key={pick} className="scroll-mt-20 px-4 pt-16 md:px-8 md:pt-24">
            {episodes[pick]()}
            <div className="mt-16 text-center">
              <p className="text-[15px] font-bold text-foreground-tertiary">다른 상황</p>
              <ul className="mt-3 flex flex-wrap justify-center gap-2">
                {choices
                  .filter((c) => c.key !== pick)
                  .map((c) => (
                    <li key={c.key}>
                      <button type="button" onClick={() => setPick(c.key)} className="rounded-full border-[3px] bg-white px-4 py-2 text-[15px] font-bold hover:bg-[#fff3b0]" style={{ borderColor: ink }}>
                        {c.say}
                      </button>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
