import { Redirect, Stack } from "expo-router";
import useAuthStore from "@/stores/auth";

export default function AppLayout() {
  const { token } = useAuthStore();

  if (!token) {
    return <Redirect href="/login" />;
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#000" },
        headerTintColor: "#00FFFF",
        headerTitleAlign: "center",
        headerTitleStyle: { fontSize: 30 },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Crypto Monitor",
        }}
      />
      <Stack.Screen name="coin/[coinId]" />
      {/* <Stack.Screen name="coin/[coinId]" options={{ title: "Coin Details" }} />
      <Stack.Screen name="priceAlerts" options={{ title: "My Alerts" }} />
      <Stack.Screen name="createAlert" options={{ title: "New Alert" }} /> */}
      {/* 
    By default, each file in app/ is auto-registered as a Screen.
    If you want custom config, you can declare them explicitly:

    <Stack.Screen name="index" options={{ title: "Crypto Monitor" }}/>
    <Stack.Screen name="coin/[coinId]" options={{ title: "Coin Details" }}/>
    <Stack.Screen name="priceAlerts" options={{ title: "My Alerts" }}/>
    <Stack.Screen name="createAlert" options={{ title: "New Alert" }}/>
  */}
    </Stack>
  );
}
