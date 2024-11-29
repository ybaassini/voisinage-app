import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Platform, View, StyleSheet, Text } from 'react-native';
import { IconButton } from 'react-native-paper';

import HomeScreen from '../screens/HomeScreen';
import PostScreen from '../screens/PostScreen';
import ProfileScreen from '../screens/ProfileScreen';
import PostDetailScreen from '../screens/PostDetailScreen';
import ChatScreen from '../screens/ChatScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import Logo from '../components/Logo';
import ConversationsScreen from '../screens/ConversationsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const MainStack = () => {
  const theme = useTheme();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerShadowVisible: false,
        headerTitleStyle: {
          fontWeight: '600',
        },
        headerTintColor: theme.colors.onSurface,
      }}
    >
      <Stack.Screen 
        name="MainTabs" 
        component={MainTabs} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="PostDetail" 
        component={PostDetailScreen}
        options={{ title: 'Détails de l\'annonce' }}
      />
      <Stack.Screen 
        name="Chat" 
        component={ChatScreen}
        options={{ title: 'Discussion' }}
      />
    </Stack.Navigator>
  );
};

const MainTabs = () => {
  const theme = useTheme();
  
  // Mock notification counts - à remplacer par des données réelles
  const unreadMessages = 3;
  const unreadNotifications = 2;

  const TabIcon = ({ name, size, color, badge }: { name: string; size: number; color: string; badge?: number }) => (
    <View style={styles.iconContainer}>
      <MaterialCommunityIcons name={name} size={size} color={color} />
      {badge ? (
        <View style={[styles.badge, { backgroundColor: theme.colors.error }]}>
          <Text style={styles.badgeText}>{badge > 99 ? '99+' : badge}</Text>
        </View>
      ) : null}
    </View>
  );
  
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 88 : 68,
          backgroundColor: theme.colors.surface,
          borderTopWidth: 0,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: -4,
          },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        tabBarItemStyle: {
          paddingVertical: Platform.OS === 'ios' ? 8 : 4,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        headerStyle: {
          backgroundColor: theme.colors.surface,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerTitle: () => <Logo />,
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="home" size={size} color={color} />
          )
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          title: 'Notifications',
          tabBarIcon: ({ color, size }) => (
            <TabIcon 
              name="bell" 
              size={size} 
              color={color}
              badge={unreadNotifications}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Post"
        component={PostScreen}
        options={{
          title: 'Publier',
          tabBarIcon: ({ color, size }) => (
            <View style={styles.publishButtonContainer}>
              <View style={styles.publishButtonBackground}>
                <MaterialCommunityIcons 
                  name="plus"
                  size={32}
                  color="#FFFFFF"
                  style={styles.publishIcon}
                />
              </View>
            </View>
          ),
          tabBarLabel: ({ color }) => null,
          tabBarIconStyle: {
            marginTop: Platform.OS === 'ios' ? -10 : -20,
          },
        }}
      />
      <Tab.Screen
        name="Messages"
        component={ConversationsScreen}
        options={{
          title: 'Messages',
          tabBarIcon: ({ color, size }) => (
            <TabIcon 
              name="message-text" 
              size={size} 
              color={color}
              badge={unreadMessages}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={({ navigation, route }) => ({
          title: 'Profil',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" color={color} size={size} />
          ),
          headerRight: () => (
            <IconButton
              icon="pencil"
              mode="contained"
              onPress={() => {
                if (route.params?.toggleEdit) {
                  route.params.toggleEdit();
                }
              }}
              style={{ marginRight: 8 }}
            />
          ),
        })}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  publishButtonContainer: {
    width: 60,
    height: 60,
    marginTop: -30,
  },
  publishButtonBackground: {
    backgroundColor: '#FF9800',
    width: '100%',
    height: '100%',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  publishIcon: {
    marginTop: Platform.OS === 'ios' ? 0 : -2,
  },
  iconContainer: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFF',
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '600',
    paddingHorizontal: 4,
  },
});

export default MainStack;
