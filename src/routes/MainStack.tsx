import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import WelcomeScreen from '../screens/Welcome/WelcomeScreen';
import LoginScreen from '../screens/Login/LoginScreen';
import RegisterScreen from '../screens/Register/RegisterScreen';
import Tabs from './tabs';

const Stack = createNativeStackNavigator();

export default function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Tela de boas-vindas — ponto de entrada do app */}
      <Stack.Screen name="Welcome" component={WelcomeScreen} />

      {/* Autenticação */}
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />

      {/* App principal */}
      <Stack.Screen name="Tabs" component={Tabs} />
    </Stack.Navigator>
  );
}