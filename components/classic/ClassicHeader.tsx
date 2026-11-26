"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, Search, X } from "lucide-react";
import { ThemeSwitch } from "@/components/classic/ThemeSwitch";
import { cn } from "@/lib/utils";

// 사이트 머리글. 11-26 다시 씀: 메인과 안쪽 판이 모두 같은 어두운 띠 하나를 쓴다.
//  - 넓은 화면: 어느 페이지에서나 같은 메뉴(Build, Care, Price, Catalog, Wiki, Contact). 오른쪽에 통합검색과 화면 색(다크, 화이트) 버튼
//  - 좁은 화면: 통합검색과 햄버거 버튼. 햄버거를 누르면 화면을 덮는 메뉴가 열린다(11-26 사용자 "모바일 상단에 햄버거 메뉴로, 통합검색, 다크모드 화이트모드 선택")
// 견적 버튼은 두지 않는다(11-25 사용자 "있어도 안 누르는 거면"). 문의는 Contact와 메인 맨 아래 신청서로.

// 메뉴는 메인과 안쪽 페이지가 같다(11-26 사용자 "메인에 메뉴가 일부 없어": 메인은 랜딩이라 페이지 안 칸으로 가는 바로가기만 뒀었는데, 비용, 카탈로그, 위키로 갈 길이 없었다)
const BOARDS = [
  { href: "/make", label: "Build", ko: "제작" },
  // 11-26 사용자 "상단 메뉴에 3D 웹이 없어": 소개 페이지를 새로 만들었는데 가는 길이 바닥글과 제작 판 안에만 있었다
  { href: "/3d", label: "3D Web", ko: "3D 웹", big: true },
  { href: "/maintenance", label: "Care", ko: "유지보수" },
  { href: "/pricing", label: "Price", ko: "비용" },
  { href: "/works", label: "Catalog", ko: "카탈로그", big: true },
  { href: "/knowledge", label: "Wiki", ko: "위키" },
  { href: "/#apply", label: "Contact", ko: "문의" },
];
// 11-26 big: 미리받기(prefetch)가 큰 페이지(/3d 약 89KB, /works 약 57KB, 압축 전). 화면에 보이기만 해도 받지 않고 손을 올렸을 때 받는다.
// 카카오톡 안 브라우저에서 메인 첫 로딩이 안 되고 두 번째부터 열린다는 제보로, 첫 방문에 받는 양을 줄였다
// 햄버거 메뉴에만 더 나오는 것
const MORE: { href: string; label: string; ko: string; big?: boolean }[] = [
  { href: "/story", label: "About", ko: "회사소개" },
  { href: "/faq", label: "FAQ", ko: "자주 묻는 질문" },
];

const css = `
/* 메뉴와 팝업이 열려 있는 동안 뒤 페이지는 스크롤되지 않는다. 스크롤 막대가 사라진 폭(--sbw)만큼 오른쪽을 채워 화면이 옆으로 밀리지 않게 한다 */
html:has(dialog[open]) { overflow: hidden; padding-right: var(--sbw, 0px); }
/* 팝업은 열릴 때 자기 자신에 초점을 둔다. 그 테두리는 그리지 않는다(안의 버튼, 링크 초점 테두리는 그대로) */
dialog:focus, dialog:focus-visible { outline: none; }
dialog, dialog * { overscroll-behavior: contain; }
/* 11-26 버튼 색. 사이트는 검정과 흰색 두 색이 바탕이고, 색은 Build, Run, Care를 구분하는 면에만 쓴다(사용자 "버튼 색상 저 파란색 쓸 거야? 블랙 화이트 투톤").
   그래서 누르는 버튼에는 파랑을 쓰지 않는다. 어두운 화면에서는 흰 버튼, 밝은 화면에서는 검은 버튼(판의 Contact 버튼과 같은 규칙).
   primary: 결정하는 버튼, ghost: 검색 칸 안처럼 곁에 붙는 버튼, on: 고른 줄, box-on: 고른 체크 칸 */
.gp-primary { background: #15171c; color: #fff; }
.gp-primary:hover { background: #2b2f38; }
.gp-ghost { background: #e4e8ee; color: #15171c; }
.gp-ghost:hover { background: #d7dce4; }
.gp-on { background: #15171c; color: #fff; font-weight: 800; }
.gp-box-on { background: #15171c; border-color: #15171c; color: #fff; }
html.gp-dark .gp-primary { background: #fff; color: #0b0d12; }
html.gp-dark .gp-primary:hover { background: #dfe9ff; }
html.gp-dark .gp-ghost { background: rgba(255, 255, 255, 0.12); color: #fff; }
html.gp-dark .gp-ghost:hover { background: rgba(255, 255, 255, 0.22); }
html.gp-dark .gp-on { background: rgba(255, 255, 255, 0.1); color: #fff; box-shadow: inset 3px 0 0 #fff; }
html.gp-dark .gp-box-on { background: #fff; border-color: #fff; color: #0b0d12; }
.gp-menu { opacity: 0; transition: opacity .18s ease, overlay .18s allow-discrete, display .18s allow-discrete; }
.gp-menu[open] { opacity: 1; }
@starting-style { .gp-menu[open] { opacity: 0; } }
.gp-menu::backdrop { background: transparent; }
@media (prefers-reduced-motion: reduce) { .gp-menu { transition: none; } }
`;

const icon = "grid h-11 w-11 shrink-0 place-items-center rounded-full text-[#c9ced6] hover:bg-white/10 hover:text-white";

export function ClassicHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const dlg = useRef<HTMLDialogElement>(null);
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

  // 스크롤 막대 폭을 재 둔다(PC에서 팝업을 열 때 막대가 사라지며 화면이 6px쯤 흔들리던 것을 막는다). 팝업이 열려 있을 때는 재지 않는다
  useEffect(() => {
    const root = document.documentElement;
    const measure = () => {
      if (document.querySelector("dialog[open]")) return;
      root.style.setProperty("--sbw", `${Math.max(0, window.innerWidth - root.clientWidth)}px`);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(root);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const d = dlg.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      // 열릴 때 첫 버튼(로고, 닫기)에 파란 초점 테두리가 뜨지 않게 팝업 자신에 초점을 둔다. 키보드는 Tab으로 이어 간다
      d.focus();
    }
    if (!open && d.open) d.close();
  }, [open]);
  // 넓은 화면으로 바뀌면 열려 있던 메뉴를 닫는다
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const on = () => mq.matches && setOpen(false);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  const search = (e: React.FormEvent) => {
    e.preventDefault();
    setOpen(false);
    router.push(q.trim() ? `/search?q=${encodeURIComponent(q.trim())}` : "/search");
    setQ("");
  };
  // 768 아래에서 햄버거로 바뀐다(태블릿에는 메뉴 여섯 개가 들어간다)

  return (
    // 11-09 fixed에서 sticky로: 아이패드에서 뒤로 가기 뒤 화면 기준점이 어긋나면 고정 머리가 페이지 제목을 덮고 위로 안 올라갔다(사용자 제보)
    <header className={cn(tablet ? "relative" : "sticky", "top-0 z-50 bg-[#0b0d12]")}>
      <style>{css}</style>
      <div className="border-b border-white/10">
        <nav aria-label="주 메뉴" className="mx-auto flex h-16 w-full max-w-[1248px] items-center justify-between gap-2 px-4 md:h-[76px] md:gap-4 md:px-6">
          <Link href="/" className="flex shrink-0 items-center gap-2.5 text-[21px] font-[800] tracking-[-0.04em] text-white">
            <Image src="/images/bear-avatar.webp" alt="" width={32} height={32} className="h-8 w-8 rounded-full object-cover" />
            <span>곰파트너</span>
          </Link>
          <div className="flex items-center gap-0.5 md:gap-1">
            <ul className={cn("items-center lg:gap-1", "hidden md:flex")} role="list">
              {BOARDS.map((a) => (
                <li key={a.href}>
                  {/* 페이지 안 이동(#)도 next/link로 건다. 그냥 a 태그는 다른 페이지에 갔다가 뒤로 오면 주소만 바뀌고 화면이 안 바뀐다 */}
                  <Link href={a.href} prefetch={a.big ? false : undefined} aria-current={pathname === a.href ? "page" : undefined} className="inline-flex h-11 items-center rounded-md px-2.5 text-[15px] font-bold text-[#c9ced6] hover:text-white aria-[current=page]:text-white lg:px-3 lg:text-[16px]">
                    {a.label}
                  </Link>
                </li>
              ))}
            </ul>
            {/* 통합검색 페이지 데이터는 약 690KB(압축 약 185KB)라 미리받지 않는다. 휴대폰 첫 화면에도 보이는 아이콘이라 메인 첫 방문마다 받고 있었다 */}
            <Link href="/search" prefetch={false} aria-label="통합검색" title="통합검색" aria-current={pathname === "/search" ? "page" : undefined} className={cn(icon, "aria-[current=page]:text-white")}>
              <Search size={20} aria-hidden />
            </Link>
            <ThemeSwitch className={cn(icon, "hidden md:grid")} />
            <button type="button" onClick={() => setOpen(true)} aria-label="메뉴 열기" aria-haspopup="dialog" aria-expanded={open} className={cn(icon, "text-white", "md:hidden")}>
              <Menu size={24} aria-hidden />
            </button>
          </div>
        </nav>
      </div>

      {/* 좁은 화면 메뉴: 화면을 덮는다. 위에 검색, 가운데 페이지 목록, 아래에 화면 색 */}
      <dialog ref={dlg} tabIndex={-1} onClose={() => setOpen(false)} aria-label="메뉴" className="outline-none focus:outline-none gp-menu m-0 h-dvh max-h-none w-full max-w-none bg-[#0b0d12] p-0 text-white">
        <div className="flex h-full flex-col">
          <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-4">
            <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-2.5 text-[21px] font-[800] tracking-[-0.04em] text-white">
              <Image src="/images/bear-avatar.webp" alt="" width={32} height={32} className="h-8 w-8 rounded-full object-cover" />
              <span>곰파트너</span>
            </Link>
            <button type="button" onClick={() => setOpen(false)} aria-label="메뉴 닫기" className={cn(icon, "text-white")}>
              <X size={24} aria-hidden />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-6 pt-5">
            <form role="search" onSubmit={search} className="flex h-12 items-center rounded-full border border-white/20 bg-[#121722] pl-4 pr-1.5 focus-within:border-white/60">
              <Search size={18} aria-hidden className="shrink-0 text-[#aab2bf]" />
              <label htmlFor="gp-menu-q" className="sr-only">
                통합검색
              </label>
              <input id="gp-menu-q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="통합검색" autoComplete="off" enterKeyHint="search" className="h-full min-w-0 flex-1 bg-transparent px-3 text-[16px] text-white outline-none placeholder:text-[#8a94a6] [&::-webkit-search-cancel-button]:hidden" />
              <button type="submit" className="h-9 shrink-0 rounded-full bg-[#256ef4] px-4 text-[14px] font-bold text-white">
                검색
              </button>
            </form>
            <ul className="mt-4" role="list">
              {[...BOARDS, ...MORE].map((a) => (
                <li key={a.href} className="border-b border-white/10">
                  <Link href={a.href} prefetch={a.big ? false : undefined} onClick={() => setOpen(false)} aria-current={pathname === a.href ? "page" : undefined} className="group flex min-h-[60px] items-baseline justify-between gap-3 py-4">
                    <span className="text-[26px] font-[800] leading-none tracking-[-0.04em] text-white group-aria-[current=page]:text-[#7aa7ff]">{a.label}</span>
                    <span className="text-[15px] font-bold text-[#aab2bf]">{a.ko}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <ThemeSwitch withLabel className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full border border-white/20 px-4 text-[15px] font-bold text-white" />
          </div>
        </div>
      </dialog>
    </header>
  );
}
