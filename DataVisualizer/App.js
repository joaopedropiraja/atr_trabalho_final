import React, { Component } from "react";
import Home from "./pages/Home/Home";
import CryptoInformation from "./pages/CryptoInformation/CryptoInformation";
import CryptoAlert from "./pages/CryptoAlert/CryptoAlert";
import AlertHistory from "./pages/AlertHistory/AlertHistory";
import Login from "./pages/Login/Login";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const HomeStack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <HomeStack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName="Login"
      >
        <HomeStack.Screen name="Home" component={Home} />
        <HomeStack.Screen
          name="CryptoInformation"
          component={CryptoInformation}
        />

        <HomeStack.Screen
          name="CryptoAlert"
          component={CryptoAlert}
        />

        <HomeStack.Screen
          name="AlertHistory"
          component={AlertHistory}
        />

        <HomeStack.Screen
          name="Login"
          component={Login}
        />

      </HomeStack.Navigator>
    </NavigationContainer>
  );
}
