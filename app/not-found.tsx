import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-[640px] flex-col items-start justify-center px-4">
      <p className="text-[15px] font-bold text-accent">404</p>
      <h1 className="mt-2 text-[28px] font-bold leading-[1.4]">페이지를 찾을 수 없습니다</h1>
      <p className="mt-2 text-[17px] text-foreground-secondary">주소가 바뀌었거나 없는 페이지입니다.</p>
      <div className="mt-8 flex flex-wrap gap-2">
        <Link href="/" className="inline-flex h-11 items-center rounded-md bg-accent px-5 font-bold text-accent-foreground hover:bg-accent-hover">
          첫 화면
        </Link>
        <Link href="/works" className="inline-flex h-11 items-center rounded-md border border-border px-5 font-bold hover:bg-surface">
          포트폴리오
        </Link>
        <Link href="/tools" className="inline-flex h-11 items-center rounded-md border border-border px-5 font-bold hover:bg-surface">
          자료실
        </Link>
      </div>
    </main>
  );
}
