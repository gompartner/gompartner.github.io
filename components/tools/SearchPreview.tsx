"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, CircleAlert, Copy } from "lucide-react";
import { ChannelTalkButton } from "@/components/layout/ChannelTalk";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";

/* 검색 결과 미리보기.
   상호, 지역, 업종을 넣으면 제목과 설명을 추천하고, 구글과 네이버 검색 결과에 어떻게 보이는지 그린다.
   잘리는 길이는 글자 폭(한글 1, 영문·숫자 약 0.55)을 더해 어림한다. 측정 대신 계산이라 서버와 화면 결과가 같다.
   개발자에게 넘길 meta 태그는 접어 둔다. */

const EASE = [0.23, 1, 0.32, 1] as const;

// 글자 하나의 대략적인 폭(em)
function charWidth(ch: string) {
  if (/[ㄱ-힝一-鿿]/.test(ch)) return 1;
  if (ch === " ") return 0.3;
  if (/[A-Z]/.test(ch)) return 0.66;
  if (/[il.,:;'|!]/.test(ch)) return 0.28;
  return 0.55;
}

function clip(text: string, budget: number) {
  let used = 0;
  for (let i = 0; i < text.length; i++) {
    used += charWidth(text[i]);
    if (used > budget) return { text: text.slice(0, i).trimEnd() + " ...", cut: true };
  }
  return { text, cut: false };
}

// 구글: 제목 20px 한 줄(약 600px), 설명 14px 두 줄. 네이버: 제목 18px 한 줄, 설명 15px 두 줄
const ENGINES = {
  google: { title: 29, desc: 82 },
  naver: { title: 34, desc: 78 },
};

type Fields = { name: string; region: string; industry: string; url: string; strengths: string; title: string; desc: string };

const EXAMPLE: Fields = {
  name: "곰선임치과의원",
  region: "강남역",
  industry: "치과",
  url: "https://www.gompartner.co.kr",
  strengths: "화요일, 목요일 저녁 9시까지 진료, 임플란트, 교정",
  title: "",
  desc: "",
};

function suggestTitle(f: Fields) {
  const where = [f.region, f.industry].filter(Boolean).join(" ");
  return [f.name, where].filter(Boolean).join(" | ");
}

function suggestDesc(f: Fields) {
  const head = [f.region, f.industry].filter(Boolean).join(" ");
  const parts = [head && f.name ? `${head} ${f.name}입니다.` : f.name ? `${f.name}입니다.` : ""];
  if (f.strengths) parts.push(`${f.strengths}.`.replace(/\.\.$/, "."));
  parts.push("위치와 영업시간, 예약 방법을 안내합니다.");
  return parts.filter(Boolean).join(" ");
}

function displayUrl(url: string) {
  try {
    const u = new URL(url.startsWith("http") ? url : `https://${url}`);
    return { host: u.hostname, path: u.pathname === "/" ? "" : u.pathname, full: u.origin + u.pathname };
  } catch {
    return { host: url || "www.gompartner.co.kr", path: "", full: url };
  }
}

function escapeAttr(s: string) {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

export function SearchPreview() {
  const reduce = useReducedMotionSafe();
  const [f, setF] = useState<Fields>(EXAMPLE);
  const [codeOpen, setCodeOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const set = (k: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF((s) => ({ ...s, [k]: e.target.value }));

  const title = f.title || suggestTitle(f);
  const desc = f.desc || suggestDesc(f);
  const url = displayUrl(f.url);
  const len = (s: string) => [...s].length;

  const checks = [
    { ok: !!f.name && title.includes(f.name), text: "제목에 상호가 들어 있습니다", fix: "제목 앞쪽에 상호를 넣으세요. 이름으로 찾는 손님이 가장 많습니다." },
    { ok: !!f.region && title.includes(f.region), text: "제목에 지역이 들어 있습니다", fix: "\"강남역 치과\"처럼 지역과 업종으로 검색하는 손님이 많습니다. 제목에 지역을 넣으세요." },
    { ok: len(title) >= 8 && !clip(title, ENGINES.google.title).cut, text: `제목 길이가 적당합니다 (${len(title)}자)`, fix: `제목이 ${len(title) < 8 ? "너무 짧습니다" : "길어서 잘립니다"}. 한글 기준 15~28자가 알맞습니다.` },
    { ok: len(desc) >= 40 && !clip(desc, ENGINES.naver.desc).cut, text: `설명 길이가 적당합니다 (${len(desc)}자)`, fix: `설명이 ${len(desc) < 40 ? "짧습니다" : "길어서 뒷부분이 잘립니다"}. 40~75자로 맞추세요.` },
    { ok: !!desc && desc !== title && !desc.startsWith(title), text: "설명이 제목과 다른 내용입니다", fix: "설명에는 제목에 없는 정보(영업시간, 주차, 대표 서비스)를 넣으세요." },
  ];
  const passed = checks.filter((c) => c.ok).length;

  const code = [
    `<title>${escapeAttr(title)}</title>`,
    `<meta name="description" content="${escapeAttr(desc)}">`,
    `<link rel="canonical" href="${escapeAttr(url.full)}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:title" content="${escapeAttr(title)}">`,
    `<meta property="og:description" content="${escapeAttr(desc)}">`,
    `<meta property="og:url" content="${escapeAttr(url.full)}">`,
  ].join("\n");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCodeOpen(true);
    }
  };

  const g = { t: clip(title, ENGINES.google.title), d: clip(desc, ENGINES.google.desc) };
  const n = { t: clip(title, ENGINES.naver.title), d: clip(desc, ENGINES.naver.desc) };

  const input = "mt-1.5 h-12 w-full rounded-md border border-[#8a949e] bg-background px-3 text-[17px] focus:border-accent";

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <form className="min-w-0" onSubmit={(e) => e.preventDefault()}>
        <fieldset className="grid gap-4">
          <legend className="w-full border-b-2 border-foreground pb-2 text-[19px] font-bold">가게 정보</legend>
          <label className="block text-[16px] font-bold">
            상호
            <input value={f.name} onChange={set("name")} className={input} placeholder="곰선임치과의원" />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-[16px] font-bold">
              지역
              <input value={f.region} onChange={set("region")} className={input} placeholder="강남역, 분당 정자동" />
            </label>
            <label className="block text-[16px] font-bold">
              업종
              <input value={f.industry} onChange={set("industry")} className={input} placeholder="치과, 카페" />
            </label>
          </div>
          <label className="block text-[16px] font-bold">
            홈페이지 주소
            <input value={f.url} onChange={set("url")} className={input} inputMode="url" placeholder="https://www.gompartner.co.kr" />
          </label>
          <label className="block text-[16px] font-bold">
            자랑할 점
            <input value={f.strengths} onChange={set("strengths")} className={input} placeholder="주차 가능, 24시간 영업" />
          </label>
        </fieldset>

        <fieldset className="mt-8 grid gap-4">
          <legend className="w-full border-b-2 border-foreground pb-2 text-[19px] font-bold">검색 결과 문구</legend>
          <p className="text-[15px] leading-[1.6] text-foreground-secondary">비워 두면 위 정보로 추천 문구를 만듭니다.</p>
          <label className="block text-[16px] font-bold">
            <span className="flex justify-between">
              제목<span className="font-normal tabular-nums text-foreground-secondary">{len(title)}자</span>
            </span>
            <input value={f.title} onChange={set("title")} className={input} placeholder={suggestTitle(f)} />
          </label>
          <label className="block text-[16px] font-bold">
            <span className="flex justify-between">
              설명<span className="font-normal tabular-nums text-foreground-secondary">{len(desc)}자</span>
            </span>
            <textarea value={f.desc} onChange={set("desc")} rows={3} className={`${input} h-auto py-2 leading-[1.5]`} placeholder={suggestDesc(f)} />
          </label>
          <button type="button" onClick={() => setF({ ...EXAMPLE, name: "", region: "", industry: "", url: "", strengths: "" })} className="justify-self-start text-[15px] text-foreground-secondary underline underline-offset-4 hover:text-foreground">
            모두 지우고 새로 쓰기
          </button>
        </fieldset>
      </form>

      <div className="min-w-0">
        <section aria-labelledby="pv-google" className="rounded-[10px] border border-border p-5">
          <h2 id="pv-google" className="text-[15px] font-bold text-foreground-secondary">
            구글 검색 결과
          </h2>
          <div className="mt-3 font-[Arial,sans-serif]">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-secondary text-[12px] font-bold" aria-hidden>
                {(f.name || "?").slice(0, 1)}
              </span>
              <span className="min-w-0 leading-[1.3]">
                <span className="block truncate text-[14px] text-[#202124]">{f.name || url.host}</span>
                <span className="block truncate text-[12px] text-[#4d5156]">
                  {url.host}
                  {url.path && ` › ${url.path.replace(/^\//, "").replace(/\//g, " › ")}`}
                </span>
              </span>
            </div>
            <p className="mt-1.5 text-[20px] leading-[1.3] text-[#1a0dab]">{g.t.text}</p>
            <p className="mt-1 text-[14px] leading-[1.58] text-[#4d5156]">{g.d.text}</p>
          </div>
        </section>

        <section aria-labelledby="pv-naver" className="mt-4 rounded-[10px] border border-border p-5">
          <h2 id="pv-naver" className="text-[15px] font-bold text-foreground-secondary">
            네이버 검색 결과 (웹문서)
          </h2>
          <div className="mt-3">
            <span className="block truncate text-[13px] text-[#1b7a3e]">{url.host}</span>
            <p className="mt-1 text-[18px] font-bold leading-[1.4] text-[#0c43b7]">{n.t.text}</p>
            <p className="mt-1 text-[15px] leading-[1.6] text-[#404040]">{n.d.text}</p>
          </div>
        </section>

        <section aria-labelledby="pv-check" className="mt-6">
          <h2 id="pv-check" className="flex items-baseline justify-between text-[19px] font-bold">
            문구 점검
            <span className="text-[15px] font-normal tabular-nums text-foreground-secondary">
              {checks.length}개 중 {passed}개 좋음
            </span>
          </h2>
          <ul className="mt-3 grid gap-2" aria-live="polite">
            {checks.map((c) => (
              <li key={c.text.split(" (")[0]} className={`flex gap-2.5 rounded-md px-3 py-2.5 text-[16px] leading-[1.5] ${c.ok ? "bg-[#e8f5eb]" : "bg-[#fff4e5]"}`}>
                {c.ok ? <Check size={18} className="mt-0.5 shrink-0 text-[#228738]" aria-hidden /> : <CircleAlert size={18} className="mt-0.5 shrink-0 text-[#b45309]" aria-hidden />}
                <span>
                  <span className="sr-only">{c.ok ? "좋음: " : "고칠 점: "}</span>
                  {c.ok ? c.text : c.fix}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-6 rounded-[10px] border border-border">
          <div className="flex flex-wrap items-center justify-between gap-2 p-4">
            <button type="button" onClick={() => setCodeOpen((v) => !v)} aria-expanded={codeOpen} aria-controls="meta-code" className="inline-flex items-center gap-1.5 text-[17px] font-bold">
              개발자에게 보낼 코드
              <motion.span animate={{ rotate: codeOpen ? 180 : 0 }} transition={{ duration: reduce ? 0 : 0.2, ease: EASE }} className="inline-flex">
                <ChevronDown size={18} aria-hidden />
              </motion.span>
            </button>
            <button type="button" onClick={copy} className="inline-flex h-10 items-center gap-1.5 rounded-md bg-accent px-4 text-[15px] font-bold text-accent-foreground hover:bg-accent-hover">
              {copied ? <Check size={16} aria-hidden /> : <Copy size={16} aria-hidden />}
              {copied ? "복사했습니다" : "코드 복사"}
            </button>
          </div>
          <AnimatePresence initial={false}>
            {codeOpen && (
              <motion.div
                id="meta-code"
                initial={reduce ? { opacity: 0 } : { height: 0 }}
                animate={reduce ? { opacity: 1 } : { height: "auto" }}
                exit={reduce ? { opacity: 0 } : { height: 0 }}
                transition={{ duration: 0.22, ease: EASE }}
                className="overflow-hidden"
              >
                <pre className="overflow-x-auto border-t border-border bg-surface p-4 text-[13px] leading-[1.6]">
                  <code>{code}</code>
                </pre>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        <div className="mt-6 rounded-[10px] bg-surface p-5">
          <h2 className="text-[17px] font-bold">검색엔진 등록</h2>
          <ul className="mt-2 grid gap-1.5 text-[16px] leading-[1.6] text-foreground-secondary">
            <li>
              네이버:{" "}
              <a href="https://searchadvisor.naver.com" target="_blank" rel="noopener noreferrer" className="text-accent-hover underline underline-offset-4">
                서치어드바이저
              </a>
              에 홈페이지 주소 등록
            </li>
            <li>
              구글:{" "}
              <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer" className="text-accent-hover underline underline-offset-4">
                서치 콘솔
              </a>
              에 홈페이지 주소 등록
            </li>
            <li>
              지도 검색:{" "}
              <a href="https://new.smartplace.naver.com" target="_blank" rel="noopener noreferrer" className="text-accent-hover underline underline-offset-4">
                네이버 스마트플레이스
              </a>
              에 가게 등록
            </li>
          </ul>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
            <p className="text-[16px] font-bold">등록이나 홈페이지 수정이 어려우신가요?</p>
            <ChannelTalkButton cta="tool_seo_chat" className="inline-flex h-11 items-center rounded-md bg-accent px-4 text-[15px] font-bold text-accent-foreground hover:bg-accent-hover">
              채팅 상담
            </ChannelTalkButton>
          </div>
        </div>
      </div>
    </div>
  );
}
