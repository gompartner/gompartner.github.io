// 옛 /demo/<slug> 주소로 들어오면 /work/<slug>로 옮긴다(11-19 주소 변경). 정적 export라 서버 리다이렉트 대신 화면에서 넘긴다.
export function MoveToWork({ to }: { to: string }) {
  const js = `location.replace(${JSON.stringify(to)}+location.search+location.hash)`;
  return (
    <>
      <meta httpEquiv="refresh" content={`0;url=${to}`} />
      <link rel="canonical" href={to} />
      <script dangerouslySetInnerHTML={{ __html: js }} />
      <p style={{ padding: 24 }}>
        <a href={to}>새 주소로 이동합니다</a>
      </p>
    </>
  );
}
