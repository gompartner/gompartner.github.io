import { profile } from "@/data/profile";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex w-full max-w-[1248px] flex-col gap-2 px-4 py-8 text-[15px] leading-[1.5] text-foreground-tertiary md:flex-row md:items-center md:justify-between md:px-6">
        <p>
          © {currentYear} {profile.name} · {profile.title}
        </p>
        <a
          href={`mailto:${profile.email}`}
          data-gtm-cta="footer_email"
          className="text-foreground-secondary underline-offset-4 hover:text-foreground hover:underline"
        >
          {profile.email}
        </a>
      </div>
    </footer>
  );
}
