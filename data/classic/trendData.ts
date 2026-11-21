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

export type Dataset = { id: string; title: string; unit: string; desc: string; series: Series[]; source: { label: string; href: string }; csv: { label: string; href: string }[]; usedIn?: { label: string; href: string }[] };

export const datasets: Dataset[] = [
  {
    id: "ie-share",
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
    title: "전체 접속 중 모바일 비율, 한국 일본 미국",
    unit: "%",
    desc: "PC, 모바일, 태블릿을 합친 방문 중 모바일 비율. 연간 값.",
    series: mobileShare,
    source: { label: "StatCounter Global Stats, Desktop vs Mobile vs Tablet Market Share", href: "https://gs.statcounter.com/platform-market-share/desktop-mobile-tablet" },
    csv: ["KR", "JP", "US"].map((c) => ({ label: `${c} 기기별`, href: `/data/trend/platform-${c}.csv` })),
  },
];
