import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAppSelector } from '../store/store';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Screens (nous les créerons plus tard)
import HomeScreen from '../screens/HomeScreen';
import PostScreen from '../screens/PostScreen';
import SearchScreen from '../screens/SearchScreen';
import MessagesScreen from '../screens/MessagesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AuthNavigator from './AuthNavigator';

const Tab = createBottomTabNavigator();

const AppNavigator = () => {
  const user = useAppSelector((state) => state.auth.user);

  if (!user) {
    return <AuthNavigator />;
  }

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Search':
              iconName = focused ? 'magnify' : 'magnify';
              break;
            case 'Post':
              iconName = focused ? 'plus-circle' : 'plus-circle-outline';
              break;
            case 'Messages':
              iconName = focused ? 'message' : 'message-outline';
              break;
            case 'Profile':
              iconName = focused ? 'account' : 'account-outline';
              break;
            default:
              iconName = 'help';
          }

          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6200ee',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Accueil' }} />
      <Tab.Screen name="Search" component={SearchScreen} options={{ title: 'Rechercher' }} />
      <Tab.Screen name="Post" component={PostScreen} options={{ title: 'Publier' }} />
      <Tab.Screen name="Messages" component={MessagesScreen} options={{ title: 'Messages' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profil' }} />
    </Tab.Navigator>
  );
};

export default AppNavigator;
