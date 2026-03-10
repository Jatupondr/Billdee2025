"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
// import { SidebarInput } from "@/components/ui/sidebar";

export function SidebarOptInForm() {
  const router = useRouter();

  return (
    <Card className="gap-2 py-4 shadow-none dark:bg-zinc-900 border border-border/50">
      <CardHeader className="px-4">
        <CardTitle className="text-sm font-normal tracking-widest">
          อัปเกรดเป็น BillDee Pro
        </CardTitle>
        <CardDescription className="font-normal tracking-wide text-xs">
          ปลดล็อกฟีเจอร์ขั้นสูงด้วยการอัปเกรดเป็น BillDee Pro
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4">
        <div className="grid gap-2.5">
          <Button
            className="bg-sidebar-primary font-normal tracking-widest text-sidebar-primary-foreground w-full shadow-none cursor-pointer hover:bg-sidebar-primary/90"
            size="sm"
            onClick={() => router.push("/settings?tab=subscription-info")}
          >
            อัปเกรดเป็น Pro
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
