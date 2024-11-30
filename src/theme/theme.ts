import { MD3LightTheme, configureFonts } from 'react-native-paper';

const fontConfig = {
  displayLarge: {
    fontFamily: 'System',
    fontSize: 57,
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: 64,
  },
  displayMedium: {
    fontFamily: 'System',
    fontSize: 45,
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: 52,
  },
  displaySmall: {
    fontFamily: 'System',
    fontSize: 36,
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: 44,
  },
  headlineLarge: {
    fontFamily: 'System',
    fontSize: 32,
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: 40,
  },
  headlineMedium: {
    fontFamily: 'System',
    fontSize: 28,
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: 36,
  },
  headlineSmall: {
    fontFamily: 'System',
    fontSize: 24,
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: 32,
  },
  titleLarge: {
    fontFamily: 'System',
    fontSize: 22,
    fontWeight: '500',
    letterSpacing: 0,
    lineHeight: 28,
  },
  titleMedium: {
    fontFamily: 'System',
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.15,
    lineHeight: 24,
  },
  titleSmall: {
    fontFamily: 'System',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.1,
    lineHeight: 20,
  },
  labelLarge: {
    fontFamily: 'System',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.1,
    lineHeight: 20,
  },
  labelMedium: {
    fontFamily: 'System',
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.5,
    lineHeight: 16,
  },
  labelSmall: {
    fontFamily: 'System',
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.5,
    lineHeight: 16,
  },
  bodyLarge: {
    fontFamily: 'System',
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: 0.15,
    lineHeight: 24,
  },
  bodyMedium: {
    fontFamily: 'System',
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: 0.25,
    lineHeight: 20,
  },
  bodySmall: {
    fontFamily: 'System',
    fontSize: 12,
    fontWeight: '400',
    letterSpacing: 0.4,
    lineHeight: 16,
  },
};

export const theme = {
  ...MD3LightTheme,
  fonts: configureFonts({ config: fontConfig }),
  colors: {
    ...MD3LightTheme.colors,
    // Couleurs principales
    primary: '#352879',
    primaryContainer: '#605596',
    onPrimary: '#FFFFFF',
    onPrimaryContainer: '#F57C00',
    
    // Couleurs secondaires
    secondary: '#F2711C',
    secondaryContainer: '#FFE0B2',
    onSecondary: '#FFFFFF',
    onSecondaryContainer: '#2E7D32',
    
    // Couleurs d'accentuation
    tertiary: '#7FC1DC',
    tertiaryContainer: '#BBDEFB',
    onTertiary: '#FFFFFF',
    onTertiaryContainer: '#1976D2',
    
    // Couleurs de surface et de fond
    background: '#F2F2F2', // Fond gris clair
    onBackground: '#212121',
    surface: '#FFFFFF', // Surface blanche pour les cartes et éléments
    surfaceVariant: '#FFFFFF', // Surface alternative aussi en blanc
    onSurface: '#212121',
    onSurfaceVariant: '#757575',
    surfaceDisabled: '#F5F5F5',
    
    // Couleurs d'erreur
    error: '#F44336',
    errorContainer: '#FFCDD2',
    onError: '#FFFFFF',
    onErrorContainer: '#D32F2F',
    
    // Couleurs pour les cartes et éléments d'interface
    cardBackground: '#FFFFFF', // Cartes en blanc pour contraster avec le fond
    divider: '#E0E0E0', // Séparateurs légèrement plus visibles
    border: '#E0E0E0',
    placeholder: '#9E9E9E',
    
    // Couleurs pour le texte
    textPrimary: '#212121',
    textSecondary: '#757575',
    textDisabled: '#9E9E9E',
    
    // Couleurs pour les boutons
    buttonPrimary: '#FF9800',
    buttonSecondary: '#FFFFFF', // Boutons secondaires en blanc
    buttonDisabled: '#BDBDBD',
    
    // Couleurs pour les états
    active: '#FF9800',
    inactive: '#9E9E9E',
    hover: '#FFF3E0',
    pressed: '#F57C00',
    focus: '#FFE0B2',
    
    // Couleurs pour les badges et étiquettes
    badge: '#F44336',
    tag: '#FFFFFF', // Tags en blanc
    
    // Couleurs pour les évaluations
    rating: '#FFC107',
    ratingInactive: '#E0E0E0',
  },
  // Ajout de styles pour les élévations
  elevation: {
    level0: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      
      elevation: 0,
    },
    level1: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.15,
      shadowRadius: 2.0,
      elevation: 2,
    },
    level2: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.18,
      shadowRadius: 3.0,
      elevation: 3,
    },
    level3: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.20,
      shadowRadius: 4.0,
      elevation: 4,
    },
    level4: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.22,
      shadowRadius: 5.0,
      elevation: 5,
    },
    level5: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.25,
      shadowRadius: 6.0,
      elevation: 6,
    },
  },
  // Ajustement de l'arrondi pour plus de modernité
  roundness: 12,
};

export type AppTheme = typeof theme;
