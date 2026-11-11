"use client";

import { useRouter } from "next/navigation";

// 개인정보처리방침 시행일 선택 상자. 고르면 그 버전 주소로 이동한다.
export function PrivacyVersionSelect({
  current,
  options,
}: {
  current: string;
  options: { id: string; href: string; label: string }[];
}) {
  const router = useRouter();
  return (
    <div className="flex flex-wrap items-center gap-3">
      <label htmlFor="privacy-version" className="text-[16px] font-bold text-[#15171c]">
        이전 개인정보처리방침
      </label>
      <select
        id="privacy-version"
        value={current}
        onChange={(e) => {
          const o = options.find((x) => x.id === e.target.value);
          if (o) router.push(o.href);
        }}
        className="h-11 rounded-md border border-[#c9ced6] bg-white px-3 text-[16px] text-[#15171c]"
      >
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
