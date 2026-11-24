"use client";

import Image from "next/image";
import { ShieldCheck } from "lucide-react";

// 자동차 디테일링 시안 A PPF 스튜디오형(11-22 사례 분석: 오늘의카 CW디테일링, 킹즈디테일링처럼 어두운 차 사진과 시공 분야(PPF, 유리막, 썬팅), 숨고, 당근 업체처럼 보증을 앞에. 손님은 얼마나, 며칠, 보증을 묻는다). 흰 바탕에 검정 첫 화면. 인물 없음. 메인 한 장, 기능 없음.
// 사진: Unsplash 무료 라이선스(public/images/drafts/car/a-*)
const IMG = "/images/drafts/car";
const C = { ink: "#0d0d0d", sub: "#666", line: "#e6e6e6", soft: "#f4f4f4", red: "#d6322b" };

const WORKS = [
  ["PPF 전체", "차 전체를 투명 보호 필름으로 감쌉니다", "4 ~ 5일"],
  ["PPF 생활 보호", "도어컵, 도어 엣지, 사이드 스텝, 트렁크 하단", "당일"],
  ["유리막 코팅", "광택 후 코팅, 세차가 쉬워지고 물때가 덜 남음", "2일"],
  ["열차단 썬팅", "전면, 측후면, 썬루프 필름", "당일"],
];

export function CarA() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.75] md:text-[17px]" style={{ color: C.ink }}>
      <header className="absolute inset-x-0 z-20 text-white">
        <div className="mx-auto flex h-[78px] max-w-[1320px] items-center justify-between px-5 md:px-10">
          <p className="text-[18px] font-bold tracking-[0.1em]">
            NOIR <span style={{ color: C.red }}>DETAIL</span>
          </p>
          <nav aria-label="주 메뉴" className="hidden gap-10 text-[14px] font-semibold tracking-[0.06em] text-white/85 md:flex">
            {["PPF", "COATING", "TINT", "WARRANTY", "CONTACT"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </nav>
          <span className="inline-flex h-10 items-center px-5 text-[14px] font-bold text-white" style={{ background: C.red }}>
            견적 문의
          </span>
        </div>
      </header>

      <section className="relative flex min-h-[640px] items-end overflow-hidden bg-black text-white md:h-[100svh]">
        <Image src={`${IMG}/a-hero.jpg`} alt="어두운 배경 속 윤곽만 빛나는 검은 세단" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/40" aria-hidden />
        <div className="relative mx-auto flex w-full max-w-[1320px] flex-col gap-8 px-5 pb-16 md:flex-row md:items-end md:justify-between md:px-10 md:pb-24">
          <h1 className="text-[40px] font-bold leading-[1.18] tracking-[-0.045em] md:text-[76px]">
            출고 첫날의 도장,
            <br />
            그대로 지킵니다
          </h1>
          <p className="max-w-[360px] text-white/75">PPF, 유리막 코팅, 썬팅 전문 시공. 먼지를 막은 전용 부스에서 한 번에 한 대만 작업합니다.</p>
        </div>
      </section>

      <section className="px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-[1320px]">
          <p className="text-[13px] font-bold tracking-[0.26em]" style={{ color: C.red }}>SERVICE</p>
          <h2 className="mt-4 text-[32px] font-bold tracking-[-0.04em] md:text-[48px]">시공 항목과 기간</h2>
          <ul className="mt-12 border-t" style={{ borderColor: C.ink }}>
            {WORKS.map(([t, d, p]) => (
              <li key={t} className="grid gap-1 border-b py-6 md:grid-cols-[1fr_2fr_auto] md:items-center md:gap-8" style={{ borderColor: C.line }}>
                <h3 className="text-[24px] font-bold tracking-[-0.03em]">{t}</h3>
                <p style={{ color: C.sub }}>{d}</p>
                <p className="text-[16px] font-bold tabular-nums">작업 {p}</p>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-[15px]" style={{ color: C.sub }}>견적은 차종, 연식, 필름 브랜드에 따라 달라 차량 번호와 원하시는 시공을 알려 주시면 회신합니다.</p>
        </div>
      </section>

      <section className="bg-black px-5 text-white md:px-10">
        <div className="mx-auto grid max-w-[1320px] gap-3 py-20 md:grid-cols-3 md:py-28">
          {[
            ["a-paint", "빛이 맺힌 짙은 갈색 보닛 표면"],
            ["a-light", "어둠 속 헤드라이트 윤곽"],
            ["a-mirror", "광택 나는 검은 차체와 사이드 미러"],
          ].map(([f, alt]) => (
            <div key={f} className="relative aspect-[4/5] overflow-hidden">
              <Image src={`${IMG}/${f}.jpg`} alt={alt} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" />
            </div>
          ))}
        </div>
      </section>

      <section className="px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto grid max-w-[1320px] gap-10 md:grid-cols-2 md:gap-16">
          <div>
            <p className="flex items-center gap-2 text-[15px] font-bold" style={{ color: C.red }}>
              <ShieldCheck size={18} aria-hidden /> WARRANTY
            </p>
            <h2 className="mt-4 text-[30px] font-bold leading-[1.35] tracking-[-0.04em] md:text-[42px]">시공 보증서를 드립니다</h2>
            <p className="mt-4" style={{ color: C.sub }}>필름 제조사 보증과 별도로 매장 시공 보증을 서면으로 드립니다. 들뜸, 기포, 변색은 기간 안에 다시 시공합니다.</p>
          </div>
          <dl className="self-end border-t" style={{ borderColor: C.ink }}>
            {[
              ["PPF", "필름 제조사 보증 기간 적용"],
              ["유리막 코팅", "시공일부터 2년, 6개월마다 점검"],
              ["썬팅", "필름 제조사 보증 기간 적용"],
              ["출고 전 검수", "조명 아래 함께 확인 후 인도"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 border-b py-4" style={{ borderColor: C.line }}>
                <dt className="font-bold">{k}</dt>
                <dd className="text-right" style={{ color: C.sub }}>{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <footer className="bg-black px-5 py-10 text-[14px] text-white/60 md:px-10">
        <div className="mx-auto flex max-w-[1320px] flex-col gap-2 md:flex-row md:justify-between">
          <p>누아르 디테일, 경기도 하남시 일대. 사업자등록번호 000-00-00000</p>
          <p>평일 09:00 ~ 19:00, 토요일 10:00 ~ 16:00, 031-000-0000</p>
        </div>
      </footer>
    </div>
  );
}
