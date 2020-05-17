import React, { useEffect, useState } from "react";
import styled from "styled-components/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useHistory } from "react-router-dom";
import { StyleSheet, Text, View, ScrollView, Button } from "react-native";
import { NativeRouter, Route, Link } from "react-router-native";

import dummyLiveData from "../data/dummyLiveData.json";
import dummyTimetables from "../data/dummyTimetable.json";

const StyledView = styled.View``;

const ButtonContainer = styled.View`
  width: 100%;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  margin-bottom: 20px;
  margin-left: -10px;
`;

const StyledButton = styled.Button`
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  margin-bottom: 50px;
`;

const StopTitle = styled.Text`
  font-weight: bold;
  font-size: 32px;
`;

const Title = styled.Text`
  font-weight: bold;
  font-size: 22px;
  margin-top: 30px;
`;

const BusEntry = styled.View`
  display: flex;
  margin-top: 5px;
  margin-bottom: 5px;
  background-color: #eee;
  border-radius: 10px;
  padding: 5px 10px;
`;

const BusLine = styled.Text`
  font-size: 22px;
  font-weight: bold;
`;

const DepartureTime = styled.Text`
  font-size: 18px;
  font-weight: bold;
`;

const LiveDepartureTime = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: green;
`;

const DepartureContainer = styled.View`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-top: 5px;
`;

const DeparureTitle = styled.Text`
  font-size: 18px;
  margin-right: 5px;
`;

const LiveIndicator = styled.View`
  background-color: green;
  padding: 2.5px 5px;
  border-radius: 10px;
  margin-left: 5px;
`;

const LiveIndicatorText = styled.Text`
  color: #fff;
  font-size: 10px;
`;

const StopView = ({ route, navigation }) => {
  const app_id = "f310fe7a";
  const app_key = "592a92cc0b58c9e84abd7140d21f4a2f";
  const id = 450010938;
  let history = useHistory();

  let [busTimes, setBusTimes] = useState(null);
  let [retrivedBusTimes, setRetrivedBusTimes] = useState(false);
  let [busTimetables, setBusTimetables] = useState(null);
  let [retrivedBusTimetables, setRetrivedBusTimetables] = useState(false);
  let [stopName, setStopName] = useState("");

  useEffect(() => {
    getDummyBusTimes();
    getDummyTimetables();
  }, []);

  function getDummyBusTimes() {
    setStopName("King Lane Park & Ride (stop A)");
    let updData = JSON.parse(JSON.stringify(dummyLiveData.departures));
    console.log(typeof updData);
    var result = Object.keys(updData).map(function (key) {
      return [Number(key), updData[key]];
    });

    setBusTimes(result[0][1]);
    setRetrivedBusTimes(true);
    //setRetrivedBusTimes(true);
  }

  function getDummyTimetables() {
    let updData = JSON.parse(JSON.stringify(dummyTimetables.departures));
    console.log(typeof updData);
    var result = Object.keys(updData).map(function (key) {
      return [Number(key), updData[key]];
    });

    setBusTimetables(result[0][1]);
    setRetrivedBusTimetables(true);
  }

  function getBusTimes() {
    //const { id } = route.params;
    let apiURL =
      "https://transportapi.com/v3/uk/bus/stop/" +
      id +
      "/live.json?app_id=" +
      app_id +
      "&app_key=" +
      app_key;
    console.log(apiURL);
    fetch(apiURL)
      .then((data) => data.json())
      .then((dataJson) => {
        modifyData(dataJson);
      });
  }

  function modifyData(data) {
    setStopName(data.name);
    let updData = JSON.parse(JSON.stringify(data.departures));
    console.log(typeof updData);
    var result = Object.keys(updData).map(function (key) {
      return [Number(key), updData[key]];
    });

    setBusTimes(result[0][1]);
    setRetrivedBusTimes(true);
  }

  function getTimetables() {
    let apiURL =
      "https://transportapi.com/v3/uk/bus/stop/" +
      id +
      "/2020-05-16/21:30/timetable.json/?app_id=" +
      app_id +
      "&app_key=" +
      app_key;
    console.log(apiURL);
    fetch(apiURL)
      .then((data) => data.json())
      .then((dataJson) => {
        modifyTimetable(dataJson);
      });
  }

  function modifyTimetable(data) {
    let updData = JSON.parse(JSON.stringify(data.departures));
    console.log(typeof updData);
    var result = Object.keys(updData).map(function (key) {
      return [Number(key), updData[key]];
    });

    setBusTimetables(result[0][1]);
    setRetrivedBusTimetables(true);
  }

  return (
    <SafeAreaView>
      <StyledView>
        <StopTitle>{stopName}</StopTitle>

        {retrivedBusTimes ? (
          <>
            <Title>Next Arrivals</Title>
            <View>
              {busTimes.map((data, index) => (
                <BusEntry>
                  <BusLine>{data.line}</BusLine>
                  <DepartureContainer>
                    <DeparureTitle>Departs</DeparureTitle>
                    <LiveDepartureTime>
                      {data.expected_departure_time}
                    </LiveDepartureTime>
                    <LiveIndicator>
                      <LiveIndicatorText>Live</LiveIndicatorText>
                    </LiveIndicator>
                  </DepartureContainer>
                </BusEntry>
              ))}
            </View>
          </>
        ) : (
          <Text>Getting Live Bus Times...</Text>
        )}
        {retrivedBusTimetables ? (
          <>
            <Title>Fixed Timetables</Title>
            {busTimetables.length === 0 ? (
              <Text>No Scheduled Departures for this time</Text>
            ) : (
              <View>
                {busTimetables.map((data, index) => (
                  <BusEntry>
                    <BusLine>{data.line}</BusLine>
                    <DepartureContainer>
                      <DeparureTitle>Departs</DeparureTitle>
                      <DepartureTime>{data.aimed_departure_time}</DepartureTime>
                    </DepartureContainer>
                  </BusEntry>
                ))}
              </View>
            )}
          </>
        ) : (
          <Text>Getting Bus Timetables...</Text>
        )}
      </StyledView>
    </SafeAreaView>
  );
};

export default StopView;
