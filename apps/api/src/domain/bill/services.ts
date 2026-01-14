import { status } from "elysia";
import mongoose from "mongoose";
import { BillModel } from "./model";
import { Bill } from "../../../models/model";

export abstract class billService {
  static async create(dto: BillModel.billCreateDto) {
    try {
      console.log("DTO in service:", dto);
      const bill = await Bill.create({
        ...dto,
        // products: dto.products,
        organizationId: dto.organizationId,
        userId: dto.userId,
      });

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
      const updatedBill = await Bill.findOneAndUpdate(
        { _id: id },
        {
          ...dto,
        },
        { new: true }
      )
        .populate("customerId", "name email phone address")
        .populate("userId", "name email")
        .lean();

      if (!updatedBill) {
        throw status(404, "Bill not found");
      }
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
