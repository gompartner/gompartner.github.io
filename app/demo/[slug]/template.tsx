// 데모끼리 옮길 때 본문이 부드럽게 나타난다.
export default function DemoTemplate({ children }: { children: React.ReactNode }) {
  return <div className="soft-in">{children}</div>;
}
