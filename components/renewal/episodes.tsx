"use client";

import Image from "next/image";
import { useId, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BellRing, ChevronsLeftRight, Mail, MessageCircle, MessageSquareText, Paperclip } from "lucide-react";
import { landingPlans, manwon, plans } from "@/data/pricing";
import { maintenanceServices, responseTime } from "@/data/maintenance";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { Bubble, EndCard, Gutter, Narration, Panel, Sfx, ink, maskName } from "./ui";

// 방문자가 고른 상황마다 이어지는 이야기. 컷 순서: 문제 장면 → 곰 등장 → 직접 해 보는 컷 → 회차 끝 카드.
// 가격·기간·응답 시간 문구는 data/pricing.ts, data/maintenance.ts 값을 그대로 쓴다.

const chat = (msg: string) => `/?chat=1&msg=${encodeURIComponent(msg)}`;

/** 형광펜이 왼쪽부터 그어지는 강조(600ms). 새로 생긴 줄·정리된 줄에 쓴다. */
function Marker({ children, on }: { children: React.ReactNode; on: boolean }) {
  const reduce = useReducedMotionSafe();
  return (
    <span className="relative isolate">
      <motion.span
        aria-hidden
        className="absolute inset-y-[-2px] left-[-4px] right-[-4px] -z-10 origin-left bg-[#ffe45c]"
        initial={false}
        animate={{ scaleX: on ? 1 : 0 }}
        transition={{ duration: reduce ? 0 : 0.6, ease: [0.65, 0, 0.35, 1] }}
      />
      {children}
    </span>
  );
}

/* ───────── 1. 광고 신청이 새는 렌탈 사장님 ───────── */

export function AdEpisode() {
  const reduce = useReducedMotionSafe();
  const id = useId();
  const [name, setName] = useState("김하늘");
  const [phone, setPhone] = useState("010-1234-5678");
  const [item, setItem] = useState("정수기");
  const [sent, setSent] = useState<null | { name: string; phone: string; item: string; at: string }>(null);
  const basic = landingPlans[0];

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    setSent({
      name: maskName(name) || "김ㅎ늘",
      phone: phone.replace(/(\d{3})-?(\d{3,4})-?\d{4}$/, "$1-$2-****"),
      item,
      at: `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`,
    });
  };

  return (
    <>
      <Panel img="/images/webtoon/night-phone.jpg" alt="밤늦게 가게 계산대에서 휴대폰을 보는 정수기 렌탈 사장님">
        <Narration className="absolute left-3 top-3">밤 11시</Narration>
        <Bubble className="absolute bottom-4 left-4" tail="top-right">
          오늘도 광고비는 나갔는데… 신청이 몇 건이었지?
        </Bubble>
      </Panel>
      <Gutter size="sm" />
      <Panel bg="#20252b" className="px-5 py-7 md:px-10 md:py-10">
        <ul className="mx-auto grid max-w-[360px] gap-2.5 text-[15px]">
          {[
            [Mail, "메일", "[홈페이지] 문의가 접수되었습니다", "오후 2:14"],
            [MessageSquareText, "문자", "정수기 상담 원해요 010-77**", "오후 6:40"],
            [MessageCircle, "톡톡", "렌탈료 한 달에 얼마예요?", "오후 9:03"],
          ].map(([Icon, from, text, at], i) => {
            const I = Icon as typeof Mail;
            return (
              <motion.li
                key={from as string}
                initial={reduce ? false : { opacity: 0, x: i % 2 ? 24 : -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.8 }}
                transition={{ duration: 0.25, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                className="flex items-start gap-3 rounded-[14px] bg-white/95 px-4 py-3"
              >
                <I size={20} aria-hidden className="mt-0.5 shrink-0 text-foreground-secondary" />
                <span className="min-w-0 flex-1">
                  <b className="block text-[13px] text-foreground-tertiary">{from as string}</b>
                  <span className="block truncate font-bold">{text as string}</span>
                </span>
                <span className="shrink-0 text-[12px] text-foreground-tertiary">{at as string}</span>
              </motion.li>
            );
          })}
        </ul>
        <Narration className="mx-auto mt-6">신청은 메일, 문자, 톡톡에 따로 들어왔다</Narration>
      </Panel>
      <Gutter />
      <Panel bg="#f4f5f6" className="px-5 pb-10 pt-14 md:px-10">
        <Narration className="absolute left-3 top-3">다음 날 아침</Narration>
        <div className="flex flex-col items-end gap-3">
          <Bubble tail="bottom-right">어제 상담 신청했는데 연락이 없어서요.</Bubble>
          <Bubble tail="bottom-right" delay={0.35}>
            다른 데서 하기로 했어요.
          </Bubble>
        </div>
        <Sfx className="bottom-4 left-6 text-[72px] md:text-[88px]" color="#ff5a4e" rotate={-6} delay={0.8}>
          뚝
        </Sfx>
      </Panel>
      <Gutter size="lg" />
      <Panel img="/images/webtoon/bear-work.jpg" alt="노트북으로 빠르게 작업하는 곰파트너 곰">
        <Bubble className="absolute left-4 top-4" tail="bottom-right" tone="blue">
          신청이 들어오면 바로 휴대폰이 울리게 할게요.
        </Bubble>
        <Sfx className="bottom-6 right-5 text-[44px] md:text-[56px]" rotate={6}>
          타닥타닥
        </Sfx>
      </Panel>
      <Gutter />
      <Panel bg="#0f5e5a" className="px-3 py-6 sm:px-5 sm:py-8 md:px-10 md:py-10">
        <Narration className="mb-5">직접 신청해 보세요</Narration>
        <form onSubmit={submit} className="rounded-[14px] bg-white p-4 sm:p-5 md:p-6" aria-labelledby={`${id}-t`}>
          <p id={`${id}-t`} className="text-[19px] font-bold leading-[1.35] sm:text-[20px]">
            정수기 렌탈 월 19,900원부터
          </p>
          <fieldset className="mt-4">
            <legend className="text-[14px] font-bold text-foreground-secondary">궁금한 제품</legend>
            <div className="mt-2 grid grid-cols-3 gap-1.5 sm:flex sm:gap-2">
              {["정수기", "비데", "공기청정기"].map((v) => (
                <label key={v} className="min-w-0 cursor-pointer">
                  <input type="radio" name={`${id}-item`} value={v} checked={item === v} onChange={() => setItem(v)} className="peer sr-only" />
                  <span className="flex h-10 items-center justify-center whitespace-nowrap rounded-full border-2 border-border px-1.5 text-[14px] font-bold sm:inline-flex sm:px-4 sm:text-[15px] peer-checked:border-[#0f5e5a] peer-checked:bg-[#0f5e5a] peer-checked:text-white peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent">
                    {v}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="grid min-w-0 gap-1 text-[14px] font-bold text-foreground-secondary">
              이름
              <input value={name} onChange={(e) => setName(e.target.value)} required maxLength={10} className="h-12 w-full min-w-0 rounded-[6px] border-2 border-border px-3 text-[16px] font-normal text-foreground" />
            </label>
            <label className="grid min-w-0 gap-1 text-[14px] font-bold text-foreground-secondary">
              연락처
              <input value={phone} onChange={(e) => setPhone(e.target.value)} required inputMode="tel" maxLength={13} className="h-12 w-full min-w-0 rounded-[6px] border-2 border-border px-3 text-[16px] font-normal text-foreground" />
            </label>
          </div>
          <button type="submit" className="mt-5 h-13 w-full rounded-[6px] bg-[#ffd43b] py-3.5 text-[17px] font-bold text-[#1d1d1f] transition-transform active:scale-[0.98]">
            {sent ? "한 번 더 신청" : "무료 상담 신청"}
          </button>
        </form>
      </Panel>
      <AnimatePresence initial={false}>
        {sent && (
          <motion.div key={sent.at + sent.name + sent.item} initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }}>
            <Gutter size="sm" />
            <Panel img="/images/webtoon/happy-ding.jpg" alt="새 신청 알림을 받고 놀란 정수기 렌탈 사장님">
              <motion.div
                role="status"
                initial={reduce ? false : { y: -90, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 420, damping: 26, delay: 0.15 }}
                className="absolute inset-x-3 top-3 rounded-[16px] border-[3px] bg-white/95 px-4 py-3 shadow-lg backdrop-blur md:inset-x-6"
                style={{ borderColor: ink }}
              >
                <p className="flex items-center gap-1.5 text-[13px] font-bold text-foreground-tertiary">
                  <BellRing size={15} aria-hidden /> 문자 · 지금
                </p>
                <p className="mt-0.5 text-[16px] font-bold">[곰파트너 렌탈] 새 신청 1건</p>
                <p className="text-[15px] text-foreground-secondary">
                  {sent.name} · {sent.phone} · {sent.item} · 네이버 검색광고
                </p>
              </motion.div>
              <Sfx className="bottom-6 left-5 text-[64px] md:text-[80px]" color="#ffd43b" rotate={-10} delay={0.45}>
                띠링!
              </Sfx>
            </Panel>
            <Gutter size="sm" />
            <Panel className="px-4 py-6 md:px-8 md:py-8">
              <Narration className="mb-4">구글 시트에도 한 줄</Narration>
              <div>
                <table className="w-full border-collapse text-left text-[14px] md:text-[15px]">
                  <thead>
                    <tr className="border-b-2 text-[13px] text-foreground-tertiary" style={{ borderColor: ink }}>
                      {["접수", "이름", "연락처", "제품", "유입", "상담 상태"].map((h, i) => (
                        <th key={h} scope="col" className={`py-2 pr-3 font-bold ${i === 2 || i === 4 ? "hidden md:table-cell" : ""}`}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border font-bold">
                      <td className="py-2.5 pr-3 tabular-nums"><Marker on>{sent.at}</Marker></td>
                      <td className="py-2.5 pr-3"><Marker on>{sent.name}</Marker></td>
                      <td className="hidden py-2.5 pr-3 tabular-nums md:table-cell"><Marker on>{sent.phone}</Marker></td>
                      <td className="py-2.5 pr-3"><Marker on>{sent.item}</Marker></td>
                      <td className="hidden py-2.5 pr-3 md:table-cell"><Marker on>네이버</Marker></td>
                      <td className="py-2.5"><span className="rounded-full border-2 px-2.5 py-0.5 text-[13px]" style={{ borderColor: ink }}>통화 전</span></td>
                    </tr>
                    {[
                      ["어제", "박ㅅ연", "010-7731-****", "비데", "메타", "통화함"],
                      ["어제", "이ㅈ민", "010-2290-****", "정수기", "네이버", "계약"],
                    ].map((r) => (
                      <tr key={r[1]} className="border-b border-border text-foreground-secondary">
                        {r.slice(0, 5).map((c, i) => (
                          <td key={i} className={`py-2.5 pr-3 tabular-nums ${i === 2 || i === 4 ? "hidden md:table-cell" : ""}`}>{c}</td>
                        ))}
                        <td className="py-2.5"><span className={r[5] === "계약" ? "rounded-full bg-accent px-2.5 py-0.5 text-[13px] font-bold text-white" : "rounded-full border border-border px-2.5 py-0.5 text-[13px]"}>{r[5]}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          </motion.div>
        )}
      </AnimatePresence>
      <Gutter size="lg" />
      <EndCard
        title="광고 신청 접수 랜딩페이지"
        price={`${manwon(basic.price)}부터 · 작업 ${basic.days}일`}
        items={["접수 즉시 알림", "구글 시트 상담 상태 기록", "광고별 신청·계약 집계", "원본 소스 제공"]}
        sample={{ href: "/demo/landing-water-rental", label: "정수기 렌탈 샘플 보기" }}
        consult={{ href: "/landing#apply", label: "상담 신청" }}
      />
    </>
  );
}

/* ───────── 2. 오래된 회사 홈페이지 ───────── */

function OldSite() {
  return (
    <div className="h-full w-full bg-[#d4d0c8] p-2 font-[Gulim,Dotum,sans-serif] text-[11px] text-black">
      <div className="flex items-center justify-between bg-[#000080] px-2 py-1 text-white">
        <b>곰파트너정밀 홈페이지에 오신 것을 환영합니다</b>
        <span>[HOME]</span>
      </div>
      <div className="mt-2 grid grid-cols-[90px_1fr] gap-2">
        <ul className="grid content-start gap-1 bg-white p-1.5 text-[#0000ee] underline">
          {["회사소개", "인사말", "연혁", "제품소개", "설비현황", "Q&A", "자료실"].map((m) => (
            <li key={m}>▶ {m}</li>
          ))}
        </ul>
        <div className="bg-white p-2">
          <p className="font-bold text-[#cc0000]">★ 공지 ★ 홈페이지 리뉴얼 준비중입니다</p>
          <table className="mt-2 w-full border-collapse border border-gray-500 text-center">
            <tbody>
              {[["MCT", "3대"], ["CNC", "2대"], ["밀링", "1대"]].map(([a, b]) => (
                <tr key={a}>
                  <td className="border border-gray-500 py-1">{a}</td>
                  <td className="border border-gray-500 py-1">{b}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-[10px] text-gray-600">방문자수 : 0012345 · 이 사이트는 IE 1024x768에 최적화되어 있습니다</p>
        </div>
      </div>
    </div>
  );
}

/** 끌어서 비교하는 전후 컷. 손잡이(키보드 화살표도 가능)로 경계를 옮긴다. */
function BeforeAfter() {
  const [x, setX] = useState(50);
  return (
    <div className="relative aspect-[16/10] w-full select-none overflow-hidden">
      <Image src="/images/industry/preview/company.jpg" alt="새로 만든 정밀가공 회사 홈페이지 PC·휴대폰 화면" fill sizes="(min-width: 768px) 640px, 100vw" className="object-cover" />
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - x}% 0 0)` }}>
        <OldSite />
      </div>
      <div aria-hidden className="absolute inset-y-0 w-[3px] bg-[#1d1d1f]" style={{ left: `calc(${x}% - 1.5px)` }}>
        <span className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[3px] bg-[#ffe45c] " style={{ borderColor: ink }}>
          <ChevronsLeftRight size={18} aria-hidden />
        </span>
      </div>
      <span className="absolute left-2 top-2 border-2 bg-white px-2 py-0.5 text-[13px] font-bold" style={{ borderColor: ink }}>전</span>
      <span className="absolute right-2 top-2 border-2 bg-accent px-2 py-0.5 text-[13px] font-bold text-white" style={{ borderColor: ink }}>후</span>
      <input
        type="range"
        min={0}
        max={100}
        value={x}
        onChange={(e) => setX(Number(e.target.value))}
        aria-label="예전 홈페이지와 새 홈페이지 비교"
        className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
      />
    </div>
  );
}

export function CompanyEpisode() {
  const basic = plans[0];
  return (
    <>
      <Panel img="/images/webtoon/factory.jpg" alt="사무실에서 오래된 회사 홈페이지를 보며 한숨 쉬는 정밀가공 회사 대표">
        <Narration className="absolute left-3 top-3">정밀가공 회사 사무실</Narration>
        <Bubble className="absolute bottom-4 left-4" tail="top-right">
          새 거래처가 홈페이지 보고 연락 준다는데… 이걸 보여 줘도 되나.
        </Bubble>
      </Panel>
      <Gutter size="lg" />
      <Panel img="/images/webtoon/bear-hello.jpg" alt="손을 흔드는 곰파트너 곰">
        <Bubble className="absolute right-4 top-4" tail="bottom-left" tone="blue">
          설비랑 가공 범위부터 한눈에 보이게 할게요.
        </Bubble>
      </Panel>
      <Gutter />
      <Panel>
        <BeforeAfter />
      </Panel>
      <Gutter size="lg" />
      <EndCard
        title="회사·가게 홈페이지"
        price={`${manwon(basic.price)}부터 · 작업 ${basic.days}일`}
        items={plans.map((p) => `${p.title} ${manwon(p.price)} · ${p.days}일`)}
        sample={{ href: "/demo/company", label: "정밀가공 회사 샘플 보기" }}
        consult={{ href: chat("회사 홈페이지 상담을 원합니다."), label: "채팅 상담" }}
      />
    </>
  );
}

/* ───────── 3. 갑자기 고장 난 홈페이지 ───────── */

export function MaintenanceEpisode() {
  const reduce = useReducedMotionSafe();
  const monthly = maintenanceServices.find((s) => s.title === "월 유지보수")!;
  const fix = maintenanceServices.find((s) => s.title === "오류 수정")!;
  const lines: [("me" | "gom"), React.ReactNode][] = [
    ["me", <>예약 화면이 하얗게만 나와요. <span className="inline-flex items-center gap-1 text-[13px] opacity-80"><Paperclip size={13} aria-hidden />화면캡처.png</span></>],
    ["gom", "확인했습니다. 원인을 보고 금액과 기간을 먼저 안내드리겠습니다."],
    ["me", "네, 진행해 주세요."],
    ["gom", "수정했습니다. 바뀐 화면 확인 부탁드립니다."],
  ];
  return (
    <>
      <Panel img="/images/webtoon/cafe-broken-6.jpg" alt="손님이 기다리는데 태블릿에 오류 화면이 떠서 당황한 베이커리 사장님">
        <Narration className="absolute left-3 top-3">토요일 오전 10시</Narration>
        <Bubble className="absolute bottom-4 right-4" tail="top-left">
          예약 받는 날인데 화면이 안 열려요!
        </Bubble>
        <Sfx className="right-5 top-4 text-[52px] md:text-[64px]" color="#ff5a4e" rotate={8}>
          덜컥
        </Sfx>
      </Panel>
      <Gutter />
      <Panel bg="#f4f5f6" className="px-4 py-7 md:px-8">
        <ul className="grid gap-2.5">
          {lines.map(([who, text], i) => (
            <motion.li
              key={i}
              initial={reduce ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.9 }}
              transition={{ duration: 0.22, delay: i * 0.45 }}
              className={who === "me" ? "flex justify-end" : "flex items-end gap-2"}
            >
              {who === "gom" && <Image src="/images/logo-bear.png" alt="곰파트너" width={30} height={30} className="h-[30px] w-[30px]" />}
              <span className={who === "me" ? "max-w-[80%] rounded-[16px] rounded-br-[4px] bg-[#ffe45c] px-4 py-2.5 text-[15px] font-bold md:text-[16px]" : "max-w-[80%] rounded-[16px] rounded-bl-[4px] bg-white px-4 py-2.5 text-[15px] md:text-[16px]"}>
                {text}
              </span>
            </motion.li>
          ))}
        </ul>
      </Panel>
      <Gutter size="lg" />
      <EndCard
        title="유지보수"
        price={`${fix.title} ${fix.price}`}
        items={[`${monthly.title} ${monthly.price}`, responseTime.split(". ")[0] + ".", "금액과 기간에 동의하신 뒤 작업을 시작합니다."]}
        consult={{ href: "/maintenance", label: "유지보수 안내" }}
      />
    </>
  );
}

/* ───────── 4. 엑셀로 하는 반복 업무 ───────── */

const messy = [
  { from: "ㄱ상사", cols: "품명 / 수량 / 납기", row: "볼트 M8 / 1,200 / 10.20" },
  { from: "ㄷ산업", cols: "제품코드 | 개수 | 희망일", row: "B-M8 | 800개 | 20일" },
  { from: "ㅎ테크", cols: "ITEM, QTY, DATE", row: "bolt m8, 500, 2026-10-21" },
];

function ExcelPanel() {
  const [done, setDone] = useState(false);
  return (
    <div className="px-4 py-6 md:px-8 md:py-8">
      <div className="flex items-center justify-between gap-3">
        <Narration>{done ? "한 번에 정리" : "거래처 주문 엑셀 3개"}</Narration>
        <button
          type="button"
          onClick={() => setDone((d) => !d)}
          className="h-11 shrink-0 rounded-[6px] border-[3px] bg-accent px-4 text-[15px] font-bold text-white"
          style={{ borderColor: ink }}
          aria-pressed={done}
        >
          {done ? "원래대로" : "정리하기"}
        </button>
      </div>
      <div className="mt-4 text-[14px] tabular-nums md:text-[15px]">
        {done ? (
          <table className="w-full border-collapse border-2 bg-white text-left" style={{ borderColor: ink }}>
            <thead className="bg-[#e8f5e9]">
              <tr>
                {["거래처", "품목", "수량", "납기"].map((h) => (
                  <th key={h} scope="col" className="border border-border px-2 py-1.5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[["ㄱ상사", "1,200", "10.20"], ["ㄷ산업", "800", "10.20"], ["ㅎ테크", "500", "10.21"]].map(([f, q, d]) => (
                <tr key={f}>
                  <td className="border border-border px-2 py-1.5">{f}</td>
                  <td className="border border-border px-2 py-1.5">볼트 M8</td>
                  <td className="border border-border px-2 py-1.5 text-right">{q}</td>
                  <td className="border border-border px-2 py-1.5">{d}</td>
                </tr>
              ))}
              <tr className="font-bold">
                <td className="border border-border px-2 py-1.5" colSpan={2}><Marker on>볼트 M8 합계</Marker></td>
                <td className="border border-border px-2 py-1.5 text-right"><Marker on>2,500</Marker></td>
                <td className="border border-border px-2 py-1.5" />
              </tr>
            </tbody>
          </table>
        ) : (
          <div className="grid gap-2">
            {messy.map((m, i) => (
              <div key={m.from} className="border-2 bg-white px-3 py-2" style={{ borderColor: ink, transform: `rotate(${[-1.2, 0.8, -0.5][i]}deg)` }}>
                <b className="text-[12px] text-foreground-tertiary">{m.from}.xlsx</b>
                <p className="text-foreground-tertiary">{m.cols}</p>
                <p>{m.row}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function ProgramEpisode() {
  return (
    <>
      <Panel img="/images/webtoon/excel.jpg" alt="쌓인 주문서와 엑셀 화면 앞에서 지친 사무직 직원">
        <Narration className="absolute left-3 top-3">월요일 저녁 8시</Narration>
        <Bubble className="absolute bottom-4 left-4" tail="top-right">
          거래처마다 엑셀 양식이 다 달라요…
        </Bubble>
      </Panel>
      <Gutter size="lg" />
      <Panel img="/images/webtoon/bear-work.jpg" alt="노트북으로 빠르게 작업하는 곰파트너 곰">
        <Bubble className="absolute left-4 top-4" tail="bottom-right" tone="blue">
          매주 반복하는 일은 프로그램이 하게 할게요.
        </Bubble>
      </Panel>
      <Gutter />
      <Panel>
        <ExcelPanel />
      </Panel>
      <Gutter size="lg" />
      <EndCard
        title="업무 프로그램"
        price="별도 견적"
        items={["필요한 기능과 화면 수를 듣고 견적을 제공합니다.", "주문·엑셀 취합 자동화", "신청·심사 같은 내부 관리 화면", "온라인 강의(LMS)·결과지 출력"]}
        sample={{ href: "/demo/excel-automation", label: "주문 엑셀 자동화 샘플 보기" }}
        consult={{ href: chat("업무 프로그램 견적 상담을 원합니다."), label: "채팅 상담" }}
      />
    </>
  );
}
