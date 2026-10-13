import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

// 없는 주소로 들어왔을 때. (site) 그룹 밖이라 머리글·바닥글을 직접 둔다.
const pages = [
  { href: "/", label: "첫 화면" },
  { href: "/works", label: "샘플" },
  { href: "/pricing", label: "가격" },
  { href: "/faq", label: "자주 묻는 질문" },
  { href: "/tools", label: "자료실" },
];

export default function NotFound() {
  return (
    <div className="wt flex min-h-screen flex-col">
      <Header />
      <main id="main" className="flex-1 pt-16">
        <div className="mx-auto flex w-full max-w-[640px] flex-col items-start px-4 py-20 md:py-28">
          <Image src="/images/webtoon/bear-hello.jpg" alt="" width={160} height={160} className="h-40 w-40 border-[3px] border-[#1d1d1f] shadow-[5px_5px_0_#1d1d1f]" />
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
                  className="flex h-12 items-center justify-between rounded-[6px] border-[2.5px] border-[#1d1d1f] bg-white px-4 text-[17px] font-bold shadow-[3px_3px_0_#1d1d1f] hover:bg-[#fff3b0]"
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
