"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Car, ChevronLeft, ChevronRight, Clock, MapPin, Store, X } from "lucide-react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { daysAgo, fmtKo, useDemoToday } from "@/hooks/useDemoToday";
import { maskName, maskPhone } from "@/components/demos/LeadReceivedPanel";
import { DemoMakerInfo } from "@/components/demos/DemoMakerInfo";

/* 전통주 보틀숍 샘플: 가상의 전통주 보틀숍 곰파트너. 상호, 주소, 술 이름은 모두 가상이다.
   첫 화면과 병 사진 출처: AI 생성(Z-Image-Turbo, Apache 2.0)

   국내 전통주 보틀숍과 전통주 쇼핑몰은 첫 진입에 성인 인증 창을 먼저 띄운다.
   메뉴는 막걸리, 약주, 청주, 증류주, 과실주로 종류별 분류, 첫 화면에 추천과 선물세트, 시음회 안내,
   오시는 길(주차, 영업시간)을 둔다. 상품 상세는 도수, 용량, 맛 설명, 어울리는 음식, 보관법을 적는다.
   하단에는 지나친 음주 경고 문구를 둔다.

   11-08 법령 확인(law.go.kr 원문)
   - 국세청 「주류의 통신판매에 관한 명령위임 고시」 제3조: 통신판매(택배)는 승인받은 전통주 제조자 등만 할 수 있다.
     이 매장은 소매점(보틀숍)이라 제3조 대상이 아니고, 제3조의2 제2호(통신판매 수단으로 주문받아 판매영업장 안에서
     직접 대면 인도하는 주류소매업자)만 해당한다. 그래서 온라인 주문은 매장 픽업만 받고 택배, 배송 안내는 두지 않는다.
   - 제6조: 제3조 사업자가 아니면 배송, 결제방법, 계좌번호 같은 판매 정보를 표시하지 않는다. 결제는 매장에서 받을 때 한다.
   - 성인 확인: 제5조 제1항 제6호 다목(전자서명인증사업자가 제공하는 성인인증 서비스) 방식으로 휴대폰 본인인증 화면을 둔다.
     실제 인증 연동은 없고 화면 흐름만 보여 준다. 픽업 때는 청소년 보호법 제28조 제4항대로 신분증으로 나이와 본인 여부를 확인한다.
   - 청소년 보호법 제2조 제1호: 청소년은 19세 미만, 다만 19세가 되는 해의 1월 1일을 맞이한 사람은 제외(연 나이).
     그래서 "만 19세" 대신 출생 연도 기준(올해 - 19년 12월 31일 이전 출생)으로 적는다.

   상호작용(모두 브라우저 안에서만 돈다. 실제로 보내지 않는다)
   1. 주종 탭: 막걸리, 약주, 청주, 증류주, 과실주로 목록을 나눈다.
   2. 병 상세: 도수, 용량, 가격, 맛 설명, 어울리는 음식, 보관법. 이전, 다음 병으로 넘기기. 매장 픽업 주문.
   3. 선물세트: 가격대별로 미리 꾸린 세트 세 가지.
   4. 시음회 예약: 다음 두 주 토요일 2회차, 인원, 이름, 휴대폰. 접수 완료 화면.
   5. 매장 안내와 오시는 길: 영업시간(오늘 요일 진하게), 주차, 픽업 주문 안내.

   첫 화면(성인 확인 뒤 처음 보이는 화면): 주종 메뉴, 매장 선반 사진, 이번 주 추천 술.
   확인을 누르면 사진만 1.6초 동안 천천히 다가온다. 반복 움직임은 없다. */

const BRAND = "전통주 보틀숍";
const ADDRESS = "서울 ㅇㅇ구 ㅇㅇ로 00, 1층";
const KAKAO = "카카오톡 채널 전통주 보틀숍";

/* 바닥글 사업자 정보: 전자상거래법 제10조 제1항, 제13조 제1항 제3호. 사이트에서 픽업 주문을 받아 통신판매업 신고 포함 */
const BIZ: [string, string][] = [
  ["상호", BRAND],
  ["대표자", "ㅇㅇㅇ"],
  ["주소", ADDRESS],
  ["전화", "02-000-0000"],
  ["메일", "help@example.com"],
  ["사업자등록번호", "000-00-00000"],
  ["통신판매업 신고", "제0000-서울ㅇㅇ-0000호(ㅇㅇ구청)"],
];

/* 로고: 메인 사이트와 같은 곰 로고 + 곰파트너(크게) + 업종(작게) */
function SampleLogo({ light, small }: { light?: boolean; small?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2" style={{ color: light ? "#ffffff" : "#111111" }}>
      <span className="flex items-baseline gap-1 whitespace-nowrap">
        <span className={`${small ? "text-[18px]" : "text-[20px]"} font-bold tracking-[-0.03em]`}>전통주 보틀숍</span>
      </span>
    </span>
  );
}


/* 모션 곡선 */
const EASE = [0.22, 1, 0.36, 1] as const;

const IMG = "/images/demo-liquor-shop";

/* 바탕은 옅은 회색과 흰색, 강조색은 옹기 빛 적갈색 하나 */
const C = {
  paper: "#f7f7f5",
  white: "#ffffff",
  ink: "#111111",
  body: "#4b4b4b",
  muted: "#767676",
  line: "#e5e5e5",
  accent: "#8a3a2e",
  error: "#b42318",
};

type Kind = "막걸리" | "약주" | "청주" | "증류주" | "과실주";

const KINDS: Kind[] = ["막걸리", "약주", "청주", "증류주", "과실주"];

type Bottle = {
  id: string;
  name: string;
  kind: Kind;
  abv: number;
  price: number;
  ml: number;
  /** 맛 설명 한두 문장 */
  note: string;
  food: string;
  keep: string;
  pick?: string;
};

const BOTTLES: Bottle[] = [
  { id: "m1", name: "첫눈 생막걸리", kind: "막걸리", abv: 6, price: 7000, ml: 750, note: "쌀 단맛이 먼저 오고 탄산이 가볍게 올라오는 생막걸리. 처음 드시는 분께 권해요.", food: "파전, 두부김치", keep: "냉장 보관. 개봉 뒤 3일 안에 드세요.", pick: "입문" },
  { id: "m2", name: "느티 탁주", kind: "막걸리", abv: 8, price: 9000, ml: 750, note: "단맛과 산미가 고르게 섞인 탁주. 탄산이 있어 기름진 음식과 잘 맞아요.", food: "제육볶음, 김치전", keep: "냉장 보관. 흔들어서 드세요." },
  { id: "m3", name: "밤밭 밤막걸리", kind: "막걸리", abv: 6, price: 12000, ml: 500, note: "구운 밤 향이 진하고 달콤해요. 걸쭉한 편이라 차갑게 드시면 좋아요.", food: "약과, 구운 밤", keep: "냉장 보관. 개봉 뒤 2일 안에 드세요.", pick: "선물" },
  { id: "m4", name: "누룩향 탁주", kind: "막걸리", abv: 12, price: 15000, ml: 500, note: "단맛을 줄이고 누룩 향을 살린 진한 탁주. 산미와 여운이 길어요.", food: "홍어 삼합, 묵은지", keep: "냉장 보관. 가라앉은 침전물은 섞어 드세요." },
  { id: "m5", name: "솔잎 막걸리", kind: "막걸리", abv: 7, price: 8500, ml: 750, note: "솔잎 향이 은은하게 남는 막걸리. 단맛은 보통, 끝맛이 깔끔해요.", food: "도토리묵, 나물", keep: "냉장 보관. 개봉 뒤 3일 안에 드세요." },
  { id: "y1", name: "가을들 약주", kind: "약주", abv: 13, price: 28000, ml: 500, note: "햇쌀로 빚어 부드럽고 향이 고와요. 단맛은 보통, 여운이 긴 편이에요.", food: "전복찜, 갈비찜", keep: "서늘한 곳에 두고 개봉 뒤 냉장 보관." },
  { id: "y2", name: "매화 약주", kind: "약주", abv: 15, price: 32000, ml: 500, note: "매화 향이 맑게 피는 드라이한 약주. 산미가 있어 생선과 잘 어울려요.", food: "회, 생선구이", keep: "서늘한 곳에 두고 개봉 뒤 냉장 보관.", pick: "선물" },
  { id: "y3", name: "대추 약주", kind: "약주", abv: 14, price: 25000, ml: 375, note: "대추를 넣어 달고 묵직해요. 단맛과 여운이 진한 편이에요.", food: "약식, 떡갈비", keep: "서늘한 곳에 두고 개봉 뒤 냉장 보관." },
  { id: "c1", name: "맑은새 청주", kind: "청주", abv: 14, price: 36000, ml: 500, note: "맑고 가벼운 드라이 청주. 차갑게 드시면 산뜻해요.", food: "회, 초밥", keep: "냉장 보관. 차갑게 드세요." },
  { id: "c2", name: "서리 청주", kind: "청주", abv: 16, price: 42000, ml: 500, note: "바디감이 있고 쌀 향이 오래 남는 청주. 따뜻한 음식과도 잘 맞아요.", food: "장어구이, 수육", keep: "냉장 보관. 개봉 뒤 2주 안에 드세요.", pick: "추천" },
  { id: "c3", name: "벼꽃 청주", kind: "청주", abv: 13, price: 30000, ml: 375, note: "과일 향이 은은하고 달콤한 청주. 도수가 낮아 편하게 마시기 좋아요.", food: "잡채, 모둠전", keep: "냉장 보관. 차갑게 드세요." },
  { id: "s1", name: "소나무 소주 25", kind: "증류주", abv: 25, price: 45000, ml: 375, note: "솔 향이 살짝 나는 맑은 증류식 소주. 단맛 없이 깔끔해요.", food: "삼겹살, 족발", keep: "실온 보관. 직사광선을 피하세요." },
  { id: "s2", name: "참나무 소주 41", kind: "증류주", abv: 41, price: 98000, ml: 500, note: "참나무통에서 숙성해 향이 깊고 바디가 묵직해요. 여운이 아주 길어요.", food: "육회, 한우 구이", keep: "실온 보관. 개봉 뒤에도 오래 두고 드실 수 있어요.", pick: "선물" },
  { id: "s3", name: "쌀소주 32", kind: "증류주", abv: 32, price: 38000, ml: 375, note: "쌀로 빚은 부드러운 증류주. 단맛이 조금 있어 처음 드시기 편해요.", food: "보쌈, 전골", keep: "실온 보관. 직사광선을 피하세요." },
  { id: "s4", name: "보리소주 45", kind: "증류주", abv: 45, price: 72000, ml: 500, note: "보리 고소함이 진한 고도수 증류주. 얼음을 넣어 드셔도 좋아요.", food: "곱창, 양대창", keep: "실온 보관. 서늘한 곳에 세워 두세요." },
  { id: "f1", name: "복숭아 와인", kind: "과실주", abv: 12, price: 24000, ml: 500, note: "복숭아 향이 진하고 달콤한 과실주. 차갑게 드시면 좋아요.", food: "치즈, 과일", keep: "냉장 보관. 개봉 뒤 5일 안에 드세요.", pick: "입문" },
  { id: "f2", name: "오미자 술", kind: "과실주", abv: 14, price: 22000, ml: 375, note: "오미자 특유의 새콤함이 살아 있는 과실주. 단맛은 보통이에요.", food: "오리구이, 떡볶이", keep: "서늘한 곳에 두고 개봉 뒤 냉장 보관." },
  { id: "f3", name: "사과 스파클링", kind: "과실주", abv: 7, price: 19000, ml: 750, note: "사과 향과 탄산이 가벼운 스파클링. 산뜻하게 시작하기 좋아요.", food: "샐러드, 피자", keep: "냉장 보관. 차갑게 바로 드세요." },
];

/** 선물세트. 가격대별로 미리 꾸린 세트 */
const GIFTS: { name: string; band: string; items: string[]; pack: "box" | "cloth"; price: number }[] = [
  { name: "막걸리 맛보기 세트", band: "3만원대", items: ["첫눈 생막걸리", "밤밭 밤막걸리", "솔잎 막걸리"], pack: "cloth", price: 31500 },
  { name: "약주와 청주 세트", band: "7만원대", items: ["매화 약주", "서리 청주"], pack: "box", price: 79000 },
  { name: "증류주 명절 세트", band: "10만원 이상", items: ["참나무 소주 41", "소나무 소주 25"], pack: "box", price: 148000 },
];

const TASTING_FEE = 15000;
const TASTING_CAP = 8;
const SESSIONS = ["14:00", "16:00"];
const HOURS: { day: string; time: string }[] = [
  { day: "월", time: "휴무" },
  { day: "화", time: "13:00 ~ 21:00" },
  { day: "수", time: "13:00 ~ 21:00" },
  { day: "목", time: "13:00 ~ 21:00" },
  { day: "금", time: "13:00 ~ 21:00" },
  { day: "토", time: "12:00 ~ 20:00" },
  { day: "일", time: "12:00 ~ 20:00" },
];
const DOW_IDX = [1, 2, 3, 4, 5, 6, 0];

/* 제목은 본문과 같은 Pretendard, 굵게 */
const serifF = { fontWeight: 700 } as const;
const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;
const p2 = (n: number) => String(n).padStart(2, "0");
const focusRing = "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#111111]";

/** 오늘 뒤의 토요일 n개. 오늘이 토요일이면 다음 주부터. */
function nextSaturdays(today: Date, n: number) {
  const first = ((6 - today.getDay() + 7) % 7) || 7;
  return Array.from({ length: n }, (_, i) => daysAgo(today, -(first + i * 7)));
}

/** 회차마다 이미 찬 자리. 실제로는 예약 시트에서 읽는다. */
function takenSeats(dayIdx: number, slot: number) {
  return ((dayIdx * 5 + slot * 3 + 2) % 6) + 1;
}

/** 다음 영업일(월요일 휴무) */
function nextOpenDay(today: Date) {
  const d = daysAgo(today, -1);
  return d.getDay() === 1 ? daysAgo(d, -1) : d;
}

export function LiquorShopDemo() {
  const today = useDemoToday();
  const reduce = useReducedMotionSafe();

  const [age, setAge] = useState<"ask" | "yes" | "no">("ask");
  const [kind, setKind] = useState<Kind | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  const shown = useMemo(() => BOTTLES.filter((b) => !kind || b.kind === kind), [kind]);

  useEffect(() => {
    const f = () => {
      setSelected(null);
      window.scrollTo({ top: 0 });
    };
    window.addEventListener("demo:go-home", f);
    return () => window.removeEventListener("demo:go-home", f);
  }, []);

  // 성인 확인 창이 떠 있을 때는 뒤 화면이 스크롤되지 않게 한다.
  useEffect(() => {
    if (age === "yes") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [age]);

  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  const tab = (on: boolean) => ({
    className: `min-h-11 flex-none rounded-[6px] border px-4 text-[15px] font-semibold ${focusRing}`,
    style: on ? { background: C.ink, color: C.white, borderColor: C.ink } : { background: C.white, color: C.ink, borderColor: C.line },
  });

  return (
    <div
      className="min-h-screen overflow-x-clip pb-24 lg:pb-10"
      style={{ color: C.ink, backgroundColor: C.paper }}
    >
      <AgeGate state={age} onAnswer={setAge} reduce={reduce} adultBorn={today.getFullYear() - 19} />

      <div aria-hidden={age !== "yes"}>
        <Poster
          ready={age === "yes"}
          reduce={reduce}
          onMenuKind={(k) => {
            setKind(k);
            go("ls-grid");
          }}
          onOpen={setSelected}
          go={go}
        />

        {/* 주종 탭과 병 목록 */}
        <section id="ls-grid" aria-labelledby="ls-grid-title" className="mx-auto mt-8 max-w-[1200px] scroll-mt-4 px-4 md:px-6">
          <SectionTitle id="ls-grid-title">전체 상품</SectionTitle>
          <div className="flex items-center justify-between gap-3">
            <div role="group" aria-label="주종" className="-mx-4 flex min-w-0 gap-1.5 overflow-x-auto px-4 md:mx-0 md:px-0">
              {[null, ...KINDS].map((k) => {
                const t = tab(k === kind);
                return (
                  <button key={k ?? "all"} type="button" aria-pressed={k === kind} onClick={() => setKind(k)} className={t.className} style={t.style}>
                    {k ?? "전체"}
                  </button>
                );
              })}
            </div>
            <p className="hidden flex-none text-[15px] tabular-nums sm:block" style={{ color: C.muted }} aria-live="polite">
              {shown.length}개 상품
            </p>
          </div>

          <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-5" style={{ listStyle: "none", padding: 0 }}>
            {shown.map((b) => (
              <BottleCard key={b.id} b={b} onOpen={() => setSelected(b.id)} />
            ))}
          </ul>
        </section>

        <section id="ls-gift" aria-labelledby="ls-gift-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-4 px-4 md:mt-24 md:px-6">
          <SectionTitle id="ls-gift-title">선물세트</SectionTitle>
          <GiftSets />
        </section>

        <section id="ls-tasting" aria-labelledby="ls-tasting-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-4 px-4 md:mt-24 md:px-6">
          <SectionTitle id="ls-tasting-title">주말 시음회</SectionTitle>
          <TastingForm today={today} reduce={reduce} />
        </section>

        <section id="ls-info" aria-labelledby="ls-info-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-4 px-4 md:mt-24 md:px-6">
          <SectionTitle id="ls-info-title">매장 안내와 오시는 길</SectionTitle>
          <StoreInfo today={today} />
        </section>

        <footer className="mx-auto mt-16 max-w-[1200px] border-t px-4 pt-8 text-[14px] leading-[1.8] md:px-6" style={{ borderColor: C.line, color: C.muted }}>
          <p>
            <SampleLogo />
          </p>
          <dl className="mt-3 flex flex-wrap gap-x-4 gap-y-0.5">
            {BIZ.map(([k, v]) => (
              <div key={k} className="flex gap-1.5">
                <dt>{k}</dt>
                <dd className="tabular-nums" style={{ color: C.body }}>
                  {v}
                </dd>
              </div>
            ))}
          </dl>
          <p>{KAKAO}</p>
          {/* 전자상거래법 제10조 이용약관, 개인정보 보호법 제30조 처리방침. 다른 샘플과 같이 눌러도 창은 열리지 않는다 */}
          <p className="mt-2 flex gap-4">
            <button type="button" className={`font-bold hover:underline ${focusRing}`} style={{ color: C.ink }}>
              이용약관
            </button>
            <button type="button" className={`font-bold hover:underline ${focusRing}`} style={{ color: C.ink }}>
              개인정보처리방침
            </button>
          </p>
          <p className="mt-3">경고: 지나친 음주는 뇌졸중, 기억력 손상이나 치매를 유발합니다. 임신 중 음주는 기형아 출생 위험을 높입니다.</p>
          <DemoMakerInfo className="mt-6" />
        </footer>
      </div>

      <AnimatePresence>
        {selected && (
          <DetailModal
            key="detail"
            list={shown.length ? shown : BOTTLES}
            id={selected}
            reduce={reduce}
            onClose={() => setSelected(null)}
            onMove={setSelected}
            today={today}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── 첫 화면: 매장 사진 + 이번 주 추천 ─────────────────── */

/* 실제 전통주 사이트처럼 성인 확인 뒤 상단에 주종 메뉴를 두고, 첫 화면은 매장 선반 사진과 이번 주 추천 술.
   추천 병을 누르면 상세 창이 열린다.
   모션: 확인을 누르면 사진만 1.04배에서 1.6초 동안 천천히 다가온다. 동작 줄이기면 멈춘 사진. */
const LQ_MORE: [string, string][] = [
  ["ls-gift", "선물세트"],
  ["ls-tasting", "시음회"],
  ["ls-info", "매장"],
];

function Poster({
  ready,
  reduce,
  onMenuKind,
  onOpen,
  go,
}: {
  ready: boolean;
  reduce: boolean;
  onMenuKind: (k: Kind) => void;
  onOpen: (id: string) => void;
  go: (id: string) => void;
}) {
  const navBtn = `min-h-11 flex-none rounded-[4px] px-3 text-[15px] font-semibold underline-offset-[6px] hover:underline ${focusRing}`;
  const picks = BOTTLES.filter((b) => b.pick);

  return (
    <section id="ls-poster" aria-labelledby="ls-poster-title" style={{ background: C.paper }}>
      <header className="border-b" style={{ background: C.white, borderColor: C.line }}>
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-3 px-4 md:px-6">
          <SampleLogo small />
          <button type="button" onClick={() => go("ls-tasting")} data-gtm-cta="liquor-shop_poster_cta" className={`inline-flex min-h-11 flex-none items-center rounded-[6px] px-4 text-[15px] font-semibold md:hidden ${focusRing}`} style={{ background: C.accent, color: C.white }}>
            시음회 예약
          </button>
          <nav aria-label="주요 메뉴" className="hidden items-center md:flex">
            {KINDS.map((k) => (
              <button key={k} type="button" onClick={() => onMenuKind(k)} className={navBtn}>
                {k}
              </button>
            ))}
            <span aria-hidden className="mx-2 h-4 w-px" style={{ background: C.line }} />
            {LQ_MORE.map(([id, label]) => (
              <button key={id} type="button" onClick={() => go(id)} className={navBtn} style={{ color: C.body }}>
                {label}
              </button>
            ))}
          </nav>
        </div>
        {/* 휴대폰: 가로로 넘기는 메뉴 줄 */}
        <nav aria-label="주요 메뉴" className="flex overflow-x-auto border-t px-2 md:hidden" style={{ borderColor: C.line }}>
          {KINDS.map((k) => (
            <button key={k} type="button" onClick={() => onMenuKind(k)} className={navBtn}>
              {k}
            </button>
          ))}
          {LQ_MORE.map(([id, label]) => (
            <button key={id} type="button" onClick={() => go(id)} className={navBtn} style={{ color: C.body }}>
              {label}
            </button>
          ))}
        </nav>
      </header>

      {/* 매장 선반 사진 */}
      <div className="relative h-[220px] overflow-hidden md:h-[min(52svh,460px)]" style={{ background: "#141414" }}>
        <motion.div
          className="absolute inset-0"
          initial={false}
          animate={ready && !reduce ? { scale: [1.04, 1] } : { scale: 1 }}
          transition={{ duration: ready && !reduce ? 1.6 : 0, ease: EASE }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- 정적 export 라 next/image 최적화를 쓰지 않는다 */}
          <img
            src={`${IMG}/hero.jpg`}
            srcSet={`${IMG}/hero-sm.jpg 960w, ${IMG}/hero.jpg 1920w`}
            sizes="100vw"
            alt="원목 선반에 흰 라벨 막걸리와 약주 병이 줄지어 있고 오른쪽에 짙은 옹기 항아리가 놓인 사진"
            fetchPriority="high"
            className="h-full w-full object-cover"
            style={{ objectPosition: "62% 55%" }}
          />
        </motion.div>
      </div>

      <div className="mx-auto max-w-[1200px] px-4 pb-10 pt-5 md:px-6 md:pb-12 md:pt-7">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
          <h1 id="ls-poster-title" className="text-[24px] leading-[1.3] tracking-[-0.03em] [word-break:keep-all] md:text-[32px]" style={serifF}>
            전국 양조장 전통주, 주문하고 매장에서 받기
          </h1>
          <p className="text-[15px]" style={{ color: C.muted }}>
            화요일 ~ 일요일 영업
          </p>
        </div>

        <h2 className="mt-8 text-[18px] font-bold">이번 주 추천</h2>
        <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-6" style={{ listStyle: "none", padding: 0 }}>
          {picks.map((b) => (
            <li key={b.id}>
              <button type="button" onClick={() => onOpen(b.id)} aria-label={`${b.name} 상세 보기`} className={`flex h-full w-full flex-col items-start rounded-[6px] border p-3 text-left ${focusRing}`} style={{ background: C.white, borderColor: C.line }}>
                <span className="flex h-[130px] w-full items-end justify-center">
                  <BottleArt b={b} height={120} />
                </span>
                <span className="mt-2 rounded-[4px] px-1.5 py-0.5 text-[12px] font-semibold" style={{ background: C.paper, color: C.accent }}>
                  {b.pick}
                </span>
                <span className="mt-1 block text-[15px] font-bold leading-[1.3]">{b.name}</span>
                <span className="mt-0.5 block text-[13px] tabular-nums" style={{ color: C.muted }}>
                  {b.kind} {b.abv}도 {b.ml}ml
                </span>
                <span className="mt-0.5 block text-[15px] tabular-nums">{won(b.price)}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
/* ── 성인 확인 ─────────────────────────────────────────── */

function AgeGate({ state, onAnswer, reduce, adultBorn }: { state: "ask" | "yes" | "no"; onAnswer: (s: "yes" | "no") => void; reduce: boolean; adultBorn: number }) {
  const authRef = useRef<HTMLButtonElement>(null);
  const [checking, setChecking] = useState(false);
  useEffect(() => {
    if (state === "ask") authRef.current?.focus({ preventScroll: true });
  }, [state]);
  // 실제로는 본인인증 업체 창에서 생년월일을 받아 성인 여부를 판단한다. 샘플은 잠깐 확인 중을 보여 주고 통과시킨다.
  useEffect(() => {
    if (!checking) return;
    const t = window.setTimeout(() => {
      setChecking(false);
      onAnswer("yes");
    }, reduce ? 0 : 900);
    return () => window.clearTimeout(t);
  }, [checking, onAnswer, reduce]);
  return (
    <AnimatePresence>
      {state !== "yes" && (
        <motion.div
          key="gate"
          initial={false}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.2 }}
          className="fixed inset-0 z-[60] flex items-center justify-center px-4"
          style={{ background: "rgba(17,17,17,0.72)" }}
        >
          <div role="dialog" aria-modal="true" aria-labelledby="ls-age-title" className="w-full max-w-[440px] rounded-[8px] px-6 py-8 text-center md:px-10" style={{ background: C.white }}>
            <Seal size={44} />
            <h2 id="ls-age-title" className="mt-4 text-[26px] leading-[1.3]" style={serifF}>
              {state === "ask" ? "성인 인증이 필요합니다" : "이용하실 수 없습니다"}
            </h2>
            {state === "ask" ? (
              <>
                {/* 청소년 보호법 제2조 제1호: 19세가 되는 해의 1월 1일부터 청소년이 아니다(연 나이) */}
                <p className="mt-3 text-[16px] leading-[1.7] [word-break:keep-all]" style={{ color: C.body }}>
                  {BRAND}은 주류를 판매합니다.
                  <br />
                  {adultBorn}년 12월 31일 이전에 태어난 분만
                  <br />
                  이용할 수 있습니다.
                </p>
                {/* 고시 제5조 제1항 제6호 다목: 전자서명인증사업자가 제공하는 성인인증 서비스 */}
                <button
                  ref={authRef}
                  type="button"
                  disabled={checking}
                  onClick={() => setChecking(true)}
                  data-gtm-cta="liquor-shop_age_auth"
                  className={`mt-6 min-h-12 w-full rounded-[6px] px-4 text-[16px] font-semibold disabled:opacity-80 ${focusRing}`}
                  style={{ background: C.accent, color: C.white }}
                >
                  {checking ? "본인인증 확인 중" : "휴대폰 본인인증"}
                </button>
                <p className="mt-2 text-[14px]" style={{ color: C.muted }} aria-live="polite">
                  통신사 본인인증으로 생년월일을 확인합니다.
                </p>
                <button type="button" onClick={() => onAnswer("no")} className={`mt-4 min-h-11 rounded-[6px] px-3 text-[15px] underline underline-offset-4 ${focusRing}`} style={{ color: C.body }}>
                  청소년이에요
                </button>
              </>
            ) : (
              <p className="mt-3 text-[16px] leading-[1.7]" style={{ color: C.muted }}>
                청소년에게는 주류를 판매하지 않습니다.
                <br />
                이용에 불편을 드려 죄송합니다.
              </p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ── 공용 조각 ─────────────────────────────────────────── */

/** 붉은 낙관 모양 상호 도장 */
function Seal({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden className="inline-block flex-none">
      <rect x="2" y="2" width="36" height="36" rx="3" fill={C.accent} />
      <path d="M11 11h18v18H11z" fill="none" stroke={C.white} strokeWidth="2.2" />
      <path d="M15 20h10M20 15v10" stroke={C.white} strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function SectionTitle({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="mb-6 border-b pb-3 text-[26px] leading-[1.25] tracking-[-0.02em] md:text-[32px]" style={{ ...serifF, borderColor: C.line }}>
      {children}
    </h2>
  );
}

/* ── 병 그림 ──────────────────────────────────────────── */

/** 병 사진. 흰 바탕 사진이라 곱하기 섞기로 카드와 선물 상자 위에 바탕 없이 얹힌다 */
function BottleArt({ b, height = 120, className = "" }: { b: Bottle; height?: number; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- 정적 export 라 next/image 최적화를 쓰지 않는다
    <img
      src={`${IMG}/bottles/${b.id}.jpg`}
      alt={`${b.name} 병 사진`}
      loading="lazy"
      draggable={false}
      width={Math.round(height * 0.389)}
      height={height}
      className={`flex-none object-contain ${className}`}
      style={{ width: Math.round(height * 0.389), height, mixBlendMode: "multiply" }}
    />
  );
}

/* ── 병 카드 ──────────────────────────────────────────── */

function BottleCard({ b, onOpen }: { b: Bottle; onOpen: () => void }) {
  return (
    <li>
      <button type="button" onClick={onOpen} aria-label={`${b.name} 상세 보기`} className={`flex h-full w-full flex-col items-center rounded-[6px] border p-3 text-left ${focusRing}`} style={{ background: C.white, borderColor: C.line }}>
        <span className="relative flex h-[128px] w-full items-end justify-center">
          {b.pick && (
            <span className="absolute left-0 top-0 rounded-[4px] px-1.5 py-0.5 text-[12px] font-semibold" style={{ background: C.paper, color: C.accent }}>
              {b.pick}
            </span>
          )}
          <BottleArt b={b} height={120} />
        </span>
        <span className="mt-3 block w-full text-[16px] font-bold leading-[1.3]">{b.name}</span>
        <span className="mt-0.5 block w-full text-[13px]" style={{ color: C.muted }}>
          {b.kind} {b.abv}도 {b.ml}ml
        </span>
        <span className="mt-1 block w-full text-[16px] tabular-nums">{won(b.price)}</span>
      </button>
    </li>
  );
}

/* ── 2. 병 상세 ───────────────────────────────────────── */

function DetailModal({ list, id, reduce, onClose, onMove, today }: { list: Bottle[]; id: string; reduce: boolean; onClose: () => void; onMove: (id: string) => void; today: Date }) {
  const b = BOTTLES.find((x) => x.id === id)!;
  const idx = list.findIndex((x) => x.id === id);
  const prev = idx > 0 ? list[idx - 1] : null;
  const next = idx >= 0 && idx < list.length - 1 ? list[idx + 1] : null;
  const closeRef = useRef<HTMLButtonElement>(null);
  const [qty, setQty] = useState(1);
  const [ordered, setOrdered] = useState<{ id: string; qty: number } | null>(null);
  const pickupDay = nextOpenDay(today);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6">
      <motion.button
        type="button"
        aria-label="상세 닫기"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: reduce ? 0 : 0.2 }}
        onClick={onClose}
        className="absolute inset-0 cursor-default"
        style={{ background: "rgba(17,17,17,0.55)" }}
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: reduce ? 0 : 0.2 }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ls-detail-title"
        className="relative max-h-[calc(100dvh-24px)] w-full max-w-[860px] overflow-y-auto rounded-[8px]"
        style={{ background: C.white }}
      >
        <div className="p-5 md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="inline-block rounded-[4px] border px-2 py-0.5 text-[13px] font-semibold" style={{ borderColor: C.line, color: C.body }}>
                {b.kind}
              </p>
              <h3 id="ls-detail-title" className="mt-2 text-[28px] font-bold leading-[1.25] tracking-[-0.02em] md:text-[32px]">
                {b.name}
              </h3>
            </div>
            <button ref={closeRef} type="button" onClick={onClose} aria-label="닫기" className={`-mr-2 -mt-2 inline-flex h-11 w-11 flex-none items-center justify-center ${focusRing}`}>
              <X size={24} aria-hidden />
            </button>
          </div>

          <div className="mt-5 grid gap-6 md:grid-cols-[180px_minmax(0,1fr)_minmax(0,1fr)] md:gap-8">
            <div className="flex justify-center md:justify-start">
              <BottleArt b={b} height={220} />
            </div>

            <div>
              <p className="text-[16px] leading-[1.7]">{b.note}</p>
              <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-[15px] leading-[1.6]">
                <dt style={{ color: C.muted }}>도수</dt>
                <dd className="tabular-nums">{b.abv}도</dd>
                <dt style={{ color: C.muted }}>용량</dt>
                <dd className="tabular-nums">{b.ml}ml</dd>
                <dt style={{ color: C.muted }}>가격</dt>
                <dd className="text-[18px] font-bold tabular-nums">{won(b.price)}</dd>
              </dl>
            </div>

            <div className="text-[15px] leading-[1.7]" style={{ color: C.body }}>
              <p className="font-semibold" style={{ color: C.ink }}>어울리는 음식</p>
              <p>{b.food}</p>
              <p className="mt-4 font-semibold" style={{ color: C.ink }}>보관법</p>
              <p>{b.keep}</p>
            </div>
          </div>

          {/* 고시 제3조의2 제2호: 소매점은 온라인으로 주문받고 매장 안에서 대면 인도만 한다. 결제도 매장에서 받을 때 */}
          <div className="mt-6 rounded-[6px] p-4" style={{ background: C.paper }}>
            {ordered?.id === b.id ? (
              <div role="status" className="text-[15px] leading-[1.7]">
                <p className="text-[17px] font-bold">
                  픽업 주문이 접수됐어요 ({b.name} {ordered.qty}병)
                </p>
                <p style={{ color: C.body }}>
                  {fmtKo(pickupDay)}부터 매장에서 받으실 수 있어요. 받으실 때 신분증으로 나이와 본인 여부를 확인한 뒤 결제합니다.
                </p>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center rounded-[4px] border bg-white" style={{ borderColor: C.line }}>
                  <button type="button" aria-label="수량 줄이기" onClick={() => setQty((q) => Math.max(1, q - 1))} className={`h-11 w-11 text-[20px] ${focusRing}`}>
                    -
                  </button>
                  <span className="w-12 text-center text-[16px] tabular-nums" aria-live="polite">
                    {qty}병
                  </span>
                  <button type="button" aria-label="수량 늘리기" onClick={() => setQty((q) => Math.min(12, q + 1))} className={`h-11 w-11 text-[20px] ${focusRing}`}>
                    +
                  </button>
                </div>
                <button type="button" onClick={() => setOrdered({ id: b.id, qty })} data-gtm-cta="liquor-shop_pickup_order" className={`min-h-11 flex-1 rounded-[6px] px-4 text-[16px] font-semibold sm:flex-none ${focusRing}`} style={{ background: C.accent, color: C.white }}>
                  매장 픽업 주문
                </button>
                <p className="w-full text-[14px]" style={{ color: C.muted }}>
                  {fmtKo(pickupDay)}부터 매장에서 받기, 결제는 받으실 때
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 flex items-center justify-between gap-3 border-t pt-4 text-[15px]" style={{ borderColor: C.line }}>
            <button type="button" disabled={!prev} onClick={() => prev && onMove(prev.id)} className={`inline-flex min-h-11 items-center gap-1 pr-2 disabled:opacity-30 ${focusRing}`}>
              <ChevronLeft size={18} aria-hidden /> {prev ? prev.name : "처음"}
            </button>
            <span className="tabular-nums" style={{ color: C.muted }}>
              {idx + 1} / {list.length}
            </span>
            <button type="button" disabled={!next} onClick={() => next && onMove(next.id)} className={`inline-flex min-h-11 items-center gap-1 pl-2 text-right disabled:opacity-30 ${focusRing}`}>
              {next ? next.name : "마지막"} <ChevronRight size={18} aria-hidden />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ── 3. 선물세트 ──────────────────────────────────────── */

function GiftSets() {
  return (
    <div>
      <ul className="grid gap-4 md:grid-cols-3" style={{ listStyle: "none", padding: 0 }}>
        {GIFTS.map((g) => (
          <li key={g.name} className="overflow-hidden rounded-[8px] border" style={{ borderColor: C.line, background: C.white }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- 정적 export 라 next/image 최적화를 쓰지 않는다 */}
            <img src={`${IMG}/pack-${g.pack}.jpg`} alt={g.pack === "box" ? "뚜껑을 연 한지 선물 상자" : "바닥에 펼친 보자기"} loading="lazy" className="aspect-[16/9] w-full object-cover" />
            <div className="p-4 md:p-5">
              <p className="text-[13px] font-semibold" style={{ color: C.accent }}>
                {g.band}
              </p>
              <p className="mt-1 text-[18px] font-bold">{g.name}</p>
              <p className="mt-1 text-[15px] leading-[1.6]" style={{ color: C.body }}>
                {g.items.join(", ")}
              </p>
              <p className="mt-1 text-[14px]" style={{ color: C.muted }}>
                {g.pack === "box" ? "한지 상자" : "보자기"} 포장
              </p>
              <p className="mt-3 text-[18px] font-bold tabular-nums">{won(g.price)}</p>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[14px] leading-[1.6]" style={{ color: C.muted }}>
        원하는 술로 세트를 꾸리려면 매장이나 {KAKAO}로 문의해 주세요. 세트도 매장 픽업으로 받으실 수 있어요.
      </p>
    </div>
  );
}


/* ── 4. 시음회 예약 ───────────────────────────────────── */

type Done = { no: string; name: string; phone: string; date: Date; slot: string; people: number };

function TastingForm({ today, reduce }: { today: Date; reduce: boolean }) {
  const dates = useMemo(() => nextSaturdays(today, 2), [today]);
  const [pick, setPick] = useState<{ d: number; s: number } | null>(null);
  const [people, setPeople] = useState(2);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [agree, setAgree] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState<Done | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pick) return setErr("회차를 골라 주세요.");
    if (name.trim().length < 2) return setErr("이름을 두 글자 이상 적어 주세요.");
    if (phone.replace(/\D/g, "").length < 10) return setErr("휴대폰 번호를 확인해 주세요.");
    if (!agree) return setErr("개인정보 수집, 이용에 동의해 주세요.");
    const left = TASTING_CAP - takenSeats(pick.d, pick.s);
    if (people > left) return setErr(`이 회차는 ${left}명까지 예약할 수 있어요.`);
    setErr(null);
    const d = dates[pick.d];
    const tail = (Number(phone.replace(/\D/g, "").slice(-2)) + 7) % 90 + 10;
    const no = `T${String(today.getFullYear()).slice(2)}${p2(today.getMonth() + 1)}${p2(today.getDate())}-${tail}`;
    setDone({ no, name, phone, date: d, slot: SESSIONS[pick.s], people });
  };

  const input = `mt-1.5 w-full rounded-[4px] border bg-white px-3 py-2.5 text-[16px] ${focusRing}`;

  if (done) {
    const reply = nextOpenDay(today);
    return (
      <motion.div initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduce ? 0 : 0.25, ease: EASE }} className="rounded-[8px] border p-5 md:p-8" style={{ borderColor: C.line, background: C.white }} role="status">
        <p className="text-[22px] font-bold md:text-[26px]">
          시음회 예약이 접수됐어요
        </p>
        <dl className="mt-5 grid max-w-[520px] grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-[16px] leading-[1.6]">
          <dt style={{ color: C.muted }}>예약번호</dt>
          <dd className="font-bold tabular-nums">{done.no}</dd>
          <dt style={{ color: C.muted }}>일시</dt>
          <dd>
            {fmtKo(done.date)} {done.slot}
          </dd>
          <dt style={{ color: C.muted }}>인원</dt>
          <dd>{done.people}명</dd>
          <dt style={{ color: C.muted }}>예약자</dt>
          <dd>
            {maskName(done.name)} <span className="tabular-nums">{maskPhone(done.phone)}</span>
          </dd>
          <dt style={{ color: C.muted }}>참가비</dt>
          <dd className="tabular-nums">
            {won(TASTING_FEE * done.people)} (현장 결제, 구매 시 차감)
          </dd>
          <dt style={{ color: C.muted }}>담당 창구</dt>
          <dd>{KAKAO}</dd>
          <dt style={{ color: C.muted }}>회신 예정</dt>
          <dd>{fmtKo(reply)} 영업시간 안에 확인 메시지를 드려요</dd>
        </dl>
        <p className="mt-5 text-[15px] leading-[1.7]" style={{ color: C.muted }}>
          시음회 당일 신분증을 꼭 지참해 주세요. 청소년은 입장할 수 없습니다.
        </p>
        <button type="button" onClick={() => setDone(null)} className={`mt-5 min-h-11 rounded-[6px] border px-4 text-[15px] font-semibold ${focusRing}`} style={{ borderColor: "#cfcfcf" }}>
          다른 회차 예약
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-6 rounded-[8px] border p-5 md:grid-cols-[minmax(0,1fr)_320px] md:p-8" style={{ borderColor: C.line, background: C.white }}>
      <div>
        <p className="text-[16px] leading-[1.7]" style={{ color: C.body }}>
          토요일마다 두 번, 한 회차 50분. 그날 들어온 술 다섯 가지를 조금씩 맛봅니다.
          <br />
          참가비 {won(TASTING_FEE)}, 시음 뒤 구매하면 참가비는 빼 드려요.
        </p>
        <fieldset className="mt-5">
          <legend className="text-[14px] font-semibold">회차 선택</legend>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            {dates.map((d, di) => (
              <div key={di} className="rounded-[6px] border p-3" style={{ borderColor: C.line }}>
                <p className="text-[16px] font-bold">{fmtKo(d)}</p>
                <div className="mt-2 grid gap-2">
                  {SESSIONS.map((s, si) => {
                    const left = TASTING_CAP - takenSeats(di, si);
                    const on = pick?.d === di && pick?.s === si;
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setPick({ d: di, s: si })}
                        aria-pressed={on}
                        disabled={left <= 0}
                        className={`flex min-h-11 items-center justify-between rounded-[4px] border px-3 text-[15px] disabled:opacity-40 ${focusRing}`}
                        style={on ? { background: C.accent, color: C.white, borderColor: C.accent, fontWeight: 600 } : { borderColor: C.line }}
                      >
                        <span className="tabular-nums">{s}</span>
                        <span className="tabular-nums text-[14px]">{left <= 0 ? "마감" : `남은 자리 ${left}`}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </fieldset>
      </div>

      <div>
        <fieldset>
          <legend className="text-[14px] font-semibold">인원</legend>
          <div className="mt-1.5 flex items-center rounded-[4px] border" style={{ borderColor: C.line }}>
            <button type="button" aria-label="인원 줄이기" onClick={() => setPeople((p) => Math.max(1, p - 1))} className={`h-11 w-11 text-[20px] ${focusRing}`}>
              -
            </button>
            <span className="flex-1 text-center text-[16px] tabular-nums" aria-live="polite">
              {people}명
            </span>
            <button type="button" aria-label="인원 늘리기" onClick={() => setPeople((p) => Math.min(6, p + 1))} className={`h-11 w-11 text-[20px] ${focusRing}`}>
              +
            </button>
          </div>
        </fieldset>
        <label className="mt-4 block text-[14px] font-semibold">
          이름
          <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={input} style={{ borderColor: C.line }} />
        </label>
        <label className="mt-4 block text-[14px] font-semibold">
          휴대폰
          <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" placeholder="010-0000-0000" className={input} style={{ borderColor: C.line }} />
        </label>
        {/* 개인정보 보호법 제15조: 수집 항목, 목적, 보유 기간, 거부권 */}
        <label className="mt-4 flex min-h-11 cursor-pointer items-start gap-2.5 text-[15px] leading-[1.5]">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-[#8a3a2e]" />
          <span>
            개인정보 수집, 이용 동의 (필수)
            <span className="block text-[13px] leading-[1.6]" style={{ color: C.muted }}>
              이름, 휴대폰을 시음회 예약 연락에만 쓰고 시음회가 끝나면 1년 안에 파기합니다. 동의하지 않으실 수 있으며, 동의하지 않으면 예약을 받을 수 없습니다.
            </span>
          </span>
        </label>
        {err && (
          <p className="mt-3 text-[14px] font-bold" style={{ color: C.error }} role="alert">
            {err}
          </p>
        )}
        <button type="submit" data-gtm-cta="liquor-shop_tasting_reserve" className={`mt-5 min-h-12 w-full rounded-[6px] text-[16px] font-semibold ${focusRing}`} style={{ background: C.accent, color: C.white }}>
          시음회 예약하기
        </button>
        <p className="mt-3 text-[13px] leading-[1.6]" style={{ color: C.muted }}>
          예약 확인은 카카오톡 채널로 드려요. 시음회는 성인만 참석할 수 있어요.
        </p>
      </div>
    </form>
  );
}

/* ── 5. 매장 안내와 오시는 길 ──────────────────────────── */

function StoreInfo({ today }: { today: Date }) {
  const dow = today.getDay();
  const box = "rounded-[8px] border p-5";
  const head = "flex items-center gap-2 text-[17px] font-bold";
  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-[1fr_1fr_1.3fr]">
      <div className={box} style={{ borderColor: C.line, background: C.white }}>
        <p className={head}>
          <Clock size={18} aria-hidden /> 영업시간
        </p>
        <table className="mt-3 w-full text-[15px]">
          <tbody>
            {HOURS.map((h, i) => {
              const isToday = DOW_IDX[i] === dow;
              return (
                <tr key={h.day} aria-current={isToday ? "date" : undefined} style={{ fontWeight: isToday ? 700 : 400, background: isToday ? C.paper : undefined }}>
                  <th scope="row" className="px-2 py-1 text-left" style={{ fontWeight: "inherit" }}>
                    {h.day}
                    {isToday ? " (오늘)" : ""}
                  </th>
                  <td className="px-2 py-1 text-right tabular-nums" style={h.time === "휴무" ? { color: C.muted } : undefined}>
                    {h.time}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p className="mt-3 text-[14px]" style={{ color: C.muted }}>
          명절 당일은 쉽니다. 마지막 주문은 마감 30분 전까지.
        </p>
      </div>

      <div className="grid gap-5">
        <div className={box} style={{ borderColor: C.line, background: C.white }}>
          <p className={head}>
            <Car size={18} aria-hidden /> 주차
          </p>
          <p className="mt-2 text-[15px] leading-[1.7]" style={{ color: C.body }}>건물 지하 주차장 1시간 무료. 매장에서 주차권을 받아 가세요. 만차 시 건너편 공영주차장을 이용해 주세요.</p>
        </div>
        <div className={box} style={{ borderColor: C.line, background: C.white }}>
          <p className={head}>
            <Store size={18} aria-hidden /> 픽업 주문
          </p>
          {/* 고시 제3조의2 제2호: 통신판매 수단으로 주문받고 판매영업장 안에서 직접 대면 인도 */}
          <p className="mt-2 text-[15px] leading-[1.7]" style={{ color: C.body }}>
            상품 상세에서 픽업 주문을 하면 다음 영업일부터 매장에서 받으실 수 있어요. 받으실 때 신분증으로 나이와 본인 여부를 확인한 뒤 결제하고 건네 드립니다.
          </p>
        </div>
      </div>

      <div className={box} style={{ borderColor: C.line, background: C.white }}>
        <p className={head}>
          <MapPin size={18} aria-hidden /> 오시는 길
        </p>
        <p className="mt-2 text-[15px] leading-[1.7]" style={{ color: C.body }}>
          {ADDRESS}
          <br />
          지하철 ㅇㅇ역 3번 출구에서 걸어서 5분. 큰길에서 두 번째 골목으로 들어오면 붉은 도장 간판이 보여요.
        </p>
        <MiniMap />
      </div>
    </div>
  );
}

/** 약도. 큰길, 골목, 역 출구, 매장 위치만 그린다. */
function MiniMap() {
  return (
    <svg viewBox="0 0 320 180" className="mt-4 w-full rounded-[6px] border" style={{ borderColor: C.line, background: C.paper }} role="img" aria-label="약도: 역 3번 출구에서 큰길을 따라 두 번째 골목으로 들어오면 매장">
      <path d="M0 120 H320" stroke="#e2e2e0" strokeWidth="26" />
      <path d="M0 120 H320" stroke={C.white} strokeWidth="1.5" strokeDasharray="10 8" />
      <path d="M110 120 V0 M200 120 V0 M260 120 V180" stroke="#ebebe9" strokeWidth="14" />
      <rect x="10" y="128" width="72" height="34" rx="3" fill={C.white} stroke="#cfcfcf" strokeWidth="1" />
      <text x="46" y="149" textAnchor="middle" fontSize="12" fontWeight="700" fill={C.ink}>
        ㅇㅇ역 3번
      </text>
      <path d="M82 118 H200 V60" fill="none" stroke={C.body} strokeWidth="1.5" strokeDasharray="5 4" />
      <rect x="206" y="40" width="46" height="30" rx="3" fill={C.accent} />
      <text x="229" y="59" textAnchor="middle" fontSize="11" fontWeight="700" fill={C.white}>
        보틀숍
      </text>
      <text x="155" y="104" textAnchor="middle" fontSize="11" fill={C.muted}>
        ㅇㅇ로
      </text>
      <text x="120" y="24" fontSize="10" fill={C.muted}>
        첫째 골목
      </text>
      <text x="208" y="24" fontSize="10" fill={C.muted}>
        둘째 골목
      </text>
    </svg>
  );
}
