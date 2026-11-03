import { EnContactForm } from "@/components/en/EnContactForm";
import { h2, wrap } from "@/components/en/EnShell";
import { profile } from "@/data/classic/profile";

// 11-04 영문 페이지 아래 공통 문의 영역
export function EnContact({ text = "Tell me what you are launching in Korea. I reply within 24 hours with questions or a short plan." }: { text?: string }) {
  return (
    <section id="contact" aria-labelledby="contact-h" className="scroll-mt-28 bg-[#f4f6f9]">
      <div className={`${wrap} grid gap-10 py-16 md:py-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:gap-16`}>
        <div>
          <h2 id="contact-h" className={h2}>
            Contact
          </h2>
          <p className="mt-4 text-[17px] leading-[1.6] text-[#3d4450]">{text}</p>
          <p className="mt-4 text-[17px] leading-[1.6] text-[#3d4450]">
            Or email{" "}
            <a href={`mailto:${profile.email}`} className="font-bold text-[#1d5fd6] underline-offset-4 hover:underline">
              {profile.email}
            </a>
          </p>
        </div>
        <EnContactForm />
      </div>
    </section>
  );
}
