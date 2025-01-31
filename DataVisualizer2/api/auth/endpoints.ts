import useAuthStore from "@/stores/auth";
import { api } from "../instance";
import { LoginParams } from "./types";

export async function login(credentials: LoginParams) {
  const { setToken } = useAuthStore.getState();
  const { data } = await api.post("auth/login", credentials);

  setToken((data as { token: string }).token);
  return data;
}
export const logout = async () => {
  const { clearAuth } = useAuthStore.getState();

  clearAuth();
};
