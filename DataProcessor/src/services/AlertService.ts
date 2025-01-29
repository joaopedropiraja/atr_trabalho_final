import { Service } from "typedi";
import { AlertRepository } from "../repositories/AlertRepository";
import { IAlert } from "../models/Alert";
import { ICryptoCoinPrice } from "../models/CryptoCoinPrice";

@Service()
export class AlertService {
  constructor(private readonly alertRepository: AlertRepository) {}

  async updateElegibleAlerts(lastCryptoCoinPrice: ICryptoCoinPrice) {
    return this.alertRepository.updateElegibleAlerts(lastCryptoCoinPrice);
  }

  async get(
    page: number = 1,
    limit: number = 0,
    query: object = {}
  ): Promise<{ data: IAlert[]; total: number }> {
    const { data, total } = await this.alertRepository.get(page, limit, query);

    return { data, total };
  }

  async create(alert: IAlert): Promise<IAlert> {
    return this.alertRepository.create(alert);
  }
}
