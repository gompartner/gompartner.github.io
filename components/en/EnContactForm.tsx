"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LEAD_ENDPOINT } from "@/data/classic/leadEndpoint";
import { profile } from "@/data/classic/profile";

// /en 문의 폼. 시트 칸은 국문 상담 폼과 같아서 이메일은 연락처 칸에, 회사는 업종 칸에 넣는다.
const field =
  "mt-2 h-12 w-full min-w-0 rounded-md border border-[#c9cfd8] bg-white px-4 text-[17px] text-[#15171c] outline-none transition-colors placeholder:text-[#6b7280] focus:border-[#15171c] aria-[invalid=true]:border-[#d63d4a]";
const label = "block text-[15px] font-bold text-[#3d4450]";

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "done"; id: string } | { kind: "error"; message: string };

export function EnContactForm() {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [agree, setAgree] = useState(false);
  const [website, setWebsite] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const startedAt = useRef(0);
  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "Please enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = "Please enter a valid email.";
    if (!message.trim()) next.message = "Please tell me what you need.";
    if (!agree) next.agree = "Please agree to continue.";
    setErrors(next);
    if (Object.keys(next).length) return;

    const q = new URLSearchParams(window.location.search);
    const payload = {
      name: name.trim(),
      phone: email.trim(),
      business: company.trim() || "-",
      channel: "",
      pkg: "English page",
      message: `[EN] 이메일: ${email.trim()}\n${message.trim()}`,
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
      const res = await fetch(LEAD_ENDPOINT, { method: "POST", body: JSON.stringify(payload) });
      const data = (await res.json()) as { ok?: boolean; id?: string; error?: string };
      if (data.ok && data.id) {
        setStatus({ kind: "done", id: data.id });
        window.dataLayer ??= [];
        window.dataLayer.push({ event: "generate_lead", lead_package: payload.pkg });
      } else {
        setStatus({ kind: "error", message: `Something went wrong. Please email ${profile.email}.` });
      }
    } catch {
      setStatus({ kind: "error", message: `Something went wrong. Please email ${profile.email}.` });
    }
  };

  if (status.kind === "done") {
    return (
      <div role="status" className="rounded-lg bg-white p-6 md:p-8">
        <p className="text-[15px] font-bold tabular-nums text-[#256ef4]">Reference {status.id}</p>
        <p className="mt-2 text-[26px] font-[800] leading-[1.35]">Thank you. I will reply within 24 hours.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-5 rounded-lg bg-white p-6 md:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="en-name" className={label}>Name</label>
          <input id="en-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={field} aria-invalid={!!errors.name} aria-describedby={errors.name ? "en-name-err" : undefined} />
          {errors.name && <p id="en-name-err" className="mt-1.5 text-[14px] text-[#d63d4a]">{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="en-company" className={label}>Company</label>
          <input id="en-company" value={company} onChange={(e) => setCompany(e.target.value)} autoComplete="organization" className={field} />
        </div>
      </div>
      <div>
        <label htmlFor="en-email" className={label}>Email</label>
        <input id="en-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" className={field} aria-invalid={!!errors.email} aria-describedby={errors.email ? "en-email-err" : undefined} />
        {errors.email && <p id="en-email-err" className="mt-1.5 text-[14px] text-[#d63d4a]">{errors.email}</p>}
      </div>
      <div>
        <label htmlFor="en-message" className={label}>What you need</label>
        <textarea id="en-message" value={message} onChange={(e) => setMessage(e.target.value)} rows={5} className={`${field} h-auto py-3 leading-[1.6]`} aria-invalid={!!errors.message} aria-describedby={errors.message ? "en-message-err" : undefined} />
        {errors.message && <p id="en-message-err" className="mt-1.5 text-[14px] text-[#d63d4a]">{errors.message}</p>}
      </div>
      {/* 사람 눈에는 안 보이는 칸. 채워져 있으면 로봇으로 본다 */}
      <input type="text" name="website" value={website} onChange={(e) => setWebsite(e.target.value)} tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
      <div>
        <label className="flex min-h-11 items-start gap-3 text-[16px] leading-[1.5]">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-[#256ef4]" aria-invalid={!!errors.agree} />
          <span>
            I agree that my details are used only to reply to this inquiry.{" "}
            <Link href="/privacy" lang="ko" className="text-[#5b6370] underline underline-offset-4">Privacy policy (Korean)</Link>
          </span>
        </label>
        {errors.agree && <p className="mt-1.5 text-[14px] text-[#d63d4a]">{errors.agree}</p>}
      </div>
      {status.kind === "error" && <p role="alert" className="text-[15px] text-[#d63d4a]">{status.message}</p>}
      <button type="submit" disabled={status.kind === "sending"} data-gtm-cta="en_contact_submit" className="inline-flex min-h-12 w-full items-center justify-center rounded-md bg-[#15171c] px-6 text-[17px] font-bold text-white hover:bg-[#2a2e36] disabled:opacity-60 sm:w-auto">
        {status.kind === "sending" ? "Sending..." : "Send"}
      </button>
    </form>
  );
}
