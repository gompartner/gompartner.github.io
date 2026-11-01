"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarCheck,
  Car,
  Check,
  ChevronDown,
  Clock,
  DoorClosed,
  MapPin,
  Menu,
  Phone,
  ShieldCheck,
  Video,
  X,
} from "lucide-react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { daysAgo, fmtKo, useDemoToday } from "@/hooks/useDemoToday";
import { maskName, maskPhone } from "@/components/demos/LeadReceivedPanel";
import { DemoMakerInfo } from "@/components/demos/DemoMakerInfo";

/* 이혼, 가사 사건 법률사무소 홈페이지 샘플: 곰파트너 법률사무소.
   사무소 이름, 변호사 이름, 주소, 전화번호는 모두 가상이다.
   변호사 광고 규정에 맞춰 승소율, 성공 사례 숫자, 결과 보장, 최고 같은 표현은 쓰지 않는다.
   "전문"은 대한변협 등록 전문분야 표기에만 쓴다.

   국내 이혼 전문 사무소 사이트의 흔한 구성: 메뉴는 업무분야(협의이혼, 이혼소송, 양육권, 재산분할, 위자료),
   변호사 소개, 상담신청(방문, 전화, 화상), 자주 묻는 질문, 오시는 길. 첫 화면에 비밀 보장, 변호사 직접 상담,
   야간 상담 가능 같은 약속과 상담신청 버튼을 둔다.

   상호작용(브라우저 안에서만 돈다. 실제로 보내지 않는다)
   1. 상담 분야 고르기: 협의이혼, 재판이혼, 양육권, 재산분할을 누르면 절차 단계, 걸리는 기간, 준비 서류가 바뀐다.
   2. 양육비 안내: 산정기준표, 분담 방식, 받지 못할 때의 절차를 글로 정리한다.
   3. 상담신청: 방식, 분야, 희망 시간대, 연락처를 받는 일반 폼. 접수 화면에 접수 번호와 회신 예정을 보여 준다.
   4. 자주 묻는 질문.

   사진 출처: AI 생성(Z-Image-Turbo, Apache 2.0). 직원 사진은 AI 생성(Z-Image-Turbo).

   첫 화면(fl-poster): 상단 메뉴(좁은 화면은 햄버거), 왼쪽 45% 대표 변호사 세로 사진, 오른쪽 55% 이름과 등록 분야, 경력 줄,
   그 아래 업무분야 바로가기 4칸과 상담신청, 전화 버튼. 휴대폰은 사진 대신 가로 명함. */

/* 제목은 본문과 같은 Pretendard, 굵게 */
const serifF = { fontWeight: 700 } as const;

const SLUG = "family-law";
const TEL = "02-000-0000";
const KAKAO = "카카오톡 채널 가사 법률사무소";
const ADDRESS = "서울 ㅇㅇ구 ㅇㅇ로 00, 7층";
const IMG = "/images/demo-family-law";

const C = {
  bg: "#ffffff",
  alt: "#f7f7f5",
  accent: "#5e2a35",
  accentSoft: "#f4eeef",
  ink: "#111111",
  body: "#4b4b4b",
  muted: "#767676",
  line: "#e5e5e5",
  error: "#b3261e",
};

/* 모션 값 */
const EASE = [0.22, 1, 0.36, 1] as const;

const focusRing = "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2";
const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;
const p2 = (n: number) => String(n).padStart(2, "0");

/* ---------- 첫 화면: 메뉴 + 대표 변호사 + 업무분야 바로가기 ---------- */

const MENU: [string, string][] = [
  ["fl-areas", "업무분야"],
  ["fl-lawyers", "변호사 소개"],
  ["fl-support", "양육비 안내"],
  ["fl-faq", "자주 묻는 질문"],
  ["fl-visit", "오시는 길"],
];

function Poster({ go, setArea }: { go: (id: string) => void; setArea: (a: Area) => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const lead = LAWYERS[0];

  const to = (id: string) => {
    setMenuOpen(false);
    go(id);
  };

  return (
    <section id="fl-poster" aria-labelledby="fl-poster-title" style={{ background: C.bg, color: C.ink }}>
      {/* 상단 메뉴. 좁은 화면은 햄버거 */}
      <header className="relative z-20 border-b" style={{ borderColor: C.line, background: C.bg }}>
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-3 px-4 py-3 md:px-6">
          <p className="inline-flex items-center gap-2 text-[19px] font-bold leading-none">
            <SampleLogo />
          </p>
          <nav aria-label="주요 메뉴" className="hidden items-center lg:flex">
            {MENU.map(([id, label]) => (
              <button key={id} type="button" onClick={() => to(id)} className={`inline-flex min-h-11 items-center rounded-[4px] px-3 text-[15px] underline-offset-4 hover:underline ${focusRing}`} style={{ outlineColor: C.accent }}>
                {label}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => to("fl-booking")}
              data-gtm-cta={`${SLUG}_poster_cta`}
              className={`inline-flex min-h-11 items-center gap-1.5 rounded-[6px] px-4 text-[15px] font-semibold ${focusRing}`}
              style={{ background: C.accent, color: "#ffffff", outlineColor: C.accent }}
            >
              <CalendarCheck size={17} aria-hidden />
              상담신청
            </button>
            <button
              type="button"
              aria-expanded={menuOpen}
              aria-controls="fl-menu"
              aria-label={menuOpen ? "메뉴 닫기" : "메뉴 열기"}
              onClick={() => setMenuOpen((v) => !v)}
              className={`inline-flex h-11 w-11 items-center justify-center rounded-[6px] border lg:hidden ${focusRing}`}
              style={{ borderColor: C.line, outlineColor: C.accent }}
            >
              {menuOpen ? <X size={20} aria-hidden /> : <Menu size={20} aria-hidden />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <nav id="fl-menu" aria-label="주요 메뉴" className="absolute inset-x-0 top-full border-b lg:hidden" style={{ borderColor: C.line, background: C.bg }}>
            <ul className="mx-auto max-w-[1200px] px-4 py-2 md:px-6">
              {MENU.map(([id, label]) => (
                <li key={id} className="border-b last:border-b-0" style={{ borderColor: C.line }}>
                  <button type="button" onClick={() => to(id)} className={`flex min-h-12 w-full items-center text-left text-[17px] font-semibold ${focusRing}`} style={{ outlineColor: C.accent }}>
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </header>

      <div className="mx-auto grid max-w-[1200px] md:grid-cols-[minmax(0,45fr)_minmax(0,55fr)] md:px-6 md:py-8 lg:py-10">
        {/* 넓은 화면: 왼쪽 세로 인물 사진. 사진 위 글자 없음 */}
        <div className="relative hidden overflow-hidden rounded-[8px] md:block" style={{ background: C.alt }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- 정적 export 라 next/image 최적화를 쓰지 않는다 */}
          <img src={lead.photo} alt={`${lead.role} ${lead.name}`} fetchPriority="high" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: "50% 18%" }} />
        </div>

        <div className="min-w-0 px-4 pt-6 md:pl-10 md:pr-0 md:pt-2 lg:pl-14">
          <h1 id="fl-poster-title" className="text-[28px] font-bold md:text-[34px] lg:text-[40px]" style={{ ...serifF, letterSpacing: "-0.03em", lineHeight: 1.25, wordBreak: "keep-all" }}>
            이혼과 양육 문제, 변호사가 직접 상담합니다
          </h1>

          {/* 대표 변호사. 좁은 화면은 가로 명함 */}
          <div className="mt-5 flex gap-4 border-t pt-5 md:mt-7 md:block md:pt-6" style={{ borderColor: C.line }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- 정적 export 라 next/image 최적화를 쓰지 않는다 */}
            <img src={lead.photo} alt="" aria-hidden width={96} height={96} className="h-24 w-24 flex-none rounded-[6px] object-cover md:hidden" style={{ objectPosition: "50% 15%", background: C.alt }} />
            <div className="min-w-0">
              <p className="text-[14px] font-bold" style={{ color: C.accent }}>
                {lead.role}
              </p>
              <p className="mt-0.5 text-[24px] font-bold md:text-[30px]">{lead.name} 변호사</p>
              <ul className="mt-2 grid gap-1 text-[15px] md:mt-3 md:text-[16px]" style={{ color: C.body }}>
                <li>{lead.note}</li>
                <li>주로 맡는 사건: {lead.cases}</li>
                <li className="hidden md:list-item">
                  상담 평일 {HOURS[0][1]}, 토요일 {HOURS[1][1]}
                </li>
              </ul>
            </div>
          </div>

          {/* 업무분야 바로가기 */}
          <div className="mt-6 md:mt-8">
            <h2 className="text-[16px] font-bold">업무분야</h2>
            <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {AREA_LIST.map((k) => (
                <li key={k}>
                  <button
                    type="button"
                    onClick={() => {
                      setArea(k);
                      go("fl-areas");
                    }}
                    className={`flex min-h-12 w-full items-center rounded-[6px] border px-3 text-left text-[16px] font-semibold ${focusRing}`}
                    style={{ borderColor: C.line, background: C.bg, color: C.ink, outlineColor: C.accent }}
                  >
                    {k}
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => go("fl-booking")}
                data-gtm-cta={`${SLUG}_poster_book`}
                className={`inline-flex min-h-11 items-center gap-1.5 rounded-[6px] px-4 text-[15px] font-semibold ${focusRing}`}
                style={{ background: C.accent, color: "#ffffff", outlineColor: C.accent }}
              >
                <CalendarCheck size={17} aria-hidden />
                상담신청
              </button>
              <a
                href={`tel:${TEL}`}
                className={`inline-flex min-h-11 items-center gap-1.5 rounded-[6px] border px-4 text-[15px] font-semibold tabular-nums ${focusRing}`}
                style={{ borderColor: C.accent, color: C.accent, background: C.bg, outlineColor: C.accent }}
              >
                <Phone size={17} aria-hidden />
                {TEL}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- 1. 상담 분야와 절차 ---------- */

type Area = "협의이혼" | "재판이혼" | "양육권" | "재산분할";
const AREA_LIST: Area[] = ["협의이혼", "재판이혼", "양육권", "재산분할"];

const AREAS: Record<Area, { sub: string; period: string; steps: [string, string][]; docs: string[] }> = {
  협의이혼: {
    sub: "둘 다 이혼에 동의할 때",
    period: "숙려기간 포함 1~3개월",
    steps: [
      ["협의이혼의사확인 신청", "부부가 함께 주소지 관할 가정법원에 신청서를 내요."],
      ["이혼 안내 받기", "법원에서 이혼 안내를 듣고, 미성년 자녀가 있으면 부모 교육도 받아요."],
      ["숙려기간", "미성년 자녀가 있으면 3개월, 없으면 1개월을 기다려요."],
      ["양육 협의서 제출", "자녀가 있으면 친권자, 양육자, 양육비, 면접교섭을 정해 내요."],
      ["확인기일 출석", "둘이 함께 법원에 나가 이혼 의사를 확인받아요."],
      ["이혼 신고", "확인서 등본을 받은 날부터 3개월 안에 시청, 구청에 신고해요."],
    ],
    docs: ["협의이혼의사확인신청서", "부부 각자 혼인관계증명서, 가족관계증명서", "자녀가 있으면 양육 협의서"],
  },
  재판이혼: {
    sub: "한쪽이 동의하지 않거나 조건이 안 맞을 때",
    period: "보통 6개월~1년 이상",
    steps: [
      ["소장 접수", "이혼 사유와 위자료, 재산분할, 양육 청구를 함께 적어 내요."],
      ["송달과 답변서", "상대방이 소장을 받고 답변서를 내요."],
      ["가사조사, 조정", "조사관 면담과 조정 기일에서 합의를 먼저 시도해요."],
      ["변론", "합의가 안 되면 변론 기일에 증거와 주장을 정리해요."],
      ["판결과 확정", "판결문을 받고 2주 안에 항소가 없으면 확정돼요."],
      ["이혼 신고", "확정된 날부터 1개월 안에 신고해요."],
    ],
    docs: ["혼인관계증명서, 가족관계증명서, 주민등록등본", "이혼 사유 자료(대화 기록, 사진, 진단서)", "재산, 소득 자료"],
  },
  양육권: {
    sub: "친권자, 양육자를 정해야 할 때",
    period: "이혼 소송과 함께 진행",
    steps: [
      ["친권자, 양육자 지정 청구", "이혼 소송과 같이 내거나 따로 청구해요."],
      ["사전처분 신청", "소송 중 아이를 누가 돌볼지 임시로 정해 달라고 해요."],
      ["가사조사", "조사관이 부모 면담, 가정 방문으로 양육 환경을 봐요."],
      ["자녀 의견 듣기", "자녀가 13세 이상이면 법원이 의견을 들어요."],
      ["양육비, 면접교섭 정하기", "매달 양육비와 아이를 만나는 날을 함께 정해요."],
      ["심판", "자녀의 복리를 기준으로 정해져요."],
    ],
    docs: ["돌봄 일정과 주거 환경 자료", "어린이집, 학교 관련 자료", "부모 소득 자료"],
  },
  재산분할: {
    sub: "부부가 모은 재산을 나눌 때",
    period: "이혼한 날부터 2년 안에 청구",
    steps: [
      ["재산 목록 정리", "부동산, 예금, 주식, 퇴직금, 대출까지 부부 재산을 모아요."],
      ["재산명시, 재산조회", "상대 재산을 모르면 법원에 명시와 조회를 신청해요."],
      ["가압류, 가처분", "소송 중 재산을 처분하지 못하게 미리 묶어 둬요."],
      ["기여도 정리", "맞벌이 소득뿐 아니라 육아와 가사도 기여로 따져요."],
      ["조정 또는 판결", "나눌 비율과 방법이 정해져요."],
    ],
    docs: ["부동산 등기사항증명서", "예금, 보험, 주식 내역", "대출 내역과 급여 자료"],
  },
};

function AreaPicker({ area, setArea, onBook }: { area: Area; setArea: (a: Area) => void; onBook: () => void }) {
  const a = AREAS[area];
  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-10">
      <div role="group" aria-label="상담 분야" className="grid grid-cols-2 gap-2 lg:grid-cols-1">
        {AREA_LIST.map((k) => {
          const on = k === area;
          return (
            <button
              key={k}
              type="button"
              aria-pressed={on}
              onClick={() => setArea(k)}
              className={`group flex items-center justify-between gap-2 rounded-[6px] border px-4 py-3 text-left transition-colors duration-150 ${focusRing}`}
              style={{ borderColor: on ? C.accent : C.line, background: on ? C.accent : C.bg, color: on ? "#ffffff" : C.ink, outlineColor: C.accent }}
            >
              <span className="min-w-0">
                <span className="block text-[17px] font-semibold">
                  {k}
                </span>
                <span className="mt-0.5 block text-[13px] leading-[1.4]" style={{ color: on ? "#eadde0" : C.muted }}>
                  {AREAS[k].sub}
                </span>
              </span>
              <DoorClosed size={20} aria-hidden className="hidden flex-none sm:block" style={{ opacity: on ? 1 : 0.35 }} />
            </button>
          );
        })}
      </div>

      <div className="min-w-0 rounded-[8px] border p-5 md:p-7" style={{ borderColor: C.line, background: C.alt }}>
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h3 className="text-[21px] font-bold" style={{ color: C.ink }}>
            {area} 절차
          </h3>
          <p className="inline-flex items-center gap-1.5 text-[15px] font-bold" style={{ color: C.ink }}>
            <Clock size={16} aria-hidden />
            {a.period}
          </p>
        </div>

        <ol key={area} className="relative mt-5 grid gap-0">
          <span aria-hidden className="absolute bottom-3 left-[13px] top-3 w-px" style={{ background: C.line }} />
          {a.steps.map(([title, desc], i) => (
            <li key={title} className="relative grid grid-cols-[28px_minmax(0,1fr)] gap-3 py-2.5">
              <span className="relative z-[1] inline-flex h-7 w-7 items-center justify-center rounded-full border text-[14px] font-semibold tabular-nums" style={{ borderColor: C.accent, background: C.bg, color: C.accent }}>
                {i + 1}
              </span>
              <span className="min-w-0">
                <span className="block text-[17px] font-bold">{title}</span>
                <span className="mt-0.5 block text-[15px] leading-[1.55]" style={{ color: C.body }}>
                  {desc}
                </span>
              </span>
            </li>
          ))}
        </ol>

        <div className="mt-5 border-t pt-4" style={{ borderColor: C.line }}>
          <h4 className="text-[15px] font-bold">준비 서류</h4>
          <ul className="mt-2 grid gap-1.5 text-[15px]">
            {a.docs.map((d) => (
              <li key={d} className="flex gap-2">
                <Check size={16} aria-hidden className="mt-[3px] flex-none" style={{ color: C.accent }} />
                {d}
              </li>
            ))}
          </ul>
        </div>

        <button
          type="button"
          onClick={onBook}
          data-gtm-cta={`${SLUG}_area_book`}
          className={`mt-6 inline-flex items-center gap-2 rounded-[6px] px-5 py-3 text-[16px] font-semibold ${focusRing}`}
          style={{ background: C.accent, color: "#ffffff", outlineColor: C.accent }}
        >
          <CalendarCheck size={18} aria-hidden />
          {area} 상담신청
        </button>
      </div>
    </div>
  );
}

/* ---------- 2. 양육비 안내 ---------- */

const SUPPORT_INFO: [string, string][] = [
  ["정하는 기준", "서울가정법원 양육비 산정기준표를 바탕으로 두 부모의 소득, 자녀 나이와 수를 함께 봅니다."],
  ["나누는 방식", "표준양육비를 두 부모 소득 비율로 나눠, 아이를 키우지 않는 부모가 자기 몫을 매달 보냅니다."],
  ["더하거나 빼는 사정", "재산, 부채, 아이 건강, 사는 지역, 학비 같은 사정에 따라 법원이 금액을 조정합니다."],
  ["받지 못할 때", "이행명령, 양육비 직접지급명령, 담보제공명령을 신청할 수 있고 양육비이행관리원 도움도 받을 수 있습니다."],
];

function SupportInfo({ onBook }: { onBook: () => void }) {
  return (
    <div className="mt-6 rounded-[8px] border p-5 md:p-7" style={{ borderColor: C.line, background: C.alt }}>
      <dl>
        {SUPPORT_INFO.map(([t, d]) => (
          <div key={t} className="grid gap-1 border-b py-3 first:pt-0 md:grid-cols-[180px_minmax(0,1fr)] md:gap-8" style={{ borderColor: C.line }}>
            <dt className="text-[16px] font-bold">{t}</dt>
            <dd className="text-[15px] leading-[1.65]" style={{ color: C.body }}>
              {d}
            </dd>
          </div>
        ))}
      </dl>
      <button
        type="button"
        onClick={onBook}
        className={`mt-4 inline-flex items-center gap-2 rounded-[6px] border px-5 py-3 text-[16px] font-semibold ${focusRing}`}
        style={{ borderColor: C.accent, color: C.accent, background: C.bg, outlineColor: C.accent }}
      >
        <CalendarCheck size={18} aria-hidden />
        양육비 상담신청
      </button>
    </div>
  );
}

/* ---------- 3. 상담신청 ---------- */

type Method = "visit" | "phone" | "video";
const METHODS: { id: Method; label: string; mins: number; fee: number; Icon: typeof Phone }[] = [
  { id: "visit", label: "방문 상담", mins: 50, fee: 50000, Icon: DoorClosed },
  { id: "phone", label: "전화 상담", mins: 30, fee: 30000, Icon: Phone },
  { id: "video", label: "화상 상담", mins: 50, fee: 50000, Icon: Video },
];

const TIMES = ["평일 낮", "평일 저녁", "토요일", "시간 무관"];

type Done = { no: string; name: string; phone: string; when: string; method: string; area: Area; reply: string };

function Booking({ today, reduce, area, setArea }: { today: Date; reduce: boolean; area: Area; setArea: (a: Area) => void }) {
  const [method, setMethod] = useState<Method>("visit");
  const [when, setWhen] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [memo, setMemo] = useState("");
  const [agree, setAgree] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState<Done | null>(null);

  const m = METHODS.find((x) => x.id === method)!;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const digits = phone.replace(/\D/g, "");
    if (!when) return setErr("희망 시간대를 골라 주세요.");
    if (name.trim().length < 2) return setErr("이름을 적어 주세요.");
    if (digits.length < 10 || digits.length > 11) return setErr("연락처를 확인해 주세요.");
    if (!agree) return setErr("개인정보 수집, 이용에 동의해 주세요.");
    setErr("");
    let reply = today;
    if (reply.getDay() === 0) reply = daysAgo(reply, -1);
    const ymd = `${today.getFullYear()}${p2(today.getMonth() + 1)}${p2(today.getDate())}`;
    setDone({
      no: `FL-${ymd}-${String((Number(digits.slice(-4)) % 900) + 100)}`,
      name: maskName(name),
      phone: maskPhone(phone),
      when,
      method: m.label,
      area,
      reply: `${fmtKo(reply)} 오후 6시 전`,
    });
  };

  const reset = () => {
    setDone(null);
    setWhen("");
    setName("");
    setPhone("");
    setMemo("");
    setAgree(false);
  };

  const field = `mt-1.5 w-full rounded-[6px] border bg-transparent px-3 py-2.5 text-[16px] ${focusRing}`;

  return (
    <div className="mt-6 rounded-[8px] border" style={{ borderColor: C.line, background: C.alt }}>
      <AnimatePresence mode="wait" initial={false}>
        {done ? (
          <motion.div
            key="done"
            className="p-5 md:p-8"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.25, ease: EASE }}
            role="status"
          >
            <p className="inline-flex items-center gap-2 text-[15px] font-bold" style={{ color: C.accent }}>
              <ShieldCheck size={18} aria-hidden />
              상담신청 접수
            </p>
            <h3 className="mt-2 text-[24px] font-bold">
              접수 번호 <span className="tabular-nums">{done.no}</span>
            </h3>
            <dl className="mt-5 grid gap-x-6 gap-y-2.5 text-[16px] sm:grid-cols-[120px_minmax(0,1fr)]">
              <dt className="font-bold" style={{ color: C.muted }}>
                방식, 분야
              </dt>
              <dd>
                {done.method}, {done.area}
              </dd>
              <dt className="font-bold" style={{ color: C.muted }}>
                희망 시간대
              </dt>
              <dd>{done.when}</dd>
              <dt className="font-bold" style={{ color: C.muted }}>
                신청자
              </dt>
              <dd className="tabular-nums">
                {done.name} {done.phone}
              </dd>
              <dt className="font-bold" style={{ color: C.muted }}>
                회신 예정
              </dt>
              <dd>{done.reply}, 전화로 상담 일정을 정해 드려요</dd>
              <dt className="font-bold" style={{ color: C.muted }}>
                담당 창구
              </dt>
              <dd>
                상담실 전화 {TEL}, {KAKAO}
              </dd>
            </dl>
            <button type="button" onClick={reset} className={`mt-6 rounded-[6px] border px-4 py-2.5 text-[15px] font-semibold ${focusRing}`} style={{ borderColor: C.accent, color: C.accent, outlineColor: C.accent }}>
              새로 신청하기
            </button>
          </motion.div>
        ) : (
          <motion.form key="form" onSubmit={submit} noValidate className="grid gap-7 p-5 md:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-10" exit={{ opacity: 0 }} transition={{ duration: reduce ? 0 : 0.15 }}>
            <div className="min-w-0">
              <fieldset>
                <legend className="text-[15px] font-bold">상담 방식</legend>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {METHODS.map(({ id, label, mins, fee, Icon }) => {
                    const on = id === method;
                    return (
                      <button
                        key={id}
                        type="button"
                        aria-pressed={on}
                        onClick={() => setMethod(id)}
                        className={`flex flex-col items-start gap-1 rounded-[6px] border px-3 py-2.5 text-left ${focusRing}`}
                        style={{ borderColor: on ? C.accent : C.line, background: on ? C.accent : "transparent", color: on ? "#ffffff" : C.ink, outlineColor: C.accent }}
                      >
                        <Icon size={18} aria-hidden />
                        <span className="text-[15px] font-bold">{label}</span>
                        <span className="text-[13px] tabular-nums" style={{ color: on ? "#eadde0" : C.muted }}>
                          {mins}분 {won(fee)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <div className="mt-6">
                <label htmlFor="fl-area" className="text-[15px] font-bold">
                  상담 분야
                </label>
                <select id="fl-area" value={area} onChange={(e) => setArea(e.target.value as Area)} className={field} style={{ borderColor: C.line, outlineColor: C.accent }}>
                  {AREA_LIST.map((a) => (
                    <option key={a}>{a}</option>
                  ))}
                </select>
              </div>

              <fieldset className="mt-6">
                <legend className="text-[15px] font-bold">희망 시간대</legend>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {TIMES.map((t) => {
                    const on = t === when;
                    return (
                      <button
                        key={t}
                        type="button"
                        aria-pressed={on}
                        onClick={() => setWhen(t)}
                        className={`rounded-[6px] border px-3 py-2.5 text-[15px] font-semibold ${focusRing}`}
                        style={{ borderColor: on ? C.accent : C.line, background: on ? C.accent : "transparent", color: on ? "#ffffff" : C.ink, outlineColor: C.accent }}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-2 text-[14px] leading-[1.6]" style={{ color: C.muted }}>
                  평일 {HOURS[0][1]}, 토요일 {HOURS[1][1]}
                </p>
              </fieldset>
            </div>

            <div className="grid min-w-0 content-start gap-4">
              <div>
                <label htmlFor="fl-name" className="text-[15px] font-bold">
                  이름
                </label>
                <input id="fl-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="김하늘" className={field} style={{ borderColor: C.line, outlineColor: C.accent }} />
              </div>
              <div>
                <label htmlFor="fl-phone" className="text-[15px] font-bold">
                  연락처
                </label>
                <input
                  id="fl-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="010-0000-0000"
                  className={`${field} tabular-nums`}
                  style={{ borderColor: C.line, outlineColor: C.accent }}
                />
              </div>
              <div>
                <label htmlFor="fl-memo" className="text-[15px] font-bold">
                  상담 내용 <span className="font-normal" style={{ color: C.muted }}>(선택)</span>
                </label>
                <textarea
                  id="fl-memo"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value.slice(0, 300))}
                  rows={4}
                  placeholder="예) 협의이혼을 생각 중인데 아이 양육권을 어떻게 정해야 할지 궁금합니다."
                  className={`${field} resize-none`}
                  style={{ borderColor: C.line, outlineColor: C.accent }}
                />
              </div>
              <label className="flex items-start gap-2 text-[14px] leading-[1.5]">
                <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className={`mt-[3px] h-4 w-4 flex-none ${focusRing}`} style={{ accentColor: C.accent, outlineColor: C.accent }} />
                <span>개인정보 수집, 이용 동의(이름, 연락처는 상담 일정 안내에만 쓰고 상담이 끝나면 지워요)</span>
              </label>

              <p aria-live="assertive" className="min-h-[1.5em] text-[15px] font-bold" style={{ color: C.error }}>
                {err}
              </p>
              <button
                type="submit"
                data-gtm-cta={`${SLUG}_booking_submit`}
                className={`inline-flex items-center justify-center gap-2 rounded-[6px] px-5 py-3.5 text-[17px] font-semibold ${focusRing}`}
                style={{ background: C.accent, color: "#ffffff", outlineColor: C.accent }}
              >
                <CalendarCheck size={19} aria-hidden />
                상담신청
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------- 4. 자주 묻는 질문 ---------- */

const FAQ: [string, string][] = [
  ["상담하면 상대방이 알게 되나요?", "변호사는 상담 내용을 지킬 의무가 있어요. 상담 사실도 본인 동의 없이 알리지 않아요."],
  ["상담만 받고 사건은 안 맡겨도 되나요?", "네. 상담료만 내시면 돼요. 사건을 맡기시면 상담료는 착수금에서 빼 드려요."],
  ["상대방이 이혼을 원하지 않으면요?", "협의이혼은 할 수 없고 재판이혼으로 가야 해요. 민법이 정한 이혼 사유가 있어야 해요."],
  ["소송 중에도 아이와 같이 살 수 있나요?", "사전처분을 신청해 소송이 끝날 때까지 임시 양육자를 정할 수 있어요."],
  ["재산분할과 위자료는 언제까지 청구하나요?", "재산분할은 이혼한 날부터 2년, 위자료는 손해와 상대를 안 날부터 3년 안이에요."],
  ["양육비를 안 보내면 어떻게 하나요?", "이행명령이나 양육비 직접지급명령을 신청할 수 있어요. 양육비이행관리원 도움도 받을 수 있어요."],
];

function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <ul className="mt-6 border-t" style={{ borderColor: C.ink }}>
      {FAQ.map(([q, a], i) => {
        const on = open === i;
        return (
          <li key={q} className="border-b" style={{ borderColor: C.line }}>
            <h3>
              <button
                type="button"
                aria-expanded={on}
                aria-controls={`fl-faq-${i}`}
                onClick={() => setOpen(on ? null : i)}
                className={`flex w-full items-center justify-between gap-4 py-4 text-left text-[17px] font-bold ${focusRing}`}
                style={{ outlineColor: C.accent }}
              >
                {q}
                <ChevronDown size={20} aria-hidden className="flex-none transition-transform duration-200" style={{ transform: on ? "rotate(180deg)" : undefined, color: C.accent }} />
              </button>
            </h3>
            <div id={`fl-faq-${i}`} hidden={!on} className="pb-4 text-[16px] leading-[1.65]" style={{ color: C.muted }}>
              {a}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/* ---------- 페이지 ---------- */

const HOURS = [
  ["평일", "09:00 ~ 21:00", "18시 이후는 예약 상담"],
  ["토요일", "10:00 ~ 15:00", "예약 상담만"],
  ["일요일, 공휴일", "휴무", ""],
];

const LAWYERS = [
  { name: "김ㅎ늘", role: "대표 변호사", note: "대한변협 등록 전문분야 가사법", cases: "이혼소송, 양육권, 재산분할", photo: `${IMG}/staff-1.jpg` },
  { name: "박ㅅ연", role: "변호사", note: "가사, 상속 사건 담당", cases: "협의이혼, 양육비, 면접교섭", photo: `${IMG}/staff-2.jpg` },
];

export function FamilyLawDemo() {
  const today = useDemoToday();
  const reduce = useReducedMotionSafe();
  const [area, setArea] = useState<Area>("협의이혼");

  useEffect(() => {
    const f = () => window.scrollTo({ top: 0 });
    window.addEventListener("demo:go-home", f);
    return () => window.removeEventListener("demo:go-home", f);
  }, []);

  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });

  return (
    <div className="min-h-screen overflow-x-clip pb-24" style={{ background: C.bg, color: C.ink }}>
      <Poster go={go} setArea={setArea} />


      {/* 약속 세 가지 */}
      <div className="mx-auto mt-8 max-w-[1200px] px-4 md:mt-0 md:px-6">
        <ul className="grid gap-px overflow-hidden rounded-[8px] border sm:grid-cols-3" style={{ borderColor: C.line, background: C.line }}>
          {[
            [ShieldCheck, "변호사가 직접 상담", "처음부터 끝까지 같은 변호사가 맡아요."],
            [DoorClosed, "상담 내용 비밀 보장", "상담 내용은 담당 변호사만 봐요."],
            [Clock, "저녁, 토요일 상담", "평일 21시까지, 토요일은 15시까지 상담해요."],
          ].map(([Icon, t, d]) => {
            const I = Icon as typeof Phone;
            return (
              <li key={t as string} className="flex gap-3 p-4 md:p-5" style={{ background: C.alt }}>
                <I size={22} aria-hidden className="mt-[2px] flex-none" style={{ color: C.accent }} />
                <span>
                  <span className="block text-[17px] font-bold">{t as string}</span>
                  <span className="mt-0.5 block text-[15px] leading-[1.5]" style={{ color: C.muted }}>
                    {d as string}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <section id="fl-areas" aria-labelledby="fl-areas-title" className="mx-auto mt-14 max-w-[1200px] scroll-mt-4 px-4 md:mt-20 md:px-6">
        <SectionTitle id="fl-areas-title" title="업무분야" />
        <AreaPicker area={area} setArea={setArea} onBook={() => go("fl-booking")} />
      </section>

      <section id="fl-support" aria-labelledby="fl-support-title" className="mx-auto mt-14 max-w-[1200px] scroll-mt-4 px-4 md:mt-20 md:px-6">
        <SectionTitle id="fl-support-title" title="양육비 안내" />
        <SupportInfo onBook={() => go("fl-booking")} />
      </section>

      <section id="fl-booking" aria-labelledby="fl-booking-title" className="mx-auto mt-14 max-w-[1200px] scroll-mt-4 px-4 md:mt-20 md:px-6">
        <SectionTitle id="fl-booking-title" title="상담신청" />
        <Booking today={today} reduce={reduce} area={area} setArea={setArea} />
      </section>

      <section id="fl-lawyers" aria-labelledby="fl-lawyers-title" className="mx-auto mt-14 max-w-[1200px] scroll-mt-4 px-4 md:mt-20 md:px-6">
        <SectionTitle id="fl-lawyers-title" title="변호사 소개" />
        <div className="mt-6 grid gap-4 md:grid-cols-[1fr_1fr_1.1fr]">
          {LAWYERS.map((l) => (
            <article key={l.name} className="rounded-[8px] border p-5" style={{ borderColor: C.line, background: C.alt }}>
              {/* eslint-disable-next-line @next/next/no-img-element -- 정적 export 라 next/image 최적화를 쓰지 않는다 */}
              <img
                src={l.photo}
                alt={`${l.role} ${l.name}`}
                width={80}
                height={96}
                loading="lazy"
                className="mb-4 h-24 w-20 rounded-[6px] object-cover"
                style={{ objectPosition: "50% 20%", background: C.line }}
              />
              <p className="text-[14px] font-bold" style={{ color: C.accent }}>
                {l.role}
              </p>
              <h3 className="mt-1 text-[22px] font-bold">
                {l.name} 변호사
              </h3>
              <p className="mt-3 text-[15px]">{l.note}</p>
              <p className="mt-1 text-[15px]" style={{ color: C.muted }}>
                주로 맡는 사건: {l.cases}
              </p>
            </article>
          ))}
          <div className="rounded-[8px] border p-5" style={{ borderColor: C.line, background: C.alt, color: C.ink }}>
            <h3 className="text-[18px] font-bold">
              상담료
            </h3>
            <dl className="mt-3 grid grid-cols-[minmax(0,1fr)_auto] gap-y-2 text-[15px] tabular-nums">
              {METHODS.map((x) => (
                <div key={x.id} className="contents">
                  <dt>
                    {x.label} {x.mins}분
                  </dt>
                  <dd className="text-right font-bold">{won(x.fee)}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-[14px] leading-[1.6]" style={{ color: C.muted }}>
              사건을 맡기시면 상담료는 착수금에서 빼 드려요.
            </p>
          </div>
        </div>
      </section>

      <section id="fl-faq" aria-labelledby="fl-faq-title" className="mx-auto mt-14 max-w-[1200px] scroll-mt-4 px-4 md:mt-20 md:px-6">
        <SectionTitle id="fl-faq-title" title="자주 묻는 질문" />
        <Faq />
      </section>

      <section id="fl-visit" aria-labelledby="fl-visit-title" className="mx-auto mt-14 max-w-[1200px] scroll-mt-4 px-4 md:mt-20 md:px-6">
        <SectionTitle id="fl-visit-title" title="오시는 길" />
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <dl className="grid content-start gap-x-6 gap-y-3 text-[16px] sm:grid-cols-[110px_minmax(0,1fr)]">
            <dt className="inline-flex items-center gap-1.5 font-bold">
              <MapPin size={17} aria-hidden style={{ color: C.accent }} />
              주소
            </dt>
            <dd>{ADDRESS}</dd>
            <dt className="inline-flex items-center gap-1.5 font-bold">
              <Car size={17} aria-hidden style={{ color: C.accent }} />
              주차
            </dt>
            <dd>건물 뒤편 주차장 2시간 무료, 주차장 쪽 엘리베이터가 7층 상담실로 바로 이어져요.</dd>
            <dt className="inline-flex items-center gap-1.5 font-bold">
              <Phone size={17} aria-hidden style={{ color: C.accent }} />
              전화
            </dt>
            <dd>
              <a href={`tel:${TEL.replace(/-/g, "")}`} className={`underline underline-offset-4 ${focusRing}`} style={{ outlineColor: C.accent }}>
                {TEL}
              </a>
              , {KAKAO}
            </dd>
          </dl>
          <table className="w-full border-t text-left text-[16px]" style={{ borderColor: C.ink }}>
            <caption className="sr-only">상담 시간</caption>
            <tbody>
              {HOURS.map(([d, t, n]) => (
                <tr key={d} className="border-b" style={{ borderColor: C.line }}>
                  <th scope="row" className="py-3 pr-3 font-bold">
                    {d}
                  </th>
                  <td className="py-3 tabular-nums">{t}</td>
                  <td className="py-3 text-[14px]" style={{ color: C.muted }}>
                    {n}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <footer className="mx-auto mt-16 max-w-[1200px] border-t px-4 pt-8 text-[14px] leading-[1.8] md:px-6" style={{ borderColor: C.line, color: C.muted }}>
        <p className="text-[16px] font-bold" style={{ color: C.ink }}>
          <SampleLogo size={18} />
        </p>
        <p>
          {ADDRESS} / 전화 {TEL} / {KAKAO}
        </p>
        <DemoMakerInfo className="mt-6" />
      </footer>
    </div>
  );
}

function SectionTitle({ id, title }: { id: string; title: string }) {
  return (
    <h2 id={id} className="border-b pb-3 text-[26px] font-bold tracking-[-0.02em] md:text-[32px]" style={{ ...serifF, borderColor: C.line, color: C.ink }}>
      {title}
    </h2>
  );
}

function SampleLogo({ light, size = 20 }: { light?: boolean; size?: number }) {
  return (
    <span className="inline-flex items-center gap-2" style={{ color: light ? "#fff" : "#111" }}>
      <span className="flex items-baseline gap-1 whitespace-nowrap">
        <span className="font-bold tracking-[-0.03em]" style={{ fontSize: size }}>
          가사 법률사무소
        </span>
      </span>
    </span>
  );
}
