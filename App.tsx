import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import MainStack from './src/routes/MainStack'; // Caminho correto da raiz para a pasta src

export default function App() {
  return (
    <NavigationContainer>
      <MainStack />
    </NavigationContainer>
  );
}