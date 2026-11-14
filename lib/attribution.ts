// 11-14 유입 기억: 블로그에서 견적 질문지로 들어와 다른 페이지를 거쳐 상담 신청을 해도
// 시트의 유입 경로, 캠페인, 이전 페이지 칸에 처음 들어온 곳이 남게 한다.
// 모든 페이지 첫 실행 때 firstTouchScript가 주소의 utm 꼬리표나 바깥 이전 페이지를 localStorage(gp_src)에 적는다.
// utm이 있으면 늘 새로 적고, 꼬리표 없는 바깥 이전 페이지는 저장된 utm이 없을 때만 적는다. 30일이 지나면 쓰지 않는다.
const KEY = "gp_src";
const DAYS = 30;

export const firstTouchScript = `try{var q=new URLSearchParams(location.search),s=q.get('utm_source'),r=document.referrer,ext=!!r&&r.indexOf(location.origin)!==0&&!/^https?:\\/\\/([a-z0-9-]+\\.)?gompartner\\.co\\.kr/i.test(r);if(s||ext){var o={s:s||'',c:[q.get('utm_campaign'),q.get('utm_content'),q.get('utm_term')].filter(Boolean).join(', '),r:ext?r:'',l:location.pathname,t:Date.now()},old=null;try{old=JSON.parse(localStorage.getItem('${KEY}')||'null')}catch(e){}if(s||!old||!old.s||Date.now()-old.t>${DAYS}*864e5)localStorage.setItem('${KEY}',JSON.stringify(o))}}catch(e){}`;

type Stored = { s: string; c: string; r: string; l: string; t: number };

/** 신청서에 넣을 유입 값. 지금 주소의 utm이 먼저, 없으면 30일 안에 기억한 첫 유입. */
export function readAttribution(): { utm_source: string; utm_campaign: string; referrer: string } {
  const q = new URLSearchParams(window.location.search);
  const ref = document.referrer;
  const external = !!ref && !ref.startsWith(window.location.origin) && !/^https?:\/\/([a-z0-9-]+\.)?gompartner\.co\.kr/i.test(ref);
  if (q.get("utm_source")) {
    return {
      utm_source: q.get("utm_source") ?? "",
      utm_campaign: [q.get("utm_campaign"), q.get("utm_content"), q.get("utm_term")].filter(Boolean).join(", "),
      referrer: ref,
    };
  }
  let st: Stored | null = null;
  try {
    st = JSON.parse(localStorage.getItem(KEY) || "null");
  } catch {}
  if (st && Date.now() - st.t > DAYS * 864e5) st = null;
  if (!st) return { utm_source: "", utm_campaign: "", referrer: ref };
  const host = (() => {
    try {
      return st!.r ? new URL(st!.r).hostname.replace(/^www\./, "") : "";
    } catch {
      return "";
    }
  })();
  return {
    utm_source: st.s || host,
    utm_campaign: [st.c, st.l && `첫 페이지 ${st.l}`].filter(Boolean).join(", "),
    referrer: external ? ref : st.r || ref,
  };
}
