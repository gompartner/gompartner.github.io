import type { Viewport } from "next";
import { ClassicShell } from "@/components/classic/ClassicShell";
import { OrganizationJsonLd, PersonJsonLd, ProfessionalServiceJsonLd, WebSiteJsonLd } from "@/components/seo/JsonLd";

// 첫 화면(/)은 클래식 보기. /classic 아래 페이지와 같은 틀을 쓴다.
export const viewport: Viewport = { themeColor: "#ffffff" };

export default function HomeLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <OrganizationJsonLd />
      <PersonJsonLd />
      <ProfessionalServiceJsonLd />
      <WebSiteJsonLd />
      <ClassicShell>{children}</ClassicShell>
    </>
  );
}
