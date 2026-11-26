import Link from "next/link";
import { PageHead, wrap } from "@/components/classic/ui";
import { privacyArchives, privacyVersions, type Block, type LabelIcon, type PolicyVersion, type Table } from "@/data/classic/privacyPolicy";
import { NEW_TAB, NewTabMark, isOutside } from "@/components/classic/NewTab";

// 주요 개인정보 처리 표시(라벨링) 아이콘. 개인정보보호위원회 개인정보 포털이 쓰는 공식 라벨 이미지(public/privacy-labels, 11-25)
const labelIcons: Record<LabelIcon, string> = {
  collect: "/privacy-labels/w/pi_collect.png",
  purpose: "/privacy-labels/w/pi_object.png",
  period: "/privacy-labels/w/pi_period.png",
  contact: "/privacy-labels/w/img_cpo.png",
};

// 11-26 공식 아이콘은 남색 선 그림이라 어두운 바탕에서 안 보인다. 선은 흰색, 흰 면은 투명, 주황 강조는 그대로 둔 판(public/privacy-labels/w)을 쓴다.
// 통째로 흰색으로 뒤집으면(filter) 색 면이 있는 아이콘이 흰 덩어리가 된다. 원본은 public/privacy-labels에 그대로 있다.

function LabelBadge({ icon }: { icon: LabelIcon }) {
  // 고충처리(img_cpo)는 원본이 31px이라 키우지 않는다
  const h = icon === "contact" ? 31 : 48;
  return (
    <span aria-hidden className="inline-flex h-12 shrink-0 items-center justify-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={labelIcons[icon]} alt="" style={{ height: h, width: "auto" }} />
    </span>
  );
}

/** 목차와 조 제목 앞 아이콘. 원본 크기(약 31px) 그대로 쓴다 */
function SectionIcon({ name }: { name: string }) {
  return (
    // 원본마다 폭이 31~36px로 달라 같은 폭 상자에 넣어 글자 시작점을 맞춘다
    <span aria-hidden className="inline-flex h-9 w-9 shrink-0 items-center justify-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`/privacy-labels/w/${name}.png`} alt="" className={`max-h-9 w-auto`} />
    </span>
  );
}

// 개인정보처리방침 본문(클래식 보기). 내용은 웹툰 쪽과 같은 data/privacyPolicy 를 쓴다.
const hrefOf = (id: string) => (id === privacyVersions[0].id ? "/privacy" : `/privacy/${id}`);

/** 문장과 표 칸 안의 [글자](주소)를 링크로 그린다. 다른 서비스 주소는 새 창 */
function Rich({ text }: { text: string }) {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\))/g);
  return (
    <>
      {parts.map((p, i) => {
        const m = p.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (!m) return p;
        const [, label, href] = m;
        const cls = "font-bold text-[#256ef4] underline underline-offset-4";
        if (isOutside(href))
          return (
            <a key={i} href={href} {...NEW_TAB} className={`inline-flex items-center gap-1 ${cls}`}>
              {label}
              <NewTabMark size={14} />
            </a>
          );
        if (href.startsWith("#"))
          return (
            <a key={i} href={href} className={cls}>
              {label}
            </a>
          );
        return (
          <Link key={i} href={href} className={cls}>
            {label}
          </Link>
        );
      })}
    </>
  );
}

function DataTable({ head, rows, caption }: Table) {
  // 넓은 화면은 표, 휴대폰 폭(md 미만)은 줄마다 카드로 쌓는다(11-26 서비스별 표가 좁은 화면에서 가로로 밀리지 않게). 칸 이름은 카드 안에 작은 글씨로 보인다.
  const name = caption ?? head.join(", ");
  return (
    <div role="region" aria-label={name} className="border-t-2 border-[#15171c]">
      <table className="w-full border-collapse text-left text-[15px] leading-[1.6] max-md:block">
        <caption className="sr-only">{name}</caption>
        <thead className="bg-[#f6f7f9] text-[#15171c] max-md:hidden">
          <tr>
            {head.map((h) => (
              <th key={h} scope="col" className="border-b border-[#e6e9ee] px-3 py-2.5 font-bold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="max-md:block">
          {rows.map((r, ri) => (
            <tr key={ri} className="border-b border-[#e6e9ee] max-md:block max-md:py-2">
              {r.map((c, i) => (
                <td key={i} className={`whitespace-pre-line px-3 py-2.5 align-top text-[#3d4450] max-md:block max-md:py-1 ${i === 0 ? "max-md:font-bold" : ""}`}>
                  {i > 0 && <span className="block text-[13px] font-bold text-[#5b6370] md:hidden">{head[i]}</span>}
                  <Rich text={c} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** 조 본문 한 덩어리: 문장, 번호 목록, 표, 서비스 단락(제목과 앵커) */
function BlockView({ b }: { b: Block }) {
  if (typeof b === "string") return <p><Rich text={b} /></p>;
  if (Array.isArray(b))
    return (
      <ol className="list-decimal space-y-1 pl-6">
        {b.map((item) => (
          <li key={item}>
            <Rich text={item} />
          </li>
        ))}
      </ol>
    );
  if ("heading" in b) {
    if (b.level === 3)
      return (
        <section id={b.id} aria-labelledby={b.id ? `${b.id}-h` : undefined} className="scroll-mt-24 rounded-lg border border-[#e6e9ee] p-4 !mt-6 md:p-6">
          <h3 id={b.id ? `${b.id}-h` : undefined} className="text-[19px] font-[800] leading-[1.45] tracking-[-0.02em] text-[#15171c] md:text-[20px]">
            {b.heading}
          </h3>
          <div className="mt-3 space-y-3">
            {b.body.map((x, i) => (
              <BlockView key={i} b={x} />
            ))}
          </div>
        </section>
      );
    return (
      <div className="space-y-2 pt-2">
        <h4 className="text-[16px] font-bold text-[#15171c]">{b.heading}</h4>
        {b.body.map((x, i) => (
          <BlockView key={i} b={x} />
        ))}
      </div>
    );
  }
  return <DataTable {...b} />;
}

export function ClassicPrivacy({ version }: { version: PolicyVersion }) {
  const isLatest = version.id === privacyVersions[0].id;
  return (
    <>
      <PageHead en="PRIVACY" ice="개인정보" title="개인정보처리방침" lead="곰파트너가 운영하는 홈페이지 상담과 사이트 지킴이, 거래장부에서 처리하는 개인정보를 안내합니다." trail={[{ href: hrefOf(version.id), label: "개인정보처리방침" }]} />
      <div className={`${wrap} pb-20 pt-8 md:pb-28 md:pt-12`}>
        <div className="max-w-[860px]">
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-[#e6e9ee] pb-5 text-[16px] text-[#5b6370]">
            <span>시행일 {version.date}</span>
            {!isLatest && (
              <Link href="/privacy" className="font-bold text-[#256ef4] underline underline-offset-4">
                현재 버전 보기
              </Link>
            )}
          </p>

          {version.intro && (
            <p className="mt-8 rounded-lg border border-[#e6e9ee] bg-[#f6f7f9] px-5 py-4 text-[16px] leading-[1.7] text-[#3d4450]">{version.intro}</p>
          )}

          {version.labels && (
            <section aria-labelledby="privacy-labels" className="mt-8 overflow-hidden rounded-lg border border-[#e6e9ee]">
              <h2 id="privacy-labels" className="border-b border-[#e6e9ee] bg-[#f6f7f9] px-5 py-3 text-center text-[16px] font-bold text-[#15171c]">
                주요 개인정보 처리 표시(라벨링)
              </h2>
              <ul className="grid grid-cols-2 md:grid-cols-4">
                {version.labels.map((l) => (
                  <li key={l.name} className="border-b border-r border-[#e6e9ee] last:border-r-0 max-md:[&:nth-child(2n)]:border-r-0 md:border-b-0">
                    <a href={`#a${l.section}`} className="flex h-full flex-col items-center gap-2 px-3 py-5 text-center hover:bg-[#f6f9ff]">
                      <LabelBadge icon={l.icon} />
                      <b className="text-[15px] leading-[1.4] text-[#15171c]">{l.name}</b>
                      <span className="text-[14px] leading-[1.5] text-[#5b6370]">{l.summary}</span>
                    </a>
                  </li>
                ))}
              </ul>
              <p className="border-t border-[#e6e9ee] px-5 py-2.5 text-center text-[13px] text-[#5b6370]">세부 항목은 아래 본문에서 확인할 수 있습니다.</p>
            </section>
          )}

          {/* 목차: 개인정보 포털 처리방침처럼 2단 상자, 항목마다 공식 아이콘(11-25) */}
          <nav aria-label="목차" className="mt-8 rounded-lg border border-[#e6e9ee] p-4 md:p-5">
            <b className="block text-center text-[16px] text-[#15171c]">목차</b>
            <ol className="mt-3 grid gap-2.5 md:grid-cols-2">
              {version.sections.map((s, i) => (
                <li key={s.title}>
                  <a
                    href={`#a${i + 1}`}
                    className="flex min-h-[48px] items-center gap-3 rounded-md border border-[#e6e9ee] bg-white px-3.5 py-2 text-[15px] leading-[1.45] text-[#3d4450] shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:border-[#256ef4] hover:text-[#256ef4]"
                  >
                    {s.icon && <SectionIcon name={s.icon} />}
                    <span>{s.title}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="mt-10 space-y-12">
            {version.sections.map((s, i) => (
              <section key={s.title} id={`a${i + 1}`} className="scroll-mt-24">
                <h2 className="flex items-center gap-2.5 text-[21px] font-[800] leading-[1.45] tracking-[-0.03em] md:text-[23px]">
                  {s.icon && <SectionIcon name={s.icon} />}
                  {s.title}
                </h2>
                <div className="mt-4 space-y-3 text-[17px] leading-[1.7] text-[#3d4450]">
                  {s.body.map((b, i) => (
                    <BlockView key={i} b={b} />
                  ))}
                </div>
              </section>
            ))}
          </div>

          {/* 변경 이력: 판마다 시행일과 개정 내용, 지난 판 보기. 합치기 전 서비스별 처리방침은 각 서비스에 보관한 원본으로(11-26) */}
          <section aria-labelledby="privacy-history" className="mt-14">
            <h2 id="privacy-history" className="text-[21px] font-[800] leading-[1.45] tracking-[-0.03em] md:text-[23px]">
              변경 이력
            </h2>
            <div className="mt-4 text-[17px] leading-[1.7] text-[#3d4450]">
              <DataTable
                caption="개인정보처리방침 변경 이력"
                head={["판", "시행일", "개정 내용", "보기"]}
                rows={[
                  ...privacyVersions.map((v) => [
                    `${v.id}판`,
                    v.date,
                    v.change ?? v.note,
                    v.id === version.id ? "지금 보는 판" : `[보기](${hrefOf(v.id)})`,
                  ]),
                  ...privacyArchives.map((a) => [a.name, a.date, a.change, `[보기](${a.href})`]),
                ]}
              />
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
