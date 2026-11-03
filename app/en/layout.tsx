import { EnShell } from "@/components/en/EnShell";

// 11-04 영문 페이지 공용 틀(머리글, 바닥글)
export default function EnLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <EnShell>{children}</EnShell>;
}
