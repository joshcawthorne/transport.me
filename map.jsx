import React, { useState, useEffect } from "react";
import styled from "styled-components/native";
import { Platform, Text, View, StyleSheet, Dimensions } from "react-native";
import { useHistory } from "react-router-dom";
import * as Location from "expo-location";
import MapView, { Marker } from "react-native-maps";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppLoading } from "expo";

const ZoomInPromptContainer = styled.View`
  width: 100%;
  display: flex;
  position: absolute;
  justify-content: center;
  align-items: center;
  left: 0;
  top: 0;
  z-index: 2;
  margin-top: 50px;
`;

const ZoomInPrompt = styled.View`
  width: 200px;
  background-color: red;
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px 20px;
`;

const ZoomInText = styled.Text`
  font-size: 16px;
  text-align: center;
  color: #fff;
  font-weight: bold;
`;

export default function Map() {
  const app_id = "f310fe7a";
  const app_key = "592a92cc0b58c9e84abd7140d21f4a2f";
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [gotLocation, setGotLocation] = useState(false);
  const [noPermission, setNoPermission] = useState(false);
  const [retrivedStops, setRetrivedStops] = useState(false);
  const [stops, setStops] = useState("");
  const [zoomLevel, setZoomLevel] = useState(1);
  const [zoomedIn, setZoomedIn] = useState(false);
  const [regionChanging, setRegionChanging] = useState(false);

  let history = useHistory();

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        setNoPermission(true);
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      setGotLocation(true);
      getBusTimes();
    })();
  }, []);

  let text = "Waiting..";
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    text = JSON.stringify(location);
  }

  getBusTimes = () => {
    let apiURL =
      "https://transportapi.com/v3/uk/places.json?lat=" +
      location.coords.latitude +
      "&lon=" +
      location.coords.longitude +
      "&type=bus_stop&app_id=" +
      app_id +
      "&app_key=" +
      app_key;
    console.log(apiURL);
    fetch(apiURL)
      .then((data) => data.json())
      .then((dataJson) => {
        setStops(dataJson.member);
        setRetrivedStops(true);
      });
  };

  /*TODO: Try shift this to on-device to improve responsiveness */
  function getLocalStops(data) {
    let apiURL =
      "http://transportapi.com/v3/uk/places.json?min_lat=" +
      data.minLat +
      "&min_lon=" +
      data.minLng +
      "&max_lat=" +
      data.maxLat +
      "&max_lon=" +
      data.maxLng +
      "&type=bus_stop&app_id=" +
      app_id +
      "&app_key=" +
      app_key;
    console.log("localStopsCall", apiURL);
    fetch(apiURL)
      .then((data) => data.json())
      .then((dataJson) => {
        console.log(dataJson);
        setStops(dataJson.member);
        setRetrivedStops(true);
      });
  }

  function handleRegionChanged(e) {
    console.log(e);
    setZoomLevel(
      Math.log2(
        360 * (Dimensions.get("window").width / 256 / e.longitudeDelta)
      ) + 1
    );

    let boundingBox = getBoundingBox(e);
    console.log(boundingBox);
    setRegionChanging(false);
    if (zoomLevel > 16) {
      setZoomedIn(true);
      getLocalStops(boundingBox);
    } else {
      setZoomedIn(false);
    }
  }

  function handleMarkerClick(e, stop) {
    console.log(stop);
    navigation.navigate("/stop/" + stop);
  }

  function handleRegionChange() {
    setRegionChanging(true);
  }

  const LATITUDE_DELTA = 0.1;
  const LONGITUDE_DELTA =
    LATITUDE_DELTA *
    (Dimensions.get("window").width / Dimensions.get("window").height);

  function getBoundingBox(region) {
    let minLng = region.longitude - region.longitudeDelta / 2;
    let minLat = region.latitude - region.latitudeDelta / 2;
    let maxLng = region.longitude + region.longitudeDelta / 2;
    let maxLat = region.latitude + region.latitudeDelta / 2;

    let obj = {
      minLng: minLng,
      minLat: minLat,
      maxLng: maxLng,
      maxLat: maxLat,
    };

    return obj;
  }

  return (
    <View style={styles.container}>
      {gotLocation && retrivedStops ? (
        <>
          {console.log(location.coords.longitude)}

          {!regionChanging && !zoomedIn ? (
            <ZoomInPromptContainer>
              <ZoomInPrompt>
                <ZoomInText>Zoom in to see stops</ZoomInText>
              </ZoomInPrompt>
            </ZoomInPromptContainer>
          ) : null}
          <MapView
            initialRegion={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: LATITUDE_DELTA,
              longitudeDelta: LONGITUDE_DELTA,
            }}
            style={styles.mapStyle}
            showsUserLocation
            onRegionChange={(e) => handleRegionChange()}
            onRegionChangeComplete={(e) => handleRegionChanged(e)}
          >
            {zoomedIn
              ? stops.map((data, index) => (
                  <MapView.Marker
                    coordinate={{
                      latitude: data.latitude,
                      longitude: data.longitude,
                    }}
                    title={data.name}
                    onPress={(e) => handleMarkerClick(e, data.atcocode)}
                  />
                ))
              : null}
          </MapView>
        </>
      ) : (
        <Text>Loading...</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",

    justifyContent: "flex-start",
  },
  paragraph: {
    fontSize: 12,
  },
  mapStyle: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
  marker: {
    backgroundColor: "#550bcc",
    padding: 5,
    borderRadius: 5,
  },
});
