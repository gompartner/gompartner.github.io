import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Guide, GuideBlock } from "@/data/guides";
import { siteUrl } from "@/lib/site";

// 가이드 본문. 웹툰은 굵은 테두리와 노란 머리줄, 클래식은 가는 선과 회색 머리줄.
// 클래식은 사이트 안 링크 앞에 /classic을 붙인다.
type Look = "webtoon" | "classic";

const style = {
  webtoon: {
    h2: "mt-12 text-[22px] font-bold leading-[1.4] md:text-[26px]",
    table: "border-[3px] border-[#1d1d1f] bg-white",
    th: "border-b-[3px] border-[#1d1d1f] bg-[#fff3b0]",
    td: "border-t-2 border-[#1d1d1f]/15",
    link: "inline-flex items-center gap-2 border-[3px] border-[#1d1d1f] bg-white px-4 py-2.5 text-[16px] font-bold shadow-[4px_4px_0_#1d1d1f] transition-[transform,box-shadow] duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#1d1d1f] active:translate-x-1 active:translate-y-1 active:shadow-none motion-reduce:transition-none",
  },
  classic: {
    h2: "mt-12 text-[22px] font-extrabold leading-[1.4] tracking-[-0.03em] md:text-[26px]",
    table: "border-t-2 border-[#15171c]",
    th: "border-b border-[#e6e9ee] bg-[#f6f7f9]",
    td: "border-t border-[#e6e9ee]",
    link: "inline-flex items-center gap-2 rounded-md border border-[#c9cfd8] bg-white px-5 py-3 text-[16px] font-bold text-[#15171c] transition-colors hover:border-[#256ef4] hover:text-[#256ef4]",
  },
};

function Block({ b, look }: { b: GuideBlock; look: Look }) {
  const s = style[look];
  if ("h2" in b) return <h2 className={s.h2}>{b.h2}</h2>;
  if ("p" in b) return <p className="mt-4 text-[17px] leading-[1.75]">{b.p}</p>;
  if ("list" in b)
    return (
      <ul className="mt-4 list-disc space-y-1.5 pl-6 text-[17px] leading-[1.7]">
        {b.list.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
    );
  if ("table" in b)
    return (
      <div className="mt-5">
        <table className={`w-full border-collapse break-keep text-left text-[16px] leading-[1.6] ${s.table}`}>
          <thead>
            <tr>
              {b.table.head.map((h) => (
                <th key={h} scope="col" className={`px-3 py-3 font-bold md:px-4 ${s.th}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {b.table.rows.map((r) => (
              <tr key={r[0]}>
                {r.map((c, i) =>
                  i === 0 ? (
                    <th key={i} scope="row" className={`px-3 py-3 font-bold md:px-4 ${s.td}`}>
                      {c}
                    </th>
                  ) : (
                    <td key={i} className={`px-3 py-3 md:px-4 ${s.td}`}>
                      {c}
                    </td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  const href = look === "classic" && b.link.href.startsWith("/") && !b.link.href.startsWith("/classic") ? `/classic${b.link.href}` : b.link.href;
  return (
    <p className="mt-6">
      <Link href={href} data-gtm-cta={`guide_link_${look}`} className={s.link}>
        {b.link.label}
        <ArrowRight size={18} aria-hidden />
      </Link>
    </p>
  );
}

export function GuideBody({ guide, look }: { guide: Guide; look: Look }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.description,
    datePublished: guide.published,
    dateModified: guide.updated,
    author: { "@type": "Organization", name: "곰파트너", url: siteUrl },
    publisher: { "@type": "Organization", name: "곰파트너", url: siteUrl },
    mainEntityOfPage: `${siteUrl}/guide/${guide.slug}`,
    ...(guide.image ? { image: [`${siteUrl}${guide.image.src}`] } : {}),
  };
  return (
    <article className="max-w-[760px]">
      <p className="text-[15px] text-foreground-tertiary">
        <time dateTime={guide.updated}>{guide.updated.replaceAll("-", ".")}</time> 곰파트너
      </p>
      {guide.image && (
        // 구글 디스커버는 가로 1200px 이상 대표 이미지를 본문과 og:image에서 같이 본다.
        <Image src={guide.image.src} alt={guide.image.alt} width={1200} height={675} priority className="mt-5 h-auto w-full" />
      )}
      {guide.blocks.map((b, i) => (
        <Block key={i} b={b} look={look} />
      ))}
      {guide.sources.length > 0 && (
        <section aria-label="출처" className="mt-14 border-t border-border pt-5 text-[15px] leading-[1.7] text-foreground-secondary">
          <p className="font-bold">출처</p>
          <ul className="mt-1">
            {guide.sources.map((src) => (
              <li key={src.href}>
                <a href={look === "classic" && src.href.startsWith("/") ? `/classic${src.href}` : src.href} className="underline underline-offset-2 hover:text-foreground" {...(src.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                  {src.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </article>
  );
}
