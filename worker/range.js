// 영상 파일(/videos/*)의 조각 요청(Range)에 206으로 답한다.
// 11-26 배포 뒤 확인: 정적 호스팅이 Range 머리말을 무시하고 파일을 통째로 200으로 돌려준다(accept-ranges 없음).
// 아이폰, 아이패드는 영상을 조각으로 받아야 재생하므로 카탈로그와 3D 웹 페이지의 영상이 재생 불가로 나왔다.
// 영상은 모두 2MB 아래라 통째로 읽어 잘라 준다. 다른 주소는 이 코드를 거치지 않는다(wrangler.jsonc의 run_worker_first).
export default {
  async fetch(request, env) {
    const range = request.headers.get("range");
    const headers = new Headers(request.headers);
    headers.delete("range");
    const res = await env.ASSETS.fetch(new Request(request.url, { method: request.method, headers }));
    const out = new Headers(res.headers);
    out.set("accept-ranges", "bytes");
    const m = /^bytes=(\d*)-(\d*)$/.exec((range || "").trim());
    if (!m || (m[1] === "" && m[2] === "") || request.method !== "GET" || res.status !== 200) {
      return new Response(res.body, { status: res.status, headers: out });
    }
    const buf = await res.arrayBuffer();
    const size = buf.byteLength;
    // "bytes=-500"은 끝에서 500바이트, "bytes=100-"은 100번째부터 끝까지
    const start = m[1] === "" ? Math.max(0, size - Number(m[2])) : Number(m[1]);
    const end = m[1] !== "" && m[2] !== "" ? Math.min(Number(m[2]), size - 1) : size - 1;
    if (start >= size || start > end) {
      return new Response(null, { status: 416, headers: { "content-range": `bytes */${size}`, "accept-ranges": "bytes" } });
    }
    out.set("content-range", `bytes ${start}-${end}/${size}`);
    out.set("content-length", String(end - start + 1));
    out.delete("content-encoding");
    return new Response(buf.slice(start, end + 1), { status: 206, headers: out });
  },
};
