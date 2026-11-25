"use client";

import { useEffect, useRef, useState } from "react";
import { readAttribution } from "@/lib/attribution";
import { useSearchParams } from "next/navigation";
import { ChevronDown, FileText, MessageCircle } from "lucide-react";
import { openChannelChat } from "@/components/layout/ChannelTalk";
import { LEAD_ENDPOINT } from "@/data/classic/leadEndpoint";
import { profileLink } from "@/data/classic/companyProfile";
import { profile } from "@/data/classic/profile";
import { projects } from "@/data/classic/projects";

// 클래식 상담 신청 폼. 보내는 방식과 필드명은 /landing 폼과 같다(같은 Apps Script 시트에 쌓인다).

export const SERVICES = ["홈페이지 제작", "랜딩페이지 제작", "업무 프로그램 제작", "앱 제작", "키오스크 화면 제작", "유지보수", "상담 후 결정"] as const;
// 11-11 신청 종류: 견적서를 받거나, 화면 시안을 먼저 받아 본다. ?type=draft 로 시안 의뢰를 미리 고른다
export const KINDS = [
  { id: "quote", title: "견적 의뢰", body: "작업 범위, 일정, 비용을 견적서로 받습니다." },
  { id: "draft", title: "시안 의뢰", body: "첫 화면 시안을 무료로 먼저 보고 진행 여부를 정합니다." },
] as const;
type KindId = (typeof KINDS)[number]["id"];

export const BUDGETS = ["30만 원 미만", "30만~50만 원", "50만~100만 원", "100만 원 이상", "협의"] as const;

// 오류가 나면 이 순서대로 첫 칸에 초점을 옮긴다
const FIELD_IDS: Record<string, string> = { name: "cc-name", phone: "cc-phone", email: "cc-email", message: "cc-message", agree: "cc-agree" };

const PHONE_RE = /^01[016789]-?\d{3,4}-?\d{4}$/;

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "error"; message: string } | { kind: "done"; id: string };

const field =
  "mt-2 h-12 w-full min-w-0 rounded-md border border-[#c9cfd8] bg-white px-4 text-[17px] text-[#15171c] outline-none transition-colors placeholder:text-[#6b7280] focus:border-[#15171c] aria-[invalid=true]:border-[#d63d4a] motion-reduce:transition-none";
const label = "block text-[16px] font-bold";
const opt = "font-normal text-[#5b6370]";
const err = "mt-1.5 text-[15px] text-[#d63d4a]";

/** compact: 메인 랜딩 첫 화면용(11-25). 이메일과 마케팅 동의 칸을 빼고 이름, 휴대폰, 주소, 문의 내용만 받는다 */
export function ContactForm({ compact = false }: { compact?: boolean } = {}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  // 첫 화면 주소 칸의 "점검 요청"으로 넘어오면 ?site=주소 가 붙는다. 서비스와 문의 내용을 미리 채운다.
  const params = useSearchParams();
  const site = params.get("site") ?? "";
  // PHP 프로모션 띠에서 오면 promo=php, 무료 이어받기 띠에서 오면 promo=takeover 가 붙는다
  const promo = params.get("promo") ?? "";
  // 가격 페이지 견적 계산의 "이 견적으로 상담"은 ?msg=계산 내용 을 붙여 넘긴다
  const msg = params.get("msg") ?? "";
  // 카탈로그 화면의 "이 카탈로그로 상담"은 ?sample=slug 를 붙인다. 이름을 찾아 참고 카탈로그 칸에 넣는다
  const sampleTitle = projects.find((p) => p.id === params.get("sample"))?.title ?? "";
  const [kind] = useState<KindId>(params.get("type") === "draft" ? "draft" : "quote");
  // 11-19 화면에서는 신청 종류를 고르지 않는다. ?type=draft 로 오면 시안 의뢰로 기록
  const kindTitle = kind === "draft" ? "시안 의뢰" : "상담 신청";
  const [service] = useState(site || promo ? "유지보수" : sampleTitle ? "홈페이지 제작" : "");
  const [sample] = useState(sampleTitle);
  const [currentSite, setCurrentSite] = useState(site);
  // 무료 이어받기 띠에서 오면 promo=takeover(11-07), 원페이지 무료 제작 띠에서 오면 promo=onepage(11-23, site 칸에 업종)
  const promoLabel = promo === "php" ? "PHP 무료 점검 요청" : promo === "takeover" ? "업체 변경 무료 지원 신청" : promo === "onepage" ? "원페이지 무료 제작 신청" : "홈페이지 사전 검토 신청";
  // 11-08 카카오톡 채널 쿠폰(첫 달 유지보수 50%)의 "쿠폰번호 등록하기"는 ?promo=kakao&serial=12자리 번호 로 넘어온다
  const serial = (params.get("serial") ?? "").replace(/\D/g, "").slice(0, 20);
  const couponLine = promo === "kakao" ? `카카오톡 채널 쿠폰(첫 달 유지보수 50% 할인)${serial ? ` 번호 ${serial}` : ""}\n홈페이지 주소: ` : "";
  const [message, setMessage] = useState(couponLine || (site || promo === "php" || promo === "takeover" || promo === "onepage" ? `${promoLabel}: ${site}` : msg));
  const [agree, setAgree] = useState(false);
  // 11-22 마케팅 정보 수신 선택 동의. 동의하지 않아도 신청은 된다.
  const [marketing, setMarketing] = useState(false);
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
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = "이메일 주소를 확인해 주세요.";
    if (!agree) e.agree = "개인정보 수집 및 이용에 동의해 주세요.";
    setErrors(e);
    const keys = Object.keys(e);
    const first = Object.keys(FIELD_IDS).find((k) => e[k]);
    if (first) document.getElementById(FIELD_IDS[first])?.focus();
    return keys.length === 0;
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
    // 11-14 시트 "상담 신청" 탭에 항목마다 칸이 따로 있다(form: "contact")
    const payload = {
      form: "contact",
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      business: "",
      kind: kindTitle,
      service: service || "상담 후 결정",
      sample: sample.trim(),
      budget: "",
      openDate: "",
      currentSite: currentSite.trim(),
      message: message.trim(),
      agree,
      marketing: marketing ? "동의" : "미동의",
      ...readAttribution(),
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
        window.dataLayer.push({ event: "generate_lead", lead_package: payload.service });
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
        <p className="mt-2 text-[26px] font-[800] leading-[1.35] tracking-[-0.03em] md:text-[32px]">접수되었습니다.</p>
        <dl className="mt-8 border-t border-[#e6e9ee] text-[16px]">
          <div className="flex flex-col gap-1 border-b border-[#e6e9ee] py-4 sm:flex-row sm:gap-6">
            <dt className="w-[120px] shrink-0 font-bold text-[#3d4450]">회신</dt>
            <dd>{kind === "draft" ? "영업일 기준 24시간 이내에 시안 범위와 일정을 회신합니다." : "영업일 기준 24시간 이내에 회신합니다."}</dd>
          </div>
          <div className="flex flex-col gap-1 border-b border-[#e6e9ee] py-4 sm:flex-row sm:gap-6">
            <dt className="w-[120px] shrink-0 font-bold text-[#3d4450]">다른 연락 창구</dt>
            <dd>전화 {profile.phone}, 이메일 {profile.email}</dd>
          </div>
        </dl>
        <div className="mt-8 flex flex-wrap gap-3">
        {/* 11-19 회사소개서. /profile 이 열람 시각을 남기고 드라이브 PDF로 넘긴다 */}
        <a
          href={profileLink(status.id, "done")}
          target="_blank"
          rel="noopener"
          data-gtm-cta="contact_done_profile"
          className="inline-flex h-12 items-center gap-2 rounded-md bg-[#256ef4] px-5 text-[16px] font-bold text-white transition-colors hover:bg-[#1b5bd1] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#15171c]"
        >
          <FileText size={18} aria-hidden />
          회사소개서 보기
        </a>
        {/* 11-08 접수 뒤 채널톡으로 바로 이어서 묻기. 입력칸에 접수 번호를 채워 연다 */}
        <button
          type="button"
          onClick={() => openChannelChat({ name: name.trim(), phone: phone.trim(), message: `[접수 번호 ${status.id}] ` })}
          data-gtm-cta="contact_done_channel_chat"
          className="inline-flex h-12 items-center gap-2 rounded-md border border-[#15171c] bg-white px-5 text-[16px] font-bold text-[#15171c] transition-colors hover:bg-[#f3f5f8] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#15171c]"
        >
          <MessageCircle size={18} aria-hidden />
          채팅으로 이어서 문의
        </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-7 border-t-2 border-[#15171c] pt-8">
      <div role="alert">
        {Object.keys(errors).length > 0 && (
          <p className="rounded-md border border-[#d63d4a] bg-white px-4 py-3 text-[16px] font-bold text-[#d63d4a]">입력 내용 {Object.keys(errors).length}곳을 확인해 주세요.</p>
        )}
      </div>
      <div className="grid gap-7 md:grid-cols-2 md:gap-6">
        <div className="min-w-0">
          <label htmlFor="cc-name" className={label}>
            이름
          </label>
          <input id="cc-name" aria-required="true" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="성함" className={field} aria-invalid={!!errors.name} aria-describedby={errors.name ? "cc-name-err" : undefined} />
          {errors.name && <p id="cc-name-err" className={err}>{errors.name}</p>}
        </div>
        <div className="min-w-0">
          <label htmlFor="cc-phone" className={label}>
            휴대폰
          </label>
          <input id="cc-phone" aria-required="true" value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" placeholder="010-1234-5678" className={field} aria-invalid={!!errors.phone} aria-describedby={errors.phone ? "cc-phone-err" : undefined} />
          {errors.phone && <p id="cc-phone-err" className={err}>{errors.phone}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="cc-site" className={label}>
          홈페이지 주소 <span className={opt}>(선택)</span>
        </label>
        <input id="cc-site" value={currentSite} onChange={(e) => setCurrentSite(e.target.value)} inputMode="url" autoComplete="url" placeholder="www.example.co.kr" className={field} />
      </div>

      <div>
        <label htmlFor="cc-message" className={label}>
          문의 내용 <span className={opt}>(선택)</span>
        </label>
        <textarea
          id="cc-message"
          aria-required="true"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={compact ? 3 : 4}
          placeholder="맡기고 싶은 일"
          className={`${field} h-auto py-3 leading-[1.6]`}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? "cc-message-err" : undefined}
        />
        {errors.message && <p id="cc-message-err" className={err}>{errors.message}</p>}
      </div>

      {!compact && (
      <div>
        <label htmlFor="cc-email" className={label}>
          회사소개서 받을 이메일 <span className={opt}>(선택)</span>
        </label>
        <input id="cc-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="name@example.com" className={field} aria-invalid={!!errors.email} aria-describedby={errors.email ? "cc-email-err" : undefined} />
        {errors.email && <p id="cc-email-err" className={err}>{errors.email}</p>}
      </div>
      )}

      {/* 사람 눈에는 보이지 않는 칸. 채워져 있으면 자동 입력으로 보고 버린다. */}
      <div aria-hidden className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden">
        <label htmlFor="cc-website">웹사이트</label>
        <input id="cc-website" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
      </div>

      <div className="border-t border-[#e6e9ee] pt-6">
        <div className="flex items-start gap-3">
          <input
            id="cc-agree"
            aria-required="true"
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
            <li>수집 항목: 이름, 휴대폰 번호, 홈페이지 주소(선택), 문의 내용(선택), 이메일(선택), 유입 경로(접속 페이지 주소, 이전 페이지 주소)</li>
            <li>이용 목적: 상담 신청 확인 및 회신</li>
            <li>보관 기간: 상담 종료일부터 1년</li>
            <li>동의를 거부할 수 있으며 거부 시 신청이 제한됩니다.</li>
          </ul>
        </details>
        {errors.agree && <p id="cc-agree-err" className={err}>{errors.agree}</p>}

        {!compact && (
        <>
        <div className="mt-6 flex items-start gap-3">
          <input id="cc-marketing" type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-[#256ef4]" />
          <label htmlFor="cc-marketing" className="text-[16px] font-bold leading-[1.6]">
            마케팅 정보 수신에 동의합니다. <span className={opt}>(선택)</span>
          </label>
        </div>
        <details className="group mt-3 rounded-md border border-[#e6e9ee] bg-[#f6f7f9] px-4 py-3 text-[15px] leading-[1.6] text-[#5b6370]">
          <summary className="flex cursor-pointer list-none items-center gap-1 font-bold text-[#3d4450] [&::-webkit-details-marker]:hidden">
            자세히 보기
            <ChevronDown size={16} className="transition-transform group-open:rotate-180 motion-reduce:transition-none" aria-hidden />
          </summary>
          <ul className="mt-2 space-y-1">
            <li>수집 항목: 이메일(위에 적은 경우)</li>
            <li>이용 목적: 곰파트너의 새 서비스, 이벤트 안내 메일</li>
            <li>보관 기간: 동의 철회 시까지</li>
            <li>안내 메일 아래의 수신 거부 링크를 누르면 바로 철회됩니다. 동의하지 않아도 상담 신청은 할 수 있습니다.</li>
          </ul>
        </details>
        </>
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
        className="flex h-14 w-full items-center justify-center rounded-md bg-[#256ef4] text-[18px] font-bold text-white transition-colors hover:bg-[#0b50d0] disabled:opacity-60 motion-reduce:transition-none md:w-[240px]"
      >
        {status.kind === "sending" ? "접수 중" : "맡기기"}
      </button>
    </form>
  );
}
