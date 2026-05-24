import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/main/HomeScreen';

export type MainTabParamList = {
  Home: undefined;
  Listings: undefined;
  Orders: undefined;
  Chat: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1e293b',
          borderTopColor: '#334155',
          paddingBottom: 6,
          height: 60,
        },
        tabBarActiveTintColor: '#4ade80',
        tabBarInactiveTintColor: '#64748b',
        tabBarLabel: route.name,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      {/* Phases 8-9 screens will be added here */}
    </Tab.Navigator>
  );
}
