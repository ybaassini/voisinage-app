import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Avatar, Text, List, Button, Card, Title, Divider } from 'react-native-paper';

const ProfileScreen = () => {
  const mockUser = {
    name: 'Thomas Dubois',
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
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Avatar.Text
          size={80}
          label={mockUser.name.split(' ').map(n => n[0]).join('')}
        />
        <Text style={styles.name}>{mockUser.name}</Text>
        <Text style={styles.neighborhood}>{mockUser.neighborhood}</Text>
        <Text style={styles.joinDate}>{mockUser.joinDate}</Text>
        
        <View style={styles.ratingContainer}>
          <Text style={styles.rating}>★ {mockUser.rating}</Text>
          <Text style={styles.reviews}>({mockUser.reviews} avis)</Text>
        </View>
      </View>

      <Card style={styles.statsCard}>
        <Card.Content style={styles.statsContent}>
          <View style={styles.statItem}>
            <Title>12</Title>
            <Text>Annonces</Text>
          </View>
          <View style={styles.statItem}>
            <Title>8</Title>
            <Text>Services</Text>
          </View>
          <View style={styles.statItem}>
            <Title>15</Title>
            <Text>Échanges</Text>
          </View>
        </Card.Content>
      </Card>

      <View style={styles.section}>
        <Title style={styles.sectionTitle}>Mes annonces</Title>
        {mockAnnouncements.map(announcement => (
          <React.Fragment key={announcement.id}>
            <List.Item
              title={announcement.title}
              description={announcement.date}
              right={props => (
                <Text
                  {...props}
                  style={[
                    styles.status,
                    { color: announcement.status === 'active' ? '#4CAF50' : '#9E9E9E' },
                  ]}
                >
                  {announcement.status === 'active' ? 'Active' : 'Terminée'}
                </Text>
              )}
            />
            <Divider />
          </React.Fragment>
        ))}
      </View>

      <View style={styles.buttonContainer}>
        <Button
          mode="outlined"
          onPress={() => {}}
          style={styles.button}
          icon="cog"
        >
          Paramètres
        </Button>
        <Button
          mode="outlined"
          onPress={() => {}}
          style={styles.button}
          icon="help-circle"
        >
          Aide
        </Button>
        <Button
          mode="outlined"
          onPress={() => {}}
          style={[styles.button, styles.logoutButton]}
          icon="logout"
        >
          Déconnexion
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  neighborhood: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  joinDate: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  rating: {
    fontSize: 16,
    color: '#FFC107',
    fontWeight: 'bold',
  },
  reviews: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  statsCard: {
    margin: 16,
  },
  statsContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  status: {
    alignSelf: 'center',
  },
  buttonContainer: {
    padding: 16,
  },
  button: {
    marginVertical: 4,
  },
  logoutButton: {
    marginTop: 16,
    borderColor: '#FF5252',
  },
});

export default ProfileScreen;
