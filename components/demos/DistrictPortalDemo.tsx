"use client";

import { IBM_Plex_Sans_KR } from "next/font/google";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Baby,
  Briefcase,
  Car,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  House,
  Menu,
  Paperclip,
  Pause,
  Phone,
  Plane,
  Play,
  Plus,
  Search,
  Stethoscope,
  Trash2,
  Truck,
  X,
} from "lucide-react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";

// 한들구청 대표 홈페이지 데모. 가상 자치구, 가상 데이터.
// 대표색은 저녁 하천빛 남색(#13233f)과 노을 주황(#e8562a). 주황은 그래픽·배경에만 쓰고
// 흰 바탕 글자에는 대비 4.5:1 이상인 #b53d14를 쓴다.

const plex = IBM_Plex_Sans_KR({ preload: false, weight: ["400", "700"], subsets: ["latin"], display: "swap" });

const NAVY = "#13233f";
const SUNSET = "#e8562a";
const SUNSET_TEXT = "#b53d14";

const MENU: { title: string; items: string[] }[] = [
  { title: "종합민원", items: ["민원실안내", "민원발급·열람안내", "무인민원발급안내", "민원서식", "여권민원", "대형생활폐기물"] },
  { title: "소통·참여", items: ["구정소식", "구청장에게 바란다", "구민 제안", "주민참여예산", "자유게시판", "교육·강좌", "대여·대관"] },
  { title: "열린행정", items: ["공지사항", "고시공고", "채용공고", "보도자료", "정보공개", "예산·재정"] },
  { title: "분야별 정보", items: ["복지", "보건·건강", "교통·주차", "환경·청소", "일자리·경제", "문화·체육", "안전·재난"] },
  { title: "한들구 소개", items: ["구청장", "일반현황", "조직도", "담당자 찾기", "청사안내", "찾아오시는 길"] },
];

// 알림판: 실제 구청 배너처럼 제목·기간·장소·문의를 배너 안에 크게 박는다
const SLIDES = [
  {
    tag: "행사",
    title: "미리내천 가을 등불 축제",
    lines: ["제7회 미리내천", "가을 등불 축제"],
    sub: "개막 공연 10. 10.(토) 18:30 미리내천 수변무대",
    bg: "#1d2150",
    fg: "#ffffff",
    accent: "#ffc65c",
    soft: "#d9dcf5",
    rows: [
      ["기간", "2026. 10. 10.(토) ~ 10. 19.(월)"],
      ["장소", "미리내천 산책로 일대"],
      ["문의", "문화체육과 02-000-2101"],
    ],
  },
  {
    tag: "공모",
    title: "2027년 주민참여예산 사업 제안 접수",
    lines: ["2027년 주민참여예산", "사업 제안 접수"],
    sub: "구청 누리집, 동주민센터 방문 접수",
    bg: "#e4f1e2",
    fg: "#10351f",
    accent: "#1c6b37",
    soft: "#2f5a3d",
    rows: [
      ["기간", "2026. 9. 21.(월) ~ 10. 31.(토)"],
      ["대상", "한들구 거주·직장·학교 구민"],
      ["문의", "기획예산과 02-000-2201"],
    ],
  },
  {
    tag: "보건",
    title: "어르신 독감 무료 예방접종",
    lines: ["어르신 독감", "무료 예방접종"],
    sub: "신분증 지참, 지정 의료기관 137곳",
    bg: "#ddeefa",
    fg: "#0c2f4a",
    accent: "#0a5f93",
    soft: "#2d4d66",
    rows: [
      ["기간", "2026. 10. 13.(화) ~ 11. 30.(월)"],
      ["대상", "만 65세 이상 한들구민"],
      ["문의", "보건소 02-000-1401"],
    ],
  },
];

// 자주 찾는 서비스: 누르면 담당자 찾기에 해당 업무를 넣어 담당 부서를 바로 보여 준다
const FREQUENT = [
  { label: "여권민원", keyword: "여권", icon: Plane },
  { label: "전입신고", keyword: "전입", icon: Truck },
  { label: "주정차 과태료", keyword: "주정차", icon: Car },
  { label: "대형폐기물", keyword: "대형폐기물", icon: Trash2 },
  { label: "예방접종", keyword: "예방접종", icon: Stethoscope },
  { label: "일자리 상담", keyword: "일자리", icon: Briefcase },
  { label: "민원서식", keyword: "민원서식", icon: FileText },
  { label: "출산·육아 지원", keyword: "출산", icon: Baby },
];


const DEPTS = [
  { dept: "민원여권과", work: "여권 신청, 여권 수령", phone: "02-000-1101" },
  { dept: "민원여권과", work: "가족관계등록, 인감 증명", phone: "02-000-1102" },
  { dept: "민원여권과", work: "전입신고, 주민등록 등·초본", phone: "02-000-1103" },
  { dept: "민원여권과", work: "민원서식, 무인민원발급기", phone: "02-000-1104" },
  { dept: "주차관리과", work: "주정차 과태료, 거주자 우선 주차", phone: "02-000-1201" },
  { dept: "청소행정과", work: "대형폐기물 배출, 음식물 쓰레기", phone: "02-000-1301" },
  { dept: "보건소", work: "예방접종, 건강검진 예약", phone: "02-000-1401" },
  { dept: "일자리정책과", work: "일자리 상담, 구인 구직 연결", phone: "02-000-1501" },
  { dept: "복지정책과", work: "기초생활보장, 긴급 복지 지원", phone: "02-000-1601" },
  { dept: "보육지원과", work: "어린이집 입소, 출산 지원금", phone: "02-000-1701" },
  { dept: "세무과", work: "지방세 납부, 재산세 문의", phone: "02-000-1801" },
  { dept: "건축과", work: "건축 허가, 옥외광고물 신고", phone: "02-000-1901" },
  { dept: "청년정책과", work: "청년 월세 지원, 청년 공간 대관", phone: "02-000-2001" },
  { dept: "문화체육과", work: "축제, 구립 체육시설 대관", phone: "02-000-2101" },
];

/* ---------- 하위 화면 데이터 ---------- */

type Post = {
  title: string;
  date: string;
  dept: string;
  views: number;
  /** 고시공고 번호 */
  no?: string;
  /** 구정소식 구분 */
  cat?: string;
  writer?: string;
  status?: string;
  body?: string[];
  answer?: string[];
};
type BoardKind = "notice" | "gosi" | "qna" | "free";

const BOARDS: Record<string, { kind: BoardKind; posts: Post[] }> = {
  공지사항: {
    kind: "notice",
    posts: [
      { title: "한들구 공공 와이파이 설치 구역 12곳 확대", date: "2026.10.06", dept: "스마트정보과", views: 412 },
      {
        title: "어르신 독감 예방접종 10월 13일부터 시작",
        date: "2026.10.02",
        dept: "보건소",
        views: 1288,
        body: [
          "2026~2027절기 어르신 인플루엔자 무료 예방접종을 다음과 같이 안내합니다.",
          "1. 접종기간: 2026. 10. 13.(화) ~ 11. 30.(월)",
          "2. 접종대상: 만 65세 이상 한들구민 (1961. 12. 31. 이전 출생자)",
          "3. 접종장소: 지정 의료기관 137곳 및 보건소",
          "4. 준비물: 신분증",
          "5. 문의: 보건소 02-000-1401",
        ],
      },
      { title: "미리내천 산책로 야간 조명 교체 공사 안내", date: "2026.09.29", dept: "건설관리과", views: 356 },
      {
        title: "청년 월세 지원 2차 신청 접수",
        date: "2026.09.25",
        dept: "청년정책과",
        views: 2104,
        body: [
          "청년 월세 지원 2차 신청을 다음과 같이 접수합니다.",
          "1. 신청기간: 2026. 9. 28.(월) ~ 10. 16.(금)",
          "2. 신청대상: 한들구 거주 만 19세 ~ 39세 무주택 청년",
          "3. 지원내용: 월 최대 20만 원, 최대 12개월",
          "4. 신청방법: 구청 누리집 온라인 신청",
          "5. 문의: 청년정책과 02-000-2001",
        ],
      },
      { title: "구립 작은도서관 3곳 주말 운영시간 연장", date: "2026.09.22", dept: "문화체육과", views: 289 },
    ],
  },
  고시공고: {
    kind: "gosi",
    posts: [
      { title: "한들구 도시계획시설(도로) 결정 열람 공고", date: "2026.10.05", dept: "도시계획과", views: 198, no: "한들구 공고 제2026-1532호" },
      { title: "2026년 하반기 공유재산 대부 입찰 공고", date: "2026.09.30", dept: "재무과", views: 264, no: "한들구 공고 제2026-1497호" },
      { title: "한들동 일대 지구단위계획 주민 의견 청취 공고", date: "2026.09.24", dept: "도시계획과", views: 311, no: "한들구 공고 제2026-1451호" },
      { title: "옥외광고물 표시 제한 구역 지정 고시", date: "2026.09.18", dept: "건축과", views: 147, no: "한들구 고시 제2026-88호" },
    ],
  },
  채용공고: {
    kind: "notice",
    posts: [
      {
        title: "2026년 하반기 기간제 근로자 채용 공고(행정 보조)",
        date: "2026.10.05",
        dept: "총무과",
        views: 1876,
        body: [
          "2026년 하반기 기간제 근로자 채용을 다음과 같이 공고합니다.",
          "1. 채용분야: 행정 보조 5명",
          "2. 근무기간: 2026. 11. 2. ~ 12. 31.",
          "3. 접수기간: 2026. 10. 12.(월) ~ 10. 16.(금) 09:00 ~ 18:00",
          "4. 접수방법: 방문 접수 (구청 본관 4층 총무과)",
          "5. 제출서류: 응시원서, 자기소개서, 주민등록표 초본 1부",
          "6. 문의: 총무과 02-000-1001",
        ],
      },
      { title: "구립 어린이집 보육교사 채용 공고", date: "2026.09.28", dept: "보육지원과", views: 942 },
      { title: "방문 건강관리 간호사 채용 공고", date: "2026.09.21", dept: "보건소", views: 655 },
    ],
  },
  보도자료: {
    kind: "notice",
    posts: [
      { title: "한들구, 지역 소상공인 온라인 판로 지원 사업 추진", date: "2026.10.06", dept: "일자리정책과", views: 233 },
      { title: "한들구 공공도서관 이용자 만족도 조사 결과 발표", date: "2026.10.01", dept: "문화체육과", views: 178 },
      { title: "한들구, 노후 놀이터 7곳 새 단장 마쳐", date: "2026.09.26", dept: "공원녹지과", views: 302 },
      { title: "추석 연휴 종합상황실 운영", date: "2026.09.23", dept: "총무과", views: 521 },
    ],
  },
  "구청장에게 바란다": {
    kind: "qna",
    posts: [
      {
        title: "미리내천 산책로 가로등이 꺼져 있습니다",
        date: "2026.10.05",
        dept: "건설관리과",
        views: 64,
        writer: "김ㅈ우",
        status: "처리중",
        body: ["미리내천 산책로 한들교 아래 가로등 3개가 일주일째 꺼져 있습니다.", "확인 부탁드립니다."],
      },
      {
        title: "솔내초등학교 앞 횡단보도 신호 시간 연장 요청",
        date: "2026.10.02",
        dept: "교통행정과",
        views: 118,
        writer: "이ㅅ민",
        status: "답변완료",
        body: ["솔내초등학교 정문 앞 횡단보도 보행 신호가 짧아 어린이와 어르신이 다 건너기 어렵습니다.", "신호 시간 연장을 요청합니다."],
        answer: [
          "안녕하십니까. 한들구청 교통행정과입니다.",
          "귀하께서 구청장에게 바란다를 통해 신청하신 민원에 대한 검토 결과를 다음과 같이 알려드립니다.",
          "1. 귀하의 민원은 솔내초등학교 앞 횡단보도 보행 신호 시간 연장에 관한 것으로 이해됩니다.",
          "2. 해당 신호는 관할 경찰서와 협의하여 10월 중 보행 신호 시간을 늘릴 예정입니다.",
          "3. 기타 궁금하신 사항은 교통행정과(02-000-1211)로 연락주시면 친절히 안내해 드리겠습니다.",
        ],
      },
      {
        title: "공영주차장 야간 개방 문의",
        date: "2026.09.28",
        dept: "주차관리과",
        views: 97,
        writer: "박ㅎ늘",
        status: "답변완료",
        body: ["한들동 공영주차장을 야간에도 이용할 수 있는지 궁금합니다."],
        answer: [
          "안녕하십니까. 한들구청 주차관리과입니다.",
          "귀하께서 문의하신 한들동 공영주차장은 24시간 운영하며, 야간(20:00 ~ 08:00) 정기권을 월 50,000원에 이용하실 수 있습니다.",
          "기타 궁금하신 사항은 주차관리과(02-000-1201)로 연락주시면 친절히 안내해 드리겠습니다.",
        ],
      },
      {
        title: "미리내1동 주민센터 민원 대기 시간",
        date: "2026.09.24",
        dept: "자치행정과",
        views: 81,
        writer: "최ㅇ진",
        status: "답변완료",
        body: ["월요일 오전 미리내1동 주민센터 대기 시간이 40분이 넘었습니다."],
        answer: [
          "안녕하십니까. 한들구청 자치행정과입니다.",
          "이용에 불편을 드려 죄송합니다. 월요일 오전에는 민원 창구를 1곳 더 운영하도록 조치하였습니다.",
          "기타 궁금하신 사항은 자치행정과(02-000-1111)로 연락주시면 친절히 안내해 드리겠습니다.",
        ],
      },
    ],
  },
  "구민 제안": {
    kind: "qna",
    posts: [
      { title: "어린이 공원 그늘막 설치 제안", date: "2026.10.04", dept: "공원녹지과", views: 52, writer: "정ㅁ서", status: "검토중", body: ["한들어린이공원 놀이터에 그늘이 없어 여름철 이용이 어렵습니다.", "그늘막 설치를 제안합니다."] },
      { title: "버스정류장 온열 의자 확대 제안", date: "2026.09.27", dept: "교통행정과", views: 140, writer: "한ㄷ윤", status: "채택", body: ["미리내역 앞 버스정류장에도 온열 의자를 설치해 주시기 바랍니다."] },
      { title: "구립도서관 무인 반납함 추가", date: "2026.09.19", dept: "문화체육과", views: 77, writer: "윤ㅅ아", status: "채택", body: ["한들역 출구 쪽에 도서 무인 반납함을 추가해 주세요."] },
    ],
  },
  자유게시판: {
    kind: "free",
    posts: [
      { title: "미리내천 등불 축제 주차 정보 공유합니다", date: "2026.10.06", dept: "", views: 211, writer: "강ㅈ호", body: ["축제 기간에는 미리내천 공영주차장이 일찍 찹니다.", "구청 주차장이 주말에 개방되니 참고하세요."] },
      { title: "한들1동 주민센터 요가 강좌 후기", date: "2026.10.03", dept: "", views: 96, writer: "오ㅎ린", body: ["화·목 저녁 요가 강좌 다녀왔습니다.", "강사님이 친절하셔서 처음 하는 분도 괜찮습니다."] },
      { title: "대형폐기물 인터넷 신청 쉽네요", date: "2026.09.30", dept: "", views: 158, writer: "서ㅇ준", body: ["누리집에서 신청하고 신고필증을 출력해서 붙이니 바로 수거됐습니다."] },
    ],
  },
};

// 구정소식: 공지사항과 보도자료를 모아 구분을 붙인다
BOARDS["구정소식"] = {
  kind: "notice",
  posts: [
    ...BOARDS.공지사항.posts.map((p) => ({ ...p, cat: "공지사항" })),
    ...BOARDS.보도자료.posts.map((p) => ({ ...p, cat: "보도자료" })),
  ].sort((a, b) => b.date.localeCompare(a.date)),
};

type Table = { caption: string; head: string[]; rows: string[][] };
type Info = { dl?: [string, string][]; tables?: Table[]; dept: string; phone: string };

const field = (caption: string, rows: string[][]): Table => ({ caption, head: ["사업명", "지원대상", "지원내용", "문의"], rows });

const INFO: Record<string, Info> = {
  민원실안내: {
    dept: "민원여권과",
    phone: "02-000-1104",
    dl: [
      ["위치", "구청 본관 1층 민원여권과"],
      ["운영시간", "평일 09:00 ~ 18:00"],
      ["야간 민원실", "매주 목요일 18:00 ~ 20:00 (여권 수령, 주민등록 등·초본 발급)"],
      ["점심시간", "12:00 ~ 13:00 (교대 근무로 민원 업무 계속)"],
    ],
    tables: [
      {
        caption: "창구 안내",
        head: ["창구", "업무", "전화번호"],
        rows: [
          ["1 ~ 3번", "주민등록 등·초본, 전입신고", "02-000-1103"],
          ["4 ~ 5번", "가족관계등록, 인감증명", "02-000-1102"],
          ["6 ~ 8번", "여권 접수", "02-000-1101"],
          ["9번", "여권 수령", "02-000-1101"],
          ["10번", "민원서식, 무인민원발급기", "02-000-1104"],
        ],
      },
    ],
  },
  "민원발급·열람안내": {
    dept: "민원여권과",
    phone: "02-000-1103",
    tables: [
      {
        caption: "민원 발급·열람 수수료",
        head: ["민원명", "처리기간", "수수료", "비고"],
        rows: [
          ["주민등록표 등본(초본)", "즉시", "400원", "무인민원발급기 200원, 정부24 무료"],
          ["가족관계증명서", "즉시", "1,000원", "무인민원발급기 500원"],
          ["인감증명서", "즉시", "600원", "본인 또는 위임받은 대리인"],
          ["건축물대장", "즉시", "발급 500원, 열람 300원", "정부24 무료"],
          ["토지(임야)대장", "즉시", "발급 500원, 열람 300원", "정부24 무료"],
          ["지방세 납세증명서", "즉시", "무료", ""],
        ],
      },
    ],
  },
  무인민원발급안내: {
    dept: "민원여권과",
    phone: "02-000-1104",
    dl: [
      ["발급 민원", "주민등록 등·초본, 가족관계증명서, 토지대장, 건축물대장, 지방세 납세증명서 등"],
      ["본인 확인", "지문 인식"],
    ],
    tables: [
      {
        caption: "무인민원발급기 설치 장소",
        head: ["설치장소", "운영시간"],
        rows: [
          ["구청 본관 1층 로비", "24시간"],
          ["한들1동 주민센터", "평일 09:00 ~ 18:00"],
          ["한들역 2번 출구", "06:00 ~ 23:00"],
          ["구립 한들도서관", "화 ~ 일 09:00 ~ 22:00"],
        ],
      },
    ],
  },
  민원서식: {
    dept: "민원여권과",
    phone: "02-000-1104",
    tables: [
      {
        caption: "민원서식 목록",
        head: ["서식명", "담당부서", "파일"],
        rows: [
          ["전입신고서", "민원여권과", "HWP, PDF"],
          ["위임장", "민원여권과", "HWP, PDF"],
          ["대형생활폐기물 배출 신고서", "청소행정과", "HWP"],
          ["옥외광고물 표시 허가 신청서", "건축과", "HWP, PDF"],
          ["주정차 위반 과태료 의견진술서", "주차관리과", "HWP"],
        ],
      },
    ],
  },
  여권민원: {
    dept: "민원여권과",
    phone: "02-000-1101",
    dl: [
      ["접수장소", "구청 본관 1층 민원여권과 6 ~ 8번 창구"],
      ["접수시간", "평일 09:00 ~ 18:00, 목요일 20:00까지 (수령만 가능)"],
      ["처리기간", "근무일 기준 5일 이내"],
      ["구비서류", "여권용 사진 1매, 신분증, 사용하던 여권"],
    ],
    tables: [
      {
        caption: "여권 발급 수수료",
        head: ["구분", "면수", "수수료"],
        rows: [
          ["복수여권 10년", "58면", "53,000원"],
          ["복수여권 10년", "26면", "50,000원"],
          ["복수여권 5년 (만 8세 이상)", "58면", "45,000원"],
          ["복수여권 5년 (만 8세 미만)", "58면", "33,000원"],
          ["단수여권 1년", "", "20,000원"],
        ],
      },
    ],
  },
  대형생활폐기물: {
    dept: "청소행정과",
    phone: "02-000-1301",
    dl: [
      ["신청방법", "구청 누리집 인터넷 신청, 동주민센터 방문 신청"],
      ["배출방법", "신고필증을 붙여 배출일 전날 18:00부터 배출일 06:00까지 문 앞 배출"],
    ],
    tables: [
      {
        caption: "대형생활폐기물 수수료",
        head: ["품목", "규격", "수수료"],
        rows: [
          ["장롱", "폭 120cm 이상", "10,000원"],
          ["침대", "2인용", "10,000원"],
          ["소파", "3인용", "8,000원"],
          ["식탁", "4인용", "4,000원"],
          ["의자", "", "2,000원"],
        ],
      },
    ],
  },
  주민참여예산: {
    dept: "기획예산과",
    phone: "02-000-2201",
    dl: [
      ["제안기간", "2026. 9. 21.(월) ~ 10. 31.(토)"],
      ["제안대상", "한들구 거주·직장·학교 구민"],
      ["제안방법", "구청 누리집, 동주민센터 방문 접수"],
    ],
    tables: [
      {
        caption: "추진 일정",
        head: ["단계", "기간"],
        rows: [
          ["사업 제안 접수", "2026. 9. ~ 10."],
          ["부서 검토", "2026. 11."],
          ["분과위원회 심사", "2026. 12."],
          ["구민 투표", "2027. 3."],
          ["예산 반영", "2027. 9."],
        ],
      },
    ],
  },
  "교육·강좌": {
    dept: "평생학습과",
    phone: "02-000-2301",
    tables: [
      {
        caption: "교육·강좌 목록",
        head: ["강좌명", "접수기간", "교육기간", "대상", "상태"],
        rows: [
          ["스마트폰 활용 기초", "10. 5. ~ 10. 16.", "10. 20. ~ 11. 24.", "만 60세 이상", "접수중"],
          ["생활 목공", "10. 1. ~ 10. 12.", "10. 17. ~ 11. 21.", "구민 누구나", "접수중"],
          ["엑셀 실무", "9. 21. ~ 10. 2.", "10. 6. ~ 10. 30.", "구민 누구나", "마감"],
          ["수채화 그리기", "9. 14. ~ 9. 25.", "10. 5. ~ 11. 30.", "구민 누구나", "마감"],
        ],
      },
    ],
  },
  "대여·대관": {
    dept: "총무과",
    phone: "02-000-1001",
    dl: [["신청기간", "이용일 30일 전부터 7일 전까지"]],
    tables: [
      {
        caption: "대관 시설",
        head: ["시설명", "수용인원", "이용시간", "이용료"],
        rows: [
          ["구청 대강당", "300명", "평일 09:00 ~ 18:00", "시간당 50,000원"],
          ["구청 제1회의실", "30명", "평일 09:00 ~ 18:00", "시간당 10,000원"],
          ["한들1동 다목적실", "40명", "09:00 ~ 21:00", "무료"],
          ["구민체육센터 체육관", "200명", "토·일 09:00 ~ 18:00", "2시간 60,000원"],
        ],
      },
    ],
  },
  정보공개: {
    dept: "총무과",
    phone: "02-000-1002",
    dl: [
      ["청구방법", "정보공개포털 온라인 청구, 방문·우편·팩스 청구"],
      ["처리기간", "청구일로부터 10일 이내 (부득이한 경우 10일 연장)"],
      ["수수료", "열람 무료, 사본 1장 250원"],
    ],
    tables: [
      {
        caption: "사전정보 공표 목록",
        head: ["공표 항목", "공표 주기", "담당부서"],
        rows: [
          ["업무추진비 집행내역", "매월", "총무과"],
          ["계약 현황", "수시", "재무과"],
          ["예산서·결산서", "연 1회", "기획예산과"],
          ["주요 사업 추진 현황", "분기", "기획예산과"],
        ],
      },
    ],
  },
  "예산·재정": {
    dept: "기획예산과",
    phone: "02-000-2202",
    tables: [
      {
        caption: "2026년 예산 규모",
        head: ["구분", "예산액", "비율"],
        rows: [
          ["합계", "8,412억 원", "100%"],
          ["일반회계", "7,846억 원", "93.3%"],
          ["특별회계", "566억 원", "6.7%"],
        ],
      },
      {
        caption: "분야별 세출",
        head: ["분야", "예산액", "비율"],
        rows: [
          ["사회복지", "4,383억 원", "52.1%"],
          ["일반공공행정", "1,102억 원", "13.1%"],
          ["환경", "757억 원", "9.0%"],
          ["교통 및 물류", "421억 원", "5.0%"],
          ["문화 및 관광", "396억 원", "4.7%"],
        ],
      },
    ],
  },
  복지: {
    dept: "복지정책과",
    phone: "02-000-1601",
    tables: [
      field("복지 사업 안내", [
        ["기초생활보장", "소득인정액이 선정기준 이하인 가구", "생계·의료·주거·교육급여", "복지정책과 02-000-1601"],
        ["긴급복지 지원", "갑작스러운 위기 상황 가구", "생계비, 의료비, 주거비 지원", "복지정책과 02-000-1603"],
        ["기초연금", "만 65세 이상, 소득인정액 선정기준 이하", "매월 기초연금 지급", "어르신복지과 02-000-1602"],
        ["장애인 활동지원", "만 6세 ~ 64세 등록 장애인", "활동지원사 방문 서비스", "장애인복지과 02-000-1604"],
      ]),
    ],
  },
  "보건·건강": {
    dept: "보건소",
    phone: "02-000-1401",
    tables: [
      field("보건 사업 안내", [
        ["어르신 독감 예방접종", "만 65세 이상", "무료 접종", "보건소 02-000-1401"],
        ["치매 조기검진", "만 60세 이상", "무료 선별검사", "치매안심센터 02-000-1402"],
        ["금연클리닉", "흡연자 누구나", "6개월 상담, 금연 보조제 제공", "보건소 02-000-1403"],
      ]),
    ],
  },
  "교통·주차": {
    dept: "주차관리과",
    phone: "02-000-1201",
    tables: [
      field("교통·주차 안내", [
        ["거주자 우선 주차", "한들구 거주 차량 소유자", "주차 구획 배정 (월 단위)", "주차관리과 02-000-1201"],
        ["주정차 단속 알림", "서비스 가입 차량", "단속 전 문자 알림", "주차관리과 02-000-1202"],
        ["공영주차장", "누구나", "5분당 150원, 경차 50% 감면", "주차관리과 02-000-1203"],
      ]),
    ],
  },
  "환경·청소": {
    dept: "청소행정과",
    phone: "02-000-1301",
    tables: [
      field("환경·청소 안내", [
        ["대형생활폐기물 배출", "구민 누구나", "인터넷·방문 신고 후 배출", "청소행정과 02-000-1301"],
        ["음식물류 폐기물 종량기", "공동주택", "배출량만큼 수수료 부과", "청소행정과 02-000-1302"],
        ["재활용품 배출", "단독주택", "매주 화·목·토 18:00 ~ 24:00", "청소행정과 02-000-1303"],
      ]),
    ],
  },
  "일자리·경제": {
    dept: "일자리정책과",
    phone: "02-000-1501",
    tables: [
      field("일자리·경제 안내", [
        ["일자리 상담", "구직 구민", "1:1 상담, 구인 업체 연결", "일자리정책과 02-000-1501"],
        ["청년 월세 지원", "만 19 ~ 39세 무주택 청년", "월 최대 20만 원, 최대 12개월", "청년정책과 02-000-2001"],
        ["소상공인 특별보증", "관내 소상공인", "보증 연계 융자 지원", "일자리정책과 02-000-1502"],
      ]),
    ],
  },
  "문화·체육": {
    dept: "문화체육과",
    phone: "02-000-2101",
    tables: [
      field("문화·체육 안내", [
        ["구립도서관", "누구나", "화 ~ 일 09:00 ~ 22:00, 매주 월요일 휴관", "문화체육과 02-000-2102"],
        ["구민체육센터", "누구나", "수영, 헬스, 요가 월 강습", "문화체육과 02-000-2103"],
        ["미리내천 가을 등불 축제", "누구나", "2026. 10. 10. ~ 10. 19.", "문화체육과 02-000-2101"],
      ]),
    ],
  },
  "안전·재난": {
    dept: "안전재난과",
    phone: "02-000-2401",
    tables: [
      field("안전·재난 안내", [
        ["민방위 교육", "민방위 대원", "사이버 교육, 집합 교육", "안전재난과 02-000-2401"],
        ["비상대피시설", "누구나", "지하 대피시설 112곳 지정", "안전재난과 02-000-2402"],
        ["재난 문자 알림", "누구나", "기상특보, 재난 상황 문자 발송", "안전재난과 02-000-2403"],
      ]),
    ],
  },
  일반현황: {
    dept: "기획예산과",
    phone: "02-000-2203",
    dl: [
      ["면적", "23.88㎢"],
      ["인구", "412,306명 (2026. 9. 30. 기준)"],
      ["세대", "186,472세대"],
      ["행정동", "6개 동"],
    ],
    tables: [
      {
        caption: "동주민센터",
        head: ["동명", "주소", "전화번호"],
        rows: [
          ["한들1동", "한들로 12", "02-000-3101"],
          ["한들2동", "한들로 58", "02-000-3201"],
          ["한들3동", "한들로 121", "02-000-3301"],
          ["미리내1동", "미리내로 7", "02-000-3401"],
          ["미리내2동", "미리내로 44", "02-000-3501"],
          ["솔내동", "솔내길 20", "02-000-3601"],
        ],
      },
    ],
  },
  조직도: {
    dept: "총무과",
    phone: "02-000-1001",
    tables: [
      {
        caption: "부서별 주요업무",
        head: ["부서", "담당업무", "전화번호"],
        rows: DEPTS.map((d) => [d.dept, d.work, d.phone]),
      },
    ],
  },
  청사안내: {
    dept: "총무과",
    phone: "02-000-1001",
    tables: [
      {
        caption: "층별 안내",
        head: ["층", "부서·시설"],
        rows: [
          ["5층", "구청장실, 대강당"],
          ["4층", "기획예산과, 총무과"],
          ["3층", "세무과, 건축과, 도시계획과"],
          ["2층", "복지정책과, 보육지원과, 청년정책과"],
          ["1층", "민원여권과, 무인민원발급기, 은행"],
          ["지하 1층", "구내식당, 주차장"],
        ],
      },
    ],
  },
};

const PLEDGES = [
  ["복지", "12", "3", "9"],
  ["교통·도시", "10", "2", "8"],
  ["일자리·경제", "8", "4", "4"],
  ["교육·문화", "9", "3", "6"],
  ["환경·안전", "7", "2", "5"],
];

/** 하위 화면 위치: 대메뉴 번호, 메뉴 이름, 게시글 번호 */
type View = { menu: number; item: string; post: number | null };

const BOARD: Record<string, Post[]> = {
  공지사항: BOARDS.공지사항.posts,
  고시공고: BOARDS.고시공고.posts,
  채용공고: BOARDS.채용공고.posts,
  보도자료: BOARDS.보도자료.posts,
};
type BoardTab = keyof typeof BOARD;

const STAFF_SUGGEST = ["여권", "주정차", "예방접종", "재산세"];

const QUICK = ["구보", "통합예약", "재난안전", "구민 제안", "주민참여예산", "구립도서관"];
const QUICK_TO: Record<string, string> = {
  구보: "고시공고",
  통합예약: "대여·대관",
  재난안전: "안전·재난",
  "구민 제안": "구민 제안",
  주민참여예산: "주민참여예산",
  구립도서관: "문화·체육",
};

const LINK_GROUPS: { title: string; items: string[] }[] = [
  { title: "부서안내", items: ["기획예산과", "총무과", "민원여권과", "복지정책과", "보건소", "도시계획과", "청소행정과", "주차관리과"] },
  { title: "동주민센터", items: ["한들1동", "한들2동", "한들3동", "미리내1동", "미리내2동", "솔내동"] },
  { title: "유관기관", items: ["한들구의회", "한들구 시설관리공단", "한들구 문화재단", "한들구 자원봉사센터"] },
  { title: "관련 사이트", items: ["정부24", "국민신문고", "가온시청", "고용24"] },
];

const FONT_STEPS = [
  { label: "작게", zoom: 0.9 },
  { label: "보통", zoom: 1 },
  { label: "조금 크게", zoom: 1.1 },
  { label: "크게", zoom: 1.2 },
  { label: "가장 크게", zoom: 1.3 },
];

/** 태극 문양을 단순화한 정부 누리집 표시 */
function GovMark() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0" aria-hidden>
      <circle cx="10" cy="10" r="9" fill="#cd2e3a" />
      <path d="M1 10a9 9 0 0 0 18 0a4.5 4.5 0 0 0-9 0a4.5 4.5 0 0 1-9 0Z" fill="#0047a0" />
    </svg>
  );
}

export function DistrictPortalDemo() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const [tab, setTab] = useState<BoardTab>("공지사항");
  const [searchTab, setSearchTab] = useState<"all" | "staff">("all");
  const [query, setQuery] = useState("");
  const [staffQuery, setStaffQuery] = useState("");
  const [linkGroup, setLinkGroup] = useState<string | null>(null);
  const [fontStep, setFontStep] = useState(1);
  const [view, setView] = useState<View | null>(null);
  const reduced = useReducedMotionSafe();
  const autoplay = !paused && !reduced;
  const staffInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!autoplay) return;
    const id = window.setInterval(() => setSlide((s) => (s + 1) % SLIDES.length), 6000);
    return () => window.clearInterval(id);
  }, [autoplay]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const results = useMemo(() => {
    const q = staffQuery.trim().replace(/\s/g, "");
    if (!q) return [];
    return DEPTS.filter((d) => (d.dept + d.work).replace(/\s/g, "").includes(q));
  }, [staffQuery]);

  // 메뉴를 누르면 하위 화면으로 바꾸고 맨 위로 올린다
  const go = (menu: number, item: string, post: number | null = null) => {
    setMenuOpen(false);
    setLinkGroup(null);
    setView({ menu, item, post });
    window.scrollTo({ top: 0 });
  };
  const goItem = (item: string, post: number | null = null) => {
    const menu = MENU.findIndex((m) => m.items.includes(item));
    go(menu < 0 ? 0 : menu, item, post);
  };
  const goHome = () => {
    setMenuOpen(false);
    setView(null);
    window.scrollTo({ top: 0 });
  };

  // 사용법 가이드가 하위 화면에서 열리면 첫 화면으로 돌아온다
  useEffect(() => {
    const f = () => {
      setMenuOpen(false);
      setLinkGroup(null);
      setView(null);
    };
    window.addEventListener("demo:go-home", f);
    return () => window.removeEventListener("demo:go-home", f);
  }, []);

  // 자주 찾는 서비스나 바닥글에서 담당자 찾기로 넘어온다
  const openStaff = (keyword = "") => {
    setMenuOpen(false);
    setView(null);
    setSearchTab("staff");
    setStaffQuery(keyword);
    window.setTimeout(() => {
      document.getElementById("staff-search")?.scrollIntoView({ block: "start", behavior: reduced ? "auto" : "smooth" });
      staffInput.current?.focus({ preventScroll: true });
    }, 0);
  };

  const current = SLIDES[slide];
  const container = "mx-auto w-full max-w-[1200px] px-4 md:px-6";
  const boardKeys = Object.keys(BOARD) as BoardTab[];

  return (
    <div className={`${plex.className} min-h-screen bg-[#f3f5f8] text-[17px] leading-[1.5] text-[#17212b]`}>
      {/* 건너뛰기 링크 */}
      <nav aria-label="건너뛰기 링크">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-[80] focus:rounded-[4px] focus:bg-white focus:px-4 focus:py-2 focus:font-bold focus:outline focus:outline-2" style={{ outlineColor: NAVY }}>
          본문 바로가기
        </a>
        <a href="#gnb" className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-[80] focus:rounded-[4px] focus:bg-white focus:px-4 focus:py-2 focus:font-bold focus:outline focus:outline-2" style={{ outlineColor: NAVY }}>
          주메뉴 바로가기
        </a>
      </nav>

      {/* 공식 누리집 표시 */}
      <div className="bg-[#eef1f5] text-[14px] text-[#3a4453]">
        <p className={`${container} flex min-h-8 items-center gap-2 py-1`}>
          <GovMark />
          이 누리집은 대한민국 공식 전자정부 누리집입니다.
        </p>
      </div>

      <div style={{ zoom: FONT_STEPS[fontStep].zoom }}>
        {/* 상단 유틸 */}
        <div className="hidden border-b border-[#dfe3ea] bg-white md:block">
          <div className={`${container} flex h-10 items-center justify-end gap-5 text-[14px] text-[#3a4453]`}>
            <a href="#footer" className="hover:text-[#17212b] hover:underline">사이트맵</a>
            <button type="button" onClick={() => goItem("일반현황")} className="hover:text-[#17212b] hover:underline">
              동주민센터
            </button>
            <button type="button" onClick={() => goItem("보건·건강")} className="hover:text-[#17212b] hover:underline">
              보건소
            </button>
            <a href="#footer" className="hover:text-[#17212b] hover:underline">로그인</a>
            <label className="flex items-center gap-1.5">
              <span>글자 크기</span>
              <select
                value={fontStep}
                onChange={(e) => setFontStep(Number(e.target.value))}
                className="h-7 rounded-[4px] border border-[#b9c0cc] bg-white px-1 text-[14px]"
              >
                {FONT_STEPS.map((f, i) => (
                  <option key={f.label} value={i}>
                    {f.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {/* 헤더 */}
        <header className="relative z-30 bg-white shadow-[0_1px_0_#dfe3ea]">
          <div className={`${container} flex h-[72px] items-center gap-4`}>
            <a
              href="#main"
              onClick={(e) => {
                e.preventDefault();
                goHome();
              }}
              className="flex items-center gap-2.5"
            >
              <span className="text-[24px] font-bold tracking-[-0.05em]" style={{ color: NAVY }}>
                한들구
              </span>
              <span className="h-5 w-px bg-[#b9c0cc]" aria-hidden />
              <span className="text-[17px] font-bold text-[#3a4453]">구청 누리집</span>
            </a>

            <nav id="gnb" aria-label="주메뉴" className="ml-auto hidden lg:block">
              <ul className="flex">
                {MENU.map((m) => (
                  <li key={m.title}>
                    <button
                      type="button"
                      onClick={() => setMenuOpen(true)}
                      aria-expanded={menuOpen}
                      aria-controls="mega-menu"
                      className="h-[72px] px-4 text-[18px] font-bold hover:text-[#b53d14] xl:px-5"
                    >
                      {m.title}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>

            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-controls="mega-menu"
              aria-label={menuOpen ? "전체메뉴 닫기" : "전체메뉴"}
              className="ml-auto flex h-11 w-11 items-center justify-center rounded-[6px] text-white lg:ml-2"
              style={{ background: NAVY }}
            >
              {menuOpen ? <X size={22} aria-hidden /> : <Menu size={22} aria-hidden />}
            </button>
          </div>

          {menuOpen && (
            <div id="mega-menu" className="absolute inset-x-0 top-full border-t border-[#dfe3ea] bg-white shadow-[0_20px_40px_-20px_rgba(19,35,63,0.35)]">
              <div className={`${container} grid max-h-[70vh] gap-8 overflow-y-auto py-8 sm:grid-cols-2 lg:grid-cols-5`}>
                {MENU.map((m, mi) => (
                  <div key={m.title}>
                    <p className="border-b-2 pb-2 text-[18px] font-bold" style={{ borderColor: SUNSET }}>
                      {m.title}
                    </p>
                    <ul className="mt-3 space-y-1">
                      {m.items.map((it) => (
                        <li key={it}>
                          <button
                            type="button"
                            onClick={() => (it === "담당자 찾기" ? openStaff() : go(mi, it))}
                            aria-current={view?.item === it ? "page" : undefined}
                            className="block rounded px-1 py-1.5 text-left text-[16px] text-[#3a4453] hover:text-[#17212b] hover:underline"
                          >
                            {it}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </header>

        <main id="main">
          {view ? (
            <SubPage view={view} go={go} openStaff={openStaff} goHome={goHome} />
          ) : (
          <div className="soft-in">
          {/* 첫 화면: 알림판 + 자주 찾는 서비스 */}
          <div className={`${container} grid gap-4 pt-5 md:pt-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]`}>
            <section aria-labelledby="notice-board-title" aria-roledescription="배너 슬라이드" className="flex min-h-[320px] flex-col overflow-hidden rounded-[12px] bg-white">
              <div className="flex items-center gap-2 border-b border-[#dfe3ea] px-5 py-2.5">
                <h2 id="notice-board-title" className="text-[17px] font-bold">
                  알림판
                </h2>
                <span className="ml-auto text-[15px] tabular-nums text-[#3a4453]" aria-hidden>
                  {slide + 1} / {SLIDES.length}
                </span>
                <button type="button" aria-label="이전 알림" onClick={() => setSlide((s) => (s + SLIDES.length - 1) % SLIDES.length)} className="flex h-9 w-9 items-center justify-center rounded-[4px] border border-[#b9c0cc] hover:bg-[#f3f5f8]">
                  <ChevronLeft size={18} aria-hidden />
                </button>
                <button
                  type="button"
                  aria-label={paused ? "자동 넘김 재생" : "자동 넘김 정지"}
                  aria-pressed={paused}
                  onClick={() => setPaused((p) => !p)}
                  className="flex h-9 w-9 items-center justify-center rounded-[4px] border border-[#b9c0cc] hover:bg-[#f3f5f8]"
                >
                  {paused ? <Play size={16} aria-hidden /> : <Pause size={16} aria-hidden />}
                </button>
                <button type="button" aria-label="다음 알림" onClick={() => setSlide((s) => (s + 1) % SLIDES.length)} className="flex h-9 w-9 items-center justify-center rounded-[4px] border border-[#b9c0cc] hover:bg-[#f3f5f8]">
                  <ChevronRight size={18} aria-hidden />
                </button>
              </div>
              <a
                href="#main"
                className="relative flex flex-1 flex-col px-5 pb-5 pt-5 md:px-8 md:pt-7"
                style={{ background: current.bg, color: current.fg }}
                aria-live={autoplay ? "off" : "polite"}
                aria-label={`${SLIDES.length}개 중 ${slide + 1}번째, ${current.tag}: ${current.title}, ${current.rows.map(([k, v]) => `${k} ${v}`).join(", ")}`}
              >
                <span className="text-[15px] font-bold" style={{ color: current.accent }} aria-hidden>
                  {current.tag === "행사" ? "한들구와 함께하는" : current.tag === "공모" ? "구민이 직접 정하는 우리 동네 예산" : "한들구 보건소"}
                </span>
                <span className="mt-1 block text-[32px] font-bold leading-[1.18] tracking-[-0.045em] md:text-[46px]" aria-hidden>
                  {current.lines.map((ln, i) => (
                    <span key={ln} className="block" style={i === current.lines.length - 1 ? { color: current.accent } : undefined}>
                      {ln}
                    </span>
                  ))}
                </span>
                <span className="mt-2 block text-[16px] font-bold md:text-[18px]" aria-hidden>
                  {current.sub}
                </span>
                <span className="mt-auto flex flex-wrap items-end justify-between gap-3 border-t pt-3 text-[15px]" style={{ borderColor: current.fg === "#ffffff" ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.18)" }} aria-hidden>
                  <span className="grid grid-cols-[auto_1fr] gap-x-3" style={{ color: current.soft }}>
                    {current.rows.map(([k, v]) => (
                      <span key={k} className="contents">
                        <b style={{ color: current.fg }}>{k}</b>
                        <span>{v}</span>
                      </span>
                    ))}
                  </span>
                  <span className="text-[18px] font-bold tracking-[-0.04em]">한들구</span>
                </span>
              </a>
            </section>

            <section aria-labelledby="frequent-title" className="rounded-[12px] bg-white p-5">
              <h2 id="frequent-title" className="text-[19px] font-bold">
                자주 찾는 서비스
              </h2>
              <ul className="mt-3 grid grid-cols-4 gap-1">
                {FREQUENT.map(({ label, keyword, icon: Icon }) => (
                  <li key={label}>
                    <button
                      type="button"
                      onClick={() => openStaff(keyword)}
                      className="flex w-full flex-col items-center gap-2 rounded-[6px] px-1 py-3 text-center text-[#2b3442] hover:bg-[#f3f5f8]"
                    >
                      <Icon size={30} strokeWidth={1.5} aria-hidden />
                      <span className="text-[14px] font-bold leading-[1.35] break-keep">{label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* 통합검색 / 담당자 찾기 */}
          <section id="staff-search" aria-label="검색" className={`${container} scroll-mt-4 pt-4`}>
            <div className="rounded-[12px] border-2 bg-white p-4 md:p-6" style={{ borderColor: NAVY }}>
              <div role="tablist" aria-label="검색 구분" className="flex gap-1 border-b border-[#dfe3ea]">
                {(
                  [
                    ["all", "통합검색"],
                    ["staff", "담당자 찾기"],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    id={`search-tab-${id}`}
                    aria-selected={searchTab === id}
                    aria-controls={`search-panel-${id}`}
                    onClick={() => setSearchTab(id)}
                    className={`-mb-px h-11 border-b-[3px] px-4 text-[17px] font-bold ${searchTab === id ? "" : "border-transparent text-[#5a6473] hover:text-[#17212b]"}`}
                    style={searchTab === id ? { borderColor: SUNSET_TEXT, color: "#17212b" } : undefined}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {searchTab === "all" ? (
                <div key="all" id="search-panel-all" role="tabpanel" aria-labelledby="search-tab-all" className="soft-in pt-4">
                  <form role="search" onSubmit={(e) => e.preventDefault()} className="flex gap-2">
                    <label htmlFor="site-search" className="sr-only">
                      통합검색어
                    </label>
                    <input
                      id="site-search"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="검색어를 입력하세요"
                      className="h-12 min-w-0 flex-1 rounded-[6px] border border-[#8a93a3] px-3 text-[17px] outline-none focus:outline focus:outline-2 focus:outline-[#13233f]"
                    />
                    <button type="submit" className="inline-flex h-12 shrink-0 items-center gap-1.5 rounded-[6px] px-5 text-[16px] font-bold text-white" style={{ background: NAVY }}>
                      <Search size={18} aria-hidden />
                      검색
                    </button>
                  </form>
                  <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[15px] text-[#3a4453]">
                    <span className="font-bold">인기검색어</span>
                    {["여권", "대형폐기물", "주정차 단속 조회", "전입신고", "재산세 납부", "등본 발급"].map((w) => (
                      <button key={w} type="button" onClick={() => setQuery(w)} className="underline-offset-2 hover:underline">
                        {w}
                      </button>
                    ))}
                  </p>
                </div>
              ) : (
                <div key="staff" id="search-panel-staff" role="tabpanel" aria-labelledby="search-tab-staff" className="soft-in pt-4">
                  <label htmlFor="dept-search" className="block text-[15px] font-bold text-[#3a4453]">
                    업무명 또는 부서명
                  </label>
                  <div className="mt-1 flex items-center rounded-[6px] border border-[#8a93a3] px-3 focus-within:outline focus-within:outline-2 focus-within:outline-[#13233f]">
                    <Search size={18} aria-hidden className="text-[#5a6473]" />
                    <input
                      id="dept-search"
                      ref={staffInput}
                      value={staffQuery}
                      onChange={(e) => setStaffQuery(e.target.value)}
                      placeholder="예: 여권, 주차, 보건소"
                      className="h-12 w-full bg-transparent px-2 text-[17px] outline-none"
                    />
                  </div>
                  {!staffQuery.trim() ? (
                    <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[15px] text-[#3a4453]">
                      <span className="font-bold">자주 찾는 업무</span>
                      {STAFF_SUGGEST.map((w) => (
                        <button key={w} type="button" onClick={() => setStaffQuery(w)} className="underline-offset-2 hover:underline">
                          {w}
                        </button>
                      ))}
                    </p>
                  ) : (
                    <div className="mt-4" aria-live="polite">
                      <p className="text-[15px] text-[#3a4453]">
                        검색 결과 <b className="text-[#17212b]">{results.length}</b>건
                      </p>
                      {results.length === 0 ? (
                        <p className="mt-2 rounded-[6px] bg-[#f3f5f8] py-6 text-center text-[16px] text-[#5a6473]">검색 결과가 없습니다.</p>
                      ) : (
                        <div className="mt-2 overflow-x-auto">
                          <table className="w-full min-w-[420px] text-[15px]">
                            <caption className="sr-only">담당자 찾기 결과</caption>
                            <thead>
                              <tr className="border-y-2 bg-[#f7f8fa] text-left" style={{ borderTopColor: NAVY, borderBottomColor: "#dfe3ea" }}>
                                <th scope="col" className="px-2 py-2 font-bold">부서</th>
                                <th scope="col" className="px-2 py-2 font-bold">담당업무</th>
                                <th scope="col" className="px-2 py-2 text-right font-bold">전화번호</th>
                              </tr>
                            </thead>
                            <tbody>
                              {results.map((d) => (
                                <tr key={d.phone} className="border-b border-[#e6e9ef]">
                                  <td className="px-2 py-2.5 font-bold">{d.dept}</td>
                                  <td className="px-2 py-2.5 text-[#3a4453]">{d.work}</td>
                                  <td className="px-2 py-2.5 text-right tabular-nums">
                                    <a href={`tel:${d.phone}`} className="inline-flex items-center gap-1 underline-offset-2 hover:underline">
                                      <Phone size={14} aria-hidden />
                                      {d.phone}
                                    </a>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>

          <div className={`${container} grid gap-4 py-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]`}>
            {/* 구정소식 게시판 */}
            <section aria-labelledby="news-title" className="min-w-0 rounded-[12px] bg-white p-5 md:p-6">
              <h2 id="news-title" className="text-[21px] font-bold">
                구정소식
              </h2>
              <div className="mt-3 flex items-end border-b-2" style={{ borderColor: NAVY }}>
                <div role="tablist" aria-label="게시판 구분" className="flex flex-1 overflow-x-auto">
                  {boardKeys.map((k) => (
                    <button
                      key={k}
                      type="button"
                      role="tab"
                      id={`board-tab-${k}`}
                      aria-selected={tab === k}
                      aria-controls="board-panel"
                      onClick={() => setTab(k)}
                      className={`h-11 shrink-0 rounded-t-[6px] px-3 text-[16px] font-bold sm:px-4 ${tab === k ? "text-white" : "text-[#3a4453] hover:text-[#17212b]"}`}
                      style={tab === k ? { background: NAVY } : undefined}
                    >
                      {k}
                    </button>
                  ))}
                </div>
                <a
                  href="#main"
                  onClick={(e) => {
                    e.preventDefault();
                    goItem(tab);
                  }}
                  aria-label={`${tab} 더보기`}
                  className="mb-2 ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-[4px] border border-[#b9c0cc] hover:bg-[#f3f5f8]">
                  <Plus size={16} aria-hidden />
                </a>
              </div>
              <ul key={tab} id="board-panel" role="tabpanel" aria-labelledby={`board-tab-${tab}`} className="soft-in divide-y divide-[#e6e9ef]">
                {BOARD[tab].map((b, i) => (
                  <li key={b.title}>
                    <a
                      href="#main"
                      onClick={(e) => {
                        e.preventDefault();
                        goItem(tab, i);
                      }}
                      className="flex items-baseline gap-4 py-3 hover:underline">
                      <span className="min-w-0 flex-1 truncate text-[16px]">{b.title}</span>
                      <span className="shrink-0 text-[14px] text-[#5a6473] tabular-nums">{b.date}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>

            <div className="grid content-start gap-4">
              {/* 구청장 */}
              <section aria-labelledby="mayor-title" className="rounded-[12px] p-5 text-white md:p-6" style={{ background: SUNSET_TEXT }}>
                <h2 id="mayor-title" className="text-[20px] font-bold">
                  한들구청장 홍ㄱ동입니다.
                </h2>
                <ul className="mt-4 grid gap-1.5 text-[16px]">
                  {["구청장에게 바란다", "민선9기 공약", "인사말"].map((l) => (
                    <li key={l}>
                      <a
                        href="#main"
                        onClick={(e) => {
                          e.preventDefault();
                          goItem(l === "구청장에게 바란다" ? l : "구청장");
                        }}
                        className="inline-flex items-center gap-1 font-bold underline-offset-4 hover:underline">
                        {l}
                        <ChevronRight size={16} aria-hidden />
                      </a>
                    </li>
                  ))}
                </ul>
              </section>

              {/* 바로가기 */}
              <nav aria-labelledby="quick-title" className="rounded-[12px] bg-white p-5">
                <h2 id="quick-title" className="text-[19px] font-bold">
                  바로가기
                </h2>
                <ul className="mt-3 grid grid-cols-3 gap-2">
                  {QUICK.map((q) => (
                    <li key={q}>
                      <a
                        href="#main"
                        onClick={(e) => {
                          e.preventDefault();
                          goItem(QUICK_TO[q]);
                        }}
                        className="flex h-11 items-center justify-center rounded-[6px] bg-[#f3f5f8] px-1 text-center text-[15px] font-bold text-[#3a4453] hover:bg-[#e8ecf2] hover:text-[#17212b]">
                        {q}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>

          {/* 바로가기 모음 */}
          <section aria-label="바로가기 모음" className="border-t border-[#dfe3ea] bg-white">
            <div className={`${container} py-4`}>
              <ul className="grid grid-cols-2 gap-2 md:grid-cols-4">
                {LINK_GROUPS.map((g) => {
                  const open = linkGroup === g.title;
                  return (
                    <li key={g.title}>
                      <button
                        type="button"
                        aria-expanded={open}
                        aria-controls="link-group-panel"
                        onClick={() => setLinkGroup(open ? null : g.title)}
                        className={`flex h-12 w-full items-center justify-between rounded-[6px] border px-4 text-[16px] font-bold ${open ? "text-white" : "border-[#b9c0cc] hover:bg-[#f3f5f8]"}`}
                        style={open ? { background: NAVY, borderColor: NAVY } : undefined}
                      >
                        {g.title}
                        <ChevronDown size={18} aria-hidden className={open ? "rotate-180" : ""} />
                      </button>
                    </li>
                  );
                })}
              </ul>
              {linkGroup && (
                <ul key={linkGroup} id="link-group-panel" aria-label={linkGroup} className="soft-in mt-3 grid grid-cols-2 gap-x-4 gap-y-1 rounded-[6px] bg-[#f3f5f8] p-4 sm:grid-cols-3 md:grid-cols-4">
                  {LINK_GROUPS.find((g) => g.title === linkGroup)!.items.map((it) => (
                    <li key={it}>
                      <a
                        href="#main"
                        onClick={(e) => {
                          const to = linkGroup === "부서안내" ? "조직도" : linkGroup === "동주민센터" ? "일반현황" : null;
                          if (!to) return;
                          e.preventDefault();
                          goItem(to);
                        }}
                        className="block py-1 text-[15px] text-[#3a4453] hover:text-[#17212b] hover:underline">
                        {it}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
          </div>
          )}
        </main>

        {/* 바닥글 */}
        <footer id="footer" className="text-[#c9d2e0]" style={{ background: "#0f1c33" }}>
          <div className={`${container} py-10 pb-28`}>
            <ul className="flex flex-wrap gap-x-5 gap-y-2 text-[15px]">
              <li>
                <a href="#footer" className="font-bold" style={{ color: "#ffb48f" }}>
                  개인정보처리방침
                </a>
              </li>
              <li><a href="#footer" className="hover:text-white">홈페이지 이용안내</a></li>
              <li><a href="#footer" className="hover:text-white">저작권 정책</a></li>
              <li>
                <button type="button" onClick={() => goItem("찾아오시는 길")} className="hover:text-white">
                  찾아오시는 길
                </button>
              </li>
              <li>
                <button type="button" onClick={() => openStaff()} className="hover:text-white">
                  담당자 찾기
                </button>
              </li>
            </ul>
            <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
              <address className="text-[15px] not-italic leading-[1.7]">
                (00000) 가온시 한들구 한들로 100 한들구청
                <br />
                대표전화 02-000-0000 (평일 09:00 ~ 18:00)
                <br />
                당직실(야간·공휴일) 02-000-0119
                <br />
                한들구청 홈페이지의 모든 콘텐츠는 저작권법의 보호를 받습니다.
              </address>
              <div className="flex h-14 w-32 items-center justify-center rounded-[6px] border border-[#3a4c6d] text-center text-[13px] leading-[1.3]">
                웹 접근성
                <br />
                품질인증 마크
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

/* ---------- 하위 화면 ---------- */

type Go = (menu: number, item: string, post?: number | null) => void;

const SUB_CONTAINER = "mx-auto w-full max-w-[1200px] px-4 md:px-6";

const phoneOf = (dept: string) => DEPTS.find((d) => d.dept === dept)?.phone ?? "02-000-0000";

function SubPage({ view, go, openStaff, goHome }: { view: View; go: Go; openStaff: () => void; goHome: () => void }) {
  const menu = MENU[view.menu];
  const board = BOARDS[view.item];
  const info = INFO[view.item];
  const post = board && view.post !== null ? board.posts[view.post] : null;
  const dept = post?.dept || (board ? board.posts[0].dept || "총무과" : info?.dept ?? "총무과");
  const phone = info?.phone ?? phoneOf(dept);

  let body: React.ReactNode;
  if (board) {
    body = <BoardView key={view.item} kind={board.kind} posts={board.posts} index={view.post} onOpen={(i) => go(view.menu, view.item, i)} />;
  } else if (view.item === "구청장") {
    body = <MayorView />;
  } else if (view.item === "찾아오시는 길") {
    body = <LocationView />;
  } else if (info) {
    body = <InfoView info={info} />;
  }

  return (
    <>
      <div key={view.menu} className="soft-in text-white" style={{ background: NAVY }}>
        <div className={`${SUB_CONTAINER} py-7 md:py-10`}>
          <p className="text-[28px] font-bold tracking-[-0.04em] md:text-[34px]">{menu.title}</p>
        </div>
      </div>

      <div className={`${SUB_CONTAINER} grid gap-4 py-5 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-6 lg:py-8`}>
        {/* 좌측 서브메뉴 */}
        <nav aria-label={`${menu.title} 메뉴`} className="min-w-0 lg:self-start">
          <p className="hidden h-14 items-center rounded-t-[6px] px-4 text-[19px] font-bold text-white lg:flex" style={{ background: SUNSET_TEXT }}>
            {menu.title}
          </p>
          <ul className="flex gap-1.5 overflow-x-auto pb-1 lg:block lg:overflow-visible lg:border lg:border-t-0 lg:border-[#dfe3ea] lg:bg-white lg:pb-0">
            {menu.items.map((it) => {
              const on = it === view.item;
              return (
                <li key={it} className="shrink-0 lg:border-b lg:border-[#e6e9ef] lg:last:border-b-0">
                  <button
                    type="button"
                    onClick={() => (it === "담당자 찾기" ? openStaff() : go(view.menu, it))}
                    aria-current={on ? "page" : undefined}
                    className={`flex h-10 items-center rounded-[6px] border px-3 text-[15px] font-bold lg:h-12 lg:w-full lg:justify-between lg:rounded-none lg:border-0 lg:px-4 lg:text-[16px] ${
                      on ? "border-[#13233f] bg-[#13233f] text-white lg:bg-[#f3f5f8] lg:text-[#b53d14]" : "border-[#b9c0cc] bg-white text-[#3a4453] hover:text-[#17212b] lg:hover:bg-[#f3f5f8]"
                    }`}
                  >
                    <span>{it}</span>
                    <ChevronRight size={16} aria-hidden className="hidden lg:block" />
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div key={`${view.menu}-${view.item}`} className="soft-in min-w-0 rounded-[12px] bg-white p-4 md:p-8">
          {/* 위치 표시줄 */}
          <ol aria-label="현재 위치" className="flex flex-wrap items-center gap-1 text-[14px] text-[#5a6473]">
            <li>
              <button type="button" onClick={goHome} className="inline-flex items-center gap-1 hover:underline">
                <House size={15} aria-hidden />홈
              </button>
            </li>
            <li aria-hidden>
              <ChevronRight size={14} />
            </li>
            <li>{menu.title}</li>
            <li aria-hidden>
              <ChevronRight size={14} />
            </li>
            <li aria-current="page" className="font-bold text-[#17212b]">
              {view.item}
            </li>
          </ol>
          <h1 className="mt-3 border-b-2 pb-3 text-[26px] font-bold tracking-[-0.03em] md:text-[30px]" style={{ borderColor: NAVY }}>
            {view.item}
          </h1>
          <div className="mt-6">{body}</div>
          <Satisfaction key={`${view.item}-${view.post}`} dept={dept} phone={phone} />
        </div>
      </div>
    </>
  );
}

function DefTable({ rows }: { rows: [string, string][] }) {
  return (
    <dl className="border-t-2 text-[16px]" style={{ borderColor: NAVY }}>
      {rows.map(([k, v]) => (
        <div key={k} className="grid border-b border-[#e6e9ef] sm:grid-cols-[150px_minmax(0,1fr)]">
          <dt className="bg-[#f7f8fa] px-3 py-2.5 font-bold">{k}</dt>
          <dd className="px-3 py-2.5 text-[#3a4453]">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

function DataTable({ table }: { table: Table }) {
  return (
    <section className="mt-8 first:mt-0">
      <h2 className="text-[19px] font-bold">{table.caption}</h2>
      <div className="mt-2 overflow-x-auto">
        <table className="w-full min-w-[480px] text-[15px]">
          <caption className="sr-only">{table.caption}</caption>
          <thead>
            <tr className="border-y-2 bg-[#f7f8fa] text-left" style={{ borderTopColor: NAVY, borderBottomColor: "#dfe3ea" }}>
              {table.head.map((h) => (
                <th key={h} scope="col" className="px-3 py-2.5 font-bold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((r, ri) => (
              <tr key={ri} className="border-b border-[#e6e9ef] align-top">
                {r.map((c, ci) =>
                  ci === 0 ? (
                    <th key={ci} scope="row" className="px-3 py-2.5 text-left font-bold">
                      {c}
                    </th>
                  ) : (
                    <td key={ci} className={`px-3 py-2.5 ${c === "접수중" ? "font-bold" : "text-[#3a4453]"}`} style={c === "접수중" ? { color: SUNSET_TEXT } : undefined}>
                      {c || "-"}
                    </td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function InfoView({ info }: { info: Info }) {
  return (
    <div>
      {info.dl && <DefTable rows={info.dl} />}
      {info.tables && (
        <div className={info.dl ? "mt-8" : ""}>
          {info.tables.map((t) => (
            <DataTable key={t.caption} table={t} />
          ))}
        </div>
      )}
    </div>
  );
}

const BOARD_COLS: Record<BoardKind, { head: string; cell: (p: Post) => React.ReactNode; wide?: boolean }[]> = {
  notice: [
    { head: "담당부서", cell: (p) => p.dept },
    { head: "등록일", cell: (p) => p.date, wide: true },
    { head: "조회", cell: (p) => p.views.toLocaleString() },
  ],
  gosi: [
    { head: "담당부서", cell: (p) => p.dept },
    { head: "게시일", cell: (p) => p.date, wide: true },
  ],
  qna: [
    { head: "작성자", cell: (p) => p.writer },
    { head: "등록일", cell: (p) => p.date },
    {
      head: "처리상태",
      cell: (p) => (
        <span className="font-bold" style={{ color: p.status === "처리중" || p.status === "검토중" ? SUNSET_TEXT : NAVY }}>
          {p.status}
        </span>
      ),
      wide: true,
    },
  ],
  free: [
    { head: "작성자", cell: (p) => p.writer },
    { head: "등록일", cell: (p) => p.date, wide: true },
    { head: "조회", cell: (p) => p.views.toLocaleString() },
  ],
};

function BoardView({ kind, posts, index, onOpen }: { kind: BoardKind; posts: Post[]; index: number | null; onOpen: (i: number | null) => void }) {
  const [scope, setScope] = useState<"제목" | "내용">("제목");
  const [input, setInput] = useState("");
  const [q, setQ] = useState("");
  const hasCat = posts.some((p) => p.cat);

  if (index !== null && posts[index]) {
    return <PostView kind={kind} posts={posts} index={index} onOpen={onOpen} />;
  }

  const list = posts
    .map((p, i) => ({ p, i }))
    .filter(({ p }) => {
      const k = q.trim();
      if (!k) return true;
      return scope === "제목" ? p.title.includes(k) : (p.body ?? []).join(" ").includes(k) || p.title.includes(k);
    });
  const cols = BOARD_COLS[kind];

  return (
    <div className="soft-in">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[6px] bg-[#f3f5f8] p-3">
        <p className="text-[15px] text-[#3a4453]">
          전체 <b className="text-[#17212b]">{list.length}</b>건, 1/1페이지
        </p>
        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            setQ(input);
          }}
          className="flex min-w-0 flex-1 gap-1.5 sm:flex-none"
        >
          <label className="sr-only" htmlFor="board-scope">
            검색 구분
          </label>
          <select id="board-scope" value={scope} onChange={(e) => setScope(e.target.value as "제목" | "내용")} className="h-10 shrink-0 rounded-[4px] border border-[#b9c0cc] bg-white px-2 text-[15px]">
            <option>제목</option>
            <option>내용</option>
          </select>
          <label className="sr-only" htmlFor="board-q">
            검색어
          </label>
          <input id="board-q" value={input} onChange={(e) => setInput(e.target.value)} placeholder="검색어를 입력하세요" className="h-10 min-w-0 flex-1 rounded-[4px] border border-[#b9c0cc] bg-white px-2 text-[15px] sm:w-56" />
          <button type="submit" className="h-10 shrink-0 rounded-[4px] px-4 text-[15px] font-bold text-white" style={{ background: NAVY }}>
            검색
          </button>
        </form>
      </div>

      <table className="mt-4 w-full text-[15px]">
        <caption className="sr-only">게시물 목록</caption>
        <thead>
          <tr className="border-y-2 bg-[#f7f8fa]" style={{ borderTopColor: NAVY, borderBottomColor: "#dfe3ea" }}>
            <th scope="col" className="hidden w-16 px-2 py-2.5 font-bold md:table-cell">
              번호
            </th>
            {hasCat && (
              <th scope="col" className="hidden w-24 px-2 py-2.5 font-bold md:table-cell">
                구분
              </th>
            )}
            {kind === "gosi" && (
              <th scope="col" className="hidden w-52 px-2 py-2.5 font-bold md:table-cell">
                고시공고번호
              </th>
            )}
            <th scope="col" className="px-2 py-2.5 font-bold">
              제목
            </th>
            {cols.map((c) => (
              <th key={c.head} scope="col" className={`${c.wide ? "w-24 md:w-28" : "hidden w-24 md:table-cell"} px-2 py-2.5 font-bold`}>
                {c.head}
              </th>
            ))}
          </tr>
        </thead>
        <tbody key={`${scope}-${q}`} className="soft-in">
          {list.length === 0 ? (
            <tr>
              <td colSpan={8} className="py-10 text-center text-[#5a6473]">
                검색 결과가 없습니다.
              </td>
            </tr>
          ) : (
            list.map(({ p, i }) => (
              <tr key={p.title} className="border-b border-[#e6e9ef]">
                <td className="hidden px-2 py-3 text-center text-[#5a6473] tabular-nums md:table-cell">{posts.length - i}</td>
                {hasCat && <td className="hidden px-2 py-3 text-center text-[#3a4453] md:table-cell">{p.cat}</td>}
                {kind === "gosi" && <td className="hidden px-2 py-3 text-center text-[14px] text-[#3a4453] md:table-cell">{p.no}</td>}
                <td className="px-2 py-3">
                  <button type="button" onClick={() => onOpen(i)} className="text-left underline-offset-2 hover:underline">
                    {p.title}
                  </button>
                </td>
                {cols.map((c) => (
                  <td key={c.head} className={`${c.wide ? "" : "hidden md:table-cell"} px-2 py-3 text-center text-[14px] text-[#3a4453] tabular-nums`}>
                    {c.cell(p)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      <nav aria-label="페이지" className="mt-6 flex justify-center">
        <span aria-current="page" className="flex h-9 min-w-9 items-center justify-center rounded-[4px] px-2 text-[15px] font-bold text-white" style={{ background: NAVY }}>
          1
        </span>
      </nav>
    </div>
  );
}

function PostView({ kind, posts, index, onOpen }: { kind: BoardKind; posts: Post[]; index: number; onOpen: (i: number | null) => void }) {
  const p = posts[index];
  const body = p.body ?? [
    `${p.title}에 대하여 다음과 같이 ${kind === "gosi" ? "공고합니다" : "안내합니다"}.`,
    `1. 담당부서: ${p.dept}`,
    `2. 문의: ${p.dept} ${phoneOf(p.dept)}`,
  ];
  const meta: [string, React.ReactNode][] = [
    ...(kind === "gosi" && p.no ? [["고시공고번호", p.no] as [string, string]] : []),
    [kind === "qna" || kind === "free" ? "작성자" : "담당부서", kind === "qna" || kind === "free" ? p.writer : p.dept],
    ["등록일", p.date],
    ["조회수", p.views.toLocaleString()],
    ...(p.status ? [["처리상태", p.status] as [string, string]] : []),
  ];
  const prev = posts[index - 1];
  const next = posts[index + 1];

  return (
    <article key={index} className="soft-in">
      <div className="border-t-2" style={{ borderColor: NAVY }}>
        <h2 className="bg-[#f7f8fa] px-3 py-3 text-[19px] font-bold leading-[1.45]">{p.title}</h2>
        <dl className="flex flex-wrap gap-x-5 gap-y-1 border-y border-[#dfe3ea] px-3 py-2.5 text-[15px]">
          {meta.map(([k, v]) => (
            <div key={k} className="flex gap-1.5">
              <dt className="font-bold">{k}</dt>
              <dd className="text-[#3a4453]">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="min-h-[160px] space-y-2 px-3 py-6 text-[16px] leading-[1.7]">
        {body.map((l) => (
          <p key={l}>{l}</p>
        ))}
      </div>
      {kind === "gosi" && (
        <p className="flex items-center gap-2 border-t border-[#dfe3ea] px-3 py-2.5 text-[15px]">
          <b>첨부파일</b>
          <span className="inline-flex items-center gap-1 text-[#3a4453]">
            <Paperclip size={14} aria-hidden />
            {p.no}.hwp
          </span>
        </p>
      )}
      {p.answer && (
        <section aria-label="답변" className="mt-2 rounded-[6px] border border-[#dfe3ea] bg-[#f7f8fa] p-4">
          <h3 className="text-[17px] font-bold">
            답변 <span className="ml-1 text-[15px] font-normal text-[#3a4453]">{p.dept}</span>
          </h3>
          <div className="mt-2 space-y-2 text-[16px] leading-[1.7]">
            {p.answer.map((l) => (
              <p key={l}>{l}</p>
            ))}
          </div>
        </section>
      )}

      <ul className="mt-6 border-y border-[#dfe3ea] text-[15px]">
        {[
          ["이전글", prev, index - 1],
          ["다음글", next, index + 1],
        ].map(([label, item, i]) => (
          <li key={label as string} className="flex gap-4 border-b border-[#e6e9ef] px-3 py-2.5 last:border-b-0">
            <b className="w-14 shrink-0">{label as string}</b>
            {item ? (
              <button type="button" onClick={() => onOpen(i as number)} className="min-w-0 truncate text-left hover:underline">
                {(item as Post).title}
              </button>
            ) : (
              <span className="text-[#5a6473]">글이 없습니다.</span>
            )}
          </li>
        ))}
      </ul>
      <div className="mt-4 flex justify-end">
        <button type="button" onClick={() => onOpen(null)} className="h-11 rounded-[6px] px-6 text-[16px] font-bold text-white" style={{ background: NAVY }}>
          목록
        </button>
      </div>
    </article>
  );
}

function MayorView() {
  return (
    <div>
      <section aria-labelledby="greeting-title">
        <h2 id="greeting-title" className="text-[21px] font-bold">
          인사말
        </h2>
        <div className="mt-3 space-y-3 text-[17px] leading-[1.8]">
          <p>존경하는 한들구민 여러분, 반갑습니다.</p>
          <p>한들구 누리집을 찾아주신 여러분을 진심으로 환영합니다.</p>
          <p>구민 여러분의 소중한 의견에 귀 기울이겠습니다.</p>
          <p>감사합니다.</p>
        </div>
        <p className="mt-6 text-right text-[18px] font-bold">한들구청장 홍ㄱ동</p>
      </section>
      <div className="mt-10">
        <DataTable table={{ caption: "민선9기 공약 이행 현황", head: ["분야", "공약 수", "완료", "정상추진"], rows: PLEDGES }} />
      </div>
    </div>
  );
}

function LocationView() {
  return (
    <div>
      <div className="overflow-hidden rounded-[6px] border border-[#dfe3ea]">
        <svg viewBox="0 0 600 300" className="block h-auto w-full" role="img" aria-label="한들구청 위치 약도">
          <rect width="600" height="300" fill="#eef1f5" />
          <path d="M0 230 C150 210 300 260 600 220" fill="none" stroke="#bcd9ee" strokeWidth="26" />
          <path d="M0 120 H600" stroke="#ffffff" strokeWidth="18" />
          <path d="M330 0 V300" stroke="#ffffff" strokeWidth="18" />
          <path d="M120 0 L180 300" stroke="#ffffff" strokeWidth="10" />
          <rect x="350" y="40" width="90" height="60" fill="#dfe3ea" stroke="#b9c0cc" />
          <rect x="200" y="140" width="110" height="50" fill="#dfe3ea" stroke="#b9c0cc" />
          <rect x="360" y="135" width="70" height="44" fill={SUNSET} />
          <text x="395" y="162" textAnchor="middle" fontSize="15" fontWeight="700" fill="#ffffff">
            구청
          </text>
          <circle cx="300" cy="104" r="11" fill={NAVY} />
          <text x="300" y="109" textAnchor="middle" fontSize="12" fontWeight="700" fill="#ffffff">
            M
          </text>
          <text x="268" y="94" textAnchor="end" fontSize="14" fontWeight="700" fill={NAVY}>
            한들구청역 2번 출구
          </text>
          <text x="40" y="262" fontSize="14" fill="#3a6b8f">
            미리내천
          </text>
          <text x="470" y="112" fontSize="13" fill="#5a6473">
            한들로
          </text>
        </svg>
      </div>
      <div className="mt-6">
        <DefTable
          rows={[
            ["주소", "(00000) 가온시 한들구 한들로 100 한들구청"],
            ["대표전화", "02-000-0000 (평일 09:00 ~ 18:00)"],
            ["당직실", "02-000-0119 (야간·공휴일)"],
          ]}
        />
      </div>
      <div className="mt-8">
        <DataTable
          table={{
            caption: "교통편",
            head: ["구분", "이용 방법"],
            rows: [
              ["지하철", "가온선 한들구청역 2번 출구 도보 5분"],
              ["버스", "간선 000, 지선 0000 한들구청 앞 하차"],
              ["주차", "민원인 1시간 무료, 이후 10분당 500원"],
            ],
          }}
        />
      </div>
    </div>
  );
}

const RATINGS = ["매우 만족", "만족", "보통", "불만족", "매우 불만족"];

function Satisfaction({ dept, phone }: { dept: string; phone: string }) {
  const [pick, setPick] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  return (
    <section aria-label="만족도 조사" className="mt-12 rounded-[6px] border border-[#dfe3ea] bg-[#f7f8fa] p-4 md:p-5">
      <dl className="flex flex-wrap gap-x-5 gap-y-1 border-b border-[#dfe3ea] pb-3 text-[15px]">
        {[
          ["담당부서", dept],
          ["연락처", phone],
          ["최종수정일", "2026.10.01"],
        ].map(([k, v]) => (
          <div key={k} className="flex gap-1.5">
            <dt className="font-bold">{k}</dt>
            <dd className="text-[#3a4453] tabular-nums">{v}</dd>
          </div>
        ))}
      </dl>
      {done ? (
        <p role="status" className="pt-3 text-[16px] font-bold">
          평가해 주셔서 감사합니다.
        </p>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (pick) setDone(true);
          }}
          className="flex flex-wrap items-end gap-3 pt-3"
        >
          <fieldset className="min-w-0 flex-1">
            <legend className="text-[16px] font-bold">이 페이지에서 제공하는 정보에 대하여 만족하십니까?</legend>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5">
              {RATINGS.map((r) => (
                <label key={r} className="inline-flex cursor-pointer items-center gap-1.5 text-[15px]">
                  <input type="radio" name="satisfaction" value={r} checked={pick === r} onChange={() => setPick(r)} className="h-4 w-4 accent-[#13233f]" />
                  {r}
                </label>
              ))}
            </div>
          </fieldset>
          <button type="submit" disabled={!pick} className="h-10 shrink-0 rounded-[4px] px-5 text-[15px] font-bold text-white disabled:opacity-50" style={{ background: NAVY }}>
            평가하기
          </button>
        </form>
      )}
    </section>
  );
}
