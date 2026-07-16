import type { Metadata } from "next";
import { AdminInquiries } from "./AdminInquiries";

export const metadata: Metadata = {
  title: "문의 관리",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminInquiries />;
}
