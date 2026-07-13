// 사이트 절대 URL의 단일 출처 — robots/sitemap/JSON-LD/metadataBase가 모두 이 값을 쓴다.
// 도메인이 바뀌면 여기만 수정하거나 빌드 시 NEXT_PUBLIC_SITE_URL로 오버라이드.
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://gompartner.github.io";
