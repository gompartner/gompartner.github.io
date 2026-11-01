import { DemoTopBar } from "@/components/demos/DemoTopBar";
import { HideInFrame } from "@/components/demos/HideInFrame";
import { allProjects as projects } from "@/data/projects";

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
      {project && (
        <HideInFrame>
          <DemoTopBar projectId={project.id} />
        </HideInFrame>
      )}
      {children}
    </>
  );
}
