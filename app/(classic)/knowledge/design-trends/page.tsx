import type { Metadata } from "next";
import Link from "next/link";
import { TrendArticle } from "@/components/classic/archive/TrendArticle";
import { demoProjects } from "@/components/classic/works/samples";
import { termHref } from "@/data/classic/archive";
import { catalogTrends } from "@/data/classic/catalogStories";
import { termGroups } from "@/data/classic/glossary";
import { pageMeta } from "@/lib/seo";

// 11-26 2026, 2027 웹 디자인 트렌드(한 편, 연재 아님). 카탈로그 "웹 트렌드를 반영한 화면"에 쓴 말의 출처를 밝히는 문서다.
// 규칙: 원문을 열어 확인한 자료만 쓴다. 2026년 근거는 2025년 11월 이후에 나온 글만. 2027년은 누가 언제 그렇게 전망했는지로 적고 단정하지 않는다. 숫자는 출처에 있는 것만.
// "꼽은 곳"은 그 글의 소제목에 그 흐름이 올라 있는 경우만 센다(본문에 한 줄 나온 것은 세지 않는다).
// 카탈로그 화면은 흐름마다 "적용 화면"으로 한 번씩만 잇는다. 상품 안내 문장은 넣지 않는다.
const HREF = "/knowledge/design-trends";
export const metadata: Metadata = pageMeta({
  title: "2026, 2027 웹 디자인 트렌드: 인터랙티브 3D와 키네틱 타이포그래피, 스크롤 인터랙션과 리퀴드 글래스 | 위키",
  description: "2026년 웹 디자인 트렌드 글 열 곳이 공통으로 꼽은 흐름과 2027년 전망을 출처와 함께 정리했습니다. 흐름별 모습과 맞는 업종, 속도와 접근성 확인 사항까지 담았습니다.",
  path: HREF,
  article: true,
});

const group = termGroups.find((g) => g.id === "g44")!;
const termLink = (id: string) => `${termHref(group)}#${id}`;

// 2026년 트렌드 글 열 곳의 소제목 기준. 발행일과 주소는 아래 sources
const flows: { name: string; who: string[]; note?: string }[] = [
  { name: "3D와 몰입형 요소", who: ["Figma", "IONOS", "Lovable", "Hostinger", "Tilda"] },
  { name: "마이크로 인터랙션", who: ["Elementor", "IONOS", "Hostinger", "Lovable", "디지털 인사이트"] },
  { name: "크고 굵은 타이포그래피", who: ["Figma", "IONOS", "Hostinger", "Lovable"] },
  { name: "움직이는 타이포그래피", who: ["Bubble", "Lovable", "Webflow"] },
  { name: "스크롤 연출(스크롤리텔링, 패럴랙스)", who: ["IONOS", "Bubble", "Wix(한국어)"] },
  { name: "질감과 촉감", who: ["Bubble", "Wix(한국어)", "디지털 인사이트", "Tilda"] },
  { name: "접근성과 속도", who: ["Elementor", "IONOS", "Lovable"] },
  { name: "유리 재질", who: [], note: "소제목으로 올린 곳은 없고, Tilda와 디지털 인사이트가 본문에서 글래스모피즘과 리퀴드 글래스를 언급" },
];

type Flow = { id: string; title: string; terms: string[]; look: string; fit: string; check: string; screen: string };
const details: Flow[] = [
  {
    id: "f-3d",
    title: "인터랙티브 3D",
    terms: ["t249"],
    look: "제품이나 공간을 3D로 띄우고 방문자가 끌어서 돌려 봅니다. 스크롤에 맞춰 부품이 나뉘거나 시점이 옮겨 가는 장면과 함께 쓰는 경우가 많습니다. Tilda는 WebGL과 Spline 같은 도구로 브라우저에서 실시간 3D를 만들기 쉬워진 점을 배경으로 들었습니다.",
    fit: "사진으로는 보이지 않는 구조를 설명해야 하는 업종입니다. 가전과 가구, 의료 기구가 여기에 듭니다. 인테리어와 분양, 전시 공간도 마찬가지입니다.",
    check: "3D 모델과 라이브러리는 용량이 큽니다. 3D가 뜨기 전 같은 자리에 사진이 먼저 보이는지, 휴대폰에서 스크롤이 끊기지 않는지 확인합니다. 진료 시간과 가격, 연락처는 3D 안이 아니라 글자로 둡니다.",
    screen: "dental-homepage-2026",
  },
  {
    id: "f-touch",
    title: "터치 인터랙션과 마이크로 인터랙션",
    terms: ["t252", "t253"],
    look: "손가락으로 쓸고 누르는 동작에 화면이 바로 반응합니다. 버튼이 눌리는 모양이나 접수 완료 체크, 쓸면 바뀌는 표면 같은 작은 반응이 마이크로 인터랙션입니다. 닐슨 노먼 그룹은 이를 사용자의 동작(트리거)과 그에 대한 반응(피드백)의 짝으로 정의하고 당겨서 새로고침과 쓸어 넘기기 애니메이션을 예로 듭니다.",
    fit: "촉감과 결이 곧 상품인 피부과와 화장품, 가구와 소재 업종에 맞습니다. 예약과 신청 버튼의 반응은 업종과 관계없이 쓰입니다.",
    check: "쓸기와 끌기로만 되는 기능은 버튼으로도 되게 합니다(WCAG 2.2의 2.5.1, 2.5.7). 마우스를 올려야 보이는 반응은 휴대폰에서 나타나지 않으므로 눌렀을 때의 반응을 따로 정합니다.",
    screen: "clinic-homepage-2026",
  },
  {
    id: "f-type",
    title: "볼드 타이포그래피와 키네틱 타이포그래피",
    terms: ["t254", "t255"],
    look: "사진 대신 큰 글자가 첫 화면을 채우고 스크롤하면 글자가 커지거나 흐릅니다. Figma는 첫 화면에 키네틱 레터링과 가변 글꼴이 자주 쓰인다고 적었습니다. 키네틱 타이포그래피라는 말은 국내 학술지에 2005년에 이미 나옵니다.",
    fit: "사진 자료가 적은 전문직 사무소, 이름을 기억시켜야 하는 브랜드와 행사 페이지에 맞습니다.",
    check: "제목을 이미지로 만들면 검색엔진과 화면 낭독기가 읽지 못하므로 글자 그대로 둡니다. 한글 웹폰트는 파일이 커서 쓰는 글자만 담은 파일인지 확인합니다. Bubble은 움직임 줄이기 설정을 지키는 단계가 이 흐름에서 자주 빠진다고 지적했습니다.",
    screen: "dental-homepage-2027-window",
  },
  {
    id: "f-scroll",
    title: "스크롤 인터랙션과 패럴랙스 스크롤링",
    terms: ["t250", "t251"],
    look: "스크롤한 만큼 장면이 진행됩니다. 겹을 나눠 서로 다른 속도로 움직이면 깊이가 생깁니다. 이것이 패럴랙스 스크롤링입니다. 새로 나온 기법은 아닙니다. Figma는 2026년 글 첫머리에서 패럴랙스 스크롤링을 지난 유행의 예로 들었고 IONOS는 2026년 목록에 그대로 올렸습니다. 종이를 오려 세운 듯한 겹은 질감 흐름과도 닿아 있습니다.",
    fit: "순서가 있는 내용에 맞습니다. 제품 구조, 시술과 공정 과정이 그렇고 공간 동선과 연혁도 여기에 듭니다.",
    check: "스크롤 속도 자체는 바꾸지 않습니다. CSS만으로 만드는 스크롤 기반 애니메이션(animation-timeline)은 2026년 10월부터 최신 브라우저가 모두 지원합니다. 그 전 브라우저에는 멈춘 화면을 보여 줍니다. 패럴랙스는 어지럼을 일으킬 수 있어 WCAG 2.3.3(AAA 등급)이 끌 수 있어야 하는 움직임의 예로 듭니다.",
    screen: "dental-homepage-2027-stage",
  },
  {
    id: "f-glass",
    title: "리퀴드 글래스와 글래스모피즘",
    terms: ["t256", "t257"],
    look: "사진 위에 반투명 칸을 올려 뒤가 비치게 합니다. 뒤를 흐리게만 비추면 글래스모피즘이고, 빛의 굴절과 반사까지 표현하면 애플이 이름 붙인 리퀴드 글래스에 가깝습니다. 애플 보도자료는 Liquid Glass를 반투명하고 실제 유리처럼 동작하며 주변을 반사하고 굴절시키는 표현 기법으로 설명합니다.",
    fit: "공간과 제품 사진이 좋은 업종에 맞습니다. 피부과와 뷰티, 호텔과 숙박이 그렇습니다.",
    check: "뒤 사진이 바뀌면 글자 대비도 바뀝니다. 가장 밝은 사진과 가장 어두운 사진 위에서 명도 대비 4.5:1(WCAG 1.4.3)을 확인합니다. 뒤를 흐리는 CSS(backdrop-filter)는 2024년 9월부터 최신 브라우저가 모두 지원합니다.",
    screen: "clinic-homepage-2027",
  },
];

const common: [string, string][] = [
  ["움직임 줄이기", "기기에서 움직임 줄이기를 켠 방문자에게는 움직임을 멈추거나 줄여서 보여 줍니다. CSS의 prefers-reduced-motion으로 알 수 있습니다. 2020년 1월부터 모든 브라우저가 지원합니다."],
  ["저절로 움직이는 것", "자동으로 시작해 5초 넘게 움직이는 것에는 멈추거나 숨기는 방법이 있어야 합니다(WCAG 2.2.2, A 등급)."],
  ["휴대폰에서의 끊김", "위치 이동과 투명도처럼 브라우저가 화면 합성 단계에서 처리하는 속성으로 움직이면 덜 끊깁니다. 크롬 개발자 문서가 스크롤 연출에 권하는 방법입니다."],
];

const screenName = (id: string) => {
  const t = catalogTrends.find((x) => x.id === id)!;
  const base = demoProjects.find((p) => p.id === t.of);
  return `${base?.title ?? ""} ${t.tag}`.trim();
};

const link = "font-bold text-[#15171c] underline underline-offset-4";

export default function TrendDesignTrends() {
  return (
    <TrendArticle
      href={HREF}
      crumb="2026, 2027 웹 디자인 트렌드"
      title="2026, 2027 웹 디자인 트렌드"
      published="2026-11-26"
      updated="2026-11-26"
      meta={[["범위", "국내외"], ["기간", "2025~2027"], ["데이터", "트렌드 글과 공식 발표, 웹 표준 문서"]]}
      lead="2026년 웹 디자인 트렌드 글 열 곳에서 여러 번 겹친 것은 3D와 몰입형 요소, 마이크로 인터랙션이었습니다. 크고 움직이는 타이포그래피와 스크롤에 따라 바뀌는 장면도 겹쳤습니다. 유리 재질은 애플이 2025년 6월 Liquid Glass를 발표한 뒤 화제가 됐지만 웹 트렌드 글에서 소제목으로 올린 곳은 없었습니다. 2027년 전망 글 두 편은 접근성과 브라우저 기본 모션을 함께 꼽았습니다."
      introTitle="먼저 알아 둘 말"
      intro={
        <div className="mt-4 overflow-hidden rounded-[10px] border border-[#e6e9ee]">
          <table className="w-full border-collapse text-left text-[14.5px] leading-[1.6]">
            <thead className="hidden md:table-header-group">
              <tr className="border-b border-[#d9dee5] bg-[#f5f7fa] text-[13.5px] text-[#5b6370]">
                <th scope="col" className="w-[190px] px-3 py-2 font-bold">용어</th>
                <th scope="col" className="px-3 py-2 font-bold">뜻</th>
                <th scope="col" className="w-[210px] px-3 py-2 font-bold">비슷한 말</th>
              </tr>
            </thead>
            <tbody>
              {group.terms.map((t) => (
                <tr key={t.id} className="block border-b border-[#eef0f3] px-3 py-2.5 last:border-0 md:table-row md:p-0">
                  <th scope="row" className="block pb-1 font-bold md:table-cell md:px-3 md:py-2.5 md:align-top">
                    <Link href={termLink(t.id)} className={link}>
                      {t.name}
                    </Link>
                  </th>
                  <td className="block text-[#2b313b] md:table-cell md:px-3 md:py-2.5 md:align-top">{t.look}</td>
                  <td className="block pt-1 text-[13.5px] text-[#5b6370] md:table-cell md:px-3 md:py-2.5 md:align-top md:text-[14.5px]">{t.alt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      }
      chartTitle="2026년 트렌드 글이 꼽은 흐름"
      chart={
        <>
          <p className="mt-3 max-w-[760px] text-[14.5px] leading-[1.7] text-[#5b6370]">2025년 11월부터 2026년 10월 사이에 나온 2026년 트렌드 글 열 곳의 소제목 기준입니다. 발행일 표기가 없는 Figma와 Tilda는 2026년판 제목과 본문 내용으로 시기를 확인했습니다.</p>
          <div className="mt-4 overflow-hidden rounded-[10px] border border-[#e6e9ee]">
            <table className="w-full border-collapse text-left text-[14.5px] leading-[1.6]">
              <thead>
                <tr className="border-b border-[#d9dee5] bg-[#f5f7fa] text-[13.5px] text-[#5b6370]">
                  <th scope="col" className="w-[42%] px-3 py-2 font-bold md:w-[230px]">흐름</th>
                  <th scope="col" className="px-3 py-2 font-bold">소제목으로 꼽은 곳</th>
                </tr>
              </thead>
              <tbody>
                {flows.map((f) => (
                  <tr key={f.name} className="border-b border-[#eef0f3] align-top last:border-0">
                    <th scope="row" className="px-3 py-2.5 font-bold">{f.name}</th>
                    <td className="px-3 py-2.5 text-[#2b313b]">
                      {f.who.length ? (
                        <>
                          {f.who.join(", ")} <span className="whitespace-nowrap text-[13.5px] tabular-nums text-[#5b6370]">({f.who.length}곳)</span>
                        </>
                      ) : (
                        f.note
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      }
      storyTitle="2026년에 많이 보인 것"
      story={[
        "열 곳 가운데 다섯 곳이 3D와 몰입형 요소를, 다섯 곳이 마이크로 인터랙션을 소제목으로 올렸습니다. 타이포그래피는 크고 굵게 쓰는 쪽(네 곳)과 움직이게 하는 쪽(세 곳)으로 나뉘어 나왔습니다. 한쪽이라도 꼽은 곳은 여섯 곳입니다. Bubble은 2026년 7월 글에서 볼드 타이포그래피가 몇 해 이어지다 2026년에 움직이기 시작했다고 적었습니다.",
        "스크롤 연출은 세 곳이 소제목으로 올렸습니다. Figma는 모션 디자인 항목에서 스크롤 기반 내러티브를 함께 다뤘습니다. 같은 스크롤이라도 평가는 갈립니다. Bubble은 스크롤리텔링을 자리 잡은 흐름으로, 사이트가 스크롤 속도를 가로채는 방식(scroll-jacking)은 빠지는 흐름으로 나눴습니다. Webflow는 이야기 연출과 구분해 스크롤로 방문자를 안내하는 설계(Guided scrolling)를 따로 꼽았습니다.",
        "유리 재질은 사정이 다릅니다. 애플이 2025년 6월 iOS 26과 함께 Liquid Glass를 발표했고 국내 매체도 리퀴드 글래스로 옮겨 보도했지만 열 곳 가운데 유리 재질을 소제목으로 올린 곳은 없었습니다. Tilda가 입체감을 다룬 항목에서 글래스모피즘과 Liquid Glass를 함께 언급한 정도입니다. 닐슨 노먼 그룹은 2025년 10월 iOS 26 사용성 글에서 사진 위 글자의 대비가 낮아지는 문제를 지적했습니다.",
        "질감과 촉감은 네 곳이 꼽았습니다. Bubble은 이를 자리 잡은 흐름으로 분류했습니다. 같은 글에서 흔한 AI 생성 이미지는 빠지는 흐름으로 분류했습니다. 국내에서는 디지털 인사이트가 2025년 12월에 낸 2026년 UI/UX 트렌드 아홉 가지에 촉감과 질감이 살아 있는 디자인과 마이크로 인터랙션을 넣었습니다.",
        "접근성과 속도를 트렌드 목록에 올린 곳도 세 곳입니다. Elementor는 접근성을 기본값으로, 속도를 디자인 원칙으로 적었습니다. 움직임이 늘어난 해에 접근성과 속도가 함께 목록에 오른 셈입니다.",
      ]}
      extraTitle="흐름별 모습과 맞는 업종, 확인할 것"
      extra={
        <>
          <div className="mt-2">
            {details.map((f) => (
              <section key={f.id} id={f.id} className="anchor-24 border-b border-[#e6e9ee] py-7">
                <h3 className="text-[20px] font-[800] tracking-[-0.03em]">{f.title}</h3>
                <dl className="mt-3 grid grid-cols-[5.2em_minmax(0,1fr)] gap-x-2 gap-y-2.5 text-[15.5px] leading-[1.7]">
                  <dt className="text-[#5b6370]">모습</dt>
                  <dd>{f.look}</dd>
                  <dt className="text-[#5b6370]">맞는 업종</dt>
                  <dd>{f.fit}</dd>
                  <dt className="text-[#5b6370]">확인할 것</dt>
                  <dd>{f.check}</dd>
                  <dt className="text-[#5b6370]">용어</dt>
                  <dd>
                    {f.terms.map((id, i) => (
                      <span key={id}>
                        {i > 0 ? ", " : null}
                        <Link href={termLink(id)} className={link}>
                          {group.terms.find((t) => t.id === id)!.name}
                        </Link>
                      </span>
                    ))}
                  </dd>
                  <dt className="text-[#5b6370]">적용 화면</dt>
                  <dd>
                    <Link href={`/works#${f.screen}`} className={link}>
                      {screenName(f.screen)}
                    </Link>
                  </dd>
                </dl>
              </section>
            ))}
          </div>
          <h3 className="mt-9 text-[20px] font-[800] tracking-[-0.03em]">공통으로 확인할 것</h3>
          <dl className="mt-3 grid gap-y-3 text-[15.5px] leading-[1.7]">
            {common.map(([k, v]) => (
              <div key={k}>
                <dt className="font-bold">{k}</dt>
                <dd className="mt-0.5 text-[#2b313b]">{v}</dd>
              </div>
            ))}
          </dl>
        </>
      }
      nowTitle="2027년 전망"
      now={[
        "아래는 2026년 10월과 11월에 나온 전망 글 두 편의 내용이고, 확정된 사실이 아닙니다(2026년 11월 26일 확인).",
        "Lovart는 2026년 10월 19일 글에서 2027년의 변화 열두 가지를 꼽았습니다. 첫째는 접근성이 기능이 아니라 기본 요건이 된다는 것입니다. 속도 예산에 맞춘 디자인과 브라우저 기본 기능으로 옮겨 가는 모션(화면 전환과 스크롤 기반 애니메이션)도 목록에 있습니다. 가변 글꼴을 쓴 타이포그래피, 질감과 사람 손이 닿은 흔적도 들어 있습니다. 이 글은 2027년에 중요한 것은 기반이 이미 갖춰진 것이라는 전제를 밝히고 있습니다.",
        "Fueler는 2026년 11월 12일 글에서 열 가지를 전망했고 모든 항목이 예상이라고 적었습니다. AI 사이트 빌더와 AI 검색 대응이 앞에 있고 접근성의 표준화, 모션과 인터랙티브 스토리텔링이 포함됩니다. AI로 만든 페이지가 서로 비슷해 보일수록 절제된 애니메이션과 스크롤 효과가 차이를 만든다는 것이 이 글의 예상입니다.",
        "두 글이 함께 꼽은 것은 접근성과 모션입니다. 모션에는 사실 근거가 하나 있습니다. 스크롤 기반 애니메이션과 화면 전환(View Transitions)은 브라우저 회사들의 2026년 공동 과제(Interop 2026)에 들어 있었습니다. 스크롤 기반 애니메이션의 CSS 속성은 2026년 10월부터 최신 브라우저가 모두 지원합니다. 스크립트 라이브러리 없이 만든 스크롤 연출이 2027년에 늘 것이라는 예상은 여기에 기대고 있습니다.",
        "유리 재질과 키네틱 타이포그래피를 2027년 전망 항목으로 올린 글은 두 편 가운데 없었습니다. 타이포그래피는 Lovart가 가변 글꼴 쪽으로, 질감은 같은 글이 사람 손이 닿은 흔적 쪽으로 전망했습니다.",
      ]}
      takeSub="움직임이 많은 홈페이지를 인수했다면"
      take={[
        { b: "움직임을 끌 수 있는지", t: "기기의 움직임 줄이기 설정을 켜고 첫 화면부터 끝까지 내려 봅니다. 3D와 패럴랙스, 글자 움직임이 그대로면 설정을 읽는 처리가 없는 것입니다." },
        { b: "3D와 영상 원본", t: "3D 모델과 영상, 연출에 쓴 사진의 원본 파일과 사용권을 받았는지 확인합니다. 모델 원본이 없으면 색 하나를 바꾸는 데도 새로 만들어야 합니다." },
        { b: "라이브러리와 버전", t: "스크롤 연출과 3D에 쓴 라이브러리 이름과 버전, 유료 라이선스 여부를 확인합니다. 유료 플러그인은 이전 업체 계정에 묶여 있을 수 있습니다." },
        { b: "휴대폰 첫 화면 속도", t: "휴대폰 통신망으로 첫 화면이 뜨는 시간을 잽니다. 3D와 큰 영상을 화면에 보일 때 불러오는지 확인합니다." },
        { b: "움직임 뒤에 있는 정보", t: "진료 시간과 가격, 연락처가 애니메이션이 끝나야 보이거나 그림 안에만 있지 않은지 확인합니다. 검색엔진과 화면 낭독기는 글자만 읽습니다." },
      ]}
      sources={[
        { label: "Figma, Top Web design trends for 2026(한국어판)", href: "https://www.figma.com/ko-kr/resource-library/web-design-trends/", note: "발행일 표기 없음. 소제목: 3D 및 몰입형 요소, 대담한 타이포그래피, 모션 디자인(스크롤텔링), 키네틱 레터링" },
        { label: "Elementor, Web Design Trends to Expect in 2026(2025-11-17, 2026-01-21 수정)", href: "https://elementor.com/blog/web-design-trends-2026/", note: "마이크로 인터랙션, 접근성, 속도" },
        { label: "Wix 블로그, 꼭 알아두어야 하는 2026년 웹디자인 트렌드(2025-12-20)", href: "https://ko.wix.com/blog/post/new-web-design-trends", note: "텍스처가 있는 디자인, 스크롤 및 트리거 기반 애니메이션" },
        { label: "Webflow, 8 web design trends to watch in 2026(2025-12-23)", href: "https://webflow.com/blog/web-design-trends-2026", note: "Dynamic text treatments, Guided scrolling" },
        { label: "디지털 인사이트, 미리 보는 2026년 UI/UX 디자인 트렌드 9가지(2025-12-31)", href: "https://ditoday.com/%eb%af%b8%eb%a6%ac-%eb%b3%b4%eb%8a%94-2026%eb%85%84-ui%c2%b7ux-%eb%94%94%ec%9e%90%ec%9d%b8-%ed%8a%b8%eb%a0%8c%eb%93%9c-9%ea%b0%80%ec%a7%80/", note: "마이크로 인터랙션, 촉감과 질감, 글래스모피즘과 리퀴드 글래스 언급" },
        { label: "Lovable, 10 Website Design Trends for 2026 You Should Know(2026-01-09)", href: "https://lovable.dev/guides/website-design-trends-2026", note: "키네틱 타이포그래피, 마이크로 인터랙션, 3D, 접근성, 속도" },
        { label: "IONOS, What are the most popular web design trends for 2026?(2026-07-20)", href: "https://www.ionos.com/digitalguide/websites/web-design/webdesign-trends/", note: "Interactive 3D worlds and elements, 패럴랙스, 마이크로 인터랙션" },
        { label: "Bubble, Web Design Trends 2026: What's In, What's Out(2026-07-30)", href: "https://bubble.io/blog/web-design-trends/", note: "스크롤리텔링과 키네틱 타이포그래피는 자리 잡음, scroll-jacking은 빠지는 흐름" },
        { label: "Hostinger, Top web design trends for 2026 and future trend predictions(2026-10-14 수정)", href: "https://www.hostinger.com/uk/tutorials/web-design-trends/", note: "Bold and Experimental Typography, 3D, Micro Interactions" },
        { label: "Tilda Education, Web Design Trends 2026", href: "https://tilda.education/en/web-design-trends-2026", note: "발행일 표기 없음. WebGL & Interactive 3D, Textures & Forms, 입체감 항목에서 글래스모피즘과 Liquid Glass 언급" },
        { label: "Apple Newsroom, Apple, 산뜻하고 우아한 신규 소프트웨어 디자인 공개(2025년 6월)", href: "https://www.apple.com/kr/newsroom/2025/06/apple-introduces-a-delightful-and-elegant-new-software-design/", note: "Liquid Glass 발표" },
        { label: "ITWorld Korea, 애플, '리퀴드 글래스' 공개(2025-06-11)", href: "https://www.itworld.co.kr/article/4004665/", note: "국내 표기 리퀴드 글래스" },
        { label: "Nielsen Norman Group, Liquid Glass Is Cracked, and Usability Suffers in iOS 26(2025-10-10)", href: "https://www.nngroup.com/articles/liquid-glass/", note: "사진 위 글자 대비" },
        { label: "Nielsen Norman Group, Glassmorphism: Definition and Best Practices(2024-06-07)", href: "https://www.nngroup.com/articles/glassmorphism/", note: "글래스모피즘 정의" },
        { label: "Nielsen Norman Group, Microinteractions in User Experience(2018-10-21)", href: "https://www.nngroup.com/articles/microinteractions/", note: "트리거와 피드백의 짝" },
        { label: "조형예술학연구 8권, 키네틱 타이포그래피의 정보전달 기능에 관한 연구(홍영래, 2005)", href: "https://koreascience.kr/article/JAKO200531037081599.page" },
        { label: "한국HCI학회 학술대회, 휴대폰의 터치 인터랙션 유형에 관한 연구(조한경 외, 2009)", href: "https://koreascience.kr/article/CFKO200925752344751.page" },
        { label: "디자인 나침반, Noomo, 디지털 스토리텔링(2026-05-19)", href: "https://designcompass.org/project/noomo/", note: "국내 표기 스크롤 인터랙션" },
        { label: "오픈애즈, 2024년 웹 디자인 트렌드 8가지(2023-12-11)", href: "https://www.openads.co.kr/content/contentDetail?contsId=12127", note: "국내 표기 볼드 타이포그래피. 2026년 흐름의 근거로는 쓰지 않음" },
        { label: "W3C, WCAG 2.2 이해 문서 2.3.3 Animation from Interactions", href: "https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html", note: "패럴랙스 스크롤링 정의, 전정 장애" },
        { label: "W3C, WCAG 2.2 이해 문서 2.2.2 Pause, Stop, Hide", href: "https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html", note: "5초 넘게 움직이는 것" },
        { label: "W3C, WCAG 2.2 이해 문서 2.5.7 Dragging Movements", href: "https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html", note: "끌기의 대안. 2.5.1 Pointer Gestures와 함께" },
        { label: "W3C, WCAG 2.2 이해 문서 1.4.3 Contrast (Minimum)", href: "https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html", note: "명도 대비 4.5:1" },
        { label: "MDN, prefers-reduced-motion(2026-06-10 수정)", href: "https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion", note: "2020년 1월부터 모든 브라우저 지원" },
        { label: "MDN, animation-timeline(2026-09-16 수정)", href: "https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/animation-timeline", note: "2026년 10월부터 최신 브라우저 지원(Baseline 2026)" },
        { label: "MDN, backdrop-filter(2026-11-10 수정)", href: "https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/backdrop-filter", note: "2024년 9월부터 최신 브라우저 지원(Baseline 2024)" },
        { label: "Chrome for Developers, 스크롤리텔링 가이드", href: "https://developer.chrome.com/docs/modern-web-guidance/guides/ui-behaviors/scrollytelling?hl=ko", note: "화면 합성 단계에서 처리되는 속성, 미지원 브라우저 대체" },
        { label: "web.dev, Interop 2026(2026-02-12)", href: "https://web.dev/blog/interop-2026", note: "Scroll-driven animations, View transitions" },
        { label: "Lovart, Web Design Trends 2027: 12 Shifts Shaping Websites(2026-10-19)", href: "https://www.lovart.ai/blog/web-design-trends-2027", note: "2027년 전망" },
        { label: "Fueler, Top 10 Web Design Trends to Watch in 2027(2026-11-12)", href: "https://fueler.io/blog/top-web-design-trends-to-watch", note: "2027년 전망. 모든 항목이 예상이라고 밝힘" },
      ]}
    />
  );
}
