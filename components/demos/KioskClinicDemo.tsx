"use client";

// 병원(내과의원) 로비 접수 키오스크 카탈로그(11-01).
// 화면은 1080x1920 세로 설계값을 컨테이너 너비(cqw)에 맞춰 줄여 그린다. u(n)은 설계 px, f(n)은 큰 글씨 배율을 곱한 글자 크기.
// 무장애 키오스크 관례: 큰 글씨, 높은 대비, 단계 표시, 처음으로/이전 항상 노출, 음성 안내, 낮은 화면.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ALargeSmall,
  ArrowDownToLine,
  ChevronLeft,
  CircleCheck,
  ClipboardList,
  Clock,
  CreditCard,
  Delete,
  House,
  Pill,
  Pointer,
  Stethoscope,
  Syringe,
  UserCheck,
  UserPlus,
  Volume2,
  VolumeOff,
} from "lucide-react";
import { DemoMakerInfo } from "@/components/demos/DemoMakerInfo";
import { daysAgo, fmtDot, fmtKo, useDemoToday } from "@/hooks/useDemoToday";

const u = (n: number) => `calc(var(--u) * ${n})`;
const f = (n: number) => `calc(var(--u) * ${n} * var(--fs))`;
// 제목과 큰 숫자는 이미 커서 큰 글씨 모드에서 조금만 키운다.
const t = (n: number) => `calc(var(--u) * ${n} * var(--ft))`;
// 큰 글씨나 음성 자막이 켜지면 세로 여백과 버튼 높이를 줄여 한 화면에 담는다(터치 영역은 설계값 80 이상 유지).
const g = (n: number) => `calc(var(--u) * ${n} * var(--sp))`;

const C = {
  teal: "#0B5563",
  tealDark: "#083F4A",
  tealSoft: "#E3F0F2",
  ink: "#10212B",
  sub: "#3F5360",
  line: "#C9D5DB",
  surface: "#F2F5F7",
  accent: "#F2B33D",
  accentInk: "#2B1D00",
  danger: "#A3261B",
};

const FOCUS =
  "outline-none focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#D97706]";

type Step = "idle" | "type" | "verify" | "purpose" | "confirm" | "done";
type Visit = "first" | "return";
type Phase = "phone" | "birth" | "found";
type PurposeId = "general" | "checkup" | "vaccine" | "rx";

const STEPS: { id: Step; label: string }[] = [
  { id: "type", label: "접수 구분" },
  { id: "verify", label: "본인 확인" },
  { id: "purpose", label: "진료 선택" },
  { id: "confirm", label: "접수 확인" },
  { id: "done", label: "번호표" },
];

const PURPOSES: {
  id: PurposeId;
  label: string;
  hint: string;
  icon: typeof Stethoscope;
  chipTitle: string;
  chips: string[];
  ahead: number;
  wait: number;
  room: string;
}[] = [
  {
    id: "general",
    label: "내과 일반 진료",
    hint: "감기, 복통, 만성질환",
    icon: Stethoscope,
    chipTitle: "불편하신 곳을 골라 주세요",
    chips: [
      "감기 몸살",
      "열이 나요",
      "기침 가래",
      "목 통증",
      "복통",
      "소화불량",
      "설사",
      "두통",
      "어지러움",
      "혈압",
      "당뇨",
    ],
    ahead: 4,
    wait: 20,
    room: "1진료실",
  },
  {
    id: "checkup",
    label: "건강검진",
    hint: "국가검진, 채용검진",
    icon: ClipboardList,
    chipTitle: "검진 종류를 골라 주세요",
    chips: [
      "국가 일반검진",
      "국가 암검진",
      "위내시경",
      "채용 검진",
      "혈액 검사",
    ],
    ahead: 3,
    wait: 25,
    room: "검진실",
  },
  {
    id: "vaccine",
    label: "예방접종",
    hint: "독감, 대상포진, 폐렴구균",
    icon: Syringe,
    chipTitle: "접종 종류를 골라 주세요",
    chips: ["독감", "코로나19", "폐렴구균", "대상포진", "파상풍"],
    ahead: 2,
    wait: 10,
    room: "주사실",
  },
  {
    id: "rx",
    label: "처방전만",
    hint: "드시던 약 처방",
    icon: Pill,
    chipTitle: "처방 받으실 약을 골라 주세요",
    chips: ["혈압약", "당뇨약", "고지혈증약", "위장약", "그 밖의 약"],
    ahead: 2,
    wait: 5,
    room: "1진료실",
  },
];

const HOURS: { day: string; time: string; dow: number[] }[] = [
  { day: "평일", time: "09:00 - 18:30", dow: [1, 2, 3, 4, 5] },
  { day: "토요일", time: "09:00 - 13:00", dow: [6] },
  { day: "점심시간", time: "13:00 - 14:00", dow: [] },
  { day: "일요일, 공휴일", time: "휴진", dow: [0] },
];

const VoiceCtx = createContext(false);
const useVoiceOn = () => useContext(VoiceCtx);

const p2 = (n: number) => String(n).padStart(2, "0");
const maskPhone = (d: string) => `010-****-${d.slice(4, 8)}`;
const validBirth = (b: string) => {
  if (b.length !== 6) return false;
  const m = Number(b.slice(2, 4));
  const d = Number(b.slice(4, 6));
  return m >= 1 && m <= 12 && d >= 1 && d <= 31;
};

export function KioskClinicDemo() {
  const today = useDemoToday();
  const reduce = useReducedMotion();

  const [step, setStep] = useState<Step>("idle");
  const [visit, setVisit] = useState<Visit>("return");
  const [phase, setPhase] = useState<Phase>("phone");
  const [phone, setPhone] = useState("");
  const [birth, setBirth] = useState("");
  const [birthError, setBirthError] = useState(false);
  const [purpose, setPurpose] = useState<PurposeId | null>(null);
  const [chips, setChips] = useState<string[]>([]);
  const [agree, setAgree] = useState(false);
  const [ticket, setTicket] = useState<{ no: number; time: string } | null>(
    null,
  );
  const [nextNo, setNextNo] = useState(23);
  const [countdown, setCountdown] = useState(10);

  const [big, setBig] = useState(false);
  const [voice, setVoice] = useState(false);
  const [low, setLow] = useState(false);

  // 시계: 서버 렌더와 첫 화면은 비워 두고 브라우저에서 채운다.
  const [now, setNow] = useState<string | null>(null);
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setNow(`${p2(d.getHours())}:${p2(d.getMinutes())}`);
    };
    const frame = requestAnimationFrame(tick);
    const id = window.setInterval(tick, 10000);
    return () => {
      cancelAnimationFrame(frame);
      window.clearInterval(id);
    };
  }, []);

  const purposeInfo = PURPOSES.find((p) => p.id === purpose) ?? null;

  const reset = useCallback(() => {
    setStep("idle");
    setVisit("return");
    setPhase("phone");
    setPhone("");
    setBirth("");
    setBirthError(false);
    setPurpose(null);
    setChips([]);
    setAgree(false);
    setTicket(null);
    setCountdown(10);
  }, []);

  // 완료 화면 10초 뒤 첫 화면으로
  useEffect(() => {
    if (step !== "done") return;
    const id = window.setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => window.clearInterval(id);
  }, [step]);
  useEffect(() => {
    if (step === "done" && countdown <= 0) {
      const frame = requestAnimationFrame(reset);
      return () => cancelAnimationFrame(frame);
    }
  }, [step, countdown, reset]);

  const caption = useMemo(() => {
    switch (step) {
      case "idle":
        return "접수하시려면 화면을 눌러 주세요.";
      case "type":
        return "처음 오셨으면 초진, 오신 적이 있으면 재진을 눌러 주세요.";
      case "verify":
        if (phase === "phone") return "휴대폰 번호 뒤 여덟 자리를 눌러 주세요.";
        if (phase === "birth") return "생년월일 여섯 자리를 눌러 주세요.";
        return "화면의 이름이 맞으면 네, 맞습니다를 눌러 주세요.";
      case "purpose":
        return "진료 받으실 내용을 고른 뒤 다음을 눌러 주세요.";
      case "confirm":
        return "접수 내용을 확인하시고 접수하기를 눌러 주세요.";
      case "done":
        return `접수되었습니다. 대기번호는 ${ticket?.no ?? ""}번입니다. 번호표를 받아 주세요.`;
    }
  }, [step, phase, ticket]);

  // 음성 안내: 켜져 있으면 화면이 바뀔 때마다 읽어 준다. 지원하지 않는 브라우저는 자막만 보인다.
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      if (!voice) return;
      const say = new SpeechSynthesisUtterance(caption);
      say.lang = "ko-KR";
      say.rate = 0.95;
      window.speechSynthesis.speak(say);
    } catch {
      /* 음성 미지원 */
    }
  }, [voice, caption]);
  useEffect(
    () => () => {
      try {
        window.speechSynthesis?.cancel();
      } catch {
        /* 무시 */
      }
    },
    [],
  );

  const keypadTarget =
    step === "verify" && (phase === "phone" || phase === "birth")
      ? phase
      : null;
  const press = useCallback(
    (key: string) => {
      if (!keypadTarget) return;
      const set = keypadTarget === "phone" ? setPhone : setBirth;
      const max = keypadTarget === "phone" ? 8 : 6;
      if (keypadTarget === "birth") setBirthError(false);
      if (key === "back") set((v) => v.slice(0, -1));
      else if (key === "clear") set("");
      else set((v) => (v.length >= max ? v : v + key));
    },
    [keypadTarget],
  );

  const verifyNext = useCallback(() => {
    if (phase === "phone" && phone.length === 8)
      setPhase(visit === "return" ? "found" : "birth");
    else if (phase === "birth") {
      if (validBirth(birth)) setStep("purpose");
      else setBirthError(true);
    }
  }, [phase, phone, visit, birth]);

  // 실제 키보드 숫자도 받는다.
  useEffect(() => {
    if (!keypadTarget) return;
    const onKey = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLElement &&
        e.target.closest("button") &&
        e.key === "Enter"
      )
        return;
      if (/^[0-9]$/.test(e.key)) press(e.key);
      else if (e.key === "Backspace") press("back");
      else if (e.key === "Enter") verifyNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [keypadTarget, press, verifyNext]);

  const back = () => {
    if (step === "type") setStep("idle");
    else if (step === "verify") {
      if (phase === "phone") setStep("type");
      else setPhase("phone");
    } else if (step === "purpose") {
      setStep("verify");
      setPhase(visit === "return" ? "found" : "birth");
    } else if (step === "confirm") setStep("purpose");
  };

  const submit = () => {
    setTicket({ no: nextNo, time: now ?? "09:00" });
    setNextNo((n) => n + 1);
    setCountdown(10);
    setStep("done");
  };

  const mainRef = useRef<HTMLElement>(null);
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
  }, [step, phase]);

  const stepIndex = STEPS.findIndex((s) => s.id === step);

  const screenStyle = {
    "--u": "calc(100cqw / 1080)",
    "--fs": big ? 1.25 : 1,
    "--ft": big ? 1.08 : 1,
    "--sp": big && voice ? 0.74 : big || voice ? 0.84 : 1,
    color: C.ink,
  } as CSSProperties;

  const transition = reduce
    ? { duration: 0 }
    : { duration: 0.22, ease: [0.2, 0.7, 0.2, 1] as const };

  const screen = (
    <VoiceCtx.Provider value={voice}>
      <div
        className="absolute inset-0 flex flex-col overflow-hidden bg-white"
        style={screenStyle}
      >
        {/* 머리줄 */}
        <header
          className="flex shrink-0 items-center justify-between"
          style={{
            background: C.teal,
            color: "#fff",
            height: u(132),
            padding: `0 ${u(52)}`,
          }}
        >
          <div className="flex items-center" style={{ gap: u(18) }}>
            <Stethoscope aria-hidden style={{ width: u(56), height: u(56) }} />
            <span
              className="font-bold"
              style={{ fontSize: u(50), letterSpacing: "-0.01em" }}
            >
              내과의원
            </span>
          </div>
          <div className="flex items-baseline" style={{ gap: u(20) }}>
            <span style={{ fontSize: u(34), opacity: 0.92 }}>
              {fmtKo(today)}
            </span>
            <span
              className="font-bold tabular-nums"
              style={{ fontSize: u(46), minWidth: u(120), textAlign: "right" }}
            >
              {now ?? ""}
            </span>
          </div>
        </header>

        {/* 단계 표시 */}
        {step !== "idle" && (
          <div
            className="shrink-0"
            style={{ padding: `${u(30)} ${u(52)} ${u(10)}` }}
          >
            <div
              className="flex items-center justify-between"
              style={{ marginBottom: u(16) }}
            >
              <span
                className="font-bold"
                style={{ fontSize: f(38), color: C.teal }}
              >
                {STEPS[stepIndex]?.label}
              </span>
              <span
                className="font-semibold tabular-nums"
                style={{ fontSize: f(34), color: C.sub }}
              >
                {stepIndex + 1} / {STEPS.length} 단계
              </span>
            </div>
            <ol
              className="grid grid-cols-5"
              style={{ gap: u(12) }}
              aria-label="접수 단계"
            >
              {STEPS.map((s, i) => (
                <li
                  key={s.id}
                  aria-current={i === stepIndex ? "step" : undefined}
                  aria-label={`${i + 1}단계 ${s.label}`}
                  style={{
                    height: u(14),
                    borderRadius: u(7),
                    background:
                      i < stepIndex
                        ? C.teal
                        : i === stepIndex
                          ? C.accent
                          : "#DCE4E8",
                  }}
                />
              ))}
            </ol>
          </div>
        )}

        {/* 음성 안내 자막 */}
        {voice && (
          <div
            className="flex shrink-0 items-start"
            style={{
              margin: `${u(20)} ${u(52)} 0`,
              padding: `${u(22)} ${u(28)}`,
              gap: u(20),
              background: "#FFF6E0",
              border: `${u(3)} solid ${C.accent}`,
              borderRadius: u(14),
            }}
          >
            <span
              className="flex shrink-0 items-center font-bold"
              style={{
                gap: u(10),
                fontSize: u(30),
                color: C.accentInk,
                paddingTop: u(4),
              }}
            >
              <Volume2 aria-hidden style={{ width: u(40), height: u(40) }} />
              음성 안내 중
            </span>
            <p
              className="min-w-0 font-medium"
              style={{ fontSize: f(34), lineHeight: 1.4, color: C.accentInk }}
            >
              {caption}
            </p>
          </div>
        )}
        <p className="sr-only" aria-live="polite">
          {caption}
        </p>

        {/* 본문 */}
        <main
          ref={mainRef}
          className="relative min-h-0 flex-1 overflow-y-auto"
          style={{ padding: `${g(36)} ${u(52)} ${g(40)}` }}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`${step}-${phase}`}
              className="flex min-h-full flex-col"
              initial={reduce ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 1 } : { opacity: 0, y: -8 }}
              transition={transition}
            >
              {step === "idle" && (
                <IdleView
                  low={low}
                  big={big}
                  voice={voice}
                  today={today}
                  onStart={() => setStep("type")}
                  onBig={() => setBig((v) => !v)}
                  onVoice={() => setVoice((v) => !v)}
                  onLow={() => setLow((v) => !v)}
                />
              )}

              {step === "type" && (
                <StepBody
                  low={low}
                  title="접수 구분을 선택해 주세요"
                  sub="오늘 처음 오셨는지 알려 주세요"
                >
                  <div className="grid" style={{ gap: u(32) }}>
                    {(
                      [
                        {
                          id: "first",
                          label: "초진",
                          desc: "처음 오신 분",
                          icon: UserPlus,
                        },
                        {
                          id: "return",
                          label: "재진",
                          desc: "오신 적이 있는 분",
                          icon: UserCheck,
                        },
                      ] as const
                    ).map((o) => (
                      <button
                        key={o.id}
                        type="button"
                        aria-label={`${o.label}, ${o.desc}`}
                        onClick={() => {
                          setVisit(o.id);
                          setPhase("phone");
                          setStep("verify");
                        }}
                        className={`flex items-center text-left transition-colors active:brightness-95 ${FOCUS}`}
                        style={{
                          minHeight: g(330),
                          padding: `${u(40)} ${u(56)}`,
                          gap: u(44),
                          borderRadius: u(24),
                          border: `${u(4)} solid ${o.id === "first" ? C.teal : C.line}`,
                          background: o.id === "first" ? C.teal : "#fff",
                          color: o.id === "first" ? "#fff" : C.ink,
                        }}
                      >
                        <span
                          className="grid shrink-0 place-items-center"
                          style={{
                            width: u(180),
                            height: u(180),
                            borderRadius: "50%",
                            background:
                              o.id === "first"
                                ? "rgba(255,255,255,0.14)"
                                : C.tealSoft,
                          }}
                        >
                          <o.icon
                            aria-hidden
                            style={{
                              width: u(96),
                              height: u(96),
                              color: o.id === "first" ? "#fff" : C.teal,
                            }}
                          />
                        </span>
                        <span
                          className="flex min-w-0 flex-col"
                          style={{ gap: u(10) }}
                        >
                          <span
                            className="font-bold"
                            style={{ fontSize: t(96), lineHeight: 1.1 }}
                          >
                            {o.label}
                          </span>
                          <span
                            className="font-medium"
                            style={{
                              fontSize: f(42),
                              opacity: o.id === "first" ? 0.95 : 1,
                              color: o.id === "first" ? "#fff" : C.sub,
                            }}
                          >
                            {o.desc}
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>
                </StepBody>
              )}

              {step === "verify" && phase !== "found" && (
                <StepBody
                  low={low}
                  title={
                    phase === "phone"
                      ? "휴대폰 번호를 입력해 주세요"
                      : "생년월일 6자리를 입력해 주세요"
                  }
                  sub={
                    phase === "phone"
                      ? "010 다음 8자리를 눌러 주세요"
                      : "예를 들어 1984년 3월 12일은 840312"
                  }
                >
                  <div className="flex flex-col" style={{ gap: u(28) }}>
                    {phase === "phone" ? (
                      <PhoneDisplay value={phone} />
                    ) : (
                      <BirthDisplay value={birth} error={birthError} />
                    )}
                    {phase === "birth" && birthError && (
                      <p
                        role="alert"
                        className="font-semibold"
                        style={{
                          fontSize: f(36),
                          color: C.danger,
                          textAlign: "center",
                        }}
                      >
                        생년월일을 다시 확인해 주세요
                      </p>
                    )}
                    <Keypad onPress={press} />
                    <PrimaryButton
                      disabled={
                        phase === "phone"
                          ? phone.length !== 8
                          : birth.length !== 6
                      }
                      onClick={verifyNext}
                      label="다음"
                    />
                  </div>
                </StepBody>
              )}

              {step === "verify" && phase === "found" && (
                <StepBody
                  low={low}
                  title="본인이 맞으신가요?"
                  sub={`${maskPhone(phone)} 번호로 등록된 분입니다`}
                >
                  <div className="flex flex-col" style={{ gap: u(32) }}>
                    <div
                      style={{
                        border: `${u(3)} solid ${C.line}`,
                        borderRadius: u(24),
                        padding: `${g(48)} ${u(52)}`,
                        background: C.surface,
                      }}
                    >
                      <div
                        className="flex items-center"
                        style={{ gap: u(32), marginBottom: u(36) }}
                      >
                        <span
                          className="grid shrink-0 place-items-center"
                          style={{
                            width: u(140),
                            height: u(140),
                            borderRadius: "50%",
                            background: C.tealSoft,
                          }}
                        >
                          <UserCheck
                            aria-hidden
                            style={{
                              width: u(76),
                              height: u(76),
                              color: C.teal,
                            }}
                          />
                        </span>
                        <span
                          className="font-bold"
                          style={{ fontSize: t(88), lineHeight: 1.1 }}
                        >
                          김ㅎ늘 님
                        </span>
                      </div>
                      <dl className="grid" style={{ gap: u(18) }}>
                        <InfoRow k="생년월일" v="84년 **월 **일" />
                        <InfoRow k="휴대폰" v={maskPhone(phone)} />
                        <InfoRow k="최근 방문" v={fmtKo(daysAgo(today, 23))} />
                      </dl>
                    </div>
                    <PrimaryButton
                      label="네, 맞습니다"
                      onClick={() => setStep("purpose")}
                    />
                    <SecondaryButton
                      label="아니요, 다시 입력하겠습니다"
                      onClick={() => {
                        setPhone("");
                        setPhase("phone");
                      }}
                    />
                  </div>
                </StepBody>
              )}

              {step === "purpose" && (
                <StepBody low={low} title="진료 받으실 내용을 선택해 주세요">
                  <div className="flex flex-col" style={{ gap: u(32) }}>
                    <div
                      className="grid grid-cols-2"
                      style={{ gap: u(24) }}
                      role="radiogroup"
                      aria-label="진료 목적"
                    >
                      {PURPOSES.map((p) => {
                        const on = purpose === p.id;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            role="radio"
                            aria-checked={on}
                            aria-label={`${p.label}, ${p.hint}`}
                            onClick={() => {
                              if (purpose !== p.id) setChips([]);
                              setPurpose(p.id);
                            }}
                            className={`relative flex flex-col items-start text-left transition-colors ${FOCUS}`}
                            style={{
                              minHeight: g(250),
                              padding: `${u(34)} ${u(34)}`,
                              gap: u(12),
                              borderRadius: u(22),
                              border: `${u(4)} solid ${on ? C.teal : C.line}`,
                              background: on ? C.teal : "#fff",
                              color: on ? "#fff" : C.ink,
                            }}
                          >
                            <p.icon
                              aria-hidden
                              style={{
                                width: u(68),
                                height: u(68),
                                color: on ? "#fff" : C.teal,
                              }}
                            />
                            <span
                              className="font-bold"
                              style={{ fontSize: f(48), lineHeight: 1.2 }}
                            >
                              {p.label}
                            </span>
                            <span
                              style={{
                                fontSize: f(32),
                                lineHeight: 1.3,
                                color: on ? "#fff" : C.sub,
                              }}
                            >
                              {p.hint}
                            </span>
                            {on && (
                              <CircleCheck
                                aria-hidden
                                className="absolute"
                                style={{
                                  top: u(28),
                                  right: u(28),
                                  width: u(56),
                                  height: u(56),
                                  color: C.accent,
                                }}
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {purposeInfo && (
                      <section aria-label={purposeInfo.chipTitle}>
                        <div
                          className="flex items-baseline justify-between"
                          style={{ marginBottom: u(20), gap: u(16) }}
                        >
                          <h3 className="font-bold" style={{ fontSize: f(42) }}>
                            {purposeInfo.chipTitle}
                          </h3>
                          <span
                            className="shrink-0"
                            style={{ fontSize: f(30), color: C.sub }}
                          >
                            여러 개 선택
                          </span>
                        </div>
                        <div className="flex flex-wrap" style={{ gap: u(18) }}>
                          {purposeInfo.chips.map((c) => {
                            const on = chips.includes(c);
                            return (
                              <button
                                key={c}
                                type="button"
                                aria-pressed={on}
                                onClick={() =>
                                  setChips((v) =>
                                    on ? v.filter((x) => x !== c) : [...v, c],
                                  )
                                }
                                className={`flex items-center font-semibold ${FOCUS}`}
                                style={{
                                  minHeight: g(108),
                                  padding: `0 ${u(36)}`,
                                  gap: u(10),
                                  borderRadius: u(54),
                                  fontSize: f(38),
                                  border: `${u(3)} solid ${on ? C.tealDark : C.line}`,
                                  background: on ? C.tealSoft : "#fff",
                                  color: on ? C.tealDark : C.ink,
                                }}
                              >
                                {on && (
                                  <CircleCheck
                                    aria-hidden
                                    style={{ width: u(40), height: u(40) }}
                                  />
                                )}
                                {c}
                              </button>
                            );
                          })}
                        </div>
                      </section>
                    )}

                    <PrimaryButton
                      disabled={!purpose}
                      label="다음"
                      onClick={() => setStep("confirm")}
                    />
                  </div>
                </StepBody>
              )}

              {step === "confirm" && purposeInfo && (
                <StepBody low={low} title="접수 내용을 확인해 주세요">
                  <div className="flex flex-col" style={{ gap: u(30) }}>
                    <dl
                      className="grid"
                      style={{
                        border: `${u(3)} solid ${C.line}`,
                        borderRadius: u(24),
                        padding: `${u(24)} ${u(44)}`,
                      }}
                    >
                      <SummaryRow
                        k="접수 구분"
                        v={visit === "first" ? "초진 (처음 오신 분)" : "재진"}
                      />
                      <SummaryRow
                        k="성함"
                        v={visit === "first" ? "처음 오신 분" : "김ㅎ늘 님"}
                      />
                      <SummaryRow k="휴대폰" v={maskPhone(phone)} />
                      {visit === "first" && (
                        <SummaryRow
                          k="생년월일"
                          v={`${birth.slice(0, 2)}년 **월 **일`}
                        />
                      )}
                      <SummaryRow k="진료" v={purposeInfo.label} />
                      <SummaryRow
                        k="선택 항목"
                        v={chips.length ? chips.join(", ") : "선택 안 함"}
                      />
                      <SummaryRow k="진료 장소" v={purposeInfo.room} last />
                    </dl>

                    {visit === "first" && (
                      <button
                        type="button"
                        aria-pressed={agree}
                        onClick={() => setAgree((v) => !v)}
                        className={`flex items-center text-left ${FOCUS}`}
                        style={{
                          minHeight: g(130),
                          padding: `${g(20)} ${u(36)}`,
                          gap: u(24),
                          borderRadius: u(20),
                          border: `${u(4)} solid ${agree ? C.teal : C.line}`,
                          background: agree ? C.tealSoft : "#fff",
                        }}
                      >
                        <span
                          className="grid shrink-0 place-items-center"
                          style={{
                            width: u(64),
                            height: u(64),
                            borderRadius: u(12),
                            border: `${u(4)} solid ${agree ? C.teal : "#7C8E98"}`,
                            background: agree ? C.teal : "#fff",
                          }}
                        >
                          {agree && (
                            <CircleCheck
                              aria-hidden
                              style={{
                                width: u(44),
                                height: u(44),
                                color: "#fff",
                              }}
                            />
                          )}
                        </span>
                        <span
                          className="font-semibold"
                          style={{ fontSize: f(36), lineHeight: 1.35 }}
                        >
                          개인정보 수집, 이용에 동의합니다 (필수)
                        </span>
                      </button>
                    )}

                    <PrimaryButton
                      big
                      disabled={visit === "first" && !agree}
                      label="접수하기"
                      onClick={submit}
                    />
                  </div>
                </StepBody>
              )}

              {step === "done" && ticket && purposeInfo && (
                <DoneView
                  low={low}
                  reduce={!!reduce}
                  ticket={ticket}
                  purpose={purposeInfo}
                  dateText={`${fmtDot(today)} ${ticket.time}`}
                  countdown={countdown}
                  onHome={reset}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* 아래 고정 줄: 처음으로, 이전, 접근성 */}
        {step !== "idle" && step !== "done" && (
          <nav
            aria-label="화면 이동과 보조 기능"
            className="flex shrink-0 items-stretch"
            style={{
              background: C.surface,
              borderTop: `${u(3)} solid ${C.line}`,
              padding: `${u(24)} ${u(32)}`,
              gap: u(16),
            }}
          >
            <FooterButton label="처음으로" icon={House} onClick={reset} wide />
            <FooterButton label="이전" icon={ChevronLeft} onClick={back} wide />
            <div className="flex-1" />
            <FooterToggle
              label="큰 글씨"
              icon={ALargeSmall}
              on={big}
              onClick={() => setBig((v) => !v)}
            />
            <FooterToggle
              label="음성 안내"
              icon={voice ? Volume2 : VolumeOff}
              on={voice}
              onClick={() => setVoice((v) => !v)}
            />
            <FooterToggle
              label="낮은 화면"
              icon={ArrowDownToLine}
              on={low}
              onClick={() => setLow((v) => !v)}
            />
          </nav>
        )}
      </div>
    </VoiceCtx.Provider>
  );

  return (
    <div className="min-h-screen bg-[#E8E6E2] md:bg-[linear-gradient(180deg,#ECEAE6_0%,#ECEAE6_74%,#D6D1CA_74%,#D6D1CA_100%)]">
      <div className="flex flex-col items-center md:pt-5">
        {/* 키오스크 몸체 */}
        <div className="w-full md:w-auto md:rounded-[30px] md:border md:border-[#CFD4D8] md:bg-[#FBFBFA] md:p-[14px] md:shadow-[0_18px_40px_-18px_rgba(30,40,50,0.35)]">
          <div
            className="hidden items-center justify-center pb-[10px] md:flex"
            aria-hidden
          >
            <span className="h-[6px] w-[6px] rounded-full bg-[#9AA4AB]" />
          </div>
          <div className="relative w-full [container-type:inline-size] md:w-[calc(max(500px,100vh-250px)*9/16)]">
            <div className="relative aspect-[9/16] w-full overflow-hidden md:rounded-[10px] md:ring-[6px] md:ring-[#1D252B]">
              {screen}
            </div>
          </div>
          {/* 카드 단말기, 번호표 출구 */}
          <div
            className="hidden items-center justify-between px-3 pb-1 pt-4 md:flex"
            aria-hidden
          >
            <div className="flex items-center gap-2 text-[13px] font-semibold text-[#55636C]">
              <CreditCard className="h-5 w-5" />
              <span className="h-[8px] w-[56px] rounded-full bg-[#2B343A]" />
            </div>
            <div className="relative flex flex-col items-center">
              <span className="relative z-10 h-[10px] w-[96px] rounded-full bg-[#2B343A]" />
              <AnimatePresence>
                {step === "done" && (
                  <motion.span
                    key="paper"
                    className="-mt-[5px] block w-[78px] rounded-b-[3px] border border-[#D9DDE0] bg-white"
                    initial={reduce ? false : { height: 0 }}
                    animate={{ height: 34 }}
                    exit={{ opacity: 0 }}
                    transition={
                      reduce
                        ? { duration: 0 }
                        : { duration: 1.1, ease: "easeOut", delay: 0.3 }
                    }
                  />
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
        {/* 받침대 */}
        <div className="hidden flex-col items-center md:flex" aria-hidden>
          <div className="h-[34px] w-[90px] bg-[linear-gradient(90deg,#C9CED2,#E6E9EB,#C9CED2)]" />
          <div className="h-[16px] w-[260px] rounded-[50%] bg-[#BFC5CA] shadow-[0_10px_20px_-8px_rgba(0,0,0,0.35)]" />
        </div>
      </div>
      <div className="mx-auto max-w-[1200px] px-4 pb-8">
        <DemoMakerInfo className="mt-6" />
      </div>
    </div>
  );
}

/* ---------- 화면 조각 ---------- */

function StepBody({
  low,
  title,
  sub,
  children,
}: {
  low: boolean;
  title: string;
  sub?: string;
  children: ReactNode;
}) {
  // 음성 자막이 켜져 있으면 같은 내용의 보조 문장은 자막이 대신한다.
  const voiceOn = useVoiceOn();
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <div style={{ marginBottom: g(36) }}>
        <h2
          className="font-bold"
          style={{
            fontSize: t(66),
            lineHeight: 1.25,
            letterSpacing: "-0.015em",
          }}
        >
          {title}
        </h2>
        {sub && !voiceOn && (
          <p
            className="font-medium"
            style={{
              fontSize: f(36),
              color: C.sub,
              marginTop: u(14),
              lineHeight: 1.4,
            }}
          >
            {sub}
          </p>
        )}
      </div>
      <div className={low ? "mt-auto" : ""}>{children}</div>
    </div>
  );
}

function IdleView({
  low,
  big,
  voice,
  today,
  onStart,
  onBig,
  onVoice,
  onLow,
}: {
  low: boolean;
  big: boolean;
  voice: boolean;
  today: Date;
  onStart: () => void;
  onBig: () => void;
  onVoice: () => void;
  onLow: () => void;
}) {
  const dow = today.getDay();
  const start = (
    <button
      type="button"
      onClick={onStart}
      aria-label="접수 시작"
      className={`flex w-full flex-col items-center justify-center text-center ${FOCUS}`}
      style={{
        minHeight: low ? g(560) : g(860),
        borderRadius: u(28),
        background: C.teal,
        color: "#fff",
        padding: `${u(56)} ${u(40)}`,
        gap: u(40),
      }}
    >
      <span
        className="grid place-items-center"
        style={{
          width: u(200),
          height: u(200),
          borderRadius: "50%",
          background: "rgba(255,255,255,0.14)",
        }}
      >
        <Pointer aria-hidden style={{ width: u(110), height: u(110) }} />
      </span>
      <span
        className="font-bold"
        style={{ fontSize: t(82), lineHeight: 1.25, letterSpacing: "-0.02em" }}
      >
        접수하시려면
        <br />
        화면을 눌러 주세요
      </span>
      <span className="font-medium" style={{ fontSize: f(38), opacity: 0.95 }}>
        초진, 재진 모두 여기서 접수합니다
      </span>
    </button>
  );

  const hours = (
    <section
      aria-label="오늘 진료시간"
      style={{
        border: `${u(3)} solid ${C.line}`,
        borderRadius: u(24),
        padding: `${u(32)} ${u(44)}`,
      }}
    >
      <h2
        className="flex items-center font-bold"
        style={{
          fontSize: f(42),
          gap: u(14),
          marginBottom: u(16),
          color: C.teal,
        }}
      >
        <Clock aria-hidden style={{ width: u(48), height: u(48) }} />
        진료시간
      </h2>
      <dl className="grid">
        {HOURS.map((h, i) => {
          const isToday = h.dow.includes(dow) && h.time !== "휴진";
          return (
            <div
              key={h.day}
              className="flex items-center justify-between"
              style={{
                padding: `${u(14)} ${u(20)}`,
                margin: `0 ${u(-20)}`,
                borderRadius: u(12),
                background: isToday ? C.tealSoft : "transparent",
                borderTop:
                  i && !isToday
                    ? `${u(2)} solid #E3E9EC`
                    : `${u(2)} solid transparent`,
              }}
            >
              <dt
                className="flex items-center font-semibold"
                style={{ fontSize: f(38), gap: u(14) }}
              >
                {h.day}
                {isToday && (
                  <span
                    className="font-bold"
                    style={{
                      fontSize: f(28),
                      background: C.teal,
                      color: "#fff",
                      borderRadius: u(8),
                      padding: `${u(4)} ${u(14)}`,
                    }}
                  >
                    오늘
                  </span>
                )}
              </dt>
              <dd
                className="font-semibold tabular-nums"
                style={{
                  fontSize: f(38),
                  color: h.time === "휴진" ? C.danger : C.ink,
                }}
              >
                {h.time}
              </dd>
            </div>
          );
        })}
      </dl>
    </section>
  );

  const a11y = (
    <div className="grid grid-cols-3" style={{ gap: u(20) }}>
      <IdleToggle label="큰 글씨" icon={ALargeSmall} on={big} onClick={onBig} />
      <IdleToggle
        label="음성 안내"
        icon={voice ? Volume2 : VolumeOff}
        on={voice}
        onClick={onVoice}
      />
      <IdleToggle
        label="낮은 화면"
        icon={ArrowDownToLine}
        on={low}
        onClick={onLow}
      />
    </div>
  );

  return (
    <div className="flex min-h-full flex-1 flex-col" style={{ gap: u(32) }}>
      {low ? (
        <>
          {hours}
          <div className="mt-auto flex flex-col" style={{ gap: u(28) }}>
            {start}
            {a11y}
          </div>
        </>
      ) : (
        <>
          {start}
          {hours}
          <div className="mt-auto">{a11y}</div>
        </>
      )}
    </div>
  );
}

function IdleToggle({
  label,
  icon: Icon,
  on,
  onClick,
}: {
  label: string;
  icon: typeof Clock;
  on: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={`${label} ${on ? "켜짐" : "꺼짐"}`}
      onClick={onClick}
      className={`flex flex-col items-center justify-center font-bold ${FOCUS}`}
      style={{
        minHeight: g(190),
        gap: u(12),
        borderRadius: u(22),
        border: `${u(4)} solid ${on ? C.tealDark : C.line}`,
        background: on ? C.tealDark : C.surface,
        color: on ? "#fff" : C.ink,
        fontSize: u(38),
      }}
    >
      <Icon aria-hidden style={{ width: u(64), height: u(64) }} />
      {label}
      <span
        className="font-semibold"
        style={{ fontSize: u(28), color: on ? C.accent : C.sub }}
      >
        {on ? "켜짐" : "꺼짐"}
      </span>
    </button>
  );
}

function FooterButton({
  label,
  icon: Icon,
  onClick,
  disabled,
  wide,
}: {
  label: string;
  icon: typeof Clock;
  onClick: () => void;
  disabled?: boolean;
  wide?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`flex items-center justify-center font-bold disabled:opacity-40 ${FOCUS}`}
      style={{
        minWidth: wide ? u(210) : undefined,
        minHeight: u(140),
        padding: `0 ${u(24)}`,
        gap: u(8),
        borderRadius: u(20),
        border: `${u(3)} solid ${C.line}`,
        background: "#fff",
        color: C.ink,
        fontSize: u(38),
      }}
    >
      <Icon aria-hidden style={{ width: u(48), height: u(48) }} />
      {label}
    </button>
  );
}

function FooterToggle({
  label,
  icon: Icon,
  on,
  onClick,
}: {
  label: string;
  icon: typeof Clock;
  on: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      aria-label={`${label} ${on ? "켜짐" : "꺼짐"}`}
      className={`flex flex-col items-center justify-center font-semibold ${FOCUS}`}
      style={{
        width: u(150),
        minHeight: u(140),
        gap: u(6),
        borderRadius: u(20),
        border: `${u(3)} solid ${on ? C.tealDark : C.line}`,
        background: on ? C.tealDark : "#fff",
        color: on ? "#fff" : C.ink,
        fontSize: u(27),
      }}
    >
      <Icon aria-hidden style={{ width: u(50), height: u(50) }} />
      {label}
    </button>
  );
}

function PrimaryButton({
  label,
  onClick,
  disabled,
  big,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  big?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`w-full font-bold transition-colors disabled:cursor-not-allowed ${FOCUS}`}
      style={{
        minHeight: big ? g(180) : g(150),
        borderRadius: u(22),
        fontSize: f(big ? 56 : 48),
        background: disabled ? "#D5DDE1" : C.teal,
        color: disabled ? "#4A5A63" : "#fff",
      }}
    >
      {label}
    </button>
  );
}

function SecondaryButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full font-bold ${FOCUS}`}
      style={{
        minHeight: g(140),
        borderRadius: u(22),
        fontSize: f(42),
        border: `${u(4)} solid ${C.line}`,
        background: "#fff",
        color: C.ink,
      }}
    >
      {label}
    </button>
  );
}

function Keypad({ onPress }: { onPress: (k: string) => void }) {
  const keys = [
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "clear",
    "0",
    "back",
  ];
  return (
    <div
      className="grid grid-cols-3"
      style={{ gap: u(18) }}
      role="group"
      aria-label="숫자 키패드"
    >
      {keys.map((k) => {
        const isNum = /^[0-9]$/.test(k);
        return (
          <button
            key={k}
            type="button"
            onClick={() => onPress(k)}
            aria-label={
              k === "clear"
                ? "전체 지우기"
                : k === "back"
                  ? "한 칸 지우기"
                  : `숫자 ${k}`
            }
            className={`flex items-center justify-center font-bold active:brightness-90 ${FOCUS}`}
            style={{
              minHeight: g(138),
              borderRadius: u(20),
              border: `${u(3)} solid ${isNum ? C.line : "#AFC0C8"}`,
              background: isNum ? "#fff" : C.surface,
              color: C.ink,
              fontSize: isNum ? t(64) : f(38),
              gap: u(10),
            }}
          >
            {k === "back" ? (
              <>
                <Delete aria-hidden style={{ width: u(56), height: u(56) }} />
                <span>지움</span>
              </>
            ) : k === "clear" ? (
              "전체 지움"
            ) : (
              k
            )}
          </button>
        );
      })}
    </div>
  );
}

function Slot({
  char,
  masked,
  active,
}: {
  char?: string;
  masked?: boolean;
  active?: boolean;
}) {
  return (
    <span
      className="grid place-items-center font-bold tabular-nums"
      style={{
        width: u(70),
        height: g(100),
        borderBottom: `${u(6)} solid ${active ? C.accent : char ? C.teal : "#B9C6CD"}`,
        fontSize: t(64),
        color: C.ink,
      }}
    >
      {char ? (
        masked ? (
          <span
            aria-hidden
            style={{
              width: u(26),
              height: u(26),
              borderRadius: "50%",
              background: C.ink,
            }}
          />
        ) : (
          char
        )
      ) : null}
    </span>
  );
}

function PhoneDisplay({ value }: { value: string }) {
  const digits = Array.from({ length: 8 }, (_, i) => value[i]);
  return (
    <div
      className="flex items-center justify-center"
      style={{
        gap: u(10),
        background: C.surface,
        borderRadius: u(22),
        padding: `${g(28)} ${u(20)}`,
      }}
      aria-label={
        value.length
          ? `입력한 번호 010 다음 ${value.length}자리, 끝자리 ${value.slice(4)}`
          : "입력한 번호 없음"
      }
      role="status"
    >
      <span
        className="font-bold tabular-nums"
        style={{ fontSize: t(64), color: C.sub }}
      >
        010
      </span>
      <span
        aria-hidden
        style={{
          width: u(26),
          height: u(6),
          background: C.sub,
          margin: `0 ${u(4)}`,
        }}
      />
      {digits.slice(0, 4).map((d, i) => (
        <Slot key={i} char={d} masked active={i === value.length} />
      ))}
      <span
        aria-hidden
        style={{
          width: u(26),
          height: u(6),
          background: C.sub,
          margin: `0 ${u(4)}`,
        }}
      />
      {digits.slice(4).map((d, i) => (
        <Slot key={i + 4} char={d} active={i + 4 === value.length} />
      ))}
    </div>
  );
}

function BirthDisplay({ value, error }: { value: string; error: boolean }) {
  const digits = Array.from({ length: 6 }, (_, i) => value[i]);
  return (
    <div
      className="flex items-center justify-center"
      style={{
        gap: u(14),
        background: C.surface,
        borderRadius: u(22),
        padding: `${g(28)} ${u(20)}`,
        outline: error ? `${u(4)} solid ${C.danger}` : undefined,
      }}
      aria-label={`생년월일 ${value.length}자리 입력`}
      role="status"
    >
      {digits.map((d, i) => (
        <Slot key={i} char={d} masked={i >= 2} active={i === value.length} />
      ))}
    </div>
  );
}

function InfoRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between" style={{ gap: u(20) }}>
      <dt style={{ fontSize: f(38), color: C.sub }}>{k}</dt>
      <dd className="font-semibold tabular-nums" style={{ fontSize: f(42) }}>
        {v}
      </dd>
    </div>
  );
}

function SummaryRow({ k, v, last }: { k: string; v: string; last?: boolean }) {
  return (
    <div
      className="flex items-start justify-between"
      style={{
        padding: `${g(20)} 0`,
        gap: u(28),
        borderBottom: last ? undefined : `${u(2)} solid #E1E7EA`,
      }}
    >
      <dt className="shrink-0" style={{ fontSize: f(38), color: C.sub }}>
        {k}
      </dt>
      <dd
        className="min-w-0 text-right font-semibold"
        style={{ fontSize: f(42), lineHeight: 1.35, wordBreak: "keep-all" }}
      >
        {v}
      </dd>
    </div>
  );
}

function DoneView({
  low,
  reduce,
  ticket,
  purpose,
  dateText,
  countdown,
  onHome,
}: {
  low: boolean;
  reduce: boolean;
  ticket: { no: number; time: string };
  purpose: (typeof PURPOSES)[number];
  dateText: string;
  countdown: number;
  onHome: () => void;
}) {
  return (
    <div
      className="flex min-h-full flex-1 flex-col items-center text-center"
      style={{ gap: u(28) }}
    >
      <div className="flex flex-col items-center" style={{ gap: u(14) }}>
        <CircleCheck
          aria-hidden
          style={{ width: g(96), height: g(96), color: C.teal }}
        />
        <h2 className="font-bold" style={{ fontSize: t(66), lineHeight: 1.2 }}>
          접수가 완료되었습니다
        </h2>
        <p className="font-semibold" style={{ fontSize: f(42), color: C.sub }}>
          번호표를 받아 주세요
        </p>
      </div>

      {/* 번호표 출력 */}
      <div
        className={`flex w-full flex-col items-center ${low ? "mt-auto" : ""}`}
      >
        <div
          style={{
            width: "86%",
            height: u(26),
            borderRadius: u(13),
            background: "#24303A",
            position: "relative",
            zIndex: 2,
          }}
        />
        <div
          className="overflow-hidden"
          style={{ width: "78%", marginTop: u(-12) }}
        >
          <motion.div
            initial={reduce ? false : { y: "-100%" }}
            animate={{ y: 0 }}
            transition={
              reduce
                ? { duration: 0 }
                : { duration: 1.2, ease: [0.25, 0.8, 0.3, 1], delay: 0.15 }
            }
            style={{
              background: "#fff",
              border: `${u(3)} solid #D3DADE`,
              borderTop: "none",
              padding: `${g(48)} ${u(40)} ${g(40)}`,
              boxShadow: "0 12px 24px -16px rgba(16,33,43,0.45)",
            }}
          >
            <p
              className="font-semibold"
              style={{ fontSize: f(34), color: C.sub }}
            >
              내과의원 대기번호
            </p>
            <p
              className="font-extrabold tabular-nums"
              style={{
                fontSize: t(230),
                lineHeight: 1,
                color: C.teal,
                margin: `${u(14)} 0 ${u(6)}`,
                letterSpacing: "-0.03em",
              }}
              aria-label={`대기번호 ${ticket.no}번`}
            >
              {ticket.no}
              <span style={{ fontSize: t(70), marginLeft: u(8), color: C.ink }}>
                번
              </span>
            </p>
            <p className="font-semibold" style={{ fontSize: f(38) }}>
              {purpose.label}, {purpose.room}
            </p>
            <div
              className="grid grid-cols-2"
              style={{
                marginTop: u(30),
                borderTop: `${u(3)} dashed #C3CDD2`,
                paddingTop: u(26),
                gap: u(12),
              }}
            >
              <div>
                <p style={{ fontSize: f(32), color: C.sub }}>앞 대기 인원</p>
                <p
                  className="font-bold tabular-nums"
                  style={{ fontSize: f(56) }}
                >
                  {purpose.ahead}명
                </p>
              </div>
              <div style={{ borderLeft: `${u(2)} solid #E1E7EA` }}>
                <p style={{ fontSize: f(32), color: C.sub }}>예상 대기</p>
                <p
                  className="font-bold tabular-nums"
                  style={{ fontSize: f(56) }}
                >
                  약 {purpose.wait}분
                </p>
              </div>
            </div>
            <p
              className="tabular-nums"
              style={{ fontSize: f(28), color: C.sub, marginTop: u(22) }}
            >
              접수 {dateText}
            </p>
          </motion.div>
        </div>
      </div>

      <p
        className="font-medium"
        style={{ fontSize: f(36), color: C.sub, lineHeight: 1.4 }}
      >
        번호가 불리면 {purpose.room} 앞으로 와 주세요
      </p>

      <div
        className={`flex w-full flex-col ${low ? "" : "mt-auto"}`}
        style={{ gap: u(18) }}
      >
        <p
          className="font-semibold tabular-nums"
          style={{ fontSize: f(36) }}
          aria-live="off"
        >
          {countdown}초 뒤 첫 화면으로 돌아갑니다
        </p>
        <button
          type="button"
          onClick={onHome}
          aria-label="처음으로"
          className={`flex w-full items-center justify-center font-bold ${FOCUS}`}
          style={{
            minHeight: g(150),
            borderRadius: u(22),
            fontSize: f(46),
            background: C.teal,
            color: "#fff",
            gap: u(14),
          }}
        >
          <House aria-hidden style={{ width: u(56), height: u(56) }} />
          처음으로
        </button>
      </div>
    </div>
  );
}
