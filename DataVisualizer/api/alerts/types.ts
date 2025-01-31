export enum AlertType {
  PRICE_UPPER_THRESHOLD = "priceUpperThreshold",
  PRICE_LOWER_THRESHOLD = "priceLowerThreshold",
}

export type Alert = {
  id: string;
  user: string;
  cryptoCoin: string;
  type: AlertType;
  value: number;
  isActive: boolean;
  triggeredAt: string | null;
};
