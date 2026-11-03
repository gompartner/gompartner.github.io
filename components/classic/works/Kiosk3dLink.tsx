import Link from "next/link";
import { Box } from "lucide-react";

// 11-03 키오스크 3D 체험 버튼. 공개 주소에서도 보이게 숨김 조건 해제.
export function Kiosk3dLink({ href, id, className }: { href: string; id: string; className: string }) {
  return (
    <Link href={href} prefetch={false} data-gtm-cta={`classic_sample_open3d_${id}`} className={`${className} gap-2`}>
      <Box size={18} aria-hidden />
      3D 체험
    </Link>
  );
}
