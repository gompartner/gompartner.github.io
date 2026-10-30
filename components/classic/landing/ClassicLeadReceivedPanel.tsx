"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { BellRing, Sheet } from "lucide-react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";

/*
  클래식 보기 광고 랜딩 소개용: 신청이 끝난 뒤 사장님 쪽에서 보이는 화면.
  components/demos/LeadReceivedPanel을 옮겨 와 클래식 색(흰 바탕, 얇은 회색 선, 파랑 하나)으로 바꿨다.
  1. 휴대폰 알림 + 30분 뒤 다시 알림  2. 상담 상태 칸이 있는 시트(칩을 눌러 상태 변경, 중복 번호 표시)
  3. 이번 주 광고별 신청과 그중 계약 수
  실제로 보내지 않는다. 유입 경로는 주소의 utm_source를 읽고, 없으면 네이버 검색광고로 둔다.
*/

const INK = "#15171c";
const MUTED = "#5b6370";
const LINE = "#e6e9ee";
const BLUE = "#256ef4";
const BLUE_SOFT = "#eaf1fe";
const PAPER = "#f6f7f9";

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

/** 이름 가운데 글자를 초성으로 가린다. 김하늘 -> 김ㅎ늘, 이준 -> 이ㅈ */
export function maskName(raw: string) {
  const s = raw.trim();
  if (s.length < 2) return s;
  const cho = (ch: string) => {
    const c = ch.charCodeAt(0) - 0xac00;
    if (c < 0 || c > 11171) return "*";
    return "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ"[Math.floor(c / 588)];
  };
  if (s.length === 2) return s[0] + cho(s[1]);
  return s[0] + [...s.slice(1, -1)].map(cho).join("") + s[s.length - 1];
}

/** 휴대폰 번호 뒷자리를 가린다. 010-1234-5678 -> 010-1234-**** */
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

export function ClassicLeadReceivedPanel({
  business,
  name,
  phone,
  summary,
  lines,
  pastRows,
}: {
  /** 알림 머리에 붙는 상호. "곰파트너" */
  business: string;
  name: string;
  phone: string;
  /** 시트 '신청 내용' 칸에 들어갈 한 줄 */
  summary: string;
  /** 알림 본문에 줄마다 보여 줄 신청 내용 */
  lines: [string, string][];
  /** 시트에 미리 쌓여 있는 가상 행. 위가 최근이다. */
  pastRows: LeadRow[];
}) {
  const reduce = useReducedMotionSafe();
  // 브라우저에서만 그려지므로(ClassicOwnerPreview) 바로 읽어도 하이드레이션과 어긋나지 않는다.
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
      ? { background: BLUE, color: "#fff", borderColor: BLUE }
      : st === "통화함"
        ? { background: BLUE_SOFT, color: "#1d5fd6", borderColor: BLUE }
        : st === "보류"
          ? { background: "#fff", color: MUTED, borderColor: "#c9cfd8" }
          : { background: "#fff", color: INK, borderColor: INK };

  const block = "min-w-0 border-t-2 border-[#15171c] pt-5";
  const head = "flex items-center gap-2 text-[17px] font-extrabold tracking-[-0.02em]";
  const td = "border-b border-[#e6e9ee] px-3 py-2.5";

  return (
    <div aria-label="신청 접수 화면" role="group" className="grid gap-10 text-left text-[#15171c] lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:gap-x-12">
      {/* 1. 휴대폰 알림 */}
      <div className={block}>
        <p className={head}>
          <BellRing size={19} aria-hidden className="text-[#256ef4]" /> 휴대폰 알림
        </p>
        <div className="mt-4 rounded-lg border border-[#e6e9ee] bg-white p-4 text-[15px] leading-[1.6]">
          <p className="font-bold">[{business}] 새 신청 1건</p>
          <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5">
            <dt style={{ color: MUTED }}>이름</dt>
            <dd>{rows[0].name}</dd>
            <dt style={{ color: MUTED }}>번호</dt>
            <dd className="tabular-nums">{maskPhone(phone)}</dd>
            {lines.map(([k, v]) => (
              <div key={k} className="contents">
                <dt style={{ color: MUTED }}>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
            <dt style={{ color: MUTED }}>경로</dt>
            <dd>{source}</dd>
          </dl>
          <p className="mt-2 text-right text-[13px] tabular-nums" style={{ color: MUTED }}>
            {at}
          </p>
        </div>
        <p className="mt-5 text-[14px] font-bold" style={{ color: MUTED }}>
          30분 미처리 재알림
        </p>
        <div className="mt-2 rounded-lg px-4 py-3 text-[15px] leading-[1.6]" style={{ background: PAPER }} aria-live="polite">
          {waiting > 0 ? (
            <>
              [{business}] 아직 통화 전인 신청 <b>{waiting}건</b>이 있습니다.
            </>
          ) : (
            <>미처리 신청 없음</>
          )}
        </div>
      </div>

      <div className="grid min-w-0 gap-10">
        {/* 2. 구글 시트 */}
        <div className={block}>
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <p className={head}>
              <Sheet size={19} aria-hidden className="text-[#256ef4]" /> 구글 시트
            </p>
            <p className="text-[14px]" style={{ color: MUTED }}>
              상태 칸을 눌러 변경할 수 있습니다
            </p>
          </div>
          <div className="mt-4 overflow-x-auto border-t border-[#e6e9ee]">
            <table className="w-full min-w-[640px] border-collapse text-left text-[14px]">
              <thead>
                <tr style={{ background: PAPER, color: "#3d4450" }}>
                  {["접수 시각", "이름", "상담 상태", "연락처", "신청 내용", "유입 경로"].map((h) => (
                    <th key={h} scope="col" className={`${td} font-bold`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => {
                  const cells = (
                    <>
                      <td className={`${td} tabular-nums ${i === 0 ? "font-bold" : ""}`} style={{ color: i === 0 ? INK : MUTED }}>
                        {r.at}
                      </td>
                      <td className={`${td} ${i === 0 ? "font-bold" : ""}`}>{r.name}</td>
                      <td className={td}>
                        <button
                          type="button"
                          onClick={() => cycle(i)}
                          aria-label={`${r.name} 상담 상태 ${statuses[i]} 변경`}
                          className="min-w-[64px] rounded-full border px-2.5 py-0.5 text-[13px] font-bold"
                          style={chip(statuses[i])}
                        >
                          {statuses[i]}
                        </button>
                      </td>
                      <td className={`${td} tabular-nums`}>
                        {maskPhone(r.digits)}
                        {dup[i] && <span className="ml-1.5 rounded-[4px] border border-[#15171c] px-1 text-[12px] font-bold">중복</span>}
                      </td>
                      <td className={td}>{r.summary}</td>
                      <td className={td}>{r.source}</td>
                    </>
                  );
                  return i === 0 ? (
                    <motion.tr
                      key="new"
                      initial={reduce ? false : { opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: 0.25 }}
                      style={{ background: BLUE_SOFT }}
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
        </div>

        {/* 3. 광고별 신청과 계약 */}
        <div className={block}>
          <p className={head}>광고별 신청·계약 (이번 주)</p>
          <ul className="mt-4 grid gap-3.5">
            {bars.map(({ s, mine, n, won }) => (
              <li key={s} className="text-[14px]">
                <div className="flex items-baseline justify-between gap-3">
                  <span className={mine ? "font-bold" : ""} style={{ color: mine ? INK : MUTED }}>
                    {s}
                  </span>
                  <span className="tabular-nums">
                    신청 <b>{n}</b>, 계약 <b style={{ color: BLUE }}>{won}</b>
                  </span>
                </div>
                <div className="mt-1 grid gap-0.5" aria-hidden>
                  <span className="h-2.5 rounded-[2px]" style={{ width: `${(n / max) * 100}%`, background: mine ? INK : LINE }} />
                  <span className="h-2.5 rounded-[2px]" style={{ width: `${(won / max) * 100}%`, minWidth: won ? 4 : 0, background: BLUE }} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
