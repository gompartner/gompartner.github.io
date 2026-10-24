"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import {
  AlertCircle,
  Check,
  ChevronDown,
  Clock,
  Factory,
  MapPin,
  MessageCircle,
  PackageOpen,
  Phone,
  RotateCcw,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { daysAgo, fmtKo, useDemoToday } from "@/hooks/useDemoToday";
import { maskName, maskPhone } from "@/components/demos/LeadReceivedPanel";
import { DemoMakerInfo } from "@/components/demos/DemoMakerInfo";

/* 소스, 드레싱 OEM 식품 제조사 홈페이지 샘플: 가상의 식품 제조사 곰파트너. HACCP 인증을 받은 소스 공장 한 곳을 운영한다.
   회사명, 주소, 전화번호, 단가, 관리 기준은 모두 가상이다.

   국내 소스 OEM 업체 사이트 공통 구성(참고): 메뉴는 회사소개, OEM/ODM, 제조 품목, 생산 공정, 인증현황, 고객문의.
   첫 화면에는 "소량 생산 가능", 최소 주문 수량(MOQ), HACCP 인증서를 올리고, 샘플 의뢰와 견적문의 버튼을 크게 둔다.
   포장 형태(스탠딩 파우치, PET 병, 업소용 대용량, 디핑컵)별로 가능한 품목을 나누고, 품목제조보고와 소비기한 설정을 대행한다고 적는다.
   단가는 공개하지 않는 곳이 많아 "수량별 단가 개략"으로만 보여 주고 부가세 별도, 인쇄 동판비 별도를 붙인다.

   상호작용(모두 브라우저 안에서만 돈다. 실제로 보내지 않는다)
   1. 제조 가능 품목: 포장 형태를 고르면 그 포장으로 만드는 품목과 최소 주문 수량만 남는다. 품목에서 단가 계산으로 넘어간다.
   2. 개당 단가 개략 계산: 포장, 수량, 원료 지정을 고르면 개당 단가 범위와 총액, 수량 구간별 막대가 바뀐다.
   3. 생산 공정: 공정 칸을 누르면 표시가 그 칸으로 옮겨 가고 관리 기준(CCP 포함)이 나온다.
   4. 샘플 의뢰 신청: 업체명, 담당자, 휴대폰, 품목, 포장, 예상 수량. 완료하면 접수 번호, 담당 창구, 회신 예정일을 보여 준다.

   첫 화면(fo-poster): 소스 숙성 창고의 나무 통 사진 한 장을 화면 가득 깔고 아래쪽에 문장 "소스 한 가지, 1,000개부터 만들어요"를 둔다.
   핵심 모션: 들어올 때 사진이 1.6초 동안 천천히 다가오고(scale 1.06 에서 1), 문장은 0.3초 늦게 아래 12px 에서 올라온다(CSS).
   스크롤하면 사진만 조금 느리게 내려간다(y 0 에서 8%). 동작 줄이기면 전부 멈춘 상태로 둔다.
   사진 출처: Pexels 사진 6711641 */

const ADDRESS = "충북 ㅇㅇ군 ㅇㅇ면 ㅇㅇ로 00";
const TEL = "043-000-0000";
const KAKAO = "카카오톡 채널 곰파트너";

const C = {
  /** 구역 구분 옅은 회색 */
  cream: "#f7f7f5",
  paper: "#ffffff",
  ink: "#111111",
  body: "#4b4b4b",
  /** 강조색 하나: 채도를 낮춘 토마토 */
  tomato: "#9a3324",
  tomatoDeep: "#7f2a1d",
  muted: "#707070",
  line: "#e5e5e5",
  error: "#b42318",
};

/* 모션 상수. 시간은 초, 이징은 cubic-bezier */
const EASE = [0.22, 1, 0.36, 1] as const;
/** 첫 화면 사진이 다가오는 시간 */
const PHOTO_IN = 1.6;
/** 사진 위 막. 아래와 왼쪽을 어둡게 해 흰 글자 대비를 맞춘다 */
const SCRIM = "linear-gradient(to top, rgba(0,0,0,0.72), rgba(0,0,0,0.25) 55%, rgba(0,0,0,0.12)), linear-gradient(to right, rgba(0,0,0,0.35), rgba(0,0,0,0) 60%)";
const POSTER_CSS = `@keyframes fo-rise{from{opacity:0;transform:translateY(12px)}}.fo-rise{animation:fo-rise .7s cubic-bezier(0.22,1,0.36,1) .3s both}@media (prefers-reduced-motion:reduce){.fo-rise{animation:none}}`;
const IMG = "/images/demo-food-oem";
/** 칩, 패널, 숫자 전환 */
const DUR = 0.3;

const focusRing = "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2";
const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;
const num = (n: number) => n.toLocaleString("ko-KR");
const p2 = (n: number) => String(n).padStart(2, "0");

/* ---------- 1. 제조 가능 품목 ---------- */

type PackId = "pouch200" | "pouch500" | "pet300" | "bulk2kg" | "cup30";
interface Pack {
  id: PackId;
  kind: "스탠딩 파우치" | "PET 병" | "업소용 대용량" | "디핑컵";
  label: string;
  moq: number;
  /** 10,000개 기준 개당 단가(원). 원료, 포장재, 제조, 살균 포함 */
  base: number;
  why: string;
}
const PACKS: Pack[] = [
  { id: "pouch200", kind: "스탠딩 파우치", label: "스탠딩 파우치 200g", moq: 1000, base: 980, why: "한 번 끓이는 최소량이 200kg이라 200g은 1,000개부터예요." },
  { id: "pouch500", kind: "스탠딩 파우치", label: "스탠딩 파우치 500g", moq: 400, base: 1850, why: "500g은 400개면 한 번 끓이는 양이 차요." },
  { id: "pet300", kind: "PET 병", label: "PET 병 300g", moq: 2000, base: 1350, why: "병 충전 라인은 라벨 작업까지 묶여 2,000개부터예요." },
  { id: "bulk2kg", kind: "업소용 대용량", label: "업소용 파우치 2kg", moq: 100, base: 6200, why: "식당, 프랜차이즈 납품용이라 100개부터 받아요." },
  { id: "cup30", kind: "디핑컵", label: "디핑컵 30g", moq: 5000, base: 210, why: "컵 성형 실링기가 한 번 돌 때 5,000개가 기본이에요." },
];
const packById = (id: PackId) => PACKS.find((p) => p.id === id) ?? PACKS[0];
const PACK_KINDS = ["전체", "스탠딩 파우치", "PET 병", "업소용 대용량", "디핑컵"] as const;
type PackKind = (typeof PACK_KINDS)[number];

type Group = "고기 소스" | "볶음, 조림 소스" | "드레싱" | "디핑 소스";
interface Item {
  id: string;
  name: string;
  group: Group;
  note: string;
  packs: PackId[];
}
const ITEMS: Item[] = [
  { id: "bbq", name: "바베큐 소스", group: "고기 소스", note: "토마토, 훈연 향", packs: ["pouch200", "pouch500", "pet300", "bulk2kg"] },
  { id: "bulgogi", name: "불고기 양념", group: "고기 소스", note: "간장, 배즙", packs: ["pouch500", "pet300", "bulk2kg"] },
  { id: "steak", name: "스테이크 소스", group: "고기 소스", note: "데미글라스", packs: ["pouch200", "pet300", "cup30"] },
  { id: "tteokbokki", name: "떡볶이 소스", group: "볶음, 조림 소스", note: "고추장, 물엿", packs: ["pouch200", "pouch500", "bulk2kg"] },
  { id: "mala", name: "마라 소스", group: "볶음, 조림 소스", note: "화자오, 고추기름", packs: ["pouch200", "bulk2kg"] },
  { id: "soy-glaze", name: "간장 조림 소스", group: "볶음, 조림 소스", note: "닭강정, 찜닭용", packs: ["pouch500", "bulk2kg"] },
  { id: "oriental", name: "오리엔탈 드레싱", group: "드레싱", note: "간장, 식초", packs: ["pet300", "bulk2kg", "cup30"] },
  { id: "sesame", name: "참깨 드레싱", group: "드레싱", note: "볶은 참깨, 마요", packs: ["pet300", "bulk2kg", "cup30"] },
  { id: "balsamic", name: "발사믹 드레싱", group: "드레싱", note: "발사믹 식초, 올리브유", packs: ["pet300", "cup30"] },
  { id: "honey-mustard", name: "허니 머스터드", group: "디핑 소스", note: "꿀, 홀그레인", packs: ["pouch200", "cup30", "bulk2kg"] },
  { id: "sweet-chili", name: "스위트 칠리", group: "디핑 소스", note: "고추, 마늘", packs: ["pouch200", "cup30"] },
  { id: "garlic-mayo", name: "갈릭 마요", group: "디핑 소스", note: "구운 마늘", packs: ["cup30", "bulk2kg"] },
];
const GROUPS: Group[] = ["고기 소스", "볶음, 조림 소스", "드레싱", "디핑 소스"];

/* ---------- 2. 단가 계산 ---------- */

/** 수량 구간과 10,000개 기준 대비 배수. 수량이 적으면 포장재 인쇄와 세척 시간이 개당 단가에 크게 붙는다 */
const TIERS = [
  { from: 30000, k: 0.9 },
  { from: 10000, k: 1 },
  { from: 5000, k: 1.12 },
  { from: 3000, k: 1.25 },
  { from: 1000, k: 1.45 },
  { from: 0, k: 1.7 },
];
const tierK = (q: number) => (TIERS.find((t) => q >= t.from) ?? TIERS[TIERS.length - 1]).k;
/** 국산 원료로 지정하면 원료값이 오른다 */
const LOCAL_K = 1.18;
const round10 = (n: number) => Math.round(n / 10) * 10;
function unitRange(pack: Pack, q: number, local: boolean) {
  const mid = pack.base * tierK(q) * (local ? LOCAL_K : 1);
  return { lo: round10(mid * 0.93), hi: round10(mid * 1.07) };
}
const QTY_STEPS = [100, 400, 1000, 2000, 3000, 5000, 10000, 20000, 30000, 50000];

/* ---------- 3. 생산 공정 ---------- */

interface Step {
  name: string;
  ccp?: string;
  what: string;
  rule: string[];
}
const STEPS: Step[] = [
  { name: "원료 입고", what: "원료가 들어오면 성상, 이물, 온도, 소비기한을 보고 시험성적서를 받아 둬요.", rule: ["냉장 원료 입고 온도 10도 이하", "부적합 원료는 따로 표시해 반품"] },
  { name: "계량, 배합", what: "확정한 레시피대로 원료를 계량하고 배합비를 일지에 남겨요. 두 사람이 같이 확인해요.", rule: ["계량 저울 매일 영점 확인", "알레르기 원료는 전용 도구 사용"] },
  { name: "가열 살균", ccp: "CCP-1", what: "배합한 소스를 솥에서 끓여 살균해요. 품온과 시간은 자동으로 기록돼요.", rule: ["품온 90도 이상에서 10분 이상", "기준을 벗어나면 그 솥은 다시 가열"] },
  { name: "충전, 밀봉", what: "뜨거운 소스를 바로 파우치나 병에 채우고 입구를 열로 봉합해요.", rule: ["충전 온도 85도 이상", "30분마다 실링 강도와 새는 곳 확인"] },
  { name: "냉각", what: "봉합한 제품을 냉각 수조에 통과시켜 빠르게 식혀요.", rule: ["제품 품온 35도 이하로", "냉각수 염소 농도 매일 확인"] },
  { name: "금속 검출", ccp: "CCP-2", what: "모든 제품이 금속 검출기를 지나가요. 걸린 제품은 자동으로 밀려나요.", rule: ["철 2.0mm, 스테인리스 2.5mm 테스트피스", "작업 시작 때와 2시간마다 감도 확인"] },
  { name: "포장, 출고", what: "제조번호와 소비기한 인쇄를 확인하고 박스에 담아요. 제조번호마다 보관 샘플을 남겨요.", rule: ["출고 전 검사 성적 첨부", "보관 샘플은 소비기한까지 보관"] },
];

/* ---------- 4. 샘플 의뢰 ---------- */

const QTY_PLANS = ["1,000개 미만", "1,000 ~ 3,000개", "3,000 ~ 10,000개", "10,000개 이상", "아직 모르겠어요"] as const;

/** n 영업일 뒤(토, 일 제외) */
function addBizDays(d: Date, n: number) {
  let out = d;
  let left = n;
  while (left > 0) {
    out = daysAgo(out, -1);
    if (out.getDay() !== 0 && out.getDay() !== 6) left--;
  }
  return out;
}

interface Prefill {
  item: string;
  pack: PackId;
  qty: number;
}

export function FoodOemDemo() {
  const today = useDemoToday();
  const reduce = useReducedMotionSafe();

  const [calcPack, setCalcPack] = useState<PackId>("pouch200");
  const [calcItem, setCalcItem] = useState("바베큐 소스");
  const [prefill, setPrefill] = useState<Prefill | null>(null);

  useEffect(() => {
    const f = () => window.scrollTo({ top: 0 });
    window.addEventListener("demo:go-home", f);
    return () => window.removeEventListener("demo:go-home", f);
  }, []);

  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });

  const toCalc = (item: string, pack: PackId) => {
    setCalcItem(item);
    setCalcPack(pack);
    go("fo-calc");
  };

  const navBtn = `rounded-[4px] px-2.5 py-1.5 text-[15px] font-semibold underline-offset-4 hover:underline ${focusRing}`;

  return (
    <div className="min-h-screen overflow-x-clip pb-24" style={{ background: C.paper, color: C.ink }}>
      <Poster reduce={reduce} onCta={() => go("fo-sample")} />

      <header className="sticky top-0 z-30 border-b" style={{ borderColor: C.line, background: "rgba(255,255,255,0.96)" }}>
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-4 py-3 md:px-6">
          <h2>
            <SampleLogo />
          </h2>
          <nav aria-label="주요 메뉴" className="-mx-2 hidden items-center lg:flex">
            {[
              ["fo-items", "제조 품목"],
              ["fo-calc", "단가 계산"],
              ["fo-process", "생산 공정"],
              ["fo-sample", "샘플 의뢰"],
              ["fo-visit", "오시는 길"],
            ].map(([id, label]) => (
              <button key={id} type="button" onClick={() => go(id)} className={navBtn} style={{ outlineColor: C.tomato }}>
                {label}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <a
              href={`tel:${TEL.replace(/-/g, "")}`}
              aria-label={`전화 ${TEL}`}
              className={`inline-flex h-10 w-10 items-center justify-center rounded-full border ${focusRing}`}
              style={{ borderColor: C.line, color: C.tomatoDeep, outlineColor: C.tomato }}
            >
              <Phone size={18} aria-hidden />
            </a>
            <button
              type="button"
              onClick={() => go("fo-sample")}
              data-gtm-cta="food-oem_header_sample"
              className={`inline-flex h-10 items-center gap-1.5 rounded-[6px] px-4 text-[15px] font-semibold text-white ${focusRing}`}
              style={{ background: C.tomato, outlineColor: C.tomatoDeep }}
            >
              <PackageOpen size={17} aria-hidden />
              샘플 의뢰
            </button>
          </div>
        </div>
      </header>

      {/* 1. 제조 가능 품목 */}
      <section id="fo-items" aria-labelledby="fo-items-title" className="mx-auto max-w-[1200px] scroll-mt-20 px-4 pt-14 md:px-6 md:pt-20">
        <SectionTitle id="fo-items-title" title="제조 가능 품목" />
        <Items reduce={reduce} onCalc={toCalc} />
      </section>

      {/* 2. 단가 계산 */}
      <section id="fo-calc" aria-labelledby="fo-calc-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-20 px-4 md:mt-24 md:px-6">
        <SectionTitle id="fo-calc-title" title="수량별 개당 단가" />
        <PriceCalc
          reduce={reduce}
          item={calcItem}
          pack={calcPack}
          setPack={setCalcPack}
          onSample={(qty) => {
            setPrefill({ item: calcItem, pack: calcPack, qty });
            go("fo-sample");
          }}
        />
      </section>

      {/* 3. 생산 공정 */}
      <section id="fo-process" aria-labelledby="fo-process-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-20 px-4 md:mt-24 md:px-6">
        <SectionTitle id="fo-process-title" title="생산 공정" badge="HACCP 인증 공장" />
        <Process reduce={reduce} />
      </section>

      {/* 4. 샘플 의뢰 */}
      <section id="fo-sample" aria-labelledby="fo-sample-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-20 px-4 md:mt-24 md:px-6">
        <SectionTitle id="fo-sample-title" title="샘플 의뢰" />
        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:gap-14">
          <SampleForm key={prefill ? `${prefill.item}-${prefill.pack}-${prefill.qty}` : "blank"} reduce={reduce} today={today} prefill={prefill} />
          <Flow />
        </div>
      </section>

      {/* 자주 묻는 질문 */}
      <section aria-labelledby="fo-faq-title" className="mx-auto mt-16 max-w-[1200px] px-4 md:mt-24 md:px-6">
        <SectionTitle id="fo-faq-title" title="자주 묻는 질문" />
        <Faq />
      </section>

      {/* 오시는 길 */}
      <section id="fo-visit" aria-labelledby="fo-visit-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-20 px-4 md:mt-24 md:px-6">
        <SectionTitle id="fo-visit-title" title="오시는 길" />
        <Visit />
      </section>

      <footer className="mx-auto mt-16 max-w-[1200px] border-t px-4 pt-8 text-[14px] leading-[1.8] md:px-6" style={{ borderColor: C.line, color: C.muted }}>
        <p>
          <SampleLogo size={18} />
        </p>
        <p>
          {ADDRESS} / 대표전화 {TEL} / {KAKAO}
        </p>
        <DemoMakerInfo className="mt-6" />
      </footer>
    </div>
  );
}

function SectionTitle({ id, title, badge }: { id: string; title: string; badge?: string }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 border-b pb-3" style={{ borderColor: C.line }}>
      <h2 id={id} className="text-[28px] font-bold tracking-[-0.035em] md:text-[36px]" style={{ color: C.ink }}>
        {title}
      </h2>
      {badge && (
        <span className="inline-flex items-center gap-1.5 rounded-[4px] border px-2.5 py-1 text-[14px] font-semibold" style={{ borderColor: C.line, color: C.tomatoDeep }}>
          <ShieldCheck size={16} aria-hidden />
          {badge}
        </span>
      )}
    </div>
  );
}

/* ---------- 포스터 ---------- */

function Poster({ reduce, onCta }: { reduce: boolean; onCta: () => void }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const photoY = useTransform(scrollYProgress, (v) => (reduce ? "0%" : `${v * 8}%`));

  return (
    <section id="fo-poster" ref={ref} aria-labelledby="fo-poster-title" className="relative flex min-h-[100svh] flex-col overflow-hidden" style={{ background: "#141414", color: "#fff" }}>
      <style>{POSTER_CSS}</style>
      <motion.div className="absolute inset-0" style={{ y: photoY }}>
        <motion.div
          className="absolute inset-0"
          initial={reduce ? false : { scale: 1.06 }}
          animate={{ scale: 1 }}
          transition={{ duration: reduce ? 0 : PHOTO_IN, ease: EASE }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- 정적 export 라 next/image 최적화를 쓰지 않는다 */}
          <img
            src={`${IMG}/hero.jpg`}
            srcSet={`${IMG}/hero-sm.jpg 960w, ${IMG}/hero.jpg 1920w`}
            sizes="100vw"
            alt="숙성 창고에 줄지어 선 큰 나무 통"
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: "55% center" }}
          />
        </motion.div>
      </motion.div>
      <div className="absolute inset-0" style={{ background: SCRIM }} aria-hidden />

      {/* 로고와 샘플 의뢰 버튼 */}
      <div className="relative z-10 mx-auto flex w-full max-w-[1200px] items-center justify-between gap-4 px-4 pt-4 md:px-6 md:pt-6">
        <p>
          <SampleLogo light size={18} />
        </p>
        <button
          type="button"
          onClick={onCta}
          data-gtm-cta="food-oem_poster_cta"
          className={`inline-flex h-11 items-center gap-1.5 rounded-[6px] px-4 text-[15px] font-semibold text-white ${focusRing}`}
          style={{ background: C.tomato, outlineColor: "#fff" }}
        >
          <PackageOpen size={17} aria-hidden />
          샘플 의뢰
        </button>
      </div>

      {/* 문장 */}
      <div className={`${reduce ? "" : "fo-rise"} relative z-10 mx-auto mt-auto w-full max-w-[1200px] px-4 pb-[12svh] md:px-6`}>
        <h1
          id="fo-poster-title"
          className="text-[36px] font-bold md:text-[clamp(40px,5vw,72px)]"
          style={{ wordBreak: "keep-all", letterSpacing: "-0.03em", lineHeight: 1.2 }}
        >
          소스 한 가지,
          <br />
          1,000개부터 만들어요
        </h1>
        <p className="mt-4 text-[16px] font-medium md:mt-6 md:text-[18px]" style={{ color: "rgba(255,255,255,0.88)" }}>
          소스, 드레싱 OEM 제조. HACCP 인증 공장
        </p>
      </div>
    </section>
  );
}

/* ---------- 1. 제조 가능 품목 ---------- */

function Items({ reduce, onCalc }: { reduce: boolean; onCalc: (item: string, pack: PackId) => void }) {
  const [kind, setKind] = useState<PackKind>("전체");
  const shown = (packs: PackId[]) => (kind === "전체" ? packs : packs.filter((id) => packById(id).kind === kind));
  const kindPacks = kind === "전체" ? [] : PACKS.filter((p) => p.kind === kind);

  return (
    <div className="mt-8">
      <div role="radiogroup" aria-label="포장 형태" className="flex flex-wrap gap-2">
        {PACK_KINDS.map((k) => {
          const on = kind === k;
          return (
            <button
              key={k}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => setKind(k)}
              className={`rounded-[6px] border px-4 py-2 text-[15px] font-semibold transition-colors ${focusRing}`}
              style={{ borderColor: on ? C.tomato : C.line, background: on ? C.tomato : "transparent", color: on ? "#fff" : C.ink, outlineColor: C.tomato }}
            >
              {k}
            </button>
          );
        })}
      </div>

      {/* 고른 포장의 최소 주문 수량 */}
      <AnimatePresence mode="wait" initial={false}>
        {kindPacks.length > 0 && (
          <motion.div
            key={kind}
            initial={reduce ? false : { clipPath: "inset(0 100% 0 0)" }}
            animate={{ clipPath: "inset(0 0% 0 0)" }}
            exit={reduce ? { opacity: 0 } : { clipPath: "inset(0 0 0 100%)" }}
            transition={{ duration: reduce ? 0 : DUR, ease: EASE }}
            className="mt-5 grid gap-2 md:grid-cols-2"
          >
            {kindPacks.map((p) => (
              <p key={p.id} className="rounded-[8px] px-4 py-3 text-[15px] leading-[1.6]" style={{ background: C.cream }}>
                <b>{p.label}</b> 최소 주문{" "}
                <b className="tabular-nums" style={{ color: C.tomatoDeep }}>{num(p.moq)}개</b>
                <span className="block" style={{ color: C.muted }}>
                  {p.why}
                </span>
              </p>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-8 grid gap-x-10 gap-y-8 md:grid-cols-2">
        {GROUPS.map((g) => {
          const rows = ITEMS.filter((it) => it.group === g && shown(it.packs).length > 0);
          return (
            <div key={g}>
              <h3 className="flex items-baseline justify-between border-b pb-2 text-[19px] font-bold" style={{ borderColor: C.ink }}>
                {g}
                <span className="text-[14px] font-semibold" style={{ color: C.muted }}>
                  {rows.length}개 품목
                </span>
              </h3>
              {rows.length === 0 ? (
                <p className="py-4 text-[15px]" style={{ color: C.muted }}>
                  이 포장으로는 만들지 않아요.
                </p>
              ) : (
                <ul>
                  {rows.map((it) => {
                    const packs = shown(it.packs);
                    return (
                      <li key={it.name} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b py-3" style={{ borderColor: C.line }}>
                        <div className="flex min-w-0 items-center gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element -- 정적 export 라 next/image 최적화를 쓰지 않는다 */}
                          <img src={`${IMG}/item-${it.id}.jpg`} alt="" className="h-14 w-14 flex-none rounded-[6px] object-cover" />
                          <div className="min-w-0">
                            <p className="text-[17px] font-bold">{it.name}</p>
                            <p className="text-[14px]" style={{ color: C.muted }}>
                              {it.note}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {packs.map((id) => {
                            const pk = packById(id);
                            return (
                              <button
                                key={id}
                                type="button"
                                onClick={() => onCalc(it.name, id)}
                                aria-label={`${it.name} ${pk.label} 단가 계산`}
                                className={`inline-flex items-center gap-1 rounded-[6px] border px-2.5 py-1 text-[13px] font-semibold hover:bg-white ${focusRing}`}
                                style={{ borderColor: C.line, outlineColor: C.tomato }}
                              >
                                {pk.label.replace("스탠딩 ", "").replace("업소용 파우치", "업소용")}
                                <span className="tabular-nums" style={{ color: C.tomatoDeep }}>{num(pk.moq)}~</span>
                              </button>
                            );
                          })}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </div>
      <p className="mt-5 text-[14px]" style={{ color: C.muted }}>
        포장 칸의 숫자는 최소 주문 수량이에요. 누르면 그 조건으로 단가를 계산해요.
      </p>
    </div>
  );
}

/* ---------- 2. 단가 계산 ---------- */

function PriceCalc({
  reduce,
  item,
  pack,
  setPack,
  onSample,
}: {
  reduce: boolean;
  item: string;
  pack: PackId;
  setPack: (p: PackId) => void;
  onSample: (qty: number) => void;
}) {
  const pk = packById(pack);
  const [qtyRaw, setQtyRaw] = useState(String(pk.moq));
  const [local, setLocal] = useState(false);
  const qty = Math.max(0, Math.floor(Number(qtyRaw.replace(/\D/g, "")) || 0));
  const under = qty < pk.moq;
  const r = unitRange(pk, Math.max(qty, pk.moq), local);
  const tiers = QTY_STEPS.filter((q) => q >= pk.moq).slice(0, 6);
  const maxUnit = unitRange(pk, tiers[0], local).hi;
  // 다음 구간까지 얼마나 더 주문하면 개당 얼마 내려가는지
  const nextTier = [...TIERS].reverse().find((t) => t.from > qty);
  const nextGain = nextTier ? r.lo + r.hi - (unitRange(pk, nextTier.from, local).lo + unitRange(pk, nextTier.from, local).hi) : 0;

  const pickPack = (id: PackId) => {
    setPack(id);
    setQtyRaw(String(packById(id).moq));
  };
  // 품목 목록에서 포장을 골라 넘어오면 수량을 그 포장의 최소 수량으로 맞춘다
  const [lastPack, setLastPack] = useState(pack);
  if (lastPack !== pack) {
    setLastPack(pack);
    setQtyRaw(String(pk.moq));
  }

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-12">
      <div>
        <p className="text-[15px] font-semibold" style={{ color: C.muted }}>
          품목 <b style={{ color: C.ink }}>{item}</b>
        </p>
        <fieldset className="mt-4">
          <legend className="text-[16px] font-bold">포장</legend>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {PACKS.map((p) => {
              const on = p.id === pack;
              return (
                <button
                  key={p.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => pickPack(p.id)}
                  className={`rounded-[8px] border px-3 py-2.5 text-left text-[14px] font-bold leading-[1.35] ${focusRing}`}
                  style={{ borderColor: on ? C.tomato : C.line, background: on ? C.cream : "transparent", outlineColor: C.tomato }}
                >
                  {p.label}
                  <span className="mt-0.5 block text-[12px] font-semibold" style={{ color: C.muted }}>
                    최소 {num(p.moq)}개
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <label className="mt-6 block text-[16px] font-bold" htmlFor="fo-qty">
          수량
        </label>
        <div className="mt-2 flex items-center gap-2">
          <input
            id="fo-qty"
            inputMode="numeric"
            value={qtyRaw === "" ? "" : num(qty)}
            onChange={(e) => setQtyRaw(e.target.value.replace(/\D/g, "").slice(0, 6))}
            aria-describedby="fo-qty-help"
            aria-invalid={under}
            className={`h-12 w-40 rounded-[8px] border px-3 text-right text-[18px] font-bold tabular-nums ${focusRing}`}
            style={{ borderColor: under ? C.error : C.line, background: "#fff", outlineColor: C.tomato }}
          />
          <span className="text-[16px] font-bold">개</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {tiers.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => setQtyRaw(String(q))}
              className={`rounded-[6px] border px-3 py-1 text-[13px] font-semibold tabular-nums ${focusRing}`}
              style={{ borderColor: qty === q ? C.tomato : C.line, background: qty === q ? C.tomato : "transparent", color: qty === q ? "#fff" : C.ink, outlineColor: C.tomato }}
            >
              {num(q)}
            </button>
          ))}
        </div>
        <p id="fo-qty-help" className="mt-2 flex items-center gap-1.5 text-[14px]" style={{ color: under ? C.error : C.muted }}>
          {under && <AlertCircle size={15} aria-hidden />}
          {under ? `${pk.label}는 ${num(pk.moq)}개부터 만들어요. 최소 수량으로 계산했어요.` : pk.why}
        </p>

        <label className="mt-6 flex cursor-pointer items-center gap-3 text-[16px] font-bold">
          <input type="checkbox" checked={local} onChange={(e) => setLocal(e.target.checked)} className={`h-5 w-5 accent-[#9a3324] ${focusRing}`} />
          국산 원료로 지정
        </label>
      </div>

      {/* 결과 */}
      <div className="rounded-[8px] p-5 md:p-7" style={{ background: C.ink, color: C.paper }} aria-live="polite">
        <p className="text-[15px] font-semibold opacity-80">개당 단가 개략</p>
        <p className="mt-1 text-[34px] font-bold leading-tight tracking-[-0.03em] md:text-[42px] tabular-nums">
          {num(r.lo)} ~ {num(r.hi)}
          <span className="ml-1 text-[20px]">원</span>
        </p>
        <p className="mt-2 text-[15px] opacity-85">
          {num(Math.max(qty, pk.moq))}개 총액 {won(r.lo * Math.max(qty, pk.moq))} ~ {won(r.hi * Math.max(qty, pk.moq))}
        </p>
        {nextTier && nextGain > 0 && (
          <p className="mt-1 text-[14px] font-semibold" style={{ color: "#e9b8ab" }}>
            {num(nextTier.from)}개부터는 개당 약 {num(round10(nextGain / 2))}원 내려가요
          </p>
        )}

        {/* 수량 구간별 막대. 막대 높이는 scaleY 로 바꾼다 */}
        <div className="mt-6 flex h-[150px] items-end gap-2 border-b pb-0" style={{ borderColor: "rgba(255,255,255,0.25)" }} aria-hidden>
          {tiers.map((q) => {
            const u = unitRange(pk, q, local).hi;
            const on = tierK(Math.max(qty, pk.moq)) === tierK(q);
            return (
              <div key={q} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end">
                <span className="mb-1 text-[11px] font-semibold tabular-nums sm:text-[12px]" style={{ color: on ? "#e9b8ab" : "rgba(255,255,255,0.7)" }}>
                  {num(u)}
                </span>
                <motion.div
                  className="w-full rounded-t-[4px]"
                  style={{ height: "100%", originY: 1, background: on ? "#c4705f" : "rgba(255,255,255,0.22)" }}
                  initial={false}
                  animate={{ scaleY: Math.max(0.08, (u / maxUnit) * 0.86) }}
                  transition={{ duration: reduce ? 0 : 0.45, ease: EASE }}
                />
              </div>
            );
          })}
        </div>
        <div className="mt-1.5 flex gap-2" aria-hidden>
          {tiers.map((q) => (
            <span key={q} className="min-w-0 flex-1 text-center text-[11px] opacity-75 tabular-nums sm:text-[12px]">
              {q >= 10000 ? `${q / 10000}만` : num(q)}
            </span>
          ))}
        </div>

        <dl className="mt-6 grid gap-3 text-[14px] leading-[1.6] sm:grid-cols-2">
          <div>
            <dt className="font-bold">단가에 포함</dt>
            <dd className="opacity-85">원료, 포장재, 제조, 살균, 금속 검출</dd>
          </div>
          <div>
            <dt className="font-bold">따로 드는 비용</dt>
            <dd className="opacity-85">파우치 인쇄 동판비, 영양성분 분석, 운송비</dd>
          </div>
        </dl>
        <p className="mt-3 text-[13px] opacity-75">부가세 별도. 레시피와 원료 시세에 따라 달라져요.</p>

        <button
          type="button"
          onClick={() => onSample(Math.max(qty, pk.moq))}
          data-gtm-cta="food-oem_calc_sample"
          className={`mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-[6px] text-[16px] font-semibold text-white ${focusRing}`}
          style={{ background: "#ffffff", color: C.ink, outlineColor: "#ffffff" }}
        >
          <PackageOpen size={18} aria-hidden />이 조건으로 샘플 의뢰
        </button>
      </div>
    </div>
  );
}

/* ---------- 3. 생산 공정 ---------- */

function Process({ reduce }: { reduce: boolean }) {
  const [idx, setIdx] = useState(2);
  const s = STEPS[idx];
  const t = { duration: reduce ? 0 : 0.5, ease: EASE };

  return (
    <div className="mt-8">
      {/* 공정 라인. 고른 칸 위로 파우치 표시가 옮겨 간다 */}
      <div className="relative">
        <div className="absolute inset-x-2 top-[57px] hidden h-px md:block" style={{ background: C.line }} aria-hidden />
        <ol className="relative grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-7 md:gap-1.5">
          {STEPS.map((st, i) => {
            const on = i === idx;
            return (
              <li key={st.name}>
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => setIdx(i)}
                  className={`relative flex w-full flex-col items-center rounded-[8px] px-1 pb-3 pt-2 text-center ${focusRing}`}
                  style={{ outlineColor: C.tomato, background: on ? C.cream : "transparent" }}
                >
                  <span className="relative flex h-[46px] w-full items-end justify-center">
                    {on && (
                      <motion.span layoutId="fo-proc-pouch" transition={t} className="block" aria-hidden>
                        <PackageOpen size={22} style={{ color: C.tomato }} />
                      </motion.span>
                    )}
                  </span>
                  <span
                    className="relative z-[1] mt-1.5 inline-flex h-[14px] w-[14px] items-center justify-center rounded-full border"
                    style={{ borderColor: on ? C.tomato : "#b5b5b5", background: on ? C.tomato : C.paper }}
                    aria-hidden
                  />
                  <span className="mt-2 text-[15px] font-bold leading-tight">{st.name}</span>
                  {st.ccp && (
                    <span className="mt-1 rounded-[4px] border px-1.5 text-[12px] font-semibold" style={{ borderColor: C.line, color: C.tomatoDeep }}>
                      {st.ccp}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={idx}
          initial={reduce ? false : { clipPath: "inset(0 0 100% 0)" }}
          animate={{ clipPath: "inset(0 0 0% 0)" }}
          exit={reduce ? { opacity: 0 } : { clipPath: "inset(100% 0 0 0)" }}
          transition={{ duration: reduce ? 0 : DUR, ease: EASE }}
          className="mt-6 grid gap-5 rounded-[8px] border p-5 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] md:p-7"
          style={{ borderColor: C.line }}
          aria-live="polite"
        >
          <div>
            <h3 className="flex flex-wrap items-center gap-2 text-[22px] font-bold">
              {s.name}
              {s.ccp && (
                <span className="rounded-[4px] border px-2 py-0.5 text-[13px] font-semibold" style={{ borderColor: C.line, color: C.tomatoDeep }}>
                  {s.ccp} 중요관리점
                </span>
              )}
            </h3>
            <p className="mt-3 text-[16px] leading-[1.7]">{s.what}</p>
          </div>
          <div className="rounded-[8px] p-4" style={{ background: C.cream }}>
            <p className="text-[14px] font-bold" style={{ color: C.tomatoDeep }}>
              관리 기준
            </p>
            <ul className="mt-2 space-y-1.5">
              {s.rule.map((r) => (
                <li key={r} className="flex gap-2 text-[15px] leading-[1.55]">
                  <Check size={17} className="mt-[3px] flex-none" style={{ color: C.tomatoDeep }} aria-hidden />
                  {r}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </AnimatePresence>
      <p className="mt-4 text-[14px]" style={{ color: C.muted }}>
        공정마다 작업 일지와 온도 기록을 남겨요. 거래처에는 제조번호별 기록을 보여 드려요.
      </p>
    </div>
  );
}

/* ---------- 4. 샘플 의뢰 ---------- */

interface Done {
  no: string;
  company: string;
  name: string;
  phone: string;
  item: string;
  pack: string;
  reply: Date;
}

function SampleForm({ reduce, today, prefill }: { reduce: boolean; today: Date; prefill: Prefill | null }) {
  const initQty = prefill ? (prefill.qty < 1000 ? QTY_PLANS[0] : prefill.qty < 3000 ? QTY_PLANS[1] : prefill.qty < 10000 ? QTY_PLANS[2] : QTY_PLANS[3]) : "";
  const [company, setCompany] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [item, setItem] = useState(prefill?.item ?? "");
  const [pack, setPack] = useState<string>(prefill ? packById(prefill.pack).label : "");
  const [plan, setPlan] = useState<string>(initQty);
  const [memo, setMemo] = useState("");
  const [sendRef, setSendRef] = useState(false);
  const [agree, setAgree] = useState(false);
  const [tried, setTried] = useState(false);
  const [done, setDone] = useState<Done | null>(null);

  const phoneOk = /^01[016789]\d{7,8}$/.test(phone.replace(/\D/g, ""));
  const errs = {
    company: company.trim().length < 2 ? "업체명이나 브랜드명을 적어 주세요." : "",
    name: name.trim().length < 2 ? "담당자 이름을 적어 주세요." : "",
    phone: !phoneOk ? "휴대폰 번호를 확인해 주세요." : "",
    item: !item ? "만들 품목을 골라 주세요." : "",
    agree: !agree ? "개인정보 수집에 동의해 주세요." : "",
  };
  const bad = Object.values(errs).some(Boolean);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (bad) {
      const first = Object.entries(errs).find(([, v]) => v)?.[0];
      if (first) document.getElementById(`fo-f-${first}`)?.focus();
      return;
    }
    const seq = 1000 + ((company.length * 37 + name.length * 11 + today.getDate() * 7) % 9000);
    setDone({
      no: `S${String(today.getFullYear()).slice(2)}${p2(today.getMonth() + 1)}${p2(today.getDate())}-${seq}`,
      company: company.trim(),
      name: maskName(name),
      phone: maskPhone(phone),
      item,
      pack: pack || "상담하며 정해요",
      reply: addBizDays(today, 1),
    });
  };

  const field = (key: keyof typeof errs) => ({
    id: `fo-f-${key}`,
    "aria-invalid": tried && !!errs[key],
    "aria-describedby": tried && errs[key] ? `fo-f-${key}-err` : undefined,
  });
  const inputCls = `mt-1.5 h-12 w-full rounded-[8px] border bg-white px-3 text-[16px] ${focusRing}`;
  const border = (key: keyof typeof errs) => ({ borderColor: tried && errs[key] ? C.error : C.line, outlineColor: C.tomato });
  const err = (k: keyof typeof errs) =>
    tried && errs[k] ? (
      <p id={`fo-f-${k}-err`} className="mt-1 flex items-center gap-1 text-[14px] font-semibold" style={{ color: C.error }}>
        <AlertCircle size={15} aria-hidden />
        {errs[k]}
      </p>
    ) : null;

  if (done) {
    return (
      <motion.div
        initial={reduce ? false : { clipPath: "inset(0 0 100% 0)" }}
        animate={{ clipPath: "inset(0 0 0% 0)" }}
        transition={{ duration: reduce ? 0 : 0.5, ease: EASE }}
        className="rounded-[8px] border p-5 md:p-7"
        style={{ borderColor: C.line, background: "#fff" }}
        role="status"
      >
        <p className="inline-flex items-center gap-2 text-[22px] font-bold">
          <Check size={24} style={{ color: C.tomatoDeep }} aria-hidden />
          샘플 의뢰가 접수됐어요
        </p>
        <dl className="mt-5 grid grid-cols-[110px_minmax(0,1fr)] gap-y-2.5 text-[16px]">
          <dt style={{ color: C.muted }}>접수 번호</dt>
          <dd className="font-bold tabular-nums">
            {done.no}
          </dd>
          <dt style={{ color: C.muted }}>업체</dt>
          <dd>{done.company}</dd>
          <dt style={{ color: C.muted }}>담당자</dt>
          <dd>
            {done.name} / {done.phone}
          </dd>
          <dt style={{ color: C.muted }}>품목</dt>
          <dd>
            {done.item}, {done.pack}
          </dd>
          <dt style={{ color: C.muted }}>담당 창구</dt>
          <dd>
            {KAKAO} 또는 전화 {TEL}
          </dd>
          <dt style={{ color: C.muted }}>회신 예정일</dt>
          <dd className="font-bold" style={{ color: C.tomatoDeep }}>
            {fmtKo(done.reply)}까지 전화드려요
          </dd>
        </dl>
        <p className="mt-5 rounded-[8px] p-3 text-[15px] leading-[1.6]" style={{ background: C.cream }}>
          맛 방향을 통화로 정한 뒤 7~10일 안에 샘플을 택배로 보내요.
          {sendRef && " 참고할 소스는 통화 때 보낼 곳을 알려 드려요."}
        </p>
        <button
          type="button"
          onClick={() => {
            setDone(null);
            setTried(false);
          }}
          className={`mt-5 inline-flex items-center gap-1.5 text-[15px] font-bold underline underline-offset-4 ${focusRing}`}
          style={{ outlineColor: C.tomato }}
        >
          <RotateCcw size={16} aria-hidden />
          다른 품목 의뢰하기
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-5 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label htmlFor="fo-f-company" className="text-[16px] font-bold">
          업체명 또는 브랜드명
        </label>
        <input {...field("company")} value={company} onChange={(e) => setCompany(e.target.value)} autoComplete="organization" className={inputCls} style={border("company")} />
        {err("company")}
      </div>
      <div>
        <label htmlFor="fo-f-name" className="text-[16px] font-bold">
          담당자 이름
        </label>
        <input {...field("name")} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={inputCls} style={border("name")} />
        {err("name")}
      </div>
      <div>
        <label htmlFor="fo-f-phone" className="text-[16px] font-bold">
          휴대폰
        </label>
        <input
          {...field("phone")}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          inputMode="tel"
          autoComplete="tel"
          placeholder="010-0000-0000"
          className={inputCls}
          style={border("phone")}
        />
        {err("phone")}
      </div>
      <div>
        <label htmlFor="fo-f-item" className="text-[16px] font-bold">
          만들 품목
        </label>
        <div className="relative">
          <select {...field("item")} value={item} onChange={(e) => setItem(e.target.value)} className={`${inputCls} appearance-none pr-10`} style={border("item")}>
            <option value="">골라 주세요</option>
            {GROUPS.map((g) => (
              <optgroup key={g} label={g}>
                {ITEMS.filter((it) => it.group === g).map((it) => (
                  <option key={it.name}>{it.name}</option>
                ))}
              </optgroup>
            ))}
            <option>목록에 없는 소스</option>
          </select>
          <ChevronDown size={18} className="pointer-events-none absolute right-3 top-[26px]" aria-hidden />
        </div>
        {err("item")}
      </div>
      <div>
        <label htmlFor="fo-f-pack" className="text-[16px] font-bold">
          포장
        </label>
        <div className="relative">
          <select id="fo-f-pack" value={pack} onChange={(e) => setPack(e.target.value)} className={`${inputCls} appearance-none pr-10`} style={{ borderColor: C.line, outlineColor: C.tomato }}>
            <option value="">상담하며 정해요</option>
            {PACKS.map((p) => (
              <option key={p.id}>{p.label}</option>
            ))}
          </select>
          <ChevronDown size={18} className="pointer-events-none absolute right-3 top-[26px]" aria-hidden />
        </div>
      </div>
      <fieldset className="sm:col-span-2">
        <legend className="text-[16px] font-bold">첫 주문 예상 수량</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {QTY_PLANS.map((q) => {
            const on = plan === q;
            return (
              <button
                key={q}
                type="button"
                aria-pressed={on}
                onClick={() => setPlan(on ? "" : q)}
                className={`rounded-[6px] border px-3.5 py-1.5 text-[14px] font-semibold ${focusRing}`}
                style={{ borderColor: on ? C.tomato : C.line, background: on ? C.tomato : "transparent", color: on ? "#fff" : C.ink, outlineColor: C.tomato }}
              >
                {q}
              </button>
            );
          })}
        </div>
      </fieldset>
      <div className="sm:col-span-2">
        <label htmlFor="fo-f-memo" className="text-[16px] font-bold">
          원하는 맛 <span className="text-[14px] font-medium" style={{ color: C.muted }}>(선택)</span>
        </label>
        <textarea
          id="fo-f-memo"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          rows={3}
          placeholder="예: 지금 매장에서 쓰는 소스 맛 그대로, 조금 덜 달게"
          className={`mt-1.5 w-full rounded-[8px] border bg-white px-3 py-2.5 text-[16px] ${focusRing}`}
          style={{ borderColor: C.line, outlineColor: C.tomato }}
        />
      </div>
      <label className="flex cursor-pointer items-start gap-3 text-[15px] sm:col-span-2">
        <input type="checkbox" checked={sendRef} onChange={(e) => setSendRef(e.target.checked)} className={`mt-0.5 h-5 w-5 flex-none accent-[#9a3324] ${focusRing}`} />
        지금 쓰는 소스를 보내서 맞춰 보고 싶어요
      </label>
      <div className="sm:col-span-2">
        <label className="flex cursor-pointer items-start gap-3 text-[15px]">
          <input
            {...field("agree")}
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
            className={`mt-0.5 h-5 w-5 flex-none accent-[#9a3324] ${focusRing}`}
          />
          <span>
            개인정보 수집, 이용 동의 <span style={{ color: C.muted }}>(업체명, 이름, 휴대폰. 상담 뒤 1년 보관)</span>
          </span>
        </label>
        {err("agree")}
      </div>
      <button
        type="submit"
        data-gtm-cta="food-oem_sample_submit"
        className={`inline-flex h-14 items-center justify-center gap-2 rounded-[6px] text-[17px] font-semibold text-white sm:col-span-2 ${focusRing}`}
        style={{ background: C.tomato, outlineColor: C.tomatoDeep }}
      >
        <PackageOpen size={19} aria-hidden />
        샘플 의뢰하기
      </button>
    </form>
  );
}

/** 의뢰부터 첫 출고까지 */
function Flow() {
  const rows: [string, string, string][] = [
    ["상담", "맛, 포장, 수량 통화", "1일"],
    ["샘플 제작", "2종까지 만들어 택배 발송", "7~10일"],
    ["맛 확정, 견적", "고친 샘플 한 번 더 가능", "3~5일"],
    ["포장재 인쇄", "파우치 디자인 받아 인쇄", "10~14일"],
    ["품목제조보고", "소비기한 설정까지 대행", "포장재와 같이"],
    ["생산, 출고", "검사 성적 첨부해 출고", "3~5일"],
  ];
  return (
    <aside aria-labelledby="fo-flow-title" className="rounded-[8px] p-5 md:p-7" style={{ background: C.cream }}>
      <h3 id="fo-flow-title" className="flex items-center gap-2 text-[20px] font-bold">
        <Factory size={21} aria-hidden style={{ color: C.tomatoDeep }} />
        의뢰부터 첫 출고까지
      </h3>
      <ol className="mt-4">
        {rows.map(([a, b, d], i) => (
          <li key={a} className="relative flex gap-3 pb-4 pl-1 last:pb-0">
            <span className="relative flex flex-col items-center" aria-hidden>
              <span className="mt-1.5 h-3 w-3 rounded-full border" style={{ borderColor: C.tomatoDeep, background: i === 0 ? C.tomatoDeep : C.paper }} />
              {i < rows.length - 1 && <span className="mt-1 w-[2px] flex-1" style={{ background: C.line }} />}
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-baseline justify-between gap-x-3">
                <b className="text-[16px]">{a}</b>
                <span className="text-[14px] font-semibold tabular-nums" style={{ color: C.tomatoDeep }}>
                  {d}
                </span>
              </span>
              <span className="block text-[14px]" style={{ color: C.muted }}>
                {b}
              </span>
            </span>
          </li>
        ))}
      </ol>
      <p className="mt-5 border-t pt-4 text-[14px] leading-[1.65]" style={{ borderColor: C.line }}>
        샘플 제작비는 품목당 100,000원이에요. 본 생산을 맡기시면 첫 주문 금액에서 빼 드려요.
      </p>
    </aside>
  );
}

/* ---------- 자주 묻는 질문 ---------- */

function Faq() {
  const qa: [string, string][] = [
    ["매장에서 쓰는 소스를 그대로 만들 수 있나요?", "레시피를 주시거나 소스를 보내 주시면 맞춰서 샘플을 만들어요. 매장에서 바로 만든 맛과 살균한 뒤 맛은 조금 달라서, 보통 샘플을 한두 번 고쳐요."],
    ["레시피는 누구 것이 되나요?", "의뢰하신 분이 가져오신 레시피는 그분 것이에요. 저희가 새로 개발한 레시피는 계약서에 소유를 따로 적어요. 다른 거래처에 같은 배합으로 만들지 않아요."],
    ["품목제조보고와 표시사항은 누가 하나요?", "제조는 저희 공장 이름으로 보고해요. 판매원 표시, 영양성분, 알레르기 표시 문구는 포장 디자인 전에 같이 맞춰 드려요."],
    ["소비기한은 얼마나 되나요?", "상온 파우치 소스는 보통 6개월 ~ 12개월이에요. 품목마다 보존 시험을 거쳐 정해요."],
  ];
  return (
    <div className="mt-6 divide-y border-y" style={{ borderColor: C.line }}>
      {qa.map(([q, a]) => (
        <details key={q} className="group" style={{ borderColor: C.line }}>
          <summary className={`flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-[17px] font-bold ${focusRing}`} style={{ outlineColor: C.tomato }}>
            {q}
            <ChevronDown size={20} className="flex-none transition-transform group-open:rotate-180" aria-hidden />
          </summary>
          <p className="pb-5 text-[16px] leading-[1.7]" style={{ color: C.muted }}>
            {a}
          </p>
        </details>
      ))}
    </div>
  );
}

/* ---------- 오시는 길 ---------- */

function Visit() {
  const rows: [ReactNode, string, string][] = [
    [<MapPin key="m" size={19} aria-hidden />, "공장 주소", ADDRESS],
    [<Clock key="c" size={19} aria-hidden />, "상담 시간", "평일 09:00 ~ 18:00, 점심시간 12:00 ~ 13:00, 주말 공휴일 휴무"],
    [<Truck key="t" size={19} aria-hidden />, "화물 입출고", "평일 08:00 ~ 16:00, 5톤 윙바디 진입 가능"],
    [<Phone key="p" size={19} aria-hidden />, "대표전화", TEL],
    [<MessageCircle key="k" size={19} aria-hidden />, "카카오톡", "카카오톡 채널 곰파트너"],
  ];
  return (
    <div className="mt-6 grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <dl className="grid gap-4">
        {rows.map(([icon, k, v]) => (
          <div key={k} className="flex gap-3">
            <span className="mt-[3px] flex-none" style={{ color: C.tomatoDeep }}>
              {icon}
            </span>
            <div>
              <dt className="text-[14px] font-bold" style={{ color: C.muted }}>
                {k}
              </dt>
              <dd className="text-[16px] font-semibold">{v}</dd>
            </div>
          </div>
        ))}
      </dl>
      <div className="rounded-[8px] p-5 text-[15px] leading-[1.7]" style={{ background: C.cream }}>
        <p className="flex items-center gap-2 text-[17px] font-bold">
          <Factory size={19} aria-hidden style={{ color: C.tomatoDeep }} />
          공장 방문
        </p>
        <p className="mt-2">계약 전에 공장을 보고 싶으시면 미리 날짜를 잡아 주세요. 생산 중에는 위생복을 입고 복도 창으로 라인을 봐요.</p>
        <p className="mt-2">승용차는 정문 옆 방문객 주차장에 세우시면 돼요.</p>
      </div>
    </div>
  );
}

/* 로고: 메인 사이트와 같은 곰 로고 + 곰파트너(크게) + 업종(작게) */
function SampleLogo({ light, size = 20 }: { light?: boolean; size?: number }) {
  const mark = size + 8;
  return (
    <span className="inline-flex items-center gap-2 leading-none" style={{ color: light ? "#fff" : "#111" }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- 메인 사이트와 같은 곰 로고 */}
      <img src="/images/logo-bear.png" alt="" aria-hidden width={mark} height={mark} className="shrink-0" style={{ width: mark, height: mark }} />
      <span className="flex items-baseline gap-1 whitespace-nowrap">
        <span className="font-bold tracking-[-0.03em]" style={{ fontSize: size }}>
          곰파트너
        </span>
        <span className="text-[12px] font-semibold opacity-75">식품 제조 샘플</span>
      </span>
    </span>
  );
}
