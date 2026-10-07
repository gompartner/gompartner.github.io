"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Plus, Printer, RotateCcw, TriangleAlert } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

/* 사진 출처 (Unsplash 무료 라이선스)
   hero-face.jpg  AI 생성(Z-Image-Turbo, Apache 2.0)
   serum.jpg      CRYSTALWEED cannabis, w1an547rkxo
   cream.jpg      Jocelyn Morales, JiqTLjzEH18
   mirror.jpg     Sum Sum, Skzxaqy8KpQ */

const STORAGE_KEY = "gs-demo:clinic-report:v2";

/* 원내 PC에서 쓰는 피부 진단 결과지 프로그램 데모.
   진단기가 내는 6개 영역 점수(0~100, 높을수록 좋음)를 입력하면
   같은 성별·연령대 평균과 비교한 A4 결과지를 인쇄한다.
   비교 평균과 산식은 예시 값이며, 실제 도입 시 병원 자료로 교체한다. */

type AreaId = "moisture" | "oil" | "pore" | "wrinkle" | "tone" | "redness";
type Gender = "여" | "남";

// 영역마다 고유 색을 두고, 색만으로 구분하지 않도록 이름과 숫자를 항상 함께 쓴다
const AREAS: { id: AreaId; label: string; care: string; color: string }[] = [
  { id: "moisture", label: "수분", care: "보습 관리와 저자극 보습제 사용을 권합니다.", color: "#3f7fb4" },
  { id: "oil", label: "유분 밸런스", care: "피지 조절 관리와 가벼운 수분 제형을 권합니다.", color: "#b8862b" },
  { id: "pore", label: "모공", care: "주 1~2회 각질 관리와 피지 조절을 권합니다.", color: "#7a5fa6" },
  { id: "wrinkle", label: "주름·탄력", care: "탄력 관리 프로그램과 레티놀 계열 홈케어를 권합니다.", color: "#9c3a5c" },
  { id: "tone", label: "색소·톤", care: "색소 관리와 자외선 차단제 덧바름을 권합니다.", color: "#b0694a" },
  { id: "redness", label: "민감·홍조", care: "진정 관리와 향료·알코올 성분 회피를 권합니다.", color: "#c24a62" },
];

// 관리 권장 카드 사진 (첫째, 둘째 카드 순서)
const CARE_PHOTOS = ["/images/demo-clinic-report/serum.jpg", "/images/demo-clinic-report/cream.jpg"];

// 색 토큰: 살구빛 바탕, 자두색 글자, 베리색 강조
const INK = "#2a1f2b";
const MUTED = "#6e5a64";
const LINE = "#e8d9d1";
const BG = "#f7eee9";
const BERRY = "#9c3a5c";
const APRICOT = "#e39a72";

// 예시 비교 평균: 성별별 20대 기준값에서 10년마다 영역별로 감소
const BASE_20S: Record<Gender, number[]> = {
  여: [62, 60, 64, 76, 68, 63],
  남: [55, 53, 56, 73, 63, 60],
};
const DECLINE_PER_DECADE = [4, 1, 2, 7, 5, 1];

type Scores = Record<AreaId, number>;
type Draft = Partial<Record<AreaId, string>>;

interface Session {
  id: string;
  date: string;
  scores: Scores;
  memo: string;
}

interface Customer {
  id: string;
  name: string;
  gender: Gender;
  age: number;
  chartNo: string;
  sessions: Session[];
}

interface State {
  customers: Customer[];
  selectedId: string;
}

const SAMPLE_PREV: Scores = { moisture: 44, oil: 52, pore: 50, wrinkle: 63, tone: 49, redness: 45 };
const SAMPLE_NOW: Scores = { moisture: 58, oil: 55, pore: 53, wrinkle: 64, tone: 57, redness: 51 };

const INITIAL_STATE: State = {
  customers: [
    {
      id: "c1",
      name: "김하늘",
      gender: "여",
      age: 37,
      chartNo: "2026-0412",
      sessions: [
        { id: "s1", date: "2026-08-21", scores: SAMPLE_PREV, memo: "" },
        { id: "s2", date: "2026-09-25", scores: SAMPLE_NOW, memo: "4주 전보다 수분과 톤이 좋아짐. 지금 홈케어 그대로 유지." },
      ],
    },
    { id: "c2", name: "이도윤", gender: "남", age: 42, chartNo: "2026-0588", sessions: [] },
  ],
  selectedId: "c1",
};

const STEPS = [
  { id: "customer", label: "고객 조회" },
  { id: "input", label: "측정값 입력" },
  { id: "report", label: "결과지 출력" },
] as const;

type StepId = (typeof STEPS)[number]["id"];

const CHOSEONG = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ";

/** 가운데 글자를 초성으로 바꾼다. 김하늘은 김ㅎ늘, 두 글자는 이*, 남궁민수는 남ㄱㅁ수 */
export function maskName(name: string) {
  const chars = [...name.trim()];
  if (chars.length < 2) return name;
  const toChoseong = (c: string) => {
    const code = c.charCodeAt(0) - 0xac00;
    return code >= 0 && code <= 11171 ? CHOSEONG[Math.floor(code / 588)] : "*";
  };
  if (chars.length === 2) return chars[0] + "*";
  return chars[0] + chars.slice(1, -1).map(toChoseong).join("") + chars[chars.length - 1];
}

function averageFor(gender: Gender, age: number): Scores {
  const decade = Math.min(Math.max(Math.floor(age / 10), 2), 6);
  const steps = decade - 2;
  return Object.fromEntries(
    AREAS.map((a, i) => [a.id, Math.round(BASE_20S[gender][i] - DECLINE_PER_DECADE[i] * steps)]),
  ) as Scores;
}

function ageGroup(age: number) {
  return `${Math.min(Math.max(Math.floor(age / 10), 2), 6) * 10}대`;
}

function groupLabel(c: Customer) {
  return `${c.gender === "여" ? "여성" : "남성"} ${ageGroup(c.age)}`;
}

function totalScore(scores: Scores) {
  return Math.round(AREAS.reduce((sum, a) => sum + scores[a.id], 0) / AREAS.length);
}

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function today() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function formatDate(date: string) {
  const [y, m, d] = date.split("-");
  return `${y}년 ${Number(m)}월 ${Number(d)}일`;
}

function fieldStatus(raw: string | undefined): "empty" | "invalid" | "ok" {
  if (raw === undefined || raw.trim() === "") return "empty";
  const n = Number(raw);
  return Number.isInteger(n) && n >= 0 && n <= 100 ? "ok" : "invalid";
}

const inputClass =
  "mt-1 h-12 w-full rounded-[12px] border border-[#cdb9ae] bg-white px-4 text-[17px] focus:border-[#9c3a5c] focus:outline-none";

export function ClinicReportDemo() {
  const [state, setState, hydrated] = useLocalStorage<State>(STORAGE_KEY, INITIAL_STATE);
  const [step, setStep] = useState<StepId>("report");
  const [draft, setDraft] = useState<Draft>({});
  const [draftDate, setDraftDate] = useState(today);
  const [draftMemo, setDraftMemo] = useState("");
  const [newName, setNewName] = useState("");
  const [newGender, setNewGender] = useState<Gender>("여");
  const [newAge, setNewAge] = useState("");

  const customer = state.customers.find((c) => c.id === state.selectedId) ?? state.customers[0];
  const latest = customer?.sessions.at(-1);
  const previous = customer?.sessions.at(-2);

  const emptyCount = AREAS.filter((a) => fieldStatus(draft[a.id]) === "empty").length;
  const invalidCount = AREAS.filter((a) => fieldStatus(draft[a.id]) === "invalid").length;
  const canSave = emptyCount === 0 && invalidCount === 0;

  function selectCustomer(id: string) {
    setState((s) => ({ ...s, selectedId: id }));
    setDraft({});
    setDraftMemo("");
  }

  const ageValue = Number(newAge);
  const canAdd = newName.trim().length > 0 && Number.isInteger(ageValue) && ageValue >= 10 && ageValue <= 99;

  function addCustomer() {
    if (!canAdd) return;
    const id = uid();
    const chartNo = `2026-${String(Math.floor(1000 + Math.random() * 9000))}`;
    const created: Customer = { id, name: newName.trim(), gender: newGender, age: ageValue, chartNo, sessions: [] };
    setState((s) => ({ ...s, customers: [...s.customers, created], selectedId: id }));
    setNewName("");
    setNewAge("");
    setDraft({});
    setStep("input");
  }

  /** 엑셀에서 여러 칸을 복사해 붙여 넣으면 해당 칸부터 순서대로 채운다 */
  function handlePaste(startIndex: number, text: string) {
    const values = text.split(/[\t,\s]+/).filter(Boolean);
    if (values.length < 2) return false;
    setDraft((d) => {
      const next = { ...d };
      values.forEach((v, i) => {
        const area = AREAS[startIndex + i];
        if (area) next[area.id] = v;
      });
      return next;
    });
    return true;
  }

  function saveSession() {
    if (!customer || !canSave) return;
    const scores = Object.fromEntries(AREAS.map((a) => [a.id, Number(draft[a.id])])) as Scores;
    const session: Session = { id: uid(), date: draftDate, scores, memo: draftMemo.trim() };
    setState((s) => ({
      ...s,
      customers: s.customers.map((c) => (c.id === customer.id ? { ...c, sessions: [...c.sessions, session] } : c)),
    }));
    setDraft({});
    setDraftMemo("");
    setStep("report");
  }

  function resetDemo() {
    setState(INITIAL_STATE);
    setDraft({});
    setStep("report");
  }

  return (
    <div className="min-h-screen" style={{ background: BG, color: INK }}>
      <style>{`
        @page { size: A4; margin: 0; }
        @media print {
          body * { visibility: hidden !important; }
          .report-sheet, .report-sheet * { visibility: visible !important; }
          .sheet-zoom { zoom: 1 !important; }
          .report-sheet { position: absolute; inset: 0 auto auto 0; width: 210mm; height: 296mm; min-height: 0 !important; overflow: hidden; margin: 0; box-shadow: none !important; border: 0 !important; transform: none !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>

      <Hero
        customer={hydrated ? customer : undefined}
        session={hydrated ? latest : undefined}
        previous={hydrated ? previous : undefined}
        step={step}
        onStep={setStep}
      />

      <main className="mx-auto max-w-[1200px] px-4 pb-28 pt-10 md:px-6 md:pt-14">
        {!hydrated ? (
          <p className="py-20 text-center text-[17px]" style={{ color: MUTED }}>
            불러오는 중입니다.
          </p>
        ) : (
          <>
            {step === "customer" && (
              <section className="grid gap-6 print:hidden lg:grid-cols-[1fr_400px]">
                <div>
                  <h2 className="text-[28px] font-bold leading-[1.3] tracking-[-0.02em]">고객 목록</h2>
                  <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                    {state.customers.map((c) => {
                      const active = c.id === customer?.id;
                      const last = c.sessions.at(-1);
                      return (
                        <li key={c.id}>
                          <button
                            type="button"
                            onClick={() => {
                              selectCustomer(c.id);
                              setStep(c.sessions.length ? "report" : "input");
                            }}
                            className={`flex w-full items-center gap-4 rounded-[20px] border-2 bg-white p-5 text-left transition-[border-color,transform] duration-150 active:scale-[0.98] ${
                              active ? "border-[#9c3a5c]" : "border-transparent hover:border-[#e8d9d1]"
                            }`}
                          >
                            <span
                              className="grid h-14 w-14 shrink-0 place-items-center rounded-full text-[22px] font-bold text-white"
                              style={{ background: active ? BERRY : APRICOT }}
                              aria-hidden
                            >
                              {c.name.trim()[0]}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block text-[19px] font-bold leading-[1.4]">{maskName(c.name)} 님</span>
                              <span className="block text-[15px] leading-[1.5]" style={{ color: MUTED }}>
                                {c.gender}, {c.age}세, 차트번호 {c.chartNo}
                              </span>
                            </span>
                            <span className="text-right">
                              {last ? (
                                <>
                                  <span className="block text-[32px] font-bold leading-none tabular-nums" style={{ color: BERRY }}>
                                    {totalScore(last.scores)}
                                  </span>
                                  <span className="mt-1 block text-[13px]" style={{ color: MUTED }}>
                                    측정 {c.sessions.length}회
                                  </span>
                                </>
                              ) : (
                                <span className="text-[15px]" style={{ color: MUTED }}>
                                  측정 이력 없음
                                </span>
                              )}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
                <form
                  className="h-fit overflow-hidden rounded-[20px] bg-white"
                  onSubmit={(e) => {
                    e.preventDefault();
                    addCustomer();
                  }}
                >
                  <Image
                    src="/images/demo-clinic-report/mirror.jpg"
                    alt="상담 의자에 앉아 거울로 피부를 확인하는 고객"
                    width={1200}
                    height={675}
                    className="aspect-[2/1] w-full object-cover object-[50%_30%]"
                  />
                  <div className="p-6">
                    <h3 className="text-[21px] font-bold leading-[1.4]">신규 고객 등록</h3>
                    <label className="mt-4 block text-[15px] font-bold" htmlFor="new-name">
                      고객명
                    </label>
                    <input id="new-name" value={newName} onChange={(e) => setNewName(e.target.value)} maxLength={20} className={inputClass} />
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <div>
                        <span className="block text-[15px] font-bold">성별</span>
                        <div className="mt-1 flex gap-1 rounded-[12px] p-1" style={{ background: BG }} role="radiogroup" aria-label="성별">
                          {(["여", "남"] as Gender[]).map((g) => (
                            <button
                              key={g}
                              type="button"
                              role="radio"
                              aria-checked={newGender === g}
                              onClick={() => setNewGender(g)}
                              className={`h-10 flex-1 rounded-[9px] text-[17px] font-bold transition-colors duration-150 ${
                                newGender === g ? "bg-white text-[#9c3a5c] shadow-[0_1px_3px_rgba(42,31,43,0.12)]" : "text-[#6e5a64]"
                              }`}
                            >
                              {g}
                            </button>
                          ))}
                        </div>
                      </div>
                      <label className="block">
                        <span className="block text-[15px] font-bold">나이</span>
                        <input
                          inputMode="numeric"
                          value={newAge}
                          onChange={(e) => setNewAge(e.target.value.replace(/\D/g, ""))}
                          maxLength={2}
                          className={inputClass}
                        />
                      </label>
                    </div>
                    <button
                      type="submit"
                      disabled={!canAdd}
                      className="mt-5 inline-flex h-12 w-full items-center justify-center gap-1 rounded-full text-[17px] font-bold text-white transition-transform duration-150 active:scale-[0.98] disabled:opacity-40"
                      style={{ background: BERRY }}
                    >
                      <Plus size={18} aria-hidden />
                      등록
                    </button>
                  </div>
                </form>
              </section>
            )}

            {step === "input" && customer && (
              <section className="print:hidden">
                <div className="flex flex-wrap items-end gap-4">
                  <div>
                    <h2 className="text-[28px] font-bold leading-[1.3] tracking-[-0.02em]">{maskName(customer.name)} 님 측정값 입력</h2>
                    <p className="mt-1 text-[17px] leading-[1.5]" style={{ color: MUTED }}>
                      입력 범위: 영역별 0~100점
                    </p>
                  </div>
                  <label className="ml-auto text-[15px] font-bold">
                    측정일
                    <input
                      type="date"
                      value={draftDate}
                      onChange={(e) => setDraftDate(e.target.value)}
                      className="ml-2 h-11 rounded-[12px] border border-[#cdb9ae] bg-white px-3 text-[15px] font-normal"
                    />
                  </label>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {AREAS.map((a, i) => {
                    const status = fieldStatus(draft[a.id]);
                    const bad = status === "invalid";
                    const value = status === "ok" ? Number(draft[a.id]) : 0;
                    return (
                      <label key={a.id} className="block rounded-[20px] bg-white p-5">
                        <span className="flex items-center gap-2 text-[17px] font-bold">
                          <span className="h-3 w-3 rounded-full" style={{ background: a.color }} aria-hidden />
                          {a.label}
                        </span>
                        <input
                          inputMode="numeric"
                          value={draft[a.id] ?? ""}
                          onChange={(e) => setDraft((d) => ({ ...d, [a.id]: e.target.value }))}
                          onPaste={(e) => {
                            if (handlePaste(i, e.clipboardData.getData("text"))) e.preventDefault();
                          }}
                          aria-invalid={bad}
                          placeholder="0~100"
                          className={`mt-2 h-16 w-full rounded-[12px] border px-4 text-[32px] font-bold tabular-nums placeholder:text-[20px] placeholder:font-normal focus:outline-none ${
                            bad ? "border-[#c0392b] bg-[#fdefec]" : "border-[#e8d9d1] bg-white focus:border-[#9c3a5c]"
                          }`}
                        />
                        {/* 입력한 값만큼 막대가 차올라 오타(예: 580)를 바로 알아챌 수 있다 */}
                        <span className="mt-3 block h-2 overflow-hidden rounded-full bg-[#f3e6df]" aria-hidden>
                          <span
                            className="block h-full rounded-full transition-[width] duration-300 ease-out motion-reduce:transition-none"
                            style={{ width: `${value}%`, background: a.color }}
                          />
                        </span>
                        {bad && <span className="mt-2 block text-[15px] text-[#b3261e]">입력 범위(0~100)를 벗어났습니다.</span>}
                      </label>
                    );
                  })}
                </div>

                <label className="mt-6 block text-[15px] font-bold" htmlFor="memo">
                  상담 메모(결과지 출력)
                </label>
                <textarea
                  id="memo"
                  value={draftMemo}
                  onChange={(e) => setDraftMemo(e.target.value)}
                  maxLength={120}
                  rows={2}
                  className="mt-1 w-full rounded-[16px] border border-[#e8d9d1] bg-white px-4 py-3 text-[17px] leading-[1.5] focus:border-[#9c3a5c] focus:outline-none"
                />

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={saveSession}
                    disabled={!canSave}
                    className="inline-flex h-14 items-center rounded-full px-8 text-[17px] font-bold text-white transition-transform duration-150 active:scale-[0.98] disabled:opacity-40"
                    style={{ background: BERRY }}
                  >
                    저장
                  </button>
                  <button
                    type="button"
                    onClick={() => setDraft(Object.fromEntries(AREAS.map((a) => [a.id, String(SAMPLE_NOW[a.id])])) as Draft)}
                    className="h-12 rounded-md px-3 text-[15px] font-bold underline underline-offset-4"
                    style={{ color: BERRY }}
                  >
                    예시값 입력
                  </button>
                  {!canSave && (
                    <span className="inline-flex items-center gap-1 text-[15px] text-[#b3261e]">
                      <TriangleAlert size={16} aria-hidden />
                      {invalidCount > 0 ? `입력 오류 ${invalidCount}건` : `미입력 ${emptyCount}건`}
                    </span>
                  )}
                </div>
              </section>
            )}

            {step === "report" && (
              <section>
                {customer && latest ? (
                  <>
                    <ReportScreen customer={customer} session={latest} previous={previous ?? null} />

                    <div className="mt-16 flex flex-wrap items-end gap-3 print:hidden">
                      <div>
                        <h2 className="text-[28px] font-bold leading-[1.3] tracking-[-0.02em]">결과지 인쇄 미리보기</h2>
                        <p className="mt-1 text-[17px]" style={{ color: MUTED }}>
                          용지 A4, 1매
                        </p>
                      </div>
                      <div className="ml-auto flex items-center gap-4">
                        <button
                          type="button"
                          onClick={resetDemo}
                          className="inline-flex items-center gap-1 text-[15px] font-bold underline underline-offset-4"
                          style={{ color: BERRY }}
                        >
                          <RotateCcw size={14} aria-hidden />
                          초기화
                        </button>
                        <button
                          type="button"
                          onClick={() => window.print()}
                          className="inline-flex h-12 items-center gap-2 rounded-full px-6 text-[17px] font-bold text-white transition-transform duration-150 active:scale-[0.98]"
                          style={{ background: INK }}
                        >
                          <Printer size={18} aria-hidden />
                          인쇄·PDF 저장
                        </button>
                      </div>
                    </div>
                    <div className="mt-6">
                      <ScaledSheet>
                        <ReportSheet customer={customer} session={latest} previous={previous ?? null} />
                      </ScaledSheet>
                    </div>
                  </>
                ) : (
                  <div
                    className="rounded-[20px] border border-dashed border-[#cdb9ae] bg-white p-12 text-center text-[17px] print:hidden"
                    style={{ color: MUTED }}
                  >
                    측정 이력이 없습니다.{" "}
                    <button type="button" onClick={() => setStep("input")} className="font-bold underline" style={{ color: BERRY }}>
                      측정값 입력
                    </button>
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}

/** 사진을 꽉 채운 첫 화면. 선택한 고객의 종합 점수를 큰 원형 게이지로 보여 준다 */
function Hero({
  customer,
  session,
  previous,
  step,
  onStep,
}: {
  customer?: Customer;
  session?: Session;
  previous?: Session;
  step: StepId;
  onStep: (s: StepId) => void;
}) {
  const total = session ? totalScore(session.scores) : null;
  const avgTotal = customer ? totalScore(averageFor(customer.gender, customer.age)) : null;
  const prevTotal = previous ? totalScore(previous.scores) : null;

  return (
    <header className="relative isolate overflow-hidden text-white print:hidden">
      <Image src="/images/demo-clinic-report/hero-face.jpg" alt="" fill priority sizes="100vw" className="-z-20 object-cover object-[50%_25%]" />
      <div
        className="absolute inset-0 -z-10"
        style={{ background: "linear-gradient(90deg, rgba(42,31,43,0.92) 0%, rgba(42,31,43,0.72) 45%, rgba(42,31,43,0.25) 100%)" }}
        aria-hidden
      />

      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-3 px-4 pt-5 md:px-6">
        <p className="flex items-center gap-2 whitespace-nowrap">
          {/* eslint-disable-next-line @next/next/no-img-element -- 메인 사이트와 같은 곰 로고 */}
          <img src="/images/logo.svg" alt="" aria-hidden width={28} height={28} className="h-7 w-7 shrink-0" />
          <span className="flex items-baseline gap-1">
            <span className="text-[17px] font-bold">곰파트너</span>
            <span className="text-[11px] font-semibold text-white/75">피부과의원</span>
            <span className="ml-1 text-[17px] text-white/70"> 피부 진단 결과지</span>
          </span>
        </p>
        <nav className="flex w-full gap-1 rounded-full bg-white/15 p-1 backdrop-blur-md sm:ml-auto sm:w-auto" aria-label="진행 단계">
          {STEPS.map((s, i) => {
            const active = step === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => onStep(s.id)}
                aria-current={active ? "step" : undefined}
                className={`h-10 flex-1 whitespace-nowrap rounded-full px-4 text-[15px] font-bold transition-colors duration-150 sm:flex-none ${
                  active ? "bg-white text-[#2a1f2b]" : "text-white/80 hover:text-white"
                }`}
              >
                {i + 1}. {s.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mx-auto grid max-w-[1200px] items-end gap-8 px-4 pb-12 pt-14 md:grid-cols-[1fr_auto] md:px-6 md:pb-16 md:pt-28">
        <div>
          {customer ? (
            <>
              <p className="text-[17px] text-white/75">{session ? `측정일 ${formatDate(session.date)}` : "측정 이력 없음"}</p>
              <h1 className="mt-3 text-[44px] font-bold leading-[1.15] tracking-[-0.03em] md:text-[72px]">
                {maskName(customer.name)} 님
                <br />
                피부 진단 결과
              </h1>
              <p className="mt-5 text-[17px] text-white/75">
                {customer.gender}, {customer.age}세, 차트번호 {customer.chartNo}
              </p>
            </>
          ) : (
            <h1 className="text-[44px] font-bold leading-[1.15] tracking-[-0.03em] md:text-[72px]">피부 진단 결과지</h1>
          )}
        </div>

        {customer && total !== null && avgTotal !== null && (
          <div className="flex items-center gap-6">
            <ScoreRing value={total} size={188} stroke={12} track="rgba(255,255,255,0.2)" color="#ffffff">
              <span className="block text-[15px] text-white/75">종합 점수</span>
              <span className="block text-[60px] font-bold leading-none tabular-nums">{total}</span>
            </ScoreRing>
            <dl className="space-y-3 text-[15px]">
              <div>
                <dt className="text-white/70">
                  {groupLabel(customer)} 평균({avgTotal}점) 대비
                </dt>
                <dd className="text-[19px]">
                  <DiffText value={total - avgTotal} light />
                </dd>
              </div>
              {prevTotal !== null && (
                <div>
                  <dt className="text-white/70">직전 측정 대비</dt>
                  <dd className="text-[19px]">
                    <DiffText value={total - prevTotal} light />
                  </dd>
                </div>
              )}
            </dl>
          </div>
        )}
      </div>
    </header>
  );
}

/** 결과지 화면: 영역별 게이지 카드, 방사형 차트, 사진이 들어간 관리 권장 카드 */
function ReportScreen({ customer, session, previous }: { customer: Customer; session: Session; previous: Session | null }) {
  const avg = averageFor(customer.gender, customer.age);
  const focus = [...AREAS].sort((a, b) => session.scores[a.id] - avg[a.id] - (session.scores[b.id] - avg[b.id])).slice(0, 2);
  const group = groupLabel(customer);

  return (
    <div className="print:hidden">
      <h2 className="text-[28px] font-bold leading-[1.3] tracking-[-0.02em]">영역별 점수</h2>
      <p className="mt-1 text-[17px]" style={{ color: MUTED }}>
        세로선: {group} 평균
      </p>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {AREAS.map((a) => {
          const v = session.scores[a.id];
          const prev = previous?.scores[a.id];
          return (
            <li key={a.id} className="rounded-[20px] bg-white p-6">
              <div className="flex items-baseline justify-between">
                <span className="flex items-center gap-2 text-[17px] font-bold">
                  <span className="h-3 w-3 rounded-full" style={{ background: a.color }} aria-hidden />
                  {a.label}
                </span>
                <span className="text-[44px] font-bold leading-none tabular-nums" style={{ color: a.color }}>
                  {v}
                </span>
              </div>
              <div className="relative mt-5 h-3 rounded-full bg-[#f3e6df]" aria-hidden>
                <span className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${v}%`, background: a.color }} />
                <span className="absolute -top-1.5 h-6 w-[3px] -translate-x-1/2 rounded-full" style={{ left: `${avg[a.id]}%`, background: INK }} />
              </div>
              <p className="mt-3 flex flex-wrap justify-between gap-x-3 text-[15px]" style={{ color: MUTED }}>
                <span>
                  평균 {avg[a.id]} <DiffText value={v - avg[a.id]} />
                </span>
                {prev !== undefined && (
                  <span>
                    직전 {prev} <DiffText value={v - prev} />
                  </span>
                )}
              </p>
            </li>
          );
        })}
      </ul>

      <div className="mt-12 grid gap-6 lg:grid-cols-[440px_1fr]">
        <div className="rounded-[20px] bg-white p-6">
          <h2 className="text-[21px] font-bold">영역별 비교</h2>
          <div className="mt-2 flex justify-center">
            <RadarChart scores={session.scores} average={avg} averageLabel={`${group} 평균`} />
          </div>
        </div>
        <div>
          <h2 className="text-[21px] font-bold">관리 권장 영역</h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {focus.map((a, i) => (
              <li key={a.id} className="overflow-hidden rounded-[20px] bg-white">
                <Image src={CARE_PHOTOS[i]} alt="" width={900} height={900} className="aspect-[4/3] w-full object-cover" />
                <div className="p-5">
                  <p className="flex items-center gap-2 text-[19px] font-bold">
                    <span className="h-3 w-3 rounded-full" style={{ background: a.color }} aria-hidden />
                    {a.label}
                  </p>
                  <p className="mt-2 text-[17px] leading-[1.6]" style={{ color: MUTED }}>
                    {a.care}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          {session.memo && (
            <blockquote className="mt-4 rounded-[20px] p-6 text-[19px] leading-[1.6] text-white" style={{ background: BERRY }}>
              <p className="text-[15px] font-bold text-white/75">상담 메모</p>
              <p className="mt-2">{session.memo}</p>
            </blockquote>
          )}
        </div>
      </div>
    </div>
  );
}

function ScoreRing({
  value,
  size,
  stroke,
  track,
  color,
  children,
}: {
  value: number;
  size: number;
  stroke: number;
  track: string;
  color: string;
  children: React.ReactNode;
}) {
  const r = (size - stroke) / 2;
  const len = 2 * Math.PI * r;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${(len * value) / 100} ${len}`}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>{children}</div>
      </div>
    </div>
  );
}

/** A4(794px) 결과지를 화면 폭에 맞춰 줄여 보여준다 — 인쇄 시에는 원래 크기 */
function ScaledSheet({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[794px] [container-type:inline-size]">
      <div className="sheet-zoom origin-top-left [zoom:min(1,calc(100cqw/794px))]">{children}</div>
    </div>
  );
}

function ReportSheet({ customer, session, previous }: { customer: Customer; session: Session; previous: Session | null }) {
  const avg = averageFor(customer.gender, customer.age);
  const total = totalScore(session.scores);
  const avgTotal = totalScore(avg);
  const prevTotal = previous ? totalScore(previous.scores) : null;
  const focus = [...AREAS].sort((a, b) => session.scores[a.id] - avg[a.id] - (session.scores[b.id] - avg[b.id])).slice(0, 2);
  const group = groupLabel(customer);

  return (
    <article className="report-sheet flex min-h-[1123px] w-[794px] flex-col bg-white shadow-[0_20px_40px_-24px_rgba(42,31,43,0.35)]" style={{ color: INK }}>
      <header className="flex items-end justify-between px-[56px] pb-6 pt-[44px] text-white" style={{ background: INK }}>
        <div>
          <p className="text-[13px] text-white/70">곰파트너피부과의원</p>
          <h1 className="mt-1 text-[30px] font-bold leading-[1.3]">피부 진단 결과지</h1>
        </div>
        <p className="text-right text-[15px] leading-[1.5] text-white/80">측정일 {session.date}</p>
      </header>

      <div className="flex flex-1 flex-col px-[56px] pb-[40px]">
        <dl className="mt-6 grid grid-cols-4 gap-4 rounded-[12px] px-5 py-4 text-[15px] leading-[1.5]" style={{ background: BG }}>
          <div>
            <dt style={{ color: MUTED }}>고객명</dt>
            <dd className="font-bold">{maskName(customer.name)} 님</dd>
          </div>
          <div>
            <dt style={{ color: MUTED }}>성별/나이</dt>
            <dd className="font-bold">
              {customer.gender}, {customer.age}세
            </dd>
          </div>
          <div>
            <dt style={{ color: MUTED }}>차트번호</dt>
            <dd className="font-bold tabular-nums">{customer.chartNo}</dd>
          </div>
          <div>
            <dt style={{ color: MUTED }}>비교 기준</dt>
            <dd className="font-bold">{group} 평균</dd>
          </div>
        </dl>

        <section className="mt-6 grid grid-cols-[1fr_330px] items-center gap-2">
          <div className="flex items-center gap-5">
            <ScoreRing value={total} size={150} stroke={10} track="#f3e6df" color={BERRY}>
              <span className="block text-[13px]" style={{ color: MUTED }}>
                종합 점수
              </span>
              <span className="block text-[48px] font-bold leading-none tabular-nums">{total}</span>
            </ScoreRing>
            <div className="text-[15px] leading-[1.6]">
              <p>
                {group} 평균({avgTotal}점) 대비
                <br />
                <DiffText value={total - avgTotal} withUnit />
              </p>
              {prevTotal !== null && (
                <p className="mt-2">
                  직전 측정 대비
                  <br />
                  <DiffText value={total - prevTotal} withUnit />
                </p>
              )}
            </div>
          </div>
          <RadarChart scores={session.scores} average={avg} averageLabel={`${group} 평균`} compact />
        </section>

        <table className="mt-4 w-full text-[15px] leading-[1.5]">
          <caption className="sr-only">영역별 점수와 평균 비교</caption>
          <thead>
            <tr className="border-b-2 text-left" style={{ borderColor: INK }}>
              <th scope="col" className="py-2 font-bold">
                영역
              </th>
              <th scope="col" className="w-[190px] py-2">
                <span className="sr-only">점수 막대</span>
              </th>
              <th scope="col" className="py-2 text-right font-bold">
                측정 점수
              </th>
              <th scope="col" className="py-2 text-right font-bold">
                평균
              </th>
              <th scope="col" className="py-2 text-right font-bold">
                평균 대비
              </th>
            </tr>
          </thead>
          <tbody>
            {AREAS.map((a) => (
              <tr key={a.id} className="border-b" style={{ borderColor: LINE }}>
                <th scope="row" className="py-2 text-left font-normal">
                  <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full align-middle" style={{ background: a.color }} aria-hidden />
                  {a.label}
                </th>
                <td className="py-2 pr-4" aria-hidden>
                  <span className="relative block h-2 rounded-full bg-[#f3e6df]">
                    <span className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${session.scores[a.id]}%`, background: a.color }} />
                    <span className="absolute -top-1 h-4 w-[2px] -translate-x-1/2" style={{ left: `${avg[a.id]}%`, background: INK }} />
                  </span>
                </td>
                <td className="py-2 text-right font-bold tabular-nums">{session.scores[a.id]}</td>
                <td className="py-2 text-right tabular-nums" style={{ color: MUTED }}>
                  {avg[a.id]}
                </td>
                <td className="py-2 text-right tabular-nums">
                  <DiffText value={session.scores[a.id] - avg[a.id]} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <section className="mt-6">
          <h2 className="text-[17px] font-bold">관리 권장 영역</h2>
          <ul className="mt-3 grid grid-cols-2 gap-3">
            {focus.map((a) => (
              <li key={a.id} className="rounded-[12px] px-4 py-3 text-[15px] leading-[1.5]" style={{ background: BG }}>
                <b style={{ color: a.color }}>{a.label}</b>
                <br />
                {a.care}
              </li>
            ))}
          </ul>
        </section>

        {session.memo && (
          <section className="mt-4 rounded-[12px] border px-4 py-3 text-[15px] leading-[1.5]" style={{ borderColor: LINE }}>
            <p className="font-bold">상담 메모</p>
            <p className="mt-1">{session.memo}</p>
          </section>
        )}

        <footer className="mt-auto border-t pt-3 text-[13px] leading-[1.5]" style={{ borderColor: LINE, color: MUTED }}>
          본 결과지는 진단기 측정값을 바탕으로 한 참고 자료이며 의학적 진단을 대신하지 않습니다.
        </footer>
      </div>
    </article>
  );
}

/** 증감 표시. 색만으로 구분하지 않도록 ▲▼와 높음/낮음 문구를 함께 쓴다 */
function DiffText({ value, light = false, withUnit = false }: { value: number; light?: boolean; withUnit?: boolean }) {
  if (value === 0) return <span className={light ? "text-white/80" : "text-[#6e5a64]"}>동일</span>;
  const up = value > 0;
  const color = light ? (up ? "#ffe3b8" : "#ffc4cf") : up ? "#2f6ea8" : "#b3261e";
  return (
    <span className="whitespace-nowrap font-bold" style={{ color }}>
      {up ? "▲" : "▼"} {Math.abs(value)}
      {light || withUnit ? `점 ${up ? "높음" : "낮음"}` : ""}
    </span>
  );
}

/** 6개 영역 방사형 차트. 내 점수(베리색 실선·면)와 비교 평균(점선) */
function RadarChart({
  scores,
  average,
  averageLabel,
  compact = false,
}: {
  scores: Scores;
  average: Scores;
  averageLabel: string;
  compact?: boolean;
}) {
  const size = compact ? 330 : 400;
  const c = size / 2;
  const r = compact ? 92 : 118;
  const angle = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / AREAS.length;
  const point = (i: number, v: number) => [c + (Math.cos(angle(i)) * (r * v)) / 100, c + (Math.sin(angle(i)) * (r * v)) / 100];
  const poly = (s: Scores) => AREAS.map((a, i) => point(i, s[a.id]).join(",")).join(" ");
  const [hover, setHover] = useState<number | null>(null);

  const rings = useMemo(() => [20, 40, 60, 80, 100], []);

  return (
    <figure className="max-w-full">
      <figcaption className="mb-2 flex justify-end gap-4 text-[13px]" style={{ color: MUTED }}>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-[2px] w-5" style={{ background: BERRY }} aria-hidden />
          측정 점수
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-5 border-t-2 border-dashed" style={{ borderColor: MUTED }} aria-hidden />
          {averageLabel}
        </span>
      </figcaption>
      <svg viewBox={`0 20 ${size} ${size - 40}`} width={size} height={size - 40} className="h-auto max-w-full" role="img" aria-label="영역별 점수 방사형 차트">
        {rings.map((v) => (
          <polygon key={v} points={AREAS.map((_, i) => point(i, v).join(",")).join(" ")} fill="none" stroke={LINE} strokeWidth={1} />
        ))}
        {AREAS.map((a, i) => {
          const [x, y] = point(i, 100);
          const [lx, ly] = point(i, 122);
          return (
            <g key={a.id}>
              <line x1={c} y1={c} x2={x} y2={y} stroke={LINE} strokeWidth={1} />
              <text
                x={lx}
                y={ly}
                textAnchor={Math.abs(lx - c) < 4 ? "middle" : lx > c ? "start" : "end"}
                dominantBaseline="middle"
                fontSize={13}
                fontWeight={700}
                fill={INK}
              >
                {a.label}
              </text>
            </g>
          );
        })}
        <polygon points={poly(average)} fill="none" stroke={MUTED} strokeWidth={2} strokeDasharray="5 4" />
        <polygon points={poly(scores)} fill="rgba(156,58,92,0.16)" stroke={BERRY} strokeWidth={2} strokeLinejoin="round" />
        {AREAS.map((a, i) => {
          const [x, y] = point(i, scores[a.id]);
          return (
            <g key={a.id} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
              <circle cx={x} cy={y} r={12} fill="transparent" />
              <circle cx={x} cy={y} r={5} fill={a.color} stroke="#fff" strokeWidth={2} />
            </g>
          );
        })}
        {hover !== null &&
          (() => {
            const a = AREAS[hover];
            const [x, y] = point(hover, scores[a.id]);
            const tx = Math.min(Math.max(x - 60, 4), size - 124);
            const ty = y > c ? y - 52 : y + 12;
            return (
              <g pointerEvents="none">
                <rect x={tx} y={ty} width={120} height={40} rx={8} fill={INK} />
                <text x={tx + 10} y={ty + 17} fontSize={12} fill="#fff" fontWeight={700}>
                  {a.label} {scores[a.id]}점
                </text>
                <text x={tx + 10} y={ty + 32} fontSize={12} fill="#e8d9d1">
                  평균 {average[a.id]}점
                </text>
              </g>
            );
          })()}
      </svg>
    </figure>
  );
}
