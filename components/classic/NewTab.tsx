import { ExternalLink } from "lucide-react";

// 새 창으로 열리는 링크 끝에 붙이는 표시(11-26 사용자 "다른 서비스는 새창으로, 새창 표시").
// 사이트 안에서 쓰는 오른쪽 위 화살표와 구분되게 "상자에서 나가는 화살표" 아이콘을 쓰고, 화면 읽기 프로그램에는 "(새 창)"을 읽어 준다.
export const NEW_TAB = { target: "_blank", rel: "noopener noreferrer" } as const;
export const isOutside = (href: string) => /^https?:\/\//.test(href);

export function NewTabMark({ size = 15, className = "" }: { size?: number; className?: string }) {
  return (
    <>
      <ExternalLink size={size} aria-hidden className={`shrink-0 ${className}`} />
      <span className="sr-only">(새 창)</span>
    </>
  );
}
