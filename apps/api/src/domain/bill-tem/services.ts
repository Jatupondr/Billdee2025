import { status } from "elysia";
import mongoose from "mongoose";
import { BillTemplateModel } from "./model";
import { BillTemplate } from "../../../models/model";

export abstract class billTemplateService {




  static async findById(id: string) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw status(400, "id is invalid not ObjectId");
      }
      const billTemplate = await BillTemplate.findOne({ organizationId: id,  })

        .lean();

      if (!billTemplate) {
        throw status(404, "Bill not found");
      }
      return billTemplate;
    } catch (error) {
      throw error;
    }
  }

  static async update(id: string, dto: BillTemplateModel.billTemplateUpdateDto) {
    try {
      //notfound upsert if not found create new use upsert
      const billTemplate = await BillTemplate.findOneAndUpdate(
        { organizationId: id },
        { ...dto },
        { new: true, upsert: true }
      ).lean();
      return billTemplate;
    } catch (error) {
      throw error;
    }
  }




}
