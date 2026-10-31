import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/lib/types";
import { mobileShotOf, slugOf, thumbOf } from "./samples";

// 샘플 카드 격자. 홈 화면 샘플 목록과 같은 모양(썸네일 선 하나, 그림자 없음).
// variant="mockup"은 카탈로그 목록용: PC 화면을 크게 두고 휴대폰 화면을 오른쪽 아래에 걸친다(10-31 C안).
export function SampleGrid({ items, cols = 4, variant = "plain" }: { items: Project[]; cols?: 3 | 4; variant?: "plain" | "mockup" }) {
  if (variant === "mockup") return <MockupGrid items={items} />;
  return (
    <ul className={`grid grid-cols-2 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-12 ${cols === 4 ? "md:grid-cols-3 lg:grid-cols-4" : "md:grid-cols-3"}`} role="list">
      {items.map((p) => (
        <li key={p.id} className="min-w-0">
          <Link href={`/classic/sample/${slugOf(p.demoUrl)}`} className="group block">
            <span className="block overflow-hidden rounded-md border border-[#e1e5eb] bg-white">
              <Image
                src={thumbOf(p)}
                alt={p.imageAlt}
                width={720}
                height={450}
                sizes="(min-width: 1024px) 290px, (min-width: 768px) 33vw, 45vw"
                className="aspect-[16/10] w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.04] motion-reduce:transition-none"
              />
            </span>
            <span className="mt-3 block text-[13px] font-bold text-[#1d5fd6] md:text-[14px]">{p.category}</span>
            <span className="mt-1 block break-keep text-[16px] font-bold leading-[1.4] tracking-[-0.02em] group-hover:underline md:text-[18px]">{p.title}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** "치과 홈페이지"처럼 모두 같은 꼬리가 붙는 제목에서 꼬리를 뗀다 */
const shortTitle = (t: string) => t.replace(/ 홈페이지$/, "");

function MockupGrid({ items }: { items: Project[] }) {
  return (
    <ul className="grid gap-y-14 md:grid-cols-2 md:gap-x-10 md:gap-y-[72px]" role="list">
      {items.map((p) => {
        const phone = mobileShotOf(p);
        return (
          <li key={p.id} className="min-w-0">
            <Link href={`/classic/sample/${slugOf(p.demoUrl)}`} className="group block">
              <span className="relative block pb-6 md:pb-7">
                <span className={`block overflow-hidden rounded-lg bg-white shadow-[0_1px_0_#e1e5eb,0_10px_30px_rgba(17,24,39,0.10)] ${phone ? "w-[84%]" : "w-full"}`}>
                  <span aria-hidden className="flex h-[18px] items-center gap-[5px] bg-[#f1f3f6] px-2.5 md:h-[22px]">
                    <i className="h-[6px] w-[6px] rounded-full bg-[#d1d5db] md:h-[7px] md:w-[7px]" />
                    <i className="h-[6px] w-[6px] rounded-full bg-[#d1d5db] md:h-[7px] md:w-[7px]" />
                    <i className="h-[6px] w-[6px] rounded-full bg-[#d1d5db] md:h-[7px] md:w-[7px]" />
                  </span>
                  <Image
                    src={thumbOf(p)}
                    alt={p.imageAlt}
                    width={720}
                    height={450}
                    sizes="(min-width: 1200px) 480px, (min-width: 768px) 42vw, 84vw"
                    className="aspect-[16/10] w-full object-cover object-top"
                  />
                </span>
                {phone && (
                  <span className="absolute bottom-0 right-0 block w-[24%] rounded-[18px] bg-[#111] p-[4px] shadow-[0_12px_30px_rgba(17,24,39,0.22)] transition-transform duration-300 ease-out group-hover:-translate-y-1.5 motion-reduce:transition-none md:rounded-[24px] md:p-[6px]">
                    <Image
                      src={phone}
                      alt=""
                      width={390}
                      height={736}
                      sizes="(min-width: 1200px) 140px, (min-width: 768px) 12vw, 24vw"
                      className="aspect-[390/736] w-full rounded-[14px] object-cover object-top md:rounded-[18px]"
                    />
                  </span>
                )}
              </span>
              <span className="mt-3 flex flex-col gap-1.5 lg:flex-row lg:items-end lg:justify-between lg:gap-6">
                <span className="block min-w-0">
                  <span className="block text-[14px] font-semibold text-[#5b6370]">
                    {p.category}
                    {p.layout && `, ${p.layout}`}
                  </span>
                  <span className="mt-1 block break-keep text-[19px] font-bold leading-[1.35] tracking-[-0.03em] group-hover:underline md:text-[21px]">{shortTitle(p.title)}</span>
                </span>
                <span className="block break-keep text-[15px] leading-[1.5] text-[#4b5563] lg:max-w-[55%] lg:text-right">{p.features.slice(0, 3).join(", ")}</span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
