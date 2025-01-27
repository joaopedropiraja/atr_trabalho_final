import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Chart from '../../components/Chart';

export default function CryptoInformation({route}) {
const  cryptoData  = route.params.paramKey;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crypto Information</Text>
      {
        <Chart
            key={cryptoData.id}
            currentPrice = {cryptoData.currentPrice}
            symbol = {cryptoData.symbol}
            logoUrl = {cryptoData.logoUrl}
            name = {cryptoData.name}
            priceChange7d = {cryptoData.priceChange7d}
            sparkline_in_7d = {cryptoData.sparkline_in_7d}
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