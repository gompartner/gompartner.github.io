import Link from "next/link";
import { ChevronDown, ChevronRight, Home, Search } from "lucide-react";
import { topicOf, topics, type TreeNode } from "@/data/classic/archive";

// 웹 지식 공용 틀(11-21 컨플루언스식): 사이트 머리글 아래, 왼쪽 공간 이름과 주제 페이지 트리, 가운데 문서, 오른쪽 목차.
// 위치 표시는 "웹 지식 > 주제 > 문서"로 자동으로 만든다(주제는 트리에서 찾음). 색과 글꼴은 사이트 톤 그대로.

export type Crumb = { href: string; label: string };
export type TocItem = { id: string; label: string };

function TreeLinks({ items, active }: { items: TreeNode[]; active: string }) {
  return (
    <ul role="list" className="space-y-0.5">
      {items.map((n) => (
        <li key={n.label + (n.href ?? "")}>
          {n.href ? (
            <Link
              href={n.href}
              aria-current={n.href === active ? "page" : undefined}
              className={`flex items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-[14px] leading-[1.45] ${n.href === active ? "bg-[#eef3ff] font-[800] text-[#256ef4]" : "text-[#3d4450] hover:bg-[#eef1f5]"}`}
            >
              <span>{n.label}</span>
              {n.count ? <span className="text-[12px] font-semibold text-[#8a93a1]">{n.count}</span> : null}
            </Link>
          ) : (
            <p className="flex items-center justify-between px-2.5 py-1.5 text-[14px] font-bold text-[#15171c]">
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

function Tree({ topicId, active }: { topicId?: string; active: string }) {
  return (
    <nav aria-label="웹 지식 페이지 트리">
      <Link href="/search" className="mx-1 mb-3 flex items-center gap-2 rounded-md border border-[#d9dee5] bg-white px-2.5 py-2 text-[13px] text-[#8a93a1] hover:border-[#256ef4]">
        <Search size={14} aria-hidden /> 이 공간에서 찾기
      </Link>
      <Link href="/knowledge" aria-current={active === "/knowledge" ? "page" : undefined} className={`block rounded-md px-2.5 py-1.5 text-[14px] ${active === "/knowledge" ? "bg-[#eef3ff] font-[800] text-[#256ef4]" : "font-bold text-[#3d4450] hover:bg-[#eef1f5]"}`}>
        공간 홈
      </Link>
      <p className="mb-1.5 mt-4 px-2.5 text-[12px] font-[800] tracking-[0.02em] text-[#8a93a1]">페이지</p>
      <ul role="list" className="space-y-0.5">
        {topics().map((t) => {
          const open = t.id === topicId;
          const href = `/knowledge/${t.id}`;
          return (
            <li key={t.id}>
              <Link
                href={href}
                aria-current={active === href ? "page" : undefined}
                className={`flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[14px] ${active === href ? "bg-[#eef3ff] font-[800] text-[#256ef4]" : open ? "font-[800] text-[#15171c] hover:bg-[#eef1f5]" : "text-[#3d4450] hover:bg-[#eef1f5]"}`}
              >
                {open ? <ChevronDown size={14} aria-hidden className="shrink-0 text-[#8a93a1]" /> : <ChevronRight size={14} aria-hidden className="shrink-0 text-[#8a93a1]" />}
                {t.label}
              </Link>
              {open ? (
                <div className="mb-2 ml-4 mt-1">
                  {t.groups.map((g) => (
                    <div key={g.title} className="mt-2">
                      <p className="mb-1 px-2.5 text-[11.5px] font-[800] text-[#8a93a1]">{g.title}</p>
                      <TreeLinks items={g.items} active={active} />
                    </div>
                  ))}
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function ArchiveShell({ section, active, crumbs, toc, children }: { section?: string; active: string; crumbs: Crumb[]; toc?: TocItem[]; children: React.ReactNode }) {
  const topic = topics().find((t) => t.id === section) ?? topicOf(active);
  const last = crumbs[crumbs.length - 1];
  const trail: Crumb[] = [{ href: "/knowledge", label: "웹 지식" }];
  if (topic && active !== `/knowledge/${topic.id}`) trail.push({ href: `/knowledge/${topic.id}`, label: topic.label });
  if (last && last.href !== "/knowledge") trail.push(last);
  return (
    <div className={`mx-auto grid w-full max-w-[1248px] md:px-6 lg:grid-cols-[250px_minmax(0,1fr)] ${toc && toc.length > 0 ? "xl:grid-cols-[250px_minmax(0,1fr)_180px]" : ""}`}>
      <aside className="hidden border-r border-[#e6e9ee] bg-[#fafbfc] pb-12 pr-3 pt-5 lg:block">
        <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pl-1 pr-1">
          <Tree topicId={topic?.id} active={active} />
        </div>
      </aside>

      <main id="archive-main" className="min-w-0 px-4 pb-20 pt-6 md:px-0 md:pt-8 lg:pl-12 xl:pr-10">
        <details className="mb-5 rounded-md border border-[#d9dee5] lg:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between px-3.5 py-3 text-[14.5px] font-bold text-[#3d4450]">
            웹 지식 페이지 보기 <ChevronDown size={16} aria-hidden />
          </summary>
          <div className="border-t border-[#e6e9ee] px-2 pb-3 pt-3">
            <Tree topicId={topic?.id} active={active} />
          </div>
        </details>

        <nav aria-label="현재 위치">
          <ol className="flex flex-wrap items-center gap-1.5 text-[13.5px] text-[#5b6370]">
            <li>
              <Link href="/" aria-label="처음" className="-m-2 inline-flex p-2 hover:text-[#15171c]">
                <Home size={14} aria-hidden />
              </Link>
            </li>
            {trail.map((c, i) => (
              <li key={c.href} className="inline-flex items-center gap-1.5">
                <ChevronRight size={13} aria-hidden />
                <Link href={c.href} aria-current={i === trail.length - 1 ? "page" : undefined} className={i === trail.length - 1 ? "font-bold text-[#15171c]" : "hover:text-[#15171c]"}>
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
  );
}

/** 문서 머리: 제목, 정보 줄, 라벨, 요약 상자(컨플루언스식) */
export function DocHead({ title, meta, lead, labels, leadLabel = "요약" }: { title: string; meta?: [string, string][]; lead?: string; labels?: string[]; leadLabel?: string }) {
  return (
    <header className="pb-2">
      <h1 className="mt-4 text-[30px] font-[800] leading-[1.25] tracking-[-0.04em] md:text-[38px]">{title}</h1>
      {meta ? (
        <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[13.5px] text-[#5b6370]">
          {meta.map(([k, v]) => (
            <span key={k}>
              {k} <b className="font-bold text-[#15171c]">{v}</b>
            </span>
          ))}
        </p>
      ) : null}
      {labels && labels.length ? (
        <ul role="list" aria-label="라벨" className="mt-3 flex flex-wrap gap-1.5">
          {labels.map((l) => (
            <li key={l} className="rounded bg-[#eef1f5] px-2 py-0.5 text-[12.5px] text-[#3d4450]">{l}</li>
          ))}
        </ul>
      ) : null}
      {lead ? (
        <div className="mt-5 max-w-[820px] rounded-md border-l-4 border-[#256ef4] bg-[#eef3ff] px-4 py-3.5">
          <p className="text-[13px] font-[800] text-[#256ef4]">{leadLabel}</p>
          <p className="mt-0.5 text-[15.5px] leading-[1.7] text-[#2b313b]">{lead}</p>
        </div>
      ) : null}
    </header>
  );
}

export const docH2 = "mt-12 scroll-mt-24 border-b border-[#e6e9ee] pb-2 text-[22px] font-[800] tracking-[-0.035em] md:text-[24px]";

/** 인수 시 확인 사항(우리 색깔). 확인할 때 하나씩 지워 가는 체크 칸 모양 */
export function TakeoverBox({ sub, items }: { sub: string; items: { b: string; t: string }[] }) {
  return (
    <section id="take" aria-labelledby="take-h" className="mt-12 scroll-mt-24">
      <h2 id="take-h" className="scroll-mt-24 border-b border-[#e6e9ee] pb-2 text-[22px] font-[800] tracking-[-0.035em] md:text-[24px]">인수 시 확인 사항</h2>
      <p className="mt-2 text-[14px] text-[#5b6370]">{sub}</p>
      <ul role="list" className="mt-3">
        {items.map((x) => (
          <li key={x.b} className="grid grid-cols-[26px_minmax(0,1fr)] gap-1.5 border-b border-[#eef0f3] py-3 last:border-b-0">
            <span aria-hidden className="mt-1 h-[16px] w-[16px] rounded-[3px] border-[1.5px] border-[#8a93a1]" />
            <div>
              <p className="text-[15.5px] font-bold">{x.b}</p>
              <p className="mt-0.5 text-[14.5px] leading-[1.6] text-[#5b6370]">{x.t}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
