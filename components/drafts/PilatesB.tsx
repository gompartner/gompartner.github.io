"use client";

import Image from "next/image";
import { ArrowRight, Check } from "lucide-react";

// 필라테스 시안 B 체험 상담형(11-21 사례 분석: MY Yoga, Magma처럼 밝은 자연광 사진, 메인에 수업 일정. 처음 오는 회원은 체험 수업, 시간표, 횟수권을 먼저 찾는다). 흰 바탕, 세이지 포인트. 메인 한 장, 기능 없음.
// 사진: Unsplash 무료 라이선스(public/images/drafts/pil/b-*)
const IMG = "/images/drafts/pil";
const C = { ink: "#18201c", sub: "#5f6863", line: "#e2e8e4", soft: "#f3f6f4", sage: "#4f7a64", sageSoft: "#e4efe8" };

const DAYS = ["월", "화", "수", "목", "금", "토"];
const SLOTS: [string, string[]][] = [
  ["07:00", ["기구", "", "기구", "", "기구", ""]],
  ["10:00", ["매트", "기구", "매트", "기구", "매트", "기구"]],
  ["12:20", ["", "기구", "", "기구", "", ""]],
  ["19:00", ["기구", "기구", "기구", "기구", "기구", ""]],
  ["20:20", ["기구", "매트", "기구", "매트", "기구", ""]],
];

export function PilatesB() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.75] md:text-[17px]" style={{ color: C.ink }}>
      <header className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur" style={{ borderColor: C.line }}>
        <div className="mx-auto flex h-[70px] max-w-[1200px] items-center justify-between px-5 md:px-8">
          <p className="text-[20px] font-bold tracking-[-0.03em]">필라테스 스튜디오</p>
          <nav aria-label="주 메뉴" className="hidden gap-9 text-[15px] font-semibold lg:flex" style={{ color: "#3e4842" }}>
            {["체험 수업", "시간표", "회원권", "오시는 길"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </nav>
          <span className="inline-flex h-11 items-center rounded-full px-5 text-[15px] font-bold text-white" style={{ background: C.sage }}>
            체험 신청
          </span>
        </div>
      </header>

      <section className="px-5 pb-14 pt-10 md:px-8 md:pb-20 md:pt-14">
        <div className="relative mx-auto max-w-[1200px] overflow-hidden rounded-[32px]">
          <div className="relative aspect-[4/5] sm:aspect-[16/10] md:aspect-[21/9]">
            <Image src={`${IMG}/b-hero.jpg`} alt="큰 창으로 햇빛이 드는 넓은 스튜디오" fill priority sizes="(min-width: 1200px) 1200px, 100vw" className="object-cover" />
            <div className="absolute inset-0 hidden sm:block" style={{ background: "linear-gradient(90deg, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.9) 38%, rgba(255,255,255,0.3) 62%, rgba(255,255,255,0) 80%)" }} aria-hidden />
            <div className="absolute inset-0 sm:hidden" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.97) 0%, rgba(255,255,255,0.92) 55%, rgba(255,255,255,0.2) 85%)" }} aria-hidden />
          </div>
          <div className="absolute inset-0 flex items-start p-7 sm:items-center md:p-16">
            <div className="max-w-[500px]">
              <p className="inline-flex rounded-full px-3 py-1 text-[14px] font-bold" style={{ background: C.sageSoft, color: C.sage }}>처음 오시는 분</p>
              <h1 className="mt-5 text-[34px] font-bold leading-[1.22] tracking-[-0.045em] md:text-[58px]">
                기구 필라테스,
                <br />
                한 번 해 보고 정하세요
              </h1>
              <p className="mt-4 text-[16px] md:text-[18px]" style={{ color: C.sub }}>체험 수업 50분에 체형 평가와 상담이 들어 있습니다. 운동복만 가져오세요.</p>
            </div>
          </div>
        </div>
        <ul className="mx-auto mt-6 grid max-w-[1200px] gap-3 sm:grid-cols-3">
          {["체험 수업 1회 20,000원", "체형 사진과 평가지 제공", "등록하면 체험비 차감"].map((t) => (
            <li key={t} className="flex items-center gap-3 rounded-[20px] p-5 text-[17px] font-bold" style={{ background: C.soft }}>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white" style={{ color: C.sage }}>
                <Check size={18} aria-hidden />
              </span>
              {t}
            </li>
          ))}
        </ul>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-[1200px]">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <h2 className="text-[30px] font-bold tracking-[-0.04em] md:text-[44px]">이번 주 시간표</h2>
            <p className="flex gap-4 text-[15px] font-semibold">
              <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-full" style={{ background: C.sage }} />기구 그룹 (4명)</span>
              <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-full" style={{ background: "#c9d6ce" }} />매트 그룹 (6명)</span>
            </p>
          </div>
          <div className="mt-10 overflow-hidden rounded-[22px] border" style={{ borderColor: C.line }}>
            <table className="w-full table-fixed text-center text-[13px] md:text-[15px]">
              <thead>
                <tr style={{ background: C.soft, color: C.sub }}>
                  <th className="w-[58px] px-1 py-4 font-bold md:w-auto md:px-3">시간</th>
                  {DAYS.map((d) => (
                    <th key={d} className="px-1 py-4 font-bold md:px-3">{d}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SLOTS.map(([t, row]) => (
                  <tr key={t} className="border-t" style={{ borderColor: C.line }}>
                    <td className="px-1 py-3 font-bold tabular-nums md:px-3">{t}</td>
                    {row.map((c, i) => (
                      <td key={i} className="px-0.5 py-2 md:px-2 md:py-2.5">
                        {c && (
                          <span className="inline-flex w-full max-w-[96px] justify-center rounded-[8px] py-1.5 font-bold md:rounded-[10px] md:py-2" style={c === "기구" ? { background: C.sage, color: "#fff" } : { background: "#c9d6ce", color: C.ink }}>
                            {c}
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-[14px]" style={{ color: C.sub }}>개인 레슨은 위 시간 외에도 07:00 ~ 22:00 사이에 정합니다.</p>
        </div>
      </section>

      <section className="px-5 pb-20 md:px-8 md:pb-28">
        <div className="mx-auto grid max-w-[1200px] gap-5 md:grid-cols-3">
          {[
            { t: "그룹 8회", s: "주 2회, 1개월", p: "200,000원", d: ["기구 또는 매트 선택", "수업 4시간 전까지 변경"] },
            { t: "그룹 24회", s: "주 2회, 3개월", p: "528,000원", d: ["회당 22,000원", "연기 1회 가능"], pick: true },
            { t: "개인 10회", s: "1:1, 2개월", p: "700,000원", d: ["체형 평가 2회 포함", "재활, 통증 관리"] },
          ].map((m) => (
            <article key={m.t} className="flex flex-col rounded-[24px] p-8" style={m.pick ? { background: C.ink, color: "#fff" } : { background: C.soft }}>
              <p className="text-[14px] font-bold" style={{ color: m.pick ? "#a9d3bb" : C.sage }}>{m.s}</p>
              <h3 className="mt-2 text-[24px] font-bold tracking-[-0.03em]">{m.t}</h3>
              <p className="mt-4 text-[30px] font-bold tracking-[-0.03em] tabular-nums">{m.p}</p>
              <ul className="mt-6 grid gap-2 text-[15px]" style={{ color: m.pick ? "rgba(255,255,255,0.75)" : C.sub }}>
                {m.d.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="px-5 pb-20 md:px-8 md:pb-28">
        <div className="mx-auto grid max-w-[1200px] items-center gap-10 overflow-hidden rounded-[32px] md:grid-cols-2" style={{ background: C.sageSoft }}>
          <div className="relative min-h-[280px] self-stretch md:min-h-[420px]">
            <Image src={`${IMG}/b-room.jpg`} alt="리포머와 캐딜락이 놓인 스튜디오" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
          </div>
          <div className="px-8 pb-12 md:px-12 md:py-14">
            <h2 className="text-[28px] font-bold leading-[1.35] tracking-[-0.04em] md:text-[38px]">체험은 이렇게 진행됩니다</h2>
            <ol className="mt-7 grid gap-3">
              {["전화나 카톡으로 원하는 시간 예약", "체형 사진 촬영과 생활 습관 상담", "기구 수업 30분 체험", "맞는 수업과 회원권 안내"].map((s, i) => (
                <li key={s} className="flex items-center gap-4 rounded-[14px] bg-white px-5 py-3.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[14px] font-bold text-white" style={{ background: C.sage }}>{i + 1}</span>
                  <span className="font-semibold">{s}</span>
                </li>
              ))}
            </ol>
            <p className="mt-7 inline-flex items-center gap-1.5 font-bold" style={{ color: C.sage }}>
              체험 수업 신청 <ArrowRight size={17} aria-hidden />
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t px-5 py-10 text-[14px] md:px-8" style={{ borderColor: C.line, color: C.sub }}>
        <div className="mx-auto flex max-w-[1200px] flex-col gap-2 md:flex-row md:justify-between">
          <p>필라테스 스튜디오, 경기도 용인시 수지구 일대, 건물 주차 2시간</p>
          <p>체험 문의 031-000-0000</p>
        </div>
      </footer>
    </div>
  );
}
