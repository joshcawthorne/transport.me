import React from "react";
import { StyleSheet, Text, View, AppRegistry } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "@expo/vector-icons/Ionicons";

import { NativeRouter, Route, Link, Switch } from "react-router-native";

import Map from "./map";
import Routes from "./routes";
import StopView from "./stopView";
import NoMatch from "./noMatch";

const Tab = createBottomTabNavigator();

class App extends React.Component {
  render() {
    return (
      <SafeAreaProvider>
        {/*
        <NativeRouter>
          <View>
            <Switch>
              <Route exact path="/" component={Map} />
              <Route path={"/stop/:id"} component={StopView} />
              <Route component={NoMatch} />
            </Switch>
          </View>
        </NativeRouter>
        */}
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
            <Tab.Screen name="Map" component={Map} />
            <Tab.Screen name="Routes" component={Routes} />
          </Tab.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    );
  }
}

export default App;
