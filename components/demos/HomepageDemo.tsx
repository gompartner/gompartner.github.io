"use client";

import { useMemo, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDown,
  ArrowUp,
  Calendar,
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
  RotateCcw,
  ShieldCheck,
  ShowerHead,
  Speaker,
  Star,
  Thermometer,
  Wifi,
} from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

const STORAGE_KEY = "gs-demo:homepage:v4";

/* 네이버페이 JS SDK 연동 (개발모드 샌드박스).
   기본값은 네이버페이 개발자센터 샌드박스 키 — 운영 전환 시 NEXT_PUBLIC_NAVERPAY_*로 교체한다.
   SDK 로드에 실패하면 데모 결제 시트로 흐름만 시뮬레이션한다. */
const NAVERPAY_CLIENT_ID = process.env.NEXT_PUBLIC_NAVERPAY_CLIENT_ID ?? "HN3GGCMDdTgGUfl0kFCo";
const NAVERPAY_CHAIN_ID = process.env.NEXT_PUBLIC_NAVERPAY_CHAIN_ID ?? "T2F3eUptcXJ5eU5";
const NAVERPAY_SDK_URL = "https://nsp.pay.naver.com/sdk/js/naverpay.min.js";

interface NaverPayInstance {
  open: (params: Record<string, unknown>) => void;
}

declare global {
  interface Window {
    Naver?: { Pay: { create: (options: Record<string, unknown>) => NaverPayInstance } };
  }
}

let naverPaySdkPromise: Promise<void> | null = null;
function loadNaverPaySdk() {
  if (!naverPaySdkPromise) {
    naverPaySdkPromise = new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = NAVERPAY_SDK_URL;
      script.onload = () => resolve();
      script.onerror = () => {
        naverPaySdkPromise = null;
        reject(new Error("네이버페이 SDK 로드 실패"));
      };
      document.head.appendChild(script);
    });
  }
  return naverPaySdkPromise;
}

/* 지점 데이터: 항목만 추가하면 지도 마커, 카드, 요금표, 지점별 시설 표가 함께 생성된다.
   x, y는 서울 행정구역 지도(public/images/demo-gym/seoul-districts.svg) 기준 백분율 좌표.
   좌표는 구별 path의 getBBox 중심을 보정 후 viewBox(30 108 1332 1099) 기준 %로 환산한 값.
   price는 평일 저녁(기본) 시간당 요금이다. 주간·주말 요금은 slotPrice에서 계산한다. */
const locations = [
  { id: "gangnam", name: "강남점", x: 69.5, y: 73, price: 18000, rating: 4.9, reviews: 128, available: true, img: "/images/demo-gym/zone-weight.jpg", facilities: ["주차", "샤워", "락커", "PT"] },
  { id: "jamsil", name: "잠실점", x: 82, y: 70, price: 16000, rating: 4.8, reviews: 96, available: true, img: "/images/demo-gym/zone-cardio.jpg", facilities: ["주차", "샤워", "락커"] },
  { id: "seongsu", name: "성수점", x: 67, y: 55, price: 17000, rating: 4.9, reviews: 143, available: true, img: "/images/demo-gym/zone-recovery.jpg", facilities: ["샤워", "락커", "PT"] },
  { id: "hongdae", name: "홍대점", x: 37, y: 52, price: 15000, rating: 4.7, reviews: 87, available: true, img: "/images/demo-gym/zone-studio.jpg", facilities: ["락커"] },
  { id: "yeouido", name: "여의도점", x: 37, y: 63, price: 19000, rating: 4.8, reviews: 74, available: false, img: "/images/demo-gym/zone-weight.jpg", facilities: ["주차", "샤워", "락커", "PT"] },
  { id: "jongno", name: "종로점", x: 53, y: 40, price: 16000, rating: 4.6, reviews: 59, available: true, img: "/images/demo-gym/zone-cardio.jpg", facilities: ["락커"] },
  { id: "yongsan", name: "용산점", x: 51, y: 61, price: 18000, rating: 4.8, reviews: 102, available: true, img: "/images/demo-gym/zone-recovery.jpg", facilities: ["주차", "샤워", "락커", "PT"] },
  { id: "kondae", name: "건대점", x: 75, y: 58, price: 15000, rating: 4.7, reviews: 68, available: true, img: "/images/demo-gym/zone-studio.jpg", facilities: ["샤워", "락커"] },
  { id: "sinchon", name: "신촌점", x: 41, y: 46, price: 15000, rating: 4.6, reviews: 51, available: false, img: "/images/demo-gym/zone-weight.jpg", facilities: ["샤워", "락커", "PT"] },
  { id: "samsung", name: "삼성점", x: 73.5, y: 71, price: 20000, rating: 4.9, reviews: 156, available: true, img: "/images/demo-gym/zone-cardio.jpg", facilities: ["주차", "샤워", "락커", "PT"] },
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
  { id: "weekend", label: "주말·공휴일", time: "06:00 ~ 22:00", diff: 4000 },
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
  { rating: 5, text: "한 시간 동안 아무도 없이 혼자 쓰는 게 이렇게 쾌적할 줄 몰랐어요.", meta: "김ㅎ늘 · 강남점 오전" },
  { rating: 5, text: "통창으로 해 뜨는 거 보면서 러닝하는 맛에 새벽마다 갑니다.", meta: "이ㅈ호 · 성수점 새벽" },
  { rating: 4, text: "촬영 대관으로 썼는데 조명이 좋아서 보정할 게 없었습니다.", meta: "박* · 홍대점 대관" },
  { rating: 5, text: "PT 매칭까지 한 번에 예약되는 게 편해요. QR 입장도 빠르고요.", meta: "최ㅅ아 · 삼성점 PT" },
  { rating: 5, text: "예약한 시간엔 다른 팀이 들어올 수 없어서 운동에만 집중하게 됩니다.", meta: "정ㅁ준 · 잠실점 저녁" },
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

/** 요소가 뷰포트에 들어왔는지 한 번만 감지 */
function useInView<T extends HTMLElement>(threshold = 0.25) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, inView] as const;
}

/** 스크롤로 시야에 들어오면 부드럽게 나타나는 래퍼 */
function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`${className} transition-all duration-700 ease-out motion-reduce:transition-none ${
        shown ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      } motion-reduce:translate-y-0 motion-reduce:opacity-100`}
    >
      {children}
    </div>
  );
}

function SectionHead({ id, title, aside }: { id?: string; title: string; aside?: React.ReactNode }) {
  return (
    <Reveal className="flex flex-wrap items-end justify-between gap-4">
      <h2 id={id} className="text-2xl font-black tracking-tight sm:text-4xl">
        {title}
      </h2>
      {aside}
    </Reveal>
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
  method?: "naverpay" | "onsite";
}

interface BookingState {
  locationId: string | null;
  date: string | null;
  times: string[];
  guests: number;
  reservations?: Reservation[];
}

/** 결제 확정 시점에 부르는 예약 번호 생성기 */
const newReservationId = () => `R${Date.now()}`;

const emptyBooking: BookingState = { locationId: null, date: null, times: [], guests: 1, reservations: [] };

const tutorialSteps = [
  { target: "map", title: "1. 지점 선택", desc: "지도의 핀이나 지점 카드에서 가까운 지점을 고르세요. 핀에 마우스를 올리면 해당 카드가 강조됩니다." },
  { target: "booking-date", title: "2. 날짜 선택", desc: "앞으로 14일 중 원하는 날짜를 누르세요. 빨간 요일은 주말 요금이 적용됩니다." },
  { target: "booking-time", title: "3. 시간 선택", desc: "초록 테두리가 예약 가능한 시간이고, 칸 아래 금액이 그 시간 요금입니다. 여러 시간을 이어서 고를 수 있습니다." },
  { target: "booking-summary", title: "4. 예약 확인, 결제", desc: "총 금액을 확인하고 예약하기와 결제를 차례로 누르면 입장 QR이 바로 발급됩니다." },
];

export function HomepageDemo() {
  const [booking, setBooking, hydrated] = useLocalStorage<BookingState>(STORAGE_KEY, emptyBooking);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [introKey, setIntroKey] = useState(0);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [stage, setStage] = useState<"select" | "confirm" | "paid">("select");
  // 네이버페이 데모 결제 시트 (clientId 미설정 시 실제 결제창 대신 표시)
  const [demoPayOpen, setDemoPayOpen] = useState(false);
  // 내 예약 목록에서 클릭한 예약의 QR 보기
  const [viewingId, setViewingId] = useState<string | null>(null);
  // 핀 드롭 애니메이션은 지도가 스크롤로 보이는 순간 시작한다
  const [mapRef, mapInView] = useInView<HTMLDivElement>();
  // PC에서 카드 리스트 높이를 지도 높이에 맞추고, 핀 호버 시 해당 카드로 스크롤한다
  const listRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [mapHeight, setMapHeight] = useState(0);

  useEffect(() => {
    const el = mapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setMapHeight(entry.contentRect.height));
    ro.observe(el);
    return () => ro.disconnect();
  }, [mapRef]);

  // 첫 방문 예약 가이드 (스포트라이트 오버레이)
  const [tutStep, setTutStep] = useState<number | null>(null);
  const [tutRect, setTutRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const autoTutRef = useRef(false);

  const openTutorial = (n: number) => {
    const el = document.getElementById(tutorialSteps[n].target);
    if (!el) return;
    // 전역 scroll-behavior:smooth를 우회해 즉시 이동해야 측정 좌표가 정확하다
    el.scrollIntoView({ block: "center", behavior: "instant" as ScrollBehavior });
    setTutStep(n);
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

  // 지도가 처음 보이는 순간 가이드를 보여준다. 이미 예약 이력이나 진행 중인 선택이 있으면 건너뛴다.
  // 다음 프레임에 열어 effect 안에서 바로 상태를 바꾸지 않는다(취소되면 다음 실행에서 다시 연다).
  useEffect(() => {
    if (!hydrated || !mapInView || autoTutRef.current) return;
    const frame = requestAnimationFrame(() => {
      autoTutRef.current = true;
      // DemoDock 안내와 같은 키: 한 번 본 뒤에는 자동으로 띄우지 않는다(물음표 버튼으로 다시 열 수 있다)
      const seenKey = "demo-tour-seen:small-business-homepage";
      try {
        if (localStorage.getItem(seenKey)) return;
      } catch {
        return;
      }
      if (!booking.locationId && (booking.reservations ?? []).length === 0) {
        try {
          localStorage.setItem(seenKey, "1");
        } catch {}
        openTutorial(0);
      }
    });
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, mapInView]);

  const scrollToCard = (id: string) => {
    const list = listRef.current;
    const card = cardRefs.current[id];
    if (!list || !card) return;
    // 가로 슬라이더(모바일)를 먼저 판정 — 세로는 패딩 등으로 1~2px 오차가 생겨 오판할 수 있다
    if (list.scrollWidth > list.clientWidth + 1) {
      list.scrollTo({
        left: card.getBoundingClientRect().left - list.getBoundingClientRect().left + list.scrollLeft - 16,
        behavior: "smooth",
      });
    } else if (list.scrollHeight > list.clientHeight + 1) {
      // 데스크톱: 세로 내부 스크롤 리스트
      list.scrollTo({
        top: card.getBoundingClientRect().top - list.getBoundingClientRect().top + list.scrollTop - 8,
        behavior: "smooth",
      });
    }
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

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const v = videoRef.current;
      if (v) {
        v.autoplay = false;
        v.pause();
        v.currentTime = v.duration || 4;
      }
    }
  }, []);

  // 저장된 날짜가 과거면 초기화
  useEffect(() => {
    if (hydrated && booking.date && days.length && booking.date < days[0].iso) {
      setBooking((prev) => ({ ...prev, date: null, times: [] }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, days.length]);

  const replay = () => {
    window.scrollTo({ top: 0, behavior: "auto" });
    const v = videoRef.current;
    if (v) {
      v.currentTime = 0;
      v.play().catch(() => {});
    }
    setIntroKey((k) => k + 1);
  };

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

  // 결제 확정: 예약 목록에 저장하고 확정 화면으로 전환 (이벤트 리스너에서 최신 상태로 부르기 위해 ref 경유)
  const confirmPayment = (method: Reservation["method"] = "naverpay") => {
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
  const confirmPaymentRef = useRef(confirmPayment);
  useEffect(() => {
    confirmPaymentRef.current = confirmPayment;
  });

  // 네이버페이 returnUrl 복귀 처리: 팝업이면 결과를 부모창에 알리고 닫고, 본창이면 바로 반영
  useEffect(() => {
    if (!hydrated) return;
    const qs = new URLSearchParams(window.location.search);
    const resultCode = qs.get("resultCode");
    if (!resultCode) return;
    if (window.opener) {
      window.opener.postMessage({ type: "naverpay-result", resultCode }, window.location.origin);
      window.close();
    } else {
      if (resultCode === "Success") confirmPaymentRef.current();
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, [hydrated]);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      if (e.data?.type === "naverpay-result" && e.data.resultCode === "Success") {
        confirmPaymentRef.current();
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const startNaverPay = async () => {
    if (!selected) return;
    if (!NAVERPAY_CLIENT_ID) {
      // 가맹 키가 없는 데모 환경 — 결제 흐름만 시뮬레이션
      setDemoPayOpen(true);
      return;
    }
    try {
      await loadNaverPaySdk();
      // 공식 샘플과 동일한 파라미터 형식 (문자열 값)
      const pay = window.Naver!.Pay.create({
        mode: "development",
        clientId: NAVERPAY_CLIENT_ID,
        chainId: NAVERPAY_CHAIN_ID,
      });
      pay.open({
        merchantPayKey: `grizzly-${selected.id}-${Date.now()}`,
        productName: `${selected.name} 공간 대여 ${booking.times.length}시간`,
        productCount: String(booking.times.length),
        totalPayAmount: String(total),
        taxScopeAmount: String(total),
        taxExScopeAmount: "0",
        // 결제 팝업이 승인 후 이 주소로 돌아오면 아래 useEffect가 결과를 부모창에 넘기고 팝업을 닫는다
        returnUrl: window.location.origin + window.location.pathname,
      });
    } catch {
      setDemoPayOpen(true);
    }
  };

  const step = !booking.locationId ? 1 : !booking.date ? 2 : booking.times.length === 0 ? 3 : stage === "select" ? 4 : 5;
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="min-h-screen bg-white font-sans text-[#111]">
      <style>{`
        @keyframes gym-hero-in {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .gym-hero-in { animation: gym-hero-in 1.2s ease 2s both; }
        .gym-hero-title { text-wrap: balance; }
        @keyframes pin-drop {
          0% { transform: translate(-50%, -150%); opacity: 0; }
          60% { transform: translate(-50%, -40%); opacity: 1; }
          100% { transform: translate(-50%, -50%); opacity: 1; }
        }
        .pin-drop { animation: pin-drop .5s ease both; }
        @keyframes pin-pulse {
          from { transform: scale(1); opacity: .45; }
          to { transform: scale(2.6); opacity: 0; }
        }
        .pin-pulse { animation: pin-pulse 1.2s ease-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .gym-hero-in, .pin-drop, .pin-pulse { animation: none; }
        }
      `}</style>

      {/* 상단 메뉴: 히어로 위에서만 보이고, 스크롤 후에는 스티키 예약 바가 머리글 역할을 한다 */}
      <nav aria-label="주 메뉴" className="absolute inset-x-0 top-0 z-40 bg-gradient-to-b from-black/55 to-transparent">
        <div className="flex items-center justify-between gap-3 px-4 py-5 text-white sm:px-8">
          <a href="#top" className="shrink-0 text-lg font-black tracking-widest">
            GRIZZLY
          </a>
          <ul className="flex items-center gap-3.5 text-sm font-medium sm:gap-6">
            <li><a href="#map" className="transition-opacity hover:opacity-70">지점 안내</a></li>
            <li className="hidden md:block"><a href="#facility" className="transition-opacity hover:opacity-70">시설 안내</a></li>
            <li className="hidden md:block"><a href="#pricing" className="transition-opacity hover:opacity-70">이용요금</a></li>
            <li className="hidden md:block"><a href="#info" className="transition-opacity hover:opacity-70">이용안내</a></li>
            <li><a href="#booking" className="font-bold transition-opacity hover:opacity-70">예약하기</a></li>
            {(booking.reservations ?? []).length > 0 && (
              <li>
                <a href="#my-bookings" className="font-bold text-[#4ade80] transition-opacity hover:opacity-70">
                  내 예약 {(booking.reservations ?? []).length}
                </a>
              </li>
            )}
          </ul>
        </div>
      </nav>

      {/* 첫 화면: 매장 안으로 걸어 들어가는 영상 */}
      <header id="top" className="relative h-svh min-h-[600px] overflow-hidden bg-[#111]">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          preload="auto"
          poster="/videos/gym-entrance-poster.jpg"
          className="absolute inset-0 h-full w-full object-cover"
          aria-label="아침 햇살이 드는 프라이빗 짐 안으로 걸어 들어가는 영상"
        >
          <source src="/videos/gym-entrance.mp4" type="video/mp4" />
        </video>
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to top, rgba(18,14,9,.88) 0%, rgba(18,14,9,.35) 45%, rgba(18,14,9,.15) 100%)" }}
          aria-hidden
        />
        {/* pb-24: 화면 아래 양쪽 모서리의 사이트 공용 버튼과 겹치지 않게 띄운다 */}
        <div key={introKey} className="gym-hero-in absolute inset-x-0 bottom-0 px-4 pb-24 text-stone-100 sm:px-8">
          <p className="text-sm font-semibold text-stone-300">그리즐리 프라이빗 짐</p>
          <h1 className="gym-hero-title mt-2 max-w-4xl text-[11vw] font-black leading-[1.08] tracking-tight sm:text-7xl">
            1시간 단위 단독 이용
          </h1>
          <div className="mt-6 flex flex-wrap items-end justify-between gap-x-8 gap-y-5 border-t border-white/25 pt-5">
            <div className="max-w-xl text-[15px] leading-relaxed text-stone-200/90">
              <p>
                서울 {locations.length}개 지점을 매일 06:00 ~ 22:00 무인으로 운영합니다. 예약한 시간에는 한 팀만 들어옵니다.
              </p>
              <p className="mt-2 text-amber-200">10월 31일까지 첫 예약 1시간 무료 (1인 1회)</p>
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

      {/* 빠른 예약 바 + 진행 스테퍼 (Sticky) */}
      <div className="sticky top-0 z-30 border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-3">
          {/* 현재 선택 요약 — 실제 선택은 지도와 캘린더에서 한다 */}
          <div className="flex items-center gap-3">
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-5 gap-y-1 text-sm font-medium">
              <button
                type="button"
                onClick={() => scrollTo("map")}
                className={`flex items-center gap-1.5 transition-colors hover:text-[#15803d] ${selected ? "" : "text-stone-400"}`}
              >
                <MapPin size={15} className="shrink-0 text-stone-400" aria-hidden />
                {selected ? selected.name : "지점 선택"}
              </button>
              <button
                type="button"
                onClick={() => scrollTo("booking")}
                className={`flex items-center gap-1.5 transition-colors hover:text-[#15803d] ${booking.date ? "" : "text-stone-400"}`}
              >
                <Calendar size={15} className="shrink-0 text-stone-400" aria-hidden />
                {booking.date ? `${booking.date.slice(5).replace("-", ".")}` : "날짜"}
              </button>
              <button
                type="button"
                onClick={() => scrollTo("booking")}
                className={`flex items-center gap-1.5 transition-colors hover:text-[#15803d] ${booking.times.length ? "" : "text-stone-400"}`}
              >
                <Clock size={15} className="shrink-0 text-stone-400" aria-hidden />
                {booking.times.length
                  ? `${booking.times[0]}${booking.times.length > 1 ? ` 외 ${booking.times.length - 1}` : ""}`
                  : "시간"}
              </button>
            </div>
            <button
              type="button"
              onClick={() => scrollTo(booking.locationId ? "booking" : "map")}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[#111] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-stone-800 active:scale-95"
            >
              예약하기
            </button>
            <button
              type="button"
              onClick={() => openTutorial(0)}
              aria-label="예약 가이드 보기"
              className="shrink-0 rounded-lg border border-stone-200 p-2.5 text-stone-400 transition-colors hover:border-[#111] hover:text-[#111]"
            >
              <HelpCircle size={16} aria-hidden />
            </button>
          </div>
          {/* 예약 진행 스테퍼 */}
          <ol aria-label="예약 진행 단계" className="mt-2.5 flex items-center gap-1 overflow-x-auto text-[11px] font-medium text-stone-400 sm:gap-2 sm:text-xs">
            {["지점 선택", "날짜", "시간", "예약 확인", "결제"].map((label, i) => {
              const n = i + 1;
              const done = stage === "paid" || n < step;
              const current = stage !== "paid" && n === step;
              return (
                <li key={label} className="flex shrink-0 items-center gap-1 sm:gap-2">
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                      done ? "bg-[#16A34A] text-white" : current ? "bg-[#111] text-white" : "bg-stone-200 text-stone-500"
                    }`}
                  >
                    {done ? <Check size={11} aria-hidden /> : n}
                  </span>
                  <span className={current ? "text-[#111]" : done ? "text-[#16A34A]" : ""}>{label}</span>
                  {n < 5 && <ChevronRight size={12} className="text-stone-300" aria-hidden />}
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      {/* 지점 안내: 지도와 지점 카드 */}
      <section id="map" aria-labelledby="map-title" className="scroll-mt-28 bg-[#F4F4F4] py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <SectionHead id="map-title" title="지점 안내" />
          {/* 모바일은 지도-카드 사이 간격을 더 넉넉하게 */}
          <div
            className="mt-8 grid gap-10 lg:gap-6 lg:grid-cols-[2fr_3fr]"
            style={{ "--map-h": mapHeight ? `${mapHeight}px` : "600px" } as React.CSSProperties}
          >
            {/* 좌측: 서울 행정구역 지도 + 핀 오버레이 */}
            <Reveal className="relative lg:sticky lg:top-36 lg:self-start">
              <div ref={mapRef} className="relative">
                <div className="overflow-hidden rounded-lg border border-stone-200 bg-[#FBFAF8]">
                <div
                  className="relative transition-transform duration-700 ease-out motion-reduce:transition-none"
                  style={
                    selected
                      ? { transform: "scale(1.12)", transformOrigin: `${selected.x}% ${selected.y}%` }
                      : undefined
                  }
                >
                  <img
                    src="/images/demo-gym/seoul-districts.svg"
                    alt="서울 행정구역 지도"
                    className="block w-full select-none"
                    draggable={false}
                  />
                  {locations.map((loc, i) => {
                    const active = booking.locationId === loc.id;
                    const hovered = hoverId === loc.id;
                    return (
                      <button
                        key={loc.id}
                        type="button"
                        className={`absolute -translate-x-1/2 -translate-y-1/2 ${mapInView ? "pin-drop" : "opacity-0"}`}
                        style={{ left: `${loc.x}%`, top: `${loc.y}%`, animationDelay: `${i * 70}ms` }}
                        onClick={() => {
                          selectLocation(loc.id);
                          scrollToCard(loc.id);
                        }}
                        onMouseEnter={() => {
                          setHoverId(loc.id);
                          scrollToCard(loc.id);
                        }}
                        onMouseLeave={() => setHoverId(null)}
                        aria-label={`${loc.name} 선택`}
                      >
                        <span className="relative flex h-7 w-7 items-center justify-center">
                          {(hovered || active) && (
                            <span
                              className={`pin-pulse absolute inset-0 rounded-full ${active ? "bg-[#16A34A]" : "bg-[#111]"}`}
                              aria-hidden
                            />
                          )}
                          <span
                            className={`relative block rounded-full border-2 border-white shadow transition-all ${
                              active ? "h-5 w-5 bg-[#16A34A]" : hovered ? "h-5 w-5 bg-[#111]" : "h-4 w-4 bg-stone-700"
                            }`}
                            aria-hidden
                          />
                        </span>
                        {/* 작은 화면에서는 라벨끼리 겹쳐서 핀만 보여준다 */}
                        <span
                          className={`absolute left-1/2 top-full hidden -translate-x-1/2 whitespace-nowrap text-xs font-bold tracking-tight sm:block ${
                            active ? "text-[#15803d]" : "text-stone-600"
                          }`}
                          aria-hidden
                        >
                          {loc.name.replace("점", "")}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <p className="pointer-events-none absolute bottom-3 left-4 text-xs font-semibold text-stone-400">
                  서울 {locations.length}개 지점
                </p>
                </div>
              </div>
            </Reveal>

            {/* 우측: 지점 카드 리스트 — 모바일은 가로 슬라이더, 데스크톱은 지도 높이에 맞춘 내부 스크롤 */}
            <div
              ref={listRef}
              className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 lg:grid lg:max-h-[var(--map-h)] lg:grid-cols-2 lg:content-start lg:gap-5 lg:overflow-y-auto lg:overflow-x-hidden lg:pb-0 lg:pr-3 lg:[scrollbar-width:thin]"
            >
              {locations.map((loc) => {
                const active = booking.locationId === loc.id;
                const highlight = hoverId === loc.id || active;
                return (
                  <Reveal key={loc.id} className="w-72 shrink-0 snap-start lg:w-auto lg:shrink">
                    <div
                      ref={(el) => {
                        cardRefs.current[loc.id] = el;
                      }}
                      onMouseEnter={() => setHoverId(loc.id)}
                      onMouseLeave={() => setHoverId(null)}
                      className={`overflow-hidden rounded-lg border bg-white transition-colors duration-200 hover:border-stone-500 ${
                        highlight ? "border-[#111]" : "border-stone-200"
                      }`}
                    >
                      <div className="relative overflow-hidden">
                        <img
                          src={loc.img}
                          alt={`${loc.name} 내부`}
                          className="aspect-[16/10] w-full object-cover"
                        />
                        {active && (
                          <span className="absolute left-0 top-0 bg-[#16A34A] px-3 py-1.5 text-xs font-bold text-white">
                            선택됨
                          </span>
                        )}
                        {!loc.available && (
                          <span className="absolute left-0 top-0 bg-[#111]/80 px-3 py-1.5 text-xs font-bold text-white">
                            오늘 마감
                          </span>
                        )}
                      </div>
                      <div className="p-5">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-lg font-bold">{loc.name}</p>
                          <p className="flex shrink-0 items-center gap-1 text-sm text-stone-500">
                            <Star size={14} className="fill-[#111] text-[#111]" aria-hidden />
                            {loc.rating} <span className="text-stone-400">({loc.reviews})</span>
                          </p>
                        </div>
                        <p className="mt-1 tabular-nums text-lg font-bold">
                          {(loc.price + RATE_BANDS[0].diff).toLocaleString()}원
                          <span className="text-sm font-normal text-stone-400"> 부터 / 1시간</span>
                        </p>
                        <div className="mt-4 flex items-center gap-3 text-stone-500">
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
                            className={`ml-auto rounded-lg px-5 py-2.5 text-sm font-bold transition-colors ${
                              loc.available
                                ? "bg-[#111] text-white hover:bg-[#16A34A]"
                                : "bg-stone-100 text-stone-400"
                            }`}
                          >
                            {loc.available ? "예약하기" : "마감"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 예약: 날짜, 시간, 결제 */}
      <section id="booking" aria-labelledby="booking-title" className="scroll-mt-28 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <SectionHead
            id="booking-title"
            title={selected ? `${selected.name} 예약` : "예약"}
            aside={
              !selected && (
                <button
                  type="button"
                  onClick={() => scrollTo("map")}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#111] px-5 py-2.5 text-sm font-bold text-white hover:bg-stone-800"
                >
                  <MapPin size={15} aria-hidden />
                  지점 선택
                </button>
              )
            }
          />
          <div className="mt-8 grid gap-8 lg:grid-cols-[3fr_2fr]">
            <Reveal>
              {/* 선택한 지점 미리보기 — 무엇을 예약 중인지 항상 보이게 */}
              {selected && (
                <div className="mb-6 flex items-center gap-4 rounded-lg border border-stone-200 bg-stone-50 p-3">
                  <img src={selected.img} alt={`${selected.name} 내부`} className="h-16 w-16 shrink-0 rounded-xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold">{selected.name}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-stone-500">
                      <Star size={11} className="fill-[#111] text-[#111]" aria-hidden />
                      {selected.rating} ({selected.reviews}) · {selected.facilities.join(" · ")}
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
            </Reveal>

            {/* 예약 요약 */}
            {/* 좌측 컬럼 높이를 꽉 채워 아래 여백이 생기지 않게 한다 */}
            <Reveal className="lg:h-full">
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
                        {viewing.date.slice(5).replace("-", ".")} · {viewing.times.join(", ")}
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
                      {selected?.name} · {booking.date?.slice(5).replace("-", ".")} · {booking.times.join(", ")}
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
                          {booking.times.length}시간 동안 공간 전체를 단독 사용합니다.
                          결제 후 입장 QR이 바로 발급됩니다.
                        </p>
                        <button
                          type="button"
                          onClick={startNaverPay}
                          className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-[#03C75A] py-3.5 font-bold text-white transition-colors hover:bg-[#02b152] active:scale-[0.98]"
                        >
                          <span className="flex h-5 w-5 items-center justify-center rounded bg-white font-black leading-none text-[#03C75A]">
                            N
                          </span>
                          네이버페이로 {total.toLocaleString()}원 결제
                        </button>
                        <button
                          type="button"
                          onClick={() => confirmPayment("onsite")}
                          className="mt-2 w-full rounded-lg border border-stone-300 py-3.5 font-bold text-stone-700 transition-colors hover:border-[#111] hover:text-[#111] active:scale-[0.98]"
                        >
                          방문 시 결제
                        </button>
                        <button type="button" onClick={() => setStage("select")} className="mt-2 w-full py-2 text-xs text-stone-400 hover:text-stone-600">
                          돌아가기
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={step < 4}
                        onClick={() => setStage("confirm")}
                        className="mt-5 w-full rounded-lg bg-[#111] py-3.5 font-bold text-white transition-colors hover:bg-stone-800 active:scale-[0.98] disabled:bg-stone-200 disabled:text-stone-400"
                      >
                        예약하기
                      </button>
                    )}
                  </>
                ))}
              </div>

            </Reveal>
          </div>

          {/* 내 예약 — 예약이 몇 건이든 한 줄 가로 스트립으로 넉넉하게 */}
          {(booking.reservations ?? []).length > 0 && (
            <div id="my-bookings" className="mt-14 scroll-mt-40">
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
                            {r.date.slice(5).replace("-", ".")} · {r.times.join(", ")}
                          </span>
                        </span>
                      </button>
                      <div className="mt-3 flex items-center justify-between border-t border-stone-100 pt-3">
                        <p className="tabular-nums text-sm font-semibold">
                          {r.total.toLocaleString()}원
                          {r.method === "onsite" && <span className="ml-1.5 text-xs font-medium text-amber-600">방문 시 결제</span>}
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

      {/* 시설 안내: 공간 사진과 장비 규격 */}
      <section id="facility" aria-labelledby="facility-title" className="scroll-mt-28 bg-[#F4F4F4] py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <SectionHead id="facility-title" title="시설 안내" />
          <div className="mt-8 grid gap-8 lg:grid-cols-[3fr_2fr]">
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {gallery.map((g) => (
                <Reveal key={g.label}>
                  <figure className="overflow-hidden rounded-lg bg-white">
                    <img src={g.img} alt={`${g.label} 내부`} className="aspect-[4/3] w-full object-cover" />
                    <figcaption className="px-3.5 py-2 text-sm font-semibold">{g.label}</figcaption>
                  </figure>
                </Reveal>
              ))}
            </div>
            <Reveal>
              <h3 className="text-lg font-bold">장비 목록</h3>
              <dl className="mt-3 divide-y divide-stone-200 border-y border-stone-200 text-sm">
                {equipment.map((e) => (
                  <div key={e.zone} className="grid grid-cols-[72px_1fr] gap-3 py-3">
                    <dt className="font-semibold">{e.zone}</dt>
                    <dd className="text-stone-600">{e.items.join(", ")}</dd>
                  </div>
                ))}
              </dl>
              <h3 className="mt-7 text-lg font-bold">편의시설</h3>
              <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2.5 text-sm text-stone-600">
                {amenities.map((a) => (
                  <li key={a.label} className="flex items-center gap-1.5">
                    <a.icon size={16} strokeWidth={1.6} className="text-stone-500" aria-hidden />
                    {a.label}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs text-stone-500">공간 면적 66㎡(20평) 기준. 지점마다 장비 구성이 조금씩 다릅니다.</p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 이용요금: 지점 x 시간대 요금표 */}
      <section id="pricing" aria-labelledby="pricing-title" className="scroll-mt-28 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <SectionHead id="pricing-title" title="이용요금" />
          <Reveal className="mt-8 overflow-x-auto">
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
                  <tr key={loc.id} className={booking.locationId === loc.id ? "bg-[#16A34A]/10" : undefined}>
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
          </Reveal>
          <ul className="mt-4 space-y-1 text-sm text-stone-600">
            <li>1시간 단위 예약, 최소 이용 1시간</li>
            <li>인원 추가 1인 시간당 {EXTRA_GUEST.toLocaleString()}원 (최대 2명)</li>
            <li>첫 예약은 1시간 무료 (회원 1인 1회)</li>
          </ul>
        </div>
      </section>

      {/* 이용안내: 출입 방법, 지점별 시설, 주의사항, 환불규정 */}
      <section id="info" aria-labelledby="info-title" className="scroll-mt-28 bg-[#F4F4F4] py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <SectionHead id="info-title" title="이용안내" />
          <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-14">
            <div className="space-y-9">
              <Reveal>
                <h3 className="text-lg font-bold">이용 방법</h3>
                <ol className="mt-3 space-y-3 text-sm leading-relaxed text-stone-700">
                  {[
                    ["예약·결제", "지점, 날짜, 시간을 선택하고 결제합니다."],
                    ["출입 안내", "출입 비밀번호는 이용 30분 전 예약자 휴대전화로 문자 발송합니다. 입장 QR로도 출입할 수 있습니다."],
                    ["이용", "예약한 시간 동안 공간 전체를 한 팀만 이용합니다."],
                    ["퇴실", "종료 10분 전 정리를 시작해 주시기 바랍니다. 다음 예약이 이어질 수 있습니다."],
                  ].map(([k, v], i) => (
                    <li key={k} className="grid grid-cols-[28px_72px_1fr] gap-2">
                      <span className="tabular-nums font-bold text-stone-400">{i + 1}</span>
                      <span className="font-semibold text-[#111]">{k}</span>
                      <span>{v}</span>
                    </li>
                  ))}
                </ol>
              </Reveal>
              <Reveal>
                <h3 className="text-lg font-bold">주의사항</h3>
                <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-stone-700">
                  <li>실내 전용 운동화를 신어 주시기 바랍니다.</li>
                  <li>원판과 덤벨은 사용 후 제자리에 정리해 주시기 바랍니다.</li>
                  <li>음식물 반입과 흡연은 금지입니다. 물은 뚜껑 있는 병만 가능합니다.</li>
                  <li>보안을 위해 출입구와 공용 공간에 CCTV를 운영합니다. 운동 공간 안에는 없습니다.</li>
                  <li>장비 파손 시 수리비를 청구할 수 있습니다.</li>
                </ul>
              </Reveal>
              <Reveal>
                <h3 className="text-lg font-bold">비상시 대처</h3>
                <p className="mt-3 text-sm leading-relaxed text-stone-700">
                  입구 옆 비상 호출 버튼을 누르거나 관리실(<a href="tel:02-000-0000" className="font-semibold underline underline-offset-2">02-000-0000</a>, 24시간)로 연락해 주시기 바랍니다.
                  자동심장충격기(AED)는 각 지점 입구에 있습니다.
                </p>
              </Reveal>
            </div>
            <div className="space-y-9">
              <Reveal>
                <h3 className="text-lg font-bold">지점별 시설</h3>
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
              </Reveal>
              <Reveal>
                <h3 className="text-lg font-bold">취소·환불 규정</h3>
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
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* 이용 후기 */}
      <section id="reviews" aria-labelledby="reviews-title" className="scroll-mt-28 py-16 sm:py-24">
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
        <Reveal className="relative mx-auto max-w-6xl px-4 text-center text-white">
          <h2 id="visit-title" className="text-3xl font-black tracking-tight sm:text-5xl">
            예약하기
          </h2>
          <p className="mt-3 text-stone-200">서울 {locations.length}개 지점 · 매일 06:00 ~ 22:00</p>
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
        </Reveal>
      </section>

      {/* 바닥글: 하단 공용 버튼과 겹치지 않게 아래 여백을 둔다 */}
      <footer className="bg-[#111] pb-24 pt-12 text-sm text-stone-400">
        <div className="mx-auto flex max-w-6xl flex-wrap items-start justify-between gap-6 px-4">
          <div>
            <p className="font-black tracking-widest text-white">GRIZZLY</p>
            <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
              <dt>상호</dt>
              <dd className="text-stone-300">그리즐리 프라이빗 짐</dd>
              <dt>대표자</dt>
              <dd className="text-stone-300">김ㅎ준</dd>
              <dt>사업자등록번호</dt>
              <dd className="text-stone-300">000-00-00000</dd>
              <dt>고객센터</dt>
              <dd className="text-stone-300">02-000-0000 (24시간)</dd>
            </dl>
          </div>
          <div className="flex flex-wrap items-center gap-5 text-xs">
            <a href="#top" className="hover:text-white">이용약관</a>
            <a href="#top" className="font-semibold text-stone-300 hover:text-white">개인정보처리방침</a>
            <button
              type="button"
              onClick={replay}
              className="inline-flex items-center gap-1.5 rounded-md border border-stone-700 px-3.5 py-2 font-medium text-stone-300 transition-colors hover:border-[#4ade80] hover:text-[#4ade80]"
            >
              <RotateCcw size={13} aria-hidden />
              입장 영상 다시 보기
            </button>
          </div>
        </div>
      </footer>

      {/* 네이버페이 데모 결제 시트 — 가맹 키가 없어 실제 결제창 대신 승인 흐름을 시뮬레이션 */}
      <AnimatePresence>
        {demoPayOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 p-4 sm:items-center"
            onClick={() => setDemoPayOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label="네이버페이 테스트 결제"
          >
            <motion.div
              initial={{ y: 24 }}
              animate={{ y: 0 }}
              exit={{ y: 24 }}
              className="w-full max-w-sm rounded-lg bg-white p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded bg-[#03C75A] font-black leading-none text-white">
                  N
                </span>
                <p className="font-bold">네이버페이 결제</p>
                <span className="ml-auto rounded-md bg-stone-100 px-2.5 py-1 text-[11px] font-semibold text-stone-500">
                  테스트
                </span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-stone-500">
                테스트 결제입니다. 실제 결제는 이루어지지 않습니다.
              </p>
              <dl className="mt-4 space-y-2 rounded-xl bg-stone-50 p-4 text-sm">
                <div className="flex justify-between">
                  <dt className="text-stone-500">주문</dt>
                  <dd className="font-semibold">{selected?.name} 공간 대여 {booking.times.length}시간</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-stone-500">결제 금액</dt>
                  <dd className="tabular-nums font-bold">{total.toLocaleString()}원</dd>
                </div>
              </dl>
              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  onClick={() => setDemoPayOpen(false)}
                  className="flex-1 rounded-lg border border-stone-200 py-3 text-sm font-semibold text-stone-500"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDemoPayOpen(false);
                    confirmPayment();
                  }}
                  className="flex-1 rounded-lg bg-[#03C75A] py-3 text-sm font-bold text-white transition-colors hover:bg-[#02b152]"
                >
                  결제 승인
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
              className="pointer-events-none absolute rounded-2xl border-2 border-[#16A34A] transition-all duration-300"
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
                const topBound = 100; // 상단 고정 바에 가려지는 영역
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
