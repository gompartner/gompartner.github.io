import { DemoDock } from "@/components/demos/DemoDock";
import { HideInFrame } from "@/components/demos/HideInFrame";
import { projects } from "@/data/projects";
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
          <DemoDock projectId={project.id} tour={tours[project.id]} />
        </HideInFrame>
      )}
    </>
  );
}
