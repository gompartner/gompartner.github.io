import type { Metadata } from "next";
import { ImageCompressor } from "@/components/classic/tools/ImageCompressor";
import { pageMeta } from "@/lib/seo";
import { ToolFrame } from "@/components/classic/support/ToolFrame";

// 11-04 공유 미리보기(카톡 등)도 이 도구의 제목, 설명, 주소로 나오게 pageMeta를 쓴다
export const metadata: Metadata = pageMeta({ title: "이미지 용량 줄이기 (JPG, WebP 변환, 무료)", description: "홈페이지에 올릴 사진 용량을 브라우저에서 줄입니다. 여러 장을 한 번에 줄이고 원본과 용량을 비교합니다.", path: "/tools/image-compress" });

export default function ClassicImageCompressPage() {
  return (
    <ToolFrame href="/tools/image-compress">
      <ImageCompressor />
    </ToolFrame>
  );
}
