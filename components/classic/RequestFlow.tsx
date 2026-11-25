"use client";

import { useEffect, useRef, useState } from "react";
import { Check, RotateCcw } from "lucide-react";
import s from "./SiteBuilder.module.css";
import f from "./RequestFlow.module.css";

// 11-25 유지보수 첫 화면: 수정 요청이 처리되는 과정(사용자 확인한 장면 순서).
// 1 요청을 고른다 > 2 시안 화면에서 바뀔 자리가 표시된다 > 3 그 자리가 바뀐다(모바일 화면도 같이) > 4 작업 내역이 한 줄씩 쌓인다 > 5 사전 검토 신청으로 이어진다.
// 메인 첫 화면(SiteBuilder)과 같은 브라우저 창을 쓴다. 화면은 곰파트너 베이커리 시안 A이고, 요청 네 가지는 건별 유지보수 작업 목록 그대로다.
const SRC = "/work/bakery-cafe?v=a";
const PCW = 1280, PCH = 800, MW = 390, MH = 780;

type Req = { id: "hours" | "photo" | "popup" | "bake"; name: string; before: string; after: string };
const REQS: Req[] = [
  { id: "hours", name: "영업시간 변경", before: "매일 07:30 ~ 21:00", after: "매일 08:00 ~ 20:00" },
  { id: "photo", name: "대표 사진 교체", before: "식빵 사진", after: "크루아상 사진" },
  { id: "popup", name: "팝업 등록", before: "팝업 없음", after: "12월 25일 휴무 안내" },
  { id: "bake", name: "메뉴 추가", before: "빵 나오는 시간 4줄", after: "17:00 치아바타, 올리브 포카치아" },
];
const STEPS = ["접수", "변경 대상 백업", "반영", "결과 보고"];
const NOW = ["접수", "변경 대상 백업", "반영", "모바일 화면 확인과 결과 보고"];

const CSS = `
[data-mt-on]{outline:4px solid #256ef4!important;outline-offset:8px;border-radius:8px;transition:outline-color .3s}
[data-mt-done]{animation:mtflash 1.1s ease-out}
@keyframes mtflash{0%{box-shadow:0 0 0 0 rgba(37,110,244,.55)}100%{box-shadow:0 0 0 26px rgba(37,110,244,0)}}
.mt-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0;transition:opacity .7s}
.mt-img.on{opacity:1}
.mt-row{max-height:0;opacity:0;overflow:hidden;padding-top:0!important;padding-bottom:0!important;transition:max-height .6s,opacity .6s,padding .6s}
.mt-row.on{max-height:120px;opacity:1;padding-top:20px!important;padding-bottom:20px!important}
.mt-pop{position:fixed;inset:0;z-index:90;display:grid;place-items:center;background:rgba(0,0,0,0);transition:background .4s;padding:20px}
.mt-pop.on{background:rgba(0,0,0,.45)}
.mt-pop>div{width:min(420px,100%);background:#fff;color:#1e1712;border-radius:18px;overflow:hidden;transform:translateY(24px) scale(.96);opacity:0;transition:transform .45s cubic-bezier(.2,1.2,.4,1),opacity .3s;box-shadow:0 20px 60px rgba(0,0,0,.3)}
.mt-pop.on>div{transform:none;opacity:1}
.mt-pop h2{margin:0;padding:28px 28px 0;font-size:24px;font-weight:700;letter-spacing:-.03em}
.mt-pop p{margin:10px 0 0;padding:0 28px 26px;font-size:17px;line-height:1.6;color:#6a6058}
.mt-pop footer{display:grid;grid-template-columns:1fr 1fr;border-top:1px solid #ece6e0;font-size:15px;font-weight:700}
.mt-pop footer span{padding:15px;text-align:center}
.mt-pop footer span+span{border-left:1px solid #ece6e0;color:#8a4b22}
@media (prefers-reduced-motion:reduce){[data-mt-done]{animation:none}.mt-img,.mt-row,.mt-pop,.mt-pop>div{transition:none}}
`;

function prep(doc: Document) {
  if (doc.getElementById("mt-css")) return;
  const st = doc.createElement("style");
  st.id = "mt-css";
  st.textContent = CSS;
  doc.head.appendChild(st);
}
function target(doc: Document, id: Req["id"]) {
  return id === "popup" ? null : (doc.querySelector(`[data-mt="${id}"]`) as HTMLElement | null);
}
function focus(fr: HTMLIFrameElement | null, id: Req["id"], smooth: boolean) {
  const doc = fr?.contentDocument, win = fr?.contentWindow;
  if (!doc || !win) return;
  prep(doc);
  // 앞서 띄운 팝업은 다음 요청을 시작할 때 닫는다
  doc.querySelectorAll(".mt-pop").forEach((x) => x.remove());
  const el = target(doc, id);
  const top = el ? Math.max(0, el.getBoundingClientRect().top + win.scrollY - (win.innerHeight - Math.min(el.offsetHeight, win.innerHeight - 160)) / 2) : 0;
  win.scrollTo({ top, behavior: smooth ? "smooth" : "auto" });
  el?.setAttribute("data-mt-on", "");
}
function change(fr: HTMLIFrameElement | null, r: Req) {
  const doc = fr?.contentDocument;
  if (!doc) return;
  prep(doc);
  const el = target(doc, r.id);
  if (r.id === "hours" && el) el.textContent = r.after;
  if (r.id === "photo" && el) {
    const img = doc.createElement("img");
    img.className = "mt-img";
    img.src = "/images/drafts/bk/a-croissant.jpg";
    img.alt = "종이 위에 놓인 크루아상";
    el.appendChild(img);
    requestAnimationFrame(() => requestAnimationFrame(() => img.classList.add("on")));
  }
  if (r.id === "bake" && el && el.lastElementChild) {
    const li = el.lastElementChild.cloneNode(true) as HTMLElement;
    const sp = li.querySelectorAll("span");
    if (sp[0]) sp[0].textContent = "17:00";
    if (sp[1]) sp[1].textContent = "치아바타와 올리브 포카치아";
    (el.lastElementChild as HTMLElement).style.borderBottomWidth = "1px";
    li.classList.add("mt-row");
    el.appendChild(li);
    requestAnimationFrame(() => requestAnimationFrame(() => li.classList.add("on")));
  }
  if (r.id === "popup") {
    const pop = doc.createElement("div");
    pop.className = "mt-pop";
    pop.innerHTML = "<div role=\"dialog\" aria-label=\"휴무 안내\"><h2>휴무 안내</h2><p>12월 25일(금) 하루 쉽니다. 26일(토)부터 정상 영업합니다.</p><footer><span>오늘 하루 보지 않기</span><span>닫기</span></footer></div>";
    doc.body.appendChild(pop);
    requestAnimationFrame(() => requestAnimationFrame(() => pop.classList.add("on")));
  }
  if (el) {
    el.removeAttribute("data-mt-on");
    el.setAttribute("data-mt-done", "");
  }
}

export function RequestFlow() {
  const [w, setW] = useState(720);
  const [nonce, setNonce] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [cur, setCur] = useState<Req | null>(null);
  const [step, setStep] = useState(0); // 진행 중인 요청에서 끝난 단계 수
  const [done, setDone] = useState<Req[]>([]);
  const stage = useRef<HTMLDivElement>(null);
  const pc = useRef<HTMLIFrameElement>(null);
  const mo = useRef<HTMLIFrameElement>(null);
  const auto = useRef(false);

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const fit = () => setW(el.clientWidth);
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // 화면이 스크립트보다 먼저 뜨면 onLoad를 놓친다. 뜬 상태인지 직접 확인한다
  useEffect(() => {
    if (loaded) return;
    const t = setInterval(() => {
      const ok = [pc.current, mo.current].every((x) => x?.contentDocument?.readyState === "complete" && x.contentDocument.querySelector("[data-mt]"));
      if (ok) setLoaded(true);
    }, 200);
    return () => clearInterval(t);
  }, [loaded, nonce]);

  const run = (r: Req) => {
    if (cur || !loaded || done.some((d) => d.id === r.id)) return;
    setCur(r);
    setStep(0);
  };

  // 접수 > 변경 대상 백업 > 반영 > 결과 보고
  useEffect(() => {
    if (!cur) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const wait = (ms: number) => (reduce ? 0 : ms);
    if (step === 0) {
      focus(pc.current, cur.id, !reduce);
      focus(mo.current, cur.id, !reduce);
      const t = setTimeout(() => setStep(1), wait(900));
      return () => clearTimeout(t);
    }
    if (step === 1) { const t = setTimeout(() => setStep(2), wait(900)); return () => clearTimeout(t); }
    if (step === 2) {
      change(pc.current, cur);
      change(mo.current, cur);
      const t = setTimeout(() => setStep(3), wait(1100));
      return () => clearTimeout(t);
    }
    if (step === 3) { const t = setTimeout(() => setStep(4), wait(1200)); return () => clearTimeout(t); }
    setDone((d) => [...d, cur]);
    setCur(null);
  }, [cur, step]);

  // 첫 요청은 화면이 뜨면 한 번 보여 준다
  useEffect(() => {
    if (!loaded || auto.current) return;
    auto.current = true;
    const t = setTimeout(() => run(REQS[0]), 700);
    return () => clearTimeout(t);
  }, [loaded]); // eslint-disable-line react-hooks/exhaustive-deps

  const reset = () => { setCur(null); setStep(0); setDone([]); setLoaded(false); setNonce((n) => n + 1); };

  const sp = w / PCW;
  const mw = Math.max(92, w * 0.24), sm = mw / MW;
  const last = done[done.length - 1];

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.3fr)] lg:grid-rows-[auto_1fr] lg:items-start lg:gap-x-12 lg:gap-y-7">
      <div className="min-w-0 lg:col-start-1 lg:row-start-1">
        <h2 className="break-keep text-[26px] font-[800] leading-[1.3] tracking-[-0.05em] md:text-[34px]">수정 요청 처리 과정</h2>
        <div className="mt-5 grid grid-cols-2 gap-2.5" role="group" aria-label="수정 요청">
          {REQS.map((r) => {
            const ok = done.some((d) => d.id === r.id), on = cur?.id === r.id;
            return (
              <button key={r.id} type="button" onClick={() => run(r)} disabled={ok || !!cur || !loaded} aria-pressed={on || ok} className={`flex min-h-14 items-center justify-between gap-2 rounded-md border-2 px-3.5 py-2 text-left text-[16px] font-[800] leading-[1.3] md:text-[18px] ${on ? "border-[#256ef4] bg-[#256ef4] text-white" : ok ? "border-[#c9d0da] bg-[#f4f6fa] text-[#5b6370]" : "border-[#15171c] bg-white text-[#15171c]"}`}>
                <span className="break-keep">{r.name}</span>
                {ok ? <Check size={18} strokeWidth={3} aria-hidden className="shrink-0 text-[#1552cc]" /> : null}
              </button>
            );
          })}
        </div>
      </div>

      <div className="order-3 min-w-0 lg:order-none lg:col-start-1 lg:row-start-2">
        <div className="flex items-center justify-between border-b-2 border-[#15171c] pb-2">
          <h3 className="text-[17px] font-[800] md:text-[18px]">작업 내역</h3>
          <button type="button" onClick={reset} disabled={!done.length || !!cur} className="inline-flex h-11 items-center gap-1.5 text-[15px] font-bold text-[#1552cc] disabled:text-[#8a94a6]">
            <RotateCcw size={16} aria-hidden /> 처음부터
          </button>
        </div>
        <ol className="text-[15px] md:text-[16px]" role="list" aria-live="polite">
          {done.map((d, k) => (
            <li key={d.id} className="grid grid-cols-[24px_minmax(0,1fr)_auto] items-baseline gap-2 border-b border-[#d9dee5] py-2.5">
              <span className="font-[800] tabular-nums text-[#1552cc]">{k + 1}</span>
              <span className="min-w-0">
                <b className="font-[800]">{d.name}</b>
                <span className="block break-keep text-[14.5px] text-[#5b6370] md:text-[15px]">{d.before} &gt; {d.after}</span>
              </span>
              <span className="font-bold text-[#1552cc]">완료</span>
            </li>
          ))}
          {cur ? (
            <li className="border-b border-[#d9dee5] py-2.5">
              <p className="grid grid-cols-[24px_minmax(0,1fr)] gap-2">
                <span className="font-[800] tabular-nums text-[#1552cc]">{done.length + 1}</span>
                <b className="font-[800]">{cur.name}</b>
              </p>
              <ol className="ml-8 mt-1.5 grid grid-cols-2 gap-x-3 gap-y-1 sm:grid-cols-4" role="list">
                {STEPS.map((t, k) => (
                  <li key={t} className={`${f.step} ${k < step ? f.ok : k === step ? f.now : ""}`}>
                    <i aria-hidden />{t}
                  </li>
                ))}
              </ol>
            </li>
          ) : null}
          {!cur && !done.length ? <li className="border-b border-[#d9dee5] py-2.5 text-[#5b6370]">{loaded ? "수정 요청 선택" : "화면 불러오는 중"}</li> : null}
        </ol>
      </div>

      <div className="order-2 min-w-0 lg:order-none lg:col-start-2 lg:row-span-2 lg:row-start-1">
        <div className={`keep-light ${s.window} ${last && !cur ? s.open : ""}`}>
          <div className={s.chrome}>
            <span className={s.dots} aria-hidden><i /><i /><i /></span>
            <span className={s.addr}>밀알 베이커리</span>
            <span key={done.length} className={s.badge} aria-hidden={!last || !!cur}>반영 완료</span>
          </div>
          <div ref={stage} className={s.stage} style={{ height: PCH * sp }} data-phase="3">
            <iframe ref={pc} key={`p${nonce}`} src={SRC} title="베이커리 홈페이지 시안 PC 화면" tabIndex={-1} style={{ width: PCW, height: PCH, transform: `scale(${sp})` }} />
            <div className={s.phone} style={{ width: mw, height: MH * sm, ...(cur && step < 3 ? { transform: "translateY(108%)" } : null) }}>
              <iframe ref={mo} key={`m${nonce}`} src={SRC} title="베이커리 홈페이지 시안 모바일 화면" tabIndex={-1} style={{ width: MW, height: MH, transform: `scale(${sm})` }} />
            </div>
          </div>
        </div>
        <p className="mt-2.5 text-[15px] font-bold text-[#3d4450] md:text-[16px]">
          {cur ? `${cur.name}: ${NOW[Math.min(step, 3)]}` : last ? `${last.name} 반영 완료, PC와 모바일 화면 확인` : "곰파트너 베이커리 홈페이지 시안"}
        </p>
      </div>
    </div>
  );
}
