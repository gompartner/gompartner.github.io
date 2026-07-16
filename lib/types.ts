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

// ─── Project (Portfolio) ────────────────────────────────────────────────────

export interface Project {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  imageUrl: string;
  /** 제작 목적 — 이 데모를 왜 만들었는지 한두 문장 */
  purpose: string;
  /** 해결한 문제 — 어떤 상황의 문제를 다루는 구성인지 */
  problemSolved: string;
  /** 포함 기능 — 방문자(사업자)가 이해할 수 있는 쉬운 표현만 사용 */
  features: string[];
  /** 기대 효과 — 샘플 데모이므로 실적이 아닌 "기대할 수 있습니다" 프레이밍 */
  operationEffect: string[];
  /** 이런 분께 추천 */
  recommendedFor: string[];
  /** 예상 제작 기간 — 보수적 추정치, 상담에서 확정된다는 단서와 함께 노출 */
  buildTime: string;
  demoUrl?: string;
  period: string;
  featured?: boolean;
  category: "homepage" | "landing" | "admin" | "system" | "operation";
}

// ─── Blog ───────────────────────────────────────────────────────────────────

// 검색 유입용 콘텐츠 분류 — 글이 없는 카테고리는 목록에 탭으로 노출되지 않는다
export const BLOG_CATEGORIES = [
  "홈페이지 제작",
  "홈페이지 비용",
  "랜딩페이지",
  "검색 노출",
  "유지보수",
  "온라인 마케팅",
  "창업",
  "운영 노하우",
] as const;

export type BlogCategory = (typeof BLOG_CATEGORIES)[number];

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  summary: string;
  publishedAt: string;
  category: BlogCategory;
  tags: string[];
  thumbnailUrl?: string;
  readingTime: number;
  author: string;
  heroImageUrl?: string;
  content: BlogContentBlock[];
}

export type BlogContentBlock =
  | {
      type: "heading";
      text: string;
    }
  | {
      type: "paragraph";
      text: string;
    }
  | {
      type: "list";
      items: string[];
    }
  | {
      type: "quote";
      text: string;
    };

// ─── Contact ────────────────────────────────────────────────────────────────

export interface ContactLink {
  id: string;
  label: string;
  description: string;
  href: string;
  icon: string;
  color?: string;
}
