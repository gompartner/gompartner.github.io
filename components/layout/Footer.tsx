import Image from "next/image";
import Link from "next/link";
import { Mail, BookOpen } from "lucide-react";
import { profile } from "@/data/profile";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-surface/50">
      <div className="max-w-6xl mx-auto px-6 md:px-12 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <Image
              src="/images/logo.svg"
              alt=""
              width={36}
              height={36}
              className="h-9 w-9"
              loading="lazy"
            />
            <div className="text-left">
              <p className="font-semibold text-foreground">{profile.name}</p>
              <p className="text-sm text-foreground-secondary mt-1">{profile.title}</p>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-3" aria-label="소셜 링크">
            <a
              href={`mailto:${profile.email}`}
              aria-label="이메일 보내기"
              className="w-9 h-9 flex items-center justify-center rounded-full text-foreground-secondary hover:text-foreground hover:bg-surface-secondary transition-colors"
            >
              <Mail size={18} />
            </a>
            <Link
              href="/blog"
              aria-label="블로그"
              className="w-9 h-9 flex items-center justify-center rounded-full text-foreground-secondary hover:text-foreground hover:bg-surface-secondary transition-colors"
            >
              <BookOpen size={18} />
            </Link>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6 border-t border-border flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-sm text-foreground-tertiary">
            © {currentYear} {profile.name}. All rights reserved.
          </p>
          <nav aria-label="푸터 네비게이션">
            <ul className="flex items-center gap-4" role="list">
              {[
                { href: "/portfolio", label: "Portfolio" },
                { href: "/career", label: "Career" },
                { href: "/skills", label: "Skills" },
                { href: "/contact", label: "Contact" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-foreground-tertiary hover:text-foreground-secondary transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}
