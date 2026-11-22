"use client";

import Image from "next/image";
import { Phone } from "lucide-react";

// 요양병원 시안 A 재활 진료형(11-22 사례 분석: 도경요양병원처럼 자연과 시설 사진, 진료과목, 이용안내. 고객은 보호자이고 진료 내용, 입원 절차, 비용 구성을 먼저 찾는다. 의료법상 후기, 최고 표현 없음). 흰 바탕, 짙은 초록. 인물 없음. 메인 한 장, 기능 없음.
// 사진: Unsplash 무료 라이선스(public/images/drafts/nh/a-*)
const IMG = "/images/drafts/nh";
const C = { ink: "#13201a", sub: "#5b6a62", line: "#e1eae5", soft: "#f2f7f4", green: "#1f5e45" };

const DEPT = [
  ["내과", "만성질환, 당뇨, 고혈압, 폐렴 회복"],
  ["재활의학과", "뇌졸중, 골절 수술 뒤 기능 회복"],
  ["신경과", "치매, 파킨슨병 약물 관리"],
  ["한방 협진", "침, 뜸 치료 병행"],
];

export function NhA() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.75] md:text-[17px]" style={{ color: C.ink }}>
      <header className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur" style={{ borderColor: C.line }}>
        <div className="mx-auto flex h-[72px] max-w-[1280px] items-center justify-between px-5 md:px-10">
          <p className="text-[20px] font-bold tracking-[-0.03em]" style={{ color: C.green }}>
            푸른숲 요양병원
          </p>
          <nav aria-label="주 메뉴" className="hidden gap-9 text-[15px] font-semibold lg:flex" style={{ color: "#3d4a43" }}>
            {["진료 과목", "재활치료", "입원 안내", "비용", "오시는 길"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </nav>
          <span className="hidden items-center gap-2 text-[17px] font-bold tabular-nums sm:inline-flex" style={{ color: C.green }}>
            <Phone size={18} aria-hidden /> 031-000-0000
          </span>
        </div>
      </header>

      <section className="relative flex min-h-[560px] items-end overflow-hidden text-white md:min-h-[640px]">
        <Image src={`${IMG}/a-hero.jpg`} alt="메타세쿼이아 숲 사이 나무 다리 산책길" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d2a1e]/85 via-[#0d2a1e]/30 to-transparent" aria-hidden />
        <div className="relative mx-auto w-full max-w-[1280px] px-5 pb-14 md:px-10 md:pb-20">
          <p className="text-[15px] font-bold text-white/80">내과, 재활의학과 전문의 진료</p>
          <h1 className="mt-4 text-[36px] font-bold leading-[1.24] tracking-[-0.045em] md:text-[60px]">
            수술 뒤 회복부터
            <br />
            일상으로 돌아가기까지
          </h1>
        </div>
      </section>

      <section className="px-5 md:px-10">
        <div className="mx-auto -mt-px grid max-w-[1280px] text-white sm:grid-cols-3" style={{ background: C.green }}>
          {[
            ["입원 상담", "031-000-0000"],
            ["상담 시간", "평일 09:00 ~ 18:00"],
            ["면회", "매일 10:00 ~ 20:00"],
          ].map(([k, v], i) => (
            <div key={k} className={`p-6 md:p-8 ${i ? "border-t border-white/15 sm:border-l sm:border-t-0" : ""}`}>
              <p className="text-[14px] text-white/65">{k}</p>
              <p className="text-[21px] font-bold tabular-nums">{v}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto grid max-w-[1280px] gap-10 md:grid-cols-[1fr_1.2fr] md:gap-16">
          <div>
            <h2 className="text-[30px] font-bold tracking-[-0.04em] md:text-[44px]">진료 과목</h2>
            <p className="mt-3" style={{ color: C.sub }}>전문의가 매일 회진하고, 야간에는 당직 의사가 병원에 있습니다.</p>
            <div className="relative mt-8 aspect-[4/3] overflow-hidden">
              <Image src={`${IMG}/a-room.jpg`} alt="창가 옆 정돈된 병실 침대" fill sizes="(min-width: 768px) 40vw, 100vw" className="object-cover" />
            </div>
          </div>
          <ul className="self-start border-t-2" style={{ borderColor: C.green }}>
            {DEPT.map(([t, d]) => (
              <li key={t} className="grid gap-1 border-b py-6 sm:grid-cols-[160px_1fr]" style={{ borderColor: C.line }}>
                <h3 className="text-[21px] font-bold tracking-[-0.03em]">{t}</h3>
                <p style={{ color: C.sub }}>{d}</p>
              </li>
            ))}
            <li className="grid gap-1 border-b py-6 sm:grid-cols-[160px_1fr]" style={{ borderColor: C.line }}>
              <h3 className="text-[21px] font-bold tracking-[-0.03em]">재활치료</h3>
              <p style={{ color: C.sub }}>물리치료, 작업치료, 연하치료. 평일 하루 2회, 치료사 1대1</p>
            </li>
          </ul>
        </div>
      </section>

      <section className="px-5 py-20 md:px-10 md:py-28" style={{ background: C.soft }}>
        <div className="mx-auto max-w-[1280px]">
          <h2 className="text-[30px] font-bold tracking-[-0.04em] md:text-[44px]">입원 절차</h2>
          <ol className="mt-10 grid gap-px md:grid-cols-4" style={{ background: C.line }}>
            {[
              ["전화 상담", "환자 상태, 현재 병원, 입원 희망일"],
              ["자료 확인", "진료의뢰서, 최근 검사 결과, 복용 약"],
              ["입원 결정", "병실과 간병 방식 안내"],
              ["입원", "전원 차량 연계, 당일 회진"],
            ].map(([k, v], i) => (
              <li key={k} className="bg-white p-7 md:p-8">
                <p className="text-[14px] font-bold tabular-nums" style={{ color: C.green }}>0{i + 1}</p>
                <p className="mt-3 text-[21px] font-bold tracking-[-0.03em]">{k}</p>
                <p className="mt-1 text-[15px]" style={{ color: C.sub }}>{v}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto grid max-w-[1280px] gap-10 md:grid-cols-[1fr_1.2fr] md:gap-16">
          <div>
            <h2 className="text-[30px] font-bold leading-[1.35] tracking-[-0.04em] md:text-[42px]">입원비는 이렇게 나뉩니다</h2>
            <p className="mt-4" style={{ color: C.sub }}>환자 상태에 따라 달라지므로 상담 때 예상 금액을 항목별로 안내합니다.</p>
          </div>
          <dl className="border-t-2" style={{ borderColor: C.ink }}>
            {[
              ["진료비", "건강보험 적용, 환자 분류군별 정액"],
              ["식대", "건강보험 적용, 치료식 포함"],
              ["간병비", "공동 간병 또는 개인 간병 선택"],
              ["비급여", "상급 병실료, 제증명 수수료"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 border-b py-5" style={{ borderColor: C.line }}>
                <dt className="font-bold">{k}</dt>
                <dd className="text-right" style={{ color: C.sub }}>{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <footer className="px-5 py-10 text-[14px] text-white/70 md:px-10" style={{ background: C.green }}>
        <div className="mx-auto flex max-w-[1280px] flex-col gap-2 md:flex-row md:justify-between">
          <p>푸른숲 요양병원, 경기도 남양주시 일대. 대표자 000, 요양병원 개설 신고 000</p>
          <p>입원 상담 031-000-0000</p>
        </div>
      </footer>
    </div>
  );
}
