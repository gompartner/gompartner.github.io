"use client";

import { useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, CircleAlert, Copy } from "lucide-react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";

/* 유닉스 시간 변환기.
   지금 시각의 유닉스 시간을 1초마다 보여 주고, 숫자를 넣으면 자릿수로 초, 밀리초, 마이크로초, 나노초를 구분해 날짜로 바꾼다.
   반대로 날짜와 시각을 한국 시간이나 UTC 기준으로 넣으면 유닉스 시간을 만든다. 모두 브라우저 안에서 계산한다. */

const EASE = [0.23, 1, 0.32, 1] as const;
const KST_OFFSET = 9 * 3600 * 1000;

// 1초마다 갱신되는 현재 시각(밀리초). 서버 렌더에서는 0
function subscribeNow(cb: () => void) {
  const id = window.setInterval(cb, 1000);
  return () => window.clearInterval(id);
}
const getNow = () => Math.floor(Date.now() / 1000) * 1000;

const UNITS = [
  { name: "초", digits: "10자리 안팎", div: 1e-3 },
  { name: "밀리초", digits: "13자리 안팎", div: 1 },
  { name: "마이크로초", digits: "16자리 안팎", div: 1e3 },
  { name: "나노초", digits: "19자리 안팎", div: 1e6 },
];

type Parsed = { ok: true; ms: number; unit: string } | { ok: false; error: string };

function parseTimestamp(raw: string): Parsed | null {
  const t = raw.trim().replace(/[,_\s]/g, "");
  if (!t) return null;
  if (!/^-?\d+(\.\d+)?$/.test(t)) return { ok: false, error: "숫자만 넣어 주세요. 예: 1759400000" };
  const intDigits = t.replace(/^-/, "").split(".")[0].replace(/^0+/, "").length;
  // 자릿수로 단위를 고른다: 12자리 이하 초, 13~15 밀리초, 16~18 마이크로초, 19 이상 나노초
  const unit = intDigits <= 12 ? UNITS[0] : intDigits <= 15 ? UNITS[1] : intDigits <= 18 ? UNITS[2] : UNITS[3];
  const ms = Number(t) / unit.div;
  if (!Number.isFinite(ms) || Math.abs(ms) > 8.64e15) return { ok: false, error: "날짜로 바꿀 수 있는 범위를 넘었습니다." };
  return { ok: true, ms, unit: unit.name };
}

const pad = (n: number, w = 2) => String(n).padStart(w, "0");
const DAYS = ["일", "월", "화", "수", "목", "금", "토"];

function formatKst(ms: number) {
  const d = new Date(ms + KST_OFFSET);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} (${DAYS[d.getUTCDay()]}) ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}.${pad(d.getUTCMilliseconds(), 3)}`;
}
function formatUtc(ms: number) {
  const d = new Date(ms);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}.${pad(d.getUTCMilliseconds(), 3)}`;
}
function formatIsoKst(ms: number) {
  return new Date(ms + KST_OFFSET).toISOString().replace("Z", "+09:00");
}

function relative(ms: number, now: number) {
  const diff = (ms - now) / 1000;
  const abs = Math.abs(diff);
  if (abs < 1) return "지금";
  const unit =
    abs < 60
      ? `${Math.round(abs)}초`
      : abs < 3600
        ? `${Math.round(abs / 60)}분`
        : abs < 86400
          ? `${Math.round(abs / 3600)}시간`
          : abs < 86400 * 30
            ? `${Math.round(abs / 86400)}일`
            : abs < 31536000
              ? `약 ${Math.round(abs / 2592000)}개월`
              : `약 ${Math.round(abs / 31536000)}년`;
  return diff > 0 ? `${unit} 후` : `${unit} 전`;
}

const SNIPPETS = [
  { lang: "JavaScript", code: "Math.floor(Date.now() / 1000)  // 초\nDate.now()                     // 밀리초" },
  { lang: "Python", code: "import time\nint(time.time())               # 초\nint(time.time() * 1000)        # 밀리초" },
  { lang: "Java", code: "Instant.now().getEpochSecond()  // 초\nSystem.currentTimeMillis()      // 밀리초" },
  { lang: "MySQL", code: "SELECT UNIX_TIMESTAMP();\nSELECT FROM_UNIXTIME(1759400000);" },
  { lang: "PostgreSQL", code: "SELECT EXTRACT(EPOCH FROM now())::bigint;\nSELECT to_timestamp(1759400000);" },
];

function useCopy() {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = async (label: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      window.setTimeout(() => setCopied(null), 1400);
    } catch {
      /* 복사 권한이 없으면 아무것도 하지 않는다 */
    }
  };
  return { copied, copy };
}

function CopyButton({ label, text, copied, onCopy }: { label: string; text: string; copied: string | null; onCopy: (l: string, t: string) => void }) {
  const on = copied === label;
  return (
    <button
      type="button"
      onClick={() => onCopy(label, text)}
      aria-label={`${label} 복사`}
      className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md border border-border px-3 text-[14px] font-bold hover:bg-surface"
    >
      {on ? <Check size={15} aria-hidden /> : <Copy size={15} aria-hidden />}
      {on ? "복사했습니다" : "복사"}
    </button>
  );
}

function Row({ label, value, copyLabel, copied, onCopy }: { label: string; value: string; copyLabel?: string; copied: string | null; onCopy: (l: string, t: string) => void }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 px-4 py-2.5 sm:grid sm:grid-cols-[8rem_minmax(0,1fr)_auto]">
      <dt className="text-[15px] text-foreground-secondary">{label}</dt>
      <dd className="order-last w-full min-w-0 break-all font-mono text-[15px] sm:order-none sm:w-auto">{value}</dd>
      {copyLabel ? <CopyButton label={copyLabel} text={value} copied={copied} onCopy={onCopy} /> : <span className="hidden sm:block" />}
    </div>
  );
}

export function UnixTimeConverter() {
  const reduce = useReducedMotionSafe();
  const now = useSyncExternalStore(subscribeNow, getNow, () => 0);
  const { copied, copy } = useCopy();
  const [input, setInput] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("09:00:00");
  const [zone, setZone] = useState<"kst" | "utc">("kst");
  const [snippetsOpen, setSnippetsOpen] = useState(false);

  const parsed = parseTimestamp(input);

  // 날짜와 시각을 유닉스 시간으로
  let toTs: { ok: true; ms: number } | { ok: false; error: string } | null = null;
  if (date) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
    const tm = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(time || "00:00");
    if (!m || !tm) toTs = { ok: false, error: "날짜와 시각 형식을 확인해 주세요." };
    else {
      const utc = Date.UTC(+m[1], +m[2] - 1, +m[3], +tm[1], +tm[2], +(tm[3] ?? 0));
      toTs = Number.isNaN(utc) ? { ok: false, error: "없는 날짜입니다." } : { ok: true, ms: zone === "kst" ? utc - KST_OFFSET : utc };
    }
  }

  const nowSec = now ? String(Math.floor(now / 1000)) : "";
  const nowMs = now ? String(now) : "";
  const input_ = "h-12 w-full rounded-md border border-[#8a949e] bg-background px-3 text-[17px] focus:border-accent";

  return (
    <div className="mt-8 grid gap-8">
      <section aria-labelledby="ut-now" className="rounded-[10px] border border-border p-5">
        <h2 id="ut-now" className="text-[17px] font-bold">
          지금 유닉스 시간
        </h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          {[
            { label: "초", value: nowSec },
            { label: "밀리초", value: nowMs },
          ].map((v) => (
            <div key={v.label} className="flex items-center justify-between gap-3 rounded-md bg-surface px-4 py-3">
              <div className="min-w-0">
                <p className="text-[14px] text-foreground-secondary">{v.label}</p>
                <p className="break-all font-mono text-[24px] font-bold tabular-nums md:text-[28px]" aria-live="off">
                  {v.value || " "}
                </p>
              </div>
              <CopyButton label={`지금 ${v.label}`} text={v.value} copied={copied} onCopy={copy} />
            </div>
          ))}
        </div>
        <p className="mt-3 text-[15px] text-foreground-secondary">{now ? `한국 시간 ${formatKst(now).slice(0, -4)}` : " "}</p>
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <section aria-labelledby="ut-to-date" className="min-w-0">
          <h2 id="ut-to-date" className="border-b-2 border-foreground pb-2 text-[19px] font-bold">
            유닉스 시간을 날짜로
          </h2>
          <div className="mt-4 flex items-end justify-between gap-3">
            <label htmlFor="ut-input" className="text-[16px] font-bold">
              유닉스 시간
            </label>
            <div className="flex gap-3 text-[15px]">
              {now > 0 && (
                <button type="button" onClick={() => setInput(nowSec)} className="text-accent underline underline-offset-4">
                  지금 시각 넣기
                </button>
              )}
              {input && (
                <button type="button" onClick={() => setInput("")} className="text-foreground-secondary underline underline-offset-4">
                  지우기
                </button>
              )}
            </div>
          </div>
          <input
            id="ut-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            inputMode="numeric"
            autoComplete="off"
            spellCheck={false}
            placeholder="1759400000"
            className={`${input_} mt-1.5 font-mono`}
          />
          <p className="mt-2 text-[14px] leading-[1.6] text-foreground-secondary">자릿수로 단위를 알아서 고릅니다. 초 10자리, 밀리초 13자리, 마이크로초 16자리, 나노초 19자리.</p>

          <div className="mt-4" aria-live="polite">
            {parsed && !parsed.ok && (
              <p className="flex gap-2 rounded-md bg-[#fde7e9] px-4 py-3 text-[16px] leading-[1.6] text-[#b42318]">
                <CircleAlert size={18} className="mt-1 shrink-0" aria-hidden />
                {parsed.error}
              </p>
            )}
            {parsed?.ok && (
              <div className="rounded-[10px] border border-border">
                <p className="border-b border-border px-4 py-3 text-[16px]">
                  <b>{parsed.unit}</b> 단위로 읽었습니다{now ? <span className="text-foreground-secondary">, {relative(parsed.ms, now)}</span> : null}
                </p>
                <dl className="divide-y divide-border">
                  <Row label="한국 시간" value={formatKst(parsed.ms)} copyLabel="한국 시간" copied={copied} onCopy={copy} />
                  <Row label="UTC" value={formatUtc(parsed.ms)} copyLabel="UTC" copied={copied} onCopy={copy} />
                  <Row label="ISO 8601" value={new Date(parsed.ms).toISOString()} copyLabel="ISO 8601" copied={copied} onCopy={copy} />
                  <Row label="ISO (한국)" value={formatIsoKst(parsed.ms)} copyLabel="ISO 한국" copied={copied} onCopy={copy} />
                  <Row label="RFC 2822" value={new Date(parsed.ms).toUTCString()} copied={copied} onCopy={copy} />
                </dl>
              </div>
            )}
          </div>
        </section>

        <section aria-labelledby="ut-to-ts" className="min-w-0">
          <h2 id="ut-to-ts" className="border-b-2 border-foreground pb-2 text-[19px] font-bold">
            날짜를 유닉스 시간으로
          </h2>
          <fieldset className="mt-4">
            <legend className="text-[16px] font-bold">기준 시간대</legend>
            <div className="mt-1.5 flex gap-2">
              {(
                [
                  ["kst", "한국 시간 (UTC+9)"],
                  ["utc", "UTC"],
                ] as const
              ).map(([v, label]) => (
                <label
                  key={v}
                  className={`inline-flex h-10 cursor-pointer items-center rounded-md border px-4 text-[15px] font-bold transition-colors ${zone === v ? "border-accent bg-accent-surface text-accent" : "border-border hover:bg-surface"}`}
                >
                  <input type="radio" name="ut-zone" checked={zone === v} onChange={() => setZone(v)} className="sr-only" />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <label className="block text-[16px] font-bold">
              날짜
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={`${input_} mt-1.5`} />
            </label>
            <label className="block text-[16px] font-bold">
              시각
              <input type="time" step={1} value={time} onChange={(e) => setTime(e.target.value)} className={`${input_} mt-1.5`} />
            </label>
          </div>

          <div className="mt-4" aria-live="polite">
            {!toTs && <p className="rounded-md border border-dashed border-border px-4 py-6 text-center text-[16px] text-foreground-secondary">날짜를 고르면 유닉스 시간을 보여 드립니다.</p>}
            {toTs && !toTs.ok && (
              <p className="flex gap-2 rounded-md bg-[#fde7e9] px-4 py-3 text-[16px] leading-[1.6] text-[#b42318]">
                <CircleAlert size={18} className="mt-1 shrink-0" aria-hidden />
                {toTs.error}
              </p>
            )}
            {toTs?.ok && (
              <dl className="divide-y divide-border rounded-[10px] border border-border">
                <Row label="초" value={String(Math.floor(toTs.ms / 1000))} copyLabel="변환 초" copied={copied} onCopy={copy} />
                <Row label="밀리초" value={String(toTs.ms)} copyLabel="변환 밀리초" copied={copied} onCopy={copy} />
                <Row label={zone === "kst" ? "UTC로는" : "한국 시간으로는"} value={zone === "kst" ? formatUtc(toTs.ms) : formatKst(toTs.ms)} copied={copied} onCopy={copy} />
              </dl>
            )}
          </div>
        </section>
      </div>

      <section className="rounded-[10px] border border-border">
        <button
          type="button"
          onClick={() => setSnippetsOpen((v) => !v)}
          aria-expanded={snippetsOpen}
          aria-controls="ut-snippets"
          className="flex w-full items-center justify-between gap-2 p-4 text-left text-[17px] font-bold"
        >
          언어별로 현재 시각 구하기
          <motion.span animate={{ rotate: snippetsOpen ? 180 : 0 }} transition={{ duration: reduce ? 0 : 0.2, ease: EASE }} className="inline-flex">
            <ChevronDown size={18} aria-hidden />
          </motion.span>
        </button>
        <AnimatePresence initial={false}>
          {snippetsOpen && (
            <motion.div
              id="ut-snippets"
              initial={reduce ? { opacity: 0 } : { height: 0 }}
              animate={reduce ? { opacity: 1 } : { height: "auto" }}
              exit={reduce ? { opacity: 0 } : { height: 0 }}
              transition={{ duration: 0.22, ease: EASE }}
              className="overflow-hidden"
            >
              <div className="grid gap-4 border-t border-border p-4 md:grid-cols-2">
                {SNIPPETS.map((s) => (
                  <div key={s.lang} className="min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-[15px] font-bold">{s.lang}</h3>
                      <CopyButton label={s.lang} text={s.code} copied={copied} onCopy={copy} />
                    </div>
                    <pre className="mt-2 overflow-x-auto rounded-md bg-surface p-3 text-[13px] leading-[1.6]">
                      <code>{s.code}</code>
                    </pre>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}
