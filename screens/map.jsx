import React, { useState, useEffect } from "react";
import styled from "styled-components/native";
import {
  Platform,
  Text,
  View,
  StyleSheet,
  Dimensions,
  AppState,
  TextInput,
} from "react-native";
import { useHistory } from "react-router-dom";
import * as Location from "expo-location";
import posed from "react-native-pose";
import MapView, { Marker } from "react-native-maps";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import Modal from "react-native-modal";
import { AppLoading } from "expo";
import * as Svg from "react-native-svg";
import dummyLiveData from "../data/dummyLiveData.json";
import dummyStops from "../data/dummyStops.json";
import dummyTimetable from "../data/dummyTimetable.json";
import LocationIllustration from "../assets/illustrations/location.svg";
import BusIcon from "../assets/icons/bus.svg";
import SearchIcon from "../assets/icons/search-circle.svg";
import busImg from "../assets/icons/bus.png";

import StopView from "./stopView";

const screenWidth = Dimensions.get("window").width; //full width
const screenHeight = Dimensions.get("window").height; //full height

const MapOuterContainer = styled.View`
  height: 100%;
  width: 100%;
`;

const SearchBarContainer = styled.View`
  width: 100%;
  display: flex;
  position: absolute;
  justify-content: center;
  align-items: center;
  left: 0;
  top: 0;
  z-index: 2;
  margin-top: 65px;
`;

const SearchBar = styled.View`
  width: 90%;
  height: 50px;
  background-color: #fff;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex-direction: row;
  padding-left: 10px;
`;

const SearchInput = styled.TextInput`
  color: #000;
  font-weight: bold;
  padding-left: 10px;
`;

const ZoomInPromptContainer = styled.View`
  width: 100%;
  display: flex;
  position: absolute;
  justify-content: center;
  align-items: center;
  left: 0;
  top: 0;
  z-index: 2;
  margin-top: 125px;
`;

const ZoomInPrompt = styled.View`
  background-color: red;
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 5px 10px;
`;

const ZoomInText = styled.Text`
  font-size: 14px;
  text-align: center;
  color: #fff;
  font-weight: bold;
`;

const Title = styled.Text`
  font-weight: bold;
  font-size: 32px;
`;

const TitleContainer = styled.View`
  margin-top: 75px;
  margin-left: 20px;
`;

const SubtextContainer = styled.View`
  margin-left: 20px;
  margin-top: 10px;
`;

const SubtextText = styled.Text`
  font-size: 16px;
  color: #8b8b8b;
`;

const IllustrationContainer = styled.View`
  width: 100%;
  height: 100%;
  margin-top: -200px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const StopModalContainer = styled.Modal`
  width: 100%;
  display: flex;
  justify-content: flex-end;
`;

const StopModal = styled.View`
  height: 90%;
  width: ${screenWidth}px;
  margin-left: -20px;
  margin-bottom: -20px;
  background-color: #fff;
  border-radius: 10px;
  position: absolute;
  bottom: 0;
  left: 0;
  align-self: stretch;
  padding: 15px 20px;
`;

const CloseModalPillContainer = styled.View`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
`;

const CloseModalPill = styled.View`
  height: 5px;
  width: 40px;
  background-color: #eee;
  border-radius: 30px;
`;

const CustomMarker = styled(posed.View)``;

const StopIcon = styled.View`
  background-color: #6d62f7;
  border-radius: 5px;
  height: 20px;
  width: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export default function Map({ navigation }) {
  const app_id = "f310fe7a";
  const app_key = "592a92cc0b58c9e84abd7140d21f4a2f";
  const [appState, setAppState] = useState(AppState.currentState);
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [gotLocation, setGotLocation] = useState(false);
  const [noPermission, setNoPermission] = useState(false);
  const [retrivedStops, setRetrivedStops] = useState(false);
  const [stops, setStops] = useState("");
  const [zoomLevel, setZoomLevel] = useState(12);
  const [zoomedIn, setZoomedIn] = useState(true);
  const [regionChanging, setRegionChanging] = useState(false);
  const [displayStopModal, setDisplayStopModal] = useState(false);
  const [selectedStop, setSelectedStop] = useState(null);

  let history = useHistory();

  useEffect(() => {
    (async () => {
      if (appState === "active") {
        let { status } = await Location.requestPermissionsAsync();
        if (status !== "granted") {
          setErrorMsg("Permission to access location was denied");
          setNoPermission(true);
        } else {
          setNoPermission(false);
        }

        let location = await Location.getCurrentPositionAsync({});
        setLocation(location);
        setGotLocation(true);
        getDummyStops();
      }
    })();
  }, [appState]);

  useEffect(() => {
    AppState.addEventListener("change", _handleAppStateChange);

    return () => {
      AppState.removeEventListener("change", _handleAppStateChange);
    };
  }, []);

  const _handleAppStateChange = (nextAppState) => {
    setAppState(nextAppState);
  };

  let text = "Waiting..";
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    text = JSON.stringify(location);
  }

  function getLocalStops(data) {
    let apiURL =
      "http://transportapi.com/v3/uk/places.json?limit=250&min_lat=" +
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

    fetch(apiURL)
      .then((data) => data.json())
      .then((dataJson) => {
        setStops(dataJson.member);
        setRetrivedStops(true);
      });
  }

  function handleRegionChanged(e) {
    setZoomLevel(
      Math.log2(
        360 * (Dimensions.get("window").width / 256 / e.longitudeDelta)
      ) + 1
    );

    let boundingBox = getBoundingBox(e);

    setRegionChanging(false);
    if (zoomLevel > 16) {
      setZoomedIn(true);
      getDummyStops(boundingBox);
    } else {
      setZoomedIn(false);
    }
  }

  function handleMarkerClick(e, stop) {
    setSelectedStop(stop);
    setDisplayStopModal(true);
  }

  function handleRegionChange() {
    setRegionChanging(true);
  }

  const LATITUDE_DELTA = 1.5;
  const LONGITUDE_DELTA =
    LATITUDE_DELTA *
    (Dimensions.get("window").width / Dimensions.get("window").height);

  function getBoundingBox(region) {
    let minLng = region.longitude - region.longitudeDelta / 2;
    let minLat = region.latitude - region.latitudeDelta / 2;
    let maxLng = region.longitude + region.longitudeDelta / 2;
    let maxLat = region.latitude + region.latitudeDelta / 2;

    let obj = {
      minLng: minLng - 0.1,
      minLat: minLat - 0.1,
      maxLng: maxLng + 0.1,
      maxLat: maxLat + 0.1,
    };

    return obj;
  }

  function getDummyStops() {
    setStops(dummyStops.member);
    setRetrivedStops(true);
  }

  return noPermission ? (
    <SafeAreaView>
      <TitleContainer>
        <Title>Location permissions required.</Title>
      </TitleContainer>
      <SubtextContainer>
        <SubtextText>
          To find stops near your location, please enable location permissions
          for Transport.me in your phones settings.
        </SubtextText>
      </SubtextContainer>
      <IllustrationContainer>
        <LocationIllustration width={175} height={185} />
      </IllustrationContainer>
    </SafeAreaView>
  ) : (
    <View style={styles.container}>
      <Modal
        isVisible={displayStopModal}
        swipeDirection={["down"]}
        propagateSwipe={true}
        onSwipeComplete={() => setDisplayStopModal(false)}
        onBackdropPress={() => setDisplayStopModal(false)}
        onBackButtonPress={() => setDisplayStopModal(false)}
        styles={styles.modalView}
        deviceHeight={screenHeight}
        deviceWidth={screenWidth}
        useNativeDriver={true}
      >
        <StopModal>
          <CloseModalPillContainer>
            <CloseModalPill />
          </CloseModalPillContainer>
          <StopView id={selectedStop} />
        </StopModal>
      </Modal>

      {gotLocation && retrivedStops ? (
        <>
          <SearchBarContainer>
            <SearchBar>
              <SearchIcon height={30} width={30} fill={"#84879C"} />
              <SearchInput
                placeholder={"Where to?"}
                placeholderTextCo={"#84879C"}
              />
            </SearchBar>
          </SearchBarContainer>
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
                  <Marker
                    coordinate={{
                      latitude: data.latitude,
                      longitude: data.longitude,
                    }}
                    onPress={(e) => handleMarkerClick(e, data.atcocode)}
                  >
                    <StopIcon>
                      <BusIcon fill={"#fff"} height={12.5} width={12.5} />
                    </StopIcon>
                  </Marker>
                ))
              : null}
          </MapView>
        </>
      ) : (
        <SafeAreaView>
          <Text>Loading...</Text>
        </SafeAreaView>
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
  modalView: {
    justifyContent: "flex-end",
    margin: 0,
  },
});
