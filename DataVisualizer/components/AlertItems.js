import React, { useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
//import styles from "./Styles";
import { toMonetaryFormat } from "../utils/toMonetaryFormat";


const AlertItems = ({
  name,
  data,
  crypto,
  value

}) => {

  const priceChangeColor =
    value === 0
      ? "#A9ABB1"
      : value > 0
      ? "#34C759"
      : "#FF3830";

  return (
    <View style = {styles.container}>
      <View style={styles.itemWrapper}>
        <Text style={styles.boldTitle}>{name}</Text>
        <Text style={styles.title}>{data}</Text>
      </View>
      <View style={styles.itemAlert}>
        <Text style={styles.title}>{crypto}</Text>
        <Text style={[styles.title, { color: priceChangeColor }]}>{toMonetaryFormat(value)}</Text>
      </View>
      </View>


        
  );
};


const styles = StyleSheet.create({
  itemWrapper: {
    paddingHorizontal: 16,
    marginTop: 24,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
  },
  boldTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  itemAlert: {
    paddingHorizontal: 16,
    marginTop: 10,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});


export default AlertItems