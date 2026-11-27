import type { Metadata } from "next";
import { COMPANY_PROFILE_URL } from "@/data/classic/companyProfile";
import { LEAD_ENDPOINT } from "@/data/classic/leadEndpoint";

// 접수 완료 화면과 자동 메일의 "회사소개서 보기"가 거쳐 가는 곳. 열람 시각을 시트에 남기고 드라이브 PDF로 넘긴다.
export const metadata: Metadata = { title: "회사소개서", robots: { index: false, follow: false } };

export default function ProfilePage() {
  const js = `(function(){var q=new URLSearchParams(location.search);var id=q.get("id")||"";var to=${JSON.stringify(COMPANY_PROFILE_URL)};
var go=function(){location.replace(to)};
if(!id){go();return}
try{fetch(${JSON.stringify(LEAD_ENDPOINT)},{method:"POST",keepalive:true,body:JSON.stringify({action:"profile_view",id:id.slice(0,20),from:(q.get("from")||"").slice(0,10)})}).finally(go)}catch(e){go()}
setTimeout(go,1500)})()`;
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: js }} />
      <p style={{ padding: 24, fontFamily: "sans-serif" }}>
        <a href={COMPANY_PROFILE_URL}>회사소개서로 이동합니다</a>
      </p>
    </>
  );
}
