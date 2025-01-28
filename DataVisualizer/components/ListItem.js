import React, { useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import styles from "./Styles";
import { toMonetaryFormat } from "../utils/toMonetaryFormat";
import init from "react_native_mqtt"; // Import MQTT initialization
import { AsyncStorage } from "@react-native-async-storage/async-storage";

init({
  size: 10000, // buffer size
  storageBackend: AsyncStorage, // storage for persistence
  defaultExpires: 1000 * 3600 * 24, // default expiration time
  enableCache: true, // enable cache
  reconnect: true, // reconnect automatically
  sync: {},
});

const ListItem = ({
  name,
  symbol,
  currentPrice,
  logoUrl,
  percentageChangeLastHour,
  onPress,
  mqttTopic, // MQTT topic for this crypto
}) => {
  const [price, setPrice] = useState(currentPrice);
  const [percentageChange, setPercentageChange] = useState(
    percentageChangeLastHour
  );

  const priceChangeColor =
    percentageChange === 0
      ? "#A9ABB1"
      : percentageChange > 0
      ? "#34C759"
      : "#FF3830";

  useEffect(() => {
    const client = new Paho.MQTT.Client("localhost", 9001, "/");

    // Set up client event handlers
    client.onConnectionLost = (responseObject) => {
      console.log(responseObject);
      if (responseObject.errorCode !== 0) {
        console.error("Connection lost:", responseObject.errorMessage);
      }
    };

    client.onMessageArrived = (message) => {
      console.log("Message received:", message.payloadString);

      // Parse the incoming message and update state
      try {
        const data = JSON.parse(message.payloadString);

        if (data.price !== undefined) setPrice(data.price);
        if (data.percentageChange !== undefined)
          setPercentageChange(data.percentageChange);
      } catch (error) {
        console.error("Error parsing MQTT message:", error);
      }
    };

    // Connect to the broker and subscribe to the topic
    client.connect({
      onSuccess: () => {
        console.log("Connected to MQTT broker");
        client.subscribe(mqttTopic, { qos: 1 });
      },
      onFailure: (error) => {
        console.error("Connection failed:", error);
      },
    });

    // Cleanup the MQTT connection on component unmount
    return () => {
      if (client.isConnected()) {
        client.disconnect();
      }
    };
  }, [mqttTopic]); // Re-run effect if the topic changes

  return (
    <TouchableOpacity onPress={onPress}>
      <View style={styles.itemWrapper}>
        {/* Left Side */}
        <View style={styles.leftWrapper}>
          <Image source={{ uri: logoUrl }} style={styles.image}></Image>
          <View style={styles.titleWrapper}>
            <Text style={styles.title}> {name} </Text>
            <Text style={styles.subtitle}> {symbol} </Text>
          </View>
        </View>

        {/* Right Side */}
        <View style={styles.rightWrapper}>
          <Text style={styles.title}>{toMonetaryFormat(price)}</Text>
          <Text style={[styles.subtitle, { color: priceChangeColor }]}>
            {percentageChange?.toFixed(2)} %
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ListItem;
