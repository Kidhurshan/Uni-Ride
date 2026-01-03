import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useNotifications } from '../context/NotificationContext';

// Home Stack Screens
import HomeScreen from '../screens/home/HomeScreen';
import RideDetailsScreen from '../screens/home/RideDetailsScreen';
import SearchRidesScreen from '../screens/home/SearchRidesScreen';

// Rides Stack Screens
import MyRidesScreen from '../screens/rides/MyRidesScreen';
import CreateRideScreen from '../screens/rides/CreateRideScreen';
import EditRideScreen from '../screens/rides/EditRideScreen';
import RideBookingsScreen from '../screens/rides/RideBookingsScreen';

// Bookings Stack Screens
import MyBookingsScreen from '../screens/bookings/MyBookingsScreen';
import BookingDetailsScreen from '../screens/bookings/BookingDetailsScreen';

// Messages Stack Screens
import ConversationsScreen from '../screens/messages/ConversationsScreen';
import ChatScreen from '../screens/messages/ChatScreen';

// Profile Stack Screens
import ProfileScreen from '../screens/profile/ProfileScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import DriverInfoScreen from '../screens/profile/DriverInfoScreen';
import NotificationsScreen from '../screens/profile/NotificationsScreen';
import ReviewsScreen from '../screens/profile/ReviewsScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Home Stack
const HomeStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="HomeMain"
      component={HomeScreen}
      options={{ title: 'Uni-Ride' }}
    />
    <Stack.Screen
      name="SearchRides"
      component={SearchRidesScreen}
      options={{ title: 'Search Rides' }}
    />
    <Stack.Screen
      name="RideDetails"
      component={RideDetailsScreen}
      options={{ title: 'Ride Details' }}
    />
  </Stack.Navigator>
);

// Rides Stack (for drivers)
const RidesStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="MyRidesMain"
      component={MyRidesScreen}
      options={{ title: 'My Rides' }}
    />
    <Stack.Screen
      name="CreateRide"
      component={CreateRideScreen}
      options={{ title: 'Post a Ride' }}
    />
    <Stack.Screen
      name="EditRide"
      component={EditRideScreen}
      options={{ title: 'Edit Ride' }}
    />
    <Stack.Screen
      name="RideBookings"
      component={RideBookingsScreen}
      options={{ title: 'Bookings' }}
    />
  </Stack.Navigator>
);

// Bookings Stack (for riders)
const BookingsStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="MyBookingsMain"
      component={MyBookingsScreen}
      options={{ title: 'My Bookings' }}
    />
    <Stack.Screen
      name="BookingDetails"
      component={BookingDetailsScreen}
      options={{ title: 'Booking Details' }}
    />
  </Stack.Navigator>
);

// Messages Stack
const MessagesStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="ConversationsMain"
      component={ConversationsScreen}
      options={{ title: 'Messages' }}
    />
    <Stack.Screen
      name="Chat"
      component={ChatScreen}
      options={({ route }) => ({ title: route.params?.name || 'Chat' })}
    />
  </Stack.Navigator>
);

// Profile Stack
const ProfileStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="ProfileMain"
      component={ProfileScreen}
      options={{ title: 'Profile' }}
    />
    <Stack.Screen
      name="EditProfile"
      component={EditProfileScreen}
      options={{ title: 'Edit Profile' }}
    />
    <Stack.Screen
      name="DriverInfo"
      component={DriverInfoScreen}
      options={{ title: 'Driver Information' }}
    />
    <Stack.Screen
      name="Notifications"
      component={NotificationsScreen}
      options={{ title: 'Notifications' }}
    />
    <Stack.Screen
      name="Reviews"
      component={ReviewsScreen}
      options={{ title: 'My Reviews' }}
    />
    <Stack.Screen
      name="Settings"
      component={SettingsScreen}
      options={{ title: 'Settings' }}
    />
  </Stack.Navigator>
);

const MainNavigator = () => {
  const { unreadCount } = useNotifications();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Rides':
              iconName = focused ? 'car' : 'car-outline';
              break;
            case 'Bookings':
              iconName = focused ? 'ticket' : 'ticket-outline';
              break;
            case 'Messages':
              iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'ellipse';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4F46E5',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Rides" component={RidesStack} />
      <Tab.Screen name="Bookings" component={BookingsStack} />
      <Tab.Screen
        name="Messages"
        component={MessagesStack}
        options={{
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
        }}
      />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
};

export default MainNavigator;
