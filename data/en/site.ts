// 11-04 영문 페이지 내용. 업워크 프로필(01_Work/01_Active/업워크/프로필.md)과 같은 방향: 한국 시장에 들어오려는 해외 회사.
// 문장은 짧고 쉬운 영어로. 결과(노출 순위, 결제 승인)를 약속하는 말은 쓰지 않는다.

export const enNav = [
  { href: "/en/naver-setup", label: "Naver setup" },
  { href: "/en/korean-payments", label: "Korean payments" },
  { href: "/en/localization", label: "Localization" },
  { href: "/en/3d", label: "3D configurators" },
  { href: "/en/works", label: "Samples" },
];

export type EnService = {
  slug: string;
  title: string;
  metaTitle: string;
  description: string;
  lead: string;
  forWhom: string[];
  scope: { title: string; items: string[] }[];
  note: string;
  faq: { q: string; a: string }[];
};

export const enServices: EnService[] = [
  {
    slug: "naver-setup",
    title: "Naver setup for your Korean website",
    metaTitle: "Naver SEO setup for foreign companies",
    description: "Naver Search Advisor registration, sitemap submission and Naver Smart Place listing for companies launching in Korea.",
    lead: "Get found where Korean customers search. I register your site with Naver, submit your pages and set up your Naver Map listing.",
    forWhom: [
      "You launched a Korean site, but it does not show up on Naver",
      "Your store, clinic or office is in Korea and should appear on Naver Map",
      "You publish news or blog posts in Korean and want them found",
    ],
    scope: [
      { title: "Naver Search Advisor", items: ["Site ownership check", "Sitemap and RSS submission", "Robots.txt and page check", "Korean titles and descriptions for search results"] },
      { title: "Naver Smart Place", items: ["Naver Map listing for a location in Korea", "Opening hours, photos and booking link", "Business description in Korean"] },
      { title: "Naver Blog", items: ["Blog setup and profile", "Links between your blog and website", "First posts in natural Korean"] },
    ],
    note: "Naver decides when and where your pages appear. I set everything up correctly and show you what was submitted, but no one can promise a ranking. Smart Place needs a real address in Korea.",
    faq: [
      { q: "Is Google not enough in Korea?", a: "Google is used too, but many Korean customers check Naver first, especially for local businesses, clinics and stores." },
      { q: "Do I need a Korean business registration?", a: "Not for Search Advisor. Smart Place needs a location in Korea, and Naver may ask for business documents to confirm it." },
      { q: "How long until my site shows up?", a: "It usually takes from a few days to a few weeks after submission. It depends on your site and how often it changes." },
      { q: "Will I have access to the accounts?", a: "Yes. The Naver accounts are in your company's name, and you get all logins at the end." },
    ],
  },
  {
    slug: "korean-payments",
    title: "Korean payment integration",
    metaTitle: "Toss Payments, KakaoPay and Naver Pay integration",
    description: "Add the checkout Korean shoppers expect: card payments through Toss Payments, KakaoPay and Naver Pay for web stores and booking sites.",
    lead: "Add the checkout Korean shoppers expect. Card payments through Toss Payments, plus KakaoPay and Naver Pay, on your web store or booking site.",
    forWhom: [
      "Your store takes only international cards, and Korean customers leave at checkout",
      "You run bookings or classes in Korea and want people to pay online",
      "You still confirm bank transfers by hand",
    ],
    scope: [
      { title: "Card payments", items: ["Toss Payments integration", "Virtual account and bank transfer", "Refunds and cancels from your admin"] },
      { title: "Easy pay", items: ["KakaoPay", "Naver Pay", "Checkout that works well on phones"] },
      { title: "Order flow", items: ["Order and payment status in your admin", "Email or KakaoTalk message after payment", "Test payments before launch"] },
    ],
    note: "The payment contract is between your company and the payment provider. Most providers need a Korean business registration. I check your situation first and tell you which option fits before I quote.",
    faq: [
      { q: "Can a company without a Korean entity use these payments?", a: "It depends on the provider. Some have options for overseas sellers, but most need a Korean business registration. I check this before we start." },
      { q: "Which sites do you work with?", a: "Custom sites built with Next.js, React or Node.js, and Korean site builders such as Cafe24 and Imweb." },
      { q: "Who owns the payment account?", a: "You do. The contract and the money go to your company. I only build the connection to your site." },
      { q: "Do you test before launch?", a: "Yes. I run test payments, cancels and refunds with the provider's test keys, then switch to live keys with you." },
    ],
  },
  {
    slug: "localization",
    title: "Korean localization and compliance",
    metaTitle: "Korean website localization and PIPA privacy policy",
    description: "Natural Korean copy, Korean fonts and layout, and the privacy policy and footer details Korean law expects.",
    lead: "Make your site read like it was written in Korea, and add the pages Korean law expects.",
    forWhom: [
      "Your Korean pages were machine translated and read awkwardly",
      "Korean text breaks in odd places or uses the wrong font",
      "You collect names, emails or phone numbers from Korean users",
    ],
    scope: [
      { title: "Korean copy", items: ["Natural Korean writing, not machine translation", "Product, menu and button text", "Korean titles and descriptions for search"] },
      { title: "Korean layout", items: ["Korean web fonts", "Line breaks that keep Korean words whole", "Date, phone, address and price formats"] },
      { title: "Compliance basics", items: ["Privacy policy under PIPA", "Consent checkbox for personal data", "Business details in the footer for online stores"] },
    ],
    note: "I write these pages from standard Korean templates. For legal advice about your own company, please check with a Korean lawyer.",
    faq: [
      { q: "Do you translate from English?", a: "Yes. I write the Korean version from your English text and keep your brand terms the same everywhere. I can also review a Korean translation you already have." },
      { q: "What must an online store show in Korea?", a: "Stores selling to Korean consumers show the company name, representative, business registration number, mail-order business number, address and contact details, usually in the footer." },
      { q: "Can you work on my existing site?", a: "Yes. I can update text and pages on most sites, including WordPress, Cafe24, Imweb and custom React or Next.js sites." },
    ],
  },
];

export const enSteps = [
  { title: "Reply within 24 hours", text: "Korea time (GMT+9). I work best in writing." },
  { title: "Plan and fixed price", text: "You get a short plan and a fixed price before any work starts." },
  { title: "Build and check", text: "I do the work and test it on phones and desktop." },
  { title: "Hand over", text: "Source code, all account access and a short guide are yours." },
];

/** 영문 카탈로그. 데모는 한국어 화면 그대로(한국 손님이 보는 모습) */
export const enWorks: { title: string; items: { slug: string; title: string; text: string }[] }[] = [
  {
    title: "Online stores",
    items: [
      { slug: "online-store", title: "Ceramics studio web store", text: "Glaze and size options, engraving text, add-on products and shipping info." },
      { slug: "shop-admin", title: "Store order admin", text: "Option combinations, stock per combination, bulk order status and tracking number export." },
      { slug: "liquor-shop", title: "Traditional liquor shop", text: "Age check, products by type, gift sets and tasting bookings." },
    ],
  },
  {
    title: "Bookings",
    items: [
      { slug: "pension", title: "Seaside guesthouse", text: "Room photos, availability by room and date, price calculator and refund policy." },
      { slug: "small-business-homepage", title: "Private gym booking", text: "Hourly booking by location, card or bank transfer, and a QR code for entry." },
      { slug: "campsite", title: "Campsite booking", text: "Site map, six-week availability calendar and equipment rental totals." },
      { slug: "pilates-studio", title: "Pilates studio", text: "Weekly class timetable, lesson comparison, fees and trial lesson request." },
    ],
  },
  {
    title: "Companies and B2B",
    items: [
      { slug: "company", title: "Precision machining company", text: "Equipment list, machining specs and a quote form with drawing upload. Korean and English." },
      { slug: "saas-startup", title: "Restaurant inventory SaaS", text: "Feature tabs, monthly and yearly plans, comparison table and demo request." },
      { slug: "logistics", title: "Fulfillment company", text: "Same-day shipping schedule, prices per service and warehouse info." },
      { slug: "food-oem", title: "Food OEM manufacturer", text: "Products by package type, minimum order quantity, process and sample requests." },
    ],
  },
  {
    title: "Campaign landing pages",
    items: [
      { slug: "landing-popup-store", title: "Pop-up store pre-booking", text: "Date and time slot booking, seats left, entry info and directions." },
      { slug: "landing-zine-fair", title: "Book fair pre-registration", text: "Seller search, booth map and a personal booth route." },
      { slug: "landing-water-rental", title: "Rental consultation page", text: "Monthly price comparison, reviews and a call-back request form." },
    ],
  },
  {
    title: "Clinics and services",
    items: [
      { slug: "clinic-homepage", title: "Dermatology clinic", text: "Treatments and cosmetic procedures, opening hours by day and a price list." },
      { slug: "dental-homepage", title: "Dental clinic", text: "Guides by symptom, non-insured fees, evening hours and booking." },
      { slug: "visa-agent", title: "Visa agency for foreigners", text: "Visa types, extension guide, document lists and consultation request. Korean and English." },
    ],
  },
  {
    title: "Apps and kiosks",
    items: [
      { slug: "app-pilates", title: "Pilates member app", text: "Class booking with seats left, remaining sessions, waitlist and attendance." },
      { slug: "kiosk-clinic", title: "Clinic check-in kiosk", text: "New or returning patient check-in, phone check and a queue number. Large text and voice mode." },
    ],
  },
];

/** 영문 3D 페이지. 금액과 기간은 한국어 /3d(data/classic/three.ts)와 같다 */
export const enThree = {
  metaTitle: "3D product configurator for your website",
  description: "Customers build the product in 3D on your website, see the price right away and send you the exact setup. From KRW 1,800,000.",
  heroTitle: "3D configurators your customers can build",
  lead: "Customers build the product in 3D on your website, see the price right away and send you the exact setup with their request.",
  forWhom: [
    "You answer the same price questions again and again",
    "Site visits often end without an order",
    "Colors and materials are hard to explain with photos",
    "Customers want to see the finished product before they order",
  ],
  scope: [
    { title: "3D view", items: ["Rotate 360 degrees", "Enter width and height, swap modules", "Change colors and materials", "Switch between 3D, floor plan and walk-through"] },
    { title: "Price", items: ["Your price list and option rules built in", "Total updates as customers choose", "Share a setup by link"] },
    { title: "Requests", items: ["Setup, price and contact sent together", "Delivered by email or Google Sheets", "Open the customer's setup again in 3D"] },
    { title: "Your website", items: ["Linked from your current site by menu or button", "Photo and option table if 3D cannot load", "Update options and prices in a spreadsheet file"] },
  ],
  sample: {
    title: "Quote request: modular sofa",
    from: "Sent from a furniture showroom website",
    rows: [
      ["Name", "Jeong ○○"],
      ["Phone", "010-****-5678"],
      ["Area", "Gwanak-gu, Seoul"],
      ["Setup", "3 single modules, 2 armrests, water-repellent fabric in oatmeal, oak legs"],
    ] as [string, string][],
    total: "KRW 3,604,000",
  },
  plans: [
    { name: "Space 3D viewer", price: "KRW 1,800,000", period: "3 weeks", summary: "Interior and stay spaces in 3D", includes: ["One 3D file", "3D, floor plan and walk-through", "Share by link"] },
    { name: "Brand 3D website", price: "KRW 2,500,000", period: "4 weeks", summary: "A brand website that opens with a 3D scene", includes: ["One 3D scene", "Four scroll camera scenes", "Menu and booking form"] },
    { name: "Product 3D configurator", price: "KRW 4,500,000", period: "5 weeks", summary: "Product setup and quote requests", includes: ["One product, four options", "Live price", "Share setup, quote request"] },
  ],
  common: ["Source code and original 3D files", "Linking to your current website", "Device test report", "One month of free bug fixes"],
  planNote: "Prices exclude VAT and assume you send 3D files. Modeling is extra if you do not have them.",
  extras: [
    ["3D modeling (no files yet)", "from KRW 300,000 per product"],
    ["Admin page for options and prices", "KRW 800,000"],
    ["Extra product", "from KRW 600,000 each"],
    ["English interface", "KRW 200,000"],
    ["Monthly hosting and product updates", "from KRW 100,000 / month"],
  ] as [string, string][],
  demos: [
    { href: "/3d/sofa/", img: "/3d/assets/thumb/sofa.jpg", title: "Modular sofa", text: "Change modules, fabric and legs and the price updates." },
    { href: "/3d/configurator/", img: "/3d/assets/thumb/configurator.jpg", title: "Shelving system", text: "Fit units to the wall, add drawers and doors, get a quote." },
    { href: "/3d/door/", img: "/3d/assets/thumb/door.jpg", title: "Entrance door", text: "Pick the door type, frame color and glass, get a quote." },
    { href: "/3d/space/", img: "/3d/assets/thumb/space.jpg", title: "Interior project", text: "A finished apartment in 3D, floor plan and walk-through." },
    { href: "/3d/sign/", img: "/3d/assets/thumb/sign.jpg", title: "Channel letter sign", text: "Type a store name and see the sign on the wall with a price." },
    { href: "/3d/hanok/", img: "/3d/assets/thumb/hanok.jpg", title: "Hanok tea house", text: "A website where the camera follows the space as you scroll." },
  ],
  steps: [
    { title: "Files", text: "1 day. I review product photos, sizes, drawings and your price list." },
    { title: "3D draft", text: "1 week. One product in 3D first, so you can check it on your phone." },
    { title: "Build", text: "2 to 3 weeks. Options, price and requests, linked to your site." },
    { title: "Device check", text: "3 days. Phones, tablets, desktop and devices where 3D cannot load." },
    { title: "Hand over", text: "1 month of free bug fixes after delivery." },
  ],
  faq: [
    { q: "What if I do not have 3D files?", a: "Send product photos and sizes, or drawings (DWG, DXF, PDF). I model the product first and quote it after I see the files." },
    { q: "Which 3D files do you accept?", a: "GLB, GLTF, FBX and OBJ, plus DWG, DXF and PDF drawings." },
    { q: "Is it slow on phones?", a: "I reduce polygons and texture sizes and limit the resolution per device. You check the speed on your phone at the draft stage." },
    { q: "Can I change options and prices later?", a: "Yes. They live in a spreadsheet file separate from the code. An admin page or monthly updates are also available." },
  ],
};
