import type { Metadata } from "next";
import { Timeline, type TimelineRow } from "@/components/classic/archive/Timeline";
import { TrendArticle } from "@/components/classic/archive/TrendArticle";
import { pageMeta } from "@/lib/seo";

const HREF = "/knowledge/personal-homepage";
export const metadata: Metadata = pageMeta({
  title: "개인 홈페이지: 무료 계정과 CGI 게시판에서 미니홈피, 블로그까지 | 웹 지식",
  description: "1990년대 말 한국과 일본의 개인 홈페이지는 무료 계정 위에 CGI 게시판, 방명록, 카운터를 달아 만들었습니다. 한국은 제로보드와 싸이월드 미니홈피, 네이버 블로그로, 일본은 KENT WEB의 무료 CGI와 블로그로 옮겨 갔습니다.",
  path: HREF,
  article: true,
});

// 한국과 일본에서 개인 홈페이지를 만들던 방법이 바뀐 때. 날짜는 출처에서 확인한 것만 적는다
const rows: TimelineRow[] = [
  { when: "1997년", a: "", b: "지오시티즈 일본 법인 설립. HTML을 몰라도 만드는 무료 공간" },
  { when: "1999년", a: "인터넷 인구 400만 명. 포털과 PC통신 회사가 무료 홈페이지 공간을 줌(네띠앙, 채널아이 등). 나모 웹에디터로 화면을 만들고 FTP로 올림. 무료 PHP 게시판 제로보드가 이 무렵부터 퍼짐", b: "" },
  { when: "2000년 전후", a: "Perl CGI 게시판 테크노트, PHP 제로보드가 개인 홈페이지와 동호회의 기본 게시판", b: "무료 CGI 배포 사이트(KENT WEB)에서 게시판을 받아 담. 손님이 글을 남기고 주인이 답하는 게시판, 기념 방문 번호(키리반)를 밟으면 알리는 문화. 렌털 일기(사루사루 일기)" },
  { when: "2001년 9월", a: "싸이월드 미니홈피 등장. 계정, 게시판, 방명록을 직접 달 필요가 없어짐", b: "" },
  { when: "2003년", a: "네이버 블로그 공개", b: "블로그 본격 확산(하테나 다이어리, livedoor Blog, 코코로그 등)" },
  { when: "2004년", a: "미니홈피 회원 1천만 명(9월)", b: "" },
  { when: "2007년", a: "제로보드 XE 오픈 베타(8월 13일). 게시판에서 사이트 제작 도구(XpressEngine)로", b: "" },
  { when: "2011년", a: "XE, 국내 시장 점유율 52%(네이버 발표)", b: "" },
  { when: "2019년", a: "", b: "지오시티즈 종료(3월 31일). 남은 개인 사이트가 한꺼번에 사라짐" },
];

export default function TrendPersonalHomepage() {
  return (
    <TrendArticle
      href={HREF}
      crumb="개인 홈페이지"
      title="개인 홈페이지"
      published="2026-11-22"
      updated="2026-11-22"
      meta={[["범위", "한국, 일본"], ["기간", "1997~2019"], ["데이터", "당시 기사, 운영사 발표"]]}
      lead="1990년대 말 개인 홈페이지는 무료 계정 위에 CGI 게시판, 방명록, 방문자 카운터를 달아 만들었습니다. 한국은 제로보드를 거쳐 싸이월드 미니홈피와 네이버 블로그로, 일본은 무료 CGI 게시판을 거쳐 블로그로 옮겨 갔습니다."
      chartTitle="한국과 일본 연표"
      chart={<Timeline rows={rows} colA="한국" colB="일본" />}
      storyTitle="직접 달던 게시판이 서비스 안으로 들어갔다"
      story={[
        "1990년대 말에는 포털과 PC통신 회사가 회원에게 수십 MB의 무료 홈페이지 공간을 줬습니다. 나모 웹에디터나 프론트페이지로 화면을 만들고 FTP로 올렸습니다. 게시판, 방명록, 카운터는 CGI라서 계정마다 쓸 수 있는지가 달랐고, 대부분은 계정을 준 회사가 만들어 둔 것을 붙여 썼습니다.",
        "직접 다는 사람은 게시판 프로그램을 받아 설치했습니다. 한국에서는 Perl CGI 게시판 테크노트와 1999년 무렵부터 퍼진 무료 PHP 게시판 제로보드가 많이 쓰였습니다. 제로보드는 개인 홈페이지와 동호회, 학교와 작은 회사 사이트의 게시판이 됐고, 이 흐름이 PHP 공유 호스팅을 한국 홈페이지의 기본으로 만들었습니다.",
        "일본은 KENT WEB 같은 무료 CGI 배포 사이트에서 게시판을 받아 지오시티즈나 유료 공간에 달았습니다. 게시판에 손님이 글을 남기고 주인이 답하는 일, 기념할 만한 방문 번호를 밟으면 게시판에 알리는 키리반 같은 문화가 이 게시판 위에서 생겼습니다.",
        "2000년대 들어 이 일을 서비스가 대신했습니다. 한국은 2001년 싸이월드 미니홈피가 계정, 꾸미기, 방명록을 한 번에 줬고 2004년 회원이 1천만 명을 넘었습니다. 2003년에는 네이버 블로그가 나왔습니다. 일본은 2003년 무렵부터 블로그 서비스가 한꺼번에 나와 개인 사이트를 대신했습니다.",
        "직접 운영하던 개인 홈페이지는 대부분 사라졌지만, 그때의 게시판은 회사 사이트에 남았습니다. 제로보드는 2007년 XE로 바뀌었고, XE 다음 버전이 이전과 호환되지 않자 사용자들이 라이믹스로 갈라져 나왔습니다. 지금도 제로보드4나 옛 XE 위에서 그대로 운영되는 사이트를 인수하는 경우가 있습니다.",
      ]}
      takeSub="제로보드, XE, 옛 CGI 게시판 사이트를 넘겨받았다면"
      take={[
        { b: "게시판 프로그램과 버전", t: "제로보드4, XE 1.x, 그누보드 옛 버전, Perl CGI 게시판은 업데이트가 끊긴 지 오래입니다. 관리자 화면이나 파일 이름(zboard.php, bbs.cgi)으로 무엇인지 먼저 확인합니다." },
        { b: "옮길 곳과 데이터", t: "XE는 라이믹스로 옮기는 길이 있고, 제로보드4는 다른 게시판으로 데이터를 옮겨야 합니다. 글, 회원, 첨부파일이 각각 어디에 있는지 목록을 만듭니다." },
        { b: "옛 카운터, 방명록 스크립트", t: "쓰지 않는 CGI 카운터, 방명록, 폼 메일 파일이 서버에 남아 있으면 스팸 발송과 해킹 통로가 됩니다. 쓰는지 확인하고 지웁니다." },
        { b: "무료 공간에 기대던 자료", t: "무료 호스팅이나 외부 서비스에 올려 둔 이미지와 파일은 그 서비스가 끝나면 함께 사라집니다. 본문에 걸린 외부 주소를 뽑아 자체 서버로 옮깁니다." },
      ]}
      sources={[
        { label: "서울신문, 개인 홈페이지 만들기(1999년 7월 13일)", href: "https://www.seoul.co.kr/news/1999/07/13/19990713010001", note: "인터넷 인구 400만 명, 무료 계정마다 CGI, FTP 사용 여부가 다름, 나모 웹에디터 3.0" },
        { label: "한경비즈니스, 무료 홈페이지 제작 서비스", href: "https://magazine.hankyung.com/business/article/202103085513b", note: "네띠앙, 채널아이 등 20~70MB 무료 공간" },
        { label: "네이버, 제로보드XE 공개(2007년 8월 13일)", href: "https://navercorp.com/media/pressReleasesDetail?seq=27231", note: "13일부터 오픈 베타" },
        { label: "네이버, XE CAMP 개최(2011년 11월 4일)", href: "https://navercorp.com/media/pressReleasesDetail?seq=28379", note: "1999년 이후 국내 게시판을 이끈 무료 게시판 제로보드, XE 국내 점유율 52%" },
        { label: "Bugtraq, Technote 보안 권고(2000년)", href: "https://diswww.mit.edu/menelaus/bt/18360", note: "한국의 널리 쓰인 CGI 게시판 테크노트" },
        { label: "Cyworld, Wikipedia", href: "https://en.wikipedia.org/wiki/Cyworld", note: "2001년 9월 미니홈피, 2004년 9월 회원 1천만 명" },
        { label: "네이버, 네이버 블로그 20주년(2023년)", href: "https://navercorp.com/media/pressReleasesDetail?seq=2294", note: "2003년 처음 공개" },
        { label: "Impress Watch, 야후 지오시티즈 종료", href: "https://www.watch.impress.co.jp/docs/news/1145646.html", note: "1997년 일본 법인, 2019년 3월 31일 종료" },
        { label: "@Press, KENT WEB 소개(2004년)", href: "https://www.atpress.ne.jp/news/2269", note: "일본 최대의 무료 CGI 배포 사이트" },
        { label: "ITmedia, 2000년대 개인 홈페이지의 게시판(2016년)", href: "https://www.itmedia.co.jp/pcuser/articles/1607/19/news020.html", note: "개인 홈페이지마다 게시판을 둠" },
        { label: "ITmedia, 방문자 카운터와 키리반(2016년)", href: "https://www.itmedia.co.jp/pcuser/spv/1612/08/news014.html", note: "1990년대 말 개인 홈페이지의 기념 방문 번호" },
        { label: "ITmedia 네토라보, 블로그와 SNS가 바꾼 것(2018년)", href: "https://nlab.itmedia.co.jp/cont/articles/3282929/", note: "2003년 하테나 다이어리, livedoor Blog, 코코로그 참가, 2000년 당시 사루사루 일기" },
      ]}
    />
  );
}
