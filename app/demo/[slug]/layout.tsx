import { DemoDock } from "@/components/demos/DemoDock";
import { PlanBar } from "@/components/demos/PlanBar";
import { projects } from "@/data/projects";
import { stories } from "@/data/stories";
import { tours } from "@/data/tours";

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
      {project && <DemoDock projectId={project.id} story={stories[project.id]} tour={tours[project.id]} />}
      {project && <PlanBar projectId={project.id} />}
    </>
  );
}
