import { status } from "elysia";
import mongoose from "mongoose";
import { SubscriptionModel } from "./model";
import { Customer, Subscription } from "../../../models/model";

export abstract class subscriptionService {
  static async create(dto: SubscriptionModel.subscriptionCreateDto) {
    try {
      // const findOrganization = await prisma.organization.findFirst({
      //   where: { id: dto.organizationId },
      // });
      // if (!findOrganization) {
      //   throw new NotFoundError("Organization not found");
      // }

      const subscription = await Subscription.create({
        ...dto,
        userId: dto.userId,
      });

      return subscription;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(query: SubscriptionModel.subscriptionQueryWithPagination) {
    try {
      const page = Number(query.page) || 1; // หน้า
      const limit = Number(query.pageSize) || 10; // จำนวนต่อหน้า
      const search = query.search || ""; // คำค้นหา
      const userId = query.userId || ""; // กรองตาม userId
      const skip = (page - 1) * limit;
      const filter: any = {
        ...(search && {
          $or: [{ name: { $regex: search, $options: "i" } }],
        }),
          ...(userId && { userId }),
        ...(query.status && { status: query.status }),
        isDeleted: false,
      };

      const [subscriptions, total] = await Promise.all([
        Subscription.find(filter)
          .skip(skip)
          .limit(limit)
          .sort({ createdAt: -1 })
          .lean(),
        Subscription.countDocuments(),
      ]);

      return {
        data: subscriptions,

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
        const subscription = await Subscription.findOne({ userId: id, isDeleted: false }).lean();
      if (!subscription) {
        throw status(404, "Subscription not found");
      }
      return subscription;
    } catch (error) {
      throw error;
    }
  }

  static async update(id: string, dto: SubscriptionModel.subscriptionUpdateDto) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw status(400, "id is invalid not ObjectId");
      }
      const updatedSubscription = await Subscription.findByIdAndUpdate(
        id,
        {
          ...dto,
        },
        { new: true }
      ).lean();
      if (!updatedSubscription) {
          throw status(404, "Subscription not found");
      }
      return updatedSubscription;
    } catch (error) {
      throw error;
    }
  }
  static async delete(id: string) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw status(400, "id is invalid not ObjectId");
      }
      const deletedSubscription = await Subscription.findByIdAndUpdate(
        id,
        {
          isDeleted: true,
        },
        { new: true }
      ).lean();
      if (!deletedSubscription) {
        throw status(404, "Subscription not found");
      }
      return deletedSubscription;
    } catch (error) {
      throw error;
    }
  }
}
