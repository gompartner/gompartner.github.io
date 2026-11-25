"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { backIfPrev } from "@/lib/navHistory";

// 누른 곳이 바로 앞 화면이면 새로 열지 않고 뒤로 간다(보던 자리와 검색어가 남는다). 아니면 보통 링크.
export function BackLink({ href, onClick, ...rest }: ComponentProps<typeof Link> & { href: string }) {
  return (
    <Link
      href={href}
      onClick={(e) => {
        onClick?.(e);
        if (!e.defaultPrevented) backIfPrev(e, href);
      }}
      {...rest}
    />
  );
}
