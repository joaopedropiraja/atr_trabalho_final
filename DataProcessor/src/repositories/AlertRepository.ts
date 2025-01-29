import { Service } from "typedi";
import { MongoRepository } from "./MongoRepository";
import { IAlert, Alert, AlertType } from "../models/Alert";
import { ICryptoCoinPrice } from "../models/CryptoCoinPrice";
import logger from "../config/logger";

@Service()
export class AlertRepository extends MongoRepository<IAlert> {
  constructor() {
    super(Alert);
  }

  async updateElegibleAlerts(lastCryptoCoinPrice: ICryptoCoinPrice) {
    let session;
    try {
      session = await this.model.startSession();
      session.startTransaction();

      const query = {
        isActive: true,
        $or: [
          {
            type: AlertType.PRICE_LOWER_THRESHOLD,
            value: { $gt: lastCryptoCoinPrice.value },
          },
          {
            type: AlertType.PRICE_UPPER_THRESHOLD,
            value: { $lt: lastCryptoCoinPrice.value },
          },
        ],
      };

      const elegibleAlerts = await this.model
        .find(query)
        .session(session)
        .populate("user")
        .exec();
      await this.model.updateMany(query, { isActive: false });
      await session.commitTransaction();

      return elegibleAlerts;
    } catch (e) {
      logger.error(`Error in updating elegible alarms: ${e}`);
      await session?.abortTransaction();
      return [];
    }
  }
}
