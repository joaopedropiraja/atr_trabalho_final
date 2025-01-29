import React, { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";

import ListItem from "../../components/ListItem";
import styles from "./Styles";
import { SAMPLE_DATA } from "../../assets/data/sampleData";

export default function Home() {

  const navigation = useNavigation();
  const [cryptos, setCryptos] = useState(SAMPLE_DATA);

  useEffect(() => {
    // const fetchData = async () => {
    //   try {
    //     const response = await axios.get(
    //       "http://192.168.0.14:3000/api/v1/crypto-coins"
    //     );
    //     setCryptos(response.data);
    //   } catch (err) {
    //     console.error(err);
    //   }
    // };
    // fetchData();
  }, []);

  const handleItemPress = (cryptoCoin) => {
    navigation.navigate("CryptoInformation", { paramKey: cryptoCoin });
  };

  //console.log(SAMPLE_DATA[0].prices[SAMPLE_DATA[0].prices.length - 1].value)
  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View style={styles.body}>
        <View style={styles.titleWrapper}>
          <Text style={styles.largeTitle}>Crypto Monitor</Text>
        </View>

        <View style={styles.dividerLine} />

        {cryptos.map((cryptoCoin) => {
          return (
            <ListItem
              key={cryptoCoin.id}
              cryptoId={cryptoCoin.id}
              name={cryptoCoin.name}
              symbol={cryptoCoin.symbol}
              imageSrc={cryptoCoin.image?.small}
              lastPrice={cryptoCoin.lastPrice}
              percentageChange1h={cryptoCoin.percentageChange1h}
              onPress={() => handleItemPress(cryptoCoin)}
            />
          );
        })}
      </View>
    </ScrollView>
  );
}
