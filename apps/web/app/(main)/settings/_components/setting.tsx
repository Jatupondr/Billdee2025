"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ShopInfo from "./shop-info";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const Setting = () => {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(tabParam || "shop-info");

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);
  return (
    <>
      <div>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList variant="line" className="cursor-pointer">
            <TabsTrigger className="cursor-pointer text-lg" value="shop-info">
              ข้อมูลร้านค้า
            </TabsTrigger>
            <TabsTrigger className="cursor-pointer text-lg" value="users-info">
              ข้อมูลผู้ใช้
            </TabsTrigger>
            <TabsTrigger
              className="cursor-pointer text-lg"
              value="password-info"
            >
              แก้ไขรหัสผ่าน
            </TabsTrigger>
            <TabsTrigger
              className="cursor-pointer text-lg"
              value="subscription-info"
            >
              เเพ็กเก็จเเละการชำระเงิน
            </TabsTrigger>

            <TabsTrigger className="cursor-pointer text-lg" value="bill-format">
              รูปแบบบิล
            </TabsTrigger>
            <TabsTrigger
              className="cursor-pointer text-lg"
              value="bill-setting"
            >
              ตั้งค่าการสร้างบิล
            </TabsTrigger>
          </TabsList>
          <div>
            <TabsContent value="shop-info">
              <ShopInfo />
            </TabsContent>
            <TabsContent value="password">
              Update your password to keep your account secure.
            </TabsContent>
            <TabsContent value="notifications">
              Configure how you receive notifications and alerts.
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </>
  );
};

export default Setting;
