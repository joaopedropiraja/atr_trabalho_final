import { api } from "../instance";
import { CryptoCoin, CryptoCoinAllData } from "./types";

export async function getCryptoCoins(): Promise<CryptoCoin[]> {
  const { data } = await api.get("/crypto-coins");

  return data as CryptoCoin[];
}

export async function getCryptoCoinWithPricesAndMetrics(
  coinId: string,
  metricLabel: string
) {
  const { data } = await api.get(
    `/crypto-coins/${coinId}/prices-metrics?metricLabel=${encodeURIComponent(
      metricLabel
    )}`
  );

  return data as CryptoCoinAllData;
}
