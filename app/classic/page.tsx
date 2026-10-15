import type { Metadata } from "next";
import { ClassicHome } from "@/components/classic/ClassicHome";

export const metadata: Metadata = {
  title: { absolute: "곰파트너 | 홈페이지 제작" },
};

export default function ClassicHomePage() {
  return <ClassicHome />;
}
