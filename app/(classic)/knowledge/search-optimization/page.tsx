import type { Metadata } from "next";
import { Timeline, type TimelineRow } from "@/components/classic/archive/Timeline";
import { TrendArticle } from "@/components/classic/archive/TrendArticle";
import { pageMeta } from "@/lib/seo";

const HREF = "/knowledge/search-optimization";
export const metadata: Metadata = pageMeta({
  title: "검색 최적화의 역사: 디렉터리 등록에서 SEO, GEO까지 | 웹 지식",
  description: "SEO 이전에는 사람이 사이트를 분류해 올리는 디렉터리 등록이 있었습니다. 메타 키워드, 링크, 품질과 경험을 거쳐 지금은 AI 답에 인용되는 GEO로 옮겨 가고 있습니다. 구글과 네이버의 변화를 함께 정리했습니다.",
  path: HREF,
  article: true,
});

// 세계(구글 중심)와 한국(네이버 중심). 날짜는 출처에서 확인한 것만 적는다
const rows: TimelineRow[] = [
  { when: "1994년", a: "야후 디렉터리 시작. 사람이 사이트를 주제별로 분류해 목록에 올림", b: "" },
  { when: "1998년", a: "오픈 디렉터리(DMOZ) 시작(6월). 구글이 링크를 추천 표로 세는 PageRank를 내세움", b: "" },
  { when: "2003년", a: "", b: "네이버 블로그 공개(10월 14일). 블로그 글이 검색 결과의 큰 몫이 되기 시작" },
  { when: "2009년 9월", a: "구글, 메타 키워드 태그를 순위에 쓰지 않는다고 발표(9월 21일)", b: "" },
  { when: "2011년 2월", a: "판다 업데이트. 얕고 품질 낮은 글의 순위를 내림", b: "" },
  { when: "2012년 4월", a: "펭귄 업데이트. 링크 조작과 키워드 반복을 제재", b: "" },
  { when: "2014년 12월", a: "야후 디렉터리 종료", b: "" },
  { when: "2015년", a: "모바일 친화 업데이트(4월 21일). 휴대폰에서 보기 좋은 페이지를 모바일 검색에서 우대", b: "C-Rank 적용. 글보다 글쓴이(출처)의 신뢰도와 인기도를 봄" },
  { when: "2017년 3월", a: "DMOZ 종료", b: "" },
  { when: "2022년 8월", a: "도움이 되는 콘텐츠 업데이트. 검색엔진이 아니라 사람을 위해 쓴 글을 우대", b: "" },
  { when: "2023년 11월", a: "GEO(생성형 엔진 최적화) 논문 공개", b: "" },
  { when: "2024년 5월", a: "구글 AI 개요 미국 출시(5월 14일). 검색 결과 맨 위에 AI 요약", b: "" },
  { when: "2025년", a: "구글 AI 모드 한국어 지원(9월)", b: "네이버 AI 브리핑 출시(3월 27일)" },
];

// 시대마다 검색엔진이 본 것과 그것을 노린 꼼수. 시대 구분은 곰파트너 정리
const eras: [string, string, string, string][] = [
  ["등록", "사람이 심사한 디렉터리 목록", "카테고리 여러 곳에 중복 신청", "검색이 자동 수집으로 바뀌며 디렉터리가 문을 닫음"],
  ["키워드", "페이지 안의 단어와 메타 키워드", "흰 바탕에 흰 글씨로 숨긴 키워드, 키워드 반복", "구글이 메타 키워드를 쓰지 않는다고 발표(2009)"],
  ["링크", "다른 사이트가 걸어 준 링크(PageRank)", "링크 교환, 링크 구매, 블로그 댓글 링크", "펭귄 업데이트(2012)"],
  ["품질과 경험", "글의 깊이, 글쓴이의 신뢰, 휴대폰 화면", "짧은 글 대량 생산, 남의 글 짜깁기", "판다(2011), 도움이 되는 콘텐츠(2022), 네이버 C-Rank(2015)"],
  ["답변과 인용", "AI가 답을 만들 때 근거로 쓸 수 있는 글", "AI 글 대량 생산, 답에 맞춘 짜깁기", "진행 중"],
];

export default function TrendSearchOptimization() {
  return (
    <TrendArticle
      href={HREF}
      crumb="검색 최적화의 역사"
      title="검색 최적화의 역사"
      published="2026-11-22"
      updated="2026-11-22"
      meta={[["범위", "세계(구글), 한국(네이버)"], ["기간", "1994~2026"], ["데이터", "구글, 네이버 발표, 기사"]]}
      lead="SEO 이전에는 사람이 사이트를 분류해 목록에 올리는 디렉터리 등록이 있었습니다. 그 뒤 검색엔진은 단어, 링크, 품질과 경험을 차례로 보았고, 지금은 AI가 답을 만들며 출처로 인용할 글을 고릅니다. SEO 다음에 GEO가 나온 것은 그 흐름의 다음 칸입니다."
      chartTitle="연표"
      chart={<Timeline rows={rows} colA="세계(구글 중심)" colB="한국(네이버 중심)" />}
      storyTitle="꼼수가 통하면, 검색엔진은 보는 곳을 바꿨다"
      story={[
        "처음에는 검색보다 목록이었습니다. 1994년 시작한 야후 디렉터리와 1998년 시작한 DMOZ는 사람이 사이트를 심사해 주제별로 분류했습니다. 곰파트너가 보기에 국내도 비슷해서, 2000년대 초까지는 홈페이지를 열면 포털에 사이트 등록을 신청하는 것이 마지막 작업이었습니다.",
        "검색엔진이 사이트를 자동으로 모으면서 페이지 안의 단어가 기준이 됐습니다. 메타 키워드 태그에 단어를 잔뜩 넣거나, 흰 바탕에 흰 글씨로 키워드를 숨기는 꼼수가 퍼졌습니다. 구글은 2009년 메타 키워드를 오래전부터 순위에 쓰지 않는다고 밝혔습니다. 남용이 너무 많았기 때문입니다.",
        "1998년 구글은 다른 사이트가 걸어 준 링크를 추천 표로 세는 PageRank를 내세웠습니다. 그러자 링크를 사고 교환하는 일이 생겼고, 구글은 2012년 펭귄 업데이트로 링크 조작을 제재했습니다.",
        "그다음 기준은 품질과 경험이었습니다. 2011년 판다는 얕은 글을, 2015년 모바일 업데이트는 휴대폰에서 불편한 페이지를 내렸고, 2022년에는 검색엔진이 아니라 사람을 위해 쓴 글을 우대한다고 밝혔습니다. 네이버도 2015년부터 C-Rank로 글보다 글쓴이의 신뢰도를 보기 시작했고, 이후 문서 자체의 품질을 보는 D.I.A.를 더했습니다.",
        "지금은 답변의 시대입니다. 구글 AI 개요, 네이버 AI 브리핑은 결과 목록보다 먼저 답을 보여 주고, 그 아래 출처를 붙입니다. 목표가 \"상위 노출\"에서 \"인용\"으로 바뀌면서 GEO, AEO 같은 말이 생겼습니다.",
      ]}
      extraTitle="시대마다 본 것"
      extra={
        <div className="mt-4 overflow-hidden rounded-[10px] border border-[#e6e9ee]">
          <table className="w-full border-collapse text-left text-[14.5px] leading-[1.6]">
            <thead className="hidden md:table-header-group">
              <tr className="border-b border-[#d9dee5] bg-[#f5f7fa] text-[13.5px] text-[#5b6370]">
                <th scope="col" className="w-[110px] px-3 py-2 font-bold">시대</th>
                <th scope="col" className="px-3 py-2 font-bold">검색엔진이 본 것</th>
                <th scope="col" className="px-3 py-2 font-bold">흔했던 꼼수</th>
                <th scope="col" className="px-3 py-2 font-bold">꼼수를 끝낸 것</th>
              </tr>
            </thead>
            <tbody>
              {eras.map(([e, saw, trick, end]) => (
                <tr key={e} className="block border-b border-[#eef0f3] px-3 py-2.5 last:border-0 md:table-row md:p-0">
                  <th scope="row" className="block pb-1 font-bold md:table-cell md:px-3 md:py-2.5 md:align-top">{e}</th>
                  <td className="block text-[#2b313b] md:table-cell md:px-3 md:py-2.5 md:align-top"><b className="mr-1.5 font-bold text-[#5b6370] md:hidden">본 것</b>{saw}</td>
                  <td className="block text-[#2b313b] md:table-cell md:px-3 md:py-2.5 md:align-top"><b className="mr-1.5 font-bold text-[#5b6370] md:hidden">꼼수</b>{trick}</td>
                  <td className="block text-[#2b313b] md:table-cell md:px-3 md:py-2.5 md:align-top"><b className="mr-1.5 font-bold text-[#5b6370] md:hidden">끝낸 것</b>{end}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="border-t border-[#eef0f3] px-3 py-2 text-[12.5px] text-[#6b7380]">시대 구분은 곰파트너가 정리한 것입니다. 실제로는 시대가 겹치며 이어졌습니다.</p>
        </div>
      }
      nowTitle="곰파트너 전망"
      now={[
        "30년 동안 같은 일이 되풀이됐습니다. 검색엔진이 어떤 기준을 보기 시작하면 그 기준을 속이는 꼼수가 생기고, 검색엔진은 속이기 어려운 쪽으로 보는 곳을 옮겼습니다. 등록, 키워드, 링크, 품질 모두 그랬습니다. GEO도 같은 길을 갈 것으로 봅니다.",
        "지금 GEO 이름으로 팔리는 요령 가운데 AI 글 대량 생산, 질문 제목만 바꾼 짜깁기는 메타 키워드가 그랬듯 오래가지 못할 것입니다. AI가 답의 근거로 계속 고를 글은 날짜와 출처가 있고, 직접 해 본 내용이 있고, 틀린 곳이 고쳐지는 글이라고 봅니다.",
        "기술 쪽 기본은 오히려 그대로입니다. 검색엔진이 읽을 수 있는 글자, 빠른 페이지, 휴대폰에서 편한 화면, 정확한 구조화 데이터는 SEO 시절에도 GEO에서도 같은 출발점입니다. SEO를 버리고 GEO로 갈아타는 것이 아니라, SEO 위에 인용될 만한 글을 얹는 순서가 맞다고 봅니다.",
      ]}
      takeSub="오래된 홈페이지를 넘겨받았다면"
      take={[
        { b: "지난 시대의 꼼수가 남아 있는지", t: "메타 키워드 태그에 단어가 수십 개 들어 있거나, 화면에 안 보이는 글자, 링크 교환 페이지가 남아 있으면 지웁니다. 지금은 도움이 안 되고 품질 평가에서 손해가 될 수 있습니다." },
        { b: "검색 등록 계정의 주인", t: "구글 서치 콘솔, 네이버 서치어드바이저에 사이트가 등록돼 있는지, 그 계정이 고객 소유인지 확인합니다." },
        { b: "글자로 된 제목과 설명", t: "페이지마다 제목(title)과 설명(description)이 그 페이지 내용으로 따로 적혀 있는지 봅니다. 모든 페이지가 회사 이름 하나로 같은 경우가 많습니다." },
        { b: "날짜와 출처가 있는 글", t: "공지, 안내, 자주 묻는 질문에 작성일과 고친 날, 근거가 있는지 봅니다. 사람에게도 AI에게도 믿을 근거가 됩니다." },
      ]}
      sources={[
        { label: "Wikipedia, Yahoo Directory", href: "https://en.wikipedia.org/wiki/Yahoo_Directory", note: "1994년 시작, 2014년 12월 종료" },
        { label: "Search Engine Land, DMOZ 공식 종료(2017년 3월)", href: "https://searchengineland.com/dmoz-has-officially-closed-271530", note: "1998년 6월 시작" },
        { label: "Wikipedia, PageRank", href: "https://en.wikipedia.org/wiki/PageRank", note: "1998년 브린, 페이지 논문" },
        { label: "네이버, 네이버 블로그 공개(2003년 10월 14일)", href: "https://navercorp.com/media/pressReleasesDetail?seq=26522", note: "페이퍼 서비스를 개편해 14일 공개" },
        { label: "Google Search Central, 키워드 메타 태그를 순위에 쓰지 않음(2009년 9월 21일)", href: "https://developers.google.com/search/blog/2009/09/google-does-not-use-keywords-meta-tag?hl=ko" },
        { label: "Google, Finding more high-quality sites in search(2011년 2월)", href: "https://googleblog.blogspot.com/2011/02/finding-more-high-quality-sites-in.html", note: "판다" },
        { label: "Google Search Central, Another step to reward high-quality sites(2012년 4월)", href: "https://developers.google.com/search/blog/2012/04/another-step-to-reward-high-quality", note: "펭귄" },
        { label: "Google Search Central, Finding more mobile-friendly search results(2015년 2월)", href: "https://developers.google.com/search/blog/2015/02/finding-more-mobile-friendly-search", note: "4월 21일부터 적용" },
        { label: "네이버, C-Rank 주제별 고도화(2018년 1월 12일)", href: "https://navercorp.com/media/pressReleasesDetail?seq=29672", note: "2015년부터 적용된 C-Rank" },
        { label: "Google Search Central, August 2022 helpful content update", href: "https://developers.google.com/search/blog/2022/08/helpful-content-update" },
        { label: "arXiv, GEO: Generative Engine Optimization(2023년 11월)", href: "https://arxiv.org/abs/2311.09735" },
        { label: "Google, Google I/O 2024 검색의 생성형 AI(2024년 5월 14일)", href: "https://blog.google/products/search/generative-ai-google-search-may-2024/", note: "AI 개요 미국 출시" },
        { label: "뉴시스, 네이버 AI 브리핑 출시(2025년 3월 27일)", href: "https://www.newsis.com/view/NISX20250327_0003115719" },
        { label: "TechCrunch, 구글 AI 모드 한국어 추가(2025년 9월 8일)", href: "https://techcrunch.com/2025/09/08/googles-ai-mode-adds-5-new-languages-including-hindi-japanese-and-korean" },
      ]}
    />
  );
}
