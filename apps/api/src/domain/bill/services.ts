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
              cost: product.cost || 0
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
              cost: product.cost || 0
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
