import { Redirect, Stack } from "expo-router";
import useAuthStore from "@/stores/auth";
import { io } from "socket.io-client";
import { useEffect } from "react";
import * as Notifications from "expo-notifications";
// Configure how notifications behave when they arrive
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function AppLayout() {
  const userId = useAuthStore((store) => store.userId);
  const { token } = useAuthStore();

  if (!token) {
    return <Redirect href="/login" />;
  }

  useEffect(() => {
    // Request user permission for local notifications on component mount
    requestNotificationPermissions();

    const socket = io(`${process.env.EXPO_PUBLIC_API}`, {
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      console.log("Connected to server", socket.id);
    });

    const inactivityEvent = "inactivity";
    socket.on(inactivityEvent, async (message) => {
      console.log(message);
      await scheduleLocalNotification("Alerta de inatividade", message);
    });

    const alertEvent = `alertEvent/${userId}`;
    socket.on(alertEvent, async (message) => {
      console.log(message);
      await scheduleLocalNotification("Alerta de preço", message);
    });

    socket.on("connect_error", (err) => {
      console.error("Connection error:", err.message);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Function to request notification permissions
  async function requestNotificationPermissions() {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") {
      alert("We need your permission to show local notifications!");
    }
  }

  async function scheduleLocalNotification(title: string, message: string) {
    const DEFAULT_TRIGGER_SECONDS = 2;
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body: message,
      },
      trigger: {
        seconds: DEFAULT_TRIGGER_SECONDS,
      },
    });
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
      <Stack.Screen name="myAlerts" options={{ title: "Meus Alertas" }} />
    </Stack>
  );
}
