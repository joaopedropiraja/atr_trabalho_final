import React from 'react'
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native'
import styles from './Styles';

const ListItem = ({ name, symbol, currentPrice, logoUrl, priceChange7d, onPress }) => {
    const priceChangeColor = priceChange7d > 0 ? '#34C759' : '#FF3830';
    return (
        <TouchableOpacity onPress = {onPress}>
            <View style = {styles.itemWrapper}>

                {/*Lado esquerdo */}
                <View style = {styles.leftWrapper}>
                    <Image source={{uri: logoUrl}} style = {styles.image}></Image>
                    <View style = {styles.titleWrapper}>
                        <Text style = {styles.title}> {name} </Text>
                        <Text style = {styles.subtitle}> {symbol.toUpperCase()} </Text>
                    </View>
                </View>

                {/*Lado Direito*/}
                <View style = {styles.rightWrapper}>
                    <Text style = {styles.title}>${currentPrice?.toLocaleString('en-US', { currency: 'USD' })}</Text>
                    <Text style = {[styles.subtitle, {color: priceChangeColor}]}> {priceChange7d?.toFixed(2)} %</Text>
                </View>

            </View>
        </TouchableOpacity>
    )
}

export default ListItem