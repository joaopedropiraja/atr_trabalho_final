import { api } from "../instance";
import { IAlert } from "./types";

export async function getAlertsByUserId(): Promise<IAlert[]> {
  const { data } = await api.get("/alerts");

  return data as IAlert[];
}
