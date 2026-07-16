"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Banknote,
  BarChart3,
  BellRing,
  Calculator,
  CalendarX2,
  Check,
  ChevronDown,
  CreditCard,
  MessageSquareText,
  ShieldCheck,
  UserX,
} from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

const STORAGE_KEY = "gs-demo:saas:v1";
const REDUCTION_RATE = 0.74;

interface CalcState {
  monthlyBookings: number;
  avgPrice: number; // 만원 단위
  noShowRate: number; // %
}

const defaultCalc: CalcState = {
  monthlyBookings: 200,
  avgPrice: 5,
  noShowRate: 12,
};

const proofStats = [
  { value: "3,200+", label: "도입 매장" },
  { value: "74%", label: "평균 노쇼 감소율" },
  { value: "120만 건", label: "누적 리마인드 발송" },
  { value: "4.9 / 5", label: "사장님 만족도" },
];

const painPoints = [
  {
    icon: CalendarX2,
    title: "연락 없는 노쇼",
    desc: "예약 시간에 맞춰 자리를 비워뒀는데, 손님은 오지 않고 전화도 받지 않습니다. 그 시간의 매출은 그대로 사라집니다.",
  },
  {
    icon: MessageSquareText,
    title: "전화와 수기 예약장에 묶인 하루",
    desc: "영업 중에 걸려오는 예약 전화, 확인 문자, 변경 요청. 정작 손님 응대에 써야 할 시간이 예약 관리에 새어 나갑니다.",
  },
  {
    icon: Banknote,
    title: "꺼내기 어려운 예약금 이야기",
    desc: "예약금을 받고 싶어도 말을 꺼내기 민망하고, 받더라도 계좌 확인과 환불 처리가 또 일이 됩니다.",
  },
];

const features = [
  {
    icon: BellRing,
    title: "자동 리마인드",
    desc: "예약 전날과 당일, 카카오 알림톡과 문자가 자동으로 나갑니다. 사장님이 보낼 필요가 없습니다.",
  },
  {
    icon: CreditCard,
    title: "예약금·선결제",
    desc: "예약 확정 시 결제 링크가 함께 전송됩니다. 링크 하나로 예약금을 받고, 환불 규정도 자동 안내됩니다.",
  },
  {
    icon: UserX,
    title: "노쇼 이력 관리",
    desc: "반복 노쇼 고객은 예약 접수 화면에 자동으로 표시됩니다. 예약금 필수 조건도 고객별로 걸 수 있습니다.",
  },
  {
    icon: BarChart3,
    title: "예약·노쇼 리포트",
    desc: "요일·시간대별 예약과 노쇼 통계를 한 화면에서 봅니다. 예약금 정책을 어디에 적용할지 데이터로 정하세요.",
  },
];

const testimonials = [
  {
    name: "김 원장",
    role: "미용실 · 서울 마포",
    quote:
      "리마인드 알림톡만 켰는데 노쇼가 반으로 줄었어요. 이제 빈 시간에 다른 예약을 받을 수 있습니다.",
  },
  {
    name: "박 사장",
    role: "레스토랑 · 성수",
    quote:
      "주말 단체 예약에 예약금을 걸기 시작했는데, 말 꺼낼 필요 없이 링크만 보내면 되니까 서로 편합니다.",
  },
  {
    name: "이 대표",
    role: "가죽공방 · 원데이클래스",
    quote:
      "클래스 정원이 작아서 한 명만 빠져도 타격이 컸는데, 도입 후 석 달째 노쇼 없이 운영 중이에요.",
  },
];

const plans = [
  {
    name: "스타터",
    price: "₩0",
    unit: "/월",
    desc: "이제 막 예약을 받기 시작한 매장",
    features: ["월 30건 예약 관리", "문자 리마인드", "예약 페이지 제공"],
    highlight: false,
    cta: "무료로 시작하기",
  },
  {
    name: "프로",
    price: "₩29,000",
    unit: "/월",
    desc: "노쇼를 확실히 줄이고 싶은 매장",
    features: [
      "무제한 예약 관리",
      "카카오 알림톡 리마인드",
      "예약금·선결제 링크",
      "노쇼 이력 관리",
    ],
    highlight: true,
    cta: "14일 무료 체험",
  },
  {
    name: "플러스",
    price: "₩59,000",
    unit: "/월",
    desc: "여러 지점을 함께 운영하는 사업자",
    features: ["프로의 모든 기능", "다지점 통합 관리", "예약·노쇼 리포트", "우선 지원"],
    highlight: false,
    cta: "도입 상담하기",
  },
];

const faqs = [
  {
    q: "따로 설치해야 하나요?",
    a: "아니요. 웹에서 바로 시작합니다. 예약 페이지 링크를 카카오 채널이나 인스타그램 프로필에 붙여넣으면 그날부터 예약을 받을 수 있어요.",
  },
  {
    q: "알림톡 발송 비용은 별도인가요?",
    a: "프로 요금제부터 월 요금에 알림톡 발송 비용이 포함되어 있습니다. 추가 과금 없이 예약 건수만큼 자동 발송됩니다.",
  },
  {
    q: "지금 쓰는 예약장 데이터를 옮길 수 있나요?",
    a: "네. 엑셀이나 수기 예약장 내용을 보내주시면 도입 시 무료로 옮겨드립니다. 기존 고객의 노쇼 이력도 함께 등록됩니다.",
  },
  {
    q: "해지하면 위약금이 있나요?",
    a: "없습니다. 월 단위 구독이라 언제든 해지할 수 있고, 남은 기간은 일할 계산으로 환불됩니다.",
  },
];

const mockBookings = [
  { time: "10:30", name: "김서연", service: "커트 + 클리닉", status: "예약금 완료", tone: "sky" },
  { time: "13:00", name: "박지훈", service: "펌", status: "리마인드 발송", tone: "amber" },
  { time: "15:30", name: "이하늘", service: "염색", status: "확정", tone: "emerald" },
] as const;

const statusTone: Record<(typeof mockBookings)[number]["tone"], string> = {
  sky: "bg-sky-100 text-sky-700",
  amber: "bg-amber-100 text-amber-700",
  emerald: "bg-emerald-100 text-emerald-700",
};

function formatWon(value: number) {
  return `${Math.round(value).toLocaleString("ko-KR")}원`;
}

export function SaasLandingDemo() {
  const reduceMotion = useReducedMotion();
  const [calc, setCalc] = useLocalStorage<CalcState>(STORAGE_KEY, defaultCalc);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const monthlyLoss = calc.monthlyBookings * (calc.noShowRate / 100) * calc.avgPrice * 10_000;
  const monthlySaving = monthlyLoss * REDUCTION_RATE;

  const sliders = [
    {
      id: "saas-bookings",
      label: "월 예약 건수",
      min: 20,
      max: 600,
      step: 10,
      value: calc.monthlyBookings,
      display: `${calc.monthlyBookings}건`,
      onChange: (v: number) => setCalc((prev) => ({ ...prev, monthlyBookings: v })),
    },
    {
      id: "saas-price",
      label: "평균 객단가",
      min: 1,
      max: 20,
      step: 1,
      value: calc.avgPrice,
      display: `${calc.avgPrice}만원`,
      onChange: (v: number) => setCalc((prev) => ({ ...prev, avgPrice: v })),
    },
    {
      id: "saas-noshow",
      label: "현재 노쇼율",
      min: 0,
      max: 30,
      step: 1,
      value: calc.noShowRate,
      display: `${calc.noShowRate}%`,
      onChange: (v: number) => setCalc((prev) => ({ ...prev, noShowRate: v })),
    },
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      {/* 스티키 내비게이션 */}
      <nav className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <a href="#top" className="flex items-center gap-2 font-extrabold tracking-tight">
            <ShieldCheck className="text-sky-600" size={24} aria-hidden />
            노쇼가드
          </a>
          <div className="hidden items-center gap-7 text-sm font-medium text-slate-600 sm:flex">
            <a href="#features" className="transition-colors hover:text-slate-900">기능</a>
            <a href="#calculator" className="transition-colors hover:text-slate-900">절감 계산기</a>
            <a href="#pricing" className="transition-colors hover:text-slate-900">요금</a>
            <a href="#faq" className="transition-colors hover:text-slate-900">FAQ</a>
          </div>
          <a
            href="#pricing"
            className="rounded-full bg-orange-600 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-orange-500"
          >
            무료로 시작하기
          </a>
        </div>
      </nav>

      {/* 히어로 */}
      <header id="top" className="relative overflow-hidden px-5 pb-20 pt-16 sm:pt-24">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(2,132,199,0.08),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(249,115,22,0.07),transparent_50%)]"
        />
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative mx-auto max-w-3xl text-center"
        >
          <span className="inline-block rounded-full border border-sky-200 bg-sky-50 px-4 py-1.5 text-sm font-semibold text-sky-700">
            미용실 · 식당 · 공방 사장님을 위한
          </span>
          <h1 className="mt-7 text-4xl font-black leading-[1.15] tracking-tight sm:text-6xl">
            노쇼 걱정 없이,
            <br />
            <span className="text-sky-600">예약만 받으세요</span>
          </h1>
          <p className="mx-auto mt-6 max-w-lg text-lg leading-relaxed text-slate-600">
            예약 확인부터 리마인드 알림, 예약금 수납까지 —
            <br className="hidden sm:block" />
            노쇼가드가 빈자리 손실을 막아드립니다.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#pricing"
              className="rounded-full bg-orange-600 px-8 py-4 text-lg font-bold text-white transition-colors hover:bg-orange-500"
            >
              14일 무료 체험
            </a>
            <a
              href="#calculator"
              className="rounded-full border border-slate-300 px-8 py-4 text-lg font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-900"
            >
              절감액 계산해보기
            </a>
          </div>
        </motion.div>

        {/* 대시보드 목업 */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="relative mx-auto mt-14 max-w-2xl"
        >
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
            <div className="flex items-center gap-1.5 border-b border-slate-100 bg-slate-50 px-4 py-3" aria-hidden>
              <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
              <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
              <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
              <span className="ml-3 text-xs font-medium text-slate-400">노쇼가드 — 오늘 예약</span>
            </div>
            <ul className="divide-y divide-slate-100 text-left">
              {mockBookings.map((booking) => (
                <li key={booking.time} className="flex items-center gap-4 px-5 py-3.5">
                  <span className="font-mono text-sm font-semibold text-slate-500">{booking.time}</span>
                  <span className="flex-1 truncate">
                    <span className="font-semibold">{booking.name}</span>
                    <span className="ml-2 text-sm text-slate-500">{booking.service}</span>
                  </span>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${statusTone[booking.tone]}`}
                  >
                    {booking.status}
                  </span>
                </li>
              ))}
            </ul>
            <div className="border-t border-slate-100 bg-slate-50 px-5 py-3 text-xs font-medium text-slate-500">
              이번 주 노쇼 0건 · 리마인드 24건 자동 발송됨
            </div>
          </div>
        </motion.div>
      </header>

      {/* 소셜 프루프 */}
      <section className="border-y border-slate-100 bg-slate-50 px-5 py-12">
        <dl className="mx-auto grid max-w-4xl grid-cols-2 gap-8 text-center sm:grid-cols-4">
          {proofStats.map((stat) => (
            <div key={stat.label}>
              <dt className="order-last mt-1.5 text-sm text-slate-500">{stat.label}</dt>
              <dd className="text-3xl font-extrabold tracking-tight text-slate-900">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* 페인 포인트 */}
      <section className="mx-auto max-w-5xl px-5 py-20">
        <h2 className="text-center text-3xl font-extrabold tracking-tight sm:text-4xl">
          이런 경험, 있으시죠?
        </h2>
        <div className="mt-12 grid gap-5 sm:grid-cols-3">
          {painPoints.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-2xl border border-slate-200 bg-white p-6">
              <span className="inline-flex rounded-xl bg-slate-100 p-3">
                <Icon className="text-slate-600" size={22} aria-hidden />
              </span>
              <h3 className="mt-4 font-bold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 기능 */}
      <section id="features" className="scroll-mt-16 bg-slate-50 px-5 py-20">
        <div className="mx-auto max-w-5xl">
          <p className="text-center text-sm font-bold uppercase tracking-widest text-sky-600">Features</p>
          <h2 className="mt-3 text-center text-3xl font-extrabold tracking-tight sm:text-4xl">
            노쇼가 생기기 전에, 노쇼가드가 먼저 움직입니다
          </h2>
          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-2xl border border-slate-200 bg-white p-7">
                <span className="inline-flex rounded-xl bg-sky-50 p-3">
                  <Icon className="text-sky-600" size={24} aria-hidden />
                </span>
                <h3 className="mt-4 text-lg font-bold">{title}</h3>
                <p className="mt-2 leading-relaxed text-slate-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROI 계산기 */}
      <section id="calculator" className="scroll-mt-16 mx-auto max-w-5xl px-5 py-20">
        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-sky-600">Calculator</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
            우리 매장은 노쇼로 얼마를 잃고 있을까요?
          </h2>
          <p className="mt-4 text-slate-600">슬라이더를 움직여 매장 상황에 맞게 계산해보세요.</p>
        </div>
        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-7">
            <div className="flex items-center gap-2 font-bold">
              <Calculator className="text-sky-600" size={20} aria-hidden />
              매장 정보 입력
            </div>
            <div className="mt-7 space-y-7">
              {sliders.map((slider) => (
                <div key={slider.id}>
                  <div className="flex items-baseline justify-between">
                    <label htmlFor={slider.id} className="text-sm font-semibold text-slate-700">
                      {slider.label}
                    </label>
                    <span className="font-mono text-lg font-bold text-sky-600">{slider.display}</span>
                  </div>
                  <input
                    id={slider.id}
                    type="range"
                    min={slider.min}
                    max={slider.max}
                    step={slider.step}
                    value={slider.value}
                    onChange={(e) => slider.onChange(Number(e.target.value))}
                    className="mt-3 h-2 w-full cursor-pointer appearance-auto accent-sky-600"
                  />
                </div>
              ))}
            </div>
            <p className="mt-6 text-xs text-slate-400">
              입력값은 내 브라우저에만 저장되어 다시 방문해도 유지됩니다.
            </p>
          </div>
          <div className="flex flex-col justify-center rounded-2xl bg-slate-900 p-8 text-white">
            <p className="text-sm font-semibold text-slate-400">지금 월 노쇼 손실 추정</p>
            <p className="mt-2 text-4xl font-black tracking-tight text-orange-400" aria-live="polite">
              {formatWon(monthlyLoss)}
            </p>
            <div className="my-6 border-t border-slate-700" />
            <p className="text-sm font-semibold text-slate-400">
              노쇼가드 도입 시 예상 절감액 <span className="text-slate-500">(평균 감소율 74% 기준)</span>
            </p>
            <p className="mt-2 text-4xl font-black tracking-tight text-sky-400" aria-live="polite">
              월 {formatWon(monthlySaving)}
            </p>
            <a
              href="#pricing"
              className="mt-8 inline-block rounded-full bg-orange-600 px-6 py-3.5 text-center font-bold text-white transition-colors hover:bg-orange-500"
            >
              14일 무료로 확인하기
            </a>
          </div>
        </div>
      </section>

      {/* 고객 후기 */}
      <section className="bg-slate-50 px-5 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-extrabold tracking-tight sm:text-4xl">
            먼저 도입한 사장님들의 이야기
          </h2>
          <div className="mt-12 grid gap-5 sm:grid-cols-3">
            {testimonials.map(({ name, role, quote }) => (
              <figure key={name} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6">
                <blockquote className="flex-1 leading-relaxed text-slate-700">
                  &ldquo;{quote}&rdquo;
                </blockquote>
                <figcaption className="mt-5 flex items-center gap-3">
                  <span
                    aria-hidden
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 font-bold text-sky-700"
                  >
                    {name.charAt(0)}
                  </span>
                  <span>
                    <span className="block text-sm font-bold">{name}</span>
                    <span className="block text-xs text-slate-500">{role}</span>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* 요금제 */}
      <section id="pricing" className="scroll-mt-16 mx-auto max-w-5xl px-5 py-20">
        <p className="text-center text-sm font-bold uppercase tracking-widest text-sky-600">Pricing</p>
        <h2 className="mt-3 text-center text-3xl font-extrabold tracking-tight sm:text-4xl">
          노쇼 한 건만 막아도 남는 요금
        </h2>
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl border bg-white p-7 ${
                plan.highlight ? "border-sky-600 ring-2 ring-sky-600" : "border-slate-200"
              }`}
            >
              {plan.highlight && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-sky-600 px-4 py-1 text-xs font-bold text-white">
                  가장 인기
                </span>
              )}
              <h3 className="font-bold text-slate-500">{plan.name}</h3>
              <p className="mt-3">
                <span className="text-4xl font-black tracking-tight">{plan.price}</span>
                <span className="text-slate-500">{plan.unit}</span>
              </p>
              <p className="mt-2 text-sm text-slate-600">{plan.desc}</p>
              <ul className="mt-6 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm text-slate-700">
                    <Check className="mt-0.5 shrink-0 text-sky-600" size={16} aria-hidden />
                    {feature}
                  </li>
                ))}
              </ul>
              <a
                href="#faq"
                className={`mt-8 rounded-full py-3 text-center font-bold transition-colors ${
                  plan.highlight
                    ? "bg-orange-600 text-white hover:bg-orange-500"
                    : "border border-slate-300 text-slate-700 hover:border-slate-400 hover:text-slate-900"
                }`}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-16 bg-slate-50 px-5 py-20">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-center text-3xl font-extrabold tracking-tight sm:text-4xl">자주 묻는 질문</h2>
          <div className="mt-10 space-y-3">
            {faqs.map((faq, i) => {
              const open = openFaq === i;
              return (
                <div key={faq.q} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(open ? null : i)}
                    aria-expanded={open}
                    className="flex w-full cursor-pointer items-center justify-between px-5 py-4 text-left font-semibold"
                  >
                    {faq.q}
                    <ChevronDown
                      size={18}
                      className={`shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
                      aria-hidden
                    />
                  </button>
                  {open && (
                    <p className="border-t border-slate-100 px-5 py-4 text-sm leading-relaxed text-slate-600">
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 최종 CTA */}
      <section className="bg-sky-600 px-5 py-20 text-center text-white">
        <h2 className="mx-auto max-w-2xl text-3xl font-extrabold tracking-tight sm:text-4xl">
          오늘 밤에도 빈자리를 걱정하고 계신가요?
        </h2>
        <p className="mx-auto mt-4 max-w-md text-sky-100">
          카드 등록 없이 14일간 모든 기능을 써볼 수 있습니다. 시작까지 5분이면 충분해요.
        </p>
        <a
          href="#calculator"
          className="mt-9 inline-block rounded-full bg-white px-9 py-4 text-lg font-bold text-sky-700 transition-colors hover:bg-sky-50"
        >
          14일 무료로 시작하기
        </a>
      </section>

      {/* 푸터 */}
      <footer className="bg-slate-900 px-5 py-12 text-center">
        <p className="flex items-center justify-center gap-2 font-bold text-slate-300">
          <ShieldCheck size={18} className="text-sky-500" aria-hidden />
          노쇼가드
        </p>
        <p className="mt-4 space-x-4 text-sm text-slate-500">
          <span>이용약관</span>
          <span>개인정보처리방침</span>
          <span>고객센터</span>
        </p>
      </footer>
    </div>
  );
}
