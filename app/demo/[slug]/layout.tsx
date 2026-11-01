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
      {/* 데모 공통 스타일(선택상자 모양 등)을 거는 틀. display: contents라 배치에는 영향이 없다 */}
      <div className="demo-root">{children}</div>
    </>
  );
}
