// Root.tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Slot } from "expo-router";
import { onlineManager } from "@tanstack/react-query";
import * as Network from "expo-network";

// Setup react-query's online manager (your original code)
onlineManager.setEventListener((setOnline) => {
  const subscription = Network.addNetworkStateListener((state) => {
    setOnline(state.isConnected as boolean);
  });
  return () => {
    subscription?.remove();
  };
});

export const queryClient = new QueryClient();

export default function Root() {
  return (
    <QueryClientProvider client={queryClient}>
      <Slot />
    </QueryClientProvider>
  );
}
