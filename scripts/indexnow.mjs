// 배포 후 사이트맵의 주소를 IndexNow로 알린다 (네이버, 빙 등이 받는다).
// 사용: node scripts/indexnow.mjs
const host = "gompartner.co.kr";
const key = "c76b25825077597c98c285aab88fd367";
const xml = await (await fetch(`https://${host}/sitemap.xml`)).text();
const urlList = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
for (const endpoint of ["https://searchadvisor.naver.com/indexnow", "https://api.indexnow.org/indexnow"]) {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host, key, keyLocation: `https://${host}/${key}.txt`, urlList }),
  });
  console.log(endpoint, res.status, urlList.length);
}
