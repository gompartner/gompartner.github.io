"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Jua } from "next/font/google";
import {
  BookOpen,
  ChevronDown,
  ChevronLeft,
  Dumbbell,
  List,
  MapPin,
  Minus,
  Navigation,
  Palette,
  Phone,
  Plus,
  Presentation,
  Search,
  SlidersHorizontal,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";

/* ○○시 공유공간 지도 데모.
   지도가 화면을 채우고 목록은 지도 위 패널(데스크톱 왼쪽, 모바일 아래)로 띄운다.
   외부 지도 없이 손그림 느낌의 일러스트 지도(SVG, 1000×750 좌표)에 핀을 올린다.
   분류 색은 dataviz 검증 스크립트 통과 순서(녹·자·황·청·적)이며,
   색만으로 구분하지 않도록 핀·목록·분류 버튼에 아이콘과 분류 이름을 함께 쓴다. */

const jua = Jua({ weight: "400", preload: false, display: "swap" });

type CategoryId = "meeting" | "studio" | "library" | "sports" | "community";

const CATEGORIES: { id: CategoryId; label: string; color: string; icon: LucideIcon }[] = [
  { id: "meeting", label: "회의실", color: "#2b7a43", icon: Presentation },
  { id: "studio", label: "연습·창작공간", color: "#8c4fa3", icon: Palette },
  { id: "library", label: "작은도서관", color: "#8a6110", icon: BookOpen },
  { id: "sports", label: "체육시설", color: "#3263c4", icon: Dumbbell },
  { id: "community", label: "주민공유공간", color: "#bf4049", icon: Users },
];

const categoryOf = (id: CategoryId) => CATEGORIES.find((c) => c.id === id)!;

// 색 토큰: 초록 동네 지도 톤. 본문 잉크는 흰 바탕 대비 12:1 이상
const INK = "#23302a";
const INK_SOFT = "#4a5a51";
const LEAF = "#1f7a4d";
const LINE = "#cfe0d4";
const MAP_BG = "#dfeede";

type Reserve = "인터넷" | "전화" | "현장방문";

interface Place {
  id: string;
  name: string;
  dong: string;
  address: string;
  category: CategoryId;
  /** 이용시간 [시작, 종료] (24시간제, 시 단위) */
  hours: [number, number];
  closedDay: string;
  capacity: number;
  fee: "무료" | "유료";
  feeDetail?: string;
  reserve: Reserve;
  pick: "선착순" | "추첨";
  phone: string;
  facilities: string[];
  /** 지도 좌표 (1000×750), 핀 꼬리 끝 위치 */
  x: number;
  y: number;
}

const W = 1000;
const H = 750;

const DONGS = [
  { name: "중앙동", fill: "#f3f8df", d: "M22,24 Q170,6 330,16 Q352,130 360,250 Q280,286 190,300 Q100,286 32,262 Q14,140 22,24Z", lx: 200, ly: 180 },
  { name: "신흥동", fill: "#fdf1dc", d: "M330,16 Q500,10 660,26 Q650,130 630,230 Q500,236 360,250 Q352,130 330,16Z", lx: 500, ly: 150 },
  { name: "동부동", fill: "#e6f2f6", d: "M660,26 Q820,20 980,32 Q984,170 970,300 Q840,316 700,320 Q660,280 630,230 Q650,130 660,26Z", lx: 790, ly: 220 },
  { name: "산성동", fill: "#f8eaf0", d: "M32,262 Q100,286 190,300 Q214,400 230,510 Q150,540 60,560 Q16,480 20,420 Q18,340 32,262Z", lx: 110, ly: 480 },
  { name: "교동", fill: "#eef5e4", d: "M190,300 Q280,286 360,250 Q500,236 630,230 Q660,280 700,320 Q676,400 640,470 Q520,488 400,500 Q316,508 230,510 Q214,400 190,300Z", lx: 430, ly: 400 },
  { name: "남산동", fill: "#fbf0e2", d: "M700,320 Q840,316 970,300 Q990,420 985,540 Q850,556 720,560 Q690,510 640,470 Q676,400 700,320Z", lx: 840, ly: 400 },
  { name: "수정동", fill: "#e8f1f8", d: "M60,560 Q150,540 230,510 Q316,508 400,500 Q420,620 430,735 Q250,742 70,735 Q52,650 60,560Z", lx: 250, ly: 590 },
  { name: "신촌동", fill: "#f1ecf8", d: "M400,500 Q520,488 640,470 Q690,510 720,560 Q850,556 985,540 Q990,640 980,735 Q700,744 430,735 Q420,620 400,500Z", lx: 620, ly: 640 },
];

const PLACES: Place[] = [
  { id: "p1", name: "중앙동 마을회의실", dong: "중앙동", address: "○○시 중앙로 12", category: "meeting", hours: [9, 22], closedDay: "일요일", capacity: 20, fee: "무료", reserve: "인터넷", pick: "선착순", phone: "000-100-0101", facilities: ["빔프로젝터", "화이트보드", "와이파이"], x: 260, y: 90 },
  { id: "p2", name: "신흥동 청년공유실", dong: "신흥동", address: "○○시 신흥로 34", category: "meeting", hours: [10, 21], closedDay: "월요일", capacity: 12, fee: "무료", reserve: "인터넷", pick: "선착순", phone: "000-100-0102", facilities: ["TV 화면", "와이파이", "음료 반입"], x: 420, y: 90 },
  { id: "p3", name: "교동 주민회의실", dong: "교동", address: "○○시 교동로 101", category: "meeting", hours: [9, 18], closedDay: "주말", capacity: 30, fee: "유료", feeDetail: "시간당 10,000원", reserve: "전화", pick: "선착순", phone: "000-100-0103", facilities: ["빔프로젝터", "마이크", "주차"], x: 590, y: 360 },
  { id: "p4", name: "신촌동 소모임실", dong: "신촌동", address: "○○시 신촌로 8", category: "meeting", hours: [9, 22], closedDay: "없음", capacity: 8, fee: "무료", reserve: "인터넷", pick: "선착순", phone: "000-100-0104", facilities: ["화이트보드", "와이파이"], x: 500, y: 600 },
  { id: "p5", name: "동부동 목공방", dong: "동부동", address: "○○시 동부로 45", category: "studio", hours: [10, 20], closedDay: "월요일", capacity: 10, fee: "유료", feeDetail: "재료비 별도", reserve: "전화", pick: "선착순", phone: "000-100-0201", facilities: ["공구 대여", "앞치마", "환기 시설"], x: 720, y: 100 },
  { id: "p6", name: "산성동 도자기 공방", dong: "산성동", address: "○○시 산성로 7", category: "studio", hours: [11, 19], closedDay: "화요일", capacity: 8, fee: "유료", feeDetail: "1회 20,000원", reserve: "현장방문", pick: "선착순", phone: "000-100-0202", facilities: ["가마", "앞치마"], x: 80, y: 340 },
  { id: "p7", name: "남산동 메이커스페이스", dong: "남산동", address: "○○시 남산로 220", category: "studio", hours: [9, 21], closedDay: "일요일", capacity: 16, fee: "무료", reserve: "인터넷", pick: "추첨", phone: "000-100-0203", facilities: ["3D 프린터", "레이저 커터", "교육 프로그램"], x: 750, y: 370 },
  { id: "p8", name: "수정동 음악연습실", dong: "수정동", address: "○○시 수정로 19", category: "studio", hours: [13, 22], closedDay: "월요일", capacity: 6, fee: "무료", reserve: "인터넷", pick: "추첨", phone: "000-100-0204", facilities: ["방음 시설", "피아노", "앰프"], x: 120, y: 650 },
  { id: "p9", name: "중앙동 작은도서관", dong: "중앙동", address: "○○시 중앙로 58", category: "library", hours: [10, 19], closedDay: "월요일", capacity: 25, fee: "무료", reserve: "현장방문", pick: "선착순", phone: "000-100-0301", facilities: ["열람석", "어린이 책", "와이파이"], x: 90, y: 230 },
  { id: "p10", name: "신흥동 책마루", dong: "신흥동", address: "○○시 신흥로 90", category: "library", hours: [9, 18], closedDay: "일요일", capacity: 18, fee: "무료", reserve: "현장방문", pick: "선착순", phone: "000-100-0302", facilities: ["열람석", "스터디룸"], x: 580, y: 200 },
  { id: "p11", name: "교동 마을서재", dong: "교동", address: "○○시 교동로 15", category: "library", hours: [10, 20], closedDay: "화요일", capacity: 15, fee: "무료", reserve: "현장방문", pick: "선착순", phone: "000-100-0303", facilities: ["열람석", "노트북석"], x: 300, y: 380 },
  { id: "p12", name: "신촌동 그림책방", dong: "신촌동", address: "○○시 신촌로 77", category: "library", hours: [10, 18], closedDay: "월요일", capacity: 14, fee: "무료", reserve: "현장방문", pick: "선착순", phone: "000-100-0304", facilities: ["어린이 책", "수유실"], x: 720, y: 700 },
  { id: "p13", name: "동부동 생활체육관", dong: "동부동", address: "○○시 동부로 150", category: "sports", hours: [6, 22], closedDay: "없음", capacity: 60, fee: "유료", feeDetail: "1회 3,000원", reserve: "인터넷", pick: "추첨", phone: "000-100-0401", facilities: ["샤워실", "주차", "탈의실"], x: 690, y: 270 },
  { id: "p14", name: "산성동 탁구장", dong: "산성동", address: "○○시 산성로 42", category: "sports", hours: [9, 21], closedDay: "일요일", capacity: 16, fee: "무료", reserve: "현장방문", pick: "선착순", phone: "000-100-0402", facilities: ["탁구대 4대", "탈의실"], x: 210, y: 470 },
  { id: "p15", name: "남산동 풋살장", dong: "남산동", address: "○○시 남산로 310", category: "sports", hours: [7, 22], closedDay: "없음", capacity: 20, fee: "유료", feeDetail: "2시간 40,000원", reserve: "인터넷", pick: "추첨", phone: "000-100-0403", facilities: ["야간 조명", "주차"], x: 930, y: 480 },
  { id: "p16", name: "교동 요가실", dong: "교동", address: "○○시 교동로 180", category: "sports", hours: [7, 21], closedDay: "주말", capacity: 15, fee: "무료", reserve: "인터넷", pick: "선착순", phone: "000-100-0404", facilities: ["요가 매트", "탈의실"], x: 520, y: 470 },
  { id: "p17", name: "중앙동 마을부엌", dong: "중앙동", address: "○○시 중앙로 30", category: "community", hours: [10, 20], closedDay: "주말", capacity: 12, fee: "유료", feeDetail: "1회 5,000원", reserve: "전화", pick: "선착순", phone: "000-100-0501", facilities: ["조리 기구", "냉장고", "식탁"], x: 300, y: 210 },
  { id: "p18", name: "동부동 공동육아방", dong: "동부동", address: "○○시 동부로 12", category: "community", hours: [10, 17], closedDay: "주말", capacity: 12, fee: "무료", reserve: "인터넷", pick: "선착순", phone: "000-100-0502", facilities: ["수유실", "장난감 대여"], x: 920, y: 250 },
  { id: "p19", name: "수정동 주민사랑방", dong: "수정동", address: "○○시 수정로 60", category: "community", hours: [9, 19], closedDay: "일요일", capacity: 18, fee: "무료", reserve: "전화", pick: "선착순", phone: "000-100-0503", facilities: ["다과 준비", "좌식 탁자"], x: 340, y: 560 },
  { id: "p20", name: "신촌동 어르신 쉼터", dong: "신촌동", address: "○○시 신촌로 120", category: "community", hours: [9, 18], closedDay: "주말", capacity: 25, fee: "무료", reserve: "현장방문", pick: "선착순", phone: "000-100-0504", facilities: ["안마 의자", "건강 체조"], x: 930, y: 650 },
  { id: "p21", name: "중앙동 행정복지센터 회의실", dong: "중앙동", address: "○○시 중앙로 41", category: "meeting", hours: [9, 18], closedDay: "주말", capacity: 24, fee: "무료", reserve: "인터넷", pick: "선착순", phone: "000-100-0110", facilities: ["빔프로젝터", "마이크"], x: 160, y: 110 },
  { id: "p22", name: "신흥동 청년센터 세미나실", dong: "신흥동", address: "○○시 신흥로 7", category: "meeting", hours: [10, 21], closedDay: "월요일", capacity: 16, fee: "무료", reserve: "인터넷", pick: "선착순", phone: "000-100-0111", facilities: ["TV 화면", "와이파이"], x: 500, y: 62 },
  { id: "p23", name: "동부동 마을활력소 회의실", dong: "동부동", address: "○○시 동부로 88", category: "meeting", hours: [9, 21], closedDay: "일요일", capacity: 20, fee: "무료", reserve: "인터넷", pick: "선착순", phone: "000-100-0112", facilities: ["화이트보드", "와이파이"], x: 860, y: 120 },
  { id: "p24", name: "교동 주민자치회 회의실", dong: "교동", address: "○○시 교동로 63", category: "meeting", hours: [9, 18], closedDay: "주말", capacity: 30, fee: "무료", reserve: "전화", pick: "선착순", phone: "000-100-0113", facilities: ["빔프로젝터", "주차"], x: 385, y: 300 },
  { id: "p25", name: "남산동 공유오피스 회의실", dong: "남산동", address: "○○시 남산로 140", category: "meeting", hours: [9, 22], closedDay: "없음", capacity: 8, fee: "유료", feeDetail: "시간당 5,000원", reserve: "인터넷", pick: "선착순", phone: "000-100-0114", facilities: ["TV 화면", "와이파이"], x: 820, y: 470 },
  { id: "p26", name: "수정동 행정복지센터 다목적실", dong: "수정동", address: "○○시 수정로 5", category: "meeting", hours: [9, 18], closedDay: "주말", capacity: 40, fee: "무료", reserve: "인터넷", pick: "선착순", phone: "000-100-0115", facilities: ["마이크", "음향 장비"], x: 175, y: 700 },
  { id: "p27", name: "신촌동 사회적경제센터 회의실", dong: "신촌동", address: "○○시 신촌로 31", category: "meeting", hours: [9, 20], closedDay: "일요일", capacity: 14, fee: "무료", reserve: "인터넷", pick: "선착순", phone: "000-100-0116", facilities: ["빔프로젝터", "와이파이"], x: 820, y: 610 },
  { id: "p28", name: "산성동 마을회관 회의실", dong: "산성동", address: "○○시 산성로 15", category: "meeting", hours: [9, 18], closedDay: "주말", capacity: 20, fee: "무료", reserve: "전화", pick: "선착순", phone: "000-100-0117", facilities: ["좌식 탁자"], x: 150, y: 405 },
  { id: "p29", name: "중앙동 청소년 밴드연습실", dong: "중앙동", address: "○○시 중앙로 77", category: "studio", hours: [14, 22], closedDay: "월요일", capacity: 8, fee: "무료", reserve: "인터넷", pick: "추첨", phone: "000-100-0218", facilities: ["드럼", "앰프", "방음 시설"], x: 60, y: 120 },
  { id: "p30", name: "교동 공예 공방", dong: "교동", address: "○○시 교동로 22", category: "studio", hours: [10, 19], closedDay: "일요일", capacity: 10, fee: "유료", feeDetail: "재료비 별도", reserve: "전화", pick: "선착순", phone: "000-100-0219", facilities: ["작업대", "공구 대여"], x: 465, y: 282 },
  { id: "p31", name: "신촌동 영상 녹음실", dong: "신촌동", address: "○○시 신촌로 95", category: "studio", hours: [10, 21], closedDay: "월요일", capacity: 4, fee: "무료", reserve: "인터넷", pick: "추첨", phone: "000-100-0220", facilities: ["녹음 부스", "조명"], x: 600, y: 705 },
  { id: "p32", name: "남산동 댄스 연습실", dong: "남산동", address: "○○시 남산로 61", category: "studio", hours: [10, 22], closedDay: "일요일", capacity: 15, fee: "유료", feeDetail: "2시간 10,000원", reserve: "인터넷", pick: "선착순", phone: "000-100-0221", facilities: ["전신 거울", "음향 장비"], x: 905, y: 380 },
  { id: "p33", name: "수정동 창작 공방", dong: "수정동", address: "○○시 수정로 48", category: "studio", hours: [10, 18], closedDay: "월요일", capacity: 12, fee: "무료", reserve: "현장방문", pick: "선착순", phone: "000-100-0222", facilities: ["작업대", "재봉틀"], x: 385, y: 665 },
  { id: "p34", name: "신흥동 행정복지센터 작은도서관", dong: "신흥동", address: "○○시 신흥로 52", category: "library", hours: [10, 19], closedDay: "월요일", capacity: 20, fee: "무료", reserve: "현장방문", pick: "선착순", phone: "000-100-0323", facilities: ["열람석", "어린이 책"], x: 385, y: 170 },
  { id: "p35", name: "동부동 아파트 작은도서관", dong: "동부동", address: "○○시 동부로 203", category: "library", hours: [10, 18], closedDay: "일요일", capacity: 16, fee: "무료", reserve: "현장방문", pick: "선착순", phone: "000-100-0324", facilities: ["열람석"], x: 870, y: 205 },
  { id: "p36", name: "교동 어린이도서관", dong: "교동", address: "○○시 교동로 120", category: "library", hours: [9, 18], closedDay: "월요일", capacity: 30, fee: "무료", reserve: "현장방문", pick: "선착순", phone: "000-100-0325", facilities: ["어린이 책", "수유실"], x: 640, y: 425 },
  { id: "p37", name: "산성동 마을문고", dong: "산성동", address: "○○시 산성로 70", category: "library", hours: [10, 17], closedDay: "주말", capacity: 10, fee: "무료", reserve: "현장방문", pick: "선착순", phone: "000-100-0326", facilities: ["열람석"], x: 60, y: 505 },
  { id: "p38", name: "신촌동 북카페 쉼표", dong: "신촌동", address: "○○시 신촌로 150", category: "library", hours: [10, 20], closedDay: "월요일", capacity: 18, fee: "무료", reserve: "현장방문", pick: "선착순", phone: "000-100-0327", facilities: ["열람석", "음료 반입"], x: 880, y: 712 },
  { id: "p39", name: "중앙동 게이트볼장", dong: "중앙동", address: "○○시 중앙로 120", category: "sports", hours: [6, 18], closedDay: "없음", capacity: 30, fee: "무료", reserve: "현장방문", pick: "선착순", phone: "000-100-0428", facilities: ["야외 벤치"], x: 245, y: 262 },
  { id: "p40", name: "신흥동 배드민턴장", dong: "신흥동", address: "○○시 신흥로 110", category: "sports", hours: [6, 22], closedDay: "없음", capacity: 40, fee: "유료", feeDetail: "1회 2,000원", reserve: "인터넷", pick: "선착순", phone: "000-100-0429", facilities: ["탈의실", "샤워실"], x: 625, y: 110 },
  { id: "p41", name: "교동 생활체육공원 테니스장", dong: "교동", address: "○○시 교동로 200", category: "sports", hours: [6, 22], closedDay: "없음", capacity: 16, fee: "유료", feeDetail: "2시간 8,000원", reserve: "인터넷", pick: "추첨", phone: "000-100-0430", facilities: ["야간 조명", "주차"], x: 410, y: 462 },
  { id: "p42", name: "수정동 다목적 체육관", dong: "수정동", address: "○○시 수정로 101", category: "sports", hours: [7, 21], closedDay: "월요일", capacity: 50, fee: "유료", feeDetail: "1회 2,500원", reserve: "인터넷", pick: "선착순", phone: "000-100-0431", facilities: ["샤워실", "탈의실"], x: 290, y: 700 },
  { id: "p43", name: "남산동 공공 수영장", dong: "남산동", address: "○○시 남산로 18", category: "sports", hours: [6, 21], closedDay: "월요일", capacity: 80, fee: "유료", feeDetail: "1회 3,500원", reserve: "인터넷", pick: "선착순", phone: "000-100-0432", facilities: ["샤워실", "주차"], x: 720, y: 505 },
  { id: "p44", name: "신흥동 공유부엌", dong: "신흥동", address: "○○시 신흥로 29", category: "community", hours: [10, 20], closedDay: "월요일", capacity: 10, fee: "유료", feeDetail: "1회 5,000원", reserve: "전화", pick: "선착순", phone: "000-100-0533", facilities: ["조리 기구", "식탁"], x: 455, y: 225 },
  { id: "p45", name: "교동 다함께돌봄센터", dong: "교동", address: "○○시 교동로 48", category: "community", hours: [13, 19], closedDay: "주말", capacity: 20, fee: "무료", reserve: "전화", pick: "선착순", phone: "000-100-0534", facilities: ["놀이 공간", "간식"], x: 325, y: 452 },
  { id: "p46", name: "남산동 경로당 사랑방", dong: "남산동", address: "○○시 남산로 230", category: "community", hours: [9, 17], closedDay: "일요일", capacity: 30, fee: "무료", reserve: "현장방문", pick: "선착순", phone: "000-100-0535", facilities: ["안마 의자", "좌식 탁자"], x: 905, y: 560 },
  { id: "p47", name: "신촌동 마을 공유창고", dong: "신촌동", address: "○○시 신촌로 66", category: "community", hours: [10, 18], closedDay: "주말", capacity: 6, fee: "무료", reserve: "인터넷", pick: "선착순", phone: "000-100-0536", facilities: ["공구 대여", "캠핑 용품"], x: 760, y: 610 },
];

/** 인터넷 예약을 받는 곳은 접수중, 전화·현장방문만 받는 곳은 안내중 */
const statusOf = (p: Place) => (p.reserve === "인터넷" ? "접수중" : "안내중");
const approvalOf = (p: Place) => (p.fee === "유료" || p.pick === "추첨" ? "심사 후 승인" : "자동승인");

const fmtHours = ([s, e]: [number, number]) => `${String(s).padStart(2, "0")}:00~${String(e).padStart(2, "0")}:00`;

function isOpenAt(place: Place, date: Date) {
  const day = date.getDay(); // 0 일 ~ 6 토
  const closed =
    (place.closedDay === "주말" && (day === 0 || day === 6)) ||
    (place.closedDay === "일요일" && day === 0) ||
    (place.closedDay === "월요일" && day === 1) ||
    (place.closedDay === "화요일" && day === 2);
  const h = date.getHours();
  return !closed && h >= place.hours[0] && h < place.hours[1];
}

const DESKTOP_QUERY = "(min-width: 1024px)";
function subscribeDesktop(cb: () => void) {
  const mq = window.matchMedia(DESKTOP_QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}
function useIsDesktop() {
  return useSyncExternalStore(subscribeDesktop, () => window.matchMedia(DESKTOP_QUERY).matches, () => false);
}

const ZOOMS = [1, 1.5, 2];

type Filter<T extends string> = T | "전체";

/** 손그림 지도: 동 경계, 하천, 공원, 산, 작은 건물 그림 */
function IllustratedMap() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 block h-full w-full" aria-hidden>
      <defs>
        {/* 경계선을 살짝 흔들어 손으로 그린 느낌을 낸다 */}
        <filter id="nb-hand" x="-2%" y="-2%" width="104%" height="104%">
          <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="2" seed="7" />
          <feDisplacementMap in="SourceGraphic" scale="7" />
        </filter>
        <pattern id="nb-grass" width="22" height="22" patternUnits="userSpaceOnUse">
          <path d="M5,14 q2,-5 4,0 M14,8 q2,-5 4,0" stroke="#9fcf8a" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        </pattern>
      </defs>

      <rect width={W} height={H} fill={MAP_BG} />
      <g filter="url(#nb-hand)">
        {DONGS.map((d) => (
          <path key={d.name} d={d.d} fill={d.fill} stroke="#ffffff" strokeWidth="7" strokeLinejoin="round" />
        ))}
        {DONGS.map((d) => (
          <path key={`${d.name}-line`} d={d.d} fill="none" stroke="#9db8a6" strokeWidth="2" strokeDasharray="2 9" strokeLinecap="round" />
        ))}
      </g>

      {/* 큰길 */}
      <g stroke="#ffffff" strokeWidth="14" strokeLinecap="round" fill="none" filter="url(#nb-hand)">
        <path d="M0,300 Q500,250 1000,290" />
        <path d="M520,0 Q490,380 540,750" />
        <path d="M0,620 Q420,560 1000,600" />
      </g>

      {/* 하천과 다리 */}
      <g filter="url(#nb-hand)">
        <path d="M-10,430 C200,380 320,540 500,470 S800,380 1010,420" fill="none" stroke="#9fd0ee" strokeWidth="30" strokeLinecap="round" />
        <path d="M-10,430 C200,380 320,540 500,470 S800,380 1010,420" fill="none" stroke="#c9e7f7" strokeWidth="9" strokeLinecap="round" strokeDasharray="30 22" />
      </g>
      <rect x="506" y="440" width="22" height="58" rx="4" transform="rotate(-8 517 469)" fill="#fff9ec" stroke="#8a7a5c" strokeWidth="2.5" />

      {/* 공원 */}
      <g filter="url(#nb-hand)">
        <ellipse cx="120" cy="120" rx="80" ry="54" fill="#c7e6b4" />
        <ellipse cx="120" cy="120" rx="80" ry="54" fill="url(#nb-grass)" />
        <ellipse cx="830" cy="650" rx="92" ry="52" fill="#c7e6b4" />
        <ellipse cx="830" cy="650" rx="92" ry="52" fill="url(#nb-grass)" />
      </g>
      <Trees at={[[92, 104], [140, 96], [118, 140], [800, 636], [852, 628], [872, 668]]} />

      {/* 산 */}
      <g filter="url(#nb-hand)">
        <path d="M830,150 L880,72 L930,150 Z" fill="#a9d39a" stroke="#6d9d62" strokeWidth="3" strokeLinejoin="round" />
        <path d="M880,150 L920,96 L962,150 Z" fill="#bfe0ad" stroke="#6d9d62" strokeWidth="3" strokeLinejoin="round" />
        <path d="M866,94 L880,72 L894,94 Q880,102 866,94Z" fill="#ffffff" />
      </g>

      {/* 시청 */}
      <g transform="translate(446,300)" stroke="#6b5d48" strokeWidth="2.5" strokeLinejoin="round">
        <rect x="0" y="18" width="52" height="34" fill="#fff4dc" />
        <path d="M-4,20 L26,2 L56,20 Z" fill="#f2c46b" />
        <rect x="21" y="34" width="10" height="18" fill="#c99a52" />
        <line x1="26" y1="2" x2="26" y2="-12" />
        <path d="M26,-12 L38,-8 L26,-4 Z" fill="#e2574c" />
      </g>
      {/* 전통시장 */}
      <g transform="translate(832,448)" stroke="#6b5d48" strokeWidth="2.5" strokeLinejoin="round">
        <rect x="0" y="16" width="56" height="30" fill="#fff4dc" />
        <path d="M-4,16 L60,16 L54,4 L2,4 Z" fill="#f7a58c" />
        <path d="M10,16 L10,4 M24,16 L24,4 M38,16 L38,4" stroke="#ffffff" strokeWidth="4" />
      </g>
      {/* 학교 */}
      <g transform="translate(294,656)" stroke="#6b5d48" strokeWidth="2.5" strokeLinejoin="round">
        <rect x="0" y="14" width="54" height="30" fill="#fff4dc" />
        <path d="M-2,14 L27,0 L56,14 Z" fill="#9cc3e6" />
        <circle cx="27" cy="24" r="5" fill="#ffffff" />
        <rect x="8" y="30" width="8" height="8" fill="#c9e7f7" />
        <rect x="38" y="30" width="8" height="8" fill="#c9e7f7" />
      </g>
    </svg>
  );
}

function Trees({ at }: { at: [number, number][] }) {
  return (
    <g>
      {at.map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <rect x={x - 2} y={y + 6} width={4} height={10} fill="#8a6b45" rx={1} />
          <circle cx={x} cy={y} r={12} fill="#7fbf6a" stroke="#5e9a4e" strokeWidth={2} />
        </g>
      ))}
    </g>
  );
}

function Badge({ children, tone }: { children: React.ReactNode; tone: "green" | "gray" | "blue" | "amber" }) {
  const styles = {
    green: "bg-[#e3f3e6] text-[#17603c]",
    gray: "bg-[#eef1ef] text-[#4a5a51]",
    blue: "bg-[#e4edfe] text-[#1d4fb8]",
    amber: "bg-[#fbefd6] text-[#7a5200]",
  }[tone];
  return <span className={`inline-flex h-6 items-center rounded-[4px] px-1.5 text-[14px] font-bold ${styles}`}>{children}</span>;
}

export function CommunityMapDemo() {
  const [query, setQuery] = useState("");
  const [cats, setCats] = useState<CategoryId[]>([]);
  const [openOnly, setOpenOnly] = useState(false);
  const [fee, setFee] = useState<Filter<"무료" | "유료">>("전체");
  const [pick, setPick] = useState<Filter<"선착순" | "추첨">>("전체");
  const [status, setStatus] = useState<Filter<"접수중" | "안내중">>("전체");
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [now, setNow] = useState<Date | null>(null);
  const [userPanel, setUserPanel] = useState<boolean | null>(null);
  const [zoom, setZoom] = useState(0);
  const isDesktop = useIsDesktop();
  const reduced = useReducedMotionSafe();
  const scroller = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const zoomCenter = useRef<{ x: number; y: number } | null>(null);

  // 패널은 데스크톱에서 펼치고 모바일에서 접은 채 시작한다. 사용자가 누르면 그 값을 따른다
  const panelOpen = userPanel ?? isDesktop;
  const panelVisibility = userPanel === null ? "hidden lg:flex" : userPanel ? "flex" : "hidden";
  const besidePanel = userPanel === false ? "" : "lg:left-[404px]";

  // 현재 시각은 mount 이후에만 읽어 프리렌더 HTML과 어긋나지 않게 한다
  useEffect(() => {
    const tick = () => setNow(new Date());
    const first = window.setTimeout(tick, 0);
    const timer = window.setInterval(tick, 60_000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(timer);
    };
  }, []);

  // 모바일에서는 지도가 화면보다 넓으므로 가운데부터 보여 준다
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
    el.scrollTop = (el.scrollHeight - el.clientHeight) / 2;
  }, [isDesktop]);

  // 확대·축소 뒤에도 보던 자리를 가운데에 둔다
  useEffect(() => {
    const el = scroller.current;
    const c = zoomCenter.current;
    if (!el || !c) return;
    el.scrollLeft = c.x * el.scrollWidth - el.clientWidth / 2;
    el.scrollTop = c.y * el.scrollHeight - el.clientHeight / 2;
    zoomCenter.current = null;
  }, [zoom]);

  useEffect(() => {
    if (!detailOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDetailOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [detailOpen]);

  const filtered = useMemo(() => {
    const q = query.trim();
    return PLACES.filter((p) => {
      if (q && !p.name.includes(q) && !p.dong.includes(q)) return false;
      if (cats.length && !cats.includes(p.category)) return false;
      if (openOnly && now && !isOpenAt(p, now)) return false;
      if (fee !== "전체" && p.fee !== fee) return false;
      if (pick !== "전체" && p.pick !== pick) return false;
      if (status !== "전체" && statusOf(p) !== status) return false;
      return true;
    });
  }, [query, cats, openOnly, now, fee, pick, status]);

  const selected = PLACES.find((p) => p.id === selectedId) ?? null;
  const detailCount = (fee !== "전체" ? 1 : 0) + (pick !== "전체" ? 1 : 0) + (status !== "전체" ? 1 : 0);

  const toggleCat = (id: CategoryId) => setCats((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));

  const reset = () => {
    setQuery("");
    setCats([]);
    setOpenOnly(false);
    setFee("전체");
    setPick("전체");
    setStatus("전체");
  };

  /** 지도를 움직여 핀을 보이는 자리 가운데에 둔다 (모바일은 아래 패널을 뺀 영역) */
  const centerOn = (p: Place) => {
    const el = scroller.current;
    const cv = canvas.current;
    if (!el || !cv) return;
    const covered = !isDesktop && panel.current ? panel.current.offsetHeight : 0;
    const visibleH = Math.max(120, el.clientHeight - covered);
    el.scrollTo({
      left: Math.round(cv.offsetLeft + (p.x / W) * cv.offsetWidth - el.clientWidth / 2),
      top: Math.round(cv.offsetTop + (p.y / H) * cv.offsetHeight - visibleH / 2),
      behavior: reduced ? "auto" : "smooth",
    });
  };

  const choose = (p: Place, from: "pin" | "list") => {
    setSelectedId(p.id);
    setDetailOpen(true);
    setUserPanel(true);
    // 목록에서 고르면 지도를 그 핀으로, 모바일에서 핀을 고르면 아래 패널에 가리지 않게 옮긴다
    if (from === "list" || !isDesktop) window.setTimeout(() => centerOn(p), 0);
  };

  const changeZoom = (next: number) => {
    const el = scroller.current;
    if (el && el.scrollWidth) {
      zoomCenter.current = {
        x: (el.scrollLeft + el.clientWidth / 2) / el.scrollWidth,
        y: (el.scrollTop + el.clientHeight / 2) / el.scrollHeight,
      };
    }
    setZoom(next);
  };

  return (
    <div className="flex h-[100dvh] min-h-[560px] flex-col overflow-hidden text-[17px] leading-[1.5]" style={{ color: INK, backgroundColor: MAP_BG }}>
      <style>{`
        @keyframes nb-pin-in { from { opacity: 0; translate: 0 -14px; } to { opacity: 1; translate: 0 0; } }
        .nb-pin { transform: translate(-50%, -100%) rotate(var(--tilt)); transform-origin: 50% 100%; animation: nb-pin-in .32s cubic-bezier(.22,1,.36,1) both; }
        .nb-pin[data-active="true"] { transform: translate(-50%, -100%) scale(1.15); }
        @media (prefers-reduced-motion: reduce) { .nb-pin { animation: none; } }
      `}</style>

      <a
        href="#place-panel"
        onClick={() => setUserPanel(true)}
        className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-[80] focus:rounded-[4px] focus:bg-white focus:px-4 focus:py-2 focus:font-bold focus:outline focus:outline-2 focus:outline-[#1f7a4d]"
      >
        본문 바로가기
      </a>

      {/* 공식 누리집 표시 */}
      <p className="shrink-0 bg-[#f2f4f3] px-4 py-1 text-[14px]" style={{ color: INK_SOFT }}>
        이 누리집은 대한민국 공식 전자정부 누리집입니다.
      </p>

      <header className="shrink-0 border-b bg-white" style={{ borderColor: LINE }}>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2.5">
          <a href="#place-panel" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-[10px] text-white" style={{ backgroundColor: LEAF }}>
              <MapPin size={20} strokeWidth={2.4} aria-hidden />
            </span>
            <span className={`${jua.className} text-[22px] leading-[1.2]`}>○○시 공유공간</span>
          </a>
          <form role="search" onSubmit={(e) => e.preventDefault()} className="order-last w-full md:order-none md:ml-4 md:w-auto md:flex-1 lg:max-w-[440px]">
            <label className="relative block">
              <span className="sr-only">시설명 또는 동 이름</span>
              <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" style={{ color: INK_SOFT }} aria-hidden />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="시설명 또는 동 이름을 입력하세요"
                className="h-11 w-full rounded-[6px] border-2 bg-[#f6faf7] pl-10 pr-3 text-[16px] outline-none focus:border-[#1f7a4d]"
                style={{ borderColor: LINE }}
              />
            </label>
          </form>
          <nav aria-label="주메뉴" className="ml-auto hidden items-center gap-5 text-[16px] font-bold xl:flex">
            <span style={{ color: LEAF }}>시설 찾기</span>
            <a href="#place-panel" className="hover:underline">이용안내</a>
            <a href="#place-panel" className="hover:underline">나의 예약내역</a>
            <a href="#place-panel" className="hover:underline">공지사항</a>
          </nav>
          <p className="ml-auto text-[15px] xl:ml-0" style={{ color: INK_SOFT }}>
            등록 시설 <b style={{ color: LEAF }}>{PLACES.length}</b>곳
          </p>
        </div>
      </header>

      {/* 지도 영역 */}
      <div className="relative min-h-0 flex-1" aria-label="공유공간 지도">
        <div ref={scroller} className={`absolute inset-0 flex overflow-auto [container-type:size] ${besidePanel}`}>
          <div
            ref={canvas}
            className="relative m-auto aspect-[4/3] shrink-0 w-[calc(var(--z)*max(100cqw,133.33cqh))] lg:w-[calc(var(--z)*min(100cqw,133.33cqh))]"
            style={{ "--z": ZOOMS[zoom] } as React.CSSProperties}
          >
            <IllustratedMap />
            {DONGS.map((d) => (
              <span
                key={d.name}
                className={`${jua.className} pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-white/85 px-2 text-[15px] leading-[1.5] sm:text-[17px]`}
                style={{ left: `${(d.lx / W) * 100}%`, top: `${(d.ly / H) * 100}%`, color: INK_SOFT }}
              >
                {d.name}
              </span>
            ))}
            {filtered.map((p, i) => {
              const c = categoryOf(p.category);
              const Icon = c.icon;
              const active = p.id === selectedId || p.id === hoverId;
              return (
                <button
                  key={p.id}
                  type="button"
                  data-active={active}
                  onClick={() => choose(p, "pin")}
                  onMouseEnter={() => setHoverId(p.id)}
                  onMouseLeave={() => setHoverId(null)}
                  onFocus={() => setHoverId(p.id)}
                  onBlur={() => setHoverId(null)}
                  aria-label={`${p.name}, ${c.label}`}
                  aria-pressed={p.id === selectedId}
                  className="nb-pin absolute transition-transform duration-150 motion-reduce:transition-none"
                  style={
                    {
                      left: `${(p.x / W) * 100}%`,
                      top: `${(p.y / H) * 100}%`,
                      animationDelay: `${Math.min(i, 30) * 12}ms`,
                      zIndex: active ? 30 : 10,
                      "--tilt": `${((i % 3) - 1) * 5}deg`,
                    } as React.CSSProperties
                  }
                >
                  {/* 스티커 모양 핀: 둥근 네모 + 꼬리 */}
                  <span className="relative block pb-[7px]">
                    <span
                      className="flex h-8 w-8 items-center justify-center rounded-[10px] border-[2.5px] border-white shadow-[0_2px_0_rgba(35,48,42,0.25)] sm:h-9 sm:w-9 sm:rounded-[12px]"
                      style={{ backgroundColor: c.color }}
                    >
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5" color="#fff" strokeWidth={2.4} aria-hidden />
                    </span>
                    <span className="absolute bottom-0 left-1/2 h-0 w-0 -translate-x-1/2 border-x-[6px] border-t-[8px] border-x-transparent" style={{ borderTopColor: c.color }} />
                  </span>
                  {active && (
                    <span
                      className={`${jua.className} absolute bottom-full left-1/2 mb-1 -translate-x-1/2 whitespace-nowrap rounded-full px-2.5 text-[15px] leading-[1.6] text-white`}
                      style={{ backgroundColor: INK }}
                    >
                      {p.name}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 지도 위 도구 줄: 목록 접기·펴기, 운영 중 필터, 분류 */}
        <div className={`pointer-events-none absolute left-3 right-3 top-3 z-20 flex items-start gap-2 ${besidePanel ? "lg:left-[416px]" : ""}`}>
          <button
            type="button"
            onClick={() => setUserPanel(!panelOpen)}
            aria-expanded={panelOpen}
            aria-controls="place-panel"
            aria-label={panelOpen ? "목록 접기" : "목록 펴기"}
            className="pointer-events-auto inline-flex h-11 shrink-0 items-center gap-1.5 rounded-[6px] bg-white px-3 text-[15px] font-bold shadow-[0_2px_6px_rgba(35,48,42,0.2)]"
          >
            {panelOpen ? <ChevronLeft size={18} aria-hidden className="max-lg:-rotate-90" /> : <List size={18} aria-hidden />}
            목록 <span style={{ color: LEAF }}>{filtered.length}</span>
          </button>
          <div className="pointer-events-auto flex min-w-0 gap-2 overflow-x-auto pb-1">
            <label className="inline-flex h-11 shrink-0 cursor-pointer select-none items-center gap-2 rounded-[6px] bg-white px-3 text-[15px] font-bold shadow-[0_2px_6px_rgba(35,48,42,0.2)]">
              <input type="checkbox" role="switch" checked={openOnly} onChange={(e) => setOpenOnly(e.target.checked)} className="peer sr-only" />
              <span
                className="relative h-6 w-10 rounded-full bg-[#b7c7bc] transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-transform peer-checked:bg-[#1f7a4d] peer-checked:after:translate-x-4 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#1f7a4d] motion-reduce:after:transition-none"
                aria-hidden
              />
              운영 중만 보기
            </label>
            {CATEGORIES.map((c) => {
              const Icon = c.icon;
              const on = cats.includes(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggleCat(c.id)}
                  className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-[6px] border-2 px-3 text-[15px] font-bold shadow-[0_2px_6px_rgba(35,48,42,0.2)] transition-colors"
                  style={on ? { backgroundColor: c.color, borderColor: c.color, color: "#fff" } : { backgroundColor: "#fff", borderColor: "#fff", color: INK }}
                >
                  <Icon size={17} strokeWidth={2.2} style={{ color: on ? "#fff" : c.color }} aria-hidden />
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 확대·축소 */}
        <div className="absolute right-3 top-[68px] z-20 flex flex-col overflow-hidden rounded-[6px] bg-white shadow-[0_2px_6px_rgba(35,48,42,0.2)]">
          <button type="button" aria-label="지도 확대" disabled={zoom === ZOOMS.length - 1} onClick={() => changeZoom(zoom + 1)} className="flex h-11 w-11 items-center justify-center border-b disabled:opacity-40" style={{ borderColor: LINE }}>
            <Plus size={20} aria-hidden />
          </button>
          <button type="button" aria-label="지도 축소" disabled={zoom === 0} onClick={() => changeZoom(zoom - 1)} className="flex h-11 w-11 items-center justify-center disabled:opacity-40">
            <Minus size={20} aria-hidden />
          </button>
        </div>

        {/* 목록·상세 패널 */}
        <div
          ref={panel}
          id="place-panel"
          aria-label="시설 목록"
          className={`${panelVisibility} absolute inset-x-0 bottom-0 z-30 h-[58%] flex-col overflow-hidden rounded-t-[12px] bg-white shadow-[0_-6px_20px_rgba(35,48,42,0.18)] lg:inset-x-auto lg:bottom-3 lg:left-3 lg:top-3 lg:h-auto lg:w-[380px] lg:rounded-[12px] lg:shadow-[0_6px_20px_rgba(35,48,42,0.18)]`}
        >
          {detailOpen && selected ? (
            <PlaceDetail place={selected} onBack={() => setDetailOpen(false)} />
          ) : (
            <>
              <div className="shrink-0 border-b px-4 pb-3 pt-3" style={{ borderColor: LINE }}>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-[17px] font-bold">
                    총 <span style={{ color: LEAF }}>{filtered.length}</span>건
                  </h2>
                  <DetailFilters
                    count={detailCount}
                    fee={fee}
                    setFee={setFee}
                    pick={pick}
                    setPick={setPick}
                    status={status}
                    setStatus={setStatus}
                  />
                </div>
              </div>
              {filtered.length === 0 ? (
                <div className="p-6 text-center" style={{ color: INK_SOFT }}>
                  검색 결과가 없습니다.
                  <button type="button" onClick={reset} className="mx-auto mt-4 flex h-11 items-center rounded-[6px] px-5 font-bold text-white" style={{ backgroundColor: LEAF }}>
                    초기화
                  </button>
                </div>
              ) : (
                <ul className="min-h-0 flex-1 divide-y overflow-y-auto pb-24" style={{ borderColor: LINE }}>
                  {filtered.map((p) => {
                    const c = categoryOf(p.category);
                    const Icon = c.icon;
                    const active = p.id === selectedId || p.id === hoverId;
                    const open = now ? isOpenAt(p, now) : null;
                    return (
                      <li key={p.id} style={{ borderColor: LINE }}>
                        <button
                          type="button"
                          onClick={() => choose(p, "list")}
                          onMouseEnter={() => setHoverId(p.id)}
                          onMouseLeave={() => setHoverId(null)}
                          onFocus={() => setHoverId(p.id)}
                          onBlur={() => setHoverId(null)}
                          className="flex w-full gap-3 border-l-4 px-4 py-3 text-left transition-colors"
                          style={{ borderLeftColor: active ? c.color : "transparent", backgroundColor: active ? "#f6faf7" : undefined }}
                        >
                          <Icon size={20} strokeWidth={2.2} className="mt-1 shrink-0" style={{ color: c.color }} aria-hidden />
                          <span className="min-w-0 flex-1">
                            <span className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
                              <span className="text-[17px] font-bold">{p.name}</span>
                              {statusOf(p) === "접수중" && <Badge tone="blue">접수중</Badge>}
                              {p.pick === "추첨" && <Badge tone="amber">추첨</Badge>}
                            </span>
                            <span className="block text-[15px]" style={{ color: INK_SOFT }}>
                              {c.label} · {p.dong} · {p.capacity}명 · {p.feeDetail ? `${p.fee} ${p.feeDetail}` : p.fee}
                            </span>
                            <span className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[15px]" style={{ color: INK_SOFT }}>
                              {fmtHours(p.hours)}
                              {open !== null && <b style={{ color: open ? "#17603c" : INK_SOFT }}>{open ? "운영중" : "운영종료"}</b>}
                            </span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ChoiceRow<T extends string>({ legend, options, value, onChange }: { legend: string; options: readonly T[]; value: T; onChange: (v: T) => void }) {
  return (
    <fieldset>
      <legend className="text-[15px] font-bold">{legend}</legend>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {options.map((o) => (
          <label key={o} className="cursor-pointer">
            <input type="radio" name={legend} value={o} checked={value === o} onChange={() => onChange(o)} className="peer sr-only" />
            <span className="inline-flex h-9 items-center rounded-[6px] border-2 px-3 text-[15px] font-bold peer-checked:border-[#1f7a4d] peer-checked:bg-[#1f7a4d] peer-checked:text-white peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#1f7a4d]" style={{ borderColor: value === o ? undefined : LINE }}>
              {o}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function DetailFilters({
  count,
  fee,
  setFee,
  pick,
  setPick,
  status,
  setStatus,
}: {
  count: number;
  fee: Filter<"무료" | "유료">;
  setFee: (v: Filter<"무료" | "유료">) => void;
  pick: Filter<"선착순" | "추첨">;
  setPick: (v: Filter<"선착순" | "추첨">) => void;
  status: Filter<"접수중" | "안내중">;
  setStatus: (v: Filter<"접수중" | "안내중">) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="detail-filters"
        className="ml-auto inline-flex h-9 items-center gap-1.5 rounded-[6px] border-2 px-3 text-[15px] font-bold"
        style={{ borderColor: count ? LEAF : LINE, color: count ? LEAF : INK }}
      >
        <SlidersHorizontal size={16} aria-hidden />
        상세검색{count ? ` ${count}` : ""}
        <ChevronDown size={16} aria-hidden className={open ? "rotate-180" : ""} />
      </button>
      {open && (
        <div id="detail-filters" className="basis-full space-y-3 pt-3">
          <ChoiceRow legend="이용요금" options={["전체", "무료", "유료"] as const} value={fee} onChange={setFee} />
          <ChoiceRow legend="선정방식" options={["전체", "선착순", "추첨"] as const} value={pick} onChange={setPick} />
          <ChoiceRow legend="접수상태" options={["전체", "접수중", "안내중"] as const} value={status} onChange={setStatus} />
        </div>
      )}
    </>
  );
}

function PlaceDetail({ place, onBack }: { place: Place; onBack: () => void }) {
  const c = categoryOf(place.category);
  const Icon = c.icon;
  const backRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    backRef.current?.focus({ preventScroll: true });
  }, [place.id]);

  const rows: [string, string][] = [
    ["주소", place.address],
    ["이용시간", fmtHours(place.hours)],
    ["휴관일", place.closedDay === "없음" ? "연중무휴" : place.closedDay],
    ["수용인원", `${place.capacity}명`],
    ["이용요금", place.feeDetail ? `${place.fee} (${place.feeDetail})` : place.fee],
    ["예약방법", place.reserve],
    ["선정방식", place.pick],
    ["승인방식", approvalOf(place)],
    ["문의전화", place.phone],
  ];

  return (
    <section aria-labelledby="place-title" className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 border-b px-4 py-2" style={{ borderColor: LINE }}>
        <button ref={backRef} type="button" onClick={onBack} className="inline-flex h-10 items-center gap-1 rounded-[6px] pr-2 text-[15px] font-bold hover:underline">
          <ChevronLeft size={18} aria-hidden />
          목록
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-24 pt-4">
        <div className="flex items-start gap-3">
          <Icon size={24} strokeWidth={2.2} className="mt-1 shrink-0" style={{ color: c.color }} aria-hidden />
          <div className="min-w-0">
            <p className="text-[15px]" style={{ color: INK_SOFT }}>
              {c.label} · {place.dong}
            </p>
            <h2 id="place-title" className={`${jua.className} text-[24px] leading-[1.3]`}>
              {place.name}
            </h2>
          </div>
        </div>
        <p className="mt-3 flex flex-wrap gap-1">
          <Badge tone={statusOf(place) === "접수중" ? "blue" : "gray"}>{statusOf(place)}</Badge>
          {place.pick === "추첨" && <Badge tone="amber">추첨</Badge>}
        </p>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {statusOf(place) === "접수중" ? (
            <a href="#place-panel" className="flex h-11 items-center justify-center rounded-[6px] text-[15px] font-bold text-white" style={{ backgroundColor: LEAF }}>
              예약하기
            </a>
          ) : (
            <span className="flex h-11 items-center justify-center rounded-[6px] bg-[#eef1ef] text-[15px] font-bold" style={{ color: INK_SOFT }}>
              {place.reserve}
            </span>
          )}
          <a href="#place-panel" className="flex h-11 items-center justify-center gap-1 rounded-[6px] border-2 text-[15px] font-bold" style={{ borderColor: LINE }}>
            <Navigation size={15} aria-hidden />
            길찾기
          </a>
          <a href={`tel:${place.phone}`} className="flex h-11 items-center justify-center gap-1 rounded-[6px] border-2 text-[15px] font-bold" style={{ borderColor: LINE }}>
            <Phone size={15} aria-hidden />
            전화 문의
          </a>
        </div>

        <dl className="mt-4 border-t-2" style={{ borderColor: INK }}>
          {rows.map(([k, v]) => (
            <div key={k} className="flex gap-3 border-b py-2.5 text-[16px]" style={{ borderColor: LINE }}>
              <dt className="w-20 shrink-0 font-bold">{k}</dt>
              <dd style={{ color: INK_SOFT }}>{v}</dd>
            </div>
          ))}
        </dl>

        <h3 className="mt-4 text-[15px] font-bold">편의시설</h3>
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {place.facilities.map((f) => (
            <li key={f} className="rounded-[4px] bg-[#eef5f0] px-2.5 py-0.5 text-[15px]" style={{ color: INK_SOFT }}>
              {f}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
