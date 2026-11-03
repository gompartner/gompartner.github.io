import { maintenanceServices } from "@/data/classic/maintenance";
/** 제작 묶음 하위 탭. 11-04 유지보수는 머리글에서 따로 묶음이라 여기서 뺐다(유지보수 탭은 maintenanceTabs). */
export const serviceTabs = [
  { href: "/homepage", label: "홈페이지 제작" },
  { href: "/landing-page", label: "랜딩페이지 제작" },
  { href: "/program", label: "업무 프로그램 제작" },
  { href: "/app", label: "앱 제작" },
  { href: "/kiosk", label: "키오스크 화면 제작" },
  { href: "/3d", label: "3D 웹 제작" },
];

/** 유지보수 묶음 하위 탭: 전체 안내와 세부 4개(11-04) */
export const maintenanceTabs = [{ href: "/maintenance", label: "전체" }, ...maintenanceServices.map((m) => ({ href: `/maintenance/${m.id}`, label: m.title }))];
