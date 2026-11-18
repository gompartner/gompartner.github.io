import type { Metadata } from "next";
import { MoveToWork } from "../MoveToWork";

export const metadata: Metadata = { robots: { index: false, follow: true } };
export const dynamicParams = false;

// app/work/[slug]/3d/page.tsx 의 demos3d 와 같게 둔다
export function generateStaticParams() {
  return ["kiosk-clinic", "kiosk-academy"].map((slug) => ({ slug }));
}

export default async function OldDemo3dPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <MoveToWork to={`/work/${slug}/3d`} />;
}
