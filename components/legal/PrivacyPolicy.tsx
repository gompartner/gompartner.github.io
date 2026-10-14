import Link from "next/link";
import {
  privacyVersions,
  type PolicyVersion,
  type Table,
} from "@/data/privacyPolicy";

function DataTable({ head, rows }: Table) {
  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <table className="w-full min-w-[480px] border-collapse text-left text-[15px] leading-[1.6]">
        <thead className="bg-surface text-foreground">
          <tr>
            {head.map((h) => (
              <th
                key={h}
                scope="col"
                className="border-b border-border px-3 py-2 font-bold"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r[0]} className="border-b border-border last:border-b-0">
              {r.map((c, i) => (
                <td key={i} className="whitespace-pre-line px-3 py-2 align-top">
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

/** 개인정보처리방침 본문. 현재 버전과 이전 버전 페이지가 함께 쓴다. */
export function PrivacyPolicy({ version }: { version: PolicyVersion }) {
  const latest = privacyVersions[0];
  const isLatest = version.id === latest.id;
  return (
    <div className="mx-auto w-full max-w-[800px] px-4 pb-16 pt-14 md:px-6 md:py-14">
      <h1 className="text-[28px] font-bold leading-[1.4] tracking-[-0.01em] md:text-[36px]">
        개인정보처리방침
      </h1>
      <p className="mt-2 text-[17px] leading-[1.6] text-foreground-secondary">
        시행일 {version.date} · {version.id}번째 버전
      </p>
      {!isLatest && (
        <p className="mt-4 rounded-md border border-border bg-surface px-4 py-3 text-[15px] leading-[1.6]">
          지난 버전입니다.{" "}
          <Link
            href="/privacy"
            className="font-bold text-accent underline underline-offset-4"
          >
            현재 버전 보기
          </Link>
        </p>
      )}

      <div className="mt-10 space-y-10">
        {version.sections.map((s) => (
          <section key={s.title}>
            <h2 className="text-[20px] font-bold leading-[1.5]">{s.title}</h2>
            <div className="mt-3 space-y-3 text-[17px] leading-[1.7] text-foreground-secondary">
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

      <section className="mt-14 border-t border-border pt-8">
        <h2 className="text-[20px] font-bold leading-[1.5]">변경 이력</h2>
        <ul className="mt-3 space-y-2 text-[17px] leading-[1.6] text-foreground-secondary">
          {privacyVersions.map((v) => (
            <li key={v.id} className="flex flex-wrap gap-x-2">
              {v.id === version.id ? (
                <span className="font-bold text-foreground">
                  {v.date} ({v.id}번째 버전, 지금 보는 문서)
                </span>
              ) : (
                <Link
                  href={v.id === latest.id ? "/privacy" : `/privacy/${v.id}`}
                  className="underline underline-offset-4 hover:text-accent"
                >
                  {v.date} ({v.id}번째 버전{v.id === latest.id ? ", 현재" : ""})
                </Link>
              )}
              <span>{v.note}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
