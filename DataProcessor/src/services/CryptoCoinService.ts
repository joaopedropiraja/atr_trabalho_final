import { Service } from "typedi";
import { CryptoCoinRepository } from "../repositories/CryptoCoinRepository";
import { ICryptoCoin } from "../models/CryptoCoin";
import { ConflictError } from "../errors/ConflictError";

@Service()
export class CryptoCoinService {
  constructor(private readonly cryptoCoinRepo: CryptoCoinRepository) {}

  async getBySymbol(symbol: string): Promise<ICryptoCoin | null> {
    return this.cryptoCoinRepo.getBySymbol(symbol);
  }

  async get(
    page: number = 1,
    limit: number = 0,
    query: object = {}
  ): Promise<{ data: ICryptoCoin[]; total: number }> {
    return this.cryptoCoinRepo.get(page, limit, query);
  }

  async create(data: ICryptoCoin): Promise<ICryptoCoin> {
    const foundCoin = await this.cryptoCoinRepo.getBySymbol(data.symbol);
    if (!!foundCoin) throw new ConflictError("Duplicate symbol.");

    return this.cryptoCoinRepo.create(data);
  }

  async update(
    id: string,
    update: Partial<ICryptoCoin>
  ): Promise<ICryptoCoin | null> {
    return this.cryptoCoinRepo.update(id, update);
  }

  async delete(id: string): Promise<void> {
    await this.cryptoCoinRepo.delete(id);
  }
}
