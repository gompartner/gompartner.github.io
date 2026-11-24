"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Check, RotateCcw, TriangleAlert } from "lucide-react";
import s from "./MaintenanceStory.module.css";

// 11-25 유지보수 첫 화면: 맡긴 뒤 달라지는 과정(사용자 확인 장면 순서).
// 1 경고가 붙은 사이트 > 2 계정 인수(고객 명의) > 3 점검 다섯 항목 > 4 경고가 하나씩 사라짐 > 5 월 점검 보고서가 채워짐 > 6 달마다 보고서가 쌓임.
// 화면의 사이트와 수치는 예시다. 손님 사이트를 실제로 점검한 결과가 아니다.
const WARN = [
  { t: "SSL 인증서 만료 9일 전", x: "6%", y: "16%" },
  { t: "이미지 깨짐 3곳", x: "52%", y: "34%" },
  { t: "응답 속도 4.8초", x: "10%", y: "58%" },
  { t: "문의 메일 미수신", x: "50%", y: "76%" },
];
const TAKE = ["도메인", "호스팅", "관리자 계정"];
const CHECK = ["전체 백업", "백업 복원 확인", "문의 폼 수신 확인", "접속 속도, 오류 페이지 확인", "보안 업데이트 확인"];
const REPORT: [string, string][] = [
  ["요청과 처리", "제품 사양 수정, 공지 등록 2건"],
  ["정기 점검", "5개 항목 완료"],
  ["만료 예정", "도메인 2027.03.14"],
  ["다음 달", "연말 휴무 안내 배너"],
];
const MONTHS = ["11월", "12월", "1월", "2월"];
const LABEL = ["현재 상태", "계정 인수", "정기 점검", "조치", "월 점검 보고서", "월 유지보수"];
// 장면별 단계 수와 단계 간격(ms)
const PLAN: [number, number][] = [[WARN.length, 420], [TAKE.length, 520], [CHECK.length, 460], [WARN.length, 420], [REPORT.length, 480], [MONTHS.length - 1, 620]];

export function MaintenanceStory() {
  const [scene, setScene] = useState(0);
  const [step, setStep] = useState(0);
  const [on, setOn] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver((es) => { if (es[0].isIntersecting) { setOn(true); io.disconnect(); } }, { threshold: 0.7 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!on) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setScene(5); setStep(PLAN[5][0]); return; }
    const [max, gap] = PLAN[scene];
    if (step < max) { const t = setTimeout(() => setStep(step + 1), gap); return () => clearTimeout(t); }
    if (scene < 5) { const t = setTimeout(() => { setScene(scene + 1); setStep(0); }, 900); return () => clearTimeout(t); }
  }, [on, scene, step]);

  const replay = () => { setScene(0); setStep(0); setOn(true); };
  // 경고 표시: 1장면에서 하나씩 붙고 4장면에서 하나씩 사라진다
  const warnOn = (k: number) => (scene === 0 ? k < step : scene < 3 ? true : scene === 3 ? k >= step : false);

  return (
    <div ref={root} className={`keep-light ${s.root}`}>
      <div className={s.window}>
        <div className={s.chrome}>
          <span className={s.dots} aria-hidden><i /><i /><i /></span>
          <span className={s.addr}>운영 중인 홈페이지</span>
          <span className={`${s.state} ${scene >= 4 ? s.ok : ""}`}>{scene >= 4 ? "정상" : `확인 필요 ${WARN.filter((_, k) => warnOn(k)).length}건`}</span>
        </div>
        <div className={s.site}>
          <Image src="/images/demos/company.jpg" alt="" fill sizes="(min-width: 1024px) 560px, 100vw" className={`object-cover object-top ${scene >= 4 ? "" : s.dim}`} />
          {WARN.map((w, k) => (
            <span key={w.t} className={`${s.warn} ${warnOn(k) ? s.show : ""}`} style={{ left: w.x, top: w.y }}>
              <TriangleAlert size={15} aria-hidden /> {w.t}
            </span>
          ))}
        </div>
      </div>

      <div className={s.panel}>
        <div className={s.head}>
          <p className={s.count}>{scene + 1} / 6</p>
          <h3 className={s.title}>{LABEL[scene]}</h3>
          <button type="button" className={s.replay} onClick={replay} aria-label="처음부터 다시 보기"><RotateCcw size={17} aria-hidden /></button>
        </div>
        <div className={s.body} aria-live="polite">
          {scene === 0 || scene === 3 ? (
            <ul className={s.list} role="list">
              {WARN.map((w, k) => (
                <li key={w.t} className={`${s.row} ${scene === 3 && k < step ? s.done : ""} ${scene === 0 && k >= step ? s.wait : ""}`}>
                  <span className={s.mark}>{scene === 3 && k < step ? <Check size={15} aria-hidden /> : <TriangleAlert size={14} aria-hidden />}</span>
                  <span className={s.txt}>{w.t}</span>
                  <span className={s.tag}>{scene === 3 && k < step ? "조치 완료" : "확인 필요"}</span>
                </li>
              ))}
            </ul>
          ) : null}
          {scene === 1 ? (
            <ul className={s.list} role="list">
              {TAKE.map((t, k) => (
                <li key={t} className={`${s.row} ${k < step ? s.done : s.wait}`}>
                  <span className={s.mark}>{k < step ? <Check size={15} aria-hidden /> : null}</span>
                  <span className={s.txt}>{t}</span>
                  <span className={s.tag}>{k < step ? "고객 명의 확인" : "확인 중"}</span>
                </li>
              ))}
            </ul>
          ) : null}
          {scene === 2 ? (
            <ul className={s.list} role="list">
              {CHECK.map((t, k) => (
                <li key={t} className={`${s.row} ${k < step ? s.done : k === step ? s.run : s.wait}`}>
                  <span className={s.mark}>{k < step ? <Check size={15} aria-hidden /> : k === step ? <i className={s.spin} aria-hidden /> : null}</span>
                  <span className={s.txt}>{t}</span>
                  <span className={s.tag}>{k < step ? "완료" : k === step ? "점검 중" : "대기"}</span>
                </li>
              ))}
            </ul>
          ) : null}
          {scene >= 4 ? (
            <div className={s.stack}>
              {MONTHS.map((m, k) => {
                const shown = scene === 4 ? k === 0 : k <= step;
                const top = scene === 4 ? 0 : step;
                return (
                  <div key={m} className={`${s.sheet} ${shown ? s.in : ""}`} style={{ transform: shown ? `translate(${(top - k) * 10}px, ${(top - k) * -9}px)` : undefined, zIndex: k + 1 }}>
                    <p className={s.sheetHead}><b>{m} 점검 보고서</b><span>월 1회 발행</span></p>
                    <dl>
                      {REPORT.map(([a, b], r) => (
                        <div key={a} className={scene === 4 && k === 0 && r >= step ? s.blank : ""}>
                          <dt>{a}</dt>
                          <dd>{b}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
