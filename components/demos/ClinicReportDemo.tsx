"use client";

import { useMemo, useState } from "react";
import { ClipboardList, FileText, Plus, Printer, RotateCcw, Sparkles, TriangleAlert, UserRound } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

const STORAGE_KEY = "gs-demo:clinic-report:v2";

/* 원내 PC에서 쓰는 피부 진단 결과지 프로그램 데모.
   진단기가 내는 6개 영역 점수(0~100, 높을수록 좋음)를 입력하면
   같은 성별·연령대 평균과 비교한 A4 결과지를 인쇄한다.
   비교 평균과 산식은 예시 값이며, 실제 도입 시 병원 자료로 교체한다. */

type AreaId = "moisture" | "oil" | "pore" | "wrinkle" | "tone" | "redness";
type Gender = "여" | "남";

const AREAS: { id: AreaId; label: string; care: string }[] = [
  { id: "moisture", label: "수분", care: "보습 관리와 저자극 보습제 사용을 권합니다." },
  { id: "oil", label: "유분 밸런스", care: "피지 조절 관리와 가벼운 수분 제형을 권합니다." },
  { id: "pore", label: "모공", care: "주 1~2회 각질 관리와 피지 조절을 권합니다." },
  { id: "wrinkle", label: "주름·탄력", care: "탄력 관리 프로그램과 레티놀 계열 홈케어를 권합니다." },
  { id: "tone", label: "색소·톤", care: "색소 관리와 자외선 차단제 덧바름을 권합니다." },
  { id: "redness", label: "민감·홍조", care: "진정 관리와 향료·알코올 성분 회피를 권합니다." },
];

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
        { id: "s2", date: "2026-09-25", scores: SAMPLE_NOW, memo: "4주 전보다 수분과 톤이 좋아졌습니다. 지금 홈케어를 유지해 주세요." },
      ],
    },
    { id: "c2", name: "이도윤", gender: "남", age: 42, chartNo: "2026-0588", sessions: [] },
  ],
  selectedId: "c1",
};

const STEPS = [
  { id: "customer", label: "고객 선택", icon: UserRound },
  { id: "input", label: "측정값 입력", icon: ClipboardList },
  { id: "report", label: "결과지", icon: FileText },
] as const;

type StepId = (typeof STEPS)[number]["id"];

const CHOSEONG = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ";

/** 가운데 글자를 초성으로 바꾼다 — 김하늘 → 김ㅎ늘, 이도 → 이ㄷ, 남궁민수 → 남ㄱㅁ수 */
export function maskName(name: string) {
  const chars = [...name.trim()];
  if (chars.length < 2) return name;
  const toChoseong = (c: string) => {
    const code = c.charCodeAt(0) - 0xac00;
    return code >= 0 && code <= 11171 ? CHOSEONG[Math.floor(code / 588)] : "*";
  };
  if (chars.length === 2) return chars[0] + toChoseong(chars[1]);
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

function fieldStatus(raw: string | undefined): "empty" | "invalid" | "ok" {
  if (raw === undefined || raw.trim() === "") return "empty";
  const n = Number(raw);
  return Number.isInteger(n) && n >= 0 && n <= 100 ? "ok" : "invalid";
}

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
    <div className="min-h-screen bg-[#f4f5f6] text-[#1e2124]">
      <style>{`
        @page { size: A4; margin: 0; }
        @media print {
          body * { visibility: hidden !important; }
          .report-sheet, .report-sheet * { visibility: visible !important; }
          .report-sheet { position: absolute; inset: 0 auto auto 0; width: 210mm; min-height: 297mm; margin: 0; box-shadow: none !important; border: 0 !important; transform: none !important; }
        }
      `}</style>

      <header className="border-b border-[#cdd1d5] bg-white print:hidden">
        <div className="mx-auto flex max-w-[1248px] flex-wrap items-center gap-3 px-4 py-3 md:px-6">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[#2f7d6d] text-white">
              <Sparkles size={18} aria-hidden />
            </span>
            <span>
              <span className="block text-[17px] font-bold leading-[1.4]">피부 진단 결과지</span>
              <span className="block text-[15px] leading-[1.4] text-[#58616a]">샘플 피부과의원 데모</span>
            </span>
          </div>
          <nav className="grid w-full grid-cols-3 gap-1 sm:ml-auto sm:flex sm:w-auto" aria-label="진행 단계">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const active = step === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setStep(s.id)}
                  aria-current={active ? "step" : undefined}
                  className={`inline-flex h-10 items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-2 text-[15px] font-bold transition-colors sm:px-3 ${
                    active ? "bg-[#2f7d6d] text-white" : "text-[#464c53] hover:bg-[#f4f5f6]"
                  }`}
                >
                  <Icon size={16} aria-hidden className="hidden sm:block" />
                  <span>
                    {i + 1}. {s.label}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-[1248px] px-4 py-6 pb-24 md:px-6">
        {!hydrated ? (
          <p className="py-20 text-center text-[17px] text-[#58616a]">불러오는 중</p>
        ) : (
          <>
            {step === "customer" && (
              <section className="grid gap-5 md:grid-cols-[1fr_340px]">
                <div className="rounded-[10px] border border-[#cdd1d5] bg-white p-6">
                  <h2 className="text-[19px] font-bold leading-[1.5]">고객 선택</h2>
                  <ul className="mt-4 divide-y divide-[#e6e8ea]">
                    {state.customers.map((c) => (
                      <li key={c.id}>
                        <button
                          type="button"
                          onClick={() => {
                            selectCustomer(c.id);
                            setStep(c.sessions.length ? "report" : "input");
                          }}
                          className={`flex w-full items-center gap-3 rounded-md px-3 py-3 text-left transition-colors ${
                            c.id === customer?.id ? "bg-[#eef6f4]" : "hover:bg-[#f4f5f6]"
                          }`}
                        >
                          <span className="flex-1">
                            <span className="block text-[17px] font-bold leading-[1.5]">{maskName(c.name)}</span>
                            <span className="block text-[15px] leading-[1.5] text-[#58616a]">
                              {c.gender}, {c.age}세, 차트 {c.chartNo}
                            </span>
                          </span>
                          <span className="text-[15px] text-[#58616a]">
                            {c.sessions.length ? `측정 ${c.sessions.length}회` : "측정 기록 없음"}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
                <form
                  className="h-fit rounded-[10px] border border-[#cdd1d5] bg-white p-6"
                  onSubmit={(e) => {
                    e.preventDefault();
                    addCustomer();
                  }}
                >
                  <h3 className="text-[19px] font-bold leading-[1.5]">신규 고객</h3>
                  <label className="mt-4 block text-[15px] font-bold" htmlFor="new-name">
                    이름
                  </label>
                  <input
                    id="new-name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    maxLength={20}
                    className="mt-1 h-12 w-full rounded-md border border-[#6d7882] px-3 text-[17px]"
                  />
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div>
                      <span className="block text-[15px] font-bold">성별</span>
                      <div className="mt-1 flex gap-1" role="radiogroup" aria-label="성별">
                        {(["여", "남"] as Gender[]).map((g) => (
                          <button
                            key={g}
                            type="button"
                            role="radio"
                            aria-checked={newGender === g}
                            onClick={() => setNewGender(g)}
                            className={`h-12 flex-1 rounded-md border text-[17px] font-bold ${
                              newGender === g ? "border-[#2f7d6d] bg-[#eef6f4] text-[#2f7d6d]" : "border-[#6d7882]"
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
                        className="mt-1 h-12 w-full rounded-md border border-[#6d7882] px-3 text-[17px]"
                      />
                    </label>
                  </div>
                  <button
                    type="submit"
                    disabled={!canAdd}
                    className="mt-5 inline-flex h-12 w-full items-center justify-center gap-1 rounded-md bg-[#2f7d6d] text-[17px] font-bold text-white disabled:bg-[#b1b8be]"
                  >
                    <Plus size={18} aria-hidden />
                    등록 후 측정값 입력
                  </button>
                </form>
              </section>
            )}

            {step === "input" && customer && (
              <section className="mx-auto max-w-[720px] rounded-[10px] border border-[#cdd1d5] bg-white p-6 md:p-8">
                <div className="flex flex-wrap items-end gap-3">
                  <div>
                    <h2 className="text-[19px] font-bold leading-[1.5]">{maskName(customer.name)} 님 측정값 입력</h2>
                    <p className="text-[15px] leading-[1.5] text-[#58616a]">
                      진단기 결과지의 영역별 점수(0~100)를 입력하세요.
                    </p>
                  </div>
                  <label className="ml-auto text-[15px] font-bold">
                    측정일
                    <input
                      type="date"
                      value={draftDate}
                      onChange={(e) => setDraftDate(e.target.value)}
                      className="ml-2 h-10 rounded-md border border-[#6d7882] px-2 text-[15px] font-normal"
                    />
                  </label>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {AREAS.map((a, i) => {
                    const bad = fieldStatus(draft[a.id]) === "invalid";
                    return (
                      <label key={a.id} className="block">
                        <span className="block text-[15px] font-bold">{a.label}</span>
                        <input
                          inputMode="numeric"
                          value={draft[a.id] ?? ""}
                          onChange={(e) => setDraft((d) => ({ ...d, [a.id]: e.target.value }))}
                          onPaste={(e) => {
                            if (handlePaste(i, e.clipboardData.getData("text"))) e.preventDefault();
                          }}
                          aria-invalid={bad}
                          placeholder="0~100"
                          className={`mt-1 h-14 w-full rounded-md border px-3 text-[24px] font-bold tabular-nums ${
                            bad ? "border-[#de3412] bg-[#fdefec]" : "border-[#6d7882]"
                          }`}
                        />
                        {bad && <span className="mt-1 block text-[15px] text-[#bd2c0f]">0~100 사이 숫자</span>}
                      </label>
                    );
                  })}
                </div>

                <label className="mt-6 block text-[15px] font-bold" htmlFor="memo">
                  상담 메모 (결과지에 표시)
                </label>
                <textarea
                  id="memo"
                  value={draftMemo}
                  onChange={(e) => setDraftMemo(e.target.value)}
                  maxLength={120}
                  rows={2}
                  className="mt-1 w-full rounded-md border border-[#6d7882] px-3 py-2 text-[17px] leading-[1.5]"
                />

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={saveSession}
                    disabled={!canSave}
                    className="inline-flex h-12 items-center rounded-md bg-[#2f7d6d] px-6 text-[17px] font-bold text-white disabled:bg-[#b1b8be]"
                  >
                    결과지 만들기
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setDraft(Object.fromEntries(AREAS.map((a) => [a.id, String(SAMPLE_NOW[a.id])])) as Draft)
                    }
                    className="h-12 rounded-md px-3 text-[15px] font-bold text-[#2f7d6d] underline underline-offset-4"
                  >
                    예시 값 채우기
                  </button>
                  {!canSave && (
                    <span className="inline-flex items-center gap-1 text-[15px] text-[#bd2c0f]">
                      <TriangleAlert size={16} aria-hidden />
                      {invalidCount > 0 ? `${invalidCount}칸 확인 필요` : `${emptyCount}칸 남음`}
                    </span>
                  )}
                </div>
              </section>
            )}

            {step === "report" && (
              <section>
                <div className="mb-4 flex flex-wrap items-center gap-3 print:hidden">
                  <button type="button" onClick={resetDemo} className="inline-flex items-center gap-1 text-[15px] font-bold text-[#2f7d6d] underline underline-offset-4">
                    <RotateCcw size={14} aria-hidden />
                    예시로 초기화
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    disabled={!latest}
                    className="ml-auto inline-flex h-12 items-center gap-2 rounded-md bg-[#2f7d6d] px-5 text-[17px] font-bold text-white disabled:bg-[#b1b8be]"
                  >
                    <Printer size={18} aria-hidden />
                    인쇄·PDF 저장
                  </button>
                </div>
                {customer && latest ? (
                  <ScaledSheet>
                    <ReportSheet customer={customer} session={latest} previous={previous ?? null} />
                  </ScaledSheet>
                ) : (
                  <div className="rounded-[10px] border border-dashed border-[#b1b8be] bg-white p-10 text-center text-[17px] text-[#58616a]">
                    아직 측정 기록이 없습니다.{" "}
                    <button type="button" onClick={() => setStep("input")} className="font-bold text-[#2f7d6d] underline">
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

/** A4(794px) 결과지를 화면 폭에 맞춰 줄여 보여준다 — 인쇄 시에는 원래 크기 */
function ScaledSheet({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[794px] [container-type:inline-size]">
      <div className="origin-top-left [zoom:min(1,calc(100cqw/794px))]">{children}</div>
    </div>
  );
}

function ReportSheet({ customer, session, previous }: { customer: Customer; session: Session; previous: Session | null }) {
  const avg = averageFor(customer.gender, customer.age);
  const total = totalScore(session.scores);
  const avgTotal = totalScore(avg);
  const prevTotal = previous ? totalScore(previous.scores) : null;
  const focus = [...AREAS].sort((a, b) => session.scores[a.id] - avg[a.id] - (session.scores[b.id] - avg[b.id])).slice(0, 2);
  const group = `${customer.gender === "여" ? "여성" : "남성"} ${ageGroup(customer.age)}`;

  return (
    <article className="report-sheet flex w-[794px] min-h-[1123px] flex-col bg-white px-[56px] py-[52px] text-[#1e2124] shadow-[0_8px_24px_-12px_rgba(0,0,0,0.2)]">
      <header className="flex items-end justify-between border-b-2 border-[#1e2124] pb-4">
        <h1 className="text-[28px] font-bold leading-[1.4]">피부 진단 결과지</h1>
        <p className="text-right text-[15px] leading-[1.5] text-[#464c53]">
          샘플 피부과의원
          <br />
          측정일 {session.date}
        </p>
      </header>

      <dl className="mt-5 grid grid-cols-4 gap-4 rounded-[10px] bg-[#f4f5f6] px-5 py-4 text-[15px] leading-[1.5]">
        <div>
          <dt className="text-[#58616a]">고객</dt>
          <dd className="font-bold">{maskName(customer.name)} 님</dd>
        </div>
        <div>
          <dt className="text-[#58616a]">성별·나이</dt>
          <dd className="font-bold">
            {customer.gender}, {customer.age}세
          </dd>
        </div>
        <div>
          <dt className="text-[#58616a]">차트번호</dt>
          <dd className="font-bold tabular-nums">{customer.chartNo}</dd>
        </div>
        <div>
          <dt className="text-[#58616a]">비교 기준</dt>
          <dd className="font-bold">{group} 평균</dd>
        </div>
      </dl>

      <section className="mt-8 grid grid-cols-[1fr_400px] items-center gap-2">
        <div>
          <p className="text-[15px] text-[#58616a]">종합 점수</p>
          <p className="text-[64px] font-bold leading-[1.1] tabular-nums">{total}</p>
          <p className="mt-2 text-[17px] leading-[1.5]">
            {group} 평균 {avgTotal}점보다 <Diff value={total - avgTotal} suffix="점" />
          </p>
          {prevTotal !== null && (
            <p className="text-[17px] leading-[1.5]">
              지난 측정({previous?.date})보다 <Diff value={total - prevTotal} suffix="점" />
            </p>
          )}
        </div>
        <RadarChart scores={session.scores} average={avg} averageLabel={`${group} 평균`} />
      </section>

      <table className="mt-8 w-full text-[15px] leading-[1.5]">
        <caption className="sr-only">영역별 점수와 평균 비교</caption>
        <thead>
          <tr className="border-b border-[#1e2124] text-left">
            <th scope="col" className="py-2 font-bold">영역</th>
            <th scope="col" className="py-2 text-right font-bold">내 점수</th>
            <th scope="col" className="py-2 text-right font-bold">평균</th>
            <th scope="col" className="py-2 text-right font-bold">차이</th>
          </tr>
        </thead>
        <tbody>
          {AREAS.map((a) => (
            <tr key={a.id} className="border-b border-[#e6e8ea]">
              <th scope="row" className="py-2 text-left font-normal">{a.label}</th>
              <td className="py-2 text-right font-bold tabular-nums">{session.scores[a.id]}</td>
              <td className="py-2 text-right tabular-nums text-[#58616a]">{avg[a.id]}</td>
              <td className="py-2 text-right tabular-nums">
                <Diff value={session.scores[a.id] - avg[a.id]} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <section className="mt-8">
        <h2 className="text-[17px] font-bold">관리가 필요한 영역</h2>
        <ul className="mt-3 space-y-2">
          {focus.map((a) => (
            <li key={a.id} className="rounded-[10px] bg-[#f4f5f6] px-4 py-3 text-[15px] leading-[1.5]">
              <b>{a.label}</b>: {a.care}
            </li>
          ))}
        </ul>
      </section>

      {session.memo && (
        <section className="mt-6 rounded-[10px] border border-[#cdd1d5] px-4 py-3 text-[15px] leading-[1.5]">
          <p className="font-bold">상담 메모</p>
          <p className="mt-1">{session.memo}</p>
        </section>
      )}

      <footer className="mt-auto border-t border-[#cdd1d5] pt-3 text-[13px] leading-[1.5] text-[#58616a]">
        본 결과지는 진단기 측정값을 바탕으로 한 참고 자료이며 의학적 진단을 대신하지 않습니다.
      </footer>
    </article>
  );
}

function Diff({ value, suffix = "" }: { value: number; suffix?: string }) {
  if (value === 0) return <span className="text-[#58616a]">같음</span>;
  // 색만으로 구분하지 않도록 ▲▼와 '높음/낮음' 문구를 함께 쓴다
  return (
    <span className={`whitespace-nowrap font-bold ${value > 0 ? "text-[#0b50d0]" : "text-[#bd2c0f]"}`}>
      {value > 0 ? "▲" : "▼"} {Math.abs(value)}
      {suffix} {suffix ? (value > 0 ? "높음" : "낮음") : ""}
    </span>
  );
}

/** 6개 영역 방사형 차트 — 내 점수(파랑 실선·면) vs 비교 평균(회색 점선) */
function RadarChart({ scores, average, averageLabel }: { scores: Scores; average: Scores; averageLabel: string }) {
  const size = 400;
  const c = size / 2;
  const r = 118;
  const angle = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / AREAS.length;
  const point = (i: number, v: number) => [c + Math.cos(angle(i)) * (r * v) / 100, c + Math.sin(angle(i)) * (r * v) / 100];
  const poly = (s: Scores) => AREAS.map((a, i) => point(i, s[a.id]).join(",")).join(" ");
  const [hover, setHover] = useState<number | null>(null);

  const rings = useMemo(() => [20, 40, 60, 80, 100], []);

  return (
    <figure>
      <figcaption className="mb-2 flex justify-end gap-4 text-[13px] text-[#464c53]">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-[2px] w-5 bg-[#256ef4]" aria-hidden />
          내 점수
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-5 border-t-2 border-dashed border-[#6d7882]" aria-hidden />
          {averageLabel}
        </span>
      </figcaption>
      <svg viewBox={`0 20 ${size} ${size - 40}`} width={size} height={size - 40} role="img" aria-label="영역별 점수 방사형 차트">
        {rings.map((v) => (
          <polygon
            key={v}
            points={AREAS.map((_, i) => point(i, v).join(",")).join(" ")}
            fill="none"
            stroke="#e6e8ea"
            strokeWidth={1}
          />
        ))}
        {AREAS.map((a, i) => {
          const [x, y] = point(i, 100);
          const [lx, ly] = point(i, 122);
          return (
            <g key={a.id}>
              <line x1={c} y1={c} x2={x} y2={y} stroke="#e6e8ea" strokeWidth={1} />
              <text
                x={lx}
                y={ly}
                textAnchor={Math.abs(lx - c) < 4 ? "middle" : lx > c ? "start" : "end"}
                dominantBaseline="middle"
                fontSize={13}
                fontWeight={700}
                fill="#464c53"
              >
                {a.label}
              </text>
            </g>
          );
        })}
        <polygon points={poly(average)} fill="none" stroke="#6d7882" strokeWidth={2} strokeDasharray="5 4" />
        <polygon points={poly(scores)} fill="rgba(37,110,244,0.14)" stroke="#256ef4" strokeWidth={2} strokeLinejoin="round" />
        {AREAS.map((a, i) => {
          const [x, y] = point(i, scores[a.id]);
          return (
            <g key={a.id} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
              <circle cx={x} cy={y} r={12} fill="transparent" />
              <circle cx={x} cy={y} r={4} fill="#256ef4" stroke="#fff" strokeWidth={2} />
            </g>
          );
        })}
        {hover !== null && (() => {
          const a = AREAS[hover];
          const [x, y] = point(hover, scores[a.id]);
          const tx = Math.min(Math.max(x - 60, 4), size - 124);
          const ty = y > c ? y - 52 : y + 12;
          return (
            <g pointerEvents="none">
              <rect x={tx} y={ty} width={120} height={40} rx={6} fill="#1e2124" />
              <text x={tx + 10} y={ty + 17} fontSize={12} fill="#fff" fontWeight={700}>
                {a.label} {scores[a.id]}점
              </text>
              <text x={tx + 10} y={ty + 32} fontSize={12} fill="#cdd1d5">
                평균 {average[a.id]}점
              </text>
            </g>
          );
        })()}
      </svg>
    </figure>
  );
}
