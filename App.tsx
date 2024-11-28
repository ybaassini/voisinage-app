import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { Provider as ReduxProvider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { store } from './src/store/store';
import RootNavigator from './src/navigation/RootNavigator';
import { theme } from './src/theme/theme';
import { AuthProvider } from './src/contexts/AuthContext';
import { UserProvider } from './src/contexts/UserContext';
import { ChatProvider } from './src/contexts/ChatContext';
import { NotificationProvider } from './src/contexts/NotificationContext';

export default function App() {
  return (
    <ReduxProvider store={store}>
      <NavigationContainer>
        <PaperProvider theme={theme}>
          <AuthProvider>
            <UserProvider>
              <NotificationProvider>
                <ChatProvider>
                  <SafeAreaProvider>
                    <RootNavigator />
                  </SafeAreaProvider>
                </ChatProvider>
              </NotificationProvider>
            </UserProvider>
          </AuthProvider>
        </PaperProvider>
      </NavigationContainer>
    </ReduxProvider>
  );
}
