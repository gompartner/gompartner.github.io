import type { Metadata } from "next";
import { Timeline, type TimelineRow } from "@/components/classic/archive/Timeline";
import { TrendArticle } from "@/components/classic/archive/TrendArticle";
import { pageMeta } from "@/lib/seo";

const HREF = "/knowledge/ai-and-homepage";
export const metadata: Metadata = pageMeta({
  title: "AI 도구와 홈페이지: 산업 변화, 보안, 개인정보 유출 사례, 앞으로 | 웹 지식",
  description: "AI 도구로 홈페이지와 서비스를 만드는 비용이 크게 내려갔고, 사고는 새로운 공격보다 접근 설정과 키 관리에서 났습니다. 2025~2026년 산업 변화와 유출 사례, 개정 개인정보 보호법, 구글 2027 보안 전망을 함께 정리했습니다.",
  path: HREF,
  article: true,
});

// 산업 변화와 보안 사고를 같은 때로 나란히. 날짜와 숫자는 출처에서 확인한 것만 적는다
const rows: TimelineRow[] = [
  { when: "2025년 3월", a: "Y Combinator 2025년 겨울 기수의 약 4분의 1이 코드 대부분(95%)을 AI로 작성", b: "Next.js 미들웨어 인증 우회 취약점(CVE-2025-29927) 공개" },
  { when: "2025년 7월", a: "AI 빌더 Lovable, 출시 8개월 만에 연 반복 매출 1억 달러", b: "Tea 앱 이미지 약 7만 2천 장 유출(신분증, 셀카 약 1만 3천 장). Veracode 시험에서 AI가 만든 코드의 45%가 보안 시험 실패" },
  { when: "2025년 8월", a: "", b: "SK텔레콤 2,324만 명 정보 유출에 과징금 약 1,347억 원" },
  { when: "2025년 11월", a: "Lovable 연 반복 매출 2억 달러", b: "쿠팡 계정 약 3,370만 개 노출 확인(11월 29일)" },
  { when: "2026년 1월", a: "", b: "AI가 만든 서비스 Moltbook, 데이터베이스 접근 규칙(RLS) 없이 이메일 3만 5천 개 노출" },
  { when: "2026년 2월", a: "Lovable 연 반복 매출 4억 달러, 정규 직원 146명", b: "" },
  { when: "2026년 4월", a: "", b: "Lovable, 공개 프로젝트의 채팅 기록과 코드가 2월 3일부터 4월 20일까지 보였다고 발표" },
  { when: "2026년 6월", a: "", b: "개인정보보호위원회, 쿠팡에 과징금 약 6,247억 원(회원 3,322만 명, 비회원 433만 명 이상 유출)" },
  { when: "2026년 9월", a: "", b: "개정 개인정보 보호법 시행(9월 11일). 반복 위반, 1천만 명 이상 중대 유출은 전체 매출액의 10%까지" },
  { when: "2026년 11월", a: "구글 클라우드 2027 보안 전망: 보안 검토 없이 붙이는 AI 도구가 새 관리 밖 시스템이 된다", b: "" },
];

export default function TrendAiAndHomepage() {
  return (
    <TrendArticle
      href={HREF}
      crumb="AI 도구와 홈페이지"
      title="AI 도구와 홈페이지"
      published="2026-11-22"
      updated="2026-11-22"
      meta={[["범위", "국내외"], ["기간", "2025~2026"], ["데이터", "기사, 보고서, 개인정보보호위원회 처분"]]}
      lead="AI 도구로 홈페이지와 서비스를 만드는 비용이 크게 내려갔습니다. AI 빌더 Lovable은 2026년 2월 직원 146명으로 연 반복 매출 4억 달러를 넘겼습니다. 같은 시기 사고는 새로운 공격보다 열어 둔 저장소, 꺼 둔 접근 규칙, 지우지 않은 키에서 났고, 국내 과징금은 수천억 원 단위가 됐습니다."
      chartTitle="산업 변화와 보안 사고"
      chart={<Timeline rows={rows} colA="산업 변화" colB="보안, 유출" />}
      storyTitle="만드는 값은 내려가고, 사고 값은 올라갔다"
      story={[
        "말로 설명하면 화면과 기능을 만들어 주는 AI 빌더가 빠르게 퍼졌습니다. Lovable은 출시 8개월에 연 반복 매출 1억 달러, 2026년 2월에는 4억 달러를 넘겼습니다. 2025년 3월에는 Y Combinator 겨울 기수의 약 4분의 1이 코드 대부분을 AI로 작성했다는 보도가 나왔습니다. 회사 소개 홈페이지나 예약 페이지 정도는 비개발자도 하루 안에 만들 수 있게 됐습니다.",
        "홈페이지 업계의 일도 옮겨 가고 있습니다. 화면을 처음 만드는 값은 내려가는 반면, AI로 만든 사이트를 넘겨받아 계정, 결제, 개인정보, 보안 설정을 바로잡는 일이 새로 생겼습니다. 「AI로 만든 서비스 운영」 노트에서 다룬 사례 대부분이 출시 뒤에 생긴 일입니다.",
        "AI가 만든 코드는 빠르지만 안전하다는 보장이 없습니다. Veracode가 100개 넘는 AI 모델로 80가지 과제를 시험한 결과 45%에서 보안 취약점이 들어갔고, 문법 품질은 나아져도 보안 성적은 나아지지 않았습니다.",
        "실제 사고는 대부분 설정에서 났습니다. Tea 앱은 보호 없이 열린 저장소에서 신분증 사진이 새어 나갔고, AI가 만든 Moltbook은 데이터베이스 접근 규칙(RLS)이 꺼진 채 출시됐습니다. AI 개발 도구 Lovable 자체에서도 공개 프로젝트의 채팅 기록과 코드가 두 달 넘게 보였습니다. 채팅에 붙여 넣은 DB 주소와 키까지 함께 보였을 수 있습니다.",
        "국내 대형 유출도 고도의 해킹보다 기본 관리가 문제였습니다. 개인정보보호위원회는 쿠팡 사건에서 퇴사한 직원의 인증 서명키가 갱신, 폐기되지 않은 점을, SK텔레콤 사건에서 인터넷망과 내부망 사이 기본 접근통제가 없던 점을 지적했습니다. 과징금은 SK텔레콤 약 1,347억 원, 쿠팡 약 6,247억 원으로 커졌습니다.",
      ]}
      nowTitle="앞으로"
      now={[
        "법은 더 무거워졌습니다. 2026년 9월 11일부터 같은 유형을 3년 안에 다시 위반하거나 1천만 명 이상이 피해를 입은 중대한 유출은 전체 매출액의 10%까지 과징금을 매길 수 있고, 누구의 정보가 나갔는지 특정하기 어려워도 유출 가능성이 있는 사람에게 72시간 안에 알려야 합니다. 작은 사이트도 해킹으로 유출되면 인원과 관계없이 72시간 신고 대상입니다.",
        "공격은 더 빨라집니다. 구글 클라우드는 2027년 전망에서 공개된 취약점이 몇 시간 안에 악용되고, AI 코딩 도구가 자동으로 가져오는 외부 라이브러리를 노린 공격이 늘며, 보안 검토 없이 현업이 붙이는 AI 도구가 새 관리 밖 시스템이 될 것이라고 봤습니다.",
        "곰파트너가 보는 방향은 이렇습니다. 만드는 일은 더 싸지고 누구나 하게 되며, 차이는 출시 전 점검과 출시 뒤 운영에서 납니다. 누가 어떤 AI 도구에 어떤 키와 권한을 줬는지 목록으로 남기고, 퇴사자와 이전 업체의 키를 지우고, 실제 공격 중인 취약점 공지가 나오면 정기 점검일을 기다리지 않는 것이 작은 사이트에서 할 수 있는 기본입니다.",
      ]}
      takeSub="AI 도구로 만든 홈페이지, 서비스를 넘겨받았다면"
      take={[
        { b: "AI 도구 프로젝트의 공개 설정과 채팅 기록", t: "Lovable, Bolt 같은 도구의 프로젝트가 공개로 되어 있는지 보고, 채팅에 붙여 넣은 DB 주소, API 키는 모두 재발급합니다." },
        { b: "저장소와 DB 접근 규칙", t: "Supabase RLS, Firebase 보안 규칙이 켜져 있는지 보고, 로그아웃한 브라우저와 다른 회원 계정으로 파일, 데이터 주소를 직접 열어 거부되는지 확인합니다." },
        { b: "퇴사자, 이전 업체의 키와 토큰", t: "관리자 계정, API 키, 서명키를 누가 만들었는지 목록으로 만들고, 떠난 사람과 업체가 만든 것은 폐기하고 새로 발급합니다." },
        { b: "접속기록과 72시간 신고 준비", t: "접속기록이 없으면 유출 시점과 범위를 적을 수 없습니다. 기록이 남는지, 신고 담당자와 연락처가 정해져 있는지 확인합니다." },
      ]}
      sources={[
        { label: "TechCrunch, YC 현재 기수 4분의 1의 코드가 거의 AI 작성(2025년 3월 6일)", href: "https://techcrunch.com/2025/03/06/a-quarter-of-startups-in-ycs-current-cohort-have-codebases-that-are-almost-entirely-ai-generated", note: "2025년 겨울 기수" },
        { label: "TechCrunch, Lovable 8개월 만에 ARR 1억 달러(2025년 7월 23일)", href: "https://techcrunch.com/2025/07/23/eight-months-in-swedish-unicorn-lovable-crosses-the-100m-arr-milestone", note: "출시 8개월" },
        { label: "TechCrunch, Lovable 한 달에 1억 달러 추가(2026년 3월 11일)", href: "https://techcrunch.com/2026/03/11/lovable-says-it-added-100m-in-revenue-last-month-alone-with-just-146-employees/", note: "2025년 11월 2억, 2026년 2월 4억 달러, 직원 146명" },
        { label: "Veracode, 2025 GenAI Code Security Report 발표(2025년 7월 30일)", href: "https://www.veracode.com/press-release/ai-generated-code-poses-major-security-risks-in-nearly-half-of-all-development-tasks-veracode-research-reveals/", note: "100개 넘는 모델, 80개 과제, 45%에서 취약점" },
        { label: "NVD, CVE-2025-29927", href: "https://nvd.nist.gov/vuln/detail/CVE-2025-29927", note: "Next.js 미들웨어 인증 우회" },
        { label: "BleepingComputer, Tea 앱 두 번째 DB 노출(2025년 7월 28일)", href: "https://www.bleepingcomputer.com/news/security/tea-app-leak-worsens-with-second-database-exposing-user-chats/", note: "이미지 약 7만 2천 장, 메시지 약 110만 건" },
        { label: "Wiz, 노출된 Moltbook 데이터베이스", href: "https://www.wiz.io/blog/exposed-moltbook-database-reveals-millions-of-api-keys", note: "2026년 1월 31일, RLS 없이 이메일 3만 5천 개 노출" },
        { label: "Lovable, 2026년 4월 사고에 대한 설명", href: "https://lovable.dev/blog/our-response-to-the-april-2026-incident", note: "2월 3일~4월 20일 공개 프로젝트 채팅, 코드 노출" },
        { label: "전자신문, SKT에 1347억 역대 최대 과징금(2025년 8월 28일)", href: "https://m.etnews.com/20250828000254", note: "2,324만 명, 내부망 접근통제 미이행" },
        { label: "뉴시스, 쿠팡 고객 개인정보 3370만 건 노출 확인(2025년 12월 1일)", href: "https://mobile.newsis.com/view/NISX20251201_0003423905", note: "11월 29일 확인" },
        { label: "디지털데일리, 쿠팡 과징금 6246억 원(2026년 6월 11일)", href: "https://www.ddaily.co.kr/page/view/2026061110181503915", note: "회원 3,322만 명, 비회원 433만 명 이상, 퇴사자 서명키 미폐기" },
        { label: "국가법령정보센터, 개인정보 보호법", href: "https://www.law.go.kr/법령/개인정보보호법", note: "제64조의2 제2항, 2026년 9월 11일 시행" },
        { label: "국가법령정보센터, 개인정보 보호법 시행령", href: "https://www.law.go.kr/법령/개인정보보호법시행령", note: "제39조의2, 제40조 72시간 통지와 신고" },
        { label: "Google, cybersecurity for 2027(2026년 11월 11일)", href: "https://blog.google/innovation-and-ai/infrastructure-and-cloud/google-cloud/cybersecurity-2027/", note: "AI 도구가 새 섀도 IT, 공급망 공격, 빨라진 악용" },
      ]}
    />
  );
}
