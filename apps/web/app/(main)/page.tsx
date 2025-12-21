import { ComponentExample } from "@/components/component-example";

import type { Metadata } from "next";
import Main from "./_components/main";

export const metadata: Metadata = {
  title: {
    default: "หน้าแรก",
    template: "%s | BillDee",
  },
  description:
    "เข้าสู่ระบบเพื่อใช้งานระบบจัดการร้านค้า ออกบิล และติดตามรายรับรายจ่ายอย่างง่ายและปลอดภัย",

  keywords: [
    "เข้าสู่ระบบ",
    "ระบบออกบิล",
    "จัดการร้านค้า",
    "โปรแกรมออกบิล",
    "BillDee",
  ],

  robots: {
    index: false, // หน้า login ไม่ควรให้ Google index
    follow: false,
  },

  openGraph: {
    title: "เข้าสู่ระบบ | BillDee",
    description:
      "เข้าสู่ระบบ BillDee เพื่อจัดการร้านค้า ออกบิล และควบคุมรายรับรายจ่ายในที่เดียว",
    type: "website",
    locale: "th_TH",
    siteName: "BillDee",
  },

  twitter: {
    card: "summary",
    title: "เข้าสู่ระบบ | BillDee",
    description: "เข้าสู่ระบบเพื่อใช้งานระบบจัดการร้านค้าและออกบิล BillDee",
  },
};
export default function Page() {
  return (
    <>
      <div className="flex justify-center items-center  min-h-[calc(100vh-60px)] ">
        <Main />
      </div>
    </>
  );
}
