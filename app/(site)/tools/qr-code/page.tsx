import type { Metadata } from "next";
import { QrMaker } from "@/components/tools/QrMaker";

export const metadata: Metadata = {
  title: "QR코드 만들기 (와이파이, 홈페이지, 무료)",
  description:
    "홈페이지 주소, 와이파이, 전화번호, 문자를 QR코드로 만들고 PNG와 SVG로 내려받습니다. 색상과 아래 문구를 넣을 수 있고, 기간 제한이나 접속 기록이 없습니다.",
  alternates: { canonical: "/tools/qr-code" },
};

export default function QrCodePage() {
  return (
    <div className="mx-auto w-full max-w-[1248px] px-4 py-10 md:px-6 md:py-14">
      <p className="text-[15px] font-bold text-accent">무료 도구</p>
      <h1 className="mt-1 text-[28px] font-bold leading-[1.4] tracking-[-0.01em] md:text-[36px]">QR코드 만들기</h1>
      <p className="mt-2 max-w-[720px] text-[17px] leading-[1.6] text-foreground-secondary">
        가게 홈페이지, 와이파이 연결, 전화 걸기를 QR코드로 만듭니다. 메뉴판이나 전단지에 넣을 수 있게 인쇄용 크기와 SVG로도 내려받을 수 있습니다.
      </p>
      <QrMaker />
    </div>
  );
}
