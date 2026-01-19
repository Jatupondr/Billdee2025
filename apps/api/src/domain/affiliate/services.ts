import { status } from "elysia";
import mongoose from "mongoose";
import { AffiliateModel } from "./model";
import { Affiliate, User } from "../../../models/model";

export abstract class affiliateService {


  static async listAffiliate( id: string, code: string) {
    try {

      //find user by code
      const user = await User.find({ referralCode: code })
        .lean();
        const mapData = user.map((item) => {
          return {
            id: item._id,
            name: item.name,
            email: item.email,
            referralCode: item.referralCode,
          }
        })


      return mapData;
    } catch (error) {
      throw error;
    }
  }


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
  static generateRandomString(length: number) {
    return Math.random().toString(36).substring(2, 2 + length);
  }

  static async update(id: string, dto: AffiliateModel.affiliateUpdateDto) {
    try {
     const referalCode = this.generateRandomString(6);
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
