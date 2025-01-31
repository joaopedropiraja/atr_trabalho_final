import { CryptoCoinPrice } from "@/api/cryptoCoins/types";
import { differenceInDays, format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { ptBR } from "date-fns/locale";

export function formatTimestampsDistributed(
  prices: CryptoCoinPrice[] = [],
  maxLabels = 5
): string[] {
  if (!prices.length) return [];

  const timeZone = "America/Sao_Paulo";
  const firstTimestamp = toZonedTime(new Date(prices[0].timestamp), timeZone);
  const lastTimestamp = toZonedTime(
    new Date(prices[prices.length - 1].timestamp),
    timeZone
  );
  const totalRangeInDays = differenceInDays(lastTimestamp, firstTimestamp);

  function formatDate(date: Date) {
    const zonedDate = toZonedTime(date, timeZone);
    if (totalRangeInDays <= 1) {
      return format(zonedDate, "HH:mm", { locale: ptBR });
    } else if (totalRangeInDays <= 30) {
      return format(zonedDate, "dd/MM", { locale: ptBR });
    } else {
      return format(zonedDate, "yyyy-MM-dd", { locale: ptBR });
    }
  }

  if (prices.length <= maxLabels) {
    return prices.map((p) => formatDate(new Date(p.timestamp)));
  }

  const step = Math.floor(prices.length / (maxLabels - 1));

  return prices.map((price, i) => {
    if (i === 0 || i === prices.length - 1 || i % step === 0) {
      return formatDate(new Date(price.timestamp));
    }
    return "";
  });
}
