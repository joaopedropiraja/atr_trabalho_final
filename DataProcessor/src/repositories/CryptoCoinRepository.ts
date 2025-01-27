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
      { label: "hour", startTime: subHours(now, 1) },
      { label: "7hours", startTime: subHours(now, 7) },
      { label: "15hours", startTime: subHours(now, 15) },
      { label: "day", startTime: subDays(now, 1) },
      { label: "week", startTime: subDays(now, 7) },
    ];

    const pipeline = this.buildCryptoCoinAggregation(
      timeRanges,
      pricesSkip,
      pricesLimit
    );

    // const pipeline: PipelineStage[] = [
    //   {
    //     $lookup: {
    //       from: COLLECTION_NAMES.CRYPTO_COIN_PRICE,
    //       let: { coinId: "$_id" },
    //       pipeline: [
    //         // 1) Match only documents that belong to this coin
    //         { $match: { $expr: { $eq: ["$cryptoCoin", "$$coinId"] } } },
    //         { $sort: { timestamp: 1 } },
    //         // 2) Split the matching price documents into different windows
    //         {
    //           $facet: {
    //             // All price documents (if you really want them all—be mindful of large data volumes!)
    //             allPrices: [
    //               { $skip: pricesSkip },
    //               ...(pricesLimit > 0 ? [{ $limit: pricesLimit }] : []),
    //             ],
    //             // Prices in the last hour
    //             lastHour: [
    //               { $match: { timestamp: { $gte: subHours(now, 1) } } },
    //             ],
    //             // Prices in the last 24 hours
    //             last7Hours: [
    //               { $match: { timestamp: { $gte: subDays(now, 1) } } },
    //             ],
    //             // Prices in the last 7 days
    //             lastWeek: [
    //               { $match: { timestamp: { $gte: subDays(now, 7) } } },
    //             ],
    //           },
    //         },
    //         // 3) Compute aggregates from each of those facets
    //         {
    //           $project: {
    //             allPrices: "$allPrices",
    //             // Hour
    //             hourAverage: {
    //               $cond: [
    //                 { $eq: [{ $size: "$lastHour" }, 0] },
    //                 0,
    //                 { $avg: "$lastHour.value" },
    //               ],
    //             },
    //             hourChange: {
    //               $cond: [
    //                 { $eq: [{ $size: "$lastHour" }, 0] },
    //                 0,
    //                 {
    //                   $multiply: [
    //                     {
    //                       $divide: [
    //                         {
    //                           $subtract: [
    //                             { $arrayElemAt: ["$lastHour.value", -1] }, // last price
    //                             { $arrayElemAt: ["$lastHour.value", 0] }, // first price
    //                           ],
    //                         },
    //                         { $arrayElemAt: ["$lastHour.value", 0] },
    //                       ],
    //                     },
    //                     100,
    //                   ],
    //                 },
    //               ],
    //             },
    //             // Day
    //             dayAverage: {
    //               $cond: [
    //                 { $eq: [{ $size: "$last7Hours" }, 0] },
    //                 0,
    //                 { $avg: "$last7Hours.value" },
    //               ],
    //             },
    //             dayChange: {
    //               $cond: [
    //                 { $eq: [{ $size: "$last7Hours" }, 0] },
    //                 0,
    //                 {
    //                   $multiply: [
    //                     {
    //                       $divide: [
    //                         {
    //                           $subtract: [
    //                             { $arrayElemAt: ["$last7Hours.value", -1] },
    //                             { $arrayElemAt: ["$last7Hours.value", 0] },
    //                           ],
    //                         },
    //                         { $arrayElemAt: ["$last7Hours.value", 0] },
    //                       ],
    //                     },
    //                     100,
    //                   ],
    //                 },
    //               ],
    //             },
    //             // Week
    //             weekAverage: {
    //               $cond: [
    //                 { $eq: [{ $size: "$lastWeek" }, 0] },
    //                 0,
    //                 { $avg: "$lastWeek.value" },
    //               ],
    //             },
    //             weekChange: {
    //               $cond: [
    //                 { $eq: [{ $size: "$lastWeek" }, 0] },
    //                 0,
    //                 {
    //                   $multiply: [
    //                     {
    //                       $divide: [
    //                         {
    //                           $subtract: [
    //                             { $arrayElemAt: ["$lastWeek.value", -1] },
    //                             { $arrayElemAt: ["$lastWeek.value", 0] },
    //                           ],
    //                         },
    //                         { $arrayElemAt: ["$lastWeek.value", 0] },
    //                       ],
    //                     },
    //                     100,
    //                   ],
    //                 },
    //               ],
    //             },
    //           },
    //         },
    //       ],
    //       as: "priceData",
    //     },
    //   },
    //   // Unwind the single element in "priceData"
    //   {
    //     $unwind: {
    //       path: "$priceData",
    //       preserveNullAndEmptyArrays: true, // in case a coin has no prices
    //     },
    //   },
    //   // Finally, choose which fields you want to output
    //   {
    //     $project: {
    //       name: 1,
    //       symbol: 1,
    //       image: 1,
    //       dataInterval: 1,
    //       sensorId: 1,

    //       // All prices for that coin
    //       prices: "$priceData.allPrices",

    //       // Stats from the last hour
    //       hourAverage: "$priceData.hourAverage",
    //       hourChange: "$priceData.hourChange",

    //       // Stats from the last day
    //       dayAverage: "$priceData.dayAverage",
    //       dayChange: "$priceData.dayChange",

    //       // Stats from the last week
    //       weekAverage: "$priceData.weekAverage",
    //       weekChange: "$priceData.weekChange",
    //     },
    //   },
    // ];

    return this.model.aggregate<CryptoCoinWithPrices[]>(pipeline);
  }

  // 2) Build the $facet for all time ranges + allPrices
  private buildDynamicFacet(
    timeRanges: { label: string; startTime: Date }[],
    pricesSkip = 0,
    pricesLimit = 0
  ) {
    const facetObj: Record<string, any> = {
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

  // 3) Helper to build average & change computations
  private buildAverageAndChangeFields(label: string) {
    return {
      [`${label}Average`]: {
        $cond: [
          { $eq: [{ $size: `$${label}` }, 0] },
          0,
          { $avg: `$${label}.value` },
        ],
      },
      [`${label}Change`]: {
        $cond: [
          { $eq: [{ $size: `$${label}` }, 0] },
          0,
          {
            $multiply: [
              {
                $divide: [
                  {
                    $subtract: [
                      { $arrayElemAt: [`$${label}.value`, -1] },
                      { $arrayElemAt: [`$${label}.value`, 0] },
                    ],
                  },
                  { $arrayElemAt: [`$${label}.value`, 0] },
                ],
              },
              100,
            ],
          },
        ],
      },
    };
  }

  // 4) Build the dynamic $project that merges all average/change fields
  private buildDynamicProject(timeRanges: { label: string }[]) {
    // Start with the "allPrices" plus any main coin fields we want
    const project: Record<string, any> = {
      name: 1,
      symbol: 1,
      image: 1,
      dataInterval: 1,
      sensorId: 1,
      // This is where the entire facet data ends up after $unwind
      prices: "$priceData.allPrices",
    };

    // For each timeRange, add <label>Average, <label>Change
    timeRanges.forEach(({ label }) => {
      project[`${label}Average`] = `$priceData.${label}Average`;
      project[`${label}Change`] = `$priceData.${label}Change`;
    });

    return { $project: project };
  }

  // 5) Putting it all together in one function
  private buildCryptoCoinAggregation(
    timeRanges: { label: string; startTime: Date }[],
    pricesSkip = 0,
    pricesLimit = 0
  ): PipelineStage[] {
    return [
      {
        $lookup: {
          from: COLLECTION_NAMES.CRYPTO_COIN_PRICE, // "cryptoCoinPrices"
          let: { coinId: "$_id" },
          pipeline: [
            // Match only docs for the current coin
            { $match: { $expr: { $eq: ["$cryptoCoin", "$$coinId"] } } },
            // Next, build our dynamic facet
            this.buildDynamicFacet(timeRanges, pricesSkip, pricesLimit),
            // Then, build dynamic $project to compute average & change in each facet
            {
              $project: {
                allPrices: "$allPrices",
                ...timeRanges.reduce((acc, { label }) => {
                  // Merge e.g. { hourAverage: {...}, hourChange: {...} } into 'acc'
                  return { ...acc, ...this.buildAverageAndChangeFields(label) };
                }, {}),
              },
            },
          ],
          as: "priceData",
        },
      },
      // Unwind the single element in priceData
      { $unwind: { path: "$priceData", preserveNullAndEmptyArrays: true } },
      // Finally, $project the coin data plus computed stats
      this.buildDynamicProject(timeRanges),
    ];
  }
}
