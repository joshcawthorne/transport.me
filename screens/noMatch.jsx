import React from "react";
import { View, Text } from "react-native";
import { useHistory } from "react-router-dom";
import styled from "styled-components/native";

const StyledView = styled.View`
  margin-top: 25px;
`;

const Button = styled.Text`
  padding: 10px 15px;
  border-radius: 10px;
  background-color: #eee;
`;

const noMatch = () => {
  let history = useHistory();
  return (
    <StyledView>
      <Text>Error: 404</Text>
      <Button onPress={() => history.push("/")}>Close</Button>
    </StyledView>
  );
};

export default noMatch;
