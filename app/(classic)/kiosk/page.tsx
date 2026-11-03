import type { Metadata } from "next";
import { MakeExtraPage } from "@/components/classic/MakeExtraPage";
import { makeExtras } from "@/data/classic/makeExtra";
import { pageMeta } from "@/lib/seo";

const s = makeExtras.find((x) => x.id === "kiosk")!;

export const metadata: Metadata = pageMeta({ title: s.metaTitle, description: s.metaDescription, path: "/kiosk" });

export default function Page() {
  return <MakeExtraPage s={s} />;
}
