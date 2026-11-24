"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";

// 시험인증기관 시안 A 인증 안내형(11-22 사례 분석: KEC인증원처럼 주요 지표 카드, 인증포럼처럼 인증 절차를 체계적으로. 제조사, 수입사 담당자는 국내 KC, 해외 CE, FCC 중 무엇이 필요한지, 기간과 준비 서류를 묻는다). 흰 바탕, 남색과 청록. 인물 없음. 메인 한 장, 기능 없음.
// 사진: Unsplash 무료 라이선스(public/images/drafts/ce/a-*)
const IMG = "/images/drafts/ce";
const C = { ink: "#0f1722", sub: "#5a6473", line: "#e1e6ed", soft: "#f1f4f8", navy: "#16325c", teal: "#0e8a7e" };

const CERTS = [
  ["KC 전자파적합성", "국내", "전기, 전자제품 판매 전 필수", "4 ~ 6주"],
  ["KC 전기안전", "국내", "가정용 전기용품 안전 인증", "6 ~ 8주"],
  ["CE", "유럽", "EMC, LVD, RED 지침 시험", "4 ~ 8주"],
  ["FCC", "미국", "무선, 디지털 기기 전자파", "4 ~ 6주"],
  ["PSE, VCCI", "일본", "전기용품 안전, 전자파", "6 ~ 10주"],
];

export function CeA() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.75] md:text-[17px]" style={{ color: C.ink }}>
      <header className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur" style={{ borderColor: C.line }}>
        <div className="mx-auto flex h-[72px] max-w-[1320px] items-center justify-between px-5 md:px-10">
          <p className="text-[18px] font-bold tracking-[-0.02em]">
            한국<span style={{ color: C.teal }}>테스트</span>인증원
          </p>
          <nav aria-label="주 메뉴" className="hidden gap-9 text-[15px] font-semibold lg:flex" style={{ color: "#424b59" }}>
            {["국내 인증", "해외 인증", "시험 분야", "성적서 확인", "견적문의"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </nav>
          <span className="inline-flex h-11 items-center px-5 text-[15px] font-bold text-white" style={{ background: C.navy }}>
            견적문의
          </span>
        </div>
      </header>

      <section className="px-5 pb-16 pt-10 md:px-10 md:pb-24 md:pt-14">
        <div className="mx-auto grid max-w-[1320px] items-center gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-14">
          <div>
            <p className="text-[14px] font-bold tracking-[0.2em]" style={{ color: C.teal }}>TESTING &amp; CERTIFICATION</p>
            <h1 className="mt-4 text-[36px] font-bold leading-[1.24] tracking-[-0.045em] md:text-[58px]">
              수출할 나라를 알려 주시면
              <br />
              필요한 인증을 정리합니다
            </h1>
            <p className="mt-5 max-w-[480px] text-[17px]" style={{ color: C.sub }}>
              KOLAS 공인 시험기관. 전자파, 전기안전, 무선 시험을 한곳에서 하고 국내외 인증 서류까지 대행합니다.
            </p>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden">
            <Image src={`${IMG}/a-hero.jpg`} alt="현미경과 분석 장비가 놓인 흰 실험실" fill priority sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-10 md:py-28" style={{ background: C.soft }}>
        <div className="mx-auto max-w-[1320px]">
          <h2 className="text-[30px] font-bold tracking-[-0.04em] md:text-[44px]">국내와 해외 인증</h2>
          <ul className="mt-10 bg-white">
            <li className="hidden grid-cols-[1.2fr_0.5fr_1.8fr_0.6fr] gap-4 border-b px-6 py-4 text-[14px] font-semibold md:grid" style={{ borderColor: C.line, color: C.sub }}>
              <span>인증</span>
              <span>지역</span>
              <span>대상</span>
              <span>기간</span>
            </li>
            {CERTS.map(([t, r, d, w]) => (
              <li key={t} className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 border-b px-6 py-4 last:border-b-0 md:grid-cols-[1.2fr_0.5fr_1.8fr_0.6fr] md:items-center" style={{ borderColor: C.line }}>
                <span className="text-[18px] font-bold">{t}</span>
                <span className="text-right font-bold md:text-left" style={{ color: C.teal }}>{r}</span>
                <span className="text-[15px] md:text-[16px]" style={{ color: C.sub }}>{d}</span>
                <span className="text-right font-semibold tabular-nums md:text-left">{w}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[15px]" style={{ color: C.sub }}>기간은 시료 접수부터 인증서 발급까지 기준이며, 제품 수정이 생기면 늘어납니다.</p>
        </div>
      </section>

      <section className="px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto grid max-w-[1320px] items-center gap-10 md:grid-cols-2 md:gap-16">
          <div className="grid grid-cols-2 gap-3">
            <div className="relative aspect-[3/4] overflow-hidden">
              <Image src={`${IMG}/a-board.jpg`} alt="부품이 빼곡한 파란 회로 기판" fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
            </div>
            <div className="relative aspect-[3/4] overflow-hidden">
              <Image src={`${IMG}/a-pcb.jpg`} alt="초록 인쇄회로기판 확대" fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
            </div>
          </div>
          <div>
            <h2 className="text-[28px] font-bold leading-[1.35] tracking-[-0.04em] md:text-[38px]">인증 진행 순서</h2>
            <ol className="mt-7 grid gap-4">
              {[
                ["상담과 견적", "제품 사양서로 필요한 인증 확인"],
                ["시료 접수", "시료 2대, 회로도, 부품 목록"],
                ["시험", "전자파 챔버, 안전 시험실"],
                ["성적서와 인증서", "시험성적서 발행, 인증기관 접수 대행"],
              ].map(([k, v], i) => (
                <li key={k} className="flex gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center text-[15px] font-bold text-white" style={{ background: C.teal }}>{i + 1}</span>
                  <div>
                    <p className="text-[18px] font-bold">{k}</p>
                    <p className="text-[15px]" style={{ color: C.sub }}>{v}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="px-5 pb-20 md:px-10 md:pb-28">
        <div className="mx-auto grid max-w-[1320px] gap-4 md:grid-cols-2">
          <div className="border p-8 md:p-10" style={{ borderColor: C.line }}>
            <h2 className="text-[24px] font-bold tracking-[-0.04em] md:text-[30px]">성적서 진위확인</h2>
            <p className="mt-3" style={{ color: C.sub }}>성적서 오른쪽 위 발행번호와 발행일로 확인합니다. 거래처에서 확인을 요청하면 품질팀이 메일로 회신합니다.</p>
            <p className="mt-5 inline-flex items-center gap-1.5 font-bold" style={{ color: C.navy }}>
              진위확인 요청 <ArrowRight size={17} aria-hidden />
            </p>
          </div>
          <div className="flex flex-col justify-between gap-8 p-8 text-white md:p-10" style={{ background: C.navy }}>
            <div>
              <h2 className="text-[24px] font-bold tracking-[-0.04em] md:text-[30px]">견적문의</h2>
              <p className="mt-3 text-white/75">제품명, 정격 전압, 무선 기능 여부, 수출 국가를 알려 주시면 하루 안에 견적을 드립니다.</p>
            </div>
            <p className="text-[28px] font-bold tabular-nums">031-000-0000</p>
          </div>
        </div>
      </section>

      <footer className="border-t px-5 py-10 text-[14px] md:px-10" style={{ borderColor: C.line, color: C.sub }}>
        <div className="mx-auto flex max-w-[1320px] flex-col gap-2 md:flex-row md:justify-between">
          <p>(주)한국테스트인증원, 경기도 군포시 일대. KOLAS 인정번호 KT000</p>
          <p>031-000-0000</p>
        </div>
      </footer>
    </div>
  );
}
