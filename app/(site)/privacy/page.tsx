import type { Metadata } from "next";
import { MovedTo, movedMeta } from "@/components/seo/MovedTo";

// 옛 주소. 새 주소로 넘긴다(11-01)
export const metadata: Metadata = movedMeta("/classic/privacy");

export default function Page() {
  return <MovedTo to={"/classic/privacy"} />;
}
