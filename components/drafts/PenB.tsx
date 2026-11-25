"use client";

import Image from "next/image";
import { Trees } from "lucide-react";

// 펜션 시안 B 숲속 독채 스테이형(11-22 사례 분석: 선빌리지처럼 영문 로고, 큰 사진, 객실 3칸만 두는 미니멀 스테이형. 독채 손님은 다른 팀과 마주치는지, 어떤 시설이 안에 있는지, 주변에서 무엇을 하는지 묻는다). 흰 바탕, 짙은 초록. 인물 없음. 메인 한 장, 기능 없음.
// 사진: Unsplash 무료 라이선스(public/images/drafts/pen/b-*)
const IMG = "/images/drafts/pen";
const C = { ink: "#161c17", sub: "#5f6860", line: "#e4e9e4", soft: "#f3f6f3", green: "#2f5a3c", greenSoft: "#e5efe7" };

export function PenB() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.75] md:text-[17px]" style={{ color: C.ink }}>
      <header className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur" style={{ borderColor: C.line }}>
        <div className="mx-auto flex h-[70px] max-w-[1200px] items-center justify-between px-5 md:px-8">
          <p className="flex items-center gap-2 text-[19px] font-bold tracking-[0.04em]">
            <Trees size={20} style={{ color: C.green }} aria-hidden /> 숲채 STAY
          </p>
          <nav aria-label="주 메뉴" className="hidden gap-9 text-[15px] font-semibold lg:flex" style={{ color: "#454d46" }}>
            {["독채", "비품 안내", "주변", "문의"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </nav>
          <span className="inline-flex h-11 items-center rounded-full px-5 text-[15px] font-bold text-white" style={{ background: C.green }}>
            네이버 예약
          </span>
        </div>
      </header>

      <section className="px-5 pb-16 pt-10 md:px-8 md:pb-24 md:pt-14">
        <div className="mx-auto max-w-[1200px]">
          <div className="grid gap-6 md:grid-cols-[1.2fr_1fr] md:items-end">
            <h1 className="text-[36px] font-bold leading-[1.24] tracking-[-0.045em] md:text-[60px]">
              하루 두 팀,
              <br />
              숲에 집 한 채씩
            </h1>
            <p className="max-w-[420px] text-[17px]" style={{ color: C.sub }}>
              두 동이 80m 떨어져 있습니다. 진입로도 따로 나 있어 다른 팀과 마주칠 일이 없습니다.
            </p>
          </div>
          <div className="relative mt-10 aspect-[4/3] overflow-hidden rounded-[28px] md:aspect-[21/9]">
            <Image src={`${IMG}/b-hero.jpg`} alt="키 큰 소나무 숲 속 삼각 지붕 목조 독채" fill priority sizes="100vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28" style={{ background: C.soft }}>
        <div className="mx-auto max-w-[1200px]">
          <h2 className="text-[30px] font-bold tracking-[-0.04em] md:text-[44px]">독채</h2>
          <ul className="mt-10 grid gap-4 md:grid-cols-2">
            {[
              { f: "b-hero", t: "A동 소나무", p: "2인 기준, 최대 4인", d: "삼각 지붕 복층, 통창, 데크 화로대" },
              { f: "b-pond", t: "B동 연못", p: "4인 기준, 최대 6인", d: "연못 앞 데크, 방 2개, 개별 바비큐" },
            ].map((x) => (
              <li key={x.t} className="overflow-hidden rounded-[24px] bg-white">
                <div className="relative aspect-[16/10]">
                  <Image src={`${IMG}/${x.f}.jpg`} alt={x.f === "b-pond" ? "연못가 숲 속에 선 목조 오두막" : "숲 속 삼각 지붕 독채 외관"} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
                </div>
                <div className="p-7 md:p-8">
                  <span className="inline-flex rounded-full px-3 py-0.5 text-[14px] font-bold" style={{ background: C.greenSoft, color: C.green }}>{x.p}</span>
                  <h3 className="mt-3 text-[23px] font-bold tracking-[-0.03em]">{x.t}</h3>
                  <p className="mt-1" style={{ color: C.sub }}>{x.d}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto grid max-w-[1200px] items-center gap-10 md:grid-cols-[1fr_1.1fr] md:gap-16">
          <div>
            <h2 className="text-[28px] font-bold leading-[1.35] tracking-[-0.04em] md:text-[38px]">비품 안내</h2>
            <ul className="mt-7 flex flex-wrap gap-2">
              {["인덕션, 전자레인지", "냄비, 칼, 식기", "드립 커피 도구", "블루투스 스피커", "화로대와 장작", "수건, 세면도구", "빔프로젝터", "보드게임"].map((m) => (
                <li key={m} className="rounded-full border px-4 py-1.5 font-semibold" style={{ borderColor: C.line }}>{m}</li>
              ))}
            </ul>
            <p className="mt-6 text-[15px]" style={{ color: C.sub }}>입실 15:00, 퇴실 11:00. 반려견은 A동만 1마리 동반할 수 있습니다.</p>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[24px]">
            <Image src={`${IMG}/b-beam.jpg`} alt="나무 들보가 드러난 천장과 숲이 보이는 데크" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="px-5 pb-20 md:px-8 md:pb-28">
        <div className="mx-auto grid max-w-[1200px] gap-4 md:grid-cols-2">
          <div className="rounded-[28px] p-8 md:p-10" style={{ background: C.greenSoft }}>
            <h2 className="text-[24px] font-bold tracking-[-0.04em] md:text-[30px]">주변</h2>
            <ul className="mt-5 grid gap-2.5" style={{ color: C.sub }}>
              <li>계곡 물놀이터 차로 5분</li>
              <li>자작나무 숲길 산책 왕복 1시간</li>
              <li>읍내 하나로마트 차로 12분</li>
            </ul>
          </div>
          <div className="flex flex-col justify-between rounded-[28px] p-8 text-white md:p-10" style={{ background: C.green }}>
            <div>
              <h2 className="text-[24px] font-bold tracking-[-0.04em] md:text-[30px]">예약</h2>
              <p className="mt-3 text-white/80">남은 날짜와 객실은 네이버 예약에서 바로 보고 고르실 수 있습니다.</p>
            </div>
            <div className="mt-8"><span className="inline-flex h-14 shrink-0 items-center rounded-full px-7 text-[17px] font-bold text-white" style={{ background: "#03c75a" }}>네이버 예약</span></div>
          </div>
        </div>
      </section>

      <footer className="border-t px-5 py-10 text-[14px] md:px-8" style={{ borderColor: C.line, color: C.sub }}>
        <div className="mx-auto flex max-w-[1200px] flex-col gap-2 md:flex-row md:justify-between">
          <p>숲채 STAY, 강원특별자치도 홍천군 일대. 농어촌민박사업 신고번호 제000호</p>
          <p>033-000-0000</p>
        </div>
      </footer>
    </div>
  );
}
