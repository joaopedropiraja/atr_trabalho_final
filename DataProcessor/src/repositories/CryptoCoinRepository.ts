import { Service } from "typedi";
import { CryptoCoin, ICryptoCoin } from "../models/CryptoCoin";
import { MongoRepository } from "./MongoRepository";
import { COLLECTION_NAMES } from "../config/constants";
import { ICryptoCoinPrice } from "../models/CryptoCoinPrice";
import { PipelineStage } from "mongoose";
import { subDays, subHours } from "date-fns";

export type CryptoCoinWithPrices = {
  name: string;
  symbol: string;
  image: {
    thumb: string;
    small: string;
    large: string;
  };
  dataInterval: number;
  prices: ICryptoCoinPrice[];
  metrics: {
    label: string;
    movingAverage: number | null;
    percentageChange: number | null;
  }[];
};

@Service()
export class CryptoCoinRepository extends MongoRepository<ICryptoCoin> {
  constructor() {
    super(CryptoCoin);
  }

  async getBySymbol(symbol: string): Promise<ICryptoCoin | null> {
    return this.getOneBy({ symbol });
  }

  async updateBySymbol(
    symbol: string,
    update: Partial<ICryptoCoin>
  ): Promise<ICryptoCoin | null> {
    return this.model
      .findOneAndUpdate({ symbol }, update, { new: true })
      .exec();
  }

  async getWithPrices(pricesPage: number = 1, pricesLimit: number = 0) {
    const pricesSkip = (pricesPage - 1) * pricesLimit;

    const now = new Date();
    const timeRanges = [
      { label: "1h", startTime: subHours(now, 1) },
      { label: "10h", startTime: subHours(now, 10) },
      { label: "1d", startTime: subDays(now, 1) },
      { label: "7d", startTime: subDays(now, 7) },
    ];

    const pipeline = this.buildCryptoCoinAggregation(
      timeRanges,
      pricesSkip,
      pricesLimit
    );

    return this.model.aggregate<CryptoCoinWithPrices[]>(pipeline);
  }

  private buildCryptoCoinAggregation(
    timeRanges: { label: string; startTime: Date }[],
    pricesSkip = 0,
    pricesLimit = 0
  ): PipelineStage[] {
    return [
      // 1) $lookup from CryptoCoinPrice
      {
        $lookup: {
          from: COLLECTION_NAMES.CRYPTO_COIN_PRICE,
          let: { coinId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$cryptoCoin", "$$coinId"] } } },
            this.buildDynamicFacet(timeRanges, pricesSkip, pricesLimit) as any,
            this.buildDynamicMetricsStage(timeRanges),
          ],
          as: "priceData",
        },
      },
      // 2) Unwind "priceData"
      {
        $unwind: {
          path: "$priceData",
          preserveNullAndEmptyArrays: true,
        },
      },
      // 3) Final $project
      {
        $project: {
          name: 1,
          symbol: 1,
          image: 1,
          dataInterval: 1,
          sensorId: 1,
          // rename priceData.allPrices => "prices"
          prices: "$priceData.allPrices",
          metrics: "$priceData.metrics",
        },
      },
    ];
  }

  private buildDynamicFacet(
    timeRanges: { label: string; startTime: Date }[],
    pricesSkip = 0,
    pricesLimit = 0
  ): PipelineStage {
    const facetObj: Record<string, any[]> = {
      allPrices: [{ $sort: { timestamp: 1 } }, { $skip: pricesSkip }],
    };
    if (pricesLimit > 0) {
      facetObj.allPrices.push({ $limit: pricesLimit });
    }

    timeRanges.forEach(({ label, startTime }) => {
      facetObj[label] = [
        { $match: { timestamp: { $gte: startTime } } },
        { $sort: { timestamp: 1 } },
      ];
    });

    return { $facet: facetObj };
  }

  private buildDynamicMetricsStage(
    timeRanges: { label: string; startTime: Date }[]
  ): PipelineStage {
    return {
      $project: {
        // keep allPrices around
        allPrices: "$allPrices",
        // build an array 'metrics'
        metrics: {
          $map: {
            input: timeRanges.map(({ label }) => ({
              label,
              field: label,
            })),
            as: "timeRange",
            in: {
              label: "$$timeRange.label",
              movingAverage: {
                $let: {
                  vars: {
                    currentArray: {
                      $getField: {
                        field: "$$timeRange.field",
                        input: "$$ROOT",
                      },
                    },
                  },
                  in: {
                    $avg: "$$currentArray.value",
                  },
                },
              },
              percentageChange: {
                $let: {
                  vars: {
                    currentArray: {
                      $getField: {
                        field: "$$timeRange.field",
                        input: "$$ROOT",
                      },
                    },
                  },
                  in: {
                    $cond: [
                      { $eq: [{ $size: "$$currentArray" }, 0] },
                      null,
                      {
                        $multiply: [
                          {
                            $divide: [
                              {
                                $subtract: [
                                  {
                                    $arrayElemAt: ["$$currentArray.value", -1],
                                  },
                                  { $arrayElemAt: ["$$currentArray.value", 0] },
                                ],
                              },
                              { $arrayElemAt: ["$$currentArray.value", 0] },
                            ],
                          },
                          100,
                        ],
                      },
                    ],
                  },
                },
              },
            },
          },
        },
      },
    };
  }
}
