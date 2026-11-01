"use client";

import { Search, X } from "lucide-react";

/** 검색창 하나. 자주 찾는 말 버튼을 함께 둔다 */
export function SearchBox({ id, value, onChange, placeholder, suggestions = [] }: { id: string; value: string; onChange: (v: string) => void; placeholder: string; suggestions?: string[] }) {
  return (
    <div>
      <div className="flex items-center border-2 border-[#15171c] bg-white">
        <Search size={20} aria-hidden className="ml-4 shrink-0 text-[#5b6370]" />
        <label htmlFor={id} className="sr-only">
          검색어
        </label>
        <input
          id={id}
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          className="h-14 min-w-0 flex-1 bg-transparent px-3 text-[17px] outline-none placeholder:text-[#8a94a6] [&::-webkit-search-cancel-button]:hidden"
        />
        {value ? (
          <button type="button" onClick={() => onChange("")} aria-label="검색어 지우기" className="mr-1 grid h-11 w-11 place-items-center text-[#5b6370] hover:text-[#15171c]">
            <X size={18} aria-hidden />
          </button>
        ) : null}
      </div>
      {suggestions.length > 0 ? (
        <ul className="mt-3 flex flex-wrap gap-2" role="list" aria-label="자주 찾는 말">
          {suggestions.map((s) => (
            <li key={s}>
              <button type="button" onClick={() => onChange(s)} className="min-h-9 rounded-full border border-[#d9dee5] bg-white px-3.5 text-[14px] font-bold text-[#3d4450] hover:border-[#256ef4] hover:text-[#256ef4]">
                {s}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
