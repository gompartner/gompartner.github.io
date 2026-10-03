"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { IBM_Plex_Sans_KR } from "next/font/google";
import {
  CalendarDays,
  CheckCircle2,
  Download,
  FileSearch,
  Inbox,
  Paperclip,
  RotateCcw,
  Search,
  X,
  XCircle,
} from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

const plex = IBM_Plex_Sans_KR({ preload: false, weight: ["400", "700"], subsets: ["latin"], display: "swap" });

const STORAGE_KEY = "gs-demo:application:v1";

/* 지원사업 신청·심사 시스템 데모 (가상 기관 ○○진흥원).
   신청자는 모집 공고에서 사업을 골라 3단계 신청서를 제출하고,
   관리자는 신청 목록을 검색·심사하고 통계와 엑셀 파일을 받는다.

   디자인: 사람이 일하는 사진을 화면 가득 깔고, 마감이 가장 가까운 사업의 D-day를 가장 크게 보여준다.
   공고 카드마다 분야 사진을 넣고, 관리자 화면은 상태별 도넛 차트와 사업별 누적 막대로 현황을 보여준다.

   사진(Unsplash 무료 라이선스): 첫 화면 Van Tay Media(Hh-PIe3qIug), 인턴십 Vitaly Gariev(ztHn6CEx2e8),
   창업 Mimi Thian(jxUuXxUFfp4), 디지털 전환 EvoMao(whfShwuM2LM), 연구 인력 National Cancer Institute(AkhByKwf5N8) */

const C = {
  brand: "#00745c",
  brandDeep: "#00513f",
  brandTint: "#e2f2ec",
  ink: "#15201c",
  sub: "#45524d",
  mute: "#5b6862",
  line: "#d3dbd7",
  paper: "#f6f8f6",
  sun: "#f5c33b",
  danger: "#b3261e",
  warning: "#8a5a00",
  success: "#1d7a3a",
};

type Status = "접수" | "서류 검토" | "선정" | "탈락";

interface Program {
  id: string;
  name: string;
  start: string;
  end: string;
  target: string;
  support: string;
  category: string;
  image: string;
}

interface Application {
  id: string;
  programId: string;
  name: string;
  phone: string;
  email: string;
  org: string;
  motive: string;
  field: string;
  files: string[];
  date: string;
  status: Status;
  memo: string;
}

interface State {
  apps: Application[];
  mine: string[];
}

const PROGRAMS: Program[] = [
  {
    id: "p1",
    image: "/images/demo-application/p1.jpg",
    name: "2026년 경력 재개 여성 인턴십 지원사업",
    start: "2026-09-01",
    end: "2026-10-15",
    target: "경력 단절 기간 1년 이상인 여성",
    support: "3개월 인턴십 연계, 월 150만 원 지원",
    category: "인력",
  },
  {
    id: "p2",
    image: "/images/demo-application/p2.jpg",
    name: "청년 창업 초기 사업화 지원",
    start: "2026-09-15",
    end: "2026-10-31",
    target: "창업 3년 이내 만 39세 이하 대표자",
    support: "사업화 자금 최대 2,000만 원, 전문가 멘토링",
    category: "창업",
  },
  {
    id: "p3",
    image: "/images/demo-application/p3.jpg",
    name: "중소기업 디지털 전환 컨설팅",
    start: "2026-08-01",
    end: "2026-10-05",
    target: "상시 근로자 50인 미만 중소기업",
    support: "업무 시스템 진단과 전환 컨설팅 5회",
    category: "기업",
  },
  {
    id: "p4",
    image: "/images/demo-application/p4.jpg",
    name: "2026년 상반기 연구 인력 채용 지원",
    start: "2026-03-02",
    end: "2026-04-30",
    target: "연구 인력을 신규 채용하는 기업",
    support: "채용 인력 인건비 50% 지원 (최대 1년)",
    category: "인력",
  },
];

const FIELDS = ["IT·소프트웨어", "바이오·의료", "제조·기계", "문화·콘텐츠", "환경·에너지", "기타"];

const STATUSES: Status[] = ["접수", "서류 검토", "선정", "탈락"];

// color는 글자(대비 4.5:1 이상), fill은 차트 면 색
const STATUS_STYLE: Record<Status, { color: string; fill: string; icon: typeof Inbox }> = {
  접수: { color: C.sub, fill: "#8fa39b", icon: Inbox },
  "서류 검토": { color: C.warning, fill: C.sun, icon: FileSearch },
  선정: { color: C.success, fill: C.brand, icon: CheckCircle2 },
  탈락: { color: C.danger, fill: "#d8574f", icon: XCircle },
};

const SEED_NAMES = [
  "김하늘", "이서연", "박지훈", "최민지", "정우진", "강수아", "조현우", "윤지아", "장도현", "임하은",
  "한예린", "오승민", "서지유", "신동현", "권나윤", "황민재", "안소희", "송재원", "전유나", "홍석진",
];
const SEED_ORGS = ["개인", "주식회사 △△랩", "□□디자인", "개인", "☆☆소프트", "개인", "◇◇바이오", "△△에너지"];
const SEED_STATUS: Status[] = ["접수", "서류 검토", "선정", "탈락", "서류 검토", "접수", "선정", "서류 검토", "접수", "탈락"];

function buildSeed(): Application[] {
  return SEED_NAMES.map((name, i) => {
    const program = PROGRAMS[i % 4];
    const day = 3 + ((i * 7) % 25);
    const month = program.id === "p4" ? 4 : 9;
    const mm = String(month).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    return {
      id: `2026-${mm}${dd}-${String(i + 1).padStart(3, "0")}`,
      programId: program.id,
      name,
      phone: `010-${String(2000 + i * 137).slice(0, 4)}-${String(1000 + i * 311).slice(0, 4)}`,
      email: `sample${i + 1}@example.com`,
      org: SEED_ORGS[i % SEED_ORGS.length],
      motive: "관련 분야 경력을 살려 다시 일을 시작하고 싶어 신청합니다. 사업 참여 후 계획은 첨부한 신청서에 적었습니다.",
      field: FIELDS[i % FIELDS.length],
      files: ["신청서.hwp", i % 3 === 0 ? "사업자등록증.pdf" : "경력증명서.pdf"],
      date: `2026-${mm}-${dd}`,
      status: program.id === "p4" ? (i % 2 ? "선정" : "탈락") : SEED_STATUS[i % SEED_STATUS.length],
      memo: "",
    };
  });
}

const INITIAL_STATE: State = { apps: buildSeed(), mine: [] };

const CHOSEONG = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ";

/** 가운데 글자를 초성으로 바꾼다. 김하늘은 김ㅎ늘, 이도는 이ㄷ */
function maskName(name: string) {
  const chars = [...name.trim()];
  if (chars.length < 2) return name;
  const toChoseong = (c: string) => {
    const code = c.charCodeAt(0) - 0xac00;
    return code >= 0 && code <= 11171 ? CHOSEONG[Math.floor(code / 588)] : "*";
  };
  if (chars.length === 2) return chars[0] + toChoseong(chars[1]);
  return chars[0] + chars.slice(1, -1).map(toChoseong).join("") + chars[chars.length - 1];
}

const programName = (id: string) => PROGRAMS.find((p) => p.id === id)?.name ?? "";

/** 마감일까지 남은 날짜. 오늘 마감이면 0, 지났으면 음수 */
function daysLeft(end: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(`${end}T00:00:00`);
  return Math.round((due.getTime() - today.getTime()) / 86400000);
}

const dot = (d: string) => d.replaceAll("-", ".");

function StatusBadge({ status }: { status: Status }) {
  const { color, icon: Icon } = STATUS_STYLE[status];
  return (
    <span className="inline-flex items-center gap-1 whitespace-nowrap text-[15px] font-bold" style={{ color }}>
      <Icon size={16} aria-hidden />
      {status}
    </span>
  );
}

const focusRing = "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#00745c]";
const inputClass = `mt-1.5 h-12 w-full rounded-lg border-[1.5px] border-[#8a9791] bg-white px-3.5 text-[17px] font-normal text-[#15201c] ${focusRing}`;
const errorInput = "!border-[#b3261e] bg-[#fdf0ef]";
const primaryBtn = `inline-flex h-12 items-center justify-center gap-1.5 rounded-full bg-[#00745c] px-6 text-[17px] font-bold text-white transition-colors hover:bg-[#00513f] disabled:bg-[#b8c3be] disabled:text-white ${focusRing}`;
const secondaryBtn = `inline-flex h-12 items-center justify-center gap-1.5 rounded-full border-[1.5px] border-[#15201c] bg-white px-6 text-[17px] font-bold text-[#15201c] transition-colors hover:bg-[#e2f2ec] ${focusRing}`;

export function ApplicationDemo() {
  const [state, setState, hydrated] = useLocalStorage<State>(STORAGE_KEY, INITIAL_STATE);
  const [view, setView] = useState<"applicant" | "admin">("applicant");

  const updateApp = (id: string, patch: Partial<Application>) =>
    setState((s) => ({ ...s, apps: s.apps.map((a) => (a.id === id ? { ...a, ...patch } : a)) }));

  const admin = view === "admin";

  return (
    <div
      className={`${plex.className} min-h-screen text-[17px] leading-[1.6] text-[#15201c]`}
      style={{ background: admin ? "#eef1ef" : C.paper }}
    >
      <header className={admin ? "bg-[#15201c] text-white" : "bg-white"}>
        <div className="mx-auto flex max-w-[1248px] flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 md:px-6">
          <div className="flex items-center gap-2.5">
            <Emblem inverse={admin} />
            <div className="leading-[1.3]">
              <p className="text-[19px] font-bold tracking-[-0.02em]">○○진흥원</p>
              <p className={`text-[15px] ${admin ? "text-[#c4cfca]" : "text-[#5b6862]"}`}>
                {admin ? "지원사업 심사 관리" : "지원사업 통합 신청"}
              </p>
            </div>
          </div>
          <div
            aria-label="화면 선택"
            role="group"
            className={`ml-auto inline-flex rounded-full p-1 ${admin ? "bg-white/10" : "bg-[#e2f2ec]"}`}
          >
            {(
              [
                ["applicant", "신청자 화면"],
                ["admin", "관리자 화면"],
              ] as const
            ).map(([id, label]) => {
              const on = view === id;
              return (
                <button
                  key={id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setView(id)}
                  className={`h-10 rounded-full px-4 text-[15px] font-bold transition-colors ${focusRing} ${
                    on
                      ? admin
                        ? "bg-white text-[#15201c]"
                        : "bg-[#00745c] text-white"
                      : admin
                        ? "text-[#dfe7e3] hover:bg-white/10"
                        : "text-[#00513f] hover:bg-white"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {!hydrated ? (
        <p className="py-24 text-center text-[#5b6862]">불러오는 중</p>
      ) : admin ? (
        <main className="mx-auto max-w-[1248px] px-4 py-8 pb-28 md:px-6">
          <AdminView state={state} updateApp={updateApp} reset={() => setState(INITIAL_STATE)} />
        </main>
      ) : (
        <ApplicantView state={state} setState={setState} />
      )}
    </div>
  );
}

/** ○○진흥원 상징: 초록 원 안의 새싹 모양 */
function Emblem({ inverse }: { inverse: boolean }) {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" aria-hidden>
      <circle cx="18" cy="18" r="18" fill={inverse ? "#ffffff" : C.brand} />
      <path d="M18 27V16" stroke={inverse ? C.ink : "#fff"} strokeWidth="2.6" strokeLinecap="round" />
      <path d="M18 18c0-4.5 3.2-7.5 8-7.5 0 4.5-3.2 7.5-8 7.5Z" fill={C.sun} />
      <path d="M18 21c0-3.6-2.6-6-6.5-6 0 3.6 2.6 6 6.5 6Z" fill={inverse ? C.ink : "#fff"} />
    </svg>
  );
}

// 신청자 화면

interface FormData {
  name: string;
  phone: string;
  email: string;
  org: string;
  motive: string;
  field: string;
  files: string[];
  agree: boolean;
}

const EMPTY_FORM: FormData = { name: "", phone: "", email: "", org: "", motive: "", field: "", files: [], agree: false };

type Errors = Partial<Record<keyof FormData, string>>;

function validate(step: number, f: FormData): Errors {
  const e: Errors = {};
  if (step === 1) {
    if (!f.name.trim()) e.name = "이름을 입력해 주세요.";
    if (!/^01[016789]-?\d{3,4}-?\d{4}$/.test(f.phone.trim())) e.phone = "휴대전화 번호를 010-1234-5678 형식으로 입력해 주세요.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) e.email = "이메일 주소를 확인해 주세요.";
    if (!f.org.trim()) e.org = "소속을 입력해 주세요. 없으면 '개인'으로 입력합니다.";
  }
  if (step === 2) {
    if (!f.field) e.field = "희망 분야를 선택해 주세요.";
    if (f.motive.trim().length < 20) e.motive = "신청 동기를 20자 이상 입력해 주세요.";
  }
  if (step === 3) {
    if (!f.files.length) e.files = "신청서 파일을 첨부해 주세요.";
    if (!f.agree) e.agree = "개인정보 수집·이용에 동의해야 신청할 수 있습니다.";
  }
  return e;
}

const STEPS = ["기본 정보", "신청 내용", "서류 첨부"];

function ApplicantView({ state, setState }: { state: State; setState: (u: (s: State) => State) => void }) {
  const [programId, setProgramId] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<Errors>({});
  const [doneId, setDoneId] = useState<string | null>(null);

  const mine = state.apps.filter((a) => state.mine.includes(a.id));
  const openCount = PROGRAMS.filter((p) => daysLeft(p.end) >= 0).length;

  function start(id: string) {
    setProgramId(id);
    setStep(1);
    setForm(EMPTY_FORM);
    setErrors({});
    setDoneId(null);
    window.scrollTo({ top: 0 });
  }

  function next() {
    const e = validate(step, form);
    setErrors(e);
    if (Object.keys(e).length) return;
    if (step < 3) {
      setStep(step + 1);
      return;
    }
    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const id = `${now.getFullYear()}-${mm}${dd}-${String(state.apps.length + 1).padStart(3, "0")}`;
    const app: Application = {
      id,
      programId: programId!,
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      org: form.org.trim(),
      motive: form.motive.trim(),
      field: form.field,
      files: form.files,
      date: `${now.getFullYear()}-${mm}-${dd}`,
      status: "접수",
      memo: "",
    };
    setState((s) => ({ apps: [app, ...s.apps], mine: [id, ...s.mine] }));
    setDoneId(id);
  }

  const set = <K extends keyof FormData>(key: K, value: FormData[K]) => setForm((f) => ({ ...f, [key]: value }));

  if (programId && doneId) {
    return (
      <main className="mx-auto max-w-[1248px] px-4 py-10 pb-28 md:px-6">
        <section className="mx-auto max-w-[640px] overflow-hidden rounded-2xl bg-white ring-1 ring-[#d3dbd7]">
          <div className="relative isolate overflow-hidden bg-[#00745c] px-6 py-10 text-center text-white">
            <Image src={PROGRAMS.find((p) => p.id === programId)!.image} alt="" fill sizes="640px" className="-z-20 object-cover" />
            <span aria-hidden className="absolute inset-0 -z-10 bg-[rgba(0,81,63,0.86)]" />
            <CheckCircle2 size={44} className="mx-auto" aria-hidden />
            <h2 className="mt-3 text-[26px] font-bold tracking-[-0.02em]">신청이 접수되었습니다</h2>
            <p className="mt-1 text-[#d7efe7]">{programName(programId)}</p>
          </div>
          <div className="px-6 py-8 text-center">
            <p className="text-[15px] text-[#5b6862]">접수번호</p>
            <p className="text-[32px] font-bold tabular-nums tracking-[-0.01em]">{doneId}</p>
            <p className="mt-3 text-[15px] text-[#5b6862]">심사 결과는 내 신청 조회에서 확인할 수 있습니다.</p>
            <button type="button" onClick={() => setProgramId(null)} className={`${primaryBtn} mt-6`}>
              목록으로
            </button>
          </div>
        </section>
      </main>
    );
  }

  if (programId) {
    const program = PROGRAMS.find((p) => p.id === programId)!;
    return (
      <main className="mx-auto max-w-[1248px] px-4 py-8 pb-28 md:px-6">
        <div className="mx-auto grid max-w-[960px] overflow-hidden rounded-2xl bg-white ring-1 ring-[#d3dbd7] md:grid-cols-[260px_1fr]">
          <aside className="relative isolate overflow-hidden bg-[#00513f] p-6 text-white md:p-8">
            <Image src={program.image} alt="" fill sizes="260px" className="-z-20 object-cover" />
            <span aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(0,81,63,0.78),rgba(0,58,45,0.96)_55%)]" />
            <p className="text-[15px] text-[#d7efe7]">신청서 작성</p>
            <h2 className="mt-1 text-[21px] font-bold leading-[1.4] tracking-[-0.02em]">{program.name}</h2>
            <p className="mt-2 text-[15px] text-[#d7efe7]">마감 {dot(program.end)}</p>
            <ol className="mt-6 flex gap-2 md:mt-10 md:flex-col md:gap-0" aria-label="작성 단계">
              {STEPS.map((label, i) => {
                const n = i + 1;
                const current = n === step;
                const done = n < step;
                return (
                  <li
                    key={label}
                    aria-current={current ? "step" : undefined}
                    className="relative flex flex-1 items-center gap-2 md:pb-8 md:last:pb-0"
                  >
                    {n < STEPS.length && (
                      <span className="absolute left-[15px] top-8 hidden h-[calc(100%-32px)] w-[2px] bg-white/30 md:block" aria-hidden>
                        <span
                          className="block w-full bg-[#f5c33b] transition-[height] duration-500 ease-out motion-reduce:transition-none"
                          style={{ height: done ? "100%" : "0%" }}
                        />
                      </span>
                    )}
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[15px] font-bold ${
                        current ? "bg-[#f5c33b] text-[#15201c]" : done ? "bg-white text-[#00745c]" : "border-2 border-white/50 text-white"
                      }`}
                    >
                      {done ? <CheckCircle2 size={18} aria-hidden /> : n}
                    </span>
                    <span className={`text-[15px] font-bold ${current ? "text-white" : "text-[#d7efe7]"} max-[420px]:sr-only`}>
                      {label}
                    </span>
                  </li>
                );
              })}
            </ol>
          </aside>

          <section className="p-6 md:p-10" aria-label={`${step}단계 ${STEPS[step - 1]}`}>
            <div className="flex gap-1.5" aria-hidden>
              {STEPS.map((label, i) => (
                <span key={label} className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#e3e9e6]">
                  <span
                    className="block h-full rounded-full bg-[#00745c] transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
                    style={{ transform: `scaleX(${i < step ? 1 : 0})`, transformOrigin: "left" }}
                  />
                </span>
              ))}
            </div>
            <p className="mt-5 text-[15px] font-bold tabular-nums text-[#00745c]">
              {step} / {STEPS.length}
            </p>
            <h3 className="text-[26px] font-bold tracking-[-0.02em]">
              {STEPS[step - 1]}
            </h3>
            <div className="mt-6 space-y-5">
              {step === 1 && (
                <>
                  <Field label="이름" error={errors.name}>
                    <input value={form.name} onChange={(e) => set("name", e.target.value)} maxLength={20} className={`${inputClass} ${errors.name ? errorInput : ""}`} />
                  </Field>
                  <Field label="휴대전화" error={errors.phone}>
                    <input
                      value={form.phone}
                      onChange={(e) => set("phone", e.target.value)}
                      inputMode="tel"
                      placeholder="010-1234-5678"
                      maxLength={13}
                      className={`${inputClass} ${errors.phone ? errorInput : ""}`}
                    />
                  </Field>
                  <Field label="이메일" error={errors.email}>
                    <input value={form.email} onChange={(e) => set("email", e.target.value)} inputMode="email" maxLength={60} className={`${inputClass} ${errors.email ? errorInput : ""}`} />
                  </Field>
                  <Field label="소속" error={errors.org}>
                    <input value={form.org} onChange={(e) => set("org", e.target.value)} maxLength={40} placeholder="회사명 또는 개인" className={`${inputClass} ${errors.org ? errorInput : ""}`} />
                  </Field>
                </>
              )}
              {step === 2 && (
                <>
                  <Field label="희망 분야" error={errors.field}>
                    <select value={form.field} onChange={(e) => set("field", e.target.value)} className={`${inputClass} ${errors.field ? errorInput : ""}`}>
                      <option value="">선택해 주세요</option>
                      {FIELDS.map((f) => (
                        <option key={f}>{f}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label={`신청 동기 (${form.motive.trim().length}/500자)`} error={errors.motive}>
                    <textarea
                      value={form.motive}
                      onChange={(e) => set("motive", e.target.value)}
                      maxLength={500}
                      rows={7}
                      className={`mt-1.5 w-full rounded-lg border-[1.5px] border-[#8a9791] px-3.5 py-3 text-[17px] font-normal leading-[1.6] ${focusRing} ${errors.motive ? errorInput : ""}`}
                    />
                  </Field>
                </>
              )}
              {step === 3 && (
                <>
                  <Field label="첨부 서류 (신청서 필수, 증빙 서류 선택)" error={errors.files}>
                    <span
                      className={`mt-1.5 flex min-h-[88px] cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed px-3 py-4 text-center font-normal focus-within:outline focus-within:outline-[3px] focus-within:outline-offset-2 focus-within:outline-[#00745c] ${
                        errors.files ? "border-[#b3261e] bg-[#fdf0ef]" : "border-[#8a9791] bg-[#f6f8f6] hover:bg-[#e2f2ec]"
                      }`}
                    >
                      <Paperclip size={20} aria-hidden />
                      <span className="font-bold text-[#00513f]">파일 선택</span>
                      <span className="text-[15px] text-[#5b6862]">hwp, pdf, jpg 파일, 여러 개 선택 가능</span>
                      <input
                        type="file"
                        multiple
                        className="sr-only"
                        onChange={(e) => set("files", [...(e.target.files ?? [])].map((f) => f.name))}
                      />
                    </span>
                  </Field>
                  {form.files.length > 0 && (
                    <ul className="space-y-1.5">
                      {form.files.map((name) => (
                        <li key={name} className="flex items-center gap-2 rounded-lg bg-[#e2f2ec] px-3 py-2 text-[15px] text-[#15201c]">
                          <Paperclip size={14} aria-hidden />
                          {name}
                        </li>
                      ))}
                    </ul>
                  )}
                  <div>
                    <dl className="grid grid-cols-[72px_1fr] gap-x-3 gap-y-1 rounded-lg border border-[#d3dbd7] p-4 text-[15px]">
                      <dt className="text-[#5b6862]">수집 항목</dt>
                      <dd>이름, 휴대전화, 이메일, 소속</dd>
                      <dt className="text-[#5b6862]">이용 목적</dt>
                      <dd>지원사업 신청 접수, 심사 결과 안내</dd>
                      <dt className="text-[#5b6862]">보유 기간</dt>
                      <dd>사업 종료 후 3년</dd>
                    </dl>
                    <label className="mt-3 flex items-center gap-2.5 font-bold">
                      <input
                        type="checkbox"
                        checked={form.agree}
                        onChange={(e) => set("agree", e.target.checked)}
                        className="h-6 w-6 shrink-0 accent-[#00745c]"
                      />
                      개인정보 수집·이용에 동의합니다. (필수)
                    </label>
                    {errors.agree && <p className="mt-1 text-[15px] font-bold text-[#b3261e]">{errors.agree}</p>}
                  </div>
                </>
              )}
            </div>

            <div className="mt-10 flex flex-wrap justify-between gap-3 border-t border-[#d3dbd7] pt-6">
              <button
                type="button"
                onClick={() => {
                  if (step === 1) {
                    setProgramId(null);
                    return;
                  }
                  setErrors({});
                  setStep(step - 1);
                }}
                className={secondaryBtn}
              >
                {step === 1 ? "취소" : "이전"}
              </button>
              <button type="button" onClick={next} className={primaryBtn}>
                {step === 3 ? "신청하기" : "다음"}
              </button>
            </div>
          </section>
        </div>
      </main>
    );
  }

  // 마감이 가장 가까운 모집 중 사업을 첫 화면에 크게 보여 준다
  const nearest = PROGRAMS.filter((p) => daysLeft(p.end) >= 0).sort((a, b) => daysLeft(a.end) - daysLeft(b.end))[0];
  const nearestLeft = nearest ? daysLeft(nearest.end) : 0;

  return (
    <main className="pb-28">
      <section aria-labelledby="notice-title" className="relative isolate overflow-hidden bg-[#0c1f19] text-white">
        <Image
          src="/images/demo-application/hero.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="-z-20 object-cover object-[60%_40%]"
        />
        <div
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{
            background:
              "linear-gradient(90deg, rgba(6,26,20,0.94) 0%, rgba(6,26,20,0.82) 38%, rgba(6,26,20,0.62) 70%, rgba(6,26,20,0.45) 100%), linear-gradient(0deg, rgba(6,26,20,0.9) 0%, rgba(6,26,20,0) 45%)",
          }}
        />
        {/* 좁은 화면에서는 글자가 사진 위에 겹치므로 한 겹 더 어둡게 */}
        <div aria-hidden className="absolute inset-0 -z-10 bg-[rgba(6,26,20,0.5)] md:hidden" />
        <div className="mx-auto grid max-w-[1248px] gap-10 px-4 pb-28 pt-14 md:px-6 md:pb-36 md:pt-24 lg:grid-cols-[1.3fr_1fr] lg:items-end">
          <div>
            <h1 id="notice-title" className="text-[40px] font-bold leading-[1.15] tracking-[-0.04em] md:text-[68px]">
              지원사업
              <br />
              모집 공고
            </h1>
            <p className="mt-5 text-[19px] text-[#d7efe7]">현재 {openCount}개 사업을 모집하고 있습니다.</p>
            <p className="mt-2 flex items-center gap-2 text-[15px] text-[#a9c9bd]">
              <CalendarDays size={18} aria-hidden />
              기준일 {dot(new Date().toISOString().slice(0, 10))}
            </p>
          </div>

          {nearest && (
            <div className="border-l-4 border-[#f5c33b] pl-5 md:pl-7">
              <p className="text-[15px] font-bold text-[#f5c33b]">마감 임박</p>
              <p className="mt-1 text-[96px] font-bold leading-[0.95] tracking-[-0.05em] tabular-nums text-[#f5c33b] md:text-[128px]">
                {nearestLeft === 0 ? "D-day" : `D-${nearestLeft}`}
              </p>
              <p className="mt-3 text-[21px] font-bold leading-[1.4] tracking-[-0.02em]">{nearest.name}</p>
              <p className="mt-1 text-[15px] text-[#c4dcd3]">
                {nearest.category} 분야, {dot(nearest.end)} 마감
              </p>
              <button
                type="button"
                onClick={() => start(nearest.id)}
                className={`mt-5 inline-flex h-12 items-center justify-center rounded-full bg-[#f5c33b] px-6 text-[17px] font-bold text-[#15201c] transition-[background-color,transform] duration-150 hover:bg-[#ffd55e] active:scale-[0.97] ${focusRing}`}
              >
                신청하기
              </button>
            </div>
          )}
        </div>
      </section>

      <section aria-label="사업 목록" className="relative mx-auto -mt-16 max-w-[1248px] px-4 md:-mt-20 md:px-6">
        <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {PROGRAMS.map((p) => (
            <ProgramCard key={p.id} program={p} onApply={() => start(p.id)} />
          ))}
        </ul>
      </section>

      <section aria-labelledby="mine-title" className="mx-auto max-w-[1248px] px-4 pt-16 md:px-6">
        <h2 id="mine-title" className="text-[26px] font-bold tracking-[-0.02em]">
          내 신청 조회
        </h2>
        {mine.length === 0 ? (
          <p className="mt-4 rounded-2xl border-2 border-dashed border-[#b8c3be] px-6 py-10 text-center text-[#45524d]">
            신청 내역이 없습니다. 모집 중인 사업에서 신청하기를 눌러 주세요.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-2xl bg-white ring-1 ring-[#d3dbd7]">
            <table className="w-full min-w-[560px] text-[15px]">
              <thead className="border-b-2 border-[#15201c] text-left">
                <tr>
                  <th scope="col" className="px-5 py-3 font-bold">접수번호</th>
                  <th scope="col" className="px-5 py-3 font-bold">사업명</th>
                  <th scope="col" className="px-5 py-3 font-bold">접수일</th>
                  <th scope="col" className="px-5 py-3 font-bold">상태</th>
                </tr>
              </thead>
              <tbody>
                {mine.map((a) => (
                  <tr key={a.id} className="border-t border-[#e3e9e6]">
                    <td className="px-5 py-3 tabular-nums">{a.id}</td>
                    <td className="px-5 py-3">{programName(a.programId)}</td>
                    <td className="px-5 py-3 tabular-nums">{dot(a.date)}</td>
                    <td className="px-5 py-3">
                      <StatusBadge status={a.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

function ProgramCard({ program: p, onApply }: { program: Program; onApply: () => void }) {
  const left = daysLeft(p.end);
  const closed = left < 0;
  const urgent = !closed && left <= 7;

  return (
    <li
      className={`flex flex-col overflow-hidden rounded-2xl bg-white ${
        closed ? "text-[#45524d] ring-1 ring-[#d3dbd7]" : "text-[#15201c] shadow-[0_24px_48px_-28px_rgba(0,40,30,0.6)]"
      }`}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[#0c1f19]">
        <Image
          src={p.image}
          alt=""
          fill
          sizes="(min-width: 1024px) 300px, (min-width: 768px) 50vw, 100vw"
          className={`object-cover ${closed ? "opacity-60 grayscale" : ""}`}
        />
        <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-[rgba(6,26,20,0.75)] to-transparent to-60%" />
        <span className="absolute bottom-3 left-4 text-[15px] font-bold text-white">{p.category} 분야</span>
        <span
          className={`absolute right-3 top-3 rounded-lg px-2.5 py-1 text-[17px] font-bold tabular-nums leading-[1.3] ${
            closed ? "bg-[#15201c]/80 text-white" : urgent ? "bg-[#f5c33b] text-[#15201c]" : "bg-white text-[#00513f]"
          }`}
        >
          {closed ? "모집 마감" : left === 0 ? "D-day" : `D-${left}`}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-[19px] font-bold leading-[1.4] tracking-[-0.02em]">{p.name}</h3>
        <p className={`mt-2 text-[15px] font-bold ${closed ? "" : "text-[#00745c]"}`}>{p.support}</p>
        <dl className="mt-3 grid grid-cols-[64px_1fr] gap-x-2 gap-y-1 text-[15px]">
          <dt className="text-[#5b6862]">모집 기간</dt>
          <dd className="tabular-nums">
            {dot(p.start)} ~ {dot(p.end)}
          </dd>
          <dt className="text-[#5b6862]">지원 대상</dt>
          <dd>{p.target}</dd>
        </dl>

        <div className="mt-auto pt-5">
          {closed ? (
            <p className="text-[15px] font-bold">모집이 끝난 사업입니다.</p>
          ) : (
            <button type="button" onClick={onApply} className={`${primaryBtn} w-full`}>
              신청하기
            </button>
          )}
        </div>
      </div>
    </li>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[17px] font-bold">
        {label}
        {children}
      </label>
      {error && <p className="mt-1 text-[15px] font-bold text-[#b3261e]">{error}</p>}
    </div>
  );
}

// 관리자 화면

const adminInput = `mt-1 h-11 w-full rounded-md border border-[#8a9791] bg-white px-3 text-[15px] font-normal ${focusRing}`;

function AdminView({
  state,
  updateApp,
  reset,
}: {
  state: State;
  updateApp: (id: string, patch: Partial<Application>) => void;
  reset: () => void;
}) {
  const [programFilter, setProgramFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "">("");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim();
    return state.apps.filter(
      (a) =>
        (!programFilter || a.programId === programFilter) &&
        (!statusFilter || a.status === statusFilter) &&
        (!q || a.id.includes(q) || a.name.includes(q)),
    );
  }, [state.apps, programFilter, statusFilter, query]);

  const counts = useMemo(
    () => Object.fromEntries(STATUSES.map((s) => [s, state.apps.filter((a) => a.status === s).length])) as Record<Status, number>,
    [state.apps],
  );
  const perProgram = PROGRAMS.map((p) => ({ program: p, count: state.apps.filter((a) => a.programId === p.id).length }));
  const maxCount = Math.max(1, ...perProgram.map((x) => x.count));
  const selected = state.apps.find((a) => a.id === selectedId) ?? null;

  function downloadCsv() {
    const header = ["접수번호", "사업명", "신청자", "연락처", "이메일", "소속", "희망 분야", "접수일", "상태"];
    const rows = filtered.map((a) => [a.id, programName(a.programId), a.name, a.phone, a.email, a.org, a.field, a.date, a.status]);
    const csv = [header, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\r\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "신청목록.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <section aria-labelledby="stat-title" className="rounded-xl bg-white ring-1 ring-[#d3dbd7]">
        <div className="flex flex-wrap items-center gap-3 border-b border-[#e3e9e6] px-5 py-4">
          <h2 id="stat-title" className="text-[19px] font-bold">
            신청 현황
          </h2>
          <button
            type="button"
            onClick={reset}
            className={`ml-auto inline-flex items-center gap-1 rounded-md px-2 py-1 text-[15px] font-bold text-[#00513f] underline underline-offset-4 ${focusRing}`}
          >
            <RotateCcw size={14} aria-hidden />
            예시로 초기화
          </button>
        </div>
        <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
          <div className="flex flex-col items-center gap-6 border-b border-[#e3e9e6] px-5 py-6 sm:flex-row lg:border-b-0 lg:border-r">
            <StatusDonut counts={counts} total={state.apps.length} />
            <dl className="grid w-full grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-1">
              {STATUSES.map((s) => (
                <div key={s} className="flex items-center justify-between gap-3">
                  <dt className="flex items-center gap-2">
                    <span aria-hidden className="h-3 w-3 rounded-[3px]" style={{ background: STATUS_STYLE[s].fill }} />
                    <StatusBadge status={s} />
                  </dt>
                  <dd className="text-[22px] font-bold tabular-nums">{counts[s]}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="px-5 py-6">
            <h3 className="text-[15px] font-bold text-[#45524d]">사업별 신청 수</h3>
            <ul className="mt-4 space-y-4">
              {perProgram.map(({ program, count }) => (
                <li key={program.id} className="flex items-center gap-3">
                  <span className="relative hidden h-10 w-10 shrink-0 overflow-hidden rounded-lg sm:block">
                    <Image src={program.image} alt="" fill sizes="40px" className="object-cover" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-3 text-[15px]">
                      <span className="truncate text-[#15201c]">{program.name}</span>
                      <span className="shrink-0 font-bold tabular-nums">{count}건</span>
                    </div>
                    <span
                      className="mt-1.5 flex h-3 overflow-hidden rounded-[4px] bg-[#eef1ef]"
                      style={{ width: `${Math.max(8, (count / maxCount) * 100)}%` }}
                      title={STATUSES.map((st) => `${st} ${state.apps.filter((a) => a.programId === program.id && a.status === st).length}건`).join(", ")}
                    >
                      {STATUSES.map((st) => {
                        const n = state.apps.filter((a) => a.programId === program.id && a.status === st).length;
                        return n ? <span key={st} style={{ flexGrow: n, background: STATUS_STYLE[st].fill }} /> : null;
                      })}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section aria-labelledby="list-title" className="rounded-xl bg-white ring-1 ring-[#d3dbd7]">
        <div className="border-b border-[#e3e9e6] px-5 py-4">
          <h2 id="list-title" className="text-[19px] font-bold">
            신청 목록
          </h2>
          <div className="mt-3 grid gap-3 md:grid-cols-[1.4fr_160px_1fr_auto]">
            <label className="block text-[15px] font-bold">
              사업
              <select value={programFilter} onChange={(e) => setProgramFilter(e.target.value)} className={adminInput}>
                <option value="">전체</option>
                {PROGRAMS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-[15px] font-bold">
              상태
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as Status | "")} className={adminInput}>
                <option value="">전체</option>
                {STATUSES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <label className="block text-[15px] font-bold">
              검색
              <span className="relative block">
                <Search size={17} className="pointer-events-none absolute left-3 top-1/2 mt-0.5 -translate-y-1/2 text-[#5b6862]" aria-hidden />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="접수번호 또는 이름" className={`${adminInput} pl-9`} />
              </span>
            </label>
            <div className="flex items-end">
              <button
                type="button"
                onClick={downloadCsv}
                className={`inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-md bg-[#15201c] px-4 text-[15px] font-bold text-white hover:bg-[#2c3a35] ${focusRing}`}
              >
                <Download size={17} aria-hidden />
                엑셀 다운로드
              </button>
            </div>
          </div>
        </div>

        {selected && <DetailPanel key={selected.id} app={selected} onClose={() => setSelectedId(null)} updateApp={updateApp} />}

        <p className="px-5 pt-3 text-[15px] text-[#5b6862]">
          총 <b className="text-[#15201c]">{filtered.length}</b>건
        </p>
        <div className="overflow-x-auto px-2 pb-2">
          <table className="w-full min-w-[720px] text-[15px]">
            <thead className="text-left text-[#45524d]">
              <tr className="border-b border-[#15201c]">
                <th scope="col" className="px-3 py-2.5 font-bold">접수번호</th>
                <th scope="col" className="px-3 py-2.5 font-bold">사업명</th>
                <th scope="col" className="px-3 py-2.5 font-bold">신청자</th>
                <th scope="col" className="px-3 py-2.5 font-bold">접수일</th>
                <th scope="col" className="px-3 py-2.5 font-bold">상태</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-12 text-center text-[#5b6862]">
                    조건에 맞는 신청이 없습니다. 검색어나 필터를 바꿔 보세요.
                  </td>
                </tr>
              ) : (
                filtered.map((a) => {
                  const active = a.id === selectedId;
                  return (
                    <tr
                      key={a.id}
                      className={`border-b border-[#eef1ef] ${active ? "bg-[#e2f2ec] shadow-[inset_3px_0_0_#00745c]" : "hover:bg-[#f6f8f6]"}`}
                    >
                      <td className="px-3 py-2.5">
                        <button
                          type="button"
                          onClick={() => setSelectedId(a.id)}
                          className={`rounded font-bold tabular-nums text-[#00513f] underline underline-offset-4 ${focusRing}`}
                        >
                          {a.id}
                        </button>
                      </td>
                      <td className="max-w-[300px] truncate px-3 py-2.5">{programName(a.programId)}</td>
                      <td className="px-3 py-2.5">{maskName(a.name)}</td>
                      <td className="px-3 py-2.5 tabular-nums text-[#45524d]">{dot(a.date)}</td>
                      <td className="px-3 py-2.5">
                        <StatusBadge status={a.status} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

/** 상태별 비율 도넛 차트. 가운데에 전체 신청 수를 쓴다 */
function StatusDonut({ counts, total }: { counts: Record<Status, number>; total: number }) {
  const r = 52;
  const circ = 2 * Math.PI * r;
  // 각 조각의 시작 위치 = 앞 조각 길이의 합
  const lens = STATUSES.map((s) => (total ? (counts[s] / total) * circ : 0));
  const starts = lens.map((_, i) => lens.slice(0, i).reduce((a, b) => a + b, 0));
  return (
    <figure className="relative h-[148px] w-[148px] shrink-0">
      <svg viewBox="0 0 132 132" className="h-full w-full -rotate-90" role="img" aria-label={`전체 신청 ${total}건 상태별 비율`}>
        <circle cx="66" cy="66" r={r} fill="none" stroke="#eef1ef" strokeWidth="18" />
        {STATUSES.map((s, i) => (
          <circle
            key={s}
            cx="66"
            cy="66"
            r={r}
            fill="none"
            stroke={STATUS_STYLE[s].fill}
            strokeWidth="18"
            strokeDasharray={`${Math.max(0, lens[i] - 2)} ${circ}`}
            strokeDashoffset={-starts[i]}
          />
        ))}
      </svg>
      <figcaption className="absolute inset-0 flex flex-col items-center justify-center leading-[1.2]">
        <span className="text-[13px] text-[#5b6862]">전체 신청</span>
        <span className="text-[34px] font-bold tabular-nums tracking-[-0.02em]">{total}</span>
      </figcaption>
    </figure>
  );
}

function DetailPanel({
  app,
  onClose,
  updateApp,
}: {
  app: Application;
  onClose: () => void;
  updateApp: (id: string, patch: Partial<Application>) => void;
}) {
  const [memo, setMemo] = useState(app.memo);
  const [saved, setSaved] = useState(false);

  return (
    <section aria-label="신청 상세" className="border-b border-[#e3e9e6] bg-[#f6f8f6] px-5 py-5">
      <div className="flex items-start gap-3">
        <div>
          <p className="text-[15px] tabular-nums text-[#5b6862]">접수번호 {app.id}</p>
          <h3 className="text-[19px] font-bold">{programName(app.programId)}</h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="상세 닫기"
          className={`ml-auto flex h-10 w-10 items-center justify-center rounded-md hover:bg-white ${focusRing}`}
        >
          <X size={20} aria-hidden />
        </button>
      </div>

      <div className="mt-4 grid gap-6 lg:grid-cols-2">
        <dl className="grid grid-cols-[84px_1fr] gap-x-3 gap-y-2 text-[15px]">
          <dt className="text-[#5b6862]">신청자</dt>
          <dd className="font-bold">{maskName(app.name)}</dd>
          <dt className="text-[#5b6862]">소속</dt>
          <dd>{app.org}</dd>
          <dt className="text-[#5b6862]">희망 분야</dt>
          <dd>{app.field}</dd>
          <dt className="text-[#5b6862]">접수일</dt>
          <dd className="tabular-nums">{dot(app.date)}</dd>
          <dt className="text-[#5b6862]">현재 상태</dt>
          <dd>
            <StatusBadge status={app.status} />
          </dd>
          <dt className="text-[#5b6862]">첨부 파일</dt>
          <dd>
            <ul className="space-y-1">
              {app.files.map((f) => (
                <li key={f} className="flex items-center gap-1.5">
                  <Paperclip size={14} aria-hidden />
                  {f}
                </li>
              ))}
            </ul>
          </dd>
        </dl>
        <div>
          <p className="text-[15px] font-bold">신청 동기</p>
          <p className="mt-1 rounded-md bg-white p-3 text-[15px] text-[#45524d] ring-1 ring-[#e3e9e6]">{app.motive}</p>
          <label className="mt-4 block text-[15px] font-bold">
            심사 메모
            <textarea
              value={memo}
              onChange={(e) => {
                setMemo(e.target.value);
                setSaved(false);
              }}
              maxLength={300}
              rows={3}
              className={`mt-1 w-full rounded-md border border-[#8a9791] bg-white px-3 py-2 text-[15px] font-normal leading-[1.6] ${focusRing}`}
            />
          </label>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="mr-1 text-[15px] font-bold">상태 변경</span>
        {STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            aria-pressed={app.status === s}
            onClick={() => updateApp(app.id, { status: s })}
            className={`h-10 rounded-md border px-4 text-[15px] font-bold ${focusRing} ${
              app.status === s ? "border-[#00745c] bg-[#00745c] text-white" : "border-[#8a9791] bg-white hover:bg-[#e2f2ec]"
            }`}
          >
            {s}
          </button>
        ))}
        <button
          type="button"
          onClick={() => {
            updateApp(app.id, { memo: memo.trim() });
            setSaved(true);
          }}
          className={`ml-auto inline-flex h-10 items-center rounded-md bg-[#15201c] px-4 text-[15px] font-bold text-white hover:bg-[#2c3a35] ${focusRing}`}
        >
          메모 저장
        </button>
      </div>
      {saved && (
        <p className="mt-2 text-right text-[15px] font-bold text-[#1d7a3a]" role="status">
          메모를 저장했습니다.
        </p>
      )}
    </section>
  );
}
