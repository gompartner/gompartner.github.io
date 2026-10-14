import type { MetadataRoute } from "next";
import { profile } from "@/data/profile";

export const dynamic = "force-static";

// 폰 홈 화면에 바로가기를 만들 때 쓰는 이름·아이콘·색
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${profile.name} 홈페이지·업무 프로그램 제작`,
    short_name: profile.name,
    description: "홈페이지와 업무 프로그램을 직접 만듭니다.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#256ef4",
    lang: "ko",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
