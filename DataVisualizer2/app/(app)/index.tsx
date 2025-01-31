import { useState } from "react";
import { ScrollView, Text, View, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { sample_data } from "@/assets/data/sample_data";
import ListItem from "@/components/ListItem";
import { router } from "expo-router";

export interface CryptoCoin {
  id: string;
  name: string;
  symbol: string;
  image?: {
    small?: string;
  };
  lastPrice?: {
    value: number;
  };
  percentageChange1h?: number;
}

type NavigationType = {
  navigate: (screen: string, params?: any) => void;
};

export default function Home() {
  const [cryptos, setCryptos] = useState<CryptoCoin[]>(sample_data);

  const handleItemPress = (cryptoCoin: CryptoCoin) => {
    // Pass the crypto's ID, name, and image to the Coin Details page
    router.push({
      pathname: `/coin/${cryptoCoin.id}`,
      params: {
        name: cryptoCoin.name,
        logo: cryptoCoin.image?.small || "",
      },
    });
  };
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.dividerLine} />

      {cryptos.map((cryptoCoin) => (
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
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#000", // Match dark background from login page
    padding: 16,
  },
  titleWrapper: {
    alignItems: "center",
    marginVertical: 16,
  },
  largeTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#00FFFF", // Turquoise highlight
    marginBottom: 4,
  },
  dividerLine: {
    height: 1,
    backgroundColor: "#222",
    marginBottom: 16,
  },
});
