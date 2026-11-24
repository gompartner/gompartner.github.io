"use client";

import Image from "next/image";
import { ArrowRight, Clock } from "lucide-react";

// 법무사 시안 B 개인회생, 파산, 상속 상담형(11-22 사례 분석: 법률사무소 열처럼 사건별 칸과 버튼. 이 손님은 "내가 신청할 수 있는지"와 "기한"을 먼저 찾는다). 흰 바탕, 짙은 청색. 인물 없음. 메인 한 장, 기능 없음.
// 사진: Unsplash 무료 라이선스(public/images/drafts/scr/b-*)
const IMG = "/images/drafts/scr";
const C = { ink: "#141a26", sub: "#5c6474", line: "#e3e6ef", soft: "#f3f4f9", blue: "#34488c", blueSoft: "#e8ebf6", orange: "#c8572b" };

const CASES = [
  { t: "개인회생", d: "무담보 채무 10억 원, 담보 채무 15억 원 이하이고 매달 일정한 소득이 있는 분", due: "변제 기간 3년 원칙" },
  { t: "개인파산과 면책", d: "소득과 재산으로 빚을 갚기 어려운 분. 파산과 면책을 함께 신청합니다", due: "면책 결정까지 6개월 안팎" },
  { t: "상속포기와 한정승인", d: "돌아가신 분의 빚이 재산보다 많거나 정확히 모를 때", due: "상속을 안 날부터 3개월 안" },
];

export function ScrB() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.75] md:text-[17px]" style={{ color: C.ink }}>
      <header className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur" style={{ borderColor: C.line }}>
        <div className="mx-auto flex h-[70px] max-w-[1200px] items-center justify-between px-5 md:px-8">
          <p className="text-[20px] font-bold tracking-[-0.03em]">
            <span style={{ color: C.blue }}>새길</span> 법무사사무소
          </p>
          <nav aria-label="주 메뉴" className="hidden gap-9 text-[15px] font-semibold lg:flex" style={{ color: "#3d4453" }}>
            {["개인회생", "파산과 면책", "상속", "준비 서류"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </nav>
          <span className="inline-flex h-11 items-center rounded-full px-5 text-[15px] font-bold text-white" style={{ background: C.blue }}>
            상담 신청
          </span>
        </div>
      </header>

      <section className="px-5 pb-16 pt-10 md:px-8 md:pb-24 md:pt-14">
        <div className="mx-auto max-w-[1200px]">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[28px] md:aspect-[21/9]">
            <Image src={`${IMG}/b-hero.jpg`} alt="밝은 창가 회의실의 검은 의자들" fill priority sizes="100vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" aria-hidden />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white md:p-12">
              <p className="text-[15px] font-bold text-white/80">개인회생, 파산, 상속 서류 작성</p>
              <h1 className="mt-3 text-[32px] font-bold leading-[1.25] tracking-[-0.045em] md:text-[56px]">
                빚 정리, 신청 가능한지
                <br />
                먼저 확인해 드립니다
              </h1>
            </div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-[1.5fr_1fr]">
            <p className="rounded-[22px] p-6 md:p-7" style={{ background: C.blueSoft, color: "#2c3550" }}>
              첫 상담에서는 채무 목록과 소득만 봅니다. 신청 요건에 맞는지, 어떤 절차가 맞는지 말씀드리고 비용은 그다음에 안내합니다.
            </p>
            <div className="flex flex-col justify-center rounded-[22px] p-6 text-white md:p-7" style={{ background: C.blue }}>
              <p className="text-[15px] font-bold text-white/75">상담 전화</p>
              <p className="text-[30px] font-bold tabular-nums tracking-[-0.02em]">031-000-0000</p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28" style={{ background: C.soft }}>
        <div className="mx-auto max-w-[1200px]">
          <h2 className="text-[30px] font-bold tracking-[-0.04em] md:text-[44px]">어떤 절차가 맞을까요</h2>
          <ul className="mt-10 grid gap-4 md:grid-cols-3">
            {CASES.map((c) => (
              <li key={c.t} className="flex flex-col rounded-[24px] bg-white p-7 md:p-8">
                <h3 className="text-[24px] font-bold tracking-[-0.03em]">{c.t}</h3>
                <p className="mt-2 flex-1" style={{ color: C.sub }}>{c.d}</p>
                <p className="mt-6 flex items-center gap-2 text-[15px] font-bold" style={{ color: C.orange }}>
                  <Clock size={16} aria-hidden /> {c.due}
                </p>
                <p className="mt-4 inline-flex items-center gap-1.5 border-t pt-4 text-[15px] font-bold" style={{ borderColor: C.line, color: C.blue }}>
                  자세히 보기 <ArrowRight size={16} aria-hidden />
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto grid max-w-[1200px] items-center gap-10 md:grid-cols-[1.1fr_1fr] md:gap-16">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[24px]">
            <Image src={`${IMG}/b-desk.jpg`} alt="나무 책상 위의 노트북과 서류" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
          </div>
          <div>
            <h2 className="text-[28px] font-bold leading-[1.35] tracking-[-0.04em] md:text-[38px]">개인회생 진행 순서</h2>
            <ol className="mt-8 grid gap-5">
              {[
                ["서류 준비", "1 ~ 2주, 소득과 재산 자료 발급"],
                ["신청서 접수", "관할 회생법원, 금지명령 함께 신청"],
                ["개시 결정", "접수 후 1 ~ 2개월, 변제 시작"],
                ["채권자 집회, 인가", "변제 계획 인가 후 3년 납부"],
              ].map(([k, v], i) => (
                <li key={k} className="flex gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[15px] font-bold text-white" style={{ background: C.blue }}>{i + 1}</span>
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

      <section className="px-5 pb-20 md:px-8 md:pb-28">
        <div className="mx-auto grid max-w-[1200px] gap-8 rounded-[28px] p-7 md:grid-cols-[1fr_1.2fr] md:p-12" style={{ background: C.soft }}>
          <div>
            <h2 className="text-[26px] font-bold leading-[1.35] tracking-[-0.04em] md:text-[34px]">상담 때 가져오실 것</h2>
            <p className="mt-3 text-[15px]" style={{ color: C.sub }}>없는 서류는 상담 뒤 발급 방법을 알려 드립니다.</p>
            <div className="relative mt-6 hidden aspect-[4/3] overflow-hidden rounded-[20px] md:block">
              <Image src={`${IMG}/b-note.jpg`} alt="종이 위에 놓인 만년필" fill sizes="35vw" className="object-cover" />
            </div>
          </div>
          <ul className="grid content-start gap-3">
            {[
              ["채무 목록", "카드사, 은행, 대부업체별 남은 금액"],
              ["소득 자료", "최근 1년 급여명세서 또는 소득금액증명"],
              ["재산 자료", "임대차계약서, 자동차등록증, 보험 해지환급금"],
              ["가족관계", "주민등록등본과 가족관계증명서"],
            ].map(([k, v]) => (
              <li key={k} className="rounded-[18px] bg-white p-5">
                <p className="font-bold">{k}</p>
                <p className="text-[15px]" style={{ color: C.sub }}>{v}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <footer className="border-t px-5 py-10 text-[14px] md:px-8" style={{ borderColor: C.line, color: C.sub }}>
        <div className="mx-auto flex max-w-[1200px] flex-col gap-2 md:flex-row md:justify-between">
          <p>새길 법무사사무소, 경기도 수원시 영통구 일대. 법무사, 사업자등록번호 000-00-00000</p>
          <p>평일 09:00 ~ 18:00, 031-000-0000</p>
        </div>
      </footer>
    </div>
  );
}
