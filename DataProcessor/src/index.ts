import App from "./App";

const app = new App();
app.start();

// import mqtt, { MqttClient } from "mqtt";

// // MQTT Broker Configuration
// const BROKER_URL = "mqtt://localhost:1883"; // Replace with your broker URL
// const TOPICS = [
//   "sensor_monitors",
//   "sensors/f446517ca31648668f97800a7744661c/#",
// ]; // The topic to subscribe to

// // Create an MQTT client
// const client: MqttClient = mqtt.connect(BROKER_URL);

// // Handle connection
// client.on("connect", () => {
//   console.log(`Connected to MQTT broker at ${BROKER_URL}`);
//   // Subscribe to the specified topic
//   client.subscribe(TOPICS, (err) => {
//     if (err) {
//       console.error(`Failed to subscribe to topic "${TOPICS}":`, err);
//     } else {
//       console.log(`Subscribed to topic: ${TOPICS}`);
//     }
//   });
// });

// // Handle incoming messages
// client.on("message", async (topic, message) => {
//   console.log(message.toString());

//   await doAction(() => console.log("ALOW"), 55000);
// });

// // Handle connection errors
// client.on("error", (err) => {
//   console.error("Connection error:", err);
//   client.end();
// });

// // Handle disconnect
// client.on("close", () => {
//   console.log("Disconnected from MQTT broker");
// });

// async function doAction(action: () => void, timeout: number) {
//   return new Promise((res, rej) => {
//     setTimeout(() => {
//       res(action());
//     }, timeout);
//   });
// }
