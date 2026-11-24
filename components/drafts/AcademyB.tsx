"use client";

import Image from "next/image";
import { ArrowRight, Bus, ClipboardCheck, MessageSquareText } from "lucide-react";

// 학원 시안 B 동네 초중등형(11-21). 학부모 눈높이로 학년별 반, 레벨테스트, 시간표, 셔틀을 먼저 보여 준다. 흰 바탕, 초록 포인트. 메인 한 장, 기능 없음.
// 사진: Unsplash 무료 라이선스(public/images/drafts/aca/b-*)
const IMG = "/images/drafts/aca";
const C = { ink: "#17201b", sub: "#5f6a64", line: "#e3e8e5", soft: "#f3f7f4", green: "#13a06f", greenSoft: "#e3f5ec", orange: "#ff8a3d" };

const TIMES = [
  { g: "초등 3~4학년", m: "월, 수, 금 15:00 ~ 16:30", e: "화, 목 15:00 ~ 16:30" },
  { g: "초등 5~6학년", m: "월, 수, 금 16:40 ~ 18:10", e: "화, 목 16:40 ~ 18:10" },
  { g: "중등 1~2학년", m: "월, 수, 금 18:30 ~ 20:30", e: "화, 목 18:30 ~ 20:30" },
  { g: "중등 3학년", m: "월, 수, 금 20:30 ~ 22:00", e: "화, 목 20:30 ~ 22:00" },
];

export function AcademyB() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.75] md:text-[17px]" style={{ color: C.ink }}>
      <header className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur" style={{ borderColor: C.line }}>
        <div className="mx-auto flex h-[70px] max-w-[1200px] items-center justify-between px-5 md:px-8">
          <p className="text-[20px] font-bold tracking-[-0.03em]">다올수학영어학원</p>
          <nav aria-label="주 메뉴" className="hidden gap-9 text-[15px] font-semibold lg:flex" style={{ color: "#3c4641" }}>
            {["학원 소개", "반 안내", "시간표", "교습비", "셔틀 노선"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </nav>
          <span className="inline-flex h-11 items-center rounded-full px-5 text-[15px] font-bold text-white" style={{ background: C.green }}>
            레벨테스트 예약
          </span>
        </div>
      </header>

      <section className="px-5 pb-16 pt-12 md:px-8 md:pb-24 md:pt-16">
        <div className="mx-auto grid max-w-[1200px] items-center gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <div>
            <p className="text-[15px] font-bold" style={{ color: C.green }}>초등 3학년 ~ 중등 3학년</p>
            <h1 className="mt-4 text-[38px] font-bold leading-[1.22] tracking-[-0.045em] md:text-[62px]">
              우리 아이 진도,
              <br />
              매주 문자로 확인하세요
            </h1>
            <p className="mt-6 max-w-[480px] text-[17px] md:text-[19px]" style={{ color: C.sub }}>
              숙제 완료, 단원 테스트 점수, 다음 주 진도를 매주 금요일에 보내 드립니다. 한 반 8명, 선생님이 아이 이름을 모두 압니다.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <span className="inline-flex h-[56px] items-center gap-2 rounded-full px-8 text-[17px] font-bold text-white" style={{ background: C.green }}>
                무료 레벨테스트 예약
                <ArrowRight size={18} aria-hidden />
              </span>
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[28px]">
            <Image src={`${IMG}/b-class.jpg`} alt="햇빛이 드는 밝은 교실" fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="px-5 py-16 md:px-8 md:py-20" style={{ background: C.soft }}>
        <ul className="mx-auto grid max-w-[1200px] gap-4 md:grid-cols-3">
          {[
            { I: ClipboardCheck, t: "레벨테스트 후 반 배정", d: "40분 테스트와 상담으로 학년이 아닌 실력에 맞는 반을 찾습니다." },
            { I: MessageSquareText, t: "매주 학습 리포트", d: "출결, 숙제, 테스트 점수를 금요일마다 문자로 보내 드립니다." },
            { I: Bus, t: "셔틀 3개 노선", d: "아파트 단지마다 정류장이 있고, 승하차를 문자로 알려 드립니다." },
          ].map(({ I, t, d }) => (
            <li key={t} className="rounded-[22px] bg-white p-8">
              <span className="flex h-12 w-12 items-center justify-center rounded-[14px]" style={{ background: C.greenSoft, color: C.green }}>
                <I size={24} aria-hidden />
              </span>
              <h3 className="mt-6 text-[21px] font-bold tracking-[-0.03em]">{t}</h3>
              <p className="mt-2 text-[15px]" style={{ color: C.sub }}>{d}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-[1200px]">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <h2 className="text-[30px] font-bold tracking-[-0.04em] md:text-[44px]">학년별 시간표</h2>
            <p className="text-[15px]" style={{ color: C.sub }}>교습비는 교육청 등록 금액으로, 학원 게시표와 같습니다.</p>
          </div>
          <div className="mt-10 overflow-hidden rounded-[22px] border" style={{ borderColor: C.line }}>
            <div className="hidden grid-cols-[1fr_1.3fr_1.3fr] px-7 py-4 text-[14px] font-bold md:grid" style={{ background: C.soft, color: C.sub }}>
              <span>학년</span>
              <span>수학</span>
              <span>영어</span>
            </div>
            {TIMES.map((t) => (
              <div key={t.g} className="grid gap-1 border-t px-7 py-5 md:grid-cols-[1fr_1.3fr_1.3fr] md:gap-0" style={{ borderColor: C.line }}>
                <span className="text-[18px] font-bold">{t.g}</span>
                <span className="tabular-nums"><span className="mr-2 text-[13px] font-bold md:hidden" style={{ color: C.green }}>수학</span>{t.m}</span>
                <span className="tabular-nums"><span className="mr-2 text-[13px] font-bold md:hidden" style={{ color: C.orange }}>영어</span>{t.e}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 pb-20 md:px-8 md:pb-28">
        <div className="mx-auto grid max-w-[1200px] items-center gap-10 md:grid-cols-2 md:gap-16">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[28px]">
            <Image src={`${IMG}/b-desk.jpg`} alt="책과 공책이 놓인 밝은 공부 책상" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
          </div>
          <div>
            <h2 className="text-[28px] font-bold leading-[1.35] tracking-[-0.04em] md:text-[40px]">상담은 이렇게 진행됩니다</h2>
            <ol className="mt-8 grid gap-4">
              {["전화나 문자로 레벨테스트 예약", "40분 레벨테스트와 학습 습관 상담", "반 배정과 첫 수업 일정 안내", "2주 수업 후 맞지 않으면 반 다시 조정"].map((s, i) => (
                <li key={s} className="flex items-center gap-4 rounded-[16px] px-5 py-4" style={{ background: C.soft }}>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[15px] font-bold text-white" style={{ background: C.green }}>{i + 1}</span>
                  <span className="font-semibold">{s}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <footer className="border-t px-5 py-10 text-[14px] md:px-8" style={{ borderColor: C.line, color: C.sub }}>
        <div className="mx-auto flex max-w-[1200px] flex-col gap-2 md:flex-row md:justify-between">
          <p>다올수학영어학원, 경기도 수원시 영통구 일대, 교습과목 수학, 영어</p>
          <p>상담 문의 031-000-0000</p>
        </div>
      </footer>
    </div>
  );
}
