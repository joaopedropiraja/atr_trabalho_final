import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Chart from "../../components/Chart";

export default function CryptoInformation({ route }) {
  const cryptoData = route.params.paramKey;

  const navigation = useNavigation();

  const handleItemPress = (object) => {
    navigation.navigate("CryptoAlert", { paramKey: object }); // Navigate to CryptoAlert screen
  };

  // const transformPrices = cryptoData.prices.map((price) => ({
  //   x: new Date(price.timestamp).getTime(),
  //   y: price.value,
  // }));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crypto Information</Text>

      <Chart
        key={cryptoData._id}
        cryptoId={cryptoData._id}
        initialCurrentPrice={cryptoData?.lastPrice?.value}
        symbol={cryptoData?.symbol}
        logoUrl={cryptoData?.image?.small}
        name={cryptoData?.name}
        initialMovingAverage={0}
        initialPercentageChange={0}
        initialSparklineData={[]}
      />

      <TouchableOpacity
        style={styles.cont}
        onPress={() => handleItemPress(cryptoData)}
      >
        <Text style={styles.titleText}>Definir Alertas</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    padding: 20,
    marginVertical: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  cont: {
    height: 48,
    width: "100%",
    borderRadius: 8,
    backgroundColor: "#002D82",
    justifyContent: "center",
    alignItems: "center",
  },
  titleText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#ffffff",
  },
});
