// 트렌드와 데이터 분류가 쓰는 숫자(11-21). 원본 CSV는 public/data/trend/ 에 그대로 둔다.
// 출처: StatCounter Global Stats(연간, 방문 표본 기반). 확인일 2026-11-21. 숫자를 바꾸면 CSV도 같이 바꾼다.

export type Point = [number, number];
export type Series = { key: string; label: string; color: string; points: Point[] };

// 나라 색은 분류형 팔레트 1~3번 고정(한국 파랑, 일본 주황, 미국 청록). 나라가 늘어도 순서를 바꾸지 않는다.
const KR = { key: "KR", label: "한국", color: "#2a78d6" };
const JP = { key: "JP", label: "일본", color: "#eb6834" };
const US = { key: "US", label: "미국", color: "#1baf7a" };

/** PC 브라우저 중 IE 비율(%) */
export const ieShare: Series[] = [
  { ...KR, points: [[2009, 89.53], [2010, 94.32], [2011, 91.33], [2012, 77.33], [2013, 75.38], [2014, 74.15], [2015, 68.02], [2016, 44.15], [2017, 35.85], [2018, 30.17], [2019, 19.91], [2020, 12.77], [2021, 6.15], [2022, 1.53], [2023, 0.5], [2024, 0.41], [2025, 0.51]] },
  { ...JP, points: [[2009, 66.3], [2010, 60.93], [2011, 56.06], [2012, 54.52], [2013, 53.24], [2014, 44.76], [2015, 41.22], [2016, 27.28], [2017, 25.32], [2018, 20.91], [2019, 13.62], [2020, 9.53], [2021, 5.16], [2022, 2.14], [2023, 0.75], [2024, 0.35], [2025, 0.3]] },
  { ...US, points: [[2009, 59.37], [2010, 51.82], [2011, 47.06], [2012, 42.55], [2013, 40.63], [2014, 33.94], [2015, 28.42], [2016, 19.97], [2017, 13.87], [2018, 10.38], [2019, 8.69], [2020, 5.53], [2021, 1.99], [2022, 1.29], [2023, 0.29], [2024, 0.3], [2025, 0.22]] },
];

/** 전체 접속 중 모바일 비율(%) */
export const mobileShare: Series[] = [
  { ...KR, points: [[2009, 0.3], [2010, 1.86], [2011, 11.86], [2012, 23.9], [2013, 29.61], [2014, 27.88], [2015, 26.24], [2016, 32.71], [2017, 40.79], [2018, 48.51], [2019, 48.64], [2020, 45.12], [2021, 51.85], [2022, 54.1], [2023, 61.92], [2024, 58.98], [2025, 56.96]] },
  { ...JP, points: [[2009, 0.66], [2010, 1.85], [2011, 3.76], [2012, 7.63], [2013, 14.05], [2014, 23.99], [2015, 30.8], [2016, 28.51], [2017, 25.86], [2018, 31.79], [2019, 35.23], [2020, 39.75], [2021, 44.54], [2022, 36.82], [2023, 38.32], [2024, 39.35], [2025, 46.2]] },
  { ...US, points: [[2009, 1.4], [2010, 4.12], [2011, 7.28], [2012, 9.88], [2013, 13.65], [2014, 23.13], [2015, 26.38], [2016, 30.87], [2017, 39.93], [2018, 40.74], [2019, 44.38], [2020, 47.74], [2021, 47.51], [2022, 50.5], [2023, 35.37], [2024, 49.28], [2025, 45.8]] },
];

export const TREND_CHECKED = "2026-11-21";

export type Dataset = { id: string; title: string; unit: string; desc: string; max?: number; note: string; series: Series[]; source: { label: string; href: string }; csv: { label: string; href: string }[]; usedIn?: { label: string; href: string }[] };


/** 실제 사례(11-21 사용자 A안): 인터넷 아카이브 보관본 링크 + 그 화면에서 직접 확인한 문구. 캡처는 사이트에 올리지 않고
 * 01_Work/03_Resource/아카이브-근거 에 둔다. 링크가 죽으면 alive를 false로 바꾸면 링크 대신 "보관본 확인 불가"가 보인다. */
export type Example = { country: string; site: string; date: string; url: string; seen: string; alive: boolean; checked: string };

export const examples2012: Example[] = [
  { country: "한국", site: "KB국민은행", date: "2012-05-24", url: "https://web.archive.org/web/20120524151925/https://www.kbstar.com/", seen: "첫 화면 새소식에 \"공인인증서 발급/재발급 절차 강화 안내\", 자주 묻는 질문에 \"보안프로그램 설치 방법은 어떻게 되나요?\"", alive: true, checked: "2026-11-21" },
  { country: "일본", site: "Yahoo! JAPAN", date: "2012-06-01", url: "https://web.archive.org/web/20120601191309/http://www.yahoo.co.jp/", seen: "첫 화면 위에 권장 환경 안내 \"Windows: Internet Explorer 6.0 이상 / Firefox 3.0 이상\". 메뉴와 뉴스 목록이 글자로 빽빽함", alive: true, checked: "2026-11-21" },
  { country: "미국", site: "백악관(whitehouse.gov)", date: "2012-06-01", url: "https://web.archive.org/web/20120601224332/http://www.whitehouse.gov/", seen: "화면을 채운 큰 사진 위에 이메일 구독 문장 하나와 \"Learn More\" 버튼 하나", alive: true, checked: "2026-11-21" },
];

/** 2장 모바일 실제 사례(2012년 보관본을 휴대폰 폭 390px로 열어 확인) */
export const examplesMobile2012: Example[] = [
  { country: "한국", site: "네이버 모바일(m.naver.com)", date: "2012-06-01", url: "https://web.archive.org/web/20120601050848/http://m.naver.com:80/", seen: "PC 주소와 다른 모바일 전용 주소. 검색창, 실시간 급상승, 주요뉴스를 한 줄씩 쌓은 화면", alive: true, checked: "2026-11-21" },
  { country: "일본", site: "Yahoo! JAPAN", date: "2012-06-01", url: "https://web.archive.org/web/20120601191309/http://www.yahoo.co.jp/", seen: "휴대폰 폭으로 열어도 PC 화면 그대로. 메뉴와 뉴스가 옆으로 잘려 확대해서 봐야 함", alive: true, checked: "2026-11-21" },
  { country: "미국", site: "The Boston Globe", date: "2012-06-02", url: "https://web.archive.org/web/20120602022806/http://www.bostonglobe.com/", seen: "같은 주소가 휴대폰 폭에서 한 줄 배치로 바뀜(반응형). PC에서는 여러 단, 휴대폰에서는 기사와 사진이 위아래로", alive: true, checked: "2026-11-21" },
];

/** 3장: 크롬에서 https로 열린 페이지 비율(Windows), 해마다 7월 첫 주. 한국은 Google 투명성 보고서에 없음 */
export const httpsShare: Series[] = [
  { ...JP, points: [[2015, 24.6], [2016, 29.8], [2017, 48.7], [2018, 65.3], [2019, 79.6], [2020, 86.3], [2021, 88.7], [2022, 90.3], [2023, 92.3], [2024, 94.0], [2025, 94.6], [2026, 95.3]] },
  { ...US, points: [[2015, 45.7], [2016, 55.7], [2017, 67.9], [2018, 83.0], [2019, 90.8], [2020, 94.2], [2021, 94.9], [2022, 95.6], [2023, 96.5], [2024, 97.6], [2025, 97.7], [2026, 98.1]] },
];

/** 4장: 전 세계 웹사이트 중 Flash, jQuery 사용 비율(W3Techs, 해마다 1월 1일). 2026년 값은 출처 설명 없는 급변이라 뺐다 */
export const flashJquery: Series[] = [
  { key: "flash", label: "Flash", color: "#2a78d6", points: [[2015, 12.1], [2016, 9.5], [2017, 7.3], [2018, 5.5], [2019, 4.0], [2020, 2.8], [2021, 2.2], [2022, 1.6], [2023, 1.5], [2024, 1.2], [2025, 1.0]] },
  { key: "jquery", label: "jQuery", color: "#eb6834", points: [[2015, 61.5], [2016, 68.3], [2017, 71.9], [2018, 73.1], [2019, 73.6], [2020, 74.2], [2021, 77.2], [2022, 78.5], [2023, 77.6], [2024, 77.3], [2025, 75.3]] },
];

/** 5장: CMS, 사이트 빌더 점유율 상위 3(W3Techs, 콘텐츠 언어 기준, CMS를 알아낸 사이트 중 %, 2026-11-21) */
export const cmsByLanguage: { lang: string; items: [string, number][] }[] = [
  { lang: "한국어 사이트", items: [["Cafe24", 39.6], ["WordPress", 24.1], ["아임웹", 16.7]] },
  { lang: "일본어 사이트", items: [["WordPress", 82.8], ["Shopify", 3.1], ["Adobe", 2.2]] },
  { lang: "영어 사이트", items: [["WordPress", 50.7], ["Shopify", 11.8], ["Wix", 11.0]] },
];

/** 6장: 페이지 무게 중앙값(KB, HTTP Archive, 해마다 1월 첫 수집). 데스크톱 2017년 1월은 수집 없음 */
export const pageWeight: Series[] = [
  { key: "desktop", label: "PC", color: "#2a78d6", points: [[2011, 483.96], [2012, 652.65], [2013, 831.54], [2014, 1081.34], [2015, 1233.54], [2016, 1448.61], [2018, 1772.32], [2019, 1836.84], [2020, 1969.56], [2021, 2038.42], [2022, 2174.13], [2023, 2286.32], [2024, 2505.33], [2025, 2677.93], [2026, 2950.01]] },
  { key: "mobile", label: "모바일", color: "#eb6834", points: [[2012, 293.77], [2013, 403.67], [2014, 561.2], [2015, 750.24], [2016, 905.3], [2017, 1301.6], [2018, 1569.25], [2019, 1669.26], [2020, 1770.42], [2021, 1879.28], [2022, 1957.58], [2023, 2006.59], [2024, 2228.88], [2025, 2374.12], [2026, 2593.43]] },
];

export const exampleFlash2009: Example[] = [
  { country: "한국", site: "삼성전자", date: "2009-05-14", url: "https://web.archive.org/web/20090514022622/http://www.samsung.com/sec/", seen: "첫 화면 가운데 큰 영역이 플래시(swf)라 지금 열면 통째로 빈 칸. 아래 \"TV광고\" 칸도 비어 있음", alive: true, checked: "2026-11-21" },
];

/** 8장: 휴대폰 OS 중 아이폰(iOS) 비율(StatCounter, 연간). 나머지는 대부분 안드로이드 */
export const iosShare: Series[] = [
  { ...KR, points: [[2012, 10.48], [2013, 8.6], [2014, 11.03], [2015, 20.65], [2016, 19.55], [2017, 20.57], [2018, 28.58], [2019, 28.18], [2020, 24.01], [2021, 26.8], [2022, 29.79], [2023, 30.38], [2024, 25.47], [2025, 23.47]] },
  { ...JP, points: [[2012, 50.37], [2013, 56.93], [2014, 64.15], [2015, 66.06], [2016, 69.95], [2017, 67.51], [2018, 68.84], [2019, 69.34], [2020, 63.55], [2021, 66.55], [2022, 65.89], [2023, 68.76], [2024, 60.81], [2025, 60.6]] },
  { ...US, points: [[2012, 50.06], [2013, 53.09], [2014, 52.48], [2015, 50.93], [2016, 53.3], [2017, 53.99], [2018, 54.88], [2019, 55.25], [2020, 59.55], [2021, 58.59], [2022, 56.75], [2023, 58.12], [2024, 56.53], [2025, 58.22]] },
];

/** 9장: PHP를 쓰는 사이트 중 주 버전 비율(W3Techs, 해마다 1월 1일, 전 세계) */
export const phpVersions: Series[] = [
  { key: "php5", label: "PHP 5", color: "#2a78d6", points: [[2015, 98.2], [2016, 98.7], [2017, 96.5], [2018, 88.5], [2019, 74.3], [2020, 54.3], [2021, 39.8], [2022, 28.0], [2023, 22.9], [2024, 17.5], [2025, 12.5], [2026, 9.3]] },
  { key: "php7", label: "PHP 7", color: "#eb6834", points: [[2016, 0.1], [2017, 2.5], [2018, 10.7], [2019, 25.1], [2020, 45.3], [2021, 59.9], [2022, 69.9], [2023, 69.3], [2024, 59.5], [2025, 47.8], [2026, 35.7]] },
  { key: "php8", label: "PHP 8", color: "#1baf7a", points: [[2022, 1.8], [2023, 7.6], [2024, 22.8], [2025, 39.6], [2026, 54.8]] },
];

/** 수요 조사: 구글 트렌드(대한민국) "홈페이지 제작" 검색 관심도 연평균(최고점 2004년 2월 = 100). 2026년은 11월까지 */
export const searchDemand: Series[] = [
  { key: "make", label: "홈페이지 제작", color: "#2a78d6", points: [[2004, 44.0], [2005, 33.2], [2006, 29.5], [2007, 20.8], [2008, 38.9], [2009, 35.2], [2010, 19.1], [2011, 15.0], [2012, 11.3], [2013, 9.0], [2014, 8.5], [2015, 9.0], [2016, 7.1], [2017, 7.3], [2018, 6.8], [2019, 6.2], [2020, 7.1], [2021, 6.1], [2022, 6.8], [2023, 7.1], [2024, 6.9], [2025, 8.0], [2026, 8.2]] },
];

/** 7장 디자인 흐름 실제 사례(보관본, 1280px로 열어 확인) */
export const examplesDesign: Example[] = [
  { country: "2008", site: "Apple", date: "2008-06-05", url: "https://web.archive.org/web/20080605045531/http://www.apple.com/", seen: "광택 나는 은색 메뉴 띠, 바닥에 반사되는 제품 사진, 가운데 고정 폭 화면", alive: true, checked: "2026-11-21" },
  { country: "2014", site: "Apple", date: "2014-06-01", url: "https://web.archive.org/web/20140601225706/http://www.apple.com/", seen: "화면을 꽉 채운 사진 한 장과 문장 하나, 아래 4칸 타일. 메뉴 띠는 아직 회색 그라데이션", alive: true, checked: "2026-11-21" },
  { country: "2016", site: "네이버", date: "2016-05-28", url: "https://web.archive.org/web/20160528005834/http://www.naver.com/", seen: "가운데 고정 폭, 초록 검색창과 메뉴 띠, 언론사 로고 칸(뉴스스탠드), 글꼴 설정 버튼", alive: true, checked: "2026-11-21" },
];

/** 디자인: PC 화면 해상도 중 1920x1080 비율(StatCounter, 연도별 해상도 표에서 뽑음) */
export const fullHdShare: Series[] = [
  { ...KR, points: [[2009, 1.5], [2010, 4.39], [2011, 8.67], [2012, 13.83], [2013, 34.17], [2014, 47.43], [2015, 53.58], [2016, 42.84], [2017, 41.97], [2018, 43.48], [2019, 42.74], [2020, 48.94], [2021, 50.73], [2022, 52.04], [2023, 50.12], [2024, 50.4], [2025, 44.49]] },
  { ...JP, points: [[2009, 2.58], [2010, 6.42], [2011, 11.26], [2012, 15.28], [2013, 17.3], [2014, 20.68], [2015, 23.93], [2016, 26.9], [2017, 28.26], [2018, 26.42], [2019, 25.45], [2020, 25.4], [2021, 25.27], [2022, 28.28], [2023, 26.31], [2024, 27.11], [2025, 24.97]] },
  { ...US, points: [[2009, 0.81], [2010, 2.51], [2011, 4.36], [2012, 6.41], [2013, 8.26], [2014, 11.55], [2015, 14.5], [2016, 17.21], [2017, 17.54], [2018, 19.67], [2019, 20.36], [2020, 20.04], [2021, 21.21], [2022, 22.31], [2023, 20.27], [2024, 23.14], [2025, 24.13]] },
];
/** 디자인: PC 화면 해상도 중 1024x768 비율 */
export const xgaShare: Series[] = [
  { ...KR, points: [[2009, 30.34], [2010, 24.09], [2011, 16.71], [2012, 11.28], [2013, 5.32], [2014, 2.92], [2015, 1.79], [2016, 1.79], [2017, 1.69], [2018, 1.26], [2019, 1.1], [2020, 0.88], [2021, 0.46], [2022, 1.51], [2023, 0.0], [2024, 1.68], [2025, 2.79]] },
  { ...JP, points: [[2009, 26.49], [2010, 19.55], [2011, 13.13], [2012, 8.41], [2013, 5.81], [2014, 3.13], [2015, 2.73], [2016, 2.59], [2017, 1.7], [2018, 1.47], [2019, 1.78], [2020, 1.11], [2021, 0.74], [2022, 0.68], [2023, 0.0], [2024, 0.0], [2025, 0.0]] },
  { ...US, points: [[2009, 28.15], [2010, 21.8], [2011, 17.44], [2012, 17.43], [2013, 18.32], [2014, 7.65], [2015, 6.66], [2016, 5.04], [2017, 3.86], [2018, 4.17], [2019, 4.04], [2020, 3.58], [2021, 1.63], [2022, 1.94], [2023, 1.39], [2024, 0.0], [2025, 0.0]] },
];
/** 디자인: 전체 접속 중 태블릿 비율 */
export const tabletShare: Series[] = [
  { ...KR, points: [[2009, 0], [2010, 0], [2011, 0], [2012, 1.05], [2013, 1.7], [2014, 1.19], [2015, 1.03], [2016, 1.36], [2017, 1.2], [2018, 0.95], [2019, 0.96], [2020, 0.71], [2021, 0.79], [2022, 0.94], [2023, 1], [2024, 0.9], [2025, 0.75]] },
  { ...JP, points: [[2009, 0], [2010, 0], [2011, 0], [2012, 0.79], [2013, 3.23], [2014, 4.49], [2015, 4.76], [2016, 4.45], [2017, 4.6], [2018, 4.55], [2019, 4.4], [2020, 3.41], [2021, 3.1], [2022, 2.47], [2023, 2.43], [2024, 2.17], [2025, 2.29]] },
  { ...US, points: [[2009, 0], [2010, 0], [2011, 0], [2012, 2.06], [2013, 6.52], [2014, 8.91], [2015, 8.88], [2016, 8.42], [2017, 8.77], [2018, 7.96], [2019, 7.06], [2020, 4.33], [2021, 3.55], [2022, 3.04], [2023, 2.05], [2024, 2.59], [2025, 2.34]] },
];

/** 기술: 서버 언어 비율(W3Techs, 해마다 1월 1일, 서버 언어를 알 수 있는 사이트 중) */
export const serverLanguages: Series[] = [
  { key: "php", label: "PHP", color: "#2a78d6", points: [[2015, 80.6], [2016, 80.0], [2017, 80.0], [2018, 80.2], [2019, 78.9], [2020, 78.9], [2021, 79.1], [2022, 78.1], [2023, 77.7], [2024, 76.7], [2025, 75.2], [2026, 72.4]] },
  { key: "aspnet", label: "ASP.NET", color: "#eb6834", points: [[2015, 16.7], [2016, 15.6], [2017, 14.8], [2018, 13.5], [2019, 11.8], [2020, 10.6], [2021, 9.3], [2022, 8.0], [2023, 7.4], [2024, 6.6], [2025, 5.4], [2026, 4.6]] },
  { key: "java", label: "Java", color: "#1baf7a", points: [[2015, 2.8], [2016, 3.1], [2017, 3.3], [2018, 3.4], [2019, 4.0], [2020, 3.7], [2021, 3.2], [2022, 3.7], [2023, 4.6], [2024, 4.7], [2025, 5.0], [2026, 5.4]] },
  { key: "js", label: "JavaScript(Node.js)", color: "#8a5cd6", points: [[2015, 0.1], [2016, 0.2], [2017, 0.3], [2018, 0.4], [2019, 0.7], [2020, 0.8], [2021, 1.2], [2022, 1.8], [2023, 2.3], [2024, 3.1], [2025, 4.0], [2026, 5.4]] },
];

// 데이터 분류 목록(위 숫자를 다 정의한 뒤에 둔다)
export const datasets: Dataset[] = [
  {
    id: "server-languages",
    title: "서버 언어 비율(전 세계)",
    unit: "%",
    note: "W3Techs 조사 표본 기준, 서버 언어를 알 수 있는 사이트 중",
    desc: "PHP, ASP.NET, Java, JavaScript(Node.js)를 쓰는 사이트 비율. 해마다 1월 1일 값.",
    series: serverLanguages,
    source: { label: "W3Techs, 서버 언어 연도별 추이", href: "https://w3techs.com/technologies/history_overview/programming_language/ms/y" },
    csv: [],
    usedIn: [{ label: "개발 언어: Perl CGI에서 Next.js까지", href: "/knowledge/server-language" }],
  },
  {
    id: "fullhd-share",
    title: "PC 화면 해상도 중 1920x1080 비율, 한국 일본 미국",
    unit: "%",
    note: "방문 표본 기반, 해마다 해상도 표에서 1920x1080 값만 뽑음",
    desc: "PC로 들어온 방문 중 화면 해상도가 1920x1080인 비율. 연간 값.",
    series: fullHdShare,
    source: { label: "StatCounter Global Stats, Desktop Screen Resolution", href: "https://gs.statcounter.com/screen-resolution-stats/desktop" },
    csv: [{ label: "연도별 해상도 5종(JSON)", href: "/data/trend/desktop-resolution-yearly.json" }],
    usedIn: [{ label: "1024에서 1920으로, 모니터가 커진 만큼 바뀐 화면", href: "/knowledge/screen-size" }],
  },
  {
    id: "search-demand",
    title: "수요 조사: \"홈페이지 제작\" 검색 관심도(대한민국, 구글)",
    unit: "",
    note: "구글 트렌드 상대값(최고점 2004년 2월 = 100), 표본 데이터라 다시 받으면 조금 다를 수 있음. \"홈페이지 유지보수\", \"홈페이지 리뉴얼\"은 대부분 달이 1 미만이라 그리지 않음. 국내 검색은 네이버 비중이 커서 전체 수요가 아니라 구글 안의 흐름",
    desc: "구글에서 \"홈페이지 제작\"을 찾는 정도의 연평균. 2004년 44에서 2014년 8.5로 내려온 뒤 6~8 사이를 오갑니다. 같은 기간 \"유지보수\", \"리뉴얼\"은 거의 0입니다.",
    series: searchDemand,
    source: { label: "Google Trends(대한민국, 2004~2026)", href: "https://trends.google.com/trends/explore?date=all&geo=KR&q=%ED%99%88%ED%8E%98%EC%9D%B4%EC%A7%80%20%EC%A0%9C%EC%9E%91" },
    csv: [{ label: "월별 값(제작, 유지보수, 리뉴얼)", href: "/data/trend/google-trends-kr-homepage.csv" }],
    usedIn: [{ label: "기업 홈페이지: 회사 소개서 화면에서 플래시, 모바일, 빌더까지", href: "/knowledge/company-homepage" }],
  },
  {
    id: "php-versions",
    title: "PHP 주 버전 비율(전 세계, PHP 사이트 중)",
    unit: "%",
    note: "W3Techs 조사 표본 기준, 버전을 숨긴 사이트는 빠짐",
    desc: "PHP를 쓰는 사이트 중 5, 7, 8 버전 비율. 해마다 1월 1일 값.",
    series: phpVersions,
    source: { label: "W3Techs, PHP 버전 연도별 추이", href: "https://w3techs.com/technologies/history_details/pl-php/all/y" },
    csv: [],
    usedIn: [{ label: "PHP 5에서 8까지, 유지보수가 바뀐 10년", href: "/knowledge/php" }],
  },
  {
    id: "ios-share",
    title: "휴대폰 OS 중 아이폰 비율, 한국 일본 미국",
    unit: "%",
    note: "방문 표본 기반이라 해마다 튀는 값이 있습니다",
    desc: "모바일 접속 중 iOS 비율. 나머지는 대부분 안드로이드. 연간 값.",
    series: iosShare,
    source: { label: "StatCounter Global Stats, Mobile Operating System Market Share", href: "https://gs.statcounter.com/os-market-share/mobile" },
    csv: ["KR", "JP", "US"].map((c) => ({ label: `${c} 모바일 OS`, href: `/data/trend/mobile-os-${c}.csv` })),
    usedIn: [{ label: "한국은 안드로이드, 일본과 미국은 아이폰", href: "/knowledge/app" }],
  },
  {
    id: "https-share",
    note: "크롬 사용 통계 제공에 동의한 사용자 기준, Windows만",
    title: "크롬에서 https로 열린 페이지 비율, 일본 미국",
    unit: "%",
    desc: "크롬(Windows)에서 https로 열린 페이지 비율. 해마다 7월 첫 주 값. 한국은 이 보고서에 없음.",
    series: httpsShare,
    source: { label: "Google 투명성 보고서, HTTPS encryption on the web", href: "https://transparencyreport.google.com/https/overview" },
    csv: [{ label: "나라별 주간 값", href: "/data/trend/https-pageload-by-country.csv" }],
    usedIn: [{ label: "주소창 자물쇠가 기본이 되기까지", href: "/knowledge/https" }],
  },
  {
    id: "flash-jquery",
    note: "W3Techs 조사 표본 기준, 2026년 값은 설명 없는 급변이라 뺐습니다",
    title: "웹사이트 중 Flash, jQuery 사용 비율(전 세계)",
    unit: "%",
    desc: "W3Techs가 조사한 전체 웹사이트 중 사용 비율. 해마다 1월 1일 값.",
    series: flashJquery,
    source: { label: "W3Techs, 연도별 기술 사용 추이", href: "https://w3techs.com/technologies/history_overview/javascript_library/all/y" },
    csv: [],
    usedIn: [{ label: "플래시가 사라진 자리", href: "/knowledge/flash-jquery" }],
  },
  {
    id: "page-weight",
    note: "2016, 2018, 2022년에 수집 방식이 바뀌어 해마다 엄밀히 같은 조건은 아닙니다. PC 2017년 1월은 수집 없음",
    max: 3000,
    title: "웹 페이지 무게 중앙값(전 세계, KB)",
    unit: "KB",
    desc: "HTTP Archive가 수집한 페이지 한 장의 전체 용량 중앙값. 해마다 1월 첫 수집.",
    series: pageWeight,
    source: { label: "HTTP Archive, Page Weight", href: "https://httparchive.org/reports/page-weight" },
    csv: [{ label: "1월 중앙값", href: "/data/trend/httparchive-january-medians.csv" }],
    usedIn: [{ label: "홈페이지는 얼마나 무거워졌나", href: "/knowledge/page-weight" }],
  },
  {
    id: "ie-share",
    note: "방문 표본 기반이라 해마다 튀는 값이 있습니다",
    title: "PC 브라우저 중 IE 비율, 한국 일본 미국",
    unit: "%",
    desc: "PC로 들어온 방문 중 인터넷 익스플로러 비율. 연간 값.",
    series: ieShare,
    source: { label: "StatCounter Global Stats, Desktop Browser Market Share", href: "https://gs.statcounter.com/browser-market-share/desktop" },
    csv: ["KR", "JP", "US"].map((c) => ({ label: `${c} 브라우저 전체`, href: `/data/trend/desktop-browser-${c}.csv` })),
    usedIn: [{ label: "한국만 IE를 오래 못 떠난 이유", href: "/knowledge/browser" }],
  },
  {
    id: "mobile-share",
    note: "방문 표본 기반이라 해마다 튀는 값이 있습니다(예: 미국 2023년)",
    title: "전체 접속 중 모바일 비율, 한국 일본 미국",
    unit: "%",
    desc: "PC, 모바일, 태블릿을 합친 방문 중 모바일 비율. 연간 값.",
    series: mobileShare,
    source: { label: "StatCounter Global Stats, Desktop vs Mobile vs Tablet Market Share", href: "https://gs.statcounter.com/platform-market-share/desktop-mobile-tablet" },
    csv: ["KR", "JP", "US"].map((c) => ({ label: `${c} 기기별`, href: `/data/trend/platform-${c}.csv` })),
    usedIn: [{ label: "한국이 모바일로 먼저 넘어간 길", href: "/knowledge/mobile-screen" }],
  },
];
