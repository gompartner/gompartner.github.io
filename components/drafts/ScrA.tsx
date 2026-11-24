"use client";

import Image from "next/image";
import { ArrowRight, Building2, FileText, Home, Landmark } from "lucide-react";

// 법무사 시안 A 등기 전문형(11-22 사례 분석: 한정아 법무사처럼 첫 화면 바로 아래 업무 띠. 손님은 등기 비용이 무엇으로 이뤄지는지, 잔금일에 무엇을 들고 가는지 먼저 찾는다). 흰 바탕, 남색. 인물 없음. 메인 한 장, 기능 없음.
// 사진: Unsplash 무료 라이선스(public/images/drafts/scr/a-*)
const IMG = "/images/drafts/scr";
const C = { ink: "#121a2b", sub: "#5a6375", line: "#e2e6ee", soft: "#f3f5f9", navy: "#1c2f5a" };

const WORKS = [
  { i: Home, t: "부동산 등기", d: "매매, 증여, 상속 소유권 이전" },
  { i: Building2, t: "법인 등기", d: "설립, 임원 변경, 본점 이전" },
  { i: Landmark, t: "공탁과 집행", d: "변제 공탁, 강제집행 신청" },
  { i: FileText, t: "근저당 설정, 말소", d: "대출 실행일 당일 접수" },
];

export function ScrA() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.75] md:text-[17px]" style={{ color: C.ink }}>
      <header className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur" style={{ borderColor: C.line }}>
        <div className="mx-auto flex h-[72px] max-w-[1240px] items-center justify-between px-5 md:px-8">
          <p className="text-[20px] font-bold tracking-[-0.03em]" style={{ color: C.navy }}>
            한빛 법무사사무소
          </p>
          <nav aria-label="주 메뉴" className="hidden gap-9 text-[15px] font-semibold lg:flex" style={{ color: "#3c4556" }}>
            {["업무 안내", "등기 비용", "필요 서류", "오시는 길"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </nav>
          <span className="inline-flex h-11 items-center px-5 text-[15px] font-bold text-white" style={{ background: C.navy }}>
            02-000-0000
          </span>
        </div>
      </header>

      <section className="px-5 pt-10 md:px-8 md:pt-16">
        <div className="mx-auto grid max-w-[1240px] items-end gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
          <div className="pb-2 lg:pb-14">
            <p className="text-[15px] font-bold" style={{ color: C.navy }}>서울중앙지방법원 등기국 앞</p>
            <h1 className="mt-4 text-[36px] font-bold leading-[1.24] tracking-[-0.045em] md:text-[58px]">
              잔금일 등기,
              <br />
              당일 접수합니다
            </h1>
            <p className="mt-5 max-w-[470px] text-[17px] md:text-[18px]" style={{ color: C.sub }}>
              매매 잔금일에 법무사가 직접 현장에 나가 서류를 확인하고, 그날 등기소에 접수합니다. 견적은 비용 항목별로 나눠 드립니다.
            </p>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden lg:aspect-[5/4]">
            <Image src={`${IMG}/a-hero.jpg`} alt="나란히 선 고층 아파트 두 동" fill priority sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="px-5 md:px-8">
        <ul className="mx-auto grid max-w-[1240px] grid-cols-2 text-white lg:grid-cols-4" style={{ background: C.navy }}>
          {WORKS.map(({ i: Icon, t, d }, k) => (
            <li key={t} className={`flex flex-col gap-3 p-6 md:p-8 ${k % 2 ? "border-l border-white/15" : ""} ${k > 1 ? "border-t border-white/15 lg:border-t-0" : ""} ${k === 2 ? "lg:border-l" : ""}`}>
              <Icon size={26} aria-hidden className="text-white/80" />
              <div>
                <p className="text-[18px] font-bold md:text-[20px]">{t}</p>
                <p className="text-[14px] text-white/65 md:text-[15px]">{d}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto grid max-w-[1240px] gap-10 md:grid-cols-[1fr_1.2fr] md:gap-16">
          <div>
            <h2 className="text-[30px] font-bold leading-[1.35] tracking-[-0.04em] md:text-[42px]">등기 비용은 이렇게 나뉩니다</h2>
            <p className="mt-4" style={{ color: C.sub }}>
              견적서 금액 대부분은 세금과 공과금입니다. 법무사 보수는 따로 적어 드리고, 공과금은 영수증 그대로 전달합니다.
            </p>
            <div className="relative mt-8 aspect-[4/3] overflow-hidden">
              <Image src={`${IMG}/a-docs.jpg`} alt="나무 책상 위에 놓인 서류와 펜" fill sizes="(min-width: 768px) 40vw, 100vw" className="object-cover" />
            </div>
          </div>
          <dl className="self-start border-t-2" style={{ borderColor: C.navy }}>
            {[
              ["취득세와 지방교육세", "주택 가격과 보유 주택 수에 따라 1 ~ 12%"],
              ["국민주택채권", "매입 후 바로 매도, 할인 비용만 부담"],
              ["등기신청 수수료", "대법원 수수료, 부동산 1건 기준"],
              ["인지세", "거래 금액 1억 원 초과 시"],
              ["법무사 보수", "대한법무사협회 보수 기준 안에서 안내"],
              ["교통비와 제증명", "현장 출장, 등본 발급 실비"],
            ].map(([k, v]) => (
              <div key={k} className="grid gap-1 border-b py-5 sm:grid-cols-[200px_1fr] sm:gap-6" style={{ borderColor: C.line }}>
                <dt className="font-bold">{k}</dt>
                <dd style={{ color: C.sub }}>{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28" style={{ background: C.soft }}>
        <div className="mx-auto max-w-[1240px]">
          <h2 className="text-[30px] font-bold tracking-[-0.04em] md:text-[42px]">매매 잔금일 진행 순서</h2>
          <ol className="mt-12 grid gap-px md:grid-cols-4" style={{ background: C.line }}>
            {[
              ["잔금 3일 전", "등기부 확인, 비용 견적 확정"],
              ["잔금일 오전", "현장에서 매도인 서류와 신분 확인"],
              ["잔금 송금 후", "취득세 신고, 채권 매입"],
              ["당일 오후", "등기소 접수, 접수증 전달"],
            ].map(([k, v], i) => (
              <li key={k} className="bg-white p-7 md:p-8">
                <p className="text-[14px] font-bold tabular-nums" style={{ color: C.navy }}>{i + 1}단계</p>
                <p className="mt-3 text-[21px] font-bold tracking-[-0.03em]">{k}</p>
                <p className="mt-1 text-[15px]" style={{ color: C.sub }}>{v}</p>
              </li>
            ))}
          </ol>
          <p className="mt-6 text-[15px]" style={{ color: C.sub }}>등기 완료 후 등기필정보는 1 ~ 2주 안에 우편 또는 방문으로 전달합니다.</p>
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto grid max-w-[1240px] items-center gap-10 md:grid-cols-2 md:gap-16">
          <div>
            <h2 className="text-[30px] font-bold leading-[1.35] tracking-[-0.04em] md:text-[42px]">매수인이 준비할 서류</h2>
            <ul className="mt-8 grid gap-3">
              {[
                "주민등록등본 (주소 변동 있으면 초본도)",
                "신분증과 도장",
                "매매계약서 원본, 부동산거래신고필증",
                "대출이 있으면 은행 대출 실행 일정",
              ].map((x) => (
                <li key={x} className="flex items-start gap-3 border-b pb-3" style={{ borderColor: C.line }}>
                  <span className="mt-[11px] h-1.5 w-1.5 shrink-0" style={{ background: C.navy }} aria-hidden />
                  {x}
                </li>
              ))}
            </ul>
            <p className="mt-8 inline-flex items-center gap-1.5 font-bold" style={{ color: C.navy }}>
              상속, 증여 서류 보기 <ArrowRight size={18} aria-hidden />
            </p>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden">
            <Image src={`${IMG}/a-pen.jpg`} alt="겹쳐 놓은 서류 위의 만년필" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      <footer className="px-5 py-10 text-[14px] text-white/70 md:px-8" style={{ background: C.navy }}>
        <div className="mx-auto flex max-w-[1240px] flex-col gap-2 md:flex-row md:justify-between">
          <p>한빛 법무사사무소, 서울특별시 서초구 일대. 법무사, 사업자등록번호 000-00-00000</p>
          <p>평일 09:00 ~ 18:00, 02-000-0000</p>
        </div>
      </footer>
    </div>
  );
}
