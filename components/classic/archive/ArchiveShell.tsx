import Link from "next/link";
import { ChevronDown, Search } from "lucide-react";
import { docUpdated, topicOf, topics, type Topic, type TreeNode } from "@/data/classic/archive";
import { ReadMark } from "@/components/classic/archive/ReadMark";
import { ReadTracker } from "@/components/classic/archive/ReadTracker";
import { boardBg, eyebrow, ice, wrap } from "@/components/classic/ui";
import { LdScript } from "@/components/seo/JsonLd";
import { ORG_ID, breadcrumbLd, pageCardUrl } from "@/lib/seo";
import { siteUrl } from "@/lib/site";

// 웹 지식 문서 틀. 11-26 찾기 판(/knowledge, WikiBoard)과 한 화면으로 보이게 다시 짰다(사용자 "개판, 찾을 때 편의성이 없다").
// 예전: 왼쪽에 주제 9개가 접힌 나무 목록, 그 위에 통합검색으로 가는 링크 하나. 문서에서 찾기 판으로 돌아가는 길과 옆 문서가 잘 안 보였다.
// 지금:
//  1) 맨 위 띠(판과 같은 바탕): "05 WIKI"(찾기 판으로), 지금 주제, 문서 검색 칸(통합검색 결과로 간다), 주제 버튼 한 줄(전체는 찾기 판).
//  2) 왼쪽: 지금 주제의 문서만, 찾기 판 필터와 같은 묶음 이름으로 묶어 보여 준다(지금 묶음은 펼침). 휴대폰은 접는 상자.
//  3) 가운데 문서, 오른쪽 목차.
// 문서 주소와 구조화 데이터(BreadcrumbList, Article), 읽음 기록은 그대로다.
// 태블릿(손가락 입력, 768 이상)은 머리 메뉴가 고정되지 않으므로 왼쪽 목록과 목차를 위 5칸만 띄운다.
// 11-22 sidebar, breadcrumbs 클래스는 브라우저 읽기 모드(Readability)가 띠, 목록, 목차, 위치 표시를 본문에서 빼게 하는 표시다. 지우지 않는다.

export type Crumb = { href: string; label: string };
export type TocItem = { id: string; label: string };

const flat = (n: TreeNode): TreeNode[] => (n.children ? n.children.flatMap(flat) : n.href ? [n] : []);
const docsOf = (t: Topic) => t.groups.flatMap((g) => g.items.flatMap(flat));

function DocLinks({ items, active }: { items: TreeNode[]; active: string }) {
  return (
    <ul role="list" className="space-y-0.5">
      {items.map((n) => (
        <li key={n.href}>
          <Link
            href={n.href!}
            aria-current={n.href === active ? "page" : undefined}
            className={`flex min-h-11 items-center justify-between gap-2 rounded-lg px-3 py-2 text-[15px] leading-[1.45] lg:min-h-0 lg:text-[14.5px] ${n.href === active ? "bg-[#7aa7ff]/15 font-[800] text-white" : "text-[#aab2bf] hover:bg-white/5 hover:text-white"}`}
          >
            <span className="break-keep">{n.label}</span>
            <ReadMark href={n.href} ver={docUpdated(n.href!)} />
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** 지금 주제의 문서 목록. 묶음이 여럿이면 묶음마다 접고, 지금 문서가 든 묶음만 펼친다 */
function TopicDocs({ topic, active }: { topic: Topic; active: string }) {
  const groups = topic.groups.map((g) => ({ title: g.title, items: g.items.flatMap(flat) })).filter((g) => g.items.length > 0);
  if (groups.length === 1) return <DocLinks items={groups[0].items} active={active} />;
  const hit = groups.findIndex((g) => g.items.some((n) => n.href === active));
  return (
    <div className="space-y-1">
      {groups.map((g, i) => (
        <details key={g.title} open={i === (hit < 0 ? 0 : hit)} className="group/g">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 rounded-lg px-3 text-[14.5px] font-[800] text-white hover:bg-white/5 [&::-webkit-details-marker]:hidden">
            <span className="break-keep">{g.title}</span>
            <span className="flex shrink-0 items-center gap-1.5 text-[13px] font-bold tabular-nums text-[#8a94a6]">
              {g.items.length}
              <ChevronDown size={15} aria-hidden className="transition-transform group-open/g:rotate-180 motion-reduce:transition-none" />
            </span>
          </summary>
          <div className="mb-2 ml-3 border-l border-white/10 pl-1.5">
            <DocLinks items={g.items} active={active} />
          </div>
        </details>
      ))}
    </div>
  );
}

/** 맨 위 띠: 찾기 판으로 가는 길, 지금 주제, 검색, 주제 버튼 */
function WikiBar({ topic, last }: { topic?: Topic; last?: Crumb }) {
  return (
    <div className={`sidebar relative text-white ${boardBg}`}>
      <span aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-b from-transparent to-[#0b0d12]" />
      <div className={`${wrap} relative pb-5 pt-7 md:pb-7 md:pt-10`}>
        <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4">
          <nav aria-label="현재 위치" className="breadcrumbs">
            <ol className={`flex flex-wrap items-center gap-x-3 gap-y-1 ${eyebrow}`}>
              <li className="flex items-center">
                <Link href="/knowledge" className="-my-3 flex items-center gap-3 py-3 hover:text-white">
                  <span>05</span>
                  <span aria-hidden className="h-px w-10 bg-current" />
                  WIKI
                  <span className="sr-only">웹 지식</span>
                </Link>
              </li>
              {topic ? (
                <li className="flex items-center gap-3">
                  <span aria-hidden className="text-white/30">/</span>
                  <Link href={`/knowledge/${topic.id}`} aria-current={!last || last.href === `/knowledge/${topic.id}` ? "page" : undefined} className="-my-3 py-3 tracking-[0.02em] hover:text-white">
                    {topic.label}
                  </Link>
                </li>
              ) : null}
              {last && last.href !== "/knowledge" && last.href !== `/knowledge/${topic?.id}` ? (
                <li className="sr-only">
                  <span aria-current="page">{last.label}</span>
                </li>
              ) : null}
            </ol>
          </nav>
          {/* 검색은 통합검색 결과 화면으로 보낸다(웹 지식, 운영 노트, 용어 묶음이 따로 나온다). keep-light: 흰 칸 안 글자색을 그대로 둔다 */}
          <form action="/search" method="get" role="search" aria-label="문서 검색" className="keep-light w-full sm:w-[340px]">
            <label className="flex h-12 items-center gap-2.5 rounded-full bg-white pl-4 pr-1 text-[#0b0d12]">
              <Search size={18} aria-hidden className="shrink-0 text-[#5b6370]" />
              <span className="sr-only">검색어</span>
              <input type="search" name="q" required placeholder="문서 검색" autoComplete="off" className="h-full min-w-0 flex-1 bg-transparent text-[16px] outline-none placeholder:text-[#5b6370] [&::-webkit-search-cancel-button]:hidden" />
              <button type="submit" className="h-10 shrink-0 rounded-full bg-[#256ef4] px-4 text-[14px] font-bold text-white hover:bg-[#0b50d0]">
                검색
              </button>
            </label>
          </form>
        </div>
        <nav aria-label="웹 지식 주제" className="-mx-4 mt-5 overflow-x-auto px-4 [scrollbar-width:none] md:mx-0 md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden">
          <ul role="list" className="flex gap-2 md:flex-wrap">
            <li className="shrink-0">
              <Link href="/knowledge" className="inline-flex min-h-11 items-center rounded-full border border-white/20 px-4 text-[15px] font-bold text-[#c9ced6] hover:border-white/90 hover:text-white">
                전체
              </Link>
            </li>
            {topics().map((t) => (
              <li key={t.id} className="shrink-0">
                <Link
                  href={`/knowledge/${t.id}`}
                  className={`inline-flex min-h-11 items-center rounded-full border px-4 text-[15px] font-bold ${t.id === topic?.id ? "border-[#7aa7ff] bg-[#7aa7ff]/15 text-white" : "border-white/20 text-[#c9ced6] hover:border-white/90 hover:text-white"}`}
                >
                  {t.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}

export type DocLd = { title: string; description: string; published?: string; modified: string; image?: string };

export function ArchiveShell({ section, active, crumbs, toc, article, children }: { section?: string; active: string; crumbs: Crumb[]; toc?: TocItem[]; article?: DocLd; children: React.ReactNode }) {
  const all = topics();
  const topic = all.find((t) => t.id === section) ?? topicOf(active);
  const last = crumbs[crumbs.length - 1];
  const isDoc = active !== "/knowledge" && !all.some((t) => active === `/knowledge/${t.id}`);
  const trail: Crumb[] = [{ href: "/knowledge", label: "웹 지식" }];
  if (topic && active !== `/knowledge/${topic.id}`) trail.push({ href: `/knowledge/${topic.id}`, label: topic.label });
  if (last && last.href !== "/knowledge") trail.push(last);
  // 왼쪽 목록은 문서 화면에서만(주제 화면은 본문이 곧 그 목록이다)
  const rail = isDoc && topic ? topic : undefined;
  const count = rail ? docsOf(rail).length : 0;
  const hasToc = !!toc && toc.length > 0;
  const cols = rail ? (hasToc ? "lg:grid-cols-[250px_minmax(0,1fr)] xl:grid-cols-[250px_minmax(0,1fr)_190px]" : "lg:grid-cols-[250px_minmax(0,1fr)]") : hasToc ? "xl:grid-cols-[minmax(0,1fr)_190px]" : "";
  return (
    <>
      <WikiBar topic={topic} last={last} />
      <div className={`${wrap} grid lg:min-h-[calc(100vh-4.75rem)] ${cols}`}>
        {rail ? (
          <aside className="sidebar hidden border-r border-white/10 pb-12 pr-4 pt-8 lg:block">
            <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto overscroll-contain pr-1 [@media(pointer:coarse)_and_(min-width:768px)]:top-5 [@media(pointer:coarse)_and_(min-width:768px)]:max-h-[calc(100vh-2.5rem)]">
              <nav aria-label={`${rail.label} 문서`}>
                <Link href={`/knowledge/${rail.id}`} className="mb-2 flex items-baseline justify-between gap-2 px-3 text-[13px] font-bold text-[#7aa7ff] hover:text-white">
                  <span>{rail.label} 문서</span>
                  <span className="tabular-nums">{count}개</span>
                </Link>
                <TopicDocs topic={rail} active={active} />
              </nav>
            </div>
          </aside>
        ) : null}

        <div id="archive-main" className={`min-w-0 pb-20 pt-6 md:pt-8 ${rail ? "lg:pl-10" : ""} ${hasToc ? "xl:pr-8" : ""}`}>
          {/* 11-22 웹 지식 문서는 모두 검색엔진에 위치(BreadcrumbList), 글(Article)로 알린다 */}
          <LdScript data={breadcrumbLd(trail.map((c) => ({ name: c.label, path: c.href })))} />
          {article ? (
            <LdScript data={{ "@context": "https://schema.org", "@type": "Article", headline: article.title, description: article.description, datePublished: article.published ?? "2026-11-21", dateModified: article.modified, author: { "@id": ORG_ID }, publisher: { "@id": ORG_ID }, mainEntityOfPage: `${siteUrl}${active}`, inLanguage: "ko", ...((article.image ?? pageCardUrl(active)) ? { image: [`${siteUrl}${article.image ?? pageCardUrl(active)}`] } : {}) }} />
          ) : null}
          {/* 휴대폰, 태블릿: 같은 주제 문서 목록을 접는 상자로 */}
          {rail ? (
            <details className="sidebar group/m mb-6 rounded-[16px] border border-white/15 bg-[#121722] lg:hidden">
              <summary className="flex min-h-[52px] cursor-pointer list-none items-center justify-between gap-3 px-4 text-[15px] font-[800] text-white [&::-webkit-details-marker]:hidden">
                <span>{rail.label} 문서</span>
                <span className="flex items-center gap-1.5 text-[14px] font-bold tabular-nums text-[#7aa7ff]">
                  {count}개
                  <ChevronDown size={16} aria-hidden className="transition-transform group-open/m:rotate-180 motion-reduce:transition-none" />
                </span>
              </summary>
              <nav aria-label={`${rail.label} 문서`} className="border-t border-white/10 px-2 py-2">
                <TopicDocs topic={rail} active={active} />
              </nav>
            </details>
          ) : null}
          {isDoc ? <ReadTracker href={active} ver={docUpdated(active) ?? article?.modified} /> : null}
          {/* 11-22 글 문서(article 값이 있는 페이지)는 본문을 article로 감싸 브라우저 읽기 모드가 본문을 찾게 한다. 본문 안 클래스에 scroll, comment, sidebar 같은 단어를 쓰면 Safari가 그 요소를 버린다 */}
          {article ? <article>{children}</article> : children}
        </div>

        {hasToc ? (
          <aside className="sidebar hidden pl-2 pt-8 xl:block">
            <div className="sticky top-24 [@media(pointer:coarse)_and_(min-width:768px)]:top-5">
              <p className="mb-2.5 text-[13px] font-bold text-[#7aa7ff]">이 페이지</p>
              <ul role="list">
                {toc!.map((t) => (
                  <li key={t.id}>
                    <a href={`#${t.id}`} className="block border-l-2 border-white/10 py-1.5 pl-3 text-[14px] leading-[1.45] text-[#aab2bf] hover:border-[#7aa7ff] hover:text-white">
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

/** 문서 머리: 제목(판 머리처럼 앞 낱말 얼음색), 정보 줄, 라벨, 요약 */
export function DocHead({ title, meta, lead, labels, leadLabel = "요약" }: { title: string; meta?: [string, string][]; lead?: string; labels?: string[]; leadLabel?: string }) {
  const sp = title.indexOf(" ");
  const head = sp > 0 ? title.slice(0, sp + 1) : title;
  return (
    <header className="pb-2">
      <h1 className="break-keep text-[30px] font-[800] leading-[1.22] tracking-[-0.045em] text-white md:text-[42px]">
        <span className={ice}>{head}</span>
        {title.slice(head.length)}
      </h1>
      {meta ? (
        <p className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-[14px] text-[#aab2bf]">
          {meta.map(([k, v], i) => (
            <span key={k}>
              {k} <b className="font-bold text-white">{v}</b>
              {i < meta.length - 1 ? <span className="sr-only">, </span> : null}
            </span>
          ))}
        </p>
      ) : null}
      {labels && labels.length ? (
        <ul role="list" aria-label="라벨" className="mt-3 flex flex-wrap gap-1.5">
          {labels.map((l) => (
            <li key={l} className="rounded-full border border-white/20 px-2.5 py-0.5 text-[13px] text-[#c9ced6]">{l}</li>
          ))}
        </ul>
      ) : null}
      {lead ? (
        <div className="mt-5 max-w-[820px] rounded-[16px] bg-[#121722] px-5 py-4">
          <p className="text-[13px] font-[800] text-[#7aa7ff]">{leadLabel}</p>
          <p className="mt-1 text-[16px] leading-[1.7] text-[#c9ced6]">{lead}</p>
        </div>
      ) : null}
    </header>
  );
}

export const docH2 = "mt-12 anchor-24 border-b border-white/15 pb-2 text-[22px] font-[800] tracking-[-0.035em] text-white md:text-[24px]";

/** 인수 시 확인 사항(우리 색깔). 확인할 때 하나씩 지워 가는 체크 칸 모양 */
export function TakeoverBox({ sub, items }: { sub: string; items: { b: string; t: string }[] }) {
  return (
    <section id="take" aria-labelledby="take-h" className="mt-12 anchor-24">
      <h2 id="take-h" className="anchor-24 border-b border-white/15 pb-2 text-[22px] font-[800] tracking-[-0.035em] text-white md:text-[24px]">인수 시 확인 사항</h2>
      <p className="mt-2 text-[14px] text-[#aab2bf]">{sub}</p>
      <ul role="list" className="mt-3">
        {items.map((x) => (
          <li key={x.b} className="grid grid-cols-[26px_minmax(0,1fr)] gap-1.5 border-b border-white/10 py-3 last:border-b-0">
            <span aria-hidden className="mt-1 h-[16px] w-[16px] rounded-[3px] border-[1.5px] border-[#8a93a1]" />
            <div>
              <p className="text-[15.5px] font-bold text-white">{x.b}</p>
              <p className="mt-0.5 text-[14.5px] leading-[1.6] text-[#aab2bf]">{x.t}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
