import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
  PersonJsonLd,
  ProfessionalServiceJsonLd,
  WebSiteJsonLd,
} from "@/components/seo/JsonLd";

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col">
      <PersonJsonLd />
      <ProfessionalServiceJsonLd />
      <WebSiteJsonLd />
      <Header />
      <main className="flex-1 pt-16">{children}</main>
      <Footer />
    </div>
  );
}
