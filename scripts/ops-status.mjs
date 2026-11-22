// 11-22 운영 기준 페이지(/maintenance/standard)에 쓰는 값. 빌드 직전(prebuild)에 실제 인증서와 도메인 만료일을 읽어 둔다.
// 네트워크가 안 되면 값 없이 둔다(페이지는 그 줄을 숨긴다). 결과 파일은 커밋하지 않는다(.gitignore).
import { writeFileSync } from "node:fs";
import tls from "node:tls";
import { fileURLToPath } from "node:url";

const HOST = "gompartner.co.kr";
const out = fileURLToPath(new URL("../data/classic/ops-status.json", import.meta.url));
const withTimeout = (p, ms) => Promise.race([p, new Promise((_, no) => setTimeout(() => no(new Error("timeout")), ms))]);

const cert = () =>
  new Promise((ok, no) => {
    const s = tls.connect({ host: HOST, port: 443, servername: HOST }, () => {
      const c = s.getPeerCertificate();
      s.end();
      c?.valid_to ? ok({ expires: new Date(c.valid_to).toISOString(), issuer: c.issuer?.O || "" }) : no(new Error("no cert"));
    });
    s.on("error", no);
  });
const domain = async () => {
  const r = await fetch(`https://rdap.nic.or.kr/domain/${HOST}`, { headers: { accept: "application/rdap+json" } });
  const j = await r.json();
  const e = (j.events || []).find((x) => x.eventAction === "expiration");
  if (!e) throw new Error("no expiration");
  return new Date(e.eventDate).toISOString();
};

const [c, d] = await Promise.allSettled([withTimeout(cert(), 8000), withTimeout(domain(), 8000)]);
const data = {
  checkedAt: new Date().toISOString(),
  tls: c.status === "fulfilled" ? c.value : null,
  domainExpires: d.status === "fulfilled" ? d.value : null,
};
writeFileSync(out, JSON.stringify(data, null, 2) + "\n");
console.log("운영 상태:", JSON.stringify(data));
