"use client";

import React, { useEffect } from "react";

const Page = () => {
  useEffect(() => {
    window.print();
  }, []);

  return (
    <div className="flex justify-center bg-gray-100 py-10 print:bg-white print:py-0">
      <div className="w-[210mm] min-h-[297mm] bg-white p-8 text-sm text-black print:p-6">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-xl font-bold">ใบเสร็จรับเงิน</h1>
          <p className="text-xs">Receipt</p>
        </div>

        {/* Store Info */}
        <div className="mb-6">
          <p className="font-semibold">บริษัท ตัวอย่าง จำกัด</p>
          <p>123 ถนนสุขุมวิท แขวงตัวอย่าง</p>
          <p>กรุงเทพฯ 10110</p>
          <p>โทร: 02-123-4567</p>
        </div>

        {/* Receipt Info */}
        <div className="mb-6 grid grid-cols-2 gap-4">
          <div>
            <p>
              <span className="font-medium">เลขที่ใบเสร็จ:</span> RC-0001
            </p>
            <p>
              <span className="font-medium">วันที่:</span> 21/12/2025
            </p>
          </div>
          <div className="text-right">
            <p>
              <span className="font-medium">ลูกค้า:</span> นายทดสอบ ระบบ
            </p>
          </div>
        </div>

        {/* Items Table */}
        <table className="mb-6 w-full border border-black">
          <thead>
            <tr className="border-b border-black">
              <th className="px-2 py-1 text-left">รายการ</th>
              <th className="px-2 py-1 text-right">จำนวน</th>
              <th className="px-2 py-1 text-right">ราคา</th>
              <th className="px-2 py-1 text-right">รวม</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-black">
              <td className="px-2 py-1">สินค้า A</td>
              <td className="px-2 py-1 text-right">2</td>
              <td className="px-2 py-1 text-right">100.00</td>
              <td className="px-2 py-1 text-right">200.00</td>
            </tr>
            <tr>
              <td className="px-2 py-1">สินค้า B</td>
              <td className="px-2 py-1 text-right">1</td>
              <td className="px-2 py-1 text-right">150.00</td>
              <td className="px-2 py-1 text-right">150.00</td>
            </tr>
          </tbody>
        </table>

        {/* Summary */}
        <div className="mb-10 flex justify-end">
          <div className="w-64 space-y-1">
            <div className="flex justify-between">
              <span>รวม</span>
              <span>350.00</span>
            </div>
            <div className="flex justify-between">
              <span>ภาษีมูลค่าเพิ่ม 7%</span>
              <span>24.50</span>
            </div>
            <div className="flex justify-between font-bold border-t border-black pt-1">
              <span>ยอดสุทธิ</span>
              <span>374.50</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs">
          <p>ขอบคุณที่ใช้บริการ</p>
          <p className="mt-8">ผู้รับเงิน ______________________</p>
        </div>
      </div>
    </div>
  );
};

export default Page;
