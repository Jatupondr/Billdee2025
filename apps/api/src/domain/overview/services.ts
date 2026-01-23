import { status } from "elysia";
import mongoose from "mongoose";

import { OverviewModel } from "./model";
import { Bill, Exp, Product } from "../../../models/model";

export abstract class overviewService {
  static async findAll(query: OverviewModel.overviewQuery) {
    try {
      const findQuery = {
        organizationId: query.organizationId,
        date: {
          $gte: query.startDate,
          $lte: query.endDate,
        },
        isDeleted: false,
      };

      const bills = await Bill.find(findQuery).lean();
      const total = bills.reduce((acc, bill) => acc + bill.total, 0);
      const totalCost = bills.reduce((acc, bill) => acc + bill.cost, 0);
      const totalProfit = total - totalCost;
      const exps = await Exp.find({
        organizationId: query.organizationId,
        date: {
          $gte: query.startDate,
          $lte: query.endDate,
        },
        isDeleted: false,
      }).lean();
      const exp = exps.reduce((acc, exp) => acc + (exp.total || 0), 0);
      return {
        data: {
          total,
          totalCost,
          totalProfit,
          exp,
        },
        message: "Overview retrieved successfully",
      };
    } catch (error) {
      throw error;
    }
  }

  static async findAllCustomer(query: OverviewModel.overviewQuery) {
    try {
      const customers = await Bill.aggregate([
        {
          $match: {
            organizationId: new mongoose.Types.ObjectId(query.organizationId),
            date: {
              $gte: query.startDate,
              $lte: query.endDate,
            },
            isDeleted: false,
          },
        },
        {
          $group: {
            _id: "$customerId",
            count: { $sum: 1 },
            totalAmount: { $sum: "$total" },
          },
        },
        {
          $lookup: {
            from: "customer",
            localField: "_id",
            foreignField: "_id",
            as: "customerInfo",
          },
        },
        {
          $unwind: {
            path: "$customerInfo",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $sort: { count: -1 },
        },
        {
          $limit: 10,
        },
      ]);


      const customersData = customers.map((customer) => {
        return {
          customerId: customer._id,
          customerName: customer.customerInfo?.name || "Unknown",
          count: customer.count,
          totalAmount: customer.totalAmount,
        };
      });

      return {
        data: customersData,
        message: "Overview retrieved successfully",
      };
    } catch (error) {
      throw error;
    }
  }

  static async findAllProduct(query: OverviewModel.overviewQuery) {
    try {
      const products = await Bill.aggregate([
        {
          $match: {
            organizationId: new mongoose.Types.ObjectId(query.organizationId),
            date: {
              $gte: query.startDate,
              $lte: query.endDate,
            },
            isDeleted: false,
          },
        },
        {
          $unwind: "$products",
        },
        {
          $group: {
            _id: "$products.productId",
            productName: { $first: "$products.name" },
            totalQuantity: { $sum: "$products.quantity" },
            totalSales: { $sum: "$products.total" },
            count: { $sum: 1 },
          },
        },
        {
          $sort: { totalQuantity: -1 },
        },
        {
          $limit: 10,
        },
      ]);

      const productsData = products.map((product) => {
        return {
          productId: product._id,
          productName: product.productName,
          totalQuantity: product.totalQuantity,
          totalSales: product.totalSales,
          count: product.count,
        };
      });

      return {
        data: productsData,
        message: "Overview retrieved successfully",
      };
    } catch (error) {
      throw error;
    }
  }

  static async findAllChart(query: OverviewModel.overviewQuery) {
    try {
      const isMonthView = query.type === "month";

      const bills = await Bill.aggregate([
        {
          $match: {
            organizationId: new mongoose.Types.ObjectId(query.organizationId),
            date: {
              $gte: query.startDate,
              $lte: query.endDate,
            },
            isDeleted: false,
          },
        },
        {
          $group: {
            _id: isMonthView
              ? {
                  year: { $year: "$date" },
                  month: { $month: "$date" },
                }
              : {
                  year: { $year: "$date" },
                  month: { $month: "$date" },
                  day: { $dayOfMonth: "$date" },
                },
            total: { $sum: "$total" },
          },
        },
        {
          $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 },
        },
      ]);

      const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];

      const chartData = bills.map((item) => {
        if (isMonthView) {
          return {
            month: monthNames[item._id.month - 1],
            total: item.total,
          };
        } else {
          return {
            month: monthNames[item._id.month - 1],
            day: new Date(
              item._id.year,
              item._id.month - 1,
              item._id.day
            ).toLocaleDateString("th-TH", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }),
            total: item.total,
          };
        }
      });

      return {
        data: chartData,
        message: "Overview retrieved successfully",
      };
    } catch (error) {
      throw error;
    }
  }
}
