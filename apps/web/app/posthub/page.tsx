import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Billdee PostHub — ส่งรายการสินค้าเข้ากลุ่มแชทในคลิกเดียว",
  description:
    "ส่วนขยาย Chrome สำหรับร้านขายส่ง: วางข้อความราคาจากแพ บวกกำไรอัตโนมัติ แล้วส่งรูปและราคาเข้ากลุ่มแชท Facebook เพจ และ LINE OpenChat",
};

const FEATURES = [
  { title: "วางราคาจากแพทั้งก้อน", body: "วางข้อความราคาที่แพส่งมา ระบบอ่านราคาแต่ละบรรทัด แล้วบวกกำไรหรือหักต้นทุนให้อัตโนมัติ" },
  { title: "ส่งทุกกลุ่มในคลิกเดียว", body: "ส่งรูปและรายการสินค้าวันนี้เข้ากลุ่มแชท Facebook เพจ/โปรไฟล์ กลุ่มเฟส และ LINE OpenChat" },
  { title: "ปลอดภัย ใช้บัญชีของคุณเอง", body: "ทำงานในเบราว์เซอร์ที่คุณล็อกอินไว้ ไม่เก็บรหัสผ่าน ตรวจห้องก่อนส่งทุกครั้ง" },
  { title: "เข้าสู่ระบบด้วย Google", body: "ไม่ต้องจำรหัส 1 บัญชีใช้ได้ 2 เครื่อง สำรองข้อมูลขึ้นคลาวด์ได้" },
];

export default function PostHubPage() {
  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-10 text-neutral-900">
      <div className="mx-auto max-w-3xl space-y-8">
        <header className="space-y-3 rounded-2xl bg-white p-6 shadow-sm sm:p-10">
          <p className="text-sm font-medium text-emerald-700">ส่วนขยาย Chrome จาก BillDee</p>
          <h1 className="text-3xl font-bold">Billdee PostHub</h1>
          <p className="text-[15px] leading-7 text-neutral-700">
            ผู้ช่วยโพสต์รายการสินค้าประจำวันสำหรับร้านขายส่งอาหารทะเลและร้านค้าทั่วไป อัปเดตราคาจากแพ บวกกำไร
            แล้วส่งรูปพร้อมราคาเข้าทุกกลุ่มลูกค้าในคลิกเดียว — ไม่ต้องพิมพ์ทีละรูป ทีละข้อความ
          </p>
          <p className="text-[15px] leading-7 text-neutral-700" lang="en">
            Billdee PostHub is a Chrome extension for wholesale sellers: paste a supplier&apos;s price list, add your margin automatically, and post
            today&apos;s photos and prices to your Facebook group chats, Pages and LINE OpenChat in one click. It runs in your own signed-in browser and
            never stores your passwords. Sign-in uses Google (email only) to check your subscription.
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="font-semibold">{f.title}</h2>
              <p className="mt-1 text-sm leading-6 text-neutral-600">{f.body}</p>
            </div>
          ))}
        </section>

        <section className="space-y-2 rounded-2xl bg-white p-6 text-[15px] leading-7 text-neutral-700 shadow-sm">
          <h2 className="text-lg font-semibold text-neutral-900">สนใจใช้งาน</h2>
          <p>เช่าใช้รายเดือนหรือรายปี แจ้งอีเมล Google ที่จะใช้กับผู้ขาย แล้วกด “เข้าสู่ระบบด้วย Google” ในส่วนขยายได้เลย</p>
          <p>
            ติดต่อ: <a className="text-blue-600 underline" href="mailto:jatupondawruang@gmail.com">jatupondawruang@gmail.com</a>
          </p>
        </section>

        <footer className="flex flex-wrap gap-4 text-sm text-neutral-500">
          <Link className="underline" href="/privacy">นโยบายความเป็นส่วนตัว (Privacy Policy)</Link>
          <Link className="underline" href="/login">BillDee</Link>
        </footer>
      </div>
    </main>
  );
}
