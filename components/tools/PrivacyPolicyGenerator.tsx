"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, Download, Plus, X } from "lucide-react";
import { ChannelTalkButton } from "@/components/layout/ChannelTalk";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";

/* 개인정보처리방침 생성기.
   「개인정보 보호법」 제30조와 개인정보보호위원회 작성지침의 필수 기재 항목을 기준으로,
   사이트 유형과 수집 항목을 고르면 조항을 만들어 준다. 입력값은 이 브라우저에만 저장한다. */

const EASE = [0.23, 1, 0.32, 1] as const;
const STORAGE_KEY = "gs-tool:privacy-policy:v1";

const SITE_TYPES = ["문의 폼만 있는 홈페이지", "회원제 홈페이지", "쇼핑몰", "예약 서비스"] as const;
type SiteType = (typeof SITE_TYPES)[number];

const ITEMS = ["이름", "휴대전화번호", "이메일", "아이디·비밀번호", "주소", "생년월일", "결제 정보", "예약 일시·희망 내용"] as const;
type Item = (typeof ITEMS)[number];

const PURPOSES = {
  회원: "회원 가입 의사 확인, 본인 식별, 회원 자격 유지·관리, 부정 이용 방지",
  문의: "문의·상담 접수, 사실 확인을 위한 연락, 처리 결과 안내",
  주문: "주문 확인, 대금 결제, 상품 배송, 교환·반품·환불 처리",
  예약: "예약 접수·확인, 일정 변경·취소 안내, 방문 전 알림 발송",
  마케팅: "이벤트·혜택 안내 (별도 동의한 경우에 한함)",
} as const;
type Purpose = keyof typeof PURPOSES;

interface Vendor {
  name: string;
  task: string;
}

interface Form {
  siteType: SiteType;
  company: string;
  siteName: string;
  items: Item[];
  purposes: Purpose[];
  retention: string;
  vendors: Vendor[];
  thirdParty: Vendor[];
  cookies: boolean;
  analytics: boolean;
  noChildren: boolean;
  officer: string;
  officerTitle: string;
  officerPhone: string;
  officerEmail: string;
  effectiveDate: string;
}

const PRESETS: Record<SiteType, Pick<Form, "items" | "purposes" | "retention" | "vendors" | "cookies">> = {
  "문의 폼만 있는 홈페이지": {
    items: ["이름", "휴대전화번호", "이메일"],
    purposes: ["문의"],
    retention: "문의 처리 완료 후 1년",
    vendors: [{ name: "", task: "홈페이지 서버 운영(호스팅)" }],
    cookies: true,
  },
  "회원제 홈페이지": {
    items: ["이름", "휴대전화번호", "이메일", "아이디·비밀번호"],
    purposes: ["회원", "문의"],
    retention: "회원 탈퇴 시까지",
    vendors: [
      { name: "", task: "홈페이지 서버 운영(호스팅)" },
      { name: "", task: "알림 문자 발송" },
    ],
    cookies: true,
  },
  쇼핑몰: {
    items: ["이름", "휴대전화번호", "이메일", "아이디·비밀번호", "주소", "결제 정보"],
    purposes: ["회원", "주문", "문의"],
    retention: "회원 탈퇴 시까지",
    vendors: [
      { name: "", task: "전자결제 대행" },
      { name: "", task: "상품 배송" },
      { name: "", task: "주문 알림 문자 발송" },
      { name: "", task: "쇼핑몰 서버 운영(호스팅)" },
    ],
    cookies: true,
  },
  "예약 서비스": {
    items: ["이름", "휴대전화번호", "예약 일시·희망 내용"],
    purposes: ["예약", "문의"],
    retention: "예약 일자 경과 후 1년",
    vendors: [
      { name: "", task: "예약 알림 문자 발송" },
      { name: "", task: "홈페이지 서버 운영(호스팅)" },
    ],
    cookies: true,
  },
};

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const initialForm: Form = {
  siteType: "쇼핑몰",
  company: "",
  siteName: "",
  ...PRESETS["쇼핑몰"],
  thirdParty: [],
  analytics: true,
  noChildren: true,
  officer: "",
  officerTitle: "대표",
  officerPhone: "",
  officerEmail: "",
  effectiveDate: "",
};

// 문서의 한 줄: 일반 문장, 목록, 표. 빈 필수값은 missing으로 표시한다
type Part = { kind: "p"; text: string } | { kind: "ul"; items: string[] } | { kind: "table"; head: string[]; rows: string[][] };
interface Section {
  id: string;
  title: string;
  parts: Part[];
}

const blank = (v: string, label: string) => v.trim() || `[${label}]`;
const eun = (word: string) => {
  const code = word.charCodeAt(word.length - 1) - 0xac00;
  return code >= 0 && code <= 11171 && code % 28 !== 0 ? "은" : "는";
};

function build(f: Form): Section[] {
  const co = blank(f.company, "회사명");
  const site = f.siteName.trim() ? `(${f.siteName.trim()})` : "";
  const collectsLog = f.cookies || f.analytics;
  // 관계 법령에 따라 따로 보존하는 기록
  const legal = [
    ...(f.siteType === "쇼핑몰"
      ? [
          "계약 또는 청약철회 등에 관한 기록: 5년 (전자상거래 등에서의 소비자보호에 관한 법률)",
          "대금결제 및 재화 등의 공급에 관한 기록: 5년 (같은 법)",
          "소비자의 불만 또는 분쟁처리에 관한 기록: 3년 (같은 법)",
          "표시·광고에 관한 기록: 6개월 (같은 법)",
        ]
      : []),
    ...(collectsLog ? ["웹사이트 방문 기록(접속 로그): 3개월 (통신비밀보호법)"] : []),
  ];
  const sections: Section[] = [
    {
      id: "intro",
      title: "",
      parts: [
        {
          kind: "p",
          text: `${co}${site}${eun(co)} 「개인정보 보호법」 제30조에 따라 정보주체의 개인정보를 보호하고 이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 다음과 같이 개인정보 처리방침을 수립·공개합니다.`,
        },
      ],
    },
    {
      id: "purpose",
      title: "개인정보의 처리 목적",
      parts: [
        { kind: "p", text: `${co}${eun(co)} 다음 목적을 위하여 개인정보를 처리하며, 목적 이외의 용도로는 이용하지 않습니다. 이용 목적이 바뀌는 경우에는 별도의 동의를 받습니다.` },
        { kind: "ul", items: f.purposes.map((p) => `${p === "회원" ? "회원 관리" : p === "문의" ? "문의·상담 처리" : p === "주문" ? "주문·결제·배송" : p === "예약" ? "예약 관리" : "마케팅·광고 활용"}: ${PURPOSES[p]}`) },
      ],
    },
    {
      id: "items",
      title: "처리하는 개인정보 항목",
      parts: [
        { kind: "ul", items: [`필수 항목: ${f.items.filter((i) => i !== "결제 정보").join(", ") || "[수집 항목]"}`] },
        ...(f.items.includes("결제 정보")
          ? [{ kind: "p" as const, text: "결제 정보(카드사명, 승인번호 등)는 전자결제 대행사가 처리하며, 회사는 카드번호 전체를 저장하지 않습니다." }]
          : []),
        ...(collectsLog
          ? [{ kind: "p" as const, text: "서비스 이용 과정에서 접속 IP 주소, 쿠키, 방문 일시, 서비스 이용 기록이 자동으로 생성되어 수집될 수 있습니다." }]
          : []),
      ],
    },
    {
      id: "retention",
      title: "개인정보의 처리 및 보유 기간",
      parts: [
        { kind: "p", text: `개인정보는 수집 시 동의받은 보유 기간(${blank(f.retention, "보유 기간")}) 동안 보유·이용하며, 목적이 달성되면 지체 없이 파기합니다. 다만 관계 법령에 따라 보존해야 하는 경우에는 해당 기간 동안 보관합니다.` },
        ...(legal.length ? [{ kind: "ul" as const, items: legal }] : []),
      ],
    },
    {
      id: "third",
      title: "개인정보의 제3자 제공",
      parts: f.thirdParty.length
        ? [
            { kind: "p", text: "회사는 정보주체의 동의가 있거나 법률에 특별한 규정이 있는 경우에만 개인정보를 제3자에게 제공합니다." },
            { kind: "table", head: ["제공받는 자", "제공 목적"], rows: f.thirdParty.map((v) => [blank(v.name, "업체명"), blank(v.task, "제공 목적")]) },
          ]
        : [{ kind: "p", text: "회사는 정보주체의 개인정보를 제3자에게 제공하지 않습니다. 다만 정보주체의 동의가 있거나 법률에 특별한 규정이 있는 경우는 예외로 합니다." }],
    },
    {
      id: "entrust",
      title: "개인정보 처리업무의 위탁",
      parts: f.vendors.length
        ? [
            { kind: "p", text: "회사는 원활한 서비스 제공을 위하여 다음과 같이 개인정보 처리업무를 위탁하고 있으며, 위탁계약 시 관련 법령에 따라 개인정보가 안전하게 관리되도록 필요한 사항을 규정하고 수탁자를 감독합니다." },
            { kind: "table", head: ["수탁자", "위탁 업무"], rows: f.vendors.map((v) => [blank(v.name, "업체명"), blank(v.task, "위탁 업무")]) },
          ]
        : [{ kind: "p", text: "회사는 개인정보 처리업무를 외부에 위탁하지 않습니다." }],
    },
    {
      id: "rights",
      title: "정보주체와 법정대리인의 권리·의무 및 행사방법",
      parts: [
        { kind: "p", text: "정보주체는 회사에 대해 언제든지 개인정보 열람, 정정·삭제, 처리정지 및 동의 철회를 요구할 수 있습니다." },
        { kind: "p", text: "권리 행사는 서면, 전자우편 등으로 하실 수 있으며 회사는 지체 없이 조치합니다. 법정대리인이나 위임을 받은 자를 통해서도 행사할 수 있습니다." },
      ],
    },
    {
      id: "destroy",
      title: "개인정보의 파기 절차 및 방법",
      parts: [
        { kind: "p", text: "보유 기간이 지나거나 처리 목적이 달성된 개인정보는 지체 없이 파기합니다." },
        { kind: "ul", items: ["전자적 파일: 복구할 수 없는 방법으로 영구 삭제", "종이 문서: 분쇄하거나 소각"] },
      ],
    },
    {
      id: "safety",
      title: "개인정보의 안전성 확보조치",
      parts: [
        {
          kind: "ul",
          items: [
            "관리적 조치: 개인정보 취급 직원 최소화 및 교육",
            "기술적 조치: 접근 권한 관리, 비밀번호 등 중요 정보 암호화, 보안 프로그램 설치",
            "물리적 조치: 서버와 자료 보관 장소의 접근 통제",
          ],
        },
      ],
    },
    {
      id: "cookie",
      title: "개인정보 자동 수집 장치의 설치·운영 및 거부",
      parts: f.cookies
        ? [
            { kind: "p", text: "회사는 이용자에게 맞춤 서비스를 제공하기 위해 이용 정보를 저장하고 수시로 불러오는 쿠키(cookie)를 사용합니다." },
            ...(f.analytics
              ? [{ kind: "p" as const, text: "방문 통계 분석을 위해 구글 애널리틱스(Google Analytics)를 사용하며, 이 과정에서 쿠키를 통해 개인을 식별할 수 없는 방문 정보가 수집될 수 있습니다." }]
              : []),
            { kind: "p", text: "이용자는 웹 브라우저 설정(설정 > 개인정보 보호 > 쿠키)에서 쿠키 저장을 거부할 수 있습니다. 다만 쿠키 저장을 거부하면 일부 서비스 이용이 어려울 수 있습니다." },
          ]
        : [{ kind: "p", text: "회사는 쿠키 등 개인정보를 자동으로 수집하는 장치를 사용하지 않습니다." }],
    },
    ...(f.noChildren && (f.purposes.includes("회원") || f.siteType === "쇼핑몰")
      ? [{ id: "child", title: "만 14세 미만 아동의 개인정보", parts: [{ kind: "p" as const, text: "회사는 만 14세 미만 아동의 회원 가입을 받지 않으며, 아동의 개인정보를 수집하지 않습니다." }] }]
      : []),
    {
      id: "officer",
      title: "개인정보 보호책임자",
      parts: [
        { kind: "p", text: "회사는 개인정보 처리에 관한 업무를 총괄하고 관련 불만 처리와 피해 구제를 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다." },
        {
          kind: "ul",
          items: [
            `성명: ${blank(f.officer, "이름")}`,
            `직책: ${blank(f.officerTitle, "직책")}`,
            `연락처: ${blank(f.officerPhone, "전화번호")}`,
            `전자우편: ${blank(f.officerEmail, "이메일")}`,
          ],
        },
      ],
    },
    {
      id: "remedy",
      title: "권익침해 구제방법",
      parts: [
        { kind: "p", text: "개인정보 침해에 대한 피해 구제나 상담이 필요한 경우 아래 기관에 문의하실 수 있습니다." },
        {
          kind: "ul",
          items: [
            "개인정보분쟁조정위원회: (국번 없이) 1833-6972 (www.kopico.go.kr)",
            "개인정보침해신고센터: (국번 없이) 118 (privacy.kisa.or.kr)",
            "대검찰청: (국번 없이) 1301 (www.spo.go.kr)",
            "경찰청: (국번 없이) 182 (ecrm.police.go.kr)",
          ],
        },
      ],
    },
    {
      id: "change",
      title: "개인정보 처리방침의 변경",
      parts: [{ kind: "p", text: `이 개인정보 처리방침은 ${f.effectiveDate ? f.effectiveDate.replace(/-/g, ". ") + "." : "[시행일]"}부터 적용됩니다.` }],
    },
  ];
  return sections;
}

// 복사·다운로드용 일반 텍스트
function toText(sections: Section[]) {
  let n = 0;
  return sections
    .map((s) => {
      const head = s.title ? `제${++n}조 (${s.title})\n` : "";
      const body = s.parts
        .map((p) => (p.kind === "p" ? p.text : p.kind === "ul" ? p.items.map((i) => `- ${i}`).join("\n") : [p.head.join(" | "), ...p.rows.map((r) => r.join(" | "))].join("\n")))
        .join("\n");
      return head + body;
    })
    .join("\n\n");
}

function toHtml(sections: Section[]) {
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  let n = 0;
  return sections
    .map((s) => {
      const head = s.title ? `<h3>제${++n}조 (${esc(s.title)})</h3>\n` : "";
      const body = s.parts
        .map((p) =>
          p.kind === "p"
            ? `<p>${esc(p.text)}</p>`
            : p.kind === "ul"
              ? `<ul>${p.items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>`
              : `<table><thead><tr>${p.head.map((h) => `<th>${esc(h)}</th>`).join("")}</tr></thead><tbody>${p.rows.map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody></table>`,
        )
        .join("\n");
      return head + body;
    })
    .join("\n");
}

// 빈 필수값 "[회사명]"을 빨간 표시로 보여 준다
function Marked({ text }: { text: string }) {
  const parts = text.split(/(\[[^\]]+\])/g);
  return (
    <>
      {parts.map((t, i) =>
        /^\[.+\]$/.test(t) ? (
          <mark key={i} className="rounded bg-[#fde7e9] px-1 font-bold text-[#b42318]">
            {t}
          </mark>
        ) : (
          t
        ),
      )}
    </>
  );
}

const label = "block text-[15px] font-bold";
const input = "mt-1.5 h-11 w-full rounded-md border border-[#6d7882] bg-white px-3 text-[16px]";

export function PrivacyPolicyGenerator() {
  const reduce = useReducedMotionSafe();
  const [form, setForm] = useLocalStorage<Form>(STORAGE_KEY, initialForm);
  const [copied, setCopied] = useState<"text" | "html" | null>(null);
  // 처음 불러올 때는 모든 조항이 번쩍이지 않도록, 저장값을 읽은 뒤부터 강조한다
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setReady(true), 600);
    return () => window.clearTimeout(t);
  }, []);
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));

  const sections = useMemo(() => build(form), [form]);
  const required: [string, boolean][] = [
    ["회사명", !!form.company.trim()],
    ["보호책임자 이름", !!form.officer.trim()],
    ["연락처", !!form.officerPhone.trim()],
    ["이메일", !!form.officerEmail.trim()],
    ["시행일", !!form.effectiveDate],
  ];
  const done = required.filter(([, ok]) => ok).length;

  const copy = async (kind: "text" | "html") => {
    const value = kind === "text" ? toText(sections) : toHtml(sections);
    try {
      await navigator.clipboard.writeText(value);
      setCopied(kind);
      window.setTimeout(() => setCopied(null), 1600);
    } catch {
      setCopied(null);
    }
  };

  const download = () => {
    const url = URL.createObjectURL(new Blob([toText(sections)], { type: "text/plain;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `개인정보처리방침_${form.company.trim() || "초안"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const vendorEditor = (key: "vendors" | "thirdParty", title: string, taskLabel: string) => (
    <fieldset className="mt-6">
      <legend className={label}>{title}</legend>
      <ul className="mt-2 grid gap-2">
        {form[key].map((v, i) => (
          <li key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2">
            <input
              aria-label={`${title} ${i + 1} 업체명`}
              placeholder="업체명"
              value={v.name}
              onChange={(e) => set(key, form[key].map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))}
              className={input.replace("mt-1.5 ", "")}
            />
            <input
              aria-label={`${title} ${i + 1} ${taskLabel}`}
              placeholder={taskLabel}
              value={v.task}
              onChange={(e) => set(key, form[key].map((x, j) => (j === i ? { ...x, task: e.target.value } : x)))}
              className={input.replace("mt-1.5 ", "")}
            />
            <button
              type="button"
              aria-label={`${title} ${i + 1} 삭제`}
              onClick={() => set(key, form[key].filter((_, j) => j !== i))}
              className="grid size-11 place-items-center rounded-md text-foreground-secondary hover:bg-surface"
            >
              <X size={18} aria-hidden />
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() => set(key, [...form[key], { name: "", task: "" }])}
        className="mt-2 inline-flex h-10 items-center gap-1 rounded-md px-2 text-[15px] font-bold text-accent hover:bg-accent-surface"
      >
        <Plus size={16} aria-hidden />
        업체 추가
      </button>
    </fieldset>
  );

  let count = 0;
  const numbers = sections.map((s) => (s.title ? ++count : 0));

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <form className="min-w-0" onSubmit={(e) => e.preventDefault()} aria-label="처리방침 항목 입력">
        <fieldset>
          <legend className={label}>사이트 유형</legend>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {SITE_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                aria-pressed={form.siteType === t}
                onClick={() => setForm((f) => ({ ...f, siteType: t, ...PRESETS[t], vendors: PRESETS[t].vendors.map((v) => ({ ...v })) }))}
                className={`min-h-12 rounded-md border px-3 py-2 text-left text-[15px] font-bold transition-colors ${
                  form.siteType === t ? "border-accent bg-accent-surface text-accent-hover" : "border-border hover:bg-surface"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className={label}>
            회사·상호명 <span className="text-[#b42318]">*</span>
            <input value={form.company} onChange={(e) => set("company", e.target.value)} placeholder="예: 곰선임상회" className={input} />
          </label>
          <label className={label}>
            사이트 이름
            <input value={form.siteName} onChange={(e) => set("siteName", e.target.value)} placeholder="예: 곰선임몰" className={input} />
          </label>
        </div>

        <fieldset className="mt-6">
          <legend className={label}>수집하는 항목</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {ITEMS.map((i) => (
              <label key={i} className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 text-[15px] has-[:checked]:border-accent has-[:checked]:bg-accent-surface">
                <input type="checkbox" checked={form.items.includes(i)} onChange={() => set("items", toggle(form.items, i))} className="size-4 accent-[var(--accent)]" />
                {i}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-6">
          <legend className={label}>이용 목적</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {(Object.keys(PURPOSES) as Purpose[]).map((p) => (
              <label key={p} className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 text-[15px] has-[:checked]:border-accent has-[:checked]:bg-accent-surface">
                <input type="checkbox" checked={form.purposes.includes(p)} onChange={() => set("purposes", toggle(form.purposes, p))} className="size-4 accent-[var(--accent)]" />
                {p === "회원" ? "회원 관리" : p === "문의" ? "문의·상담" : p === "주문" ? "주문·배송" : p === "예약" ? "예약 관리" : "마케팅"}
              </label>
            ))}
          </div>
        </fieldset>

        <label className={`${label} mt-6`}>
          보유 기간
          <input value={form.retention} onChange={(e) => set("retention", e.target.value)} placeholder="예: 회원 탈퇴 시까지" className={input} />
        </label>

        {vendorEditor("vendors", "처리 위탁 업체", "위탁 업무")}
        {vendorEditor("thirdParty", "제3자 제공 (없으면 비워 두세요)", "제공 목적")}

        <fieldset className="mt-6 grid gap-2">
          <legend className={label}>기타</legend>
          {(
            [
              ["cookies", "쿠키를 사용합니다"],
              ["analytics", "구글 애널리틱스 등 방문 통계를 씁니다"],
              ["noChildren", "만 14세 미만은 가입을 받지 않습니다"],
            ] as const
          ).map(([k, text]) => (
            <label key={k} className="inline-flex items-center gap-2 text-[16px]">
              <input type="checkbox" checked={form[k]} onChange={(e) => set(k, e.target.checked)} className="size-4 accent-[var(--accent)]" />
              {text}
            </label>
          ))}
        </fieldset>

        <fieldset className="mt-6">
          <legend className={label}>개인정보 보호책임자</legend>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            <label className="text-[15px]">
              이름 <span className="text-[#b42318]">*</span>
              <input value={form.officer} onChange={(e) => set("officer", e.target.value)} className={input} />
            </label>
            <label className="text-[15px]">
              직책
              <input value={form.officerTitle} onChange={(e) => set("officerTitle", e.target.value)} className={input} />
            </label>
            <label className="text-[15px]">
              연락처 <span className="text-[#b42318]">*</span>
              <input value={form.officerPhone} inputMode="tel" onChange={(e) => set("officerPhone", e.target.value)} placeholder="02-000-0000" className={input} />
            </label>
            <label className="text-[15px]">
              이메일 <span className="text-[#b42318]">*</span>
              <input value={form.officerEmail} type="email" onChange={(e) => set("officerEmail", e.target.value)} className={input} />
            </label>
          </div>
        </fieldset>

        <label className={`${label} mt-6`}>
          시행일 <span className="text-[#b42318]">*</span>
          <div className="mt-1.5 flex gap-2">
            <input type="date" value={form.effectiveDate} onChange={(e) => set("effectiveDate", e.target.value)} className={input.replace("mt-1.5 ", "")} />
            <button type="button" onClick={() => set("effectiveDate", today())} className="h-11 shrink-0 rounded-md border border-border px-3 text-[15px] font-bold hover:bg-surface">
              오늘
            </button>
          </div>
        </label>

        <button
          type="button"
          onClick={() => setForm(initialForm)}
          className="mt-6 text-[15px] text-foreground-secondary underline underline-offset-4"
        >
          입력 내용 모두 지우기
        </button>
      </form>

      <section aria-labelledby="preview-title" className="min-w-0 lg:sticky lg:top-20 lg:self-start">
        <div className="rounded-[10px] border border-border">
          <div className="flex flex-wrap items-center gap-2 border-b border-border p-4">
            <h2 id="preview-title" className="mr-auto text-[17px] font-bold">
              미리보기
              <span className="ml-2 text-[15px] font-normal text-foreground-secondary">
                필수 입력 {done}/{required.length}
              </span>
            </h2>
            <button type="button" onClick={() => copy("text")} className="inline-flex h-10 items-center gap-1.5 rounded-md bg-accent px-3.5 text-[15px] font-bold text-accent-foreground hover:bg-accent-hover">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={copied === "text" ? "ok" : "copy"}
                  initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.6 }}
                  transition={{ duration: 0.15, ease: EASE }}
                  className="inline-flex"
                >
                  {copied === "text" ? <Check size={16} aria-hidden /> : <Copy size={16} aria-hidden />}
                </motion.span>
              </AnimatePresence>
              {copied === "text" ? "복사했습니다" : "글자로 복사"}
            </button>
            <button type="button" onClick={() => copy("html")} className="inline-flex h-10 items-center gap-1.5 rounded-md border border-[#6d7882] px-3.5 text-[15px] font-bold hover:bg-surface">
              {copied === "html" ? <Check size={16} aria-hidden /> : <Copy size={16} aria-hidden />}
              {copied === "html" ? "복사했습니다" : "HTML 복사"}
            </button>
            <button type="button" onClick={download} aria-label="텍스트 파일로 내려받기" className="grid size-10 place-items-center rounded-md border border-[#6d7882] hover:bg-surface">
              <Download size={16} aria-hidden />
            </button>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-secondary" aria-hidden>
              <motion.div className="h-full rounded-full bg-accent" animate={{ width: `${(done / required.length) * 100}%` }} transition={{ duration: reduce ? 0 : 0.3, ease: EASE }} />
            </div>
          </div>
          <article className="max-h-[70vh] overflow-auto p-5 text-[15px] leading-[1.7] md:p-6" aria-live="off">
            <h3 className="text-[19px] font-bold">개인정보 처리방침</h3>
            {sections.map((s, si) => {
              const n = numbers[si];
              return (
                <div key={s.id} className="relative mt-4">
                  {/* 내용이 바뀐 조항만 잠깐 노랗게 표시한다 */}
                  {ready && !reduce && (
                    <motion.span
                      key={JSON.stringify(s.parts)}
                      aria-hidden
                      className="pointer-events-none absolute -inset-x-2 -inset-y-1 rounded bg-[#fff4ce]"
                      initial={{ opacity: 0.9 }}
                      animate={{ opacity: 0 }}
                      transition={{ duration: 1.1, ease: EASE, delay: 0.1 }}
                    />
                  )}
                  <div className="relative">
                    {s.title && (
                      <h4 className="font-bold">
                        제{n}조 ({s.title})
                      </h4>
                    )}
                    {s.parts.map((p, i) =>
                      p.kind === "p" ? (
                        <p key={i} className="mt-1">
                          <Marked text={p.text} />
                        </p>
                      ) : p.kind === "ul" ? (
                        <ul key={i} className="mt-1 list-disc pl-5">
                          {p.items.map((it) => (
                            <li key={it}>
                              <Marked text={it} />
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <table key={i} className="mt-2 w-full border-collapse text-[14px]">
                          <thead>
                            <tr>
                              {p.head.map((h) => (
                                <th key={h} scope="col" className="border border-border bg-surface px-2 py-1.5 text-left">
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {p.rows.map((r, ri) => (
                              <tr key={ri}>
                                {r.map((c, ci) => (
                                  <td key={ci} className="border border-border px-2 py-1.5">
                                    <Marked text={c} />
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ),
                    )}
                  </div>
                </div>
              );
            })}
          </article>
        </div>
        <p className="mt-3 text-[14px] leading-[1.6] text-foreground-secondary">
          이 문서는 작성을 돕기 위한 초안입니다. 실제로 수집하는 항목과 위탁 업체에 맞게 확인한 뒤 게시해 주세요. 입력한 내용은 이 브라우저에만 저장됩니다.
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[10px] bg-surface p-5">
          <p className="text-[16px] font-bold">홈페이지에 바로 붙이거나 쇼핑몰 푸터를 고쳐야 하나요?</p>
          <ChannelTalkButton cta="tool_privacy_chat" className="inline-flex h-11 items-center rounded-md bg-accent px-4 text-[15px] font-bold text-accent-foreground hover:bg-accent-hover">
            채팅 상담
          </ChannelTalkButton>
        </div>
      </section>
    </div>
  );
}
