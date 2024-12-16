import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { Provider as ReduxProvider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { 
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold
} from '@expo-google-fonts/poppins';
import { store } from './src/store/store';
import RootNavigator from './src/navigation/RootNavigator';
import { theme } from './src/theme/theme';
import { AuthProvider } from './src/contexts/AuthContext';
import { UserProvider } from './src/contexts/UserContext';
import { ChatProvider } from './src/contexts/ChatContext';
import { NotificationProvider } from './src/providers/NotificationProvider';

export default function App() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ReduxProvider store={store}>
        <PaperProvider theme={theme}>
          <AuthProvider>
            <UserProvider>
              <ChatProvider>
                <NotificationProvider>
                  <NavigationContainer>
                    <SafeAreaProvider>
                      <RootNavigator />
                    </SafeAreaProvider>
                  </NavigationContainer>
                </NotificationProvider>
              </ChatProvider>
            </UserProvider>
          </AuthProvider>
        </PaperProvider>
      </ReduxProvider>
    </GestureHandlerRootView>
  );
}
