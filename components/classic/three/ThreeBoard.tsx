import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { BoardClose, BoardShell } from "@/components/classic/board/ui";
import { Frame } from "@/components/classic/catalog/CatalogDialog";
import { LiveStage } from "@/components/classic/three/LiveStage";
import { Tilt } from "@/components/classic/three/Tilt";
import { threeDemos, threeMeta } from "@/data/classic/three";

// 11-27 대표 "구간은 다 줄여, 사람들은 시각적인 걸 선호하니 시각적인 부분에 신경 써, 설명은 AI 인용과 수집기에 잘 되도록 따로, 비교는 위키나 블로그에".
// 화면에는 3D가 움직이는 큰 그림과 한 줄 제목만 둔다. 패키지와 비용, 구현 범위, 절차, 비교표, 자주 묻는 질문은
// 위키 문서(app/(classic)/knowledge/3d-web)로 옮겼고, 이 페이지는 그 문서로 한 줄 연결한다.
// 순서: 3D 홈페이지(브랜드 첫 화면) > 공간 3D(시공 사례) > 제품 견적(직접 만지는 거실, 제품별 견적 화면) > 견적서까지 이어지는 흐름 > 문의.
// 앞선 판(3D 견적 화면 중심, 11개 구간)은 대표 "3D는 최선이야?"에서 견적 도구로만 보인다는 점이 걸려 바꿨다.

const V = "/videos/3d";
const demo = (id: string) => threeDemos.find((d) => d.href === `/3d/${id}/`)!;
const products = ["sofa", "configurator", "door"];

const pill = "inline-flex min-h-12 items-center gap-1.5 rounded-full border border-white/25 px-5 text-[16px] font-bold text-white hover:border-white/90";
const tag = "flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[14px] font-bold md:text-[15px]";
const big = "break-keep text-[26px] font-[800] leading-[1.25] tracking-[-0.045em] md:text-[40px]";

/** 큰 화면 한 장과 그 아래 이름표, 한 줄 제목, 체험하기 */
function Stage({ id, kind, name, head, href, children }: { id: string; kind: string; name: string; head: string; href: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="mt-20 md:mt-28">
      {children}
      <div className="mt-6 flex flex-col gap-5 md:mt-8 md:flex-row md:items-end md:justify-between md:gap-10">
        <div className="min-w-0">
          <p className={tag}>
            <span className="text-[#7aa7ff]">{kind}</span>
            <span aria-hidden className="h-3 w-px bg-white/25" />
            <span className="text-[#c9ced6]">{name}</span>
          </p>
          <h2 id={id} className={`mt-2 ${big}`}>{head}</h2>
        </div>
        <p className="shrink-0">
          <a href={href} aria-label={`${name} 체험하기`} className={pill}>
            체험하기 <ArrowUpRight size={17} aria-hidden />
          </a>
        </p>
      </div>
    </section>
  );
}

export function ThreeBoard() {
  const room = demo("room");
  const space = demo("space");
  return (
    <BoardShell no="01" en="3D WEB" kw="3D 홈페이지 제작" ice="3D로 만드는 " title="홈페이지" lead={`${threeMeta.lead}.`}>
      {/* 1. 3D 홈페이지: 내리면 선으로 그린 3D가 흩어졌다가 다음 장면으로 다시 짜이는 브랜드 첫 화면 */}
      <Stage id="t3d-brand" kind="3D 홈페이지" name="브랜드 첫 화면" head="내리는 대로 장면이 다시 짜입니다" href="/trend">
        <Tilt className="mt-10 md:mt-14">
          <Frame shot={{ src: `${V}/trend.jpg?v=11275`, frame: "browser", ratio: "16/10", alt: "3D 홈페이지를 내리며 웹과 앱, 시스템, AI, 클라우드 장면이 선으로 바뀌는 영상", video: { src: `${V}/trend.mp4?v=11275`, w: 960, h: 600 } }} sizes="(min-width: 1280px) 1200px, 92vw" />
        </Tilt>
      </Stage>

      {/* 2. 공간 3D: 시공 전과 후를 막대로 비교하고 3D와 평면도로 둘러보기 */}
      <Stage id="t3d-space" kind={space.category} name={space.title} head="시공 전과 후를 3D로 비교합니다" href={space.href}>
        <Tilt>
          <Frame shot={{ src: `${V}/space.jpg?v=11273`, frame: "browser", ratio: "16/10", alt: "시공 사례 3D 화면에서 시공 전후를 비교하고 평면도로 둘러보는 영상", video: { src: `${V}/space.mp4?v=11273`, w: 960, h: 600 } }} sizes="(min-width: 1280px) 1200px, 92vw" />
        </Tilt>
      </Stage>

      {/* 3. 제품 견적: 그 자리에서 직접 만지는 거실(가구를 놓고 옮기면 합계가 바뀐다)과 제품 하나짜리 견적 화면 셋 */}
      <section aria-labelledby="t3d-live" className="mt-20 md:mt-28">
        <Tilt>
        <LiveStage
          src={`${room.href}?embed=1`}
          href={room.href}
          title="3D 거실 상담 화면. 거실 크기를 정하고 가구를 놓고 옮기면 합계가 바뀝니다."
          poster={`${V}/room.jpg?v=11272`}
          stages={[{ min: 1180, src: `${V}/room-stage-1200.jpg` }, { min: 900, src: `${V}/room-stage-1000.jpg` }, { min: 768, src: `${V}/room-stage-800.jpg` }]}
          preview={{ src: `${V}/room-m.mp4?v=11273`, poster: `${V}/room-m.jpg?v=11272`, w: 390, h: 844, alt: "휴대폰에서 거실을 돌려 보고 소파 모듈을 붙이고 선반과 바닥을 바꾸는 화면" }}
          hint="가구를 눌러 고르고 끌어서 옮기면 합계가 같이 바뀝니다."
        >
          <p className={tag}>
            <span className="text-[#7aa7ff]">3D 견적</span>
            <span aria-hidden className="h-3 w-px bg-white/25" />
            <span className="text-[#c9ced6]">{room.title}</span>
          </p>
          <h2 id="t3d-live" className={`mt-2 ${big}`}>
            놓아 보고 바로 견적을 받습니다
          </h2>
        </LiveStage>
        </Tilt>
        <ul className="mt-6 grid grid-cols-3 gap-2 md:mt-8 md:gap-4" role="list" aria-label="제품별 3D 견적 화면">
          {products.map((id) => {
            const d = demo(id);
            return (
              <li key={id}>
                <a href={d.href} className="group block overflow-hidden rounded-[14px] border border-white/12 bg-[#0f131b] hover:border-white/40 md:rounded-[18px]">
                  <span className="relative block aspect-[16/10]">
                    <Image src={`${V}/${id}.jpg?v=11273`} alt={`${d.title} 3D 견적 화면`} fill sizes="(min-width: 768px) 400px, 30vw" className="object-cover object-top" />
                  </span>
                  <span className="flex items-center justify-between gap-2 px-2.5 py-2.5 text-[13px] font-bold text-white md:px-5 md:py-4 md:text-[16px]">
                    {d.title}
                    <ArrowUpRight size={17} aria-hidden className="hidden text-white/50 group-hover:text-white md:block" />
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </section>

      {/* 4. 고른 구성이 견적서가 되어 고객에게 가기까지. 그림 셋과 한 줄 이름만 */}
      <section aria-labelledby="t3d-flow" className="mt-20 md:mt-28">
        <h2 id="t3d-flow" className={big}>
          고른 구성이 그대로 견적서가 됩니다
        </h2>
        <ol className="mt-8 grid items-end gap-6 md:mt-10 md:grid-cols-[minmax(0,1.25fr)_auto_minmax(0,1.25fr)_auto_minmax(0,0.6fr)] md:gap-5" role="list">
          <li>
            <Frame shot={{ src: `${V}/door.jpg?v=11273`, frame: "browser", ratio: "16/10", alt: "현관 중문 3D 화면에서 문 방식과 색을 바꾸는 영상", video: { src: `${V}/door.mp4?v=11273`, w: 960, h: 600 } }} sizes="(min-width: 1024px) 460px, 92vw" />
            <p className="mt-3 text-[15px] font-bold text-[#c9ced6] md:text-[16px]">1. 고객이 3D로 고릅니다</p>
          </li>
          <li aria-hidden className="hidden pb-10 text-white/40 md:block"><ArrowRight size={26} /></li>
          <li>
            <span className="block overflow-hidden rounded-[14px] border border-white/12 bg-white">
              <Image src="/images/three/flow-quote.jpg" alt="거래장부 견적서. 현관 중문 3연동 슬라이딩, 폭 1,200mm, 합계 1,275,000원" width={1200} height={772} sizes="(min-width: 1024px) 460px, 92vw" className="block h-auto w-full" />
            </span>
            <p className="mt-3 text-[15px] font-bold text-[#c9ced6] md:text-[16px]">2. 견적서가 자동으로 작성됩니다</p>
          </li>
          <li aria-hidden className="hidden pb-10 text-white/40 md:block"><ArrowRight size={26} /></li>
          <li>
            <div className="mx-auto max-w-[200px] md:max-w-none">
              <Frame shot={{ src: "/images/three/flow-recv-m.jpg", frame: "phone", ratio: "390/580", alt: "고객 휴대폰의 받는 화면. 견적서 아래 받았어요와 수정 요청 단추" }} sizes="220px" />
            </div>
            <p className="mt-3 text-center text-[15px] font-bold text-[#c9ced6] md:text-left md:text-[16px]">3. 고객이 휴대폰으로 받습니다</p>
          </li>
        </ol>
      </section>

      <p className="mt-16 text-[15px] text-[#aab2bf] md:mt-20">
        제작 범위와 진행 절차, 비용은{" "}
        <Link href="/knowledge/3d-web" className="font-bold text-white underline decoration-white/30 underline-offset-4 hover:decoration-white">
          3D 홈페이지 제작 안내
        </Link>
        에 정리했습니다.
      </p>
      <BoardClose text="제품 사진과 치수를 보내 주시면 구성과 견적을 드립니다." />
    </BoardShell>
  );
}
