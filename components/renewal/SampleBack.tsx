"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { markReturning, returnPath } from "@/lib/listReturn";

/** 샘플 표지에서 보던 목록의 같은 자리로 돌아간다. 목록을 거치지 않고 왔으면 전체 목록. */
export function SampleBack({ className }: { className: string }) {
  const [href, setHref] = useState("/works");
  useEffect(() => setHref(returnPath()), []);
  return (
    <Link href={href} onClick={markReturning} className={className}>
      <ArrowLeft size={16} strokeWidth={2.5} aria-hidden />
      다른 샘플
    </Link>
  );
}
