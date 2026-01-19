import { status } from "elysia";
import mongoose from "mongoose";
import { AffiliateModel } from "./model";
import { Affiliate } from "../../../models/model";

export abstract class affiliateService {




  static async findById(id: string) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw status(400, "id is invalid not ObjectId");
      }
      const affiliate = await Affiliate.findOne({ userId: id, isDeleted: false })

        .lean();

      if (!affiliate) {
        throw status(404, "Affiliate not found");
      }
      return affiliate;
    } catch (error) {
      throw error;
    }
  }

  static async update(id: string, dto: AffiliateModel.affiliateUpdateDto) {
    try {
     const referalCode = "ddddd";
     const referalLink = `${process.env.CORS_ORIGIN}/register?referalCode=${referalCode}`;
      const affiliate = await Affiliate.findOneAndUpdate(
        { userId: id },
        { ...dto, referalCode, referalLink },
        { new: true, upsert: true }
      ).lean();
      return affiliate;
    } catch (error) {
      throw error;
    }
  }




}
