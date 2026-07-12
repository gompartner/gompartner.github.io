import type { SkillCategory } from "@/lib/types";

export const skillCategories: SkillCategory[] = [
  {
    id: "backend",
    label: "Backend",
    skills: [
      { name: "Java", level: "Expert" },
      { name: "Spring", level: "Expert" },
      { name: "Spring MVC", level: "Expert" },
      { name: "JSP", level: "Advanced" },
      { name: "REST API", level: "Advanced" },
      { name: "MyBatis", level: "Advanced" },
      { name: "Node.js", level: "Intermediate" },
      { name: "NestJS", level: "Intermediate" },
    ],
  },
  {
    id: "database",
    label: "Database",
    skills: [
      { name: "Oracle", level: "Advanced" },
      { name: "MySQL", level: "Advanced" },
      { name: "PostgreSQL", level: "Intermediate" },
      { name: "Redis", level: "Intermediate" },
      { name: "Database Design", level: "Advanced" },
      { name: "SQL Tuning", level: "Intermediate" },
    ],
  },
  {
    id: "frontend",
    label: "Web UI",
    skills: [
      { name: "JavaScript", level: "Advanced" },
      { name: "HTML", level: "Advanced" },
      { name: "CSS", level: "Advanced" },
      { name: "jQuery", level: "Advanced" },
      { name: "React", level: "Intermediate" },
      { name: "Next.js", level: "Intermediate" },
      { name: "TypeScript", level: "Intermediate" },
      { name: "TailwindCSS", level: "Intermediate" },
    ],
  },
  {
    id: "cloud",
    label: "Cloud",
    skills: [
      { name: "Vercel", level: "Expert" },
      { name: "AWS S3", level: "Advanced" },
      { name: "AWS CloudFront", level: "Intermediate" },
      { name: "AWS Lambda", level: "Intermediate" },
      { name: "Google Cloud", level: "Beginner" },
      { name: "Naver Cloud", level: "Advanced" },
    ],
  },
  {
    id: "devops",
    label: "DevOps",
    skills: [
      { name: "Git", level: "Expert" },
      { name: "GitHub Actions", level: "Advanced" },
      { name: "Docker", level: "Intermediate" },
      { name: "Nginx", level: "Intermediate" },
      { name: "Turborepo", level: "Advanced" },
    ],
  },
  {
    id: "ai",
    label: "AI",
    skills: [
      { name: "OpenAI API", level: "Advanced" },
      { name: "LangChain", level: "Intermediate" },
      { name: "Prompt Engineering", level: "Advanced" },
      { name: "Vercel AI SDK", level: "Intermediate" },
    ],
  },
];

export const skillLevelMap = {
  Beginner: { label: "입문", width: "25%", color: "bg-foreground-tertiary" },
  Intermediate: { label: "중급", width: "50%", color: "bg-accent" },
  Advanced: { label: "고급", width: "75%", color: "bg-accent" },
  Expert: { label: "전문가", width: "100%", color: "bg-accent" },
} as const;
