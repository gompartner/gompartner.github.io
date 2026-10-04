import type { Metadata } from "next";
import { profile } from "@/data/profile";

export const metadata: Metadata = {
  title: "개인정보처리방침",
  description: `${profile.name} 사이트의 개인정보처리방침입니다.`,
  alternates: { canonical: "/privacy" },
};

const effectiveDate = "2026년 10월 4일";

const sections: { title: string; body: (string | string[])[] }[] = [
  {
    title: "1. 처리 목적",
    body: [
      `${profile.name}(이하 "운영자")는 홈페이지 제작 상담에 답하고, 사이트 이용 통계를 확인하는 데에만 개인정보를 처리합니다. 목적이 바뀌면 미리 알려 드립니다.`,
    ],
  },
  {
    title: "2. 처리하는 항목",
    body: [
      [
        "채팅 상담: 상담 중 직접 남기신 이름, 연락처, 이메일, 상담 내용",
        "이메일 문의: 보내신 이메일 주소와 내용",
        "방문 기록: 접속 IP, 브라우저와 기기 정보, 방문한 페이지, 방문 시각, 쿠키",
      ],
      "회원가입과 결제 기능이 없어 그 밖의 정보는 받지 않습니다. 크몽에서 주문하신 경우의 정보는 크몽의 개인정보처리방침을 따릅니다.",
    ],
  },
  {
    title: "3. 보유 기간",
    body: [
      [
        "상담 내용과 이메일: 상담이 끝난 날부터 1년",
        "방문 기록: 수집한 날부터 최대 14개월",
      ],
      "법령에서 따로 보관하도록 정한 경우에는 그 기간 동안 보관합니다.",
    ],
  },
  {
    title: "4. 제3자 제공",
    body: ["개인정보를 다른 곳에 제공하지 않습니다. 법령에 근거한 요청이 있는 경우에만 예외로 합니다."],
  },
  {
    title: "5. 처리 위탁과 국외 이전",
    body: [
      "사이트 운영을 위해 아래 업체의 서비스를 씁니다.",
      [
        "주식회사 채널코퍼레이션(채널톡): 채팅 상담 접수와 보관",
        "Google LLC(구글 태그 매니저): 방문 통계. 미국으로 이전되며, 방문할 때 쿠키로 수집됩니다.",
        "GitHub, Inc.(GitHub Pages): 사이트 호스팅. 접속 기록이 미국 서버에 남습니다.",
      ],
      "이전을 원하지 않으시면 브라우저에서 쿠키를 거부하거나 사이트 이용을 멈추시면 됩니다.",
    ],
  },
  {
    title: "6. 파기",
    body: ["보유 기간이 지나거나 목적을 이루면 바로 지웁니다. 전자 파일은 복구할 수 없게 지우고, 종이 문서는 분쇄합니다."],
  },
  {
    title: "7. 정보주체의 권리",
    body: [
      "언제든 내 개인정보를 보거나, 고치거나, 지우거나, 처리를 멈춰 달라고 요청하실 수 있습니다. 아래 이메일로 요청하시면 10일 안에 처리해 드립니다.",
    ],
  },
  {
    title: "8. 안전 조치",
    body: ["상담 기록은 운영자만 볼 수 있는 계정에 보관합니다. 사이트는 HTTPS로만 접속됩니다."],
  },
  {
    title: "9. 쿠키",
    body: [
      "방문 통계와 채팅 상담을 위해 쿠키를 씁니다. 브라우저 설정에서 쿠키를 거부할 수 있으며, 거부해도 사이트를 보는 데에는 문제가 없습니다. 채팅 상담은 쿠키를 거부하면 이어서 대화하기 어려울 수 있습니다.",
    ],
  },
  {
    title: "10. 개인정보 보호책임자",
    body: [[`책임자: ${profile.name} 운영자`, `이메일: ${profile.email}`], "개인정보 침해 신고는 개인정보침해신고센터(국번 없이 118)에도 하실 수 있습니다."],
  },
];

export default function PrivacyPage() {
  return (
    <div className="mx-auto w-full max-w-[800px] px-4 pb-16 pt-14 md:px-6 md:py-14">
      <h1 className="text-[28px] font-bold leading-[1.4] tracking-[-0.01em] md:text-[36px]">개인정보처리방침</h1>
      <p className="mt-2 text-[17px] leading-[1.6] text-foreground-secondary">시행일 {effectiveDate}</p>
      <div className="mt-10 space-y-10">
        {sections.map((s) => (
          <section key={s.title}>
            <h2 className="text-[20px] font-bold leading-[1.5]">{s.title}</h2>
            <div className="mt-3 space-y-3 text-[17px] leading-[1.7] text-foreground-secondary">
              {s.body.map((b, i) =>
                Array.isArray(b) ? (
                  <ul key={i} className="list-disc space-y-1 pl-5">
                    {b.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p key={i}>{b}</p>
                ),
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
