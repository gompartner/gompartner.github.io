"use client";

import Image from "next/image";
import { ArrowRight, BadgeCheck } from "lucide-react";

// 학원 시안 A 입시 모집형(11-21 사례 분석: 실제 입시 학원은 첫 화면에 시즌 모집 배너, 마감일, 혜택, 실적 배지를 둔다). 메인 한 장, 기능 없음.
// 사진: Unsplash 무료 라이선스(public/images/drafts/aca/a-*)
const IMG = "/images/drafts/aca";
const C = { blue: "#1638d8", deep: "#0b1a6b", ink: "#101322", sub: "#5c6275", line: "#e4e7f0", soft: "#f3f5fb", yellow: "#ffd23f" };

const CLASSES = [
  { g: "예비 고1", t: "고1 수학 선행 완성반", d: "수학(상), (하) 개념과 내신 유형을 12주에 끝냅니다.", s: "주 3회, 정원 12명" },
  { g: "고2", t: "수능 수학 기본반", d: "수1, 수2 기출을 단원별로 정리하고 매주 실전 테스트를 봅니다.", s: "주 3회, 정원 14명" },
  { g: "고3, N수", t: "수능 파이널 집중반", d: "모의고사 오답을 개인별로 분석해 약점 단원만 다시 풉니다.", s: "주 4회, 정원 10명" },
];

export function AcademyA() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.75] md:text-[17px]" style={{ color: C.ink }}>
      <header className="sticky top-0 z-20 border-b bg-white" style={{ borderColor: C.line }}>
        <div className="mx-auto flex h-[70px] max-w-[1240px] items-center justify-between px-5 md:px-8">
          <p className="flex items-baseline gap-2">
            <span className="text-[21px] font-extrabold tracking-[-0.03em]" style={{ color: C.blue }}>정석수학학원</span>
            <span className="hidden text-[12px] font-bold sm:inline" style={{ color: C.sub }}>대치 본원</span>
          </p>
          <nav aria-label="주 메뉴" className="hidden gap-9 text-[15px] font-bold lg:flex">
            {["학원 소개", "수업 안내", "합격 실적", "설명회", "오시는 길"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </nav>
          <span className="inline-flex h-11 items-center rounded-[10px] px-5 text-[15px] font-bold text-white" style={{ background: C.blue }}>
            1:1 상담
          </span>
        </div>
      </header>

      <section className="relative overflow-hidden text-white" style={{ background: C.deep }}>
        <Image src={`${IMG}/a-library.jpg`} alt="높은 천장의 열람실" fill priority sizes="100vw" className="object-cover opacity-30" />
        <div className="absolute inset-0" style={{ background: `linear-gradient(110deg, ${C.blue} 0%, rgba(22,56,216,0.85) 45%, rgba(11,26,107,0.4) 100%)` }} aria-hidden />
        <div className="relative mx-auto grid max-w-[1240px] gap-10 px-5 py-16 md:px-8 md:py-24 lg:grid-cols-[1.3fr_1fr] lg:items-center">
          <div>
            <p className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-1.5 text-[14px] font-bold">
              <span className="h-2 w-2 rounded-full" style={{ background: C.yellow }} aria-hidden />
              2027 윈터스쿨 모집 중
            </p>
            <h1 className="mt-6 text-[40px] font-extrabold leading-[1.15] tracking-[-0.05em] md:text-[72px]">
              겨울 8주,
              <br />
              <span style={{ color: C.yellow }}>수학 1등급</span>의 차이
            </h1>
            <p className="mt-6 max-w-[520px] text-[17px] text-white/80 md:text-[19px]">
              방학 동안 한 학기 개념을 끝내고, 매주 실전 테스트로 점수를 확인합니다. 반별 정원 12명, 레벨테스트 후 배정합니다.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <span className="inline-flex h-[56px] items-center gap-2 rounded-[12px] px-7 text-[17px] font-bold" style={{ background: C.yellow, color: C.ink }}>
                레벨테스트 신청
                <ArrowRight size={18} aria-hidden />
              </span>
              <span className="inline-flex h-[56px] items-center rounded-[12px] border border-white/40 px-7 text-[17px] font-bold">시간표 보기</span>
            </div>
          </div>
          <div className="rounded-[20px] bg-white p-7 md:p-8" style={{ color: C.ink }}>
            <p className="text-[14px] font-bold" style={{ color: C.blue }}>조기 등록 혜택</p>
            <p className="mt-2 text-[28px] font-extrabold tracking-[-0.04em] md:text-[32px]">12월 15일까지 수강료 10%</p>
            <dl className="mt-6 grid gap-3 border-t pt-6 text-[15px]" style={{ borderColor: C.line }}>
              {[
                ["개강", "2027년 1월 5일(월)"],
                ["기간", "8주, 주 3회 3시간"],
                ["대상", "예비 고1 ~ 고3, N수"],
                ["설명회", "12월 6일(토) 오후 2시"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4">
                  <dt style={{ color: C.sub }}>{k}</dt>
                  <dd className="text-right font-bold">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section aria-label="합격 실적" className="border-b px-5 md:px-8" style={{ borderColor: C.line }}>
        <dl className="mx-auto grid max-w-[1240px] grid-cols-2 gap-px md:grid-cols-4" style={{ background: C.line }}>
          {[
            ["2026 수능 수학 1등급", "38명"],
            ["의, 치, 한 합격", "11명"],
            ["서울 주요 대학 합격", "64명"],
            ["재원생 평균 상승", "1.8등급"],
          ].map(([k, v]) => (
            <div key={k} className="bg-white px-1 py-9 md:px-8 md:py-12">
              <dt className="flex items-center gap-1.5 text-[14px] font-bold" style={{ color: C.sub }}>
                <BadgeCheck size={16} style={{ color: C.blue }} aria-hidden />
                {k}
              </dt>
              <dd className="mt-2 text-[34px] font-extrabold tracking-[-0.03em] md:text-[46px]" style={{ color: C.blue }}>{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-[1240px]">
          <h2 className="text-[30px] font-extrabold tracking-[-0.04em] md:text-[46px]">학년별 수업</h2>
          <p className="mt-3" style={{ color: C.sub }}>레벨테스트 결과로 반을 배정하고, 4주마다 반 이동을 다시 판단합니다.</p>
          <ul className="mt-12 grid gap-4 md:grid-cols-3">
            {CLASSES.map((c) => (
              <li key={c.t} className="flex flex-col justify-between rounded-[20px] border p-8" style={{ borderColor: C.line }}>
                <div>
                  <span className="inline-flex rounded-[8px] px-3 py-1 text-[14px] font-bold text-white" style={{ background: C.blue }}>{c.g}</span>
                  <h3 className="mt-5 text-[23px] font-extrabold tracking-[-0.03em]">{c.t}</h3>
                  <p className="mt-3 text-[15px]" style={{ color: C.sub }}>{c.d}</p>
                </div>
                <p className="mt-8 border-t pt-5 text-[15px] font-bold" style={{ borderColor: C.line }}>{c.s}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-5 pb-20 md:px-8 md:pb-28">
        <div className="mx-auto grid max-w-[1240px] overflow-hidden rounded-[24px] lg:grid-cols-2" style={{ background: C.soft }}>
          <div className="relative min-h-[300px] lg:min-h-[480px]">
            <Image src={`${IMG}/a-hall.jpg`} alt="좌석이 정돈된 강의실" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
          </div>
          <div className="px-7 py-12 md:px-14 md:py-16">
            <h2 className="text-[28px] font-extrabold leading-[1.35] tracking-[-0.04em] md:text-[38px]">수업이 끝나도 관리는 계속됩니다</h2>
            <ul className="mt-8 grid gap-5">
              {[
                ["매주 실전 테스트", "점수와 오답 단원을 학부모님께 문자로 보냅니다."],
                ["자습실 클리닉", "평일 밤 10시까지 조교가 질문을 받습니다."],
                ["월 1회 학부모 상담", "성적 추이와 다음 달 학습 계획을 공유합니다."],
              ].map(([t, d]) => (
                <li key={t} className="border-l-4 pl-5" style={{ borderColor: C.blue }}>
                  <p className="text-[18px] font-bold">{t}</p>
                  <p className="mt-1 text-[15px]" style={{ color: C.sub }}>{d}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="px-5 py-16 text-white md:px-8 md:py-20" style={{ background: C.blue }}>
        <div className="mx-auto flex max-w-[1240px] flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[15px] font-bold" style={{ color: C.yellow }}>12월 6일(토) 오후 2시</p>
            <h2 className="mt-2 text-[28px] font-extrabold tracking-[-0.04em] md:text-[40px]">2027 입시 전략 설명회</h2>
          </div>
          <span className="inline-flex h-[56px] items-center gap-2 self-start rounded-[12px] bg-white px-7 text-[17px] font-bold md:self-auto" style={{ color: C.blue }}>
            설명회 예약
            <ArrowRight size={18} aria-hidden />
          </span>
        </div>
      </section>

      <footer className="px-5 py-10 text-[14px] md:px-8" style={{ color: C.sub }}>
        <div className="mx-auto flex max-w-[1240px] flex-col gap-2 md:flex-row md:justify-between">
          <p>정석수학학원, 서울특별시 강남구 대치동 학원가, 교습과목 수학</p>
          <p>상담 문의 02-000-0000</p>
        </div>
      </footer>
    </div>
  );
}
