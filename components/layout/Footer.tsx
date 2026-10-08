import Link from "next/link";
import { profile } from "@/data/profile";

const menu = [
  { href: "/works", label: "포트폴리오" },
  { href: "/pricing", label: "가격" },
  { href: "/faq", label: "자주 묻는 질문" },
  { href: "/career", label: "주요 경력" },
  { href: "/tools", label: "자료실" },
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
