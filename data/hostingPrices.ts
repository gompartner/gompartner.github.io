// 웹호스팅·도메인 1년 유지비 비교 자료(/tools/hosting-cost). 각 업체 공식 요금 페이지에서 확인한 정가다.
// 이벤트가는 note에만 적는다. 가격이 바뀌면 checkedAt과 함께 고친다.
export const checkedAt = "2026년 10월 12일";

export type HostingKind = "웹호스팅" | "구독형 빌더";

export interface HostingPlan {
  id: string;
  provider: string;
  product: string;
  kind: HostingKind;
  /** 1년 결제 금액(1년 약정 할인 반영). 부가세 별도 상품은 10%를 더한 값 */
  yearly: number;
  /** 처음 한 번 내는 설치비 */
  setup: number;
  /** 내 도메인에 https(SSL)를 다는 비용. null이면 공식 페이지에서 확인하지 못함 */
  ssl: { firstYear: number; yearly: number; label: string } | null;
  storage: string;
  traffic: string;
  /** 부가세: 포함, 별도(값에 10% 더함), 표기 없음 */
  vat: "포함" | "별도" | "표기 없음";
  note: string;
  source: string;
}

export const hostingPlans: HostingPlan[] = [
  {
    id: "cafe24-saver",
    provider: "카페24",
    product: "뉴아우토반 절약형",
    kind: "웹호스팅",
    yearly: 5_400,
    setup: 5_000,
    ssl: { firstYear: 11_000, yearly: 0, label: "SSL Basic 0원, 설치비 11,000원(한 번)" },
    storage: "700MB",
    traffic: "하루 1.6GB",
    vat: "포함",
    note: "1년 약정 시 월 450원. 내 도메인 1개 연결",
    source: "https://hosting.cafe24.com/?controller=new_product_page&page=newautobahn",
  },
  {
    id: "cafe24-basic",
    provider: "카페24",
    product: "뉴아우토반 일반형",
    kind: "웹호스팅",
    yearly: 16_200,
    setup: 11_000,
    ssl: { firstYear: 11_000, yearly: 0, label: "SSL Basic 0원, 설치비 11,000원(한 번)" },
    storage: "1.4GB",
    traffic: "하루 4GB",
    vat: "포함",
    note: "1년 약정 시 월 1,350원. 내 도메인 2개 연결",
    source: "https://hosting.cafe24.com/?controller=new_product_page&page=newautobahn",
  },
  {
    id: "dothome-15",
    provider: "닷홈",
    product: "1.5G 웹호스팅",
    kind: "웹호스팅",
    yearly: 10_800,
    setup: 5_000,
    ssl: { firstYear: 0, yearly: 0, label: "무료 SSL(Let's Encrypt) 연결 가능" },
    storage: "1.5GB",
    traffic: "한 달 90GB",
    vat: "표기 없음",
    note: "12개월 결제 시 월 900원. 무료 호스팅은 내 도메인을 못 붙여 뺐습니다",
    source: "https://www.dothome.co.kr/web/product/price.php",
  },
  {
    id: "hostingkr-slim",
    provider: "호스팅케이알",
    product: "리눅스 SLIM",
    kind: "웹호스팅",
    yearly: 12_000,
    setup: 0,
    ssl: { firstYear: 0, yearly: 0, label: "무료 SSL 자동 설치" },
    storage: "300MB",
    traffic: "한 달 10GB",
    vat: "표기 없음",
    note: "월 1,000원. 사이트와 도메인 1개",
    source: "https://www.hosting.kr/webhosting/compare",
  },
  {
    id: "hostingkr-basic",
    provider: "호스팅케이알",
    product: "리눅스 BASIC",
    kind: "웹호스팅",
    yearly: 58_800,
    setup: 0,
    ssl: { firstYear: 0, yearly: 0, label: "무료 SSL 자동 설치" },
    storage: "2GB",
    traffic: "한 달 30GB",
    vat: "표기 없음",
    note: "월 4,900원. 사이트 10개까지",
    source: "https://www.hosting.kr/webhosting/compare",
  },
  {
    id: "ivy-lite",
    provider: "아이비호스팅",
    product: "철통보안 라이트",
    kind: "웹호스팅",
    yearly: 9_900,
    setup: 16_500,
    ssl: null,
    storage: "1GB",
    traffic: "하루 1GB",
    vat: "별도",
    note: "월 750원(부가세 별도). PHP 5.2 환경",
    source: "https://ivyro.net/html/webht/hosting/?type=secure",
  },
  {
    id: "gabia-basic",
    provider: "가비아",
    product: "리눅스 PHP 베이직",
    kind: "웹호스팅",
    yearly: 59_400,
    setup: 11_000,
    ssl: { firstYear: 44_000, yearly: 44_000, label: "무료 SSL 안내 없음, 유료 최저 1년 44,000원" },
    storage: "1GB",
    traffic: "한 달 30GB",
    vat: "포함",
    note: "월 4,950원. 다른 곳 도메인이면 설치비 33,000원",
    source: "https://webhosting.gabia.com/service",
  },
  {
    id: "sixshop-home",
    provider: "식스샵",
    product: "홈페이지 플랜",
    kind: "구독형 빌더",
    yearly: 162_360,
    setup: 0,
    ssl: { firstYear: 0, yearly: 0, label: "포함" },
    storage: "제한 없음",
    traffic: "제한 없음",
    vat: "별도",
    note: "1년 결제 월 12,300원(부가세 별도). 상품 판매 기능 제한",
    source: "https://www.sixshop.com/pricing",
  },
  {
    id: "imweb-starter",
    provider: "아임웹",
    product: "Starter",
    kind: "구독형 빌더",
    yearly: 192_000,
    setup: 0,
    ssl: { firstYear: 0, yearly: 0, label: "포함" },
    storage: "제한 없음",
    traffic: "하루 20GB",
    vat: "표기 없음",
    note: "1년 결제 월 16,000원(정가). 10월 신규 할인 이벤트 중",
    source: "https://imweb.me/price",
  },
];

export type Tld = ".com" | ".co.kr" | ".kr";

export interface DomainPrice {
  registrar: string;
  prices: Record<Tld, number>;
  note: string;
  source: string;
}

// 1년 등록 정가. 연장가를 따로 공개한 곳은 호스팅케이알뿐이고 등록가와 같다. 나머지도 등록가로 계산한다.
export const domainPrices: DomainPrice[] = [
  { registrar: "가비아", prices: { ".com": 26_400, ".co.kr": 23_100, ".kr": 23_100 }, note: "부가세 포함", source: "https://domain.gabia.com/regist/regist_domain" },
  { registrar: "카페24", prices: { ".com": 23_500, ".co.kr": 22_000, ".kr": 22_000 }, note: "부가세 포함. 2년 이상 사면 첫해 30% 할인 이벤트 중", source: "https://hosting.cafe24.com/?controller=new_domain_search&method=priceInfo" },
  { registrar: "호스팅케이알", prices: { ".com": 23_000, ".co.kr": 20_000, ".kr": 20_000 }, note: "연장도 같은 값. 신규 이벤트가 .com 18,000원, .kr 14,000원", source: "https://www.hosting.kr/domain/search" },
];

export const tlds: Tld[] = [".co.kr", ".kr", ".com"];
