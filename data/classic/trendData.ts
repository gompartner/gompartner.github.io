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

// 데이터 분류 목록(위 숫자를 다 정의한 뒤에 둔다)
export const datasets: Dataset[] = [
  {
    id: "https-share",
    note: "크롬 사용 통계 제공에 동의한 사용자 기준, Windows만",
    title: "크롬에서 https로 열린 페이지 비율, 일본 미국",
    unit: "%",
    desc: "크롬(Windows)에서 https로 열린 페이지 비율. 해마다 7월 첫 주 값. 한국은 이 보고서에 없음.",
    series: httpsShare,
    source: { label: "Google 투명성 보고서, HTTPS encryption on the web", href: "https://transparencyreport.google.com/https/overview" },
    csv: [{ label: "나라별 주간 값", href: "/data/trend/https-pageload-by-country.csv" }],
    usedIn: [{ label: "트렌드 3. 주소창 자물쇠가 기본이 되기까지", href: "/archive/trends/https" }],
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
    usedIn: [{ label: "트렌드 4. 플래시가 사라진 자리", href: "/archive/trends/flash" }],
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
    usedIn: [{ label: "트렌드 6. 홈페이지는 얼마나 무거워졌나", href: "/archive/trends/page-weight" }],
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
    usedIn: [{ label: "트렌드 1. 한국만 IE를 오래 못 떠난 이유", href: "/archive/trends/korea-ie" }],
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
    usedIn: [{ label: "트렌드 2. 한국이 모바일로 먼저 넘어간 길", href: "/archive/trends/mobile" }],
  },
];
