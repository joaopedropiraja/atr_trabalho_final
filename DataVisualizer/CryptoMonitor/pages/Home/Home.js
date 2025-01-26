import { StatusBar } from 'expo-status-bar';
import React, { Component } from 'react';
import {ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ListItem from '../../components/ListItem';
import styles from './Styles';
import { SAMPLE_DATA } from "../../assets/data/sampleData";


export default function Home() {

  const navigation = useNavigation();

  //const [selectedCryptoData, setSelectedCryptoData] = useState(null)

  const handleItemPress = (object) => {
   //setSelectedCryptoData(object)
   //console.log(object)
    navigation.navigate('CryptoInformation', { paramKey: object });  // Navega para a tela CryptoInformation
  };



  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
    <View style={styles.body}>
      <View style={styles.titleWrapper}>
          <Text style = {styles.largeTitle}>Crypto Monitor</Text>
      </View>
      <View style = {styles.dividerLine} />
      {
        SAMPLE_DATA.map((object) => (
          <ListItem
            key={object.id}  // Defina uma chave única para cada item
            name={object.name}
            symbol={object.symbol}
            currentPrice={object.currentPrice}
            priceChange7d={object.priceChange7d}
            logoUrl={object.logoUrl}
            onPress = {() => handleItemPress(object)}
          />
        ))
      }
    </View>
    </ScrollView>
  );
}
