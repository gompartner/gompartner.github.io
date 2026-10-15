import type { Metadata } from "next";
import { QrMaker } from "@/components/tools/QrMaker";
import { fitDescription } from "@/lib/seo";
import { ToolFrame } from "@/components/classic/support/ToolFrame";

export const metadata: Metadata = {
  title: "QR코드 만들기 (와이파이, 홈페이지, 무료)",
  description: fitDescription("홈페이지 주소, 와이파이, 전화번호, 문자를 QR코드로 만들고 PNG와 SVG로 내려받습니다. 색상과 아래 문구를 넣을 수 있고, 기간 제한이나 접속 기록이 없습니다."),
  alternates: { canonical: "/tools/qr-code" },
};

export default function ClassicQrCodePage() {
  return (
    <ToolFrame href="/classic/tools/qr-code">
      <QrMaker />
    </ToolFrame>
  );
}
