"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ShopInfo from "./shop-info";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LockKeyIcon,
  MoneyWavyIcon,
  StorefrontIcon,
  UserCircleIcon,
} from "@phosphor-icons/react";
import UserInfo from "./user-info";
import PasswordInfo from "./password-info";
import SubscriptionInfo from "./subscription-info";
import BillTem from "./bill-tem";
import { authClient } from "@/lib/auth-client";

const Setting = () => {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [accounts, setAccounts] = useState<any>([]);
  const [activeTab, setActiveTab] = useState(tabParam || "shop-info");

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  useEffect(() => {
    const fetchAccounts = async () => {
      const accounts = await authClient.listAccounts();

      if (accounts.data) {
        setAccounts(accounts.data[0]);
      } else {
        setAccounts([]);
      }

      // setAccounts(accounts || []);
    };

    fetchAccounts();
  }, []);
  return (
    <>
      <div>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList variant="line" className="cursor-pointer">
            <TabsTrigger className="cursor-pointer text-lg font-normal tracking-widest" value="shop-info">
              <StorefrontIcon size={120} weight="duotone" />
              ข้อมูลร้านค้า
            </TabsTrigger>
            <TabsTrigger className="cursor-pointer text-lg font-normal tracking-widest" value="users-info">
              <UserCircleIcon size={120} weight="duotone" />
              ข้อมูลผู้ใช้
            </TabsTrigger>
            <TabsTrigger
              className="cursor-pointer text-lg font-normal tracking-widest"
              value="password-info"
            >
              <LockKeyIcon size={120} weight="duotone" />
              แก้ไขรหัสผ่าน
            </TabsTrigger>
            <TabsTrigger
              className="cursor-pointer text-lg font-normal tracking-widest"
              value="subscription-info"
            >
              <MoneyWavyIcon size={120} weight="duotone" />
              เเพ็กเก็จเเละการชำระเงิน
            </TabsTrigger>

            <TabsTrigger className="cursor-pointer text-lg font-normal tracking-widest" value="bill-format">
              รูปแบบบิล
            </TabsTrigger>
            {/* <TabsTrigger
              className="cursor-pointer text-lg"
              value="bill-setting"
            >
              ตั้งค่าการสร้างบิล
            </TabsTrigger> */}
          </TabsList>
          <div>
            <TabsContent value="shop-info">
              <ShopInfo />
            </TabsContent>
            <TabsContent value="users-info">
              <UserInfo accounts={accounts} />
            </TabsContent>
            {accounts.providerId === "credential" && (
              <TabsContent value="password-info">
                <PasswordInfo />
              </TabsContent>
            )}


            <TabsContent value="subscription-info">
              <SubscriptionInfo />
            </TabsContent>
            <TabsContent value="bill-format">
              <BillTem />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </>
  );
};

export default Setting;
