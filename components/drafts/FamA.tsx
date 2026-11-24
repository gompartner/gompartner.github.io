"use client";

import Image from "next/image";
import { Lock } from "lucide-react";

// 이혼 법률사무소 시안 A 이혼 절차형(11-22 사례 분석: 태한처럼 "가사사건은 심리 상태가 중요" 같은 차분한 첫 문장, 업무 카드. 처음 오는 분은 협의와 재판 중 무엇이 맞는지, 얼마나 걸리는지 묻는다. 변호사 광고 규정상 전문, 승소율 표기 없음). 흰 바탕, 짙은 남색. 인물 없음. 메인 한 장, 기능 없음.
// 사진: Unsplash 무료 라이선스(public/images/drafts/fam/a-*)
const IMG = "/images/drafts/fam";
const C = { ink: "#161b26", sub: "#5f6676", line: "#e5e7ee", soft: "#f4f5f8", navy: "#24304f", sand: "#b89b72" };

export function FamA() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.75] md:text-[17px]" style={{ color: C.ink }}>
      <header className="absolute inset-x-0 z-20 text-white">
        <div className="mx-auto flex h-[76px] max-w-[1280px] items-center justify-between px-5 md:px-10">
          <p className="text-[19px] font-bold tracking-[-0.02em]">법률사무소 서윤</p>
          <nav aria-label="주 메뉴" className="hidden gap-9 text-[15px] font-medium text-white/85 lg:flex">
            {["이혼 절차", "재산분할", "양육", "상담 안내"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </nav>
          <span className="inline-flex h-10 items-center border border-white/70 px-5 text-[14px] font-bold">비공개 상담</span>
        </div>
      </header>

      <section className="relative flex min-h-[620px] items-center overflow-hidden text-white md:min-h-[680px]">
        <Image src={`${IMG}/a-hero.jpg`} alt="창가 햇빛이 드는 조용한 거실" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(18,24,42,0.88) 0%, rgba(18,24,42,0.6) 55%, rgba(18,24,42,0.25) 100%)" }} aria-hidden />
        <div className="relative mx-auto w-full max-w-[1280px] px-5 py-24 md:px-10">
          <p className="text-[15px] font-bold" style={{ color: C.sand }}>이혼과 가사 사건</p>
          <h1 className="mt-5 text-[36px] font-bold leading-[1.26] tracking-[-0.045em] md:text-[60px]">
            결정은 천천히,
            <br />
            준비는 정확하게
          </h1>
          <p className="mt-6 max-w-[500px] text-[16px] text-white/85 md:text-[18px]">
            이혼을 결심하지 않으셨어도 상담할 수 있습니다. 지금 상황에서 할 수 있는 것과 미리 모아 둘 자료부터 말씀드립니다.
          </p>
        </div>
      </section>

      <section className="px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-[1280px]">
          <h2 className="text-[30px] font-bold tracking-[-0.04em] md:text-[44px]">협의이혼과 재판이혼</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {[
              {
                t: "협의이혼",
                s: "두 분이 이혼과 조건에 합의한 경우",
                rows: [
                  ["진행", "가정법원에 함께 신청, 안내 수강"],
                  ["숙려 기간", "자녀 있으면 3개월, 없으면 1개월"],
                  ["변호사 역할", "재산분할, 양육 합의서 검토"],
                ],
              },
              {
                t: "재판이혼",
                s: "합의가 안 되거나 상대가 응하지 않는 경우",
                rows: [
                  ["진행", "소장 접수, 조정, 변론"],
                  ["기간", "사건에 따라 6개월 ~ 1년 이상"],
                  ["변호사 역할", "소송 대리, 증거 정리, 조정 출석"],
                ],
              },
            ].map((x) => (
              <div key={x.t} className="border-t-2 p-1 pt-6" style={{ borderColor: C.navy }}>
                <h3 className="text-[24px] font-bold tracking-[-0.03em]">{x.t}</h3>
                <p className="mt-1" style={{ color: C.sub }}>{x.s}</p>
                <dl className="mt-6">
                  {x.rows.map(([k, v]) => (
                    <div key={k} className="grid gap-1 border-b py-4 sm:grid-cols-[120px_1fr]" style={{ borderColor: C.line }}>
                      <dt className="font-bold">{k}</dt>
                      <dd style={{ color: C.sub }}>{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 md:px-10" style={{ background: C.soft }}>
        <div className="mx-auto grid max-w-[1280px] items-center gap-10 py-20 md:grid-cols-2 md:gap-16 md:py-28">
          <div className="relative aspect-[4/3] overflow-hidden">
            <Image src={`${IMG}/a-cups.jpg`} alt="햇살 드는 나무 탁자 위 김이 오르는 머그잔 두 개" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
          </div>
          <div>
            <h2 className="text-[28px] font-bold leading-[1.35] tracking-[-0.04em] md:text-[38px]">주요 쟁점</h2>
            <ul className="mt-7 grid gap-3">
              {[
                ["재산분할", "혼인 중 함께 모은 재산, 기여도"],
                ["위자료", "혼인 파탄에 책임 있는 쪽에 청구"],
                ["친권과 양육권", "자녀의 나이, 양육 환경, 자녀 의사"],
                ["양육비와 면접교섭", "산정기준표, 만나는 날과 방법"],
              ].map(([k, v]) => (
                <li key={k} className="grid gap-1 border-b pb-3 sm:grid-cols-[150px_1fr]" style={{ borderColor: C.line }}>
                  <span className="font-bold">{k}</span>
                  <span style={{ color: C.sub }}>{v}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto grid max-w-[1280px] overflow-hidden md:grid-cols-[1.1fr_1fr]" style={{ background: C.navy }}>
          <div className="p-8 text-white md:p-12">
            <p className="flex items-center gap-2 text-[15px] font-bold" style={{ color: C.sand }}>
              <Lock size={17} aria-hidden /> 비공개 상담
            </p>
            <h2 className="mt-4 text-[26px] font-bold leading-[1.35] tracking-[-0.04em] md:text-[34px]">상담 내용은 밖으로 나가지 않습니다</h2>
            <ul className="mt-6 grid gap-2.5 text-white/80">
              <li>상담실은 독립된 방에서 변호사가 직접 진행합니다</li>
              <li>문자와 전화는 원하시는 번호, 시간에만 드립니다</li>
              <li>퇴근 뒤 평일 21:00까지 상담 가능합니다</li>
            </ul>
            <p className="mt-8 text-[30px] font-bold tabular-nums tracking-[-0.02em]">02-000-0000</p>
          </div>
          <div className="relative min-h-[280px]">
            <Image src={`${IMG}/a-room.jpg`} alt="스탠드 조명이 켜진 차분한 방의 소파" fill sizes="(min-width: 768px) 45vw, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      <footer className="border-t px-5 py-10 text-[14px] md:px-10" style={{ borderColor: C.line, color: C.sub }}>
        <div className="mx-auto flex max-w-[1280px] flex-col gap-2 md:flex-row md:justify-between">
          <p>법률사무소 서윤, 서울특별시 서초구 일대. 변호사, 광고 책임 변호사 000</p>
          <p>02-000-0000</p>
        </div>
      </footer>
    </div>
  );
}
