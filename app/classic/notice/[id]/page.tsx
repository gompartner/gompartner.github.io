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
          { href: "/classic/notice", label: "고객지원" },
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
          <figure className="mx-auto max-w-[600px] pb-10">
            {/* 첫 화면 전체 캡처를 브라우저 창 틀에 넣어 페이지 한 장으로 보여 준다 */}
            <div className="overflow-hidden rounded-lg border border-[#d9dee5] bg-white shadow-[0_12px_32px_rgba(21,23,28,.08)]">
              <div className="flex h-9 items-center gap-1.5 border-b border-[#e6e9ee] bg-[#f1f3f6] px-4">
                <span className="h-2.5 w-2.5 rounded-full bg-[#c5cbd4]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#c5cbd4]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#c5cbd4]" />
                <span className="ml-3 truncate text-[13px] text-[#6b7280]">gompartner.co.kr</span>
              </div>
              <Image src={n.image.src} alt={n.image.alt} width={n.image.w} height={n.image.h} sizes="(min-width: 768px) 600px, 100vw" className="block w-full" />
            </div>
            <figcaption className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-[14px] text-[#6b7280] md:text-[15px]">
              <span>당시 첫 화면 전체입니다.{n.image.note && ` ${n.image.note}`}</span>
              <a href={n.image.src} target="_blank" rel="noopener noreferrer" className="font-bold text-[#256ef4] hover:underline">
                원본 크기로 보기
              </a>
            </figcaption>
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
