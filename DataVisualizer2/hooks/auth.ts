import { login, logout } from "@/api/auth/endpoints";
import { useMutation } from "@tanstack/react-query";

export function useLogin({
  onSuccess = () => {},
  onError = (err: Error) => console.error(err),
} = {}) {
  return useMutation({
    mutationFn: login,
    onError,
    onSuccess,
  });
}

export function useLogout({
  onSuccess = () => {},
  onError = (err: Error) => console.error(err),
} = {}) {
  return useMutation({
    mutationFn: logout,
    onError,
    onSuccess,
  });
}
