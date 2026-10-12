import { faq } from "@/data/faq";
import { maintenanceServices } from "@/data/maintenance";
import { industries } from "@/data/industries";
import { addons, estimateFor, formatWon, manwon, planCommon, plans } from "@/data/pricing";
import { profile } from "@/data/profile";
import { projects } from "@/data/projects";
import { tools } from "@/data/tools";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-static";

// AI 검색(ChatGPT, Perplexity, Claude 등)이 읽는 사이트 요약. llmstxt.org 형식.
// 가격·사례·도구 데이터에서 만들므로 데이터만 고치면 같이 바뀐다.
export function GET() {
  const url = (path: string) => `${siteUrl}${path}`;

  const demoLine = (p: (typeof projects)[number]) => {
    const est = estimateFor(p.id);
    const cost = est ? ` 비슷하게 만들면 ${manwon(est.total)}, ${est.days}일.` : "";
    return `- [${p.title}](${url(p.demoUrl)}): ${p.description}${cost}`;
  };

  const text = `# ${profile.name} (${profile.nameEn})

> ${profile.name}는 서울에서 재택과 온라인 미팅으로 일하는 1인 웹 개발자입니다. 소상공인·병원·전문직·기업·공공기관 홈페이지 제작, 기존 시스템 고도화와 유지보수, 업무 프로그램 개발을 합니다. 홈페이지는 ${plans.map((p) => `${p.title} ${manwon(p.price)}`).join(", ")} 세 가지 패키지로 정가를 공개합니다. 같은 이름의 다른 회사(곰랩 파트너스 등)와 관계없습니다.

- 사이트: ${siteUrl}
- 문의: 사이트 오른쪽 아래 채팅 상담, ${profile.email}
- 크몽 서비스: https://kmong.com/gig/796239
- 제작 일지: https://gompartner.tistory.com

## 홈페이지 제작 가격

${plans.map((p) => `- ${p.title}(${p.name}): ${formatWon(p.price)}, 작업 ${p.days}일, 수정 ${p.revisions}회. ${p.summary}. ${p.includes.join(", ")}.`).join("\n")}
- 모든 패키지: ${planCommon.join(", ")}. 도메인·호스팅 비용은 따로입니다.

추가 기능 단가:
${addons.map((a) => `- ${a.name}: ${formatWon(a.price)}/${a.unit}`).join("\n")}

자세히: [가격](${url("/pricing")})

## 제작 후 유지보수

${maintenanceServices.map((s) => `- ${s.title}: ${s.price} (${s.term}). 맡지 않는 일: ${s.excludes.join(", ")}`).join("\n")}

자세히: [유지보수](${url("/maintenance")})

## 업종별 포트폴리오와 비용

${industries.map((i) => `- [${i.title}](${url(`/works/${i.slug}`)}): ${i.description}`).join("\n")}

## 샘플 사이트

${projects.filter((p) => p.demoUrl.startsWith("/demo/")).map(demoLine).join("\n")}

## 자주 묻는 질문

${faq.map((f) => `- ${f.q} ${f.a}`).join("\n")}

## 무료 도구

${tools.map((t) => `- [${t.title}](${url(t.href)}): ${t.description}`).join("\n")}

## Optional

- [주요 경력](${url("/career")})
- [자주 묻는 질문](${url("/faq")})
`;

  return new Response(text, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
