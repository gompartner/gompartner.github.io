import Link from "next/link";
import { profile } from "@/data/profile";

// 데모 하단의 가짜 상호·사업자 정보 대신 넣는 곰파트너 정보. 색은 각 데모 바닥글 글자색을 따른다.
export function DemoMakerInfo({ className = "" }: { className?: string }) {
  const tel = profile.phone.replace(/-/g, "");
  return (
    <div className={`text-[14px] leading-[1.7] ${className}`}>
      <p className="font-bold">이 사이트는 {profile.name}가 만든 홈페이지 샘플이에요</p>
      <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 opacity-90">
        <a href={`tel:${tel}`} data-gtm-cta="demo_footer_tel" className="underline-offset-4 hover:underline">
          전화 {profile.phone}
        </a>
        <a href={`mailto:${profile.email}`} data-gtm-cta="demo_footer_email" className="underline-offset-4 hover:underline">
          {profile.email}
        </a>
        <Link href="/" data-gtm-cta="demo_footer_home" className="underline-offset-4 hover:underline">
          gompartner.co.kr
        </Link>
      </p>
    </div>
  );
}
