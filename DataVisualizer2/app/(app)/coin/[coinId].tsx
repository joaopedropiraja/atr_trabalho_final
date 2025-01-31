import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { LineChart } from "react-native-chart-kit";
import { toPercentageFormat } from "@/utils/toPercentageFormat";
import { toMonetaryFormat } from "@/utils/toMonetaryFormat";
import { formatTimestampsDistributed } from "@/utils/formatTimestampsDistributed";
import { io } from "socket.io-client";
import { CryptoCoinAllData } from "@/api/cryptoCoins/types";
import { getCryptoCoinWithPricesAndMetrics } from "@/api/cryptoCoins/endpoints";

const { width } = Dimensions.get("window");
const chartWidth = width - 32;

export default function CryptoDetailScreen() {
  const { name, logo, coinId } = useLocalSearchParams();
  const [selectedMetricLabel, setSelectedRange] = useState("1h");
  const [coinData, setCoinData] = useState<CryptoCoinAllData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const data = await getCryptoCoinWithPricesAndMetrics(
          coinId,
          selectedMetricLabel
        );
        setCoinData(data);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [coinId, selectedMetricLabel]);

  const navigation = useNavigation();

  useEffect(() => {
    if (name && logo) {
      navigation.setOptions({
        headerTitle: () => (
          <View style={styles.header}>
            <Image
              source={{ uri: String(logo) }}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.headerText}>{name}</Text>
          </View>
        ),
      });
    }
  }, [name, logo]);

  useEffect(() => {
    const socket = io(`${process.env.EXPO_PUBLIC_API}`, {
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      console.log("Connected to server", socket.id);
    });

    const event = `processed-data/${coinId}`;
    socket.on(event, (newData) => {
      if (!newData) return;

      setCoinData((prevData) => {
        if (!prevData) return newData; // Initialize state if it's null

        return {
          ...prevData,
          lastPrice: newData.lastPrice, // Update last price
          prices: [
            ...prevData.prices,
            { timestamp: new Date(), value: newData.lastPrice.value },
          ], // Append new price
          metrics: newData.metrics || prevData.metrics, // Update metrics if available
        };
      });
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
  }, [coinId]);

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#00FFFF" />
        <Text style={styles.loaderText}>Carregando dados...</Text>
      </View>
    );
  }

  const labels = formatTimestampsDistributed(coinData?.prices, 15).filter(
    Boolean
  );

  const values = coinData?.prices?.map((p) => p.value);

  const chartData = {
    labels: labels.slice(0, 5),
    datasets: [{ data: values }],
  };

  const firstPrice = values?.[0] || 0;
  const lastPrice = values?.[values.length - 1] || 0;
  const percentChange =
    ((lastPrice - firstPrice) / Math.max(1, firstPrice)) * 100;
  const isPositive = percentChange >= 0;

  const handleNavigateToAlerts = () => {
    router.push({
      pathname: "/myAlerts",
      params: {
        cryptoCoinId: coinData?.id,
        name: coinData?.name,
        imageSrc: coinData?.image.small,
      },
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.infoContainer}>
        <View>
          <Text style={styles.coinSymbol}>{coinData?.symbol}</Text>
          <Text style={styles.coinPrice}>{toMonetaryFormat(lastPrice)}</Text>
        </View>
        <View style={styles.infoRightSide}>
          <TouchableOpacity onPress={handleNavigateToAlerts}>
            <Text style={styles.bellIcon}>🔔</Text>
          </TouchableOpacity>
          <Text
            style={[
              styles.priceChange,
              { backgroundColor: isPositive ? "#163f2f" : "#451616" },
            ]}
          >
            {toPercentageFormat(percentChange)}
          </Text>
        </View>
      </View>

      <View style={styles.chartTabs}>
        {["1h", "10h", "1d", "7d"].map((range) => (
          <TouchableOpacity
            key={range}
            style={[
              styles.chartTabItem,
              selectedMetricLabel === range && styles.chartTabActive,
            ]}
            onPress={() => setSelectedRange(range)}
          >
            <Text
              style={[
                styles.chartTabText,
                selectedMetricLabel === range && styles.chartTabTextActive,
              ]}
            >
              {range}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <LineChart
        data={chartData}
        width={chartWidth}
        height={250}
        withInnerLines={false}
        withOuterLines={false}
        withHorizontalLabels
        withVerticalLabels
        formatYLabel={(val) =>
          toMonetaryFormat(val)
            .replace("R$", "")
            .replace(/(,[\d]+)/g, "")
        }
        chartConfig={{
          backgroundColor: "#000",
          backgroundGradientFrom: "#000",
          backgroundGradientTo: "#000",
          color: (opacity = 1) => `rgba(0, 255, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          strokeWidth: 2,
          propsForDots: {
            r: "3",
            strokeWidth: "1",
            stroke: "#00FFFF",
          },
        }}
        style={styles.chartStyle}
      />

      <Text style={styles.metricsTitle}>Variação porcentual</Text>
      <View style={styles.bottomStatsContainer}>
        {coinData?.metrics.map((metric) => {
          const value =
            metric.percentageChange !== null
              ? toPercentageFormat(metric.percentageChange)
              : "N/A";
          const isUp = (metric.percentageChange ?? 0) >= 0;
          return (
            <View key={metric.label} style={styles.bottomStatsItem}>
              <Text style={styles.bottomStatsLabel}>{metric.label}</Text>
              <Text
                style={[
                  styles.bottomStatsValue,
                  value === "N/A"
                    ? styles.white
                    : isUp
                    ? styles.green
                    : styles.red,
                ]}
              >
                {value}
              </Text>
            </View>
          );
        })}
      </View>
      <Text style={styles.metricsTitle}>Média móvel</Text>
      <View style={styles.bottomStatsContainer}>
        {coinData?.metrics?.map((metric) => {
          const value =
            metric.movingAverage !== null
              ? toMonetaryFormat(metric.movingAverage)
              : "N/A";
          return (
            <View key={metric.label} style={styles.bottomStatsItem}>
              <Text style={styles.bottomStatsLabel}>{metric.label}</Text>
              <Text style={[styles.bottomStatsValue, styles.white]}>
                {value === "N/A" ? value : value.replace("R$", "")}
              </Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },

  loaderText: {
    color: "#FFF",
    marginTop: 10,
    fontSize: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  headerText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  infoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    marginTop: 12,
    marginBottom: 8,
  },
  coinSymbol: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  coinPrice: {
    color: "#FFF",
    fontSize: 26,
    fontWeight: "bold",
    marginTop: 4,
  },
  infoRightSide: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  bellIcon: {
    color: "#FFF",
    fontSize: 20,
  },
  priceChange: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  chartTabs: {
    flexDirection: "row",
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  chartTabItem: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#1A1A1A",
    marginRight: 8,
  },
  chartTabActive: {
    backgroundColor: "#00FFFF",
  },
  chartTabText: {
    color: "#FFF",
    fontSize: 14,
  },
  chartTabTextActive: {
    color: "#000",
    fontWeight: "bold",
  },
  chartStyle: {
    alignSelf: "center",
    marginVertical: 8,
  },
  metricsTitle: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginLeft: 12,
    marginBottom: 8,
  },
  bottomStatsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#1A1A1A",
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 12,
    marginBottom: 16,
  },
  bottomStatsItem: {
    alignItems: "center",
    minWidth: 50,
  },
  bottomStatsLabel: {
    color: "#AAA",
    fontSize: 12,
  },
  bottomStatsValue: {
    fontSize: 14,
    fontWeight: "bold",
  },
  green: {
    color: "#4ADE80",
  },
  red: {
    color: "#EF4444",
  },
  white: {
    color: "#FFF",
  },
});
