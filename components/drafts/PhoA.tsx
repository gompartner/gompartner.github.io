"use client";

import Image from "next/image";
import { Clock } from "lucide-react";

// 사진관 시안 A 증명, 프로필 사진관(11-22 사례 분석: 203사진관처럼 흰 바탕과 여백, 사진 위주. 사례 대부분이 빠뜨린 "촬영 시간, 받는 것, 규격"을 손님이 가장 많이 묻는다). 흰 바탕, 검정. 인물 사진은 고객 자료로 교체. 메인 한 장, 기능 없음.
// 사진: Unsplash 무료 라이선스(public/images/drafts/pho/a-*)
const IMG = "/images/drafts/pho";
const C = { ink: "#111", sub: "#6a6a6a", line: "#e7e7e7", soft: "#f5f5f5" };

const MENU = [
  { t: "증명사진", time: "10분", get: "인화 8장, 보정 원본 파일", use: "이력서, 자격증, 학생증" },
  { t: "여권사진", time: "10분", get: "인화 8장, 규격 확인 후 출력", use: "여권, 비자, 국제운전면허" },
  { t: "취업 프로필", time: "30분", get: "의상 2벌, 보정 3컷", use: "입사 지원서, 사원증" },
  { t: "개인 프로필", time: "60분", get: "배경 2종, 보정 6컷", use: "SNS, 강사 소개, 홍보물" },
];

export function PhoA() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.75] md:text-[17px]" style={{ color: C.ink }}>
      <header className="border-b" style={{ borderColor: C.line }}>
        <div className="mx-auto flex h-[72px] max-w-[1280px] items-center justify-between px-5 md:px-10">
          <p className="text-[20px] font-bold tracking-[-0.02em]">하루 사진관</p>
          <nav aria-label="주 메뉴" className="hidden gap-9 text-[15px] font-medium md:flex" style={{ color: "#444" }}>
            {["촬영 안내", "여권 규격", "오시는 길"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </nav>
          <span className="text-[15px] font-bold tabular-nums">02-000-0000</span>
        </div>
      </header>

      <section className="px-5 pt-12 md:px-10 md:pt-20">
        <div className="mx-auto max-w-[1280px]">
          <h1 className="text-[38px] font-bold leading-[1.22] tracking-[-0.05em] md:text-[72px]">
            증명사진 10분,
            <br />
            인화까지 30분
          </h1>
          <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <p className="max-w-[520px]" style={{ color: C.sub }}>
              촬영 뒤 모니터로 함께 골라 보정합니다. 머리와 옷깃 정리, 피부 톤 보정까지 기본으로 들어갑니다.
            </p>
            <p className="flex items-center gap-2 text-[15px] font-semibold">
              <Clock size={17} aria-hidden /> 매일 10:00 ~ 20:00, 예약 없이 방문
            </p>
          </div>
          <div className="relative mt-10 aspect-[4/3] overflow-hidden md:aspect-[21/9]">
            <Image src={`${IMG}/a-hero.jpg`} alt="흰 벽과 흰 바닥으로 이어진 빈 촬영 스튜디오" fill priority sizes="100vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-[1280px]">
          <h2 className="text-[30px] font-bold tracking-[-0.04em] md:text-[44px]">촬영 안내</h2>
          <ul className="mt-10 border-t" style={{ borderColor: C.ink }}>
            {MENU.map((m) => (
              <li key={m.t} className="grid gap-2 border-b py-6 md:grid-cols-[1.1fr_0.6fr_1.4fr_1.4fr] md:items-center md:gap-6" style={{ borderColor: C.line }}>
                <h3 className="text-[22px] font-bold tracking-[-0.03em]">{m.t}</h3>
                <p className="text-[15px] font-bold tabular-nums">촬영 {m.time}</p>
                <p style={{ color: C.sub }}>{m.get}</p>
                <p className="text-[15px]" style={{ color: C.sub }}>{m.use}</p>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-[15px]" style={{ color: C.sub }}>원본 파일은 촬영 당일 메일 또는 문자로 보내 드립니다.</p>
        </div>
      </section>

      <section className="px-5 py-20 md:px-10 md:py-28" style={{ background: C.soft }}>
        <div className="mx-auto grid max-w-[1280px] items-center gap-10 md:grid-cols-2 md:gap-16">
          <div className="grid grid-cols-2 gap-3">
            <div className="relative aspect-[3/4] overflow-hidden">
              <Image src={`${IMG}/a-light.jpg`} alt="회색 벽 앞의 스튜디오 조명 두 대" fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
            </div>
            <div className="relative aspect-[3/4] overflow-hidden">
              <Image src={`${IMG}/a-camera.jpg`} alt="인화한 흑백 사진 옆의 카메라" fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
            </div>
          </div>
          <div>
            <h2 className="text-[28px] font-bold leading-[1.35] tracking-[-0.04em] md:text-[38px]">여권사진 규격</h2>
            <dl className="mt-7 border-t" style={{ borderColor: C.ink }}>
              {[
                ["크기", "가로 3.5cm, 세로 4.5cm"],
                ["얼굴 길이", "정수리부터 턱까지 3.2 ~ 3.6cm"],
                ["배경", "흰색 무지, 그림자 없이"],
                ["촬영 시기", "신청일 기준 6개월 이내"],
                ["안경", "렌즈 반사 없도록 벗고 촬영 권장"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 border-b py-4" style={{ borderColor: C.line }}>
                  <dt style={{ color: C.sub }}>{k}</dt>
                  <dd className="text-right font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto grid max-w-[1280px] items-center gap-10 md:grid-cols-[1fr_1.1fr] md:gap-16">
          <div>
            <h2 className="text-[28px] font-bold leading-[1.35] tracking-[-0.04em] md:text-[38px]">오시는 길</h2>
            <dl className="mt-7 grid gap-3">
              {[
                ["위치", "지하철역 2번 출구 앞 건물 2층"],
                ["시간", "매일 10:00 ~ 20:00, 명절 당일 휴무"],
                ["주차", "건물 주차장 30분 무료"],
              ].map(([k, v]) => (
                <div key={k} className="grid grid-cols-[64px_1fr] gap-3">
                  <dt className="font-bold">{k}</dt>
                  <dd style={{ color: C.sub }}>{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden">
            <Image src={`${IMG}/a-frame.jpg`} alt="흰 벽에 걸린 검은 액자 두 점" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      <footer className="border-t px-5 py-10 text-[14px] md:px-10" style={{ borderColor: C.line, color: C.sub }}>
        <div className="mx-auto flex max-w-[1280px] flex-col gap-2 md:flex-row md:justify-between">
          <p>하루 사진관, 서울특별시 관악구 일대. 사업자등록번호 000-00-00000</p>
          <p>02-000-0000</p>
        </div>
      </footer>
    </div>
  );
}
