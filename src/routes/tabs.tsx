import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import Home from '../screens/Home/HomeScreen';
import FamilyStack from './FamilyStack';
import PetProfile from '../screens/PetProfile/PetProfileScreen';
import DicasPet from '../screens/DicasPet/DicasPetScreen';
import UserProfile from '../screens/UserProfile/UserProfileScreen';

const Tab = createBottomTabNavigator();

export default function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#000',
          bottom: 20,
          marginHorizontal: 20,
          borderRadius: 17,
          borderTopWidth: 0,
          elevation: 5,
          height: 60,
          position: 'absolute',
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
            <FontAwesome name="users" color={color} size={size} />
          )
        }}
      />

      <Tab.Screen
        name="MeuPet"
        component={PetProfile}
        options={{
          tabBarLabel: () => null,
          tabBarIcon: ({ focused }) => (
            <View style={styles.centerButton}>
              <MaterialCommunityIcons 
                name="paw" 
                size={35} 
                color={focused ? '#0066ff' : '#000'} 
              />
            </View>
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

const styles = StyleSheet.create({
  centerButton: {
    width: 65,
    height: 65,
    backgroundColor: '#FFF',
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Platform.OS === 'android' ? 30 : 20, 
    borderWidth: 5,
    borderColor: '#000', 
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4 },
      android: { elevation: 6 },
    }),
  }
});