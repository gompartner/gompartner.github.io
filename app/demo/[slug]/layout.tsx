import { DemoDock } from "@/components/demos/DemoDock";
import { DemoPopup } from "@/components/demos/DemoPopup";
import { PlanBar } from "@/components/demos/PlanBar";
import { popups } from "@/data/popups";
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
      {project && popups[project.id] && <DemoPopup projectId={project.id} items={popups[project.id]} />}
      {project && <DemoDock projectId={project.id} story={stories[project.id]} tour={tours[project.id]} />}
      {project && <PlanBar projectId={project.id} />}
    </>
  );
}
