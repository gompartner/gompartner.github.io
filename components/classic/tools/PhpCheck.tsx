"use client";

import { useState } from "react";
import Link from "next/link";

/* PHP2Shell 점검. 주소를 넣으면 Workers(곰파트너-마케팅/php-check)가 평범한 접속 한 번으로 응답 헤더의 PHP 버전을 읽는다.
   공격 코드는 보내지 않는다. 버전을 숨긴 서버가 많아 "확인 불가"도 흔하다. */

const API = "https://php-check.gompartner.workers.dev/";

type Verdict = "vulnerable" | "eol" | "safe" | "php-hidden" | "no-sign" | "unreachable";
type Result = { host: string; verdict: Verdict; version: string | null };

const copy: Record<Verdict, { badge: string; tone: string; title: (r: Result) => string; body: string }> = {
  vulnerable: {
    badge: "업데이트 필요",
    tone: "bg-[#fde8e8] text-[#c62828]",
    title: (r) => `PHP ${r.version}, 이번 취약점에 해당합니다`,
    body: "호스팅 업체나 서버 관리자에게 PHP 보안 업데이트를 요청하십시오. 업데이트 뒤에는 관리자 비밀번호와 DB 비밀번호도 변경하십시오.",
  },
  eol: {
    badge: "지원 종료",
    tone: "bg-[#fde8e8] text-[#c62828]",
    title: (r) => `PHP ${r.version}, 보안 패치가 제공되지 않는 버전입니다`,
    body: "8.1 이하는 공식 지원이 종료되어 이번 패치가 없습니다. 지원 버전으로 업그레이드해야 하며, 오래된 사이트는 업그레이드 과정에서 화면이 깨질 수 있어 백업이 먼저입니다.",
  },
  safe: {
    badge: "패치됨",
    tone: "bg-[#e6f5ea] text-[#1d7a3a]",
    title: (r) => `PHP ${r.version}, 이번 패치가 적용된 버전입니다`,
    body: "업데이트 뒤 PHP 재시작 여부와 업데이트 전 변경된 파일 유무는 서버 로그로 한 번 더 확인하십시오.",
  },
  "php-hidden": {
    badge: "버전 확인 불가",
    tone: "bg-[#fff4d6] text-[#8a5a00]",
    title: () => "PHP 기반 사이트이며, 버전은 비공개 설정입니다",
    body: "버전 비공개는 권장 설정입니다. 다만 패치 여부는 외부에서 확인되지 않습니다. 호스팅 관리 화면이나 고객센터에서 PHP 버전과 이번 보안 패치 적용 여부를 확인하십시오.",
  },
  "no-sign": {
    badge: "PHP 흔적 없음",
    tone: "bg-[#eef1f5] text-[#3d4550]",
    title: () => "외부에서 확인되는 PHP 흔적은 없습니다",
    body: "아임웹이나 스마트스토어처럼 플랫폼이 관리하는 사이트이거나, PHP 외의 방식으로 구축된 사이트로 보입니다. 별도의 관리자 페이지나 이전 게시판이 있으면 그 주소도 점검하십시오.",
  },
  unreachable: {
    badge: "접속 안 됨",
    tone: "bg-[#eef1f5] text-[#3d4550]",
    title: () => "사이트에 접속하지 못했습니다",
    body: "주소가 정확한지, 사이트가 현재 접속되는지 확인하십시오.",
  },
};

export function PhpCheck() {
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
      if (!res.ok) setError(data.error ?? "다시 시도해 주십시오");
      else setResult(data);
    } catch {
      setError("점검 서버에 연결하지 못했습니다. 잠시 뒤 다시 시도해 주십시오.");
    } finally {
      setBusy(false);
    }
  }

  const c = result ? copy[result.verdict] : null;
  return (
    <div className="max-w-[760px]">
      <p className="text-[17px] leading-[1.7] text-[#3d4550]">
        홈페이지 주소를 입력하면 서버 응답의 PHP 버전을 읽어 PHP2Shell(CVE-2026-109618, 109619) 패치 여부를 알려 드립니다. 일반 접속 1회로 확인하므로 사이트에 부담을 주지 않습니다.
      </p>
      <form onSubmit={check} className="mt-6 flex flex-col gap-3 sm:flex-row">
        <label htmlFor="php-url" className="sr-only">
          홈페이지 주소
        </label>
        <input
          id="php-url"
          type="text"
          inputMode="url"
          autoComplete="url"
          required
          placeholder="예: www.우리매장.co.kr"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="h-12 min-w-0 rounded-md sm:flex-1 border border-[#6d7882] bg-white px-3 text-[17px]"
        />
        <button type="submit" disabled={busy} className="h-12 rounded-md bg-[#256ef4] px-6 text-[17px] font-bold text-white hover:bg-[#1b5ad0] disabled:opacity-60">
          {busy ? "확인 중" : "점검하기"}
        </button>
      </form>
      <div aria-live="polite">
        {error && <p className="mt-5 text-[16px] font-bold text-[#c62828]">{error}</p>}
        {result && c && (
          <section className="mt-6 rounded-md border border-[#c9cfd8] bg-white p-5 md:p-6">
            <p className="text-[15px] text-[#5b6370]">{result.host}</p>
            <span className={`mt-3 inline-block rounded px-2.5 py-1 text-[15px] font-bold ${c.tone}`}>{c.badge}</span>
            <h2 className="mt-3 text-[20px] font-extrabold leading-[1.45] tracking-[-0.02em] md:text-[22px]">{c.title(result)}</h2>
            <p className="mt-2 text-[16px] leading-[1.7] text-[#3d4550]">{c.body}</p>
            {result.verdict !== "safe" && result.verdict !== "unreachable" && (
              <p className="mt-5">
                <Link href="/contact" data-gtm-cta="tool_php_check_contact" className="inline-flex h-11 items-center rounded-md bg-[#15171c] px-4 text-[15px] font-bold text-white hover:bg-[#256ef4]">
                  점검과 업데이트 상담 신청하기
                </Link>
              </p>
            )}
          </section>
        )}
      </div>
      <p className="mt-8 text-[15px] leading-[1.7] text-[#5b6370]">
        외부에 공개된 정보로만 판단하므로 버전을 비공개로 설정한 서버는 확인되지 않습니다. 인터넷에 유포되는 &quot;취약점 확인 코드&quot;는 악성코드가 포함된 경우가 있어 직접 실행하지 마십시오.{" "}
        <Link href="/guide/php-vulnerability-check" className="underline underline-offset-2">
          확인 순서 자세히 보기
        </Link>
      </p>
    </div>
  );
}
