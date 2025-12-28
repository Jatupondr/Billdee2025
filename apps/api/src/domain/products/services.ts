import { NotFoundError } from "elysia";

import { ProductModel } from "./model";
import { product } from ".";
import { Product } from "../../../models/product.schema";

export abstract class productService {
  static async create(dto: ProductModel.productCreateDto) {
    try {
      // const findOrganization = await prisma.organization.findFirst({
      //   where: { id: dto.organizationId },
      // });
      // if (!findOrganization) {
      //   throw new NotFoundError("Organization not found");
      // }

      return await Product.create({
        name: dto.name,
        description: dto.description,
        price: dto.price,
        cost: dto.cost,
        organizationId: dto.organizationId,
        userId: dto.userId,
      });

      return "Create product service";
    } catch (error) {
      throw error;
    }
  }
}
