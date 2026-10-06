import type { Metadata } from "next";
import { ImageCompressor } from "@/components/tools/ImageCompressor";

export const metadata: Metadata = {
  title: "이미지 용량 줄이기 (JPG, WebP 변환, 무료)",
  description:
    "홈페이지에 올릴 사진의 용량을 브라우저 안에서 바로 줄입니다. 여러 장을 한 번에 넣고 화질과 가로 크기를 고르면 줄어든 용량을 원본과 비교해 보고 내려받을 수 있습니다.",
  alternates: { canonical: "/tools/image-compress" },
};

export default function ImageCompressPage() {
  return (
    <div className="mx-auto w-full max-w-[1248px] px-4 pb-10 pt-14 md:px-6 md:py-14">
      <h1 className="text-[28px] font-bold leading-[1.4] tracking-[-0.01em] md:text-[36px]">이미지 용량 줄이기</h1>
      <ImageCompressor />
    </div>
  );
}
