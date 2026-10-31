"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Check, ChevronLeft, ChevronRight, Clock, MapPin, MessageCircle, Phone, RotateCcw, X } from "lucide-react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { daysAgo, fmtKo, useDemoToday } from "@/hooks/useDemoToday";
import { maskName, maskPhone } from "@/components/demos/LeadReceivedPanel";
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
   핵심 모션: 들어올 때 큰 사진이 1.6초 동안 천천히 다가오고(scale 1.06 -> 1), 필터를 바꾸면 칸이 짧게 자리를 옮긴다.
   규모 검토 계산기는 같은 흰 매스 모형 그림으로 용도지역을 바꾸면 층이 쌓이거나 빠진다. 동작 줄이기면 모두 멈춘 완성 상태다.

   상호작용(모두 브라우저 안에서만 돈다. 실제로 보내지 않는다)
   1. 규모 검토: 대지 면적과 용도지역을 넣으면 건폐율, 용적률(국토계획법 시행령 상한)로 최대 건축면적, 최대 연면적, 개략 층수.
   2. 작업 목록(첫 화면): 전체, 단독주택, 근린생활시설 필터, 사진을 누르면 상세 패널.
   3. 설계 과정과 기간: 단계를 누르면 하는 일, 받는 도면, 주 단위 기간 막대가 바뀐다.
   4. 상담신청: 이름, 휴대폰, 건물 용도, 대지 위치, 규모 검토 결과 첨부. 완료 화면에 접수 번호, 담당 창구, 회신 예정일. */

const IMG = "/images/demo-architect-office";

const ADDRESS = "서울 ㅇㅇ구 ㅇㅇ로 00, 3층";
const TEL = "02-000-0000";
const KAKAO = "카카오톡 채널 곰파트너";

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
/** 첫 화면 사진이 다가오는 시간 */
const HERO_IN = 1.6;
/** 칩, 패널 전환 */
const DUR = 0.35;

const focusRing = "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2";
const p2 = (n: number) => String(n).padStart(2, "0");
const n1 = (n: number) => n.toLocaleString("ko-KR", { maximumFractionDigits: 1, minimumFractionDigits: 1 });
const PYEONG = 3.3058;

/** 제곱미터 표기. 키보드 글자 m 과 위첨자 2 로 쓴다 */
function M2() {
  return (
    <span>
      m<sup className="text-[0.62em]">2</sup>
    </span>
  );
}

/* ---------- 아이소메트릭 그리기(규모 검토, 작업 카드) ---------- */

type Pt = [number, number];
/** 바닥 좌표(x, y), 높이 z, 가로 w, 세로 d, 높이 h. lv 는 층 번호 */
type Box = { x: number; y: number; w: number; d: number; z: number; h: number; lv: number };

const COS30 = Math.cos(Math.PI / 6);

function makeIso(ox: number, oy: number, k: number) {
  return (x: number, y: number, z: number): Pt => [ox + (x - y) * COS30 * k, oy + (x + y) * 0.5 * k - z * k];
}
type Iso = ReturnType<typeof makeIso>;

const polyD = (pts: Pt[]) => `M${pts.map(([a, b]) => `${a.toFixed(1)} ${b.toFixed(1)}`).join("L")}Z`;

/** 상자 하나의 보이는 세 면: 윗면, +x 면(오른쪽 앞), +y 면(왼쪽 앞) */
function boxFaces(b: Box, P: Iso) {
  const x1 = b.x + b.w;
  const y1 = b.y + b.d;
  const z1 = b.z + b.h;
  return {
    top: polyD([P(b.x, b.y, z1), P(x1, b.y, z1), P(x1, y1, z1), P(b.x, y1, z1)]),
    right: polyD([P(x1, b.y, b.z), P(x1, y1, b.z), P(x1, y1, z1), P(x1, b.y, z1)]),
    left: polyD([P(b.x, y1, b.z), P(x1, y1, b.z), P(x1, y1, z1), P(b.x, y1, z1)]),
  };
}

/** 2차원 점들의 볼록 껍질(monotone chain). 같은 방향으로 감기므로 여러 개를 한 path 에 넣어도 겹친 곳이 진해지지 않는다 */
function hull(points: Pt[]): Pt[] {
  const pts = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  if (pts.length < 3) return pts;
  const cross = (o: Pt, a: Pt, b: Pt) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower: Pt[] = [];
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
    lower.push(p);
  }
  const upper: Pt[] = [];
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
    upper.push(p);
  }
  return lower.slice(0, -1).concat(upper.slice(0, -1));
}

/** 해 방향 theta(수평 각), 고도 phi 일 때 상자들이 바닥(z=0)에 드리우는 그림자 path */
function shadowD(boxes: Box[], theta: number, phi: number, P: Iso) {
  const cot = 1 / Math.tan(phi);
  const dx = -Math.cos(theta) * cot;
  const dy = -Math.sin(theta) * cot;
  return boxes
    .map((b) => {
      const pts: Pt[] = [];
      for (const z of [b.z, b.z + b.h]) {
        for (const [x, y] of [
          [b.x, b.y],
          [b.x + b.w, b.y],
          [b.x + b.w, b.y + b.d],
          [b.x, b.y + b.d],
        ]) {
          pts.push([x + dx * z, y + dy * z]);
        }
      }
      return polyD(hull(pts).map(([x, y]) => P(x, y, 0)));
    })
    .join("");
}

/** 벽 밝기(무채색). c 는 면 방향과 해 방향의 수평 내적(-1~1) */
const wallShade = (c: number) => `hsl(0 0% ${Math.round(62 + 34 * Math.max(0, c))}%)`;

/* ---------- 1. 규모 검토 ---------- */

type Zone = { id: string; name: string; bcr: number; far: number; maxFloors?: number };
/** 국토의 계획 및 이용에 관한 법률 시행령 상한. 지자체 조례가 이보다 낮게 정하는 곳이 많다 */
const ZONES: Zone[] = [
  { id: "r1x", name: "제1종 전용주거", bcr: 50, far: 100 },
  { id: "r1", name: "제1종 일반주거", bcr: 60, far: 200, maxFloors: 4 },
  { id: "r2", name: "제2종 일반주거", bcr: 60, far: 250 },
  { id: "r3", name: "제3종 일반주거", bcr: 50, far: 300 },
  { id: "rq", name: "준주거", bcr: 70, far: 500 },
  { id: "c", name: "일반상업", bcr: 80, far: 1300 },
  { id: "gn", name: "자연녹지", bcr: 20, far: 100, maxFloors: 4 },
  { id: "pm", name: "계획관리", bcr: 40, far: 100, maxFloors: 4 },
];

export type CalcResult = { area: number; zone: Zone; footprint: number; gross: number; floors: number; partial: number };

/** 연면적을 건축면적으로 나눈 층수. 맨 위층이 한 층의 1/4 보다 작으면 뺀다 */
function calc(area: number, zone: Zone): CalcResult {
  const footprint = (area * zone.bcr) / 100;
  const gross = (area * zone.far) / 100;
  const ratio = zone.far / zone.bcr;
  let floors = Math.floor(ratio);
  let partial = ratio - floors;
  if (partial >= 0.25) floors += 1;
  else partial = 0;
  if (zone.maxFloors && floors > zone.maxFloors) {
    floors = zone.maxFloors;
    partial = 0;
  }
  return { area, zone, footprint, gross, floors: Math.max(1, floors), partial };
}

function ScaleCheck({ reduce, result, setResult }: { reduce: boolean; result: CalcResult; setResult: (r: CalcResult) => void }) {
  const [raw, setRaw] = useState(String(result.area));
  const [unit, setUnit] = useState<"m2" | "py">("m2");
  const num = Number(raw.replace(/,/g, ""));
  const toArea = (v: number, u: "m2" | "py") => (u === "py" ? v * PYEONG : v);
  const valid = Number.isFinite(num) && toArea(num, unit) >= 30 && toArea(num, unit) <= 20000;

  const update = (v: string, z: Zone, u: "m2" | "py") => {
    const n = Number(v.replace(/,/g, ""));
    if (Number.isFinite(n) && n > 0) setResult(calc(toArea(n, u), z));
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-12">
      <div>
        <div className="flex flex-wrap items-end gap-3">
          <label className="block min-w-0 flex-1">
            <span className="mb-2 block text-[15px] font-semibold">대지 면적</span>
            <input
              inputMode="decimal"
              value={raw}
              onChange={(e) => {
                setRaw(e.target.value);
                update(e.target.value, result.zone, unit);
              }}
              aria-invalid={!valid}
              aria-describedby="ar-area-help"
              className={`h-14 w-full rounded-[4px] border bg-white px-4 text-[22px] font-semibold tabular-nums ${focusRing}`}
              style={{ borderColor: valid ? C.field : C.error, outlineColor: C.accent }}
            />
          </label>
          <div role="radiogroup" aria-label="면적 단위" className="flex h-14 overflow-hidden rounded-[4px] border" style={{ borderColor: C.field }}>
            {(["m2", "py"] as const).map((u) => (
              <button
                key={u}
                type="button"
                role="radio"
                aria-checked={unit === u}
                onClick={() => {
                  if (u === unit) return;
                  const n = Number(raw.replace(/,/g, ""));
                  const next = Number.isFinite(n) ? (u === "py" ? n / PYEONG : n * PYEONG) : n;
                  const s = Number.isFinite(next) ? String(Math.round(next * 10) / 10) : raw;
                  setUnit(u);
                  setRaw(s);
                  update(s, result.zone, u);
                }}
                className={`w-16 text-[16px] font-semibold ${focusRing}`}
                style={{ background: unit === u ? C.ink : "transparent", color: unit === u ? C.paper : C.ink, outlineColor: C.accent }}
              >
                {u === "m2" ? <M2 /> : "평"}
              </button>
            ))}
          </div>
        </div>
        <p id="ar-area-help" className="mt-2 text-[14px]" style={{ color: valid ? C.muted : C.error }}>
          {valid ? (
            <>
              {unit === "m2" ? `${n1(num / PYEONG)}평` : <>{n1(num * PYEONG)}<M2 /></>}
            </>
          ) : (
            unit === "m2" ? "30~20,000 사이 숫자로 넣어 주세요" : "10~6,000 사이 숫자로 넣어 주세요"
          )}
        </p>

        <fieldset className="mt-7">
          <legend className="mb-3 text-[15px] font-semibold">용도지역</legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {ZONES.map((z) => {
              const on = z.id === result.zone.id;
              return (
                <button
                  key={z.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => update(raw, z, unit)}
                  className={`flex min-h-[56px] flex-col items-start justify-center rounded-[4px] border px-3 py-2 text-left ${focusRing}`}
                  style={{ borderColor: on ? C.accent : C.line, background: on ? "#fff" : "transparent", outlineColor: C.accent }}
                >
                  <span className="text-[14px] font-bold leading-tight">{z.name}</span>
                  <span className="mt-0.5 text-[12px] tabular-nums" style={{ color: C.muted }}>
                    {z.bcr}% / {z.far}%
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>
        <p className="mt-4 text-[14px] leading-[1.7]" style={{ color: C.muted }}>
          용도지역은 토지이음(eum.go.kr)에 주소를 넣으면 나와요. 숫자는 법 상한이고 구마다 조례로 더 낮게 정하기도 해요.
        </p>
      </div>

      <div className="rounded-[6px] border p-5 md:p-7" style={{ borderColor: C.line, background: C.card }}>
        <MassPreview result={result} reduce={reduce} />
        <dl className="mt-2 grid grid-cols-2 gap-x-6 gap-y-4 border-t pt-5" style={{ borderColor: C.line }}>
          <Stat label={`건축면적 (건폐율 ${result.zone.bcr}%)`} value={<>{n1(result.footprint)}<M2 /></>} sub={`${n1(result.footprint / PYEONG)}평`} />
          <Stat label={`연면적 (용적률 ${result.zone.far}%)`} value={<>{n1(result.gross)}<M2 /></>} sub={`${n1(result.gross / PYEONG)}평`} />
          <div className="col-span-2">
            <dt className="text-[14px]" style={{ color: C.muted }}>
              개략 층수
            </dt>
            <dd className="mt-1 flex flex-wrap items-baseline gap-x-3">
              <span className="text-[40px] font-bold leading-none tabular-nums" style={{ color: C.accent }}>
                지상 약 {result.floors}층
              </span>
              {result.zone.maxFloors && <span className="text-[14px] font-bold">{result.zone.maxFloors}층 이하 지역</span>}
            </dd>
            <p className="mt-2 text-[14px] leading-[1.6]" style={{ color: C.muted }}>
              정북 일조 사선, 주차 대수, 도로 폭에 따라 줄어들 수 있어요.
            </p>
          </div>
        </dl>
      </div>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: React.ReactNode; sub: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[14px]" style={{ color: C.muted }}>
        {label}
      </dt>
      <dd className="mt-1">
        <span className="block text-[24px] font-bold tabular-nums md:text-[28px]">{value}</span>
        <span className="block text-[14px] tabular-nums" style={{ color: C.muted }}>
          {sub}
        </span>
      </dd>
    </div>
  );
}

/** 계산 결과를 대지 판과 층 상자로 그린다. 용도지역을 바꾸면 층이 쌓이거나 빠지고 바닥 면적이 바뀐다 */
const PREV_K = 1.75;
const P_PREV = makeIso(200, 268, PREV_K);
const PREV_HALF = 50;
const PREV_BOARD = {
  top: polyD([P_PREV(-PREV_HALF, -PREV_HALF, 0), P_PREV(PREV_HALF, -PREV_HALF, 0), P_PREV(PREV_HALF, PREV_HALF, 0), P_PREV(-PREV_HALF, PREV_HALF, 0)]),
  right: polyD([P_PREV(PREV_HALF, -PREV_HALF, 0), P_PREV(PREV_HALF, PREV_HALF, 0), P_PREV(PREV_HALF, PREV_HALF, -6), P_PREV(PREV_HALF, -PREV_HALF, -6)]),
  left: polyD([P_PREV(-PREV_HALF, PREV_HALF, 0), P_PREV(PREV_HALF, PREV_HALF, 0), P_PREV(PREV_HALF, PREV_HALF, -6), P_PREV(-PREV_HALF, PREV_HALF, -6)]),
};
const PREV_THETA = 2.2;
const PREV_LEFT = wallShade(Math.sin(PREV_THETA));
const PREV_RIGHT = wallShade(Math.cos(PREV_THETA));

function MassPreview({ result, reduce }: { result: CalcResult; reduce: boolean }) {
  const side = 2 * PREV_HALF * Math.sqrt(result.zone.bcr / 100);
  const n = result.floors;
  const fh = Math.min(15, 104 / n);
  const boxes: Box[] = Array.from({ length: n }, (_, i) => {
    const top = i === n - 1 && result.partial > 0;
    const s = top ? side * Math.sqrt(result.partial) : side;
    // 대지 가운데에 놓고, 덜 찬 맨 위층은 뒤쪽 모서리에 붙여 물러난 모양으로
    return { x: -side / 2, y: -side / 2, w: s, d: s, z: i * fh, h: fh, lv: i };
  });
  const shadow = shadowD(boxes, PREV_THETA, (40 * Math.PI) / 180, P_PREV);
  const topBox = boxes[n - 1];
  const label = P_PREV(topBox.x + topBox.w, topBox.y, topBox.z + topBox.h);
  const t = { duration: reduce ? 0 : DUR + 0.1, ease: EASE };

  return (
    <svg viewBox="0 0 400 330" className="block h-auto w-full" role="img" aria-label={`대지 위에 ${n}층 매스를 쌓은 모형 그림`}>
      <defs>
        <clipPath id="ar-c-clip">
          <path d={PREV_BOARD.top} />
        </clipPath>
      </defs>
      <path d={PREV_BOARD.left} fill="#d4d4d4" />
      <path d={PREV_BOARD.right} fill="#bfbfbf" />
      <path d={PREV_BOARD.top} fill="#ececec" />
      <g clipPath="url(#ar-c-clip)">
        <motion.path initial={{ d: shadow }} animate={{ d: shadow }} transition={t} fill="rgba(17,17,17,0.22)" />
      </g>
      <AnimatePresence initial={false}>
        {boxes.map((b) => {
          const f = boxFaces(b, P_PREV);
          return (
            <motion.g
              key={b.lv}
              initial={reduce ? false : { y: -36, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { y: -36, opacity: 0 }}
              transition={{ ...t, delay: reduce ? 0 : b.lv * 0.035 }}
            >
              <motion.path initial={{ d: f.left }} animate={{ d: f.left }} transition={t} fill={PREV_LEFT} stroke="rgba(17,17,17,0.2)" strokeWidth="0.8" />
              <motion.path initial={{ d: f.right }} animate={{ d: f.right }} transition={t} fill={PREV_RIGHT} stroke="rgba(17,17,17,0.2)" strokeWidth="0.8" />
              <motion.path initial={{ d: f.top }} animate={{ d: f.top }} transition={t} fill="#fafafa" stroke="rgba(17,17,17,0.16)" strokeWidth="0.8" />
            </motion.g>
          );
        })}
      </AnimatePresence>
      <motion.g initial={false} animate={{ x: label[0], y: label[1] }} transition={t}>
        <line x1="4" y1="0" x2="40" y2="-18" stroke={C.accent} strokeWidth="1.5" />
        <text x="44" y="-14" fontSize="15" fontWeight="700" fill={C.accent}>
          {n}층
        </text>
      </motion.g>
    </svg>
  );
}

/* ---------- 2. 작업 목록 ---------- */

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
  /** [x, y, w, d, 시작 층, 층 수] */
  mass: [number, number, number, number, number, number][];
};

const WORKS: Work[] = [
  { id: "w1", name: "ㅇㅇ동 단독주택", kind: "단독주택", site: 198, gross: 172, scale: "지상 2층", structure: "철근콘크리트", state: "준공", note: "마당을 가운데 둔 ㄱ자 집", mass: [[-38, -20, 76, 34, 0, 1], [-38, -20, 34, 58, 0, 1], [-38, -20, 76, 34, 1, 1]] },
  { id: "w2", name: "ㅂㅈ리 주말주택", kind: "단독주택", site: 330, gross: 99, scale: "지상 1층, 다락", structure: "경량목구조", state: "준공", note: "주말에 쓰는 작은 집", mass: [[-40, -14, 80, 30, 0, 1], [-40, -14, 34, 30, 1, 0.6]] },
  { id: "w3", name: "ㅅㄱ동 상가주택", kind: "근린생활시설", site: 165, gross: 380, scale: "지상 4층", structure: "철근콘크리트", state: "시공 중", note: "1층 상가, 2~4층 주택", mass: [[-26, -26, 52, 52, 0, 1], [-26, -26, 52, 52, 1, 1], [-26, -26, 52, 40, 2, 1], [-26, -26, 36, 40, 3, 1]] },
  { id: "w4", name: "ㅁㅇ동 근린생활시설", kind: "근린생활시설", site: 230, gross: 520, scale: "지상 5층", structure: "철근콘크리트", state: "인허가 중", note: "모퉁이 땅, 저층 상가", mass: [[-24, -28, 48, 56, 0, 1], [-24, -28, 48, 56, 1, 1], [-24, -28, 48, 56, 2, 1], [-24, -28, 48, 44, 3, 1], [-24, -28, 34, 44, 4, 1]] },
  { id: "w5", name: "ㅎㄴ리 단독주택", kind: "단독주택", site: 450, gross: 145, scale: "지상 2층", structure: "경량목구조", state: "설계 중", note: "어긋나게 놓은 두 동", mass: [[-42, -26, 44, 30, 0, 1], [-4, -6, 46, 30, 0, 1], [-4, -6, 46, 30, 1, 1]] },
  { id: "w6", name: "ㄷㅅ동 의원 건물", kind: "근린생활시설", site: 280, gross: 690, scale: "지하 1층, 지상 5층", structure: "철근콘크리트", state: "준공", note: "엘리베이터와 진료실 층", mass: [[-30, -28, 60, 56, 0, 1], [-30, -28, 60, 56, 1, 1], [-30, -28, 60, 56, 2, 1], [-30, -28, 60, 56, 3, 1], [-30, -28, 44, 56, 4, 1]] },
  { id: "w7", name: "ㄱㅍ동 두 가구 주택", kind: "단독주택", site: 210, gross: 230, scale: "지상 3층", structure: "철근콘크리트", state: "준공", note: "부모님과 나눠 사는 집", mass: [[-30, -24, 60, 48, 0, 1], [-30, -24, 60, 48, 1, 1], [-30, -24, 38, 48, 2, 1]] },
  { id: "w8", name: "ㅇㄹ동 카페 건물", kind: "근린생활시설", site: 140, gross: 160, scale: "지상 2층", structure: "철골조", state: "준공", note: "1층 전면 통창", mass: [[-30, -22, 60, 44, 0, 1], [-30, -22, 44, 44, 1, 1]] },
];

const FILTERS: ("전체" | Kind)[] = ["전체", "단독주택", "근린생활시설"];

/* ---------- 첫 화면: 작업 사진 격자 ---------- */

/** 상단 메뉴. 건축사사무소 사이트 표준(작업, 설계 과정, 문의, 오시는 길)을 기존 구간에 잇는다 */
const NAV = [
  ["ar-works", "작업"],
  ["ar-calc", "규모 검토"],
  ["ar-process", "설계 과정"],
  ["ar-contact", "상담신청"],
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
                      <motion.span
                        className="absolute inset-0 block"
                        initial={big && !reduce ? { scale: 1.06 } : false}
                        animate={{ scale: 1 }}
                        transition={{ duration: reduce ? 0 : HERO_IN, ease: EASE }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element -- 정적 export 라 next/image 최적화를 쓰지 않는다 */}
                        <img
                          src={`${IMG}/work-${w.id}.jpg`}
                          alt={`${w.name} ${w.state === "준공" ? "준공 사진" : "설계 투시도"}`}
                          fetchPriority={big ? "high" : undefined}
                          className={`absolute inset-0 h-full w-full object-cover ${reduce ? "" : "transition-transform duration-500 ease-out group-hover:scale-[1.03]"}`}
                        />
                      </motion.span>
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
            onClick={() => go("ar-calc")}
            data-gtm-cta="architect-office_poster_cta"
            className={`inline-flex h-11 flex-none items-center self-start rounded-[4px] px-4 text-[15px] font-semibold text-white md:self-auto ${focusRing}`}
            style={{ background: C.accent, outlineColor: C.ink }}
          >
            규모 검토
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
  { name: "계획설계", weeks: [4, 6], out: "배치도, 평면 안 2~3개, 흰 매스 모형", desc: "방 배치와 동선을 두세 가지 안으로 그려요. 모형에 해를 비춰 볕 드는 시간도 같이 봐요." },
  { name: "기본설계", weeks: [3, 4], out: "평면도, 입면도, 단면도, 마감재 방향", desc: "고른 안을 다듬어 창 크기, 층고, 외장재를 정해요. 대략 공사비도 이때 나와요." },
  { name: "인허가", weeks: [4, 8], out: "건축허가 도서, 관련 부서 협의", desc: "구청 건축과에 건축허가를 접수하고 보완 요청에 답해요. 기간은 지역과 규모에 따라 달라요." },
  { name: "실시설계", weeks: [6, 8], out: "시공 도면, 구조, 기계, 전기 도면", desc: "시공사가 견적을 내고 그대로 지을 수 있는 도면을 만들어요." },
  { name: "공사 중 현장 협의", weeks: null, out: "현장 회의, 도면 질의 답변, 변경 도면", desc: "착공 뒤에도 현장에 나가 설계한 대로 지어지는지 보고, 바뀌는 곳은 도면을 고쳐 드려요." },
];
const TOTAL_MIN = STEPS.reduce((s, x) => s + (x.weeks ? x.weeks[0] : 0), 0);
const TOTAL_MAX = STEPS.reduce((s, x) => s + (x.weeks ? x.weeks[1] : 0), 0);
/** 기간 막대 시작점: 앞 단계가 짧게 끝났을 때 기준 */
const BARS = STEPS.map((s, i) => ({ ...s, start: STEPS.slice(0, i).reduce((a, x) => a + (x.weeks ? x.weeks[0] : 0), 0) }));

function Process({ reduce }: { reduce: boolean }) {
  const [sel, setSel] = useState(1);
  const step = STEPS[sel];

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-12">
      <ol className="grid gap-2" aria-label="설계 단계">
        {STEPS.map((s, i) => {
          const on = i === sel;
          return (
            <li key={s.name}>
              <button
                type="button"
                aria-pressed={on}
                onClick={() => setSel(i)}
                className={`flex w-full items-center justify-between gap-3 rounded-[4px] border px-4 py-3 text-left ${focusRing}`}
                style={{ borderColor: on ? C.accent : C.line, background: on ? "#fff" : "transparent", outlineColor: C.accent }}
              >
                <span className="flex items-center gap-3">
                  <span className="inline-flex h-7 w-7 flex-none items-center justify-center rounded-full text-[13px] font-bold tabular-nums" style={{ background: on ? C.accent : C.line, color: on ? "#fff" : C.ink }}>
                    {i + 1}
                  </span>
                  <span className="text-[16px] font-bold">{s.name}</span>
                </span>
                <span className="flex-none text-[14px] tabular-nums" style={{ color: C.muted }}>
                  {s.weeks ? `${s.weeks[0]}~${s.weeks[1]}주` : "공사 기간"}
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      <div className="min-w-0">
        <div className="overflow-hidden rounded-[6px] border p-5 md:p-7" style={{ borderColor: C.line, background: C.card }}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={sel}
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduce ? undefined : { opacity: 0 }}
              transition={{ duration: reduce ? 0 : DUR, ease: EASE }}
            >
              <h3 className="text-[24px] font-bold">
                {step.name}
              </h3>
              <p className="mt-3 text-[16px] leading-[1.7]">{step.desc}</p>
              <p className="mt-4 text-[15px] leading-[1.7]">
                <b>받으시는 것</b> <span style={{ color: C.muted }}>{step.out}</span>
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 주 단위 기간 막대. 진한 칸은 짧게 걸릴 때, 빗금 칸은 길어질 때까지 */}
        <div className="mt-6" aria-hidden>
          <div className="relative grid gap-1.5">
            {BARS
              .filter((b) => b.weeks)
              .map((b) => {
                const i = STEPS.findIndex((s) => s.name === b.name);
                const on = i === sel;
                const w = b.weeks as [number, number];
                return (
                  <div key={b.name} className="relative h-6">
                    <motion.div
                      className="absolute inset-y-0 rounded-[2px]"
                      initial={false}
                      animate={{ backgroundColor: on ? C.accent : "#bdbdbd" }}
                      transition={{ duration: reduce ? 0 : 0.2 }}
                      style={{ left: `${(b.start / TOTAL_MAX) * 100}%`, width: `${(w[0] / TOTAL_MAX) * 100}%` }}
                    />
                    <div
                      className="absolute inset-y-0 rounded-[2px]"
                      style={{
                        left: `${((b.start + w[0]) / TOTAL_MAX) * 100}%`,
                        width: `${((w[1] - w[0]) / TOTAL_MAX) * 100}%`,
                        backgroundImage: `repeating-linear-gradient(135deg, ${on ? C.accent : "#bdbdbd"} 0 2px, transparent 2px 6px)`,
                      }}
                    />
                  </div>
                );
              })}
          </div>
          <div className="mt-2 flex justify-between text-[13px] tabular-nums" style={{ color: C.muted }}>
            <span>0주</span>
            <span>{TOTAL_MAX}주</span>
          </div>
        </div>
        <p className="mt-3 text-[16px] font-bold">
          상담부터 착공 전까지 약 {TOTAL_MIN}~{TOTAL_MAX}주
        </p>
      </div>
    </div>
  );
}

/* ---------- 4. 상담신청 ---------- */

const USES = ["단독주택", "상가주택", "근린생활시설", "기타"] as const;
const WAYS = ["사무소 방문", "전화 상담", "현장 방문"] as const;

type Sent = { no: string; name: string; phone: string; use: string; way: string; reply: Date; withCalc: boolean };

function nextWeekday(d: Date) {
  let n = daysAgo(d, -1);
  while (n.getDay() === 0 || n.getDay() === 6) n = daysAgo(n, -1);
  return n;
}

function Contact({ today, result, reduce }: { today: Date; result: CalcResult; reduce: boolean }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [use, setUse] = useState<(typeof USES)[number]>("단독주택");
  const [way, setWay] = useState<(typeof WAYS)[number]>("사무소 방문");
  const [addr, setAddr] = useState("");
  const [memo, setMemo] = useState("");
  const [withCalc, setWithCalc] = useState(true);
  const [agree, setAgree] = useState(false);
  const [tried, setTried] = useState(false);
  const [sent, setSent] = useState<Sent | null>(null);

  const digits = phone.replace(/\D/g, "");
  const errs = {
    name: name.trim().length < 2 ? "이름을 두 글자 이상 적어 주세요" : "",
    phone: !/^01[016789]\d{7,8}$/.test(digits) ? "휴대폰 번호를 확인해 주세요" : "",
    agree: !agree ? "개인정보 수집에 동의해 주세요" : "",
  };
  const ok = !errs.name && !errs.phone && !errs.agree;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (!ok) return;
    const seq = 100 + ((digits.charCodeAt(digits.length - 1) * 37 + name.length * 11) % 900);
    setSent({
      no: `AR-${String(today.getFullYear()).slice(2)}${p2(today.getMonth() + 1)}${p2(today.getDate())}-${seq}`,
      name,
      phone,
      use,
      way,
      reply: nextWeekday(today),
      withCalc,
    });
  };

  const field = `h-12 w-full rounded-[4px] border bg-white px-3 text-[16px] ${focusRing}`;

  if (sent) {
    return (
      <motion.div
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: reduce ? 0 : 0.5, ease: EASE }}
        className="rounded-[6px] border p-6 md:p-8"
        style={{ borderColor: C.line, background: C.card }}
        role="status"
      >
        <p className="inline-flex items-center gap-2 text-[15px] font-bold" style={{ color: C.accent }}>
          <Check size={18} aria-hidden /> 상담신청 접수
        </p>
        <p className="mt-2 text-[26px] font-bold">
          {maskName(sent.name)}님, 접수됐어요
        </p>
        <dl className="mt-5 grid grid-cols-[auto_1fr] gap-x-5 gap-y-2 text-[16px]">
          <dt style={{ color: C.muted }}>접수 번호</dt>
          <dd className="font-bold tabular-nums">
            {sent.no}
          </dd>
          <dt style={{ color: C.muted }}>연락처</dt>
          <dd className="tabular-nums">{maskPhone(sent.phone)}</dd>
          <dt style={{ color: C.muted }}>용도, 방식</dt>
          <dd>
            {sent.use}, {sent.way}
          </dd>
          {sent.withCalc && (
            <>
              <dt style={{ color: C.muted }}>규모 검토</dt>
              <dd>
                {result.zone.name}, 대지 {n1(result.area)}
                <M2 />, 지상 약 {result.floors}층
              </dd>
            </>
          )}
          <dt style={{ color: C.muted }}>담당 창구</dt>
          <dd>
            {KAKAO} 또는 전화 {TEL}
          </dd>
          <dt style={{ color: C.muted }}>회신 예정일</dt>
          <dd className="font-bold">{fmtKo(sent.reply)} 오후 6시 전</dd>
        </dl>
        <button
          type="button"
          onClick={() => {
            setSent(null);
            setTried(false);
          }}
          className={`mt-6 inline-flex h-11 items-center gap-2 rounded-[4px] border px-4 text-[15px] font-semibold ${focusRing}`}
          style={{ borderColor: C.field, outlineColor: C.accent }}
        >
          <RotateCcw size={16} aria-hidden /> 다시 쓰기
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-5 rounded-[6px] border p-5 md:grid-cols-2 md:p-8" style={{ borderColor: C.line, background: C.card }}>
      <label className="block">
        <span className="mb-1.5 block text-[15px] font-semibold">이름</span>
        <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" aria-invalid={tried && !!errs.name} className={field} style={{ borderColor: tried && errs.name ? C.error : C.field, outlineColor: C.accent }} />
        {tried && errs.name && <Err>{errs.name}</Err>}
      </label>
      <label className="block">
        <span className="mb-1.5 block text-[15px] font-semibold">휴대폰</span>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" placeholder="010-0000-0000" aria-invalid={tried && !!errs.phone} className={field} style={{ borderColor: tried && errs.phone ? C.error : C.field, outlineColor: C.accent }} />
        {tried && errs.phone && <Err>{errs.phone}</Err>}
      </label>

      <fieldset className="md:col-span-2">
        <legend className="mb-2 text-[15px] font-semibold">건물 용도</legend>
        <Choice options={USES} value={use} onChange={setUse} name="ar-use" />
      </fieldset>

      <label className="block md:col-span-2">
        <span className="mb-1.5 block text-[15px] font-semibold">대지 위치 (선택)</span>
        <input value={addr} onChange={(e) => setAddr(e.target.value)} placeholder="지번이나 도로명 주소" className={field} style={{ borderColor: C.field, outlineColor: C.accent }} />
      </label>

      <fieldset className="md:col-span-2">
        <legend className="mb-2 text-[15px] font-semibold">상담 방식</legend>
        <Choice options={WAYS} value={way} onChange={setWay} name="ar-way" />
      </fieldset>

      <label className="block md:col-span-2">
        <span className="mb-1.5 block text-[15px] font-semibold">문의 내용 (선택)</span>
        <textarea value={memo} onChange={(e) => setMemo(e.target.value)} rows={3} placeholder="예산, 원하는 입주 시기, 가족 구성" className={`w-full rounded-[4px] border bg-white px-3 py-2 text-[16px] ${focusRing}`} style={{ borderColor: C.field, outlineColor: C.accent }} />
      </label>

      <label className="flex items-start gap-3 md:col-span-2">
        <input type="checkbox" checked={withCalc} onChange={(e) => setWithCalc(e.target.checked)} className="mt-1 h-5 w-5 flex-none" style={{ accentColor: C.accent }} />
        <span className="text-[15px] leading-[1.6]">
          규모 검토 결과 같이 보내기
          <span className="block text-[14px]" style={{ color: C.muted }}>
            {result.zone.name}, 대지 {n1(result.area)}
            <M2 />, 건축면적 {n1(result.footprint)}
            <M2 />, 연면적 {n1(result.gross)}
            <M2 />, 지상 약 {result.floors}층
          </span>
        </span>
      </label>

      <label className="flex items-start gap-3 md:col-span-2">
        <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} aria-invalid={tried && !!errs.agree} className="mt-1 h-5 w-5 flex-none" style={{ accentColor: C.accent }} />
        <span className="text-[15px] leading-[1.6]">
          개인정보 수집, 이용 동의 (필수)
          <span className="block text-[14px]" style={{ color: C.muted }}>
            이름, 휴대폰, 대지 위치를 상담 회신에만 쓰고 상담이 끝나면 1년 뒤 지워요.
          </span>
          {tried && errs.agree && <Err>{errs.agree}</Err>}
        </span>
      </label>

      <div className="md:col-span-2">
        <button
          type="submit"
          data-gtm-cta="architect-office_contact_submit"
          className={`inline-flex h-14 w-full items-center justify-center gap-2 rounded-[4px] text-[17px] font-semibold text-white md:w-auto md:px-10 ${focusRing}`}
          style={{ background: C.accent, outlineColor: C.ink }}
        >
          <MessageCircle size={19} aria-hidden /> 상담신청
        </button>
      </div>
    </form>
  );
}

function Err({ children }: { children: React.ReactNode }) {
  return (
    <span className="mt-1.5 flex items-center gap-1 text-[14px] font-bold" style={{ color: C.error }}>
      <AlertCircle size={15} aria-hidden /> {children}
    </span>
  );
}

function Choice<T extends string>({ options, value, onChange, name }: { options: readonly T[]; value: T; onChange: (v: T) => void; name: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = o === value;
        return (
          <label key={o} className="relative cursor-pointer">
            <input type="radio" name={name} value={o} checked={on} onChange={() => onChange(o)} className="peer sr-only" />
            <span
              className="inline-flex h-11 items-center gap-1.5 rounded-[4px] border px-4 text-[15px] font-semibold peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2"
              style={{ borderColor: on ? C.accent : C.line, background: on ? "#fff" : "transparent", color: C.ink, outlineColor: C.accent }}
            >
              {on && <Check size={15} aria-hidden style={{ color: C.accent }} />}
              {o}
            </span>
          </label>
        );
      })}
    </div>
  );
}

/* ---------- 페이지 ---------- */

export function ArchitectDemo() {
  const today = useDemoToday();
  const reduce = useReducedMotionSafe();
  const [result, setResult] = useState<CalcResult>(() => calc(165, ZONES[2]));
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
        <section id="ar-calc" aria-labelledby="ar-calc-title" className="scroll-mt-4 border-t py-12 md:py-16" style={{ borderColor: C.line }}>
          <h2 id="ar-calc-title" className="mb-8 text-[28px] font-bold md:text-[36px]">
            규모 검토
          </h2>
          <ScaleCheck reduce={reduce} result={result} setResult={setResult} />
        </section>

        <section id="ar-process" aria-labelledby="ar-process-title" className="scroll-mt-4 border-t py-12 md:py-16" style={{ borderColor: C.line }}>
          <h2 id="ar-process-title" className="mb-8 text-[28px] font-bold md:text-[36px]">
            설계 과정과 기간
          </h2>
          <Process reduce={reduce} />
        </section>

        <section id="ar-contact" aria-labelledby="ar-contact-title" className="scroll-mt-4 border-t py-12 md:py-16" style={{ borderColor: C.line }}>
          <h2 id="ar-contact-title" className="mb-8 text-[28px] font-bold md:text-[36px]">
            상담신청
          </h2>
          <Contact today={today} result={result} reduce={reduce} />
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
      {/* eslint-disable-next-line @next/next/no-img-element -- 메인 사이트와 같은 곰 로고 */}
      <img src="/images/logo-bear.png" alt="" aria-hidden width={28} height={28} className="h-7 w-7 shrink-0" />
      <span className="flex items-baseline gap-1 whitespace-nowrap">
        <span className="font-bold tracking-[-0.03em]" style={{ fontSize: size }}>
          곰파트너
        </span>
        <span className="text-[12px] font-semibold opacity-75">카탈로그</span>
      </span>
    </span>
  );
}
