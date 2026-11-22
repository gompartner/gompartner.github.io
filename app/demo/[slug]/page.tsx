import type { Metadata } from "next";
import { liveProjects as projects } from "@/data/projects";
import { MoveToWork } from "./MoveToWork";

export const metadata: Metadata = { robots: { index: false, follow: true } };
export const dynamicParams = false;

export function generateStaticParams() {
  return projects.filter((p) => p.demoUrl.startsWith("/work/")).map((p) => ({ slug: p.demoUrl.replace("/work/", "") }));
}

export default async function OldDemoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <MoveToWork to={`/work/${slug}`} />;
}
