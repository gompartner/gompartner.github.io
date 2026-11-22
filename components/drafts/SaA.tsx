"use client";

import Image from "next/image";
import { Check } from "lucide-react";

// 재고 관리 SaaS 시안 A 제품 화면형(11-22 사례 분석: 채널톡 요금 페이지처럼 요금제 4칸과 기능별 비교, 세이프솔루션처럼 IT 회사 소개. 소상공인 사장님은 무엇을 해 주는지 화면으로 보고, 월 얼마인지, 엑셀에서 옮길 수 있는지를 묻는다). 흰 바탕, 남색과 초록. 인물 없음. 메인 한 장, 기능 없음.
// 사진: Unsplash 무료 라이선스(public/images/drafts/sa/a-*)
const IMG = "/images/drafts/sa";
const C = { ink: "#0f172a", sub: "#5b6475", line: "#e2e8f0", soft: "#f4f7fb", navy: "#1e3a8a", green: "#16a34a", greenSoft: "#e7f6ec" };

const ROWS = [
  ["원두 1kg 블렌드", "24", "10", "정상"],
  ["우유 1L", "6", "12", "발주"],
  ["테이크아웃 컵 16oz", "340", "200", "정상"],
  ["바닐라 시럽", "2", "3", "발주"],
];

const PLANS = [
  ["스타터", "월 9,900원", "매장 1곳, 품목 300개", ["재고 입출고", "부족 알림", "엑셀 가져오기"]],
  ["스탠다드", "월 29,000원", "매장 3곳, 품목 무제한", ["스타터 전부", "자동 발주서", "매장 간 이동"]],
  ["프로", "월 59,000원", "매장 10곳, 품목 무제한", ["스탠다드 전부", "POS 연동", "원가, 마진 보고서"]],
] as const;

export function SaA() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.75] md:text-[17px]" style={{ color: C.ink }}>
      <header className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur" style={{ borderColor: C.line }}>
        <div className="mx-auto flex h-[70px] max-w-[1200px] items-center justify-between px-5 md:px-8">
          <p className="text-[20px] font-bold tracking-[-0.03em]">
            재고<span style={{ color: C.green }}>노트</span>
          </p>
          <nav aria-label="주 메뉴" className="hidden gap-9 text-[15px] font-semibold lg:flex" style={{ color: "#3f4859" }}>
            {["기능", "요금제", "도입 순서", "도입 문의"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </nav>
          <span className="inline-flex h-11 items-center rounded-lg px-5 text-[15px] font-bold text-white" style={{ background: C.navy }}>
            14일 무료 체험
          </span>
        </div>
      </header>

      <section className="px-5 pb-16 pt-10 md:px-8 md:pb-24 md:pt-14">
        <div className="mx-auto grid max-w-[1200px] items-center gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-14">
          <div>
            <p className="text-[15px] font-bold" style={{ color: C.green }}>카페, 소매점 재고 관리</p>
            <h1 className="mt-4 text-[36px] font-bold leading-[1.24] tracking-[-0.045em] md:text-[54px]">
              우유 떨어지기 전에
              <br />
              먼저 알려 드립니다
            </h1>
            <p className="mt-5 max-w-[460px] text-[17px] md:text-[18px]" style={{ color: C.sub }}>
              품목마다 최소 수량을 정해 두면, 그 아래로 내려갈 때 휴대폰으로 알림이 오고 발주서가 만들어집니다.
            </p>
          </div>
          <div className="overflow-hidden rounded-[20px] border bg-white shadow-[0_20px_50px_-20px_rgba(15,23,42,0.25)]" style={{ borderColor: C.line }} aria-label="재고 화면 예시" role="img">
            <div className="flex items-center justify-between border-b px-5 py-3" style={{ borderColor: C.line, background: C.soft }}>
              <span className="text-[14px] font-bold">성수점 재고</span>
              <span className="rounded-full px-2.5 py-0.5 text-[13px] font-bold" style={{ background: "#fdecec", color: "#c2410c" }}>발주 필요 2</span>
            </div>
            <div className="grid grid-cols-[1.6fr_0.6fr_0.6fr_0.6fr] gap-2 border-b px-5 py-2 text-[13px] font-semibold" style={{ borderColor: C.line, color: C.sub }}>
              <span>품목</span>
              <span className="text-right">현재</span>
              <span className="text-right">최소</span>
              <span className="text-right">상태</span>
            </div>
            {ROWS.map(([n, q, min, s]) => (
              <div key={n} className="grid grid-cols-[1.6fr_0.6fr_0.6fr_0.6fr] items-center gap-2 border-b px-5 py-3 text-[14px] last:border-b-0 md:text-[15px]" style={{ borderColor: C.line }}>
                <span className="font-semibold">{n}</span>
                <span className="text-right tabular-nums">{q}</span>
                <span className="text-right tabular-nums" style={{ color: C.sub }}>{min}</span>
                <span className="text-right text-[13px] font-bold" style={{ color: s === "발주" ? "#c2410c" : C.green }}>{s}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28" style={{ background: C.soft }}>
        <div className="mx-auto max-w-[1200px]">
          <h2 className="text-[30px] font-bold tracking-[-0.04em] md:text-[44px]">요금제</h2>
          <p className="mt-3" style={{ color: C.sub }}>연 결제 시 2개월 무료. 부가세 별도.</p>
          <ul className="mt-10 grid gap-4 md:grid-cols-3">
            {PLANS.map(([t, p, scope, feats], i) => (
              <li key={t} className="flex flex-col rounded-[20px] border bg-white p-7" style={{ borderColor: i === 1 ? C.navy : C.line, borderWidth: i === 1 ? 2 : 1 }}>
                <h3 className="text-[21px] font-bold">{t}</h3>
                <p className="mt-2 text-[26px] font-bold tabular-nums tracking-[-0.02em]" style={{ color: C.navy }}>{p}</p>
                <p className="mt-1 text-[15px]" style={{ color: C.sub }}>{scope}</p>
                <ul className="mt-5 grid gap-2 border-t pt-5" style={{ borderColor: C.line }}>
                  {feats.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-[15px]">
                      <Check size={16} style={{ color: C.green }} aria-hidden /> {f}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto grid max-w-[1200px] items-center gap-10 md:grid-cols-[1fr_1.1fr] md:gap-16">
          <div>
            <h2 className="text-[28px] font-bold leading-[1.35] tracking-[-0.04em] md:text-[38px]">도입 순서</h2>
            <ol className="mt-7 grid gap-3">
              {[
                ["1일", "쓰던 엑셀 재고표를 그대로 올립니다"],
                ["2일", "품목별 최소 수량, 거래처를 정합니다"],
                ["3일", "직원 휴대폰에 앱 설치, 입출고 시작"],
                ["2주 뒤", "발주 주기와 남는 재고를 함께 점검"],
              ].map(([k, v]) => (
                <li key={k} className="flex gap-4 border-b pb-3" style={{ borderColor: C.line }}>
                  <span className="w-[56px] shrink-0 font-bold tabular-nums" style={{ color: C.green }}>{k}</span>
                  <span>{v}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[20px]">
            <Image src={`${IMG}/a-room.jpg`} alt="상자와 포장재가 쌓인 밝은 창고" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="px-5 pb-20 md:px-8 md:pb-28">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-6 rounded-[24px] p-8 text-white md:flex-row md:items-center md:justify-between md:p-12" style={{ background: C.navy }}>
          <div>
            <h2 className="text-[26px] font-bold tracking-[-0.04em] md:text-[34px]">도입 문의</h2>
            <p className="mt-2 text-white/75">매장 수와 품목 수를 알려 주시면 맞는 요금제와 옮기는 방법을 안내해 드립니다.</p>
          </div>
          <p className="shrink-0 text-[26px] font-bold tabular-nums">1600-0000</p>
        </div>
      </section>

      <footer className="border-t px-5 py-10 text-[14px] md:px-8" style={{ borderColor: C.line, color: C.sub }}>
        <div className="mx-auto flex max-w-[1200px] flex-col gap-2 md:flex-row md:justify-between">
          <p>(주)재고노트, 서울특별시 성동구 일대. 사업자등록번호 000-00-00000</p>
          <p>1600-0000</p>
        </div>
      </footer>
    </div>
  );
}
