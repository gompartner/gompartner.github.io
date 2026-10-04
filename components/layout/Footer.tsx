import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { profile } from "@/data/profile";
import { tools } from "@/data/tools";

const menu = [
  { href: "/works", label: "제작 사례" },
  { href: "/#pricing", label: "가격" },
  { href: "/tools", label: "무료 도구" },
];

const link = "underline-offset-4 hover:text-foreground hover:underline";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto w-full max-w-[1248px] px-4 py-8 text-[15px] leading-[1.6] text-foreground-tertiary md:px-6 md:py-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <nav aria-label="바닥글 메뉴">
            <ul className="flex flex-wrap items-center gap-x-5 gap-y-1 text-foreground-secondary">
              <li>
                <Link href="/privacy" className={`font-bold text-foreground ${link}`}>
                  개인정보처리방침
                </Link>
              </li>
              {menu.map((m) => (
                <li key={m.href}>
                  <Link href={m.href} className={link}>
                    {m.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* 무료 도구는 관련 사이트로 묶어 접어 둔다 */}
          <details className="group relative w-full md:w-[220px]">
            <summary className="flex h-10 cursor-pointer list-none items-center justify-between rounded-md border border-border bg-white px-3 text-foreground-secondary [&::-webkit-details-marker]:hidden">
              관련 사이트
              <ChevronDown size={18} aria-hidden className="transition-transform group-open:rotate-180" />
            </summary>
            <ul className="absolute bottom-full left-0 right-0 z-10 mb-1 max-h-[320px] overflow-y-auto rounded-md border border-border bg-white py-1 shadow-lg">
              {tools.map((t) => (
                <li key={t.href}>
                  <Link href={t.href} className="block px-3 py-2 text-foreground-secondary hover:bg-surface hover:text-foreground">
                    {t.title}
                  </Link>
                </li>
              ))}
            </ul>
          </details>
        </div>

        <div className="mt-6 border-t border-border pt-6">
          <p className="flex flex-wrap gap-x-3">
            <span>{profile.name}</span>
            <span aria-hidden>|</span>
            <span>
              이메일{" "}
              <a href={`mailto:${profile.email}`} data-gtm-cta="footer_email" className={link}>
                {profile.email}
              </a>
            </span>
          </p>
          <p className="mt-1">
            © {currentYear} {profile.name}
          </p>
        </div>
      </div>
    </footer>
  );
}
