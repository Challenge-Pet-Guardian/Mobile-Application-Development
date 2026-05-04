import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import Home from '../screens/Home/HomeScreen';
import DicasPet from '../screens/DicasPet/DicasPetScreen';
import UserProfile from '../screens/UserProfile/UserProfileScreen';
import FamilyStack from './FamilyStack';

const Tab = createBottomTabNavigator();

export default function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#000',
          height: 60
        },
        tabBarActiveTintColor: '#0066ff',
        tabBarInactiveTintColor: '#999'
      }}
    >
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="home" color={color} size={size} />
          )
        }}
      />

      <Tab.Screen
        name="Family"
        component={FamilyStack}
        options={{
          title: 'Family Pet',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="pets" color={color} size={size} />
          )
        }}
      />

      <Tab.Screen
        name="Dicas"
        component={DicasPet}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="lightbulb-outline" color={color} size={size} />
          )
        }}
      />

      <Tab.Screen
        name="Perfil"
        component={UserProfile}
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="user" color={color} size={size} />
          )
        }}
      />
    </Tab.Navigator>
  );
}