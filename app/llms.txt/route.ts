import { faq } from "@/data/classic/faq";
import { guides } from "@/data/guides";
import { maintenanceServices } from "@/data/classic/maintenance";
import { industries } from "@/data/industries";
import { landingPlans, planCommon, plans } from "@/data/pricing";
import { profile } from "@/data/profile";
import { projects } from "@/data/projects";
import { tools } from "@/data/tools";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-static";

// AI 검색(ChatGPT, Perplexity, Claude 등)이 읽는 사이트 요약. llmstxt.org 형식.
// 패키지, 샘플, 도구 데이터에서 만든다. 금액과 작업 기간은 10-30부터 싣지 않는다(상담 뒤 안내).
export function GET() {
  const url = (path: string) => `${siteUrl}${path}`;

  const demoLine = (p: (typeof projects)[number]) => `- [${p.title}](${url(p.demoUrl)}): ${p.description}`;

  const text = `# ${profile.name} (${profile.nameEn})

> ${profile.name}는 사장님이 업체에 묻기 애매한 홈페이지와 IT 문제를 짧게 알려 드리는 채널이자, 소상공인 홈페이지 제작과 유지보수를 맡는 1인 웹 개발 브랜드입니다. 서울에서 재택과 온라인 미팅으로 일합니다. 곰앤컴퍼니의 곰랩 파트너스와 관계없습니다.

- 사이트: ${siteUrl}
- 문의: 사이트 상담 신청(${siteUrl}/classic/contact), 전화 ${profile.phone}, ${profile.email}
- 크몽 서비스: https://kmong.com/gig/796239
- 평일 사장님 IT 숏츠: https://www.youtube.com/@gompartner, https://clip.naver.com/@gompartner, https://www.instagram.com/gompartner.co.kr
- 블로그: https://blog.naver.com/gompartner (사장님 IT 정보)
- 가이드: ${siteUrl}/guide (업체 고르기, 비용, PHP 취약점, 배포 오류)

## 홈페이지 제작 패키지

${plans.map((p) => `- ${p.title}(${p.name}): 수정 ${p.revisions}회. ${p.summary}. ${p.includes.join(", ")}.`).join("\n")}
- 모든 패키지: ${planCommon.join(", ")}. 도메인과 호스팅 비용은 별도입니다.

광고 신청 접수 랜딩페이지:
${landingPlans.map((p) => `- ${p.title}(${p.name}): 수정 ${p.revisions}회. ${p.summary}. ${p.includes.join(", ")}.`).join("\n")}

금액과 작업 기간은 상담 신청을 받은 뒤 견적으로 안내합니다. 자세히: [홈페이지 제작](${url("/classic/homepage")}), [광고 랜딩페이지](${url("/classic/landing")})

## 제작 후 유지보수

${maintenanceServices.map((s) => `- ${s.title} (${s.term}). 맡지 않는 일: ${s.excludes.join(", ")}`).join("\n")}

자세히: [유지보수](${url("/classic/maintenance")})

## 업종별 샘플

${industries.map((i) => `- [${i.title}](${url(`/classic/works/${i.slug}`)}): ${i.description}`).join("\n")}

## 샘플 사이트

${projects.filter((p) => p.demoUrl.startsWith("/demo/")).map(demoLine).join("\n")}

## 자주 묻는 질문

${faq.map((f) => `- ${f.q} ${f.a}`).join("\n")}

## 가이드

${guides.map((g) => `- [${g.title}](${url(`/guide/${g.slug}`)}): ${g.description}`).join("\n")}

## 무료 도구

${tools.map((t) => `- [${t.title}](${url(t.href)}): ${t.description}`).join("\n")}

## Optional

- [자주 묻는 질문](${url("/classic/faq")})
`;

  return new Response(text, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
