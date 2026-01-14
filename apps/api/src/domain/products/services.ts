import { status } from "elysia";
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
        isRecommended: dto.isRecommended,
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
        isDeleted: false,
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

  static async findById(id: string) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw status(400, "id is invalid not ObjectId");
      }
      const product = await Product.findById(id, { isDeleted: false }).lean();
      if (!product) {
        throw status(404, "Product not found");
      }
      return product;
    } catch (error) {
      throw error;
    }
  }

  static async update(id: string, dto: ProductModel.productUpdateDto) {
    try {
      console.log("dto ==>", dto);
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw status(400, "id is invalid not ObjectId");
      }
      const updatedProduct = await Product.findByIdAndUpdate(
        id,
        {
          ...dto,
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
