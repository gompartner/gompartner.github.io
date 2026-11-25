import type { Metadata } from "next";
import { Timeline } from "@/components/classic/archive/Timeline";
import { aiHomeRows } from "@/data/classic/timelines";
import { TrendArticle } from "@/components/classic/archive/TrendArticle";
import { pageMeta } from "@/lib/seo";

const HREF = "/knowledge/ai-and-homepage";
export const metadata: Metadata = pageMeta({
  title: "AI 도구와 홈페이지: 산업 변화, 보안, 개인정보 유출 사례, 앞으로 | 위키",
  description: "AI 도구로 홈페이지와 서비스를 만드는 비용이 크게 내려갔고, 사고는 새로운 공격보다 접근 설정과 키 관리에서 났습니다. 2025~2026년 산업 변화와 유출 사례, 개정 개인정보 보호법, 구글 2027 보안 전망을 함께 정리했습니다.",
  path: HREF,
  article: true,
});

// 산업 변화와 보안 사고를 같은 때로 나란히. 날짜와 숫자는 출처에서 확인한 것만 적는다
const rows = aiHomeRows;

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
        "국내에서도 같은 흐름이 숫자로 보입니다. 서프 디지털 분석에서 Lovable, Emergent, Base44로 만든 홈페이지는 2025년 12월 5,309개에서 2026년 9월 13,939개로 2.6배 늘었습니다. 카페24 AI 스페이스에 배포된 웹서비스 344개 가운데 291개(84.6%)가 사업, 업무용이었고, 그중 166개(57.0%)는 소개 페이지가 아닌 웹앱이었으며 웹앱의 70%에 로그인 기능이 있었습니다. 크몽에서는 바이브코딩 후속 개발 문의가 2026년 2분기에 직전 분기보다 약 200% 늘었습니다. 회원 정보를 받는 서비스가 늘어난 만큼, 출시 뒤 운영과 보안을 맡길 곳을 찾는 수요도 같이 늘고 있다고 봅니다.",
        "AI가 만든 코드는 빠르지만 안전하다는 보장이 없습니다. Veracode가 100개 넘는 AI 모델로 80가지 과제를 시험한 결과 45%에서 보안 취약점이 들어갔고, 문법 품질은 나아져도 보안 성적은 나아지지 않았습니다.",
        "실제 사고는 대부분 설정에서 났습니다. Tea 앱은 보호 없이 열린 저장소에서 신분증 사진이 새어 나갔고, AI가 만든 Moltbook은 데이터베이스 접근 규칙(RLS)이 꺼진 채 출시됐습니다. AI 개발 도구 Lovable 자체에서도 공개 프로젝트의 채팅 기록과 코드가 두 달 넘게 보였습니다. 채팅에 붙여 넣은 DB 주소와 키까지 함께 보였을 수 있습니다.",
        "국내 대형 유출도 고도의 해킹보다 기본 관리가 문제였습니다. 개인정보보호위원회는 쿠팡 사건에서 퇴사한 직원의 인증 서명키가 갱신, 폐기되지 않은 점을, SK텔레콤 사건에서 인터넷망과 내부망 사이 기본 접근통제가 없던 점을 지적했습니다. 과징금은 SK텔레콤 약 1,347억 원, 쿠팡 약 6,247억 원으로 커졌습니다.",
      ]}
      nowTitle="앞으로 2~3년"
      now={[
        "위 사실을 바탕으로 앞으로 2~3년은 이렇게 내다봅니다. 전망이라 틀릴 수 있고, 맞는지는 해마다 이 칸에서 다시 확인합니다.",
        "소개형 홈페이지를 처음 만드는 값은 계속 내려갑니다. 회사 소개, 예약, 문의 정도의 사이트는 대표나 직원이 AI 도구로 직접 만드는 경우가 늘고, 제작 업체에 맡기는 이유는 디자인보다 \"맡겨도 안전한가\"로 옮겨 갈 것으로 봅니다.",
        "넘겨받는 일이 늘어납니다. AI로 만든 사이트는 만든 사람도 코드를 다 모르는 경우가 많아 인수인계 문서가 없습니다. 어떤 계정과 키가 어디에 쓰였는지, DB 접근 규칙이 켜져 있는지부터 찾아 적는 일이 인수의 첫 단계가 되고, 이 일을 전문으로 맡는 곳이 늘 것입니다.",
        "사고는 크게 해킹당하는 일보다 작게 열어 두는 일이 더 잦아집니다. 열린 저장소, 꺼진 접근 규칙, 채팅에 붙여 넣은 키, 지우지 않은 퇴사자 키가 대부분이 될 것으로 봅니다. 2026년 9월부터 유출 가능성만으로도 72시간 통지 의무가 생겨, 작은 사업자의 처분 사례도 늘어날 가능성이 큽니다.",
        "홈페이지의 역할이 바뀝니다. 구글 AI 개요, 네이버 AI 브리핑처럼 검색 결과에서 답을 바로 보여 주면, 홈페이지는 사람이 오는 곳이면서 AI가 가져다 쓰는 원본이 됩니다. 영업시간, 가격, 주소, 처리방침처럼 정확해야 하는 정보를 최신으로 두는 일이 디자인보다 중요해질 것입니다.",
        "유지보수의 기준이 \"한 달에 한 번\"에서 \"공지가 나오면 바로\"로 바뀝니다. 구글은 2027년 전망에서 공개된 취약점이 몇 시간 안에 악용된다고 봤습니다. 정기 점검은 그대로 두되, 실제 공격 중인 취약점 공지가 나오면 하루 안에 막는 것이 작은 사이트에서도 기본이 될 것입니다.",
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
        { label: "지디넷코리아, 코딩 몰라도 앱 만든다, 국내 IT업계 바이브코딩 시장 공략(2026년 11월 22일)", href: "https://zdnet.co.kr/view/?no=20261122122614", note: "서프 디지털 홈페이지 수, 카페24 AI 스페이스 344개 분석, 크몽 후속 개발 문의" },
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
