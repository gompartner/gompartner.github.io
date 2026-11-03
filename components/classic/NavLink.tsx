import Link from "next/link";
import type { ComponentProps } from "react";

// 11-03 /3d/ 아래(섬 화면, 데모 6종)는 Next 페이지가 아닌 public/3d 정적 페이지라 Link의 화면 전환 대신 일반 링크로 연다
export function NavLink({ href, prefetch, ...rest }: ComponentProps<typeof Link>) {
  if (typeof href === "string" && href.startsWith("/3d/")) return <a href={href} {...rest} />;
  return <Link href={href} prefetch={prefetch} {...rest} />;
}
