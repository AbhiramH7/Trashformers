import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/main/HomeScreen';
import ListingsScreen from '../screens/main/ListingsScreen';
import ListingDetailScreen from '../screens/main/ListingDetailScreen';
import CreateListingScreen from '../screens/main/CreateListingScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import PublicProfileScreen from '../screens/main/PublicProfileScreen';
import ConversationsScreen from '../screens/chat/ConversationsScreen';
import ChatThreadScreen from '../screens/chat/ChatThreadScreen';
import OrdersScreen from '../screens/orders/OrdersScreen';
import OrderDetailScreen from '../screens/orders/OrderDetailScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const HEADER = {
  headerStyle: { backgroundColor: '#1e293b' },
  headerTintColor: '#f1f5f9',
  headerTitleStyle: { fontWeight: '700' as const },
};

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={HEADER}>
      <Stack.Screen name="HomeMain" component={HomeScreen} options={{ title: '🏠 Home' }} />
      <Stack.Screen name="ListingDetail" component={ListingDetailScreen} options={{ title: 'Listing Details' }} />
      <Stack.Screen name="PublicProfile" component={PublicProfileScreen} options={{ title: 'Seller Profile' }} />
    </Stack.Navigator>
  );
}

function ListingsStack() {
  return (
    <Stack.Navigator screenOptions={HEADER}>
      <Stack.Screen name="Listings" component={ListingsScreen} options={{ title: '♻️ Waste Listings' }} />
      <Stack.Screen name="ListingDetail" component={ListingDetailScreen} options={{ title: 'Listing Details' }} />
      <Stack.Screen name="CreateListing" component={CreateListingScreen} options={{ title: 'Create Listing' }} />
      <Stack.Screen name="PublicProfile" component={PublicProfileScreen} options={{ title: 'Seller Profile' }} />
    </Stack.Navigator>
  );
}

function OrdersStack() {
  return (
    <Stack.Navigator screenOptions={HEADER}>
      <Stack.Screen name="OrdersList" component={OrdersScreen} options={{ title: '📦 My Orders' }} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ title: 'Order Details' }} />
      <Stack.Screen name="ListingDetail" component={ListingDetailScreen} options={{ title: 'Listing Details' }} />
      <Stack.Screen name="PublicProfile" component={PublicProfileScreen} options={{ title: 'Seller Profile' }} />
    </Stack.Navigator>
  );
}

function ChatStack() {
  return (
    <Stack.Navigator screenOptions={HEADER}>
      <Stack.Screen name="Conversations" component={ConversationsScreen} options={{ title: '💬 Messages' }} />
      <Stack.Screen
        name="ChatThread"
        component={ChatThreadScreen}
        options={({ route }: any) => ({ title: route.params?.recipientName || 'Chat' })}
      />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={HEADER}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} options={{ title: '👤 Profile' }} />
      <Stack.Screen name="ListingDetail" component={ListingDetailScreen} options={{ title: 'Listing Details' }} />
      <Stack.Screen name="CreateListing" component={CreateListingScreen} options={{ title: 'Create Listing' }} />
      <Stack.Screen name="PublicProfile" component={PublicProfileScreen} options={{ title: 'Seller Profile' }} />
    </Stack.Navigator>
  );
}

export default function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1e293b',
          borderTopColor: '#334155',
          paddingBottom: 6,
          paddingTop: 4,
          height: 62,
        },
        tabBarActiveTintColor: '#4ade80',
        tabBarInactiveTintColor: '#64748b',
      }}
    >
      <Tab.Screen name="HomeTab"      component={HomeStack}     options={{ tabBarLabel: '🏠 Home' }} />
      <Tab.Screen name="ListingsTab"  component={ListingsStack} options={{ tabBarLabel: '♻️ Listings' }} />
      <Tab.Screen name="OrdersTab"    component={OrdersStack}   options={{ tabBarLabel: '📦 Orders' }} />
      <Tab.Screen name="ChatTab"      component={ChatStack}     options={{ tabBarLabel: '💬 Chat' }} />
      <Tab.Screen name="ProfileTab"   component={ProfileStack}  options={{ tabBarLabel: '👤 Profile' }} />
    </Tab.Navigator>
  );
}
