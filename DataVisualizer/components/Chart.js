import React from "react";
import { View, Text, Image, Dimensions } from "react-native";
import { StyleSheet } from "react-native";
import { toMonetaryFormat } from "../utils/toMonetaryFormat";
import { LineChart } from 'react-native-svg-charts';
import { G, Line, Text as SvgText } from 'react-native-svg';

//export const { width: SIZE } = Dimensions.get("window");
const Chart = ({
  currentPrice,
  logoUrl,
  name,
  symbol,
  priceChange7d,
  sparkline_in_7d,
  movingAverage,
  percentageChange
}) => {
  const priceChangeColor = priceChange7d > 0 ? "#34C759" : "#FF3830";
  const movingAverageChangeColor = movingAverage > 0 ? "#34C759" : "#FF3830";
  const percentageChangeColor = percentageChange > 0 ? "#34C759" : "#FF3830";
  
  const SparklineChart = ({ data }) => {
    // Extraindo os valores de y e x
    const values = data.map(item => item.y);
    const xValues = data.map(item => item.x);
  
    return (
      <LineChart
        style={{ height: 200, width: 300 }}
        data={values}
        svg={{ stroke: 'rgb(134, 65, 244)', strokeWidth: 2 }}
        contentInset={{ top: 20, bottom: 20 }}
      >
        <G>
          {/* Eixo X customizado */}
          {xValues.map((x, index) => (
            <SvgText
              key={index}
              x={index * 60} // Define a posição X no gráfico
              y={210} // Ajuste de altura
              fontSize={10}
              fill="black"
              textAnchor="middle"
            >
              {x}
            </SvgText>
          ))}
        </G>
      </LineChart>
    );
  };
  
  
  return (
    //<ChartPathProvider data = {{points: sparkline_in_7d, smoothingStrategy: 'bezier'}}>
    <View style={styles.chartWrapper}>
      <View style={styles.titlesWrapper}>
        <View style={styles.upperTitles}>
          <View style={styles.upperLeftTitle}>
            <Image source={{ uri: logoUrl }} style={styles.image} />
            <Text style={styles.subtitle}>
              {name} ({symbol.toUpperCase()})
            </Text>
          </View>
          <Text style={styles.subtitle}>1d</Text>
        </View>
        <View style={styles.lowerTitles}>
          <Text style={styles.boldTitle}>
            {toMonetaryFormat(currentPrice)}
          </Text>
          <Text style={[styles.subtitle, { color: priceChangeColor }]}>
            {priceChange7d.toFixed(2)}%
          </Text>
        </View>
        <View style={styles.lowerTitles}>
          <Text style={styles.subtitle}>
            Média móvel: 
          </Text>
          <Text style={[styles.subtitle, { color: movingAverageChangeColor }]}>
            {toMonetaryFormat(movingAverage)}
          </Text>
        </View>
        <View style={styles.lowerTitles}>
          <Text style={styles.subtitle}>
            Porcentagem: 
          </Text>
          <Text style={[styles.subtitle, { color: percentageChangeColor }]}>
            {percentageChange.toFixed(2)} %
          </Text>
        </View>
      </View>
      <View>
        <SparklineChart data={sparkline_in_7d} />
      </View>
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
  title: {
    fontSize: 18,
  },
});

export default Chart;
