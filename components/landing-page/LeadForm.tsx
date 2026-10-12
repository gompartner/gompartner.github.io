"use client";

import { forwardRef, useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { LEAD_ENDPOINT } from "@/data/leadEndpoint";

export const CHANNELS = ["네이버", "메타", "구글", "아직 안 함"] as const;
export const PACKAGES = ["신청 접수 랜딩", "상담 관리 랜딩", "광고 성과 랜딩", "잘 모르겠음"] as const;
export type PackageName = (typeof PACKAGES)[number];

const PHONE_RE = /^01[016789]-?\d{3,4}-?\d{4}$/;

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "error"; message: string } | { kind: "done"; id: string };

const field =
  "h-12 w-full rounded-[6px] border border-border bg-background px-4 text-[17px] outline-none focus:border-accent focus:ring-2 focus:ring-accent/30";
const label = "block text-[15px] font-bold";
const chip = (on: boolean) =>
  `inline-flex h-11 items-center gap-1.5 rounded-[6px] border px-4 text-[16px] font-bold transition-colors ${
    on ? "border-accent bg-accent text-accent-foreground" : "border-border bg-background hover:border-accent"
  }`;

/** 이 페이지 자체의 상담 신청 폼. Apps Script 웹 앱으로 보내고, 응답의 접수 번호를 보여 준다. */
export const LeadForm = forwardRef<HTMLElement, { pkg: PackageName | ""; onPkg: (p: PackageName) => void }>(function LeadForm(
  { pkg, onPkg },
  ref,
) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [business, setBusiness] = useState("");
  const [channels, setChannels] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [agree, setAgree] = useState(false);
  const [website, setWebsite] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  // 페이지를 연 시각. 너무 빨리 제출된 신청(자동 입력)을 거르는 데 쓴다.
  const startedAt = useRef(0);
  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  const toggleChannel = (c: string) =>
    setChannels((prev) => {
      if (c === "아직 안 함") return prev.includes(c) ? [] : [c];
      const rest = prev.filter((x) => x !== "아직 안 함");
      return rest.includes(c) ? rest.filter((x) => x !== c) : [...rest, c];
    });

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "이름을 입력해 주세요.";
    if (!PHONE_RE.test(phone.trim())) e.phone = "휴대폰 번호를 확인해 주세요.";
    if (!business.trim()) e.business = "업종을 입력해 주세요.";
    if (!agree) e.agree = "개인정보 수집·이용에 동의해 주세요.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (status.kind === "sending") return;
    if (!validate()) return;
    if (!LEAD_ENDPOINT) {
      console.warn("LEAD_ENDPOINT가 비어 있어 신청을 보내지 않았습니다. data/leadEndpoint.ts를 확인하세요.");
      setStatus({ kind: "error", message: "지금은 신청을 받을 수 없습니다. 잠시 뒤 다시 시도해 주세요." });
      return;
    }
    const q = new URLSearchParams(window.location.search);
    const payload = {
      name: name.trim(),
      phone: phone.trim(),
      business: business.trim(),
      channel: channels.join(", "),
      pkg: pkg || "잘 모르겠음",
      message: message.trim(),
      agree,
      utm_source: q.get("utm_source") ?? "",
      utm_campaign: q.get("utm_campaign") ?? "",
      referrer: document.referrer,
      page: window.location.pathname,
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
      } else {
        setStatus({ kind: "error", message: data.error || "신청을 저장하지 못했습니다. 다시 시도해 주세요." });
      }
    } catch {
      setStatus({ kind: "error", message: "신청을 보내지 못했습니다. 다시 시도해 주세요." });
    }
  };

  return (
    <section ref={ref} id="apply" aria-labelledby="apply-title" className="scroll-mt-6 bg-surface px-4 py-16 md:px-6 md:py-24">
      <div className="mx-auto max-w-[720px]">
        <h2 id="apply-title" className="text-[28px] font-bold leading-[1.35] tracking-[-0.02em] md:text-[36px]">
          상담 신청
        </h2>

        {status.kind === "done" ? (
          <div className="mt-8 rounded-[10px] border border-border bg-background p-6 md:p-8" role="status">
            <p className="text-[15px] font-bold text-accent">접수 번호 {status.id}</p>
            <p className="mt-2 text-[24px] font-bold leading-[1.4]">신청이 접수되었습니다.</p>
            <p className="mt-2 text-[17px] leading-[1.6] text-foreground-secondary">영업일 기준 1일 이내 연락드립니다.</p>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="mt-8 space-y-6 rounded-[10px] border border-border bg-background p-5 md:p-8">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label htmlFor="lp-name" className={label}>
                  이름
                </label>
                <input id="lp-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={`${field} mt-2`} aria-invalid={!!errors.name} aria-describedby={errors.name ? "lp-name-err" : undefined} />
                {errors.name && <p id="lp-name-err" className="mt-1.5 text-[15px] text-[#d63d4a]">{errors.name}</p>}
              </div>
              <div>
                <label htmlFor="lp-phone" className={label}>
                  휴대폰
                </label>
                <input id="lp-phone" value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" placeholder="010-0000-0000" className={`${field} mt-2`} aria-invalid={!!errors.phone} aria-describedby={errors.phone ? "lp-phone-err" : undefined} />
                {errors.phone && <p id="lp-phone-err" className="mt-1.5 text-[15px] text-[#d63d4a]">{errors.phone}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="lp-business" className={label}>
                업종
              </label>
              <input id="lp-business" value={business} onChange={(e) => setBusiness(e.target.value)} placeholder="예: 정수기 렌탈, 입주청소, 학원" className={`${field} mt-2`} aria-invalid={!!errors.business} aria-describedby={errors.business ? "lp-business-err" : undefined} />
              {errors.business && <p id="lp-business-err" className="mt-1.5 text-[15px] text-[#d63d4a]">{errors.business}</p>}
            </div>

            <fieldset>
              <legend className={label}>사용 중인 광고</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {CHANNELS.map((c) => {
                  const on = channels.includes(c);
                  return (
                    <button key={c} type="button" aria-pressed={on} onClick={() => toggleChannel(c)} className={chip(on)}>
                      {on && <Check size={16} strokeWidth={3} aria-hidden />}
                      {c}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <fieldset>
              <legend className={label}>관심 패키지</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {PACKAGES.map((p) => (
                  <button key={p} type="button" aria-pressed={pkg === p} onClick={() => onPkg(p)} className={chip(pkg === p)}>
                    {pkg === p && <Check size={16} strokeWidth={3} aria-hidden />}
                    {p}
                  </button>
                ))}
              </div>
            </fieldset>

            <div>
              <label htmlFor="lp-message" className={label}>
                문의 내용 <span className="font-normal text-foreground-secondary">(선택)</span>
              </label>
              <textarea id="lp-message" value={message} onChange={(e) => setMessage(e.target.value)} rows={4} placeholder="월 광고비, 현재 접수 방법, 오픈 희망일 등" className={`${field} mt-2 h-auto py-3 leading-[1.6]`} />
            </div>

            {/* 사람 눈에는 보이지 않는 칸. 채워져 있으면 자동 입력으로 보고 버린다. */}
            <div aria-hidden className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden">
              <label htmlFor="lp-website">웹사이트</label>
              <input id="lp-website" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
            </div>

            <div>
              <div className="flex items-start gap-3">
                <input id="lp-agree" type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-[#256ef4]" aria-invalid={!!errors.agree} />
                <label htmlFor="lp-agree" className="text-[16px] leading-[1.6]">
                  개인정보 수집·이용에 동의합니다.
                </label>
              </div>
              <details className="group mt-2 rounded-[6px] bg-surface px-4 py-3 text-[15px] leading-[1.6] text-foreground-secondary">
                <summary className="flex cursor-pointer list-none items-center gap-1 font-bold [&::-webkit-details-marker]:hidden">
                  자세히 보기
                  <ChevronDown size={16} className="transition-transform group-open:rotate-180" aria-hidden />
                </summary>
                <ul className="mt-2 space-y-1">
                  <li>수집 항목: 이름, 휴대폰 번호, 업종, 사용 중인 광고, 관심 패키지, 문의 내용, 유입 경로</li>
                  <li>이용 목적: 상담 신청 확인 및 회신</li>
                  <li>보관 기간: 신청일로부터 1년</li>
                  <li>동의를 거부할 수 있으며 거부 시 신청이 제한됩니다.</li>
                </ul>
              </details>
              {errors.agree && <p className="mt-1.5 text-[15px] text-[#d63d4a]">{errors.agree}</p>}
            </div>

            {status.kind === "error" && (
              <p role="alert" className="rounded-[6px] border border-[#d63d4a] px-4 py-3 text-[16px] text-[#d63d4a]">
                {status.message}
              </p>
            )}

            <button
              type="submit"
              disabled={status.kind === "sending"}
              className="flex h-14 w-full items-center justify-center rounded-[6px] bg-accent text-[18px] font-bold text-accent-foreground transition-colors hover:bg-accent-hover disabled:opacity-60"
            >
              {status.kind === "sending" ? "접수 중" : "상담 신청하기"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
});
