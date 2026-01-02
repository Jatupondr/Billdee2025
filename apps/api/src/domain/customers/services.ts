import { status } from "elysia";
import mongoose from "mongoose";
import { CustomerModel } from "./model";
import { Customer } from "../../../models/model";

export abstract class customerService {
  static async create(dto: CustomerModel.customerCreateDto) {
    try {
      // const findOrganization = await prisma.organization.findFirst({
      //   where: { id: dto.organizationId },
      // });
      // if (!findOrganization) {
      //   throw new NotFoundError("Organization not found");
      // }

      const customer = await Customer.create({
        ...dto,
        typeCustomer: dto.typeCustomer || "customer",
        organizationId: dto.organizationId,
        userId: dto.userId,
      });

      return customer;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(query: CustomerModel.customerQueryWithPagination) {
    try {
      const page = Number(query.page) || 1; // หน้า
      const limit = Number(query.pageSize) || 10; // จำนวนต่อหน้า
      const search = query.search || ""; // คำค้นหา
      const organizationId = query.organizationId || ""; // กรองตาม organizationId
      const skip = (page - 1) * limit;
      const filter: any = {
        ...(search && {
          $or: [{ name: { $regex: search, $options: "i" } }],
        }),
        ...(organizationId && { organizationId }),
        ...(query.typeCustomer && { typeCustomer: query.typeCustomer }),
        isDeleted: false,
      };

      const [customers, total] = await Promise.all([
        Customer.find(filter)
          .skip(skip)
          .limit(limit)
          .sort({ createdAt: -1 })
          .lean(),
        Customer.countDocuments(),
      ]);

      return {
        data: customers,

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
      const customer = await Customer.findById(id, { isDeleted: false }).lean();
      if (!customer) {
        throw status(404, "Customer not found");
      }
      return customer;
    } catch (error) {
      throw error;
    }
  }

  static async update(id: string, dto: CustomerModel.customerUpdateDto) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw status(400, "id is invalid not ObjectId");
      }
      const updatedCustomer = await Customer.findByIdAndUpdate(
        id,
        {
          ...dto,
        },
        { new: true }
      ).lean();
      if (!updatedCustomer) {
        throw status(404, "Customer not found");
      }
      return updatedCustomer;
    } catch (error) {
      throw error;
    }
  }
  static async delete(id: string) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw status(400, "id is invalid not ObjectId");
      }
      const deletedCustomer = await Customer.findByIdAndUpdate(
        id,
        {
          isDeleted: true,
        },
        { new: true }
      ).lean();
      if (!deletedCustomer) {
        throw status(404, "Customer not found");
      }
      return deletedCustomer;
    } catch (error) {
      throw error;
    }
  }
}
