"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Gift, PartyPopper, Ticket, Zap } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useMounted } from "@/hooks/useMounted";

const STORAGE_KEY = "gs-demo:landing:v1";
const EVENT_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

interface Registration {
  name: string;
  phone: string;
  ticket: string;
  at: number;
}

interface LandingState {
  startedAt: number | null;
  registration: Registration | null;
}

const benefits = [
  { icon: Gift, title: "오픈 기념 30% 할인", desc: "사전등록 고객 전원에게 첫 구매 할인 쿠폰을 드립니다." },
  { icon: Zap, title: "우선 입장권", desc: "오픈 당일 대기 없이 바로 입장할 수 있어요." },
  { icon: PartyPopper, title: "경품 추첨", desc: "응모번호 추첨으로 시그니처 굿즈 세트를 드립니다." },
];

const faqs = [
  { q: "사전등록은 무료인가요?", a: "네, 이름과 연락처만 남기면 무료로 참여할 수 있습니다. 결제 정보는 받지 않아요." },
  { q: "응모번호는 어디서 확인하나요?", a: "등록 즉시 이 페이지에 응모권이 발급되고, 다시 방문해도 그대로 유지됩니다." },
  { q: "등록을 취소할 수 있나요?", a: "응모권 카드의 '등록 취소' 버튼으로 언제든 취소할 수 있습니다." },
  { q: "당첨 발표는 언제인가요?", a: "카운트다운 종료 후 등록된 연락처로 개별 안내드립니다." },
];

function formatUnit(value: number) {
  return String(Math.max(0, value)).padStart(2, "0");
}

export function LandingDemo() {
  const mounted = useMounted();
  const [state, setState, hydrated] = useLocalStorage<LandingState>(STORAGE_KEY, {
    startedAt: null,
    registration: null,
  });
  const [now, setNow] = useState<number | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [form, setForm] = useState({ name: "", phone: "" });
  const [error, setError] = useState<string | null>(null);

  // 첫 방문 시각을 저장해 방문자별로 결정적인 카운트다운을 만든다
  useEffect(() => {
    if (hydrated && state.startedAt === null) {
      setState((prev) => ({ ...prev, startedAt: Date.now() }));
    }
  }, [hydrated, state.startedAt, setState]);

  useEffect(() => {
    if (!mounted) return;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [mounted]);

  const deadline = state.startedAt !== null ? state.startedAt + EVENT_DURATION_MS : null;
  const remaining = deadline !== null && now !== null ? Math.max(0, deadline - now) : null;
  const countdown =
    remaining !== null
      ? {
          days: formatUnit(Math.floor(remaining / 86_400_000)),
          hours: formatUnit(Math.floor(remaining / 3_600_000) % 24),
          minutes: formatUnit(Math.floor(remaining / 60_000) % 60),
          seconds: formatUnit(Math.floor(remaining / 1_000) % 60),
        }
      : { days: "--", hours: "--", minutes: "--", seconds: "--" };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = form.name.trim();
    const phone = form.phone.trim();
    if (name.length < 2) {
      setError("이름을 2자 이상 입력해주세요.");
      return;
    }
    if (!/^01[016789]-?\d{3,4}-?\d{4}$/.test(phone)) {
      setError("휴대폰 번호 형식을 확인해주세요. (예: 010-1234-5678)");
      return;
    }
    const ticket = `GS-${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`;
    setState((prev) => ({
      ...prev,
      registration: { name, phone, ticket, at: Date.now() },
    }));
    setError(null);
    setForm({ name: "", phone: "" });
  };

  const cancelRegistration = () => {
    setState((prev) => ({ ...prev, registration: null }));
  };

  return (
    <div className="min-h-screen bg-zinc-950 font-sans text-zinc-100">
      {/* 히어로 */}
      <header className="relative overflow-hidden px-5 pb-20 pt-24 text-center">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(163,230,53,0.15),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(217,70,239,0.12),transparent_55%)]"
        />
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative mx-auto max-w-3xl"
        >
          <span className="inline-block rounded-full border border-lime-400/40 bg-lime-400/10 px-4 py-1.5 text-sm font-semibold text-lime-300">
            GRAND OPEN · 사전등록 이벤트
          </span>
          <h1 className="mt-7 text-5xl font-black leading-[1.05] tracking-tight sm:text-7xl">
            먼저 등록한
            <br />
            사람이 <span className="text-lime-400">먼저</span> 누립니다
          </h1>
          <p className="mx-auto mt-6 max-w-md text-lg text-zinc-400">
            오픈 전 사전등록하고 할인 쿠폰과 경품 응모권을 받아가세요.
          </p>

          {/* 카운트다운 */}
          <div className="mt-12 grid grid-cols-4 gap-2 sm:gap-4" role="timer" aria-label="이벤트 마감 카운트다운">
            {(
              [
                ["DAYS", countdown.days],
                ["HOURS", countdown.hours],
                ["MIN", countdown.minutes],
                ["SEC", countdown.seconds],
              ] as const
            ).map(([label, value]) => (
              <div
                key={label}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/80 py-5 backdrop-blur"
              >
                <div className="font-mono text-3xl font-bold text-lime-400 sm:text-5xl">{value}</div>
                <div className="mt-1.5 text-[0.65rem] font-semibold tracking-[0.25em] text-zinc-500">
                  {label}
                </div>
              </div>
            ))}
          </div>
          <a
            href="#register"
            className="mt-10 inline-block rounded-full bg-lime-400 px-9 py-4 text-lg font-bold text-zinc-950 transition-transform hover:scale-105"
          >
            {state.registration ? "내 응모권 확인" : "지금 사전등록"}
          </a>
        </motion.div>
      </header>

      {/* 혜택 */}
      <section className="mx-auto max-w-4xl px-5 py-16">
        <h2 className="text-center text-3xl font-extrabold tracking-tight">
          사전등록 <span className="text-fuchsia-400">3가지 혜택</span>
        </h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {benefits.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
              <Icon className="text-fuchsia-400" size={26} aria-hidden />
              <h3 className="mt-4 font-bold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 등록 폼 / 응모권 */}
      <section id="register" className="scroll-mt-10 px-5 py-16">
        <div className="mx-auto max-w-md">
          {state.registration ? (
            <div className="overflow-hidden rounded-3xl border border-lime-400/40 bg-gradient-to-b from-zinc-900 to-zinc-950 text-center shadow-[0_0_60px_rgba(163,230,53,0.15)]">
              <div className="border-b border-dashed border-zinc-700 p-8">
                <Ticket className="mx-auto text-lime-400" size={32} aria-hidden />
                <p className="mt-4 text-sm font-semibold tracking-widest text-zinc-500">
                  응모번호
                </p>
                <p className="mt-2 font-mono text-5xl font-black tracking-tight text-lime-400">
                  {state.registration.ticket}
                </p>
              </div>
              <div className="p-6">
                <p className="font-bold">{state.registration.name}님, 등록 완료!</p>
                <p className="mt-1 text-sm text-zinc-400">
                  {state.registration.phone} · 당첨 시 문자로 안내드려요
                </p>
                <p className="mt-1 text-xs text-zinc-600">
                  이 응모권은 브라우저에 저장되어 다시 방문해도 유지됩니다.
                </p>
                <button
                  type="button"
                  onClick={cancelRegistration}
                  className="mt-5 rounded-full border border-zinc-700 px-5 py-2 text-sm text-zinc-400 transition-colors hover:border-zinc-500 hover:text-zinc-200"
                >
                  등록 취소
                </button>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-7"
            >
              <h2 className="text-2xl font-extrabold tracking-tight">사전등록</h2>
              <p className="mt-1.5 text-sm text-zinc-400">30초면 끝나요. 등록 즉시 응모번호 발급!</p>
              <label className="mt-6 block text-sm font-semibold" htmlFor="landing-name">
                이름
              </label>
              <input
                id="landing-name"
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="홍길동"
                className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-zinc-100 placeholder-zinc-600 outline-none transition-colors focus:border-lime-400"
              />
              <label className="mt-4 block text-sm font-semibold" htmlFor="landing-phone">
                휴대폰 번호
              </label>
              <input
                id="landing-phone"
                type="tel"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="010-1234-5678"
                className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-zinc-100 placeholder-zinc-600 outline-none transition-colors focus:border-lime-400"
              />
              {error && (
                <p className="mt-3 text-sm font-medium text-fuchsia-400" role="alert">
                  {error}
                </p>
              )}
              <button
                type="submit"
                className="mt-6 w-full rounded-xl bg-lime-400 py-3.5 font-bold text-zinc-950 transition-colors hover:bg-lime-300"
              >
                응모번호 받기
              </button>
            </form>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-2xl px-5 pb-24 pt-8">
        <h2 className="text-center text-3xl font-extrabold tracking-tight">자주 묻는 질문</h2>
        <div className="mt-8 space-y-3">
          {faqs.map((faq, i) => {
            const open = openFaq === i;
            return (
              <div key={faq.q} className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40">
                <button
                  type="button"
                  onClick={() => setOpenFaq(open ? null : i)}
                  aria-expanded={open}
                  className="flex w-full items-center justify-between px-5 py-4 text-left font-semibold"
                >
                  {faq.q}
                  <ChevronDown
                    size={18}
                    className={`shrink-0 text-zinc-500 transition-transform ${open ? "rotate-180" : ""}`}
                    aria-hidden
                  />
                </button>
                {open && (
                  <p className="border-t border-zinc-800 px-5 py-4 text-sm leading-relaxed text-zinc-400">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
        <p className="mt-14 text-center text-xs text-zinc-600">
          곰선임 데모 사이트 — 실제 이벤트가 아니며 입력 정보는 내 브라우저에만 저장됩니다.
        </p>
      </section>
    </div>
  );
}
