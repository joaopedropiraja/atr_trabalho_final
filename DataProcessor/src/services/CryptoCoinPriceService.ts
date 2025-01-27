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
      { label: "1h", startTime: subHours(now, 1) },
      { label: "10h", startTime: subHours(now, 10) },
      { label: "1d", startTime: subDays(now, 1) },
      { label: "7d", startTime: subDays(now, 7) },
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

    return results.map(({ label, metrics }) => ({
      label,
      movingAverage: metrics.movingAverage,
      percentageChange: metrics.percentageChange,
    }));
  }
}
