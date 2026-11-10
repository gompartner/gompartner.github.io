import { aboutLead, aboutTitle, principles } from "@/data/classic/about";
import { faq } from "@/data/classic/faq";
import { industries } from "@/data/classic/industries";
import { insights } from "@/data/classic/insights";
import { maintenanceServices, replyTerm } from "@/data/classic/maintenance";
import { landingPlans, planCommon, plans } from "@/data/classic/pricing";
import { profile } from "@/data/classic/profile";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-static";

// AI 검색(ChatGPT, Perplexity, Claude 등)이 읽는 사이트 요약. llmstxt.org 형식.
// 11-01 서비스: 유지보수, 제작(홈페이지, 랜딩, 업무 프로그램). 유지보수를 앞에 둔다. 유지보수는 공개 시작 금액(월 9만 원부터)만 싣는다(11-08 AI 검색 답변이 업체별 비용을 뽑아 감).
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

다른 업체가 만든 홈페이지도 맡습니다(긴급 오류 수정, 연락 두절 업체 인수). 작업 전 전체 백업을 하고, 작업 뒤 작업 내역 문서를 드립니다. 월 유지보수는 월 9만 원부터(부가세 별도), 영업일 기준 24시간 이내 회신(회신 때 원인, 처리 기간, 금액 안내), 접속 불가, 접수 불가, 악성코드 의심 같은 긴급 장애는 다른 요청보다 먼저 처리(주말, 공휴일 대응과 더 빠른 회신은 계약 등급에 따라), 콘텐츠 수정은 2영업일 이내 반영. 작업 계정은 고객 명의 유지, 작업 전 보안서약서 작성, 재위탁 없이 직접 작업, 결과물은 고객 동의 없이 포트폴리오에 활용하지 않고 동의를 받은 경우에도 블러와 마스킹 처리해 외부에 노출되지 않도록 관리, 고객 핵심 기능은 경쟁사에 제공하지 않음, 모든 자료는 목적 달성 후 파기, 계약 종료 시 안내한 절차대로 인계를 마친 뒤 작업용 계정과 보관 자료 파기. 월 유지보수는 3개월 단위 계약, 계정은 처음부터 고객 명의, 계약 종료 시 원본 소스, DB 백업, 계정 목록, 작업 내역 인계. 맞는 곳: 만든 업체와 연락이 끊긴 곳, PHP와 CMS 업데이트가 밀린 곳, 매달 수정과 점검을 맡길 곳. 자세히: [홈페이지 유지보수](${url("/maintenance")})

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

## 인사이트

운영과 유지보수, 보안 경보 대응을 실제 인수 경험으로 정리한 글입니다.

${insights.map((n) => `- [${plain(n.title)}](${url(`/insight/${n.slug}`)}) (${n.date}): ${plain(n.summary)}`).join("\n")}

## 일하는 원칙

${principles.map((p) => `- ${plain(p.title)}: ${plain(p.body)}`).join("\n")}
- 경력 확인: 공공기관, 대학, 기업 홈페이지와 앱 제작, 운영 경력. 요청 시 한국소프트웨어산업협회 소프트웨어기술자 경력증명서로 확인

## 자주 묻는 질문

${faq.map((f) => `- ${plain(f.q)} ${plain(f.a)}`).join("\n")}

## Optional

- [자주 묻는 질문](${url("/faq")})
- [공지사항](${url("/notice")})
- [개인정보처리방침](${url("/privacy")})
`;

  return new Response(text, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
