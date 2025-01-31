import { api } from "../instance";
import { Alert, AlertType } from "./types";

export async function getAlertsByCryptoCoinIdAndLoggedUser(
  cryptoCoinId: string
): Promise<Alert[]> {
  const { data } = await api.get(`/alerts/${cryptoCoinId}/crypto-coins`);

  return data as Alert[];
}

export async function createAlert(alert: {
  cryptoCoinId: string;
  value: number;
  type: AlertType;
}) {
  const { data } = await api.post("/alerts", alert);

  return data as Alert;
}
