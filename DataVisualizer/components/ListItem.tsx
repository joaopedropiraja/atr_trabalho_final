import { toMonetaryFormat } from "@/utils/toMonetaryFormat";
import { toPercentageFormat } from "@/utils/toPercentageFormat";
import { useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { io } from "socket.io-client";
interface LastPrice {
  value: number;
}

interface ListItemProps {
  cryptoId: string;
  name: string;
  symbol: string;
  imageSrc?: string;
  lastPrice?: LastPrice;
  percentageChange1h?: number;
  onPress: () => void;
}

const METRIC_LABEL = "1h";

export default function ListItem({
  cryptoId,
  name,
  symbol,
  imageSrc,
  lastPrice,
  percentageChange1h = 0,
  onPress,
}: ListItemProps) {
  const [price, setPrice] = useState<number>(lastPrice?.value || 0);
  const [percentageChange, setPercentageChange] =
    useState<number>(percentageChange1h);

  const priceChangeColor =
    percentageChange === 0
      ? "#A9ABB1"
      : percentageChange > 0
      ? "#34C759"
      : "#FF3830";

  useEffect(() => {
    const socket = io(`${process.env.EXPO_PUBLIC_API}`, {
      transports: ["websocket"],
    });
    socket.on("connect", () => {
      console.log("Connected to server", socket.id);
    });

    const event = `processed-data/${cryptoId}`;
    socket.on(event, (data) => {
      try {
        if (data?.lastPrice?.value && !isNaN(data?.lastPrice?.value)) {
          setPrice(data?.lastPrice.value);
        }
        if (!!data?.metrics?.length) {
          const percentageChange = data.metrics.find(
            ({ label }) => label === METRIC_LABEL
          ).percentageChange;
          setPercentageChange(percentageChange);
        }
      } catch (e) {
        console.log("Error parsing websocket data");
      }
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
  }, [cryptoId]);

  return (
    <TouchableOpacity onPress={onPress} style={styles.touchable}>
      <View style={styles.itemWrapper}>
        <View style={styles.leftWrapper}>
          {imageSrc ? (
            <Image
              source={{ uri: imageSrc }}
              style={styles.image}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>{symbol}</Text>
            </View>
          )}
          <View style={styles.titleWrapper}>
            <Text style={styles.title}>{name}</Text>
            <Text style={styles.subtitle}>{symbol}</Text>
          </View>
        </View>

        <View style={styles.rightWrapper}>
          <Text style={styles.title}>{toMonetaryFormat(price)}</Text>
          <Text style={[styles.subtitle, { color: priceChangeColor }]}>
            {toPercentageFormat(percentageChange)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  touchable: {
    marginVertical: 6,
  },
  itemWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1A1A1A",
    padding: 12,
    borderRadius: 10,
  },
  leftWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  image: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginRight: 12,
  },
  placeholder: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  placeholderText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 12,
  },
  titleWrapper: {
    flexDirection: "column",
    justifyContent: "center",
  },
  title: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  subtitle: {
    color: "#AAA",
    fontSize: 12,
    marginTop: 2,
  },
  rightWrapper: {
    alignItems: "flex-end",
  },
});
