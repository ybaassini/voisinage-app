import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Text, Card, Title, Paragraph } from 'react-native-paper';

const HomeScreen = () => {
  const mockAnnouncements = [
    {
      id: '1',
      title: 'Prêt de perceuse',
      description: 'Perceuse disponible pour prêt ce weekend',
      category: 'Outils',
      user: 'Marie D.',
    },
    {
      id: '2',
      title: 'Cours de guitare',
      description: 'Je propose des cours de guitare pour débutants',
      category: 'Services',
      user: 'Pierre M.',
    },
  ];

  const renderItem = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <Title>{item.title}</Title>
        <Paragraph>{item.description}</Paragraph>
        <Text style={styles.category}>{item.category}</Text>
        <Text style={styles.user}>Proposé par {item.user}</Text>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={mockAnnouncements}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  list: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 4,
  },
  category: {
    color: '#666',
    marginTop: 8,
    fontSize: 12,
  },
  user: {
    color: '#2196F3',
    marginTop: 4,
    fontSize: 12,
  },
});

export default HomeScreen;
