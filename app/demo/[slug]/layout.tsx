import { DemoDock } from "@/components/demos/DemoDock";
import { HideInFrame } from "@/components/demos/HideInFrame";
import { PlanBar } from "@/components/demos/PlanBar";
import { projects } from "@/data/projects";
import { blogPosts, stories } from "@/data/stories";
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
      {project && (
        <HideInFrame>
          <DemoDock projectId={project.id} story={stories[project.id]} blogUrl={blogPosts[project.id]} tour={tours[project.id]} />
          <PlanBar projectId={project.id} />
        </HideInFrame>
      )}
    </>
  );
}
