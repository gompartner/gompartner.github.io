// 샘플 화면의 "다른 샘플"을 누르면 보던 목록(/works, /works/[업종])의 같은 자리로 돌아가게 한다.
// 목록 주소·스크롤 위치·고른 조건을 이 탭(sessionStorage)에만 적어 둔다.

const SAVED = "list-return";
const RETURNING = "list-returning";

type Saved = { path: string; y: number; filters?: unknown };

function read(): Saved | null {
  try {
    return JSON.parse(sessionStorage.getItem(SAVED) ?? "null");
  } catch {
    return null;
  }
}

export function saveList(patch: Partial<Saved> & { path: string }) {
  try {
    const prev = read();
    const next = prev?.path === patch.path ? { ...prev, ...patch } : { y: 0, ...patch };
    sessionStorage.setItem(SAVED, JSON.stringify(next));
  } catch {}
}

/** "다른 샘플"이 갈 주소. 목록을 거치지 않고 들어왔으면 전체 목록. */
export function returnPath(): string {
  return read()?.path ?? "/works";
}

export function markReturning() {
  try {
    sessionStorage.setItem(RETURNING, "1");
  } catch {}
}

/** 샘플 화면에서 "다른 샘플"로 돌아온 참이면 적어 둔 값을 준다. */
export function returningTo(path: string): Saved | null {
  try {
    if (!sessionStorage.getItem(RETURNING)) return null;
  } catch {
    return null;
  }
  const saved = read();
  return saved?.path === path ? saved : null;
}

export function doneReturning() {
  try {
    sessionStorage.removeItem(RETURNING);
  } catch {}
}
