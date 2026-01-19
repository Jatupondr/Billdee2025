"use client";
import React from 'react'
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent, EmptyMedia } from '@/components/ui/empty'
import { Button } from '@/components/ui/button';
import { CreditCardIcon } from '@phosphor-icons/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/hooks/axios';
import { toast } from 'sonner';
import { authClient } from '@/lib/auth-client';

const Affiliate = () => {
  const queryClient = useQueryClient();
  const { data: session, isPending: sessionPending } = authClient.useSession();

  const getAffiliate = async (userId: string) => {
    const response = await api.get(`/affiliate/${userId}`);
    return response.data;
  }
  const { data: affiliateData, isLoading: isLoadingAffiliate } = useQuery<any>({
    queryKey: ["affiliate", session?.user?.id],
    queryFn: () => getAffiliate(session?.user?.id || ""),
  });




  const updateAffiliateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.patch(`/affiliate/${data.userId}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["affiliate"] });
      toast.success("เปิดใช้งานโปรแกรม affiliateสำเร็จ", {
        position: "bottom-right",
      });

    },
    onError: (error: any) => {
      toast.error("เกิดข้อผิดพลาด", {
        description:
          error?.response?.data?.message || "ไม่สามารถเปิดใช้งานโปรแกรม affiliateได้ กรุณาลองใหม่อีกครั้ง",
        position: "bottom-right",
      });
    },
  });



  const handleActiveAffiliate = () => {
    updateAffiliateMutation.mutate({
      userId: session?.user?.id,
    });
  }



  return (
    <>
      {affiliateData ? (
        <>
          <div className="">
            <div className="flex flex-col items-center justify-center">
              <h1 className="text-2xl font-normal tracking-widest">โปรแกรม affiliate</h1>
              <p className="text-base font-normal tracking-widest">รหัสอ้างอิง: {affiliateData.data.referalCode}</p>
              <p className="text-base font-normal tracking-widest">ลิงค์อ้างอิง: {affiliateData.data.referalLink}</p>
            </div>
          </div>
        </>
      ) : (
        <div className="flex justify-center items-center  min-h-[calc(100vh-60px)] ">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon" className="text-primary hover:text-primary/80 transition-all duration-300 ease-in-out">
                <CreditCardIcon size={50} weight="bold" className="hover:scale-110 transition-all duration-300 ease-in-out" />
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
                className="font-normal tracking-widest cursor-pointer active:scale-95 transition-all duration-300 ease-in-out "
                onClick={() => {
                  handleActiveAffiliate();
                }}
              >
                เปิดใช้งานโปรแกรม affiliate
              </Button>
            </EmptyContent>
          </Empty>
        </div>
      )}

    </>
  )
}

export default Affiliate
