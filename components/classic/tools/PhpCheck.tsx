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
    title: (r) => `PHP ${r.version}, 이번 취약점에 해당돼요`,
    body: "호스팅 업체나 서버 관리자에게 PHP 보안 업데이트를 요청하세요. 업데이트한 뒤에는 관리자 비밀번호와 DB 비밀번호도 바꾸는 게 좋아요.",
  },
  eol: {
    badge: "지원 종료",
    tone: "bg-[#fde8e8] text-[#c62828]",
    title: (r) => `PHP ${r.version}, 보안 패치가 나오지 않는 버전이에요`,
    body: "8.1 이하는 공식 지원이 끝나 이번 패치가 없어요. 지원되는 버전으로 옮겨야 하는데, 오래된 사이트는 옮기면서 화면이 깨지기도 해서 백업부터 해야 해요.",
  },
  safe: {
    badge: "패치됨",
    tone: "bg-[#e6f5ea] text-[#1d7a3a]",
    title: (r) => `PHP ${r.version}, 이번 패치가 들어간 버전이에요`,
    body: "업데이트 뒤 PHP를 다시 시작했는지, 업데이트 전까지 바뀐 파일이 없는지는 서버 기록으로 한 번 더 보는 게 좋아요.",
  },
  "php-hidden": {
    badge: "버전 확인 불가",
    tone: "bg-[#fff4d6] text-[#8a5a00]",
    title: () => "PHP로 돌아가는 사이트인데, 버전은 숨겨져 있어요",
    body: "버전을 숨긴 건 좋은 설정이에요. 다만 패치 여부는 밖에서 알 수 없어요. 호스팅 관리 화면이나 고객센터에서 PHP 버전과 이번 보안 패치 적용 여부를 확인하세요.",
  },
  "no-sign": {
    badge: "PHP 흔적 없음",
    tone: "bg-[#eef1f5] text-[#3d4550]",
    title: () => "밖에서 보이는 PHP 흔적은 없어요",
    body: "아임웹이나 스마트스토어처럼 플랫폼이 관리하는 사이트이거나, PHP가 아닌 다른 방식일 수 있어요. 관리자 페이지나 예전 게시판이 따로 있으면 그 주소도 넣어 보세요.",
  },
  unreachable: {
    badge: "접속 안 됨",
    tone: "bg-[#eef1f5] text-[#3d4550]",
    title: () => "사이트에 접속하지 못했어요",
    body: "주소가 맞는지, 사이트가 지금 열리는지 확인해 주세요.",
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
      if (!res.ok) setError(data.error ?? "다시 시도해 주세요");
      else setResult(data);
    } catch {
      setError("점검 서버에 연결하지 못했어요. 잠시 뒤 다시 시도해 주세요.");
    } finally {
      setBusy(false);
    }
  }

  const c = result ? copy[result.verdict] : null;
  return (
    <div className="max-w-[760px]">
      <p className="text-[17px] leading-[1.7] text-[#3d4550]">
        홈페이지 주소를 넣으면 서버가 알려 주는 PHP 버전을 읽어 PHP2Shell(CVE-2026-109618, 109619) 패치 여부를 알려 드려요. 평범하게 한 번 접속할 뿐이라 사이트에 부담을 주지 않아요.
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
          placeholder="예: www.우리가게.co.kr"
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
                <Link href="/classic/contact" data-gtm-cta="tool_php_check_contact" className="inline-flex h-11 items-center rounded-md bg-[#15171c] px-4 text-[15px] font-bold text-white hover:bg-[#256ef4]">
                  점검과 업데이트 상담 신청하기
                </Link>
              </p>
            )}
          </section>
        )}
      </div>
      <p className="mt-8 text-[15px] leading-[1.7] text-[#5b6370]">
        밖에서 보이는 정보만으로 판단해서, 버전을 숨긴 서버는 확인할 수 없어요. 인터넷에 도는 &quot;취약점 확인 코드&quot;는 악성코드가 섞인 경우가 있어 직접 돌리지 마세요.{" "}
        <Link href="/classic/guide/php-vulnerability-check" className="underline underline-offset-2">
          확인 순서 자세히 보기
        </Link>
      </p>
    </div>
  );
}
