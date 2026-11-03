import type { Metadata } from "next";
import { MovedTo, movedMeta } from "@/components/seo/MovedTo";
import { newPathFor, oldClassicPaths } from "@/lib/classic-moved";

// 11-03 옛 /classic 주소. 주소에서 /classic을 빼고 같은 페이지의 새 주소로 넘긴다.
type Props = { params: Promise<{ path?: string[] }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return [{ path: [] }, ...oldClassicPaths.map((p) => ({ path: p.split("/") }))];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { path = [] } = await params;
  return movedMeta(newPathFor(path.join("/")));
}

export default async function Page({ params }: Props) {
  const { path = [] } = await params;
  return <MovedTo to={newPathFor(path.join("/"))} />;
}
