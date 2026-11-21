"use client";

import Image from "next/image";
import { ArrowRight, Plus } from "lucide-react";

// 법률사무소 시안 B 화이트 상담형(11-21). 처음 변호사를 찾는 개인 의뢰인 눈높이로, 밝고 큰 글씨, 상담 절차와 자주 묻는 질문 중심.
// 사진: Unsplash 무료 라이선스(public/images/drafts/law/b-*)
const IMG = "/images/drafts/law";
const C = { ink: "#111418", sub: "#5a6270", line: "#e3e6eb", soft: "#f4f6f9", blue: "#1f4fd8", blueSoft: "#eaf0ff" };
const TEL = "02-000-0000";

const NEEDS = [
  { t: "돈을 못 받고 있어요", d: "빌려준 돈, 공사대금, 보증금", a: "민사, 부동산" },
  { t: "경찰 조사를 받게 됐어요", d: "출석 요구, 고소당함", a: "형사" },
  { t: "이혼을 생각하고 있어요", d: "재산분할, 양육권, 위자료", a: "이혼, 가사" },
  { t: "회사 계약이 걱정돼요", d: "계약서 검토, 거래처 분쟁", a: "기업 자문" },
  { t: "부당하게 해고됐어요", d: "해고, 임금체불, 산재", a: "노동" },
  { t: "상속 문제로 다투고 있어요", d: "유류분, 상속재산 분할", a: "상속" },
];

const STEPS = [
  { t: "상담 신청", d: "전화나 상담 신청서로 사건 내용을 간단히 남깁니다." },
  { t: "변호사 직접 상담", d: "담당할 변호사가 30분 동안 사실관계를 듣고 방향을 말씀드립니다." },
  { t: "비용, 일정 안내", d: "예상 기간과 착수금, 성공보수를 서면으로 드립니다." },
  { t: "사건 진행 보고", d: "기일마다 진행 내용을 정리해 문자와 메일로 보내 드립니다." },
];

const FAQ = [
  ["상담 비용이 있나요?", "첫 상담 30분은 사건 검토를 위해 무료로 진행합니다. 서류 검토가 필요한 경우에는 미리 말씀드립니다."],
  ["증거가 부족해도 상담할 수 있나요?", "가지고 계신 문자, 메일, 계좌 내역만으로도 충분히 시작할 수 있습니다. 필요한 자료는 상담에서 함께 정리합니다."],
  ["지방에 살아도 맡길 수 있나요?", "전국 법원 사건을 진행합니다. 상담은 화상으로도 가능합니다."],
];

export function LawFirmB() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.75] md:text-[17px]" style={{ color: C.ink }}>
      <header className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur" style={{ borderColor: C.line }}>
        <div className="mx-auto flex h-[72px] max-w-[1240px] items-center justify-between px-5 md:px-8">
          <p className="text-[20px] font-bold tracking-[-0.03em]">법률사무소</p>
          <nav aria-label="주 메뉴" className="hidden gap-9 text-[15px] font-semibold lg:flex" style={{ color: "#333a45" }}>
            {["사무소 소개", "상담 분야", "상담 절차", "자주 묻는 질문", "오시는 길"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </nav>
          <span className="inline-flex h-11 items-center rounded-full px-5 text-[15px] font-bold text-white" style={{ background: C.blue }}>
            상담 신청
          </span>
        </div>
      </header>

      <section className="px-5 pb-16 pt-14 md:px-8 md:pb-24 md:pt-20">
        <div className="mx-auto grid max-w-[1240px] items-center gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          <div>
            <p className="inline-flex rounded-full px-3 py-1 text-[14px] font-bold" style={{ background: C.blueSoft, color: C.blue }}>첫 상담 30분 무료</p>
            <h1 className="mt-6 text-[38px] font-bold leading-[1.22] tracking-[-0.045em] md:text-[66px]">
              혼자 판단하기 전에,
              <br />
              먼저 물어보세요
            </h1>
            <p className="mt-6 max-w-[520px] text-[17px] md:text-[19px]" style={{ color: C.sub }}>
              법률 문제는 처음 대응이 결과를 좌우합니다. 지금 상황에서 할 수 있는 일과 하지 말아야 할 일을 변호사가 직접 알려 드립니다.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <span className="inline-flex h-[56px] items-center gap-2 rounded-full px-8 text-[17px] font-bold text-white" style={{ background: C.blue }}>
                상담 신청하기
                <ArrowRight size={18} aria-hidden />
              </span>
              <span className="text-[18px] font-bold tabular-nums">{TEL}</span>
            </div>
          </div>
          <div className="relative aspect-[4/5] overflow-hidden rounded-[28px] md:aspect-[5/5]">
            <Image src={`${IMG}/b-hero.jpg`} alt="푸른 하늘 아래 유리 외벽 사무 빌딩" fill priority sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
            <div className="absolute bottom-5 left-5 right-5 rounded-[18px] bg-white/95 p-5 backdrop-blur md:bottom-7 md:left-7 md:right-auto md:max-w-[300px]">
              <p className="text-[14px] font-bold" style={{ color: C.blue }}>상담 가능 시간</p>
              <p className="mt-1 text-[17px] font-bold">평일 09:00 ~ 21:00</p>
              <p className="text-[14px]" style={{ color: C.sub }}>토요일 오전 예약 상담</p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28" style={{ background: C.soft }}>
        <div className="mx-auto max-w-[1240px]">
          <h2 className="text-[30px] font-bold leading-[1.3] tracking-[-0.04em] md:text-[44px]">어떤 일로 찾아오셨나요?</h2>
          <p className="mt-3" style={{ color: C.sub }}>상황을 고르시면 맞는 분야의 변호사가 상담합니다.</p>
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {NEEDS.map((n) => (
              <li key={n.t} className="flex flex-col justify-between rounded-[20px] bg-white p-7 md:p-8">
                <div>
                  <h3 className="text-[21px] font-bold tracking-[-0.03em] md:text-[23px]">{n.t}</h3>
                  <p className="mt-2 text-[15px]" style={{ color: C.sub }}>{n.d}</p>
                </div>
                <p className="mt-8 flex items-center justify-between text-[14px] font-bold" style={{ color: C.blue }}>
                  {n.a}
                  <ArrowRight size={17} aria-hidden />
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-32">
        <div className="mx-auto grid max-w-[1240px] gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[24px] lg:aspect-auto">
            <Image src={`${IMG}/b-room.jpg`} alt="창이 넓은 밝은 상담실" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
          </div>
          <div>
            <h2 className="text-[30px] font-bold leading-[1.3] tracking-[-0.04em] md:text-[44px]">상담은 이렇게 진행됩니다</h2>
            <ol className="mt-10 grid gap-0">
              {STEPS.map((s, i) => (
                <li key={s.t} className="relative grid grid-cols-[44px_1fr] gap-4 pb-9 last:pb-0">
                  {i < STEPS.length - 1 && <span className="absolute left-[21px] top-11 h-[calc(100%-44px)] w-px" style={{ background: C.line }} aria-hidden />}
                  <span className="flex h-11 w-11 items-center justify-center rounded-full text-[16px] font-bold" style={{ background: C.blueSoft, color: C.blue }}>
                    {i + 1}
                  </span>
                  <div className="pt-1.5">
                    <h3 className="text-[20px] font-bold">{s.t}</h3>
                    <p className="mt-1 text-[16px]" style={{ color: C.sub }}>{s.d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto grid max-w-[1240px] gap-10 lg:grid-cols-[1fr_1.5fr] lg:gap-20">
          <h2 className="text-[30px] font-bold leading-[1.3] tracking-[-0.04em] md:text-[44px]">자주 묻는 질문</h2>
          <ul className="border-t" style={{ borderColor: C.ink }}>
            {FAQ.map(([q, a], i) => (
              <li key={q} className="border-b py-7" style={{ borderColor: C.line }}>
                <p className="flex items-start justify-between gap-4 text-[19px] font-bold md:text-[21px]">
                  {q}
                  <Plus size={22} className={`mt-1 shrink-0 transition-transform ${i === 0 ? "rotate-45" : ""}`} aria-hidden />
                </p>
                {i === 0 && <p className="mt-3 max-w-[640px]" style={{ color: C.sub }}>{a}</p>}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-5 pb-20 md:px-8 md:pb-28">
        <div className="relative mx-auto max-w-[1240px] overflow-hidden rounded-[28px] px-7 py-14 text-white md:px-16 md:py-20" style={{ background: C.blue }}>
          <Image src={`${IMG}/b-window.jpg`} alt="" fill sizes="100vw" className="object-cover opacity-15 mix-blend-luminosity" />
          <div className="relative flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-[28px] font-bold leading-[1.35] tracking-[-0.04em] md:text-[40px]">지금 상황, 30분이면 정리됩니다</h2>
              <p className="mt-3 text-[16px] text-white/80 md:text-[18px]">상담 내용은 사건 수임 여부와 관계없이 비밀로 지킵니다.</p>
            </div>
            <div className="flex flex-col gap-2 md:items-end">
              <span className="inline-flex h-[56px] items-center gap-2 rounded-full bg-white px-8 text-[17px] font-bold" style={{ color: C.blue }}>
                상담 신청하기
                <ArrowRight size={18} aria-hidden />
              </span>
              <span className="text-[20px] font-bold tabular-nums">{TEL}</span>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t px-5 py-10 text-[14px] md:px-8" style={{ borderColor: C.line, color: C.sub }}>
        <div className="mx-auto flex max-w-[1240px] flex-col gap-2 md:flex-row md:justify-between">
          <p>법률사무소, 서울특별시 서초구 서초동 법조타운</p>
          <p>상담 문의 02-000-0000</p>
        </div>
      </footer>
    </div>
  );
}
