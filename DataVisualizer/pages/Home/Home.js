import React, { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";

import ListItem from "../../components/ListItem";
import styles from "./Styles";

export default function Home() {
  const navigation = useNavigation();
  const [cryptos, setCryptos] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/v1/crypto-coins/with-prices"
        );
        setCryptos(response.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  const handleItemPress = (cryptoCoin) => {
    navigation.navigate("CryptoInformation", { paramKey: cryptoCoin });
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View style={styles.body}>
        <View style={styles.titleWrapper}>
          <Text style={styles.largeTitle}>Crypto Monitor</Text>
        </View>

        <View style={styles.dividerLine} />

        {cryptos.map((cryptoCoin) => {
          const lastPriceIndex = cryptoCoin.prices?.length - 1;
          const currentPrice =
            lastPriceIndex >= 0 ? cryptoCoin.prices[lastPriceIndex].value : 0;

          const METRIC_LABEL = "1d";
          const percentageChangeLastHour =
            cryptoCoin.metrics?.find(({ label }) => label === METRIC_LABEL)
              ?.percentageChange || 0;

          return (
            <ListItem
              key={cryptoCoin._id}
              name={cryptoCoin.name}
              symbol={cryptoCoin.symbol}
              currentPrice={currentPrice}
              percentageChangeLastHour={percentageChangeLastHour}
              logoUrl={cryptoCoin.image?.small}
              onPress={() => handleItemPress(cryptoCoin)}
            />
          );
        })}
      </View>
    </ScrollView>
  );
}
