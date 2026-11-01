"use client";

import { useMemo, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDown,
  ArrowUp,
  Car,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  Dumbbell,
  HelpCircle,
  Lock,
  MapPin,
  QrCode,
  ShieldCheck,
  ShowerHead,
  Speaker,
  Star,
  Thermometer,
  Wifi,
} from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useDemoToday } from "@/hooks/useDemoToday";
import { DemoMakerInfo } from "@/components/demos/DemoMakerInfo";
import { afterSettle, jumpTo } from "@/components/demos/guideScroll";

const STORAGE_KEY = "gs-demo:homepage:v4";

/* 지점 데이터: 항목만 추가하면 지점 카드, 요금표, 지점별 시설 표가 함께 생성된다.
   price는 평일 저녁(기본) 시간당 요금이다. 주간·주말 요금은 slotPrice에서 계산한다. */
const locations = [
  { id: "gangnam", name: "강남점", price: 18000, rating: 4.9, reviews: 128, available: true, img: "/images/demo-gym/zone-weight.jpg", facilities: ["주차", "샤워", "락커", "PT"] },
  { id: "jamsil", name: "잠실점", price: 16000, rating: 4.8, reviews: 96, available: true, img: "/images/demo-gym/zone-cardio.jpg", facilities: ["주차", "샤워", "락커"] },
  { id: "seongsu", name: "성수점", price: 17000, rating: 4.9, reviews: 143, available: true, img: "/images/demo-gym/zone-recovery.jpg", facilities: ["샤워", "락커", "PT"] },
  { id: "hongdae", name: "홍대점", price: 15000, rating: 4.7, reviews: 87, available: true, img: "/images/demo-gym/zone-studio.jpg", facilities: ["락커"] },
  { id: "yeouido", name: "여의도점", price: 19000, rating: 4.8, reviews: 74, available: false, img: "/images/demo-gym/zone-weight.jpg", facilities: ["주차", "샤워", "락커", "PT"] },
  { id: "jongno", name: "종로점", price: 16000, rating: 4.6, reviews: 59, available: true, img: "/images/demo-gym/zone-cardio.jpg", facilities: ["락커"] },
  { id: "yongsan", name: "용산점", price: 18000, rating: 4.8, reviews: 102, available: true, img: "/images/demo-gym/zone-recovery.jpg", facilities: ["주차", "샤워", "락커", "PT"] },
  { id: "kondae", name: "건대점", price: 15000, rating: 4.7, reviews: 68, available: true, img: "/images/demo-gym/zone-studio.jpg", facilities: ["샤워", "락커"] },
  { id: "sinchon", name: "신촌점", price: 15000, rating: 4.6, reviews: 51, available: false, img: "/images/demo-gym/zone-weight.jpg", facilities: ["샤워", "락커", "PT"] },
  { id: "samsung", name: "삼성점", price: 20000, rating: 4.9, reviews: 156, available: true, img: "/images/demo-gym/zone-cardio.jpg", facilities: ["주차", "샤워", "락커", "PT"] },
];

// 후기 영역의 평점은 지점별 후기 수로 가중 평균한다
const REVIEW_TOTAL = locations.reduce((n, l) => n + l.reviews, 0);
const REVIEW_AVG = (locations.reduce((n, l) => n + l.rating * l.reviews, 0) / REVIEW_TOTAL).toFixed(1);

const facilityIcons: Record<string, typeof Car> = { 주차: Car, 샤워: ShowerHead, 락커: Lock, PT: Dumbbell };

const TIME_SLOTS = Array.from({ length: 16 }, (_, i) => `${String(i + 6).padStart(2, "0")}:00`);

/* 시간대 요금 (어반 프라이빗짐의 Happy Hour / Busy hour 방식) */
const RATE_BANDS = [
  { id: "day", label: "평일 주간", time: "06:00 ~ 18:00", diff: -3000 },
  { id: "evening", label: "평일 저녁", time: "18:00 ~ 22:00", diff: 0 },
  { id: "weekend", label: "주말, 공휴일", time: "06:00 ~ 22:00", diff: 4000 },
] as const;
const EXTRA_GUEST = 5000;

function slotBand(iso: string, slot: string) {
  const day = new Date(`${iso}T00:00:00`).getDay();
  if (day === 0 || day === 6) return RATE_BANDS[2];
  return Number(slot.slice(0, 2)) < 18 ? RATE_BANDS[0] : RATE_BANDS[1];
}

function slotPrice(base: number, iso: string, slot: string) {
  return base + slotBand(iso, slot).diff;
}

// 데모용 결정적 예약 현황: 같은 지점·날짜·시간이면 항상 같은 결과
function slotTaken(locationId: string, date: string, slot: string) {
  let h = 0;
  for (const c of locationId + date + slot) h = (h * 31 + c.charCodeAt(0)) % 997;
  return h % 3 === 0;
}

const gallery = [
  { img: "/images/demo-gym/zone-weight.jpg", label: "웨이트존" },
  { img: "/images/demo-gym/zone-cardio.jpg", label: "유산소존" },
  { img: "/images/demo-gym/zone-recovery.jpg", label: "회복존" },
  { img: "/images/demo-gym/zone-studio.jpg", label: "스튜디오" },
];

/* 장비 목록: 감성 문구 대신 규격과 수량 */
const equipment = [
  { zone: "웨이트존", items: ["파워랙 1대 (목재 플랫폼)", "올림픽 바벨 2200mm / 20kg", "원판 총 300kg", "덤벨 2 ~ 40kg", "조절식 벤치 1대"] },
  { zone: "유산소존", items: ["트레드밀 1대", "실내 사이클 1대", "로잉 머신 1대"] },
  { zone: "회복존", items: ["폼롤러, 마사지건", "스트레칭 매트 2장", "전신 거울"] },
  { zone: "스튜디오", items: ["조명 2개, 삼각대", "블루투스 스피커", "촬영용 배경지"] },
];

const amenities = [
  { icon: Clock, label: "06:00 ~ 22:00" },
  { icon: ShieldCheck, label: "한 팀 단독 이용" },
  { icon: Lock, label: "락커" },
  { icon: Thermometer, label: "냉난방" },
  { icon: Wifi, label: "와이파이" },
  { icon: Speaker, label: "블루투스 스피커" },
];

const reviews = [
  { rating: 5, text: "아무도 없으니까 눈치 안 보고 운동했어요.", meta: "김ㅎ늘, 강남점 오전" },
  { rating: 5, text: "통창으로 해 뜨는 거 보면서 뛰는 맛에 새벽마다 가요.", meta: "이ㅈ호, 성수점 새벽" },
  { rating: 4, text: "촬영 대관으로 썼는데 조명이 좋아서 보정할 게 별로 없었어요.", meta: "박*, 홍대점 대관" },
  { rating: 5, text: "PT 선생님이랑 같이 들어갈 수 있어서 편해요. QR 입장도 빠르고요.", meta: "최ㅅ아, 삼성점 PT" },
  { rating: 5, text: "다른 팀이 안 들어오니까 기구 기다릴 일이 없어요.", meta: "정ㅁ준, 잠실점 저녁" },
];

const faqs = [
  { q: "예약 변경은 어떻게 하나요?", a: "이용 2시간 전까지 무료로 변경할 수 있습니다. 이후에는 같은 날 시간 변경만 가능합니다." },
  { q: "인원은 몇 명까지 가능한가요?", a: "최대 2명입니다. 1명 추가 시 시간당 5,000원이 더해집니다." },
  { q: "PT 강사와 함께 이용해도 되나요?", a: "PT 표시가 있는 지점은 개인 강사와 함께 이용할 수 있습니다. 강사는 인원에 포함됩니다." },
  { q: "운동복과 수건을 주나요?", a: "운동복과 세면도구는 준비되어 있지 않습니다. 수건은 샤워실이 있는 지점에만 비치합니다." },
];

const refundRows = [
  ["이용 24시간 전까지", "전액 환불"],
  ["이용 2시간 전까지", "50% 환불"],
  ["이용 2시간 이내", "환불 불가"],
];

/* 하위 화면: 상단 메뉴 순서 그대로 */
type GymPage = "home" | "branches" | "facility" | "pricing" | "info";
const GYM_PAGES: { id: Exclude<GymPage, "home">; label: string }[] = [
  { id: "branches", label: "지점 안내" },
  { id: "facility", label: "시설 안내" },
  { id: "pricing", label: "이용요금" },
  { id: "info", label: "이용안내" },
];

/* 지점별 주소·교통 (데모용, 번지는 000) */
const branchInfo: Record<string, { addr: string; subway: string }> = {
  gangnam: { addr: "서울 강남구 테헤란로 000, 2층", subway: "2호선 강남역 11번 출구 도보 3분" },
  jamsil: { addr: "서울 송파구 올림픽로 000, 3층", subway: "2호선 잠실역 7번 출구 도보 5분" },
  seongsu: { addr: "서울 성동구 성수이로 000, 2층", subway: "2호선 성수역 3번 출구 도보 4분" },
  hongdae: { addr: "서울 마포구 와우산로 000, 지하 1층", subway: "2호선 홍대입구역 9번 출구 도보 6분" },
  yeouido: { addr: "서울 영등포구 국제금융로 000, 2층", subway: "5호선 여의도역 3번 출구 도보 4분" },
  jongno: { addr: "서울 종로구 종로 000, 4층", subway: "1호선 종각역 3번 출구 도보 2분" },
  yongsan: { addr: "서울 용산구 한강대로 000, 3층", subway: "4호선 신용산역 2번 출구 도보 3분" },
  kondae: { addr: "서울 광진구 아차산로 000, 2층", subway: "2호선 건대입구역 2번 출구 도보 5분" },
  sinchon: { addr: "서울 서대문구 연세로 000, 3층", subway: "2호선 신촌역 3번 출구 도보 4분" },
  samsung: { addr: "서울 강남구 영동대로 000, 2층", subway: "2호선 삼성역 5번 출구 도보 3분" },
};

function SectionHead({ id, title, aside }: { id?: string; title: string; aside?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <h2 id={id} className="text-2xl font-black tracking-tight sm:text-4xl">
        {title}
      </h2>
      {aside}
    </div>
  );
}

function Stars({ rating, size = 13 }: { rating: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`평점 ${rating}점`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={size} className={n <= Math.round(rating) ? "fill-[#111] text-[#111]" : "text-stone-300"} aria-hidden />
      ))}
    </span>
  );
}

interface Reservation {
  id: string;
  locationId: string;
  date: string;
  times: string[];
  total: number;
  method?: "card" | "transfer";
}

interface BookingState {
  locationId: string | null;
  date: string | null;
  times: string[];
  guests: number;
  reservations?: Reservation[];
}

/** 예약 확정 시점에 부르는 예약 번호 생성기 */
const newReservationId = () => `R${Date.now()}`;

const emptyBooking: BookingState = { locationId: null, date: null, times: [], guests: 1, reservations: [] };

const tutorialSteps = [
  { target: "map", title: "1. 지점 선택", desc: "지점 목록에서 가까운 지점의 예약하기를 누르세요." },
  { target: "booking-date", title: "2. 날짜 선택", desc: "앞으로 14일 중 원하는 날짜를 누르세요. 빨간 요일은 주말 요금이 적용됩니다." },
  { target: "booking-time", title: "3. 시간 선택", desc: "초록 테두리가 예약 가능한 시간이고, 칸 아래 금액이 그 시간 요금입니다. 여러 시간을 이어서 고를 수 있습니다." },
  { target: "booking-summary", title: "4. 예약 확인, 결제", desc: "총 금액을 확인하고 결제 방법을 고르면 입장 QR이 발급됩니다." },
];

export function HomepageDemo() {
  const [booking, setBooking, hydrated] = useLocalStorage<BookingState>(STORAGE_KEY, emptyBooking);
  // 첫 예약 무료 행사는 이번 달 말일까지로 보여 준다
  const today = useDemoToday();
  const promoEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  // 하위 화면 전환 (지점 안내, 시설 안내, 이용요금, 이용안내)
  const [page, setPage] = useState<GymPage>("home");
  const [branchId, setBranchId] = useState(locations[0].id);
  const [pendingAnchor, setPendingAnchor] = useState<string | null>(null);
  const go = (p: GymPage) => {
    if (p === "branches" && booking.locationId) setBranchId(booking.locationId);
    setPage(p);
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  };
  // 첫 화면으로 돌아가며 해당 구간으로 이동 (예약하기, 내 예약)
  const goHome = (anchor = "top") => {
    setPage("home");
    setPendingAnchor(anchor);
  };
  useEffect(() => {
    if (page !== "home" || !pendingAnchor) return;
    const frame = requestAnimationFrame(() => {
      if (pendingAnchor === "top") window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
      else document.getElementById(pendingAnchor)?.scrollIntoView({ behavior: "instant" as ScrollBehavior });
      setPendingAnchor(null);
    });
    return () => cancelAnimationFrame(frame);
  }, [page, pendingAnchor]);
  const [stage, setStage] = useState<"select" | "confirm" | "paid">("select");
  // 내 예약 목록에서 클릭한 예약의 QR 보기
  const [viewingId, setViewingId] = useState<string | null>(null);
  // 사용법 가이드: 하위 화면에서 누르면 하위 화면·창을 닫고 첫 화면으로 돌아간다
  useEffect(() => {
    const f = () => {
      setPage("home");
      setPendingAnchor(null);
      setViewingId(null);
    };
    window.addEventListener("demo:go-home", f);
    return () => window.removeEventListener("demo:go-home", f);
  }, []);
  // 첫 방문 예약 가이드 (스포트라이트 오버레이)
  const [tutStep, setTutStep] = useState<number | null>(null);
  const [tutRect, setTutRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null);

  const openTutorial = (n: number) => {
    const el = document.getElementById(tutorialSteps[n].target);
    if (!el) return;
    // 전역 scroll-behavior:smooth를 우회해 즉시 옮기고, 위치가 멈춘 뒤에 가이드를 띄운다
    setTutRect(null);
    jumpTo(el);
    afterSettle(() => {
      const r = el.getBoundingClientRect();
      setTutRect({ top: r.top, left: r.left, width: r.width, height: r.height });
      setTutStep(n);
    });
  };

  // 가이드가 열려 있는 동안 대상 영역 좌표를 스크롤·리사이즈에 맞춰 동기화
  useEffect(() => {
    if (tutStep === null) return;
    const el = document.getElementById(tutorialSteps[tutStep].target);
    if (!el) return;
    const sync = () => {
      const r = el.getBoundingClientRect();
      setTutRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    };
    sync();
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [tutStep]);

  const closeTutorial = () => {
    setTutStep(null);
    setTutRect(null);
    // 가이드가 끝나면 첫 단계인 지역 선택(지도)에서 바로 시작하게 한다
    scrollTo("map");
  };

  // 가이드는 자동으로 열지 않는다. 한 번도 열지 않았으면 물음표 버튼을 반짝여 알린다(DemoDock과 같은 키).
  const seenKey = "demo-guide-opened:private-gym";
  const [tutFresh, setTutFresh] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        setTutFresh(!localStorage.getItem(seenKey));
      } catch {}
    });
    return () => cancelAnimationFrame(frame);
  }, []);
  const openGuide = () => {
    setTutFresh(false);
    try {
      localStorage.setItem(seenKey, "1");
    } catch {}
    openTutorial(0);
  };

  const selected = locations.find((l) => l.id === booking.locationId) ?? null;
  // 시간 칸마다 시간대 요금을 더하고, 2명이면 시간당 인원 추가 요금을 붙인다
  const hoursCost =
    selected && booking.date ? booking.times.reduce((sum, t) => sum + slotPrice(selected.price, booking.date as string, t), 0) : 0;
  const extraCost = booking.guests > 1 ? EXTRA_GUEST * (booking.guests - 1) * booking.times.length : 0;
  const total = hoursCost + extraCost;

  // 앞으로 14일 — 빌드 시점 HTML과의 hydration 차이를 피하려고 mount 후에만 계산
  const days = useMemo(() => {
    if (!hydrated) return [];
    return Array.from({ length: 14 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i);
      return {
        iso: d.toISOString().slice(0, 10),
        day: d.getDate(),
        weekday: ["일", "월", "화", "수", "목", "금", "토"][d.getDay()],
        weekend: d.getDay() === 0 || d.getDay() === 6,
      };
    });
  }, [hydrated]);

  // 저장된 날짜가 과거면 초기화
  useEffect(() => {
    if (hydrated && booking.date && days.length && booking.date < days[0].iso) {
      setBooking((prev) => ({ ...prev, date: null, times: [] }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, days.length]);

  const selectLocation = (id: string) => {
    setBooking((prev) => (prev.locationId === id ? prev : { ...prev, locationId: id, times: [] }));
    setStage("select");
  };

  const selectDate = (iso: string) => {
    setBooking((prev) => ({ ...prev, date: iso, times: [] }));
    setStage("select");
  };

  const toggleTime = (slot: string) => {
    setBooking((prev) => ({
      ...prev,
      times: prev.times.includes(slot) ? prev.times.filter((t) => t !== slot) : [...prev.times, slot].sort(),
    }));
    setStage("select");
  };

  // 결제 확정: 예약 목록에 저장하고 확정 화면으로 전환
  const confirmPayment = (method: Reservation["method"]) => {
    setStage("paid");
    if (!selected || !booking.date || booking.times.length === 0) return;
    const reservation: Reservation = {
      id: newReservationId(),
      locationId: selected.id,
      date: booking.date,
      times: booking.times,
      total,
      method,
    };
    setBooking((prev) => ({ ...prev, reservations: [...(prev.reservations ?? []), reservation] }));
  };

  const ready = Boolean(selected && booking.date && booking.times.length > 0);
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="min-h-screen bg-white font-sans text-[#111]">
      <style>{`
        .gym-hero-title { text-wrap: balance; }
      `}</style>

      {/* 상단 메뉴: 첫 화면에서는 사진 위에 겹치고, 하위 화면에서는 검은 띠로 둔다 */}
      <nav
        aria-label="주 메뉴"
        className={page === "home" ? "absolute inset-x-0 top-0 z-40 bg-gradient-to-b from-black/55 to-transparent" : "relative z-40 bg-[#111]"}
      >
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-3 px-4 py-5 text-white sm:flex-nowrap sm:px-8">
          <button type="button" onClick={() => goHome("top")} className="flex shrink-0 items-center gap-2" aria-label="프라이빗 짐 홈">
            <span className="inline-flex items-baseline gap-1.5 whitespace-nowrap">
              <span className="text-lg font-black tracking-wider">프라이빗 짐</span>
            </span>
          </button>
          <ul className="-mx-1 flex w-full items-center gap-4 overflow-x-auto px-1 text-sm font-medium sm:mx-0 sm:w-auto sm:gap-6 sm:overflow-visible sm:px-0">
            {GYM_PAGES.map((p) => (
              <li key={p.id} className="shrink-0">
                <button
                  type="button"
                  onClick={() => go(p.id)}
                  aria-current={page === p.id ? "page" : undefined}
                  className={`transition-opacity hover:opacity-70 ${page === p.id ? "underline decoration-2 underline-offset-8" : ""}`}
                >
                  {p.label}
                </button>
              </li>
            ))}
            <li className="shrink-0">
              <button type="button" onClick={() => goHome("booking")} className="font-bold transition-opacity hover:opacity-70">
                예약하기
              </button>
            </li>
            {(booking.reservations ?? []).length > 0 && (
              <li className="shrink-0">
                <button type="button" onClick={() => goHome("my-bookings")} className="font-bold text-[#4ade80] transition-opacity hover:opacity-70">
                  내 예약 {(booking.reservations ?? []).length}
                </button>
              </li>
            )}
          </ul>
        </div>
      </nav>

      {/* 첫 화면은 하위 화면에 있는 동안 숨겨만 둔다(예약 상태 유지) */}
      <div hidden={page !== "home"} className="soft-in">
      {/* 첫 화면: 매장 사진 */}
      <header id="top" className="relative h-svh min-h-[600px] overflow-hidden bg-[#111]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/videos/gym-entrance-poster.jpg"
          alt="아침 햇살이 드는 프라이빗 짐 내부"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to top, rgba(18,14,9,.88) 0%, rgba(18,14,9,.35) 45%, rgba(18,14,9,.15) 100%)" }}
          aria-hidden
        />
        {/* pb-24: 화면 아래 양쪽 모서리의 사이트 공용 버튼과 겹치지 않게 띄운다 */}
        <div className="absolute inset-x-0 bottom-0 px-4 pb-24 text-stone-100 sm:px-8">
          <p className="text-sm font-semibold text-stone-300">프라이빗 짐</p>
          <h1 className="gym-hero-title mt-2 max-w-4xl text-[11vw] font-black leading-[1.08] tracking-tight sm:text-7xl">
            1시간 단위 단독 이용
          </h1>
          <div className="mt-6 flex flex-wrap items-end justify-between gap-x-8 gap-y-5 border-t border-white/25 pt-5">
            <div className="max-w-xl text-[15px] leading-relaxed text-stone-200/90">
              <p>
                서울 {locations.length}개 지점을 매일 06:00 ~ 22:00 무인으로 운영합니다. 예약한 시간에는 한 팀만 들어옵니다.
              </p>
              <p className="mt-2 text-amber-200">{promoEnd.getMonth() + 1}월 {promoEnd.getDate()}일까지 첫 예약 1시간 무료 (1인 1회)</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="#booking"
                className="inline-flex items-center gap-1.5 rounded-lg bg-white px-6 py-3 font-bold text-[#111] transition-colors hover:bg-amber-300"
              >
                첫 1시간 무료 예약
              </a>
              <a
                href="#map"
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/40 bg-black/40 px-6 py-3 font-semibold transition-colors hover:border-amber-300 hover:text-amber-300"
              >
                <ArrowDown size={16} aria-hidden />
                지점 안내
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* 지점 안내: 지점 카드 목록 */}
      <section id="map" aria-labelledby="map-title" className="scroll-mt-8 bg-[#F4F4F4] py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <SectionHead
            id="map-title"
            title="지점 안내"
            aside={<p className="text-sm text-stone-500">서울 {locations.length}개 지점, 매일 06:00 ~ 22:00</p>}
          />
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
            {locations.map((loc) => {
              const active = booking.locationId === loc.id;
              return (
                <li
                  key={loc.id}
                  className={`flex overflow-hidden rounded-lg border bg-white transition-colors sm:block duration-200 hover:border-stone-500 ${
                    active ? "border-[#111]" : "border-stone-200"
                  }`}
                >
                  <div className="relative w-28 shrink-0 overflow-hidden sm:w-auto">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={loc.img} alt={`${loc.name} 내부`} className="h-full w-full object-cover sm:aspect-[16/10] sm:h-auto" />
                    {active && (
                      <span className="absolute left-0 top-0 bg-[#16A34A] px-3 py-1.5 text-xs font-bold text-white">선택됨</span>
                    )}
                    {!loc.available && !active && (
                      <span className="absolute left-0 top-0 bg-[#111]/80 px-3 py-1.5 text-xs font-bold text-white">오늘 마감</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1 p-4 sm:p-5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-lg font-bold">{loc.name}</p>
                      <p className="flex shrink-0 items-center gap-1 text-sm text-stone-500">
                        <Star size={14} className="fill-[#111] text-[#111]" aria-hidden />
                        {loc.rating} <span className="text-stone-400">({loc.reviews})</span>
                      </p>
                    </div>
                    <p className="mt-1 text-xs text-stone-500 sm:text-sm">{branchInfo[loc.id]?.subway}</p>
                    <p className="mt-2 tabular-nums text-lg font-bold">
                      {(loc.price + RATE_BANDS[0].diff).toLocaleString()}원
                      <span className="text-sm font-normal text-stone-400"> 부터 / 1시간</span>
                    </p>
                    <div className="mt-3 flex items-center gap-2.5 text-stone-500 sm:mt-4 sm:gap-3">
                      {loc.facilities.map((f) => {
                        const Icon = facilityIcons[f];
                        return <Icon key={f} size={17} strokeWidth={1.6} role="img" aria-label={f} />;
                      })}
                      <button
                        type="button"
                        onClick={() => {
                          selectLocation(loc.id);
                          scrollTo("booking");
                        }}
                        aria-label={`${loc.name} ${loc.available ? "예약하기" : "오늘 마감"}`}
                        className={`ml-auto shrink-0 rounded-lg px-4 py-2.5 text-sm font-bold transition-colors sm:px-5 ${
                          loc.available ? "bg-[#111] text-white hover:bg-[#16A34A]" : "bg-stone-100 text-stone-400"
                        }`}
                      >
                        {loc.available ? "예약하기" : "마감"}
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* 예약: 날짜, 시간, 결제 */}
      <section id="booking" aria-labelledby="booking-title" className="scroll-mt-8 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <SectionHead
            id="booking-title"
            title={selected ? `${selected.name} 예약` : "예약"}
            aside={
              <div className="flex items-center gap-2">
                {!selected && (
                  <button
                    type="button"
                    onClick={() => scrollTo("map")}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#111] px-5 py-2.5 text-sm font-bold text-white hover:bg-stone-800"
                  >
                    <MapPin size={15} aria-hidden />
                    지점 선택
                  </button>
                )}
                <button
                  type="button"
                  onClick={openGuide}
                  aria-label="예약 가이드 보기"
                  className={`relative shrink-0 rounded-lg border p-2.5 transition-colors hover:border-[#111] hover:text-[#111] ${tutFresh ? "border-[#16A34A] text-[#16A34A]" : "border-stone-200 text-stone-400"}`}
                >
                  {tutFresh && <span aria-hidden className="absolute inset-0 rounded-lg bg-[#16A34A]/40 motion-safe:animate-ping" />}
                  <HelpCircle size={16} aria-hidden className="relative" />
                </button>
              </div>
            }
          />
          <div className="mt-8 grid gap-8 lg:grid-cols-[3fr_2fr]">
            <div>
              {/* 선택한 지점 미리보기 — 무엇을 예약 중인지 항상 보이게 */}
              {selected && (
                <div className="mb-6 flex items-center gap-4 rounded-lg border border-stone-200 bg-stone-50 p-3">
                  <img src={selected.img} alt={`${selected.name} 내부`} className="h-16 w-16 shrink-0 rounded-xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold">{selected.name}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-stone-500">
                      <Star size={11} className="fill-[#111] text-[#111]" aria-hidden />
                      {selected.rating} ({selected.reviews}), {selected.facilities.join(", ")}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => scrollTo("map")}
                    className="shrink-0 rounded-lg border border-stone-200 px-3 py-2 text-xs font-semibold text-stone-600 hover:border-[#111]"
                  >
                    지점 변경
                  </button>
                </div>
              )}
              {/* 날짜 */}
              <div id="booking-date">
              <h3 className="text-sm font-bold text-stone-600">날짜</h3>
              <div className="mt-3 grid grid-cols-7 gap-1.5 sm:gap-2">
                {days.map((d) => {
                  const active = booking.date === d.iso;
                  return (
                    <button
                      key={d.iso}
                      type="button"
                      onClick={() => selectDate(d.iso)}
                      disabled={!selected}
                      aria-pressed={active}
                      aria-label={`${d.day}일 ${d.weekday}요일${d.weekend ? ", 주말 요금" : ""}`}
                      className={`rounded-lg border py-3 text-center transition-colors disabled:opacity-40 ${
                        active ? "border-[#111] bg-[#111] text-white" : "border-stone-200 bg-white hover:border-[#111]"
                      }`}
                    >
                      <span className={`block text-xs ${active ? "text-stone-300" : d.weekend ? "text-[#EF4444]" : "text-stone-400"}`}>
                        {d.weekday}
                      </span>
                      <span className="tabular-nums text-base font-bold">{d.day}</span>
                    </button>
                  );
                })}
              </div>
              </div>

              {/* 시간 */}
              <div id="booking-time">
              <div className="mt-8 flex items-center justify-between">
                <h3 className="text-sm font-bold text-stone-600">시간</h3>
                <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1 text-[11px] text-stone-500">
                  <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-stone-200" aria-hidden />예약 완료</span>
                  <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-[#16A34A]" aria-hidden />예약 가능</span>
                  <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-[#111]" aria-hidden />선택</span>
                </div>
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={booking.date ?? "none"}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="mt-3 grid grid-cols-4 gap-1.5 sm:grid-cols-6 sm:gap-2"
                >
                  {booking.date && selected ? (
                    TIME_SLOTS.map((slot) => {
                      const taken = slotTaken(selected.id, booking.date as string, slot);
                      const chosen = booking.times.includes(slot);
                      const price = slotPrice(selected.price, booking.date as string, slot);
                      return (
                        <button
                          key={slot}
                          type="button"
                          disabled={taken}
                          aria-pressed={chosen}
                          aria-label={`${slot} ${taken ? "예약 완료" : `${price.toLocaleString()}원`}`}
                          onClick={() => toggleTime(slot)}
                          className={`rounded-lg border py-2 tabular-nums transition-colors ${
                            taken
                              ? "cursor-not-allowed border-stone-100 bg-stone-100 text-stone-300"
                              : chosen
                                ? "border-[#111] bg-[#111] text-white"
                                : "border-[#16A34A]/30 bg-white text-[#15803d] hover:border-[#16A34A]"
                          }`}
                        >
                          <span className={`block text-base font-semibold ${taken ? "line-through" : ""}`}>{slot}</span>
                          <span className={`block text-[11px] ${taken ? "" : chosen ? "text-stone-300" : "text-stone-500"}`}>
                            {taken ? "마감" : price.toLocaleString()}
                          </span>
                        </button>
                      );
                    })
                  ) : (
                    <div className="col-span-full flex justify-center rounded-xl border border-dashed border-stone-300 px-4 py-6 text-sm text-stone-500">
                      {selected ? (
                        "날짜 미선택"
                      ) : (
                        <button
                          type="button"
                          onClick={() => scrollTo("map")}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-4 py-2 font-semibold text-[#111] hover:border-[#111]"
                        >
                          <MapPin size={14} aria-hidden />
                          지점 선택
                        </button>
                      )}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
              </div>
            </div>

            {/* 예약 요약 */}
            {/* 좌측 컬럼 높이를 꽉 채워 아래 여백이 생기지 않게 한다 */}
            <div className="lg:h-full">
              <div id="booking-summary" className="flex h-full flex-col rounded-lg border border-stone-200 bg-white p-6">
                {(() => {
                  // 내 예약에서 클릭한 예약의 QR 보기가 우선
                  const viewing = (booking.reservations ?? []).find((r) => r.id === viewingId);
                  if (!viewing) return null;
                  const loc = locations.find((l) => l.id === viewing.locationId);
                  return (
                    <div className="flex h-full flex-col justify-center text-center">
                      <h3 className="text-sm font-bold text-stone-600">입장 QR</h3>
                      <p className="mt-3 text-lg font-bold">{loc?.name}</p>
                      <p className="mt-1 tabular-nums text-sm text-stone-500">
                        {viewing.date.slice(5).replace("-", ".")}, {viewing.times.join(", ")}
                      </p>
                      <div className="mx-auto mt-5 flex h-28 w-28 items-center justify-center rounded-xl border border-stone-200 bg-[#F4F4F4]">
                        <QrCode size={72} aria-label="입장 QR 코드" />
                      </div>
                      <p className="mt-2 text-xs text-stone-500">입구 리더기에 QR을 대면 예약 시간 동안 출입할 수 있습니다. 출입 비밀번호는 이용 30분 전 문자로 발송합니다.</p>
                      <button
                        type="button"
                        onClick={() => setViewingId(null)}
                        className="mt-5 w-full rounded-lg border border-stone-200 py-3 text-sm font-semibold text-stone-600 hover:border-[#111]"
                      >
                        닫기
                      </button>
                    </div>
                  );
                })() ?? (stage === "paid" ? (
                  <div className="flex h-full flex-col justify-center text-center">
                    <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#16A34A] text-white">
                      <Check size={22} aria-hidden />
                    </span>
                    <p className="mt-4 text-lg font-bold" role="status">예약 확정</p>
                    <p className="mt-1 tabular-nums text-sm text-stone-500">
                      {selected?.name}, {booking.date?.slice(5).replace("-", ".")}, {booking.times.join(", ")}
                    </p>
                    <div className="mx-auto mt-5 flex h-28 w-28 items-center justify-center rounded-xl border border-stone-200 bg-[#F4F4F4]">
                      <QrCode size={72} aria-label="입장 QR 코드" />
                    </div>
                    <p className="mt-2 text-xs text-stone-500">입구 리더기에 QR을 대면 예약 시간 동안 출입할 수 있습니다. 출입 비밀번호는 이용 30분 전 문자로 발송합니다.</p>
                    <button
                      type="button"
                      onClick={() => {
                        setBooking((prev) => ({ ...emptyBooking, guests: prev.guests, reservations: prev.reservations }));
                        setStage("select");
                      }}
                      className="mt-5 w-full rounded-lg bg-[#111] py-3 text-sm font-bold text-white hover:bg-stone-800"
                    >
                      새 예약 만들기
                    </button>
                  </div>
                ) : (
                  <>
                    <h3 className="text-sm font-bold text-stone-600">예약 내역</h3>
                    {/* 카드가 늘어난 만큼 항목 간격도 균등하게 배분한다 (모바일은 고정 간격) */}
                    <dl className="mt-4 flex-1 space-y-2.5 text-sm lg:flex lg:flex-col lg:justify-evenly lg:space-y-0">
                      {/* 선택상자가 있는 행과 높이가 같도록 모든 행을 min-h-9로 통일 */}
                      <div className="flex min-h-9 items-center justify-between"><dt className="text-stone-500">지점</dt><dd className="font-semibold">{selected?.name ?? "미선택"}</dd></div>
                      <div className="flex min-h-9 items-center justify-between"><dt className="text-stone-500">날짜</dt><dd className="tabular-nums font-semibold">{booking.date ?? "미선택"}</dd></div>
                      <div className="flex min-h-9 items-center justify-between"><dt className="text-stone-500">시간</dt><dd className="max-w-[55%] text-right tabular-nums font-semibold">{booking.times.length ? booking.times.join(", ") : "미선택"}</dd></div>
                      <div className="flex min-h-9 items-center justify-between">
                        <dt className="text-stone-500">인원</dt>
                        <dd>
                          <select
                            value={booking.guests}
                            onChange={(e) => setBooking((prev) => ({ ...prev, guests: Number(e.target.value) }))}
                            className="cursor-pointer rounded-lg border border-stone-200 px-2 py-1 font-semibold outline-none focus-visible:border-[#111]"
                            aria-label="인원 선택"
                          >
                            <option value={1}>1명</option>
                            <option value={2}>2명</option>
                          </select>
                        </dd>
                      </div>
                      <div className="flex min-h-9 items-center justify-between"><dt className="text-stone-500">이용 요금</dt><dd className="tabular-nums font-semibold">{hoursCost.toLocaleString()}원</dd></div>
                      <div className="flex min-h-9 items-center justify-between"><dt className="text-stone-500">인원 추가</dt><dd className="tabular-nums font-semibold">{extraCost.toLocaleString()}원</dd></div>
                    </dl>
                    {/* 카드가 컬럼 높이만큼 늘어나면 총액·버튼이 하단에 붙는다 */}
                    <div className="mt-4 flex items-baseline justify-between border-t border-stone-200 pt-4 lg:mt-auto">
                      <p className="text-sm font-semibold text-stone-500">총 금액</p>
                      <p className="tabular-nums text-2xl font-black">{total.toLocaleString()}원</p>
                    </div>
                    {stage === "confirm" ? (
                      <div className="mt-5">
                        <p className="rounded-lg border border-[#16A34A]/30 bg-[#16A34A]/5 px-4 py-3 text-xs leading-relaxed text-[#15803d]">
                          결제가 끝나면 입장 QR이 발급됩니다.
                        </p>
                        <button
                          type="button"
                          onClick={() => confirmPayment("card")}
                          className="mt-3 w-full rounded-lg bg-[#111] py-3.5 font-bold text-white transition-colors hover:bg-stone-800 active:scale-[0.98]"
                        >
                          카드 결제 {total.toLocaleString()}원
                        </button>
                        <button
                          type="button"
                          onClick={() => confirmPayment("transfer")}
                          className="mt-2 w-full rounded-lg border border-stone-300 py-3.5 font-bold text-stone-700 transition-colors hover:border-[#111] hover:text-[#111] active:scale-[0.98]"
                        >
                          계좌이체
                        </button>
                        <button type="button" onClick={() => setStage("select")} className="mt-2 w-full py-2 text-xs text-stone-400 hover:text-stone-600">
                          돌아가기
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={!ready}
                        onClick={() => setStage("confirm")}
                        className="mt-5 w-full rounded-lg bg-[#111] py-3.5 font-bold text-white transition-colors hover:bg-stone-800 active:scale-[0.98] disabled:bg-stone-200 disabled:text-stone-400"
                      >
                        예약하기
                      </button>
                    )}
                  </>
                ))}
              </div>
            </div>
          </div>

          {/* 내 예약 — 예약이 몇 건이든 한 줄 가로 스트립으로 넉넉하게 */}
          {(booking.reservations ?? []).length > 0 && (
            <div id="my-bookings" className="mt-14 scroll-mt-8">
              <h3 className="text-lg font-bold">
                내 예약 <span className="tabular-nums text-stone-500">{(booking.reservations ?? []).length}</span>
              </h3>
              {/* 모바일은 세로 스택, sm 이상은 한 줄 가로 스트립 */}
              <div className="mt-4 flex flex-col gap-3 sm:snap-x sm:flex-row sm:gap-4 sm:overflow-x-auto sm:pb-3 sm:[scrollbar-width:thin]">
                {(booking.reservations ?? []).map((r) => {
                  const loc = locations.find((l) => l.id === r.locationId);
                  return (
                    <div key={r.id} className="w-full rounded-lg border border-stone-200 bg-white p-4 sm:w-64 sm:shrink-0 sm:snap-start">
                      <button
                        type="button"
                        onClick={() => {
                          setViewingId(r.id);
                          document.getElementById("booking-summary")?.scrollIntoView({ block: "center", behavior: "smooth" });
                        }}
                        className="group/item flex w-full items-center gap-3 text-left"
                        aria-label={`${loc?.name ?? ""} 예약 QR 보기`}
                      >
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-stone-100 transition-colors group-hover/item:bg-[#16A34A] group-hover/item:text-white">
                          <QrCode size={24} aria-hidden />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-bold">{loc?.name ?? r.locationId}</span>
                          <span className="block tabular-nums text-xs text-stone-500">
                            {r.date.slice(5).replace("-", ".")}, {r.times.join(", ")}
                          </span>
                        </span>
                      </button>
                      <div className="mt-3 flex items-center justify-between border-t border-stone-100 pt-3">
                        <p className="tabular-nums text-sm font-semibold">
                          {r.total.toLocaleString()}원
                          {r.method === "transfer" && <span className="ml-1.5 text-xs font-medium text-stone-500">계좌이체</span>}
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            if (viewingId === r.id) setViewingId(null);
                            setBooking((prev) => ({
                              ...prev,
                              reservations: (prev.reservations ?? []).filter((x) => x.id !== r.id),
                            }));
                          }}
                          aria-label={`${loc?.name ?? ""} ${r.date.slice(5).replace("-", ".")} 예약 취소`}
                          className="rounded px-2 py-1 text-xs text-stone-500 transition-colors hover:text-[#EF4444]"
                        >
                          예약 취소
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 이용 후기 */}
      <section id="reviews" aria-labelledby="reviews-title" className="scroll-mt-8 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <SectionHead
            id="reviews-title"
            title="이용 후기"
            aside={
              <p className="text-sm tabular-nums text-stone-500">
                지점 후기 {REVIEW_TOTAL.toLocaleString()}건, 평균 {REVIEW_AVG}점
              </p>
            }
          />
        </div>
        {/* 모바일은 세로 스택, sm 이상은 가로 캐러셀 */}
        <div className="mt-8 sm:overflow-x-auto sm:pb-4 sm:[scrollbar-width:thin]">
          <div className="flex flex-col gap-3 px-4 sm:mx-auto sm:w-max sm:snap-x sm:flex-row sm:gap-4">
            {reviews.map((r) => (
              <blockquote key={r.text} className="w-full rounded-lg border border-stone-200 bg-white p-6 sm:w-80 sm:shrink-0 sm:snap-start">
                <Stars rating={r.rating} size={15} />
                <p className="mt-4 leading-relaxed">{r.text}</p>
                <footer className="mt-5 text-sm font-medium text-stone-500">{r.meta}</footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* 자주 묻는 질문 */}
      <section aria-labelledby="faq-title" className="bg-[#F4F4F4] py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-4">
          <SectionHead id="faq-title" title="자주 묻는 질문" />
          <div className="mt-8 divide-y divide-stone-200 border-y border-stone-200">
            {faqs.map((f) => (
              <details key={f.q} className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 font-semibold [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <ChevronDown size={18} className="shrink-0 text-stone-400 transition-transform group-open:rotate-180" aria-hidden />
                </summary>
                <p className="pb-5 text-sm leading-relaxed text-stone-600">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* 예약하기 */}
      <section id="visit" aria-labelledby="visit-title" className="relative overflow-hidden py-24 sm:py-32">
        <img src="/videos/gym-entrance-poster.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" aria-hidden />
        <div className="absolute inset-0 bg-black/65" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-4 text-center text-white">
          <h2 id="visit-title" className="text-3xl font-black tracking-tight sm:text-5xl">
            예약하기
          </h2>
          <p className="mt-3 text-stone-200">서울 {locations.length}개 지점, 매일 06:00 ~ 22:00</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => scrollTo("map")}
              className="rounded-lg bg-[#16A34A] px-7 py-3.5 font-bold transition-colors hover:bg-[#15803d]"
            >
              지금 예약하기
            </button>
            <a
              href="tel:02-000-0000"
              className="rounded-lg border border-white/40 bg-black/40 px-7 py-3.5 font-semibold transition-colors hover:border-[#4ade80] hover:text-[#4ade80]"
            >
              문의하기
            </a>
          </div>
        </div>
      </section>

      </div>

      {page !== "home" && (
        <GymSubPage page={page} go={go} goHome={goHome}>
          {page === "branches" && (
            <BranchPage
              branchId={branchId}
              setBranchId={setBranchId}
              onBook={(id) => {
                selectLocation(id);
                goHome("booking");
              }}
            />
          )}
          {page === "facility" && <FacilityPage />}
          {page === "pricing" && <PricingPage selectedId={booking.locationId} onBook={() => goHome(booking.locationId ? "booking" : "map")} />}
          {page === "info" && <InfoPage />}
        </GymSubPage>
      )}
      {/* 바닥글: 하단 공용 버튼과 겹치지 않게 아래 여백을 둔다 */}
      <footer className="bg-[#111] pb-24 pt-12 text-sm text-stone-400">
        <div className="mx-auto flex max-w-6xl flex-wrap items-start justify-between gap-6 px-4">
          <div>
            <p className="flex items-center gap-2 text-white">
              <span className="inline-flex items-baseline gap-1.5">
                <span className="font-black tracking-wider">프라이빗 짐</span>
              </span>
            </p>
            <DemoMakerInfo className="mt-3" />
          </div>
          <div className="flex flex-wrap items-center gap-5 text-xs">
            <a href="#top" className="hover:text-white">이용약관</a>
            <a href="#top" className="font-semibold text-stone-300 hover:text-white">개인정보처리방침</a>
          </div>
        </div>
      </footer>

      {/* 예약 가이드 오버레이: 해당 영역을 스포트라이트로 비추며 4단계 안내 */}
      <AnimatePresence>
        {tutStep !== null && tutRect && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50"
            onClick={closeTutorial}
            role="dialog"
            aria-label="예약 가이드"
          >
            <div
              className="pointer-events-none absolute rounded-2xl border-2 border-[#16A34A]"
              style={(() => {
                // 대상이 화면보다 크거나 가장자리에 붙어도 초록 테두리 4변이 항상 보이게 뷰포트 안쪽으로 클램프
                const inset = 6;
                const left = Math.max(tutRect.left - 8, inset);
                const top = Math.max(tutRect.top - 8, inset);
                const right = Math.min(tutRect.left + tutRect.width + 8, window.innerWidth - inset);
                const bottom = Math.min(tutRect.top + tutRect.height + 8, window.innerHeight - inset);
                return {
                  top,
                  left,
                  width: Math.max(right - left, 0),
                  height: Math.max(bottom - top, 0),
                  boxShadow: "0 0 0 9999px rgba(0,0,0,.55)",
                };
              })()}
              aria-hidden
            />
            <div
              className="absolute inset-x-0 bottom-6 mx-auto w-[min(92vw,400px)] rounded-2xl bg-white p-5 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <p className="font-bold">{tutorialSteps[tutStep].title}</p>
                <span className="font-mono text-xs text-stone-400">
                  {tutStep + 1} / {tutorialSteps.length}
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-stone-500">{tutorialSteps[tutStep].desc}</p>
              {/* 안내 영역이 충분히 보이지 않으면(살짝 걸친 경우 포함) 방향을 알려주고 눌러서 되돌아가게 한다 */}
              {(() => {
                const vh = window.innerHeight;
                const topBound = 0;
                const visible =
                  Math.min(tutRect.top + tutRect.height, vh) - Math.max(tutRect.top, topBound);
                const needed = Math.min(tutRect.height * 0.5, 200);
                const dir =
                  visible >= needed ? null : tutRect.top + tutRect.height / 2 < vh / 2 ? "up" : "down";
                return (
                  dir && (
                    <button
                      type="button"
                      onClick={() => openTutorial(tutStep)}
                      className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#16A34A]/10 py-2.5 text-sm font-semibold text-[#15803d] transition-colors hover:bg-[#16A34A]/20"
                    >
                      {dir === "up" ? <ArrowUp size={14} aria-hidden /> : <ArrowDown size={14} aria-hidden />}
                      안내 영역으로 이동
                    </button>
                  )
                );
              })()}
              <div className="mt-4 flex items-center justify-between">
                <button type="button" onClick={closeTutorial} className="text-sm text-stone-400 hover:text-stone-600">
                  건너뛰기
                </button>
                <div className="flex gap-2">
                  {tutStep > 0 && (
                    <button
                      type="button"
                      onClick={() => openTutorial(tutStep - 1)}
                      className="rounded-lg border border-stone-200 px-4 py-2 text-sm font-semibold"
                    >
                      이전
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => (tutStep < tutorialSteps.length - 1 ? openTutorial(tutStep + 1) : closeTutorial())}
                    className="rounded-lg bg-[#111] px-4 py-2 text-sm font-bold text-white"
                  >
                    {tutStep < tutorialSteps.length - 1 ? "다음" : "시작하기"}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------- 하위 화면 (짐 투어, 이용요금 및 예약, 이용안내, 지점 안내: 어반 프라이빗짐 GNB 기준) ---------- */

function GymSubPage({
  page,
  go,
  goHome,
  children,
}: {
  page: Exclude<GymPage, "home">;
  go: (p: GymPage) => void;
  goHome: (anchor?: string) => void;
  children: React.ReactNode;
}) {
  const label = GYM_PAGES.find((p) => p.id === page)?.label ?? "";
  const headRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    headRef.current?.focus({ preventScroll: true });
  }, [page]);

  return (
    <main className="pb-20 sm:pb-28">
      <div className="bg-[#111] text-white">
        <div className="mx-auto max-w-6xl px-4 pb-8 pt-6 sm:pb-12 sm:pt-10">
          <nav aria-label="현재 위치">
            <ol className="flex items-center gap-1.5 text-sm text-stone-400">
              <li>
                <button type="button" onClick={() => goHome("top")} className="hover:text-white">
                  홈
                </button>
              </li>
              <li aria-hidden>
                <ChevronRight size={13} />
              </li>
              <li aria-current="page" className="text-stone-200">
                {label}
              </li>
            </ol>
          </nav>
          <h1 ref={headRef} tabIndex={-1} className="mt-3 text-3xl font-black tracking-tight outline-none sm:text-5xl">
            {label}
          </h1>
        </div>
      </div>
      <div className="sticky top-0 z-30 border-b border-stone-200 bg-white">
        <ul className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 text-[15px]">
          {GYM_PAGES.map((p) => {
            const on = p.id === page;
            return (
              <li key={p.id} className="shrink-0">
                <button
                  type="button"
                  onClick={() => go(p.id)}
                  aria-current={on ? "page" : undefined}
                  className={`inline-flex h-12 items-center border-b-2 px-3 ${on ? "border-[#111] font-bold text-[#111]" : "border-transparent text-stone-500 hover:text-[#111]"}`}
                >
                  {p.label}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
      <div key={page} className="soft-in mx-auto max-w-6xl px-4 pt-10 sm:pt-14">{children}</div>
    </main>
  );
}

function BranchPage({
  branchId,
  setBranchId,
  onBook,
}: {
  branchId: string;
  setBranchId: (id: string) => void;
  onBook: (id: string) => void;
}) {
  const loc = locations.find((l) => l.id === branchId) ?? locations[0];
  const info = branchInfo[loc.id];
  const parking = loc.facilities.includes("주차") ? "건물 주차장 2시간 무료" : "건물 주차 불가, 인근 공영주차장 이용";

  return (
    <div className="grid gap-8 lg:grid-cols-[200px_1fr] lg:gap-12">
      <nav aria-label="지점 목록" className="min-w-0">
        <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:block lg:space-y-0 lg:overflow-visible lg:border-t lg:border-stone-200 lg:px-0 lg:pb-0">
          {locations.map((l) => {
            const on = l.id === loc.id;
            return (
              <li key={l.id} className="shrink-0 lg:border-b lg:border-stone-200">
                <button
                  type="button"
                  onClick={() => setBranchId(l.id)}
                  aria-current={on ? "true" : undefined}
                  className={`flex w-full items-center justify-between gap-3 rounded-lg border px-4 py-2.5 text-left text-[15px] lg:rounded-none lg:border-0 lg:px-1 lg:py-3.5 ${
                    on ? "border-[#111] bg-[#111] font-bold text-white lg:bg-transparent lg:text-[#111]" : "border-stone-200 text-stone-600 hover:text-[#111]"
                  }`}
                >
                  {l.name}
                  <ChevronRight size={15} className={`hidden lg:block ${on ? "text-[#111]" : "text-stone-300"}`} aria-hidden />
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div key={loc.id} className="soft-in min-w-0">
        <div className="grid gap-8 md:grid-cols-[1fr_1fr]">
          <img src={loc.img} alt={`${loc.name} 내부`} className="aspect-[4/3] w-full rounded-lg object-cover" />
          <div className="min-w-0">
            <h2 className="text-2xl font-black tracking-tight sm:text-3xl">{loc.name}</h2>
            <p className="mt-2 flex items-center gap-2 text-sm text-stone-500">
              <Stars rating={loc.rating} />
              {loc.rating} <span className="text-stone-400">후기 {loc.reviews}건</span>
            </p>
            <dl className="mt-5 divide-y divide-stone-200 border-y border-stone-200 text-sm">
              {[
                ["주소", info.addr],
                ["운영시간", "매일 06:00 ~ 22:00 (연중무휴)"],
                ["전화번호", "02-000-0000"],
                ["지하철", info.subway],
                ["주차", parking],
              ].map(([k, v]) => (
                <div key={k} className="grid grid-cols-[72px_1fr] gap-3 py-3">
                  <dt className="font-semibold">{k}</dt>
                  <dd className="min-w-0 text-stone-600">{v}</dd>
                </div>
              ))}
              <div className="grid grid-cols-[72px_1fr] gap-3 py-3">
                <dt className="font-semibold">편의시설</dt>
                <dd className="flex flex-wrap gap-x-4 gap-y-1.5 text-stone-600">
                  {loc.facilities.map((f) => {
                    const Icon = facilityIcons[f];
                    return (
                      <span key={f} className="inline-flex items-center gap-1.5">
                        <Icon size={15} strokeWidth={1.6} aria-hidden />
                        {f === "샤워" ? "샤워실" : f === "PT" ? "PT 동반" : f}
                      </span>
                    );
                  })}
                </dd>
              </div>
            </dl>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onBook(loc.id)}
                className="rounded-lg bg-[#111] px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-[#16A34A]"
              >
                {loc.name} 예약하기
              </button>
              {!loc.available && <span className="text-sm font-semibold text-stone-500">오늘 마감</span>}
            </div>
          </div>
        </div>

        <h3 className="mt-12 text-lg font-bold">{loc.name} 이용요금</h3>
        <table className="mt-3 w-full border-collapse text-sm">
          <caption className="sr-only">{loc.name} 시간대별 1시간 이용요금</caption>
          <tbody className="divide-y divide-stone-200 border-y border-stone-200">
            {RATE_BANDS.map((b) => (
              <tr key={b.id}>
                <th scope="row" className="py-3 text-left font-semibold">
                  {b.label}
                  <span className="ml-2 tabular-nums text-xs font-normal text-stone-500">{b.time}</span>
                </th>
                <td className="py-3 text-right tabular-nums font-semibold">{(loc.price + b.diff).toLocaleString()}원</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-2 text-xs text-stone-500">1시간 기준. 인원 추가 1인 시간당 {EXTRA_GUEST.toLocaleString()}원</p>
      </div>
    </div>
  );
}

function FacilityPage() {
  return (
    <div className="space-y-14">
      <div className="grid gap-8 lg:grid-cols-[3fr_2fr]">
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {gallery.map((g) => (
            <figure key={g.label} className="min-w-0 overflow-hidden rounded-lg bg-[#F4F4F4]">
              <img src={g.img} alt={`${g.label} 내부`} className="aspect-[4/3] w-full object-cover" />
              <figcaption className="px-3.5 py-2 text-sm font-semibold">{g.label}</figcaption>
            </figure>
          ))}
        </div>
        <div className="min-w-0">
          <h2 className="text-lg font-bold">공간 정보</h2>
          <dl className="mt-3 divide-y divide-stone-200 border-y border-stone-200 text-sm">
            {[
              ["공간 면적", "66㎡ (20평)"],
              ["이용 인원", "최소 1명 ~ 최대 2명"],
              ["운영시간", "매일 06:00 ~ 22:00"],
              ["예약 단위", "1시간 (최소 1시간부터)"],
            ].map(([k, v]) => (
              <div key={k} className="grid grid-cols-[72px_1fr] gap-3 py-3">
                <dt className="font-semibold">{k}</dt>
                <dd className="text-stone-600">{v}</dd>
              </div>
            ))}
          </dl>
          <h2 className="mt-8 text-lg font-bold">장비 목록</h2>
          <dl className="mt-3 divide-y divide-stone-200 border-y border-stone-200 text-sm">
            {equipment.map((e) => (
              <div key={e.zone} className="grid grid-cols-[72px_1fr] gap-3 py-3">
                <dt className="font-semibold">{e.zone}</dt>
                <dd className="text-stone-600">{e.items.join(", ")}</dd>
              </div>
            ))}
          </dl>
          <h2 className="mt-8 text-lg font-bold">편의시설</h2>
          <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2.5 text-sm text-stone-600">
            {amenities.map((a) => (
              <li key={a.label} className="flex items-center gap-1.5">
                <a.icon size={16} strokeWidth={1.6} className="text-stone-500" aria-hidden />
                {a.label}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-stone-500">지점마다 장비 구성이 조금씩 다릅니다.</p>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold">지점별 시설</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] border-collapse text-center text-sm">
            <caption className="sr-only">지점별 샤워실, 주차, 락커, PT 동반 가능 여부</caption>
            <thead>
              <tr className="border-b-2 border-[#111]">
                <th scope="col" className="py-2 text-left font-semibold text-stone-500">지점</th>
                {(["샤워", "주차", "락커", "PT"] as const).map((f) => (
                  <th key={f} scope="col" className="px-1 py-2 font-bold">
                    {f === "샤워" ? "샤워실" : f === "PT" ? "PT 동반" : f}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {locations.map((loc) => (
                <tr key={loc.id}>
                  <th scope="row" className="py-2 text-left font-semibold">{loc.name}</th>
                  {(["샤워", "주차", "락커", "PT"] as const).map((f) => {
                    const has = loc.facilities.includes(f);
                    return (
                      <td key={f} className={`px-1 py-2 ${has ? "text-[#15803d]" : "text-stone-400"}`}>
                        {has ? "가능" : "없음"}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-stone-500">운동복과 세면도구는 준비되어 있지 않습니다. 주차는 2시간 무료입니다.</p>
      </div>
    </div>
  );
}

function PricingPage({ selectedId, onBook }: { selectedId: string | null; onBook: () => void }) {
  return (
    <div className="space-y-14">
      <div>
        <p className="text-sm text-stone-600">사전 예약제로 시간당 요금을 기본으로 합니다.</p>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[340px] border-collapse text-left text-sm">
            <caption className="sr-only">지점별, 시간대별 1시간 이용요금</caption>
            <thead>
              <tr className="border-b-2 border-[#111]">
                <th scope="col" className="py-2.5 pr-2 font-semibold text-stone-500">지점</th>
                {RATE_BANDS.map((b) => (
                  <th key={b.id} scope="col" className="px-2 py-2.5 text-right font-bold">
                    {b.label}
                    <span className="block tabular-nums text-[11px] font-normal text-stone-500">{b.time}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {locations.map((loc) => (
                <tr key={loc.id} className={selectedId === loc.id ? "bg-[#16A34A]/10" : undefined}>
                  <th scope="row" className="py-2.5 pr-2 font-semibold">{loc.name}</th>
                  {RATE_BANDS.map((b) => (
                    <td key={b.id} className="px-2 py-2.5 text-right tabular-nums">
                      {(loc.price + b.diff).toLocaleString()}원
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ul className="mt-4 space-y-1 text-sm text-stone-600">
          <li>1시간 단위 예약, 최소 이용 1시간</li>
          <li>인원 추가 1인 시간당 {EXTRA_GUEST.toLocaleString()}원 (최대 2명)</li>
          <li>첫 예약은 1시간 무료 (회원 1인 1회)</li>
        </ul>
      </div>

      <div className="max-w-xl">
        <h2 className="text-lg font-bold">취소, 환불 규정</h2>
        <table className="mt-3 w-full border-collapse text-sm">
          <caption className="sr-only">취소 시점별 환불 비율</caption>
          <tbody className="divide-y divide-stone-200 border-y border-stone-200">
            {refundRows.map(([when, rate]) => (
              <tr key={when}>
                <th scope="row" className="py-2.5 text-left font-medium text-stone-600">{when}</th>
                <td className="py-2.5 text-right font-semibold">{rate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        type="button"
        onClick={onBook}
        className="rounded-lg bg-[#111] px-7 py-3.5 font-bold text-white transition-colors hover:bg-[#16A34A]"
      >
        예약하러 가기
      </button>
    </div>
  );
}

function InfoPage() {
  return (
    <div className="grid gap-12 lg:grid-cols-2 lg:gap-14">
      <div className="min-w-0 space-y-10">
        <section>
          <h2 className="text-lg font-bold">이용 방법</h2>
          <ol className="mt-3 space-y-3 text-sm leading-relaxed text-stone-700">
            {[
              ["예약, 결제", "지점, 날짜, 시간을 선택하고 결제합니다."],
              ["출입 안내", "출입 비밀번호는 이용 30분 전 예약자 휴대전화로 문자 발송합니다. 입장 QR로도 출입할 수 있습니다."],
              ["이용", "예약한 시간 동안 공간 전체를 단독으로 이용하실 수 있습니다."],
              ["퇴실", "다음 이용자를 위해 종료 10분 전부터 정리 부탁드립니다."],
            ].map(([k, v], i) => (
              <li key={k} className="grid grid-cols-[28px_72px_1fr] gap-2">
                <span className="tabular-nums font-bold text-stone-400">{i + 1}</span>
                <span className="font-semibold text-[#111]">{k}</span>
                <span className="min-w-0">{v}</span>
              </li>
            ))}
          </ol>
        </section>
        <section>
          <h2 className="text-lg font-bold">출입 안내</h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-stone-700">
            <li>예약 시간 10분 전부터 입장할 수 있습니다.</li>
            <li>와이파이 비밀번호는 운동 공간 내부에 게시되어 있습니다.</li>
          </ul>
        </section>
      </div>
      <div className="min-w-0 space-y-10">
        <section>
          <h2 className="text-lg font-bold">주의사항</h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-stone-700">
            <li>실내 전용 운동화를 신어 주시기 바랍니다.</li>
            <li>사용한 원판과 덤벨은 제자리에 정리해 주세요.</li>
            <li>바벨을 바닥에 던지는 등의 과도한 드랍은 자제 부탁 드립니다.</li>
            <li>음료를 제외한 음식물 섭취와 흡연은 금지입니다. 물은 뚜껑 있는 병만 가능합니다.</li>
            <li>보안을 위해 출입구와 공용 공간에 CCTV를 운영합니다. 운동 공간 안에는 없습니다.</li>
            <li>장비 파손 시 수리비를 청구할 수 있습니다.</li>
            <li>퇴실 시 조명과 냉난방기 전원을 꺼 주세요.</li>
          </ul>
        </section>
        <section>
          <h2 className="text-lg font-bold">비상시 대처</h2>
          <p className="mt-3 text-sm leading-relaxed text-stone-700">
            입구 옆 비상 호출 버튼을 누르거나 관리실(<a href="tel:02-000-0000" className="font-semibold underline underline-offset-2">02-000-0000</a>, 24시간)로 연락해 주시기 바랍니다.
            자동심장충격기(AED)는 각 지점 입구에 있습니다.
          </p>
        </section>
      </div>
    </div>
  );
}
