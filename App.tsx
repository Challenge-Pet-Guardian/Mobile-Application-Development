import React from 'react';
import { TabRoutes } from './src/routes/tabs';
import { NavigationContainer } from '@react-navigation/native';

export default function App() {
  return (
    <NavigationContainer>
      <TabRoutes />
    </NavigationContainer>
  );
}
