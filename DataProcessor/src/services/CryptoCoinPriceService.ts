import { Service } from "typedi";
import { CryptoCoinPriceRepository } from "../repositories/CryptoCoinPriceRepository";
import { ICryptoCoinPrice } from "../models/CryptoCoinPrice";

@Service()
export class CryptoCoinPriceService {
  constructor(
    private readonly cryptoCoinPriceRepo: CryptoCoinPriceRepository
  ) {}

  async create(data: ICryptoCoinPrice): Promise<ICryptoCoinPrice> {
    return this.cryptoCoinPriceRepo.create(data);
  }
}
