import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import FamilyPetScreen from '../screens/FamilyPet/FamilyPetScreen';
import AddMemberScreen from '../screens/AddMember/AddMemberScreen';

const Stack = createNativeStackNavigator();

export default function FamilyStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="FamilyHome" component={FamilyPetScreen} />
      <Stack.Screen name="AddMember" component={AddMemberScreen} />
    </Stack.Navigator>
  );
}