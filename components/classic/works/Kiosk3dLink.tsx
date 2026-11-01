"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Box } from "lucide-react";

// 11-02 키오스크 3D 체험 버튼. 아직 다듬는 중이라 공개 주소(gompartner.co.kr)에서는 숨기고 검수 주소와 미리보기에서만 보인다.
const PUBLIC_HOSTS = ["gompartner.co.kr", "www.gompartner.co.kr"];

export function Kiosk3dLink({ href, id, className }: { href: string; id: string; className: string }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const f = requestAnimationFrame(() => setShow(!PUBLIC_HOSTS.includes(window.location.hostname)));
    return () => cancelAnimationFrame(f);
  }, []);
  if (!show) return null;
  return (
    <Link href={href} prefetch={false} data-gtm-cta={`classic_sample_open3d_${id}`} className={`${className} gap-2`}>
      <Box size={18} aria-hidden />
      3D 체험
    </Link>
  );
}
