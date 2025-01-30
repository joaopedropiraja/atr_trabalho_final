import { Service } from "typedi";
import { AlertRepository } from "../repositories/AlertRepository";
import { IAlert } from "../models/Alert";
import { ICryptoCoinPrice } from "../models/CryptoCoinPrice";
import { Types } from "mongoose";
import { IUser } from "../models/User";

@Service()
export class AlertService {
  constructor(private readonly alertRepository: AlertRepository) {}

  async updateElegibleAlerts(lastCryptoCoinPrice: ICryptoCoinPrice) {
    return this.alertRepository.updateElegibleAlerts(lastCryptoCoinPrice);
  }

  async getByUserId(userId: Types.ObjectId): Promise<IAlert[]> {
    return this.alertRepository.getBy({ user: userId });
  }

  async get(
    page: number = 1,
    limit: number = 0
  ): Promise<{ data: IAlert[]; total: number }> {
    const { data, total } = await this.alertRepository.get(page, limit);

    return { data, total };
  }

  async create(alert: IAlert): Promise<IAlert> {
    return this.alertRepository.create(alert);
  }
}
