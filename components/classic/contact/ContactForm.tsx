"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Check, ChevronDown, MessageCircle } from "lucide-react";
import { ChannelTalkButton } from "@/components/layout/ChannelTalk";
import { LEAD_ENDPOINT } from "@/data/classic/leadEndpoint";

// 클래식 상담 신청 폼. 보내는 방식과 필드명은 /landing 폼과 같다(같은 Apps Script 시트에 쌓인다).

export const SERVICES = ["광고 랜딩페이지", "홈페이지 제작", "유지보수", "업무 프로그램", "잘 모르겠음"] as const;
export const BUDGETS = ["30만 원 안쪽", "30~50만 원", "50~100만 원", "100만 원 넘음", "협의"] as const;

const PHONE_RE = /^01[016789]-?\d{3,4}-?\d{4}$/;

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "error"; message: string } | { kind: "done"; id: string };

const field =
  "mt-2 h-12 w-full min-w-0 rounded-md border border-[#c9cfd8] bg-white px-4 text-[17px] text-[#15171c] outline-none transition-colors placeholder:text-[#6b7280] focus:border-[#256ef4] focus:ring-1 focus:ring-[#256ef4] aria-[invalid=true]:border-[#d63d4a] motion-reduce:transition-none";
const label = "block text-[16px] font-bold";
const opt = "font-normal text-[#5b6370]";
const err = "mt-1.5 text-[15px] text-[#d63d4a]";

export function ContactForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [business, setBusiness] = useState("");
  // 홈페이지 진단(/tools/site-check)의 "전체 보고서 받기"로 넘어오면 ?site=주소 가 붙는다. 서비스와 문의 내용을 미리 채운다.
  const site = useSearchParams().get("site") ?? "";
  const [service, setService] = useState(site ? "유지보수" : "");
  const [sample, setSample] = useState("");
  const [budget, setBudget] = useState("");
  const [openDate, setOpenDate] = useState("");
  const [currentSite, setCurrentSite] = useState(site);
  const [message, setMessage] = useState(site ? `홈페이지 진단 전체 보고서 요청: ${site}` : "");
  const [agree, setAgree] = useState(false);
  const [website, setWebsite] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  // 페이지를 연 시각. 너무 빨리 제출된 신청(자동 입력)을 거르는 데 쓴다.
  const startedAt = useRef(0);
  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "이름을 입력해 주세요.";
    if (!PHONE_RE.test(phone.trim())) e.phone = "휴대폰 번호를 확인해 주세요.";
    if (!business.trim()) e.business = "회사나 상호를 입력해 주세요.";
    if (!message.trim()) e.message = "문의 내용을 입력해 주세요.";
    if (!agree) e.agree = "개인정보 수집 및 이용에 동의해 주세요.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (status.kind === "sending") return;
    if (!validate()) return;
    if (!LEAD_ENDPOINT) {
      console.warn("LEAD_ENDPOINT가 비어 있어 신청을 보내지 않았습니다. data/classic/leadEndpoint.ts를 확인하세요.");
      setStatus({ kind: "error", message: "지금은 신청을 받을 수 없습니다. 잠시 뒤 다시 시도해 주세요." });
      return;
    }
    const q = new URLSearchParams(window.location.search);
    // 시트 칸은 /landing 폼과 같아서, 더한 항목은 문의 내용 앞에 줄로 붙인다
    const extra = [
      sample.trim() && `참고 샘플: ${sample.trim()}`,
      budget && `예산: ${budget}`,
      openDate.trim() && `희망 오픈일: ${openDate.trim()}`,
      currentSite.trim() && `지금 홈페이지: ${currentSite.trim()}`,
    ].filter(Boolean);
    const body = [...extra, message.trim()].join("\n");
    const payload = {
      name: name.trim(),
      phone: phone.trim(),
      business: business.trim(),
      channel: "",
      pkg: service || "잘 모르겠음",
      message: body,
      agree,
      utm_source: q.get("utm_source") ?? "",
      utm_campaign: q.get("utm_campaign") ?? "",
      referrer: document.referrer,
      page: window.location.href,
      startedAt: startedAt.current,
      website,
    };
    setStatus({ kind: "sending" });
    try {
      // 헤더를 붙이지 않아 text/plain 단순 요청으로 간다(Apps Script는 사전 요청을 받지 못한다).
      const res = await fetch(LEAD_ENDPOINT, { method: "POST", body: JSON.stringify(payload) });
      const data = (await res.json()) as { ok?: boolean; id?: string; error?: string };
      if (data.ok && data.id) {
        setStatus({ kind: "done", id: data.id });
        window.dataLayer ??= [];
        window.dataLayer.push({ event: "generate_lead", lead_package: payload.pkg });
        window.scrollTo({ top: 0 });
      } else {
        setStatus({ kind: "error", message: data.error || "신청을 저장하지 못했습니다. 다시 시도해 주세요." });
      }
    } catch {
      setStatus({ kind: "error", message: "신청을 보내지 못했습니다. 다시 시도해 주세요." });
    }
  };

  if (status.kind === "done") {
    return (
      <div role="status" className="border-t-2 border-[#15171c] pt-8">
        <p className="text-[15px] font-bold tabular-nums text-[#256ef4]">접수 번호 {status.id}</p>
        <p className="mt-2 text-[26px] font-extrabold leading-[1.35] tracking-[-0.03em] md:text-[32px]">상담 신청이 접수되었습니다.</p>
        <dl className="mt-8 border-t border-[#e6e9ee] text-[16px]">
          <div className="flex flex-col gap-1 border-b border-[#e6e9ee] py-4 sm:flex-row sm:gap-6">
            <dt className="w-[120px] shrink-0 font-bold text-[#3d4450]">회신</dt>
            <dd>24시간 이내에 답장합니다.</dd>
          </div>
          <div className="flex flex-col gap-1 border-b border-[#e6e9ee] py-4 sm:flex-row sm:gap-6">
            <dt className="w-[120px] shrink-0 font-bold text-[#3d4450]">다른 연락 창구</dt>
            <dd>채팅 상담</dd>
          </div>
        </dl>
        <ChannelTalkButton
          cta="classic_contact_done_chat"
          message={`접수 번호 ${status.id} 관련 문의입니다.`}
          className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-md border border-[#c9cfd8] bg-white px-6 text-[16px] font-bold text-[#15171c] transition-colors hover:border-[#15171c]"
        >
          <MessageCircle size={18} aria-hidden />
          채팅 상담
        </ChannelTalkButton>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-7 border-t-2 border-[#15171c] pt-8">
      <div className="grid gap-7 md:grid-cols-2 md:gap-6">
        <div className="min-w-0">
          <label htmlFor="cc-name" className={label}>
            이름
          </label>
          <input id="cc-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="김ㅎ늘" className={field} aria-invalid={!!errors.name} aria-describedby={errors.name ? "cc-name-err" : undefined} />
          {errors.name && <p id="cc-name-err" className={err}>{errors.name}</p>}
        </div>
        <div className="min-w-0">
          <label htmlFor="cc-phone" className={label}>
            휴대폰
          </label>
          <input id="cc-phone" value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" placeholder="010-0000-0000" className={field} aria-invalid={!!errors.phone} aria-describedby={errors.phone ? "cc-phone-err" : undefined} />
          {errors.phone && <p id="cc-phone-err" className={err}>{errors.phone}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="cc-business" className={label}>
          회사 또는 상호 <span className={opt}>(업종)</span>
        </label>
        <input id="cc-business" value={business} onChange={(e) => setBusiness(e.target.value)} autoComplete="organization" placeholder="예: 하늘정밀 (정밀가공 제조)" className={field} aria-invalid={!!errors.business} aria-describedby={errors.business ? "cc-business-err" : undefined} />
        {errors.business && <p id="cc-business-err" className={err}>{errors.business}</p>}
      </div>

      <fieldset>
        <legend className={label}>관심 서비스</legend>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          {SERVICES.map((s) => {
            const on = service === s;
            return (
              <button
                key={s}
                type="button"
                aria-pressed={on}
                onClick={() => setService(on ? "" : s)}
                className={`inline-flex min-h-12 min-w-0 items-center justify-center gap-1.5 break-keep rounded-md border px-2 py-2 text-[15px] font-bold sm:px-4 sm:text-[16px] transition-colors motion-reduce:transition-none ${
                  on ? "border-[#256ef4] bg-[#eef4ff] text-[#256ef4]" : "border-[#c9cfd8] bg-white text-[#3d4450] hover:border-[#15171c]"
                }`}
              >
                {on && <Check size={16} strokeWidth={3} aria-hidden className="shrink-0" />}
                {s}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className={label}>
          예산 <span className={opt}>(선택)</span>
        </legend>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          {BUDGETS.map((b) => {
            const on = budget === b;
            return (
              <button
                key={b}
                type="button"
                aria-pressed={on}
                onClick={() => setBudget(on ? "" : b)}
                className={`inline-flex min-h-12 min-w-0 items-center justify-center gap-1.5 break-keep rounded-md border px-2 py-2 text-[15px] font-bold tabular-nums sm:px-4 sm:text-[16px] transition-colors motion-reduce:transition-none ${
                  on ? "border-[#256ef4] bg-[#eef4ff] text-[#256ef4]" : "border-[#c9cfd8] bg-white text-[#3d4450] hover:border-[#15171c]"
                }`}
              >
                {on && <Check size={16} strokeWidth={3} aria-hidden className="shrink-0" />}
                {b}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="grid gap-7 md:grid-cols-2 md:gap-6">
        <div className="min-w-0">
          <label htmlFor="cc-open" className={label}>
            희망 오픈일 <span className={opt}>(선택)</span>
          </label>
          <input id="cc-open" value={openDate} onChange={(e) => setOpenDate(e.target.value)} placeholder="예: 12월 초" className={field} />
        </div>
        <div className="min-w-0">
          <label htmlFor="cc-site" className={label}>
            지금 홈페이지 주소 <span className={opt}>(있으면)</span>
          </label>
          <input id="cc-site" value={currentSite} onChange={(e) => setCurrentSite(e.target.value)} inputMode="url" autoComplete="url" placeholder="예: www.hanulcoffee.co.kr" className={field} />
        </div>
      </div>

      <div>
        <label htmlFor="cc-sample" className={label}>
          참고 샘플 <span className={opt}>(선택)</span>
        </label>
        <input id="cc-sample" value={sample} onChange={(e) => setSample(e.target.value)} placeholder="샘플 이름이나 참고 사이트 주소" className={field} />
      </div>

      <div>
        <label htmlFor="cc-message" className={label}>
          문의 내용
        </label>
        <textarea
          id="cc-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={6}
          placeholder="필요한 기능, 고칠 곳, 궁금한 점"
          className={`${field} h-auto py-3 leading-[1.6]`}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? "cc-message-err" : undefined}
        />
        {errors.message && <p id="cc-message-err" className={err}>{errors.message}</p>}
      </div>

      {/* 사람 눈에는 보이지 않는 칸. 채워져 있으면 자동 입력으로 보고 버린다. */}
      <div aria-hidden className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden">
        <label htmlFor="cc-website">웹사이트</label>
        <input id="cc-website" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
      </div>

      <div className="border-t border-[#e6e9ee] pt-6">
        <div className="flex items-start gap-3">
          <input
            id="cc-agree"
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
            className="mt-1 h-5 w-5 shrink-0 accent-[#256ef4]"
            aria-invalid={!!errors.agree}
            aria-describedby={errors.agree ? "cc-agree-err" : undefined}
          />
          <label htmlFor="cc-agree" className="text-[16px] font-bold leading-[1.6]">
            개인정보 수집 및 이용에 동의합니다. <span className={opt}>(필수)</span>
          </label>
        </div>
        <details className="group mt-3 rounded-md border border-[#e6e9ee] bg-[#f6f7f9] px-4 py-3 text-[15px] leading-[1.6] text-[#5b6370]">
          <summary className="flex cursor-pointer list-none items-center gap-1 font-bold text-[#3d4450] [&::-webkit-details-marker]:hidden">
            자세히 보기
            <ChevronDown size={16} className="transition-transform group-open:rotate-180 motion-reduce:transition-none" aria-hidden />
          </summary>
          <ul className="mt-2 space-y-1">
            <li>수집 항목: 이름, 휴대폰 번호, 회사 또는 상호(업종), 관심 서비스, 예산, 희망 오픈일, 지금 홈페이지 주소, 참고 샘플, 문의 내용, 유입 경로</li>
            <li>이용 목적: 상담 신청 확인 및 회신</li>
            <li>보관 기간: 신청일로부터 1년</li>
            <li>동의를 거부할 수 있으며 거부 시 신청이 제한됩니다.</li>
          </ul>
        </details>
        {errors.agree && <p id="cc-agree-err" className={err}>{errors.agree}</p>}
      </div>

      {status.kind === "error" && (
        <p role="alert" className="rounded-md border border-[#d63d4a] bg-white px-4 py-3 text-[16px] font-bold text-[#d63d4a]">
          {status.message}
        </p>
      )}

      <button
        type="submit"
        disabled={status.kind === "sending"}
        className="flex h-14 w-full items-center justify-center rounded-md bg-[#256ef4] text-[18px] font-bold text-white transition-colors hover:bg-[#0b50d0] disabled:opacity-60 motion-reduce:transition-none md:w-[240px]"
      >
        {status.kind === "sending" ? "접수 중" : "상담 신청"}
      </button>
    </form>
  );
}
