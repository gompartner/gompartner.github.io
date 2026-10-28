"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, MessageCircle } from "lucide-react";
import { ChannelTalkButton } from "@/components/layout/ChannelTalk";
import { btnLine, h2, wrap } from "@/components/classic/ui";
import { LEAD_ENDPOINT } from "@/data/classic/leadEndpoint";
import { maintenanceServices } from "@/data/classic/maintenance";

// 유지보수 접수 폼. 보내는 방식과 필드명은 /classic/contact 폼과 같다(같은 Apps Script 시트에 쌓인다).
// 시트에 칸이 따로 없어서 서비스는 pkg에 "유지보수 오류 수정"처럼, 홈페이지 주소는 message 첫 줄에 넣는다.
// 서비스별 "접수" 버튼은 #apply-<서비스 id>로 오고, 그 서비스를 골라 둔 채로 폼까지 내려온다.

const SERVICES = [...maintenanceServices.map((s) => ({ id: s.id, title: s.title })), { id: "unknown", title: "잘 모르겠음" }];

const PHONE_RE = /^01[016789]-?\d{3,4}-?\d{4}$/;

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "error"; message: string } | { kind: "done"; id: string };

const field =
  "mt-2 h-12 w-full min-w-0 rounded-md border border-[#c9cfd8] bg-white px-4 text-[17px] text-[#15171c] outline-none transition-colors placeholder:text-[#6b7280] focus:border-[#256ef4] focus:ring-1 focus:ring-[#256ef4] aria-[invalid=true]:border-[#d63d4a] motion-reduce:transition-none";
const label = "block text-[16px] font-bold";
const opt = "font-normal text-[#5b6370]";
const err = "mt-1.5 text-[15px] text-[#d63d4a]";

export function MaintenanceForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [site, setSite] = useState("");
  const [business, setBusiness] = useState("");
  const [service, setService] = useState("");
  const [message, setMessage] = useState("");
  const [agree, setAgree] = useState(false);
  const [website, setWebsite] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const sectionRef = useRef<HTMLElement>(null);
  // 페이지를 연 시각. 너무 빨리 제출된 신청(자동 입력)을 거르는 데 쓴다.
  const startedAt = useRef(0);
  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  useEffect(() => {
    const pick = () => {
      const m = window.location.hash.match(/^#apply-(.+)$/);
      if (!m) return;
      const s = SERVICES.find((x) => x.id === m[1]);
      if (s) setService(s.title);
      sectionRef.current?.scrollIntoView({ block: "start" });
    };
    pick();
    window.addEventListener("hashchange", pick);
    return () => window.removeEventListener("hashchange", pick);
  }, []);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "이름을 입력해 주세요.";
    if (!PHONE_RE.test(phone.trim())) e.phone = "휴대폰 번호를 확인해 주세요.";
    if (!site.trim()) e.site = "홈페이지 주소를 입력해 주세요.";
    if (!message.trim()) e.message = "고칠 내용을 입력해 주세요.";
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
      setStatus({ kind: "error", message: "지금은 접수를 받을 수 없습니다. 잠시 뒤 다시 시도해 주세요." });
      return;
    }
    const q = new URLSearchParams(window.location.search);
    const payload = {
      name: name.trim(),
      phone: phone.trim(),
      business: business.trim(),
      channel: "",
      pkg: `유지보수 ${service || "잘 모르겠음"}`,
      message: `홈페이지: ${site.trim()}\n${message.trim()}`,
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
        sectionRef.current?.scrollIntoView({ block: "start" });
      } else {
        setStatus({ kind: "error", message: data.error || "접수를 저장하지 못했습니다. 다시 시도해 주세요." });
      }
    } catch {
      setStatus({ kind: "error", message: "접수를 보내지 못했습니다. 다시 시도해 주세요." });
    }
  };

  return (
    <section ref={sectionRef} id="apply" aria-labelledby="apply-title" className="scroll-mt-20 border-t border-[#e6e9ee] bg-[#f6f7f9] md:scroll-mt-32">
      <div className={`${wrap} grid gap-10 py-16 md:py-24 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)] lg:gap-16`}>
        <div>
          <h2 id="apply-title" className={h2}>
            유지보수 접수
          </h2>
          <p className="mt-4 text-[17px] leading-[1.6] text-[#5b6370]">접수하시면 24시간 이내에 연락드립니다. 오류는 원인을 본 뒤 금액부터 알려 드리고, 동의 전에는 작업하지 않습니다.</p>
          <ChannelTalkButton cta="classic_maintenance_apply_chat" message="유지보수 상담받고 싶어요." className={`${btnLine} mt-8`}>
            채팅 상담
          </ChannelTalkButton>
        </div>

        {status.kind === "done" ? (
          <div role="status" className="min-w-0 border-t-2 border-[#15171c] bg-white px-5 py-8 md:px-8 md:py-10">
            <p className="text-[15px] font-bold tabular-nums text-[#256ef4]">접수 번호 {status.id}</p>
            <p className="mt-2 text-[26px] font-extrabold leading-[1.35] tracking-[-0.03em]">유지보수 접수가 완료되었습니다.</p>
            <dl className="mt-8 border-t border-[#e6e9ee] text-[16px]">
              <div className="flex flex-col gap-1 border-b border-[#e6e9ee] py-4 sm:flex-row sm:gap-6">
                <dt className="w-[120px] shrink-0 font-bold text-[#3d4450]">회신</dt>
                <dd>24시간 이내에 연락드립니다.</dd>
              </div>
              <div className="flex flex-col gap-1 border-b border-[#e6e9ee] py-4 sm:flex-row sm:gap-6">
                <dt className="w-[120px] shrink-0 font-bold text-[#3d4450]">화면 캡처</dt>
                <dd>채팅 상담에 접수 번호와 함께 올려 주세요.</dd>
              </div>
            </dl>
            <ChannelTalkButton
              cta="classic_maintenance_done_chat"
              message={`유지보수 접수 번호 ${status.id} 관련 캡처 보냅니다.`}
              className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-md border border-[#c9cfd8] bg-white px-6 text-[16px] font-bold text-[#15171c] transition-colors hover:border-[#15171c]"
            >
              <MessageCircle size={18} aria-hidden />
              채팅으로 캡처 보내기
            </ChannelTalkButton>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="min-w-0 space-y-7 border-t-2 border-[#15171c] bg-white px-4 py-7 min-[360px]:px-5 md:px-8 md:py-9">
            <fieldset>
              <legend className={label}>
                서비스 <span className={opt}>(선택)</span>
              </legend>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                {SERVICES.map((s) => {
                  const on = service === s.title;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      aria-pressed={on}
                      onClick={() => setService(on ? "" : s.title)}
                      className={`inline-flex min-h-12 min-w-0 items-center justify-center gap-1.5 break-keep rounded-md border px-2 py-2 text-[15px] font-bold transition-colors motion-reduce:transition-none sm:px-4 sm:text-[16px] ${
                        on ? "border-[#256ef4] bg-[#eef4ff] text-[#256ef4]" : "border-[#c9cfd8] bg-white text-[#3d4450] hover:border-[#15171c]"
                      }`}
                    >
                      {on && <Check size={16} strokeWidth={3} aria-hidden className="shrink-0" />}
                      {s.title}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <div className="grid gap-7 md:grid-cols-2 md:gap-6">
              <div className="min-w-0">
                <label htmlFor="mf-name" className={label}>
                  이름
                </label>
                <input id="mf-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={field} aria-invalid={!!errors.name} aria-describedby={errors.name ? "mf-name-err" : undefined} />
                {errors.name && <p id="mf-name-err" className={err}>{errors.name}</p>}
              </div>
              <div className="min-w-0">
                <label htmlFor="mf-phone" className={label}>
                  휴대폰
                </label>
                <input id="mf-phone" value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" placeholder="010-0000-0000" className={field} aria-invalid={!!errors.phone} aria-describedby={errors.phone ? "mf-phone-err" : undefined} />
                {errors.phone && <p id="mf-phone-err" className={err}>{errors.phone}</p>}
              </div>
            </div>

            <div className="grid gap-7 md:grid-cols-2 md:gap-6">
              <div className="min-w-0">
                <label htmlFor="mf-site" className={label}>
                  홈페이지 주소
                </label>
                <input id="mf-site" value={site} onChange={(e) => setSite(e.target.value)} inputMode="url" autoComplete="url" placeholder="예: haneulflower.co.kr" className={field} aria-invalid={!!errors.site} aria-describedby={errors.site ? "mf-site-err" : undefined} />
                {errors.site && <p id="mf-site-err" className={err}>{errors.site}</p>}
              </div>
              <div className="min-w-0">
                <label htmlFor="mf-business" className={label}>
                  상호 <span className={opt}>(선택)</span>
                </label>
                <input id="mf-business" value={business} onChange={(e) => setBusiness(e.target.value)} autoComplete="organization" placeholder="예: 하늘꽃방" className={field} />
              </div>
            </div>

            <div>
              <label htmlFor="mf-message" className={label}>
                고칠 내용
              </label>
              <textarea
                id="mf-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                placeholder="예: 휴대폰에서 예약하기 버튼을 눌러도 반응이 없어요. 오늘 아침부터 그래요."
                className={`${field} h-auto py-3 leading-[1.6]`}
                aria-invalid={!!errors.message}
                aria-describedby={errors.message ? "mf-message-err" : undefined}
              />
              {errors.message && <p id="mf-message-err" className={err}>{errors.message}</p>}
            </div>

            {/* 사람 눈에는 보이지 않는 칸. 채워져 있으면 자동 입력으로 보고 버린다. */}
            <div aria-hidden className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden">
              <label htmlFor="mf-website">웹사이트</label>
              <input id="mf-website" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
            </div>

            <div className="border-t border-[#e6e9ee] pt-6">
              <div className="flex items-start gap-3">
                <input
                  id="mf-agree"
                  type="checkbox"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                  className="mt-1 h-5 w-5 shrink-0 accent-[#256ef4]"
                  aria-invalid={!!errors.agree}
                  aria-describedby={errors.agree ? "mf-agree-err" : undefined}
                />
                <label htmlFor="mf-agree" className="text-[16px] font-bold leading-[1.6]">
                  개인정보 수집 및 이용에 동의합니다. <span className={opt}>(필수)</span>
                </label>
              </div>
              <details className="group mt-3 rounded-md border border-[#e6e9ee] bg-[#f6f7f9] px-4 py-3 text-[15px] leading-[1.6] text-[#5b6370]">
                <summary className="flex cursor-pointer list-none items-center gap-1 font-bold text-[#3d4450] [&::-webkit-details-marker]:hidden">
                  자세히 보기
                  <ChevronDown size={16} className="transition-transform group-open:rotate-180 motion-reduce:transition-none" aria-hidden />
                </summary>
                <ul className="mt-2 space-y-1">
                  <li>수집 항목: 이름, 휴대폰 번호, 홈페이지 주소, 상호, 서비스, 고칠 내용, 유입 경로</li>
                  <li>이용 목적: 유지보수 접수 확인 및 회신</li>
                  <li>보관 기간: 접수일로부터 1년</li>
                  <li>동의를 거부할 수 있으며 거부 시 접수가 제한됩니다.</li>
                </ul>
              </details>
              {errors.agree && <p id="mf-agree-err" className={err}>{errors.agree}</p>}
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
              {status.kind === "sending" ? "접수 중" : "유지보수 접수"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
