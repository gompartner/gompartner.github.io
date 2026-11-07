"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { Building2, Car, Check, Clock, Coffee, Mail, Minus, Plus, Printer, TrainFront, Users, Wifi } from "lucide-react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { daysAgo, fmtKo, useDemoToday } from "@/hooks/useDemoToday";
import { maskName, maskPhone } from "@/components/demos/LeadReceivedPanel";
import { DemoMakerInfo } from "@/components/demos/DemoMakerInfo";

/* 공유오피스 지점 홈페이지 샘플: 가상의 곰파트너 공유오피스 한 지점. 상호, 주소, 이름은 모두 가상이다.

   국내 공유오피스 지점 페이지(건국공간, 스테이지나인, 스파크플러스 지점 소개)의 공통 구성을 따른다.
   메뉴는 공간 소개, 멤버십 요금, 회의실, 입주 혜택, 투어 신청, 오시는 길. 첫 화면에 지점 사진과 투어 신청 버튼.
   요금은 자유석, 지정석, 1인실, 4인실처럼 좌석 유형별 월 요금(부가세 별도) 표와 계약 기간 할인 표.
   회의실은 수용 인원과 설비 표, 멤버 무료 크레딧 시간. 혜택은 사업자등록 주소 제공, 24시간 출입, 우편물 수령,
   커피 무제한, 복합기, 주차가 관용 항목. 오시는 길은 역 출구와 도보 시간, 주차, 운영시간.

   상호작용(모두 브라우저 안에서만 돈다. 실제로 보내지 않는다)
   1. 투어 신청: 날짜(오늘부터 7일, 평일만), 시간, 관심 좌석, 이름, 휴대폰, 인원. 접수 완료 화면에 접수번호, 담당 창구, 회신 예정일.
   2. 오시는 길 운영시간 표에서 오늘 요일 진하게.

   첫 화면(cw-poster)은 라운지 사진 한 장을 고정으로 두고 아래에 지점 이름과 버튼 두 개를 둔다.

   사진 출처: Pexels 사진 36356065 */

const BRAND = "공유오피스";
const BRANCH = "ㅇㅇ역점";
const ADDRESS = "서울 ㅇㅇ구 ㅇㅇ로 00, ㅇㅇ빌딩 5층";
const KAKAO = "카카오톡 채널 공유오피스";

/** 모션 공통 곡선 */
const EASE = [0.22, 1, 0.36, 1] as const;

/* 색: 바탕은 흰색과 옅은 회색, 강조색은 짙은 청록 하나만 버튼과 선택 칩에 쓴다. */
const C = {
  ink: "#111111",
  accent: "#2c4f58",
  inkSoft: "#eaeff0",
  text: "#4b4b4b",
  muted: "#767676",
  line: "#e5e5e5",
  edge: "#d0d0d0",
  paper: "#f7f7f5",
  error: "#b42318",
};

const focusRing = "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2";
const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;
const p2 = (n: number) => String(n).padStart(2, "0");

/* ---------- 좌석 데이터 ---------- */

type SeatType = "자유석" | "지정석" | "1인실" | "4인실";
const TYPES: SeatType[] = ["자유석", "지정석", "1인실", "4인실"];

/** 좌석 유형별 안내. 월 요금은 부가세 별도, 서울 공유오피스 시세 기준 */
const SEATS: Record<SeatType, { price: number; unit: string; count: string; note: string; include: string }> = {
  자유석: { price: 250000, unit: "1인 월", count: "16석", note: "라운지와 공용 테이블 어디든, 짐은 개인 사물함에", include: "개인 사물함, 회의실 월 10시간" },
  지정석: { price: 350000, unit: "1인 월", count: "12석", note: "내 자리 고정, 모니터와 서랍 포함", include: "24시간 출입, 회의실 월 10시간" },
  "1인실": { price: 600000, unit: "1실 월", count: "6실", note: "문 닫히는 1인 공간", include: "사업자등록 주소, 24시간 출입" },
  "4인실": { price: 1600000, unit: "1실 월, 4명까지", count: "4실", note: "4명까지 같은 요금", include: "사업자등록 주소, 24시간 출입, 회의실 월 20시간" },
};

const TERMS = [
  { months: 1, off: 0 },
  { months: 3, off: 0.05 },
  { months: 6, off: 0.1 },
  { months: 12, off: 0.15 },
] as const;

const OPTIONS = [
  { label: "사업자등록 주소 제공", price: 33000, note: "1인실, 4인실 포함" },
  { label: "24시간 출입", price: 22000, note: "지정석 이상 포함" },
  { label: "우편물 수령", price: 11000, note: "데스크 보관 후 카카오톡 알림" },
] as const;

/* ---------- 회의실 ---------- */

const ROOMS = [
  { name: "회의실 A", cap: "6인", gear: "65인치 TV, 화이트보드" },
  { name: "회의실 B", cap: "10인", gear: "화상회의 카메라와 스피커, 화이트보드" },
] as const;

/* ---------- 투어 ---------- */

const TOUR_TIMES = ["10:00", "11:00", "14:00", "15:00", "16:00", "17:00"];
const DOW = ["일", "월", "화", "수", "목", "금", "토"];
const isWeekday = (d: Date) => d.getDay() >= 1 && d.getDay() <= 5;
function nextBusinessDay(from: Date) {
  let d = daysAgo(from, -1);
  while (!isWeekday(d)) d = daysAgo(d, -1);
  return d;
}

/* ---------- 메인 ---------- */

export function CoworkingDemo() {
  const today = useDemoToday();
  const reduce = useReducedMotionSafe();

  useEffect(() => {
    const f = () => window.scrollTo({ top: 0 });
    window.addEventListener("demo:go-home", f);
    return () => window.removeEventListener("demo:go-home", f);
  }, []);

  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });

  return (
    <div className="min-h-screen overflow-x-clip bg-white" style={{ color: C.text }}>
      <Poster reduce={reduce} go={go} />

      {/* 공간 소개: 좌석 유형 */}
      <section id="cw-plan" aria-labelledby="cw-title" className="mx-auto max-w-[1200px] scroll-mt-16 px-4 pt-4 md:px-6 md:pt-8">
        <SectionTitle id="cw-title">공간 소개</SectionTitle>
        <p className="mt-4 max-w-[720px] text-[16px] leading-[1.7]">
          {BRAND} {BRANCH}은 ㅇㅇ빌딩 5층 한 층 전체를 씁니다. 라운지 자유석과 지정석, 문이 닫히는 1인실과 4인실, 회의실 2곳이 있고 평일 09:00~21:00에 매니저가 상주합니다.
        </p>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {TYPES.map((t) => (
            <li key={t} className="flex min-w-0 flex-col rounded-[6px] border p-4" style={{ borderColor: C.line }}>
              <p className="flex items-baseline justify-between gap-2">
                <span className="text-[18px] font-bold" style={{ color: C.ink }}>
                  {t}
                </span>
                <span className="text-[14px]" style={{ color: C.muted }}>
                  {SEATS[t].count}
                </span>
              </p>
              <p className="mt-1.5 text-[15px] leading-[1.6]">{SEATS[t].note}</p>
              <p className="mt-auto pt-3 text-[17px] font-bold tabular-nums" style={{ color: C.ink }}>
                월 {won(SEATS[t].price)}부터
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* 멤버십 요금 */}
      <section id="cw-price" aria-labelledby="cw-price-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-16 px-4 md:mt-24 md:px-6">
        <SectionTitle id="cw-price-title">멤버십 요금</SectionTitle>
        <PriceTable onTour={() => go("cw-tour")} />
      </section>

      {/* 회의실 */}
      <section id="cw-rooms" aria-labelledby="cw-rooms-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-16 px-4 md:mt-24 md:px-6">
        <SectionTitle id="cw-rooms-title">회의실</SectionTitle>
        <RoomInfo />
      </section>

      {/* 입주 혜택 */}
      <section id="cw-perks" aria-labelledby="cw-perks-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-16 px-4 md:mt-24 md:px-6">
        <SectionTitle id="cw-perks-title">입주 혜택</SectionTitle>
        <Perks />
      </section>

      {/* 투어 신청 */}
      <section id="cw-tour" aria-labelledby="cw-tour-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-16 px-4 md:mt-24 md:px-6">
        <SectionTitle id="cw-tour-title">투어 신청</SectionTitle>
        <TourForm today={today} reduce={reduce} />
      </section>

      {/* 오시는 길 */}
      <section id="cw-map" aria-labelledby="cw-map-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-16 px-4 md:mt-24 md:px-6">
        <SectionTitle id="cw-map-title">오시는 길</SectionTitle>
        <Directions today={today} />
      </section>

      <footer className="mx-auto mt-16 max-w-[1200px] border-t px-4 py-8 text-[14px] leading-[1.8] md:px-6" style={{ borderColor: C.line, color: C.muted }}>
        <p>
          <SampleLogo />
        </p>
        <p>
          {BRANCH}, {ADDRESS}
        </p>
        <p className="mt-2">
          <button type="button" className={`font-bold hover:underline ${focusRing}`} style={{ color: C.ink, outlineColor: C.accent }}>
            개인정보처리방침
          </button>
        </p>
        <DemoMakerInfo className="mt-6" />
      </footer>
    </div>
  );
}

/* ---------- 포스터 첫 화면 ---------- */

const IMG = "/images/demo-coworking";

const GNB: [string, string][] = [
  ["cw-plan", "공간 소개"],
  ["cw-price", "요금"],
  ["cw-rooms", "회의실"],
  ["cw-map", "오시는 길"],
];

function Poster({ reduce, go }: { reduce: boolean; go: (id: string) => void }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { amount: 0.3 });

  return (
    <>
      {/* GNB. 페이지 내내 위에 붙는다. 휴대폰은 가로로 밀어 보는 메뉴 */}
      <header className="sticky top-0 z-30 border-b bg-white" style={{ borderColor: C.line }}>
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-4 py-2 md:px-6">
          <p className="shrink-0" style={{ color: C.ink }}>
            <SampleLogo />
          </p>
          <nav aria-label="주요 메뉴" className="-mr-4 min-w-0 overflow-x-auto pr-4 md:mr-0 md:pr-0">
            <ul className="flex items-center gap-1 whitespace-nowrap">
              {GNB.map(([id, label]) => (
                <li key={id}>
                  <button type="button" onClick={() => go(id)} className={`h-11 rounded-[4px] px-2.5 text-[15px] font-bold hover:underline hover:underline-offset-4 md:px-3 md:text-[16px] ${focusRing}`} style={{ color: C.ink, outlineColor: C.accent }}>
                    {label}
                  </button>
                </li>
              ))}
              <li className="hidden md:block">
                <button type="button" onClick={() => go("cw-tour")} data-gtm-cta="coworking_poster_cta" className={`ml-2 h-11 rounded-[4px] px-4 text-[16px] font-semibold text-white ${focusRing}`} style={{ background: C.accent, outlineColor: C.accent }}>
                  투어 신청
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <section id="cw-poster" ref={ref} aria-labelledby="cw-poster-title">
        {/* 라운지 사진 */}
        <div className="relative h-[34svh] min-h-[220px] overflow-hidden md:h-[60svh] md:min-h-[380px]" style={{ background: "#141414" }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- 정적 export 라 next/image 최적화를 쓰지 않는다 */}
          <img
            src={`${IMG}/hero.jpg`}
            srcSet={`${IMG}/hero-sm.jpg 960w, ${IMG}/hero.jpg 1920w`}
            sizes="100vw"
            alt="조명이 켜진 공유오피스 라운지와 창가 좌석이 흐리게 보이는 사진"
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: "50% 45%" }}
          />
        </div>

        <div className="mx-auto max-w-[1200px] px-4 pb-12 pt-7 md:px-6 md:pt-9">
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
            <div className="min-w-0">
              <h1 id="cw-poster-title" className="text-[26px] font-bold leading-[1.3] md:text-[34px]" style={{ color: C.ink, letterSpacing: "-0.03em", wordBreak: "keep-all" }}>
                ㅇㅇ역 3번 출구 도보 4분 공유오피스
              </h1>
              <p className="mt-2 text-[15px] leading-[1.6]" style={{ color: C.muted }}>
                {BRAND} {BRANCH}, {ADDRESS}
                <br />
                평일 09:00~21:00, 멤버 24시간 출입
              </p>
            </div>
            <div className="grid w-full grid-cols-2 gap-2 sm:w-auto">
              <button type="button" onClick={() => go("cw-price")} className={`h-12 rounded-[4px] border px-5 text-[16px] font-semibold ${focusRing}`} style={{ borderColor: C.edge, color: C.ink, outlineColor: C.accent }}>
                요금 보기
              </button>
              <button type="button" onClick={() => go("cw-tour")} data-gtm-cta="coworking_tour_top" className={`h-12 rounded-[4px] px-5 text-[16px] font-semibold text-white ${focusRing}`} style={{ background: C.accent, outlineColor: C.accent }}>
                투어 신청
              </button>
            </div>
          </div>
        </div>

        {/* 휴대폰 하단 고정 투어 신청. 첫 화면이 보일 때만 */}
        <AnimatePresence>
          {inView && (
            <motion.div
              initial={reduce ? false : { y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { y: 16, opacity: 0 }}
              transition={{ duration: 0.2, ease: EASE }}
              className="fixed inset-x-0 bottom-0 z-40 border-t bg-white px-4 py-3 md:hidden"
              style={{ borderColor: C.line }}
            >
              <button type="button" onClick={() => go("cw-tour")} data-gtm-cta="coworking_poster_cta" className={`flex h-12 w-full items-center justify-center rounded-[6px] text-[17px] font-semibold text-white ${focusRing}`} style={{ background: C.accent, outlineColor: C.accent }}>
                투어 신청
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </>
  );
}

/* ---------- 공통 조각 ---------- */

function SectionTitle({ id, children }: { id: string; children: string }) {
  return (
    <h2 id={id} className="border-b pb-3 text-[26px] font-bold leading-[1.2] md:text-[32px]" style={{ color: C.ink, borderColor: C.line }}>
      {children}
    </h2>
  );
}

const th = "border-b px-3 py-2.5 text-left text-[14px] font-bold";
const td = "border-b px-3 py-3 align-top text-[15px] leading-[1.6]";

/* ---------- 요금표 ---------- */

function PriceTable({ onTour }: { onTour: () => void }) {
  return (
    <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-10">
      <div className="min-w-0">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <caption className="sr-only">좌석 유형별 월 요금</caption>
            <thead>
              <tr style={{ background: C.paper, color: C.muted }}>
                <th scope="col" className={th} style={{ borderColor: C.line }}>
                  좌석 유형
                </th>
                <th scope="col" className={th} style={{ borderColor: C.line }}>
                  월 요금
                </th>
                <th scope="col" className={th} style={{ borderColor: C.line }}>
                  포함 사항
                </th>
              </tr>
            </thead>
            <tbody>
              {TYPES.map((t) => (
                <tr key={t}>
                  <th scope="row" className={`${td} font-bold`} style={{ borderColor: C.line, color: C.ink }}>
                    {t}
                  </th>
                  <td className={`${td} whitespace-nowrap`} style={{ borderColor: C.line }}>
                    <b className="tabular-nums" style={{ color: C.ink }}>
                      {won(SEATS[t].price)}
                    </b>
                    <span className="block text-[13px]" style={{ color: C.muted }}>
                      {SEATS[t].unit}
                    </span>
                  </td>
                  <td className={td} style={{ borderColor: C.line }}>
                    {SEATS[t].include}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 className="mt-8 text-[18px] font-bold" style={{ color: C.ink }}>
          추가 옵션 (월)
        </h3>
        <ul className="mt-2 border-t" style={{ borderColor: C.line }}>
          {OPTIONS.map((o) => (
            <li key={o.label} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 border-b py-3 text-[15px]" style={{ borderColor: C.line }}>
              <span className="font-bold" style={{ color: C.ink }}>
                {o.label}
                <span className="ml-2 text-[13px] font-normal" style={{ color: C.muted }}>
                  {o.note}
                </span>
              </span>
              <span className="tabular-nums">{won(o.price)}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="h-fit rounded-[6px] border p-5" style={{ borderColor: C.line, background: C.paper }}>
        <h3 className="text-[18px] font-bold" style={{ color: C.ink }}>
          계약 기간 할인
        </h3>
        <dl className="mt-3 grid grid-cols-[1fr_auto] gap-x-4 gap-y-2 text-[15px]">
          {TERMS.map((t) => (
            <div key={t.months} className="contents">
              <dt>{t.months}개월</dt>
              <dd className="text-right font-bold" style={{ color: C.ink }}>
                {t.off ? `월 요금 ${Math.round(t.off * 100)}% 할인` : "정가"}
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 border-t pt-4 text-[14px] leading-[1.6]" style={{ borderColor: C.line, color: C.muted }}>
          부가세 별도, 보증금 1개월분. 계약은 매월 1일과 16일에 시작합니다.
        </p>
        <button type="button" onClick={onTour} data-gtm-cta="coworking_tour_price" className={`mt-5 w-full rounded-[4px] px-4 py-3 text-[16px] font-semibold text-white ${focusRing}`} style={{ background: C.accent, outlineColor: C.accent }}>
          투어 신청
        </button>
      </div>
    </div>
  );
}

/* ---------- 회의실 안내 ---------- */

function RoomInfo() {
  return (
    <div className="mt-6">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <caption className="sr-only">회의실 수용 인원과 설비</caption>
          <thead>
            <tr style={{ background: C.paper, color: C.muted }}>
              <th scope="col" className={th} style={{ borderColor: C.line }}>
                회의실
              </th>
              <th scope="col" className={th} style={{ borderColor: C.line }}>
                인원
              </th>
              <th scope="col" className={th} style={{ borderColor: C.line }}>
                설비
              </th>
            </tr>
          </thead>
          <tbody>
            {ROOMS.map((r) => (
              <tr key={r.name}>
                <th scope="row" className={`${td} font-bold`} style={{ borderColor: C.line, color: C.ink }}>
                  {r.name}
                </th>
                <td className={td} style={{ borderColor: C.line }}>
                  {r.cap}
                </td>
                <td className={td} style={{ borderColor: C.line }}>
                  {r.gear}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="mt-4 grid gap-1.5 text-[15px] leading-[1.6]">
        <li>멤버 무료 크레딧 월 10시간(4인실 20시간), 이후 시간당 11,000원</li>
        <li>비멤버 대관 시간당 22,000원, 1시간 단위</li>
        <li>예약은 멤버 앱이나 안내데스크에서 받습니다. 이용시간 09:00~21:00</li>
      </ul>
    </div>
  );
}

/* ---------- 입주 혜택 ---------- */

const PERKS = [
  { Icon: Building2, title: "사업자등록 주소 제공", desc: "자유석부터 가능, 월 33,000원. 1인실 이상은 포함" },
  { Icon: Users, title: "회의실 무료 크레딧", desc: "월 10시간, 4인실은 20시간. 이후 시간당 11,000원" },
  { Icon: Clock, title: "24시간 출입", desc: "지정석 이상 기본. 자유석은 월 22,000원" },
  { Icon: Coffee, title: "커피, 음료", desc: "라운지 커피머신과 탄산수 무제한" },
  { Icon: Printer, title: "복합기", desc: "흑백 월 300장 무료, 컬러 장당 200원" },
  { Icon: Mail, title: "우편물, 택배 수령", desc: "데스크 보관 후 카카오톡 알림. 월 11,000원" },
  { Icon: Car, title: "주차", desc: "건물 지하 1~3층 2시간 무료, 이후 10분 1,000원" },
  { Icon: Wifi, title: "인터넷", desc: "유선 1Gbps, 좌석마다 랜 포트" },
] as const;

function Perks() {
  return (
    <ul className="mt-6 grid gap-x-10 md:grid-cols-2">
      {PERKS.map(({ Icon, title, desc }) => (
        <li key={title} className="flex items-start gap-4 border-b py-4" style={{ borderColor: C.line }}>
          <Icon size={22} aria-hidden className="mt-0.5 flex-none" style={{ color: C.ink }} />
          <div className="min-w-0">
            <p className="text-[17px] font-bold">
              {title}
            </p>
            <p className="mt-0.5 text-[15px] leading-[1.6]" style={{ color: C.muted }}>
              {desc}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

/* ---------- 투어 신청 ---------- */

interface Tour {
  day: Date;
  time: string;
  name: string;
  phone: string;
  people: number;
  type: SeatType | null;
}

function TourForm({ today, reduce }: { today: Date; reduce: boolean }) {
  const days = Array.from({ length: 7 }, (_, i) => daysAgo(today, -i));
  const [day, setDay] = useState<number | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [people, setPeople] = useState(1);
  const [selected, setSelected] = useState<SeatType | null>(null);
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [done, setDone] = useState<Tour | null>(null);

  const field = "w-full rounded-[4px] border bg-white px-3 py-2.5 text-[16px] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2";
  const label = "block text-[14px] font-bold";
  const chip = (on: boolean, off = false): CSSProperties => ({
    background: on ? C.accent : "#fff",
    color: off ? C.muted : on ? "#fff" : C.ink,
    borderColor: off ? C.line : on ? C.accent : C.edge,
    outlineColor: C.accent,
  });

  const submit = () => {
    const e: string[] = [];
    if (day === null) e.push("날짜를 골라 주세요.");
    if (!time) e.push("시간을 골라 주세요.");
    if (name.trim().length < 2) e.push("이름을 적어 주세요.");
    if (phone.replace(/\D/g, "").length < 10) e.push("휴대폰 번호를 확인해 주세요.");
    if (!agree) e.push("개인정보 수집, 이용에 동의해 주세요.");
    setErrors(e);
    if (e.length || day === null || !time) return;
    setDone({ day: days[day], time, name, phone, people, type: selected });
  };

  if (done) {
    const no = `T${today.getFullYear()}${p2(today.getMonth() + 1)}${p2(today.getDate())}-${String(40 + (today.getDate() % 7) * 3).padStart(3, "0")}`;
    const reply = nextBusinessDay(today);
    const row = "grid grid-cols-[96px_1fr] gap-x-4 gap-y-2 text-[15px]";
    return (
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: EASE }}
        className="mt-6 max-w-[640px] rounded-[6px] border p-5 md:p-6"
        style={{ borderColor: C.line, background: C.paper }}
        role="status"
      >
        <p className="inline-flex items-center gap-2 text-[22px] font-bold" style={{ color: C.ink }}>
          <Check size={22} strokeWidth={3} aria-hidden /> 투어 신청 접수
        </p>
        <p className="mt-3 text-[15px]" style={{ color: C.muted }}>
          접수번호
        </p>
        <p className="text-[28px] font-semibold" style={{ color: C.ink }}>
          {no}
        </p>
        <dl className={`mt-4 border-t pt-4 ${row}`} style={{ borderColor: C.line }}>
          <dt style={{ color: C.muted }}>투어 일시</dt>
          <dd className="font-bold">
            {fmtKo(done.day)} {done.time}
          </dd>
          <dt style={{ color: C.muted }}>이름</dt>
          <dd>{maskName(done.name)}</dd>
          <dt style={{ color: C.muted }}>휴대폰</dt>
          <dd>{maskPhone(done.phone)}</dd>
          <dt style={{ color: C.muted }}>인원</dt>
          <dd>{done.people}명</dd>
          <dt style={{ color: C.muted }}>관심 좌석</dt>
          <dd>{done.type ?? "미정"}</dd>
        </dl>
        <dl className={`mt-4 border-t pt-4 ${row}`} style={{ borderColor: C.line }}>
          <dt style={{ color: C.muted }}>담당 창구</dt>
          <dd className="font-bold">{KAKAO}</dd>
          <dt style={{ color: C.muted }}>회신 예정일</dt>
          <dd className="font-bold">{fmtKo(reply)} 오전 중</dd>
        </dl>
        <p className="mt-4 text-[14px] leading-[1.6]" style={{ color: C.muted }}>
          투어 당일 1층 안내데스크에서 {BRAND} 방문이라고 말씀해 주세요. 주차는 2시간 무료예요.
        </p>
        <button
          type="button"
          onClick={() => {
            setDone(null);
            setDay(null);
            setTime(null);
            setName("");
            setPhone("");
            setPeople(1);
            setSelected(null);
            setAgree(false);
          }}
          className={`mt-5 rounded-[4px] border px-4 py-2 text-[14px] font-bold ${focusRing}`}
          style={{ borderColor: C.edge, color: C.ink, outlineColor: C.accent }}
        >
          다시 신청
        </button>
      </motion.div>
    );
  }

  return (
    <form
      className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-8"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      noValidate
    >
      <div className="grid gap-6">
        <fieldset>
          <legend className={label} style={{ color: C.muted }}>
            날짜 (평일)
          </legend>
          <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-7">
            {days.map((d, i) => {
              const off = !isWeekday(d);
              const on = day === i;
              return (
                <button
                  key={i}
                  type="button"
                  disabled={off}
                  aria-pressed={on}
                  aria-label={`${fmtKo(d)}${off ? " 휴무" : ""}`}
                  onClick={() => setDay(i)}
                  className={`rounded-[4px] border px-1 py-2 text-center transition-colors duration-150 disabled:cursor-not-allowed ${focusRing}`}
                  style={chip(on, off)}
                >
                  <span className="block text-[12px] font-bold">{i === 0 ? "오늘" : `${DOW[d.getDay()]}요일`}</span>
                  <span className="block text-[18px] font-semibold">
                    {d.getDate()}
                  </span>
                  <span className="block text-[11px]" style={{ color: off ? C.muted : "inherit" }}>
                    {off ? "휴무" : `${d.getMonth() + 1}월`}
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <fieldset>
          <legend className={label} style={{ color: C.muted }}>
            시간
          </legend>
          <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
            {TOUR_TIMES.map((t) => (
              <button key={t} type="button" aria-pressed={time === t} onClick={() => setTime(t)} className={`rounded-[4px] border px-2 py-2.5 text-[16px] font-semibold transition-colors duration-150 ${focusRing}`} style={{ ...chip(time === t) }}>
                {t}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className={label} style={{ color: C.muted }}>
            관심 좌석
          </legend>
          <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-5">
            {([null, ...TYPES] as (SeatType | null)[]).map((t) => (
              <button key={t ?? "none"} type="button" aria-pressed={selected === t} onClick={() => setSelected(t)} className={`rounded-[4px] border px-2 py-2.5 text-[16px] font-semibold transition-colors duration-150 ${focusRing}`} style={chip(selected === t)}>
                {t ?? "미정"}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-[1fr_1fr_140px]">
          <div>
            <label htmlFor="cw-name" className={label} style={{ color: C.muted }}>
              이름
            </label>
            <input id="cw-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={`${field} mt-2`} style={{ borderColor: C.edge, outlineColor: C.accent }} />
          </div>
          <div>
            <label htmlFor="cw-phone" className={label} style={{ color: C.muted }}>
              휴대폰
            </label>
            <input id="cw-phone" value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="numeric" autoComplete="tel" placeholder="010-0000-0000" className={`${field} mt-2`} style={{ borderColor: C.edge, outlineColor: C.accent }} />
          </div>
          <div>
            <p id="cw-tour-people" className={label} style={{ color: C.muted }}>
              인원
            </p>
            <div role="group" aria-labelledby="cw-tour-people" className="mt-2 inline-flex w-full items-stretch rounded-[4px] border" style={{ borderColor: C.edge }}>
              <button type="button" aria-label="인원 줄이기" disabled={people <= 1} onClick={() => setPeople((p) => Math.max(1, p - 1))} className={`px-3 disabled:opacity-30 ${focusRing}`} style={{ color: C.ink, outlineColor: C.accent }}>
                <Minus size={18} aria-hidden />
              </button>
              <span className="inline-flex flex-1 items-center justify-center border-x py-2 text-[18px] font-semibold" style={{ borderColor: C.edge, color: C.ink }}>
                {people}
              </span>
              <button type="button" aria-label="인원 늘리기" disabled={people >= 6} onClick={() => setPeople((p) => Math.min(6, p + 1))} className={`px-3 disabled:opacity-30 ${focusRing}`} style={{ color: C.ink, outlineColor: C.accent }}>
                <Plus size={18} aria-hidden />
              </button>
            </div>
          </div>
        </div>

        <label className="flex min-h-11 cursor-pointer items-start gap-2.5 text-[15px] leading-[1.5]" style={{ color: C.ink }}>
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-[#2c4f58]" />
          <span>
            개인정보 수집, 이용 동의 (필수)
            <span className="block text-[14px]" style={{ color: C.muted }}>
              이름, 휴대폰을 투어 일정 연락에만 쓰고 투어가 끝나면 1년 안에 파기합니다.
            </span>
          </span>
        </label>

        {errors.length > 0 && (
          <ul className="grid gap-1 rounded-[4px] border px-4 py-3 text-[14px] font-bold" style={{ borderColor: C.error, color: C.error }} role="alert">
            {errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-[6px] border p-5" style={{ borderColor: C.line, background: C.paper }}>
        <p className="text-[14px] font-bold" style={{ color: C.muted }}>
          신청 내용
        </p>
        <dl className="mt-3 grid grid-cols-[88px_1fr] gap-x-4 gap-y-2 text-[15px]">
          <dt style={{ color: C.muted }}>일시</dt>
          <dd className="font-bold">{day !== null ? `${fmtKo(days[day])} ${time ?? ""}` : "미선택"}</dd>
          <dt style={{ color: C.muted }}>인원</dt>
          <dd>{people}명</dd>
          <dt style={{ color: C.muted }}>관심 좌석</dt>
          <dd>{selected ?? "미정 (투어 때 상담)"}</dd>
          <dt style={{ color: C.muted }}>소요 시간</dt>
          <dd>20분 안팎</dd>
        </dl>
        <button type="submit" data-gtm-cta="coworking_tour_submit" className={`mt-5 w-full rounded-[4px] px-4 py-3 text-[16px] font-semibold text-white ${focusRing}`} style={{ background: C.accent, outlineColor: C.accent }}>
          투어 신청
        </button>
        <p className="mt-3 text-[13px] leading-[1.6]" style={{ color: C.muted }}>
          접수 뒤 {KAKAO}에서 다음 영업일 오전에 회신해요. 당일 투어는 전화로만 받아요.
        </p>
      </div>
    </form>
  );
}

/* ---------- 오시는 길 ---------- */

const HOURS_ROWS = [
  { days: [1, 2, 3, 4, 5], label: "월~금", hours: "09:00~21:00" },
  { days: [6], label: "토요일", hours: "10:00~18:00" },
  { days: [0], label: "일요일, 공휴일", hours: "휴무 (멤버 24시간 출입)" },
];

function Directions({ today }: { today: Date }) {
  const dow = today.getDay();
  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-8">
      <div className="overflow-hidden rounded-[6px] border" style={{ borderColor: C.line }}>
        <MiniMap />
      </div>
      <div className="grid gap-5 text-[15px] leading-[1.7]">
        <div>
          <p className="text-[14px] font-bold" style={{ color: C.muted }}>
            주소
          </p>
          <p className="text-[17px] font-bold">
            {ADDRESS}
          </p>
        </div>
        <ul className="grid gap-3">
          <li className="flex items-start gap-3">
            <TrainFront size={20} aria-hidden className="mt-1 flex-none" style={{ color: C.ink }} />
            <span>
              ㅇㅇ역 3번 출구 <b>도보 4분</b>. 출구에서 직진 후 첫 사거리 왼쪽 ㅇㅇ빌딩
            </span>
          </li>
          <li className="flex items-start gap-3">
            <Car size={20} aria-hidden className="mt-1 flex-none" style={{ color: C.ink }} />
            <span>건물 지하 1~3층 주차. 멤버와 투어 방문 2시간 무료, 이후 10분 1,000원</span>
          </li>
        </ul>
        <div>
          <p className="text-[14px] font-bold" style={{ color: C.muted }}>
            운영시간
          </p>
          <table className="mt-1 w-full border-collapse text-left">
            <tbody>
              {HOURS_ROWS.map((r) => {
                const on = r.days.includes(dow);
                return (
                  <tr key={r.label} className={on ? "font-bold" : ""} style={{ color: on ? C.ink : C.text, background: on ? C.inkSoft : "transparent" }}>
                    <th scope="row" className="w-[48%] border-b px-2 py-2 font-[inherit]" style={{ borderColor: C.line }}>
                      {r.label}
                      {on && <span className="ml-2 rounded-[3px] px-1.5 py-0.5 text-[12px] font-bold" style={{ background: C.accent, color: "#fff" }}>오늘</span>}
                    </th>
                    <td className="border-b px-2 py-2" style={{ borderColor: C.line }}>
                      {r.hours}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MiniMap() {
  return (
    <svg viewBox="0 0 520 360" className="block h-auto w-full" role="img" aria-label="ㅇㅇ역 3번 출구에서 직진 후 첫 사거리 왼쪽 ㅇㅇ빌딩 약도">
      <rect width="520" height="360" fill={C.paper} />
      {/* 큰길과 골목 */}
      <rect x="0" y="236" width="520" height="44" fill="#fff" stroke={C.line} />
      <rect x="296" y="0" width="34" height="360" fill="#fff" stroke={C.line} />
      <rect x="120" y="0" width="22" height="236" fill="#fff" stroke={C.line} />
      <text x="20" y="266" fontSize="13" fill={C.muted}>
        ㅇㅇ대로
      </text>
      <text x="313" y="40" fontSize="12" fill={C.muted} transform="rotate(90 313 40)">
        ㅇㅇ로
      </text>
      {/* 걷는 길 */}
      <path d="M 330 300 L 313 300 L 313 180 L 240 180" fill="none" stroke={C.accent} strokeWidth="3" strokeDasharray="7 6" strokeLinecap="round" />
      <text x="322" y="170" fontSize="12" fontWeight="700" fill={C.ink}>
        도보 4분
      </text>
      {/* 역 */}
      <circle cx="352" cy="304" r="16" fill="#fff" stroke={C.accent} strokeWidth="2" />
      <text x="352" y="309" fontSize="12" fontWeight="700" fill={C.ink} textAnchor="middle">
        역
      </text>
      <text x="376" y="300" fontSize="13" fontWeight="700" fill={C.ink}>
        ㅇㅇ역
      </text>
      <text x="376" y="318" fontSize="12" fill={C.muted}>
        3번 출구
      </text>
      {/* 건물 */}
      <rect x="160" y="130" width="80" height="80" rx="3" fill={C.inkSoft} stroke={C.accent} strokeWidth="1.5" />
      <text x="200" y="166" fontSize="13" fontWeight="700" fill={C.ink} textAnchor="middle">
        ㅇㅇ빌딩
      </text>
      <text x="200" y="186" fontSize="12" fontWeight="700" fill={C.ink} textAnchor="middle">
        5층
      </text>
      <text x="200" y="120" fontSize="12" fill={C.muted} textAnchor="middle">
        주차 지하 1~3층
      </text>
      {/* 주변 */}
      <rect x="170" y="296" width="100" height="44" rx="2" fill="#fff" stroke={C.line} />
      <text x="220" y="322" fontSize="12" fill={C.muted} textAnchor="middle">
        편의점
      </text>
      <rect x="360" y="40" width="120" height="70" rx="2" fill="#fff" stroke={C.line} />
      <text x="420" y="80" fontSize="12" fill={C.muted} textAnchor="middle">
        우체국
      </text>
    </svg>
  );
}

/* 로고: 메인 사이트와 같은 곰 로고 + 곰파트너(크게) + 업종(작게) */
function SampleLogo({ light, small }: { light?: boolean; small?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2" style={{ color: light ? "#ffffff" : "#111111" }}>
      <span className="flex items-baseline gap-1 whitespace-nowrap">
        <span className={`${small ? "text-[18px]" : "text-[20px]"} font-bold leading-none tracking-[-0.03em]`}>공유오피스</span>
      </span>
    </span>
  );
}
