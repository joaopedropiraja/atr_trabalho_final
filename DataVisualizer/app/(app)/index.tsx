import {
  ScrollView,
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import ListItem from "@/components/ListItem";
import { router } from "expo-router";
import { useGetCryptoCoins } from "@/hooks/cryptoCoins";
import { CryptoCoin } from "@/api/cryptoCoins/types";

export default function Home() {
  const { data: cryptos, isLoading } = useGetCryptoCoins();

  const handleItemPress = (cryptoCoin: CryptoCoin) => {
    router.push({
      pathname: `/coin/${cryptoCoin.id}`,
      params: {
        name: cryptoCoin.name,
        logo: cryptoCoin.image?.small || "",
      },
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#00FFFF" />
        <Text style={styles.loaderText}>Carregando dados...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.dividerLine} />

      {cryptos?.map((cryptoCoin) => (
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
    backgroundColor: "#000",
    padding: 16,
  },
  titleWrapper: {
    alignItems: "center",
    marginVertical: 16,
  },
  largeTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#00FFFF",
    marginBottom: 4,
  },
  dividerLine: {
    height: 1,
    backgroundColor: "#222",
    marginBottom: 16,
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
});
