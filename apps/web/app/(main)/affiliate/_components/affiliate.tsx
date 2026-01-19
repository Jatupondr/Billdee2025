"use client";
import React, { useState } from "react";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
} from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { CreditCardIcon } from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/hooks/axios";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import AffiliateLinkCard from "./affiliate-link-card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import OverviewAffiliate from "./overview-affiliate";

const Affiliate = () => {
  const queryClient = useQueryClient();
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: affiliateData, isLoading: isLoadingAffiliate } = useQuery({
    queryKey: ["affiliate", session?.user?.id],
    queryFn: async () => {
      const response = await api.get(`/affiliate/${session?.user?.id}`);
      return response.data;
    },
    enabled: !!session?.user?.id,
  });
  console.log("affiliateData", affiliateData);

  const updateAffiliateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.patch(`/affiliate/${data.userId}`, data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["affiliate"] });
      toast.success("เปิดใช้งานโปรแกรม affiliate สำเร็จ", {
        position: "bottom-right",
      });
    },
    onError: (error: any) => {
      toast.error("เกิดข้อผิดพลาด", {
        description:
          error?.response?.data?.message ||
          "ไม่สามารถเปิดใช้งานโปรแกรม affiliate ได้ กรุณาลองใหม่อีกครั้ง",
        position: "bottom-right",
      });
    },
  });

  const handleActiveAffiliate = () => {
    updateAffiliateMutation.mutate({
      userId: session?.user?.id,
    });
  };

  if (sessionPending || isLoadingAffiliate) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-60px)]">
        <div className="text-center">
          <p className="text-lg font-normal tracking-widest">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {affiliateData ? (
        <>
          <div className="flex justify-between gap-4 mx-auto mb-4">
            <div className="flex flex-col">
              <h1 className="text-2xl dark:text-zinc-300 font-normal tracking-widest">
                Dashboard affiliate
              </h1>
            </div>
          </div>
          <AffiliateLinkCard affiliateData={affiliateData} />
          <div className="mt-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList variant="line" className="cursor-pointer">
                <TabsTrigger
                  className="cursor-pointer text-lg font-normal tracking-widest"
                  value="overview"
                >
                  ภาพรวม
                </TabsTrigger>
              </TabsList>
              <div>
                <TabsContent value="overview">
                  <OverviewAffiliate
                    id={session?.user?.id || ""}
                    code={affiliateData?.data?.referalCode}
                  />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </>
      ) : (
        <div className="flex justify-center items-center min-h-[calc(100vh-60px)]">
          <Empty>
            <EmptyHeader>
              <EmptyMedia
                variant="icon"
                className="text-primary hover:text-primary/80 transition-all duration-300 ease-in-out"
              >
                <CreditCardIcon
                  size={50}
                  weight="bold"
                  className="hover:scale-110 transition-all duration-300 ease-in-out"
                />
              </EmptyMedia>
              <EmptyTitle className="font-normal tracking-widest">
                ไม่พบโปรแกรม affiliate
              </EmptyTitle>
              <EmptyDescription className="font-normal tracking-widest">
                คลิกที่ปุ่มด้านล่างเพื่อเปิดใช้งานโปรแกรม affiliate
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent className="font-normal tracking-widest">
              <Button
                className="font-normal tracking-widest cursor-pointer active:scale-95 transition-all duration-300 ease-in-out"
                onClick={handleActiveAffiliate}
              >
                เปิดใช้งานโปรแกรม affiliate
              </Button>
            </EmptyContent>
          </Empty>
        </div>
      )}
    </>
  );
};

export default Affiliate;
