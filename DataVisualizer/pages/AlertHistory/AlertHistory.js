import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    ScrollView
  } from "react-native";
  import React, { useState } from "react";
  import { useNavigation } from "@react-navigation/native";
  import AlertItem from "../../components/AlertItems";

  export default function AlertHistory() {

    let alertArray = [{
        id: "idalerta1",
        name: "Alerta Numero 1",
        data: "29/01/2025 - 21:00",
        crypto: "DogeCoin",
        value: "100"
    },
    {
        id: "idalerta2",
        name: "Alerta Numero 2",
        data: "29/01/2025 - 21:10",
        crypto: "DogeCoin",
        value: "200"
    }]

    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={styles.body}>
            <View style={styles.titleWrapper}>
              <Text style={styles.largeTitle}>Histórico de Alertas</Text>
            </View>           
            <View style={styles.dividerLine} />
    
            {alertArray.map((alert) => {
              return (
                <AlertItem
                  key={alert.id}
                  name={alert.name}
                  value={alert.value}
                  data={alert.data}
                  crypto={alert.crypto}
                />
              );
            })}
          </View>
        </ScrollView>
      );
    }
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "flex-start",
      padding: 20,
      marginVertical: 50,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 10,
    },
    cont: {
      height: 48,
      width: "100%",
      borderRadius: 8,
      backgroundColor: "#002D82",
      justifyContent: "center",
      alignItems: "center",
      marginTop: 20,
    },
    titleText: {
      fontSize: 14,
      fontWeight: "bold",
      color: "#ffffff",
    },
    input: {
      height: 40,
      borderColor: "gray",
      borderWidth: 1,
      borderRadius: 5,
      paddingHorizontal: 10,
      marginBottom: 20,
      marginTop: 20,
    },
    subtitle: {
      marginTop: 4,
      fontSize: 17,
      color: "#000000",
      fontWeight: "bold",
    },
    viewMargin: {
      marginTop: 20,
    },
        body: {
          flex: 1,
          backgroundColor: "#fff",
        },
        titleWrapper: {
          marginTop: 80,
          paddingHorizontal: 16,
          color: '#fff'
        },
        largeTitle: {
          fontSize: 24,
          fontWeight: 'bold',
      
        },
        dividerLine: {
          height: StyleSheet.hairlineWidth,
          backgroundColor: "#A9ABB1",
          marginHorizontal: 16,
          marginTop: 16
      
        },

  });
  