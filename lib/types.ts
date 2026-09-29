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
  title: string;
  /** 한 줄 설명 — 카드와 데모 메타 설명에 쓴다 */
  description: string;
  /** 주요 기능 태그 */
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
