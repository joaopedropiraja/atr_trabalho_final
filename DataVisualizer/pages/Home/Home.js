import { StatusBar } from "expo-status-bar";
import React, { Component } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import ListItem from "../../components/ListItem";
import styles from "./Styles";
import { SAMPLE_DATA } from "../../assets/data/sampleData";

export default function Home() {

  const navigation = useNavigation();

  const handleItemPress = (object) => {
    navigation.navigate("CryptoInformation", { paramKey: object }); // Navega para a tela CryptoInformation
  };

  console.log(SAMPLE_DATA[0].prices[SAMPLE_DATA[0].prices.length - 1].value)
  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View style={styles.body}>
        <View style={styles.titleWrapper}>
          <Text style={styles.largeTitle}>Crypto Monitor</Text>
        </View>
        <View style={styles.dividerLine} />
        {SAMPLE_DATA.map((object) => (
          <ListItem
            key={object._id}
            name={object.name}
            symbol={object.symbol}
            currentPrice={object.prices[object.prices.length - 1].value}
            priceChange7d={object.metrics[2].percentageChange}
            logoUrl={object.image.small}
            onPress={() => handleItemPress(object)}
          />
        ))}
      </View>
    </ScrollView>
  );
}
