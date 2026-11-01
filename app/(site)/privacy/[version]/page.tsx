import type { Metadata } from "next";
import { MovedTo, movedMeta } from "@/components/seo/MovedTo";
import { privacyVersions } from "@/data/privacyPolicy";

// 옛 주소. 새 주소로 넘긴다(11-01)
export function generateStaticParams() {
  return privacyVersions.slice(1).map((v) => ({ version: v.id }));
}

export const metadata: Metadata = movedMeta("/classic/privacy");

export default function Page() {
  return <MovedTo to="/classic/privacy" />;
}
