// ─── Profile ───────────────────────────────────────────────────────────────

export interface Profile {
  name: string;
  nameEn: string;
  title: string;
  bio: string;
  location: string;
  email: string;
  avatarUrl: string;
}

// ─── Demo (Portfolio) ───────────────────────────────────────────────────────

export interface Project {
  id: string;
  /** 제작 사례 탭 구분 */
  kind: "신규 제작" | "유지보수";
  /** 카드 위 작은 분류명 */
  category: string;
  /** 카드 분류 옆에 붙는 레이아웃 유형 (예: 카페24형). 실제 업종 사이트 벤치마킹으로 정한 화면 구성 이름 */
  layout: string;
  title: string;
  /** 데모 페이지 메타 설명과 사례 검색에만 쓴다. 카드에는 보여 주지 않는다(사용법은 데모 가이드가 맡는다). */
  description: string;
  /** 주요 기능. 카드에는 보여 주지 않고 사례 검색에만 쓴다 */
  features: string[];
  /** 데모 화면 스크린샷 (public 기준 경로) */
  imageUrl: string;
  imageAlt: string;
  demoUrl: string;
}

// ─── Contact ────────────────────────────────────────────────────────────────

export interface ContactLink {
  id: string;
  label: string;
  description: string;
  href: string;
  icon: string;
  color?: string;
}
