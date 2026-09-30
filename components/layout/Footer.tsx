import Link from "next/link";
import { profile } from "@/data/profile";
import { tools } from "@/data/tools";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex w-full max-w-[1248px] flex-col gap-2 px-4 py-8 text-[15px] leading-[1.5] text-foreground-tertiary md:flex-row md:items-center md:justify-between md:px-6">
        <p>
          © {currentYear} {profile.name} · {profile.title}
        </p>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
        {tools.map((t) => (
          <Link key={t.href} href={t.href} className="text-foreground-secondary underline-offset-4 hover:text-foreground hover:underline">
            {t.title}
          </Link>
        ))}
        <a
          href={`mailto:${profile.email}`}
          data-gtm-cta="footer_email"
          className="text-foreground-secondary underline-offset-4 hover:text-foreground hover:underline"
        >
          {profile.email}
        </a>
        </div>
      </div>
    </footer>
  );
}
