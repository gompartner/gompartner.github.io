import Image from "next/image";
import { Check, FileText } from "lucide-react";
import { h2, wrap } from "@/components/classic/ui";

// 납품물 구역. 유지보수 세부 페이지와 같은 모양(왼쪽 목록, 오른쪽 작업 장면 사진). 문서 그림은 쓰지 않는다(11-01).
export function DeliverBlock({ id, title = "납품물", name, items, photo }: { id: string; title?: string; name: string; items: string[]; photo: string }) {
  return (
    <section aria-labelledby={id} className="border-t border-[#e6e9ee]">
      <div className={`${wrap} grid items-center gap-10 py-16 md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] md:gap-14 md:py-24`}>
        <div>
          <h2 id={id} className={h2}>
            {title}
          </h2>
          <p className="mt-4 flex items-center gap-2 text-[20px] font-[800] text-[#256ef4]">
            <FileText size={22} aria-hidden />
            {name}
          </p>
          <ul className="mt-6 border-t-2 border-[#15171c]" role="list">
            {items.map((item) => (
              <li key={item} className="flex gap-2 border-b border-[#e6e9ee] py-3.5 text-[17px]">
                <Check size={20} strokeWidth={2.5} className="mt-[3px] shrink-0 text-[#256ef4]" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative aspect-[16/10] overflow-hidden rounded-lg">
          <Image src={photo} alt={`${name} 작업 장면`} fill sizes="(min-width: 768px) 560px, 92vw" className="object-cover" />
        </div>
      </div>
    </section>
  );
}
