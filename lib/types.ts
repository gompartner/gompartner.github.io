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
  techStack: string[];
  demoUrl?: string;
  achievements: string[];
  responsibilities: string[];
  period: string;
  featured?: boolean;
  category: "homepage" | "landing" | "admin" | "system" | "operation";
}

// ─── Career ─────────────────────────────────────────────────────────────────

export interface CareerItem {
  id: string;
  company: string;
  companyUrl?: string;
  role: string;
  employmentType: "정규직" | "계약직" | "프리랜서" | "인턴";
  startDate: string;
  endDate?: string;
  description: string;
  responsibilities: string[];
  achievements: string[];
  techStack: string[];
  projects: CareerProject[];
}

export interface CareerProject {
  name: string;
  description: string;
  url?: string;
}

export interface CareerSupplement {
  id: string;
  title: string;
  items: string[];
}

// ─── Skill ──────────────────────────────────────────────────────────────────

export type SkillLevel = "Beginner" | "Intermediate" | "Advanced" | "Expert";

export interface Skill {
  name: string;
  level: SkillLevel;
  iconName?: string;
}

export interface SkillCategory {
  id: string;
  label: string;
  skills: Skill[];
}

// ─── Blog ───────────────────────────────────────────────────────────────────

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  summary: string;
  publishedAt: string;
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
