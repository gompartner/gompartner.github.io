"use client";

import Image from "next/image";
import { Palette } from "lucide-react";

// 미술 학원 시안 B 어린이 창의 미술형(11-22 사례 분석: 입시 학원과 달리 어린이 미술 학부모는 연령반, 어떤 재료를 쓰는지, 작품을 어떻게 받는지 묻는다). 흰 바탕, 보라와 노랑. 인물 없음. 메인 한 장, 기능 없음.
// 사진: Unsplash 무료 라이선스(public/images/drafts/art/b-*)
const IMG = "/images/drafts/art";
const C = { ink: "#1c1828", sub: "#655f73", line: "#ebe8f1", soft: "#f6f4fa", purple: "#6a3fc8", purpleSoft: "#efe9fb", yellow: "#ffc93c" };

const CLASSES = [
  ["새싹반", "5 ~ 7세", "손으로 만지고 섞어 보는 재료 놀이"],
  ["초등 저학년", "1 ~ 3학년", "관찰 그리기, 수채화 시작"],
  ["초등 고학년", "4 ~ 6학년", "명암, 원근, 주제 그림"],
];

const MATERIALS = ["수채화", "아크릴", "점토", "판화", "콜라주", "목탄"];

export function ArtB() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.75] md:text-[17px]" style={{ color: C.ink }}>
      <header className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur" style={{ borderColor: C.line }}>
        <div className="mx-auto flex h-[70px] max-w-[1200px] items-center justify-between px-5 md:px-8">
          <p className="flex items-center gap-2 text-[20px] font-bold tracking-[-0.03em]">
            <Palette size={20} style={{ color: C.purple }} aria-hidden /> 크레용 아뜰리에
          </p>
          <nav aria-label="주 메뉴" className="hidden gap-9 text-[15px] font-semibold lg:flex" style={{ color: "#4a4458" }}>
            {["연령반", "재료 수업", "전시", "상담"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </nav>
          <span className="inline-flex h-11 items-center rounded-full px-5 text-[15px] font-bold text-white" style={{ background: C.purple }}>
            체험 수업
          </span>
        </div>
      </header>

      <section className="px-5 pb-16 pt-10 md:px-8 md:pb-24 md:pt-14">
        <div className="mx-auto grid max-w-[1200px] items-center gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-14">
          <div>
            <p className="inline-flex rounded-full px-3 py-1 text-[14px] font-bold" style={{ background: C.yellow }}>5세부터 초등 6학년</p>
            <h1 className="mt-5 text-[36px] font-bold leading-[1.24] tracking-[-0.045em] md:text-[56px]">
              잘 그리기 전에
              <br />
              많이 그려 봅니다
            </h1>
            <p className="mt-5 max-w-[460px] text-[17px] md:text-[18px]" style={{ color: C.sub }}>
              한 달에 재료 네 가지를 바꿔 가며 씁니다. 따라 그리기 대신 직접 보고 고른 것을 그립니다.
            </p>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[28px]">
            <Image src={`${IMG}/b-hero.jpg`} alt="칸칸이 정리된 여러 색의 크레용" fill priority sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28" style={{ background: C.soft }}>
        <div className="mx-auto max-w-[1200px]">
          <h2 className="text-[30px] font-bold tracking-[-0.04em] md:text-[44px]">연령반</h2>
          <ul className="mt-10 grid gap-4 md:grid-cols-3">
            {CLASSES.map(([t, a, d]) => (
              <li key={t} className="flex flex-col rounded-[24px] bg-white p-7 md:p-8">
                <span className="self-start rounded-full px-3 py-0.5 text-[14px] font-bold" style={{ background: C.purpleSoft, color: C.purple }}>{a}</span>
                <h3 className="mt-4 text-[23px] font-bold tracking-[-0.03em]">{t}</h3>
                <p className="mt-1 text-[15px]" style={{ color: C.sub }}>{d}</p>
                <p className="mt-6 border-t pt-4 text-[15px] font-semibold" style={{ borderColor: C.line }}>주 1회 또는 2회, 90분</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto grid max-w-[1200px] items-center gap-10 md:grid-cols-[1.1fr_1fr] md:gap-16">
          <div className="grid grid-cols-2 gap-3">
            <div className="relative aspect-[3/4] overflow-hidden rounded-[22px]">
              <Image src={`${IMG}/b-supplies.jpg`} alt="통에 꽂힌 색연필과 물감 통" fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
            </div>
            <div className="relative aspect-[3/4] overflow-hidden rounded-[22px]">
              <Image src={`${IMG}/b-palette.jpg`} alt="여러 색 물감이 굳은 팔레트" fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
            </div>
          </div>
          <div>
            <h2 className="text-[28px] font-bold leading-[1.35] tracking-[-0.04em] md:text-[38px]">재료 수업</h2>
            <p className="mt-3" style={{ color: C.sub }}>재료와 도구는 학원에서 준비합니다. 앞치마만 챙겨 주세요.</p>
            <ul className="mt-7 flex flex-wrap gap-2">
              {MATERIALS.map((m) => (
                <li key={m} className="rounded-full border px-4 py-1.5 font-semibold" style={{ borderColor: C.line }}>{m}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="px-5 pb-20 md:px-8 md:pb-28">
        <div className="mx-auto grid max-w-[1200px] gap-4 md:grid-cols-2">
          <div className="rounded-[28px] p-8 md:p-10" style={{ background: C.purpleSoft }}>
            <h2 className="text-[24px] font-bold tracking-[-0.04em] md:text-[30px]">작품은 이렇게 받습니다</h2>
            <ul className="mt-5 grid gap-2.5" style={{ color: C.sub }}>
              <li>매달 마지막 주 작품 파일에 담아 집으로</li>
              <li>수업 사진과 한 줄 기록을 보호자께 문자로</li>
              <li>매년 2월 동네 갤러리에서 작품 전시회</li>
            </ul>
          </div>
          <div className="flex flex-col justify-between rounded-[28px] p-8 text-white md:p-10" style={{ background: C.purple }}>
            <div>
              <h2 className="text-[24px] font-bold tracking-[-0.04em] md:text-[30px]">체험 수업</h2>
              <p className="mt-3 text-white/80">평일 오후 아무 날이나 90분 체험할 수 있습니다. 교습비는 학원 안에 게시합니다.</p>
            </div>
            <p className="mt-8 text-[30px] font-bold tabular-nums tracking-[-0.02em]">031-000-0000</p>
          </div>
        </div>
      </section>

      <footer className="border-t px-5 py-10 text-[14px] md:px-8" style={{ borderColor: C.line, color: C.sub }}>
        <div className="mx-auto flex max-w-[1200px] flex-col gap-2 md:flex-row md:justify-between">
          <p>크레용 아뜰리에 미술교습소, 경기도 고양시 일산동구 일대. 교습소 등록번호 제000호</p>
          <p>031-000-0000</p>
        </div>
      </footer>
    </div>
  );
}
