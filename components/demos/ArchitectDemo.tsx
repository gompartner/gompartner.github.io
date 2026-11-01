"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Clock, MapPin, MessageCircle, Phone, X } from "lucide-react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { useDemoToday } from "@/hooks/useDemoToday";
import { DemoMakerInfo } from "@/components/demos/DemoMakerInfo";

/* 건축사사무소 홈페이지 샘플: 가상의 곰파트너 건축사사무소. 단독주택과 근린생활시설(상가주택, 의원 건물, 카페 건물) 설계.
   상호, 주소, 작업 목록, 손님 이름은 모두 가상이다.

   국내 소규모 건축사사무소 사이트 공통 구성(참고): 메뉴는 사무소 소개, 작업(Works, 프로젝트), 설계 과정, 문의(상담신청), 오시는 길.
   작업은 단독주택, 근린생활시설, 공동주택 같은 용도별 필터와 대지 위치, 대지 면적, 연면적, 규모, 구조, 진행 상태를 적는다.
   상담 폼은 건축주 이름, 연락처, 대지 위치, 건물 용도, 예산과 일정 정도를 받는다. "규모 검토", "대지 분석", "건축주",
   "계획설계, 기본설계, 실시설계, 인허가" 같은 말을 그대로 쓴다. 용도지역은 토지이음에서 주소로 확인한다고 안내하는 곳이 많다.

   첫 화면(ar-poster): 얇은 글자 메뉴 아래 바로 작업 사진 격자. 첫 장은 크게(PC 2x2), 사진 위에 글자를 얹지 않고 아래에 이름, 용도, 진행 한 줄.
   격자 위 용도 필터(전체, 단독주택, 근린생활시설)로 격자가 다시 채워지고, 사진을 누르면 PC 는 오른쪽 패널, 휴대폰은 아래 시트로
   정보 표(용도, 진행, 대지면적, 연면적, 규모, 구조)가 열린다. 사무소 소개 한 줄은 격자 아래.
   모션: 필터를 바꾸면 칸이 짧게 자리를 옮긴다. 동작 줄이기면 멈춘다.

   구간
   1. 작업 목록(첫 화면): 전체, 단독주택, 근린생활시설 필터, 사진을 누르면 상세 패널.
   2. 설계 과정과 기간: 단계별 하는 일, 받는 도면, 주 단위 기간 목록.
   3. 상담 안내: 전화, 카카오톡 창구와 상담 전에 준비할 자료. */

const IMG = "/images/demo-architect-office";

const ADDRESS = "서울 ㅇㅇ구 ㅇㅇ로 00, 3층";
const TEL = "02-000-0000";
const KAKAO = "카카오톡 채널 건축사사무소";

const C = {
  paper: "#ffffff",
  soft: "#f7f7f5",
  card: "#f7f7f5",
  ink: "#111111",
  body: "#4b4b4b",
  muted: "#767676",
  line: "#e5e5e5",
  /** 입력칸, 버튼 테두리 */
  field: "#c4c4c4",
  /** 강조색 하나. 벽돌빛 주황을 낮춘 갈색 */
  accent: "#8a4a26",
  error: "#b42318",
};

/* 모션 상수. 시간은 초, 이징은 cubic-bezier */
const EASE = [0.22, 1, 0.36, 1] as const;
/** 칩, 패널 전환 */
const DUR = 0.35;

const focusRing = "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2";

/** 제곱미터 표기. 키보드 글자 m 과 위첨자 2 로 쓴다 */
function M2() {
  return (
    <span>
      m<sup className="text-[0.62em]">2</sup>
    </span>
  );
}

type Kind = "단독주택" | "근린생활시설";
type Work = {
  id: string;
  name: string;
  kind: Kind;
  site: number;
  gross: number;
  scale: string;
  structure: string;
  state: "준공" | "시공 중" | "인허가 중" | "설계 중";
  note: string;
};

const WORKS: Work[] = [
  { id: "w1", name: "ㅇㅇ동 단독주택", kind: "단독주택", site: 198, gross: 172, scale: "지상 2층", structure: "철근콘크리트", state: "준공", note: "마당을 가운데 둔 ㄱ자 집" },
  { id: "w2", name: "ㅂㅈ리 주말주택", kind: "단독주택", site: 330, gross: 99, scale: "지상 1층, 다락", structure: "경량목구조", state: "준공", note: "주말에 쓰는 작은 집" },
  { id: "w3", name: "ㅅㄱ동 상가주택", kind: "근린생활시설", site: 165, gross: 380, scale: "지상 4층", structure: "철근콘크리트", state: "시공 중", note: "1층 상가, 2~4층 주택" },
  { id: "w4", name: "ㅁㅇ동 근린생활시설", kind: "근린생활시설", site: 230, gross: 520, scale: "지상 5층", structure: "철근콘크리트", state: "인허가 중", note: "모퉁이 땅, 저층 상가" },
  { id: "w5", name: "ㅎㄴ리 단독주택", kind: "단독주택", site: 450, gross: 145, scale: "지상 2층", structure: "경량목구조", state: "설계 중", note: "어긋나게 놓은 두 동" },
  { id: "w6", name: "ㄷㅅ동 의원 건물", kind: "근린생활시설", site: 280, gross: 690, scale: "지하 1층, 지상 5층", structure: "철근콘크리트", state: "준공", note: "엘리베이터와 진료실 층" },
  { id: "w7", name: "ㄱㅍ동 두 가구 주택", kind: "단독주택", site: 210, gross: 230, scale: "지상 3층", structure: "철근콘크리트", state: "준공", note: "부모님과 나눠 사는 집" },
  { id: "w8", name: "ㅇㄹ동 카페 건물", kind: "근린생활시설", site: 140, gross: 160, scale: "지상 2층", structure: "철골조", state: "준공", note: "1층 전면 통창" },
];

const FILTERS: ("전체" | Kind)[] = ["전체", "단독주택", "근린생활시설"];

/* ---------- 첫 화면: 작업 사진 격자 ---------- */

/** 상단 메뉴. 건축사사무소 사이트 표준(작업, 설계 과정, 문의, 오시는 길)을 기존 구간에 잇는다 */
const NAV = [
  ["ar-works", "작업"],
  ["ar-process", "설계 과정"],
  ["ar-contact", "상담 안내"],
  ["ar-visit", "오시는 길"],
] as const;

type Filter = (typeof FILTERS)[number];

/** 격자 칸 크기. 첫 장은 크게(PC 2x2, 휴대폰 2칸 폭), 빈칸이 남으면 마지막 장을 2칸 폭으로 */
function tileSpan(i: number, n: number) {
  if (i === 0) return "col-span-2 md:row-span-2";
  if (i !== n - 1) return "";
  const wideSm = (n - 1) % 2 === 1;
  const wideMd = (n + 3) % 4 === 3;
  return `${wideSm ? "col-span-2" : ""} ${wideMd ? "md:col-span-2" : wideSm ? "md:col-span-1" : ""}`;
}

function Poster({ reduce, go, onOpen }: { reduce: boolean; go: (id: string) => void; onOpen: (w: Work, list: Work[]) => void }) {
  const [filter, setFilter] = useState<Filter>("전체");
  const list = WORKS.filter((w) => filter === "전체" || w.kind === filter);
  const count = (f: Filter) => (f === "전체" ? WORKS.length : WORKS.filter((w) => w.kind === f).length);

  return (
    <section id="ar-poster" aria-labelledby="ar-poster-title" style={{ background: C.paper, color: C.ink }}>
      {/* 얇은 글자 메뉴. 휴대폰에서는 아래 줄에서 가로로 민다 */}
      <header className="border-b" style={{ borderColor: C.line }}>
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-x-6 px-4 pt-3 md:flex-nowrap md:px-8 md:py-2">
          <p className="inline-flex items-center gap-2 text-[17px] font-bold">
            <SampleLogo />
          </p>
          <nav aria-label="주요 메뉴" className="order-3 -mx-4 w-[calc(100%+32px)] overflow-x-auto md:order-none md:mx-0 md:w-auto md:overflow-visible">
            <ul className="flex whitespace-nowrap px-2 md:gap-2 md:px-0">
              {NAV.map(([id, label]) => (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => go(id)}
                    className={`inline-flex min-h-11 items-center rounded-[4px] px-2.5 text-[15px] font-semibold underline-offset-[6px] hover:underline ${focusRing}`}
                    style={{ outlineColor: C.accent }}
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
          <a href={`tel:${TEL}`} className={`inline-flex min-h-11 items-center gap-1.5 rounded-[4px] px-1 text-[15px] font-semibold tabular-nums ${focusRing}`} style={{ outlineColor: C.accent }}>
            <Phone size={16} aria-hidden style={{ color: C.accent }} />
            {TEL}
          </a>
        </div>
      </header>

      <div id="ar-works" className="mx-auto max-w-[1440px] scroll-mt-4 px-4 pb-10 pt-5 md:px-8 md:pb-14 md:pt-7">
        <div className="mb-4 flex flex-col gap-3 md:mb-5 md:flex-row md:items-end md:justify-between">
          <h1 id="ar-poster-title" className="text-[22px] font-bold md:text-[26px]" style={{ letterSpacing: "-0.02em", lineHeight: 1.3, wordBreak: "keep-all" }}>
            단독주택과 근린생활시설 설계 사무소
          </h1>
          <div role="tablist" aria-label="작업 용도" className="-mx-1 flex flex-wrap">
            {FILTERS.map((f) => {
              const on = f === filter;
              return (
                <button
                  key={f}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={() => setFilter(f)}
                  data-gtm-cta={`architect-office_poster_filter_${f}`}
                  className={`inline-flex min-h-11 items-center gap-1.5 rounded-[4px] px-3 text-[16px] font-semibold underline-offset-[8px] ${focusRing}`}
                  style={{ color: on ? C.ink : C.muted, textDecorationLine: on ? "underline" : "none", textDecorationThickness: 2, textDecorationColor: C.accent, outlineColor: C.accent }}
                >
                  {f}
                  <span className="text-[13px] font-medium tabular-nums">{count(f)}</span>
                </button>
              );
            })}
          </div>
        </div>

        <motion.ul layout={!reduce} className="grid grid-cols-[repeat(2,minmax(0,1fr))] gap-x-3 gap-y-5 md:grid-cols-[repeat(4,minmax(0,1fr))] md:gap-x-4 md:gap-y-6">
          <AnimatePresence mode="popLayout" initial={false}>
            {list.map((w, i) => {
              const big = i === 0;
              const span = tileSpan(i, list.length);
              const wide = !big && span.includes("col-span-2");
              return (
                <motion.li
                  key={w.id}
                  layout={!reduce}
                  initial={reduce ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, transition: { duration: reduce ? 0 : 0.2 } }}
                  transition={{ duration: reduce ? 0 : DUR, ease: EASE }}
                  className={`flex min-w-0 ${span}`}
                >
                  <button
                    type="button"
                    onClick={() => onOpen(w, list)}
                    aria-haspopup="dialog"
                    data-gtm-cta="architect-office_poster_work"
                    className={`group flex w-full flex-col text-left ${focusRing}`}
                    style={{ outlineColor: C.accent }}
                  >
                    <span
                      className={`relative block w-full overflow-hidden rounded-[4px] ${big ? "aspect-[4/3] md:aspect-auto md:min-h-0 md:flex-1" : wide ? "aspect-[16/9] md:aspect-auto md:min-h-[120px] md:flex-1" : "aspect-[4/3]"}`}
                      style={{ background: C.card }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element -- 정적 export 라 next/image 최적화를 쓰지 않는다 */}
                      <img
                        src={`${IMG}/work-${w.id}.jpg`}
                        alt={`${w.name} ${w.state === "준공" ? "준공 사진" : "설계 투시도"}`}
                        fetchPriority={big ? "high" : undefined}
                        className={`absolute inset-0 h-full w-full object-cover ${reduce ? "" : "transition-transform duration-500 ease-out group-hover:scale-[1.03]"}`}
                      />
                    </span>
                    <span className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                      <span className={`font-bold ${big ? "text-[17px] md:text-[19px]" : "text-[15px] md:text-[16px]"}`}>{w.name}</span>
                      <span className="text-[13px] md:text-[14px]" style={{ color: C.muted }}>
                        {w.kind}, {w.state}
                      </span>
                    </span>
                  </button>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </motion.ul>

        <div className="mt-8 flex flex-col gap-4 border-t pt-6 md:flex-row md:items-center md:justify-between" style={{ borderColor: C.line }}>
          <p className="text-[15px] leading-[1.7]" style={{ color: C.body }}>
            건축사 김ㅎ늘, 설계 담당 2명, {ADDRESS}
          </p>
          <button
            type="button"
            onClick={() => go("ar-contact")}
            data-gtm-cta="architect-office_poster_cta"
            className={`inline-flex h-11 flex-none items-center self-start rounded-[4px] px-4 text-[15px] font-semibold text-white md:self-auto ${focusRing}`}
            style={{ background: C.accent, outlineColor: C.ink }}
          >
            상담 안내
          </button>
        </div>
      </div>
    </section>
  );
}

/** 작업 상세. PC 는 오른쪽에서 열리는 패널, 휴대폰은 아래에서 올라오는 시트 */
function WorkPanel({ open, onClose, onMove, onContact, reduce }: { open: { w: Work; list: Work[] } | null; onClose: () => void; onMove: (d: 1 | -1) => void; onContact: () => void; reduce: boolean }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const [wide, setWide] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const f = () => setWide(mq.matches);
    f();
    mq.addEventListener("change", f);
    return () => mq.removeEventListener("change", f);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onMove(1);
      if (e.key === "ArrowLeft") onMove(-1);
    };
    window.addEventListener("keydown", key);
    const ov = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", key);
      document.body.style.overflow = ov;
      prev?.focus();
    };
    // 열릴 때 한 번만 포커스를 옮긴다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open === null]);

  const from = wide ? { x: "100%" } : { y: "100%" };
  const t = { duration: reduce ? 0 : DUR, ease: EASE };
  const idx = open ? open.list.findIndex((x) => x.id === open.w.id) : 0;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60]">
          <motion.div className="absolute inset-0" style={{ background: "rgba(17,17,17,0.45)" }} initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={t} onClick={onClose} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="ar-panel-title"
            className="absolute inset-x-0 bottom-0 max-h-[92svh] overflow-y-auto rounded-t-[10px] bg-white md:inset-y-0 md:left-auto md:right-0 md:max-h-none md:w-[min(520px,100%)] md:rounded-none"
            initial={reduce ? false : from}
            animate={{ x: 0, y: 0 }}
            exit={reduce ? { opacity: 0 } : from}
            transition={t}
          >
            <div className="sticky top-0 z-[1] flex items-center justify-between gap-2 border-b bg-white px-4 py-2 md:px-6" style={{ borderColor: C.line }}>
              <p className="text-[14px] tabular-nums" style={{ color: C.muted }}>
                {idx + 1} / {open.list.length}
              </p>
              <div className="flex items-center gap-1">
                {([-1, 1] as const).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => onMove(d)}
                    aria-label={d < 0 ? "이전 작업" : "다음 작업"}
                    className={`inline-flex h-11 w-11 items-center justify-center rounded-[4px] ${focusRing}`}
                    style={{ outlineColor: C.accent }}
                  >
                    {d < 0 ? <ChevronLeft size={22} aria-hidden /> : <ChevronRight size={22} aria-hidden />}
                  </button>
                ))}
                <button ref={closeRef} type="button" onClick={onClose} aria-label="닫기" className={`inline-flex h-11 w-11 items-center justify-center rounded-[4px] ${focusRing}`} style={{ outlineColor: C.accent }}>
                  <X size={22} aria-hidden />
                </button>
              </div>
            </div>
            <div className="px-4 pb-8 pt-4 md:px-6">
              {/* eslint-disable-next-line @next/next/no-img-element -- 정적 export 라 next/image 최적화를 쓰지 않는다 */}
              <img src={`${IMG}/work-${open.w.id}.jpg`} alt={`${open.w.name} ${open.w.state === "준공" ? "준공 사진" : "설계 투시도"}`} className="block aspect-[4/3] w-full rounded-[4px] object-cover" />
              <h2 id="ar-panel-title" className="mt-4 text-[22px] font-bold">
                {open.w.name}
              </h2>
              <p className="mt-1 text-[15px]" style={{ color: C.muted }}>
                {open.w.note}
              </p>
              <dl className="mt-4 grid grid-cols-[repeat(2,minmax(0,1fr))] border-t text-[15px]" style={{ borderColor: C.line }}>
                {[
                  ["용도", open.w.kind],
                  ["진행", open.w.state],
                  ["대지면적", <span key="s" className="tabular-nums">{open.w.site}<M2 /></span>],
                  ["연면적", <span key="g" className="tabular-nums">{open.w.gross}<M2 /></span>],
                  ["규모", open.w.scale],
                  ["구조", open.w.structure],
                ].map(([k, v]) => (
                  <div key={String(k)} className="border-b py-2.5 pr-2" style={{ borderColor: C.line }}>
                    <dt className="text-[13px]" style={{ color: C.muted }}>
                      {k}
                    </dt>
                    <dd className="mt-0.5 font-semibold">{v}</dd>
                  </div>
                ))}
              </dl>
              <button
                type="button"
                onClick={onContact}
                data-gtm-cta="architect-office_panel_contact"
                className={`mt-6 inline-flex h-12 w-full items-center justify-center rounded-[4px] px-4 text-[16px] font-semibold text-white ${focusRing}`}
                style={{ background: C.accent, outlineColor: C.ink }}
              >
                상담신청
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ---------- 3. 설계 과정과 기간 ---------- */

type Step = { name: string; weeks: [number, number] | null; out: string; desc: string };
const STEPS: Step[] = [
  { name: "상담과 대지 검토", weeks: [1, 2], out: "대지 현황 조사, 법규 검토, 규모 검토서", desc: "땅을 직접 보고 건폐율, 용적률, 일조 사선, 주차 대수를 따져 지을 수 있는 크기부터 정해요." },
  { name: "계획설계", weeks: [4, 6], out: "배치도, 평면 안 2~3개, 스터디 모형", desc: "방 배치와 동선을 두세 가지 안으로 그려요. 일조와 조망도 같이 봐요." },
  { name: "기본설계", weeks: [3, 4], out: "평면도, 입면도, 단면도, 마감재 방향", desc: "고른 안을 다듬어 창 크기, 층고, 외장재를 정해요. 대략 공사비도 이때 나와요." },
  { name: "인허가", weeks: [4, 8], out: "건축허가 도서, 관련 부서 협의", desc: "구청 건축과에 건축허가를 접수하고 보완 요청에 답해요. 기간은 지역과 규모에 따라 달라요." },
  { name: "실시설계", weeks: [6, 8], out: "시공 도면, 구조, 기계, 전기 도면", desc: "시공사가 견적을 내고 그대로 지을 수 있는 도면을 만들어요." },
  { name: "공사 중 현장 협의", weeks: null, out: "현장 회의, 도면 질의 답변, 변경 도면", desc: "착공 뒤에도 현장에 나가 설계한 대로 지어지는지 보고, 바뀌는 곳은 도면을 고쳐 드려요." },
];
const TOTAL_MIN = STEPS.reduce((s, x) => s + (x.weeks ? x.weeks[0] : 0), 0);
const TOTAL_MAX = STEPS.reduce((s, x) => s + (x.weeks ? x.weeks[1] : 0), 0);

function Process() {
  return (
    <div>
      <ol className="border-t" style={{ borderColor: C.ink }} aria-label="설계 단계">
        {STEPS.map((s, i) => (
          <li key={s.name} className="grid gap-2 border-b py-5 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.6fr)_120px] md:gap-6" style={{ borderColor: C.line }}>
            <p className="flex items-center gap-3">
              <span className="inline-flex h-7 w-7 flex-none items-center justify-center rounded-full text-[13px] font-bold tabular-nums" style={{ background: C.accent, color: "#fff" }}>
                {i + 1}
              </span>
              <span className="text-[17px] font-bold">{s.name}</span>
            </p>
            <div className="text-[15px] leading-[1.7]">
              <p>{s.desc}</p>
              <p className="mt-1" style={{ color: C.muted }}>
                <b style={{ color: C.ink }}>받으시는 것</b> {s.out}
              </p>
            </div>
            <p className="text-[15px] font-semibold tabular-nums md:text-right" style={{ color: C.body }}>
              {s.weeks ? `${s.weeks[0]}~${s.weeks[1]}주` : "공사 기간"}
            </p>
          </li>
        ))}
      </ol>
      <p className="mt-4 text-[16px] font-bold">
        상담부터 착공 전까지 약 {TOTAL_MIN}~{TOTAL_MAX}주
      </p>
    </div>
  );
}

/* ---------- 3. 상담 안내 ---------- */

const PREP = [
  ["대지 주소", "지번 주소면 충분해요. 토지이음에서 용도지역을 같이 보면 좋아요."],
  ["짓고 싶은 건물", "단독주택, 상가주택, 근린생활시설 같은 용도와 가족 수, 필요한 방"],
  ["예산과 일정", "공사비 범위와 입주나 개업을 바라는 때"],
  ["참고 자료", "마음에 드는 집 사진, 지금 사는 집에서 불편한 점"],
] as const;

function ContactInfo() {
  return (
    <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] md:gap-12">
      <div className="grid content-start gap-4">
        <a
          href={`tel:${TEL}`}
          data-gtm-cta="architect-office_contact_tel"
          className={`flex items-center gap-3 rounded-[6px] border p-5 ${focusRing}`}
          style={{ borderColor: C.line, background: C.card, outlineColor: C.accent }}
        >
          <Phone size={22} aria-hidden style={{ color: C.accent }} />
          <span>
            <span className="block text-[14px]" style={{ color: C.muted }}>
              전화 상담
            </span>
            <span className="block text-[22px] font-bold tabular-nums">{TEL}</span>
          </span>
        </a>
        <p className="flex items-center gap-3 rounded-[6px] border p-5" style={{ borderColor: C.line, background: C.card }}>
          <MessageCircle size={22} aria-hidden style={{ color: C.accent }} />
          <span>
            <span className="block text-[14px]" style={{ color: C.muted }}>
              사진, 도면 보내기
            </span>
            <span className="block text-[18px] font-bold">{KAKAO}</span>
          </span>
        </p>
        <p className="text-[15px] leading-[1.7]" style={{ color: C.body }}>
          첫 상담은 사무소에서 한 시간 정도 합니다. 필요하면 대지에 같이 나가 봅니다.
        </p>
      </div>
      <div>
        <h3 className="text-[18px] font-bold">상담 전에 준비하면 좋은 것</h3>
        <dl className="mt-3 border-t" style={{ borderColor: C.ink }}>
          {PREP.map(([k, v]) => (
            <div key={k} className="grid gap-1 border-b py-3 md:grid-cols-[130px_minmax(0,1fr)] md:gap-4" style={{ borderColor: C.line }}>
              <dt className="text-[16px] font-bold">{k}</dt>
              <dd className="text-[15px] leading-[1.6]" style={{ color: C.body }}>
                {v}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

export function ArchitectDemo() {
  const today = useDemoToday();
  const reduce = useReducedMotionSafe();
  const [open, setOpen] = useState<{ w: Work; list: Work[] } | null>(null);

  useEffect(() => {
    const f = () => window.scrollTo({ top: 0 });
    window.addEventListener("demo:go-home", f);
    return () => window.removeEventListener("demo:go-home", f);
  }, []);

  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  const hours = useMemo(
    () => [
      ["평일", "09:00~18:00"],
      ["토요일", "예약 상담만"],
      ["일요일, 공휴일", "휴무"],
    ],
    [],
  );
  const dow = today.getDay();
  const todayRow = dow === 0 ? 2 : dow === 6 ? 1 : 0;

  return (
    <div className="min-h-screen overflow-x-clip" style={{ background: C.paper, color: C.ink }}>
      <Poster reduce={reduce} go={go} onOpen={(w, list) => setOpen({ w, list })} />
      <WorkPanel
        open={open}
        reduce={reduce}
        onClose={() => setOpen(null)}
        onMove={(d) => setOpen((o) => (o ? { ...o, w: o.list[(o.list.findIndex((x) => x.id === o.w.id) + d + o.list.length) % o.list.length] } : o))}
        onContact={() => {
          setOpen(null);
          go("ar-contact");
        }}
      />

      <div className="mx-auto max-w-[1200px] px-4 md:px-6">
        <section id="ar-process" aria-labelledby="ar-process-title" className="scroll-mt-4 border-t py-12 md:py-16" style={{ borderColor: C.line }}>
          <h2 id="ar-process-title" className="mb-8 text-[28px] font-bold md:text-[36px]">
            설계 과정과 기간
          </h2>
          <Process />
        </section>

        <section id="ar-contact" aria-labelledby="ar-contact-title" className="scroll-mt-4 border-t py-12 md:py-16" style={{ borderColor: C.line }}>
          <h2 id="ar-contact-title" className="mb-8 text-[28px] font-bold md:text-[36px]">
            상담 안내
          </h2>
          <ContactInfo />
        </section>

        <section id="ar-visit" aria-labelledby="ar-visit-title" className="scroll-mt-4 border-t py-12 md:py-16" style={{ borderColor: C.line }}>
          <h2 id="ar-visit-title" className="mb-8 text-[28px] font-bold md:text-[36px]">
            오시는 길
          </h2>
          <div className="grid gap-8 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
            <SiteMap />
            <div className="grid content-start gap-5 text-[16px] leading-[1.7]">
              <p className="flex gap-3">
                <MapPin size={20} aria-hidden className="mt-1 flex-none" style={{ color: C.accent }} />
                <span>
                  {ADDRESS}
                  <span className="block text-[15px]" style={{ color: C.muted }}>
                    ㅇㅇ역 2번 출구에서 걸어서 6분, 건물 뒤 주차 2대
                  </span>
                </span>
              </p>
              <p className="flex gap-3">
                <Phone size={20} aria-hidden className="mt-1 flex-none" style={{ color: C.accent }} />
                <span>
                  {TEL}
                  <span className="block text-[15px]" style={{ color: C.muted }}>
                    {KAKAO}
                  </span>
                </span>
              </p>
              <div className="flex gap-3">
                <Clock size={20} aria-hidden className="mt-1 flex-none" style={{ color: C.accent }} />
                <table className="text-[15px]">
                  <caption className="sr-only">상담 시간</caption>
                  <tbody>
                    {hours.map(([d, h], i) => (
                      <tr key={d} className={i === todayRow ? "font-bold" : ""}>
                        <th scope="row" className="pr-5 text-left font-[inherit]">
                          {d}
                          {i === todayRow && <span className="ml-1.5 text-[13px]" style={{ color: C.accent }}>오늘</span>}
                        </th>
                        <td className="tabular-nums">
                          {h}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      </div>

      <footer className="mt-4" style={{ background: C.soft, color: C.muted }}>
        <div className="mx-auto max-w-[1200px] px-4 py-10 md:px-6">
          <p className="inline-flex items-center gap-2 text-[16px] font-bold" style={{ color: C.ink }}>
            <SampleLogo size={18} />
          </p>
          <p className="mt-2 text-[14px]">{ADDRESS}</p>
          <DemoMakerInfo className="mt-6" />
        </div>
      </footer>
    </div>
  );
}

/** 오시는 길 약도. 도면처럼 선으로만 그린다 */
function SiteMap() {
  return (
    <svg viewBox="0 0 520 300" className="block h-auto w-full rounded-[4px] border" style={{ borderColor: C.line, background: C.card }} role="img" aria-label="ㅇㅇ역 2번 출구에서 사무소까지 가는 약도">
      <defs>
        <pattern id="ar-m-grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0H0V20" fill="none" stroke="rgba(17,17,17,0.07)" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="520" height="300" fill="url(#ar-m-grid)" />
      {/* 큰길과 골목 */}
      <path d="M0 196H520" stroke="#dedede" strokeWidth="26" />
      <path d="M0 196H520" stroke="#fff" strokeWidth="1.5" strokeDasharray="10 10" />
      <path d="M318 0V300" stroke="#e8e8e8" strokeWidth="14" />
      <path d="M318 196 V60 H470" fill="none" stroke="#e8e8e8" strokeWidth="10" />
      {/* 블록 */}
      {[
        [30, 40, 120, 120],
        [170, 40, 120, 120],
        [30, 220, 260, 60],
        [340, 220, 150, 60],
        [340, 80, 60, 90],
      ].map(([x, y, w, h], i) => (
        <rect key={i} x={x} y={y} width={w} height={h} fill="none" stroke="rgba(17,17,17,0.28)" strokeWidth="1.2" />
      ))}
      {/* 역 출구 */}
      <rect x="120" y="178" width="34" height="18" fill={C.ink} />
      <text x="137" y="191" textAnchor="middle" fontSize="11" fontWeight="700" fill="#fff">
        2
      </text>
      <text x="137" y="170" textAnchor="middle" fontSize="13" fontWeight="700" fill={C.ink}>
        ㅇㅇ역
      </text>
      {/* 걷는 길 */}
      <path d="M154 187 H318 V60 H420" fill="none" stroke={C.accent} strokeWidth="3" strokeDasharray="2 7" strokeLinecap="round" />
      {/* 사무소 */}
      <g transform="translate(420 30)">
        <rect x="0" y="0" width="70" height="44" fill={C.accent} />
        <text x="35" y="27" textAnchor="middle" fontSize="13" fontWeight="700" fill="#fff">
          사무소
        </text>
      </g>
      <text x="324" y="290" fontSize="12" fill={C.muted}>
        ㅇㅇ로
      </text>
    </svg>
  );
}

function SampleLogo({ light, size = 20 }: { light?: boolean; size?: number }) {
  return (
    <span className="inline-flex items-center gap-2" style={{ color: light ? "#fff" : "#111" }}>
      <span className="flex items-baseline gap-1 whitespace-nowrap">
        <span className="font-bold tracking-[-0.03em]" style={{ fontSize: size }}>
          건축사사무소
        </span>
      </span>
    </span>
  );
}
