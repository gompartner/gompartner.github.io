"use client";

import { useMemo, useRef, useState } from "react";
import { IBM_Plex_Sans_KR } from "next/font/google";
import { CalendarClock, CheckCircle2, PiggyBank, Phone, ShieldCheck, TrendingUp, Wallet } from "lucide-react";

/* 노후준비 계산기 데모: 가상의 보험사 ○○생명.
   금액 단위는 모두 만 원. 적립 기간은 월 복리, 은퇴 후에는 연 2.5%로 운용하면서
   (희망 생활비 - 국민연금)을 매달 꺼내 쓴다고 계산한다. 물가상승률 반영 시 연 2%. */

const plex = IBM_Plex_Sans_KR({ weight: ["400", "700"], subsets: ["latin"], display: "swap", preload: false });

// 검증 통과한 2계열 팔레트 (validate_palette.js, light): 예상 자산 / 필요 자산
const C_PLAN = "#1a6fb8";
const C_NEED = "#c9502f";

const INK = "#14202e";
const INK_2 = "#46505e";
const INK_3 = "#5d6776";
const LINE = "#d6dbe3";
const PAGE = "#eef1f5";
const NAVY = "#102a43";

const POST_RETURN = 0.025;
const INFLATION = 0.02;

type Inputs = {
  age: number;
  retireAge: number;
  lifeExp: number;
  savings: number;
  monthly: number;
  returnRate: number;
  expense: number;
  pension: number;
  inflation: boolean;
};

const DEFAULTS: Inputs = {
  age: 38,
  retireAge: 60,
  lifeExp: 90,
  savings: 5000,
  monthly: 100,
  returnRate: 4,
  expense: 250,
  pension: 80,
  inflation: true,
};

const PRESETS = [
  { id: "safe", label: "안정추구형", rate: 2.5, note: "예금·채권 중심" },
  { id: "base", label: "위험중립형", rate: 4, note: "혼합형" },
  { id: "bold", label: "적극투자형", rate: 6, note: "주식 비중 높음" },
] as const;

type Point = { age: number; plan: number; need: number };

function formatMan(value: number) {
  const v = Math.round(value);
  const sign = v < 0 ? "-" : "";
  const abs = Math.abs(v);
  if (abs >= 10000) {
    const eok = Math.floor(abs / 10000);
    const rest = abs % 10000;
    return `${sign}${eok}억${rest ? ` ${rest.toLocaleString("ko-KR")}만` : ""} 원`;
  }
  return `${sign}${abs.toLocaleString("ko-KR")}만 원`;
}

function formatAxis(value: number) {
  if (value === 0) return "0";
  if (value >= 10000) {
    const eok = value / 10000;
    return `${Number.isInteger(eok) ? eok : eok.toFixed(1)}억`;
  }
  return value % 1000 === 0 ? `${value / 1000}천만` : `${Math.round(value).toLocaleString("ko-KR")}만`;
}

/** 적립과 인출을 월 단위로 계산하고, 나이별(연 단위) 자산 잔액을 돌려준다 */
function simulate(inp: Inputs, extraMonthly: number) {
  const r = inp.returnRate / 100 / 12;
  const rp = POST_RETURN / 12;
  const inf = inp.inflation ? INFLATION : 0;
  const accMonths = (inp.retireAge - inp.age) * 12;
  const totalMonths = (inp.lifeExp - inp.age) * 12;
  const gapToday = Math.max(inp.expense - inp.pension, 0);

  let asset = inp.savings;
  let depletedAge: number | null = null;
  const yearly: number[] = [asset];
  let atRetire = asset;

  for (let m = 0; m < totalMonths; m++) {
    if (m < accMonths) {
      asset = asset * (1 + r) + inp.monthly + extraMonthly;
      if (m === accMonths - 1) atRetire = asset;
    } else {
      const withdraw = gapToday * Math.pow(1 + inf, m / 12);
      asset = asset * (1 + rp) - withdraw;
      if (asset <= 0) {
        if (depletedAge === null) depletedAge = inp.age + Math.floor((m + 1) / 12);
        asset = 0;
      }
    }
    if ((m + 1) % 12 === 0) yearly.push(Math.max(asset, 0));
  }
  if (accMonths === 0) atRetire = inp.savings;
  return { yearly, atRetire, depletedAge };
}

/** 은퇴 시점에 있어야 할 금액: 은퇴 후 매달 꺼내 쓸 금액의 현재가치 합 */
function neededAtRetirement(inp: Inputs) {
  const rp = POST_RETURN / 12;
  const inf = inp.inflation ? INFLATION : 0;
  const accMonths = (inp.retireAge - inp.age) * 12;
  const retMonths = (inp.lifeExp - inp.retireAge) * 12;
  const gapToday = Math.max(inp.expense - inp.pension, 0);
  let pv = 0;
  for (let k = 0; k < retMonths; k++) {
    const withdraw = gapToday * Math.pow(1 + inf, (accMonths + k) / 12);
    pv += withdraw / Math.pow(1 + rp, k + 1);
  }
  return pv;
}

function compute(inp: Inputs) {
  const accMonths = (inp.retireAge - inp.age) * 12;
  const r = inp.returnRate / 100 / 12;
  const base = simulate(inp, 0);
  const needed = neededAtRetirement(inp);
  const gap = needed - base.atRetire;
  const annuity = accMonths === 0 ? 0 : r === 0 ? accMonths : (Math.pow(1 + r, accMonths) - 1) / r;
  const extra = annuity > 0 ? gap / annuity : 0;
  const target = simulate(inp, extra);
  const points: Point[] = base.yearly.map((plan, i) => ({ age: inp.age + i, plan, need: target.yearly[i] ?? 0 }));
  return {
    projected: base.atRetire,
    needed,
    gap,
    extraMonthly: Math.max(extra, 0),
    depletedAge: base.depletedAge,
    points,
  };
}

function clampInputs(inp: Inputs): Inputs {
  const age = Math.min(Math.max(inp.age, 20), 64);
  const retireAge = Math.min(Math.max(inp.retireAge, age + 1), 75);
  const lifeExp = Math.min(Math.max(inp.lifeExp, retireAge + 1), 100);
  return { ...inp, age, retireAge, lifeExp };
}

type FieldDef = {
  key: keyof Omit<Inputs, "inflation">;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
};

const AGE_FIELDS: FieldDef[] = [
  { key: "age", label: "현재 연령", unit: "세", min: 20, max: 64, step: 1 },
  { key: "retireAge", label: "은퇴 예정 연령", unit: "세", min: 45, max: 75, step: 1 },
  { key: "lifeExp", label: "기대수명", unit: "세", min: 70, max: 100, step: 1 },
];
const MONEY_FIELDS: FieldDef[] = [
  { key: "savings", label: "현재 보유자산", unit: "만 원", min: 0, max: 50000, step: 100 },
  { key: "monthly", label: "월 저축액", unit: "만 원", min: 0, max: 500, step: 5 },
  { key: "returnRate", label: "예상 수익률(연)", unit: "%", min: 0, max: 10, step: 0.5 },
];
const LIFE_FIELDS: FieldDef[] = [
  { key: "expense", label: "은퇴 후 월 생활비", unit: "만 원", min: 100, max: 600, step: 10 },
  { key: "pension", label: "국민연금 예상 수령액(월)", unit: "만 원", min: 0, max: 300, step: 5 },
];

export function RetirementDemo() {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS);
  const safe = useMemo(() => clampInputs(inputs), [inputs]);
  const result = useMemo(() => compute(safe), [safe]);

  const set = (key: keyof Inputs, value: number | boolean) => setInputs((prev) => clampInputs({ ...prev, [key]: value }));
  const shortfall = result.gap > 0;

  return (
    <div className={`${plex.className} min-h-screen`} style={{ background: PAGE, color: INK }}>
      <header style={{ background: NAVY }} className="text-white">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-4 py-4 md:px-6">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white">
              <ShieldCheck size={20} color={NAVY} aria-hidden />
            </span>
            <span className="text-[18px] font-bold">○○생명</span>
          </div>
          <nav className="hidden gap-6 text-[15px] text-[#c9d6e6] sm:flex" aria-label="주요 메뉴">
            <span>보험상품</span>
            <span>연금</span>
            <span className="font-bold text-white">노후준비 계산기</span>
            <span>고객센터</span>
          </nav>
        </div>
        <div className="mx-auto max-w-[1200px] px-4 pb-10 pt-6 md:px-6 md:pb-14 md:pt-10">
          <h1 className="text-[30px] font-bold leading-[1.3] md:text-[42px]">노후준비 계산기</h1>
          <p className="mt-2 text-[16px] leading-[1.6] text-[#c9d6e6] md:text-[17px]">
            산출 기준: 적립기간 월 복리, 은퇴 후 연 2.5% 운용, 물가상승률 연 2%
          </p>
        </div>
      </header>

      <main className="mx-auto -mt-6 max-w-[1200px] px-4 pb-28 md:px-6">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
          {/* 입력 */}
          <section aria-labelledby="input-title" className="rounded-[14px] bg-white p-5 shadow-[0_1px_0_rgba(16,42,67,0.06)] md:p-7">
            <h2 id="input-title" className="text-[20px] font-bold">기본정보 입력</h2>

            <div className="mt-4">
              <p className="text-[15px] font-bold" style={{ color: INK_2 }}>
                투자 성향
              </p>
              <div className="mt-2 grid grid-cols-3 gap-2" role="radiogroup" aria-label="투자 성향">
                {PRESETS.map((p) => {
                  const active = safe.returnRate === p.rate;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => set("returnRate", p.rate)}
                      className="rounded-[10px] border-2 px-2 py-2.5 text-left transition-colors"
                      style={{
                        borderColor: active ? C_PLAN : LINE,
                        background: active ? "#eaf2fb" : "#fff",
                      }}
                    >
                      <span className="block text-[16px] font-bold">{p.label}</span>
                      <span className="block text-[13px] leading-[1.4]" style={{ color: INK_3 }}>
                        연 {p.rate}%, {p.note}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <FieldGroup title="연령" fields={AGE_FIELDS} inputs={safe} onChange={set} />
            <FieldGroup title="보유자산 및 저축" fields={MONEY_FIELDS} inputs={safe} onChange={set} />
            <FieldGroup title="은퇴 후 생활비" fields={LIFE_FIELDS} inputs={safe} onChange={set} />

            <label className="mt-6 flex cursor-pointer items-center gap-3 rounded-[10px] px-3 py-3" style={{ background: "#f5f7fa" }}>
              <input
                type="checkbox"
                checked={safe.inflation}
                onChange={(e) => set("inflation", e.target.checked)}
                className="h-5 w-5 shrink-0"
                style={{ accentColor: C_PLAN }}
              />
              <span className="text-[15px] leading-[1.5]">물가상승률 반영 (연 2%)</span>
            </label>
          </section>

          {/* 결과 */}
          <section aria-labelledby="result-title" className="space-y-5">
            <div className="rounded-[14px] p-5 text-white md:p-7" style={{ background: shortfall ? "#7a2e1c" : "#0f4c75" }}>
              <h2 id="result-title" className="text-[15px] font-bold text-white/80">
                노후자금 진단 결과
              </h2>
              <p className="mt-2 text-[17px] leading-[1.6]">
                {safe.retireAge}세 은퇴 기준 노후자금
              </p>
              <p className="mt-1 break-keep text-[34px] font-bold leading-[1.2] tabular-nums md:text-[44px]" aria-live="polite">
                {formatMan(Math.abs(result.gap))} {shortfall ? "부족" : "여유"}
              </p>
              {shortfall && (
                <p className="mt-3 text-[16px] leading-[1.6] text-white/90">
                  매월 <b className="text-white">{formatMan(result.extraMonthly)}</b>을 추가로 저축하면 필요 노후자금을 준비할 수 있습니다.
                </p>
              )}
              {result.depletedAge !== null && (
                <p className="mt-2 text-[15px] leading-[1.6] text-white/85">
                  현재 계획 기준 예상 자산 소진 시점: {result.depletedAge}세
                </p>
              )}
            </div>

            <dl className="grid grid-cols-2 gap-3">
              <Stat icon={<Wallet size={18} aria-hidden />} label="은퇴 시점 예상 자산" value={formatMan(result.projected)} />
              <Stat icon={<PiggyBank size={18} aria-hidden />} label="필요 노후자금" value={formatMan(result.needed)} />
              <Stat
                icon={<TrendingUp size={18} aria-hidden />}
                label="월 추가 저축 필요액"
                value={shortfall ? formatMan(result.extraMonthly) : "없음"}
              />
              <Stat
                icon={<CalendarClock size={18} aria-hidden />}
                label="은퇴 후 생활 기간"
                value={`${safe.lifeExp - safe.retireAge}년`}
              />
            </dl>

            <div className="rounded-[14px] bg-white p-5 md:p-6">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-[18px] font-bold">연령별 자산 추이</h3>
                <div className="flex gap-4 text-[14px]" style={{ color: INK_2 }}>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-[2px] w-5" style={{ background: C_PLAN }} aria-hidden />
                    예상 자산
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-5 border-t-2 border-dashed" style={{ borderColor: C_NEED }} aria-hidden />
                    필요 자산
                  </span>
                </div>
              </div>
              <AssetChart points={result.points} retireAge={safe.retireAge} />
              <details className="mt-3">
                <summary className="cursor-pointer text-[15px] font-bold" style={{ color: C_PLAN }}>
                  연령별 상세 표
                </summary>
                <div className="mt-2 overflow-x-auto">
                  <table className="w-full min-w-[320px] text-[14px] tabular-nums">
                    <thead>
                      <tr className="border-b text-left" style={{ borderColor: LINE }}>
                        <th scope="col" className="py-2 font-bold">연령</th>
                        <th scope="col" className="py-2 text-right font-bold">예상 자산</th>
                        <th scope="col" className="py-2 text-right font-bold">필요 자산</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.points
                        .filter((p) => p.age % 5 === 0 || p.age === safe.retireAge)
                        .map((p) => (
                          <tr key={p.age} className="border-b" style={{ borderColor: "#edf0f4" }}>
                            <td className="py-1.5">
                              {p.age}세{p.age === safe.retireAge ? " (은퇴)" : ""}
                            </td>
                            <td className="py-1.5 text-right">{formatMan(p.plan)}</td>
                            <td className="py-1.5 text-right">{formatMan(p.need)}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </details>
            </div>

            <ConsultForm />

            <p className="px-1 text-[13px] leading-[1.6]" style={{ color: INK_3 }}>
              계산 결과는 입력한 조건을 바탕으로 한 예상치이며 실제 수령액과 다를 수 있습니다.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}

function FieldGroup({
  title,
  fields,
  inputs,
  onChange,
}: {
  title: string;
  fields: FieldDef[];
  inputs: Inputs;
  onChange: (key: keyof Inputs, value: number) => void;
}) {
  return (
    <fieldset className="mt-6 border-t pt-5" style={{ borderColor: LINE }}>
      <legend className="sr-only">{title}</legend>
      <p className="text-[15px] font-bold" style={{ color: INK_2 }} aria-hidden>
        {title}
      </p>
      <div className="mt-3 space-y-5">
        {fields.map((f) => {
          const value = inputs[f.key] as number;
          const id = `field-${f.key}`;
          return (
            <div key={f.key}>
              <div className="flex items-center justify-between gap-3">
                <label htmlFor={id} className="text-[16px]">
                  {f.label}
                </label>
                <span className="flex items-center gap-1.5">
                  <input
                    type="number"
                    inputMode="decimal"
                    aria-label={`${f.label} 직접 입력`}
                    value={value}
                    min={f.min}
                    max={f.max}
                    step={f.step}
                    onChange={(e) => {
                      const n = Number(e.target.value);
                      if (!Number.isNaN(n)) onChange(f.key, Math.min(Math.max(n, f.min), f.max));
                    }}
                    className="h-10 w-[104px] rounded-[8px] border px-2 text-right text-[16px] font-bold tabular-nums"
                    style={{ borderColor: "#9aa5b4" }}
                  />
                  <span className="w-[38px] text-[14px]" style={{ color: INK_3 }}>
                    {f.unit}
                  </span>
                </span>
              </div>
              <input
                id={id}
                type="range"
                min={f.min}
                max={f.max}
                step={f.step}
                value={value}
                onChange={(e) => onChange(f.key, Number(e.target.value))}
                className="mt-2 w-full"
                style={{ accentColor: C_PLAN }}
              />
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-[14px] bg-white p-4">
      <dt className="flex items-center gap-1.5 text-[14px]" style={{ color: INK_2 }}>
        <span style={{ color: C_PLAN }}>{icon}</span>
        {label}
      </dt>
      <dd className="mt-1.5 break-keep text-[19px] font-bold leading-[1.3] tabular-nums md:text-[21px]">{value}</dd>
    </div>
  );
}

function niceMax(v: number) {
  if (v <= 0) return 10000;
  const pow = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / pow;
  const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
  return step * pow;
}

function AssetChart({ points, retireAge }: { points: Point[]; retireAge: number }) {
  const W = 720;
  const H = 300;
  const m = { l: 52, r: 14, t: 14, b: 32 };
  const iw = W - m.l - m.r;
  const ih = H - m.t - m.b;
  const ref = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<number | null>(null);

  const yMax = niceMax(Math.max(...points.map((p) => Math.max(p.plan, p.need)), 1));
  const x = (i: number) => m.l + (points.length <= 1 ? 0 : (i / (points.length - 1)) * iw);
  const y = (v: number) => m.t + ih - (v / yMax) * ih;
  const path = (key: "plan" | "need") => points.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p[key]).toFixed(1)}`).join("");
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * yMax);
  const retireIndex = points.findIndex((p) => p.age === retireAge);
  const ageTicks = points.map((p, i) => ({ age: p.age, i })).filter((p) => p.age % 10 === 0);

  function onMove(e: React.PointerEvent<SVGSVGElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const i = Math.round(((px - m.l) / iw) * (points.length - 1));
    setHover(Math.min(Math.max(i, 0), points.length - 1));
  }

  const hp = hover !== null ? points[hover] : null;
  const leftPct = hover !== null ? (x(hover) / W) * 100 : 0;

  return (
    <div className="relative mt-4">
      <svg
        ref={ref}
        viewBox={`0 0 ${W} ${H}`}
        className="block h-auto w-full touch-pan-y"
        role="img"
        aria-label="연령별 예상 자산과 필요 자산 추이 그래프"
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
      >
        {ticks.map((t) => (
          <g key={t}>
            <line x1={m.l} x2={W - m.r} y1={y(t)} y2={y(t)} stroke="#e8ecf1" strokeWidth={1} />
            <text x={m.l - 8} y={y(t)} textAnchor="end" dominantBaseline="middle" fontSize={12} fill={INK_3}>
              {formatAxis(t)}
            </text>
          </g>
        ))}
        {ageTicks.map((t) => (
          <text key={t.age} x={x(t.i)} y={H - 10} textAnchor="middle" fontSize={12} fill={INK_3}>
            {t.age}세
          </text>
        ))}
        {retireIndex >= 0 && (
          <g>
            <line x1={x(retireIndex)} x2={x(retireIndex)} y1={m.t} y2={m.t + ih} stroke="#9aa5b4" strokeWidth={1} strokeDasharray="3 3" />
            <text x={x(retireIndex) + 6} y={m.t + 12} fontSize={12} fontWeight={700} fill={INK_2}>
              은퇴
            </text>
          </g>
        )}
        <path d={path("need")} fill="none" stroke={C_NEED} strokeWidth={2} strokeDasharray="6 4" strokeLinejoin="round" />
        <path d={path("plan")} fill="none" stroke={C_PLAN} strokeWidth={2} strokeLinejoin="round" />
        {hp && hover !== null && (
          <g pointerEvents="none">
            <line x1={x(hover)} x2={x(hover)} y1={m.t} y2={m.t + ih} stroke={INK_3} strokeWidth={1} />
            <circle cx={x(hover)} cy={y(hp.need)} r={5} fill={C_NEED} stroke="#fff" strokeWidth={2} />
            <circle cx={x(hover)} cy={y(hp.plan)} r={5} fill={C_PLAN} stroke="#fff" strokeWidth={2} />
          </g>
        )}
      </svg>
      {hp && (
        <div
          className="pointer-events-none absolute top-2 z-10 w-[168px] rounded-[10px] px-3 py-2 text-[13px] leading-[1.5] text-white shadow-lg"
          style={{
            background: NAVY,
            left: `clamp(0px, calc(${leftPct}% - 84px), calc(100% - 168px))`,
          }}
        >
          <p className="font-bold">{hp.age}세</p>
          <p>
            <span style={{ color: "#9cc7ef" }}>예상</span> {formatMan(hp.plan)}
          </p>
          <p>
            <span style={{ color: "#f2b8a6" }}>필요</span> {formatMan(hp.need)}
          </p>
        </div>
      )}
    </div>
  );
}

function ConsultForm() {
  const [done, setDone] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [time, setTime] = useState("오전 (9시~12시)");
  const valid = name.trim().length > 0 && /^\d{2,3}-?\d{3,4}-?\d{4}$/.test(phone.trim());

  if (done) {
    return (
      <div className="flex items-start gap-3 rounded-[14px] border-2 bg-white p-5" style={{ borderColor: C_PLAN }} role="status">
        <CheckCircle2 size={24} color={C_PLAN} className="shrink-0" aria-hidden />
        <div>
          <p className="text-[17px] font-bold">상담 신청이 접수되었습니다</p>
          <p className="mt-1 text-[15px] leading-[1.6]" style={{ color: INK_2 }}>
            {time}에 상담사가 연락드립니다.
          </p>
          <button
            type="button"
            onClick={() => {
              setDone(false);
              setName("");
              setPhone("");
            }}
            className="mt-2 text-[15px] font-bold underline underline-offset-4"
            style={{ color: C_PLAN }}
          >
            재신청
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      className="rounded-[14px] bg-white p-5 md:p-6"
      onSubmit={(e) => {
        e.preventDefault();
        if (valid) setDone(true);
      }}
    >
      <h3 className="flex items-center gap-2 text-[18px] font-bold">
        <Phone size={18} color={C_PLAN} aria-hidden />
        노후설계 무료 상담 신청
      </h3>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <label className="block">
          <span className="text-[14px] font-bold" style={{ color: INK_2 }}>
            성명
          </span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={20}
            className="mt-1 h-11 w-full rounded-[8px] border px-3 text-[16px]"
            style={{ borderColor: "#9aa5b4" }}
          />
        </label>
        <label className="block">
          <span className="text-[14px] font-bold" style={{ color: INK_2 }}>
            연락처
          </span>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            inputMode="tel"
            placeholder="010-0000-0000"
            maxLength={13}
            className="mt-1 h-11 w-full rounded-[8px] border px-3 text-[16px]"
            style={{ borderColor: "#9aa5b4" }}
          />
        </label>
        <label className="block">
          <span className="text-[14px] font-bold" style={{ color: INK_2 }}>
            상담 희망 시간
          </span>
          <select
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="mt-1 h-11 w-full rounded-[8px] border bg-white px-2 text-[16px]"
            style={{ borderColor: "#9aa5b4" }}
          >
            <option>오전 (9시~12시)</option>
            <option>오후 (1시~6시)</option>
            <option>저녁 (6시~8시)</option>
          </select>
        </label>
      </div>
      <button
        type="submit"
        disabled={!valid}
        className="mt-4 h-12 w-full rounded-[10px] text-[17px] font-bold text-white transition-opacity disabled:opacity-40"
        style={{ background: C_PLAN }}
      >
        상담 신청
      </button>
    </form>
  );
}
