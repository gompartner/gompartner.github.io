"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";

// 변리사 시안 A 기술 특허형(11-22 사례 분석: 상상특허, 유원처럼 업무를 특허, 상표, 디자인, 심판으로 나누지만 창업자가 묻는 "얼마나 걸리나, 비용은 무엇으로 이뤄지나"는 비어 있다). 흰 바탕, 남청. 인물 없음. 메인 한 장, 기능 없음.
// 사진: Unsplash 무료 라이선스(public/images/drafts/pat/a-*)
const IMG = "/images/drafts/pat";
const C = { ink: "#0f1a2a", sub: "#5a6576", line: "#e2e7ee", soft: "#f2f5f9", blue: "#14407a", teal: "#0f8a8a" };

const AREAS = [
  { e: "PATENT", t: "특허와 실용신안", d: "전자, 기계, 소프트웨어, 바이오" },
  { e: "DESIGN", t: "디자인", d: "제품 외관, 화면 디자인(GUI)" },
  { e: "TRADEMARK", t: "상표", d: "브랜드명, 로고, 해외 출원" },
  { e: "DISPUTE", t: "심판과 소송", d: "무효심판, 권리범위확인, 침해 경고 대응" },
];

export function PatA() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.75] md:text-[17px]" style={{ color: C.ink }}>
      <header className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur" style={{ borderColor: C.line }}>
        <div className="mx-auto flex h-[72px] max-w-[1280px] items-center justify-between px-5 md:px-10">
          <p className="text-[19px] font-bold tracking-[-0.02em]" style={{ color: C.blue }}>
            새벽 특허법률사무소
          </p>
          <nav aria-label="주 메뉴" className="hidden gap-9 text-[15px] font-semibold lg:flex" style={{ color: "#3b4657" }}>
            {["업무 분야", "출원 절차", "비용 안내", "구성원", "상담"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </nav>
          <span className="inline-flex h-11 items-center px-5 text-[15px] font-bold text-white" style={{ background: C.blue }}>
            출원 상담
          </span>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-[1280px] lg:grid-cols-[1fr_1.1fr]">
          <div className="px-5 py-14 md:px-10 md:py-24">
            <p className="text-[14px] font-bold tracking-[0.18em]" style={{ color: C.teal }}>PATENT &amp; IP</p>
            <h1 className="mt-5 text-[36px] font-bold leading-[1.24] tracking-[-0.045em] md:text-[56px]">
              기술을 공개하기 전에,
              <br />
              출원부터 하십시오
            </h1>
            <p className="mt-6 max-w-[480px] text-[17px]" style={{ color: C.sub }}>
              투자 설명회, 전시회, 논문 발표 전에 출원해야 권리를 지킬 수 있습니다. 공학 전공 변리사가 기술 미팅부터 명세서 작성까지 직접 맡습니다.
            </p>
            <dl className="mt-10 grid max-w-[480px] grid-cols-3 border-t pt-6" style={{ borderColor: C.line }}>
              {[
                ["전기전자", "반도체와 통신"],
                ["기계", "장비와 부품"],
                ["SW", "플랫폼과 AI"],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-[19px] font-bold" style={{ color: C.blue }}>{k}</dt>
                  <dd className="text-[14px]" style={{ color: C.sub }}>{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="relative min-h-[300px] lg:min-h-[600px]">
            <Image src={`${IMG}/a-hero.jpg`} alt="현미경과 분석 장비가 놓인 밝은 실험실" fill priority sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-10 md:py-28" style={{ background: C.soft }}>
        <div className="mx-auto max-w-[1280px]">
          <h2 className="text-[30px] font-bold tracking-[-0.04em] md:text-[44px]">업무 분야</h2>
          <ul className="mt-10 grid gap-px sm:grid-cols-2 lg:grid-cols-4" style={{ background: C.line }}>
            {AREAS.map((a) => (
              <li key={a.t} className="flex flex-col bg-white p-7 md:p-8">
                <h3 className="text-[22px] font-bold tracking-[-0.03em]">{a.t}</h3>
                <p className="mt-1 flex-1 text-[15px]" style={{ color: C.sub }}>{a.d}</p>
                <ArrowRight className="mt-8" size={20} aria-hidden />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto grid max-w-[1280px] gap-12 md:grid-cols-[1fr_1.2fr] md:gap-16">
          <div>
            <h2 className="text-[30px] font-bold leading-[1.35] tracking-[-0.04em] md:text-[42px]">특허 출원부터 등록까지</h2>
            <p className="mt-4" style={{ color: C.sub }}>일반 심사는 출원 뒤 1년 안팎이 걸립니다. 투자나 공공 입찰 일정이 있으면 우선심사로 앞당깁니다.</p>
            <div className="relative mt-8 aspect-[4/3] overflow-hidden">
              <Image src={`${IMG}/a-parts.jpg`} alt="설계 도면 위에 놓인 금속 기계 부품 두 개" fill sizes="(min-width: 768px) 40vw, 100vw" className="object-cover" />
            </div>
          </div>
          <ol className="self-start border-t-2" style={{ borderColor: C.blue }}>
            {[
              ["기술 미팅", "1주", "발명 내용 청취, 선행기술 조사"],
              ["명세서 작성", "2 ~ 4주", "청구항 설계, 도면 작성, 발명자 검토"],
              ["출원", "당일", "출원번호 발급, 특허 출원 중 표시 가능"],
              ["심사와 의견 대응", "10 ~ 14개월", "의견제출통지서 대응, 보정"],
              ["등록", "등록 결정 후", "등록료 납부, 특허증 발급"],
            ].map(([k, p, v], i) => (
              <li key={k} className="grid grid-cols-[40px_1fr] gap-2 border-b py-5 sm:grid-cols-[48px_1fr_auto]" style={{ borderColor: C.line }}>
                <span className="text-[15px] font-bold tabular-nums" style={{ color: C.teal }}>0{i + 1}</span>
                <div>
                  <p className="text-[19px] font-bold">{k}</p>
                  <p className="text-[15px]" style={{ color: C.sub }}>{v}</p>
                </div>
                <span className="col-start-2 text-[15px] font-bold tabular-nums sm:col-start-3" style={{ color: C.blue }}>{p}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="px-5 md:px-10" style={{ background: C.blue }}>
        <div className="mx-auto grid max-w-[1280px] items-center gap-10 py-20 text-white md:grid-cols-2 md:gap-16 md:py-28">
          <div>
            <h2 className="text-[28px] font-bold leading-[1.35] tracking-[-0.04em] md:text-[38px]">비용은 두 가지로 나뉩니다</h2>
            <ul className="mt-8 grid gap-3">
              {[
                ["관납료", "특허청에 내는 출원료, 심사청구료, 등록료"],
                ["대리인 수수료", "명세서 작성, 의견 대응, 등록 절차"],
                ["감면", "개인, 중소기업은 관납료 감면 대상입니다"],
              ].map(([k, v]) => (
                <li key={k} className="border-b border-white/20 pb-3">
                  <p className="font-bold">{k}</p>
                  <p className="text-[15px] text-white/70">{v}</p>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-[15px] text-white/70">견적서에 두 항목을 나눠 적고, 관납료는 특허청 영수증으로 확인하실 수 있습니다.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="relative aspect-[3/4] overflow-hidden">
              <Image src={`${IMG}/a-chip.jpg`} alt="부품이 촘촘한 전자 회로 기판" fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
            </div>
            <div className="relative aspect-[3/4] overflow-hidden">
              <Image src={`${IMG}/a-proto.jpg`} alt="회로도 위에 놓인 시제품 장치" fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t px-5 py-10 text-[14px] md:px-10" style={{ borderColor: C.line, color: C.sub }}>
        <div className="mx-auto flex max-w-[1280px] flex-col gap-2 md:flex-row md:justify-between">
          <p>새벽 특허법률사무소, 서울특별시 강남구 일대. 대표 변리사, 사업자등록번호 000-00-00000</p>
          <p>02-000-0000</p>
        </div>
      </footer>
    </div>
  );
}
