import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "@/utils/jwtDecode";

interface AuthState {
  token: string | null;
  userId: string | null;
  setToken: (token: string) => void;
  clearAuth: () => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      userId: null,
      setToken: (token: string) => {
        try {
          const decoded = jwtDecode(token);
          if (decoded?.userId) {
            set({ token, userId: decoded.userId });
          } else {
            console.error("Invalid token: missing userId");
          }
        } catch (error) {
          console.error("Failed to decode token:", error);
        }
      },
      clearAuth: () => set({ token: null, userId: null }),
    }),
    {
      name: "auth",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useAuthStore;
