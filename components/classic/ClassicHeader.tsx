"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

// 사이트 머리글. 11-26 다시 씀: 메인과 안쪽 판이 모두 같은 어두운 띠 하나를 쓴다.
// 예전 흰 머리글(유지보수, 제작, 비용, 웹 지식 펼침 메뉴와 휴대폰 전체 메뉴)은 내린 페이지들로 이어져 있어 뺐다.
//  - 메인(/): 페이지 안 칸으로 내려가는 메뉴(Build, Run, Care, Process, Contact)
//  - 그 밖의 모든 페이지: 판끼리 오가는 메뉴(Build, Care, Price, Catalog, Contact)
// 견적 버튼은 두지 않는다(11-25 사용자 "있어도 안 누르는 거면"). 문의는 Contact와 메인 맨 아래 신청서로.

const HOME = [
  { href: "#services", label: "Build" },
  { href: "#products", label: "Run" },
  { href: "#care", label: "Care" },
  { href: "#process", label: "Process" },
  { href: "#apply", label: "Contact" },
];
// 안쪽 판. 순서는 메인의 Build, Run, Care 이야기와 같게
const BOARDS = [
  { href: "/make", label: "Build" },
  { href: "/maintenance", label: "Care" },
  { href: "/pricing", label: "Price" },
  { href: "/works", label: "Catalog" },
  { href: "/#apply", label: "Contact" },
];

export function ClassicHeader() {
  const pathname = usePathname();
  const home = pathname === "/";
  // 11-21 태블릿(손가락 입력, 폭 768 이상)은 머리를 고정하지 않는다. 아이패드 크롬은 주소창이 접히고 펴질 때
  // 고정 위치를 늦게 계산해 머리가 제목을 덮거나 머리 위에 빈칸이 생겼다(사용자 캡처, 녹화). 휴대폰과 PC는 그대로 고정.
  const [tablet, setTablet] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse) and (min-width: 768px)");
    const on = () => setTablet(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  return (
    // 11-09 fixed에서 sticky로: 아이패드에서 뒤로 가기 뒤 화면 기준점이 어긋나면 고정 머리가 페이지 제목을 덮고 위로 안 올라갔다(사용자 제보)
    <header className={cn(tablet ? "relative" : "sticky", "top-0 z-50 bg-[#0b0d12]")}>
      <div className="border-b border-white/10">
        <nav aria-label="주 메뉴" className="mx-auto flex h-16 w-full max-w-[1248px] items-center justify-between gap-2 px-4 md:h-[76px] md:gap-6 md:px-6">
          <Link href="/" className="flex shrink-0 items-center gap-2.5 text-[21px] font-[800] tracking-[-0.04em] text-white">
            <Image src="/images/bear-avatar.webp" alt="" width={32} height={32} className="h-8 w-8 rounded-full object-cover" />
            {/* 안쪽 페이지의 좁은 화면에서는 메뉴 다섯 개가 들어갈 자리를 위해 이름을 감춘다(곰 얼굴만) */}
            <span className={cn(!home && "max-sm:sr-only")}>곰파트너</span>
          </Link>
          {/* 메인의 좁은 화면은 한 장을 스크롤하는 페이지라 메뉴를 감춘다 */}
          <ul className={cn("items-center lg:gap-1", home ? "hidden lg:flex" : "flex")} role="list">
            {(home ? HOME : BOARDS).map((a) => (
              <li key={a.href}>
                {/* 페이지 안 이동(#)도 next/link로 건다. 그냥 a 태그는 다른 페이지에 갔다가 뒤로 오면 주소만 바뀌고 화면이 안 바뀐다 */}
                <Link
                  href={a.href}
                  aria-current={pathname === a.href ? "page" : undefined}
                  className="inline-flex h-11 items-center rounded-md px-2 text-[14px] font-bold text-[#c9ced6] hover:text-white aria-[current=page]:text-white sm:px-3 sm:text-[16px]"
                >
                  {a.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
