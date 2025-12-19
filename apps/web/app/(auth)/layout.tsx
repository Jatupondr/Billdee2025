import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "เข้าสู่ระบบ | BillDee",
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

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="bg-[#f9fafb] dark:bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm">
        {children}
        <p className="mt-auto pt-6 text-center text-sm text-muted-foreground">
          &copy; 2026 billdee. All rights reserved.
        </p>
      </div>
    </div>
  );
}
