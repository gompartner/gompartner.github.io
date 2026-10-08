import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

// 없는 주소로 들어왔을 때. (site) 그룹 밖이라 머리글·바닥글을 직접 둔다.
const pages = [
  { href: "/", label: "첫 화면" },
  { href: "/works", label: "포트폴리오" },
  { href: "/pricing", label: "가격" },
  { href: "/faq", label: "자주 묻는 질문" },
  { href: "/career", label: "주요 경력" },
  { href: "/tools", label: "자료실" },
];

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main id="main" className="flex-1 pt-16">
        <div className="mx-auto flex w-full max-w-[640px] flex-col items-start px-4 py-20 md:py-28">
          <Image src="/images/logo.svg" alt="" width={64} height={64} className="h-16 w-16" />
          <p className="mt-6 text-[15px] font-bold text-accent">404</p>
          <h1 className="mt-1 text-[28px] font-bold leading-[1.4] md:text-[32px]">페이지를 찾을 수 없습니다</h1>
          <p className="mt-2 text-[17px] leading-[1.6] text-foreground-secondary">
            주소가 바뀌었거나 없는 페이지입니다. 주소를 다시 확인해 주세요.
          </p>

          <h2 className="mt-10 text-[17px] font-bold">자주 찾는 페이지</h2>
          <ul className="mt-3 grid w-full gap-2 sm:grid-cols-2">
            {pages.map((p) => (
              <li key={p.href}>
                <Link
                  href={p.href}
                  className="flex h-12 items-center justify-between rounded-md border border-border px-4 text-[17px] hover:bg-surface"
                >
                  {p.label}
                  <span aria-hidden className="text-foreground-tertiary">
                    &gt;
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </main>
      <Footer />
    </div>
  );
}
