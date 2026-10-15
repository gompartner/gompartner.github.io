import type { Metadata } from "next";
import { ImageCompressor } from "@/components/classic/tools/ImageCompressor";
import { fitDescription } from "@/lib/seo";
import { ToolFrame } from "@/components/classic/support/ToolFrame";

export const metadata: Metadata = {
  title: "이미지 용량 줄이기 (JPG, WebP 변환, 무료)",
  description: fitDescription("홈페이지에 올릴 사진 용량을 브라우저에서 줄입니다. 여러 장을 한 번에 줄이고 원본과 용량을 비교합니다."),
  alternates: { canonical: "/tools/image-compress" },
};

export default function ClassicImageCompressPage() {
  return (
    <ToolFrame href="/classic/tools/image-compress">
      <ImageCompressor />
    </ToolFrame>
  );
}
