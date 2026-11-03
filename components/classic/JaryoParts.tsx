import Image from "next/image";
import Link from "next/link";
import { Download, FileText } from "lucide-react";
import { pdfFor, type Jaryo } from "@/data/classic/jaryo";

// 1쪽 앞, 2쪽 뒤로 겹친 실물 미리보기. 두 장 모두 틀 안에 다 들어오게 고정 크기로 놓는다
export function JaryoPreview({ it, size = "sm", priority = false }: { it: Jaryo; size?: "sm" | "lg"; priority?: boolean }) {
  const box = size === "lg" ? "h-[380px] md:h-[520px]" : "h-[330px]";
  const group = size === "lg" ? "h-[330px] w-[340px] md:h-[470px] md:w-[480px]" : "h-[290px] w-[300px]";
  const front = size === "lg" ? "w-[210px] md:w-[300px]" : "w-[190px]";
  const back = size === "lg" ? "w-[196px] md:w-[280px]" : "w-[176px]";
  return (
    <div className={`relative flex items-center justify-center overflow-hidden bg-[#e9edf3] ${box}`}>
      <div className={`relative ${group}`}>
        <div className={`absolute right-0 top-6 rotate-[3deg] shadow-[0_6px_18px_rgba(15,27,61,0.14)] ${back}`}>
          <Image src={`/images/jaryo/${it.id}-2.jpg`} alt="" width={640} height={905} className="block h-auto w-full" />
        </div>
        <div className={`absolute left-0 top-0 -rotate-[2deg] shadow-[0_10px_28px_rgba(15,27,61,0.22)] ${front}`}>
          <Image src={`/images/jaryo/${it.id}-1.jpg`} alt={`${it.title} 1쪽`} width={640} height={905} className="block h-auto w-full" priority={priority} />
        </div>
      </div>
    </div>
  );
}

export function JaryoList({ it }: { it: Jaryo }) {
  return (
    <ul className="space-y-1.5 text-[16px] text-[#3d4450]" role="list">
      {it.parts.map((p) => (
        <li key={p} className="flex gap-2">
          <span aria-hidden className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#9aa6ba]" />
          {p}
        </li>
      ))}
    </ul>
  );
}

// view=false: 자료 한 장 페이지 안이라 '자료 보기' 없이 PDF 받기만
export function JaryoButtons({ it, view = true }: { it: Jaryo; view?: boolean }) {
  return (
    <div className={view ? "grid grid-cols-2 gap-2" : "grid gap-2 sm:max-w-[280px]"}>
      {view && (
        <Link
          href={`/jaryo/${it.id}`}
          data-gtm-cta={`jaryo_view_${it.id}`}
          className="inline-flex h-12 items-center justify-center gap-1.5 rounded-md bg-[#256ef4] px-3 text-[16px] font-bold text-white transition-colors hover:bg-[#0b50d0]"
        >
          <FileText size={18} aria-hidden />
          자료 보기
        </Link>
      )}
      <a
        href={pdfFor(it.id)}
        download
        data-gtm-cta={`jaryo_pdf_${it.id}`}
        className="inline-flex h-12 items-center justify-center gap-1.5 rounded-md border border-[#c9cfd8] bg-white px-3 text-[16px] font-bold text-[#15171c] transition-colors hover:border-[#15171c]"
      >
        <Download size={18} aria-hidden />
        PDF 받기
      </a>
    </div>
  );
}
