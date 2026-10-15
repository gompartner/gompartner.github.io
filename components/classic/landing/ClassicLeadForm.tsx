"use client";

import { forwardRef, useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { ChannelTalkButton } from "@/components/layout/ChannelTalk";
import { btnLine, h2, wrap } from "@/components/classic/ui";
import { LEAD_ENDPOINT } from "@/data/classic/leadEndpoint";

// components/landing-page/LeadForm을 클래식 모양으로 옮긴 것. 보내는 필드와 검증은 원본과 똑같이 둔다.
export const CHANNELS = ["네이버", "메타", "구글", "아직 안 함"] as const;
export const PACKAGES = ["랜딩 기본", "랜딩 표준", "랜딩 고급", "잘 모르겠음"] as const;
export type PackageName = (typeof PACKAGES)[number];

const PHONE_RE = /^01[016789]-?\d{3,4}-?\d{4}$/;

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "error"; message: string } | { kind: "done"; id: string };

// 얇은 회색 테두리, 초점이 들어오면 파란 테두리. 격자 안에서 넘치지 않게 min-w-0.
const field =
  "h-12 w-full min-w-0 rounded-md border border-[#c9cfd8] bg-white px-4 text-[17px] outline-none transition-colors placeholder:text-[#8a929e] focus:border-[#256ef4] focus:ring-1 focus:ring-[#256ef4] aria-[invalid=true]:border-[#d63d4a] motion-reduce:transition-none";
const label = "block text-[15px] font-bold text-[#3d4450]";
const err = "mt-1.5 text-[15px] text-[#d63d4a]";
const chip = (on: boolean) =>
  `inline-flex h-12 items-center gap-1.5 rounded-md border px-4 text-[16px] font-bold transition-colors motion-reduce:transition-none ${
    on ? "border-[#256ef4] bg-[#eaf1fe] text-[#256ef4]" : "border-[#c9cfd8] bg-white text-[#3d4450] hover:border-[#15171c]"
  }`;

/** 이 페이지 자체의 상담 신청 폼. Apps Script 웹 앱으로 보내고, 응답의 접수 번호를 보여 준다. */
export const ClassicLeadForm = forwardRef<HTMLElement, { pkg: PackageName | ""; onPkg: (p: PackageName) => void }>(function ClassicLeadForm(
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
      console.warn("LEAD_ENDPOINT가 비어 있어 신청을 보내지 않았습니다. data/classic/leadEndpoint.ts를 확인하세요.");
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
    <section ref={ref} id="apply" aria-labelledby="apply-title" className="scroll-mt-20 border-t border-[#e6e9ee] bg-[#f6f7f9] md:scroll-mt-32">
      <div className={`${wrap} grid gap-10 py-16 md:py-24 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)] lg:gap-16`}>
        <div>
          <h2 id="apply-title" className={h2}>
            상담 신청
          </h2>
          <ChannelTalkButton cta="classic_landing_apply_chat" message="광고 랜딩페이지 상담받고 싶어요." className={`${btnLine} mt-8`}>
            채팅 상담
          </ChannelTalkButton>
        </div>

        {status.kind === "done" ? (
          <div className="min-w-0 border-t-2 border-[#15171c] bg-white px-5 py-8 md:px-8 md:py-10" role="status">
            <p className="text-[15px] font-bold tabular-nums text-[#256ef4]">접수 번호 {status.id}</p>
            <p className="mt-2 text-[26px] font-extrabold leading-[1.35] tracking-[-0.03em]">신청이 접수되었습니다.</p>
            <p className="mt-2 text-[17px] leading-[1.6] text-[#5b6370]">영업일 기준 1일 이내 연락드립니다.</p>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="min-w-0 space-y-7 border-t-2 border-[#15171c] bg-white px-4 py-7 min-[360px]:px-5 md:px-8 md:py-9">
            <div className="grid gap-7 md:grid-cols-2 md:gap-6">
              <div className="min-w-0">
                <label htmlFor="clp-name" className={label}>
                  이름
                </label>
                <input id="clp-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={`${field} mt-2`} aria-invalid={!!errors.name} aria-describedby={errors.name ? "clp-name-err" : undefined} />
                {errors.name && (
                  <p id="clp-name-err" className={err}>
                    {errors.name}
                  </p>
                )}
              </div>
              <div className="min-w-0">
                <label htmlFor="clp-phone" className={label}>
                  휴대폰
                </label>
                <input id="clp-phone" value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" placeholder="010-0000-0000" className={`${field} mt-2`} aria-invalid={!!errors.phone} aria-describedby={errors.phone ? "clp-phone-err" : undefined} />
                {errors.phone && (
                  <p id="clp-phone-err" className={err}>
                    {errors.phone}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="clp-business" className={label}>
                업종
              </label>
              <input id="clp-business" value={business} onChange={(e) => setBusiness(e.target.value)} placeholder="예: 정수기 렌탈, 입주청소, 학원" className={`${field} mt-2`} aria-invalid={!!errors.business} aria-describedby={errors.business ? "clp-business-err" : undefined} />
              {errors.business && (
                <p id="clp-business-err" className={err}>
                  {errors.business}
                </p>
              )}
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
              <label htmlFor="clp-message" className={label}>
                문의 내용 <span className="font-normal text-[#5b6370]">(선택)</span>
              </label>
              <textarea id="clp-message" value={message} onChange={(e) => setMessage(e.target.value)} rows={4} placeholder="월 광고비, 현재 접수 방법, 오픈 희망일 등" className={`${field} mt-2 h-auto py-3 leading-[1.6]`} />
            </div>

            {/* 사람 눈에는 보이지 않는 칸. 채워져 있으면 자동 입력으로 보고 버린다. */}
            <div aria-hidden className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden">
              <label htmlFor="clp-website">웹사이트</label>
              <input id="clp-website" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
            </div>

            <div>
              <div className="flex items-start gap-3">
                <input id="clp-agree" type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-[#256ef4]" aria-invalid={!!errors.agree} aria-describedby={errors.agree ? "clp-agree-err" : undefined} />
                <label htmlFor="clp-agree" className="text-[16px] leading-[1.6]">
                  개인정보 수집·이용에 동의합니다.
                </label>
              </div>
              <details className="group mt-3 border-t border-[#e6e9ee] pt-3 text-[15px] leading-[1.6] text-[#5b6370]">
                <summary className="inline-flex cursor-pointer list-none items-center gap-1 font-bold text-[#3d4450] [&::-webkit-details-marker]:hidden">
                  자세히 보기
                  <ChevronDown size={16} className="transition-transform group-open:rotate-180 motion-reduce:transition-none" aria-hidden />
                </summary>
                <ul className="mt-2 space-y-1">
                  <li>수집 항목: 이름, 휴대폰 번호, 업종, 사용 중인 광고, 관심 패키지, 문의 내용, 유입 경로</li>
                  <li>이용 목적: 상담 신청 확인 및 회신</li>
                  <li>보관 기간: 신청일로부터 1년</li>
                  <li>동의를 거부할 수 있으며 거부 시 신청이 제한됩니다.</li>
                </ul>
              </details>
              {errors.agree && (
                <p id="clp-agree-err" className={err}>
                  {errors.agree}
                </p>
              )}
            </div>

            {status.kind === "error" && (
              <p role="alert" className="rounded-md border border-[#d63d4a] bg-white px-4 py-3 text-[16px] font-bold text-[#d63d4a]">
                {status.message}
              </p>
            )}

            <button
              type="submit"
              disabled={status.kind === "sending"}
              className="flex h-14 w-full items-center justify-center rounded-md bg-[#256ef4] text-[18px] font-bold text-white transition-colors hover:bg-[#0b50d0] disabled:opacity-60 motion-reduce:transition-none"
            >
              {status.kind === "sending" ? "접수 중" : "상담 신청하기"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
});
