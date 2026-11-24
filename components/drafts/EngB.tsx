"use client";

import Image from "next/image";

// 영어 회화 학원 시안 B 어린이 영어형(11-22 사례 분석: 인포커스처럼 체험식 회화, 원어민 강사를 앞에 둔다. 초등 학부모는 단계, 원어민 수업 비중, 아이가 얼마나 늘었는지 받는 방식을 묻는다). 흰 바탕, 초록과 노랑. 인물 없음. 메인 한 장, 기능 없음.
// 사진: Unsplash 무료 라이선스(public/images/drafts/eng/b-*)
const IMG = "/images/drafts/eng";
const C = { ink: "#17221b", sub: "#5d6a62", line: "#e3ebe5", soft: "#f2f7f3", green: "#1f8a4c", greenSoft: "#e3f3e9", yellow: "#ffc83d" };

const STAGES = [
  ["Phonics", "7세 ~ 초1", "소리와 글자 연결, 짧은 단어 읽기"],
  ["Reading", "초1 ~ 초3", "그림책 읽고 내용 말하기"],
  ["Speaking", "초3 ~ 초6", "주제 발표, 짧은 글쓰기"],
];

export function EngB() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.75] md:text-[17px]" style={{ color: C.ink }}>
      <header className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur" style={{ borderColor: C.line }}>
        <div className="mx-auto flex h-[70px] max-w-[1200px] items-center justify-between px-5 md:px-8">
          <p className="text-[20px] font-bold tracking-[-0.03em]">
            <span style={{ color: C.green }}>그린빈</span> 키즈 잉글리시
          </p>
          <nav aria-label="주 메뉴" className="hidden gap-9 text-[15px] font-semibold lg:flex" style={{ color: "#3f4a43" }}>
            {["단계", "수업 구성", "학부모 리포트", "상담"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </nav>
          <span className="inline-flex h-11 items-center rounded-full px-5 text-[15px] font-bold text-white" style={{ background: C.green }}>
            레벨 상담
          </span>
        </div>
      </header>

      <section className="px-5 pb-16 pt-10 md:px-8 md:pb-24 md:pt-14">
        <div className="mx-auto grid max-w-[1200px] items-center gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-14">
          <div>
            <p className="inline-flex rounded-full px-3 py-1 text-[14px] font-bold" style={{ background: C.yellow }}>7세부터 초등 6학년</p>
            <h1 className="mt-5 text-[36px] font-bold leading-[1.24] tracking-[-0.045em] md:text-[56px]">
              읽은 만큼
              <br />
              영어로 말해 봅니다
            </h1>
            <p className="mt-5 max-w-[460px] text-[17px] md:text-[18px]" style={{ color: C.sub }}>
              한 반 6명, 수업의 절반은 원어민 선생님과 대화로 채웁니다. 집에서는 하루 15분 읽기 숙제만 합니다.
            </p>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[28px]">
            <Image src={`${IMG}/b-hero.jpg`} alt="여러 색의 알파벳 나무 조각" fill priority sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28" style={{ background: C.soft }}>
        <div className="mx-auto max-w-[1200px]">
          <h2 className="text-[30px] font-bold tracking-[-0.04em] md:text-[44px]">단계</h2>
          <ol className="mt-10 grid gap-4 md:grid-cols-3">
            {STAGES.map(([t, a, d], i) => (
              <li key={t} className="flex flex-col rounded-[24px] bg-white p-7 md:p-8">
                <span className="text-[14px] font-bold tabular-nums" style={{ color: C.green }}>{i + 1}단계</span>
                <h3 className="mt-2 text-[25px] font-bold tracking-[-0.03em]">{t}</h3>
                <span className="mt-2 self-start rounded-full px-3 py-0.5 text-[14px] font-bold" style={{ background: C.greenSoft, color: C.green }}>{a}</span>
                <p className="mt-4 text-[15px]" style={{ color: C.sub }}>{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto grid max-w-[1200px] items-center gap-10 md:grid-cols-[1fr_1.1fr] md:gap-16">
          <div>
            <h2 className="text-[28px] font-bold leading-[1.35] tracking-[-0.04em] md:text-[38px]">80분 수업 구성</h2>
            <ol className="mt-7 grid gap-3">
              {[
                ["20분", "지난 숙제 책 읽고 말하기"],
                ["30분", "원어민 선생님과 주제 대화"],
                ["20분", "새 단어, 문장 만들기"],
                ["10분", "다음 책 고르기, 숙제 안내"],
              ].map(([t, d]) => (
                <li key={d} className="flex gap-4 border-b pb-3" style={{ borderColor: C.line }}>
                  <span className="w-[52px] shrink-0 font-bold tabular-nums" style={{ color: C.green }}>{t}</span>
                  <span>{d}</span>
                </li>
              ))}
            </ol>
            <p className="mt-4 text-[15px]" style={{ color: C.sub }}>주 2회 또는 3회, 학년별 반 편성</p>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[24px]">
            <Image src={`${IMG}/b-tiles.jpg`} alt="흰 바탕 위 흩어진 알파벳 나무 블록" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="px-5 pb-20 md:px-8 md:pb-28">
        <div className="mx-auto grid max-w-[1200px] gap-4 md:grid-cols-2">
          <div className="rounded-[28px] p-8 md:p-10" style={{ background: C.greenSoft }}>
            <h2 className="text-[24px] font-bold tracking-[-0.04em] md:text-[30px]">학부모 리포트</h2>
            <ul className="mt-5 grid gap-2.5" style={{ color: C.sub }}>
              <li>매달 말 읽은 책 목록과 새로 익힌 단어 수</li>
              <li>3개월마다 말하기 녹음 파일을 보내 드립니다</li>
              <li>학기마다 원어민 선생님 상담 10분</li>
            </ul>
          </div>
          <div className="flex flex-col justify-between rounded-[28px] p-8 text-white md:p-10" style={{ background: C.green }}>
            <div>
              <h2 className="text-[24px] font-bold tracking-[-0.04em] md:text-[30px]">레벨 상담</h2>
              <p className="mt-3 text-white/80">아이와 함께 오시면 15분 동안 읽기와 말하기를 보고 맞는 반을 알려 드립니다. 교습비는 학원 안에 게시합니다.</p>
            </div>
            <p className="mt-8 text-[30px] font-bold tabular-nums tracking-[-0.02em]">032-000-0000</p>
          </div>
        </div>
      </section>

      <footer className="border-t px-5 py-10 text-[14px] md:px-8" style={{ borderColor: C.line, color: C.sub }}>
        <div className="mx-auto flex max-w-[1200px] flex-col gap-2 md:flex-row md:justify-between">
          <p>그린빈 키즈 잉글리시 어학원, 인천광역시 연수구 송도동 일대. 학원 등록번호 제000호</p>
          <p>032-000-0000</p>
        </div>
      </footer>
    </div>
  );
}
