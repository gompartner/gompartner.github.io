"use client";

import Image from "next/image";

// 팝업스토어 사전예약 랜딩 시안 B 포스터형(11-22. 시안 A는 기존 회차 예약 랜딩. 성수 팝업 인스타그램 포스터처럼 큰 글자와 날짜를 먼저, 그 아래 입장 방법, 받는 것, 오시는 길만 짧게). 흰 바탕, 분홍과 검정. 인물 없음. 메인 한 장, 예약은 버튼만.
// 사진: Unsplash 무료 라이선스(public/images/drafts/ld/popup-*)
const IMG = "/images/drafts/ld";
const C = { ink: "#17121a", sub: "#6a6070", line: "#efe5ee", pink: "#ec3f8f", pinkSoft: "#fde8f2" };

export function LdPopupB() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.75] md:text-[17px]" style={{ color: C.ink }}>
      <section className="px-5 pt-10 md:px-8 md:pt-14">
        <div className="mx-auto max-w-[1120px]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 pb-4" style={{ borderColor: C.ink }}>
            <p className="text-[16px] font-bold tracking-[0.12em]">BUNGEO LAB</p>
            <p className="text-[15px] font-bold tabular-nums">12. 5 ~ 12. 11, 성수</p>
          </div>
          <h1 className="mt-8 text-[48px] font-black leading-[1.02] tracking-[-0.06em] md:text-[120px]">
            붕어빵
            <br />
            <span style={{ color: C.pink }}>연구소</span>
          </h1>
          <p className="mt-5 max-w-[520px] text-[18px] md:text-[20px]">성수에서 7일만 엽니다. 매장에서 바로 굽는 붕어빵 6가지와 굿즈.</p>
          <div className="relative mt-10 aspect-[4/3] overflow-hidden md:aspect-[21/9]">
            <Image src={`${IMG}/popup-hero.jpg`} alt="분홍 타일 벽과 빛나는 진열대가 있는 빈 매장" fill priority sizes="100vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="px-5 py-16 md:px-8 md:py-24">
        <div className="mx-auto grid max-w-[1120px] gap-4 md:grid-cols-2">
          <div className="rounded-[20px] p-8" style={{ background: C.pinkSoft }}>
            <h2 className="text-[24px] font-bold tracking-[-0.04em] md:text-[30px]">사전 예약</h2>
            <ul className="mt-4 grid gap-2" style={{ color: C.sub }}>
              <li>30분 회차, 회차당 40명</li>
              <li>예약자는 줄 없이 바로 입장</li>
              <li>매일 밤 9시에 다음 날 회차 열림</li>
            </ul>
          </div>
          <div className="rounded-[20px] border p-8" style={{ borderColor: C.line }}>
            <h2 className="text-[24px] font-bold tracking-[-0.04em] md:text-[30px]">예약 없이 오셔도</h2>
            <ul className="mt-4 grid gap-2" style={{ color: C.sub }}>
              <li>매장 앞 태블릿에 번호를 남기면 문자로 호출</li>
              <li>예약 회차 사이사이에 입장</li>
              <li>현장 대기 등록은 19:00 마감</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="px-5 pb-16 md:px-8 md:pb-24">
        <div className="mx-auto grid max-w-[1120px] items-center gap-10 md:grid-cols-[1fr_1.1fr] md:gap-14">
          <div>
            <h2 className="text-[26px] font-bold tracking-[-0.04em] md:text-[34px]">들어오면 받는 것</h2>
            <ol className="mt-6 grid gap-3">
              {[
                ["300", "선착순 구디백, 하루 300개"],
                ["1", "팔로우 화면을 보여 주면 붕어 키링"],
                ["7", "7일 개근 도장 다 찍으면 한정 머그"],
              ].map(([n, d]) => (
                <li key={d} className="flex items-baseline gap-4 border-b pb-3" style={{ borderColor: C.line }}>
                  <span className="w-[56px] shrink-0 text-[26px] font-black tabular-nums" style={{ color: C.pink }}>{n}</span>
                  <span>{d}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="relative aspect-[3/4] overflow-hidden rounded-[18px]">
              <Image src={`${IMG}/popup-gift.jpg`} alt="분홍 리본을 묶은 선물 상자" fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
            </div>
            <div className="relative aspect-[3/4] overflow-hidden rounded-[18px]">
              <Image src={`${IMG}/popup-cups.jpg`} alt="나무 받침 위 파스텔 무늬 컵 네 개" fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 pb-20 md:px-8 md:pb-28">
        <div className="mx-auto flex max-w-[1120px] flex-col gap-6 rounded-[24px] p-8 text-white md:flex-row md:items-center md:justify-between md:p-12" style={{ background: C.ink }}>
          <div>
            <h2 className="text-[26px] font-bold tracking-[-0.04em] md:text-[34px]">오시는 길</h2>
            <p className="mt-2 text-white/70">성수역 3번 출구에서 6분. 매일 11:00 ~ 20:00, 입장 마감 19:30.</p>
          </div>
          <button type="button" className="h-14 shrink-0 rounded-full px-10 text-[17px] font-bold text-white" style={{ background: C.pink }}>
            회차 예약하기
          </button>
        </div>
      </section>

      <footer className="border-t px-5 py-10 text-[14px] md:px-8" style={{ borderColor: C.line, color: C.sub }}>
        <div className="mx-auto max-w-[1120px]">붕어빵 연구소 팝업, 서울특별시 성동구 성수동 일대. 운영 문의는 인스타그램 공식 계정으로 받습니다.</div>
      </footer>
    </div>
  );
}
