// 사이트 절대 URL의 단일 출처 — robots/sitemap/JSON-LD/metadataBase가 모두 이 값을 쓴다.
// 도메인이 바뀌면 여기만 수정하거나 빌드 시 NEXT_PUBLIC_SITE_URL로 오버라이드.
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://gompartner.co.kr";

// 11-08 카카오톡 채널 친구 쿠폰 목록(월 유지보수 첫 달 50%, 12-31까지). 서버 컴포넌트에서도 쓰므로 여기에 둔다
export const KAKAO_COUPON_URL = "https://pf.kakao.com/_JxntWX/coupons";
