"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { CalendarCheck, Car, Check, Clock, MapPin, Menu, TrainFront, X } from "lucide-react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { daysAgo, fmtKo, useDemoToday } from "@/hooks/useDemoToday";
import { maskName, maskPhone } from "@/components/demos/LeadReceivedPanel";
import { DemoMakerInfo } from "@/components/demos/DemoMakerInfo";

/* 미용실 홈페이지 샘플: 가상의 곰파트너 미용실. 디자이너 4명(원장 1, 디자이너 3).
   상호, 주소, 디자이너 이름은 모두 가상이다.

   국내 미용실 홈페이지와 네이버 예약 페이지의 공통 구성을 따른다.
   - 메뉴: 디자이너 소개, 시술 메뉴(가격표), 예약, 스타일북, 오시는 길
   - 가격표는 컷, 펌, 염색, 클리닉, 매직, 드라이 묶음. 기장 추가 요금 별도, 원장 지명 추가 요금.
   - 관용 문구: 예약하기, 당일 예약 가능, 월요일 정기휴무, 주차 가능, 예약 변경은 하루 전까지.

   사진 출처: 디자이너와 스타일북 사진은 AI 생성(Z-Image-Turbo)

   모션: 첫 화면 사진이 1.05배에서 천천히 제자리로 온다. 동작 줄이기면 바로 보인다.

   구성(모두 브라우저 안에서만 돈다. 실제로 보내지 않는다)
   1. 디자이너 소개: 사진, 직급, 잘하는 시술, 대표 스타일, 지명 추가 요금.
   2. 시술 가격표: 시술별 디자이너, 수석 디자이너, 원장 가격과 소요시간.
   3. 예약 신청: 디자이너, 시술, 날짜, 시간을 고르고 이름과 휴대폰을 넣으면 접수 완료.
   4. 스타일북: 시술 사진 격자와 스타일 이름, 시술 조합.
   5. 오시는 길과 영업시간: 월요일 휴무, 오늘 요일 진하게.

   포스터 첫 화면(hs-poster): 스타일 사진 한 장과 문장 "커트, 펌, 염색 디자이너 지정 예약", 오늘 영업 한 줄,
   디자이너 목록. 글꼴은 Pretendard 한 벌, 강조색은 남색 하나. */

const ADDRESS = "서울 ㅇㅇ구 ㅇㅇ로 00, 2층";
const KAKAO = "카카오톡 채널 미용실";
const TEL = "02-000-0000";

/* 모션 상수 */
const EASE = [0.22, 1, 0.36, 1] as const;
/** 옅은 회색 바탕에 흰 판, 먹색 글자. 강조색은 차분한 남색 하나 */
const ACCENT = "#2b3a67";
const C = {
  bg: "#f7f7f5",
  paper: "#ffffff",
  ink: "#111111",
  body: "#4b4b4b",
  muted: "#767676",
  line: "#e5e5e5",
  soft: "#efefec",
  error: "#b42318",
};

const focusRing = "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2";


/* 시술 메뉴. 가격은 디자이너 기본 단가, 분은 소요시간. */
type ServiceId = "cut" | "perm" | "color" | "clinic" | "magic" | "dry";
interface Service {
  id: ServiceId;
  name: string;
  detail: string;
  price: number;
  min: number;
}
const SERVICES: Service[] = [
  { id: "cut", name: "컷", detail: "샴푸, 드라이 포함", price: 25000, min: 40 },
  { id: "perm", name: "펌", detail: "일반펌, 열펌 기준", price: 90000, min: 150 },
  { id: "color", name: "염색", detail: "뿌리 염색은 상담", price: 70000, min: 120 },
  { id: "clinic", name: "클리닉", detail: "손상모 케어", price: 50000, min: 60 },
  { id: "magic", name: "매직", detail: "매직 스트레이트", price: 150000, min: 180 },
  { id: "dry", name: "드라이", detail: "스타일링 드라이", price: 20000, min: 30 },
];
const SERVICE_BY_ID = Object.fromEntries(SERVICES.map((s) => [s.id, s])) as Record<ServiceId, Service>;

/* 디자이너. extra는 지명 추가 요금 비율. */
interface Designer {
  id: string;
  name: string;
  role: string;
  extra: number;
  good: string;
  can: ServiceId[];
  /** 대표 스타일(Style.key). 카드에 작업 사진으로 보인다 */
  styles: string[];
}
const DESIGNERS: Designer[] = [
  { id: "kim", name: "김ㅎ늘", role: "원장", extra: 0.4, good: "매직, 손상모 펌", can: ["cut", "perm", "color", "clinic", "magic", "dry"], styles: ["volmagic", "ccurl"] },
  { id: "lee", name: "이ㅅ아", role: "수석 디자이너", extra: 0.15, good: "레이어드컷, 열펌", can: ["cut", "perm", "color", "clinic", "magic", "dry"], styles: ["layered", "build"] },
  { id: "park", name: "박ㅈ우", role: "디자이너", extra: 0, good: "염색, 발레아쥬", can: ["cut", "perm", "color", "clinic", "dry"], styles: ["balayage", "ashbrown"] },
  { id: "choi", name: "최ㅁ영", role: "디자이너", extra: 0, good: "남성 컷, 다운펌", can: ["cut", "perm", "color", "dry"], styles: ["down", "parting"] },
];

/** 디자이너 단가. 추가 요금을 붙여 천 원 단위로 올린다. */
const priceOf = (s: Service, d: Designer) => Math.ceil((s.price * (1 + d.extra)) / 1000) * 1000;
const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;
const p2 = (n: number) => String(n).padStart(2, "0");
const DOW = ["일", "월", "화", "수", "목", "금", "토"];
const fmtMin = (m: number) => (m >= 60 ? `${Math.floor(m / 60)}시간${m % 60 ? ` ${m % 60}분` : ""}` : `${m}분`);

/* 영업시간. 월요일 정기휴무. */

/* 영업시간. 월요일 정기휴무. */
const OPEN_H = 10;
const CLOSE_H = 20;
const DAYS = 14;
/** 예약 신청 시간. 마지막 접수 18:00 */
const TIMES = Array.from({ length: CLOSE_H - 2 - OPEN_H + 1 }, (_, i) => `${OPEN_H + i}:00`);
/** 가격표 열 순서: 디자이너, 수석 디자이너, 원장 */
const PRICE_COLS = [DESIGNERS[2], DESIGNERS[1], DESIGNERS[0]];

/* 스타일북. 조합은 시술 id 목록. */
interface Style {
  /** 사진 파일 style-<key>.jpg */
  key: string;
  name: string;
  combo: ServiceId[];
  note: string;
}
const STYLES: Style[] = [
  { key: "hush", name: "허쉬컷", combo: ["cut", "dry"], note: "층을 많이 내고 끝을 가볍게 쳐요." },
  { key: "layered", name: "레이어드컷", combo: ["cut"], note: "얼굴 옆 층으로 자연스럽게 흘러요." },
  { key: "hippie", name: "히피펌", combo: ["cut", "perm"], note: "뿌리부터 잔잔하게 말아요. 두 달쯤 가요." },
  { key: "build", name: "빌드펌", combo: ["cut", "perm"], note: "볼륨을 아래로 쌓는 굵은 웨이브예요." },
  { key: "as", name: "애즈펌", combo: ["perm", "clinic"], note: "열펌이라 클리닉을 같이 해요." },
  { key: "glam", name: "글램펌", combo: ["cut", "perm", "clinic"], note: "긴 머리 웨이브. 기장 추가 요금이 있어요." },
  { key: "ccurl", name: "C컬 매직", combo: ["magic", "cut"], note: "끝만 안으로 말리는 매직이에요." },
  { key: "volmagic", name: "볼륨매직", combo: ["magic", "clinic"], note: "뿌리 볼륨을 살리고 열 손상은 클리닉으로 잡아요." },
  { key: "balayage", name: "발레아쥬", combo: ["color", "clinic"], note: "손으로 그려 넣는 그라데이션 염색이에요." },
  { key: "ashbrown", name: "애쉬브라운", combo: ["color"], note: "붉은 기 없는 갈색. 탈색 없이 가능해요." },
  { key: "parting", name: "가르마펌", combo: ["cut", "perm"], note: "남성 앞머리 방향을 잡아 줘요." },
  { key: "down", name: "다운펌", combo: ["cut", "perm"], note: "옆머리 뜨는 걸 눌러요. 30분이면 돼요." },
];

type Done = { no: string; name: string; phone: string; date: Date; time: string; service: Service; designer: Designer };

export function HairSalonDemo() {
  const today = useDemoToday();
  const reduce = useReducedMotionSafe();

  const [dIdx, setDIdx] = useState(1);

  // 현재 시각(분). 서버 렌더와 맞추기 위해 브라우저에서 한 번 읽는다. 확인 연락 안내에 쓴다.
  const [nowMin, setNowMin] = useState(0);
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const d = new Date();
      setNowMin(d.getHours() * 60 + d.getMinutes());
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const f = () => window.scrollTo({ top: 0 });
    window.addEventListener("demo:go-home", f);
    return () => window.removeEventListener("demo:go-home", f);
  }, []);

  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  const reserveWith = (i: number) => {
    setDIdx(i);
    go("hs-reserve");
  };
  const todayDow = today.getDay();

  const accent = ACCENT;
  const pageStyle = {
    "--hs-accent": accent,
    color: C.ink,
    backgroundColor: C.bg,
  } as React.CSSProperties;

  return (
    <div className="min-h-screen overflow-x-clip" style={pageStyle}>
      <style>{`
        .hs-accent-bg { background: var(--hs-accent); }
        .hs-accent-text { color: var(--hs-accent); }
      `}</style>

      <Poster reduce={reduce} today={today} go={go} onReserve={reserveWith} />

      <div>
      {/* 1. 디자이너 */}
      <section id="hs-designers" aria-labelledby="hs-designers-title" className="mx-auto mt-14 max-w-[1200px] scroll-mt-4 px-4 md:mt-20 md:px-6">
        <SectionTitle id="hs-designers-title">디자이너</SectionTitle>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {DESIGNERS.map((d, i) => (
            <li key={d.id} className="flex flex-col items-start rounded-[6px] border p-4" style={{ borderColor: C.line, background: C.paper }}>
              <span className="relative block aspect-[4/5] w-full overflow-hidden rounded-[4px]" style={{ background: C.soft }}>
                {/* eslint-disable-next-line @next/next/no-img-element -- 정적 export 라 next/image 최적화를 쓰지 않는다 */}
                <img src={`${IMG}/designer-${d.id}.jpg`} alt={`${d.role} ${d.name}`} loading="lazy" width={600} height={800} className="h-full w-full object-cover" style={{ objectPosition: "50% 20%" }} />
              </span>
              <h3 className="mt-4 text-[24px] font-bold leading-none">{d.name}</h3>
              <p className="mt-1 text-[15px] font-bold">{d.role}</p>
              <p className="mt-2 text-[14px]" style={{ color: C.muted }}>
                잘하는 것 {d.good}
              </p>
              <span className="mt-3 grid w-full grid-cols-2 gap-1.5" aria-label="대표 스타일">
                {d.styles.map((k) => {
                  const st = STYLES.find((x) => x.key === k)!;
                  return (
                    <span key={k} className="relative block aspect-square overflow-hidden rounded-[4px]">
                      {/* eslint-disable-next-line @next/next/no-img-element -- 정적 export 라 next/image 최적화를 쓰지 않는다 */}
                      <img src={`${IMG}/style-${k}.jpg`} alt="" loading="lazy" width={300} height={300} className="h-full w-full object-cover" style={{ objectPosition: "50% 25%" }} />
                      <span className="absolute inset-x-0 bottom-0 px-2 py-1 text-[12px] font-bold text-white" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.65), rgba(0,0,0,0))" }}>
                        {st.name}
                      </span>
                    </span>
                  );
                })}
              </span>
              <p className="mt-3 text-[14px] font-bold" style={{ color: d.extra ? ACCENT : C.muted }}>
                {d.extra ? `지명 추가 요금 ${Math.round(d.extra * 100)}%` : "추가 요금 없음"}
              </p>
              <button type="button" onClick={() => reserveWith(i)} className={`mt-auto w-full rounded-[4px] border px-3 py-2 text-[15px] font-bold ${focusRing}`} style={{ borderColor: ACCENT, color: ACCENT, outlineColor: ACCENT, marginTop: 12 }}>
                {d.name} 예약
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* 2. 시술 가격표 */}
      <section id="hs-menu" aria-labelledby="hs-menu-title" className="mx-auto mt-14 max-w-[1200px] scroll-mt-4 px-4 md:mt-20 md:px-6">
        <SectionTitle id="hs-menu-title">시술 메뉴</SectionTitle>
        {/* 휴대폰: 시술마다 등급별 가격을 3칸 격자로 */}
        <ul className="mt-6 border-t-2 md:hidden" style={{ borderColor: C.ink }}>
          {SERVICES.map((s) => (
            <li key={`m${s.id}`} className="border-b py-3" style={{ borderColor: C.line }}>
              <p className="text-[18px] font-bold">{s.name}</p>
              <p className="text-[14px]" style={{ color: C.muted }}>
                {s.detail}, {fmtMin(s.min)}
              </p>
              <dl className="mt-2 grid grid-cols-3 gap-1.5 tabular-nums">
                {PRICE_COLS.map((d) => (
                  <div key={d.id} className="rounded-[4px] px-2 py-1.5" style={{ background: C.soft }}>
                    <dt className="text-[13px]" style={{ color: C.muted }}>
                      {d.role}
                    </dt>
                    <dd className="whitespace-nowrap text-[15px] font-bold">{d.can.includes(s.id) ? won(priceOf(s, d)) : <span style={{ color: C.muted, fontWeight: 400 }}>-</span>}</dd>
                  </div>
                ))}
              </dl>
            </li>
          ))}
        </ul>
        <div className="mt-6 hidden md:block">
          <table className="w-full border-collapse text-[14px] sm:text-[15px] md:text-[16px]">
            <thead>
              <tr className="border-y-2 text-left" style={{ borderColor: C.ink }}>
                <th scope="col" className="py-3 pr-3 font-bold">시술</th>
                {PRICE_COLS.map((d) => (
                  <th key={d.id} scope="col" className="py-3 pl-2 text-right font-bold sm:pl-3" style={{ wordBreak: "keep-all" }}>
                    {d.role}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SERVICES.map((s) => (
                <tr key={s.id} className="border-b" style={{ borderColor: C.line }}>
                  <th scope="row" className="py-3 pr-3 text-left font-normal">
                    <span className="block text-[18px] font-bold">{s.name}</span>
                    <span className="block text-[14px]" style={{ color: C.muted }}>
                      {s.detail}, {fmtMin(s.min)}
                    </span>
                  </th>
                  {PRICE_COLS.map((d) => (
                    <td key={d.id} className="py-3 pl-2 whitespace-nowrap text-right font-bold tabular-nums sm:pl-3">
                      {d.can.includes(s.id) ? won(priceOf(s, d)) : <span style={{ color: C.muted, fontWeight: 400 }}>-</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[14px]" style={{ color: C.muted }}>
          어깨 아래 기장은 펌, 염색, 매직에 1만~3만 원이 더해져요. 남성 컷은 디자이너 기준 2만 원.
        </p>
      </section>

      {/* 3. 예약 */}
      <section id="hs-reserve" aria-labelledby="hs-reserve-title" className="mx-auto mt-14 max-w-[1200px] scroll-mt-4 px-4 md:mt-20 md:px-6">
        <SectionTitle id="hs-reserve-title">예약</SectionTitle>
        <ReserveForm today={today} nowMin={nowMin} dIdx={dIdx} setDIdx={setDIdx} />
      </section>

      {/* 4. 스타일북 */}
      <section id="hs-stylebook" aria-labelledby="hs-stylebook-title" className="mx-auto mt-14 max-w-[1200px] scroll-mt-4 px-4 md:mt-20 md:px-6">
        <SectionTitle id="hs-stylebook-title">스타일북</SectionTitle>
        <ul className="mt-6 grid grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-4">
          {STYLES.map((s) => (
            <li key={s.key}>
              <span className="block aspect-[4/5] overflow-hidden rounded-[4px]" style={{ background: C.soft }}>
                {/* eslint-disable-next-line @next/next/no-img-element -- 정적 export 라 next/image 최적화를 쓰지 않는다 */}
                <img src={`${IMG}/style-${s.key}.jpg`} alt={`${s.name} 시술 뒤 모습`} loading="lazy" width={600} height={800} className="h-full w-full object-cover" style={{ objectPosition: "50% 25%" }} />
              </span>
              <h3 className="mt-2 text-[18px] font-bold">{s.name}</h3>
              <p className="text-[14px] font-semibold" style={{ color: ACCENT }}>
                {s.combo.map((id) => SERVICE_BY_ID[id].name).join(" + ")}
              </p>
              <p className="mt-1 text-[14px] leading-[1.6]" style={{ color: C.body }}>
                {s.note}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* 5. 오시는 길, 영업시간 */}
      <section id="hs-location" aria-labelledby="hs-location-title" className="mx-auto mt-14 max-w-[1200px] scroll-mt-4 px-4 md:mt-20 md:px-6">
        <SectionTitle id="hs-location-title">오시는 길</SectionTitle>
        <div className="mt-6 grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="rounded-[6px] border p-5" style={{ borderColor: C.line, background: C.paper }}>
            <MapSketch accent={accent} />
            <dl className="mt-4 grid gap-3 text-[15px] leading-[1.6]">
              <div className="flex gap-2">
                <dt className="flex-none pt-0.5" aria-label="주소">
                  <MapPin size={18} aria-hidden />
                </dt>
                <dd>{ADDRESS}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="flex-none pt-0.5" aria-label="지하철">
                  <TrainFront size={18} aria-hidden />
                </dt>
                <dd>ㅇㅇ역 3번 출구 도보 4분</dd>
              </div>
              <div className="flex gap-2">
                <dt className="flex-none pt-0.5" aria-label="주차">
                  <Car size={18} aria-hidden />
                </dt>
                <dd>건물 지하 주차 2시간 무료, 만차 시 ㅇㅇ공영주차장</dd>
              </div>
              <div className="flex gap-2">
                <dt className="flex-none pt-0.5" aria-label="전화">
                  <Clock size={18} aria-hidden />
                </dt>
                <dd>
                  전화 {TEL}, {KAKAO}
                </dd>
              </div>
            </dl>
          </div>
          <Hours todayDow={todayDow} accent={accent} />
        </div>
      </section>

      <footer className="mx-auto mt-16 max-w-[1200px] border-t px-4 pb-24 pt-8 text-[14px] leading-[1.8] md:px-6" style={{ borderColor: C.line, color: C.muted }}>
        <p>
          <SampleLogo />
        </p>
        <p>
          {ADDRESS}, 전화 {TEL}
        </p>
        <p>화~일 {OPEN_H}:00 ~ {CLOSE_H}:00, 월요일 정기휴무</p>
        <DemoMakerInfo className="mt-6" />
      </footer>
      </div>
    </div>
  );
}

/* 포스터 첫 화면 */

const IMG = "/images/demo-hair-salon";
const HERO = STYLES.find((x) => x.key === "hush")!;
const GNB: [string, string][] = [
  ["hs-stylebook", "스타일"],
  ["hs-designers", "디자이너"],
  ["hs-menu", "가격"],
];

function Poster({ reduce, today, go, onReserve }: { reduce: boolean; today: Date; go: (id: string) => void; onReserve: (designerIdx: number) => void }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { amount: 0.25 });
  const [menu, setMenu] = useState(false);
  const openToday = today.getDay() !== 1;

  useEffect(() => {
    if (!menu) return;
    const f = (e: KeyboardEvent) => e.key === "Escape" && setMenu(false);
    window.addEventListener("keydown", f);
    return () => window.removeEventListener("keydown", f);
  }, [menu]);

  const jump = (id: string) => {
    setMenu(false);
    go(id);
  };

  return (
    <section ref={ref} id="hs-poster" aria-labelledby="hs-poster-title" style={{ background: C.bg }}>
      {/* GNB. 휴대폰은 햄버거 */}
      <header className="relative border-b" style={{ borderColor: C.line, background: C.paper }}>
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-3 px-4 md:px-6">
          <p>
            <SampleLogo />
          </p>
          <nav aria-label="메뉴" className="hidden items-center gap-2 md:flex">
            {GNB.map(([id, label]) => (
              <button key={id} type="button" onClick={() => go(id)} className={`h-11 rounded-[4px] px-3 text-[16px] font-bold hover:underline hover:underline-offset-4 ${focusRing}`} style={{ outlineColor: C.ink }}>
                {label}
              </button>
            ))}
            <button type="button" data-gtm-cta="hair-salon_poster_cta" onClick={() => go("hs-reserve")} className={`hs-accent-bg ml-2 inline-flex h-11 items-center gap-1.5 rounded-[4px] px-4 text-[16px] font-bold text-white ${focusRing}`} style={{ outlineColor: C.ink }}>
              <CalendarCheck size={18} aria-hidden />
              예약
            </button>
          </nav>
          <button
            type="button"
            onClick={() => setMenu((m) => !m)}
            aria-expanded={menu}
            aria-controls="hs-menu-panel"
            aria-label={menu ? "메뉴 닫기" : "메뉴 열기"}
            className={`inline-flex h-11 w-11 items-center justify-center rounded-[4px] md:hidden ${focusRing}`}
            style={{ outlineColor: C.ink }}
          >
            {menu ? <X size={24} aria-hidden /> : <Menu size={24} aria-hidden />}
          </button>
        </div>
        <AnimatePresence>
          {menu && (
            <motion.nav
              id="hs-menu-panel"
              aria-label="메뉴 펼침"
              initial={reduce ? false : { opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: EASE }}
              className="absolute inset-x-0 top-full z-30 border-b px-4 pb-3 md:hidden"
              style={{ borderColor: C.line, background: C.paper }}
            >
              {[...GNB, ["hs-reserve", "예약"], ["hs-location", "오시는 길"]].map(([id, label]) => (
                <button key={id} type="button" onClick={() => jump(id)} className={`flex h-12 w-full items-center border-b text-left text-[17px] font-bold last:border-b-0 ${focusRing}`} style={{ borderColor: C.line, outlineColor: C.ink }}>
                  {label}
                </button>
              ))}
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      <div className="mx-auto grid max-w-[1200px] gap-x-10 gap-y-5 px-4 pb-10 pt-5 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] md:grid-rows-[auto_minmax(0,1fr)] md:px-6 md:pt-8">
        {/* 제목과 오늘 영업 */}
        <div className="md:col-start-2 md:row-start-1">
          <h1 id="hs-poster-title" className="text-[28px] font-bold leading-[1.25] tracking-[-0.03em] md:text-[32px] lg:text-[36px]" style={{ wordBreak: "keep-all" }}>
            <span className="block">커트, 펌, 염색</span>
            <span className="block">디자이너 지정 예약</span>
          </h1>
          <p className="mt-2 inline-flex flex-wrap items-center gap-x-2 text-[15px] font-medium" style={{ color: C.body }}>
            <Clock size={16} aria-hidden />
            {openToday ? `오늘 ${OPEN_H}:00 ~ ${CLOSE_H}:00, 당일 예약 가능` : "오늘 정기휴무, 화요일부터 예약 가능"}
          </p>
        </div>

        {/* 스타일 사진 */}
        <div className="md:col-start-1 md:row-span-2 md:row-start-1">
          <div className="relative aspect-square w-full overflow-hidden rounded-[6px] sm:aspect-[4/3] md:aspect-auto md:h-[min(calc(100svh-190px),660px)] md:min-h-[440px]" style={{ background: C.soft }}>
            <motion.div className="absolute inset-0" initial={reduce ? false : { scale: 1.05 }} animate={{ scale: 1 }} transition={{ duration: reduce ? 0 : 1.6, ease: EASE }}>
              {/* eslint-disable-next-line @next/next/no-img-element -- 정적 export 라 next/image 최적화를 쓰지 않는다 */}
              <img
                src={`${IMG}/style-${HERO.key}.jpg`}
                alt={`${HERO.name} 시술 뒤 모습`}
                fetchPriority="high"
                className="absolute inset-0 h-full w-full object-cover"
                style={{ objectPosition: "50% 22%", scale: 1.12 }}
              />
            </motion.div>
            <p className="absolute bottom-3 left-3 rounded-[4px] px-2.5 py-1.5 text-[15px] font-bold" style={{ background: C.paper, color: C.ink }}>
              {HERO.name}
            </p>
          </div>
        </div>

        {/* 디자이너 */}
        <div className="min-w-0 md:col-start-2 md:row-start-2">
          <ul aria-label="디자이너" className="grid border-t" style={{ borderColor: C.line }}>
            {DESIGNERS.map((d, i) => (
              <li key={d.id} className="flex items-center gap-3 border-b py-3" style={{ borderColor: C.line }}>
                {/* eslint-disable-next-line @next/next/no-img-element -- 정적 export 라 next/image 최적화를 쓰지 않는다 */}
                <img src={`${IMG}/designer-${d.id}.jpg`} alt="" width={56} height={56} className="h-14 w-14 shrink-0 rounded-full object-cover" style={{ objectPosition: "50% 20%" }} />
                <div className="min-w-0 flex-1">
                  <p className="text-[17px] font-bold leading-tight">
                    <span className="mr-1.5 text-[14px] font-semibold" style={{ color: C.muted }}>
                      {d.role}
                    </span>
                    {d.name}
                  </p>
                  <p className="mt-0.5 truncate text-[14px]" style={{ color: C.body }}>
                    {d.good}
                  </p>
                </div>
                <button
                  type="button"
                  data-gtm-cta="hair-salon_poster_designer"
                  onClick={() => onReserve(i)}
                  aria-label={`${d.name} 예약`}
                  className={`h-11 shrink-0 rounded-[4px] border px-3 text-[15px] font-bold hover:bg-[var(--hs-accent)] hover:text-white ${focusRing}`}
                  style={{ borderColor: ACCENT, color: ACCENT, outlineColor: ACCENT }}
                >
                  예약
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 휴대폰 하단 고정 예약 버튼. 첫 화면이 보일 때만 */}
      <AnimatePresence>
        {inView && (
          <motion.div
            initial={reduce ? false : { y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { y: 16, opacity: 0 }}
            transition={{ duration: 0.2, ease: EASE }}
            className="fixed inset-x-0 bottom-0 z-40 border-t px-4 py-3 md:hidden"
            style={{ borderColor: C.line, background: C.paper }}
          >
            <button type="button" data-gtm-cta="hair-salon_poster_cta" onClick={() => go("hs-reserve")} className={`hs-accent-bg flex h-12 w-full items-center justify-center gap-1.5 rounded-[6px] text-[17px] font-bold text-white ${focusRing}`} style={{ outlineColor: C.ink }}>
              <CalendarCheck size={18} aria-hidden />
              예약
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

/* ── 공통 ─────────────────────────────────────────────── */

function SectionTitle({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="font-bold text-[34px] leading-[1.05] md:text-[44px]">
      {children}
    </h2>
  );
}

/* ── 예약 신청 ────────────────────────────────────────── */

function ReserveForm({ today, nowMin, dIdx, setDIdx }: { today: Date; nowMin: number; dIdx: number; setDIdx: (i: number) => void }) {
  const designer = DESIGNERS[dIdx];
  const days = useMemo(() => Array.from({ length: DAYS }, (_, i) => daysAgo(today, -i)).filter((d) => d.getDay() !== 1), [today]);
  const [serviceId, setServiceId] = useState<ServiceId>("cut");
  const [day, setDay] = useState(0);
  const [time, setTime] = useState(TIMES[4]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState<Done | null>(null);

  const service = designer.can.includes(serviceId) ? SERVICE_BY_ID[serviceId] : SERVICE_BY_ID.cut;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) return setErr("이름을 두 글자 이상 적어 주세요");
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10 || digits.length > 11) return setErr("휴대폰 번호를 확인해 주세요");
    setErr(null);
    const d = days[day];
    const no = `H${String(d.getFullYear()).slice(2)}${p2(d.getMonth() + 1)}${p2(d.getDate())}-${time.split(":")[0]}${dIdx}`;
    setDone({ no, name, phone, date: d, time, service, designer });
  };

  if (done) return <DoneCard done={done} today={today} nowMin={nowMin} onReset={() => setDone(null)} />;

  const field = `mt-1 w-full rounded-[4px] border px-3 py-2.5 text-[16px] ${focusRing}`;
  const fieldStyle = { borderColor: C.line, outlineColor: ACCENT, background: C.paper } as const;

  return (
    <form onSubmit={submit} noValidate className="mt-6 grid max-w-[720px] gap-4 rounded-[6px] border p-5 sm:grid-cols-2 md:p-6" style={{ borderColor: C.line, background: C.paper }}>
      <label className="block text-[14px] font-bold">
        디자이너
        <select value={dIdx} onChange={(e) => setDIdx(Number(e.target.value))} className={field} style={fieldStyle}>
          {DESIGNERS.map((d, i) => (
            <option key={d.id} value={i}>
              {d.role} {d.name}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-[14px] font-bold">
        시술
        <select value={service.id} onChange={(e) => setServiceId(e.target.value as ServiceId)} className={field} style={fieldStyle}>
          {SERVICES.filter((s) => designer.can.includes(s.id)).map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} {won(priceOf(s, designer))}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-[14px] font-bold">
        날짜
        <select value={day} onChange={(e) => setDay(Number(e.target.value))} className={field} style={fieldStyle}>
          {days.map((d, i) => (
            <option key={i} value={i}>
              {fmtKo(d)}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-[14px] font-bold">
        시간
        <select value={time} onChange={(e) => setTime(e.target.value)} className={field} style={fieldStyle}>
          {TIMES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-[14px] font-bold">
        이름
        <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={field} style={fieldStyle} />
      </label>
      <label className="block text-[14px] font-bold">
        휴대폰
        <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" placeholder="010-0000-0000" className={field} style={fieldStyle} />
      </label>
      {err && (
        <p role="alert" className="text-[14px] font-bold sm:col-span-2" style={{ color: C.error }}>
          {err}
        </p>
      )}
      <div className="sm:col-span-2">
        <p className="text-[14px]" style={{ color: C.muted }}>
          {service.name} {fmtMin(service.min)} 소요, {won(priceOf(service, designer))}. 확인 연락을 드리면 예약이 확정돼요.
        </p>
        <button type="submit" data-gtm-cta="hair-salon_reserve" className={`mt-3 w-full rounded-[4px] px-4 py-3 text-[16px] font-semibold text-white ${focusRing}`} style={{ background: ACCENT, outlineColor: C.ink }}>
          예약하기
        </button>
        <p className="mt-3 text-[13px] leading-[1.6]" style={{ color: C.muted }}>
          예약 변경과 취소는 하루 전까지 {KAKAO}로 해 주세요.
        </p>
      </div>
    </form>
  );
}

function DoneCard({ done, today, nowMin, onReset }: { done: Done; today: Date; nowMin: number; onReset: () => void }) {
  // 영업 중이면 1시간 안에, 아니면 다음 영업일 문 열고 확인 연락한다.
  const open = today.getDay() !== 1 && nowMin >= OPEN_H * 60 && nowMin < (CLOSE_H - 1) * 60;
  let next = daysAgo(today, -1);
  if (next.getDay() === 1) next = daysAgo(today, -2);
  const reply = open ? "오늘 1시간 안" : `${fmtKo(next)} ${OPEN_H}:00 이후`;
  const row = "grid grid-cols-[88px_minmax(0,1fr)] gap-x-3 py-2 text-[15px]";
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: EASE }} className="mt-6 max-w-[640px] rounded-[6px] border p-5 md:p-7" style={{ borderColor: ACCENT, background: C.paper }} aria-live="polite">
      <p className="inline-flex items-center gap-1.5 text-[14px] font-bold" style={{ color: ACCENT }}>
        <Check size={16} aria-hidden /> 예약 접수 완료
      </p>
      <p className="font-bold mt-1 text-[36px] leading-none tabular-nums">
        {done.no}
      </p>
      <dl className="mt-4 divide-y border-y" style={{ borderColor: C.line }}>
        <div className={row} style={{ borderColor: C.line }}>
          <dt style={{ color: C.muted }}>일시</dt>
          <dd className="font-bold">
            {fmtKo(done.date)} {done.time}
          </dd>
        </div>
        <div className={row} style={{ borderColor: C.line }}>
          <dt style={{ color: C.muted }}>디자이너</dt>
          <dd className="font-bold">
            {done.designer.role} {done.designer.name}
          </dd>
        </div>
        <div className={row} style={{ borderColor: C.line }}>
          <dt style={{ color: C.muted }}>시술</dt>
          <dd className="font-bold">
            {done.service.name}, {fmtMin(done.service.min)}, {won(priceOf(done.service, done.designer))}
          </dd>
        </div>
        <div className={row} style={{ borderColor: C.line }}>
          <dt style={{ color: C.muted }}>예약자</dt>
          <dd className="font-bold tabular-nums">
            {maskName(done.name)} {maskPhone(done.phone)}
          </dd>
        </div>
        <div className={row} style={{ borderColor: C.line }}>
          <dt style={{ color: C.muted }}>확인 연락</dt>
          <dd className="font-bold">
            {KAKAO}, {reply}
          </dd>
        </div>
      </dl>
      <ul className="mt-4 grid gap-1 text-[14px] leading-[1.6]" style={{ color: C.muted }}>
        <li>예약 변경과 취소는 하루 전까지 {KAKAO}로 해 주세요. 당일은 전화 {TEL}로 받아요.</li>
        <li>예약 시간보다 10분 이상 늦으시면 시술 시간이 줄거나 다음 시간으로 옮겨질 수 있어요.</li>
        <li>펌과 염색은 시술 전 상담 시간 10분이 더 걸려요.</li>
      </ul>
      <button type="button" onClick={onReset} className={`mt-5 rounded-[4px] border px-4 py-2 text-[15px] font-semibold ${focusRing}`} style={{ borderColor: C.line, outlineColor: ACCENT }}>
        다른 시간 보기
      </button>
    </motion.div>
  );
}

/* ── 오시는 길 ────────────────────────────────────────── */

/** 약도. 큰길 하나, 골목 하나, 역, 가게 위치만 그린다. */
function MapSketch({ accent }: { accent: string }) {
  return (
    <svg viewBox="0 0 400 200" className="w-full rounded-[4px]" role="img" aria-label="약도. ㅇㅇ역 3번 출구에서 큰길을 따라 걷다 첫 골목 안 2층" style={{ background: C.soft }}>
      <path d="M0 130 H400" stroke="#ffffff" strokeWidth="26" />
      <path d="M250 130 V0" stroke="#ffffff" strokeWidth="16" />
      <path d="M0 130 H400" stroke="#cfcfcf" strokeWidth="1" strokeDasharray="6 6" />
      <rect x="60" y="138" width="44" height="22" rx="3" fill="#ffffff" stroke="#bdbdbd" />
      <text x="82" y="153" textAnchor="middle" fontSize="11" fontWeight="700" fill={C.ink}>
        ㅇㅇ역
      </text>
      <text x="82" y="176" textAnchor="middle" fontSize="10" fill={C.muted}>
        3번 출구
      </text>
      <rect x="262" y="52" width="60" height="44" rx="3" fill={accent} />
      <text x="292" y="71" textAnchor="middle" fontSize="11" fontWeight="700" fill="#ffffff">
        미용실
      </text>
      <text x="292" y="86" textAnchor="middle" fontSize="11" fontWeight="700" fill="#ffffff">
        2층
      </text>
      <path d="M104 148 H236 V96 H258" fill="none" stroke={C.ink} strokeWidth="2" strokeDasharray="4 4" />
      <text x="170" y="112" textAnchor="middle" fontSize="11" fill={C.muted}>
        도보 4분
      </text>
      <rect x="330" y="140" width="56" height="30" rx="3" fill="#ffffff" stroke="#bdbdbd" />
      <text x="358" y="159" textAnchor="middle" fontSize="10" fontWeight="700" fill={C.ink}>
        지하주차
      </text>
    </svg>
  );
}

function Hours({ todayDow, accent }: { todayDow: number; accent: string }) {
  const rows = [1, 2, 3, 4, 5, 6, 0];
  return (
    <div className="rounded-[6px] border p-5" style={{ borderColor: C.line, background: C.paper }}>
      <h3 className="font-bold text-[22px] leading-none">
        영업시간
      </h3>
      <ul className="mt-4 divide-y" style={{ borderColor: C.line }}>
        {rows.map((dow) => {
          const isToday = dow === todayDow;
          const closed = dow === 1;
          return (
            <li key={dow} className="flex items-center justify-between py-2.5 text-[16px]" style={{ borderColor: C.line, fontWeight: isToday ? 800 : 400, color: closed && !isToday ? C.muted : C.ink }} aria-current={isToday ? "date" : undefined}>
              <span className="inline-flex items-center gap-2">
                {isToday && <span className="rounded-[2px] px-1.5 py-0.5 text-[12px] font-bold text-white" style={{ background: accent }}>오늘</span>}
                {DOW[dow]}요일
              </span>
              <span className="tabular-nums">{closed ? "정기휴무" : `${OPEN_H}:00 ~ ${CLOSE_H}:00`}</span>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-[14px] leading-[1.6]" style={{ color: C.muted }}>
        마지막 접수는 시술이 20:00 안에 끝나는 시간까지예요. 펌과 매직은 17:30이 마지막이에요.
      </p>
    </div>
  );
}

/* 로고: 메인 사이트와 같은 곰 로고 + 곰파트너(크게) + 업종(작게) */
function SampleLogo({ light, small }: { light?: boolean; small?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2" style={{ color: light ? "#ffffff" : "#111111" }}>
      <span className="flex items-baseline gap-1 whitespace-nowrap">
        <span className={`${small ? "text-[18px]" : "text-[20px]"} font-bold leading-none tracking-[-0.03em]`}>미용실</span>
      </span>
    </span>
  );
}
