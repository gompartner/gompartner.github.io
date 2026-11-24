"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";

// 도자기 공방 쇼핑몰 시안 B 공방 이야기형(11-22 사례 분석: 어렁목 1250, GN POT처럼 브랜드 스토리와 제작 과정을 앞에 두어 신뢰를 얻는다. 선물을 고르는 손님은 누가 어디서 만드는지, 얼마나 걸리는지, 매일 써도 되는지를 묻는다). 흰 바탕, 흙색과 먹색. 인물 없음. 메인 한 장, 기능 없음.
// 사진: Unsplash 무료 라이선스(public/images/drafts/os/b-*)
const IMG = "/images/drafts/os";
const C = { ink: "#201c18", sub: "#6c655d", line: "#ece6df", soft: "#f7f3ee", clay: "#9a5a33", claySoft: "#f3e7dc" };

const STEPS = [
  ["반죽", "이천 백토와 산청토를 섞어 3일 숙성"],
  ["성형", "물레로 빚고 하루 말린 뒤 굽 깎기"],
  ["초벌", "800도에서 8시간"],
  ["시유", "직접 조색한 유약 4종"],
  ["재벌", "1,250도 가스 가마에서 12시간"],
];

export function OsB() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.75] md:text-[17px]" style={{ color: C.ink }}>
      <header className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur" style={{ borderColor: C.line }}>
        <div className="mx-auto flex h-[70px] max-w-[1200px] items-center justify-between px-5 md:px-8">
          <p className="text-[20px] font-bold tracking-[-0.02em]">
            <span style={{ color: C.clay }}>온</span>도예
          </p>
          <nav aria-label="주 메뉴" className="hidden gap-9 text-[15px] font-semibold lg:flex" style={{ color: "#4d4740" }}>
            {["이야기", "만드는 과정", "컬렉션", "쓰는 법"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </nav>
          <span className="inline-flex h-11 items-center rounded-full px-5 text-[15px] font-bold text-white" style={{ background: C.clay }}>
            컬렉션 보기
          </span>
        </div>
      </header>

      <section className="px-5 pb-16 pt-10 md:px-8 md:pb-24 md:pt-14">
        <div className="mx-auto grid max-w-[1200px] items-center gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-14">
          <div>
            <p className="inline-flex rounded-full px-3 py-1 text-[14px] font-bold" style={{ background: C.claySoft, color: C.clay }}>여주 공방, 도예가 두 명</p>
            <h1 className="mt-5 text-[36px] font-bold leading-[1.24] tracking-[-0.045em] md:text-[56px]">
              매일 손에 쥐는 그릇이라
              <br />
              가볍게 빚습니다
            </h1>
            <p className="mt-5 max-w-[460px] text-[17px] md:text-[18px]" style={{ color: C.sub }}>
              머그 한 개 280g. 식기세척기, 전자레인지에 써도 되도록 유약과 굽는 온도를 맞췄습니다.
            </p>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[28px]">
            <Image src={`${IMG}/b-hero.jpg`} alt="선반 위에 나란히 놓인 여러 모양의 화병" fill priority sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28" style={{ background: C.soft }}>
        <div className="mx-auto max-w-[1200px]">
          <h2 className="text-[30px] font-bold tracking-[-0.04em] md:text-[44px]">만드는 과정</h2>
          <p className="mt-3" style={{ color: C.sub }}>주문 제작은 흙 반죽부터 받으시기까지 4주가 걸립니다.</p>
          <ol className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {STEPS.map(([t, d], i) => (
              <li key={t} className="rounded-[20px] bg-white p-6">
                <p className="text-[14px] font-bold tabular-nums" style={{ color: C.clay }}>0{i + 1}</p>
                <h3 className="mt-1 text-[20px] font-bold tracking-[-0.03em]">{t}</h3>
                <p className="mt-1 text-[15px]" style={{ color: C.sub }}>{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto grid max-w-[1200px] items-center gap-10 md:grid-cols-[1.1fr_1fr] md:gap-16">
          <div className="grid grid-cols-2 gap-3">
            <div className="relative aspect-[3/4] overflow-hidden rounded-[22px]">
              <Image src={`${IMG}/b-kiln.jpg`} alt="가마 안에서 불을 받는 컵들" fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
            </div>
            <div className="relative aspect-[3/4] overflow-hidden rounded-[22px]">
              <Image src={`${IMG}/b-clay.jpg`} alt="초벌 전 말리고 있는 흙 그릇들" fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
            </div>
          </div>
          <div>
            <h2 className="text-[28px] font-bold leading-[1.35] tracking-[-0.04em] md:text-[38px]">컬렉션</h2>
            <ul className="mt-7 border-t" style={{ borderColor: C.ink }}>
              {[
                ["아침 세트", "머그 2, 접시 2", "98,000원"],
                ["밥상 세트", "밥공기 2, 국그릇 2, 찬기 4", "168,000원"],
                ["화병 소품", "높이 12 ~ 22cm, 4가지 유약", "34,000원부터"],
              ].map(([t, d, p]) => (
                <li key={t} className="grid grid-cols-[1fr_auto] gap-x-4 border-b py-4" style={{ borderColor: C.line }}>
                  <span className="text-[19px] font-bold">{t}</span>
                  <span className="text-right font-bold tabular-nums" style={{ color: C.clay }}>{p}</span>
                  <span className="col-span-2 text-[15px]" style={{ color: C.sub }}>{d}</span>
                </li>
              ))}
            </ul>
            <p className="mt-5 inline-flex items-center gap-1.5 font-bold" style={{ color: C.clay }}>
              전체 컬렉션 <ArrowRight size={17} aria-hidden />
            </p>
          </div>
        </div>
      </section>

      <section className="px-5 pb-20 md:px-8 md:pb-28">
        <div className="mx-auto grid max-w-[1200px] gap-4 md:grid-cols-2">
          <div className="rounded-[28px] p-8 md:p-10" style={{ background: C.claySoft }}>
            <h2 className="text-[24px] font-bold tracking-[-0.04em] md:text-[30px]">쓰는 법</h2>
            <ul className="mt-5 grid gap-2.5" style={{ color: C.sub }}>
              <li>처음 쓰기 전 쌀뜨물에 한 번 끓여 주세요</li>
              <li>식기세척기, 전자레인지 사용 가능, 오븐 직화는 피해 주세요</li>
              <li>찻물이 들면 베이킹소다로 닦으면 지워집니다</li>
            </ul>
          </div>
          <div className="flex flex-col justify-between rounded-[28px] p-8 text-white md:p-10" style={{ background: C.ink }}>
            <div>
              <h2 className="text-[24px] font-bold tracking-[-0.04em] md:text-[30px]">공방 방문</h2>
              <p className="mt-3 text-white/70">토요일 13:00 ~ 18:00 공방 쇼룸을 엽니다. 여주 도자기 마을 안, 주차 가능.</p>
            </div>
            <p className="mt-8 text-[30px] font-bold tabular-nums tracking-[-0.02em]">031-000-0000</p>
          </div>
        </div>
      </section>

      <footer className="border-t px-5 py-10 text-[14px] md:px-8" style={{ borderColor: C.line, color: C.sub }}>
        <div className="mx-auto flex max-w-[1200px] flex-col gap-2 md:flex-row md:justify-between">
          <p>온도예, 경기도 여주시 일대. 사업자등록번호 000-00-00000, 통신판매업 신고 제0000-경기여주-0000호</p>
          <p>031-000-0000</p>
        </div>
      </footer>
    </div>
  );
}
