import React, { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Platform, View, StyleSheet, Text } from 'react-native';

import HomeScreen from '../screens/HomeScreen';
import NewPostScreen from '../screens/newPostScreen';
import ProfileScreen from '../screens/ProfileScreen';
import PostDetailScreen from '../screens/PostDetailScreen';
import ChatScreen from '../screens/ChatScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import Logo from '../components/Logo';
import ConversationsScreen from '../screens/ConversationsScreen';
import BottomSheet from '../components/BottomSheet';

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
        options={{ 
          title: 'Détails de l\'annonce',
          headerShown: true,
          headerStyle: {
            backgroundColor: theme.colors.background,
          },
          headerShadowVisible: false,
          headerTitleStyle: {
            fontWeight: '600',
          },
          headerTintColor: theme.colors.onSurface,
        }}
      />
      <Stack.Screen 
        name="Chat" 
        component={ChatScreen}
        options={{ 
          title: 'Discussion',
          headerShown: true,
          headerStyle: {
            backgroundColor: theme.colors.background,
          },
          headerShadowVisible: false,
          headerTitleStyle: {
            fontWeight: '600',
          },
          headerTintColor: theme.colors.onSurface,
        }}
      />
    </Stack.Navigator>
  );
};

const MainTabs = () => {
  const theme = useTheme();
  const [isPostSheetVisible, setIsPostSheetVisible] = useState(false);
  
  // Debug logs
  console.log('MainTabs render - isPostSheetVisible:', isPostSheetVisible);

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
    <>
      <Tab.Navigator
        screenOptions={{
          tabBarStyle: {
            height: Platform.OS === 'ios' ? 88 : 68,
            backgroundColor: theme.colors.surface,
            borderTopWidth: 0,
            borderBottomWidth: 0,
            elevation: 0,
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 0,
            },
            shadowOpacity: 0,
            shadowRadius: 8,
          },
          tabBarItemStyle: {
            paddingVertical: Platform.OS === 'ios' ? 8 : 4,
          },
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
          headerStyle: {
            backgroundColor: theme.colors.background,
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 0,
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
          component={EmptyComponent}
          listeners={{
            tabPress: (e) => {
              // Prevent default navigation
              e.preventDefault();
              console.log('Tab Press - Before setIsPostSheetVisible');
              // Show bottom sheet
              setIsPostSheetVisible(true);
              console.log('Tab Press - After setIsPostSheetVisible');
            },
          }}
          options={{
            title: 'Publier',
            tabBarIcon: ({ color, size }) => (
              <View style={styles.publishButtonContainer}>
                <View style={[styles.publishButtonBackground, { backgroundColor: theme.colors.primary }]}>
                  <MaterialCommunityIcons 
                    name="plus"
                    size={24}
                    color="#FFFFFF"
                    style={styles.publishIcon}
                  />
                </View>
              </View>
            ),
            tabBarLabel: () => null,
          }}
        />
        <Tab.Screen
          name="Messages"
          component={ConversationsScreen}
          options={{
            title: 'Messages',
            tabBarIcon: ({ color, size }) => (
              <TabIcon 
                name="message" 
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
          options={{
            title: 'Profil',
            tabBarIcon: ({ color, size }) => (
              <TabIcon name="account" size={size} color={color} />
            ),
          }}
        />

      </Tab.Navigator>
      {/* Render BottomSheet outside of Tab.Navigator but inside the fragment */}
      <BottomSheet 
        visible={isPostSheetVisible} 
        onDismiss={() => {
          console.log('BottomSheet onDismiss called');
          setIsPostSheetVisible(false);
        }} 
      />
    </>
  );
};

// Composant vide pour le tab "Post"
const EmptyComponent = () => null;

const styles = StyleSheet.create({
  iconContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    right: -6,
    top: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  publishButtonContainer: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  publishButtonBackground: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  publishIcon: {
    marginLeft: 1,
    marginTop: 1,
  },
});

export default MainStack;
