import React from "react";
import { StyleSheet, Text, View, AppRegistry } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import {
  createStackNavigator,
  TransitionPresets,
} from "@react-navigation/stack";

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "@expo/vector-icons/Ionicons";

import { NativeRouter, Route, Link, Switch } from "react-router-native";

import Map from "./screens/map";
import Routes from "./screens/routes";
import StopView from "./screens/stopView";
import NoMatch from "./screens/noMatch";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MapStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Map"
        component={Map}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="Stop" component={StopView} mode={"modal"} />
    </Stack.Navigator>
  );
}

class App extends React.Component {
  render() {
    //Disable in-app log
    console.disableYellowBox = true;
    return (
      <SafeAreaProvider>
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={({ route }) => ({
              tabBarIcon: ({ focused, color, size }) => {
                let iconName;

                if (route.name === "Map") {
                  iconName = focused ? "md-map" : "md-map";
                } else if (route.name === "Routes") {
                  iconName = focused ? "md-bus" : "md-bus";
                }

                // You can return any component that you like here!
                return <Ionicons name={iconName} size={size} color={color} />;
              },
            })}
            tabBarOptions={{
              activeTintColor: "tomato",
              inactiveTintColor: "gray",
            }}
          >
            <Tab.Screen name="Map" component={MapStack} />
            <Tab.Screen name="Routes" component={Routes} />
          </Tab.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    );
  }
}

export default App;
