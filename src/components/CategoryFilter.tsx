import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Text, Surface, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../theme/theme';
import { SERVICE_CATEGORIES } from '../constants/serviceCategories';

export interface Category {
  id: string;
  label: string;
  icon: string;
}

// const categories: Category[] = [
//   { id: 'all', name: 'Toutes', icon: 'view-grid' },
//   { id: 'cleaning', name: 'Ménage', icon: 'broom' },
//   { id: 'plumbing', name: 'Plomberie', icon: 'water-pump' },
//   { id: 'repair', name: 'Bricolage', icon: 'tools' },
//   { id: 'gardening', name: 'Jardinage', icon: 'flower' },
//   { id: 'moving', name: 'Déménagement', icon: 'truck' },
//   { id: 'painting', name: 'Peinture', icon: 'format-paint' },
//   { id: 'electrical', name: 'Électricité', icon: 'lightning-bolt' },
//   { id: 'babysitting', name: 'Garde d\'enfants', icon: 'baby-face-outline' },
//   { id: 'petcare', name: 'Garde d\'animaux', icon: 'paw' },
//   { id: 'other', name: 'Autre', icon: 'dots-horizontal' },
// ];

interface CategoryFilterProps {
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  const theme = useTheme();

  const renderCategoryItem = (category: Category) => {
    const isSelected = selectedCategory === category.id;
    
    return (
      <TouchableOpacity
        key={category.id}
        onPress={() => onSelectCategory(category.id)}
        style={styles.categoryItemContainer}
      >
        <Surface
          style={[
            styles.categoryItem,
            {
              backgroundColor: isSelected ? theme.colors.secondary : theme.colors.surface,
            },
          ]}
          elevation={1}
        >
          <MaterialCommunityIcons
            name={category.icon as any}
            size={24}
            color={isSelected ? theme.colors.surface : theme.colors.secondary}
          />
        </Surface>
        <Text
          variant="labelSmall"
          style={[
            styles.categoryName,
            {
              color: isSelected ? theme.colors.secondary : theme.colors.surface,
              fontWeight: isSelected ? '600' : '400',
            },
          ]}
          numberOfLines={1}
        >
          {category.label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text variant="titleMedium" style={styles.title}>
        Filtrer par catégorie
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {renderCategoryItem({id: 'all', label: 'Toutes', icon: 'view-grid'})}
        {SERVICE_CATEGORIES.map(renderCategoryItem)}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  title: {
    marginBottom: 8,
    color: theme.colors.surface,
  },
  scrollContent: {
    gap: 16,
  },
  categoryItemContainer: {
    alignItems: 'center',
    gap: 4,
  },
  categoryItem: {
    width: 64,
    height: 64,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryName: {
    textAlign: 'center',
    maxWidth: 64,
  },
});

export default CategoryFilter;

