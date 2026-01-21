import { status } from "elysia";
import mongoose from "mongoose";
import { SubscriptionModel } from "./model";
import { Customer, Subscription, User } from "../../../models/model";
import { user } from "../../../lib/permissions";

export abstract class subscriptionService {
  static async create(dto: SubscriptionModel.subscriptionCreateDto) {
    try {
      const now = new Date();

      // หา subscription ที่จ่ายแล้วทั้งหมดของ user
      const subscriptions = await Subscription.find({
        userId: dto.userId,
        status: "paid",
      }).lean();

      // แยก subscription ที่หมดอายุและยังใช้งานได้
      const expiredIds: mongoose.Types.ObjectId[] = [];
      const activeSubscriptions = subscriptions.filter(sub => {
        const isExpired = new Date(sub.expDate) < now;
        if (isExpired) {
          expiredIds.push(sub._id);
          return false;
        }
        return true;
      });

      // อัปเดต subscription ที่หมดอายุเป็น expired
      if (expiredIds.length > 0) {
        await Subscription.updateMany(
          { _id: { $in: expiredIds } },
          { $set: { status: "expired" } }
        );
      }

      // ถ้ามี subscription ที่ยังใช้งานได้อยู่
      if (activeSubscriptions.length > 0) {
        return status(400, "User already has an active subscription");
      }

      // สร้าง subscription ใหม่
      const subscription = await Subscription.create({
        ...dto,
        userId: dto.userId,
        expDate: dto.endDate,
      });

      return subscription;
    } catch (error) {
      throw error;
    }
  }

  static async listUser(query: SubscriptionModel.subscriptionQueryWithPagination) {
    try {
      const page = Number(query.page) || 1; // หน้า
      const limit = Number(query.pageSize) || 10; // จำนวนต่อหน้า
      const search = query.search || ""; // คำค้นหา

      const skip = (page - 1) * limit;
      const filter: any = {
        ...(search && {
          $or: [{ name: { $regex: search, $options: "i" } }],
        }),
        banned: false,
        role: "user",



      };

      const [subscriptions, total] = await Promise.all([
        User.find(filter)
          .skip(skip)
          .limit(limit)

          .sort({ createdAt: -1 })

          .lean(),
        User.countDocuments(),
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



  static async findAll(query: SubscriptionModel.subscriptionQueryWithPagination) {
    try {
      const page = Number(query.page) || 1; // หน้า
      const limit = Number(query.pageSize) || 10; // จำนวนต่อหน้า
      const search = query.search || ""; // คำค้นหา
      const userId = query.userId || ""; // กรองตาม userId
      const skip = (page - 1) * limit;

      const filter: any = {
        isDeleted: false,
        ...(userId && { userId }),
      };

      // ถ้ามีการค้นหา ให้ค้นหา User ที่มี name ตรงกับ search ก่อน
      if (search) {
        const users = await User.find({
          name: { $regex: search, $options: "i" }
        }).select("_id").lean();

        const userIds = users.map(u => u._id);

        // ถ้าหาเจอ user ให้เพิ่มเงื่อนไขค้นหา subscription ของ user เหล่านั้น
        // หรือค้นหาจาก plan ของ subscription
        filter.$or = [
          { userId: { $in: userIds } },
          { plan: { $regex: search, $options: "i" } }
        ];
      }

      const [subscriptions, total] = await Promise.all([
        Subscription.find(filter)
          .skip(skip)
          .limit(limit)
          .populate("userId", "name email")
          .sort({ createdAt: -1 })
          .lean(),
        Subscription.countDocuments(filter),
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
        const subscription = await Subscription.findOne({ userId: id, isDeleted: false, status: "paid" }).lean();
      if (!subscription) {
        throw status(404, "Subscription not found");
      }
      return subscription;
    } catch (error) {
      throw error;
    }
  }

  static async cancelSubscription(id: string) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw status(400, "id is invalid not ObjectId");
      }
      const updatedSubscription = await Subscription.findByIdAndUpdate(
        id,
        {
          status: "canceled",
          expDate: new Date(),
        },
        { new: true }
      ).lean();
      if (!updatedSubscription) {
        throw status(404, "Subscription not found");
      }
      return updatedSubscription;
    }

  catch (error) {
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
