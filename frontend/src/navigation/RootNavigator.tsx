import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../constants/theme';
import { RootStackParamList, TabParamList } from './types';
import { useAuth } from '../context/AuthContext';

import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { ExploreScreen } from '../screens/ExploreScreen';
import { TicketsScreen } from '../screens/TicketsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { SearchResultsScreen } from '../screens/SearchResultsScreen';
import { AttractionScreen } from '../screens/AttractionScreen';
import { SeatsScreen } from '../screens/SeatsScreen';
import { PassengerScreen } from '../screens/PassengerScreen';
import { PaymentScreen } from '../screens/PaymentScreen';
import { SuccessScreen } from '../screens/SuccessScreen';
import { TicketDetailScreen } from '../screens/TicketDetailScreen';
import { ProvincePickerScreen } from '../screens/ProvincePickerScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const TabIcon = ({ icon, focused }: { icon: string; focused: boolean }) => (
  <Text style={[styles.tabIcon, focused && { transform: [{ scale: 1.15 }] }] as any}>
    {icon}
  </Text>
);

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: colors.green,
      tabBarInactiveTintColor: colors.gray400,
      tabBarStyle: {
        height: 64,
        paddingBottom: 10,
        paddingTop: 8,
        backgroundColor: colors.white,
        borderTopWidth: 0,
        elevation: 12,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: -3 },
      },
      tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
    }}
  >
    <Tab.Screen
      name="Home"
      component={HomeScreen}
      options={{ tabBarIcon: ({ focused }) => <TabIcon icon="🏠" focused={focused} /> }}
    />
    <Tab.Screen
      name="Explore"
      component={ExploreScreen}
      options={{ tabBarIcon: ({ focused }) => <TabIcon icon="🗺️" focused={focused} /> }}
    />
    <Tab.Screen
      name="Tickets"
      component={TicketsScreen}
      options={{
        title: 'Bilhetes',
        tabBarIcon: ({ focused }) => <TabIcon icon="🎫" focused={focused} />,
      }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{ tabBarIcon: ({ focused }) => <TabIcon icon="👤" focused={focused} /> }}
    />
  </Tab.Navigator>
);

export const RootNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) return null;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      {!user ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen
            name="ProvincePicker"
            component={ProvincePickerScreen}
            options={{ presentation: 'modal' }}
          />
          <Stack.Screen name="SearchResults" component={SearchResultsScreen} />
          <Stack.Screen name="Attraction" component={AttractionScreen} />
          <Stack.Screen name="Seats" component={SeatsScreen} />
          <Stack.Screen name="Passenger" component={PassengerScreen} />
          <Stack.Screen name="Payment" component={PaymentScreen} />
          <Stack.Screen name="Success" component={SuccessScreen} />
          <Stack.Screen name="TicketDetail" component={TicketDetailScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  tabIcon: { fontSize: 20 },
});
