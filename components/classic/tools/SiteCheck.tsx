"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

/* 홈페이지 진단. 주소를 넣으면 Workers(곰파트너-마케팅/php-check의 /check)가 공개된 첫 화면을 한 번 읽어
   접속, 보안 설정, 휴대폰 화면 설정, 속도, 검색 노출을 급함, 주의, 양호로 나눠 준다.
   무엇이 문제인지만 보여 주고 고치는 방법은 쓰지 않는다. 인증서와 도메인 만료일, 휴대폰 화면 캡처는 전체 보고서(상담 신청)에서만. */

const API = "https://php-check.gompartner.workers.dev/check";

type Level = "bad" | "warn" | "ok";
type Item = { group: string; level: Level; title: string; seen: string; why: string };
type Result = { host: string; url: string; platforms: string[]; items: Item[] };

const LABEL: Record<Level, string> = { bad: "급함", warn: "주의", ok: "양호" };
const TONE: Record<Level, string> = { bad: "bg-[#fde8e8] text-[#c62828]", warn: "bg-[#fff4d6] text-[#8a5a00]", ok: "bg-[#e6f5ea] text-[#1d7a3a]" };
const BOX: Record<Level, string> = { bad: "border-[#efc4c4] bg-[#fdf6f6]", warn: "border-[#f0d9b5] bg-[#fffaf0]", ok: "border-[#c9cfd8] bg-white" };

export function SiteCheck() {
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");

  async function check(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch(`${API}?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      if (!res.ok) setError(data.error ?? "다시 시도해 주세요");
      else setResult(data);
    } catch {
      setError("점검 서버에 연결하지 못했어요. 잠시 뒤 다시 시도해 주세요.");
    } finally {
      setBusy(false);
    }
  }

  const count = (l: Level) => result?.items.filter((i) => i.level === l).length ?? 0;
  const issues = result ? [...result.items.filter((i) => i.level === "bad"), ...result.items.filter((i) => i.level === "warn")] : [];
  const oks = result?.items.filter((i) => i.level === "ok") ?? [];

  return (
    <div className="max-w-[760px]">
      <p className="text-[17px] leading-[1.7] text-[#3d4550]">
        홈페이지 주소를 넣으면 접속과 보안 설정, 휴대폰 화면 설정, 속도, 검색 노출을 한 번에 봐요. 손님이 보는 첫 화면을 평범하게 한 번 열어 볼 뿐이라 사이트에 부담을 주지 않아요.
      </p>
      <form onSubmit={check} className="mt-6 flex flex-col gap-3 sm:flex-row">
        <label htmlFor="site-url" className="sr-only">
          홈페이지 주소
        </label>
        <input
          id="site-url"
          type="text"
          inputMode="url"
          autoComplete="url"
          required
          placeholder="예: www.우리가게.co.kr"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="h-12 min-w-0 rounded-md sm:flex-1 border border-[#6d7882] bg-white px-3 text-[17px]"
        />
        <button type="submit" disabled={busy} className="h-12 rounded-md bg-[#256ef4] px-6 text-[17px] font-bold text-white hover:bg-[#1b5ad0] disabled:opacity-60">
          {busy ? "확인 중 (약 20초)" : "진단하기"}
        </button>
      </form>

      <div aria-live="polite">
        {error && <p className="mt-5 text-[16px] font-bold text-[#c62828]">{error}</p>}
        {result && (
          <section className="mt-8" aria-label="진단 결과">
            <p className="text-[15px] text-[#5b6370]">
              {result.url}
              {result.platforms.length > 0 && ` (${result.platforms.join(", ")})`}
            </p>
            <div className="mt-3 grid grid-cols-3 gap-2 sm:gap-3">
              {(["bad", "warn", "ok"] as Level[]).map((l) => (
                <div key={l} className="rounded-md border border-[#c9cfd8] bg-white px-3 py-3 sm:px-4">
                  <b className={`block text-[28px] leading-[1.2] ${l === "bad" ? "text-[#c62828]" : l === "warn" ? "text-[#8a5a00]" : "text-[#1d7a3a]"}`}>{count(l)}</b>
                  <span className="text-[15px] text-[#5b6370]">{LABEL[l]}</span>
                </div>
              ))}
            </div>

            {issues.length > 0 ? (
              <ul className="mt-6 space-y-3">
                {issues.map((i) => (
                  <li key={i.title + i.seen} className={`rounded-md border p-4 md:p-5 ${BOX[i.level]}`}>
                    <div className="flex items-center gap-2 text-[14px]">
                      <span className={`rounded px-2 py-0.5 font-bold ${TONE[i.level]}`}>{LABEL[i.level]}</span>
                      <span className="text-[#5b6370]">{i.group}</span>
                    </div>
                    <h2 className="mt-2 text-[19px] font-extrabold leading-[1.45] tracking-[-0.02em]">{i.title}</h2>
                    {i.why && <p className="mt-1 text-[16px] leading-[1.7] text-[#3d4550]">{i.why}</p>}
                    <pre className="mt-2 whitespace-pre-wrap break-all font-mono text-[13px] leading-[1.5] text-[#5b6370]">{i.seen}</pre>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-6 text-[18px] font-bold">밖에서 보이는 문제는 없어요.</p>
            )}

            {oks.length > 0 && (
              <details className="group mt-5 rounded-md border border-[#e6e9ee] bg-[#f6f7f9] px-4 py-3">
                <summary className="flex cursor-pointer list-none items-center gap-1 text-[16px] font-bold text-[#3d4450] [&::-webkit-details-marker]:hidden">
                  문제없는 항목 {oks.length}개
                  <ChevronDown size={16} className="transition-transform group-open:rotate-180 motion-reduce:transition-none" aria-hidden />
                </summary>
                <ul className="mt-2 divide-y divide-[#e6e9ee] text-[15px]">
                  {oks.map((i) => (
                    <li key={i.title + i.seen} className="flex flex-col gap-0.5 py-2 sm:flex-row sm:gap-4">
                      <b className="shrink-0 font-semibold text-[#1d7a3a]">{i.title}</b>
                      <span className="min-w-0 break-all text-[#5b6370]">{i.seen}</span>
                    </li>
                  ))}
                </ul>
              </details>
            )}

            <div className="mt-8 rounded-md border border-[#c9cfd8] bg-white p-5 md:p-6">
              <p className="text-[18px] font-extrabold tracking-[-0.02em]">전체 보고서는 상담 신청으로 받으세요</p>
              <p className="mt-2 text-[16px] leading-[1.7] text-[#3d4550]">
                여기서 못 보는 보안 인증서 만료일, 도메인 만료일, 휴대폰과 PC에서 실제로 보이는 화면 캡처까지 넣은 PDF를 하루 안에 보내 드려요. 고칠 때 드는 비용도 같이 적어 드려요.
              </p>
              <Link
                href={`/classic/contact?site=${encodeURIComponent(result.host)}`}
                data-gtm-cta="tool_site_check_contact"
                className="mt-4 inline-flex h-11 items-center rounded-md bg-[#15171c] px-4 text-[15px] font-bold text-white hover:bg-[#256ef4]"
              >
                전체 보고서 받기
              </Link>
            </div>
          </section>
        )}
      </div>

      <p className="mt-8 text-[15px] leading-[1.7] text-[#5b6370]">
        공개된 첫 화면만 읽어서 판단해요. 관리자 화면, 결제, 회원 정보처럼 로그인해야 보이는 곳은 전체 보고서에서도 사이트 주인의 동의를 받은 뒤에만 봐요.{" "}
        <Link href="/classic/tools/php-check" className="underline underline-offset-2">
          PHP 취약점만 따로 보기
        </Link>
      </p>
    </div>
  );
}
