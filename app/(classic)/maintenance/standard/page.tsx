import type { Metadata } from "next";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import { maintenanceTabs } from "@/components/classic/pricing/tabs";
import { FlowSteps } from "@/components/classic/pricing/StepList";
import { PageHead, SubTabs, btnLine, btnPrimary, h2, wrap } from "@/components/classic/ui";
import { LdScript } from "@/components/seo/JsonLd";
import sitemap from "@/app/sitemap";
import { breadcrumbLd, pageMeta } from "@/lib/seo";

// 11-22 이 사이트를 어떤 기준으로 운영하는지 숫자로 보여 주는 페이지. 인증서와 도메인 값은 prebuild(scripts/ops-status.mjs)가 읽어 둔다.
// 아래 자동 점검 항목은 scripts/check-pages.mjs와 같아야 한다(바꾸면 같이 고친다).

export const metadata: Metadata = pageMeta({
  title: "운영 기준",
  description: "곰파트너 사이트가 배포마다 통과하는 자동 점검 항목, 인증서와 도메인 만료일, 보안 헤더, 접근성 점검 결과, 장애 대응 순서입니다.",
  path: "/maintenance/standard",
});

type Status = { checkedAt: string; tls: { expires: string; issuer: string } | null; domainExpires: string | null };
function readStatus(): Status | null {
  try {
    return JSON.parse(readFileSync(join(process.cwd(), "data/classic/ops-status.json"), "utf8"));
  } catch {
    return null;
  }
}

const day = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const left = (iso: string, from: string) => Math.floor((new Date(iso).getTime() - new Date(from).getTime()) / 86400000);

const checks = [
  "페이지 제목과 40자 이상 설명",
  "대표 주소(canonical)",
  "큰 제목(h1) 하나",
  "모든 이미지의 대체 텍스트",
  "본문 영역(main) 하나",
  "구조화 데이터(JSON-LD)",
  "공유용 대표 이미지",
  "AI 검색용 목록(llms.txt) 등록",
];

const headers = [
  ["Strict-Transport-Security", "HTTPS로만 접속"],
  ["Content-Security-Policy", "다른 사이트 안에 끼워 넣기 차단, 외부 플러그인 차단"],
  ["X-Content-Type-Options", "파일 형식 추측 실행 차단"],
  ["Referrer-Policy", "다른 사이트로 넘어갈 때 주소 일부만 전달"],
  ["Permissions-Policy", "위치, 마이크, 결제 등 쓰지 않는 기기 권한 차단"],
];

const audit = [
  ["접근성(axe-core, WCAG 2.2 AA)", "밝은 화면, 어두운 화면 모두 위반 0건"],
  ["휴대폰 320px 폭", "가로 넘침 0건"],
  ["읽기 모드", "웹 지식 문서 본문 인식"],
  ["인쇄", "메뉴와 바닥글을 뺀 본문만 출력"],
];

const steps = [
  { title: "감지", body: "가용성, 인증서, 도메인 만료 감시 알림" },
  { title: "확인", body: "영향 범위와 원인 확인, 고객에게 첫 연락" },
  { title: "복구", body: "직전 정상 배포로 되돌려 서비스 먼저 살림" },
  { title: "수정", body: "원인 수정 뒤 자동 점검 통과하면 다시 배포" },
  { title: "기록", body: "원인, 조치, 재발 방지를 작업 기록에 남김" },
];

const row = "flex flex-col gap-1 border-b border-[#e6e9ee] py-4 sm:flex-row sm:gap-6";
const dt = "w-[220px] shrink-0 font-bold text-[#15171c]";

export default function MaintenanceStandardPage() {
  const s = readStatus();
  const pages = sitemap().length;
  return (
    <>
      <LdScript data={breadcrumbLd([{ name: "유지보수", path: "/maintenance" }, { name: "운영 기준", path: "/maintenance/standard" }])} />
      <PageHead title="운영 기준" trail={[{ href: "/maintenance", label: "유지보수" }, { href: "/maintenance/standard", label: "운영 기준" }]} />
      <SubTabs items={maintenanceTabs} current="/maintenance/standard" />

      <section aria-labelledby="std-deploy" className={`${wrap} pb-4 pt-10 md:pt-14`}>
        <h2 id="std-deploy" className={h2}>배포 전 자동 점검</h2>
        <p className="mt-4 text-[17px] leading-[1.6] text-[#3d4450]">
          모든 페이지가 아래 항목을 통과해야 공개됩니다. 하나라도 빠지면 배포가 멈춥니다.
        </p>
        {s && (
          <p className="mt-6 inline-flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md border border-[#e6e9ee] bg-[#f6f7f9] px-4 py-3 text-[16px] font-bold tabular-nums">
            <span className="text-[#1d5fd6]">통과</span>
            <span>{pages}쪽</span>
            <span className="font-normal text-[#5b6370]">점검 {day(s.checkedAt)}</span>
          </p>
        )}
        <ul className="mt-6 grid gap-x-8 border-t-2 border-[#15171c] sm:grid-cols-2">
          {checks.map((c) => (
            <li key={c} className="flex items-center gap-3 border-b border-[#e6e9ee] py-3.5 text-[17px]">
              <Check size={18} className="shrink-0 text-[#1d5fd6]" aria-hidden />
              {c}
            </li>
          ))}
        </ul>
      </section>

      {s && (s.tls || s.domainExpires) && (
        <section aria-labelledby="std-cert" className={`${wrap} pt-14`}>
          <h2 id="std-cert" className={h2}>인증서와 도메인</h2>
          <dl className="mt-8 border-t-2 border-[#15171c] text-[17px]">
            {s.tls && (
              <div className={row}>
                <dt className={dt}>SSL 인증서 만료일</dt>
                <dd className="tabular-nums">
                  {day(s.tls.expires)} <span className="text-[#5b6370]">({left(s.tls.expires, s.checkedAt)}일 남음, {s.tls.issuer} 자동 갱신)</span>
                </dd>
              </div>
            )}
            {s.domainExpires && (
              <div className={row}>
                <dt className={dt}>도메인 만료일</dt>
                <dd className="tabular-nums">
                  {day(s.domainExpires)} <span className="text-[#5b6370]">({left(s.domainExpires, s.checkedAt)}일 남음)</span>
                </dd>
              </div>
            )}
          </dl>
          <p className="mt-3 text-[15px] text-[#5b6370]">배포할 때마다 실제 인증서와 도메인 등록 정보(RDAP)를 읽어 갱신합니다.</p>
        </section>
      )}

      <section aria-labelledby="std-headers" className={`${wrap} pt-14`}>
        <h2 id="std-headers" className={h2}>보안 헤더</h2>
        <dl className="mt-8 border-t-2 border-[#15171c] text-[17px]">
          {headers.map(([k, v]) => (
            <div key={k} className={row}>
              <dt className="w-[290px] shrink-0 break-all font-mono text-[15px] font-bold text-[#15171c]">{k}</dt>
              <dd className="text-[#3d4450]">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="std-audit" className={`${wrap} pt-14`}>
        <h2 id="std-audit" className={h2}>접근성과 화면</h2>
        <dl className="mt-8 border-t-2 border-[#15171c] text-[17px]">
          {audit.map(([k, v]) => (
            <div key={k} className={row}>
              <dt className={dt}>{k}</dt>
              <dd className="text-[#3d4450]">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-[15px] text-[#5b6370]">전체 페이지 수동 점검 2026-11-22 기준.</p>
      </section>

      <section aria-labelledby="std-incident" className={`${wrap} pt-14`}>
        <h2 id="std-incident" className={h2}>장애 대응 순서</h2>
        <FlowSteps steps={steps} />
      </section>

      <section aria-labelledby="std-jikimi" className={`${wrap} pb-16 pt-16 md:pb-24`}>
        <div className="rounded-xl bg-[#0f1b3d] px-6 py-10 text-white md:px-12 md:py-12">
          <h2 id="std-jikimi" className="text-[26px] font-[800] leading-[1.3] tracking-[-0.03em] md:text-[34px]">
            내 사이트 감시는 사이트 지킴이로
          </h2>
          <p className="mt-3 text-[17px] leading-[1.6] text-[#c9d0da]">가용성, SSL 인증서 만료, 도메인 만료 알림. 3곳까지 무료.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="https://jikimi.gompartner.co.kr" className={`${btnPrimary} gap-1`}>
              사이트 지킴이 열기
              <ArrowUpRight size={18} aria-hidden />
            </a>
            <Link href="/maintenance/monthly" className={`${btnLine} keep-light`}>
              월 유지보수 보기
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
