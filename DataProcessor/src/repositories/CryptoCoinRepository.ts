import { Service } from "typedi";
import { CryptoCoin, ICryptoCoin } from "../models/CryptoCoin";
import { MongoRepository } from "./MongoRepository";
import { COLLECTION_NAMES } from "../config/constants";
import { ICryptoCoinPrice } from "../models/CryptoCoinPrice";
import { PipelineStage, Types } from "mongoose";
import { subDays, subHours } from "date-fns";

export type CryptoCoinGetAllResponse = {
  id: string;
  name: string;
  symbol: string;
  image: {
    thumb: string;
    small: string;
    large: string;
  };
  lastPrice: ICryptoCoinPrice;
  percentageChange1h: number;
};

export type CryptoCoinAllData = {
  id: string;
  name: string;
  symbol: string;
  image: {
    thumb: string;
    small: string;
    large: string;
  };
  lastPrice: ICryptoCoinPrice;
  prices?: ICryptoCoinPrice[];
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

  async getAll() {
    const pipeline: PipelineStage[] = [
      {
        $lookup: {
          from: COLLECTION_NAMES.CRYPTO_COIN_PRICE,
          localField: "_id",
          foreignField: "cryptoCoin",
          pipeline: [{ $sort: { timestamp: 1 } }],
          as: "prices",
        },
      },
      {
        $project: {
          _id: 0,
          id: "$_id",
          name: 1,
          symbol: 1,
          image: 1,
          lastPrice: { $arrayElemAt: ["$prices", -1] },
          percentageChange1h: {
            $cond: [
              { $eq: [{ $size: "$prices" }, 0] },
              null,
              {
                $multiply: [
                  {
                    $divide: [
                      {
                        $subtract: [
                          {
                            $arrayElemAt: ["$prices.value", -1],
                          },
                          { $arrayElemAt: ["$prices.value", 0] },
                        ],
                      },
                      { $arrayElemAt: ["$prices.value", 0] },
                    ],
                  },
                  100,
                ],
              },
            ],
          },
        },
      },
    ];

    return this.model.aggregate<CryptoCoinGetAllResponse[]>(pipeline);
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

  async getByIdWithMetrics(cryptoCoinId: string | Types.ObjectId) {
    const now = new Date();
    const timeRanges = [
      { label: "1h", startTime: subHours(now, 1) },
      { label: "10h", startTime: subHours(now, 10) },
      { label: "1d", startTime: subDays(now, 1) },
      { label: "7d", startTime: subDays(now, 7) },
    ];

    const pipeline = this.buildCryptoCoinOnlyMetricsAggregation(
      cryptoCoinId,
      timeRanges
    );

    const [result] = await this.model.aggregate<CryptoCoinAllData>(pipeline);
    return result;
  }

  async getByIdWithPricesAndMetrics(
    cryptoCoinId: string | Types.ObjectId,
    metricLabel: string = "1h"
  ) {
    const now = new Date();
    const timeRanges = [
      { label: "1h", startTime: subHours(now, 1) },
      { label: "10h", startTime: subHours(now, 10) },
      { label: "1d", startTime: subDays(now, 1) },
      { label: "7d", startTime: subDays(now, 7) },
    ];

    const pipeline = this.buildCryptoCoinAggregation(
      cryptoCoinId,
      metricLabel,
      timeRanges
    );

    const [result] = await this.model.aggregate<CryptoCoinAllData>(pipeline);
    return result;
  }

  private buildCryptoCoinOnlyMetricsAggregation(
    cryptoCoinId: string | Types.ObjectId,
    timeRanges: { label: string; startTime: Date }[]
  ) {
    return [
      { $match: { _id: new Types.ObjectId(cryptoCoinId) } },
      {
        $lookup: {
          from: COLLECTION_NAMES.CRYPTO_COIN_PRICE,
          let: { coinId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$cryptoCoin", "$$coinId"] } } },
            this.buildDynamicFacet(timeRanges) as any,
            this.buildDynamicMetricsStage(timeRanges),
          ],
          as: "priceData",
        },
      },

      {
        $unwind: {
          path: "$priceData",
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $project: {
          _id: 0,
          id: "$_id",
          name: 1,
          symbol: 1,
          image: 1,
          lastPrice: { $arrayElemAt: ["$priceData.allPrices", -1] },
          metrics: "$priceData.metrics",
        },
      },
    ];
  }

  private buildCryptoCoinAggregation(
    cryptoCoinId: string | Types.ObjectId,
    metricLabel: string,
    timeRanges: { label: string; startTime: Date }[]
  ): PipelineStage[] {
    const pricesStartTime =
      timeRanges.find(({ label }) => label === metricLabel)?.startTime ||
      timeRanges[0].startTime;

    return [
      { $match: { _id: new Types.ObjectId(cryptoCoinId) } },
      {
        $lookup: {
          from: COLLECTION_NAMES.CRYPTO_COIN_PRICE,
          let: { coinId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$cryptoCoin", "$$coinId"] } } },
            this.buildDynamicFacet(timeRanges) as any,
            this.buildDynamicMetricsStage(timeRanges),
          ],
          as: "priceData",
        },
      },

      {
        $unwind: {
          path: "$priceData",
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $project: {
          _id: 0,
          id: "$_id",
          name: 1,
          symbol: 1,
          image: 1,
          lastPrice: { $arrayElemAt: ["$priceData.allPrices", -1] },
          prices: {
            $filter: {
              input: "$priceData.allPrices",
              as: "price",
              cond: {
                $gte: ["$$price.timestamp", pricesStartTime],
              },
            },
          },
          metrics: "$priceData.metrics",
        },
      },
    ];
  }

  private buildDynamicFacet(
    timeRanges: { label: string; startTime: Date }[]
  ): PipelineStage {
    const facetObj: Record<string, any[]> = {
      allPrices: [{ $sort: { timestamp: 1 } }],
    };

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
