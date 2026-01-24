

import { status } from "elysia";
import mongoose from "mongoose";
import { ExpModel } from "./model";
import { Exp, Customer } from "../../../models/model";

export abstract class expService {
  static async create(dto: ExpModel.expCreateDto) {
    try {

      const date = new Date(dto.date);
      let customerId: string;

      if (dto.customerId === "") {
        //create customer
        const newCustomer = await Customer.create({
          name: dto.name,
          organizationId: dto.organizationId,
          typeCustomer: "supplier",
          userId: dto.userId,
          address: dto.addressCustomer,
          province: dto.provinceCustomer,
          district: dto.districtCustomer,
          subDistrict: dto.subDistrictCustomer,
          postalCode: dto.postalCodeCustomer,
          taxId: dto.taxIdCustomer,
          phone: dto.phoneCustomer,
        });
        customerId = newCustomer._id.toString();
      } else {
        customerId = dto.customerId;
      }

      const exp = await Exp.create({
        ...dto,
        // products: dto.products,
        customerId: customerId,
        organizationId: dto.organizationId,
        date: date,
      });

      return exp;
    } catch (error) {
      throw error;
    }
    }

  static async findAll(query: ExpModel.expQueryWithPagination) {
    try {
      const page = Number(query.page) || 1;
      const limit = Number(query.pageSize) || 10;
      const search = query.search || "";
      const organizationId = query.organizationId || "";
      const skip = (page - 1) * limit;

      // If search term exists, find matching customers by name
      let customerIds: mongoose.Types.ObjectId[] = [];
      if (search) {
        const matchingCustomers = await Customer.find({
          name: { $regex: search, $options: "i" },
          ...(organizationId && { organizationId }),
          isDeleted: false,
        }).select("_id").lean();
        customerIds = matchingCustomers.map((c) => c._id);
      }

      const filter: any = {
        ...(search && {
          $or: [
            ...(customerIds.length > 0 ? [{ customerId: { $in: customerIds } }] : []),
            { billExpenseNumber: { $regex: search, $options: "i" } },
          ],
        }),
        ...(organizationId && { organizationId }),
        isDeleted: false,
      };

      const [exps, total] = await Promise.all([
        Exp.find(filter)
          .skip(skip)
          .limit(limit)
          .sort({ createdAt: -1 })
          .populate("customerId", "name email phone")

          .lean(),
        Exp.countDocuments(filter),
      ]);

      return {
        data: exps,
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
      const exp = await Exp.findOne({ _id: id, isDeleted: false })
        .populate("customerId", "name email phone address")

        .lean();

      if (!exp) {
        throw status(404, "Exp not found");
      }
      return exp;
    } catch (error) {
      throw error;
    }
  }

  static async update(id: string, dto: ExpModel.expUpdateDto) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw status(400, "id is invalid not ObjectId");
      }
      let customerId: string;
      if (dto.customerId === "") {
        //create customer
        const newCustomer = await Customer.create({
          name: dto.name,
          organizationId: dto.organizationId,
          typeCustomer: "supplier",
          userId: dto.userId,
          address: dto.addressCustomer,
          province: dto.provinceCustomer,
          district: dto.districtCustomer,
          subDistrict: dto.subDistrictCustomer,
          postalCode: dto.postalCodeCustomer,
          taxId: dto.taxIdCustomer,
          phone: dto.phoneCustomer,
        });
        customerId = newCustomer._id.toString();
      } else {
        customerId = dto.customerId;
      }
      const updatedExp = await Exp.findOneAndUpdate(
        { _id: id },
        {
          ...dto,
          customerId: customerId,
        },
        { new: true }
      )
        .populate("customerId", "name email phone address")

        .lean();

      if (!updatedExp) {
        throw status(404, "Exp not found");
      }
      return updatedExp;
    } catch (error) {
      throw error;
    }
  }

  static async delete(id: string) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw status(400, "id is invalid not ObjectId");
      }
      const deletedExp = await Exp.findByIdAndUpdate(
        id,
        {
          isDeleted: true,
        },
        { new: true }
      ).lean();

      if (!deletedExp) {
        throw status(404, "Exp not found");
      }
      return deletedExp;
    } catch (error) {
      throw error;
    }
  }

  static async getLastExpNumberByOrganizationId(
    query: ExpModel.expQueryLastExpNumber
  ) {
    const { organizationId } = query;
    try {
      const lastExp = await Exp.findOne({
        ...(organizationId && { organizationId }),

        isDeleted: false,
      })
        .sort({ createdAt: -1 })
        .lean();

      let nextExpNumber = "EXP202500001";

      if (lastExp?.billExpenseNumber) {
        const match = lastExp.billExpenseNumber.match(/(\d+)$/);
        if (match) {
          const numericPart = parseInt(match[1], 10);
          const incrementedNumber = numericPart + 1;

          const prefix = lastExp.billExpenseNumber.replace(/\d+$/, "");

          const paddedNumber = incrementedNumber.toString().padStart(5, "0");
          nextExpNumber = `${prefix}${paddedNumber}`;
        }
      }

      return {
        data: { billExpenseNumber: nextExpNumber },
        message: "Next exp number generated successfully",
      };
    } catch (error) {
      throw error;
    }
  }
}
