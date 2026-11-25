"use client";

import Image from "next/image";
import Link from "next/link";
import { NavLink } from "@/components/classic/NavLink";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Menu, Search, X } from "lucide-react";
import { ThemeToggle } from "@/components/classic/ThemeToggle";
import { cases } from "@/data/classic/cases";
import { cn } from "@/lib/utils";

// 클래식 보기(/classic)의 머리글. 로고와 내림 메뉴만 둔다(10-30 채널 줄과 웹툰 전환 버튼 뺌).

// match는 그 메뉴를 켜는 주소. 한 주소가 두 메뉴를 켜지 않게 겹치지 않게 둔다.
// 1단 순서는 유지보수, 제작, 비용, 웹 지식(11-06, 11-12 대표 결정. 11-25 다시 확인)
export const classicMenu = [
  // 11-12 리뉴얼: 상단은 유지보수, 제작, 비용(+오른쪽 상담 신청 버튼). 회사소개, 공지, 인사이트, 자주 묻는 질문은 바닥글과 휴대폰 메뉴 아래로
  {
    label: "유지보수",
    href: "/maintenance",
    match: ["/maintenance"],
    items: [
      { href: "/maintenance", label: "전체" },
      { href: "/maintenance/fix", label: "유지보수" },
      { href: "/maintenance/monthly", label: "유지관리" },
      { href: "/maintenance/perf", label: "성능 개선" },
      { href: "/maintenance/ai-site", label: "고도화" },
    ],
  },
  {
    label: "제작",
    href: "/homepage",
    match: ["/homepage", "/landing-page", "/program", "/app", "/kiosk", "/3d"],
    // 11-01 랜딩, 업무 프로그램은 제작 안에 둔다(10-29 사용자 결정)
    items: [
      { href: "/homepage", label: "홈페이지 제작" },
      { href: "/landing-page", label: "랜딩페이지 제작" },
      { href: "/program", label: "업무 프로그램 제작" },
      { href: "/app", label: "앱 제작" },
      { href: "/kiosk", label: "키오스크 화면 제작" },
      { href: "/3d", label: "3D 웹 제작" },
    ],
  },
  { label: "비용", href: "/pricing", match: ["/pricing"], items: [] },
  // 고객 사례는 계약 끝나고 게재 동의를 받은 실제 사례가 data/classic/cases.ts에 들어가는 순간 메뉴에 나온다(그 전엔 빈 값, 메뉴와 페이지 없음)
  ...(cases.length > 0 ? [{ label: "고객 사례", href: "/cases", match: ["/cases"], items: [] }] : []),
];

// 11-25 사용자 "랜딩 수준으로 심플하게, 카탈로그, 웹 지식 별도 서비스로 분리". 주 메뉴는 유지보수, 제작, 비용만 두고
// 웹 지식(/knowledge)은 머리글 오른쪽에 따로 둔다. 카탈로그(/works)는 11-25 밤 사용자 결정으로 메뉴에서 내렸다(실적이 아닌 샘플은 보여 주지 않는다)
export const sideServices = [
  { href: "/knowledge", label: "웹 지식", match: ["/knowledge", "/insight", "/jaryo"] },
];

// 휴대폰 메뉴 아래 작은 줄(PC는 바닥글)
const subMenu = [
  { href: "/story", label: "회사소개" },
  { href: "/history", label: "연혁" },
  { href: "/notice", label: "공지사항" },
  { href: "/faq", label: "자주 묻는 질문" },
];


const maxItems = Math.max(...classicMenu.map((m) => m.items.length));

const toggle = "inline-flex h-11 w-11 items-center justify-center rounded-md border border-[#d9dee5] bg-white text-[#15171c] transition-colors hover:bg-[#eef1f5]";

export function ClassicHeader() {
  const pathname = usePathname();
  // 11-25 메인은 랜딩페이지: 머리글은 로고와 상담 신청만
  const landing = pathname === "/";
  // 메인은 어두운 조립형 화면이라 머리글도 어둡게
  const dark = landing;
  const [open, setOpen] = useState(false);
  // 손가락이나 펜으로 누르면 hover가 없으니, 하위 메뉴가 있는 메뉴는 첫 탭에 전체 메뉴를 열고 두 번째 탭에 이동한다.
  // 아이패드는 데스크톱 모드나 트랙패드에서 (hover: none)이 거짓으로 나와서, 미디어 쿼리 대신 실제로 누른 입력 종류를 본다
  const [all, setAll] = useState(false);
  // 키보드로 메뉴 안에 들어오면 하위 항목을 연다(초점이 메뉴 밖으로 나가거나 Esc를 누르면 닫는다)
  const [kb, setKb] = useState(false);
  const menuBtn = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLElement>(null);
  const escaped = useRef(false);
  const [prev, setPrev] = useState(pathname);
  if (prev !== pathname) {
    setPrev(pathname);
    setOpen(false);
    setAll(false);
    setKb(false);
  }
  // 메뉴를 눌러 이동한 뒤 초점이 메뉴에 남아 내림 메뉴가 열려 있지 않게 푼다
  useEffect(() => {
    const el = document.activeElement;
    if (el instanceof HTMLElement && el.closest("header")) el.blur();
  }, [pathname]);
  useEffect(() => {
    if (!all) return;
    const close = (e: PointerEvent) => {
      if (!(e.target instanceof Element && e.target.closest("[data-drop]"))) setAll(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setAll(false);
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [all]);
  // 휴대폰 메뉴: 열면 첫 항목으로 초점, Tab은 메뉴 버튼과 메뉴 안에서만 돌고, Esc는 닫고 메뉴 버튼으로 돌아간다
  useEffect(() => {
    if (!open) return;
    const links = () => [menuBtn.current, ...Array.from(panel.current?.querySelectorAll<HTMLElement>("a[href], button") ?? [])].filter((el): el is HTMLElement => !!el);
    links()[1]?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        menuBtn.current?.focus();
        return;
      }
      if (e.key !== "Tab") return;
      const list = links();
      const i = list.indexOf(document.activeElement as HTMLElement);
      const next = e.shiftKey ? (i <= 0 ? list.length - 1 : i - 1) : i < 0 || i === list.length - 1 ? 0 : i + 1;
      e.preventDefault();
      list[next]?.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);
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
  // 11-22 휴대폰 메뉴가 열려 있으면 뒤 화면(본문, 바닥글)을 inert로 막아 화면 읽기 프로그램이 메뉴 뒤 내용을 읽지 않게 한다
  useEffect(() => {
    if (!open) return;
    const back = Array.from(document.querySelectorAll<HTMLElement>("#main, body > footer, footer[role=contentinfo], body footer")).filter((el) => !el.closest("header"));
    back.forEach((el) => el.setAttribute("inert", ""));
    return () => back.forEach((el) => el.removeAttribute("inert"));
  }, [open]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    // 11-09 fixed에서 sticky로: 아이패드에서 뒤로 가기 뒤 화면 기준점이 어긋나면 고정 머리가 페이지 제목을 덮고 위로 안 올라갔다(사용자 제보).
    // sticky는 문서 흐름 안에 있어 맨 위에서는 제목을 덮지 않는다. 본문 위 여백(pt-16, md:pt-[76px])도 같이 뺐다.
    <header className={cn(tablet ? "relative" : "sticky", "top-0 z-50", dark ? "bg-[#0b0d12]" : "bg-white")}>
      <div className={cn("border-b", dark ? "border-white/10" : "border-[#e6e9ee]")}>
        <nav aria-label="주 메뉴" className="mx-auto flex h-16 w-full max-w-[1248px] items-center justify-between gap-2 px-4 md:h-[76px] md:gap-6 md:px-6">
          <Link href="/" className={cn("flex shrink-0 items-center gap-2.5 text-[21px] font-[800] tracking-[-0.04em]", dark ? "text-white" : "text-[#15171c]")}>
            {/* 11-04 곰 얼굴 다시(11-01에 메뉴가 늘어 뺐던 것). 채널 프로필과 같은 곰 */}
            <Image src="/images/bear-avatar.webp" alt="" width={32} height={32} className="h-8 w-8 rounded-full object-cover" />
            곰파트너
          </Link>

          {/* 메뉴 하나에 올리거나(터치는 한 번 누르면) 모든 메뉴의 하위 항목을 한 판에 펼친다. 항목은 한 줄 고정이라 판 높이를 줄 수로 계산한다 */}
          <div
            data-drop
            className={cn("group/nav hidden h-full", !landing && "lg:block")}
            onFocus={(e) => {
              if (escaped.current) escaped.current = false;
              else if (e.target.matches(":focus-visible")) setKb(true);
            }}
            onBlur={(e) => {
              if (!(e.relatedTarget instanceof Node && e.currentTarget.contains(e.relatedTarget))) setKb(false);
            }}
            onKeyDown={(e) => {
              if (e.key !== "Escape" || !(kb || all)) return;
              setKb(false);
              setAll(false);
              // 하위 항목에서 닫으면 그 메뉴 이름으로 초점을 옮긴다
              const top = (e.target as HTMLElement).closest("li[data-top]")?.querySelector<HTMLElement>("button, a");
              if (top && top !== e.target) {
                escaped.current = true;
                top.focus();
              }
            }}
          >
            <ul className="flex h-full items-stretch" role="list">
              {classicMenu.map((m) => {
                const active = m.match.some((p) => pathname === p || pathname.startsWith(p + "/"));
                return (
                  <li key={m.label} data-top className="relative flex w-[128px] justify-center xl:w-[142px]">
                    {m.items.length > 0 ? (
                      // 11-25 하위 메뉴가 있는 메뉴는 누르면 펼치기만 한다(이동은 하위 항목으로). 마우스와 터치가 같은 동작
                      <button
                        type="button"
                        onClick={() => setAll((v) => !v)}
                        aria-expanded={all || kb}
                        aria-current={active ? "true" : undefined}
                        className={cn("flex items-center gap-1 text-[17px] font-bold tracking-[-0.02em] transition-colors hover:text-[#256ef4]", active ? "text-[#256ef4]" : "text-[#15171c]")}
                      >
                        {m.label}
                        <ChevronDown size={15} strokeWidth={2.5} aria-hidden className="text-[#6b7280]" />
                      </button>
                    ) : (
                      <Link
                        href={m.href}
                        aria-current={pathname === m.href ? "page" : undefined}
                        className={cn("flex items-center gap-1 text-[17px] font-bold tracking-[-0.02em] transition-colors hover:text-[#256ef4]", active ? "text-[#256ef4]" : "text-[#15171c]")}
                      >
                        {m.label}
                      </Link>
                    )}
                    {m.items.length > 0 && (
                      <ul
                        role="list"
                        className={cn(
                          "absolute left-0 top-full z-10 w-full py-5 text-center transition-opacity duration-150 group-hover/nav:visible group-hover/nav:opacity-100",
                          all || kb ? "visible opacity-100" : "invisible opacity-0"
                        )}
                      >
                        {m.items.map((i) => (
                          <li key={i.label}>
                            <NavLink href={i.href} aria-current={pathname === i.href ? "page" : undefined} className="flex h-11 items-center justify-center whitespace-nowrap text-[15px] text-[#3d4450] hover:text-[#256ef4] hover:underline underline-offset-4">
                              {i.label}
                            </NavLink>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
            <div
              aria-hidden
              style={{ height: maxItems * 44 + 40 }}
              className={cn(
                "fixed inset-x-0 top-[77px] border-y border-[#e6e9ee] bg-white shadow-[0_12px_24px_rgba(21,23,28,.08)] transition-opacity duration-150 group-hover/nav:visible group-hover/nav:opacity-100",
                all || kb ? "visible opacity-100" : "invisible opacity-0"
              )}
            />
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {/* 11-25 메인 랜딩은 페이지 안 이동 메뉴(개발사 홈페이지 형식) */}
            {landing && (
              <ul aria-label="이 페이지" className="mr-2 hidden items-center gap-1 lg:flex" role="list">
                {[
                  { href: "#services", label: "서비스" },
                  { href: "#products", label: "운영 서비스" },
                  { href: "#process", label: "진행 방식" },
                  { href: "#faq", label: "자주 묻는 질문" },
                ].map((a) => (
                  <li key={a.href}>
                    <Link href={a.href} className={cn("inline-flex h-11 items-center rounded-md px-3 text-[16px] font-bold", dark ? "text-[#c9ced6] hover:text-white" : "text-[#3d4450] hover:text-[#256ef4]")}>
                      {a.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            {/* 11-25 별도 서비스: 카탈로그, 웹 지식 */}
            <ul aria-label="다른 서비스" className={cn("mr-1 hidden items-center gap-1 border-r border-[#e6e9ee] pr-3", !landing && "lg:flex")} role="list">
              {sideServices.map((s) => (
                <li key={s.href}>
                  <NavLink
                    href={s.href}
                    aria-current={s.match.some((p) => pathname.startsWith(p)) ? "page" : undefined}
                    className="inline-flex h-11 items-center rounded-md px-2.5 text-[15px] font-bold text-[#5b6370] hover:text-[#256ef4] aria-[current=page]:text-[#256ef4]"
                  >
                    {s.label}
                  </NavLink>
                </li>
              ))}
            </ul>
            <Link
              href="/search"
              aria-label="통합검색"
              aria-current={pathname === "/search" ? "page" : undefined}
              className={cn("hidden h-11 w-11 place-items-center rounded-md text-[#15171c] transition-colors hover:bg-[#f1f3f6]", !landing && "min-[360px]:grid")}
            >
              <Search size={21} aria-hidden />
            </Link>
            <ThemeToggle className={cn("hidden h-11 w-11 place-items-center rounded-md text-[#15171c] transition-colors hover:bg-[#f1f3f6]", !landing && "lg:grid")} />
            {/* 휴대폰과 태블릿은 작게, PC는 크게. 같은 버튼 하나를 폭에 따라 줄인다 */}
            <Link
              href={pathname === "/" ? "#apply" : "/contact"}
              data-gtm-cta="classic_header_contact"
              aria-current={pathname === "/contact" ? "page" : undefined}
              className={cn(
                "inline-flex h-11 items-center whitespace-nowrap rounded-md px-3.5 text-[15px] font-bold transition-colors lg:px-5 lg:text-[16px]",
                pathname === "/contact" ? "bg-[#0b50d0] text-white" : "bg-[#256ef4] text-white hover:bg-[#0b50d0]"
              )}
            >
              {landing ? "무료 견적 받기" : "상담 신청"}
            </Link>
            <button
              ref={menuBtn}
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="classic-menu"
              aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
              className={cn(toggle, landing ? "hidden" : "lg:hidden")}
            >
              {open ? <X size={20} aria-hidden /> : <Menu size={20} aria-hidden />}
            </button>
          </div>
        </nav>
      </div>

      {open && (
        <nav id="classic-menu" ref={panel} aria-label="전체 메뉴" className="fixed inset-x-0 bottom-0 top-16 overflow-y-auto bg-white px-4 pb-10 md:top-[77px] lg:hidden">
          {/* 11-22 좁은 화면(360px 미만)은 머리글 돋보기를 빼므로 메뉴 맨 위에 통합검색을 둔다 */}
          <Link href="/search" className="mt-4 flex h-12 items-center gap-2 rounded-md border border-[#d9dee5] px-4 text-[15px] text-[#5b6370] min-[360px]:hidden">
            <Search size={18} aria-hidden /> 통합검색
          </Link>
          {classicMenu.map((m) => (
            <section key={m.label} className="border-b border-[#e6e9ee] py-4">
              {m.items.length > 0 ? (
                <p className="text-[18px] font-[800] tracking-[-0.02em] text-[#15171c]">{m.label}</p>
              ) : (
                <Link href={m.href} aria-current={pathname === m.href ? "page" : undefined} className="text-[18px] font-[800] tracking-[-0.02em] text-[#15171c]">
                  {m.label}
                </Link>
              )}
              {m.items.length > 0 && (
                <ul className="mt-2 grid grid-cols-2 gap-x-4" role="list">
                  {m.items.map((i) => (
                    <li key={i.label}>
                      <NavLink href={i.href} aria-current={pathname === i.href ? "page" : undefined} className="block py-2 text-[15px] text-[#3d4450]">
                        {i.label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
          <section className="border-b border-[#e6e9ee] py-4">
            <p className="text-[15px] font-bold text-[#5b6370]">다른 서비스</p>
            <ul className="mt-2 grid grid-cols-2 gap-x-4" role="list">
              {sideServices.map((s) => (
                <li key={s.href}>
                  <NavLink href={s.href} className="block py-2 text-[17px] font-[800] text-[#15171c]">
                    {s.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </section>
          <ul className="mt-4 grid grid-cols-2 gap-x-4" role="list">
            {subMenu.map((i) => (
              <li key={i.href}>
                <NavLink href={i.href} aria-current={pathname === i.href ? "page" : undefined} className="block py-2 text-[15px] text-[#5b6370]">
                  {i.label}
                </NavLink>
              </li>
            ))}
          </ul>
          <Link href="/contact" className="mt-6 flex h-12 items-center justify-center rounded-md bg-[#256ef4] text-[16px] font-bold text-white">
            상담 신청
          </Link>
          <ThemeToggle withLabel className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-md border border-[#d9dee5] text-[15px] font-bold text-[#15171c]" />
        </nav>
      )}
    </header>
  );
}
