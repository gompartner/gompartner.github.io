import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PlanBar } from "@/components/demos/PlanBar";
import { projects } from "@/data/projects";

export default async function DemoLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}>) {
  const { slug } = await params;
  const project = projects.find((p) => p.demoUrl === `/demo/${slug}`);

  return (
    <>
      {children}
      <Link
        href="/works"
        className="print:hidden fixed bottom-5 left-5 z-50 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/60 px-4 py-2.5 text-sm font-medium text-white shadow-lg backdrop-blur-md transition-transform hover:scale-105"
      >
        <ArrowLeft size={15} aria-hidden />
        다른 데모 보기
      </Link>
      {project && <PlanBar projectId={project.id} />}
    </>
  );
}
