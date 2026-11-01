import type { Metadata } from "next";
import { MovedTo, movedMeta } from "@/components/seo/MovedTo";
import { industries } from "@/data/industries";

// 옛 주소. 새 주소로 넘긴다(11-01)
type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return industries.map((ind) => ({ slug: ind.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return movedMeta(`/classic/works/${slug}`);
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  return <MovedTo to={`/classic/works/${slug}`} />;
}
