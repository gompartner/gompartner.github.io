import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function DemoLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {children}
      <Link
        href="/portfolio"
        className="fixed bottom-5 left-5 z-50 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/60 px-4 py-2.5 text-sm font-medium text-white shadow-lg backdrop-blur-md transition-transform hover:scale-105"
      >
        <ArrowLeft size={15} aria-hidden />
        포트폴리오
      </Link>
    </>
  );
}
