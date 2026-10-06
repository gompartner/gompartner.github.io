"use client";

import { useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CircleAlert, Clock } from "lucide-react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";

/* cron 표현식 한국어 풀이.
   5칸(분 시 일 월 요일), 초를 붙인 6칸(Spring, Quartz), 연도까지 붙인 7칸(Quartz)과 @daily 같은 약칭을 읽는다.
   칸마다 색을 나눠 무엇을 뜻하는지 보여 주고, 문장으로 풀어 쓴 뒤 다음 실행 시각 10개를 한국 시간으로 계산한다.
   일과 요일을 둘 다 지정하면 리눅스 cron처럼 둘 중 하나만 맞아도 실행한다.
   요일 숫자는 0과 7이 일요일이고, 식에 ?가 있으면 Quartz로 보고 1이 일요일, 7이 토요일이다. */

const EASE = [0.23, 1, 0.32, 1] as const;

type FieldKey = "sec" | "min" | "hour" | "dom" | "month" | "dow" | "year";

const FIELD_INFO: Record<FieldKey, { label: string; min: number; max: number; color: string }> = {
  sec: { label: "초", min: 0, max: 59, color: "#0f766e" },
  min: { label: "분", min: 0, max: 59, color: "#c2410c" },
  hour: { label: "시", min: 0, max: 23, color: "#7c3aed" },
  dom: { label: "일", min: 1, max: 31, color: "#0369a1" },
  month: { label: "월", min: 1, max: 12, color: "#15803d" },
  dow: { label: "요일", min: 0, max: 7, color: "#be185d" },
  year: { label: "연도", min: 1970, max: 2099, color: "#4d5156" },
};

const MONTH_NAMES = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const DOW_NAMES = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const DOW_KO = ["일", "월", "화", "수", "목", "금", "토"];

const MACROS: Record<string, string> = {
  "@yearly": "0 0 1 1 *",
  "@annually": "0 0 1 1 *",
  "@monthly": "0 0 1 * *",
  "@weekly": "0 0 * * 0",
  "@daily": "0 0 * * *",
  "@midnight": "0 0 * * *",
  "@hourly": "0 * * * *",
};

const PRESETS = [
  { label: "매일 자정", expr: "0 0 * * *" },
  { label: "평일 오전 9시", expr: "0 9 * * 1-5" },
  { label: "5분마다", expr: "*/5 * * * *" },
  { label: "매시 정각", expr: "0 * * * *" },
  { label: "매월 1일 새벽 3시", expr: "0 3 1 * *" },
  { label: "매주 월요일 오전 10시", expr: "0 10 * * MON" },
  { label: "주말 오후 6시 30분", expr: "30 18 * * 6,0" },
  { label: "30초마다 (초 포함)", expr: "*/30 * * * * *" },
  { label: "Quartz 매일 정오", expr: "0 0 12 * * ?" },
];

const SYMBOLS = [
  { sym: "*", text: "모든 값", ex: "* * * * * 매분" },
  { sym: ",", text: "여러 값", ex: "0,30 분 칸에 0분과 30분" },
  { sym: "-", text: "범위", ex: "1-5 요일 칸에 월~금요일" },
  { sym: "/", text: "간격", ex: "*/10 분 칸에 10분마다" },
  { sym: "?", text: "지정 안 함 (Quartz의 일, 요일 칸)", ex: "0 0 12 * * ?" },
];

/* ---------- 해석 ---------- */

type Part = { kind: "any" } | { kind: "range"; a: number; b: number; step: number; open: boolean };

export type Field = { key: FieldKey; raw: string; parts: Part[]; values: number[]; any: boolean };

export type CronResult =
  | { ok: true; fields: Field[]; quartz: boolean; expanded: string | null }
  | { ok: false; error: string; badIndex: number | null; tokens: string[]; keys: FieldKey[] };

function keysFor(count: number): FieldKey[] {
  if (count === 5) return ["min", "hour", "dom", "month", "dow"];
  if (count === 6) return ["sec", "min", "hour", "dom", "month", "dow"];
  return ["sec", "min", "hour", "dom", "month", "dow", "year"];
}

function parseValue(s: string, key: FieldKey, quartz: boolean): number {
  const up = s.toUpperCase();
  if (key === "month" && MONTH_NAMES.includes(up)) return MONTH_NAMES.indexOf(up) + 1;
  if (key === "dow" && DOW_NAMES.includes(up)) return DOW_NAMES.indexOf(up) + (quartz ? 1 : 0);
  if (!/^\d+$/.test(s)) throw new Error(`"${s}"는 숫자가 아닙니다`);
  return Number(s);
}

function parseField(raw: string, key: FieldKey, quartz: boolean): Field {
  const info = FIELD_INFO[key];
  const min = key === "dow" && quartz ? 1 : info.min;
  const max = key === "dow" && quartz ? 7 : info.max;
  // JUL, WED 같은 이름을 빼고도 L, W, #가 남으면 Quartz 전용 기호다
  const stripped = raw.toUpperCase().replace(new RegExp([...MONTH_NAMES, ...DOW_NAMES].join("|"), "g"), "");
  if (/[LW#]/.test(stripped)) throw new Error("L, W, # 같은 Quartz 전용 기호는 풀지 못합니다");
  const parts: Part[] = [];
  for (const piece of raw.split(",")) {
    if (piece === "") throw new Error("쉼표 사이에 값이 비어 있습니다");
    if (piece === "?") {
      if (key !== "dom" && key !== "dow") throw new Error("?는 일, 요일 칸에만 쓸 수 있습니다");
      parts.push({ kind: "any" });
      continue;
    }
    const [base, stepStr, extra] = piece.split("/");
    if (extra !== undefined) throw new Error("/가 두 번 들어 있습니다");
    let step = 1;
    if (stepStr !== undefined) {
      if (!/^\d+$/.test(stepStr) || Number(stepStr) === 0) throw new Error(`간격 "${stepStr}"은 1 이상의 숫자여야 합니다`);
      step = Number(stepStr);
    }
    if (base === "*") {
      parts.push(step === 1 ? { kind: "any" } : { kind: "range", a: min, b: max, step, open: true });
      continue;
    }
    const [aStr, bStr, extra2] = base.split("-");
    if (extra2 !== undefined) throw new Error("-가 두 번 들어 있습니다");
    const a = parseValue(aStr, key, quartz);
    const b = bStr !== undefined ? parseValue(bStr, key, quartz) : stepStr !== undefined ? max : a;
    for (const v of [a, b]) {
      if (v < min || v > max) throw new Error(`${v}${[2, 4, 5, 9].includes(v % 10) ? "는" : "은"} ${min}~${max} 범위를 벗어났습니다`);
    }
    if (a > b) throw new Error(`범위 ${aStr}-${bStr}의 시작값이 끝값보다 큽니다`);
    parts.push({ kind: "range", a, b, step, open: bStr === undefined && stepStr !== undefined });
  }

  const any = parts.some((p) => p.kind === "any");
  const set = new Set<number>();
  if (any) for (let v = min; v <= max; v++) set.add(v);
  for (const p of parts) if (p.kind === "range") for (let v = p.a; v <= p.b; v += p.step) set.add(v);

  let values = [...set];
  // 요일은 0~6(일~토)으로 맞춘다
  if (key === "dow") values = [...new Set(values.map((v) => (quartz ? v - 1 : v % 7)))];
  values.sort((x, y) => x - y);
  return { key, raw, parts, values, any };
}

export function parseCron(input: string): CronResult | null {
  const text = input.trim();
  if (!text) return null;
  let expanded: string | null = null;
  let body = text;
  if (text.startsWith("@")) {
    const m = MACROS[text.toLowerCase()];
    if (!m) return { ok: false, error: `${text}는 알 수 없는 약칭입니다. @yearly, @monthly, @weekly, @daily, @hourly를 쓸 수 있습니다.`, badIndex: null, tokens: [], keys: [] };
    expanded = m;
    body = m;
  }
  const tokens = body.split(/\s+/);
  if (tokens.length < 5 || tokens.length > 7) {
    return {
      ok: false,
      error: `칸이 ${tokens.length}개입니다. 5칸(분 시 일 월 요일)이나 초를 붙인 6칸, 연도까지 붙인 7칸으로 입력하세요.`,
      badIndex: null,
      tokens,
      keys: [],
    };
  }
  const keys = keysFor(tokens.length);
  const quartz = tokens.includes("?") || tokens.length === 7;
  const fields: Field[] = [];
  for (let i = 0; i < tokens.length; i++) {
    try {
      fields.push(parseField(tokens[i], keys[i], quartz));
    } catch (e) {
      return { ok: false, error: `${i + 1}번째 칸(${FIELD_INFO[keys[i]].label}): ${(e as Error).message}.`, badIndex: i, tokens, keys };
    }
  }
  return { ok: true, fields, quartz, expanded };
}

/* ---------- 문장 만들기 ---------- */

function compress(values: number[], fmt: (v: number) => string = String) {
  const out: string[] = [];
  for (let i = 0; i < values.length; i++) {
    let j = i;
    while (j + 1 < values.length && values[j + 1] === values[j] + 1) j++;
    if (j - i >= 2) out.push(`${fmt(values[i])}~${fmt(values[j])}`);
    else for (let k = i; k <= j; k++) out.push(fmt(values[k]));
    i = j;
  }
  return out.join(", ");
}

type Shape = { type: "any" } | { type: "single"; v: number } | { type: "every"; n: number; from: number } | { type: "range"; a: number; b: number } | { type: "list" };

function shape(f: Field | undefined): Shape {
  if (!f || f.any) return { type: "any" };
  if (f.values.length === 1) return { type: "single", v: f.values[0] };
  if (f.parts.length === 1) {
    const p = f.parts[0];
    if (p.kind === "range" && p.open && f.key !== "dow") return { type: "every", n: p.step, from: p.a };
    if (p.kind === "range" && p.step === 1) return { type: "range", a: p.a, b: p.b };
  }
  return { type: "list" };
}

function hourText(h: number, m = 0, s = 0) {
  if (h === 0 && m === 0 && s === 0) return "자정";
  if (h === 12 && m === 0 && s === 0) return "정오";
  const base = `${h < 12 ? "오전" : "오후"} ${h % 12 === 0 ? 12 : h % 12}시`;
  return base + (m ? ` ${m}분` : "") + (s ? ` ${s}초` : "");
}

function timePhrase(fields: Record<FieldKey, Field | undefined>) {
  const min = shape(fields.min);
  const hour = shape(fields.hour);
  const sec = fields.sec;
  const secShape = shape(sec);
  const secTrivial = !sec || (secShape.type === "single" && secShape.v === 0);
  const s0 = secShape.type === "single" ? secShape.v : 0;
  const hours = fields.hour!.values;
  const mins = fields.min!.values;

  let minDesc: string;
  if (min.type === "any") minDesc = "매분";
  else if (min.type === "every") minDesc = min.from === 0 ? `${min.n}분마다` : `${min.from}분부터 ${min.n}분마다`;
  else if (min.type === "range") minDesc = `${min.a}~${min.b}분 사이 매분`;
  else minDesc = compress(mins).split(", ").map((m) => (m === "0" ? "정각" : `${m}분`)).join(", ");

  let time: string;
  if (min.type === "single" && (secTrivial || secShape.type === "single")) {
    const m = min.v;
    if (hour.type === "any") time = m === 0 && s0 === 0 ? "매시 정각" : `매시 ${m}분${s0 ? ` ${s0}초` : ""}`;
    else if (hour.type === "single" || hour.type === "list") time = hours.map((h) => hourText(h, m, s0)).join(", ");
    else if (hour.type === "range") time = `${hourText(hour.a)}~${hourText(hour.b)} 매시 ${m === 0 ? "정각" : `${m}분`}`;
    else time = `${hour.from === 0 ? "" : `${hourText(hour.from)}부터 `}${hour.n}시간마다 ${m === 0 ? "정각" : `${m}분`}`;
    return time;
  }

  let hourDesc = "";
  if (hour.type === "single") hourDesc = `${hourText(hour.v)} 대에`;
  else if (hour.type === "range") hourDesc = `${hourText(hour.a)}~${hourText(hour.b)} 59분 사이`;
  else if (hour.type === "every") hourDesc = `${hour.n}시간마다`;
  else if (hour.type === "list") hourDesc = `${hours.map((h) => hourText(h)).join(", ")} 대에`;
  time = [hourDesc, minDesc].filter(Boolean).join(" ");
  if (min.type === "list" && hour.type === "any") time = `매시 ${minDesc}`;

  if (!secTrivial) {
    let secDesc: string;
    if (secShape.type === "any") secDesc = "매초";
    else if (secShape.type === "every") secDesc = secShape.from === 0 ? `${secShape.n}초마다` : `${secShape.from}초부터 ${secShape.n}초마다`;
    else if (secShape.type === "range") secDesc = `${secShape.a}~${secShape.b}초 사이 매초`;
    else secDesc = `${compress(sec!.values)}초`;
    if (min.type === "any" && hour.type === "any") return secDesc;
    return `${time} ${secDesc}`.replace("매분 ", "");
  }
  return time;
}

function dowPhrase(f: Field) {
  const v = f.values.join(",");
  if (v === "1,2,3,4,5") return "평일(월~금)";
  if (v === "0,6") return "주말(토, 일)";
  return `매주 ${compress(f.values, (d) => DOW_KO[d])}요일`;
}

export function describe(fields: Field[]) {
  const by = Object.fromEntries(fields.map((f) => [f.key, f])) as Record<FieldKey, Field | undefined>;
  const time = timePhrase(by);
  const dom = by.dom!;
  const dow = by.dow!;
  const month = by.month!;
  const year = by.year;

  const monthShape = shape(month);
  let monthText = "";
  if (monthShape.type === "every") monthText = `${monthShape.from === 1 ? "" : `${monthShape.from}월부터 `}${monthShape.n}개월마다`;
  else if (monthShape.type !== "any") monthText = `${compress(month.values)}월`;

  const domShape = shape(dom);
  let domText = "";
  if (domShape.type === "every") domText = `${domShape.from === 1 ? "" : `${domShape.from}일부터 `}${domShape.n}일마다`;
  else if (domShape.type !== "any") domText = `${compress(dom.values)}일`;

  const dowText = dow.any ? "" : dowPhrase(dow);

  let date = "";
  if (domText) {
    if (monthText) date = `${monthShape.type === "single" ? "매년 " : ""}${monthText} ${domText}`;
    else date = domShape.type === "every" ? domText : `매월 ${domText}`;
  } else if (monthText) date = `${monthShape.type === "single" ? "매년 " : ""}${monthText}${dowText ? "" : " 매일"}`;
  if (dowText) date = domText ? `${date} 또는 ${dowText}` : [monthText && !domText ? monthText : "", dowText].filter(Boolean).join(" ");

  const hourShape = shape(by.hour);
  const specificTime = hourShape.type === "single" || hourShape.type === "list";
  if (!date && specificTime) date = "매일";
  if (year && !year.any) date = `${compress(year.values)}년 ${date}`.trim();

  const sentence = [date, time].filter(Boolean).join(" ");
  return sentence + (/(마다|매분|매초)$/.test(sentence) ? " 실행" : "에 실행");
}

export function fieldMeaning(f: Field) {
  if (f.any) return f.raw === "?" ? "지정 안 함" : "모든 값";
  const s = shape(f);
  const unit = FIELD_INFO[f.key].label;
  if (f.key === "dow") return `${compress(f.values, (d) => DOW_KO[d])}요일`;
  if (s.type === "every") return `${s.from}${unit}부터 ${s.n}${f.key === "month" ? "개월" : f.key === "hour" ? "시간" : unit}마다`;
  if (f.key === "hour") return compress(f.values, (h) => `${h}시`);
  return `${compress(f.values)}${unit === "연도" ? "년" : unit}`;
}

/* ---------- 다음 실행 시각 ---------- */

const KST = 9 * 3600_000;

function daysIn(y: number, m: number) {
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

// fromSec 이후(초 단위, 실제 시각) 다음 실행 시각을 최대 count개 찾는다. 50년 안에 없으면 그만둔다
export function nextRuns(fields: Field[], fromSec: number, count = 10) {
  const by = Object.fromEntries(fields.map((f) => [f.key, f])) as Record<FieldKey, Field | undefined>;
  const set = (f: Field | undefined, fallback: number[]) => new Set(f ? f.values : fallback);
  const secs = set(by.sec, [0]);
  const mins = set(by.min, []);
  const hours = set(by.hour, []);
  const doms = set(by.dom, []);
  const months = set(by.month, []);
  const dows = set(by.dow, []);
  const years = by.year && !by.year.any ? new Set(by.year.values) : null;
  const domAny = !!by.dom?.any;
  const dowAny = !!by.dow?.any;

  const start = new Date(fromSec * 1000 + KST);
  let y = start.getUTCFullYear();
  let mo = start.getUTCMonth() + 1;
  let d = start.getUTCDate();
  let h = start.getUTCHours();
  let mi = start.getUTCMinutes();
  let s = start.getUTCSeconds();
  const limitYear = y + 50;
  const out: number[] = [];

  for (let iter = 0; iter < 400_000 && out.length < count; iter++) {
    if (s > 59) { s = 0; mi++; }
    if (mi > 59) { mi = 0; h++; }
    if (h > 23) { h = 0; d++; }
    if (d > daysIn(y, mo)) { d = 1; mo++; }
    if (mo > 12) { mo = 1; y++; }
    if (y > limitYear) break;

    if (years && !years.has(y)) { y++; mo = 1; d = 1; h = 0; mi = 0; s = 0; continue; }
    if (!months.has(mo)) { mo++; d = 1; h = 0; mi = 0; s = 0; continue; }
    const wd = new Date(Date.UTC(y, mo - 1, d)).getUTCDay();
    const domOk = doms.has(d);
    const dowOk = dows.has(wd);
    const dayOk = domAny && dowAny ? true : domAny ? dowOk : dowAny ? domOk : domOk || dowOk;
    if (!dayOk) { d++; h = 0; mi = 0; s = 0; continue; }
    if (!hours.has(h)) { h++; mi = 0; s = 0; continue; }
    if (!mins.has(mi)) { mi++; s = 0; continue; }
    if (!secs.has(s)) { s++; continue; }
    out.push((Date.UTC(y, mo - 1, d, h, mi, s) - KST) / 1000);
    s++;
  }
  return out;
}

function formatRun(sec: number, withSeconds: boolean) {
  const t = new Date(sec * 1000 + KST);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${t.getUTCFullYear()}. ${p(t.getUTCMonth() + 1)}. ${p(t.getUTCDate())}. (${DOW_KO[t.getUTCDay()]}) ${p(t.getUTCHours())}:${p(t.getUTCMinutes())}${withSeconds ? `:${p(t.getUTCSeconds())}` : ""}`;
}

function relative(sec: number, now: number) {
  const diff = Math.max(0, sec - now);
  if (diff < 60) return `${diff}초 후`;
  if (diff < 3600) return `${Math.round(diff / 60)}분 후`;
  if (diff < 86400) return `${Math.round(diff / 3600)}시간 후`;
  if (diff < 31536000) return `${Math.round(diff / 86400)}일 후`;
  return `약 ${Math.round(diff / 31536000)}년 후`;
}

// 10초 단위로 내린 현재 시각(초). 서버 렌더에서는 0
function subscribeNow(cb: () => void) {
  const id = window.setInterval(cb, 10_000);
  return () => window.clearInterval(id);
}
const getNow = () => Math.floor(Date.now() / 10_000) * 10;

/* ---------- 화면 ---------- */

export function CronExplainer() {
  const reduce = useReducedMotionSafe();
  const [expr, setExpr] = useState("30 9 * * 1-5");
  const now = useSyncExternalStore(subscribeNow, getNow, () => 0);

  const result = parseCron(expr);
  const tokens = result ? (result.ok ? result.fields.map((f) => f.raw) : result.tokens) : [];
  const keys: (FieldKey | null)[] = result ? (result.ok ? result.fields.map((f) => f.key) : tokens.map((_, i) => result.keys[i] ?? null)) : [];
  const badIndex = result && !result.ok ? result.badIndex : null;
  const sentence = result?.ok ? describe(result.fields) : "";
  const hasSeconds = !!result?.ok && result.fields.some((f) => f.key === "sec");
  const runs = result?.ok && now ? nextRuns(result.fields, now + 1) : [];

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <div className="min-w-0">
        <label htmlFor="cron-input" className="text-[19px] font-bold">
          cron 표현식
        </label>
        <input
          id="cron-input"
          value={expr}
          onChange={(e) => setExpr(e.target.value)}
          spellCheck={false}
          autoComplete="off"
          placeholder="*/5 * * * *"
          aria-describedby="cron-fields"
          className="mt-2 h-14 w-full rounded-md border border-[#8a949e] px-4 font-mono text-[20px] tracking-[0.04em] focus:border-accent"
        />

        <ul id="cron-fields" className="mt-3 flex flex-wrap gap-2" aria-label="칸별 구분">
          {result?.ok && result.expanded && (
            <li className="w-full text-[15px] text-foreground-secondary">
              {expr.trim()}는 <code className="font-mono font-bold text-foreground">{result.expanded}</code>와 같습니다
            </li>
          )}
          {tokens.map((t, i) => {
            const key = keys[i];
            const bad = badIndex === i;
            const color = bad ? "#b42318" : key ? FIELD_INFO[key].color : "#6d7882";
            return (
              <li
                key={i}
                className="min-w-[3.5rem] rounded-md border-2 px-2.5 py-1.5 text-center"
                style={{ borderColor: color, backgroundColor: bad ? "#fde7e9" : "transparent" }}
              >
                <span className="block font-mono text-[16px] font-bold" style={{ color }}>
                  {t}
                </span>
                <span className="block text-[13px] text-foreground-secondary">{key ? FIELD_INFO[key].label : `${i + 1}번째`}</span>
              </li>
            );
          })}
        </ul>

        <section className="mt-8" aria-labelledby="cron-presets">
          <h2 id="cron-presets" className="text-[17px] font-bold">
            자주 쓰는 식
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {PRESETS.map((p) => {
              const on = expr.trim() === p.expr;
              return (
                <button
                  key={p.expr}
                  type="button"
                  onClick={() => setExpr(p.expr)}
                  aria-pressed={on}
                  className={`inline-flex h-10 items-center rounded-md border px-3 text-[15px] transition-colors ${on ? "border-accent bg-accent-surface font-bold text-accent" : "border-border hover:bg-surface"}`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-8" aria-labelledby="cron-symbols">
          <h2 id="cron-symbols" className="text-[17px] font-bold">
            기호 뜻
          </h2>
          <table className="mt-3 w-full text-left text-[15px]">
            <tbody className="divide-y divide-border border-y border-border">
              {SYMBOLS.map((s) => (
                <tr key={s.sym}>
                  <th scope="row" className="w-12 py-2.5 font-mono text-[17px] font-bold">
                    {s.sym}
                  </th>
                  <td className="py-2.5">
                    {s.text}
                    <span className="block font-mono text-[13px] text-foreground-secondary">{s.ex}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-[14px] leading-[1.6] text-foreground-secondary">
            요일은 0과 7이 일요일입니다. ?가 있거나 7칸이면 Quartz 방식으로 보고 1을 일요일로 읽습니다. 일과 요일을 둘 다 지정하면 하나만 맞아도 실행합니다.
          </p>
        </section>
      </div>

      <div className="min-w-0" aria-live="polite">
        {!result && (
          <div className="flex min-h-[240px] items-center justify-center rounded-[10px] border border-dashed border-border p-6 text-center text-[17px] text-foreground-secondary">
            입력한 표현식이 없습니다.
          </div>
        )}
        {result && !result.ok && (
          <p className="flex gap-2 rounded-md bg-[#fde7e9] px-4 py-3 text-[16px] leading-[1.6] text-[#b42318]">
            <CircleAlert size={18} className="mt-1 shrink-0" aria-hidden />
            {result.error}
          </p>
        )}
        {result?.ok && (
          <>
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={sentence}
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduce ? 0.1 : 0.18, ease: EASE }}
                className="rounded-[10px] bg-accent-surface px-5 py-4 text-[22px] font-bold leading-[1.45] tracking-[-0.01em] md:text-[26px]"
              >
                {sentence}
              </motion.p>
            </AnimatePresence>

            <section className="mt-5 rounded-[10px] border border-border" aria-labelledby="cron-breakdown">
              <h2 id="cron-breakdown" className="border-b border-border px-4 py-3 text-[17px] font-bold">
                칸별 뜻
              </h2>
              <dl className="divide-y divide-border">
                {result.fields.map((f) => (
                  <div key={f.key} className="grid grid-cols-[4.5rem_6rem_minmax(0,1fr)] items-center gap-3 px-4 py-2.5">
                    <dt className="text-[15px] font-bold" style={{ color: FIELD_INFO[f.key].color }}>
                      {FIELD_INFO[f.key].label}
                    </dt>
                    <dd className="break-all font-mono text-[15px]">{f.raw}</dd>
                    <dd className="text-[15px] text-foreground-secondary">{fieldMeaning(f)}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section className="mt-5 rounded-[10px] border border-border" aria-labelledby="cron-next">
              <h2 id="cron-next" className="flex items-center gap-2 border-b border-border px-4 py-3 text-[17px] font-bold">
                <Clock size={17} aria-hidden />
                다음 실행 시각 (한국 시간)
              </h2>
              {!now ? (
                <p className="px-4 py-3 text-[15px] text-foreground-secondary">계산하는 중입니다.</p>
              ) : runs.length === 0 ? (
                <p className="px-4 py-3 text-[15px] text-foreground-secondary">앞으로 50년 안에 실행되는 날이 없습니다. 2월 30일처럼 없는 날짜인지 확인하세요.</p>
              ) : (
                <ol className="divide-y divide-border">
                  {runs.map((r, i) => (
                    <li key={r} className="flex items-baseline justify-between gap-3 px-4 py-2.5">
                      <span className="font-mono text-[15px] tabular-nums">
                        <span className="mr-3 text-foreground-tertiary">{i + 1}</span>
                        {formatRun(r, hasSeconds)}
                      </span>
                      <span className="shrink-0 text-[14px] text-foreground-secondary">{relative(r, now)}</span>
                    </li>
                  ))}
                </ol>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
