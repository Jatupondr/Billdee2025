import { status } from "elysia";
import mongoose from "mongoose";
import { BillModel } from "./model";
import { Bill, Customer, Product } from "../../../models/model";

// อัปเดตราคา/ต้นทุนของสินค้าให้เป็นค่าล่าสุดที่กรอกในบิล
async function syncProductPrices(
  organizationId: string,
  items: { productId: string; price: number; cost: number }[]
) {
  const ops = items
    .filter((item) => mongoose.Types.ObjectId.isValid(item.productId))
    .map((item) => ({
      updateOne: {
        filter: { _id: item.productId, organizationId, isDeleted: false },
        update: { $set: { price: item.price, cost: item.cost } },
      },
    }));
  if (ops.length > 0) {
    await Product.bulkWrite(ops);
  }
}

/** $set/$unset สำหรับสถานะใหม่ (เครดิตต้องมีวันครบกำหนด · โอนแล้วบันทึกเวลา) */
function statusUpdate(next: string, dueDate?: string) {
  if (next === "credit" && !dueDate) {
    throw status(400, "กรุณาเลือกวันครบกำหนดของเครดิต");
  }
  const set: Record<string, unknown> = { status: next };
  const unset: Record<string, ""> = {};
  if (next === "credit") set.dueDate = new Date(`${dueDate}T00:00:00+07:00`);
  else unset.dueDate = "";
  if (next === "paid") set.paidAt = new Date();
  else unset.paidAt = "";
  return { $set: set, ...(Object.keys(unset).length ? { $unset: unset } : {}) };
}

/** ตัวกรองสถานะของรายการบิล ("overdue" = เครดิตที่เลยวันครบกำหนด) */
function statusFilter(value?: string): Record<string, unknown> {
  if (!value) return {};
  if (value === "overdue") return { status: "credit", dueDate: { $lt: new Date() } };
  if (value === "pending") return { status: { $in: ["pending", null] } };
  return { status: value };
}

export abstract class billService {
  static async create(dto: BillModel.billCreateDto) {
    try {

      const date = new Date(dto.date);
      let customerId = dto.customerId;

      if (dto.customerId =="") {
        // create customer
        const customer = await Customer.create({
          name: dto.name_customer,
          organizationId: dto.organizationId,
          userId: dto.userId,
          typeCustomer: "customer",
          address: dto.addressCustomer,
          province: dto.provinceCustomer,
          district: dto.districtCustomer,
          subDistrict: dto.subDistrictCustomer,
          postalCode: dto.postalCodeCustomer,
          taxId: dto.taxIdCustomer,
          phone: dto.phoneCustomer,
        });
        customerId = customer._id.toString();
      }

      // check if dto.products is not empty if not productId is create product
      let products = [];
      if (dto.products.length > 0) {
        for (const product of dto.products) {
          let productId = product.productId;

          if (!productId || productId === "") {
            // create new product
            const newProduct = await Product.create({
              name: product.name,
              organizationId: dto.organizationId,
              userId: dto.userId,
              price: product.price,
              cost: product.cost || 0,
              supplier: product.supplier?.trim() ?? "",
            });
            productId = newProduct._id.toString();
          }

          // add product to products array with correct productId
          products.push({
            no: product.no,
            productId: productId,
            name: product.name,
            quantity: product.quantity,
            price: product.price,
            cost: product.cost || 0,
            total: product.total,
            note: product.note,
            supplier: product.supplier?.trim() || undefined,
          });
        }
      }

      const bill = await Bill.create({
        ...dto,
        products: products,
        customerId: customerId,
        organizationId: dto.organizationId,
        userId: dto.userId,
        date: date,
      });

      await syncProductPrices(dto.organizationId, products);

      return bill;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(query: BillModel.billQueryWithPagination) {
    try {
      const page = Number(query.page) || 1;
      const limit = Number(query.pageSize) || 10;
      const search = query.search || "";
      close;
      const organizationId = query.organizationId || "";
      const skip = (page - 1) * limit;

      const filter: any = {
        ...(search && {
          $or: [
            {
              name_customer: { $regex: search, $options: "i" },
            },
            {
              billNumber: { $regex: search, $options: "i" },
            },
          ],
        }),
        ...(organizationId && { organizationId }),
        ...statusFilter(query.status),
        isDeleted: false,
      };

      const [bills, total] = await Promise.all([
        Bill.find(filter)
          .skip(skip)
          .limit(limit)
          .sort({ createdAt: -1 })
          .populate("customerId", "name email phone")
          .populate("userId", "name email")
          .lean(),
        Bill.countDocuments(filter),
      ]);

      return {
        data: bills,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw error;
    }
  }

  static async findById(id: string) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw status(400, "id is invalid not ObjectId");
      }
      const bill = await Bill.findOne({ _id: id, isDeleted: false })
        .populate("customerId", "name email phone address")
        .populate("userId", "name email")
        .lean();

      if (!bill) {
        throw status(404, "Bill not found");
      }
      return bill;
    } catch (error) {
      throw error;
    }
  }

  static async update(id: string, dto: BillModel.billUpdateDto) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw status(400, "id is invalid not ObjectId");
      }
      let customerId = dto.customerId;

      if (dto.customerId =="") {
        // create customer
        const customer = await Customer.create({
          name: dto.name_customer,
          organizationId: dto.organizationId,
          userId: dto.userId,
          typeCustomer: "customer",
          address: dto.addressCustomer,
          province: dto.provinceCustomer,
          district: dto.districtCustomer,
          subDistrict: dto.subDistrictCustomer,
          postalCode: dto.postalCodeCustomer,
          taxId: dto.taxIdCustomer,
          phone: dto.phoneCustomer,
        });
        customerId = customer._id.toString();
      }

      // ราคา/ต้นทุนเดิมในบิล ใช้ตรวจว่าบรรทัดไหนถูกแก้ไขราคา
      const previousBill: any = await Bill.findById(id, { products: 1 }).lean();
      const previousPrices = new Map<string, { price: number; cost: number }>(
        (previousBill?.products || []).map((p: any) => [
          String(p.productId),
          { price: p.price, cost: p.cost || 0 },
        ])
      );

      // check if dto.products is not empty if not productId is create product
      let products = [];
      const changedPrices: { productId: string; price: number; cost: number }[] = [];
      if (dto.products.length > 0) {
        for (const product of dto.products) {
          let productId = product.productId;

          if (!productId || productId === "") {
            // create new product
            const newProduct = await Product.create({
              name: product.name,
              organizationId: dto.organizationId,
              userId: dto.userId,
              price: product.price,
              cost: product.cost || 0,
              supplier: product.supplier?.trim() ?? "",
            });
            productId = newProduct._id.toString();
          } else {
            const previous = previousPrices.get(String(productId));
            if (
              !previous ||
              previous.price !== product.price ||
              previous.cost !== (product.cost || 0)
            ) {
              changedPrices.push({
                productId,
                price: product.price,
                cost: product.cost || 0,
              });
            }
          }

          // add product to products array with correct productId
          products.push({
            no: product.no,
            productId: productId,
            name: product.name,
            quantity: product.quantity,
            price: product.price,
            cost: product.cost || 0,
            total: product.total,
            note: product.note,
            supplier: product.supplier?.trim() || undefined,
          });
        }
      }
      const updatedBill = await Bill.findOneAndUpdate(
        { _id: id },
        {
          ...dto,
          products: products,
          customerId: customerId,
        },
        { new: true }
      )
        .populate("customerId", "name email phone address")
        .populate("userId", "name email")
        .lean();

      if (!updatedBill) {
        throw status(404, "Bill not found");
      }

      await syncProductPrices(
        String(dto.organizationId ?? (updatedBill as any).organizationId),
        changedPrices
      );

      return updatedBill;
    } catch (error) {
      throw error;
    }
  }

  static async delete(id: string) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw status(400, "id is invalid not ObjectId");
      }
      const deletedBill = await Bill.findByIdAndUpdate(
        id,
        {
          isDeleted: true,
        },
        { new: true }
      ).lean();

      if (!deletedBill) {
        throw status(404, "Bill not found");
      }
      return deletedBill;
    } catch (error) {
      throw error;
    }
  }

  /** เปลี่ยนสถานะบิล (B3): รอโอน / โอนแล้ว / เครดิต (มีวันครบกำหนด) / ยกเลิก */
  static async setStatus(id: string, dto: BillModel.billStatusDto) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw status(400, "id is invalid not ObjectId");
    }
    const bill = await Bill.findOneAndUpdate(
      { _id: id, organizationId: dto.organizationId, isDeleted: false },
      statusUpdate(dto.status, dto.dueDate),
      { new: true }
    ).lean();
    if (!bill) throw status(404, "Bill not found");
    return bill;
  }

  /** เปลี่ยนสถานะหลายบิลพร้อมกัน (เฉพาะบิลของร้านนี้) */
  static async setStatusMany(dto: BillModel.billBulkStatusDto) {
    const ids = [...new Set(dto.ids)].filter((id) => mongoose.Types.ObjectId.isValid(id));
    if (ids.length === 0) throw status(400, "ไม่มีบิลที่เลือก");
    const res = await Bill.updateMany(
      { _id: { $in: ids }, organizationId: dto.organizationId, isDeleted: false },
      statusUpdate(dto.status, dto.dueDate)
    );
    return { matched: res.matchedCount, modified: res.modifiedCount };
  }

  /** จำนวนบิลตามสถานะ (แถบกรองหน้ารายการบิล) */
  static async statusCounts(query: BillModel.billCountsQuery) {
    if (!mongoose.Types.ObjectId.isValid(query.organizationId)) return {};
    const org = new mongoose.Types.ObjectId(query.organizationId);
    const [rows, overdue] = await Promise.all([
      Bill.aggregate([
        { $match: { organizationId: org, isDeleted: false } },
        { $group: { _id: { $ifNull: ["$status", "pending"] }, count: { $sum: 1 } } },
      ]),
      Bill.countDocuments({ organizationId: org, isDeleted: false, status: "credit", dueDate: { $lt: new Date() } }),
    ]);
    const out: Record<string, number> = { pending: 0, paid: 0, credit: 0, canceled: 0, overdue };
    for (const r of rows) out[String(r._id)] = r.count;
    return out;
  }

  /** สรุปรายเดือน (B4) ตามวันที่ออกบิล เวลาไทย — บิลยกเลิกไม่นับในยอดขาย/ต้นทุน */
  static async monthSummary(query: BillModel.billSummaryQuery) {
    if (!mongoose.Types.ObjectId.isValid(query.organizationId)) {
      throw status(400, "organizationId is invalid");
    }
    const [y, m] = query.month.split("-").map(Number);
    const start = new Date(`${query.month}-01T00:00:00+07:00`);
    const next = m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, "0")}`;
    const end = new Date(`${next}-01T00:00:00+07:00`);
    const bills: any[] = await Bill.find(
      {
        organizationId: query.organizationId,
        isDeleted: false,
        date: { $gte: start, $lt: end },
      },
      {
        billNumber: 1, date: 1, name_customer: 1, total: 1, cost: 1, status: 1,
        dueDate: 1, paidAt: 1, products: 1,
      }
    )
      .sort({ date: 1, createdAt: 1 })
      .limit(5000)
      .lean();

    const now = Date.now();
    const r2 = (n: number) => Math.round(n * 100) / 100;
    const byStatus: Record<string, { count: number; total: number }> = {
      pending: { count: 0, total: 0 },
      paid: { count: 0, total: 0 },
      credit: { count: 0, total: 0 },
      canceled: { count: 0, total: 0 },
    };
    const overdue = { count: 0, total: 0 };
    const suppliers = new Map<string, { supplier: string; count: number; total: number }>();
    let sales = 0;
    let cost = 0;
    for (const b of bills) {
      const st = byStatus[b.status] ? b.status : "pending";
      byStatus[st].count += 1;
      byStatus[st].total = r2(byStatus[st].total + (b.total || 0));
      if (st === "canceled") continue;
      sales += b.total || 0;
      cost += b.cost || 0;
      if (st === "credit" && b.dueDate && new Date(b.dueDate).getTime() < now) {
        overdue.count += 1;
        overdue.total = r2(overdue.total + (b.total || 0));
      }
      for (const line of b.products || []) {
        const name = (line.supplier || "").trim();
        if (!name) continue;
        const row = suppliers.get(name) || { supplier: name, count: 0, total: 0 };
        row.count += 1;
        row.total = r2(row.total + (line.cost || 0) * (line.quantity || 0));
        suppliers.set(name, row);
      }
    }
    return {
      month: query.month,
      totals: {
        bills: bills.length - byStatus.canceled.count,
        sales: r2(sales),
        cost: r2(cost),
        profit: r2(sales - cost),
        outstanding: r2(byStatus.pending.total + byStatus.credit.total),
      },
      byStatus,
      overdue,
      suppliers: [...suppliers.values()].sort((a, b) => b.total - a.total),
      bills,
    };
  }

  static async getLastBillNumberByOrganizationIdAndUserId(
    query: BillModel.billQueryLastBillNumber
  ) {
    const { organizationId, userId } = query;
    try {
      const lastBill = await Bill.findOne({
        ...(organizationId && { organizationId }),
        ...(userId && { userId }),
        isDeleted: false,
      })
        .sort({ createdAt: -1 })
        .lean();

      let nextBillNumber = "RE202500001";

      if (lastBill?.billNumber) {
        const match = lastBill.billNumber.match(/(\d+)$/);
        if (match) {
          const numericPart = parseInt(match[1], 10);
          const incrementedNumber = numericPart + 1;

          const prefix = lastBill.billNumber.replace(/\d+$/, "");

          const paddedNumber = incrementedNumber.toString().padStart(5, "0");
          nextBillNumber = `${prefix}${paddedNumber}`;
        }
      }

      return {
        data: { billNumber: nextBillNumber },
        message: "Next bill number generated successfully",
      };
    } catch (error) {
      throw error;
    }
  }
}
