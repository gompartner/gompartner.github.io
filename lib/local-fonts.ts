import localFont from "next/font/local";

// 구글 폰트를 쓰는 글자만 남겨 저장소에 둔 것. 빌드 때 구글에 접속하지 않는다.
// 문구를 고치면 python3 scripts/subset_google_fonts.py 로 다시 만든다.
// 이름은 next/font/google 과 같게 두고, 스크립트가 이 이름으로 글자를 모을 파일을 찾는다.

export const Black_Han_Sans = localFont({
  src: "../assets/fonts/google/BlackHanSans-Regular.woff2",
  weight: "400",
  variable: "--font-sfx",
  display: "swap",
});

export const IBM_Plex_Sans_KR = localFont({
  src: [
    { path: "../assets/fonts/google/IBMPlexSansKR-Regular.woff2", weight: "400" },
    { path: "../assets/fonts/google/IBMPlexSansKR-Bold.woff2", weight: "700" },
  ],
  display: "swap",
  preload: false,
});

export const Jua = localFont({
  src: "../assets/fonts/google/Jua-Regular.woff2",
  weight: "400",
  display: "swap",
  preload: false,
});

export const Gowun_Batang = localFont({
  src: [
    { path: "../assets/fonts/google/GowunBatang-Regular.woff2", weight: "400" },
    { path: "../assets/fonts/google/GowunBatang-Bold.woff2", weight: "700" },
  ],
  display: "swap",
  preload: false,
});

export const Nanum_Pen_Script = localFont({
  src: "../assets/fonts/google/NanumPenScript-Regular.woff2",
  weight: "400",
  display: "swap",
  preload: false,
});

export const Nanum_Gothic_Coding = localFont({
  src: [
    { path: "../assets/fonts/google/NanumGothicCoding-Regular.woff2", weight: "400" },
    { path: "../assets/fonts/google/NanumGothicCoding-Bold.woff2", weight: "700" },
  ],
  display: "swap",
  preload: false,
});

export const Gasoek_One = localFont({
  src: "../assets/fonts/google/GasoekOne-Regular.woff2",
  weight: "400",
  display: "swap",
  preload: false,
});

export const Noto_Serif_KR = localFont({
  src: "../assets/fonts/google/NotoSerifKR.woff2",
  weight: "400 900",
  display: "swap",
  preload: false,
});

export const JetBrains_Mono = localFont({
  src: "../assets/fonts/google/JetBrainsMono.woff2",
  weight: "400 600",
  display: "swap",
  preload: false,
});
