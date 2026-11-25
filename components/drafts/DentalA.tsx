"use client";

import Image from "next/image";
import { Menu, Phone } from "lucide-react";
import { MonthSchedule } from "./MonthSchedule";

// 치과 시안 A 블랙 그리드형(11-24 다시 만듦). 참고: 아임웹 전문가 포트폴리오의 고덕이래치과(검정 헤더, 가운데 로고, 격자 메뉴표, 직선 구성).
// 다른 시안의 헤더, 영어 한 줄, 두 줄 제목, 하단 고정 버튼 구성을 쓰지 않는다. 모서리는 전부 직각, 선은 1px 검정. 메인 한 장, 기능 없음, 인물 없음.
// 사진: public/images/demo-dental(로비, CT, 임플란트, 교정, 기구), public/images/drafts/dent(진료실)
const D = "/images/demo-dental";
const R = "/images/drafts/dent";
const C = { ink: "#111111", sub: "#5f6368", line: "#111111", hair: "#d9d9d9", soft: "#f3f3f3", blue: "#0b78c2" };
const TEL = "02-000-0000";

const MENU = ["병원 소개", "5가지 약속", "진료 과목", "장비 소개", "둘러보기", "진료 안내", "오시는 길", ""];

const PROMISE = [
  { t: "필요한 치료만 권합니다", d: "당장 필요한 치료와 지켜봐도 되는 치료를 나눠 설명합니다." },
  { t: "진료 전에 비용을 안내합니다", d: "치료 순서, 횟수, 비급여 비용을 서면으로 먼저 드립니다." },
  { t: "기구는 1인 1기구로 씁니다", d: "환자마다 멸균 포장을 새로 열어 사용합니다." },
  { t: "담당 의사가 끝까지 진료합니다", d: "상담한 의사가 치료와 경과 확인까지 맡습니다." },
  { t: "치료 후 정기 검진을 안내합니다", d: "6개월마다 검진 일정을 문자로 알려 드립니다." },
];

const CARE = [
  { t: "임플란트", d: "3D CT로 뼈 두께와 신경 위치를 확인하고 식립 위치를 설계합니다.", img: `${D}/implant.jpg`, alt: "임플란트 구조 모형" },
  { t: "치아교정", d: "투명교정과 설측교정을 상담에서 비교해 드립니다.", img: `${D}/ortho.jpg`, alt: "투명 교정 장치" },
  { t: "일반 진료", d: "충치, 신경치료, 잇몸 치료, 정기 검진, 스케일링을 진료합니다.", img: `${D}/scaling.jpg`, alt: "멸균 트레이 위의 진료 기구" },
  { t: "정밀 진단", d: "3D CT와 구강 스캐너로 촬영하고 화면으로 설명합니다.", img: `${D}/ct.jpg`, alt: "태블릿으로 보는 치아 CT 영상" },
];

const HOURS = [
  ["월, 수, 금", "09:30 ~ 18:30"],
  ["화, 목", "09:30 ~ 21:00"],
  ["토요일", "09:30 ~ 14:00"],
  ["점심시간", "13:00 ~ 14:00"],
  ["일요일과 공휴일", "휴진"],
];

function Tooth({ size = 22, color = "#fff" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M7.2 2.6c-2.6 0-4.4 2-4.4 4.8 0 2.2.8 3.6 1.3 5.6.5 2 .6 4.3 1 6.2.3 1.4.9 2.2 1.8 2.2 1.1 0 1.5-1 1.8-2.6.3-1.7.5-3.6 3.3-3.6s3 1.9 3.3 3.6c.3 1.6.7 2.6 1.8 2.6.9 0 1.5-.8 1.8-2.2.4-1.9.5-4.2 1-6.2.5-2 1.3-3.4 1.3-5.6 0-2.8-1.8-4.8-4.4-4.800-1.700 0-2.900.9-4.800.9s-3.100-.9-4.800-.9z" fill={color} />
    </svg>
  );
}

const H2 = "text-[26px] font-bold tracking-[-0.04em] md:text-[38px]";

export function DentalA() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.7] md:text-[17px]" style={{ color: C.ink }}>
      <header className="sticky top-0 z-20 text-white" style={{ background: C.ink }}>
        <div className="mx-auto grid h-[58px] max-w-[1200px] grid-cols-[48px_1fr_48px] items-center px-2 md:h-[68px] md:px-6">
          <span className="grid h-11 w-11 place-items-center" aria-hidden>
            <Menu size={22} />
          </span>
          <p className="flex items-center justify-center gap-2 text-[19px] font-bold tracking-[-0.02em] md:text-[22px]">
            <Tooth />
            서로치과의원
          </p>
          <span className="grid h-11 w-11 place-items-center justify-self-end" role="img" aria-label={`전화 ${TEL}`}>
            <Phone size={20} aria-hidden />
          </span>
        </div>
      </header>

      <nav aria-label="주 메뉴" className="border-b" style={{ borderColor: C.line }}>
        <ul className="mx-auto grid max-w-[1200px] grid-cols-3 text-center text-[14.5px] font-semibold md:text-[16px]" role="list">
          {MENU.map((m, i) => (
            <li
              key={i}
              className="flex min-h-[46px] items-center justify-center border-b border-r md:min-h-[54px] [&:nth-child(3n)]:border-r-0 [&:nth-last-child(-n+3)]:border-b-0"
              style={{ borderColor: C.hair, background: i === 0 ? C.ink : "#fff", color: i === 0 ? "#fff" : "#3c4043" }}
            >
              {m}
            </li>
          ))}
        </ul>
      </nav>

      <section className="border-b" style={{ borderColor: C.line }}>
        <div className="mx-auto max-w-[1200px] md:grid md:grid-cols-[1.25fr_1fr]">
          <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[520px]">
            <Image src={`${D}/lobby.jpg`} alt="접수 데스크와 대기 공간이 있는 치과 로비" fill priority sizes="(min-width: 768px) 56vw, 100vw" className="object-cover" />
          </div>
          <div className="flex flex-col justify-between gap-10 px-5 py-9 md:border-l md:px-10 md:py-12" style={{ borderColor: C.line }}>
            <h1 className="text-[34px] font-bold leading-[1.25] tracking-[-0.05em] md:text-[52px]">
              정확하게 진단하고
              <br />
              필요한 치료만 합니다
            </h1>
            <dl className="border-t" style={{ borderColor: C.line }}>
              {[
                ["진료 시간", "평일 09:30 ~ 18:30"],
                ["야간 진료", "화, 목 21:00까지"],
                ["대표전화", TEL],
              ].map(([k, v]) => (
                <div key={k} className="flex items-baseline justify-between gap-4 border-b py-3.5" style={{ borderColor: C.hair }}>
                  <dt className="text-[15px]" style={{ color: C.sub }}>{k}</dt>
                  <dd className="text-[18px] font-bold tabular-nums md:text-[20px]">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="border-b" style={{ borderColor: C.line }}>
        <div className="mx-auto max-w-[1200px] px-5 py-14 md:grid md:grid-cols-[300px_1fr] md:gap-12 md:px-10 md:py-24">
          <h2 className={H2}>5가지 약속</h2>
          <ol className="mt-7 border-t md:mt-0" style={{ borderColor: C.line }} role="list">
            {PROMISE.map((p, i) => (
              <li key={p.t} className="grid grid-cols-[44px_1fr] gap-x-2 border-b py-5 md:grid-cols-[64px_1fr_1.2fr] md:items-baseline md:gap-x-6" style={{ borderColor: C.hair }}>
                <span className="text-[22px] font-bold tabular-nums md:text-[26px]" style={{ color: C.blue }}>{i + 1}</span>
                <h3 className="text-[19px] font-bold tracking-[-0.03em] md:text-[21px]">{p.t}</h3>
                <p className="col-start-2 text-[15.5px] md:col-start-3 md:text-[16px]" style={{ color: C.sub }}>{p.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-b" style={{ borderColor: C.line }}>
        <div className="mx-auto max-w-[1200px] px-5 pt-14 md:px-10 md:pt-24">
          <h2 className={H2}>진료 과목</h2>
        </div>
        <ul className="mx-auto mt-8 grid max-w-[1200px] grid-cols-2 border-t md:mt-10 md:grid-cols-4" style={{ borderColor: C.line }} role="list">
          {CARE.map((c) => (
            <li key={c.t} className="border-b border-r [&:nth-child(2n)]:border-r-0 md:border-b-0 md:[&:nth-child(2n)]:border-r md:[&:nth-child(4n)]:border-r-0" style={{ borderColor: C.hair }}>
              <div className="relative aspect-square">
                <Image src={c.img} alt={c.alt} fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
              </div>
              <div className="px-4 py-5 md:px-6 md:py-7">
                <h3 className="text-[20px] font-bold tracking-[-0.03em] md:text-[23px]">{c.t}</h3>
                <p className="mt-1.5 text-[14.5px] leading-[1.6] md:text-[15.5px]" style={{ color: C.sub }}>{c.d}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-b" style={{ borderColor: C.line, background: C.soft }}>
        <div className="mx-auto max-w-[1200px] px-5 py-14 md:grid md:grid-cols-[300px_1fr] md:gap-12 md:px-10 md:py-24">
          <div>
            <h2 className={H2}>진료 안내</h2>
            <p className="mt-3 text-[15.5px] md:text-[16px]" style={{ color: C.sub }}>휴진일과 야간 진료일은 매달 달력에 먼저 공지합니다.</p>
          </div>
          <div className="mt-7 border md:mt-0" style={{ borderColor: C.line }}>
            <MonthSchedule accent="#c2412d" night={C.blue} rounded={0} />
          </div>
        </div>
      </section>

      <section className="border-b" style={{ borderColor: C.line }}>
        <div className="mx-auto max-w-[1200px] px-5 pt-14 md:px-10 md:pt-24">
          <h2 className={H2}>둘러보기</h2>
        </div>
        <div className="mx-auto mt-8 grid max-w-[1200px] border-t md:mt-10 md:grid-cols-[1.6fr_1fr]" style={{ borderColor: C.line }}>
          <div className="relative aspect-[3/2] md:aspect-auto md:min-h-[480px]">
            <Image src={`${R}/a-room.jpg`} alt="진료 의자가 놓인 밝은 독립 진료실" fill sizes="(min-width: 768px) 60vw, 100vw" className="object-cover" />
          </div>
          <dl className="grid grid-cols-2 content-center md:border-l" style={{ borderColor: C.line }}>
            {[
              ["독립 진료실", "6실"],
              ["3D CT", "보유"],
              ["구강 스캐너", "보유"],
              ["주차", "건물 내 2시간"],
            ].map(([k, v]) => (
              <div key={k} className="border-b border-r px-5 py-7 [&:nth-child(2n)]:border-r-0 md:px-8 md:py-10" style={{ borderColor: C.hair }}>
                <dt className="text-[14.5px]" style={{ color: C.sub }}>{k}</dt>
                <dd className="mt-1 text-[22px] font-bold tracking-[-0.03em] md:text-[26px]">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="text-white" style={{ background: C.ink }}>
        <div className="mx-auto grid max-w-[1200px] gap-10 px-5 py-14 md:grid-cols-2 md:gap-16 md:px-10 md:py-24">
          <div>
            <h2 className={H2}>진료 시간</h2>
            <dl className="mt-6 border-t border-white/40">
              {HOURS.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 border-b border-white/20 py-3.5 text-[16.5px] md:text-[18px]">
                  <dt className="text-white/70">{k}</dt>
                  <dd className="font-bold tabular-nums">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div>
            <h2 className={H2}>오시는 길</h2>
            <dl className="mt-6 border-t border-white/40">
              {[
                ["주소", "서울특별시 송파구 일대"],
                ["지하철", "2번 출구 앞 건물 3층"],
                ["대표전화", TEL],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 border-b border-white/20 py-3.5 text-[16.5px] md:text-[18px]">
                  <dt className="text-white/70">{k}</dt>
                  <dd className="text-right font-bold tabular-nums">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <footer className="px-5 py-8 text-center text-[14px] md:px-10" style={{ color: C.sub }}>
        <p className="flex items-center justify-center gap-1.5 font-bold" style={{ color: C.ink }}>
          <Tooth size={16} color={C.ink} />
          서로치과의원
        </p>
        <p className="mt-1">서울특별시 송파구 일대 | 대표전화 {TEL}</p>
      </footer>
    </div>
  );
}
