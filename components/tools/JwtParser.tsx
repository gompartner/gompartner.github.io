"use client";

import { useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, CircleAlert, Copy, ShieldCheck, ShieldX } from "lucide-react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";

/* JWT 파서.
   토큰을 붙여 넣으면 헤더, 페이로드, 서명 세 부분을 색으로 나누고, 표준 클레임을 한국어 이름과 한국 시간으로 풀어 보여 준다.
   HS256/384/512 토큰은 비밀 키를 넣으면 브라우저의 Web Crypto로 서명을 확인한다. 토큰과 키는 서버로 보내지 않는다. */

const EASE = [0.23, 1, 0.32, 1] as const;

// 예시 토큰: 비밀 키 "your-256-bit-secret", 만료 2099년
const SAMPLE =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEwMjQiLCJuYW1lIjoi6rmA44WO64qYIiwicm9sZSI6ImFkbWluIiwiaXNzIjoiaHR0cHM6Ly9hcGkuZXhhbXBsZS5jby5rciIsImlhdCI6MTc1OTQwMDAwMCwiZXhwIjo0MDcwOTA4ODAwfQ.K8p9cx1tVgapr1AcxTBOQj29ogN4puP9hqKu14EuyM4";

const COLORS = { header: "#c2410c", payload: "#7c3aed", signature: "#0369a1" };

const CLAIMS: Record<string, string> = {
  iss: "발급자",
  sub: "사용자 식별자",
  aud: "사용 대상",
  exp: "만료 시각",
  nbf: "사용 시작 시각",
  iat: "발급 시각",
  jti: "토큰 ID",
  alg: "서명 알고리즘",
  typ: "토큰 종류",
  kid: "키 ID",
};
const TIME_CLAIMS = ["exp", "nbf", "iat"];
const HMAC: Record<string, string> = { HS256: "SHA-256", HS384: "SHA-384", HS512: "SHA-512" };

function b64urlToBytes(s: string) {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(s.length / 4) * 4, "=");
  const bin = atob(b64);
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

function decodePart(s: string): Record<string, unknown> {
  const json = new TextDecoder().decode(b64urlToBytes(s));
  const v = JSON.parse(json);
  if (typeof v !== "object" || v === null || Array.isArray(v)) throw new Error("not object");
  return v;
}

type Parsed =
  | { ok: true; parts: string[]; header: Record<string, unknown>; payload: Record<string, unknown> }
  | { ok: false; error: string };

function parse(token: string): Parsed | null {
  const t = token.trim().replace(/^Bearer\s+/i, "");
  if (!t) return null;
  const parts = t.split(".");
  if (parts.length !== 3) return { ok: false, error: `점(.)으로 나뉜 부분이 ${parts.length}개입니다. JWT는 헤더.페이로드.서명 3부분입니다.` };
  let header, payload;
  try {
    header = decodePart(parts[0]);
  } catch {
    return { ok: false, error: "헤더를 읽을 수 없습니다. Base64URL로 인코딩된 JSON인지 확인하세요." };
  }
  try {
    payload = decodePart(parts[1]);
  } catch {
    return { ok: false, error: "페이로드를 읽을 수 없습니다. 암호화된 JWE 토큰이거나 일부가 잘렸을 수 있습니다." };
  }
  return { ok: true, parts, header, payload };
}

function formatKst(sec: number) {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date(sec * 1000));
}

function relative(sec: number, now: number) {
  const diff = sec - now;
  const abs = Math.abs(diff);
  const unit = abs < 60 ? `${Math.round(abs)}초` : abs < 3600 ? `${Math.round(abs / 60)}분` : abs < 86400 ? `${Math.round(abs / 3600)}시간` : abs < 31536000 ? `${Math.round(abs / 86400)}일` : `약 ${Math.round(abs / 31536000)}년`;
  return diff >= 0 ? `${unit} 후` : `${unit} 전`;
}

// 분 단위로 내린 현재 시각(초). 서버 렌더에서는 0
function subscribeNow(cb: () => void) {
  const id = window.setInterval(cb, 30_000);
  return () => window.clearInterval(id);
}
const getNow = () => Math.floor(Date.now() / 60_000) * 60;

async function verifyHmac(parts: string[], hash: string, secret: string) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash }, false, ["verify"]);
  return crypto.subtle.verify("HMAC", key, b64urlToBytes(parts[2]), enc.encode(`${parts[0]}.${parts[1]}`));
}

export function JwtParser() {
  const reduce = useReducedMotionSafe();
  const [token, setToken] = useState("");
  const [secret, setSecret] = useState("");
  const [verified, setVerified] = useState<{ key: string; ok: boolean } | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const now = useSyncExternalStore(subscribeNow, getNow, () => 0);

  const parsed = parse(token);
  const alg = parsed?.ok ? String(parsed.header.alg ?? "") : "";
  const hash = HMAC[alg];
  const verifyKey = `${token}\n${secret}`;
  const verifyResult = verified && verified.key === verifyKey ? verified.ok : null;

  const exp = parsed?.ok && typeof parsed.payload.exp === "number" ? parsed.payload.exp : null;
  const nbf = parsed?.ok && typeof parsed.payload.nbf === "number" ? parsed.payload.nbf : null;
  const status =
    !parsed?.ok || !now
      ? null
      : exp !== null && exp < now
        ? { ok: false, text: `만료된 토큰입니다 (${relative(exp, now)} 만료)` }
        : nbf !== null && nbf > now
          ? { ok: false, text: `아직 쓸 수 없는 토큰입니다 (${relative(nbf, now)}부터)` }
          : exp !== null
            ? { ok: true, text: `유효 기간 안입니다 (${relative(exp, now)} 만료)` }
            : { ok: true, text: "만료 시각(exp)이 없는 토큰입니다" };

  const verify = async () => {
    if (!parsed?.ok || !hash) return;
    try {
      setVerified({ key: verifyKey, ok: await verifyHmac(parsed.parts, hash, secret) });
    } catch {
      setVerified({ key: verifyKey, ok: false });
    }
  };

  const copy = async (label: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      window.setTimeout(() => setCopied(null), 1400);
    } catch {
      /* 복사 권한이 없으면 아무것도 하지 않는다 */
    }
  };

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <div className="min-w-0">
        <div className="flex items-end justify-between gap-3">
          <label htmlFor="jwt-input" className="text-[19px] font-bold">
            토큰
          </label>
          <div className="flex gap-3 text-[15px]">
            <button type="button" onClick={() => setToken(SAMPLE)} className="text-accent underline underline-offset-4">
              예시 넣기
            </button>
            {token && (
              <button type="button" onClick={() => setToken("")} className="text-foreground-secondary underline underline-offset-4">
                지우기
              </button>
            )}
          </div>
        </div>
        {/* 입력칸 뒤에 같은 글자를 색으로 깔아 세 부분을 구분한다 */}
        <div className="relative mt-2 rounded-md border border-[#8a949e] focus-within:border-accent">
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden whitespace-pre-wrap break-all p-3 font-mono text-[14px] leading-[1.6]">
            {token.split(/(\.)/).map((seg, i) => {
              const idx = Math.floor(i / 2);
              const color = seg === "." ? "#1e2124" : idx === 0 ? COLORS.header : idx === 1 ? COLORS.payload : COLORS.signature;
              return (
                <span key={i} style={{ color }}>
                  {seg}
                </span>
              );
            })}
          </div>
          <textarea
            id="jwt-input"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            spellCheck={false}
            autoComplete="off"
            rows={9}
            placeholder="eyJhbGciOi..."
            className="relative block w-full resize-y break-all bg-transparent p-3 font-mono text-[14px] leading-[1.6] text-transparent caret-foreground outline-none placeholder:text-foreground-tertiary"
          />
        </div>
        <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[14px]">
          <span style={{ color: COLORS.header }}>■ 헤더</span>
          <span style={{ color: COLORS.payload }}>■ 페이로드</span>
          <span style={{ color: COLORS.signature }}>■ 서명</span>
        </p>
        <p className="mt-3 text-[15px] leading-[1.6] text-foreground-secondary">토큰과 비밀 키는 이 브라우저 안에서만 해석하고 어디로도 보내지 않습니다.</p>

        {parsed?.ok && hash && (
          <div className="mt-6 rounded-[10px] border border-border p-4">
            <label htmlFor="jwt-secret" className="text-[17px] font-bold">
              서명 확인 <span className="font-normal text-foreground-secondary">({alg})</span>
            </label>
            <div className="mt-2 flex gap-2">
              <input
                id="jwt-secret"
                type="text"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                autoComplete="off"
                spellCheck={false}
                placeholder="비밀 키"
                className="h-11 min-w-0 flex-1 rounded-md border border-[#8a949e] px-3 font-mono text-[15px] focus:border-accent"
              />
              <button type="button" onClick={verify} disabled={!secret} className="h-11 shrink-0 rounded-md bg-accent px-4 text-[15px] font-bold text-accent-foreground hover:bg-accent-hover disabled:opacity-40">
                확인
              </button>
            </div>
            <AnimatePresence mode="wait">
              {verifyResult !== null && (
                <motion.p
                  key={String(verifyResult)}
                  initial={reduce ? { opacity: 0 } : { opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18, ease: EASE }}
                  className={`mt-3 flex items-center gap-2 text-[16px] font-bold ${verifyResult ? "text-[#228738]" : "text-[#b42318]"}`}
                  role="status"
                >
                  {verifyResult ? <ShieldCheck size={18} aria-hidden /> : <ShieldX size={18} aria-hidden />}
                  {verifyResult ? "서명이 맞습니다" : "서명이 맞지 않습니다"}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        )}
        {parsed?.ok && !hash && alg && alg !== "none" && (
          <p className="mt-6 text-[15px] leading-[1.6] text-foreground-secondary">{alg} 토큰은 공개 키로 검증합니다. 이 도구는 HS256, HS384, HS512 서명만 확인합니다.</p>
        )}
      </div>

      <div className="min-w-0" aria-live="polite">
        {!parsed && (
          <div className="flex h-full min-h-[240px] items-center justify-center rounded-[10px] border border-dashed border-border p-6 text-center text-[17px] text-foreground-secondary">
            토큰을 붙여 넣으면 내용을 풀어 보여 드립니다.
          </div>
        )}
        {parsed && !parsed.ok && (
          <p className="flex gap-2 rounded-md bg-[#fde7e9] px-4 py-3 text-[16px] leading-[1.6] text-[#b42318]">
            <CircleAlert size={18} className="mt-1 shrink-0" aria-hidden />
            {parsed.error}
          </p>
        )}
        {parsed?.ok && (
          <>
            {status && (
              <p className={`flex items-center gap-2 rounded-md px-4 py-3 text-[16px] font-bold ${status.ok ? "bg-[#e8f5eb] text-[#1b6b2d]" : "bg-[#fde7e9] text-[#b42318]"}`}>
                {status.ok ? <Check size={18} aria-hidden /> : <CircleAlert size={18} aria-hidden />}
                {status.text}
              </p>
            )}
            {(["header", "payload"] as const).map((part) => {
              const obj = parsed[part];
              const json = JSON.stringify(obj, null, 2);
              return (
                <section key={part} className="mt-5 rounded-[10px] border border-border" aria-labelledby={`jwt-${part}`}>
                  <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3" style={{ borderTop: `3px solid ${COLORS[part]}`, borderTopLeftRadius: 10, borderTopRightRadius: 10 }}>
                    <h2 id={`jwt-${part}`} className="text-[17px] font-bold" style={{ color: COLORS[part] }}>
                      {part === "header" ? "헤더" : "페이로드"}
                    </h2>
                    <button type="button" onClick={() => copy(part, json)} className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border px-3 text-[14px] font-bold hover:bg-surface">
                      {copied === part ? <Check size={15} aria-hidden /> : <Copy size={15} aria-hidden />}
                      {copied === part ? "복사했습니다" : "JSON 복사"}
                    </button>
                  </div>
                  <dl className="divide-y divide-border">
                    {Object.entries(obj).map(([k, v]) => (
                      <div key={k} className="grid gap-1 px-4 py-2.5 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-3">
                        <dt className="text-[15px]">
                          <code className="font-bold">{k}</code>
                          {CLAIMS[k] && <span className="ml-1.5 text-foreground-secondary">{CLAIMS[k]}</span>}
                        </dt>
                        <dd className="min-w-0 break-all font-mono text-[14px] leading-[1.6]">
                          {typeof v === "string" ? v : JSON.stringify(v)}
                          {TIME_CLAIMS.includes(k) && typeof v === "number" && (
                            <span className="block font-sans text-[15px] text-foreground-secondary">
                              {formatKst(v)} (한국 시간){now ? `, ${relative(v, now)}` : ""}
                            </span>
                          )}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </section>
              );
            })}
            <section className="mt-5 rounded-[10px] border border-border px-4 py-3" style={{ borderTop: `3px solid ${COLORS.signature}` }}>
              <h2 className="text-[17px] font-bold" style={{ color: COLORS.signature }}>
                서명
              </h2>
              <p className="mt-1 break-all font-mono text-[14px] leading-[1.6] text-foreground-secondary">{parsed.parts[2] || "(서명 없음)"}</p>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
