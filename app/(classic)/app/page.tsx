import type { Metadata } from "next";
import { MakeExtraPage } from "@/components/classic/MakeExtraPage";
import { makeExtras } from "@/data/classic/makeExtra";
import { pageMeta } from "@/lib/seo";

const s = makeExtras.find((x) => x.id === "app")!;

export const metadata: Metadata = pageMeta({ title: s.metaTitle, description: s.metaDescription, path: "/app" });

export default function Page() {
  return <MakeExtraPage s={s} />;
}
