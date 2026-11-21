import Link from "next/link";
import { ChevronDown, ChevronRight, Home } from "lucide-react";
import { archiveTree, sections, type TreeNode } from "@/data/classic/archive";

// 아카이브 공용 틀(11-21). 사이트 머리글 아래에 분류 탭 줄, 왼쪽 분류 트리, 가운데 본문, 오른쪽 목차.
// 휴대폰은 트리를 접은 상자 하나로 위에 둔다.

export type Crumb = { href: string; label: string };
export type TocItem = { id: string; label: string };

function TreeLinks({ items, active }: { items: TreeNode[]; active: string }) {
  return (
    <ul role="list" className="space-y-0.5">
      {items.map((n) => (
        <li key={n.label}>
          {n.href ? (
            <Link
              href={n.href}
              aria-current={n.href === active ? "page" : undefined}
              className={`flex items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-[14.5px] leading-[1.45] ${n.href === active ? "bg-[#eef3ff] font-[800] text-[#256ef4]" : "text-[#3d4450] hover:bg-[#f4f6f9]"}`}
            >
              <span>{n.label}</span>
              {n.count ? <span className="text-[12px] font-semibold text-[#8a93a1]">{n.count}</span> : null}
            </Link>
          ) : (
            <p className="flex items-center justify-between px-2.5 py-1.5 text-[14.5px] font-bold text-[#15171c]">
              <span>{n.label}</span>
              {n.count ? <span className="text-[12px] font-semibold text-[#8a93a1]">{n.count}</span> : null}
            </p>
          )}
          {n.children ? (
            <div className="mb-1 ml-3 border-l border-[#e6e9ee] pl-1.5">
              <TreeLinks items={n.children} active={active} />
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

function Tree({ section, active }: { section: string; active: string }) {
  const tree = archiveTree().find((t) => t.section.id === section);
  return (
    <nav aria-label="아카이브 분류">
      <Link href="/archive" aria-current={active === "/archive" ? "page" : undefined} className={`block rounded-md px-2.5 py-1.5 text-[14.5px] ${active === "/archive" ? "bg-[#eef3ff] font-[800] text-[#256ef4]" : "font-bold text-[#3d4450] hover:bg-[#f4f6f9]"}`}>
        아카이브 처음
      </Link>
      {tree ? (
        <>
          <Link href={tree.section.href} aria-current={active === tree.section.href ? "page" : undefined} className={`mt-1 block rounded-md px-2.5 py-1.5 text-[14.5px] ${active === tree.section.href ? "bg-[#eef3ff] font-[800] text-[#256ef4]" : "font-bold text-[#3d4450] hover:bg-[#f4f6f9]"}`}>
            {tree.section.label} 전체
          </Link>
          {tree.groups.map((g) => (
            <div key={g.title} className="mt-5">
              <p className="mb-1.5 px-2.5 text-[12px] font-[800] tracking-[0.02em] text-[#8a93a1]">{g.title}</p>
              <TreeLinks items={g.items} active={active} />
            </div>
          ))}
        </>
      ) : (
        <ul role="list" className="mt-4 space-y-0.5">
          {sections.map((s) => (
            <li key={s.id}>
              <Link href={s.href} className="block rounded-md px-2.5 py-1.5 text-[14.5px] text-[#3d4450] hover:bg-[#f4f6f9]">
                {s.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}

export function ArchiveShell({ section, active, crumbs, toc, children }: { section: string; active: string; crumbs: Crumb[]; toc?: TocItem[]; children: React.ReactNode }) {
  return (
    <>
      {/* 분류 탭 줄 */}
      <div className="border-b border-[#e6e9ee] bg-white">
        <ul role="list" className="mx-auto flex w-full max-w-[1248px] gap-6 overflow-x-auto px-4 md:px-6">
          {[{ id: "home", label: "아카이브", href: "/archive" }, ...sections].map((s) => {
            const on = s.id === section || (s.id === "home" && section === "home");
            return (
              <li key={s.id} className="shrink-0">
                <Link href={s.href} aria-current={on ? "true" : undefined} className={`block border-b-2 py-3.5 text-[15px] font-bold ${on ? "border-[#256ef4] text-[#256ef4]" : "border-transparent text-[#3d4450] hover:text-[#15171c]"}`}>
                  {s.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mx-auto grid w-full max-w-[1248px] md:px-6 lg:grid-cols-[230px_minmax(0,1fr)] xl:grid-cols-[230px_minmax(0,1fr)_180px]">
        <aside className="hidden border-r border-[#e6e9ee] pb-12 pr-3 pt-6 lg:block">
          <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-1">
            <Tree section={section} active={active} />
          </div>
        </aside>

        <main id="archive-main" className="min-w-0 px-4 pb-20 pt-6 md:px-0 md:pt-8 lg:pl-12 xl:pr-10">
          <details className="mb-5 rounded-md border border-[#d9dee5] lg:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between px-3.5 py-3 text-[14.5px] font-bold text-[#3d4450]">
              분류 보기 <ChevronDown size={16} aria-hidden />
            </summary>
            <div className="border-t border-[#e6e9ee] px-2 pb-3 pt-2">
              <Tree section={section} active={active} />
            </div>
          </details>

          <nav aria-label="현재 위치">
            <ol className="flex flex-wrap items-center gap-1.5 text-[13.5px] text-[#5b6370]">
              <li>
                <Link href="/" aria-label="처음" className="-m-2 inline-flex p-2 hover:text-[#15171c]">
                  <Home size={14} aria-hidden />
                </Link>
              </li>
              {crumbs.map((c, i) => (
                <li key={c.href} className="inline-flex items-center gap-1.5">
                  <ChevronRight size={13} aria-hidden />
                  <Link href={c.href} aria-current={i === crumbs.length - 1 ? "page" : undefined} className={i === crumbs.length - 1 ? "font-bold text-[#15171c]" : "hover:text-[#15171c]"}>
                    {c.label}
                  </Link>
                </li>
              ))}
            </ol>
          </nav>
          {children}
        </main>

        {toc && toc.length > 0 ? (
          <aside className="hidden px-5 pt-10 xl:block">
            <div className="sticky top-24">
              <p className="mb-2.5 text-[12px] font-[800] text-[#8a93a1]">이 페이지</p>
              <ul role="list">
                {toc.map((t) => (
                  <li key={t.id}>
                    <a href={`#${t.id}`} className="block border-l-2 border-[#e6e9ee] py-1.5 pl-3 text-[13.5px] text-[#5b6370] hover:border-[#256ef4] hover:text-[#256ef4]">
                      {t.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        ) : null}
      </div>
    </>
  );
}

/** 문서 제목과 정보 줄 */
export function DocHead({ title, meta, lead }: { title: string; meta?: [string, string][]; lead?: string }) {
  return (
    <header className="border-b border-[#e6e9ee] pb-6">
      <h1 className="mt-4 text-[32px] font-[800] leading-[1.2] tracking-[-0.045em] md:text-[42px]">{title}</h1>
      {meta ? (
        <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[13.5px] text-[#5b6370]">
          {meta.map(([k, v]) => (
            <span key={k}>
              {k} <b className="font-bold text-[#15171c]">{v}</b>
            </span>
          ))}
        </p>
      ) : null}
      {lead ? <p className="mt-5 max-w-[760px] text-[17px] leading-[1.7] text-[#2b313b] md:text-[18px]">{lead}</p> : null}
    </header>
  );
}

export const docH2 = "mt-12 scroll-mt-24 text-[24px] font-[800] tracking-[-0.035em] md:text-[26px]";
