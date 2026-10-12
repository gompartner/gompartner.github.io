"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { BellRing, Sheet } from "lucide-react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";

/*
  광고 신청 접수 랜딩 데모 공용: 신청이 끝난 뒤 사장님 쪽에서 보이는 화면.
  시트 저장과 메일 알림은 어디서나 해 주니, 접수 다음 단계(통화했는지, 계약했는지)를 보여 준다.
  1. 휴대폰 알림 + 30분 뒤 다시 알림  2. 상담 상태 칸이 있는 시트(칩을 눌러 상태 변경, 중복 번호 표시)
  3. 이번 주 광고별 신청과 그중 계약 수
  실제로 보내지 않는다. 유입 경로는 주소의 utm_source를 읽고, 없으면 네이버 검색광고로 둔다.
*/

export interface LeadTheme {
  accent: string;
  accentSoft: string;
  ink: string;
  muted: string;
  line: string;
  paper: string;
}

export const LEAD_STATUSES = ["통화 전", "통화함", "계약", "보류"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export interface LeadRow {
  at: string;
  /** 가린 이름. 김ㅎ늘 */
  name: string;
  /** 숫자만 적은 번호. 화면에는 가려서 보여 주고, 중복 확인에만 쓴다. */
  digits: string;
  summary: string;
  source: string;
  status: LeadStatus;
}

const SOURCES = ["네이버 검색광고", "메타 광고", "블로그", "직접 방문"] as const;
/** 이번 주 가상 수치: [신청, 그중 계약] */
const BASE: Record<string, [number, number]> = {
  "네이버 검색광고": [14, 4],
  "메타 광고": [9, 1],
  블로그: [5, 2],
  "직접 방문": [3, 1],
};

/** 이름 가운데 글자를 초성으로 가린다. 김하늘 → 김ㅎ늘, 이준 → 이ㅈ */
export function maskName(raw: string) {
  const s = raw.trim();
  if (s.length < 2) return s;
  const cho = (ch: string) => {
    const c = ch.charCodeAt(0) - 0xac00;
    if (c < 0 || c > 11171) return "○";
    return "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ"[Math.floor(c / 588)];
  };
  if (s.length === 2) return s[0] + cho(s[1]);
  return s[0] + [...s.slice(1, -1)].map(cho).join("") + s[s.length - 1];
}

/** 휴대폰 번호 뒷자리를 가린다. 010-1234-5678 → 010-1234-**** */
export function maskPhone(raw: string) {
  const d = raw.replace(/\D/g, "");
  if (d.length < 10) return raw;
  const mid = d.length === 11 ? d.slice(3, 7) : d.slice(3, 6);
  return `${d.slice(0, 3)}-${mid}-****`;
}

function sourceFromUrl() {
  if (typeof window === "undefined") return SOURCES[0];
  const v = new URLSearchParams(window.location.search).get("utm_source")?.toLowerCase() ?? "";
  if (!v) return SOURCES[0];
  if (v.includes("naver")) return SOURCES[0];
  if (["meta", "facebook", "fb", "instagram", "ig"].some((k) => v.includes(k))) return SOURCES[1];
  if (v.includes("blog")) return SOURCES[2];
  if (v.includes("direct")) return SOURCES[3];
  return v;
}

const two = (n: number) => String(n).padStart(2, "0");

export function LeadReceivedPanel({
  business,
  name,
  phone,
  summary,
  lines,
  pastRows,
  theme,
}: {
  /** 알림 머리에 붙는 상호. "곰파트너 클린" */
  business: string;
  name: string;
  phone: string;
  /** 시트 '신청 내용' 칸에 들어갈 한 줄 */
  summary: string;
  /** 알림 본문에 줄마다 보여 줄 신청 내용 */
  lines: [string, string][];
  /** 시트에 미리 쌓여 있는 가상 행. 위가 최근이다. */
  pastRows: LeadRow[];
  theme: LeadTheme;
}) {
  const reduce = useReducedMotionSafe();
  // 신청 완료 뒤에만 그려지므로 브라우저에서 바로 읽어도 하이드레이션과 어긋나지 않는다.
  const [source] = useState(sourceFromUrl);
  const [now] = useState(() => new Date());
  const at = `${two(now.getMonth() + 1)}.${two(now.getDate())} ${two(now.getHours())}:${two(now.getMinutes())}`;
  const digits = phone.replace(/\D/g, "");

  const rows: LeadRow[] = [{ at, name: maskName(name), digits, summary, source, status: "통화 전" }, ...pastRows];
  const [statuses, setStatuses] = useState<LeadStatus[]>(() => rows.map((r) => r.status));
  const cycle = (i: number) =>
    setStatuses((s) => s.map((v, j) => (j === i ? LEAD_STATUSES[(LEAD_STATUSES.indexOf(v) + 1) % LEAD_STATUSES.length] : v)));

  // 아래쪽(더 먼저 들어온) 행에 같은 번호가 있으면 중복으로 본다.
  const dup = rows.map((r, i) => rows.slice(i + 1).some((o) => o.digits === r.digits));
  const waiting = statuses.filter((s) => s === "통화 전").length;

  const known = (SOURCES as readonly string[]).includes(source);
  const names = known ? [...SOURCES] : [...SOURCES, source];
  const bars = names.map((s) => {
    const [n, won] = BASE[s] ?? [0, 0];
    const mine = s === source;
    return { s, mine, n: n + (mine ? 1 : 0), won: won + (mine && statuses[0] === "계약" ? 1 : 0) };
  });
  const max = Math.max(...bars.map((b) => b.n));

  const chip = (st: LeadStatus) =>
    st === "계약"
      ? { background: theme.accent, color: "#fff", borderColor: theme.accent }
      : st === "통화함"
        ? { background: theme.accentSoft, color: theme.ink, borderColor: theme.ink }
        : st === "보류"
          ? { background: "#fff", color: theme.muted, borderColor: theme.line }
          : { background: "#fff", color: theme.ink, borderColor: theme.ink };

  const card = "rounded-[12px] border-2 p-4 md:p-5";
  const head = "flex items-center gap-2 text-[15px] font-bold";
  const td = "border-b px-3 py-2";

  return (
    <section aria-labelledby="lead-panel-title" className="mt-8 border-t-2 pt-6 text-left" style={{ borderColor: theme.line, color: theme.ink }}>
      <h3 id="lead-panel-title" className="text-[20px] font-extrabold">
        사장님 쪽에서는 이렇게 보입니다
      </h3>
      <p className="mt-1.5 text-[15px] leading-[1.6]" style={{ color: theme.muted }}>
        시트에 쌓이고 끝나지 않습니다. 통화했는지, 계약했는지까지 한 칸에 적고, 연락을 놓친 신청은 다시 알려 드립니다.
      </p>

      <div className="mt-5 grid gap-4">
        {/* 1. 휴대폰 알림 */}
        <div className={card} style={{ borderColor: theme.ink, background: theme.paper }}>
          <p className={head}>
            <BellRing size={18} aria-hidden /> 휴대폰 알림
          </p>
          <div className="mt-3 max-w-[340px] rounded-[14px] border bg-white p-4 text-[15px] leading-[1.6]" style={{ borderColor: theme.line }}>
            <p className="font-bold">[{business}] 새 신청 1건</p>
            <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5">
              <dt style={{ color: theme.muted }}>이름</dt>
              <dd>{rows[0].name}</dd>
              <dt style={{ color: theme.muted }}>번호</dt>
              <dd className="tabular-nums">{maskPhone(phone)}</dd>
              {lines.map(([k, v]) => (
                <div key={k} className="contents">
                  <dt style={{ color: theme.muted }}>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
              <dt style={{ color: theme.muted }}>경로</dt>
              <dd>{source}</dd>
            </dl>
            <p className="mt-2 text-right text-[13px] tabular-nums" style={{ color: theme.muted }}>
              {at}
            </p>
          </div>
          <p className="mt-4 text-[13px] font-bold" style={{ color: theme.muted }}>
            30분 동안 상태가 안 바뀌면 다시 알림
          </p>
          <div className="mt-1.5 max-w-[340px] rounded-[14px] px-4 py-3 text-[15px] leading-[1.6]" style={{ background: "#ececea", color: theme.ink }} aria-live="polite">
            {waiting > 0 ? (
              <>
                [{business}] 아직 통화 전인 신청 <b>{waiting}건</b>이 있습니다.
              </>
            ) : (
              <>통화 전인 신청이 없어 다시 알리지 않습니다.</>
            )}
          </div>
        </div>

        {/* 2. 구글 시트 */}
        <div className={`${card} min-w-0`} style={{ borderColor: theme.ink, background: "#fff" }}>
          <p className={head}>
            <Sheet size={18} aria-hidden /> 구글 시트
          </p>
          <p className="mt-1 text-[14px]" style={{ color: theme.muted }}>
            상담 상태를 누르면 통화 전, 통화함, 계약, 보류 순서로 바뀝니다. 표는 옆으로 밀어 볼 수 있습니다.
          </p>
          <div className="mt-3 overflow-x-auto rounded-[6px] border" style={{ borderColor: theme.line }}>
            <table className="w-full min-w-[640px] border-collapse text-left text-[14px]">
              <thead>
                <tr style={{ background: theme.paper, color: theme.muted }}>
                  {["접수 시각", "이름", "상담 상태", "연락처", "신청 내용", "유입 경로"].map((h) => (
                    <th key={h} scope="col" className={`${td} font-bold`} style={{ borderColor: theme.line }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => {
                  const cells = (
                    <>
                      <td className={`${td} tabular-nums ${i === 0 ? "font-bold" : ""}`} style={{ borderColor: theme.line, color: i === 0 ? theme.ink : theme.muted }}>
                        {r.at}
                      </td>
                      <td className={`${td} ${i === 0 ? "font-bold" : ""}`} style={{ borderColor: theme.line }}>
                        {r.name}
                      </td>
                      <td className={td} style={{ borderColor: theme.line }}>
                        <button
                          type="button"
                          onClick={() => cycle(i)}
                          aria-label={`${r.name} 상담 상태 ${statuses[i]}, 눌러서 바꾸기`}
                          className="min-w-[64px] rounded-full border px-2.5 py-0.5 text-[13px] font-bold"
                          style={chip(statuses[i])}
                        >
                          {statuses[i]}
                        </button>
                      </td>
                      <td className={`${td} tabular-nums`} style={{ borderColor: theme.line }}>
                        {maskPhone(r.digits)}
                        {dup[i] && (
                          <span className="ml-1.5 rounded-[4px] border px-1 text-[12px] font-bold" style={{ borderColor: theme.ink }}>
                            중복
                          </span>
                        )}
                      </td>
                      <td className={td} style={{ borderColor: theme.line }}>
                        {r.summary}
                      </td>
                      <td className={td} style={{ borderColor: theme.line }}>
                        {r.source}
                      </td>
                    </>
                  );
                  return i === 0 ? (
                    <motion.tr
                      key="new"
                      initial={reduce ? false : { opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: 0.25 }}
                      style={{ background: theme.accentSoft }}
                    >
                      {cells}
                    </motion.tr>
                  ) : (
                    <tr key={r.at + r.name}>{cells}</tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-[13px]" style={{ color: theme.muted }}>
            같은 번호로 다시 들어온 신청에는 중복 표시가 붙습니다. 광고비가 두 번 나간 건 아닌지 바로 보입니다.
          </p>
        </div>

        {/* 3. 광고별 신청과 계약 */}
        <div className={card} style={{ borderColor: theme.ink, background: "#fff" }}>
          <p className="text-[15px] font-bold">이번 주 광고별 신청과 계약</p>
          <ul className="mt-3 grid gap-3">
            {bars.map(({ s, mine, n, won }) => (
              <li key={s} className="text-[14px]">
                <div className="flex items-baseline justify-between gap-3">
                  <span className={mine ? "font-bold" : ""} style={{ color: mine ? theme.ink : theme.muted }}>
                    {s}
                  </span>
                  <span className="tabular-nums">
                    신청 <b>{n}</b> · 계약 <b style={{ color: theme.accent }}>{won}</b>
                  </span>
                </div>
                <div className="mt-1 grid gap-0.5" aria-hidden>
                  <span className="h-2.5 rounded-[2px]" style={{ width: `${(n / max) * 100}%`, background: mine ? theme.ink : theme.line }} />
                  <span className="h-2.5 rounded-[2px]" style={{ width: `${(won / max) * 100}%`, minWidth: won ? 4 : 0, background: theme.accent }} />
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[14px] leading-[1.6]" style={{ color: theme.muted }}>
            신청이 많은 광고와 계약이 많은 광고는 다를 때가 많습니다. 광고비는 아래 막대를 보고 옮기면 됩니다.
          </p>
        </div>
      </div>

      <p className="mt-3 text-[13px]" style={{ color: theme.muted }}>
        샘플이라 알림과 시트 저장은 실제로 일어나지 않습니다.
      </p>
    </section>
  );
}
