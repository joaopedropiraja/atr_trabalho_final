import { Service } from "typedi";
import { CryptoCoinPriceRepository } from "../repositories/CryptoCoinPriceRepository";
import { ICryptoCoinPrice } from "../models/CryptoCoinPrice";
import { Types } from "mongoose";
import { subDays, subHours } from "date-fns";

@Service()
export class CryptoCoinPriceService {
  constructor(
    private readonly cryptoCoinPriceRepo: CryptoCoinPriceRepository
  ) {}

  async create(data: ICryptoCoinPrice): Promise<ICryptoCoinPrice> {
    return this.cryptoCoinPriceRepo.create(data);
  }

  async getMetrics(cryptoCoinId: Types.ObjectId) {
    const now = new Date();

    const timeRanges = [
      { label: "hour", startTime: subHours(now, 1) },
      { label: "day", startTime: subDays(now, 1) },
      { label: "week", startTime: subDays(now, 7) },
    ];
    const results = await Promise.all(
      timeRanges.map(({ label, startTime }) =>
        this.cryptoCoinPriceRepo.calculateMetricsForRange(
          cryptoCoinId,
          label,
          startTime
        )
      )
    );

    return results.reduce(
      (acc, { label, metrics }) => ({
        ...acc,
        [label]: metrics,
      }),
      {}
    );
  }
}
