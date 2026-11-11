import { Subscription } from "../../../models/model";
import { FREE_BILLS_PER_MONTH } from "./plans";
import { billsThisMonth } from "./service";

/** สร้างบิลได้ไหม: Pro ที่ยังไม่หมดอายุ / แอดมิน = ได้เสมอ · ฟรี = ไม่เกิน 10 บิลต่อเดือน */
export async function billQuota(user: { id: string; role?: string | null }) {
  if (user.role === "admin") return { ok: true, used: 0, limit: FREE_BILLS_PER_MONTH, pro: true };
  const pro = await Subscription.exists({
    userId: user.id,
    plan: "pro",
    status: "paid",
    isDeleted: false,
    expDate: { $gt: new Date() },
  });
  if (pro) return { ok: true, used: 0, limit: FREE_BILLS_PER_MONTH, pro: true };
  const used = await billsThisMonth(user.id);
  return { ok: used < FREE_BILLS_PER_MONTH, used, limit: FREE_BILLS_PER_MONTH, pro: false };
}
