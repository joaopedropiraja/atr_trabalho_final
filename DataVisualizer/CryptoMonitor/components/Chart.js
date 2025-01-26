import React from 'react'
import {View, Text, Image, Dimensions} from 'react-native'
import { StyleSheet } from 'react-native';
//import {ChartDot, ChartPath, ChartPathProvider} from '@rainbow-me/animated-charts';


export const {width: SIZE} = Dimensions.get('window');
const Chart = ({ currentPrice, logoUrl, name, symbol, priceChange7d, sparkline_in_7d}) => {
    const priceChangeColor = priceChange7d > 0 ? '#34C759' : '#FF3830';
    return(
        //<ChartPathProvider data = {{points: sparkline_in_7d, smoothingStrategy: 'bezier'}}>
            <View style = {styles.chartWrapper}>
                <View style = {styles.titlesWrapper}>
                    <View style = {styles.upperTitles}>
                        <View style = {styles.upperLeftTitle}>
                            <Image source = {{ uri: logoUrl }} style = {styles.image}/>
                            <Text style = {styles.subtitle}>{name} ({symbol.toUpperCase()})</Text>
                        </View>
                        <Text style = {styles.subtitle}>7d</Text>
                    </View>
                    <View style = {styles.lowerTitles}>
                        <Text style = {styles.boldTitle}>${currentPrice.toLocaleString('en-US', {currency: 'USD'})}</Text>
                        <Text style = {[styles.subtitle, {color: priceChangeColor}]}>{priceChange7d.toFixed(2)}%</Text>

                    </View>
                </View>
                {/* <ChartPath height = {SIZE / 2} stroke="black" width = {SIZE}/>
                <ChartDot style = {{backgroundColor: 'blue'}}/> */}
            </View>
        //</ChartPathProvider>
    )
}


const styles = StyleSheet.create({
    chartWrapper: {
        marginVertical: 30
      },
      titlesWrapper: {
        marginHorizontal: 16
      },
      upperTitles: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      },
      upperLeftTitle: {
        flexDirection: 'row',
        alignItems: 'center',
      },
      image: {
        width: 47,
        height: 47,
        marginRight: 4,
      },
      subtitle: {
        fontSize: 17,
        color: '#000000',
      },
      lowerTitles: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10
      },
      boldTitle: {
        fontSize: 24,
        fontWeight: 'bold',
      },
      title: {
        fontSize: 18,
      },
})

export default Chart
