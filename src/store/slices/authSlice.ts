import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { authInstance, db } from '../../config/firebase';
import { userService } from '../../services/userService';
import { UserProfile } from '../../types/user';
import * as Location from 'expo-location';
import * as geofireCommon from 'geofire-common';

interface AuthState {
  user: FirebaseAuthTypes.User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  userProfile: null,
  loading: false,
  error: null,
};

export const registerUser = createAsyncThunk(
  'auth/register',
  async ({ email, password }: { email: string; password: string; firstName: string; lastName: string, address: string }, { rejectWithValue }) => {
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email, password)
      return userCredential.user;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      console.log('Tentative de connexion avec:', email);
      const credential = auth.EmailAuthProvider.credential(email, password);
      const userCredential = await authInstance.signInWithCredential(credential);
      console.log('Connexion réussie:', userCredential.user);

      // Récupérer le profil utilisateur
      const userProfile = await userService.getUserProfile(userCredential.user.uid);
      if (!userProfile) {
        throw new Error('Profil utilisateur non trouvé');
      }

      return {
        user: userCredential.user,
        userProfile
      };
    } catch (error: any) {
      console.error('Erreur de connexion:', error);
      console.error('Code d\'erreur:', error.code);
      console.error('Message d\'erreur:', error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await auth().signOut();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.userProfile = action.payload.userProfile;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Logout
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.userProfile = null;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setUser, clearError } = authSlice.actions;
export default authSlice.reducer;
