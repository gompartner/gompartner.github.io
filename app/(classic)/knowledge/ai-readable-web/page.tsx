import type { Metadata } from "next";
import { BarGroups } from "@/components/classic/archive/BarGroups";
import { Timeline } from "@/components/classic/archive/Timeline";
import { aiWebRows } from "@/data/classic/timelines";
import { TrendArticle } from "@/components/classic/archive/TrendArticle";
import { pageMeta } from "@/lib/seo";

const HREF = "/knowledge/ai-readable-web";
export const metadata: Metadata = pageMeta({
  title: "AI가 쓰는 웹사이트: UX 다음의 AX, SEO 다음의 GEO, llms.txt, 에이전트 | 위키",
  description: "웹사이트를 사람만 보는 시대에서 AI가 읽고 인용하고 대신 쓰는 시대로 넘어가고 있습니다. AX, GEO, 제로 클릭, llms.txt, MCP, NLWeb, 에이전트 커머스 같은 새 용어와 검색의 변화, 홈페이지가 준비할 것을 정리했습니다.",
  path: HREF,
  article: true,
});

// 새로 생긴 말과 사람 기준이던 짝
const terms: [string, string, string][] = [
  ["AX(Agent Experience, 에이전트 경험)", "AI 에이전트가 사용자로서 사이트나 서비스를 쓰는 경험. 사람 대신 AI가 메뉴를 찾고 폼을 채우고 버튼을 누릅니다.", "UX(사용자 경험), DX(개발자 경험)"],
  ["GEO(생성형 엔진 최적화)", "ChatGPT, 구글 AI 개요, 네이버 AI 브리핑 같은 답변 엔진의 답에 출처로 인용되도록 글과 구조를 다듬는 일. 업계에서는 AEO(답변 엔진 최적화)와 섞어 씁니다.", "SEO(검색엔진 최적화)"],
  ["제로 클릭", "검색 결과 화면에서 AI 요약으로 답을 얻고 사이트에는 들어오지 않는 검색.", "클릭률, 방문 수"],
  ["인용(출처 표시)", "AI 답 아래나 옆에 근거로 붙는 사이트 링크. 방문보다 먼저 생기는 접점입니다.", "검색 순위"],
  ["AI 크롤러", "AI 학습이나 답변을 위해 사이트를 읽어 가는 봇. 검색 크롤러와 따로 막거나 열 수 있습니다.", "검색 크롤러(Googlebot, Yeti)"],
  ["llms.txt", "AI에게 사이트 요약과 중요한 문서 주소를 마크다운으로 알려 주는 파일. 사이트 맨 위 주소에 둡니다.", "robots.txt, sitemap.xml"],
  ["구조화 데이터(schema.org)", "영업시간, 가격, 주소, 자주 묻는 질문을 기계가 읽는 형식으로 페이지에 함께 적는 것.", "화면에 보이는 글"],
  ["MCP(Model Context Protocol)", "AI가 외부 도구와 데이터에 연결하는 표준. 사이트 기능을 AI가 직접 부를 수 있게 합니다.", "API"],
  ["NLWeb", "사이트가 자연어 질문을 받아 답하게 하는 마이크로소프트 오픈 프로젝트. 각 인스턴스가 MCP 서버입니다.", "사이트 검색창"],
  ["에이전트 커머스", "AI가 대신 상품을 찾고 결제까지 하는 구매. OpenAI와 Stripe의 ACP가 첫 공개 표준입니다.", "장바구니, 결제창"],
];

const rows = aiWebRows;

export default function TrendAiReadableWeb() {
  return (
    <TrendArticle
      href={HREF}
      crumb="AI가 쓰는 웹사이트"
      title="AI가 쓰는 웹사이트"
      published="2026-11-22"
      updated="2026-11-22"
      meta={[["범위", "국내외"], ["기간", "2023~2026"], ["데이터", "Pew Research, 발표 자료, 기사"]]}
      lead="웹사이트는 사람이 보는 화면이었습니다. 이제는 AI가 대신 읽고, 요약해 인용하고, 버튼을 눌러 예약과 결제까지 합니다. 사람을 위한 UX 옆에 AI를 위한 AX가, SEO 옆에 GEO가 생겼고, 구글에서는 AI 요약이 뜨면 링크를 누르는 비율이 15%에서 8%로 줄었습니다."
      introTitle="새로 생긴 말"
      intro={
        <div className="mt-4 overflow-hidden rounded-[10px] border border-[#e6e9ee]">
          <table className="w-full border-collapse text-left text-[14.5px] leading-[1.6]">
            <thead className="hidden md:table-header-group">
              <tr className="border-b border-[#d9dee5] bg-[#f5f7fa] text-[13.5px] text-[#5b6370]">
                <th scope="col" className="w-[210px] px-3 py-2 font-bold">용어</th>
                <th scope="col" className="px-3 py-2 font-bold">뜻</th>
                <th scope="col" className="w-[170px] px-3 py-2 font-bold">사람 기준이던 말</th>
              </tr>
            </thead>
            <tbody>
              {terms.map(([k, d, old]) => (
                <tr key={k} className="block border-b border-[#eef0f3] px-3 py-2.5 last:border-0 md:table-row md:p-0">
                  <th scope="row" className="block pb-1 font-bold md:table-cell md:px-3 md:py-2.5 md:align-top">{k}</th>
                  <td className="block text-[#2b313b] md:table-cell md:px-3 md:py-2.5 md:align-top">{d}</td>
                  <td className="block pt-1 text-[13.5px] text-[#5b6370] md:table-cell md:px-3 md:py-2.5 md:align-top md:text-[14.5px]">
                    <b className="mr-1.5 font-bold md:hidden">예전 짝</b>
                    {old}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      }
      chartTitle="AI 요약이 뜨면 줄어드는 클릭"
      chart={
        <BarGroups
          title="구글 검색에서 AI 요약이 뜰 때와 안 뜰 때"
          sub="단위 %, 미국 성인 900명의 2025년 3월 실제 검색 기록"
          groups={[
            { lang: "검색 결과 링크를 누른 비율", items: [["AI 요약 없음", 15], ["AI 요약 있음", 8]] },
            { lang: "AI 요약 안의 출처 링크를 누른 비율", items: [["AI 요약이 뜬 검색", 1]] },
            { lang: "AI 요약이 뜬 검색", items: [["전체 구글 검색 중", 18]] },
          ]}
          source={{ label: "Pew Research Center(2025년 7월 22일)", href: "https://www.pewresearch.org/short-reads/2025/07/22/google-users-are-less-likely-to-click-on-links-when-an-ai-summary-appears-in-the-results/", note: "구글 검색만, 미국 기준" }}
        />
      }
      storyTitle="사람이 보던 화면에서, AI가 읽는 원본으로"
      story={[
        "지금까지 홈페이지의 독자는 사람이었습니다. 큰 사진, 눈에 띄는 버튼, 읽기 쉬운 메뉴가 좋은 UX였고, 검색은 사람이 결과 목록에서 우리 사이트를 눌러 들어오게 만드는 일이었습니다.",
        "검색 화면이 먼저 바뀌었습니다. 2025년 3월 네이버 AI 브리핑, 9월 구글 AI 모드 한국어 지원으로 국내 검색에서도 답이 결과 화면 맨 위에 요약됩니다. Pew 조사에서 AI 요약이 뜬 검색은 링크 클릭이 15%에서 8%로 줄었고, 요약 안의 출처 링크를 누른 경우는 1%였습니다. 사이트에 오지 않고 끝나는 제로 클릭이 늘어난 것입니다.",
        "그래서 목표가 \"방문\"에서 \"인용\"으로 옮겨 가고 있습니다. AI 답에 출처로 붙는 사이트가 되는 일을 GEO라고 부릅니다. 2023년 GEO 논문은 출처, 인용문, 통계를 본문에 넣으면 생성형 엔진 답에서 노출이 최대 40% 오른다고 보고했습니다. 사람에게 보이는 디자인보다 AI가 읽어 갈 수 있는 정확한 글이 중요해졌습니다.",
        "AI는 읽는 데서 그치지 않고 대신 쓰기 시작했습니다. ChatGPT Atlas의 에이전트 모드는 사람 대신 사이트를 열고 누르며, ChatGPT 안에서 바로 결제하는 기능과 그 표준(ACP)도 나왔습니다. AI가 사용자가 되는 경험을 Netlify는 AX(에이전트 경험)라고 이름 붙였습니다.",
        "사이트 쪽에서도 AI를 위한 입구가 생겼습니다. llms.txt는 AI에게 읽을 곳을 알려 주는 안내 파일이고, MCP와 NLWeb은 AI가 사이트 기능을 직접 부르게 하는 연결 방식입니다. 반대로 Cloudflare는 2025년 7월부터 새 고객 사이트에서 AI 크롤러를 기본으로 막아, 막을지 열지를 사이트가 정해야 하는 일이 됐습니다.",
      ]}
      extraTitle="연표"
      extra={<Timeline rows={rows} colA="일어난 일" />}
      nowTitle="곰파트너 전망"
      now={[
        "홈페이지는 독자가 둘이 됩니다. 사람을 위한 화면과, AI가 읽어 가는 원본입니다. 앞으로 2~3년 안에 회사 소개 홈페이지에도 사람용 페이지와 함께 AI가 읽기 좋은 정리본(자주 묻는 질문, 가격, 영업시간, 처리방침의 글 버전)을 두는 것이 기본이 될 것으로 봅니다.",
        "검색 성과를 재는 숫자가 바뀝니다. 방문 수는 줄어도 AI 답에 몇 번 출처로 붙었는지, 우리 이름이 답 안에 나오는지가 새 지표가 됩니다. 네이버 블로그 프로필의 인용 수처럼 이미 일부 서비스는 이 숫자를 보여 주기 시작했습니다.",
        "AX는 결국 접근성과 거의 같은 일입니다. 화면 낭독기가 읽을 수 있게 만든 사이트(글자로 된 버튼, 라벨이 붙은 입력 칸, 이미지가 아닌 글, 순서가 분명한 단계)는 AI 에이전트도 쓰기 쉽습니다. 웹 접근성을 지켜 온 사이트가 AI 시대에 가장 먼저 덕을 볼 것으로 봅니다.",
        "글자가 들어간 이미지, 스크립트를 눌러야만 열리는 내용, 로그인 뒤에만 있는 가격은 AI에게는 없는 정보입니다. AI가 답을 만들 때 우리 대신 경쟁사나 오래된 블로그 글을 인용하게 됩니다.",
        "막을지 열지 정하는 일이 운영 업무가 됩니다. 인용되려면 답변용 AI 크롤러는 열어 두고, 학습에 쓰이는 것은 따로 막는 식의 설정을 사이트마다 정하고 기록해 두어야 할 것입니다.",
      ]}
      takeSub="AI 시대에 맞춰 홈페이지를 점검한다면"
      take={[
        { b: "AI 크롤러를 막고 있는지", t: "robots.txt와 Cloudflare 같은 앞단 서비스 설정에서 AI 크롤러가 막혀 있는지 봅니다. 모르고 막혀 있으면 AI 답에 인용될 수 없습니다." },
        { b: "핵심 정보가 글자로 있는지", t: "영업시간, 가격, 주소, 연락처가 이미지 안에만 있거나 버튼을 눌러야 보이면 글자로 꺼냅니다. 구조화 데이터(schema.org)로도 함께 적습니다." },
        { b: "질문에 바로 답하는 페이지", t: "고객이 실제로 묻는 질문을 제목으로, 첫 문단에 답을 두는 페이지가 있는지 봅니다. 날짜와 출처가 있는 글이 인용되기 쉽습니다." },
        { b: "폼과 버튼의 라벨", t: "문의, 예약 폼의 입력 칸에 라벨이 있고 버튼이 글자로 되어 있는지 확인합니다. 화면 낭독기와 AI 에이전트가 같은 정보를 읽습니다." },
      ]}
      sources={[
        { label: "Pew Research Center, AI 요약이 있으면 링크를 덜 누른다(2025년 7월 22일)", href: "https://www.pewresearch.org/short-reads/2025/07/22/google-users-are-less-likely-to-click-on-links-when-an-ai-summary-appears-in-the-results/", note: "클릭 15%에서 8%, 요약 속 링크 1%, AI 요약 비율 18%" },
        { label: "arXiv, GEO: Generative Engine Optimization(2023년 11월 16일)", href: "https://arxiv.org/abs/2311.09735", note: "KDD 2024, 노출 최대 40%" },
        { label: "Answer.AI, /llms.txt 제안(2024년 9월 3일)", href: "https://www.answer.ai/posts/2024-09-03-llmstxt", note: "llmstxt.org 사양" },
        { label: "Anthropic, Introducing the Model Context Protocol(2024년 11월 25일)", href: "https://www.anthropic.com/news/model-context-protocol" },
        { label: "Netlify, Agent Experience", href: "https://www.netlify.com/agent-experience/", note: "AX 정의, 2025년 대표 Mathias Biilmann 제안" },
        { label: "뉴시스, 네이버 AI 브리핑 출시(2025년 3월 27일)", href: "https://www.newsis.com/view/NISX20250327_0003115719" },
        { label: "TechCrunch, Microsoft NLWeb(2025년 5월 19일)", href: "https://techcrunch.com/2025/05/19/nlweb-is-microsofts-project-to-bring-more-chatbots-to-webpages/", note: "자연어 질문에 답하는 사이트, MCP 서버" },
        { label: "MIT Technology Review, Cloudflare AI 봇 기본 차단(2025년 7월 1일)", href: "https://www.technologyreview.com/2025/07/01/1119498/cloudflare-will-now-by-default-block-ai-bots-from-crawling-its-clients-websites/", note: "새 고객 기본 차단, 크롤링 유료화 시험" },
        { label: "TechCrunch, 구글 AI 모드 한국어 등 5개 언어 추가(2025년 9월 8일)", href: "https://techcrunch.com/2025/09/08/googles-ai-mode-adds-5-new-languages-including-hindi-japanese-and-korean" },
        { label: "OpenAI, Buy it in ChatGPT(2025년 9월 29일)", href: "https://openai.com/index/buy-it-in-chatgpt/", note: "Instant Checkout, Agentic Commerce Protocol" },
        { label: "Stripe, Instant Checkout와 ACP 발표", href: "https://stripe.com/newsroom/news/stripe-openai-instant-checkout", note: "Stripe와 OpenAI 공동 개발 표준" },
        { label: "OpenAI, ChatGPT Atlas 소개(2025년 10월 21일)", href: "https://openai.com/ko-KR/index/introducing-chatgpt-atlas/", note: "에이전트 모드" },
      ]}
    />
  );
}
