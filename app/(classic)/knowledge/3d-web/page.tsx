import type { Metadata } from "next";
import Link from "next/link";
import { ArchiveShell, docH2 } from "@/components/classic/archive/ArchiveShell";
import { FaqBlock } from "@/components/classic/FaqBlock";
import { manwon } from "@/data/classic/pricing";
import { threeByIndustry, threeCompare, threeDeliver, threeExtras, threeFaq, threeForWhom, threePlanNote, threePlans, threeScope, threeSteps } from "@/data/classic/three";
import { pageMeta } from "@/lib/seo";

// 11-27 대표 "구간은 다 줄여, 설명은 AI 인용과 별도로 수집기에 잘 되도록, 비교는 위키나 블로그에".
// /3d 화면에서 걷어 낸 설명(종류와 비용, 구현 범위, 절차와 납품물, 제작 방식 비교, 자주 묻는 질문)을 한 문서로 모았다.
// 사실과 금액은 data/classic/three.ts 그대로. 자주 묻는 질문은 FaqBlock이 FAQPage 구조화 데이터를 함께 낸다.

const HREF = "/knowledge/3d-web";
const TITLE = "3D 홈페이지 제작 안내";
const LEAD = "3D 홈페이지는 화면 속 장면이나 제품을 방문자가 직접 돌려 보고 고르는 홈페이지입니다. 곰파트너는 스크롤에 따라 장면이 바뀌는 브랜드 3D 홈페이지와 공간 3D 뷰어, 제품 3D 컨피규레이터를 만들고 운영 중인 홈페이지에 연동합니다.";
const UPDATED = "2026-11-27";

export const metadata: Metadata = pageMeta({
  title: `${TITLE}: 종류와 비용, 구현 범위와 진행 절차 | 위키`,
  description: "3D 홈페이지의 세 가지 종류(브랜드 3D, 공간 3D 뷰어, 3D 컨피규레이터)와 비용, 구현 범위와 진행 절차, 제작 방식 비교, 자주 묻는 질문을 정리했습니다.",
  path: HREF,
  article: true,
});

const p = "mt-3 break-keep text-[16px] leading-[1.75] text-[#c9ced6]";
const li = "break-keep text-[15.5px] leading-[1.7] text-[#c9ced6]";
const box = "rounded-[12px] border border-white/12 bg-[#121722] p-5";

const toc = [
  { id: "kinds", label: "종류와 비용" },
  { id: "whom", label: "필요한 경우" },
  { id: "scope", label: "구현 범위" },
  { id: "steps", label: "진행 절차와 납품물" },
  { id: "cost", label: "업종별 비용" },
  { id: "compare", label: "제작 방식 비교" },
  { id: "faq", label: "자주 묻는 질문" },
];

export default function Three3dWebDoc() {
  return (
    <ArchiveShell
      section="dev"
      active={HREF}
      crumbs={[{ href: HREF, label: TITLE }]}
      toc={toc}
      head={{ title: TITLE, meta: [["갱신", UPDATED], ["화면", "곰파트너 3D 웹(/3d)"]], lead: LEAD }}
      article={{ title: TITLE, description: LEAD, published: UPDATED, modified: UPDATED }}
    >
      <section aria-labelledby="kinds">
        <h2 id="kinds" className={docH2}>종류와 비용</h2>
        <p className={p}>{threePlanNote} 금액은 부가세 별도입니다.</p>
        <ul role="list" className="mt-5 grid gap-3 md:grid-cols-3">
          {threePlans.map((pl) => (
            <li key={pl.id} className={box}>
              <h3 className="text-[17px] font-[800] text-white">{pl.name}</h3>
              <p className="mt-1 text-[14.5px] text-[#aab2bf]">{pl.summary}</p>
              <p className="mt-3 text-[20px] font-[800] text-white">{manwon(pl.price)}부터 <span className="text-[14px] font-bold text-[#7aa7ff]">제작 {pl.period}</span></p>
              <ul role="list" className="mt-3 space-y-1">
                {pl.includes.map((x) => <li key={x} className={li}>{x}</li>)}
              </ul>
            </li>
          ))}
        </ul>
        <p className={p}>모든 종류에 원본 소스와 3D 원본 파일을 드리고, 운영 중인 홈페이지 연동과 1개월 무상 하자보수가 들어갑니다. 화면은 <Link href="/3d" className="font-bold text-white underline underline-offset-4">3D 웹</Link>에서 직접 만져 볼 수 있습니다.</p>
      </section>

      <section aria-labelledby="whom">
        <h2 id="whom" className={docH2}>필요한 경우</h2>
        <ul role="list" className="mt-3 list-disc space-y-1.5 pl-5">
          {threeForWhom.map((x) => <li key={x} className={li}>{x}</li>)}
        </ul>
      </section>

      <section aria-labelledby="scope">
        <h2 id="scope" className={docH2}>구현 범위</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {threeScope.map((s) => (
            <div key={s.title} className={box}>
              <h3 className="text-[16px] font-[800] text-[#7aa7ff]">{s.title}</h3>
              <ul role="list" className="mt-2 space-y-1">
                {s.items.map((x) => <li key={x} className={li}>{x}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="steps">
        <h2 id="steps" className={docH2}>진행 절차와 납품물</h2>
        <ol role="list" className="mt-4 space-y-3">
          {threeSteps.map((s, i) => (
            <li key={s.title} className="grid grid-cols-[28px_minmax(0,1fr)] gap-3">
              <span className="text-[16px] font-[800] text-[#7aa7ff]">{i + 1}</span>
              <p className={li}><b className="text-white">{s.title}</b> {s.body}</p>
            </li>
          ))}
        </ol>
        <h3 className="mt-6 text-[16px] font-[800] text-white">납품물</h3>
        <ul role="list" className="mt-2 list-disc space-y-1 pl-5">
          {threeDeliver.items.map((x) => <li key={x} className={li}>{x}</li>)}
        </ul>
      </section>

      <section aria-labelledby="cost">
        <h2 id="cost" className={docH2}>업종별 비용</h2>
        <div className="mt-4 overflow-x-auto rounded-[12px] border border-white/12">
          <table className="w-full min-w-[560px] border-collapse text-left text-[14.5px] leading-[1.6]">
            <thead>
              <tr className="border-b border-white/12 bg-white/[.04] text-[13.5px] text-[#aab2bf]">
                <th scope="col" className="px-3 py-2">업종</th><th scope="col" className="px-3 py-2">예상 비용</th><th scope="col" className="px-3 py-2">만드는 것</th><th scope="col" className="px-3 py-2">준비 자료</th>
              </tr>
            </thead>
            <tbody>
              {threeByIndustry.map((r) => (
                <tr key={r.name} className="border-b border-white/10 last:border-0 text-[#c9ced6]">
                  <th scope="row" className="px-3 py-2.5 font-bold text-white">{r.name}</th><td className="px-3 py-2.5">{r.price}</td><td className="px-3 py-2.5">{r.make}</td><td className="px-3 py-2.5">{r.need}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <h3 className="mt-6 text-[16px] font-[800] text-white">따로 드는 비용</h3>
        <ul role="list" className="mt-2 space-y-1">
          {threeExtras.map((x) => <li key={x.name} className={li}>{x.name}: {x.price}</li>)}
        </ul>
      </section>

      <section aria-labelledby="compare">
        <h2 id="compare" className={docH2}>제작 방식 비교</h2>
        <div className="mt-4 overflow-x-auto rounded-[12px] border border-white/12">
          <table className="w-full min-w-[640px] border-collapse text-left text-[14.5px] leading-[1.6]">
            <thead>
              <tr className="border-b border-white/12 bg-white/[.04] text-[13.5px] text-[#aab2bf]">
                <th scope="col" className="px-3 py-2"><span className="sr-only">항목</span></th>
                {threeCompare.cols.map((c) => <th key={c} scope="col" className="px-3 py-2">{c}</th>)}
              </tr>
            </thead>
            <tbody>
              {threeCompare.rows.map(([k, ...v]) => (
                <tr key={k} className="border-b border-white/10 last:border-0 text-[#c9ced6]">
                  <th scope="row" className="px-3 py-2.5 font-bold text-white">{k}</th>
                  {v.map((x, i) => <td key={i} className="px-3 py-2.5">{x}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[14px] text-[#8a94a6]">{threeCompare.note}</p>
      </section>

      <section className="mt-14">
        <FaqBlock items={threeFaq} id="faq" />
      </section>
    </ArchiveShell>
  );
}
