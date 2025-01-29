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

export default function CryptoAlert({ route }) {
  const cryptoInfo = route.params.paramKey;

  const [valueInf, setValueInf] = useState("");
  const [valueSup, setValueSup] = useState("");

  const CryptoAndAlertObject = {
    ...cryptoInfo,
    alert_infereior_value: valueInf,
    alert_superior_value: valueSup,
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crypto Alerts</Text>
      <Text style={styles.subtitle}>
        Alerta para valor de limite inferior (R$)
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Digite aqui"
        value={valueInf}
        onChangeText={(text) => setValueInf(text)}
        keyboardType="numeric"
      />
      <View style={styles.viewMargin} />
      <Text style={styles.subtitle}>
        Alerta para valor de limite superior (R$)
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Digite aqui"
        value={valueSup}
        onChangeText={(text) => setValueSup(text)}
        keyboardType="numeric"
      />
      <TouchableOpacity style={styles.cont}>
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
  },
  viewMargin: {
    marginTop: 20,
  },
});
