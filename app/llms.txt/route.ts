import { catalogProjects, slugOf } from "@/components/classic/works/samples";
import { aboutLead, aboutTitle, principles } from "@/data/classic/about";
import { faq } from "@/data/classic/faq";
import { industries } from "@/data/classic/industries";
import { maintenanceServices, replyTerm } from "@/data/classic/maintenance";
import { landingPlans, planCommon, plans } from "@/data/classic/pricing";
import { profile } from "@/data/classic/profile";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-static";

// AI 검색(ChatGPT, Perplexity, Claude 등)이 읽는 사이트 요약. llmstxt.org 형식.
// 11-01 서비스: 유지보수, 제작(홈페이지, 랜딩, 업무 프로그램). 유지보수를 앞에 둔다. 금액과 작업 기간은 싣지 않는다(상담 뒤 견적).
// 데이터 문구에 가운뎃점이 섞여 들어와도 쉼표로 바꿔 내보낸다.
const plain = (t: string) => t.replaceAll("·", ", ").replace(/\s+/g, " ").trim();

export function GET() {
  const url = (path: string) => `${siteUrl}${path}`;

  const text = `# ${profile.name} (${profile.nameEn})

> ${profile.name}는 ${aboutTitle} 업체입니다. ${aboutLead} 곰앤컴퍼니의 곰랩 파트너스와 관계없습니다.

- 사이트: ${siteUrl}
- 회사소개: ${url("/story")}
- 상담 신청: ${url("/contact")} (${replyTerm})
- 전화 ${profile.phone}, 이메일 ${profile.email}
- 사업자: ${profile.name}, 사업자등록번호 ${profile.bizNo}

## 유지보수

다른 업체가 만든 홈페이지도 맡습니다. 작업 전 전체 백업을 하고, 작업 뒤 작업 내역 문서를 드립니다. 자세히: [홈페이지 유지보수](${url("/maintenance")})

${maintenanceServices.map((s) => `- [${plain(s.h1)}](${url(`/maintenance/${s.id}`)}): ${plain(s.metaDescription)}`).join("\n")}

## 홈페이지 제작

${plain(industries.map((i) => i.label).join(", "))} 업종의 반응형 홈페이지를 만듭니다. 자세히: [홈페이지 제작](${url("/homepage")})

${plans.map((p) => `- ${plain(p.title)}: ${plain(p.summary)}. ${plain(p.includes.join(", "))}.`).join("\n")}
- 모든 구성 공통: ${plain(planCommon.join(", "))}. 도메인과 호스팅은 고객 명의로 계약합니다.

## 랜딩페이지 제작

광고로 들어온 고객의 상담, 예약 신청을 받는 홍보용 페이지를 만듭니다. 신청이 들어오면 담당자 메일과 구글 시트에 바로 기록됩니다. 자세히: [랜딩페이지 제작](${url("/landing-page")})

${landingPlans.map((p) => `- ${plain(p.title)}: ${plain(p.summary)}. ${plain(p.includes.join(", "))}.`).join("\n")}

## 업무 프로그램 제작

엑셀로 하던 주문 취합, 관리자 화면, 결과지 출력 같은 반복 업무를 웹 프로그램으로 만듭니다. 자세히: [업무 프로그램 제작](${url("/program")})

금액과 일정은 상담 신청을 받은 뒤 견적서로 안내합니다.

## 일하는 원칙

${principles.map((p) => `- ${plain(p.title)}: ${plain(p.body)}`).join("\n")}

## 업종별 카탈로그

${industries.map((i) => `- [${plain(i.title)}](${url(`/works/${i.slug}`)}): ${plain(i.description)}`).join("\n")}

## 카탈로그 상세

${catalogProjects.map((p) => `- [${plain(p.title)}](${url(`/sample/${slugOf(p.demoUrl)}`)}): ${plain(p.description)}`).join("\n")}

## 자주 묻는 질문

${faq.map((f) => `- ${plain(f.q)} ${plain(f.a)}`).join("\n")}

## Optional

- [자주 묻는 질문](${url("/faq")})
- [공지사항](${url("/notice")})
- [개인정보처리방침](${url("/privacy")})
`;

  return new Response(text, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
