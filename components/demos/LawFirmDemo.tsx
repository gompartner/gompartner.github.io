"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  Building2,
  CalendarCheck,
  Check,
  ChevronDown,
  ChevronRight,
  MapPin,
  Menu,
  Phone,
  RotateCcw,
  Video,
  X,
} from "lucide-react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { daysAgo, fmtDot, useDemoToday } from "@/hooks/useDemoToday";

/* 법률사무소 홈페이지 데모: 가상의 법률사무소 곰선임.
   사무소 이름, 변호사 이름, 경력, 주소, 전화번호, 사업자 정보, 성공사례는 모두 가상이다.
   절차와 기간은 국내에서 흔한 경우를 기준으로 한 일반 안내다.
   변호사 광고 규정에 맞춰 승소율, 최고, 유일, 결과 보장 같은 표현은 쓰지 않는다.
   "전문"은 대한변협 전문분야 등록 표기에만 쓴다. 형사 사건 성공보수는 받지 않는 것으로 적는다.

   구조: 종합 로펌형. 첫 화면은 풀폭 사진 위 사무소명, 그 아래 업무분야 4칸 글 목록(분야명 + 다루는 사건), 변호사 소개와
   성공사례·상담 안내·오시는 길을 나란히 둔 게시판형 묶음이다.
   하위 화면은 라우트 없이 상태로 바꾼다. 서브 비주얼, 위치 표시줄, 좌측 하위 메뉴(LNB)와 문서형 본문.
   업무분야 하위 화면에서 사건을 고르면 예상 기간, 진행 절차, 준비 서류 체크 목록이 나온다.
   상담신청은 방식을 고르면 그 방식이 되는 시간만 남는다. 확인 창에는 가린 이름과 번호, 상담 번호가 나온다.
   성공사례는 분야와 결과로 거르는 게시판 목록이다.

   디자인: 아이보리 바탕(#f6f3ec)에 짙은 남색(#14213d), 바랜 금색(#b08d57)은 가는 선과 작은 표시에만 쓴다.
   글꼴은 사이트 기본 고딕. 1px 선으로 나누고 모서리는 작게, 그림자는 거의 쓰지 않는다.

   사진 출처(public/images/demo-law):
   AI 생성(Z-Image-Turbo, Apache 2.0) hero, desk, lawyer-1(김ㅈ우), lawyer-2(이ㅅ연) */

const IMG = "/images/demo-law";
const FIRM = "법률사무소 곰선임";
const TEL = "02-000-0000";
const ADDRESS = "ㄱㅇ시 ㅅㄴ로 88 ㅁㄹ빌딩 3층";

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
}[] = [
  {
    id: "lease",
    label: "임대차·부동산",
  },
  {
    id: "family",
    label: "이혼·가사",
  },
  {
    id: "criminal",
    label: "형사",
  },
  {
    id: "civil",
    label: "민사 채권",
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
    label: "전세보증금 반환",
    total: "지급명령으로 끝나면 2~3개월, 소송과 경매까지 가면 1년 넘게",
    steps: [
      {
        title: "내용증명 보내기",
        time: "1~2주",
        body: "임대인에게 계약 종료와 보증금 반환을 요구하는 내용증명을 발송합니다. 이후 소송에서 반환 요구 시점을 입증하는 자료가 됩니다.",
        docs: ["임대차계약서", "보증금을 보낸 이체 내역", "계약 종료를 알린 문자나 통화 기록"],
      },
      {
        title: "임차권등기명령 신청",
        time: "2주~1개월",
        body: "보증금을 돌려받지 못한 상태에서 이사해야 할 경우 신청합니다. 등기부에 임차권등기가 된 것을 확인한 뒤 이사해야 대항력과 우선변제권이 유지됩니다.",
        docs: ["등기사항전부증명서", "주민등록초본(주소 변동 내역 포함)", "확정일자 받은 계약서 사본"],
      },
      {
        title: "지급명령 또는 보증금 반환 소송",
        time: "지급명령 1~2개월, 소송 6개월~1년",
        body: "임대인이 다툼 없이 인정하는 경우 지급명령으로 신속하게 진행하고, 이의신청이 있으면 소송으로 전환됩니다. 전세보증금 반환보증에 가입하셨다면 보증기관 청구도 함께 검토합니다.",
        docs: ["내용증명 사본과 받은 날 확인", "집주인 주소", "반환보증 가입 증서(가입한 경우)"],
      },
      {
        title: "강제집행",
        time: "6개월 이상",
        body: "확정판결이나 지급명령을 근거로 임대인 소유 주택의 강제경매 또는 예금 압류를 신청합니다. 경매 대금에서 배당 순위에 따라 보증금을 회수합니다.",
        docs: ["판결문 또는 확정된 지급명령 정본", "송달·확정 증명원", "집주인 재산 자료"],
      },
    ],
  },
  {
    id: "renewal",
    field: "lease",
    label: "계약갱신 거절",
    total: "분쟁조정은 보통 2~3개월, 손해배상 소송은 6개월 안팎",
    steps: [
      {
        title: "갱신 요구한 기록 확인",
        time: "바로",
        body: "계약 만료 6개월 전부터 2개월 전 사이에 갱신을 요구했는지 확인합니다. 문자, 내용증명 등 요구 시점을 입증할 자료를 준비합니다.",
        docs: ["임대차계약서", "갱신을 요구한 문자나 내용증명"],
      },
      {
        title: "거절 이유 따져 보기",
        time: "1~2주",
        body: "임대인 또는 가족의 실거주 등 법에서 정한 거절 사유에 해당하는지 확인합니다. 실거주를 이유로 거절한 뒤 제3자에게 임대했다면 손해배상을 청구할 수 있습니다.",
        docs: ["집주인이 보낸 거절 문자", "이사 뒤 새 임차인 여부를 알 수 있는 자료"],
      },
      {
        title: "주택임대차분쟁조정 신청",
        time: "2~3개월",
        body: "소송보다 비용이 적고 기간이 짧습니다. 양측이 조정안을 받아들이면 조정서가 작성됩니다.",
        docs: ["조정 신청서", "상대방 연락처와 주소"],
      },
      {
        title: "손해배상 청구 소송",
        time: "6개월 안팎",
        body: "조정이 성립하지 않으면 손해배상청구 소송을 진행합니다. 손해액은 주택임대차보호법에서 정한 기준으로 산정합니다.",
        docs: ["새 임대차 내용을 보여 주는 자료", "이사 비용, 중개수수료 영수증"],
      },
    ],
  },
  {
    id: "contested",
    field: "family",
    label: "재판상 이혼",
    total: "조정으로 끝나면 3~6개월, 판결까지 가면 1년 넘게",
    steps: [
      {
        title: "이혼 사유와 증거 정리",
        time: "2~4주",
        body: "부정행위, 악의의 유기, 심히 부당한 대우 등 민법상 이혼 사유에 해당하는지 검토합니다. 사실관계를 날짜순으로 정리하고 증거자료를 준비합니다.",
        docs: ["혼인관계증명서", "가족관계증명서", "이혼 사유를 보여 주는 대화, 사진 자료"],
      },
      {
        title: "재산 지키기(가압류·가처분)",
        time: "2주~1개월",
        body: "소송 중 상대방이 재산을 처분하지 못하도록 가압류·가처분을 신청합니다. 재산분할을 청구하실 경우 먼저 진행하는 것이 좋습니다.",
        docs: ["부동산 등기사항전부증명서", "알고 있는 상대 계좌, 차량 정보"],
      },
      {
        title: "소장 제출과 조정",
        time: "2~6개월",
        body: "이혼과 함께 재산분할, 친권·양육권, 양육비를 청구합니다. 가정법원은 대부분 조정 절차를 먼저 진행하며, 조정이 성립하면 판결 없이 종결됩니다.",
        docs: ["주민등록등본", "재산 목록과 통장 거래 내역", "자녀 양육 상황을 보여 주는 자료"],
      },
      {
        title: "가사조사, 변론과 판결",
        time: "6개월 이상",
        body: "조정이 성립하지 않으면 가사조사와 변론을 거쳐 판결이 선고됩니다. 자녀가 있는 경우 양육 환경에 대한 조사가 함께 이루어집니다.",
        docs: ["진술서", "증인이 있다면 연락처"],
      },
    ],
  },
  {
    id: "agreed",
    field: "family",
    label: "협의이혼과 양육비",
    total: "자녀가 있으면 3개월 넘게, 없으면 1개월 넘게",
    steps: [
      {
        title: "양육 협의서 쓰기",
        time: "1~2주",
        body: "친권자, 양육자, 양육비, 면접교섭에 관한 사항을 협의서에 작성합니다. 양육비는 금액과 지급일을 구체적으로 정해 두어야 이후 분쟁을 줄일 수 있습니다.",
        docs: ["자녀 양육과 친권자 결정에 관한 협의서", "부부 각각의 소득 자료"],
      },
      {
        title: "의사확인 신청과 이혼 안내",
        time: "하루",
        body: "부부가 함께 가정법원에 출석해 협의이혼 의사확인을 신청하고 이혼 안내를 받습니다.",
        docs: ["협의이혼의사확인신청서", "부부 각각의 가족관계증명서, 혼인관계증명서", "신분증"],
      },
      {
        title: "숙려기간",
        time: "1~3개월",
        body: "자녀가 있으면 3개월, 없으면 1개월의 숙려기간이 있습니다. 가정폭력 등 급박한 사정이 있으면 기간 단축을 신청할 수 있습니다.",
        docs: ["숙려기간 단축 사유서(필요한 경우)"],
      },
      {
        title: "확인 기일과 이혼 신고",
        time: "확인 뒤 3개월 안",
        body: "법원의 의사확인 후 양육비부담조서가 작성되며, 양육비를 지급하지 않으면 이 조서로 강제집행할 수 있습니다. 확인서를 받은 날부터 3개월 이내에 시·구·읍·면사무소에 신고해야 이혼이 성립합니다.",
        docs: ["협의이혼의사확인서 등본", "이혼신고서"],
      },
    ],
  },
  {
    id: "summons",
    field: "criminal",
    label: "경찰 출석 요구",
    total: "조사 뒤 결과 통지까지 보통 몇 주에서 몇 개월",
    steps: [
      {
        title: "출석 요구 내용 확인",
        time: "바로",
        body: "어떤 사건인지, 피의자 신분인지 참고인 신분인지 먼저 확인합니다. 출석 일정은 담당 수사관과 조율할 수 있습니다.",
        docs: ["출석요구서 또는 문자", "담당 수사관 이름과 연락처"],
      },
      {
        title: "있었던 일 정리",
        time: "3일~1주",
        body: "사실관계를 시간순으로 정리하고 관련 자료를 준비합니다. 기억이 정확하지 않은 부분은 추측으로 진술하지 않도록 미리 정리합니다.",
        docs: ["시간순으로 적은 메모", "메시지, 통화 기록", "사진이나 영상"],
      },
      {
        title: "경찰 조사",
        time: "하루",
        body: "변호인이 조사에 참여할 수 있습니다. 조서는 끝까지 확인하고, 진술과 다른 부분은 수정을 요청한 뒤 서명합니다.",
        docs: ["신분증"],
      },
      {
        title: "수사 결과 통지",
        time: "몇 주~몇 개월",
        body: "경찰은 송치 또는 불송치 결정을 하고 결과를 통지합니다. 송치되면 검찰이 기소 여부를 결정합니다.",
        docs: ["수사 결과 통지서"],
      },
    ],
  },
  {
    id: "complaint",
    field: "criminal",
    label: "중고 거래 사기 고소",
    total: "고소부터 결과 통지까지 보통 3~6개월",
    steps: [
      {
        title: "증거 모으기",
        time: "1주",
        body: "상대방이 삭제하기 전에 대화와 게시글을 캡처해 증거로 확보합니다. 같은 피해를 입은 사람이 더 있는지도 확인합니다.",
        docs: ["대화, 게시글 캡처", "송금 내역", "상대 계좌, 연락처, 아이디"],
      },
      {
        title: "고소장 작성과 제출",
        time: "1~2주",
        body: "피해 경위와 피해 금액을 사실 위주로 정리해 경찰서에 고소장을 제출합니다.",
        docs: ["고소장", "신분증"],
      },
      {
        title: "고소인 조사",
        time: "하루",
        body: "경찰서에 출석해 피해 내용을 진술합니다. 고소장에 첨부하지 못한 자료가 있으면 이때 함께 제출합니다.",
        docs: ["고소 뒤 새로 찾은 자료"],
      },
      {
        title: "결과 통지와 이의신청",
        time: "2~6개월",
        body: "불송치 결정이 나면 이의신청을 할 수 있으며, 이 경우 사건이 검찰로 송부됩니다. 피해금은 형사 절차와 별도로 민사소송으로 청구할 수 있습니다.",
        docs: ["불송치 결정 통지서(받은 경우)"],
      },
    ],
  },
  {
    id: "loan",
    field: "civil",
    label: "대여금 청구",
    total: "지급명령으로 끝나면 2~3개월, 소송까지 가면 6개월 넘게",
    steps: [
      {
        title: "증거 정리와 내용증명",
        time: "1~2주",
        body: "대여 사실과 변제기를 입증할 자료를 준비하고, 변제를 요구하는 내용증명을 발송합니다.",
        docs: ["차용증", "돈을 보낸 이체 내역", "갚겠다고 한 문자나 녹음"],
      },
      {
        title: "가압류",
        time: "2주~1개월",
        body: "상대방이 재산을 처분할 우려가 있으면 예금이나 부동산을 가압류합니다. 법원이 정한 담보로 공탁금 또는 보증보험이 필요합니다.",
        docs: ["상대 주소와 인적 사항", "알고 있는 계좌, 부동산 정보"],
      },
      {
        title: "지급명령 또는 소송",
        time: "지급명령 1~2개월, 소송 6개월 안팎",
        body: "3,000만 원 이하는 소액사건으로 비교적 신속하게 진행됩니다. 지급명령에 이의신청이 있으면 소송으로 전환됩니다.",
        docs: ["차용증 사본", "내용증명 사본"],
      },
      {
        title: "강제집행",
        time: "1~3개월",
        body: "확정판결이나 지급명령을 근거로 급여나 예금을 압류해 회수합니다. 상대방 재산을 알 수 없으면 재산명시 또는 재산조회를 신청합니다.",
        docs: ["판결문 또는 확정된 지급명령 정본", "송달·확정 증명원"],
      },
    ],
  },
  {
    id: "goods",
    field: "civil",
    label: "물품대금 청구",
    total: "지급명령으로 끝나면 2~3개월",
    steps: [
      {
        title: "거래 자료와 날짜 확인",
        time: "1주",
        body: "물품대금은 3년의 소멸시효가 적용되므로 마지막 거래일과 청구일을 먼저 확인합니다.",
        docs: ["거래명세서", "세금계산서", "발주 메일이나 문자"],
      },
      {
        title: "내용증명과 협의",
        time: "2주",
        body: "미지급 금액과 지급 기한을 적어 내용증명을 발송합니다. 분할 변제로 합의할 경우 공정증서를 작성해 두면 다시 지급하지 않을 때 바로 강제집행할 수 있습니다.",
        docs: ["미수금 내역표", "지금까지 받은 금액 내역"],
      },
      {
        title: "지급명령 신청",
        time: "1~2개월",
        body: "거래 자료가 명확하면 지급명령으로 신속하게 진행할 수 있습니다. 이의신청이 있으면 소송으로 전환됩니다.",
        docs: ["상대 법인 등기사항전부증명서(법인인 경우)", "사업자등록증 사본"],
      },
      {
        title: "강제집행",
        time: "1~3개월",
        body: "거래처의 예금이나 매출채권을 압류해 회수합니다.",
        docs: ["확정된 지급명령 정본", "송달·확정 증명원"],
      },
    ],
  },
];

/* 업무분야 하위 화면 본문에 쓰는 분야 안내 */
const FIELD_INFO: Record<Field, { summary: string; cases: string[]; lawyer: string }> = {
  lease: {
    summary: "주택·상가 임대차 보증금, 계약갱신, 원상복구 분쟁 및 부동산 매매계약 관련 법률 자문과 소송 대리",
    cases: ["전세보증금 반환", "임차권등기명령", "계약갱신 거절과 손해배상", "매매계약 해제"],
    lawyer: "김ㅈ우 대표변호사",
  },
  family: {
    summary: "협의이혼, 재판상 이혼, 친권·양육권, 양육비, 재산분할 사건",
    cases: ["재판상 이혼", "협의이혼 양육 협의", "재산분할", "양육비 이행"],
    lawyer: "이ㅅ연 변호사",
  },
  criminal: {
    summary: "경찰·검찰 조사 동행, 고소 대리 및 합의 절차",
    cases: ["경찰 조사 동행", "고소장 작성과 제출", "합의 절차", "불송치 결정 이의신청"],
    lawyer: "이ㅅ연 변호사",
  },
  civil: {
    summary: "대여금·물품대금 청구, 가압류 및 강제집행",
    cases: ["대여금 청구", "물품대금 청구", "가압류", "지급명령과 강제집행"],
    lawyer: "김ㅈ우 대표변호사",
  },
};

/* ---------- 메뉴 ---------- */

type Page = "home" | "intro" | "lawyers" | "location" | "practice" | "cases" | "fees" | "faq" | "booking";
type Target = { page: Page; field?: Field };
type Go = (t: Target) => void;

type Group = { id: string; label: string; items: (Target & { label: string })[] };

const GROUPS: Group[] = [
  {
    id: "about",
    label: "사무소 소개",
    items: [
      { page: "intro", label: "사무소 소개" },
      { page: "lawyers", label: "변호사 소개" },
      { page: "location", label: "오시는 길" },
    ],
  },
  {
    id: "practice",
    label: "업무분야",
    items: FIELDS.map((f) => ({ page: "practice" as const, field: f.id, label: f.label })),
  },
  { id: "cases", label: "성공사례", items: [{ page: "cases", label: "성공사례" }] },
  {
    id: "consult",
    label: "상담 안내",
    items: [
      { page: "fees", label: "상담 비용 안내" },
      { page: "faq", label: "자주 묻는 질문" },
      { page: "booking", label: "상담신청" },
    ],
  },
];

const TOP_NAV: (Target & { label: string; group: string })[] = [
  { page: "intro", label: "사무소 소개", group: "about" },
  { page: "lawyers", label: "변호사 소개", group: "about" },
  { page: "practice", field: "lease", label: "업무분야", group: "practice" },
  { page: "cases", label: "성공사례", group: "cases" },
  { page: "fees", label: "상담 안내", group: "consult" },
  { page: "location", label: "오시는 길", group: "about" },
];

const groupOf = (page: Page) => GROUPS.find((g) => g.items.some((it) => it.page === page)) ?? null;
const sameTarget = (a: Target, b: Target) => a.page === b.page && (a.page !== "practice" || a.field === b.field);
const itemLabel = (t: Target) => groupOf(t.page)?.items.find((it) => sameTarget(it, t))?.label ?? "";

/* ---------- 페이지 ---------- */

export function LawFirmDemo() {
  const minute = useNowMinute();
  const [nav, setNav] = useState<Target>({ page: "home" });
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [bookField, setBookField] = useState<Field | null>(null);

  const go: Go = (t) => {
    setNav(t.page === "practice" ? { page: "practice", field: t.field ?? "lease" } : { page: t.page });
    window.scrollTo({ top: 0 });
  };

  const bookCase = (f: Field) => {
    setBookField(f);
    go({ page: "booking" });
  };

  useEffect(() => {
    const f = () => {
      setNav({ page: "home" });
      setBookField(null);
    };
    window.addEventListener("demo:go-home", f);
    return () => window.removeEventListener("demo:go-home", f);
  }, []);

  let body: React.ReactNode = null;
  switch (nav.page) {
    case "intro":
      body = <Intro />;
      break;
    case "lawyers":
      body = <Lawyers />;
      break;
    case "location":
      body = <Location />;
      break;
    case "practice":
      body = <Practice key={nav.field} field={nav.field ?? "lease"} checked={checked} setChecked={setChecked} onBook={bookCase} />;
      break;
    case "cases":
      body = <Cases />;
      break;
    case "fees":
      body = <Fees go={go} />;
      break;
    case "faq":
      body = <Faq />;
      break;
    case "booking":
      body = <Booking minute={minute} initialField={bookField} />;
      break;
  }

  return (
    <div className="min-h-screen text-[16px] leading-[1.7] md:text-[17px]" style={{ background: C.ivory, color: C.ink }}>
      <Header nav={nav} go={go} />
      <main key={`${nav.page}:${nav.field ?? ""}`} className="soft-in">{nav.page === "home" ? <Home go={go} /> : <SubPage nav={nav} go={go}>{body}</SubPage>}</main>
      <QuickRail go={go} />
      <Footer />
    </div>
  );
}

/* ---------- 로고, 머리글 ---------- */

/* 로고: 메인 사이트와 같은 곰 로고 + 법률사무소(작게, 위) + 곰선임(크게) */
function Logo({ light = false }: { light?: boolean }) {
  const fg = light ? C.ivory : C.navy;
  return (
    <span className="inline-flex items-center gap-2.5">
      {/* eslint-disable-next-line @next/next/no-img-element -- 메인 사이트와 같은 곰 로고 */}
      <img src="/images/logo.svg" alt="" aria-hidden width={32} height={32} className="h-8 w-8 shrink-0" />
      <span className="flex flex-col whitespace-nowrap text-left leading-[1.15]" style={{ color: fg }}>
        <span className="text-[11px] font-bold opacity-75">법률사무소</span>
        <span className="text-[18px] font-bold tracking-[-0.02em] md:text-[19px]">곰선임</span>
      </span>
    </span>
  );
}

function Header({ nav, go }: { nav: Target; go: Go }) {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotionSafe();
  const current = groupOf(nav.page);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const move = (t: Target) => {
    setOpen(false);
    go(t);
  };

  return (
    <header className="sticky top-0 z-40 border-b" style={{ borderColor: C.line, background: C.paper }}>
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-2 px-4 md:px-6">
        <button type="button" onClick={() => move({ page: "home" })} aria-label={`${FIRM} 처음 화면`} className="min-w-0">
          <Logo />
        </button>
        <nav aria-label="주 메뉴" className="hidden lg:block">
          <ul className="flex items-center gap-1 text-[15px]">
            {TOP_NAV.map((n) => {
              const on = n.page === "practice" ? nav.page === "practice" : n.page === "fees" ? current?.id === "consult" : nav.page === n.page;
              return (
                <li key={n.label}>
                  <button
                    type="button"
                    onClick={() => move(n)}
                    aria-current={on ? "page" : undefined}
                    className="relative inline-flex h-16 items-center px-3 font-semibold transition-colors hover:text-[#14213d]"
                    style={{ color: on ? C.navy : C.muted }}
                  >
                    {n.label}
                    {on && <span className="absolute inset-x-3 bottom-0 h-[3px]" style={{ background: C.gold }} aria-hidden />}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="flex shrink-0 items-center gap-1.5">
          <a href={`tel:${TEL}`} className="hidden items-center gap-1.5 px-2 text-[15px] font-semibold tabular-nums xl:inline-flex" style={{ color: C.navy }}>
            <Phone size={16} aria-hidden />
            {TEL}
          </a>
          <button
            id="go-booking"
            type="button"
            onClick={() => move({ page: "booking" })}
            className="inline-flex h-10 items-center rounded-[4px] px-3 text-[15px] font-semibold md:h-11 md:px-5"
            style={{ background: C.navy, color: C.ivory }}
          >
            상담신청
          </button>
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
            aria-label="전체 메뉴"
            className="overflow-hidden border-t lg:hidden"
            style={{ borderColor: C.line }}
            initial={reduce ? false : { height: 0 }}
            animate={{ height: "auto" }}
            exit={reduce ? { opacity: 0 } : { height: 0 }}
            transition={{ duration: 0.26, ease: EASE }}
          >
            <div className="grid gap-x-6 px-4 pb-4 pt-2 sm:grid-cols-2">
              {GROUPS.map((g) => (
                <div key={g.id} className="border-b py-3" style={{ borderColor: C.line }}>
                  <p className="text-[14px] font-bold" style={{ color: C.goldText }}>
                    {g.label}
                  </p>
                  <ul className="mt-1">
                    {g.items.map((it) => (
                      <li key={it.label}>
                        <button
                          type="button"
                          onClick={() => move(it)}
                          aria-current={sameTarget(it, nav) ? "page" : undefined}
                          className="flex h-11 w-full items-center text-left text-[17px]"
                          style={{ color: sameTarget(it, nav) ? C.navy : C.ink, fontWeight: sameTarget(it, nav) ? 700 : 400 }}
                        >
                          {it.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <a href={`tel:${TEL}`} className="mt-3 inline-flex h-11 items-center gap-2 text-[17px] font-semibold" style={{ color: C.navy }}>
                <Phone size={18} aria-hidden />
                전화상담 {TEL}
              </a>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

/** 모든 화면 오른쪽 가운데에 붙는 상담 바로가기. 아래쪽 공용 버튼 자리를 피해 세로 가운데에 둔다. */
function QuickRail({ go }: { go: Go }) {
  return (
    <aside aria-label="빠른 상담" className="fixed right-0 top-1/2 z-30 hidden -translate-y-1/2 xl:block">
      <ul className="flex flex-col border border-r-0" style={{ borderColor: C.navySoft, background: C.navy }}>
        <li>
          <button type="button" onClick={() => go({ page: "booking" })} className="flex w-[64px] flex-col items-center gap-1 py-4 text-[13px] font-semibold" style={{ color: C.ivory }}>
            <CalendarCheck size={20} aria-hidden style={{ color: C.gold }} />
            상담예약
          </button>
        </li>
        <li className="border-t" style={{ borderColor: C.navySoft }}>
          <a href={`tel:${TEL}`} className="flex w-[64px] flex-col items-center gap-1 py-4 text-[13px] font-semibold" style={{ color: C.ivory }}>
            <Phone size={20} aria-hidden style={{ color: C.gold }} />
            전화상담
          </a>
        </li>
        <li className="border-t" style={{ borderColor: C.navySoft }}>
          <button type="button" onClick={() => go({ page: "location" })} className="flex w-[64px] flex-col items-center gap-1 py-4 text-[13px] font-semibold" style={{ color: C.ivory }}>
            <MapPin size={20} aria-hidden style={{ color: C.gold }} />
            오시는 길
          </button>
        </li>
        <li className="border-t" style={{ borderColor: C.navySoft }}>
          <button type="button" onClick={() => window.scrollTo({ top: 0 })} className="flex w-[64px] items-center justify-center py-3 text-[12px] font-semibold" style={{ color: "#c9cfdc" }}>
            TOP
          </button>
        </li>
      </ul>
    </aside>
  );
}

/* ---------- 첫 화면 ---------- */

function Home({ go }: { go: Go }) {
  const today = useDemoToday();
  const reduce = useReducedMotionSafe();
  return (
    <>
      <section aria-labelledby="home-title" className="relative">
        <div className="relative h-[420px] md:h-[540px]">
          <Image src={`${IMG}/hero.jpg`} alt="책장이 늘어선 상담실과 긴 회의 탁자" fill priority sizes="100vw" className="object-cover" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(20,33,61,0.25) 0%, rgba(20,33,61,0.55) 55%, rgba(20,33,61,0.88) 100%)" }} aria-hidden />
          <div className="absolute inset-x-0 bottom-0 px-4 pb-12 md:px-6 md:pb-16">
            <motion.div
              className="mx-auto max-w-[1200px]"
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE }}
            >
              <h1 id="home-title" className="text-[40px] font-bold leading-[1.2] tracking-[-0.02em] md:text-[64px]" style={{ color: C.ivory }}>
                {FIRM}
              </h1>
              <p className="mt-3 max-w-[560px] text-[16px] md:text-[18px]" style={{ color: "#dfe3ec" }}>
                ㄱㅇ법원 건너편에서 변호사 2명이 직접 상담하고 사건을 진행합니다.
              </p>
            </motion.div>
          </div>
        </div>

        <nav id="practice" aria-label="업무분야" className="border-b px-4 md:px-6" style={{ borderColor: C.line, background: C.white }}>
          <div className="mx-auto max-w-[1200px] py-8 md:py-10">
            <h2 className="text-[22px] font-bold tracking-[-0.02em] md:text-[24px]" style={{ color: C.navy }}>
              업무분야
            </h2>
            <ul className="mt-4 grid border-t sm:grid-cols-2 lg:grid-cols-4" style={{ borderColor: C.navy }}>
              {FIELDS.map((f, i) => (
                <li
                  key={f.id}
                  className={`border-b py-4 lg:border-b-0 lg:py-5 ${i % 2 === 0 ? "sm:pr-6" : "sm:pl-6"} lg:px-5 lg:first:pl-0 ${i < 3 ? "lg:border-r" : ""}`}
                  style={{ borderColor: C.line }}
                >
                  <button
                    id={`go-field-${f.id}`}
                    type="button"
                    onClick={() => go({ page: "practice", field: f.id })}
                    className="text-left text-[18px] font-bold underline-offset-4 hover:underline md:text-[19px]"
                    style={{ color: C.navy }}
                  >
                    {f.label}
                  </button>
                  <p className="mt-1.5 text-[14px] leading-[1.6]" style={{ color: C.muted }}>
                    {FIELD_INFO[f.id].cases.join(" / ")}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </section>

      <section aria-labelledby="home-lawyers" className="px-4 pt-16 md:px-6 md:pt-20">
        <div className="mx-auto max-w-[1200px]">
          <BoardHead id="home-lawyers" title="변호사 소개" more="더보기" onMore={() => go({ page: "lawyers" })} />
          <ul className="grid md:grid-cols-2">
            {LAWYERS.map((l, i) => (
              <li key={l.name} className={`flex gap-5 border-b py-6 ${i === 0 ? "md:border-r md:pr-8" : "md:pl-8"}`} style={{ borderColor: C.line }}>
                <Portrait src={l.photo} name={l.name} />
                <div className="min-w-0">
                  <p className="text-[20px] font-bold leading-[1.3]" style={{ color: C.navy }}>
                    {l.name}
                    <span className="ml-2 text-[15px] font-semibold" style={{ color: C.muted, fontFamily: "inherit" }}>
                      {l.role}
                    </span>
                  </p>
                  <ul className="mt-2 space-y-0.5 text-[15px]" style={{ color: C.muted }}>
                    {l.career.slice(0, 3).map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="px-4 pb-20 pt-14 md:px-6 md:pb-24">
        <div className="mx-auto grid max-w-[1200px] gap-12 lg:grid-cols-[1.4fr_1fr_1fr] lg:gap-10">
          <section aria-labelledby="home-cases" id="home-cases-box" className="min-w-0">
            <BoardHead id="home-cases" moreId="go-cases" title="성공사례" more="더보기" onMore={() => go({ page: "cases" })} />
            <ul>
              {CASES.slice(0, 5).map((c) => (
                <li key={c.title} className="border-b" style={{ borderColor: C.line }}>
                  <button type="button" onClick={() => go({ page: "cases" })} className="flex min-h-[52px] w-full items-center gap-3 py-2 text-left">
                    <span className="w-[86px] shrink-0 text-[13px] font-semibold" style={{ color: C.goldText }}>
                      {FIELD_LABEL[c.field]}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[15px] hover:underline">{c.title}</span>
                    <span className="hidden shrink-0 text-[13px] tabular-nums sm:inline" style={{ color: C.muted }}>
                      {fmtDot(daysAgo(today, c.ago))}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="home-consult" className="min-w-0">
            <BoardHead id="home-consult" title="상담 안내" />
            <HoursTable />
            <p className="mt-3 text-[15px]" style={{ color: C.muted }}>
              첫 상담 30분은 비용을 받지 않습니다.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => go({ page: "booking" })} className="inline-flex h-12 items-center justify-center gap-1.5 rounded-[4px] text-[15px] font-semibold" style={{ background: C.navy, color: C.ivory }}>
                <CalendarCheck size={17} aria-hidden />
                상담신청
              </button>
              <a href={`tel:${TEL}`} className="inline-flex h-12 items-center justify-center gap-1.5 rounded-[4px] border text-[15px] font-semibold" style={{ borderColor: C.navy, color: C.navy }}>
                <Phone size={17} aria-hidden />
                전화상담
              </a>
            </div>
          </section>

          <section aria-labelledby="home-location" className="min-w-0">
            <BoardHead id="home-location" title="오시는 길" />
            <MiniMap />
            <p className="mt-3 text-[15px]">{ADDRESS}</p>
            <p className="text-[15px]" style={{ color: C.muted }}>
              ㄷㅅ선 ㅅㅈ역 3번 출구에서 걸어서 5분
            </p>
          </section>
        </div>
      </div>
    </>
  );
}

function BoardHead({ id, moreId, title, more, onMore }: { id: string; moreId?: string; title: string; more?: string; onMore?: () => void }) {
  return (
    <div className="flex min-h-[44px] items-end justify-between border-b-2 pb-2" style={{ borderColor: C.navy }}>
      <h2 id={id} className="text-[22px] font-bold tracking-[-0.02em] md:text-[24px]" style={{ color: C.navy }}>
        {title}
      </h2>
      {more && onMore && (
        <button id={moreId} type="button" onClick={onMore} aria-label={`${title} ${more}`} className="inline-flex h-11 items-center gap-0.5 px-1 text-[14px] underline-offset-4 hover:underline" style={{ color: C.muted }}>
          {more}
          <ChevronRight size={15} aria-hidden />
        </button>
      )}
    </div>
  );
}

/** 변호사 사진. 프로필 사진처럼 세로 직사각형으로 자른다. */
function Portrait({ src, name, large = false }: { src: string; name: string; large?: boolean }) {
  return (
    <span className={`relative block shrink-0 overflow-hidden ${large ? "h-[200px] w-[160px]" : "h-[132px] w-[104px]"}`} style={{ background: C.navyMist }}>
      <Image src={src} alt={`${name} 변호사`} fill sizes={large ? "160px" : "104px"} className="object-cover" style={{ objectPosition: "center 20%" }} />
    </span>
  );
}

function HoursTable() {
  return (
    <table className="w-full text-[15px]">
      <caption className="sr-only">상담 시간</caption>
      <tbody>
        {[
          ["평일", "오전 10시 ~ 오후 6시"],
          ["토요일", "오전 10시 ~ 낮 12시"],
          ["일요일·공휴일", "휴무"],
        ].map(([k, v]) => (
          <tr key={k} className="border-b" style={{ borderColor: C.line }}>
            <th scope="row" className="py-2.5 pr-3 text-left font-semibold" style={{ color: C.navy }}>
              {k}
            </th>
            <td className="py-2.5 text-right tabular-nums">{v}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** 오시는 길 약도. 실제 지도 대신 큰길과 역, 사무소 위치만 그린다. */
function MiniMap({ tall = false }: { tall?: boolean }) {
  return (
    <div className={`relative overflow-hidden border ${tall ? "aspect-[16/10]" : "aspect-[16/9]"}`} style={{ borderColor: C.line, background: C.paper }}>
      <svg viewBox="0 0 320 180" className="h-full w-full" role="img" aria-label="ㅅㅈ역 3번 출구에서 ㅅㄴ로를 따라 법원 건너편 ㅁㄹ빌딩까지 가는 약도">
        <rect x="0" y="78" width="320" height="22" fill={C.navyMist} />
        <rect x="148" y="0" width="18" height="180" fill={C.navyMist} />
        <rect x="190" y="18" width="90" height="46" fill={C.goldSoft} stroke={C.line} />
        <text x="235" y="46" textAnchor="middle" fontSize="12" fill={C.muted}>
          ㄱㅇ법원
        </text>
        <rect x="190" y="112" width="58" height="44" fill={C.navy} />
        <text x="219" y="139" textAnchor="middle" fontSize="11" fill={C.ivory}>
          ㅁㄹ빌딩
        </text>
        <circle cx="70" cy="89" r="9" fill={C.white} stroke={C.navy} strokeWidth="2" />
        <text x="70" y="70" textAnchor="middle" fontSize="11" fill={C.navy}>
          ㅅㅈ역 3번 출구
        </text>
        <path d="M79 89 H157 V134 H186" fill="none" stroke={C.gold} strokeWidth="2" strokeDasharray="4 4" />
        <text x="10" y="94" fontSize="10" fill={C.muted}>
          ㅅㄴ로
        </text>
      </svg>
      <MapPin size={22} className="absolute" style={{ left: "66%", top: "52%", color: C.gold }} aria-hidden />
    </div>
  );
}

/* ---------- 하위 화면 틀 ---------- */

function SubPage({ nav, go, children }: { nav: Target; go: Go; children: React.ReactNode }) {
  const group = groupOf(nav.page)!;
  const label = itemLabel(nav);
  const headRef = useRef<HTMLHeadingElement>(null);
  const key = `${nav.page}:${nav.field ?? ""}`;

  useEffect(() => {
    headRef.current?.focus({ preventScroll: true });
  }, [key]);

  return (
    <>
      <div className="relative h-[140px] md:h-[200px]">
        <Image src={`${IMG}/hero.jpg`} alt="" fill sizes="100vw" className="object-cover" style={{ objectPosition: "center 40%" }} />
        <div className="absolute inset-0" style={{ background: "rgba(20,33,61,0.78)" }} aria-hidden />
        <div className="absolute inset-0 flex items-center px-4 md:px-6">
          <p className="mx-auto w-full max-w-[1200px] text-[28px] font-bold tracking-[-0.02em] md:text-[40px]" style={{ color: C.ivory }}>
            {group.label}
          </p>
        </div>
      </div>

      <nav aria-label="현재 위치" className="border-b px-4 md:px-6" style={{ borderColor: C.line, background: C.white }}>
        <ol className="mx-auto flex h-12 max-w-[1200px] items-center gap-1.5 text-[14px]" style={{ color: C.muted }}>
          <li>
            <button type="button" onClick={() => go({ page: "home" })} className="inline-flex h-11 items-center hover:underline">
              홈
            </button>
          </li>
          <li aria-hidden>
            <ChevronRight size={14} />
          </li>
          <li>{group.label}</li>
          {group.items.length > 1 && (
            <>
              <li aria-hidden>
                <ChevronRight size={14} />
              </li>
              <li aria-current="page" className="font-semibold" style={{ color: C.navy }}>
                {label}
              </li>
            </>
          )}
        </ol>
      </nav>

      <div className="px-4 pb-20 pt-8 md:px-6 md:pb-28 md:pt-12">
        <div className="mx-auto grid max-w-[1200px] gap-8 lg:grid-cols-[220px_1fr] lg:gap-14">
          <nav aria-label={`${group.label} 하위 메뉴`} className="min-w-0">
            <p className="hidden h-[72px] items-center px-5 text-[19px] font-bold lg:flex" style={{ background: C.navy, color: C.ivory }}>
              {group.label}
            </p>
            <ul className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 lg:mx-0 lg:block lg:overflow-visible lg:border-x lg:border-b lg:px-0 lg:pb-0" style={{ borderColor: C.line }}>
              {group.items.map((it) => {
                const on = sameTarget(it, nav);
                return (
                  <li key={it.label} className="shrink-0 lg:border-t" style={{ borderColor: C.line }}>
                    <button
                      type="button"
                      onClick={() => go(it)}
                      aria-current={on ? "page" : undefined}
                      className={`flex h-11 w-full items-center justify-between gap-2 whitespace-nowrap rounded-[4px] border px-4 text-[15px] lg:h-[52px] lg:rounded-none lg:border-0 lg:px-5 ${on ? "font-bold" : ""}`}
                      style={on ? { background: C.goldSoft, color: C.navy, borderColor: C.gold } : { background: C.white, color: C.ink, borderColor: C.line }}
                    >
                      {it.label}
                      <ChevronRight size={16} aria-hidden className="hidden lg:block" style={{ color: on ? C.goldText : C.line }} />
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          <article className="min-w-0">
            <h1
              ref={headRef}
              tabIndex={-1}
              className="border-b-2 pb-4 text-[28px] font-bold leading-[1.3] tracking-[-0.02em] outline-none md:text-[34px]"
              style={{ color: C.navy, borderColor: C.navy }}
            >
              {label}
            </h1>
            <div className="mt-8">{children}</div>
          </article>
        </div>
      </div>
    </>
  );
}

function DocH2({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="flex items-center gap-2.5 text-[20px] font-bold tracking-[-0.02em] md:text-[22px]" style={{ color: C.navy }}>
      <span className="h-[18px] w-[3px]" style={{ background: C.gold }} aria-hidden />
      {children}
    </h2>
  );
}

/* ---------- 사무소 소개 ---------- */

function Intro() {
  return (
    <div className="max-w-[820px]">
      <div className="relative aspect-[16/7] overflow-hidden">
        <Image src={`${IMG}/desk.jpg`} alt="서류와 만년필이 놓인 책상" fill sizes="(min-width: 1024px) 820px, 100vw" className="object-cover" />
      </div>
      <div className="mt-8 space-y-4">
        <p>{FIRM}는 임대차·부동산, 이혼·가사, 형사, 민사 채권 사건을 맡는 변호사 2명의 사무소입니다.</p>
        <p>상담 시 사건 진행 절차와 예상 기간, 비용을 먼저 안내해 드립니다.</p>
        <p className="pt-2 text-right font-semibold" style={{ color: C.navy }}>
          대표변호사 김ㅈ우
        </p>
      </div>

      <div className="mt-12">
        <DocH2>운영 원칙</DocH2>
        <dl className="mt-4 border-t" style={{ borderColor: C.navy }}>
          {[
            ["상담", "첫 상담 30분은 변호사가 직접 무료로 상담합니다."],
            ["진행", "상담한 변호사가 사건 종결까지 직접 담당하며, 진행 상황을 문자로 안내해 드립니다."],
            ["비용", "착수금과 성공보수는 위임계약서에 명시하며, 계약서에 없는 추가 비용은 받지 않습니다."],
            ["비밀", "상담 내용은 사건 수임 여부와 관계없이 비밀이 유지됩니다."],
          ].map(([k, v]) => (
            <div key={k} className="grid gap-1 border-b py-4 sm:grid-cols-[120px_1fr]" style={{ borderColor: C.line }}>
              <dt className="font-bold" style={{ color: C.navy }}>
                {k}
              </dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

/* ---------- 변호사 소개 ---------- */

const LAWYERS = [
  {
    photo: `${IMG}/lawyer-1.jpg`,
    name: "김ㅈ우",
    role: "대표변호사",
    fields: ["임대차·부동산", "민사 채권"],
    career: ["대한변호사협회 전문분야 등록(부동산)", "ㅎㅅ법무법인 소속 변호사", "ㅂㄹ구 마을 무료 법률상담 위원", "ㄱㅇ시 주택임대차분쟁조정 자문"],
    note: "전세보증금, 계약갱신 거절, 대여금 사건을 주로 담당하고 있습니다.",
  },
  {
    photo: `${IMG}/lawyer-2.jpg`,
    name: "이ㅅ연",
    role: "변호사",
    fields: ["이혼·가사", "형사"],
    career: ["대한변호사협회 전문분야 등록(가사법)", "ㅈㅇ법률사무소 소속 변호사", "국선변호 사건 수행", "ㄱㅇ가정법원 조정 사건 대리"],
    note: "이혼, 양육비 사건과 경찰 조사 동행을 주로 담당하고 있습니다.",
  },
];

function Lawyers() {
  return (
    <div>
      <ul className="space-y-6">
        {LAWYERS.map((l) => (
          <li key={l.name} className="grid gap-6 border-t-2 pt-6 md:grid-cols-[200px_1fr]" style={{ borderColor: C.navy }}>
            <div className="flex items-center gap-4 md:flex-col md:items-start">
              <Portrait src={l.photo} name={l.name} large />
              <div>
                <p className="text-[24px] font-bold leading-[1.3]" style={{ color: C.navy }}>
                  {l.name}
                </p>
                <p className="text-[15px] font-semibold" style={{ color: C.goldText }}>
                  {l.role}
                </p>
              </div>
            </div>
            <div className="min-w-0">
              <p>{l.note}</p>
              <dl className="mt-5 text-[15px]">
                <div className="grid gap-1 border-t py-3 sm:grid-cols-[96px_1fr]" style={{ borderColor: C.line }}>
                  <dt className="font-semibold" style={{ color: C.navy }}>
                    주요 분야
                  </dt>
                  <dd>{l.fields.join(", ")}</dd>
                </div>
                <div className="grid gap-1 border-y py-3 sm:grid-cols-[96px_1fr]" style={{ borderColor: C.line }}>
                  <dt className="font-semibold" style={{ color: C.navy }}>
                    경력
                  </dt>
                  <dd>
                    <ul className="space-y-1">
                      {l.career.map((c) => (
                        <li key={c}>{c}</li>
                      ))}
                    </ul>
                  </dd>
                </div>
              </dl>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------- 오시는 길 ---------- */

function Location() {
  return (
    <div>
      <MiniMap tall />
      <dl className="mt-8 border-t-2" style={{ borderColor: C.navy }}>
        {[
          ["주소", ADDRESS],
          ["전화", TEL],
          ["지하철", "ㄷㅅ선 ㅅㅈ역 3번 출구에서 ㅅㄴ로를 따라 걸어서 5분"],
          ["버스", "ㄱㅇ법원 정류장에서 내려 길 건너편"],
          ["주차", "건물 지하 주차장, 상담 시 1시간 지원"],
          ["상담 시간", "평일 오전 10시 ~ 오후 6시, 토요일 오전 10시 ~ 낮 12시"],
        ].map(([k, v]) => (
          <div key={k} className="grid gap-1 border-b py-4 sm:grid-cols-[120px_1fr]" style={{ borderColor: C.line }}>
            <dt className="font-bold" style={{ color: C.navy }}>
              {k}
            </dt>
            <dd>{k === "전화" ? <a href={`tel:${TEL}`} className="font-semibold tabular-nums underline-offset-4 hover:underline" style={{ color: C.navy }}>{v}</a> : v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/* ---------- 업무분야: 사건별 절차 ---------- */

function Practice({
  field,
  checked,
  setChecked,
  onBook,
}: {
  field: Field;
  checked: Record<string, boolean>;
  setChecked: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  onBook: (f: Field) => void;
}) {
  const list = SITUATIONS.filter((s) => s.field === field);
  const [sitId, setSitId] = useState(list[0].id);
  const sit = list.find((s) => s.id === sitId) ?? list[0];
  const info = FIELD_INFO[field];

  const docKey = (step: number, doc: number) => `${sit.id}:${step}:${doc}`;
  const allDocs = sit.steps.flatMap((st, i) => st.docs.map((_, j) => docKey(i, j)));
  const doneCount = allDocs.filter((k) => checked[k]).length;

  return (
    <div>
      <p className="max-w-[760px]">{info.summary}</p>
      <dl className="mt-6 grid border-y text-[15px] sm:grid-cols-2" style={{ borderColor: C.line }}>
        <div className="flex gap-3 py-3 sm:border-r sm:pr-4" style={{ borderColor: C.line }}>
          <dt className="shrink-0 font-semibold" style={{ color: C.navy }}>
            담당
          </dt>
          <dd>{info.lawyer}</dd>
        </div>
        <div className="flex gap-3 border-t py-3 sm:border-t-0 sm:pl-4" style={{ borderColor: C.line }}>
          <dt className="shrink-0 font-semibold" style={{ color: C.navy }}>
            다루는 사건
          </dt>
          <dd>{info.cases.join(", ")}</dd>
        </div>
      </dl>

      <section aria-labelledby="case-steps" className="mt-12">
        <DocH2 id="case-steps">사건별 절차</DocH2>
        <div role="group" aria-labelledby="case-steps" id="case-tabs" className="mt-4 flex flex-wrap gap-2">
          {list.map((s) => {
            const on = s.id === sit.id;
            return (
              <button
                key={s.id}
                type="button"
                aria-pressed={on}
                onClick={() => setSitId(s.id)}
                className="h-11 rounded-[4px] border px-4 text-[15px] font-semibold"
                style={on ? { background: C.navy, color: C.ivory, borderColor: C.navy } : { background: C.white, color: C.ink, borderColor: C.line }}
              >
                {s.label}
              </button>
            );
          })}
        </div>

        <div key={sit.id} className="soft-in mt-6 border p-5 md:p-8" style={{ borderColor: C.line, background: C.white }}>
          <h3 className="text-[20px] font-bold" style={{ color: C.navy }}>
            {sit.label}
          </h3>

          <h4 className="mt-6 text-[15px] font-bold" style={{ color: C.goldText }}>
            예상 기간
          </h4>
          <p className="mt-1">{sit.total}</p>

          <h4 className="mt-8 text-[15px] font-bold" style={{ color: C.goldText }}>
            진행 절차
          </h4>
          <ol className="mt-2 border-t" style={{ borderColor: C.navy }}>
            {sit.steps.map((st, i) => {
              const keys = st.docs.map((_, j) => docKey(i, j));
              const done = keys.filter((k) => checked[k]).length;
              const ready = done === keys.length;
              return (
                <li key={st.title} className="grid grid-cols-[40px_1fr] gap-x-3 border-b py-4 md:grid-cols-[48px_1fr_150px] md:gap-x-5" style={{ borderColor: C.line }}>
                  <span
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border text-[15px] font-bold tabular-nums"
                    style={ready ? { background: C.navy, borderColor: C.navy, color: C.ivory } : { background: C.white, borderColor: C.navy, color: C.navy }}
                    aria-hidden
                  >
                    {ready ? <Check size={17} /> : i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="font-bold leading-[1.45]" style={{ color: C.navy }}>
                      <span className="sr-only">{i + 1}단계 </span>
                      {st.title}
                    </p>
                    <p className="mt-1 text-[15px]">{st.body}</p>
                  </div>
                  <div className="col-start-2 mt-2 flex flex-wrap gap-x-3 text-[14px] md:col-start-auto md:mt-0 md:block md:text-right">
                    <p className="tabular-nums" style={{ color: C.muted }}>
                      {st.time}
                    </p>
                    <p className="font-semibold tabular-nums" style={{ color: ready ? C.goldText : C.muted }}>
                      {ready ? "준비" : `준비 서류 ${keys.length}건 중 ${done}건`}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>

          <div className="mt-8 flex flex-wrap items-baseline justify-between gap-2">
            <h4 className="text-[15px] font-bold" style={{ color: C.goldText }} id="doc-list-title">
              준비 서류
            </h4>
            <p className="text-[14px] tabular-nums" style={{ color: C.muted }} aria-live="polite">
              {allDocs.length}건 중 <strong style={{ color: C.navy }}>{doneCount}건</strong> 준비
            </p>
          </div>
          <div id="doc-list" className="mt-2 grid gap-x-8 border-t sm:grid-cols-2" style={{ borderColor: C.navy }}>
            {sit.steps.map((st, i) => (
              <fieldset key={st.title} className="min-w-0 border-b py-3" style={{ borderColor: C.line }}>
                <legend className="sr-only">{st.title} 준비 서류</legend>
                <p className="text-[14px] font-semibold" style={{ color: C.muted }} aria-hidden>
                  {i + 1}. {st.title}
                </p>
                <ul className="mt-1">
                  {st.docs.map((d, j) => {
                    const k = docKey(i, j);
                    return (
                      <li key={d}>
                        <label className="flex min-h-11 cursor-pointer items-center gap-3">
                          <input
                            type="checkbox"
                            checked={!!checked[k]}
                            onChange={(e) => setChecked((p) => ({ ...p, [k]: e.target.checked }))}
                            className="h-5 w-5 shrink-0 accent-[#14213d]"
                          />
                          <span className={checked[k] ? "line-through" : ""} style={{ color: checked[k] ? C.muted : C.ink }}>
                            {d}
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </fieldset>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[14px]" style={{ color: C.muted }}>
              사건마다 기간과 절차가 다를 수 있습니다.
            </p>
            <button
              id="book-this-case"
              type="button"
              onClick={() => onBook(field)}
              className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-[4px] px-5 text-[15px] font-semibold"
              style={{ background: C.navy, color: C.ivory }}
            >
              <CalendarCheck size={17} aria-hidden />이 사건 상담 예약
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ---------- 상담 비용 안내 ---------- */

const FEES = [
  { item: "첫 상담 30분", price: "무료", note: "방문, 전화, 화상 모두 같습니다" },
  { item: "추가 상담", price: "30분마다 5만 원", note: "같은 사건으로 다시 상담하는 경우" },
  { item: "내용증명 작성, 발송", price: "30만 원부터", note: "분량과 상대방 수에 따라 달라집니다" },
  { item: "지급명령, 임차권등기명령 신청", price: "50만 원부터", note: "법원에 내는 인지대, 송달료는 따로" },
  { item: "소송, 형사 사건 수임료", price: "사건 검토 후 안내", note: "착수금과 보수를 계약서에 적어 드립니다" },
];

function Fees({ go }: { go: Go }) {
  return (
    <div>
      <table className="w-full border-t-2 text-left" style={{ borderColor: C.navy }}>
        <caption className="sr-only">항목별 상담과 사건 비용</caption>
        <thead className="hidden md:table-header-group">
          <tr className="border-b text-[14px]" style={{ borderColor: C.line, color: C.muted, background: C.paper }}>
            <th scope="col" className="px-3 py-3 font-semibold">
              항목
            </th>
            <th scope="col" className="px-3 py-3 font-semibold">
              비용
            </th>
            <th scope="col" className="px-3 py-3 font-semibold">
              비고
            </th>
          </tr>
        </thead>
        <tbody>
          {FEES.map((f) => (
            <tr key={f.item} className="grid border-b py-4 md:table-row md:py-0" style={{ borderColor: C.line }}>
              <th scope="row" className="font-semibold md:w-[34%] md:px-3 md:py-4" style={{ color: C.navy }}>
                {f.item}
              </th>
              <td className="font-bold tabular-nums md:w-[26%] md:px-3 md:py-4" style={{ color: f.price === "무료" ? C.goldText : C.ink }}>
                {f.price}
              </td>
              <td className="text-[15px] md:px-3 md:py-4" style={{ color: C.muted }}>
                {f.note}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-3 text-[14px]" style={{ color: C.muted }}>
        부가가치세 별도
      </p>

      <div className="mt-12">
        <DocH2>수임료 산정 방식</DocH2>
        <ul className="mt-4 space-y-2">
          {["민사·가사 사건은 착수금과 성공보수로 나누어 정합니다.", "형사 사건은 성공보수 없이 착수금으로만 정합니다.", "착수금은 사건 진행에 맞춰 나누어 내실 수 있습니다."].map((t) => (
            <li key={t} className="flex gap-3">
              <span className="mt-[13px] h-px w-3 shrink-0" style={{ background: C.gold }} aria-hidden />
              {t}
            </li>
          ))}
        </ul>
        <button type="button" onClick={() => go({ page: "booking" })} className="mt-8 inline-flex h-12 items-center gap-2 rounded-[4px] px-6 text-[15px] font-semibold" style={{ background: C.navy, color: C.ivory }}>
          <CalendarCheck size={17} aria-hidden />
          상담신청
        </button>
      </div>
    </div>
  );
}

/* ---------- 성공사례 ---------- */

// ago: 오늘 기준 며칠 전 게시
const CASES: { field: Field; ago: number; title: string; body: string; result: string; tag: string }[] = [
  {
    field: "lease",
    ago: 13,
    title: "계약 종료 5개월 뒤에도 돌려받지 못한 전세보증금",
    body: "임차권등기명령으로 대항력을 지킨 뒤 이사하고, 지급명령을 신청했습니다.",
    result: "집주인이 이의를 내지 않아 지급명령이 확정됐고, 경매 신청 전에 보증금을 모두 돌려받았습니다.",
    tag: "지급명령 확정",
  },
  {
    field: "family",
    ago: 26,
    title: "이혼을 거부하던 배우자와의 재판상 이혼",
    body: "소송 전에 부동산을 가압류하고, 조정 기일에 양육 계획을 구체적으로 냈습니다.",
    result: "조정으로 이혼이 성립했고 친권, 양육권과 매달 양육비를 정했습니다.",
    tag: "조정 성립",
  },
  {
    field: "criminal",
    ago: 28,
    title: "술자리 다툼으로 폭행 혐의 조사를 받게 된 직장인",
    body: "경찰 조사에 함께 들어가고, 상대방과의 합의 절차를 도왔습니다.",
    result: "합의서를 냈고 불송치 결정을 받았습니다.",
    tag: "불송치",
  },
  {
    field: "civil",
    ago: 49,
    title: "지인에게 빌려준 1,500만 원 대여금 청구",
    body: "차용증이 없어 이체 내역과 문자로 대여 사실을 입증하고 소액사건으로 청구했습니다.",
    result: "판결 후 상대방 예금을 압류해 원금과 이자를 회수했습니다.",
    tag: "판결",
  },
  {
    field: "lease",
    ago: 69,
    title: "실거주를 이유로 갱신을 거절한 뒤 새 임차인을 들인 임대인",
    body: "전입 기록과 중개 광고를 근거로 주택임대차분쟁조정을 신청했습니다.",
    result: "조정에서 손해배상금과 이사 비용을 받기로 합의했습니다.",
    tag: "조정 성립",
  },
  {
    field: "family",
    ago: 71,
    title: "협의이혼 뒤 1년 넘게 밀린 양육비",
    body: "양육비부담조서를 근거로 상대방 급여 압류를 신청했습니다.",
    result: "미지급 양육비를 회수했고, 이후 양육비는 급여에서 직접 지급되고 있습니다.",
    tag: "압류",
  },
  {
    field: "criminal",
    ago: 96,
    title: "중고 거래 사기 피해자 여러 명의 고소 대리",
    body: "피해자들의 송금 내역과 대화를 모아 한 번에 고소장을 냈습니다.",
    result: "피의자가 특정되어 재판에 넘겨졌고, 피해금 일부를 배상받았습니다.",
    tag: "기소",
  },
  {
    field: "civil",
    ago: 112,
    title: "6개월 밀린 거래처 물품대금",
    body: "거래처 예금을 가압류한 뒤 지급명령을 신청했습니다.",
    result: "분할 변제로 합의하고 공정증서를 작성했습니다.",
    tag: "합의",
  },
];

const CASE_TAGS = [...new Set(CASES.map((c) => c.tag))];

/* 게시판에 쌓인 전체 글 수. 데모에는 각 분야 최근 글만 넣어 두고 첫 쪽만 보여 준다. */
const CASE_TOTAL: Record<Field, number> = { lease: 58, family: 43, criminal: 27, civil: 19 };
const CASE_ALL = Object.values(CASE_TOTAL).reduce((a, b) => a + b, 0);

function Cases() {
  const today = useDemoToday();
  const reduce = useReducedMotionSafe();
  const [field, setField] = useState<Field | "all">("all");
  const [tag, setTag] = useState("all");
  const [open, setOpen] = useState<string | null>(null);
  const list = CASES.filter((c) => (field === "all" || c.field === field) && (tag === "all" || c.tag === tag));
  const total = tag !== "all" ? list.length : field === "all" ? CASE_ALL : CASE_TOTAL[field];
  const pages = Math.ceil(total / 10);

  return (
    <div>
      <p className="border-l-2 py-1 pl-4 text-[15px]" style={{ borderColor: C.gold, color: C.muted }}>
        의뢰인 동의를 받아 알아볼 수 없게 고쳐 적었습니다. 사건 결과는 사안마다 다릅니다.
      </p>

      <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div role="group" aria-label="분야" className="flex flex-wrap gap-1.5">
          {[{ id: "all" as const, label: "전체" }, ...FIELDS].map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={field === f.id}
              onClick={() => setField(f.id)}
              className="h-10 rounded-[4px] border px-3.5 text-[15px] font-semibold"
              style={field === f.id ? { background: C.navy, color: C.ivory, borderColor: C.navy } : { background: C.white, borderColor: C.line, color: C.ink }}
            >
              {f.label}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-[15px] font-semibold" style={{ color: C.navy }}>
          결과
          <select value={tag} onChange={(e) => setTag(e.target.value)} className="h-10 min-w-[140px] rounded-[4px] border px-2 font-normal" style={{ borderColor: C.line, background: C.white, color: C.ink }}>
            <option value="all">전체</option>
            {CASE_TAGS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="mt-5 text-[14px]" style={{ color: C.muted }} aria-live="polite">
        총 <strong style={{ color: C.navy }}>{total}</strong>건
      </p>
      <div className="mt-2 border-t-2" style={{ borderColor: C.navy }}>
        <div className="hidden grid-cols-[56px_110px_1fr_120px_100px] gap-3 border-b px-2 py-3 text-center text-[14px] font-semibold md:grid" style={{ borderColor: C.line, background: C.paper, color: C.muted }} aria-hidden>
          <span>번호</span>
          <span>분야</span>
          <span>제목</span>
          <span>결과</span>
          <span>등록일</span>
        </div>
        {list.length === 0 ? (
          <p key={`${field}-${tag}`} className="soft-in border-b py-10 text-center text-[15px]" style={{ borderColor: C.line, color: C.muted }}>
            조건에 맞는 사례가 없습니다.
          </p>
        ) : (
          <ul key={`${field}-${tag}`} className="soft-in">
            {list.map((c) => {
              const no = CASE_ALL - CASES.indexOf(c);
              const on = open === c.title;
              const pid = `case-${no}`;
              return (
                <li key={c.title} className="border-b" style={{ borderColor: C.line }}>
                  <button
                    type="button"
                    aria-expanded={on}
                    aria-controls={pid}
                    onClick={() => setOpen(on ? null : c.title)}
                    className="grid w-full grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1 px-2 py-3.5 text-left md:grid-cols-[56px_110px_1fr_120px_100px] md:py-4 md:text-center"
                    style={on ? { background: C.paper } : undefined}
                  >
                    <span className="hidden text-[14px] tabular-nums md:block" style={{ color: C.muted }}>
                      {no}
                    </span>
                    <span className="order-1 text-[13px] font-semibold md:order-none md:text-[14px]" style={{ color: C.goldText }}>
                      {FIELD_LABEL[c.field]}
                    </span>
                    <span className="order-3 col-span-2 font-semibold leading-[1.45] md:order-none md:col-span-1 md:text-left" style={{ color: C.navy }}>
                      {c.title}
                    </span>
                    <span className="order-2 justify-self-end md:order-none md:justify-self-center">
                      <span className="inline-block rounded-[2px] border px-2 py-0.5 text-[13px] font-semibold" style={{ borderColor: C.gold, color: C.goldText }}>
                        {c.tag}
                      </span>
                    </span>
                    <span className="order-4 text-[13px] tabular-nums md:order-none md:text-[14px]" style={{ color: C.muted }}>
                      {fmtDot(daysAgo(today, c.ago))}
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {on && (
                      <motion.div
                        id={pid}
                        className="overflow-hidden"
                        initial={reduce ? false : { height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                        transition={{ duration: 0.28, ease: EASE }}
                      >
                        <dl className="mx-2 mb-4 border-t text-[15px] md:ml-[178px] md:mr-[232px]" style={{ borderColor: C.line }}>
                          <div className="grid gap-1 py-3 sm:grid-cols-[72px_1fr]">
                            <dt className="font-semibold" style={{ color: C.navy }}>
                              진행
                            </dt>
                            <dd>{c.body}</dd>
                          </div>
                          <div className="grid gap-1 border-t py-3 sm:grid-cols-[72px_1fr]" style={{ borderColor: C.line }}>
                            <dt className="font-semibold" style={{ color: C.navy }}>
                              결과
                            </dt>
                            <dd>{c.result}</dd>
                          </div>
                        </dl>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      {pages > 1 && (
        <p className="mt-6 flex justify-center gap-1 text-[15px] tabular-nums" aria-label="쪽 번호">
          {Array.from({ length: Math.min(pages, 5) }, (_, i) => (
            <span
              key={i}
              aria-current={i === 0 ? "page" : undefined}
              className="inline-flex h-9 min-w-9 items-center justify-center px-1"
              style={i === 0 ? { color: C.navy, fontWeight: 700, borderBottom: `2px solid ${C.navy}` } : { color: C.muted }}
            >
              {i + 1}
            </span>
          ))}
          {pages > 5 && (
            <span className="inline-flex h-9 items-center px-1" style={{ color: C.muted }}>
              ... {pages}
            </span>
          )}
        </p>
      )}
    </div>
  );
}

/* ---------- 상담신청 ---------- */

type Method = "visit" | "phone" | "video";

const METHODS: { id: Method; label: string; icon: typeof Phone; desc: string }[] = [
  { id: "visit", label: "방문", icon: Building2, desc: "사무소에서 서류를 보며 상담합니다." },
  { id: "phone", label: "전화", icon: Phone, desc: "예약 시간에 변호사가 전화드립니다." },
  { id: "video", label: "화상", icon: Video, desc: "접속 주소를 문자로 보내 드립니다." },
];

const WEEKDAY_HOURS = [10, 11, 14, 15, 16, 17];
const SAT_HOURS = [10, 11];
const PAGE = 6;

type Slot = { key: string; date: Date; hour: number; methods: Method[] };

const hourLabel = (h: number) => (h < 12 ? `오전 ${h}시` : h === 12 ? "낮 12시" : `오후 ${h - 12}시`);
const slotLabel = (sl: Slot) => `${sl.date.getMonth() + 1}월 ${sl.date.getDate()}일 (${DAY_NAMES[sl.date.getDay()]}) ${hourLabel(sl.hour)}`;

/** 앞으로 4주 동안 비어 있는 시간. 날짜와 시간 순서로 정해지므로 다시 그려도 같다. */
function openSlots(minute: number) {
  if (minute < 0) return [];
  const now = new Date(minute * 60_000);
  const out: Slot[] = [];
  for (let i = 1; i <= 28; i++) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
    if (d.getDay() === 0 || HOLIDAYS[`${d.getMonth() + 1}-${d.getDate()}`]) continue;
    const sat = d.getDay() === 6;
    (sat ? SAT_HOURS : WEEKDAY_HOURS).forEach((h, j) => {
      const n = d.getDate() * 3 + d.getMonth() + j * 5;
      const methods: Method[] = [];
      if (n % 4 !== 0) methods.push("visit");
      if (n % 3 !== 1) methods.push("phone");
      if (!sat && n % 5 < 2) methods.push("video");
      if (n % 7 === 2) methods.length = 0;
      if (methods.length)
        out.push({
          key: `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}-${h}`,
          date: d,
          hour: h,
          methods,
        });
    });
  }
  return out;
}

type Confirm = { no: string; method: Method; field: Field; when: string; name: string; phone: string };

function Booking({ minute, initialField }: { minute: number; initialField: Field | null }) {
  const [method, setMethod] = useState<Method | null>(null);
  const [field, setField] = useState<Field | null>(initialField);
  const [page, setPage] = useState(0);
  const [slotKey, setSlotKey] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [memo, setMemo] = useState("");
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState("");
  const [confirm, setConfirm] = useState<Confirm | null>(null);

  const all = openSlots(minute);
  const slots = method ? all.filter((sl) => sl.methods.includes(method)) : all;
  const pages = Math.max(1, Math.ceil(slots.length / PAGE));
  const shown = slots.slice(page * PAGE, page * PAGE + PAGE);
  const picked = all.find((sl) => sl.key === slotKey) ?? null;

  const pickMethod = (m: Method) => {
    const next = method === m ? null : m;
    setMethod(next);
    setPage(0);
    if (next && picked && !picked.methods.includes(next)) setSlotKey(null);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!method) return setError("상담 방식을 선택해 주세요.");
    if (!field) return setError("사건 분야를 선택해 주세요.");
    if (!picked) return setError("상담 시간을 선택해 주세요.");
    if (name.trim().length < 2) return setError("이름을 입력해 주세요.");
    if (phone.replace(/\D/g, "").length < 10) return setError("휴대전화 번호를 입력해 주세요.");
    if (!agree) return setError("개인정보 수집과 이용에 동의해 주세요.");
    setError("");
    const mm = String(picked.date.getMonth() + 1).padStart(2, "0");
    const dd = String(picked.date.getDate()).padStart(2, "0");
    const t = new Date();
    const seq = String(100 + ((t.getMinutes() * 60 + t.getSeconds()) % 900));
    setConfirm({ no: `${mm}${dd}-${seq}`, method, field, when: slotLabel(picked), name: maskName(name), phone: maskPhone(phone) });
  };

  const reset = () => {
    setConfirm(null);
    setPage(0);
    setSlotKey(null);
    setName("");
    setPhone("");
    setMemo("");
    setAgree(false);
  };

  const pill = (on: boolean) => (on ? { background: C.navy, color: C.ivory, borderColor: C.navy } : { background: C.white, borderColor: C.line, color: C.ink });

  return (
    <div id="booking">
      <p>상담시간 평일 10:00~18:00, 토요일 10:00~12:00. 첫 상담 30분은 무료입니다.</p>

      <form onSubmit={submit} noValidate className="mt-8 grid gap-10 xl:grid-cols-[1fr_1fr] xl:gap-12">
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
                  onClick={() => pickMethod(m.id)}
                  className="flex h-[72px] flex-col items-center justify-center gap-1 rounded-[4px] border text-[15px] font-semibold"
                  style={pill(method === m.id)}
                >
                  <m.icon size={20} aria-hidden style={{ color: method === m.id ? C.gold : C.muted }} />
                  {m.label}
                </button>
              ))}
            </div>
            {method && (
              <p className="mt-2 text-[14px]" style={{ color: C.muted }}>
                {METHODS.find((m) => m.id === method)!.desc}
              </p>
            )}
          </fieldset>

          <fieldset>
            <legend className="font-bold" style={{ color: C.navy }}>
              사건 분야
            </legend>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {FIELDS.map((f) => (
                <button key={f.id} type="button" aria-pressed={field === f.id} onClick={() => setField(f.id)} className="h-12 rounded-[4px] border text-[15px] font-semibold" style={pill(field === f.id)}>
                  {f.label}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="font-bold" style={{ color: C.navy }}>
              상담 가능 시간
            </legend>
            {all.length ? (
              <>
                <ul key={`${method ?? "all"}-${page}`} className="soft-in mt-3 border-t" style={{ borderColor: C.navy }}>
                  {shown.map((sl) => {
                    const on = slotKey === sl.key;
                    const id = `law-slot-${sl.key}`;
                    return (
                      <li key={sl.key} className="border-b" style={{ borderColor: C.line }}>
                        <label htmlFor={id} className="flex min-h-[60px] cursor-pointer items-center gap-3 px-2 py-2.5" style={on ? { background: C.goldSoft } : undefined}>
                          <input id={id} type="radio" name="law-slot" value={sl.key} checked={on} onChange={() => setSlotKey(sl.key)} className="h-5 w-5 shrink-0 accent-[#14213d]" />
                          <span className="flex min-w-0 flex-1 flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                            <span className="font-semibold tabular-nums" style={{ color: on ? C.navy : C.ink }}>
                              {slotLabel(sl)}
                            </span>
                            <span className="flex shrink-0 gap-2.5 text-[14px]" style={{ color: C.muted }}>
                              {METHODS.filter((m) => sl.methods.includes(m.id)).map((m) => (
                                <span key={m.id} className="inline-flex items-center gap-1">
                                  <m.icon size={15} aria-hidden style={{ color: C.gold }} />
                                  {m.label}
                                </span>
                              ))}
                            </span>
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[15px]">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="inline-flex h-11 items-center px-1 font-semibold disabled:invisible"
                    style={{ color: C.navy }}
                  >
                    이전 시간
                  </button>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(pages - 1, p + 1))}
                    disabled={page >= pages - 1}
                    className="inline-flex h-11 items-center rounded-[4px] border px-4 font-semibold disabled:cursor-not-allowed disabled:opacity-40"
                    style={{ borderColor: C.navy, color: C.navy }}
                  >
                    다음 시간
                  </button>
                </div>
              </>
            ) : (
              <div className="mt-3 h-[372px] rounded-[4px]" style={{ background: C.goldSoft }} />
            )}
          </fieldset>
        </div>

        <div className="min-w-0">
          <div className="space-y-4 border p-5 md:p-7" style={{ borderColor: C.line, background: C.white }}>
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
              <span className="text-[15px] font-semibold">상담 내용</span>
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
              상담신청
            </button>
            <p className="text-[14px]" style={{ color: C.muted }}>
              상담 내용은 담당 변호사만 봅니다.
            </p>
          </div>
        </div>
      </form>
      <ConfirmDialog data={confirm} onClose={reset} />
    </div>
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
      ? `${ADDRESS}로 오시면 됩니다. 관련 서류가 있으면 지참해 주세요.`
      : data.method === "phone"
        ? `예약 시간에 ${TEL}에서 ${data.phone}로 전화드립니다.`
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
            className="relative w-full max-w-[420px] border px-6 pb-7 pt-8 md:px-8"
            style={{ background: C.paper, borderColor: C.line }}
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
            <h2 id="confirm-title" className="mt-1 text-[22px] font-bold" style={{ color: C.navy }}>
              상담신청이 접수되었습니다
            </h2>
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
              일정을 바꾸시려면 상담 번호를 알려 주시고 {TEL}로 전화해 주세요.
            </p>
            <button type="button" onClick={onClose} className="mt-6 inline-flex h-11 items-center gap-1.5 text-[15px] font-semibold" style={{ color: C.navy }}>
              <RotateCcw size={16} aria-hidden />
              새로 신청하기
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
    a: "계약서, 문자 내역, 법원이나 경찰에서 받은 서류 등 사건 관련 자료를 지참해 주세요. 업무분야의 사건별 준비 서류를 참고하시면 됩니다.",
  },
  {
    q: "상담 내용은 비밀이 보장되나요?",
    a: "변호사는 법에 따라 비밀유지 의무가 있습니다. 사건을 의뢰하지 않으셔도 마찬가지입니다.",
  },
  {
    q: "상담만 받아도 되나요?",
    a: "네. 직접 처리하실 수 있는 사안이면 방법을 안내해 드립니다. 첫 상담 30분은 무료입니다.",
  },
  {
    q: "수임료는 나누어 낼 수 있나요?",
    a: "착수금은 사건 진행에 따라 분할 납부하실 수 있습니다. 금액과 납부일은 계약서에 명시합니다.",
  },
  {
    q: "평일 낮에 방문하기 어려운데 상담이 가능한가요?",
    a: "토요일 오전에도 상담합니다. 평일 저녁에는 전화 또는 화상 상담으로 일정을 잡아 드리니 전화로 문의해 주세요.",
  },
];

function Faq() {
  const reduce = useReducedMotionSafe();
  const [open, setOpen] = useState<number | null>(null);

  return (
    <ul className="border-t-2" style={{ borderColor: C.navy }}>
      {FAQS.map((f, i) => {
        const on = open === i;
        return (
          <li key={f.q} className="border-b" style={{ borderColor: C.line }}>
            <h2>
              <button
                type="button"
                aria-expanded={on}
                aria-controls={`faq-${i}`}
                onClick={() => setOpen(on ? null : i)}
                className="flex min-h-[64px] w-full items-center justify-between gap-4 py-4 text-left font-bold"
                style={{ color: C.navy }}
              >
                <span className="flex gap-3">
                  <span style={{ color: C.gold }} aria-hidden>
                    Q
                  </span>
                  {f.q}
                </span>
                <ChevronDown size={20} className="shrink-0 transition-transform" style={{ color: C.gold, transform: on ? "rotate(180deg)" : undefined }} aria-hidden />
              </button>
            </h2>
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
                  <p className="pb-5 pl-7 pr-8" style={{ color: C.muted }}>
                    {f.a}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        );
      })}
    </ul>
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
            ["상호", "법률사무소 ㅎㄱ"],
            ["대표변호사", "김ㅈ우"],
            ["광고책임변호사", "김ㅈ우"],
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
