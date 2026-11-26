import Link from "next/link";
import { ChevronDown, List } from "lucide-react";
import { docUpdated, kindOf, relatedOf, topicOf, topics } from "@/data/classic/archive";
import { ReadTracker } from "@/components/classic/archive/ReadTracker";
import { eyebrow, ice, wrap } from "@/components/classic/ui";
import { LdScript } from "@/components/seo/JsonLd";
import { ORG_ID, breadcrumbLd, pageCardUrl } from "@/lib/seo";
import { siteUrl } from "@/lib/site";

// 위키 문서 틀. 11-26 읽는 화면으로 다시 짰다(사용자 "참조가 덕지덕지, 연관도 덕지덕지, 집중해서 보고자 하는 걸 잘 보이게").
// 예전: 본문 위에 검색 칸과 주제 버튼 10개, 왼쪽에 같은 주제 문서 목록(11~49개), 오른쪽 목차, 아래 관련 문서 6개. 출처는 그림 아래, 사례 칸, 맨 아래에 따로.
// 지금: 가운데 한 단(본문 폭 760px)에 위에서 아래로
//  1) 위치 한 줄("05 WIKI / 주제")과 목록으로 가는 링크
//  2) 제목, 정보 한 줄, 요약
//  3) 본문
//  4) 참고 자료 한 칸(네 개부터는 접어 두고 개수만), 관련 문서 세 개까지, 목록
// 목차는 제목이 넷 이상인 문서에만 둔다. 넓은 화면은 오른쪽 여백에 작게, 좁은 화면은 요약 아래 접는 줄 하나.
// 찾기(검색, 주제, 묶음)는 목록(/knowledge, WikiBoard)이 맡는다. 같은 주제의 문서 목록은 위치 줄의 주제 이름을 누르면 나온다.
// 문서 주소와 구조화 데이터(BreadcrumbList, Article), 읽음 기록은 그대로다.
// 11-22 sidebar, breadcrumbs 클래스는 브라우저 읽기 모드(Readability)와 인쇄 화면이 위치 줄, 목차, 관련 문서를 본문에서 빼게 하는 표시다. 지우지 않는다.

export type Crumb = { href: string; label: string };
export type TocItem = { id: string; label: string };
export type Src = { label: string; href?: string; note?: string };
export type DocLd = { title: string; description: string; published?: string; modified: string; image?: string };
export type DocHeadProps = { title: string; meta?: [string, string][]; lead?: string };

/** 목차를 두는 기준: 본문 제목이 이 수 이상일 때만 */
const TOC_MIN = 4;
/** 참고 자료를 접는 기준: 이 수를 넘으면 접어 두고 개수만 보인다 */
const REFS_OPEN = 3;

const dots = (v: string) => (/^\d{4}-\d{2}-\d{2}$/.test(v) ? v.replaceAll("-", ".") : v);

/** 문서 머리: 제목(판 머리처럼 앞 낱말 얼음색), 정보 한 줄, 요약 */
function DocHead({ title, meta, lead }: DocHeadProps) {
  const sp = title.indexOf(" ");
  const head = sp > 0 ? title.slice(0, sp + 1) : title;
  return (
    <header>
      <h1 className="break-keep text-[30px] font-[800] leading-[1.25] tracking-[-0.045em] text-white md:text-[40px]">
        <span className={ice}>{head}</span>
        {title.slice(head.length)}
      </h1>
      {meta && meta.length ? (
        <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[14px] text-[#aab2bf] sm:gap-x-3">
          {meta.map(([k, v], i) => (
            <span key={k} className="inline-flex items-center gap-x-3">
              {i > 0 ? <span aria-hidden className="hidden h-3 w-px bg-white/20 sm:block" /> : null}
              <span>
                {k} <b className="font-bold tabular-nums text-[#c9ced6]">{dots(v)}</b>
                {i < meta.length - 1 ? <span className="sr-only">, </span> : null}
              </span>
            </span>
          ))}
        </p>
      ) : null}
      {lead ? <p className="mt-6 break-keep text-[17.5px] leading-[1.75] text-white md:text-[19px]">{lead}</p> : null}
    </header>
  );
}

/** 참고 자료: 본문에서 쓴 출처를 한곳에. 네 개부터는 접어 두고 개수만 보인다 */
function Refs({ items }: { items: Src[] }) {
  const list = (
    <ol className="list-decimal space-y-2.5 pl-6 text-[14.5px] leading-[1.65] text-[#aab2bf] marker:tabular-nums marker:text-[#8a94a6]">
      {items.map((s, i) => (
        <li key={i} className="break-words pl-1">
          {s.href ? (
            <a href={s.href} target="_blank" rel="noopener noreferrer" className="text-[#c9ced6] underline decoration-white/30 underline-offset-4 hover:text-white hover:decoration-white/90">
              {s.label}
            </a>
          ) : (
            s.label
          )}
          {s.note ? `: ${s.note}` : null}
        </li>
      ))}
    </ol>
  );
  const title = (
    <h2 id="src-h" className="text-[16px] font-[800] tracking-[-0.02em] text-white">
      참고 자료 <span className="ml-1 font-bold tabular-nums text-[#aab2bf]">{items.length}</span>
    </h2>
  );
  return (
    <section id="src" aria-labelledby="src-h" className="anchor-24 mt-16 border-t border-white/12">
      {items.length > REFS_OPEN ? (
        <details className="group/refs">
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 [&::-webkit-details-marker]:hidden">
            {title}
            <ChevronDown size={18} aria-hidden className="shrink-0 text-[#aab2bf] transition-transform group-open/refs:rotate-180 motion-reduce:transition-none" />
          </summary>
          <div className="pb-2">{list}</div>
        </details>
      ) : (
        <>
          <div className="flex min-h-14 items-center">{title}</div>
          {list}
        </>
      )}
    </section>
  );
}

/** 관련 문서: 같은 묶음에서 가까운 문서 세 개까지. 나머지는 목록에서 찾는다 */
function Related({ active }: { active: string }) {
  const list = relatedOf(active, 3);
  if (!list.length) return null;
  return (
    <nav id="rel" aria-labelledby="rel-h" className="sidebar anchor-24 mt-12">
      <h2 id="rel-h" className="text-[16px] font-[800] tracking-[-0.02em] text-white">관련 문서</h2>
      <ul role="list" className="mt-4 border-t border-white/12">
        {list.map((d) => (
          <li key={d.href} className="border-b border-white/10">
            <Link href={d.href!} className="group flex items-baseline justify-between gap-5 py-4">
              <span className="break-keep text-[16.5px] font-bold leading-[1.45] text-white underline-offset-4 group-hover:underline">{d.label}</span>
              <span className="shrink-0 text-[13px] text-[#8a94a6]">{kindOf(d.href)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

const tocLink = "block border-l border-white/12 py-1.5 pl-3.5 text-[13.5px] leading-[1.5] text-[#aab2bf] hover:border-white/70 hover:text-white";

export function ArchiveShell({
  section,
  active,
  crumbs,
  head,
  toc,
  sources,
  related = true,
  article,
  children,
}: {
  section?: string;
  active: string;
  crumbs: Crumb[];
  head: DocHeadProps;
  toc?: TocItem[];
  /** 참고 자료(출처). 본문 맨 아래 한 칸에 모아 보인다 */
  sources?: Src[];
  /** 관련 문서를 아래에 둘지(목록 구실을 하는 화면은 끈다) */
  related?: boolean;
  /** 글 문서면 Article 구조화 데이터를 넣고 본문을 article로 감싼다. true는 구조화 데이터를 페이지가 따로 넣을 때 */
  article?: DocLd | true;
  children: React.ReactNode;
}) {
  const all = topics();
  const topic = all.find((t) => t.id === section) ?? topicOf(active);
  const last = crumbs[crumbs.length - 1];
  const isDoc = active !== "/knowledge" && !all.some((t) => active === `/knowledge/${t.id}`);
  const trail: Crumb[] = [{ href: "/knowledge", label: "위키" }];
  if (topic && active !== `/knowledge/${topic.id}`) trail.push({ href: `/knowledge/${topic.id}`, label: topic.label });
  if (last && last.href !== "/knowledge") trail.push(last);
  const hasToc = !!toc && toc.length >= TOC_MIN;
  const ld = article && article !== true ? article : undefined;
  // 글 문서의 정보 줄은 주제부터(페이지가 이미 적었으면 그대로)
  const meta: [string, string][] = article && topic && !head.meta?.some(([k]) => k === "주제") ? [["주제", topic.label], ...(head.meta ?? [])] : (head.meta ?? []);
  const body = (
    <>
      <DocHead title={head.title} meta={meta} lead={head.lead} />
      {hasToc ? (
        <details className="sidebar group/toc mt-7 border-y border-white/12 xl:hidden">
          <summary className="flex min-h-[52px] cursor-pointer list-none items-center justify-between gap-3 text-[15px] font-bold text-white [&::-webkit-details-marker]:hidden">
            목차
            <ChevronDown size={18} aria-hidden className="shrink-0 text-[#aab2bf] transition-transform group-open/toc:rotate-180 motion-reduce:transition-none" />
          </summary>
          <nav aria-label="목차" className="pb-3">
            <ol role="list">
              {toc!.map((t) => (
                <li key={t.id}>
                  <a href={`#${t.id}`} className="flex min-h-11 items-center text-[15px] leading-[1.45] text-[#c9ced6] hover:text-white">
                    {t.label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </details>
      ) : null}
      {children}
      {sources && sources.length ? <Refs items={sources} /> : null}
    </>
  );
  return (
    <div className={`${wrap} min-h-[70vh] xl:grid xl:grid-cols-[minmax(0,1fr)_minmax(0,760px)_minmax(0,1fr)]`}>
      <div id="archive-main" className="mx-auto w-full min-w-0 max-w-[760px] pb-20 pt-6 md:pb-28 md:pt-9 xl:col-start-2">
        {/* 위치 한 줄과 목록으로 가는 링크 */}
        <div className="sidebar mb-8 flex items-center justify-between gap-4 md:mb-10">
          <nav aria-label="현재 위치" className="breadcrumbs min-w-0">
            <ol className={`flex flex-wrap items-center gap-x-2.5 gap-y-1 sm:gap-x-3 ${eyebrow}`}>
              <li className="flex items-center">
                <Link href="/knowledge" className="-my-3 flex items-center gap-2.5 py-3 hover:text-white sm:gap-3">
                  <span>05</span>
                  <span aria-hidden className="h-px w-6 bg-current sm:w-10" />
                  WIKI
                  <span className="sr-only">위키</span>
                </Link>
              </li>
              {topic ? (
                <li className="flex items-center gap-2.5 sm:gap-3">
                  <span aria-hidden className="text-white/30">/</span>
                  <Link href={`/knowledge/${topic.id}`} aria-current={active === `/knowledge/${topic.id}` ? "page" : undefined} className="-my-3 py-3 tracking-[0.02em] hover:text-white">
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
          <Link href="/knowledge" className="-my-3 inline-flex min-h-11 shrink-0 items-center gap-1.5 text-[14px] font-bold text-[#c9ced6] hover:text-white">
            <List size={16} aria-hidden />
            목록
          </Link>
        </div>

        {/* 11-22 위키 문서는 모두 검색엔진에 위치(BreadcrumbList), 글(Article)로 알린다 */}
        <LdScript data={breadcrumbLd(trail.map((c) => ({ name: c.label, path: c.href })))} />
        {ld ? (
          <LdScript data={{ "@context": "https://schema.org", "@type": "Article", headline: ld.title, description: ld.description, datePublished: ld.published ?? "2026-11-21", dateModified: ld.modified, author: { "@id": ORG_ID }, publisher: { "@id": ORG_ID }, mainEntityOfPage: `${siteUrl}${active}`, inLanguage: "ko", ...((ld.image ?? pageCardUrl(active)) ? { image: [`${siteUrl}${ld.image ?? pageCardUrl(active)}`] } : {}) }} />
        ) : null}
        {isDoc ? <ReadTracker href={active} ver={docUpdated(active) ?? ld?.modified} /> : null}
        {/* 11-22 글 문서는 본문을 article로 감싸 브라우저 읽기 모드가 본문을 찾게 한다. 본문 안 클래스에 scroll, comment, sidebar 같은 단어를 쓰면 Safari가 그 요소를 버린다 */}
        {article ? <article>{body}</article> : body}

        {isDoc && related ? <Related active={active} /> : null}
        {isDoc ? (
          <p className="sidebar mt-12">
            <Link href="/knowledge" className="inline-flex min-h-[48px] items-center gap-2 rounded-full border border-white/30 px-6 text-[15px] font-bold text-white transition-colors hover:border-white/90">
              <List size={16} aria-hidden />
              목록
            </Link>
          </p>
        ) : null}
      </div>

      {hasToc ? (
        <aside aria-label="목차" className="sidebar hidden pl-10 pt-[104px] xl:block">
          <div className="sticky top-28 max-h-[calc(100vh-9rem)] w-[180px] overflow-y-auto overscroll-contain [@media(pointer:coarse)_and_(min-width:768px)]:top-8">
            <p className="mb-3 text-[13px] font-bold text-[#c9ced6]">목차</p>
            <ol role="list">
              {toc!.map((t) => (
                <li key={t.id}>
                  <a href={`#${t.id}`} className={tocLink}>
                    {t.label}
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </aside>
      ) : null}
    </div>
  );
}

/** 본문 제목(h2). 문서 종류가 달라도 같은 크기, 같은 간격 */
export const docH2Base = "anchor-24 break-keep text-[22px] font-[800] leading-[1.4] tracking-[-0.035em] text-white md:text-[25px]";
export const docH2 = `mt-14 ${docH2Base}`;

/** 인수 시 확인 사항(우리 색깔). 확인할 때 하나씩 지워 가는 체크 칸 모양 */
export function TakeoverBox({ sub, items }: { sub: string; items: { b: string; t: string }[] }) {
  return (
    <section id="take" aria-labelledby="take-h" className="anchor-24">
      <h2 id="take-h" className={docH2}>인수 시 확인 사항</h2>
      <p className="mt-2 text-[14.5px] text-[#aab2bf]">{sub}</p>
      <ul role="list" className="mt-4 border-t border-white/12">
        {items.map((x) => (
          <li key={x.b} className="grid grid-cols-[26px_minmax(0,1fr)] gap-1.5 border-b border-white/10 py-3.5">
            <span aria-hidden className="mt-1 h-[16px] w-[16px] rounded-[3px] border-[1.5px] border-[#8a93a1]" />
            <div>
              <p className="text-[16px] font-bold text-white">{x.b}</p>
              <p className="mt-0.5 text-[15px] leading-[1.65] text-[#aab2bf]">{x.t}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
