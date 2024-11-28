import { useNavigation } from '@react-navigation/native';
import { useAuthContext } from '../contexts/AuthContext';

export const useRequireAuth = () => {
  const { user } = useAuthContext();
  const navigation = useNavigation();

  const requireAuth = (action: () => void) => {
    if (!user) {
      navigation.navigate('Login' as never);
      return false;
    }
    action();
    return true;
  };

  return requireAuth;
};
