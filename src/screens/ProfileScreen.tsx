import React from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Avatar, Text, List, Button, Card, Title, Divider, useTheme, Surface } from 'react-native-paper';
import { useAppDispatch, useAppSelector } from '../store/store';
import { logoutUser } from '../store/slices/authSlice';
import Animated, { FadeInDown } from 'react-native-reanimated';

const ProfileScreen = ({ navigation }: any) => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const user = useAppSelector((state) => state.auth.user);

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: () => {
            dispatch(logoutUser());
          },
        },
      ],
      { cancelable: true }
    );
  };

  const mockUser = {
    name: user?.displayName || 'Utilisateur',
    neighborhood: 'Quartier Saint-Michel',
    joinDate: 'Membre depuis janvier 2024',
    rating: '4.8',
    reviews: 12,
  };

  const mockAnnouncements = [
    {
      id: '1',
      title: 'Prêt de vélo',
      status: 'active',
      date: '15 jan. 2024',
    },
    {
      id: '2',
      title: 'Cours d\'anglais',
      status: 'completed',
      date: '10 jan. 2024',
    },
  ];

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View 
        entering={FadeInDown.duration(1000).springify()}
        style={[styles.header, { backgroundColor: theme.colors.primary }]}
      >
        <Avatar.Text
          size={80}
          label={mockUser.name.split(' ').map(n => n[0]).join('')}
          style={styles.avatar}
          color={theme.colors.primary}
          backgroundColor={theme.colors.primaryContainer}
        />
        <Text style={[styles.name, { color: theme.colors.surface }]}>{mockUser.name}</Text>
        <Text style={[styles.neighborhood, { color: theme.colors.surfaceVariant }]}>
          {mockUser.neighborhood}
        </Text>
        <Text style={[styles.joinDate, { color: theme.colors.surfaceVariant }]}>
          {mockUser.joinDate}
        </Text>
        
        <View style={styles.ratingContainer}>
          <Text style={[styles.rating, { color: theme.colors.primaryContainer }]}>
            ★ {mockUser.rating}
          </Text>
          <Text style={[styles.reviews, { color: theme.colors.surfaceVariant }]}>
            ({mockUser.reviews} avis)
          </Text>
        </View>
      </Animated.View>

      <View style={styles.content}>
        <Surface style={[styles.statsCard, { elevation: 1 }]}>
          <View style={styles.statsContent}>
            <View style={styles.statItem}>
              <Text variant="headlineMedium" style={{ color: theme.colors.primary }}>12</Text>
              <Text variant="labelMedium">Annonces</Text>
            </View>
            <Divider style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text variant="headlineMedium" style={{ color: theme.colors.primary }}>8</Text>
              <Text variant="labelMedium">Services</Text>
            </View>
            <Divider style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text variant="headlineMedium" style={{ color: theme.colors.primary }}>15</Text>
              <Text variant="labelMedium">Échanges</Text>
            </View>
          </View>
        </Surface>

        <Surface style={[styles.section, { elevation: 1 }]}>
          <Text variant="titleLarge" style={styles.sectionTitle}>Mes annonces</Text>
          {mockAnnouncements.map((announcement, index) => (
            <React.Fragment key={announcement.id}>
              <List.Item
                title={announcement.title}
                description={announcement.date}
                left={props => (
                  <List.Icon
                    {...props}
                    icon={announcement.status === 'active' ? 'checkbox-marked-circle' : 'check-circle'}
                    color={announcement.status === 'active' ? theme.colors.primary : theme.colors.outline}
                  />
                )}
                right={props => (
                  <Text
                    {...props}
                    style={[
                      styles.status,
                      {
                        color: announcement.status === 'active' 
                          ? theme.colors.primary 
                          : theme.colors.outline
                      },
                    ]}
                  >
                    {announcement.status === 'active' ? 'Active' : 'Terminée'}
                  </Text>
                )}
              />
              {index < mockAnnouncements.length - 1 && (
                <Divider style={{ marginHorizontal: 16 }} />
              )}
            </React.Fragment>
          ))}
        </Surface>

        <Surface style={[styles.buttonContainer, { elevation: 1 }]}>
          <Button
            mode="outlined"
            onPress={() => {}}
            icon="cog"
            style={styles.button}
            labelStyle={{ color: theme.colors.primary }}
          >
            Paramètres
          </Button>
          <Button
            mode="outlined"
            onPress={() => {}}
            icon="help-circle"
            style={styles.button}
            labelStyle={{ color: theme.colors.primary }}
          >
            Aide
          </Button>
          <Button
            mode="contained"
            onPress={handleLogout}
            icon="logout"
            style={[styles.button, styles.logoutButton]}
            buttonColor={theme.colors.error}
          >
            Déconnexion
          </Button>
        </Surface>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: 32,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  avatar: {
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  neighborhood: {
    fontSize: 16,
    marginBottom: 4,
  },
  joinDate: {
    fontSize: 14,
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  rating: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 4,
  },
  reviews: {
    fontSize: 14,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  statsCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  statsContent: {
    flexDirection: 'row',
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    height: '100%',
    marginHorizontal: 8,
  },
  section: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  sectionTitle: {
    padding: 16,
    paddingBottom: 8,
  },
  status: {
    fontSize: 12,
    fontWeight: '500',
  },
  buttonContainer: {
    padding: 16,
    borderRadius: 16,
    gap: 8,
  },
  button: {
    borderRadius: 8,
  },
  logoutButton: {
    marginTop: 8,
  },
});

export default ProfileScreen;
