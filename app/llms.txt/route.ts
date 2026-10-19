import { faq } from "@/data/faq";
import { maintenanceServices } from "@/data/maintenance";
import { industries } from "@/data/industries";
import { addons, estimateFor, formatWon, landingPlans, manwon, planCommon, plans } from "@/data/pricing";
import { profile } from "@/data/profile";
import { projects } from "@/data/projects";
import { tools } from "@/data/tools";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-static";

// AI 검색(ChatGPT, Perplexity, Claude 등)이 읽는 사이트 요약. llmstxt.org 형식.
// 가격·샘플·도구 데이터에서 만들므로 데이터만 고치면 같이 바뀐다.
export function GET() {
  const url = (path: string) => `${siteUrl}${path}`;

  const demoLine = (p: (typeof projects)[number]) => {
    const est = estimateFor(p.id);
    const cost = est ? ` 비슷하게 만들면 ${manwon(est.total)}, ${est.days}일.` : "";
    return `- [${p.title}](${url(p.demoUrl)}): ${p.description}${cost}`;
  };

  const text = `# ${profile.name} (${profile.nameEn})

> ${profile.name}는 사장님이 업체에 묻기 애매한 홈페이지와 IT 문제를 짧게 알려 드리는 채널이자, 소상공인 홈페이지 제작과 유지보수를 맡는 1인 웹 개발 브랜드입니다. 서울에서 재택과 온라인 미팅으로 일합니다. 곰앤컴퍼니의 곰랩 파트너스와 관계없습니다.

- 사이트: ${siteUrl}
- 문의: 사이트 오른쪽 아래 채팅 상담, 전화 ${profile.phone}, ${profile.email}
- 크몽 서비스: https://kmong.com/gig/796239
- 평일 사장님 IT 숏츠: https://www.youtube.com/@gompartner, https://clip.naver.com/@gompartner, https://www.instagram.com/gompartner.co.kr
- 블로그: https://blog.naver.com/gompartner (사장님 IT 정보), https://gompartner.tistory.com (제작 일지)

## 홈페이지 제작 가격

${plans.map((p) => `- ${p.title}(${p.name}): ${formatWon(p.price)}, 작업 ${p.days}일, 수정 ${p.revisions}회. ${p.summary}. ${p.includes.join(", ")}.`).join("\n")}
- 모든 패키지: ${planCommon.join(", ")}. 도메인·호스팅 비용은 별도입니다.

광고 신청 접수 랜딩페이지:
${landingPlans.map((p) => `- ${p.title}(${p.name}): ${formatWon(p.price)}, 작업 ${p.days}일, 수정 ${p.revisions}회. ${p.summary}. ${p.includes.join(", ")}.`).join("\n")}

추가 기능 단가:
${addons.map((a) => `- ${a.name}: ${formatWon(a.price)}/${a.unit}`).join("\n")}

자세히: [가격](${url("/pricing")})

## 제작 후 유지보수

${maintenanceServices.map((s) => `- ${s.title}: ${s.price} (${s.term}). 맡지 않는 일: ${s.excludes.join(", ")}`).join("\n")}

자세히: [유지보수](${url("/maintenance")})

## 업종별 샘플과 비용

${industries.map((i) => `- [${i.title}](${url(`/works/${i.slug}`)}): ${i.description}`).join("\n")}

## 샘플 사이트

${projects.filter((p) => p.demoUrl.startsWith("/demo/")).map(demoLine).join("\n")}

## 자주 묻는 질문

${faq.map((f) => `- ${f.q} ${f.a}`).join("\n")}

## 무료 도구

${tools.map((t) => `- [${t.title}](${url(t.href)}): ${t.description}`).join("\n")}

## Optional

- [자주 묻는 질문](${url("/faq")})
`;

  return new Response(text, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
