// 사이트 안에서 페이지를 옮길 때마다 다시 그려져 본문이 부드럽게 나타난다.
export default function SiteTemplate({ children }: { children: React.ReactNode }) {
  return <div className="soft-in">{children}</div>;
}
