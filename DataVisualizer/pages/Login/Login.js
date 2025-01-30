import React, { useEffect, useState } from "react";
import { ScrollView, Text, View, StyleSheet, TextInput,TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function Login() {

  const navigation = useNavigation();
  const [userLogin, setUserLogin] = useState();

  const handleItemPress = () => {
    navigation.navigate("Home", { paramKey: "user" });
  };

return (
    <View style={styles.container}>
      <Text style={styles.largeTitle}>Crypto Monitor</Text>
      <View style={styles.dividerLine}/>
      <View style={styles.subContainer}>
        <Text style={styles.secondTitle}>Login de Usuário</Text>
      </View>
        <TextInput
            style={styles.input}
            placeholder="Nome de usuário / email"
            value={userLogin}
            onChange={(value) => setUserLogin(value)}
        />

        <TextInput
            style={styles.input}
            placeholder="Senha"
            value={userLogin}
        />
        
        <View style = {styles.miniContainer}/>
        <TouchableOpacity
            style={styles.cont}
            onPress={() => handleItemPress()}
        >
            <Text style={styles.titleText}>Logar</Text>
        </TouchableOpacity>
        
    </View>
  );
  
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "center",
      paddingTop: "40%"
    },
    miniContainer: {
        justifyContent: "center",
        paddingTop: 40
      },
    subContainer: {
        paddingTop: 80,
        paddingBottom: 10
      },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 10,
    },
    cont: {
      height: 48,
      width: "90%",
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
      height: 52,
      width: "90%",
      borderColor: "black",
      borderWidth: 1.0,
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
        secondTitle: {
            fontSize: 19,
            fontWeight: 'bold',
        
          },
        dividerLine: {
          height: StyleSheet.hairlineWidth,
          backgroundColor: "#A9ABB1",
          marginHorizontal: 16,
          marginTop: 16
      
        },

  });

