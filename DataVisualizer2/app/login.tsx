import { useLogin } from "@/hooks/auth";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  StyleSheet,
  View,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from "react-native";

const { width, height } = Dimensions.get("window");

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const {
    mutate: login,
    isPending,
    error,
  } = useLogin({
    onSuccess: () => {
      router.replace("/");
    },
    onError: (err) => {
      console.error("Login failed:", err.message);
    },
  });

  const handleLogin = async () => {
    login({ email, password });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.overlay} />

      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Crypto Coin Monitor</Text>
      </View>

      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#888"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#888"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {error && <Text style={styles.errorText}>{error.message}</Text>}

        <TouchableOpacity
          style={[styles.button, isPending && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={isPending}
        >
          {isPending ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  backgroundImage: {
    width,
    height,
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  headerContainer: {
    flex: 1,
    marginTop: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "#00FFFF",
    marginBottom: 10,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#AAA",
    fontWeight: "400",
  },
  formContainer: {
    flex: 2,
    width: "85%",
    justifyContent: "center",
  },
  input: {
    backgroundColor: "#1A1A1A",
    color: "#FFF",
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#00FFFF",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 15,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#000",
    fontWeight: "700",
    fontSize: 16,
  },
  errorText: {
    color: "red",
    marginTop: 5,
    textAlign: "center",
  },
});
