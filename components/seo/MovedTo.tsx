import Link from "next/link";

// 웹툰 시절 옛 주소(11-01 정리). 새 주소로 바로 넘기고, 검색엔진에는 새 주소를 대표로 알린다.
// 정적 배포(GitHub Pages)라 서버 리다이렉트 대신 즉시 meta refresh를 쓴다. 구글은 이를 영구 이동으로 본다.
export function MovedTo({ to }: { to: string }) {
  return (
    <>
      <meta httpEquiv="refresh" content={`0; url=${to}`} />
      <div className="mx-auto max-w-[640px] px-4 py-24 text-[17px]">
        <Link href={to} className="font-bold underline underline-offset-4">
          새 주소로 이동
        </Link>
      </div>
    </>
  );
}

/** 옛 주소 페이지의 메타데이터: 대표 주소는 새 주소, 검색 색인은 하지 않는다. */
export function movedMeta(to: string) {
  return { title: "곰파트너", robots: { index: false, follow: true }, alternates: { canonical: to } };
}
