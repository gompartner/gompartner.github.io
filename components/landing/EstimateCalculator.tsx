"use client";

import { useMemo, useState } from "react";
import { profile } from "@/data/profile";

// 예상 견적 계산기 — 기본 금액은 위시켓에 실제로 제안했던 금액 기준.
// 옵션 금액은 기준값이며 상담에서 범위를 확인해 확정한다.

export const baseTypes = [
  { id: "landing", name: "랜딩 페이지·퍼블리싱", price: 100, days: 5, includes: "디자인 시안 기반 반응형 퍼블리싱" },
  { id: "homepage", name: "회사 소개 홈페이지", price: 200, days: 14, includes: "5페이지 내외, 반응형, 문의 접수" },
  { id: "program", name: "업무 프로그램", price: 400, days: 30, includes: "입력·계산·출력 중심의 사내·원내용 프로그램" },
  { id: "legacy", name: "기존 시스템 고도화", price: 1000, days: 60, includes: "기존 소스 분석, 기능 추가·수정, 테스트" },
] as const;

const options = [
  { id: "pages", name: "페이지 5개 추가", price: 50, days: 5 },
  { id: "admin", name: "관리자 기능 (게시판·배너 관리)", price: 80, days: 7 },
  { id: "payment", name: "결제 연동", price: 100, days: 7 },
  { id: "english", name: "영문 페이지", price: 60, days: 5 },
  { id: "migration", name: "기존 데이터 이관", price: 100, days: 7 },
] as const;

type BaseId = (typeof baseTypes)[number]["id"];
type OptionId = (typeof options)[number]["id"];

const won = (man: number) => `${man.toLocaleString()}만 원`;

export function EstimateCalculator() {
  const [baseId, setBaseId] = useState<BaseId>("homepage");
  const [picked, setPicked] = useState<OptionId[]>([]);

  const base = baseTypes.find((b) => b.id === baseId)!;
  const { price, days } = useMemo(() => {
    const chosen = options.filter((o) => picked.includes(o.id));
    return {
      price: base.price + chosen.reduce((sum, o) => sum + o.price, 0),
      days: base.days + chosen.reduce((sum, o) => sum + o.days, 0),
    };
  }, [base, picked]);

  const toggle = (id: OptionId) =>
    setPicked((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));

  const mailBody = [
    `작업 종류: ${base.name}`,
    `추가 옵션: ${options.filter((o) => picked.includes(o.id)).map((o) => o.name).join(", ") || "없음"}`,
    `예상 견적: ${won(price)}, 약 ${days}일`,
    "",
    "요청 내용:",
  ].join("\n");
  const mailto = `mailto:${profile.email}?subject=${encodeURIComponent("견적 문의")}&body=${encodeURIComponent(mailBody)}`;

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <div className="space-y-8 rounded-[10px] border border-border bg-white p-6 md:p-8 lg:col-span-7">
        <fieldset>
          <legend className="text-[19px] font-bold leading-[1.5]">작업 종류</legend>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {baseTypes.map((b) => {
              const active = b.id === baseId;
              return (
                <label
                  key={b.id}
                  className={`flex cursor-pointer gap-3 rounded-md border p-4 transition-colors ${
                    active ? "border-accent bg-accent-surface" : "border-[#b1b8be] hover:border-[#6d7882]"
                  }`}
                >
                  <input
                    type="radio"
                    name="base"
                    value={b.id}
                    checked={active}
                    onChange={() => setBaseId(b.id)}
                    className="mt-1 h-5 w-5 shrink-0 accent-[#256ef4]"
                  />
                  <span>
                    <span className="block text-[17px] font-bold leading-[1.5]">{b.name}</span>
                    <span className="block text-[15px] leading-[1.5] text-foreground-secondary">
                      {won(b.price)}부터, 약 {b.days}일
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-[19px] font-bold leading-[1.5]">추가 옵션</legend>
          <div className="mt-4 divide-y divide-border rounded-md border border-[#b1b8be]">
            {options.map((o) => (
              <label key={o.id} className="flex cursor-pointer items-center gap-3 px-4 py-3.5 hover:bg-surface">
                <input
                  type="checkbox"
                  checked={picked.includes(o.id)}
                  onChange={() => toggle(o.id)}
                  className="h-5 w-5 shrink-0 accent-[#256ef4]"
                />
                <span className="flex-1 text-[17px] leading-[1.5]">{o.name}</span>
                <span className="text-[15px] leading-[1.5] text-foreground-secondary">
                  +{won(o.price)}, +{o.days}일
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="lg:col-span-5">
        <div className="rounded-[10px] bg-[#1e2124] p-6 text-white md:p-8 lg:sticky lg:top-24">
          <p className="text-[17px] leading-[1.5] text-[#cdd1d5]">예상 견적</p>
          <p className="mt-1 text-[40px] font-bold leading-[1.3] tabular-nums md:text-[44px]" aria-live="polite">
            {won(price)}
          </p>
          <p className="mt-1 text-[19px] leading-[1.5] text-[#e6e8ea]">작업 기간 약 {days}일</p>
          <dl className="mt-6 space-y-2 border-t border-white/20 pt-5 text-[15px] leading-[1.5]">
            <div className="flex justify-between gap-4">
              <dt className="text-[#b1b8be]">기본 작업</dt>
              <dd>{base.includes}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[#b1b8be]">무상 유지보수</dt>
              <dd>완료 후 1개월</dd>
            </div>
          </dl>
          <a
            href={mailto}
            data-gtm-cta="estimate_mail"
            className="mt-7 inline-flex h-14 w-full items-center justify-center rounded-md bg-accent text-[17px] font-bold transition-colors hover:bg-accent-hover"
          >
            이 조건으로 견적 요청
          </a>
          <p className="mt-3 text-[15px] leading-[1.5] text-[#b1b8be]">
            실제 금액은 작업 범위 확인 후 확정됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}
