import { Service } from "typedi";
import { MongoRepository } from "./MongoRepository";
import { CryptoCoinPrice, ICryptoCoinPrice } from "../models/CryptoCoinPrice";
import { Types } from "mongoose";

@Service()
export class CryptoCoinPriceRepository extends MongoRepository<ICryptoCoinPrice> {
  constructor() {
    super(CryptoCoinPrice);
  }

  async calculateMetrics(
    cryptoCoinId: Types.ObjectId,
    label: string,
    startTime: Date
  ): Promise<{
    label: string;
    metrics: {
      percentageChange: number | null;
      movingAverage: number | null;
    };
  }> {
    return this.model
      .aggregate([
        {
          $match: { cryptoCoin: cryptoCoinId, timestamp: { $gte: startTime } },
        },
        { $sort: { timestamp: 1 } },
        {
          $group: {
            _id: null,
            firstPrice: { $first: "$value" },
            lastPrice: { $last: "$value" },
            movingAverage: { $avg: "$value" },
          },
        },
        {
          $project: {
            _id: 0,
            percentageChange: {
              $multiply: [
                {
                  $divide: [
                    { $subtract: ["$lastPrice", "$firstPrice"] },
                    "$firstPrice",
                  ],
                },
                100,
              ],
            },
            movingAverage: 1,
          },
        },
      ])
      .then((result) => ({
        label,
        metrics: result[0] || {
          percentageChange: null,
          movingAverage: null,
        },
      }));
  }
}
