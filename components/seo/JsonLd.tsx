import { profile } from "@/data/profile";
import { faqItems } from "@/data/faq";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://gom-senior.dev";

export function PersonJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    alternateName: profile.nameEn,
    jobTitle: profile.title,
    description: profile.bio,
    url: siteUrl,
    sameAs: [`${siteUrl}/blog`],
    address: {
      "@type": "PostalAddress",
      addressLocality: "서울",
      addressCountry: "KR",
    },
    email: profile.email,
    knowsAbout: [
      "Backend Development",
      "Java",
      "Spring",
      "Database",
      "Service Operations",
      "Legacy Modernization",
      "Small Business Websites",
      "Marketing Landing Pages",
      "Website Maintenance",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function FaqJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: {
        "@type": "Answer",
        text: answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function WebSiteJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    url: siteUrl,
    name: `${profile.name} Portfolio`,
    description: profile.bio,
    author: {
      "@type": "Person",
      name: profile.name,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
