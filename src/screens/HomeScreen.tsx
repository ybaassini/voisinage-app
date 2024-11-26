import React, { useState } from 'react';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { Text, Card, Chip, useTheme, Searchbar, IconButton, Surface, Avatar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';

const HomeScreen = ({ navigation }: any) => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const categories = [
    { id: 'all', label: 'Tout', icon: 'view-grid' },
    { id: 'tools', label: 'Outils', icon: 'tools' },
    { id: 'services', label: 'Services', icon: 'account-wrench' },
    { id: 'sports', label: 'Sports', icon: 'basketball' },
    { id: 'education', label: 'Éducation', icon: 'school' },
  ];

  const mockAnnouncements = [
    {
      id: '1',
      title: 'Prêt de perceuse professionnelle',
      description: 'Perceuse Bosch Professional disponible pour prêt ce weekend. Idéale pour les travaux de rénovation.',
      category: 'Outils',
      user: 'Marie D.',
      avatar: 'MD',
      rating: 4.8,
      distance: '200m',
      image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c',
    },
    {
      id: '2',
      title: 'Cours de guitare personnalisés',
      description: 'Je propose des cours de guitare pour débutants. Apprentissage adapté à votre niveau et à vos objectifs.',
      category: 'Services',
      user: 'Pierre M.',
      avatar: 'PM',
      rating: 4.9,
      distance: '500m',
      image: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1',
    },
  ];

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simuler un chargement
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const renderItem = ({ item, index }: any) => (
    <Animated.View
      entering={FadeInDown.delay(index * 100).springify()}
      style={styles.cardContainer}
    >
      <Card style={[styles.card, { elevation: 1 }]}>
        {item.image && (
          <Card.Cover source={{ uri: item.image }} style={styles.cardImage} />
        )}
        <Card.Content style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Avatar.Text
              size={36}
              label={item.avatar}
              style={{ backgroundColor: theme.colors.primaryContainer }}
              color={theme.colors.primary}
            />
            <View style={styles.userInfo}>
              <Text variant="titleMedium" style={styles.userName}>{item.user}</Text>
              <View style={styles.ratingContainer}>
                <IconButton
                  icon="star"
                  size={16}
                  iconColor={theme.colors.primary}
                  style={styles.ratingIcon}
                />
                <Text variant="bodySmall">{item.rating}</Text>
                <Text variant="bodySmall" style={styles.distance}>• {item.distance}</Text>
              </View>
            </View>
          </View>

          <Text variant="titleLarge" style={styles.title}>{item.title}</Text>
          <Text variant="bodyMedium" style={styles.description}>{item.description}</Text>

          <View style={styles.cardFooter}>
            <Chip
              icon={categories.find(cat => cat.label === item.category)?.icon}
              style={[styles.categoryChip, { backgroundColor: theme.colors.primaryContainer }]}
              textStyle={{ color: theme.colors.primary }}
            >
              {item.category}
            </Chip>
            <IconButton
              icon="message-outline"
              size={20}
              onPress={() => {}}
              style={styles.messageButton}
            />
          </View>
        </Card.Content>
      </Card>
    </Animated.View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Surface style={styles.header} elevation={1}>
        <Searchbar
          placeholder="Rechercher..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          elevation={0}
          mode="bar"
        />
      </Surface>

      <View style={styles.categoriesContainer}>
        <FlatList
          horizontal
          data={categories}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
          renderItem={({ item }) => (
            <Chip
              icon={item.icon}
              selected={selectedCategory === item.id}
              onPress={() => setSelectedCategory(item.id === selectedCategory ? null : item.id)}
              style={[
                styles.categoryChip,
                {
                  backgroundColor: selectedCategory === item.id
                    ? theme.colors.primaryContainer
                    : theme.colors.surfaceVariant,
                }
              ]}
            >
              {item.label}
            </Chip>
          )}
        />
      </View>

      <FlatList
        data={mockAnnouncements}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
          />
        }
      />

      <IconButton
        icon="plus"
        mode="contained"
        size={24}
        onPress={() => navigation.navigate('Post')}
        style={[
          styles.fab,
          { backgroundColor: theme.colors.primary }
        ]}
        iconColor={theme.colors.surface}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchbar: {
    borderRadius: 12,
  },
  categoriesContainer: {
    marginVertical: 8,
  },
  categoriesList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    marginRight: 8,
    borderRadius: 20,
  },
  list: {
    padding: 16,
    paddingBottom: 80,
  },
  cardContainer: {
    marginBottom: 16,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardImage: {
    height: 200,
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    marginLeft: 8,
    flex: 1,
  },
  userName: {
    fontWeight: '500',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingIcon: {
    margin: 0,
    marginLeft: -8,
  },
  distance: {
    opacity: 0.6,
    marginLeft: 4,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    marginBottom: 16,
    opacity: 0.7,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  messageButton: {
    margin: 0,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    borderRadius: 16,
  },
});

export default HomeScreen;
