import React, { useEffect, useState } from "react";
import { View, Text, Image } from "react-native";
import { StyleSheet } from "react-native";
import { toMonetaryFormat } from "../utils/toMonetaryFormat";
import { LineChart, YAxis, XAxis } from "react-native-svg-charts";
import * as scale from "d3-scale";
import { format, differenceInDays } from "date-fns";
import { io } from "socket.io-client";

const Chart = ({
  cryptoId,
  initialCurrentPrice,
  initialSparklineData,
  initialMovingAverage,
  initialPercentageChange,
  name,
  symbol,
  logoUrl,
}) => {
  // Local states that can be updated via socket
  const [currentPrice, setCurrentPrice] = useState(initialCurrentPrice);
  const [sparklineData, setSparklineData] = useState(initialSparklineData);
  const [movingAverage, setMovingAverage] = useState(initialMovingAverage);
  const [percentageChange, setPercentageChange] = useState(
    initialPercentageChange
  );

  // For coloring text
  const movingAverageChangeColor = movingAverage > 0 ? "#34C759" : "#FF3830";
  const percentageChangeColor = percentageChange > 0 ? "#34C759" : "#FF3830";

  /**
   * Connect to Socket.IO for real-time updates
   */
  useEffect(() => {
    // const socket = io("http://192.168.0.14:3000", {
    //   transports: ["websocket"],
    // });
    // socket.on("connect", () => {
    //   console.log("Connected to Chart Socket.IO server with ID:", socket.id);
    // });
    // // Listen for chart updates for this cryptoId
    // socket.on(`processed-data/${cryptoId}`, (data) => {
    //   // try {
    //   //   const parsed = JSON.parse(data);
    //   //   const { lastCryptoCoinPrice, metrics } = parsed;
    //   //   // Update current price
    //   //   if (lastCryptoCoinPrice?.value !== undefined) {
    //   //     setCurrentPrice(lastCryptoCoinPrice.value);
    //   //     setSparklineData((data) =>
    //   //       (data || []).concat([
    //   //         {
    //   //           x: new Date(lastCryptoCoinPrice.timestamp).getTime(),
    //   //           y: lastCryptoCoinPrice.value,
    //   //         },
    //   //       ])
    //   //     );
    //   //   }
    //   //   const METRIC_LABEL = "1h";
    //   //   const oneHourMetric = metrics?.find(
    //   //     ({ label }) => label === METRIC_LABEL
    //   //   );
    //   //   if (oneHourMetric?.movingAverage !== undefined) {
    //   //     setMovingAverage(oneHourMetric.movingAverage);
    //   //   }
    //   //   if (oneHourMetric?.percentageChange !== undefined) {
    //   //     setPercentageChange(oneHourMetric.percentageChange);
    //   //   }
    //   // } catch (e) {
    //   //   console.log("Error parsing chart websocket data:", e);
    //   // }
    // });
    // socket.on("connect_error", (err) => {
    //   console.error("Chart socket connection error:", err.message);
    // });
    // socket.on("disconnect", () => {
    //   console.log("Chart socket disconnected");
    // });
    // return () => {
    //   socket.disconnect();
    // };
  }, [cryptoId]);

  /**
   * SparklineChart
   */
  const SparklineChart = ({ data }) => {
    if (!data || data.length === 0) return null;

    const xValues = data.map((item) => item.x);
    const yValues = data.map((item) => item.y);

    const xMin = Math.min(...xValues);
    const xMax = Math.max(...xValues);

    const totalRangeInDays = differenceInDays(new Date(xMax), new Date(xMin));

    const formatLabel = (value) => {
      if (totalRangeInDays <= 1) {
        return format(new Date(value), "HH:mm");
      } else if (totalRangeInDays <= 30) {
        return format(new Date(value), "MM/dd");
      } else {
        return format(new Date(value), "yyyy-MM-dd");
      }
    };

    return (
      <View style={styles.chartContainer}>
        {/* Y-Axis on the left */}
        <YAxis
          style={styles.yAxis}
          data={yValues}
          contentInset={styles.chartContentInset}
          svg={{ fill: "gray", fontSize: 10 }}
          numberOfTicks={6}
          formatLabel={(value) => toMonetaryFormat(value)}
        />

        {/* Main line chart */}
        <View style={{ flex: 1, marginLeft: 10 }}>
          <LineChart
            style={{ flex: 1 }}
            data={data}
            xAccessor={({ item }) => item.x}
            yAccessor={({ item }) => item.y}
            xScale={scale.scaleTime}
            svg={{
              stroke: "rgb(134, 65, 244)",
              strokeWidth: 2,
            }}
            xMin={xMin}
            xMax={xMax}
            contentInset={styles.chartContentInset}
          />

          {/* X-axis labels */}
          <XAxis
            style={styles.xAxis}
            data={data}
            xAccessor={({ item }) => item.x}
            scale={scale.scaleTime}
            numberOfTicks={5}
            svg={{ fill: "gray", fontSize: 10 }}
            contentInset={{ left: 20, right: 20 }}
            formatLabel={formatLabel}
            xMin={xMin}
            xMax={xMax}
          />
        </View>
      </View>
    );
  };

  return (
    <View style={styles.chartWrapper}>
      {/* Title and stats */}
      <View style={styles.titlesWrapper}>
        <View style={styles.upperTitles}>
          <View style={styles.upperLeftTitle}>
            <Image source={{ uri: logoUrl }} style={styles.image} />
            <Text style={styles.subtitle}>
              {name} ({symbol.toUpperCase()})
            </Text>
          </View>
          <Text style={styles.subtitle}>1h</Text>
        </View>

        <View style={styles.lowerTitles}>
          <Text style={styles.boldTitle}>{toMonetaryFormat(currentPrice)}</Text>
        </View>

        <View style={styles.lowerTitles}>
          <Text style={styles.subtitle}>Média Móvel:</Text>
          <Text style={[styles.subtitle, { color: movingAverageChangeColor }]}>
            {toMonetaryFormat(movingAverage)}
          </Text>
        </View>

        <View style={styles.lowerTitles}>
          <Text style={styles.subtitle}>Variação porcentual:</Text>
          <Text style={[styles.subtitle, { color: percentageChangeColor }]}>
            {new Intl.NumberFormat("pt-BR", {
              maximumFractionDigits: 2,
            }).format(percentageChange)}
            %
          </Text>
        </View>
      </View>

      {/* Chart */}
      <SparklineChart data={sparklineData} />
    </View>
  );
};

const styles = StyleSheet.create({
  chartWrapper: {
    marginVertical: 30,
  },
  titlesWrapper: {
    marginHorizontal: 16,
  },
  upperTitles: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  upperLeftTitle: {
    flexDirection: "row",
    alignItems: "center",
  },
  image: {
    width: 47,
    height: 47,
    marginRight: 4,
  },
  subtitle: {
    fontSize: 17,
    color: "#000000",
  },
  lowerTitles: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  boldTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  chartContainer: {
    height: 220,
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 20,
  },
  yAxis: {
    marginBottom: 30,
  },
  xAxis: {
    marginHorizontal: -10,
    height: 30,
  },
  chartContentInset: {
    top: 20,
    bottom: 20,
  },
});

export default Chart;
