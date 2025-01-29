import React, { useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { io } from "socket.io-client";
import styles from "./Styles";
import { toMonetaryFormat } from "../utils/toMonetaryFormat";

const DEFAULT_EVENT = "processed-data";
const METRIC_LABEL = "1h";

const ListItem = ({
  cryptoId,
  name,
  symbol,
  imageSrc,
  lastPrice,
  percentageChange1h,
  onPress,
}) => {
  const [price, setPrice] = useState(lastPrice?.value || 0);
  const [percentageChange, setPercentageChange] = useState(percentageChange1h);

  const priceChangeColor =
    percentageChange === 0
      ? "#A9ABB1"
      : percentageChange > 0
      ? "#34C759"
      : "#FF3830";

  useEffect(() => {
    // const socket = io("http://192.168.0.14:3000", {
    //   transports: ["websocket"],
    // });
    // socket.on("connect", () => {
    //   console.log("Connected to Socket.IO server with ID:", socket.id);
    // });
    // const event = `processed-data/${cryptoId}`;
    // socket.on(event, (data) => {
    //   try {
    //     console.log(data);
    //     // const { lastCryptoCoinPrice, metrics } = JSON.parse(data);
    //     // setPrice(lastCryptoCoinPrice.value);
    //     // setPercentageChange(
    //     //   metrics.find(({ label }) => label === METRIC_LABEL).percentageChange
    //     // );
    //   } catch (e) {
    //     console.log("Error in parsing the websocket data");
    //   }
    // });
    // socket.on("connect_error", (err) => {
    //   console.error("Connection error:", err.message);
    // });
    // socket.on("disconnect", () => {
    //   console.log("Disconnected from Socket.IO server");
    // });
    // return () => {
    //   socket.disconnect();
    // };
  }, []);

  return (
    <TouchableOpacity onPress={onPress}>
      <View style={styles.itemWrapper}>
        {/* Left Side */}
        <View style={styles.leftWrapper}>
          <Image source={{ uri: imageSrc }} style={styles.image} />
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
