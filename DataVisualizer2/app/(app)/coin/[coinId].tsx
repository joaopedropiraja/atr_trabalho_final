// app/coin/[coinId].tsx
import React, { FC, useEffect } from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { useLocalSearchParams, useNavigation } from "expo-router";

const CoinPage: FC = () => {
  const { coinId, name, logo } = useLocalSearchParams(); // Get values from URL
  const navigation = useNavigation();

  useEffect(() => {
    if (name && logo) {
      // Set dynamic title with the coin name and logo
      navigation.setOptions({
        title: "",
        headerTitle: () => (
          <View style={styles.header}>
            <Image
              source={{
                uri: String(logo),
              }}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.headerText}>{name}</Text>
          </View>
        ),
      });
    }
  }, [name, logo]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Coin Details</Text>
      <Text style={styles.infoText}>
        {coinId ? `Details for coin: ${name}` : "No coin selected."}
      </Text>
    </View>
  );
};

export default CoinPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#00FFFF",
    marginBottom: 10,
  },
  infoText: {
    color: "#FFF",
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
    fontSize: 25,
    fontWeight: "bold",
  },
});
