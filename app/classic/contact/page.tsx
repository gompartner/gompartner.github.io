import type { Metadata } from "next";
import { MessageCircle } from "lucide-react";
import { ContactForm } from "@/components/classic/contact/ContactForm";
import { PageHead, btnLine, wrap } from "@/components/classic/ui";
import { ChannelTalkButton } from "@/components/layout/ChannelTalk";
import { processSteps } from "@/data/classic/faq";

export const metadata: Metadata = {
  title: "상담 신청",
};

export default function ClassicContactPage() {
  return (
    <>
      <PageHead title="상담 신청" trail={[{ href: "/classic/contact", label: "상담 신청" }]} />

      <div className={`${wrap} grid gap-14 py-12 md:py-16 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-16`}>
        <section aria-label="상담 신청서" className="min-w-0">
          <ContactForm />
        </section>

        <aside aria-labelledby="contact-steps" className="min-w-0 lg:pt-8">
          <h2 id="contact-steps" className="text-[22px] font-extrabold tracking-[-0.03em]">
            진행 절차
          </h2>
          <ol className="mt-4 border-t-2 border-[#15171c]">
            {processSteps.map((s, n) => (
              <li key={s.title} className="flex gap-4 border-b border-[#e6e9ee] py-4">
                <span className="w-6 shrink-0 text-[15px] font-bold tabular-nums text-[#256ef4]">{n + 1}</span>
                <div className="min-w-0">
                  <p className="text-[17px] font-bold">{s.title}</p>
                  <p className="mt-1 text-[15px] leading-[1.6] text-[#5b6370]">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
          <ChannelTalkButton cta="classic_contact_aside_chat" className={`${btnLine} mt-6 w-full gap-2`}>
            <MessageCircle size={18} aria-hidden />
            채팅 상담
          </ChannelTalkButton>
        </aside>
      </div>
    </>
  );
}
