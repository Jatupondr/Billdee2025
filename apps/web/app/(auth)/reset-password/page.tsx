import { Metadata } from 'next';
import React, { Suspense } from 'react'
import ResetPasswordComponent from '../_components/reset-password';

export const metadata: Metadata = {
  title: {
    default: "ตั้งค่ารหัสผ่านใหม่",
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

const Page = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordComponent />

    </Suspense>

  )
}

export default Page
