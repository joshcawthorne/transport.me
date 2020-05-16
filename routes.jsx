import React from "react";
import styled from "styled-components/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text } from "react-native";

const RoutesContainer = styled.View`
  padding: 0px 20px;
`;

const Title = styled.Text`
  font-weight: bold;
  font-size: 32px;
`;

const TitleContainer = styled.View`
  margin-top: 75px;
`;

const SubtitleContainer = styled.View`
  width: 100%;
  background-color: #fff;
  height: 50px;
  margin-top: 10px;
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Subtitle = styled.Text`
  font-size: 18px;
`;

const Routes = () => {
  return (
    <SafeAreaView>
      <RoutesContainer>
        <TitleContainer>
          <Title>Routes</Title>
        </TitleContainer>
        <SubtitleContainer>
          <Subtitle>Coming Soon!</Subtitle>
        </SubtitleContainer>
      </RoutesContainer>
    </SafeAreaView>
  );
};

export default Routes;
