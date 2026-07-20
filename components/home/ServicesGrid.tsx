import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Section, { SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/motion/Reveal";
import { DemoPreview } from "@/components/home/DemoPreview";
import { Doodles } from "@/components/home/Doodles";
import { services } from "@/data/services";
import { projects } from "@/data/projects";

// 서비스 preview 카테고리 → 해당 라이브 데모 URL (Services + Demos 병합)
const demoByCategory: Record<string, string> = Object.fromEntries(
  projects.filter((p) => p.demoUrl).map((p) => [p.category, p.demoUrl!])
);

// meetzi식 컬러 아이콘 타일 팔레트 (카드 인덱스로 순환)
const iconTiles = [
  { c: "#4f5be6", bg: "#e6e8ff" },
  { c: "#17c3b2", bg: "#d5f7f2" },
  { c: "#ff6b5e", bg: "#ffe6e3" },
  { c: "#ffc63b", bg: "#fff3d6" },
  { c: "#34d17d", bg: "#dcf6e8" },
  { c: "#4f5be6", bg: "#e6e8ff" },
];

export function ServicesGrid() {
  return (
    <Section
      id="services"
      aria-labelledby="services-heading"
      className="relative overflow-hidden py-24 md:py-32 lg:py-40"
    >
      <Doodles variant={0} />
      <SectionHeading
        index="01"
        label="Services"
        size="display"
        title="이런 걸 만들어 드립니다"
        titleId="services-heading"
        description="아래 미리보기는 직접 클릭해 만져보는 샘플입니다. 지금 필요한 범위만 골라 만들고, 오픈 뒤에도 검색·트렌드에 맞춰 꾸준히 손봐가며 함께 운영합니다."
      />

      {/* 소프트 라운드 유리 카드 — 각 카드에서 바로 데모 체험 */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {services.map(({ icon: Icon, title, description, preview }, i) => {
          const demoUrl = demoByCategory[preview];
          return (
            <Reveal key={title} delay={(i % 3) * 0.08} className="h-full">
              <article className="iri-border glass group flex h-full flex-col rounded-3xl p-6 transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:shadow-2xl md:p-7">
                <div className="flex items-center justify-between">
                  <span
                    className="flex h-12 w-12 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:-rotate-6"
                    style={{
                      backgroundColor: iconTiles[i % iconTiles.length].bg,
                      color: iconTiles[i % iconTiles.length].c,
                    }}
                  >
                    <Icon size={24} aria-hidden />
                  </span>
                  <span className="text-2xl font-black tabular-nums leading-none text-foreground-tertiary/40">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>

                {/* 결과물 미리보기 */}
                <div className="mt-6">
                  <DemoPreview category={preview} />
                </div>

                <h3 className="mt-6 text-xl font-bold tracking-tight text-foreground">
                  {title}
                </h3>
                <p className="mt-2.5 break-keep text-sm leading-relaxed text-foreground-secondary">
                  {description}
                </p>

                {demoUrl && (
                  <Link
                    href={demoUrl}
                    data-gtm-cta={`service_demo_${preview}`}
                    className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-semibold text-accent transition-colors hover:text-accent-hover"
                  >
                    직접 체험하기
                    <ArrowUpRight
                      size={15}
                      aria-hidden
                      className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </Link>
                )}
              </article>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}
