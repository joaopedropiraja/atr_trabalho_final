import { Service } from "typedi";
import { CryptoCoin, ICryptoCoin } from "../models/CryptoCoin";
import { MongoRepository } from "./MongoRepository";

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
}
