"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";

// 운전 학원 시안 B 도로 연수형(11-22 사례 분석: 면허를 딴 뒤 운전을 쉰 사람은 면허 종류보다 몇 시간이면 되는지, 주차와 고속도로를 따로 배울 수 있는지, 어떤 차로 연습하는지를 묻는다). 흰 바탕, 검정과 파랑. 인물 없음. 메인 한 장, 기능 없음.
// 사진: Unsplash 무료 라이선스(public/images/drafts/drv/b-*)
const IMG = "/images/drafts/drv";
const C = { ink: "#111418", sub: "#5f6670", line: "#e4e7ec", soft: "#f3f5f8", blue: "#1d5bd8" };

const COURSES = [
  ["기본 연수", "10시간", "5일, 하루 2시간", "차선 변경, 좌회전, 신호 교차로"],
  ["주차 집중", "4시간", "2일", "평행 주차, 후진 주차, 기계식 주차장"],
  ["고속도로", "4시간", "2일", "합류, 추월 차로, 나들목 빠지기"],
  ["출퇴근길", "6시간", "3일", "집에서 회사까지 실제 경로 반복"],
];

export function DrvB() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.75] md:text-[17px]" style={{ color: C.ink }}>
      <header className="absolute inset-x-0 z-20 text-white">
        <div className="mx-auto flex h-[78px] max-w-[1320px] items-center justify-between px-5 md:px-10">
          <p className="text-[18px] font-bold tracking-[-0.02em]">
            다시 <span style={{ color: "#7fa8ff" }}>운전연수</span>
          </p>
          <nav aria-label="주 메뉴" className="hidden gap-10 text-[15px] font-medium text-white/85 lg:flex">
            {["연수 과정", "연수 차량", "진행 순서", "상담"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </nav>
          <span className="inline-flex h-10 items-center border border-white/70 px-5 text-[14px] font-bold">연수 상담</span>
        </div>
      </header>

      <section className="relative flex min-h-[620px] items-end overflow-hidden bg-black text-white md:h-[96svh]">
        <Image src={`${IMG}/b-hero.jpg`} alt="해 질 녘 운전석에서 본 계기판과 앞 도로" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/45" aria-hidden />
        <div className="relative mx-auto flex w-full max-w-[1320px] flex-col gap-6 px-5 pb-16 md:flex-row md:items-end md:justify-between md:px-10 md:pb-24">
          <h1 className="text-[38px] font-bold leading-[1.22] tracking-[-0.045em] md:text-[68px]">
            장롱 면허,
            <br />
            10시간이면 혼자 나갑니다
          </h1>
          <p className="max-w-[360px] text-white/75">보조 브레이크가 달린 연수 차량으로 시작합니다. 마지막 이틀은 타실 차로 같은 길을 다시 달립니다.</p>
        </div>
      </section>

      <section className="px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-[1320px]">
          <p className="text-[13px] font-bold tracking-[0.26em]" style={{ color: C.blue }}>COURSE</p>
          <h2 className="mt-4 text-[32px] font-bold tracking-[-0.04em] md:text-[46px]">연수 과정</h2>
          <ul className="mt-12 border-t" style={{ borderColor: C.ink }}>
            {COURSES.map(([t, h, days, d]) => (
              <li key={t} className="grid gap-1 border-b py-6 md:grid-cols-[1fr_0.5fr_0.7fr_1.8fr] md:items-center md:gap-8" style={{ borderColor: C.line }}>
                <h3 className="text-[24px] font-bold tracking-[-0.03em]">{t}</h3>
                <p className="text-[20px] font-bold tabular-nums" style={{ color: C.blue }}>{h}</p>
                <p className="font-semibold">{days}</p>
                <p style={{ color: C.sub }}>{d}</p>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-[15px]" style={{ color: C.sub }}>강사 1명이 수강생 1명만 맡습니다. 과정은 섞어서 들을 수 있습니다.</p>
        </div>
      </section>

      <section className="px-5 md:px-10" style={{ background: C.soft }}>
        <div className="mx-auto grid max-w-[1320px] gap-3 py-20 md:grid-cols-2 md:py-28">
          {[
            {
              f: "b-highway",
              alt: "가로등이 선 회색 아스팔트 도로와 차선",
              t: "연수 차량",
              rows: [
                ["차종", "준중형 자동 변속기 승용차"],
                ["장치", "조수석 보조 브레이크, 후방 카메라"],
                ["보험", "연수 중 사고 종합보험 가입"],
              ],
            },
            {
              f: "b-ic",
              alt: "위에서 내려다본 고속도로 나들목",
              t: "진행 순서",
              rows: [
                ["1일", "학원 주변 이면도로, 기본 조작"],
                ["2 ~ 3일", "왕복 4차선 시내, 교차로"],
                ["4 ~ 5일", "타실 차로 출퇴근길, 주차"],
              ],
            },
          ].map((x) => (
            <div key={x.t} className="bg-white">
              <div className="relative aspect-[16/9]">
                <Image src={`${IMG}/${x.f}.jpg`} alt={x.alt} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
              </div>
              <div className="p-7 md:p-9">
                <h3 className="text-[24px] font-bold tracking-[-0.03em]">{x.t}</h3>
                <dl className="mt-4">
                  {x.rows.map(([k, v]) => (
                    <div key={k} className="grid grid-cols-[76px_1fr] gap-3 border-b py-3" style={{ borderColor: C.line }}>
                      <dt style={{ color: C.sub }}>{k}</dt>
                      <dd className="font-semibold">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto flex max-w-[1320px] flex-col gap-6 bg-black p-8 text-white md:flex-row md:items-center md:justify-between md:p-12">
          <div>
            <h2 className="text-[26px] font-bold tracking-[-0.04em] md:text-[34px]">연수 상담</h2>
            <p className="mt-2 text-white/70">면허를 딴 해와 마지막으로 운전한 때를 알려 주시면 맞는 과정과 시간을 정해 드립니다.</p>
          </div>
          <p className="inline-flex shrink-0 items-center gap-2 text-[22px] font-bold tabular-nums" style={{ color: "#7fa8ff" }}>
            031-000-0000 <ArrowRight size={20} aria-hidden />
          </p>
        </div>
      </section>

      <footer className="border-t px-5 py-10 text-[14px] md:px-10" style={{ borderColor: C.line, color: C.sub }}>
        <div className="mx-auto flex max-w-[1320px] flex-col gap-2 md:flex-row md:justify-between">
          <p>다시 운전연수, 경기도 성남시 분당구 일대. 자동차운전학원 등록번호 제000호</p>
          <p>031-000-0000</p>
        </div>
      </footer>
    </div>
  );
}
