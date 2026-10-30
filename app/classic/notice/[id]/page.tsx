import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHead, btnLine, wrap } from "@/components/classic/ui";
import { SupportTabs } from "@/components/classic/support/SupportTabs";
import { noticeById, notices } from "@/data/classic/notices";
import { pageMeta } from "@/lib/seo";

type Props = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return notices.map((n) => ({ id: n.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const n = noticeById(id);
  if (!n) return {};
  return pageMeta({ title: n.title, description: n.summary, path: `/classic/notice/${id}` });
}

const dot = (d: string) => d.replaceAll("-", ".");

// 공지사항 글. 제목, 날짜, 본문, 그림, 이전 글과 다음 글, 목록 버튼.
export default async function ClassicNoticeDetailPage({ params }: Props) {
  const { id } = await params;
  const n = noticeById(id);
  if (!n) notFound();
  const i = notices.indexOf(n);
  const newer = notices[i - 1];
  const older = notices[i + 1];

  return (
    <>
      <PageHead
        title="공지사항"
        trail={[
          { href: "/classic/notice", label: "공지사항" },
          { href: `/classic/notice/${id}`, label: n.title },
        ]}
      />
      <SupportTabs current="/classic/notice" />
      <article className={`${wrap} pb-16 pt-10 md:pb-24 md:pt-14`}>
        <header className="border-y-2 border-[#15171c] border-b-[#e6e9ee] py-6 md:border-b">
          <h2 className="break-keep text-[24px] font-[800] leading-[1.4] tracking-[-0.03em] md:text-[30px]">{n.title}</h2>
          <time dateTime={n.date} className="mt-2 block text-[15px] tabular-nums text-[#6b7280]">
            {dot(n.date)}
          </time>
        </header>
        <p className="pt-8 text-[18px] font-bold leading-[1.7] md:pt-10 md:text-[19px]">{n.summary}</p>
        <div className="space-y-8 py-8 md:py-10">
          {n.sections.map((sec) => (
            <section key={sec.h}>
              <h3 className="text-[19px] font-[800] tracking-[-0.02em] md:text-[21px]">{sec.h}</h3>
              <div className="mt-3 space-y-2 text-[16px] leading-[1.8] text-[#3d4450] md:text-[17px]">
                {sec.p?.map((t) => <p key={t}>{t}</p>)}
                {sec.list && (
                  <ul className="space-y-1.5" role="list">
                    {sec.list.map((t) => (
                      <li key={t} className="flex gap-2.5">
                        <span aria-hidden className="mt-[11px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#256ef4]" />
                        {t}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          ))}
        </div>
        {n.image && (
          <figure className="pb-10">
            <Image src={n.image.src} alt={n.image.alt} width={1600} height={1007} sizes="(min-width: 1248px) 1200px, 100vw" className="w-full rounded-md border border-[#e6e9ee]" />
            {n.image.note && <figcaption className="mt-3 text-[14px] text-[#6b7280] md:text-[15px]">{n.image.note}</figcaption>}
          </figure>
        )}
        <nav aria-label="이전 글과 다음 글" className="border-t border-[#e6e9ee] text-[16px]">
          {[
            { label: "다음 글", item: newer },
            { label: "이전 글", item: older },
          ].map((r) => (
            <div key={r.label} className="flex gap-4 border-b border-[#e6e9ee] py-4 md:gap-8">
              <span className="w-16 shrink-0 font-bold text-[#3d4450]">{r.label}</span>
              {r.item ? (
                <Link href={`/classic/notice/${r.item.id}`} className="min-w-0 truncate hover:text-[#256ef4] hover:underline">
                  {r.item.title}
                </Link>
              ) : (
                <span className="text-[#6b7280]">없음</span>
              )}
            </div>
          ))}
        </nav>
        <div className="mt-8 flex justify-center">
          <Link href="/classic/notice" className={btnLine}>
            목록
          </Link>
        </div>
      </article>
    </>
  );
}
