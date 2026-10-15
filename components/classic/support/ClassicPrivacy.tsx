import Link from "next/link";
import { PageHead, wrap } from "@/components/classic/ui";
import { privacyVersions, type PolicyVersion, type Table } from "@/data/privacyPolicy";

// 개인정보처리방침 본문(클래식 보기). 내용은 웹툰 쪽과 같은 data/privacyPolicy 를 쓴다.
const hrefOf = (id: string) => (id === privacyVersions[0].id ? "/classic/privacy" : `/classic/privacy/${id}`);

function DataTable({ head, rows }: Table) {
  return (
    <div className="overflow-x-auto border-t-2 border-[#15171c]">
      <table className="w-full min-w-[480px] border-collapse text-left text-[15px] leading-[1.6]">
        <thead className="bg-[#f6f7f9] text-[#15171c]">
          <tr>
            {head.map((h) => (
              <th key={h} scope="col" className="border-b border-[#e6e9ee] px-3 py-2.5 font-bold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r[0]} className="border-b border-[#e6e9ee]">
              {r.map((c, i) => (
                <td key={i} className="whitespace-pre-line px-3 py-2.5 align-top text-[#3d4450]">
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ClassicPrivacy({ version }: { version: PolicyVersion }) {
  const isLatest = version.id === privacyVersions[0].id;
  return (
    <>
      <PageHead title="개인정보처리방침" trail={[{ href: hrefOf(version.id), label: "개인정보처리방침" }]} />
      <div className={`${wrap} pb-16 pt-10 md:pb-24 md:pt-14`}>
        <div className="max-w-[860px]">
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-[#e6e9ee] pb-5 text-[16px] text-[#5b6370]">
            <span>시행일 {version.date}</span>
            <span>{version.id}번째 버전</span>
            {!isLatest && (
              <Link href="/classic/privacy" className="font-bold text-[#256ef4] underline underline-offset-4">
                현재 버전 보기
              </Link>
            )}
          </p>

          <div className="mt-10 space-y-12">
            {version.sections.map((s) => (
              <section key={s.title}>
                <h2 className="text-[21px] font-extrabold leading-[1.45] tracking-[-0.03em] md:text-[23px]">{s.title}</h2>
                <div className="mt-4 space-y-3 text-[17px] leading-[1.7] text-[#3d4450]">
                  {s.body.map((b, i) =>
                    typeof b === "string" ? (
                      <p key={i}>{b}</p>
                    ) : Array.isArray(b) ? (
                      <ul key={i} className="list-disc space-y-1 pl-5">
                        {b.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    ) : (
                      <DataTable key={i} {...b} />
                    ),
                  )}
                </div>
              </section>
            ))}
          </div>

          <section className="mt-16 border-t-2 border-[#15171c] pt-6">
            <h2 className="text-[21px] font-extrabold tracking-[-0.03em]">변경 이력</h2>
            <ul className="mt-2" role="list">
              {privacyVersions.map((v) => (
                <li key={v.id} className="flex flex-col gap-1 border-b border-[#e6e9ee] py-4 text-[16px] md:flex-row md:gap-6">
                  {v.id === version.id ? (
                    <span className="shrink-0 font-bold text-[#15171c]">
                      {v.date} ({v.id}번째 버전, 지금 보는 문서)
                    </span>
                  ) : (
                    <Link href={hrefOf(v.id)} className="shrink-0 font-bold text-[#256ef4] underline-offset-4 hover:underline">
                      {v.date} ({v.id}번째 버전{v.id === privacyVersions[0].id ? ", 현재" : ""})
                    </Link>
                  )}
                  <span className="text-[#5b6370]">{v.note}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </>
  );
}
