"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";

// 약국 시안 B 복약 상담형(11-22 사례 분석: 약국 전용 홈페이지는 운영 시간 뒤에 약사 소개와 상담을 둔다. 약을 여러 개 드시는 어르신 가족, 영양제를 고르는 손님은 같이 먹어도 되는지, 무엇을 가져가야 하는지를 묻는다). 흰 바탕, 검정과 청록. 인물 없음. 메인 한 장, 기능 없음.
// 사진: Unsplash 무료 라이선스(public/images/drafts/ph/b-*)
const IMG = "/images/drafts/ph";
const C = { ink: "#111716", sub: "#5f6766", line: "#e4e8e8", soft: "#f3f6f6", teal: "#0f6e6a" };

const CONSULTS = [
  ["복약 정리", "약을 5가지 이상 드시는 분", "병원별 처방을 한 장으로 정리, 겹치는 성분 확인"],
  ["영양제 상담", "지금 드시는 영양제를 가져오세요", "성분 함량, 처방약과 함께 먹어도 되는지 확인"],
  ["어린이 약", "가루약, 시럽 조제", "몸무게 기준 용량, 먹이는 방법 안내"],
  ["여행 상비약", "출국 전 1주일", "지역과 기간에 맞춰 상비약 꾸러미 준비"],
];

export function PhB() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.75] md:text-[17px]" style={{ color: C.ink }}>
      <header className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur" style={{ borderColor: C.line }}>
        <div className="mx-auto flex h-[72px] max-w-[1320px] items-center justify-between px-5 md:px-10">
          <p className="text-[19px] font-bold tracking-[-0.02em]">
            온 <span style={{ color: C.teal }}>약국</span>
          </p>
          <nav aria-label="주 메뉴" className="hidden gap-9 text-[15px] font-semibold lg:flex" style={{ color: "#444b4a" }}>
            {["상담", "약사", "가져올 것", "운영 시간"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </nav>
          <span className="inline-flex h-11 items-center px-5 text-[15px] font-bold text-white" style={{ background: C.teal }}>
            상담 문의
          </span>
        </div>
      </header>

      <section className="px-5 pt-12 md:px-10 md:pt-20">
        <div className="mx-auto max-w-[1320px]">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <h1 className="text-[38px] font-bold leading-[1.2] tracking-[-0.05em] md:text-[72px]">
              드시는 약,
              <br />
              한 번에 정리해 드립니다
            </h1>
            <p className="max-w-[380px]" style={{ color: C.sub }}>
              병원 여러 곳에서 받은 약과 영양제를 함께 보고 겹치는 성분과 복용 시간을 정리합니다.
            </p>
          </div>
          <div className="relative mt-10 aspect-[4/3] overflow-hidden md:aspect-[21/9]">
            <Image src={`${IMG}/b-hero.jpg`} alt="흰 탁자 위에 놓인 갈색 약병 두 개" fill priority sizes="100vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-[1320px]">
          <h2 className="text-[30px] font-bold tracking-[-0.04em] md:text-[44px]">상담</h2>
          <ul className="mt-10 border-t" style={{ borderColor: C.ink }}>
            {CONSULTS.map(([t, who, d]) => (
              <li key={t} className="grid gap-1 border-b py-6 md:grid-cols-[1fr_1.1fr_1.8fr_auto] md:items-center md:gap-6" style={{ borderColor: C.line }}>
                <h3 className="text-[23px] font-bold tracking-[-0.03em]">{t}</h3>
                <p className="font-bold" style={{ color: C.teal }}>{who}</p>
                <p style={{ color: C.sub }}>{d}</p>
                <ArrowRight size={20} className="hidden md:block" aria-hidden />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-5 md:px-10" style={{ background: C.soft }}>
        <div className="mx-auto grid max-w-[1320px] items-center gap-10 py-20 md:grid-cols-2 md:gap-16 md:py-28">
          <div className="grid grid-cols-2 gap-3">
            <div className="relative aspect-[3/4] overflow-hidden">
              <Image src={`${IMG}/b-caps.jpg`} alt="열린 약통 옆에 흩어진 초록 흰색 캡슐" fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
            </div>
            <div className="relative aspect-[3/4] overflow-hidden">
              <Image src={`${IMG}/b-blister.jpg`} alt="회색 바탕 위 알약 포장" fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
            </div>
          </div>
          <div>
            <h2 className="text-[28px] font-bold leading-[1.35] tracking-[-0.04em] md:text-[38px]">상담 때 가져올 것</h2>
            <ol className="mt-7 grid gap-4">
              {[
                ["약 봉투, 처방전", "최근 3개월 안에 받은 것 모두"],
                ["영양제, 건강식품", "통째로 가져오시면 성분표를 함께 봅니다"],
                ["복용 메모", "언제, 몇 알 드시는지 아는 만큼"],
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

      <section className="px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto grid max-w-[1320px] gap-10 md:grid-cols-[1.2fr_1fr] md:gap-16">
          <div>
            <h2 className="text-[28px] font-bold leading-[1.35] tracking-[-0.04em] md:text-[38px]">운영 시간</h2>
            <dl className="mt-7 border-t" style={{ borderColor: C.ink }}>
              {[
                ["평일", "09:00 ~ 19:30"],
                ["토요일", "09:00 ~ 15:00"],
                ["상담 시간", "평일 14:00 ~ 17:00, 한 분 20분"],
                ["휴무", "일요일, 공휴일"],
              ].map(([k, v]) => (
                <div key={k} className="grid grid-cols-[110px_1fr] gap-3 border-b py-4" style={{ borderColor: C.line }}>
                  <dt className="font-bold">{k}</dt>
                  <dd className="tabular-nums" style={{ color: C.sub }}>{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="flex flex-col justify-between gap-8 bg-black p-8 text-white md:p-10">
            <div>
              <h3 className="text-[24px] font-bold tracking-[-0.03em]">약사</h3>
              <p className="mt-3 text-white/75">약국 근무 15년. 노인 복약 지도, 소아 조제를 주로 맡아 왔습니다. 상담은 전화로 시간을 정하고 오시면 기다리지 않습니다.</p>
            </div>
            <p className="text-[28px] font-bold tabular-nums">031-000-0000</p>
          </div>
        </div>
      </section>

      <footer className="border-t px-5 py-10 text-[14px] md:px-10" style={{ borderColor: C.line, color: C.sub }}>
        <div className="mx-auto flex max-w-[1320px] flex-col gap-2 md:flex-row md:justify-between">
          <p>온 약국, 경기도 고양시 덕양구 일대. 약국 개설등록번호 제000호</p>
          <p>031-000-0000</p>
        </div>
      </footer>
    </div>
  );
}
