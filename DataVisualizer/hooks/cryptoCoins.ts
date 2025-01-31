import {
  getCryptoCoins,
  getCryptoCoinWithPricesAndMetrics,
} from "@/api/cryptoCoins/endpoints";
import { useQuery } from "@tanstack/react-query";

export function useGetCryptoCoins() {
  return useQuery({
    queryKey: ["cryptoCoins"],
    queryFn: () => getCryptoCoins(),
  });
}
