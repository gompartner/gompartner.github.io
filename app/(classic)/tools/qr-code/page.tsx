import type { Metadata } from "next";
import { QrMaker } from "@/components/classic/tools/QrMaker";
import { pageMeta } from "@/lib/seo";
import { ToolFrame } from "@/components/classic/support/ToolFrame";

// 11-04 공유 미리보기(카톡 등)도 이 도구의 제목, 설명, 주소로 나오게 pageMeta를 쓴다
export const metadata: Metadata = pageMeta({ title: "QR코드 만들기 (와이파이, 홈페이지, 무료)", description: "홈페이지 주소, 와이파이, 전화번호, 문자를 QR코드로 만들고 PNG와 SVG로 내려받습니다. 색상과 아래 문구를 넣을 수 있고, 기간 제한이나 접속 기록이 없습니다.", path: "/tools/qr-code" });

export default function ClassicQrCodePage() {
  return (
    <ToolFrame href="/tools/qr-code">
      <QrMaker />
    </ToolFrame>
  );
}
