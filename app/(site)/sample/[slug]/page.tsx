import type { Metadata } from "next";
import { MovedTo, movedMeta } from "@/components/seo/MovedTo";
import { projects } from "@/data/projects";

// 옛 주소. 새 주소로 넘긴다(11-01)
type Props = { params: Promise<{ slug: string }> };

const slugOf = (demoUrl: string) => demoUrl.replace("/demo/", "");

export function generateStaticParams() {
  return projects.filter((p) => p.demoUrl.startsWith("/demo/")).map((p) => ({ slug: slugOf(p.demoUrl) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return movedMeta(`/classic/sample/${slug}`);
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  return <MovedTo to={`/classic/sample/${slug}`} />;
}
