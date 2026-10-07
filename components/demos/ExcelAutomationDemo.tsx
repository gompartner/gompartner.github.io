"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Download, Printer, Upload, Wand2 } from "lucide-react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { daysAgo, useDemoToday } from "@/hooks/useDemoToday";

/* 거래처 주문 엑셀 취합·검사·발주서 자동화 데모.
   거래처마다 양식이 다른 주문 파일을 올리면 열을 자동으로 맞추고, 엑셀처럼 생긴 격자에서 오류를 표시한다.
   고칠 수 있는 오류(단가 불일치, 품목코드 오타, 중복 주문, 수량 표기)는 "모두 고침"으로 한 번에 바로잡고,
   품목별 집계와 거래처별 발주서를 만든다. 파일은 브라우저 안에서만 읽고 어디에도 보내지 않는다.
   상호·품목·단가는 모두 가상 데이터다.

   색 (흰 바탕 대비): 본문 #1b1b1b, 보조 #505050(8:1), 조작 #107c41(5.3:1, 버튼은 흰 글자),
   오류 #c42b1c 바탕 #fde7e9, 자동 수정 가능 #8a5300 바탕 #fff4ce, 고친 칸 바탕 #dff6dd */

const C = {
  bg: "#f3f3f3",
  panel: "#ffffff",
  grid: "#d4d4d4",
  head: "#f0f0f0",
  text: "#1b1b1b",
  muted: "#505050",
  action: "#107c41",
  actionSoft: "#e6f4ea",
  error: "#c42b1c",
  errorSoft: "#fde7e9",
  fixable: "#8a5300",
  fixableSoft: "#fff4ce",
  fixed: "#dff6dd",
} as const;

const EASE = [0.23, 1, 0.32, 1] as const;

// 품목 기준표: 코드, 품목명, 기준 단가
const MASTER: Record<string, { name: string; price: number }> = {
  "P-101": { name: "호텔식 세안 타월", price: 3500 },
  "P-102": { name: "호텔식 바스 타월", price: 12000 },
  "P-103": { name: "대나무 칫솔 10입", price: 4200 },
  "P-104": { name: "주방 세제 리필 1.2L", price: 5800 },
  "P-105": { name: "극세사 행주 5입", price: 3900 },
  "P-106": { name: "종이 수건 150매", price: 2100 },
  "P-107": { name: "무향 핸드워시 500ml", price: 6400 },
  "P-108": { name: "욕실 슬리퍼", price: 4900 },
};

const FIELDS = ["거래처", "품목코드", "품목명", "수량", "단가", "무시"] as const;
type Field = (typeof FIELDS)[number];

// 거래처마다 다른 머리글을 같은 항목으로 맞춘다
const SYNONYMS: Record<Exclude<Field, "무시">, string[]> = {
  거래처: ["거래처", "업체", "상호", "매장", "고객사", "지점"],
  품목코드: ["품목코드", "품번", "상품코드", "코드", "sku"],
  품목명: ["품목명", "상품명", "품명", "제품명"],
  수량: ["수량", "주문수량", "qty", "개수"],
  단가: ["단가", "가격", "공급가", "판매가"],
};

function guessField(header: string): Field {
  const h = header.replace(/\s/g, "").toLowerCase();
  for (const f of Object.keys(SYNONYMS) as Exclude<Field, "무시">[]) {
    if (SYNONYMS[f].some((w) => h.includes(w))) return f;
  }
  return "무시";
}

interface Sheet {
  fileName: string;
  headers: string[];
  rows: string[][];
  mapping: Field[];
  /** 샘플 파일이면 true. 주문일을 오늘 기준으로 다시 계산할 때 쓴다 */
  sample?: boolean;
}

const SAMPLE_HEADERS = ["주문일", "업체명", "품번", "상품명", "주문수량", "공급가", "비고"];
// 샘플 주문은 주문일 열을 빼고 두고, 오늘 기준 SAMPLE_AGO일 전 날짜를 앞에 붙인다
const SAMPLE_AGO = 6;
const SAMPLE_BODY: string[][] = [
  ["가나상사", "P-101", "호텔식 세안 타월", "40", "3,500", ""],
  ["가나상사", "P-102", "호텔식 바스 타월", "12", "12,000", ""],
  ["가나상사", "P-1O4", "주방 세제 리필", "20", "5,800", "O와 0 혼동"],
  ["가나상사", "P-107", "무향 핸드워시", "15개", "6,400", ""],
  ["다라유통", "P-101", "호텔식 세안 타월", "60", "3,500", ""],
  ["다라유통", "P-105", "극세사 행주", "30", "3,700", "구 단가"],
  ["다라유통", "p106", "종이 수건", "100", "2,100", ""],
  ["다라유통", "P-101", "호텔식 세안 타월", "20", "3,500", "추가 주문"],
  ["마바마트", "P-103", "대나무 칫솔", "-5", "4,200", ""],
  ["마바마트", "P-108", "욕실 슬리퍼", "24", "4,900", ""],
  ["마바마트", "P-104", "주방 세제 리필", "18", "5,800", ""],
  ["마바마트", "P-999", "향초 세트", "6", "8,000", "신규 품목?"],
  ["사아호텔", "P-102", "호텔식 바스 타월", "80", "11,000", ""],
  ["사아호텔", "P-101", "호텔식 세안 타월", "120", "3,500", ""],
  ["사아호텔", "P-107", "무향 핸드워시", "40", "6,400", ""],
  ["사아호텔", "P-108", "욕실 슬리퍼", "0", "4,900", ""],
  ["사아호텔", "P-106", "종이 수건", "60", "2,100", ""],
  ["자차상회", "P-105", "극세사 행주", "25", "3,900", ""],
  ["자차상회", "P 103", "대나무 칫솔", "10", "4,200", ""],
  ["자차상회", "P-104", "주방 세제 리필", "12", "5,800", ""],
];

function sampleRows(t: Date) {
  const d = daysAgo(t, SAMPLE_AGO);
  const md = `${d.getMonth() + 1}/${String(d.getDate()).padStart(2, "0")}`;
  return SAMPLE_BODY.map((r) => [md, ...r]);
}

function sampleSheet(t: Date): Sheet {
  const d = daysAgo(t, SAMPLE_AGO);
  return {
    fileName: `${d.getMonth() + 1}월${d.getDate()}일_거래처주문_취합.xlsx`,
    headers: SAMPLE_HEADERS,
    rows: sampleRows(t),
    mapping: SAMPLE_HEADERS.map(guessField),
    sample: true,
  };
}

const colLetter = (i: number) => String.fromCharCode(65 + i);
const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;
const toNumber = (s: string) => Number(String(s).replace(/[^\d.-]/g, ""));

// 품목코드 표기를 기준표 형식(P-000)으로 맞춘다: 소문자, 빈칸, 하이픈 누락, O와 0 혼동
function normalizeCode(raw: string) {
  const s = raw.toUpperCase().replace(/\s+/g, "").replace(/^P-?/, "P-");
  return s.slice(0, 2) + s.slice(2).replace(/O/g, "0");
}

type IssueType = "수량" | "품목코드" | "단가" | "중복";
interface Issue {
  id: string;
  row: number;
  col: number;
  type: IssueType;
  message: string;
  fix?: string;
}

function check(sheet: Sheet): Issue[] {
  const col = (f: Field) => sheet.mapping.indexOf(f);
  const [cClient, cCode, cQty, cPrice] = [col("거래처"), col("품목코드"), col("수량"), col("단가")];
  if (cCode < 0 || cQty < 0) return [];
  const issues: Issue[] = [];
  const seen = new Map<string, number>();
  sheet.rows.forEach((r, i) => {
    const rawQty = r[cQty] ?? "";
    const qty = toNumber(rawQty);
    if (rawQty.trim() !== "" && /[^\d,.-]/.test(rawQty) && qty > 0) {
      issues.push({ id: `q${i}`, row: i, col: cQty, type: "수량", message: `숫자 외 문자 포함(${rawQty})`, fix: `수정값 ${qty}` });
    } else if (!(qty > 0)) {
      issues.push({ id: `q${i}`, row: i, col: cQty, type: "수량", message: rawQty.trim() ? `유효하지 않은 수량(${rawQty})` : "수량 누락" });
    }
    const code = normalizeCode(r[cCode] ?? "");
    if (!MASTER[code]) {
      issues.push({ id: `c${i}`, row: i, col: cCode, type: "품목코드", message: `미등록 품목코드(${r[cCode]})` });
      return;
    }
    if (code !== r[cCode]) {
      issues.push({ id: `c${i}`, row: i, col: cCode, type: "품목코드", message: `품목코드 형식 오류(${r[cCode]})`, fix: `수정값 ${code}` });
    }
    if (cPrice >= 0 && toNumber(r[cPrice] ?? "") !== MASTER[code].price) {
      issues.push({ id: `p${i}`, row: i, col: cPrice, type: "단가", message: `기준단가 불일치(${r[cPrice]}원)`, fix: `수정값 ${MASTER[code].price.toLocaleString("ko-KR")}원` });
    }
    const key = `${cClient >= 0 ? r[cClient] : ""}|${code}`;
    if (seen.has(key)) {
      issues.push({ id: `d${i}`, row: i, col: cCode, type: "중복", message: `${seen.get(key)! + 2}행과 중복 주문`, fix: `${seen.get(key)! + 2}행에 수량 합산` });
    } else seen.set(key, i);
  });
  return issues;
}

// 고칠 수 있는 오류를 한 번에 바로잡는다 (중복은 마지막에 합친다)
function fixAll(sheet: Sheet, issues: Issue[]): { sheet: Sheet; cells: Set<string> } {
  const col = (f: Field) => sheet.mapping.indexOf(f);
  const [cCode, cQty, cPrice] = [col("품목코드"), col("수량"), col("단가")];
  const rows = sheet.rows.map((r) => [...r]);
  const cells = new Set<string>();
  for (const is of issues) {
    if (!is.fix) continue;
    if (is.type === "수량") rows[is.row][cQty] = String(toNumber(rows[is.row][cQty]));
    if (is.type === "품목코드") rows[is.row][cCode] = normalizeCode(rows[is.row][cCode]);
    if (is.type === "단가") rows[is.row][cPrice] = MASTER[normalizeCode(rows[is.row][cCode])].price.toLocaleString("ko-KR");
    if (is.type !== "중복") cells.add(`${is.row}-${is.col}`);
  }
  const dupRows = issues.filter((i) => i.type === "중복").map((i) => i.row);
  if (dupRows.length) {
    const cClient = col("거래처");
    const first = new Map<string, number>();
    rows.forEach((r, i) => {
      const key = `${cClient >= 0 ? r[cClient] : ""}|${normalizeCode(r[cCode])}`;
      if (dupRows.includes(i) && first.has(key)) {
        const t = first.get(key)!;
        rows[t][cQty] = String(toNumber(rows[t][cQty]) + toNumber(r[cQty]));
        cells.add(`${t}-${cQty}`);
      } else if (!first.has(key)) first.set(key, i);
    });
  }
  // 합친 뒤 지운 행 때문에 아래 행 번호가 당겨지므로 강조할 칸 번호도 맞춘다
  const kept = rows.map((_, i) => i).filter((i) => !dupRows.includes(i));
  const shift = new Map(kept.map((old, now) => [old, now]));
  const moved = new Set([...cells].map((k) => {
    const [r, c] = k.split("-").map(Number);
    return `${shift.get(r)}-${c}`;
  }));
  return { sheet: { ...sheet, rows: kept.map((i) => rows[i]) }, cells: moved };
}

function parseCsv(text: string): string[][] {
  const out: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) {
      if (ch === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') q = false;
      else cell += ch;
    } else if (ch === '"') q = true;
    else if (ch === ",") {
      row.push(cell);
      cell = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(cell);
      out.push(row);
      row = [];
      cell = "";
    } else cell += ch;
  }
  if (cell || row.length) out.push([...row, cell]);
  return out.filter((r) => r.some((c) => c.trim() !== ""));
}

function downloadCsv(name: string, rows: (string | number)[][]) {
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

type Tab = "취합" | "집계" | "발주서";

export function ExcelAutomationDemo() {
  const reduce = useReducedMotionSafe();
  const today = useDemoToday();
  const [sheet, setSheet] = useState<Sheet>(() => sampleSheet(today));
  // 첫 화면은 기준일로 그리고, 브라우저에서 오늘 날짜가 정해지면 샘플 주문일을 다시 맞춘다
  const [sheetDay, setSheetDay] = useState(today);
  if (sheetDay !== today) {
    setSheetDay(today);
    if (sheet.sample) setSheet(sampleSheet(today));
  }
  const [loadId, setLoadId] = useState(0);
  const [tab, setTab] = useState<Tab>("취합");
  const [dragging, setDragging] = useState(false);
  const [active, setActive] = useState<{ row: number; col: number; pulse: number } | null>(null);
  const [fixed, setFixed] = useState<{ id: number; cells: Set<string> }>({ id: 0, cells: new Set() });
  const [toast, setToast] = useState<{ id: number; text: string } | null>(null);
  const [printClient, setPrintClient] = useState<string | null>(null);
  const cellRefs = useRef(new Map<string, HTMLInputElement>());
  const fileInput = useRef<HTMLInputElement>(null);

  const notify = (text: string) => setToast((t) => ({ id: (t?.id ?? 0) + 1, text }));
  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(t);
  }, [toast]);

  // 인쇄 창이 닫히면 발주서 한 장만 인쇄하던 상태를 푼다
  useEffect(() => {
    if (!printClient) return;
    const done = () => setPrintClient(null);
    window.addEventListener("afterprint", done);
    const t = window.setTimeout(() => window.print(), 50);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("afterprint", done);
    };
  }, [printClient]);

  const issues = useMemo(() => check(sheet), [sheet]);
  const fixable = issues.filter((i) => i.fix);
  const issueAt = useMemo(() => new Map(issues.map((i) => [`${i.row}-${i.col}`, i])), [issues]);

  const valid = useMemo(() => {
    const [cClient, cCode, cQty] = [sheet.mapping.indexOf("거래처"), sheet.mapping.indexOf("품목코드"), sheet.mapping.indexOf("수량")];
    if (cCode < 0 || cQty < 0) return [];
    return sheet.rows
      .map((r) => ({ client: cClient >= 0 ? r[cClient] : "거래처 없음", code: normalizeCode(r[cCode] ?? ""), qty: toNumber(r[cQty] ?? "") }))
      .filter((r) => MASTER[r.code] && r.qty > 0);
  }, [sheet]);

  const byItem = useMemo(() => {
    const m = new Map<string, number>();
    valid.forEach((r) => m.set(r.code, (m.get(r.code) ?? 0) + r.qty));
    return [...m].map(([code, qty]) => ({ code, qty, amount: qty * MASTER[code].price })).sort((a, b) => b.qty - a.qty);
  }, [valid]);
  const byClient = useMemo(() => {
    // 같은 거래처의 같은 품목은 한 줄로 합친다
    const m = new Map<string, Map<string, number>>();
    valid.forEach((r) => {
      const items = m.get(r.client) ?? new Map<string, number>();
      items.set(r.code, (items.get(r.code) ?? 0) + r.qty);
      m.set(r.client, items);
    });
    return [...m].map(([client, items]) => [client, [...items].map(([code, qty]) => ({ code, qty }))] as const);
  }, [valid]);

  const load = (next: Sheet, message: string) => {
    setSheet(next);
    setLoadId((n) => n + 1);
    setFixed((f) => ({ id: f.id + 1, cells: new Set() }));
    setActive(null);
    setTab("취합");
    notify(message);
  };

  const readFile = async (file: File) => {
    try {
      let data: string[][];
      if (/\.csv$/i.test(file.name)) {
        data = parseCsv((await file.text()).replace(/^\ufeff/, ""));
      } else if (/\.xlsx$/i.test(file.name)) {
        const { readSheet } = await import("read-excel-file/browser");
        const raw = await readSheet(file);
        data = raw.map((r) => r.map((c) => (c === null ? "" : c instanceof Date ? c.toLocaleDateString("ko-KR") : String(c))));
      } else {
        notify("엑셀(.xlsx) 또는 CSV 파일만 업로드할 수 있습니다.");
        return;
      }
      if (data.length < 2) {
        notify("머리글 행 또는 주문 행이 없는 파일입니다.");
        return;
      }
      const width = Math.max(...data.map((r) => r.length));
      const headers = Array.from({ length: width }, (_, i) => String(data[0][i] ?? ""));
      const rows = data.slice(1).map((r) => Array.from({ length: width }, (_, i) => String(r[i] ?? "")));
      load({ fileName: file.name, headers, rows, mapping: headers.map(guessField) }, `${file.name} 파일에서 ${rows.length}행을 불러왔습니다.`);
    } catch {
      notify("파일을 읽을 수 없습니다. 암호가 걸린 파일인지 확인해 주세요.");
    }
  };

  const setCell = (r: number, c: number, v: string) => setSheet((s) => ({ ...s, rows: s.rows.map((row, i) => (i === r ? row.map((x, j) => (j === c ? v : x)) : row)) }));

  const goTo = (is: Issue) => {
    setTab("취합");
    setActive((a) => ({ row: is.row, col: is.col, pulse: (a?.pulse ?? 0) + 1 }));
    // 탭 전환 뒤 칸이 그려진 다음에 이동한다
    window.requestAnimationFrame(() => {
      const el = cellRefs.current.get(`${is.row}-${is.col}`);
      el?.scrollIntoView({ block: "center", inline: "nearest", behavior: reduce ? "auto" : "smooth" });
      el?.focus({ preventScroll: true });
    });
  };

  const runFixAll = () => {
    const before = fixable.length;
    const res = fixAll(sheet, fixable);
    setSheet(res.sheet);
    setFixed((f) => ({ id: f.id + 1, cells: res.cells }));
    setActive(null);
    notify(`${before}건을 일괄수정했습니다. 확인 필요 ${issues.length - before}건이 남아 있습니다.`);
  };

  const errorCount = issues.filter((i) => !i.fix).length;

  return (
    <div
      className="min-h-screen pb-24"
      style={{ background: C.bg, color: C.text }}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={(e) => {
        if (e.currentTarget === e.target) setDragging(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const f = e.dataTransfer.files[0];
        if (f) readFile(f);
      }}
    >
      <header className="print:hidden border-b" style={{ background: C.action, borderColor: C.action }}>
        <div className="flex flex-wrap items-center gap-3 px-4 py-3 text-white md:px-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo.svg" alt="" aria-hidden width={28} height={28} className="h-7 w-7 shrink-0" />
          <div className="mr-auto min-w-0">
            <p className="flex items-baseline gap-1 whitespace-nowrap">
              <span className="sr-only">곰파트너 유통 주문취합</span>
              <span aria-hidden className="text-[16px] font-bold">곰파트너</span>
              <span aria-hidden className="text-[10px] font-bold opacity-90">유통 주문취합</span>
            </p>
            <h1 className="truncate text-[17px] font-bold">{sheet.fileName}</h1>
          </div>
          <input
            ref={fileInput}
            type="file"
            accept=".xlsx,.csv"
            className="sr-only"
            aria-label="주문 파일 올리기"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) readFile(f);
              e.target.value = "";
            }}
          />
          <button type="button" onClick={() => fileInput.current?.click()} className="inline-flex h-10 items-center gap-1.5 rounded-md bg-white px-3.5 text-[15px] font-bold" style={{ color: C.action }}>
            <Upload size={16} aria-hidden />
            엑셀 업로드
          </button>
          <button
            type="button"
            onClick={() => downloadCsv("샘플_거래처주문.csv", [SAMPLE_HEADERS, ...sampleRows(today)])}
            className="inline-flex h-10 items-center gap-1.5 rounded-md border border-white/60 px-3.5 text-[15px] font-bold"
          >
            <Download size={16} aria-hidden />
            샘플 다운로드
          </button>
          <button type="button" onClick={() => load(sampleSheet(today), "샘플 주문 20행을 불러왔습니다.")} className="h-10 rounded-md px-2 text-[15px] font-bold underline underline-offset-4">
            초기화
          </button>
        </div>
      </header>

      <div className="grid lg:grid-cols-[1fr_340px]">
        <div className="min-w-0 print:hidden">
          <div role="tablist" aria-label="시트" className="flex border-b bg-white px-2" style={{ borderColor: C.grid }}>
            {(["취합", "집계", "발주서"] as Tab[]).map((t) => (
              <button
                key={t}
                role="tab"
                type="button"
                aria-selected={tab === t}
                onClick={() => setTab(t)}
                className="relative px-4 py-3 text-[15px] font-bold"
                style={{ color: tab === t ? C.action : C.muted }}
              >
                {t === "취합" ? "주문취합" : t === "집계" ? "품목별 집계" : "거래처별 발주서"}
                {tab === t && (
                  <motion.span
                    layoutId="sheet-tab"
                    className="absolute inset-x-2 bottom-0 h-[3px] rounded-t"
                    style={{ background: C.action }}
                    transition={reduce ? { duration: 0 } : { duration: 0.25, ease: EASE }}
                  />
                )}
              </button>
            ))}
          </div>

          {tab === "취합" && (
            <div className="soft-in overflow-auto bg-white" style={{ maxHeight: "calc(100vh - 150px)" }}>
              <table className="border-collapse text-[14px]" aria-label="주문취합 시트">
                <thead className="sticky top-0 z-10">
                  <tr>
                    <th className="w-10 border" style={{ background: C.head, borderColor: C.grid }} />
                    {sheet.headers.map((_, c) => (
                      <th key={c} scope="col" className="border px-2 py-1 text-[12px] font-normal" style={{ background: C.head, borderColor: C.grid, color: C.muted }}>
                        {colLetter(c)}
                      </th>
                    ))}
                  </tr>
                  <tr>
                    <th className="border text-[12px] font-normal" style={{ background: C.head, borderColor: C.grid, color: C.muted }}>
                      항목
                    </th>
                    {sheet.headers.map((h, c) => (
                      <th key={c} className="border p-1" style={{ background: C.actionSoft, borderColor: C.grid }}>
                        <select
                          aria-label={`${colLetter(c)}열(${h}) 항목`}
                          value={sheet.mapping[c]}
                          onChange={(e) => setSheet((s) => ({ ...s, mapping: s.mapping.map((m, i) => (i === c ? (e.target.value as Field) : m)) }))}
                          className="h-8 w-full min-w-[96px] rounded border bg-white px-1 text-[13px] font-bold"
                          style={{ borderColor: C.grid, color: sheet.mapping[c] === "무시" ? C.muted : C.action }}
                        >
                          {FIELDS.map((f) => (
                            <option key={f} value={f}>
                              {f === "무시" ? "미사용" : f}
                            </option>
                          ))}
                        </select>
                      </th>
                    ))}
                  </tr>
                  <tr>
                    <th className="border text-[12px] font-normal" style={{ background: C.head, borderColor: C.grid, color: C.muted }}>
                      1
                    </th>
                    {sheet.headers.map((h, c) => (
                      <th key={c} scope="col" className="border px-2 py-1.5 text-left font-bold" style={{ background: "#fafafa", borderColor: C.grid }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody key={loadId}>
                  {sheet.rows.map((r, ri) => (
                    <motion.tr
                      key={ri}
                      initial={reduce ? false : { opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, ease: EASE, delay: Math.min(ri, 20) * 0.015 }}
                    >
                      <th scope="row" className="border px-2 text-[12px] font-normal tabular-nums" style={{ background: C.head, borderColor: C.grid, color: C.muted }}>
                        {ri + 2}
                      </th>
                      {r.map((v, ci) => {
                        const is = issueAt.get(`${ri}-${ci}`);
                        const k = `${ri}-${ci}`;
                        const wasFixed = fixed.cells.has(k);
                        const on = active?.row === ri && active.col === ci;
                        const tone = is ? (is.fix ? { bg: C.fixableSoft, line: C.fixable } : { bg: C.errorSoft, line: C.error }) : null;
                        return (
                          <td key={ci} className="relative border p-0" style={{ borderColor: C.grid }}>
                            {wasFixed && !reduce && (
                              <motion.span
                                key={`f${fixed.id}`}
                                aria-hidden
                                className="pointer-events-none absolute inset-0"
                                initial={{ opacity: 1 }}
                                animate={{ opacity: 0 }}
                                transition={{ duration: 1.4, ease: EASE, delay: 0.1 }}
                                style={{ background: C.fixed }}
                              />
                            )}
                            {on && (
                              <motion.span
                                key={`p${active.pulse}`}
                                aria-hidden
                                className="pointer-events-none absolute -inset-px z-[1] border-2"
                                initial={reduce ? false : { opacity: 0.2, scale: 1.08 }}
                                animate={{ opacity: [1, 0.35, 1], scale: 1 }}
                                transition={{ duration: 0.6, ease: EASE }}
                                style={{ borderColor: C.action }}
                              />
                            )}
                            <input
                              ref={(el) => {
                                if (el) cellRefs.current.set(k, el);
                                else cellRefs.current.delete(k);
                              }}
                              value={v}
                              onChange={(e) => setCell(ri, ci, e.target.value)}
                              onFocus={() => setActive((a) => (a?.row === ri && a.col === ci ? a : { row: ri, col: ci, pulse: a?.pulse ?? 0 }))}
                              aria-label={`${colLetter(ci)}${ri + 2} ${sheet.headers[ci]}`}
                              aria-invalid={is ? true : undefined}
                              title={is?.message}
                              className="relative h-8 w-full min-w-[96px] bg-transparent px-2 outline-none"
                              style={tone ? { background: tone.bg, boxShadow: `inset 0 0 0 1px ${tone.line}` } : undefined}
                            />
                          </td>
                        );
                      })}
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === "집계" && (
            <section aria-label="품목별 집계" className="soft-in bg-white p-5 md:p-6">
              <p className="text-[15px]" style={{ color: C.muted }}>
                정상 {valid.length}행 기준 (오류 행 제외)
              </p>
              <ul className="mt-4 grid gap-3">
                {byItem.map((it, i) => {
                  const max = byItem[0]?.qty ?? 1;
                  return (
                    <li key={it.code} className="grid grid-cols-[minmax(0,180px)_1fr_auto] items-center gap-3 text-[15px]">
                      <span className="truncate">
                        <span className="tabular-nums" style={{ color: C.muted }}>
                          {it.code}
                        </span>{" "}
                        {MASTER[it.code].name}
                      </span>
                      <span className="h-6 overflow-hidden rounded" style={{ background: C.head }}>
                        <motion.span
                          className="block h-full rounded"
                          style={{ background: C.action, originX: 0, width: `${(it.qty / max) * 100}%` }}
                          initial={reduce ? false : { scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ duration: 0.4, ease: EASE, delay: i * 0.04 }}
                        />
                      </span>
                      <span className="w-40 text-right tabular-nums">
                        <b>{it.qty.toLocaleString("ko-KR")}개</b>
                        <span className="ml-2 text-[13px]" style={{ color: C.muted }}>
                          {won(it.amount)}
                        </span>
                      </span>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-6 border-t pt-4 text-right text-[17px] font-bold tabular-nums" style={{ borderColor: C.grid }}>
                합계 {won(byItem.reduce((s, x) => s + x.amount, 0))}
              </p>
            </section>
          )}

          {tab === "발주서" && (
            <section aria-label="거래처별 발주서" className="soft-in p-4 md:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-[15px]" style={{ color: C.muted }}>
                  발주서 {byClient.length}건
                </p>
                <button
                  type="button"
                  onClick={() =>
                    downloadCsv("거래처별_발주서.csv", [
                      ["거래처", "품목코드", "품목명", "수량", "단가", "금액"],
                      ...byClient.flatMap(([client, items]) => items.map((it) => [client, it.code, MASTER[it.code].name, it.qty, MASTER[it.code].price, it.qty * MASTER[it.code].price])),
                    ])
                  }
                  className="inline-flex h-10 items-center gap-1.5 rounded-md px-3.5 text-[15px] font-bold text-white"
                  style={{ background: C.action }}
                >
                  <Download size={16} aria-hidden />
                  전체 엑셀 다운로드
                </button>
              </div>
              <div className="mt-4 grid gap-4 xl:grid-cols-2">
                {byClient.map(([client, items]) => (
                  <PurchaseOrder key={client} client={client} items={items} onPrint={() => setPrintClient(client)} />
                ))}
              </div>
            </section>
          )}
        </div>

        <aside aria-labelledby="check-title" className="print:hidden order-first border-b bg-white lg:order-none lg:sticky lg:top-0 lg:h-screen lg:overflow-auto lg:border-b-0 lg:border-l" style={{ borderColor: C.grid }}>
          <div className="border-b p-5" style={{ borderColor: C.grid }}>
            <h2 id="check-title" className="text-[17px] font-bold">
              오류 검사 결과
            </h2>
            <div className="mt-3 grid grid-cols-2 gap-2 text-[14px]">
              <p className="rounded-md px-3 py-2" style={{ background: C.fixableSoft, color: C.fixable }}>
                일괄수정 대상
                <b className="block text-[22px] tabular-nums">{fixable.length}건</b>
              </p>
              <p className="rounded-md px-3 py-2" style={{ background: C.errorSoft, color: C.error }}>
                확인 필요
                <b className="block text-[22px] tabular-nums">{errorCount}건</b>
              </p>
            </div>
            <button
              type="button"
              disabled={!fixable.length}
              onClick={runFixAll}
              className="mt-3 inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-md text-[15px] font-bold text-white disabled:opacity-40"
              style={{ background: C.action }}
            >
              <Wand2 size={17} aria-hidden />
              {fixable.length ? `${fixable.length}건 일괄수정` : "일괄수정 대상 없음"}
            </button>
          </div>
          {issues.length === 0 ? (
            <p className="flex items-center gap-2 p-5 text-[15px] font-bold" style={{ color: C.action }}>
              <CheckCircle2 size={18} aria-hidden />
              검사 결과 오류가 없습니다.
            </p>
          ) : (
            <ul className="max-h-56 overflow-auto p-2 lg:max-h-none">
              <AnimatePresence initial={false}>
                {issues.map((is) => (
                  <motion.li
                    key={is.id}
                    layout={!reduce}
                    initial={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
                    transition={{ duration: reduce ? 0.12 : 0.22, ease: EASE }}
                    className="overflow-hidden"
                  >
                    <button type="button" onClick={() => goTo(is)} className="flex w-full items-start gap-2.5 rounded-md px-3 py-2.5 text-left hover:bg-[#f5f5f5]">
                      <span
                        className="mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-[12px] font-bold tabular-nums"
                        style={is.fix ? { background: C.fixableSoft, color: C.fixable } : { background: C.errorSoft, color: C.error }}
                      >
                        {colLetter(is.col)}
                        {is.row + 2}
                      </span>
                      <span className="text-[14px] leading-[1.5]">
                        <b>{is.type}</b> {is.message}
                        {is.fix ? (
                          <span className="block" style={{ color: C.fixable }}>
                            {is.fix}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1" style={{ color: C.error }}>
                            <AlertTriangle size={13} aria-hidden />
                            직접 수정 필요
                          </span>
                        )}
                      </span>
                    </button>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </aside>
      </div>

      {/* 인쇄할 때는 고른 거래처 발주서 한 장만 보인다 */}
      {printClient && (
        <div className="hidden print:block">
          <PurchaseOrder client={printClient} items={byClient.find(([c]) => c === printClient)?.[1] ?? []} />
        </div>
      )}

      <AnimatePresence>
        {dragging && (
          <motion.div
            aria-hidden
            className="pointer-events-none fixed inset-4 z-50 grid place-items-center rounded-2xl border-4 border-dashed"
            style={{ borderColor: C.action, background: "rgba(16,124,65,0.08)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <p className="rounded-lg bg-white px-6 py-4 text-[19px] font-bold shadow-lg" style={{ color: C.action }}>
              주문 파일 업로드
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <p role="status" aria-live="polite" className="sr-only">
        {toast?.text}
      </p>
      <div className="print:hidden pointer-events-none fixed inset-x-0 bottom-6 z-40 flex justify-center px-4" aria-hidden>
        <AnimatePresence>
          {toast && (
            <motion.p
              key={toast.id}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
              transition={{ duration: reduce ? 0.12 : 0.22, ease: EASE }}
              className="max-w-[520px] rounded-lg px-5 py-3 text-[15px] font-bold text-white shadow-lg"
              style={{ background: C.text }}
            >
              {toast.text}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function PurchaseOrder({ client, items, onPrint }: { client: string; items: { code: string; qty: number }[]; onPrint?: () => void }) {
  const total = items.reduce((s, it) => s + it.qty * MASTER[it.code].price, 0);
  return (
    <article className="rounded-[10px] border bg-white p-5 print:border-0 print:p-0" style={{ borderColor: C.grid }}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[13px]" style={{ color: C.muted }}>
            발주서 (발주처 곰파트너 유통)
          </p>
          <h3 className="text-[19px] font-bold">{client} 귀하</h3>
        </div>
        {onPrint && (
          <button type="button" onClick={onPrint} className="print:hidden inline-flex h-9 items-center gap-1 rounded-md border px-3 text-[14px] font-bold" style={{ borderColor: C.grid }}>
            <Printer size={15} aria-hidden />
            인쇄
          </button>
        )}
      </div>
      <table className="mt-3 w-full text-[14px]">
        <thead>
          <tr className="border-b text-left" style={{ borderColor: C.grid, color: C.muted }}>
            <th scope="col" className="py-1.5">품목명</th>
            <th scope="col" className="py-1.5 text-right">수량</th>
            <th scope="col" className="py-1.5 text-right">금액</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr key={it.code} className="border-b" style={{ borderColor: "#eeeeee" }}>
              <td className="py-1.5">
                <span className="tabular-nums" style={{ color: C.muted }}>
                  {it.code}
                </span>{" "}
                {MASTER[it.code].name}
              </td>
              <td className="py-1.5 text-right tabular-nums">{it.qty.toLocaleString("ko-KR")}</td>
              <td className="py-1.5 text-right tabular-nums">{won(it.qty * MASTER[it.code].price)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-3 text-right text-[16px] font-bold tabular-nums">합계 {won(total)}</p>
    </article>
  );
}
