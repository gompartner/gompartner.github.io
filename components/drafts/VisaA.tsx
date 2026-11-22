"use client";

import Image from "next/image";
import { ArrowRight, Building2, Clock } from "lucide-react";

// 출입국 행정사 시안 A 기업 외국인 고용형(11-22 사례 분석: 이미코리아처럼 비자 코드를 메뉴에 그대로, "법무부 등록 출입국 민원대행기관" 표기. 회사 인사 담당자는 어떤 비자로 뽑는지, 신고 기한을 놓치지 않는지 묻는다). 흰 바탕, 남색과 빨강. 인물 없음. 메인 한 장, 기능 없음.
// 사진: Unsplash 무료 라이선스(public/images/drafts/visa/a-*)
const IMG = "/images/drafts/visa";
const C = { ink: "#101827", sub: "#5a6475", line: "#e3e7ee", soft: "#f3f5f9", navy: "#13265a", red: "#d23b3b" };

const VISAS = [
  { c: "E-7", t: "특정활동", d: "전문 인력 채용, 고용 추천, 체류자격 변경" },
  { c: "D-8", t: "기업투자", d: "외국인 투자 법인 설립, 대표자 비자" },
  { c: "D-10", t: "구직", d: "졸업 유학생 구직 기간, E-7 전환 준비" },
  { c: "F-2-7", t: "점수제 거주", d: "장기 근속 인력의 거주 자격 변경" },
];

export function VisaA() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.75] md:text-[17px]" style={{ color: C.ink }}>
      <header className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur" style={{ borderColor: C.line }}>
        <div className="mx-auto flex h-[72px] max-w-[1280px] items-center justify-between px-5 md:px-10">
          <p className="text-[19px] font-bold tracking-[-0.02em]" style={{ color: C.navy }}>
            한누리 행정사사무소
          </p>
          <nav aria-label="주 메뉴" className="hidden gap-9 text-[15px] font-semibold lg:flex" style={{ color: "#3b4556" }}>
            {["기업 비자", "고용 신고", "법인 설립", "진행 절차", "문의"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </nav>
          <span className="inline-flex h-11 items-center px-5 text-[15px] font-bold text-white" style={{ background: C.red }}>
            채용 비자 문의
          </span>
        </div>
      </header>

      <section className="relative flex min-h-[600px] items-end overflow-hidden text-white md:min-h-[660px]">
        <Image src={`${IMG}/a-hero.jpg`} alt="한강 다리와 고층 빌딩이 보이는 서울 도심" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b1633]/90 via-[#0b1633]/45 to-[#0b1633]/10" aria-hidden />
        <div className="relative mx-auto w-full max-w-[1280px] px-5 pb-14 md:px-10 md:pb-20">
          <p className="text-[14px] font-bold tracking-[0.12em] text-white/75">법무부 등록 출입국 민원대행기관</p>
          <h1 className="mt-4 text-[36px] font-bold leading-[1.24] tracking-[-0.045em] md:text-[60px]">
            외국인 채용 비자,
            <br />
            회사 쪽 서류부터 맞춥니다
          </h1>
          <p className="mt-5 max-w-[540px] text-white/85">
            고용 사유서, 직무 내용, 급여 요건을 비자 기준에 맞춰 준비합니다. 출입국관리사무소 방문 접수와 보완 요청 대응까지 대신합니다.
          </p>
        </div>
      </section>

      <section className="px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-[1280px]">
          <h2 className="text-[30px] font-bold tracking-[-0.04em] md:text-[44px]">기업이 많이 찾는 비자</h2>
          <ul className="mt-10 grid gap-px sm:grid-cols-2 lg:grid-cols-4" style={{ background: C.line }}>
            {VISAS.map((v) => (
              <li key={v.c} className="flex flex-col bg-white p-7 md:p-8">
                <p className="text-[34px] font-bold tracking-[-0.03em]" style={{ color: C.navy }}>{v.c}</p>
                <h3 className="mt-1 text-[19px] font-bold">{v.t}</h3>
                <p className="mt-1 flex-1 text-[15px]" style={{ color: C.sub }}>{v.d}</p>
                <ArrowRight className="mt-7" size={20} aria-hidden />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-5 md:px-10" style={{ background: C.soft }}>
        <div className="mx-auto grid max-w-[1280px] items-center gap-10 py-20 md:grid-cols-2 md:gap-16 md:py-28">
          <div className="relative aspect-[4/3] overflow-hidden">
            <Image src={`${IMG}/a-office.jpg`} alt="유리 칸막이 사무실 사이 복도" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
          </div>
          <div>
            <p className="flex items-center gap-2 text-[15px] font-bold" style={{ color: C.red }}>
              <Clock size={17} aria-hidden /> 회사가 지켜야 할 신고 기한
            </p>
            <h2 className="mt-3 text-[28px] font-bold leading-[1.35] tracking-[-0.04em] md:text-[38px]">고용 변동 신고, 15일 안</h2>
            <dl className="mt-7 border-t" style={{ borderColor: C.ink }}>
              {[
                ["퇴사, 해고", "사유 발생을 안 날부터 15일 안"],
                ["근무처 변경", "변경 전 허가 또는 15일 안 신고"],
                ["외국인 등록", "입국한 날부터 90일 안"],
                ["체류기간 연장", "만료 전에 신청"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 border-b py-4" style={{ borderColor: C.line }}>
                  <dt className="font-semibold">{k}</dt>
                  <dd className="text-right" style={{ color: C.sub }}>{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-5 text-[15px]" style={{ color: C.sub }}>월 관리 계약 회사는 직원별 만료일을 미리 알려 드립니다.</p>
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto grid max-w-[1280px] gap-10 md:grid-cols-[1.2fr_1fr] md:gap-16">
          <div>
            <h2 className="text-[30px] font-bold tracking-[-0.04em] md:text-[42px]">E-7 채용 진행 순서</h2>
            <ol className="mt-10 grid gap-px sm:grid-cols-2" style={{ background: C.line }}>
              {[
                ["요건 검토", "직종 코드, 학력, 경력, 급여 기준"],
                ["회사 서류", "사업자, 납세, 고용보험 가입 현황"],
                ["사증 발급 인정 또는 자격 변경", "해외 채용은 인정서, 국내 유학생은 변경"],
                ["접수, 보완", "방문 접수, 보완 요청 대응"],
              ].map(([k, v], i) => (
                <li key={k} className="bg-white p-6 md:p-7">
                  <p className="text-[14px] font-bold tabular-nums" style={{ color: C.red }}>STEP {i + 1}</p>
                  <p className="mt-2 text-[19px] font-bold">{k}</p>
                  <p className="text-[15px]" style={{ color: C.sub }}>{v}</p>
                </li>
              ))}
            </ol>
          </div>
          <div className="flex flex-col justify-between gap-8 p-8 text-white md:p-10" style={{ background: C.navy }}>
            <div>
              <Building2 size={28} aria-hidden className="text-white/70" />
              <h3 className="mt-5 text-[24px] font-bold leading-[1.4] tracking-[-0.03em]">인사 담당자 전용 상담</h3>
              <p className="mt-3 text-white/70">채용 예정자 국적, 학력, 직무만 보내 주시면 가능한 비자와 준비 기간을 영업일 2일 안에 회신합니다.</p>
            </div>
            <div className="relative aspect-[16/9] overflow-hidden">
              <Image src={`${IMG}/a-desk.jpg`} alt="나무 벽과 대리석 안내 데스크가 있는 로비" fill sizes="(min-width: 768px) 35vw, 100vw" className="object-cover" />
            </div>
            <p className="text-[28px] font-bold tabular-nums">02-000-0000</p>
          </div>
        </div>
      </section>

      <footer className="border-t px-5 py-10 text-[14px] md:px-10" style={{ borderColor: C.line, color: C.sub }}>
        <div className="mx-auto flex max-w-[1280px] flex-col gap-2 md:flex-row md:justify-between">
          <p>한누리 행정사사무소, 서울특별시 영등포구 일대. 행정사, 출입국 민원대행기관 등록번호 000</p>
          <p>02-000-0000</p>
        </div>
      </footer>
    </div>
  );
}
