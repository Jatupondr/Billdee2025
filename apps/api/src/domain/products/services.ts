import { NotFoundError } from "elysia";
import mongoose from "mongoose";

import { ProductModel } from "./model";
import { Product } from "../../../models/model";

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
        organizationId: dto.organizationId,
        userId: dto.userId,
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
      const organizationId = query.organizationId || ""; // กรองตาม organizationId
      const skip = (page - 1) * limit;
      const filter: any = {
        ...(search && {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
          ],
        }),
        ...(organizationId && { organizationId }),
      };

      const [products, total] = await Promise.all([
        Product.find(filter)
          .skip(skip)
          .limit(limit)
          .sort({ createdAt: -1 })
          .lean(),
        Product.countDocuments(),
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
}
