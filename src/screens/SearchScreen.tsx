import React, { useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Searchbar, Chip, Card, Title, Paragraph, Text } from 'react-native-paper';
import MapView, { Marker } from 'react-native-maps';

const SearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [viewMode, setViewMode] = useState('list'); // 'list' ou 'map'

  const categories = [
    'Services',
    'Outils',
    'Électronique',
    'Jardinage',
    'Sport',
    'Cuisine',
  ];

  const mockResults = [
    {
      id: '1',
      title: 'Tondeuse à gazon',
      description: 'Disponible pour prêt',
      category: 'Jardinage',
      distance: '500m',
      coordinates: {
        latitude: 48.8566,
        longitude: 2.3522,
      },
    },
    {
      id: '2',
      title: 'Cours de pâtisserie',
      description: 'Je propose des cours de pâtisserie',
      category: 'Cuisine',
      distance: '1km',
      coordinates: {
        latitude: 48.8566,
        longitude: 2.3522,
      },
    },
  ];

  const toggleCategory = (category) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const renderItem = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <Title>{item.title}</Title>
        <Paragraph>{item.description}</Paragraph>
        <View style={styles.cardFooter}>
          <Text style={styles.category}>{item.category}</Text>
          <Text style={styles.distance}>{item.distance}</Text>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Rechercher..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />

      <View style={styles.categoriesContainer}>
        <FlatList
          horizontal
          data={categories}
          renderItem={({ item }) => (
            <Chip
              style={styles.chip}
              selected={selectedCategories.includes(item)}
              onPress={() => toggleCategory(item)}
            >
              {item}
            </Chip>
          )}
          keyExtractor={item => item}
          showsHorizontalScrollIndicator={false}
        />
      </View>

      <View style={styles.toggleContainer}>
        <Chip
          selected={viewMode === 'list'}
          onPress={() => setViewMode('list')}
          style={styles.toggleChip}
        >
          Liste
        </Chip>
        <Chip
          selected={viewMode === 'map'}
          onPress={() => setViewMode('map')}
          style={styles.toggleChip}
        >
          Carte
        </Chip>
      </View>

      {viewMode === 'list' ? (
        <FlatList
          data={mockResults}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
        />
      ) : (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: 48.8566,
            longitude: 2.3522,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          {mockResults.map(item => (
            <Marker
              key={item.id}
              coordinate={item.coordinates}
              title={item.title}
              description={item.description}
            />
          ))}
        </MapView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchbar: {
    margin: 16,
    elevation: 4,
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  chip: {
    marginHorizontal: 4,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  toggleChip: {
    marginHorizontal: 8,
  },
  list: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  category: {
    color: '#666',
    fontSize: 12,
  },
  distance: {
    color: '#2196F3',
    fontSize: 12,
  },
  map: {
    flex: 1,
  },
});

export default SearchScreen;
