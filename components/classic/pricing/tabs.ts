/** 제작 묶음 하위 탭. 11-04 유지보수는 머리글에서 따로 묶음이라 여기서 뺐다(유지보수 탭은 maintenanceTabs). */
export const serviceTabs = [
  { href: "/homepage", label: "홈페이지 제작" },
  { href: "/landing-page", label: "랜딩페이지 제작" },
  { href: "/program", label: "업무 프로그램 제작" },
  { href: "/app", label: "앱 제작" },
  { href: "/kiosk", label: "키오스크 화면 제작" },
  { href: "/3d", label: "3D 웹 제작" },
];

/** 유지보수 묶음 하위 탭(11-25): 전체, 유지보수, 유지관리, 성능 개선, 고도화, 운영 기준. 업체 변경, 보안 업데이트 페이지는 전체 화면의 칸에서 잇는다 */
export const maintenanceTabs = [
  { href: "/maintenance", label: "전체" },
  { href: "/maintenance/fix", label: "유지보수" },
  { href: "/maintenance/monthly", label: "유지관리" },
  { href: "/maintenance#perf", label: "성능 개선" },
  { href: "/maintenance/ai-site", label: "고도화" },
  { href: "/maintenance/standard", label: "운영 기준" },
];
