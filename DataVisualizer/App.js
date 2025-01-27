import React, { Component } from "react";
import Home from "./pages/Home/Home";
import CryptoInformation from "./pages/CryptoInformation/CryptoInformation";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const HomeStack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <HomeStack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName="Home"
      >
        <HomeStack.Screen name="Home" component={Home} />
        <HomeStack.Screen
          name="CryptoInformation"
          component={CryptoInformation}
        />
      </HomeStack.Navigator>
    </NavigationContainer>
  );
}
