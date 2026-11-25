import { DemoTopBar } from "@/components/demos/DemoTopBar";
import { HideInFrame } from "@/components/demos/HideInFrame";
import { liveProjects as projects } from "@/data/projects";
import { VARIANTS } from "@/lib/variants";

export default async function DemoLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}>) {
  const { slug } = await params;
  const project = projects.find((p) => p.demoUrl === `/work/${slug}`);
  const first = (project && VARIANTS[project.id]?.[0]?.id) || "";
  // 정적 페이지는 첫 시안으로 그려져 있다. 주소에 다른 시안(?v=)이 있으면 바뀔 때까지 본문을 가려
  // 새로고침할 때 첫 시안이 잠깐 비치지 않게 한다. useVariant가 시안을 고른 뒤 v-wait를 지운다(늦어도 3초 뒤 풀림).
  const guard = `(function(){try{var q=new URLSearchParams(location.search).get("v");if(q&&q!==${JSON.stringify(first)}){var h=document.documentElement;h.classList.add("v-wait");setTimeout(function(){h.classList.remove("v-wait")},3000)}}catch(e){}})()`;

  return (
    <>
      {first && <script dangerouslySetInnerHTML={{ __html: guard }} />}
      {project && (
        <HideInFrame>
          <DemoTopBar projectId={project.id} />
        </HideInFrame>
      )}
      {/* 데모 공통 스타일(선택상자 모양 등)을 거는 틀. display: contents라 배치에는 영향이 없다 */}
      <div className="demo-root">{children}</div>
      {/* 11-25 시안 맨 아래에는 곰파트너 저작권 줄(대표 요청). 시안마다 하단 정보는 그대로 두고 그 아래에 한 줄 */}
      {first && (
        <div className="bg-[#0b0b0c] py-4 text-center text-[12px] tracking-[0.01em] text-[#8b9099]">
          Copyright © 곰파트너. All rights reserved.
        </div>
      )}
    </>
  );
}
