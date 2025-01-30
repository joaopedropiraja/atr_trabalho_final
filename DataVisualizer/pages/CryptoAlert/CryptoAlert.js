import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import Chart from "../../components/Chart";
import { Dropdown } from 'react-native-element-dropdown';
import AntDesign from '@expo/vector-icons/AntDesign';

export default function CryptoAlert({ route }) {
  const cryptoInfo = route.params.paramKey;

  const valueOptionsAlert = [
    { label: 'Alerta de aumento de preço', value: 'alert_Superior'},
    { label: 'Alerta de queda de preço', value: 'alert_Inferior'}
  ]

  const [typeAlert, setTypeAlert] = useState("");
  const [valueAlert, setValueAlert] = useState("");

  const navigation = useNavigation();
  const handleItemPress = () => {
    navigation.navigate("Home", { paramKey: "alerta" });
  };

 
  const CryptoAndAlertObject = {
    ...cryptoInfo,
    alert_type: typeAlert,
    alert_value: valueAlert,
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crypto Alerts</Text>
      <View style={styles.dividerLine} />
      <Dropdown
          style={[styles.dropdown]}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          iconStyle={styles.iconStyle}
          data={valueOptionsAlert}
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder= "Selecione o tipo de alerta"
          value={typeAlert}
          onChange={item => {
            setTypeAlert(item.value);
          }}
        />
        <Text style={styles.subtitle}>
          Digite o valor para o alerta
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Digite aqui"
          value={valueAlert}
          onChangeText={(text) => setValueAlert(text)}
          keyboardType="numeric"
        />
        <TouchableOpacity style={styles.cont} onPress={() => handleItemPress()}>
          <Text style={styles.titleText}>Definir valores</Text>
        </TouchableOpacity>
    </View>
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
  dropdown: {
      height: 40,
      borderColor: 'gray',
      borderWidth: 0.5,
      borderRadius: 8,
      paddingHorizontal: 8,
      marginTop: 10,
      marginBottom: 10
    },
    icon: {
      marginRight: 5,
    },
    label: {
      position: 'absolute',
      backgroundColor: 'white',
      left: 22,
      top: 8,
      zIndex: 999,
      paddingHorizontal: 8,
      fontSize: 14,
    },
    placeholderStyle: {
      fontSize: 16,
    },
    selectedTextStyle: {
      fontSize: 16,
    },
    iconStyle: {
      width: 20,
      height: 20,
    },
    inputSearchStyle: {
      height: 40,
      fontSize: 16,
    },
    dividerLine: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: "#A9ABB1",
      marginHorizontal: 16,
      marginTop: 16
  
    },
});
