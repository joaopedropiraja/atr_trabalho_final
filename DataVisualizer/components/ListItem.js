import React, { useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { io } from "socket.io-client";
import styles from "./Styles";
import { toMonetaryFormat } from "../utils/toMonetaryFormat";

const ListItem = ({
  cryptoId,
  name,
  symbol,
  currentPrice,
  logoUrl,
  percentageChangeLastHour,
  onPress,
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
    const socket = io("http://192.168.0.14:3000", {
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      console.log("Connected to Socket.IO server with ID:", socket.id);
    });

    socket.on(`processed-data/${cryptoId}`, (data) => {
      try {
        const { lastCryptoCoinPrice, metrics } = JSON.parse(data);
        setPrice(lastCryptoCoinPrice.value);

        const METRIC_LABEL = "1h";
        setPercentageChange(
          metrics.find(({ label }) => label === METRIC_LABEL).percentageChange
        );
      } catch (e) {
        console.log("Error in parsing the websocket data");
      }
    });

    socket.on("connect_error", (err) => {
      console.error("Connection error:", err.message);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from Socket.IO server");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <TouchableOpacity onPress={onPress}>
      <View style={styles.itemWrapper}>
        {/* Left Side */}
        <View style={styles.leftWrapper}>
          <Image source={{ uri: logoUrl }} style={styles.image} />
          <View style={styles.titleWrapper}>
            <Text style={styles.title}>{name}</Text>
            <Text style={styles.subtitle}>{symbol}</Text>
          </View>
        </View>

        {/* Right Side */}
        <View style={styles.rightWrapper}>
          <Text style={styles.title}>{toMonetaryFormat(price)}</Text>
          <Text style={[styles.subtitle, { color: priceChangeColor }]}>
            {percentageChange?.toFixed(2)}%
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ListItem;
