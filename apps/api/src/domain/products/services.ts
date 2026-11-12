import { status } from "elysia";
import mongoose from "mongoose";

import { ProductModel } from "./model";
import { Bill, Product } from "../../../models/model";

export abstract class productService {
  static async create(dto: ProductModel.productCreateDto) {
    try {
      // const findOrganization = await prisma.organization.findFirst({
      //   where: { id: dto.organizationId },
      // });
      // if (!findOrganization) {
      //   throw new NotFoundError("Organization not found");
      // }

      const product = await Product.create({
        name: dto.name,
        description: dto.description,
        price: dto.price,
        cost: dto.cost,
        supplier: dto.supplier?.trim() ?? "",
        organizationId: dto.organizationId,
        userId: dto.userId,
        isRecommended: dto.isRecommended,
        ...(dto.isRecommended && { pinOrder: Date.now() }),
      });

      return product;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(query: ProductModel.productQueryWithPagination) {
    try {
      const page = Number(query.page) || 1; // หน้า
      const limit = Number(query.pageSize) || 10; // จำนวนต่อหน้า
      const search = query.search || ""; // คำค้นหา
      const rawOrganizationId = query.organizationId;
      const organizationId =
        rawOrganizationId &&
        rawOrganizationId !== "undefined" &&
        rawOrganizationId !== "null" &&
        mongoose.Types.ObjectId.isValid(rawOrganizationId)
          ? rawOrganizationId
          : "";
      const skip = (page - 1) * limit;
      const filter: any = {
        ...(search && {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
          ],
        }),
        ...(organizationId && { organizationId }),
        ...(query.isRecommended === "true" && { isRecommended: true }),
        isDeleted: false,
      };

      const [products, total] = await Promise.all([
        Product.find(filter)
          .skip(skip)
          .limit(limit)
          .sort(query.isRecommended === "true" ? { pinOrder: 1, createdAt: -1 } : { createdAt: -1 })
          .lean(),
        Product.countDocuments(filter),
      ]);

      return {
        data: products,

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
      const product = await Product.findOne({
        _id: id,
        isDeleted: false,
      }).lean();
      if (!product) {
        throw status(404, "Product not found");
      }
      return product;
    } catch (error) {
      throw error;
    }
  }

  /** ชื่อแพทั้งหมดที่ร้านนี้เคยใส่ในสินค้า (เรียงตามตัวอักษร) */
  static async suppliers(organizationId: string): Promise<string[]> {
    if (!mongoose.Types.ObjectId.isValid(organizationId)) return [];
    // จากสินค้า + จากรายการในบิลที่เคยออก (แพที่พิมพ์ใหม่ในบิลก็ขึ้นเป็นตัวเลือกครั้งหน้า)
    const [fromProducts, fromBills] = await Promise.all([
      Product.distinct("supplier", {
        organizationId,
        isDeleted: false,
        supplier: { $nin: [null, ""] },
      }) as Promise<string[]>,
      Bill.distinct("products.supplier", {
        organizationId,
        isDeleted: false,
      }) as Promise<string[]>,
    ]);
    const names = new Set(
      [...fromProducts, ...fromBills]
        .filter((n): n is string => typeof n === "string")
        .map((n) => n.trim())
        .filter(Boolean)
    );
    return [...names].sort((a, b) => a.localeCompare(b, "th"));
  }

  static async update(id: string, dto: ProductModel.productUpdateDto) {
    try {

      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw status(400, "id is invalid not ObjectId");
      }
      // ปักหมุดใหม่ = ต่อท้ายแถบเพิ่มด่วน
      const pin = dto.isRecommended === true && dto.pinOrder === undefined ? { pinOrder: Date.now() } : {};
      const updatedProduct = await Product.findByIdAndUpdate(
        id,
        {
          ...dto,
          ...pin,
        },
        { new: true }
      ).lean();
      if (!updatedProduct) {
        throw status(404, "Product not found");
      }
      return updatedProduct;
    } catch (error) {
      throw error;
    }
  }
  /** เรียงสินค้าปักหมุดตาม ids (เฉพาะของร้านนี้) */
  static async setPinOrder(dto: ProductModel.pinOrderDto) {
    if (!mongoose.Types.ObjectId.isValid(dto.organizationId)) {
      throw status(400, "organizationId is invalid");
    }
    const ids = dto.ids.filter((id) => mongoose.Types.ObjectId.isValid(id));
    if (!ids.length) return { updated: 0 };
    const r = await Product.bulkWrite(
      ids.map((id, i) => ({
        updateOne: {
          filter: { _id: new mongoose.Types.ObjectId(id), organizationId: dto.organizationId },
          update: { $set: { pinOrder: i + 1 } },
        },
      }))
    );
    return { updated: r.modifiedCount };
  }

  static async delete(id: string) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw status(400, "id is invalid not ObjectId");
      }
      const deletedProduct = await Product.findByIdAndUpdate(
        id,
        {
          isDeleted: true,
        },
        { new: true }
      ).lean();
      if (!deletedProduct) {
        throw status(404, "Product not found");
      }
      return deletedProduct;
    } catch (error) {
      throw error;
    }
  }
}
