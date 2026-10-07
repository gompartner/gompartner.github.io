"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Download, PackageCheck, Plus, RotateCcw, Search, Trash2, Truck, X } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { daysAgo, fmtDash, fmtMD, useDemoToday } from "@/hooks/useDemoToday";

const STORAGE_KEY = "gs-demo:shop-admin:v3";

/* 생활용품 쇼핑몰 관리자 데모.
   옵션 단계(최대 5단계)를 입력하면 조합표가 자동으로 만들어지고, 조합별 재고와 판매 여부를 관리한다.
   주문 관리에서는 여러 주문을 골라 상태를 한 번에 바꾸고, 송장번호를 넣고, 엑셀(CSV)로 내려받는다.
   상호·상품·주문자는 모두 가상 데이터다.

   커머스 판매자 관리자 형태: 왼쪽 짙은 메뉴, 흰 패널, 파란 조작색.
   색 (흰 패널 기준 대비): 본문 #111827(17:1), 보조 #4b5563(7.6:1), 조작 #1d4ed8(6.7:1, 버튼은 흰 글자),
   상태 입금확인 #1d4ed8, 배송준비중 #8a5a00, 배송중 #0f6e7a, 배송완료 #4b5563, 취소신청 #b42318 */

const C = {
  bg: "#f3f4f6",
  panel: "#ffffff",
  band: "#f9fafb",
  off: "#eef0f2",
  rule: "#e2e5e9",
  text: "#111827",
  muted: "#4b5563",
  action: "#1d4ed8",
  actionSoft: "#e8eefc",
  danger: "#b42318",
  warn: "#8a5a00",
  status: { 입금확인: "#1d4ed8", 배송준비중: "#8a5a00", 배송중: "#0f6e7a", 배송완료: "#4b5563", 취소신청: "#b42318" },
} as const;

// 색상 옵션은 실제 색 칩으로 보여 준다
const SWATCH: Record<string, string> = { 화이트: "#f4f1ea", 그레이: "#9b9a95", 네이비: "#22304f", 베이지: "#d9c7a7", 차콜: "#3b3b3b" };

const EASE = [0.23, 1, 0.32, 1] as const;

// 숫자가 바뀌면 새 값이 아래에서 올라오고 이전 값은 위로 빠진다 (240ms)
function Rolling({ value }: { value: string }) {
  const reduce = useReducedMotionSafe();
  return (
    <span className="relative inline-flex overflow-hidden align-bottom">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={reduce ? { opacity: 0 } : { y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={reduce ? { opacity: 0 } : { y: "-100%", opacity: 0 }}
          transition={{ duration: reduce ? 0.12 : 0.24, ease: EASE }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

type Notify = (text: string) => void;

function Dot({ label }: { label: string }) {
  const color = SWATCH[label];
  if (!color) return null;
  return <span aria-hidden className="inline-block size-3.5 shrink-0 rounded-full border" style={{ background: color, borderColor: "#00000026" }} />;
}

const MAX_GROUPS = 5;
const MAX_COMBOS = 1000;
const PAGE = 60;

const STATUSES = ["입금확인", "배송준비중", "배송중", "배송완료", "취소신청"] as const;
type Status = (typeof STATUSES)[number];


interface OptionValue {
  label: string;
  extra: number;
}
interface OptionGroup {
  name: string;
  values: OptionValue[];
}
interface Variant {
  stock: number;
  onSale: boolean;
}
/** 저장용 주문. 주문일은 오늘 기준 며칠 전(ago)과 시각으로 두고, 주문번호·주문일시는 화면에서 만든다. */
interface Order {
  seq: string;
  ago: number;
  time: string;
  buyer: string;
  option: string;
  qty: number;
  amount: number;
  status: Status;
  invoice: string;
}
type OrderView = Order & { no: string; date: string };

const viewOrder = (o: Order, t: Date): OrderView => {
  const d = daysAgo(t, o.ago);
  return { ...o, no: `${fmtDash(d).replaceAll("-", "")}-${o.seq}`, date: `${fmtMD(d)} ${o.time}` };
};

interface State {
  productName: string;
  basePrice: number;
  groups: OptionGroup[];
  variants: Record<string, Variant>;
  orders: Order[];
}

const initialGroups: OptionGroup[] = [
  { name: "색상", values: [{ label: "화이트", extra: 0 }, { label: "그레이", extra: 0 }, { label: "네이비", extra: 1000 }] },
  { name: "크기", values: [{ label: "세안용", extra: 0 }, { label: "바스타월", extra: 9000 }] },
  { name: "소재", values: [{ label: "면 100%", extra: 0 }, { label: "뱀부 혼방", extra: 3000 }] },
  { name: "자수", values: [{ label: "없음", extra: 0 }, { label: "이니셜", extra: 2000 }] },
  { name: "포장", values: [{ label: "기본", extra: 0 }, { label: "선물 포장", extra: 1500 }] },
];

const BUYERS = ["김하늘", "이서준", "박지민", "최유나", "정도윤", "강민서", "조하은", "윤시우", "장예린", "임준호", "한소율", "오태민"];

// 날짜와 옵션이 매번 같은 값으로 나오도록 고정된 순서로 만든다
function makeOrders(): Order[] {
  const picks: [number, number, number, number, number][] = [
    [0, 0, 0, 0, 0], [1, 1, 1, 1, 1], [2, 0, 1, 0, 0], [0, 1, 0, 1, 1], [1, 0, 0, 0, 0], [2, 1, 1, 1, 0],
    [0, 0, 1, 0, 1], [1, 1, 0, 0, 0], [2, 0, 0, 1, 1], [0, 1, 1, 0, 0], [1, 0, 1, 1, 0], [2, 1, 0, 0, 1],
  ];
  const statuses: Status[] = ["입금확인", "입금확인", "입금확인", "입금확인", "입금확인", "배송준비중", "배송준비중", "배송준비중", "배송중", "배송중", "배송완료", "배송완료", "배송완료", "취소신청"];
  return Array.from({ length: 28 }, (_, i) => {
    const p = picks[i % picks.length];
    const values = initialGroups.map((g, gi) => g.values[p[gi] % g.values.length]);
    const qty = (i % 4 === 0 ? 2 : 1) + (i % 9 === 0 ? 1 : 0);
    const price = 12900 + values.reduce((s, v) => s + v.extra, 0);
    const status = statuses[i % statuses.length];
    return {
      seq: String(1041 - i).padStart(5, "0"),
      ago: 7 + Math.floor(i / 3),
      time: `${String(9 + (i % 12)).padStart(2, "0")}:${String((i * 17) % 60).padStart(2, "0")}`,
      buyer: BUYERS[i % BUYERS.length],
      option: values.map((v) => v.label).join(" / "),
      qty,
      amount: price * qty,
      status,
      invoice: status === "배송중" || status === "배송완료" ? `5741${String(20000000 + i * 7919).slice(0, 8)}` : "",
    };
  });
}

function combos(groups: OptionGroup[]): OptionValue[][] {
  const usable = groups.filter((g) => g.values.length > 0);
  return usable.reduce<OptionValue[][]>((acc, g) => acc.flatMap((row) => g.values.map((v) => [...row, v])), [[]]);
}

const keyOf = (row: OptionValue[]) => row.map((v) => v.label).join("|");

// 처음 화면에서 품절·품절 임박 조합이 보이도록 일부 재고를 낮춰 둔다
function makeVariants(): Record<string, Variant> {
  const out: Record<string, Variant> = {};
  combos(initialGroups).forEach((row, i) => {
    const key = keyOf(row);
    if (row[0].label === "네이비" && row[1].label === "바스타월") out[key] = { stock: i % 3 === 0 ? 0 : 2, onSale: true };
    else if (i % 7 === 3) out[key] = { stock: 3, onSale: true };
    else out[key] = { stock: 8 + ((i * 5) % 17), onSale: true };
  });
  return out;
}

const initialState: State = {
  productName: "호텔식 코튼 타월",
  basePrice: 12900,
  groups: initialGroups,
  variants: makeVariants(),
  orders: makeOrders(),
};

const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;

// 이름 가운데 글자를 초성으로 가린다 (김하늘 → 김ㅎ늘)
const CHO = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ";
function maskName(name: string) {
  if (name.length < 3) return name[0] + "*";
  const code = name.charCodeAt(1) - 0xac00;
  const cho = code >= 0 && code < 11172 ? CHO[Math.floor(code / 588)] : "*";
  return name[0] + cho + name.slice(2);
}


export function ShopAdminDemo() {
  const [state, setState, hydrated] = useLocalStorage<State>(STORAGE_KEY, initialState);
  const [tab, setTab] = useState<"options" | "orders">("options");
  const [toast, setToast] = useState<{ id: number; text: string } | null>(null);
  const reduce = useReducedMotionSafe();
  const notify: Notify = (text) => setToast((t) => ({ id: (t?.id ?? 0) + 1, text }));

  // 처리 결과 알림은 3.2초 뒤 저절로 닫힌다
  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(t);
  }, [toast]);

  // 사용법 가이드가 하위 화면에서 열리면 첫 화면(옵션 관리)으로 돌아간다
  useEffect(() => {
    const f = () => setTab("options");
    window.addEventListener("demo:go-home", f);
    return () => window.removeEventListener("demo:go-home", f);
  }, []);

  const rows = useMemo(() => combos(state.groups), [state.groups]);
  const variantOf = (key: string): Variant => state.variants[key] ?? { stock: 10, onSale: true };
  const soldOut = rows.filter((r) => variantOf(keyOf(r)).stock === 0).length;
  const lowStock = rows.filter((r) => {
    const s = variantOf(keyOf(r)).stock;
    return s > 0 && s <= 3;
  }).length;

  const count = (s: Status) => state.orders.filter((o) => o.status === s).length;

  return (
    <div
      className="min-h-screen pb-24 lg:pl-56"
      style={{ background: C.bg, color: C.text, ["--panel" as string]: C.panel }}
    >
      <aside className="fixed inset-y-0 left-0 hidden w-56 flex-col border-r px-4 py-5 lg:flex" style={{ background: C.text, borderColor: C.rule }}>
          <p className="flex items-center gap-2 px-2 text-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo.svg" alt="" aria-hidden width={26} height={26} className="h-[26px] w-[26px] shrink-0" />
            <span className="sr-only">곰선임 리빙</span>
            <span aria-hidden className="flex items-baseline gap-1 whitespace-nowrap">
              <span className="text-[16px] font-bold">곰선임</span>
              <span className="text-[10px] font-bold" style={{ color: "#cbd5e1" }}>리빙</span>
            </span>
          </p>
          <p className="px-2 text-[13px]" style={{ color: "#9ca3af" }}>쇼핑몰 관리자</p>
          <nav aria-label="관리 메뉴" className="mt-8 grid gap-1">
            {[
              ["options", "옵션관리"],
              ["orders", "주문관리"],
            ].map(([id, label]) => (
              <button
                key={id}
                type="button"
                aria-current={tab === id ? "page" : undefined}
                onClick={() => setTab(id as "options" | "orders")}
                className="rounded-md px-3 py-2.5 text-left text-[15px] font-bold"
                style={tab === id ? { background: "#ffffff1a", color: "#fff" } : { color: "#cbd5e1" }}
              >
                {label}
              </button>
            ))}
          </nav>
        </aside>
      <header className="border-b bg-[var(--panel)]" style={{ borderColor: C.rule }}>
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-4 py-4 md:px-6">
          <div>
            <p className="flex items-center gap-1.5 lg:hidden" style={{ color: C.action }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/logo.svg" alt="" aria-hidden width={24} height={24} className="h-6 w-6 shrink-0" />
              <span className="sr-only">곰선임 리빙 관리자</span>
              <span aria-hidden className="flex items-baseline gap-1 whitespace-nowrap">
                <span className="text-[16px] font-bold">곰선임</span>
                <span className="text-[10px] font-bold">리빙 관리자</span>
              </span>
            </p>
            <h1 className="text-[20px] font-bold leading-tight md:text-[24px]">{tab === "options" ? "옵션관리" : "주문관리"}</h1>
          </div>
          <button
            type="button"
            onClick={() => setState(initialState)}
            className="inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-[14px] font-bold"
            style={{ borderColor: C.rule, color: C.muted }}
          >
            <RotateCcw size={15} aria-hidden />
            초기화
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-[1200px] px-4 md:px-6" aria-busy={!hydrated}>
        <dl className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            ["입금확인", `${count("입금확인")}건`, C.status["입금확인"]],
            ["배송준비중", `${count("배송준비중")}건`, C.status["배송준비중"]],
            ["품절 품목", `${soldOut}개`, C.danger],
            ["재고 부족(3개 이하)", `${lowStock}개`, C.warn],
          ].map(([label, value, color]) => (
            <div key={label} className="rounded-[10px] border bg-[var(--panel)] px-4 py-3" style={{ borderColor: C.rule }}>
              <dt className="text-[14px]" style={{ color: C.muted }}>
                {label}
              </dt>
              <dd className="mt-0.5 text-[24px] font-bold tabular-nums" style={{ color }}>
                <Rolling value={value} />
              </dd>
            </div>
          ))}
        </dl>

        <div role="tablist" aria-label="관리 메뉴" className="mt-6 flex gap-1 border-b lg:hidden" style={{ borderColor: C.rule }}>
          {[
            ["options", "옵션관리"],
            ["orders", "주문관리"],
          ].map(([id, label]) => (
            <button
              key={id}
              role="tab"
              type="button"
              aria-selected={tab === id}
              onClick={() => setTab(id as "options" | "orders")}
              className="-mb-px border-b-2 px-4 py-2.5 text-[16px] font-bold"
              style={{ borderColor: tab === id ? C.action : "transparent", color: tab === id ? C.text : C.muted }}
            >
              {label}
            </button>
          ))}
        </div>

        <div key={tab} className="soft-in">
          {tab === "options" ? (
            <OptionsPanel state={state} setState={setState} rows={rows} variantOf={variantOf} notify={notify} />
          ) : (
            <OrdersPanel state={state} setState={setState} notify={notify} />
          )}
        </div>
      </main>

      {/* 화면 읽기 프로그램은 항상 있는 알림 영역으로 읽는다 */}
      <p role="status" aria-live="polite" className="sr-only">
        {toast?.text}
      </p>
      <div className="pointer-events-none fixed inset-x-0 bottom-6 z-40 flex justify-center px-4 lg:pl-56" aria-hidden>
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

type SetState = (updater: State | ((prev: State) => State)) => void;

function OptionsPanel({
  state,
  setState,
  rows,
  variantOf,
  notify,
}: {
  state: State;
  setState: SetState;
  rows: OptionValue[][];
  variantOf: (key: string) => Variant;
  notify: Notify;
}) {
  const [draft, setDraft] = useState<Record<number, string>>({});
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkStock, setBulkStock] = useState("20");
  const [filter, setFilter] = useState("");
  const [limit, setLimit] = useState(PAGE);

  const reduce = useReducedMotionSafe();
  // 일괄 적용한 재고 칸을 잠깐 강조한다 (id가 바뀌면 다시 재생)
  const [flash, setFlash] = useState<{ id: number; keys: Set<string> }>({ id: 0, keys: new Set() });
  // 처음 보인 조합은 그대로 두고, 이후 새로 생긴 조합만 펼쳐 보인다
  const [firstKeys] = useState(() => new Set(rows.map(keyOf)));

  const tooMany = rows.length > MAX_COMBOS;
  const visible = rows.filter((r) => !filter || r.some((v) => v.label === filter));

  const updateGroups = (fn: (g: OptionGroup[]) => OptionGroup[]) => setState((s) => ({ ...s, groups: fn(s.groups) }));
  const setVariant = (key: string, patch: Partial<Variant>) =>
    setState((s) => ({ ...s, variants: { ...s.variants, [key]: { ...(s.variants[key] ?? { stock: 10, onSale: true }), ...patch } } }));

  const addValue = (gi: number) => {
    const raw = (draft[gi] ?? "").trim();
    if (!raw) return;
    // "네이비 1000"처럼 쓰면 뒤 숫자를 추가금으로 본다
    const m = raw.match(/^(.*?)\s+(\d+)$/);
    const label = (m ? m[1] : raw).trim();
    const extra = m ? Number(m[2]) : 0;
    updateGroups((g) => g.map((x, i) => (i === gi && !x.values.some((v) => v.label === label) ? { ...x, values: [...x.values, { label, extra }] } : x)));
    setDraft((d) => ({ ...d, [gi]: "" }));
  };

  const applyBulk = (patch: Partial<Variant>, message: string) => {
    const keys = selected.size ? [...selected] : visible.map(keyOf);
    setFlash((f) => ({ id: f.id + 1, keys: new Set(keys) }));
    notify(`품목 ${keys.length}개의 ${message}`);
    setState((s) => {
      const next = { ...s.variants };
      keys.forEach((k) => (next[k] = { ...(next[k] ?? { stock: 10, onSale: true }), ...patch }));
      return { ...s, variants: next };
    });
  };

  const allVisibleSelected = visible.length > 0 && visible.every((r) => selected.has(keyOf(r)));

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[360px_1fr]">
      <section aria-labelledby="opt-title" className="self-start rounded-[10px] border bg-[var(--panel)] p-5" style={{ borderColor: C.rule }}>
        <h2 id="opt-title" className="text-[18px] font-bold">
          옵션 설정
        </h2>
        <label className="mt-4 block text-[14px] font-bold" htmlFor="product-name">
          상품명
        </label>
        <input
          id="product-name"
          value={state.productName}
          onChange={(e) => setState((s) => ({ ...s, productName: e.target.value }))}
          className="mt-1 h-11 w-full rounded-md border px-3 text-[16px]"
          style={{ borderColor: C.rule }}
        />
        <label className="mt-3 block text-[14px] font-bold" htmlFor="base-price">
          판매가
        </label>
        <input
          id="base-price"
          inputMode="numeric"
          value={state.basePrice}
          onChange={(e) => setState((s) => ({ ...s, basePrice: Number(e.target.value.replace(/\D/g, "")) || 0 }))}
          className="mt-1 h-11 w-full rounded-md border px-3 text-[16px] tabular-nums"
          style={{ borderColor: C.rule }}
        />

        <ol className="mt-5 grid gap-4">
          {state.groups.map((g, gi) => (
            <li key={gi} className="rounded-md border p-3" style={{ borderColor: C.rule }}>
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-bold tabular-nums" style={{ color: C.muted }}>
                  옵션{gi + 1}
                </span>
                <input
                  aria-label={`옵션${gi + 1} 옵션명`}
                  value={g.name}
                  onChange={(e) => updateGroups((all) => all.map((x, i) => (i === gi ? { ...x, name: e.target.value } : x)))}
                  className="h-9 min-w-0 flex-1 rounded border px-2 text-[15px] font-bold"
                  style={{ borderColor: C.rule }}
                />
                <button
                  type="button"
                  aria-label={`${g.name} 옵션 삭제`}
                  onClick={() => updateGroups((all) => all.filter((_, i) => i !== gi))}
                  className="grid size-9 place-items-center rounded"
                  style={{ color: C.muted }}
                >
                  <Trash2 size={16} aria-hidden />
                </button>
              </div>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                <AnimatePresence initial={false} mode="popLayout">
                {g.values.map((v) => (
                  <motion.li
                    key={v.label}
                    layout={!reduce}
                    initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.85 }}
                    transition={{ duration: reduce ? 0.12 : 0.18, ease: EASE }}
                    className="inline-flex items-center gap-1.5 rounded-full border py-1 pr-1 pl-3 text-[14px]"
                    style={{ borderColor: C.rule }}
                  >
                    <Dot label={v.label} />
                    {v.label}
                    {v.extra > 0 && <span style={{ color: C.muted }}>+{v.extra.toLocaleString("ko-KR")}</span>}
                    <button
                      type="button"
                      aria-label={`${v.label} 삭제`}
                      onClick={() => updateGroups((all) => all.map((x, i) => (i === gi ? { ...x, values: x.values.filter((y) => y.label !== v.label) } : x)))}
                      className="grid size-6 place-items-center rounded-full"
                      style={{ color: C.muted }}
                    >
                      <X size={13} aria-hidden />
                    </button>
                  </motion.li>
                ))}
                </AnimatePresence>
              </ul>
              <form
                className="mt-2 flex gap-1.5"
                onSubmit={(e) => {
                  e.preventDefault();
                  addValue(gi);
                }}
              >
                <input
                  aria-label={`${g.name} 옵션값 추가`}
                  placeholder={`옵션값 추가금액 (예: ${g.values[0]?.label ?? "화이트"} 500)`}
                  value={draft[gi] ?? ""}
                  onChange={(e) => setDraft((d) => ({ ...d, [gi]: e.target.value }))}
                  className="h-9 min-w-0 flex-1 rounded border px-2 text-[14px]"
                  style={{ borderColor: C.rule }}
                />
                <button type="submit" className="rounded px-3 text-[14px] font-bold" style={{ background: C.actionSoft, color: C.action }}>
                  추가
                </button>
              </form>
            </li>
          ))}
        </ol>
        <button
          type="button"
          disabled={state.groups.length >= MAX_GROUPS}
          onClick={() => updateGroups((g) => [...g, { name: "옵션명", values: [] }])}
          className="mt-4 inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-md border text-[15px] font-bold disabled:opacity-40"
          style={{ borderColor: C.action, color: C.action }}
        >
          <Plus size={16} aria-hidden />
          옵션 추가 ({state.groups.length}/{MAX_GROUPS})
        </button>
      </section>

      <section aria-labelledby="combo-title" className="min-w-0 rounded-[10px] border bg-[var(--panel)]" style={{ borderColor: C.rule }}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4" style={{ borderColor: C.rule }}>
          <h2 id="combo-title" className="text-[18px] font-bold">
            품목 목록{" "}
            <span className="tabular-nums" style={{ color: C.action }}>
              <Rolling value={`${rows.length.toLocaleString("ko-KR")}개`} />
            </span>
          </h2>
          <select
            aria-label="옵션값 필터"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="h-10 rounded-md border px-2 text-[15px]"
            style={{ borderColor: C.rule }}
          >
            <option value="">전체 품목</option>
            {state.groups.map((g) => (
              <optgroup key={g.name} label={g.name}>
                {g.values.map((v) => (
                  <option key={v.label} value={v.label}>
                    {v.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {tooMany ? (
          <p className="p-6 text-[16px]" style={{ color: C.danger }}>
            품목 수가 {MAX_COMBOS.toLocaleString("ko-KR")}개를 초과했습니다. 옵션값을 줄이거나 옵션을 합쳐 주십시오.
          </p>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2 border-b px-4 py-3 text-[14px]" style={{ borderColor: C.rule, background: C.band }}>
              <span style={{ color: C.muted }}>{selected.size ? `선택 품목 ${selected.size}개` : `전체 품목 ${visible.length}개`}</span>
              <input
                aria-label="일괄 재고 수량"
                inputMode="numeric"
                value={bulkStock}
                onChange={(e) => setBulkStock(e.target.value.replace(/\D/g, ""))}
                className="h-9 w-20 rounded border px-2 text-right tabular-nums"
                style={{ borderColor: C.rule }}
              />
              <button type="button" onClick={() => applyBulk({ stock: Number(bulkStock) || 0 }, `재고수량을 ${Number(bulkStock) || 0}개로 수정했습니다.`)} className="h-9 rounded px-3 font-bold text-white" style={{ background: C.action }}>
                재고 일괄적용
              </button>
              <button type="button" onClick={() => applyBulk({ onSale: false }, "판매상태를 판매안함으로 변경했습니다.")} className="h-9 rounded border px-3 font-bold" style={{ borderColor: C.rule }}>
                판매안함
              </button>
              <button type="button" onClick={() => applyBulk({ onSale: true }, "판매상태를 판매함으로 변경했습니다.")} className="h-9 rounded border px-3 font-bold" style={{ borderColor: C.rule }}>
                판매함
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-[15px]">
                <thead>
                  <tr className="border-b text-left" style={{ borderColor: C.rule, color: C.muted }}>
                    <th scope="col" className="w-10 px-4 py-2.5">
                      <input
                        type="checkbox"
                        aria-label="품목 전체 선택"
                        checked={allVisibleSelected}
                        onChange={() =>
                          setSelected((prev) => {
                            const next = new Set(prev);
                            visible.forEach((r) => (allVisibleSelected ? next.delete(keyOf(r)) : next.add(keyOf(r))));
                            return next;
                          })
                        }
                      />
                    </th>
                    <th scope="col" className="py-2.5">품목</th>
                    <th scope="col" className="py-2.5 text-right">판매가</th>
                    <th scope="col" className="w-28 py-2.5 text-right">재고수량</th>
                    <th scope="col" className="w-24 px-4 py-2.5 text-center">판매상태</th>
                  </tr>
                </thead>
                <tbody key={filter || "all"} className="soft-in">
                  {visible.slice(0, limit).map((r) => {
                    const key = keyOf(r);
                    const v = variantOf(key);
                    const price = state.basePrice + r.reduce((s, x) => s + x.extra, 0);
                    return (
                      <motion.tr
                        key={key}
                        initial={!firstKeys.has(key) ? (reduce ? { opacity: 0 } : { opacity: 0, y: -6, backgroundColor: C.actionSoft }) : false}
                        animate={{ opacity: v.onSale ? 1 : 0.55, y: 0, backgroundColor: "rgba(255,255,255,0)" }}
                        transition={{ duration: reduce ? 0.12 : 0.2, ease: EASE, backgroundColor: { duration: reduce ? 0 : 1.2 } }}
                        className="border-b"
                        style={{ borderColor: C.rule }}
                      >
                        <td className="px-4 py-2">
                          <input
                            type="checkbox"
                            aria-label={`${r.map((x) => x.label).join(" ")} 선택`}
                            checked={selected.has(key)}
                            onChange={() =>
                              setSelected((prev) => {
                                const next = new Set(prev);
                                if (next.has(key)) next.delete(key);
                                else next.add(key);
                                return next;
                              })
                            }
                          />
                        </td>
                        <td className="py-2">
                          <span className="inline-flex items-center gap-2">
                            <Dot label={r[0]?.label ?? ""} />
                            {r.map((x) => x.label).join(" / ")}
                          </span>
                        </td>
                        <td className="py-2 text-right tabular-nums">{won(price)}</td>
                        <td className="py-2 text-right">
                          <motion.input
                            key={flash.keys.has(key) ? `${key}-${flash.id}` : key}
                            initial={flash.keys.has(key) && !reduce ? { backgroundColor: "#fde68a" } : false}
                            animate={{ backgroundColor: "#ffffff" }}
                            transition={{ duration: 0.9, ease: EASE }}
                            aria-label={`${r.map((x) => x.label).join(" ")} 재고수량`}
                            inputMode="numeric"
                            value={v.stock}
                            onChange={(e) => setVariant(key, { stock: Number(e.target.value.replace(/\D/g, "")) || 0 })}
                            className="h-9 w-20 rounded border px-2 text-right tabular-nums"
                            style={{
                              borderColor: v.stock === 0 ? C.danger : v.stock <= 3 ? C.warn : C.rule,
                              color: v.stock === 0 ? C.danger : C.text,
                            }}
                          />
                        </td>
                        <td className="px-4 py-2 text-center">
                          <button
                            type="button"
                            role="switch"
                            aria-checked={v.onSale}
                            aria-label={`${r.map((x) => x.label).join(" ")} 판매상태`}
                            onClick={() => setVariant(key, { onSale: !v.onSale })}
                            className="rounded-full px-3 py-1 text-[13px] font-bold"
                            style={v.onSale ? { background: C.actionSoft, color: C.action } : { background: C.off, color: C.muted }}
                          >
                            {v.onSale ? (v.stock === 0 ? "품절" : "판매함") : "판매안함"}
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {visible.length > limit && (
              <button type="button" onClick={() => setLimit((l) => l + PAGE)} className="w-full py-3 text-[15px] font-bold" style={{ color: C.action }}>
                더보기 ({(visible.length - limit).toLocaleString("ko-KR")}개)
              </button>
            )}
          </>
        )}
      </section>
    </div>
  );
}

function OrdersPanel({ state, setState, notify }: { state: State; setState: SetState; notify: Notify }) {
  const reduce = useReducedMotionSafe();
  const [status, setStatus] = useState<Status | "전체">("전체");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const today = useDemoToday();
  const orders = useMemo(() => state.orders.map((o) => viewOrder(o, today)), [state.orders, today]);

  const q = query.replace(/\s/g, "");
  const list = orders.filter(
    (o) => (status === "전체" || o.status === status) && (!q || o.no.includes(q) || o.buyer.includes(q) || maskName(o.buyer).includes(q)),
  );
  const picked = orders.filter((o) => selected.has(o.no));

  const move = (to: Status) => {
    // 배송중으로 바꾸려면 송장번호가 있어야 한다
    const blocked = to === "배송중" ? picked.filter((o) => !o.invoice) : [];
    const ok = new Set(picked.filter((o) => !blocked.includes(o)).map((o) => o.seq));
    setState((s) => ({ ...s, orders: s.orders.map((o) => (ok.has(o.seq) ? { ...o, status: to } : o)) }));
    setSelected(new Set());
    // 받침 있는 말 뒤에는 "으로" (배송중으로, 배송완료로)
    const last = to.charCodeAt(to.length - 1) - 0xac00;
    const ro = last >= 0 && (last % 28 !== 0 && last % 28 !== 8) ? "으로" : "로";
    notify(
      ok.size === 0
        ? `송장번호 미입력 주문 ${blocked.length}건은 ${to}${ro} 변경할 수 없습니다. 송장번호를 먼저 입력하십시오.`
        : blocked.length
          ? `${ok.size}건을 ${to}${ro} 변경했습니다. 송장번호 미입력 ${blocked.length}건은 제외했습니다.`
          : `${ok.size}건을 ${to}${ro} 변경했습니다.`,
    );
  };

  const exportCsv = () => {
    const head = ["주문번호", "주문일시", "주문자명", "상품명(옵션)", "수량", "결제금액", "주문상태", "송장번호"];
    const body = list.map((o) => [o.no, o.date, maskName(o.buyer), `${state.productName} ${o.option}`, o.qty, o.amount, o.status, o.invoice]);
    const csv = [head, ...body].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `주문목록_${status}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const allSelected = list.length > 0 && list.every((o) => selected.has(o.no));

  return (
    <section aria-labelledby="orders-title" className="mt-6 rounded-[10px] border bg-[var(--panel)]" style={{ borderColor: C.rule }}>
      <h2 id="orders-title" className="sr-only">
        주문 목록
      </h2>
      <div className="flex flex-wrap gap-1.5 border-b p-4" style={{ borderColor: C.rule }}>
        {(["전체", ...STATUSES] as const).map((s) => {
          const n = s === "전체" ? orders.length : orders.filter((o) => o.status === s).length;
          const on = status === s;
          return (
            <button
              key={s}
              type="button"
              aria-pressed={on}
              onClick={() => {
                setStatus(s);
                setSelected(new Set());
              }}
              className="rounded-full border px-3.5 py-1.5 text-[14px] font-bold"
              style={on ? { background: C.text, borderColor: C.text, color: "#fff" } : { borderColor: C.rule, color: C.muted }}
            >
              {s} <span className="tabular-nums"><Rolling value={String(n)} /></span>
            </button>
          );
        })}
        <div className="relative ml-auto w-full sm:w-64">
          <Search size={16} aria-hidden className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2" style={{ color: C.muted }} />
          <input
            aria-label="주문번호 또는 주문자명 검색"
            placeholder="주문번호, 주문자명"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-10 w-full rounded-md border pr-3 pl-9 text-[15px]"
            style={{ borderColor: C.rule }}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b px-4 py-3 text-[14px]" style={{ borderColor: C.rule, background: C.band }}>
        <span style={{ color: C.muted }}>선택 주문 {selected.size}건</span>
        <button type="button" disabled={!selected.size} onClick={() => move("배송준비중")} className="inline-flex h-9 items-center gap-1 rounded border px-3 font-bold disabled:opacity-40" style={{ borderColor: C.rule }}>
          <PackageCheck size={15} aria-hidden />
          배송준비중 처리
        </button>
        <button type="button" disabled={!selected.size} onClick={() => move("배송중")} className="inline-flex h-9 items-center gap-1 rounded border px-3 font-bold disabled:opacity-40" style={{ borderColor: C.rule }}>
          <Truck size={15} aria-hidden />
          배송중 처리
        </button>
        <button type="button" disabled={!selected.size} onClick={() => move("배송완료")} className="h-9 rounded border px-3 font-bold disabled:opacity-40" style={{ borderColor: C.rule }}>
          배송완료 처리
        </button>
        <button type="button" onClick={exportCsv} className="ml-auto inline-flex h-9 items-center gap-1 rounded px-3 font-bold text-white" style={{ background: C.action }}>
          <Download size={15} aria-hidden />
          엑셀 다운로드
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-[15px]">
          <thead>
            <tr className="border-b text-left" style={{ borderColor: C.rule, color: C.muted }}>
              <th scope="col" className="w-10 px-4 py-2.5">
                <input
                  type="checkbox"
                  aria-label="주문 전체 선택"
                  checked={allSelected}
                  onChange={() => setSelected(allSelected ? new Set() : new Set(list.map((o) => o.no)))}
                />
              </th>
              <th scope="col" className="py-2.5">주문번호</th>
              <th scope="col" className="py-2.5">주문자명</th>
              <th scope="col" className="py-2.5">옵션정보</th>
              <th scope="col" className="py-2.5 text-right">결제금액</th>
              <th scope="col" className="px-3 py-2.5">주문상태</th>
              <th scope="col" className="w-44 px-4 py-2.5">송장번호</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence initial={false}>
            {list.map((o) => (
              <motion.tr
                key={o.no}
                layout={!reduce}
                exit={reduce ? { opacity: 0 } : { opacity: 0, x: 24 }}
                transition={{ duration: reduce ? 0.12 : 0.22, ease: EASE }}
                className="border-b align-top"
                style={{ borderColor: C.rule }}
              >
                <td className="px-4 py-2.5">
                  <input
                    type="checkbox"
                    aria-label={`${o.no} 선택`}
                    checked={selected.has(o.no)}
                    onChange={() =>
                      setSelected((prev) => {
                        const next = new Set(prev);
                        if (next.has(o.no)) next.delete(o.no);
                        else next.add(o.no);
                        return next;
                      })
                    }
                  />
                </td>
                <td className="py-2.5">
                  <span className="tabular-nums">{o.no}</span>
                  <span className="block text-[13px] tabular-nums" style={{ color: C.muted }}>
                    {o.date}
                  </span>
                </td>
                <td className="py-2.5">{maskName(o.buyer)}</td>
                <td className="py-2.5">
                  {o.option}
                  <span className="block text-[13px]" style={{ color: C.muted }}>
                    수량 {o.qty}
                  </span>
                </td>
                <td className="py-2.5 text-right tabular-nums">{won(o.amount)}</td>
                <td className="px-3 py-2.5">
                  <span className="font-bold" style={{ color: C.status[o.status] }}>
                    {o.status}
                  </span>
                </td>
                <td className="px-4 py-2">
                  {o.status === "취소신청" ? (
                    <span style={{ color: C.muted }}>해당 없음</span>
                  ) : (
                    <input
                      aria-label={`${o.no} 송장번호`}
                      inputMode="numeric"
                      placeholder="송장번호 입력"
                      value={o.invoice}
                      onChange={(e) =>
                        setState((s) => ({
                          ...s,
                          orders: s.orders.map((x) => (x.seq === o.seq ? { ...x, invoice: e.target.value.replace(/\D/g, "").slice(0, 14) } : x)),
                        }))
                      }
                      className="h-9 w-full rounded border px-2 tabular-nums"
                      style={{ borderColor: C.rule }}
                    />
                  )}
                </td>
              </motion.tr>
            ))}
            </AnimatePresence>
            {list.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center" style={{ color: C.muted }}>
                  검색된 주문내역이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
