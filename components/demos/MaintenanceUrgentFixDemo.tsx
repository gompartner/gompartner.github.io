"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ImagePlus, MessageCircle, MousePointerClick, PhoneOff, Siren, X } from "lucide-react";
import { maintenanceServices, maintenanceSteps, responseTime } from "@/data/maintenance";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { useDemoToday } from "@/hooks/useDemoToday";
import { Bubble, EndCard, Gutter, Narration, Panel, Sfx, ink } from "@/components/renewal/ui";

/* 급한 오류 수정 샘플. 곰파트너 유지보수의 "오류 수정"을 한 편의 웹툰으로 읽고, 뒤쪽 컷에서 접수부터 보고서까지 직접 눌러 본다.
   꽃집, 주소, 사람은 모두 가상이다. 머리글은 곰파트너와 "유지보수 샘플"만 적는다.

   이야기: 어버이날 전날 광고는 켜져 있는데 예약이 0건 → 휴대폰에서만 예약 버튼이 안 눌림 → 만든 업체는 연락이 안 됨
   → 곰파트너 출동 → 접수, 진행, 전후 비교, 보고서 → 저녁에 울리는 주문 알림.

   금액·응답 시간·절차 문구는 data/maintenance.ts 값을 그대로 쓴다(오류 수정 건당 5만 원부터, 24시간 이내 답장, 동의 전에는 작업하지 않음).
   상호작용(브라우저 안에서만 돈다)
   1. 긴급 수리 접수: 증상 고르기, 주소, 언제부터, 화면 캡처 첨부(실제 파일 미리보기, 서버로 보내지 않음)
   2. 진행 타임라인: maintenanceSteps 다섯 단계. 금액 안내에서 동의해야 다음으로 넘어간다.
   3. 전후 비교: 고치기 전 화면은 예약 버튼을 눌러도 반응이 없고, 고친 뒤 화면은 눌린다.
   4. 수리 보고서: 단계가 끝나면 원인과 고친 내용이 채워진다.

   사진(public/images/demo-maintenance-urgent-fix): panic, relief. AI 생성(Z-Image-Turbo). 곰 그림은 메인 웹툰 것을 다시 쓴다. */

const IMG = "/images/demo-maintenance-urgent-fix";
const fix = maintenanceServices.find((s) => s.id === "fix")!;
const monthly = maintenanceServices.find((s) => s.id === "monthly")!;
const SYMPTOMS = [...fix.unit!.items, "그 밖의 증상"];
const CASE_SYMPTOM = fix.unit!.items[1];
const chat = (msg: string) => `/?chat=1&msg=${encodeURIComponent(msg)}`;
const p2 = (n: number) => String(n).padStart(2, "0");
const press =
  "border-[3px] shadow-[4px_4px_0_#1d1d1f] transition-[transform,box-shadow,background-color] duration-150 ease-out active:translate-x-1 active:translate-y-1 active:shadow-none motion-reduce:transition-none";
const field = "w-full min-w-0 rounded-[6px] border-[2.5px] bg-white px-3 text-[16px] font-normal text-[#1d1d1f] outline-none focus-visible:border-accent";

/* ── 꽃집 휴대폰 화면 ─────────────────────────────── */

function Carnation({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {[0, 60, 120, 180, 240, 300].map((r) => (
        <ellipse key={r} cx="0" cy="-7" rx="6" ry="8" fill="#e8435a" stroke="#1d1d1f" strokeWidth="1.5" transform={`rotate(${r})`} />
      ))}
      <circle r="4" fill="#c22a42" stroke="#1d1d1f" strokeWidth="1.5" />
    </g>
  );
}

/** 휴대폰 속 꽃집 상품 화면. fixed가 아니면 상담 띠가 예약 버튼을 덮어 눌러도 반응이 없다. */
function ShopPhone({ fixed, interactive = false, small = false }: { fixed: boolean; interactive?: boolean; small?: boolean }) {
  const reduce = useReducedMotionSafe();
  const [taps, setTaps] = useState(0);
  const [sheet, setSheet] = useState(false);
  useEffect(() => {
    setTaps(0);
    setSheet(false);
  }, [fixed]);
  const tap = () => {
    if (!interactive) return;
    if (fixed) setSheet(true);
    else setTaps((t) => t + 1);
  };
  return (
    <div className={`relative mx-auto overflow-hidden rounded-[26px] border-[3px] bg-white ${small ? "w-[170px]" : "w-[230px]"}`} style={{ borderColor: ink, boxShadow: `5px 5px 0 ${ink}` }}>
      <div className="flex h-7 items-center justify-center bg-[#f7f2ea]">
        <span className="h-1.5 w-12 rounded-full bg-[#1d1d1f]/70" />
      </div>
      <div className={small ? "px-2.5 pb-3 pt-2" : "px-3 pb-4 pt-2"}>
        <p className={`font-bold ${small ? "text-[11px]" : "text-[13px]"}`}>어버이날 꽃바구니</p>
        <svg viewBox="0 0 200 120" className="mt-1.5 w-full rounded-[10px] bg-[#fdeef0]" aria-hidden>
          <path d="M45 70 Q100 120 155 70 L148 100 Q100 118 52 100 Z" fill="#c9965f" stroke="#1d1d1f" strokeWidth="2" />
          <path d="M60 72 Q100 20 140 72" fill="none" stroke="#1d1d1f" strokeWidth="2.5" />
          <Carnation x={75} y={66} />
          <Carnation x={100} y={58} s={1.15} />
          <Carnation x={125} y={66} />
          <Carnation x={88} y={74} s={0.9} />
          <Carnation x={113} y={74} s={0.9} />
        </svg>
        <p className={`mt-2 font-bold tabular-nums ${small ? "text-[12px]" : "text-[15px]"}`}>카네이션 꽃바구니 39,000원</p>
        <p className={`text-[#5e5850] ${small ? "text-[10px]" : "text-[12px]"}`}>내일 오전 배송 마감 임박</p>
        <div className="relative mt-3">
          <button
            type="button"
            tabIndex={interactive ? 0 : -1}
            aria-hidden={!interactive}
            onClick={tap}
            className={`w-full rounded-[8px] bg-[#e8435a] font-bold text-white ${small ? "h-8 text-[12px]" : "h-11 text-[15px]"}`}
          >
            예약하기
          </button>
          {!fixed && (
            // 휴대폰 폭에서만 버튼 위로 올라온 상담 띠. 눌러도 띠가 받아 버린다.
            <div onClick={tap} className={`absolute inset-x-[-12px] bottom-[-16px] flex items-end justify-center bg-gradient-to-t from-white via-white/80 to-transparent ${small ? "h-10 pb-1" : "h-14 pb-1.5"}`} aria-hidden>
              <span className={`flex items-center gap-1 rounded-full bg-[#fee500] px-3 font-bold text-[#3c1e1e] ${small ? "py-0.5 text-[10px]" : "py-1 text-[12px]"}`}>
                <MessageCircle size={small ? 11 : 13} aria-hidden /> 카톡 상담
              </span>
            </div>
          )}
        </div>
        {fixed && (
          <span className={`absolute flex items-center justify-center rounded-full bg-[#fee500] text-[#3c1e1e] ${small ? "bottom-14 right-2 h-7 w-7" : "bottom-[70px] right-3 h-9 w-9"}`} style={{ boxShadow: "0 2px 6px rgba(0,0,0,.2)" }} aria-hidden>
            <MessageCircle size={small ? 13 : 17} />
          </span>
        )}
        <div className={small ? "h-3" : "h-5"} />
      </div>
      <AnimatePresence>
        {interactive && !fixed && taps > 0 && (
          <motion.p key={taps} initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute inset-x-0 top-[44%] mx-auto w-fit rounded-full border-2 bg-white px-3 py-1 text-[13px] font-bold" style={{ borderColor: ink }} role="status">
            눌러도 그대로 · {taps}번
          </motion.p>
        )}
        {interactive && fixed && sheet && (
          <motion.div initial={reduce ? false : { y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", stiffness: 420, damping: 34 }} className="absolute inset-x-0 bottom-0 rounded-t-[16px] border-t-[3px] bg-white px-3 pb-4 pt-3" style={{ borderColor: ink }} role="status">
            <p className="text-[14px] font-bold">받을 날짜</p>
            <div className="mt-2 grid grid-cols-3 gap-1.5 text-[12px] font-bold">
              {["내일 오전", "내일 오후", "모레"].map((d, i) => (
                <span key={d} className={`rounded-[6px] border-2 py-1.5 text-center ${i === 0 ? "bg-[#e8435a] text-white" : ""}`} style={{ borderColor: ink }}>
                  {d}
                </span>
              ))}
            </div>
            <button type="button" onClick={() => setSheet(false)} className="mt-2 w-full text-[12px] font-bold text-[#5e5850] underline">
              닫기
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── 페이지 ───────────────────────────────────────── */

type Shot = { id: string; name: string; url: string | null };

export function MaintenanceUrgentFixDemo() {
  const today = useDemoToday();
  const reduce = useReducedMotionSafe();
  const ticketNo = `R-${p2(today.getMonth() + 1)}${p2(today.getDate())}-03`;

  useEffect(() => {
    const f = () => window.scrollTo({ top: 0 });
    window.addEventListener("demo:go-home", f);
    return () => window.removeEventListener("demo:go-home", f);
  }, []);

  /* 접수 */
  const [symptom, setSymptom] = useState(CASE_SYMPTOM);
  const [url, setUrl] = useState("https://example.co.kr");
  const [since, setSince] = useState("오늘 아침");
  const [memo, setMemo] = useState("휴대폰에서 예약하기 버튼을 눌러도 아무 반응이 없어요. PC에서는 눌려요.");
  const [phone, setPhone] = useState("010-1234-5678");
  const [shots, setShots] = useState<Shot[]>([]);
  const [err, setErr] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const shotsRef = useRef<Shot[]>([]);
  shotsRef.current = shots;
  useEffect(() => () => shotsRef.current.forEach((s) => s.url && URL.revokeObjectURL(s.url)), []);

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const next = [...files]
      .filter((f) => f.type.startsWith("image/"))
      .slice(0, 3 - shots.length)
      .map((f, i) => ({ id: `${Date.now()}-${i}`, name: f.name, url: URL.createObjectURL(f) }));
    setShots((v) => [...v, ...next]);
  };
  const removeShot = (id: string) =>
    setShots((v) => {
      const s = v.find((x) => x.id === id);
      if (s?.url) URL.revokeObjectURL(s.url);
      return v.filter((x) => x.id !== id);
    });

  /* 진행: 0 접수 전, 1 요청 완료, 2 금액 안내, 3 동의, 4 작업·반영, 5 기록 */
  const [stage, setStage] = useState(0);
  const [view, setView] = useState<"before" | "after">("before");
  const timelineRef = useRef<HTMLElement>(null);
  const compareRef = useRef<HTMLElement>(null);
  const reportRef = useRef<HTMLElement>(null);
  const go = (el: HTMLElement | null) => el?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^https?:\/\/\S+\.\S+/.test(url.trim())) return setErr("홈페이지 주소를 확인해 주세요.");
    if (phone.replace(/\D/g, "").length < 10) return setErr("연락처를 확인해 주세요.");
    setErr("");
    setStage(1);
    setTimeout(() => go(timelineRef.current), 50);
  };
  const advance = (to: number) => {
    setStage(to);
    if (to === 4) setView("after");
  };
  const reset = () => {
    setStage(0);
    setView("before");
  };

  const done = stage >= 5;
  const isCase = symptom === CASE_SYMPTOM;

  return (
    <div className="wt min-h-screen overflow-x-clip pb-24 text-[#1d1d1f]">
      <div className="md:px-4 md:py-8">
        <div className="mx-auto max-w-[720px] bg-[#fffdf8] pb-16 shadow-[0_0_0_3px_#1d1d1f]">
          <header className="flex h-16 items-center justify-between gap-3 border-b-[3px] px-4 md:px-8" style={{ borderColor: ink }}>
            <span className="inline-flex min-w-0 items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/logo.svg" alt="" aria-hidden width={30} height={30} className="h-[30px] w-[30px] shrink-0" />
              <span className="inline-flex items-baseline gap-1.5 whitespace-nowrap">
                <span className="text-[21px] font-extrabold tracking-[-0.03em]">곰파트너</span>
                <span className="text-[13px] font-semibold text-[#5e5850]">유지보수 샘플</span>
              </span>
            </span>
            <a href="#uf-intake" className={`${press} inline-flex h-10 shrink-0 items-center gap-1.5 rounded-[6px] bg-[#ff5a4e] px-3.5 text-[15px] font-bold text-white`} style={{ borderColor: ink }}>
              <Siren size={16} aria-hidden /> 접수
            </a>
          </header>

          <main className="px-4 pt-4 md:px-8 md:pt-6">
            {/* 1. 어버이날 전날 */}
            <Panel img={`${IMG}/panic.jpg`} alt="카네이션 꽃바구니로 가득 찬 가게에서 휴대폰을 보고 놀란 꽃집 사장님" className="shadow-[5px_5px_0_#1d1d1f]">
              <Narration className="absolute left-3 top-3">어버이날 전날 오전 9시</Narration>
              <Bubble className="absolute bottom-16 left-3 max-w-[52%] text-[15px] md:bottom-24 md:text-[18px]" tail="top-right" delay={0.3}>
                광고는 켜져 있는데 예약이 0건?
              </Bubble>
              <Sfx className="right-5 top-16 text-[52px] md:text-[64px]" color="#ff5a4e" rotate={8}>
                헉
              </Sfx>
            </Panel>
            <h1 className="relative z-10 -mt-8 text-center font-[family-name:var(--font-sfx)] text-[38px] leading-[1.12] text-white min-[400px]:text-[44px] md:-mt-12 md:text-[60px]" style={{ WebkitTextStroke: `8px ${ink}`, paintOrder: "stroke fill" }}>
              급한 오류
              <br />
              <span className="text-[#ff5a4e]">수리 접수</span>
            </h1>
            <p className="mt-4 text-center text-[17px] font-bold md:text-[19px]">
              {fix.title} {fix.price} · {responseTime.split(". ")[0]}.
            </p>

            <Gutter />
            {/* 2. 휴대폰에서만 */}
            <Panel bg="#20252b" className="px-4 py-7 md:px-10 md:py-9">
              <div className="grid items-center gap-5 sm:grid-cols-[auto_1fr]">
                <ShopPhone fixed={false} small />
                <div className="grid gap-3">
                  <div className="rounded-[10px] bg-white p-3 text-[14px] tabular-nums">
                    <p className="text-[12px] font-bold text-[#5e5850]">검색 광고 · 오늘</p>
                    <dl className="mt-1 grid grid-cols-3 gap-2 text-center">
                      {[
                        ["클릭", "312"],
                        ["광고비", "9.4만"],
                        ["예약", "0"],
                      ].map(([k, v]) => (
                        <div key={k}>
                          <dt className="text-[12px] text-[#5e5850]">{k}</dt>
                          <dd className={`text-[20px] font-bold ${k === "예약" ? "text-[#b42318]" : ""}`}>{v}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                  <Bubble tail="bottom-left" className="text-[16px] md:text-[17px]">
                    PC에선 되는데… 휴대폰에서만 안 눌려요.
                  </Bubble>
                </div>
              </div>
              <Sfx className="right-5 top-4 text-[36px] md:text-[48px]" color="#ffffff" rotate={10} delay={0.4}>
                톡톡톡
              </Sfx>
            </Panel>

            <Gutter />
            {/* 3. 연락이 안 되는 업체 */}
            <Panel bg="#f4f5f6" className="px-4 pb-8 pt-14 md:px-8">
              <Narration className="absolute left-3 top-3">만든 업체에 연락</Narration>
              <div className="mx-auto grid max-w-[380px] gap-2.5">
                <div className="flex items-center gap-3 rounded-[14px] bg-[#2b2f36] px-4 py-3 text-white">
                  <PhoneOff size={20} aria-hidden className="shrink-0 text-[#ff8a80]" />
                  <span className="min-w-0 flex-1">
                    <b className="block">홈페이지 만든 곳</b>
                    <span className="text-[13px] text-white/75">연결이 되지 않아 삐 소리 후…</span>
                  </span>
                  <span className="text-[13px] tabular-nums text-white/75">09:12</span>
                </div>
                {[
                  ["09:20", "예약 버튼이 안 눌려요. 급해요."],
                  ["09:41", "확인 부탁드립니다!!"],
                ].map(([t, m]) => (
                  <div key={t} className="flex items-end justify-end gap-1.5">
                    <span className="text-[12px] font-bold text-[#c9a400]">1</span>
                    <span className="text-[11px] tabular-nums text-[#5e5850]">{t}</span>
                    <span className="max-w-[75%] rounded-[14px] rounded-tr-[4px] bg-[#fee500] px-3 py-2 text-[15px]">{m}</span>
                  </div>
                ))}
              </div>
              <Sfx className="bottom-3 left-5 text-[40px] md:text-[48px]" color="#9aa3ad" rotate={-6} delay={0.5}>
                뚜우
              </Sfx>
            </Panel>
            <Gutter size="sm" />
            <Narration className="mx-auto">읽음 표시는 끝내 사라지지 않았다</Narration>

            <Gutter size="lg" />
            {/* 4. 출동 */}
            <Panel img="/images/webtoon/bear-work.jpg" alt="노트북으로 빠르게 작업하는 곰파트너 곰">
              <Narration className="absolute left-3 top-3">곰파트너 접수함</Narration>
              <Bubble className="absolute right-4 top-14" tail="bottom-left" tone="blue">
                주소랑 캡처부터 보낼게요. 원인 찾고 금액 먼저 말씀드려요.
              </Bubble>
              <Sfx className="bottom-6 left-5 text-[56px] md:text-[72px]" color="#ff5a4e" rotate={-8}>
                출동
              </Sfx>
            </Panel>

            <Gutter />
            {/* 5. 긴급 수리 접수 */}
            <section id="uf-intake" aria-labelledby="uf-intake-title" className="scroll-mt-4">
              <Narration className="mb-3">사장님이 직접 써 보는 접수</Narration>
              <form onSubmit={submit} noValidate className="border-[3px] bg-white p-4 sm:p-5 md:p-7" style={{ borderColor: ink, boxShadow: `6px 6px 0 ${ink}` }}>
                <h2 id="uf-intake-title" className="font-[family-name:var(--font-sfx)] text-[26px] font-normal leading-[1.2] md:text-[30px]">
                  긴급 수리 접수
                </h2>
                <fieldset className="mt-4">
                  <legend className="text-[14px] font-bold text-[#45413b]">어떤 증상인가요</legend>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {SYMPTOMS.map((s) => (
                      <label key={s} className="min-w-0 cursor-pointer">
                        <input type="radio" name="uf-symptom" checked={symptom === s} onChange={() => setSymptom(s)} className="peer sr-only" />
                        <span className="flex min-h-12 items-center gap-2 rounded-[8px] border-[2.5px] bg-white px-3 py-2 text-[15px] font-bold leading-[1.35] peer-checked:bg-[#fff3b0] peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent" style={{ borderColor: symptom === s ? ink : "#cfc8bb" }}>
                          <span aria-hidden className="grid h-5 w-5 shrink-0 place-items-center rounded-full border-2" style={{ borderColor: ink }}>
                            {symptom === s && <span className="h-2.5 w-2.5 rounded-full bg-[#1d1d1f]" />}
                          </span>
                          {s}
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <label className="grid min-w-0 gap-1 text-[14px] font-bold text-[#45413b]">
                    홈페이지 주소
                    <input value={url} onChange={(e) => setUrl(e.target.value)} inputMode="url" className={`${field} h-12`} style={{ borderColor: ink }} />
                  </label>
                  <label className="grid min-w-0 gap-1 text-[14px] font-bold text-[#45413b]">
                    연락처
                    <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" maxLength={13} className={`${field} h-12`} style={{ borderColor: ink }} />
                  </label>
                </div>
                <fieldset className="mt-4">
                  <legend className="text-[14px] font-bold text-[#45413b]">언제부터</legend>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {["오늘 아침", "어제부터", "며칠 됐어요"].map((v) => (
                      <button key={v} type="button" onClick={() => setSince(v)} aria-pressed={since === v} className={`h-11 min-w-0 rounded-[6px] border-[2.5px] px-1 text-[14px] font-bold ${since === v ? "bg-[#1d1d1f] text-white" : "bg-white"}`} style={{ borderColor: ink }}>
                        {v}
                      </button>
                    ))}
                  </div>
                </fieldset>
                <label className="mt-4 grid min-w-0 gap-1 text-[14px] font-bold text-[#45413b]">
                  어떻게 안 되나요
                  <textarea value={memo} onChange={(e) => setMemo(e.target.value)} rows={3} className={`${field} py-2.5 leading-[1.5]`} style={{ borderColor: ink }} />
                </label>
                <div className="mt-4">
                  <p className="text-[14px] font-bold text-[#45413b]">화면 캡처 {shots.length}/3</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {shots.map((s) => (
                      <figure key={s.id} className="relative h-24 w-[72px] overflow-hidden rounded-[8px] border-[2.5px] bg-[#f3ece0]" style={{ borderColor: ink }}>
                        {s.url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={s.url} alt={s.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center scale-[0.42]">
                            <div className="shrink-0">
                              <ShopPhone fixed={false} small />
                            </div>
                          </div>
                        )}
                        <button type="button" onClick={() => removeShot(s.id)} aria-label={`${s.name} 빼기`} className="absolute right-0.5 top-0.5 grid h-6 w-6 place-items-center rounded-full border-2 bg-white" style={{ borderColor: ink }}>
                          <X size={13} aria-hidden />
                        </button>
                      </figure>
                    ))}
                    {shots.length < 3 && (
                      <>
                        <button type="button" onClick={() => fileRef.current?.click()} className="flex h-24 w-[88px] flex-col items-center justify-center gap-1 rounded-[8px] border-[2.5px] border-dashed bg-white text-[13px] font-bold" style={{ borderColor: ink }}>
                          <ImagePlus size={22} aria-hidden />
                          캡처 올리기
                        </button>
                        <button type="button" onClick={() => setShots((v) => [...v, { id: `ex-${Date.now()}`, name: "예시 캡처.png", url: null }])} className="flex h-24 w-[88px] flex-col items-center justify-center gap-1 rounded-[8px] border-[2.5px] bg-[#f3ece0] text-[13px] font-bold" style={{ borderColor: ink }}>
                          <MousePointerClick size={22} aria-hidden />
                          예시 캡처
                        </button>
                      </>
                    )}
                    <input ref={fileRef} type="file" accept="image/*" multiple className="sr-only" tabIndex={-1} aria-label="화면 캡처 파일" onChange={(e) => {
                      addFiles(e.target.files);
                      e.target.value = "";
                    }} />
                  </div>
                </div>
                {err && (
                  <p role="alert" className="mt-3 text-[14px] font-bold text-[#b42318]">
                    {err}
                  </p>
                )}
                <button type="submit" disabled={stage > 0} className={`${press} mt-5 h-13 w-full rounded-[6px] bg-[#ff5a4e] py-3.5 text-[17px] font-bold text-white disabled:opacity-50`} style={{ borderColor: ink }}>
                  {stage > 0 ? `접수됨 · ${ticketNo}` : "수리 접수"}
                </button>
                <p className="mt-2 text-[14px] text-[#45413b]">{responseTime}</p>
              </form>
            </section>

            <Gutter />
            {/* 6. 진행 타임라인 */}
            <section id="uf-timeline" ref={timelineRef} aria-labelledby="uf-timeline-title" className="scroll-mt-4">
              <Narration className="mb-3">어디까지 됐는지 전화 안 해도 보인다</Narration>
              <div className="border-[3px] bg-white p-4 sm:p-5 md:p-7" style={{ borderColor: ink, boxShadow: `6px 6px 0 ${ink}` }}>
                <div className="flex items-center justify-between gap-2">
                  <h2 id="uf-timeline-title" className="font-[family-name:var(--font-sfx)] text-[26px] font-normal leading-[1.2] md:text-[30px]">
                    진행 상황
                  </h2>
                  <span className="font-mono text-[14px] font-bold text-[#5e5850]">{stage > 0 ? ticketNo : "접수 전"}</span>
                </div>
                <ol className="mt-4 grid gap-0">
                  {maintenanceSteps.map((s, i) => {
                    // 4단계(작업·반영)는 고친 화면을 보내고(stage 3) 확인받을 때까지(stage 4) 이어진다
                    const at = stage === 4 ? 3 : stage;
                    const state = i < at ? "done" : i === at ? "now" : "next";
                    const isNow = stage > 0 && state === "now";
                    return (
                      <li key={s.title} className="relative grid grid-cols-[32px_1fr] gap-3 pb-5 last:pb-0">
                        {i < maintenanceSteps.length - 1 && <span aria-hidden className="absolute bottom-0 left-[15px] top-8 w-[3px]" style={{ background: state === "done" ? ink : "#d8d0c2" }} />}
                        <span className={`relative z-10 grid h-8 w-8 place-items-center rounded-full border-[3px] text-[14px] font-bold ${state === "done" ? "bg-[#1d1d1f] text-white" : isNow ? "bg-[#ffe45c]" : "bg-white text-[#8a8378]"}`} style={{ borderColor: state === "next" && !isNow ? "#cfc8bb" : ink }}>
                          {state === "done" ? <Check size={16} strokeWidth={3} aria-hidden /> : i + 1}
                          {isNow && !reduce && <motion.span aria-hidden className="absolute inset-[-6px] rounded-full border-[3px] border-[#ffe45c]" animate={{ scale: [1, 1.25, 1], opacity: [0.9, 0, 0.9] }} transition={{ duration: 1.6, repeat: Infinity }} />}
                        </span>
                        <div className="min-w-0 pt-0.5">
                          <p className={`text-[17px] font-bold ${state === "next" && !isNow ? "text-[#8a8378]" : ""}`}>
                            {s.title}
                            <span className="sr-only">{state === "done" ? " 완료" : isNow ? " 진행 중" : ""}</span>
                          </p>
                          <p className="text-[14px] leading-[1.55] text-[#45413b]">{s.body}</p>
                          {isNow && <StageAction stage={stage} isCase={isCase} onNext={advance} onCompare={() => go(compareRef.current)} reduce={reduce} />}
                        </div>
                      </li>
                    );
                  })}
                </ol>
                {stage === 0 && (
                  <a href="#uf-intake" className="mt-4 inline-flex h-11 items-center rounded-[6px] border-[2.5px] bg-white px-4 text-[15px] font-bold" style={{ borderColor: ink }}>
                    접수부터 하기
                  </a>
                )}
                {done && (
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <button type="button" onClick={() => go(reportRef.current)} className={`${press} h-10 rounded-[6px] bg-accent px-3 text-[14px] font-bold text-white`} style={{ borderColor: ink }}>
                      보고서 보기
                    </button>
                    <button type="button" onClick={reset} className="h-10 rounded-[6px] border-[2.5px] bg-white px-3 text-[14px] font-bold" style={{ borderColor: ink }}>
                      처음부터
                    </button>
                  </div>
                )}
              </div>
            </section>

            <Gutter />
            {/* 7. 전후 비교 */}
            <section id="uf-compare" ref={compareRef} aria-labelledby="uf-compare-title" className="scroll-mt-4">
              <Narration className="mb-3">예약하기를 직접 눌러 보세요</Narration>
              <div className="border-[3px] bg-[#fdeef0] p-4 sm:p-5 md:p-7" style={{ borderColor: ink, boxShadow: `6px 6px 0 ${ink}` }}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 id="uf-compare-title" className="font-[family-name:var(--font-sfx)] text-[26px] font-normal leading-[1.2] md:text-[30px]">
                    고치기 전과 뒤
                  </h2>
                  <div className="grid grid-cols-2 rounded-[8px] border-[2.5px] bg-white p-0.5" style={{ borderColor: ink }} role="group" aria-label="화면 고르기">
                    {(
                      [
                        ["before", "고치기 전"],
                        ["after", "고친 뒤"],
                      ] as const
                    ).map(([v, t]) => (
                      <button key={v} type="button" onClick={() => setView(v)} aria-pressed={view === v} className={`h-10 rounded-[6px] px-3 text-[15px] font-bold ${view === v ? (v === "before" ? "bg-[#ff5a4e] text-white" : "bg-accent text-white") : ""}`}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mt-6 grid items-center gap-6 sm:grid-cols-[auto_1fr]">
                  <ShopPhone fixed={view === "after"} interactive />
                  <div className="text-[15px] leading-[1.6]">
                    {view === "before" ? (
                      <>
                        <p className="font-bold">휴대폰 폭에서 상담 띠가 버튼 위로 올라와 있어요.</p>
                        <p className="mt-1 text-[#45413b]">손가락은 띠를 누르고, 예약하기까지 닿지 않아요. PC는 화면이 넓어 겹치지 않았어요.</p>
                      </>
                    ) : (
                      <>
                        <p className="font-bold">상담 띠를 오른쪽 동그란 버튼으로 줄였어요.</p>
                        <p className="mt-1 text-[#45413b]">예약하기를 누르면 받을 날짜가 올라와요. 아이폰, 갤럭시, PC에서 다시 눌러 봤어요.</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </section>

            <Gutter />
            {/* 8. 수리 보고서 */}
            <section id="uf-report" ref={reportRef} aria-labelledby="uf-report-title" className="scroll-mt-4">
              <Narration className="mb-3">무엇을 고쳤는지 남는다</Narration>
              <article className="relative border-[3px] bg-white p-4 sm:p-6 md:p-8" style={{ borderColor: ink, boxShadow: `6px 6px 0 ${ink}` }}>
                <div className="flex items-start justify-between gap-3 border-b-[3px] pb-3" style={{ borderColor: ink }}>
                  <div>
                    <h2 id="uf-report-title" className="text-[22px] font-bold md:text-[24px]">
                      수리 보고서
                    </h2>
                    <p className="font-mono text-[14px] text-[#5e5850]">{ticketNo}</p>
                  </div>
                  <span className={`shrink-0 rotate-[-6deg] rounded-[6px] border-[3px] px-2.5 py-1 text-[15px] font-bold ${done ? "border-accent text-accent" : "border-[#8a8378] text-[#8a8378]"}`}>{done ? "확인 완료" : "작성 중"}</span>
                </div>
                <dl className="mt-3 grid gap-x-4 text-[15px] sm:grid-cols-[110px_1fr]">
                  {(
                    [
                      ["주소", url],
                      ["증상", `${symptom}. ${since}.`],
                      ["원인", stage >= 2 ? (isCase ? "휴대폰 폭에서 카톡 상담 띠가 예약하기 버튼을 덮고 있었습니다. 띠의 투명한 윗부분이 손가락 터치를 먼저 받았습니다." : "원인을 확인해 적습니다.") : "확인 중"],
                      ["고친 내용", stage >= 4 ? (isCase ? "상담 띠를 화면 오른쪽 동그란 버튼으로 바꾸고, 예약하기 버튼 아래에 여백을 두었습니다." : "고친 내용을 적습니다.") : "확인 중"],
                      ["확인한 화면", stage >= 4 ? "아이폰 사파리, 갤럭시 삼성 인터넷, PC 크롬" : "확인 중"],
                      ["금액", stage >= 3 ? `${fix.title} 1건 5만 원(동의함)` : stage >= 2 ? `${fix.title} 1건 5만 원(동의 전)` : fix.price],
                      ["다음에 볼 것", stage >= 4 ? "상담 버튼 설정을 바꾸면 다시 겹칠 수 있습니다. 바꾸실 때 알려 주세요." : "확인 중"],
                    ] as const
                  ).map(([k, v]) => (
                    <div key={k} className="contents">
                      <dt className="pt-2.5 text-[14px] font-bold text-[#5e5850] sm:border-b sm:border-[#e6e0d4] sm:pb-2.5">{k}</dt>
                      <dd className={`border-b border-[#e6e0d4] pb-2.5 leading-[1.55] sm:pt-2.5 ${v === "확인 중" ? "text-[#8a8378]" : ""}`}>{v}</dd>
                    </div>
                  ))}
                </dl>
                {done && (
                  <Sfx className="-bottom-5 right-4 text-[44px]" color="#256ef4" rotate={-8} delay={0.1}>
                    끝
                  </Sfx>
                )}
              </article>
            </section>

            <Gutter size="lg" />
            {/* 9. 그날 저녁 */}
            <Panel img={`${IMG}/relief.jpg`} alt="꽃집에서 알림이 울리는 휴대폰을 보며 웃는 사장님">
              <Narration className="absolute left-3 top-3">고친 날 저녁</Narration>
              <Bubble className="absolute bottom-4 left-4" tail="top-right">
                이제야 예약 알림이 울려요.
              </Bubble>
              <Sfx className="right-5 top-14 text-[52px] md:text-[64px]" color="#ffd43b" rotate={8}>
                띠링
              </Sfx>
            </Panel>

            <Gutter size="lg" />
            <EndCard
              title="유지보수"
              price={`${fix.title} ${fix.price}`}
              items={[`${monthly.title} ${monthly.price}`, responseTime.split(". ")[0] + ".", maintenanceSteps[2].body, ...fix.notes.slice(1)]}
              sample={{ href: "/maintenance", label: "유지보수 안내" }}
              consult={{ href: chat("급한 오류 수정 샘플을 보고 문의합니다."), label: "채팅 상담" }}
            />
          </main>

          <footer className="mt-16 border-t-[3px] px-4 pt-6 text-[14px] leading-[1.8] text-[#5e5850] md:px-8" style={{ borderColor: ink }}>
            <p className="text-[16px] font-bold text-[#1d1d1f]">곰파트너</p>
            <p>오류 수정 샘플 · 꽃집, 주소, 연락처는 모두 가상입니다.</p>
          </footer>
        </div>
      </div>
    </div>
  );
}

/** 지금 단계에서 곰이 하는 말과 누를 버튼 */
function StageAction({ stage, isCase, onNext, onCompare, reduce }: { stage: number; isCase: boolean; onNext: (to: number) => void; onCompare: () => void; reduce: boolean }) {
  const lines: Record<number, string> = {
    1: "주소랑 캡처 받았어요. 원인부터 볼게요.",
    2: isCase ? "휴대폰에서 카톡 상담 띠가 예약 버튼을 덮고 있어요. 오류 수정 1건, 5만 원. 작업은 하루면 됩니다." : "원인을 찾았어요. 오류 수정 1건, 5만 원. 작업은 하루면 됩니다.",
    3: "동의 받았어요. 고치는 중이에요.",
    4: "고쳤어요. 휴대폰에서 예약하기를 눌러 봐 주세요.",
  };
  return (
    <motion.div initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-3 grid gap-2.5">
      <div className="flex items-end gap-2">
        <Image src="/images/webtoon/bear-face.jpg" alt="곰파트너" width={32} height={32} className="h-8 w-8 shrink-0 rounded-full border-2 border-[#1d1d1f]" />
        <p className="max-w-[90%] rounded-[16px] rounded-bl-[4px] bg-accent px-3.5 py-2.5 text-[15px] font-bold text-white">{lines[stage]}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {stage === 1 && (
          <button type="button" onClick={() => onNext(2)} className={`${press} h-11 rounded-[6px] bg-white px-4 text-[15px] font-bold`} style={{ borderColor: ink }}>
            원인 확인 결과 받기
          </button>
        )}
        {stage === 2 && (
          <>
            <button type="button" onClick={() => onNext(3)} className={`${press} h-11 rounded-[6px] bg-accent px-4 text-[15px] font-bold text-white`} style={{ borderColor: ink }}>
              5만 원에 동의
            </button>
            <a href={chat("오류 수정 금액이 궁금합니다.")} className="inline-flex h-11 items-center rounded-[6px] border-[2.5px] bg-white px-4 text-[15px] font-bold" style={{ borderColor: ink }}>
              더 물어보기
            </a>
          </>
        )}
        {stage === 3 && (
          <button type="button" onClick={() => onNext(4)} className={`${press} h-11 rounded-[6px] bg-white px-4 text-[15px] font-bold`} style={{ borderColor: ink }}>
            고친 화면 받기
          </button>
        )}
        {stage === 4 && (
          <>
            <button type="button" onClick={onCompare} className="h-11 rounded-[6px] border-[2.5px] bg-white px-4 text-[15px] font-bold" style={{ borderColor: ink }}>
              고친 화면 눌러 보기
            </button>
            <button type="button" onClick={() => onNext(5)} className={`${press} h-11 rounded-[6px] bg-accent px-4 text-[15px] font-bold text-white`} style={{ borderColor: ink }}>
              확인했어요
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
}
