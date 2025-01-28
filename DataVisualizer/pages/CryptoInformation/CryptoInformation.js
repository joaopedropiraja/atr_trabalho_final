import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Chart from '../../components/Chart';

export default function CryptoInformation({route}) {
const  cryptoData  = route.params.paramKey;
const transformPrices = cryptoData.prices.map(price => ({
    x: new Date(price.timestamp).getTime(), 
    y: price.value                          
  }));
console.log(transformPrices)
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crypto Information</Text>
      {
        <Chart
            key={cryptoData._id}
            currentPrice = {cryptoData.prices[cryptoData.prices.length - 1].value}
            symbol = {cryptoData.symbol}
            logoUrl = {cryptoData.image.small}
            name = {cryptoData.name}
            priceChange7d = {cryptoData.metrics[2].percentageChange}
            movingAverage = {cryptoData.metrics[2].movingAverage}
            percentageChange = {cryptoData.metrics[2].percentageChange}
            sparkline_in_7d = {transformPrices}
        />
      }
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start', // Começa o conteúdo no topo
        padding: 20, // Adiciona espaçamento interno
        marginVertical: 50
      },
      title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10, // Espaçamento abaixo do título
      },
});