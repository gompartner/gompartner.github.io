"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Banknote, Building2, CalendarCheck, Car, Check, ChevronDown, KeyRound, Menu, Phone, RotateCcw, ShieldCheck, TrainFront, Users, Video, X } from "lucide-react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";

/* 법률사무소 홈페이지 데모: 가상의 법률사무소 ○○.
   사무소 이름, 변호사 이름, 경력, 주소, 전화번호, 사업자 정보, 해결 사례는 모두 가상이다.
   절차와 기간은 국내에서 흔한 경우를 기준으로 한 일반 안내다.
   변호사 광고 규정에 맞춰 승소율, 최고, 전문 보장 같은 표현은 쓰지 않고, 형사 사건 성공보수는 받지 않는 것으로 적는다.

   디자인: 아이보리 바탕(#f6f3ec)에 짙은 남색(#14213d), 바랜 금색(#b08d57)은 가는 선과 작은 표시에만 쓴다.
   여백을 넉넉히 두고 1px 선으로 나눈다. 모서리는 작게, 그림자는 거의 쓰지 않는다.

   내 상황 고르기는 분야와 상황 카드를 고르면 흔한 절차가 세로 길로 그려지고,
   단계를 누르면 쉬운 설명과 준비 서류 목록이 열린다. 서류를 챙길 때마다 체크하면 단계 표시가 채워진다.
   상담 예약은 방식, 분야, 앞으로 14일 중 날짜(평일, 토요일은 오전만), 시간을 고르고
   이름과 연락처를 적으면 가린 이름과 번호, 상담 번호가 담긴 확인 창이 뜬다.
   해결 사례는 분야로 거르고, 자주 묻는 질문은 펼쳐 본다.

   사진 출처(public/images/demo-law):
   AI 생성(Z-Image-Turbo, Apache 2.0) hero, desk */

const IMG = "/images/demo-law";
const FIRM = "법률사무소 ○○";
const TEL = "02-000-0000";
const ADDRESS = "□□시 □□로 88 □□빌딩 3층";

const C = {
  ivory: "#f6f3ec",
  paper: "#fbf9f4",
  white: "#ffffff",
  navy: "#14213d",
  navySoft: "#24345a",
  navyMist: "#e7e9ef",
  gold: "#b08d57",
  goldText: "#7d5f33",
  goldSoft: "#efe6d6",
  ink: "#1b2233",
  muted: "#5a6070",
  line: "#e2ddd1",
  error: "#b3261e",
};

const EASE = [0.22, 1, 0.36, 1] as const;

const NAV = [
  { id: "guide", label: "상황별 절차" },
  { id: "lawyers", label: "변호사 소개" },
  { id: "fees", label: "상담 비용" },
  { id: "cases", label: "해결 사례" },
  { id: "faq", label: "자주 묻는 질문" },
  { id: "location", label: "오시는 길" },
];

/* ---------- 시간 ---------- */

const DAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"];

const subscribeMinute = (cb: () => void) => {
  const id = window.setInterval(cb, 30_000);
  return () => window.clearInterval(id);
};

/** 분 단위 현재 시각. 서버 렌더에서는 -1을 돌려 날짜에 따른 화면 차이를 막는다. */
function useNowMinute() {
  return useSyncExternalStore(
    subscribeMinute,
    () => Math.floor(Date.now() / 60_000),
    () => -1,
  );
}

// 날짜가 고정된 공휴일만 둔다(음력 공휴일은 해마다 바뀌어 데모에서는 뺀다)
const HOLIDAYS: Record<string, string> = {
  "1-1": "신정",
  "3-1": "삼일절",
  "5-5": "어린이날",
  "6-6": "현충일",
  "8-15": "광복절",
  "10-3": "개천절",
  "10-9": "한글날",
  "12-25": "성탄절",
};

const CHO = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ";

/** 병원식 마스킹: 김하늘은 김ㅎ늘로 */
function maskName(name: string) {
  const chars = [...name.trim()];
  if (chars.length < 2) return chars.join("");
  const hide = (ch: string) => {
    const code = ch.charCodeAt(0) - 0xac00;
    return code >= 0 && code < 11172 ? CHO[Math.floor(code / 588)] : "*";
  };
  if (chars.length === 2) return chars[0] + hide(chars[1]);
  return chars.map((ch, i) => (i === 0 || i === chars.length - 1 ? ch : hide(ch))).join("");
}

function maskPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return `${digits.slice(0, 3)}-****-${digits.slice(-4)}`;
}

/* ---------- 분야, 절차 자료 ---------- */

type Field = "lease" | "family" | "criminal" | "civil";

const FIELDS: {
  id: Field;
  label: string;
  icon: typeof KeyRound;
  desc: string;
}[] = [
  {
    id: "lease",
    label: "임대차·부동산",
    icon: KeyRound,
    desc: "보증금 반환, 계약 갱신, 매매 분쟁",
  },
  {
    id: "family",
    label: "이혼·가사",
    icon: Users,
    desc: "협의·재판 이혼, 양육비, 재산분할",
  },
  {
    id: "criminal",
    label: "형사",
    icon: ShieldCheck,
    desc: "경찰 조사 동행, 고소 대리, 합의",
  },
  {
    id: "civil",
    label: "민사 채권",
    icon: Banknote,
    desc: "대여금, 물품 대금, 가압류와 집행",
  },
];

const FIELD_LABEL: Record<Field, string> = Object.fromEntries(FIELDS.map((f) => [f.id, f.label])) as Record<Field, string>;

type Step = { title: string; time: string; body: string; docs: string[] };
type Situation = {
  id: string;
  field: Field;
  label: string;
  total: string;
  steps: Step[];
};

const SITUATIONS: Situation[] = [
  {
    id: "deposit",
    field: "lease",
    label: "전세 보증금을 못 돌려받고 있어요",
    total: "지급명령으로 끝나면 2~3개월, 소송과 경매까지 가면 1년 넘게",
    steps: [
      {
        title: "내용증명 보내기",
        time: "1~2주",
        body: "계약이 끝났으니 보증금을 돌려 달라는 뜻을 날짜가 남는 문서로 보냅니다. 나중에 언제 반환을 요구했는지 보여 주는 자료가 됩니다.",
        docs: ["임대차계약서", "보증금을 보낸 이체 내역", "계약 종료를 알린 문자나 통화 기록"],
      },
      {
        title: "임차권등기명령 신청",
        time: "2주~1개월",
        body: "보증금을 받지 못한 채 이사해야 한다면 먼저 신청합니다. 등기부에 임차권이 올라간 것을 확인한 뒤에 이사해야 대항력과 우선변제권이 그대로 남습니다.",
        docs: ["등기사항전부증명서", "주민등록초본(주소 변동 내역 포함)", "확정일자 받은 계약서 사본"],
      },
      {
        title: "지급명령 또는 보증금 반환 소송",
        time: "지급명령 1~2개월, 소송 6개월~1년",
        body: "집주인이 다투지 않을 것 같으면 지급명령으로 빨리 끝내고, 이의를 내면 소송으로 넘어갑니다. 전세보증금 반환보증에 들었다면 보증기관 청구도 함께 살핍니다.",
        docs: ["내용증명 사본과 받은 날 확인", "집주인 주소", "반환보증 가입 증서(가입한 경우)"],
      },
      {
        title: "강제집행",
        time: "6개월 이상",
        body: "확정된 판결이나 지급명령으로 집주인의 집에 강제경매를 신청하거나 예금을 압류합니다. 경매 대금에서 순위에 따라 보증금을 받습니다.",
        docs: ["판결문 또는 확정된 지급명령 정본", "송달·확정 증명원", "집주인 재산 자료"],
      },
    ],
  },
  {
    id: "renewal",
    field: "lease",
    label: "집주인이 계약 갱신을 거절했어요",
    total: "분쟁조정은 보통 2~3개월, 손해배상 소송은 6개월 안팎",
    steps: [
      {
        title: "갱신 요구한 기록 확인",
        time: "바로",
        body: "계약이 끝나기 6개월 전부터 2개월 전 사이에 갱신을 요구했는지가 먼저입니다. 문자나 내용증명처럼 날짜가 남는 기록을 모읍니다.",
        docs: ["임대차계약서", "갱신을 요구한 문자나 내용증명"],
      },
      {
        title: "거절 이유 따져 보기",
        time: "1~2주",
        body: "집주인이나 가족이 직접 살겠다는 이유처럼 법이 정한 사유인지 확인합니다. 그렇게 거절하고 실제로는 다른 사람에게 세를 놓았다면 손해배상을 청구할 수 있습니다.",
        docs: ["집주인이 보낸 거절 문자", "이사 뒤 새 임차인 여부를 알 수 있는 자료"],
      },
      {
        title: "주택임대차분쟁조정 신청",
        time: "2~3개월",
        body: "소송보다 비용이 적고 빨리 끝납니다. 양쪽이 조정안을 받아들이면 합의한 내용을 조정서로 남깁니다.",
        docs: ["조정 신청서", "상대방 연락처와 주소"],
      },
      {
        title: "손해배상 청구 소송",
        time: "6개월 안팎",
        body: "조정이 되지 않으면 소송으로 손해를 청구합니다. 법에 정한 계산 방식이 있어 받을 수 있는 금액을 미리 가늠해 볼 수 있습니다.",
        docs: ["새 임대차 내용을 보여 주는 자료", "이사 비용, 중개수수료 영수증"],
      },
    ],
  },
  {
    id: "contested",
    field: "family",
    label: "상대가 이혼에 동의하지 않아요",
    total: "조정으로 끝나면 3~6개월, 판결까지 가면 1년 넘게",
    steps: [
      {
        title: "이혼 사유와 증거 정리",
        time: "2~4주",
        body: "부정행위, 악의의 유기, 심하게 부당한 대우처럼 민법이 정한 이혼 사유에 해당하는지 봅니다. 있었던 일을 날짜순으로 적고 자료를 모읍니다.",
        docs: ["혼인관계증명서", "가족관계증명서", "이혼 사유를 보여 주는 대화, 사진 자료"],
      },
      {
        title: "재산 지키기(가압류·가처분)",
        time: "2주~1개월",
        body: "소송 중에 상대가 재산을 팔거나 옮기지 못하게 먼저 묶어 둡니다. 재산분할을 청구할 생각이라면 이 단계를 놓치지 않는 것이 좋습니다.",
        docs: ["부동산 등기사항전부증명서", "알고 있는 상대 계좌, 차량 정보"],
      },
      {
        title: "소장 제출과 조정",
        time: "2~6개월",
        body: "이혼과 함께 재산분할, 친권·양육권, 양육비를 한 번에 청구합니다. 가정법원은 대개 조정을 먼저 거치고, 여기서 합의하면 판결 없이 끝납니다.",
        docs: ["주민등록등본", "재산 목록과 통장 거래 내역", "자녀 양육 상황을 보여 주는 자료"],
      },
      {
        title: "가사조사, 변론과 판결",
        time: "6개월 이상",
        body: "조정이 되지 않으면 가사조사관 면담과 변론을 거쳐 판결을 받습니다. 자녀가 있으면 양육 환경을 자세히 살펴봅니다.",
        docs: ["진술서", "증인이 있다면 연락처"],
      },
    ],
  },
  {
    id: "agreed",
    field: "family",
    label: "협의이혼을 하려는데 양육비가 걱정돼요",
    total: "자녀가 있으면 3개월 넘게, 없으면 1개월 넘게",
    steps: [
      {
        title: "양육 협의서 쓰기",
        time: "1~2주",
        body: "친권자, 양육자, 양육비, 면접교섭을 정해 협의서에 적습니다. 양육비는 금액과 매달 주는 날짜를 구체적으로 적어야 나중에 다툼이 줄어듭니다.",
        docs: ["자녀 양육과 친권자 결정에 관한 협의서", "부부 각각의 소득 자료"],
      },
      {
        title: "의사확인 신청과 이혼 안내",
        time: "하루",
        body: "부부가 함께 가정법원에 가서 협의이혼 의사확인을 신청하고 이혼 안내를 받습니다.",
        docs: ["협의이혼의사확인신청서", "부부 각각의 가족관계증명서, 혼인관계증명서", "신분증"],
      },
      {
        title: "숙려기간",
        time: "1~3개월",
        body: "자녀가 있으면 3개월, 없으면 1개월을 기다립니다. 가정폭력처럼 급한 사정이 있으면 기간을 줄여 달라고 신청할 수 있습니다.",
        docs: ["숙려기간 단축 사유서(필요한 경우)"],
      },
      {
        title: "확인 기일과 이혼 신고",
        time: "확인 뒤 3개월 안",
        body: "법원이 의사를 확인하면 양육비부담조서가 만들어집니다. 상대가 양육비를 주지 않으면 이 조서로 바로 강제집행할 수 있습니다. 확인서를 받은 날부터 3개월 안에 시청이나 구청, 읍면사무소에 신고해야 이혼이 됩니다.",
        docs: ["협의이혼의사확인서 등본", "이혼신고서"],
      },
    ],
  },
  {
    id: "summons",
    field: "criminal",
    label: "경찰 출석 요구를 받았어요",
    total: "조사 뒤 결과 통지까지 보통 몇 주에서 몇 개월",
    steps: [
      {
        title: "출석 요구 내용 확인",
        time: "바로",
        body: "어떤 사건인지, 피의자로 부른 것인지 참고인으로 부른 것인지 먼저 확인합니다. 출석 날짜는 담당 수사관과 조율할 수 있습니다.",
        docs: ["출석요구서 또는 문자", "담당 수사관 이름과 연락처"],
      },
      {
        title: "있었던 일 정리",
        time: "3일~1주",
        body: "있었던 일을 시간순으로 적고 관련 자료를 모읍니다. 기억이 흐린 부분은 짐작으로 채우지 않고 모른다고 적어 둡니다.",
        docs: ["시간순으로 적은 메모", "메시지, 통화 기록", "사진이나 영상"],
      },
      {
        title: "경찰 조사",
        time: "하루",
        body: "변호인이 조사에 함께 들어갈 수 있습니다. 조서는 끝까지 읽고, 말한 것과 다른 부분은 고쳐 달라고 한 뒤에 서명합니다.",
        docs: ["신분증"],
      },
      {
        title: "수사 결과 통지",
        time: "몇 주~몇 개월",
        body: "경찰은 사건을 검찰에 보내거나(송치) 보내지 않는(불송치) 결정을 하고 결과를 알려 줍니다. 송치되면 검찰이 재판에 넘길지를 정합니다.",
        docs: ["수사 결과 통지서"],
      },
    ],
  },
  {
    id: "complaint",
    field: "criminal",
    label: "중고 거래 사기를 당해 고소하고 싶어요",
    total: "고소부터 결과 통지까지 보통 3~6개월",
    steps: [
      {
        title: "증거 모으기",
        time: "1주",
        body: "상대가 지워 버리기 전에 대화와 게시글을 화면 캡처로 남깁니다. 같은 상대에게 당한 사람이 더 있는지도 찾아봅니다.",
        docs: ["대화, 게시글 캡처", "송금 내역", "상대 계좌, 연락처, 아이디"],
      },
      {
        title: "고소장 작성과 제출",
        time: "1~2주",
        body: "누가, 언제, 어떻게 속였고 얼마를 잃었는지 사실 위주로 적어 경찰서에 냅니다.",
        docs: ["고소장", "신분증"],
      },
      {
        title: "고소인 조사",
        time: "하루",
        body: "경찰서에 나가 피해 내용을 진술합니다. 고소장에 넣지 못한 자료가 있으면 이때 함께 냅니다.",
        docs: ["고소 뒤 새로 찾은 자료"],
      },
      {
        title: "결과 통지와 이의신청",
        time: "2~6개월",
        body: "경찰이 불송치 결정을 하면 이의신청을 할 수 있고, 그러면 사건이 검찰로 넘어갑니다. 피해금은 형사 절차와 따로 민사로 청구할 수도 있습니다.",
        docs: ["불송치 결정 통지서(받은 경우)"],
      },
    ],
  },
  {
    id: "loan",
    field: "civil",
    label: "빌려준 돈을 못 받고 있어요",
    total: "지급명령으로 끝나면 2~3개월, 소송까지 가면 6개월 넘게",
    steps: [
      {
        title: "증거 정리와 내용증명",
        time: "1~2주",
        body: "빌려준 사실과 갚기로 한 날을 보여 주는 자료를 모으고, 언제까지 갚으라는 내용증명을 보냅니다.",
        docs: ["차용증", "돈을 보낸 이체 내역", "갚겠다고 한 문자나 녹음"],
      },
      {
        title: "가압류",
        time: "2주~1개월",
        body: "상대가 재산을 빼돌릴 염려가 있으면 예금이나 부동산을 먼저 묶어 둡니다. 법원이 정하는 담보로 공탁금이나 보증보험이 필요합니다.",
        docs: ["상대 주소와 인적 사항", "알고 있는 계좌, 부동산 정보"],
      },
      {
        title: "지급명령 또는 소송",
        time: "지급명령 1~2개월, 소송 6개월 안팎",
        body: "3,000만 원 이하는 소액사건으로 비교적 빨리 진행됩니다. 지급명령에 상대가 이의를 내면 소송으로 넘어갑니다.",
        docs: ["차용증 사본", "내용증명 사본"],
      },
      {
        title: "강제집행",
        time: "1~3개월",
        body: "확정된 판결이나 지급명령으로 급여나 예금을 압류해 받아 냅니다. 상대 재산을 모르면 재산명시나 재산조회를 신청합니다.",
        docs: ["판결문 또는 확정된 지급명령 정본", "송달·확정 증명원"],
      },
    ],
  },
  {
    id: "goods",
    field: "civil",
    label: "거래처가 물품 대금을 주지 않아요",
    total: "지급명령으로 끝나면 2~3개월",
    steps: [
      {
        title: "거래 자료와 날짜 확인",
        time: "1주",
        body: "물품 대금은 3년이 지나면 소멸시효가 끝날 수 있어 마지막 거래일과 대금을 달라고 한 날부터 확인합니다.",
        docs: ["거래명세서", "세금계산서", "발주 메일이나 문자"],
      },
      {
        title: "내용증명과 협의",
        time: "2주",
        body: "밀린 금액과 지급 기한을 적어 보냅니다. 나누어 갚기로 합의하면 공정증서로 남겨 두어야 다시 밀렸을 때 바로 집행할 수 있습니다.",
        docs: ["미수금 내역표", "지금까지 받은 금액 내역"],
      },
      {
        title: "지급명령 신청",
        time: "1~2개월",
        body: "거래 자료가 분명하면 지급명령이 빠릅니다. 상대가 이의를 내면 소송으로 넘어갑니다.",
        docs: ["상대 법인 등기사항전부증명서(법인인 경우)", "사업자등록증 사본"],
      },
      {
        title: "강제집행",
        time: "1~3개월",
        body: "거래처의 예금이나 다른 회사에서 받을 매출 대금을 압류해 받아 냅니다.",
        docs: ["확정된 지급명령 정본", "송달·확정 증명원"],
      },
    ],
  },
];

/* ---------- 페이지 ---------- */

export function LawFirmDemo() {
  const minute = useNowMinute();
  const [preset, setPreset] = useState<{ field: Field; n: number } | null>(null);

  return (
    <div className="min-h-screen text-[16px] leading-[1.7] md:text-[17px]" style={{ background: C.ivory, color: C.ink }}>
      <Header />
      <main>
        <Hero />
        <Guide onBook={(f) => setPreset((p) => ({ field: f, n: (p?.n ?? 0) + 1 }))} />
        <Lawyers />
        <Fees />
        <Cases />
        <Booking minute={minute} preset={preset} />
        <Faq />
        <Location />
      </main>
      <Footer />
    </div>
  );
}

/* ---------- 로고, 머리글 ---------- */

function Logo({ light = false }: { light?: boolean }) {
  const fg = light ? C.ivory : C.navy;
  return (
    <span className="inline-flex items-center gap-2.5">
      <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden>
        <rect x="0.5" y="0.5" width="31" height="31" rx="2" fill="none" stroke={C.gold} />
        <rect x="4" y="4" width="24" height="24" rx="1" fill={fg} />
        <path d="M10 22 H22 M12 10 V20 M16 10 V20 M20 10 V20 M10 10 H22" stroke={light ? C.navy : C.ivory} strokeWidth="1.4" />
      </svg>
      <span className="text-[18px] font-bold tracking-[-0.02em]" style={{ color: fg }}>
        {FIRM}
      </span>
    </span>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotionSafe();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b backdrop-blur" style={{ borderColor: C.line, background: "rgba(246,243,236,0.95)" }}>
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-3 px-4 md:px-6">
        <a href="#top" aria-label={`${FIRM} 처음으로`}>
          <Logo />
        </a>
        <nav aria-label="주 메뉴" className="hidden lg:block">
          <ul className="flex items-center gap-7 text-[15px]">
            {NAV.map((n) => (
              <li key={n.id}>
                <a href={`#${n.id}`} className="transition-colors hover:text-[#14213d]" style={{ color: C.muted }}>
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-2">
          <a href={`tel:${TEL}`} aria-label={`전화 ${TEL}`} className="inline-flex h-11 w-11 items-center justify-center rounded-[4px] border md:hidden" style={{ borderColor: C.line, color: C.navy }}>
            <Phone size={19} aria-hidden />
          </a>
          <a href="#booking" className="hidden h-11 items-center rounded-[4px] px-5 text-[15px] font-semibold md:inline-flex" style={{ background: C.navy, color: C.ivory }}>
            상담 예약
          </a>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-[4px] lg:hidden"
            aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
            aria-expanded={open}
            aria-controls="law-menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={22} aria-hidden /> : <Menu size={22} aria-hidden />}
          </button>
        </div>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.nav
            id="law-menu"
            aria-label="주 메뉴"
            className="overflow-hidden border-t lg:hidden"
            style={{ borderColor: C.line }}
            initial={reduce ? false : { height: 0 }}
            animate={{ height: "auto" }}
            exit={reduce ? { opacity: 0 } : { height: 0 }}
            transition={{ duration: 0.26, ease: EASE }}
          >
            <ul className="px-4 py-2">
              {[...NAV, { id: "booking", label: "상담 예약" }].map((n) => (
                <li key={n.id} className="border-b last:border-b-0" style={{ borderColor: C.line }}>
                  <a href={`#${n.id}`} onClick={() => setOpen(false)} className="flex h-12 items-center text-[17px]">
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

/* ---------- 첫 화면 ---------- */

function Hero() {
  const reduce = useReducedMotionSafe();
  return (
    <section id="top" className="px-4 pb-16 pt-10 md:px-6 md:pb-24 md:pt-16">
      <div className="mx-auto max-w-[1200px]">
        <div className="grid items-center gap-10 md:grid-cols-[1fr_1.15fr] md:gap-14">
          <motion.div initial={reduce ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE }}>
            <p className="flex items-center gap-3 text-[15px] font-semibold" style={{ color: C.goldText }}>
              <span className="h-px w-8" style={{ background: C.gold }} aria-hidden />
              □□법원 건너편 법률사무소
            </p>
            <h1 className="mt-4 text-[36px] font-bold leading-[1.25] tracking-[-0.03em] md:text-[52px]" style={{ color: C.navy }}>
              {FIRM}
            </h1>
            <p className="mt-5 max-w-[480px]" style={{ color: C.muted }}>
              임대차·부동산, 이혼·가사, 형사, 민사 채권 사건을 맡습니다. 처음 오시는 분은 30분 상담을 무료로 받으실 수 있고, 상담은 변호사가 직접 합니다.
            </p>
            <div className="mt-8 flex flex-wrap gap-2.5">
              <a href="#guide" className="inline-flex h-12 items-center rounded-[4px] px-6 font-semibold" style={{ background: C.navy, color: C.ivory }}>
                내 상황 절차 보기
              </a>
              <a href="#booking" className="inline-flex h-12 items-center gap-2 rounded-[4px] border px-6 font-semibold" style={{ borderColor: C.navy, color: C.navy }}>
                <CalendarCheck size={18} aria-hidden />
                상담 예약
              </a>
            </div>
          </motion.div>
          <div className="relative">
            <div className="absolute -bottom-3 -right-3 hidden h-full w-full border md:block" style={{ borderColor: C.gold }} aria-hidden />
            <div className="relative aspect-[4/3] overflow-hidden md:aspect-[7/5]">
              <Image src={`${IMG}/hero.jpg`} alt="책장이 늘어선 조용한 상담실과 긴 회의 탁자" fill priority sizes="(min-width: 768px) 55vw, 100vw" className="object-cover" />
            </div>
          </div>
        </div>

        <ul className="mt-14 grid border-t sm:grid-cols-2 lg:grid-cols-4" style={{ borderColor: C.navy }}>
          {FIELDS.map((f) => (
            <li key={f.id} className="border-b sm:[&:nth-child(odd)]:border-r lg:border-r lg:last:border-r-0" style={{ borderColor: C.line }}>
              <a href="#guide" className="group flex h-full items-start gap-3 px-1 py-5 sm:px-5">
                <f.icon size={20} className="mt-1 shrink-0" style={{ color: C.gold }} aria-hidden />
                <span>
                  <span className="block font-bold group-hover:underline" style={{ color: C.navy }}>
                    {f.label}
                  </span>
                  <span className="block text-[14px]" style={{ color: C.muted }}>
                    {f.desc}
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function SectionHead({ id, tag, title, desc, light = false }: { id: string; tag: string; title: string; desc?: string; light?: boolean }) {
  return (
    <div>
      <p className="flex items-center gap-3 text-[15px] font-semibold" style={{ color: light ? C.gold : C.goldText }}>
        <span className="h-px w-8" style={{ background: C.gold }} aria-hidden />
        {tag}
      </p>
      <h2 id={id} className="mt-3 text-[27px] font-bold leading-[1.35] tracking-[-0.03em] md:text-[36px]" style={{ color: light ? C.ivory : C.navy }}>
        {title}
      </h2>
      {desc && (
        <p className="mt-3 max-w-[660px]" style={{ color: light ? "#c9cedb" : C.muted }}>
          {desc}
        </p>
      )}
    </div>
  );
}

/* ---------- 내 상황 고르기, 절차 지도 ---------- */

function Guide({ onBook }: { onBook: (f: Field) => void }) {
  const reduce = useReducedMotionSafe();
  const [field, setField] = useState<Field>("lease");
  const [sitId, setSitId] = useState("deposit");
  const [openStep, setOpenStep] = useState<number | null>(0);
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const list = SITUATIONS.filter((s) => s.field === field);
  const sit = SITUATIONS.find((s) => s.id === sitId) ?? list[0];

  const pickField = (f: Field) => {
    setField(f);
    setSitId(SITUATIONS.find((s) => s.field === f)!.id);
    setOpenStep(0);
  };

  const docKey = (step: number, doc: number) => `${sit.id}:${step}:${doc}`;
  const allDocs = sit.steps.flatMap((st, i) => st.docs.map((_, j) => docKey(i, j)));
  const doneCount = allDocs.filter((k) => checked[k]).length;

  return (
    <section aria-labelledby="guide-title" id="guide" className="scroll-mt-16 px-4 py-16 md:px-6 md:py-24" style={{ background: C.white }}>
      <div className="mx-auto max-w-[1200px]">
        <SectionHead
          id="guide-title"
          tag="상황별 절차"
          title="지금 겪는 일을 고르면 앞으로의 절차가 보여요"
          desc="단계를 누르면 무슨 일을 하는지와 준비할 서류가 나옵니다. 챙긴 서류에 표시해 두면 상담 때 빠진 것을 바로 알 수 있어요."
        />

        <div className="mt-10 grid gap-10 lg:grid-cols-[380px_1fr] lg:gap-14">
          <div>
            <p className="text-[15px] font-semibold" style={{ color: C.muted }} id="field-label">
              분야
            </p>
            <div role="group" aria-labelledby="field-label" className="mt-2 grid grid-cols-2 gap-2">
              {FIELDS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={field === f.id}
                  onClick={() => pickField(f.id)}
                  className="flex h-12 items-center gap-2 rounded-[4px] border px-3 text-[15px] font-semibold"
                  style={
                    field === f.id
                      ? {
                          background: C.navy,
                          color: C.ivory,
                          borderColor: C.navy,
                        }
                      : { borderColor: C.line, color: C.ink }
                  }
                >
                  <f.icon size={17} aria-hidden style={{ color: field === f.id ? C.gold : C.muted }} />
                  {f.label}
                </button>
              ))}
            </div>

            <p className="mt-7 text-[15px] font-semibold" style={{ color: C.muted }} id="sit-label">
              내 상황
            </p>
            <div role="group" aria-labelledby="sit-label" className="mt-2 space-y-2">
              {list.map((s) => {
                const on = s.id === sit.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => {
                      setSitId(s.id);
                      setOpenStep(0);
                    }}
                    className="relative block w-full rounded-[4px] border px-5 py-4 text-left transition-colors"
                    style={on ? { borderColor: C.navy, background: C.ivory } : { borderColor: C.line, background: C.white }}
                  >
                    <span className="absolute inset-y-3 left-0 w-[3px]" style={{ background: on ? C.gold : "transparent" }} aria-hidden />
                    <span className="block font-bold leading-[1.45]" style={{ color: C.navy }}>
                      “{s.label}”
                    </span>
                    <span className="mt-1 block text-[14px]" style={{ color: C.muted }}>
                      {s.steps.length}단계, {s.total}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-end justify-between gap-3 border-b pb-4" style={{ borderColor: C.line }}>
              <div>
                <p className="text-[14px] font-semibold" style={{ color: C.goldText }}>
                  {FIELD_LABEL[sit.field]}
                </p>
                <p className="text-[20px] font-bold leading-[1.4] md:text-[22px]" style={{ color: C.navy }}>
                  {sit.label}
                </p>
              </div>
              <p className="text-[14px] tabular-nums" style={{ color: C.muted }} aria-live="polite">
                준비 서류 {allDocs.length}개 중 <strong style={{ color: C.navy }}>{doneCount}개</strong> 챙김
              </p>
            </div>

            <ol key={sit.id} className="mt-6">
              {sit.steps.map((st, i) => {
                const last = i === sit.steps.length - 1;
                const open = openStep === i;
                const keys = st.docs.map((_, j) => docKey(i, j));
                const ready = keys.every((k) => checked[k]);
                const panelId = `step-${sit.id}-${i}`;
                return (
                  <li key={st.title} className="relative grid grid-cols-[36px_1fr] gap-x-4 md:grid-cols-[44px_1fr]">
                    <div className="relative flex justify-center">
                      {!last && (
                        <span className="absolute bottom-0 left-1/2 top-9 w-[2px] -translate-x-1/2 md:top-11" aria-hidden>
                          <svg className="block h-full w-full" preserveAspectRatio="none" viewBox="0 0 2 100">
                            <line x1="1" y1="0" x2="1" y2="100" stroke={C.line} strokeWidth="2" />
                            <motion.line
                              x1="1"
                              y1="0"
                              x2="1"
                              y2="100"
                              stroke={C.gold}
                              strokeWidth="2"
                              initial={reduce ? false : { pathLength: 0 }}
                              animate={{ pathLength: 1 }}
                              transition={{
                                duration: 0.5,
                                delay: 0.15 + i * 0.25,
                                ease: EASE,
                              }}
                            />
                          </svg>
                        </span>
                      )}
                      <motion.span
                        className="relative z-[1] inline-flex h-9 w-9 items-center justify-center rounded-full border text-[15px] font-bold tabular-nums md:h-11 md:w-11"
                        style={
                          ready
                            ? {
                                background: C.navy,
                                borderColor: C.navy,
                                color: C.ivory,
                              }
                            : {
                                background: C.white,
                                borderColor: C.navy,
                                color: C.navy,
                              }
                        }
                        initial={reduce ? false : { scale: 0.6, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                          duration: 0.35,
                          delay: i * 0.25,
                          ease: EASE,
                        }}
                        aria-hidden
                      >
                        {ready ? <Check size={17} /> : i + 1}
                      </motion.span>
                    </div>

                    <motion.div
                      className={last ? "pb-2" : "pb-6"}
                      initial={reduce ? false : { opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: 0.4,
                        delay: 0.05 + i * 0.25,
                        ease: EASE,
                      }}
                    >
                      <button
                        type="button"
                        aria-expanded={open}
                        aria-controls={panelId}
                        onClick={() => setOpenStep(open ? null : i)}
                        className="flex min-h-11 w-full items-start justify-between gap-3 pt-1 text-left md:pt-2"
                      >
                        <span>
                          <span className="sr-only">{i + 1}단계 </span>
                          <span className="block font-bold leading-[1.45]" style={{ color: C.navy }}>
                            {st.title}
                          </span>
                          <span className="mt-0.5 block text-[14px]" style={{ color: C.muted }}>
                            보통 {st.time}
                            {ready && <span style={{ color: C.goldText }}>, 서류 준비 끝</span>}
                          </span>
                        </span>
                        <ChevronDown
                          size={20}
                          className="mt-1 shrink-0 transition-transform"
                          style={{
                            color: C.muted,
                            transform: open ? "rotate(180deg)" : undefined,
                          }}
                          aria-hidden
                        />
                      </button>
                      <AnimatePresence initial={false}>
                        {open && (
                          <motion.div
                            id={panelId}
                            className="overflow-hidden"
                            initial={reduce ? false : { height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: EASE }}
                          >
                            <div
                              className="mt-3 rounded-[4px] border p-4 md:p-5"
                              style={{
                                borderColor: C.line,
                                background: C.paper,
                              }}
                            >
                              <p>{st.body}</p>
                              <p className="mt-4 text-[14px] font-semibold" style={{ color: C.goldText }}>
                                준비 서류
                              </p>
                              <ul className="mt-1.5 space-y-1">
                                {st.docs.map((d, j) => {
                                  const k = docKey(i, j);
                                  return (
                                    <li key={d}>
                                      <label className="flex min-h-11 cursor-pointer items-center gap-3">
                                        <input
                                          type="checkbox"
                                          checked={!!checked[k]}
                                          onChange={(e) =>
                                            setChecked((p) => ({
                                              ...p,
                                              [k]: e.target.checked,
                                            }))
                                          }
                                          className="h-5 w-5 shrink-0 accent-[#14213d]"
                                        />
                                        <span
                                          className={checked[k] ? "line-through" : ""}
                                          style={{
                                            color: checked[k] ? C.muted : C.ink,
                                          }}
                                        >
                                          {d}
                                        </span>
                                      </label>
                                    </li>
                                  );
                                })}
                              </ul>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </li>
                );
              })}
            </ol>

            <div className="mt-6 flex flex-col gap-4 border-t pt-5 sm:flex-row sm:items-center sm:justify-between" style={{ borderColor: C.line }}>
              <p className="text-[14px]" style={{ color: C.muted }}>
                사건마다 기간과 절차가 다를 수 있어요.
              </p>
              <a
                href="#booking"
                onClick={() => onBook(sit.field)}
                className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-[4px] px-5 text-[15px] font-semibold"
                style={{ background: C.navy, color: C.ivory }}
              >
                <CalendarCheck size={17} aria-hidden />이 상황으로 상담 예약
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- 변호사 소개 ---------- */

const LAWYERS = [
  {
    initial: "김",
    name: "김○○",
    role: "대표변호사",
    fields: ["임대차·부동산", "민사 채권"],
    career: ["대한변호사협회 전문분야 등록(부동산)", "△△법무법인 소속 변호사", "□□구 마을 무료 법률상담 위원", "□□시 주택임대차분쟁조정 자문"],
    note: "전세 보증금, 갱신 거절, 대여금처럼 생활에서 생기는 돈 문제를 주로 맡습니다.",
  },
  {
    initial: "이",
    name: "이○○",
    role: "변호사",
    fields: ["이혼·가사", "형사"],
    career: ["대한변호사협회 전문분야 등록(가사법)", "△△법률사무소 소속 변호사", "국선변호 사건 수행", "□□가정법원 조정 사건 대리"],
    note: "이혼과 양육 문제, 경찰 조사 동행과 고소 사건을 맡습니다.",
  },
];

function Lawyers() {
  return (
    <section aria-labelledby="lawyers-title" id="lawyers" className="scroll-mt-16 px-4 py-16 md:px-6 md:py-24">
      <div className="mx-auto max-w-[1200px]">
        <div className="grid items-end gap-8 md:grid-cols-[1fr_420px]">
          <SectionHead
            id="lawyers-title"
            tag="변호사 소개"
            title="두 변호사가 분야를 나누어 맡습니다"
            desc="사건을 맡으면 처음 상담한 변호사가 끝까지 진행합니다. 진행 상황은 단계가 바뀔 때마다 문자로 알려 드려요."
          />
          <div className="relative hidden aspect-[4/3] overflow-hidden md:block">
            <Image src={`${IMG}/desk.jpg`} alt="서류와 만년필이 놓인 책상" fill sizes="420px" className="object-cover" />
          </div>
        </div>

        <ul className="mt-10 grid gap-5 md:grid-cols-2">
          {LAWYERS.map((l) => (
            <li key={l.name} className="border-t-2 bg-white p-6 md:p-8" style={{ borderColor: C.navy }}>
              <div className="flex items-center gap-4">
                <span className="relative inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-[24px] font-bold" style={{ background: C.navy, color: C.ivory }} aria-hidden>
                  <span className="absolute inset-[3px] rounded-full border" style={{ borderColor: C.gold }} />
                  {l.initial}
                </span>
                <div>
                  <p className="text-[22px] font-bold leading-[1.3]" style={{ color: C.navy }}>
                    {l.name}
                    <span className="ml-2 text-[15px] font-semibold" style={{ color: C.goldText }}>
                      {l.role}
                    </span>
                  </p>
                  <p className="mt-1 text-[15px]" style={{ color: C.muted }}>
                    주요 분야 {l.fields.join(", ")}
                  </p>
                </div>
              </div>
              <p className="mt-5">{l.note}</p>
              <ul className="mt-5 space-y-2 border-t pt-5 text-[15px]" style={{ borderColor: C.line }}>
                {l.career.map((c) => (
                  <li key={c} className="flex gap-3">
                    <span className="mt-[11px] h-px w-3 shrink-0" style={{ background: C.gold }} aria-hidden />
                    {c}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------- 상담 비용 ---------- */

const FEES = [
  {
    item: "첫 상담 30분",
    price: "무료",
    note: "방문, 전화, 화상 모두 같습니다",
  },
  {
    item: "추가 상담",
    price: "30분마다 5만 원",
    note: "같은 사건으로 다시 상담하는 경우",
  },
  {
    item: "내용증명 작성, 발송",
    price: "30만 원부터",
    note: "분량과 상대방 수에 따라 달라집니다",
  },
  {
    item: "지급명령, 임차권등기명령 신청",
    price: "50만 원부터",
    note: "법원에 내는 인지대, 송달료는 따로",
  },
  {
    item: "소송, 형사 사건 수임료",
    price: "사건 검토 후 안내",
    note: "착수금과 보수를 계약서에 적어 드립니다",
  },
];

function Fees() {
  return (
    <section aria-labelledby="fees-title" id="fees" className="scroll-mt-16 px-4 py-16 md:px-6 md:py-24" style={{ background: C.white }}>
      <div className="mx-auto max-w-[1200px]">
        <SectionHead id="fees-title" tag="상담 비용" title="비용은 상담 전에 먼저 알려 드려요" />
        <div className="mt-10 grid items-start gap-10 lg:grid-cols-[1fr_340px]">
          <table className="w-full border-t-2 text-left" style={{ borderColor: C.navy }}>
            <caption className="sr-only">항목별 상담과 사건 비용</caption>
            <thead className="sr-only">
              <tr>
                <th scope="col">항목</th>
                <th scope="col">비용</th>
                <th scope="col">참고</th>
              </tr>
            </thead>
            <tbody>
              {FEES.map((f) => (
                <tr key={f.item} className="grid border-b py-4 md:table-row md:py-0" style={{ borderColor: C.line }}>
                  <th scope="row" className="font-semibold md:w-[34%] md:py-5 md:pr-4" style={{ color: C.navy }}>
                    {f.item}
                  </th>
                  <td className="font-bold tabular-nums md:w-[26%] md:py-5 md:pr-4" style={{ color: f.price === "무료" ? C.goldText : C.ink }}>
                    {f.price}
                  </td>
                  <td className="text-[15px] md:py-5" style={{ color: C.muted }}>
                    {f.note}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="rounded-[4px] p-6" style={{ background: C.ivory }}>
            <p className="font-bold" style={{ color: C.navy }}>
              수임료를 정하는 방식
            </p>
            <ul className="mt-3 space-y-3 text-[15px]" style={{ color: C.muted }}>
              <li>민사·가사 사건은 착수금과 성공보수로 나누어 정합니다.</li>
              <li>형사 사건은 성공보수 없이 착수금으로만 정합니다.</li>
              <li>착수금은 나누어 내실 수 있습니다.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- 해결 사례 ---------- */

const CASES: { field: Field; title: string; body: string; result: string }[] = [
  {
    field: "lease",
    title: "계약이 끝나고 5개월째 보증금을 못 받은 세입자",
    body: "임차권등기명령으로 권리를 지킨 뒤 이사하고, 지급명령을 신청했습니다.",
    result: "집주인이 이의를 내지 않아 지급명령이 확정됐고, 경매 신청 전에 보증금을 모두 돌려받았습니다.",
  },
  {
    field: "lease",
    title: "직접 산다며 갱신을 거절한 뒤 새 세입자를 들인 집주인",
    body: "전입 기록과 중개 광고를 근거로 주택임대차분쟁조정을 신청했습니다.",
    result: "조정에서 손해배상금과 이사 비용을 받기로 합의했습니다.",
  },
  {
    field: "family",
    title: "이혼을 거부하던 배우자와의 재판상 이혼",
    body: "소송 전에 부동산을 가압류하고, 조정 기일에 양육 계획을 구체적으로 냈습니다.",
    result: "조정으로 이혼이 성립했고 친권, 양육권과 매달 양육비를 정했습니다.",
  },
  {
    field: "family",
    title: "협의이혼 뒤 1년 넘게 밀린 양육비",
    body: "양육비부담조서를 근거로 상대방 급여 압류를 신청했습니다.",
    result: "밀린 양육비를 받았고, 이후 양육비는 급여에서 바로 들어오고 있습니다.",
  },
  {
    field: "criminal",
    title: "술자리 다툼으로 폭행 혐의 조사를 받게 된 직장인",
    body: "경찰 조사에 함께 들어가고, 상대방과의 합의를 도왔습니다.",
    result: "합의서를 내 불송치 결정을 받았습니다.",
  },
  {
    field: "criminal",
    title: "중고 거래 사기 피해자 여러 명의 고소 대리",
    body: "피해자들의 송금 내역과 대화를 모아 한 번에 고소장을 냈습니다.",
    result: "피의자가 특정되어 재판에 넘겨졌고, 피해금 일부를 배상받았습니다.",
  },
  {
    field: "civil",
    title: "지인에게 빌려준 1,500만 원",
    body: "차용증이 없어 이체 내역과 문자로 빌려준 사실을 정리하고 소액사건으로 청구했습니다.",
    result: "판결을 받아 상대방 예금을 압류해 원금과 이자를 받았습니다.",
  },
  {
    field: "civil",
    title: "6개월 밀린 거래처 물품 대금",
    body: "거래처 예금을 가압류한 뒤 지급명령을 신청했습니다.",
    result: "나누어 갚기로 합의하고 공정증서로 남겼습니다.",
  },
];

function Cases() {
  const reduce = useReducedMotionSafe();
  const [filter, setFilter] = useState<Field | "all">("all");
  const list = CASES.filter((c) => filter === "all" || c.field === filter);

  return (
    <section aria-labelledby="cases-title" id="cases" className="scroll-mt-16 px-4 py-16 md:px-6 md:py-24" style={{ background: C.navy }}>
      <div className="mx-auto max-w-[1200px]">
        <SectionHead id="cases-title" tag="해결 사례" title="최근 맡았던 사건들" desc="의뢰인 동의를 받아 알아볼 수 없게 고쳐 적었습니다." light />
        <div role="group" aria-label="분야로 거르기" className="mt-8 flex flex-wrap gap-2">
          {[{ id: "all" as const, label: "전체" }, ...FIELDS].map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={filter === f.id}
              onClick={() => setFilter(f.id)}
              className="h-11 rounded-[4px] border px-4 text-[15px] font-semibold"
              style={filter === f.id ? { background: C.ivory, color: C.navy, borderColor: C.ivory } : { borderColor: "#3a4a70", color: "#d7dbe5" }}
            >
              {f.label}
            </button>
          ))}
        </div>
        <motion.ul layout={!reduce} className="mt-8 grid gap-px md:grid-cols-2" style={{ background: "#2e3d61" }}>
          <AnimatePresence initial={false} mode="popLayout">
            {list.map((c) => (
              <motion.li
                key={c.title}
                layout={!reduce}
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="p-6 md:p-7"
                style={{ background: C.navy }}
              >
                <p className="text-[14px] font-semibold" style={{ color: C.gold }}>
                  {FIELD_LABEL[c.field]}
                </p>
                <p className="mt-1.5 text-[18px] font-bold leading-[1.45]" style={{ color: C.ivory }}>
                  {c.title}
                </p>
                <p className="mt-3 text-[15px]" style={{ color: "#c9cedb" }}>
                  {c.body}
                </p>
                <p className="mt-3 border-t pt-3 text-[15px]" style={{ borderColor: "#2e3d61", color: C.ivory }}>
                  <span className="mr-2 font-semibold" style={{ color: C.gold }}>
                    결과
                  </span>
                  {c.result}
                </p>
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      </div>
    </section>
  );
}

/* ---------- 상담 예약 ---------- */

type Method = "visit" | "phone" | "video";

const METHODS: {
  id: Method;
  label: string;
  icon: typeof Phone;
  desc: string;
}[] = [
  {
    id: "visit",
    label: "방문",
    icon: Building2,
    desc: "사무소에서 서류를 함께 봅니다",
  },
  {
    id: "phone",
    label: "전화",
    icon: Phone,
    desc: "예약 시간에 전화를 드립니다",
  },
  {
    id: "video",
    label: "화상",
    icon: Video,
    desc: "접속 주소를 문자로 보내 드립니다",
  },
];

const WEEKDAY_SLOTS = ["10:00", "11:00", "14:00", "15:00", "16:00", "17:00"];
const SAT_SLOTS = ["10:00", "11:00"];

const dateKey = (d: Date) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

function bookableDays(minute: number) {
  if (minute < 0) return [];
  const now = new Date(minute * 60_000);
  const out: Date[] = [];
  for (let i = 1; i <= 14; i++) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
    if (d.getDay() === 0 || HOLIDAYS[`${d.getMonth() + 1}-${d.getDate()}`]) continue;
    out.push(d);
  }
  return out;
}

/** 이미 찬 시간. 날짜와 시간 순서로 정해지므로 다시 그려도 같다. */
const isBooked = (d: Date, i: number) => (d.getDate() * 3 + d.getMonth() + i * 5) % 4 === 0;

type Confirm = {
  no: string;
  method: Method;
  field: Field;
  when: string;
  name: string;
  phone: string;
};

function Booking({ minute, preset }: { minute: number; preset: { field: Field; n: number } | null }) {
  const [method, setMethod] = useState<Method>("visit");
  const [field, setField] = useState<Field | null>(preset?.field ?? null);
  const [prevPreset, setPrevPreset] = useState(preset);
  const [day, setDay] = useState<string | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [memo, setMemo] = useState("");
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState("");
  const [confirm, setConfirm] = useState<Confirm | null>(null);

  // 절차 지도에서 넘어오면 분야를 미리 골라 둔다
  if (preset !== prevPreset) {
    setPrevPreset(preset);
    if (preset) setField(preset.field);
  }

  const days = bookableDays(minute);
  const picked = days.find((d) => dateKey(d) === day) ?? null;
  const slots = picked ? (picked.getDay() === 6 ? SAT_SLOTS : WEEKDAY_SLOTS) : [];

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!field) return setError("상담 받을 분야를 골라 주세요.");
    if (!picked || !slot) return setError("날짜와 시간을 골라 주세요.");
    if (name.trim().length < 2) return setError("이름을 두 글자 이상 적어 주세요.");
    if (phone.replace(/\D/g, "").length < 10) return setError("연락받을 휴대전화 번호를 적어 주세요.");
    if (!agree) return setError("개인정보 수집에 동의해 주셔야 예약할 수 있어요.");
    setError("");
    const mm = String(picked.getMonth() + 1).padStart(2, "0");
    const dd = String(picked.getDate()).padStart(2, "0");
    const t = new Date();
    const seq = String(100 + ((t.getMinutes() * 60 + t.getSeconds()) % 900));
    setConfirm({
      no: `${mm}${dd}-${seq}`,
      method,
      field,
      when: `${picked.getMonth() + 1}월 ${picked.getDate()}일 (${DAY_NAMES[picked.getDay()]}) ${slot}`,
      name: maskName(name),
      phone: maskPhone(phone),
    });
  };

  const reset = () => {
    setConfirm(null);
    setDay(null);
    setSlot(null);
    setName("");
    setPhone("");
    setMemo("");
    setAgree(false);
  };

  const pill = (on: boolean) => (on ? { background: C.navy, color: C.ivory, borderColor: C.navy } : { background: C.white, borderColor: C.line, color: C.ink });

  return (
    <section aria-labelledby="booking-title" id="booking" className="scroll-mt-16 px-4 py-16 md:px-6 md:py-24">
      <div className="mx-auto max-w-[1200px]">
        <SectionHead id="booking-title" tag="상담 예약" title="편한 방식과 시간을 골라 주세요" desc="평일은 오전 10시부터 오후 6시까지, 토요일은 오전에만 상담합니다." />

        <form onSubmit={submit} noValidate className="mt-10 grid gap-10 border-t-2 pt-8 lg:grid-cols-[1fr_1fr] lg:gap-14" style={{ borderColor: C.navy }}>
          <div className="min-w-0 space-y-8">
            <fieldset>
              <legend className="font-bold" style={{ color: C.navy }}>
                상담 방식
              </legend>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {METHODS.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    aria-pressed={method === m.id}
                    onClick={() => setMethod(m.id)}
                    className="flex h-[72px] flex-col items-center justify-center gap-1 rounded-[4px] border text-[15px] font-semibold"
                    style={pill(method === m.id)}
                  >
                    <m.icon size={20} aria-hidden style={{ color: method === m.id ? C.gold : C.muted }} />
                    {m.label}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-[14px]" style={{ color: C.muted }}>
                {METHODS.find((m) => m.id === method)!.desc}
              </p>
            </fieldset>

            <fieldset>
              <legend className="font-bold" style={{ color: C.navy }}>
                분야
              </legend>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {FIELDS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    aria-pressed={field === f.id}
                    onClick={() => setField(f.id)}
                    className="h-12 rounded-[4px] border text-[15px] font-semibold"
                    style={pill(field === f.id)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="font-bold" style={{ color: C.navy }}>
                날짜
              </legend>
              {days.length ? (
                <div className="mt-3 grid grid-cols-4 gap-1.5 sm:grid-cols-6">
                  {days.map((d) => {
                    const k = dateKey(d);
                    const sat = d.getDay() === 6;
                    return (
                      <button
                        key={k}
                        type="button"
                        aria-pressed={day === k}
                        aria-label={`${d.getMonth() + 1}월 ${d.getDate()}일 ${DAY_NAMES[d.getDay()]}요일${sat ? ", 오전만" : ""}`}
                        onClick={() => {
                          setDay(k);
                          setSlot(null);
                        }}
                        className="flex h-[60px] flex-col items-center justify-center rounded-[4px] border leading-[1.2]"
                        style={pill(day === k)}
                      >
                        <span className="text-[16px] font-bold tabular-nums">
                          {d.getMonth() + 1}/{d.getDate()}
                        </span>
                        <span
                          className="text-[13px]"
                          style={{
                            color: day === k ? "#c9cedb" : sat ? C.goldText : C.muted,
                          }}
                        >
                          {DAY_NAMES[d.getDay()]}
                          {sat ? " 오전" : ""}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-3 h-[192px] rounded-[4px]" style={{ background: C.goldSoft }} />
              )}
            </fieldset>

            <fieldset>
              <legend className="font-bold" style={{ color: C.navy }}>
                시간
              </legend>
              {picked ? (
                <div className="mt-3 grid grid-cols-3 gap-1.5 sm:grid-cols-6">
                  {slots.map((s, i) => {
                    const booked = isBooked(picked, i);
                    return (
                      <button
                        key={s}
                        type="button"
                        disabled={booked}
                        aria-pressed={slot === s}
                        aria-label={`${s}${booked ? ", 예약 마감" : ""}`}
                        onClick={() => setSlot(s)}
                        className="h-12 rounded-[4px] border text-[15px] font-semibold tabular-nums disabled:cursor-not-allowed"
                        style={
                          booked
                            ? {
                                borderColor: C.line,
                                color: "#a3a7b0",
                                background: "transparent",
                                textDecoration: "line-through",
                              }
                            : pill(slot === s)
                        }
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="mt-3 text-[15px]" style={{ color: C.muted }}>
                  날짜를 먼저 골라 주세요.
                </p>
              )}
            </fieldset>
          </div>

          <div className="min-w-0">
            <div className="space-y-4 rounded-[4px] bg-white p-5 md:p-7">
              <label className="block">
                <span className="text-[15px] font-semibold">이름</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  placeholder="김하늘"
                  className="mt-1.5 h-12 w-full rounded-[4px] border px-3 outline-none focus:border-[#14213d]"
                  style={{ borderColor: C.line }}
                />
              </label>
              <label className="block">
                <span className="text-[15px] font-semibold">휴대전화</span>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="010-1234-5678"
                  className="mt-1.5 h-12 w-full rounded-[4px] border px-3 outline-none focus:border-[#14213d]"
                  style={{ borderColor: C.line }}
                />
              </label>
              <label className="block">
                <span className="text-[15px] font-semibold">간단한 내용</span>
                <span className="ml-2 text-[14px]" style={{ color: C.muted }}>
                  선택
                </span>
                <textarea
                  value={memo}
                  onChange={(e) => setMemo(e.target.value.slice(0, 300))}
                  rows={4}
                  placeholder="예) 계약이 8월에 끝났는데 집주인이 새 세입자가 들어와야 돌려준다고 합니다."
                  className="mt-1.5 w-full resize-none rounded-[4px] border px-3 py-2.5 outline-none focus:border-[#14213d]"
                  style={{ borderColor: C.line }}
                />
                <span className="block text-right text-[13px] tabular-nums" style={{ color: C.muted }}>
                  {memo.length}/300
                </span>
              </label>
              <div className="rounded-[4px] p-4 text-[14px]" style={{ background: C.ivory, color: C.muted }}>
                <p>수집 항목: 이름, 휴대전화, 상담 내용</p>
                <p>이용 목적: 상담 일정 안내와 상담 준비</p>
                <p>보관 기간: 상담일로부터 1년, 그 뒤 바로 삭제</p>
                <label className="mt-3 flex min-h-11 cursor-pointer items-center gap-3 text-[15px] font-semibold" style={{ color: C.ink }}>
                  <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="h-5 w-5 shrink-0 accent-[#14213d]" />
                  개인정보 수집과 이용에 동의합니다
                </label>
              </div>
              {error && (
                <p className="text-[15px] font-semibold" style={{ color: C.error }} role="alert">
                  {error}
                </p>
              )}
              <button type="submit" className="h-[52px] w-full rounded-[4px] text-[17px] font-bold" style={{ background: C.navy, color: C.ivory }}>
                예약하기
              </button>
              <p className="text-[14px]" style={{ color: C.muted }}>
                상담 내용은 변호사만 봅니다.
              </p>
            </div>
          </div>
        </form>
      </div>
      <ConfirmDialog data={confirm} onClose={reset} />
    </section>
  );
}

function ConfirmDialog({ data, onClose }: { data: Confirm | null; onClose: () => void }) {
  const reduce = useReducedMotionSafe();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!data) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [data, onClose]);

  const guide = data
    ? data.method === "visit"
      ? `${ADDRESS}로 오세요. 관련 서류가 있으면 가져와 주세요.`
      : data.method === "phone"
        ? `예약 시간에 ${TEL}에서 ${data.phone}로 전화를 드립니다.`
        : `상담 30분 전에 ${data.phone}로 화상 접속 주소를 보내 드립니다.`
    : "";

  return (
    <AnimatePresence>
      {data && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(20,33,61,0.6)" }}
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[420px] border-t-4 px-6 pb-7 pt-8 md:px-8"
            style={{ background: C.paper, borderColor: C.gold }}
            initial={reduce ? false : { y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { y: 12, opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="닫기"
              className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-[4px]"
              style={{ color: C.muted }}
            >
              <X size={20} aria-hidden />
            </button>
            <p className="text-[14px] font-semibold" style={{ color: C.goldText }}>
              {FIRM}
            </p>
            <h3 id="confirm-title" className="mt-1 text-[22px] font-bold" style={{ color: C.navy }}>
              상담 예약을 받았습니다
            </h3>
            <dl className="mt-5 border-y text-[15px]" style={{ borderColor: C.line }}>
              {[
                ["상담 번호", data.no],
                ["일시", data.when],
                ["방식", METHODS.find((m) => m.id === data.method)!.label],
                ["분야", FIELD_LABEL[data.field]],
                ["이름", data.name],
                ["연락처", data.phone],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 border-b py-2.5 last:border-b-0" style={{ borderColor: C.line }}>
                  <dt style={{ color: C.muted }}>{k}</dt>
                  <dd className="text-right font-semibold tabular-nums" style={{ color: k === "상담 번호" ? C.navy : C.ink }}>
                    {v}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-[15px]">{guide}</p>
            <p className="mt-2 text-[14px]" style={{ color: C.muted }}>
              일정을 바꾸려면 상담 번호를 말씀하고 {TEL}로 전화해 주세요.
            </p>
            <button type="button" onClick={onClose} className="mt-6 inline-flex h-11 items-center gap-1.5 text-[15px] font-semibold" style={{ color: C.navy }}>
              <RotateCcw size={16} aria-hidden />
              새로 예약하기
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------- 자주 묻는 질문 ---------- */

const FAQS = [
  {
    q: "첫 상담에는 무엇을 가져가면 되나요?",
    a: "계약서, 주고받은 문자, 법원이나 경찰에서 받은 서류처럼 사건과 관련된 것을 모두 가져오세요. 위 상황별 절차에서 표시한 준비 서류 목록을 참고하셔도 됩니다.",
  },
  {
    q: "상담한 내용이 밖으로 알려지지 않나요?",
    a: "변호사는 법에 따라 상담 중 알게 된 내용을 지킬 의무가 있습니다. 사건을 맡기지 않으셔도 마찬가지입니다.",
  },
  {
    q: "상담만 받고 사건은 맡기지 않아도 되나요?",
    a: "네. 상담을 받고 직접 처리하실 수 있는 일이면 방법을 알려 드립니다. 첫 상담 30분은 비용이 없습니다.",
  },
  {
    q: "수임료는 나누어 낼 수 있나요?",
    a: "착수금은 사건 진행에 맞춰 나누어 내실 수 있습니다. 금액과 내는 날짜는 계약서에 적어 드립니다.",
  },
  {
    q: "평일 낮에 시간을 내기 어려워요.",
    a: "토요일 오전에도 상담합니다. 평일 저녁에는 전화나 화상 상담으로 따로 일정을 잡아 드리니 전화로 말씀해 주세요.",
  },
];

function Faq() {
  const reduce = useReducedMotionSafe();
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section aria-labelledby="faq-title" id="faq" className="scroll-mt-16 px-4 py-16 md:px-6 md:py-24" style={{ background: C.white }}>
      <div className="mx-auto grid max-w-[1200px] gap-10 lg:grid-cols-[360px_1fr] lg:gap-14">
        <SectionHead id="faq-title" tag="자주 묻는 질문" title="상담 전에 많이 물어보세요" />
        <ul className="border-t-2" style={{ borderColor: C.navy }}>
          {FAQS.map((f, i) => {
            const on = open === i;
            return (
              <li key={f.q} className="border-b" style={{ borderColor: C.line }}>
                <h3>
                  <button
                    type="button"
                    aria-expanded={on}
                    aria-controls={`faq-${i}`}
                    onClick={() => setOpen(on ? null : i)}
                    className="flex min-h-[64px] w-full items-center justify-between gap-4 py-4 text-left font-bold"
                    style={{ color: C.navy }}
                  >
                    {f.q}
                    <ChevronDown
                      size={20}
                      className="shrink-0 transition-transform"
                      style={{
                        color: C.gold,
                        transform: on ? "rotate(180deg)" : undefined,
                      }}
                      aria-hidden
                    />
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {on && (
                    <motion.div
                      id={`faq-${i}`}
                      className="overflow-hidden"
                      initial={reduce ? false : { height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: EASE }}
                    >
                      <p className="pb-5 pr-8" style={{ color: C.muted }}>
                        {f.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/* ---------- 오시는 길 ---------- */

function MiniMap() {
  return (
    <svg viewBox="0 0 640 380" className="h-auto w-full" role="img" aria-label="□□역 3번 출구에서 □□법원 건너편 □□빌딩 3층 사무소까지 가는 약도">
      <rect width="640" height="380" fill={C.paper} />
      <path d="M0 196 H640" stroke={C.line} strokeWidth="34" />
      <path d="M0 196 H640" stroke={C.white} strokeWidth="1.5" strokeDasharray="14 12" />
      <path d="M118 0 V380" stroke={C.line} strokeWidth="22" />
      <text x="520" y="232" fontSize="14" fill={C.muted}>
        □□로
      </text>
      {/* 법원 */}
      <rect x="250" y="36" width="250" height="116" fill={C.navyMist} stroke={C.line} />
      <text x="375" y="100" fontSize="16" fill={C.navySoft} textAnchor="middle" fontWeight={700}>
        □□법원
      </text>
      {/* 횡단보도 */}
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x="402" y={182 + i * 6} width="34" height="3" fill={C.white} />
      ))}
      {/* 사무소 건물 */}
      <rect x="300" y="236" width="200" height="110" fill={C.white} stroke={C.navy} />
      <rect x="300" y="236" width="200" height="4" fill={C.gold} />
      <text x="400" y="282" fontSize="14" fill={C.muted} textAnchor="middle">
        □□빌딩
      </text>
      <text x="400" y="308" fontSize="16" fill={C.navy} textAnchor="middle" fontWeight={700}>
        3층 {FIRM}
      </text>
      {/* 역 출구 */}
      <rect x="100" y="222" width="36" height="24" rx="3" fill={C.navy} />
      <text x="118" y="239" fontSize="13" fill={C.ivory} textAnchor="middle" fontWeight={700}>
        3
      </text>
      <text x="30" y="276" fontSize="14" fill={C.ink}>
        □□역 3번 출구
      </text>
      <path d="M140 226 H300" stroke={C.gold} strokeWidth="3" strokeDasharray="6 7" />
    </svg>
  );
}

function Location() {
  return (
    <section aria-labelledby="location-title" id="location" className="scroll-mt-16 px-4 py-16 md:px-6 md:py-24">
      <div className="mx-auto max-w-[1200px]">
        <SectionHead id="location-title" tag="오시는 길" title="□□법원 건너편 □□빌딩 3층" />
        <div className="mt-10 grid gap-10 md:grid-cols-[1.2fr_1fr] md:gap-14">
          <div className="overflow-hidden border" style={{ borderColor: C.line }}>
            <MiniMap />
          </div>
          <div>
            <p className="text-[20px] font-bold tracking-[-0.02em] md:text-[22px]" style={{ color: C.navy }}>
              {ADDRESS}
            </p>
            <ul className="mt-6 space-y-5 border-t pt-6" style={{ borderColor: C.line }}>
              {[
                {
                  icon: TrainFront,
                  title: "지하철",
                  body: "□□역 3번 출구로 나와 법원 쪽으로 200m, 횡단보도 앞 건물입니다.",
                },
                {
                  icon: Car,
                  title: "주차",
                  body: "건물 지하 주차장을 이용하시면 상담 시간 동안 주차비를 내 드립니다.",
                },
              ].map((r) => (
                <li key={r.title} className="flex gap-3">
                  <r.icon size={20} className="mt-1 shrink-0" style={{ color: C.gold }} aria-hidden />
                  <span>
                    <span className="font-semibold">{r.title}</span>
                    <span className="block text-[15px]" style={{ color: C.muted }}>
                      {r.body}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
            <table className="mt-6 w-full text-[15px]">
              <caption className="pb-2 text-left font-bold" style={{ color: C.navy }}>
                상담 시간
              </caption>
              <tbody>
                {[
                  ["평일", "10:00 ~ 18:00"],
                  ["토요일", "10:00 ~ 12:00"],
                  ["일요일, 공휴일", "쉽니다"],
                ].map(([k, v]) => (
                  <tr key={k} className="border-t" style={{ borderColor: C.line }}>
                    <th scope="row" className="py-2.5 text-left font-normal" style={{ color: C.muted }}>
                      {k}
                    </th>
                    <td className="py-2.5 text-right font-semibold tabular-nums">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <a href={`tel:${TEL}`} className="mt-7 inline-flex h-12 items-center gap-2 rounded-[4px] px-6 font-semibold" style={{ background: C.navy, color: C.ivory }}>
              <Phone size={18} aria-hidden />
              {TEL}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- 바닥글 ---------- */

function Footer() {
  return (
    <footer className="px-4 pb-24 pt-12 md:px-6" style={{ background: C.navy, color: "#c9cedb" }}>
      <div className="mx-auto max-w-[1200px]">
        <div className="border-b pb-6" style={{ borderColor: "#2e3d61" }}>
          <Logo light />
        </div>
        <dl className="mt-6 grid gap-x-8 gap-y-1.5 text-[14px] sm:grid-cols-2 md:grid-cols-3">
          {[
            ["상호", FIRM],
            ["대표변호사", "김○○"],
            ["광고책임변호사", "김○○"],
            ["사업자등록번호", "000-00-00000"],
            ["주소", ADDRESS],
            ["전화", TEL],
          ].map(([k, v]) => (
            <div key={k} className="flex gap-2">
              <dt className="shrink-0">{k}</dt>
              <dd style={{ color: C.ivory }}>{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </footer>
  );
}
