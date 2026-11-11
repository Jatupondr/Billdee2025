import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "นโยบายความเป็นส่วนตัว | Privacy Policy — BillDee",
  description: "นโยบายความเป็นส่วนตัวของ BillDee และส่วนขยาย Billdee PostHub",
};

const UPDATED = "11 พฤศจิกายน 2569 / November 11, 2026";
const CONTACT = "jatupondawruang@gmail.com";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="space-y-2 text-[15px] leading-7 text-neutral-700">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-10 text-neutral-900">
      <article className="mx-auto max-w-3xl space-y-8 rounded-2xl bg-white p-6 shadow-sm sm:p-10">
        <header className="space-y-2">
          <p className="text-sm text-neutral-500">BillDee · Billdee PostHub</p>
          <h1 className="text-2xl font-bold">นโยบายความเป็นส่วนตัว</h1>
          <p className="text-sm text-neutral-500">ปรับปรุงล่าสุด {UPDATED}</p>
        </header>

        <Section title="1. เราคือใคร">
          <p>
            BillDee (billdee.net) คือระบบออกบิลและสรุปรายรับรายจ่ายสำหรับร้านค้า และ Billdee PostHub คือส่วนขยาย Chrome
            ที่ช่วยส่งรายการสินค้าเข้ากลุ่มแชท Facebook เพจ และ LINE OpenChat จากบัญชีที่ผู้ใช้ล็อกอินไว้เอง
            ดูแลโดยจตุพล (Jatupon) ติดต่อได้ที่ <a className="text-blue-600 underline" href={`mailto:${CONTACT}`}>{CONTACT}</a>
          </p>
        </Section>

        <Section title="2. ข้อมูลที่เราได้จาก Google">
          <p>เมื่อคุณกด “เข้าสู่ระบบด้วย Google” เราขอสิทธิ์เพียง <b>openid</b> และ <b>email</b> เท่านั้น และใช้ข้อมูลดังนี้:</p>
          <ul className="list-disc space-y-1 pl-6">
            <li>อีเมลที่ Google ยืนยันแล้ว — ใช้ตรวจว่าคุณเป็นผู้ใช้ที่สมัครไว้ และผูกสิทธิ์การใช้งานกับเครื่องของคุณ</li>
            <li>รหัสยืนยันตัวตน (ID token) — ตรวจลายเซ็นของ Google ที่เซิร์ฟเวอร์ แล้วทิ้งทันที ไม่เก็บไว้</li>
          </ul>
          <p>เราไม่ขอและไม่เข้าถึงรหัสผ่าน Google, Gmail, Drive, รายชื่อติดต่อ หรือข้อมูลอื่นในบัญชี Google ของคุณ</p>
        </Section>

        <Section title="3. ข้อมูลที่เราเก็บ">
          <ul className="list-disc space-y-1 pl-6">
            <li>อีเมล แพ็กเกจ และวันหมดอายุของสิทธิ์การใช้งาน</li>
            <li>รหัสเครื่องที่สุ่มขึ้นตอนติดตั้ง (ไม่ใช่ข้อมูลฮาร์ดแวร์) และเวอร์ชันของส่วนขยาย เพื่อจำกัดจำนวนเครื่องต่อบัญชี</li>
            <li>Billdee PostHub: ข้อมูลสินค้า รูป และรายชื่อห้องแชทที่คุณสร้าง เก็บในเครื่องของคุณ และถ้าเปิด Cloud Sync จะสำรองไว้ในบัญชีของคุณบนเซิร์ฟเวอร์ของเรา</li>
            <li>BillDee: ข้อมูลบิล สินค้า ลูกค้า และรายรับรายจ่ายที่คุณบันทึกเพื่อใช้งานระบบ</li>
          </ul>
          <p>ส่วนขยายไม่อ่านหรือส่งข้อความแชท บัญชี Facebook/LINE หรือรหัสผ่านของคุณมาที่เรา</p>
        </Section>

        <Section title="4. การใช้และการแบ่งปันข้อมูล">
          <p>
            เราใช้ข้อมูลเพื่อให้บริการ ตรวจสิทธิ์ และช่วยเหลือเมื่อคุณติดต่อมาเท่านั้น ไม่ขาย ไม่ให้เช่า ไม่ใช้เพื่อโฆษณา
            และไม่แบ่งปันให้บุคคลอื่น ยกเว้นผู้ให้บริการโครงสร้างที่เราใช้ทำงาน (Cloudflare สำหรับเซิร์ฟเวอร์สิทธิ์,
            Supabase สำหรับ Cloud Sync, ผู้ให้บริการโฮสต์ของ BillDee) หรือเมื่อกฎหมายกำหนด
          </p>
          <p>
            การใช้ข้อมูลที่ได้รับจาก Google API เป็นไปตาม{" "}
            <a className="text-blue-600 underline" href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noreferrer">
              Google API Services User Data Policy
            </a>{" "}
            รวมถึงข้อกำหนด Limited Use
          </p>
        </Section>

        <Section title="5. การเก็บรักษาและการลบข้อมูล">
          <p>
            เราเก็บข้อมูลไว้ตราบที่บัญชีของคุณยังใช้งาน คุณออกจากระบบบนเครื่องใดก็ได้ในหน้าตั้งค่าของส่วนขยาย
            และขอลบบัญชีพร้อมข้อมูลทั้งหมดได้โดยอีเมลมาที่ {CONTACT} เราจะลบภายใน 30 วัน
          </p>
        </Section>

        <Section title="6. ความปลอดภัย">
          <p>ข้อมูลส่งผ่าน HTTPS เท่านั้น สิทธิ์การใช้งานลงลายเซ็นดิจิทัล และไม่มีกุญแจลับใดอยู่ในส่วนขยาย</p>
        </Section>

        <hr className="border-neutral-200" />

        <section className="space-y-4 text-[15px] leading-7 text-neutral-700" lang="en">
          <h2 className="text-lg font-semibold text-neutral-900">Privacy Policy (English)</h2>
          <p>
            BillDee (billdee.net) is a billing and income/expense tool for shops. Billdee PostHub is a Chrome extension that posts product
            lists to Facebook group chats, Pages and LINE OpenChat from accounts the user is already signed in to. Contact: {CONTACT}.
          </p>
          <p>
            <b>Google user data.</b> “Sign in with Google” requests only the <b>openid</b> and <b>email</b> scopes. We use your verified email
            address solely to identify your existing license and bind it to your device. The ID token is verified on our server and then
            discarded. We do not access your Google password, Gmail, Drive, contacts or any other Google data.
          </p>
          <p>
            <b>What we store.</b> We store your email, plan and expiry, a random device ID created at install and the extension version. If you
            turn on Cloud Sync, we also store the products, images and chat destinations you create. In BillDee we store the bills, products,
            customers and records you enter.
          </p>
          <p>
            <b>Sharing.</b> We do not sell, rent or use your data for advertising. We share it only with the infrastructure providers that run the
            service (Cloudflare, Supabase, our hosting provider) or when required by law. Our use of information received from Google APIs
            adheres to the Google API Services User Data Policy, including the Limited Use requirements.
          </p>
          <p>
            <b>Retention and deletion.</b> Data is kept while your account is active. Email {CONTACT} to delete your account and data. We delete it
            within 30 days.
          </p>
          <p>
            <b>Security.</b> All traffic uses HTTPS. Licenses are digitally signed, and no secret keys are shipped in the extension.
          </p>
        </section>

        <footer className="flex flex-wrap gap-4 text-sm text-neutral-500">
          <Link className="underline" href="/posthub">Billdee PostHub</Link>
          <Link className="underline" href="/login">เข้าสู่ระบบ BillDee</Link>
        </footer>
      </article>
    </main>
  );
}
