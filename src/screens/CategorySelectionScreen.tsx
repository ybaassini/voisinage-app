import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Text, useTheme, Surface } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ServiceCategory, ServiceSubcategory, SERVICE_CATEGORIES } from '../constants/serviceCategories';

interface CategorySelectionScreenProps {
  selectedCategory: ServiceCategory | null;
  onCategorySelect: (category: ServiceCategory | null) => void;
  onSubcategorySelect: (subcategory: ServiceSubcategory) => void;
  onClose: () => void;
}

const CategorySelectionScreen = ({
  selectedCategory,
  onCategorySelect,
  onSubcategorySelect,
  onClose,
}: CategorySelectionScreenProps) => {
  const theme = useTheme();

  const handleBack = () => {
    if (selectedCategory) {
      onCategorySelect(null);
    } else {
      onClose();
    }
  };

  const renderMainCategories = () => (
    <View style={styles.categoriesContainer}>
      <View style={styles.categoriesGrid}>
        {SERVICE_CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category.id}
            onPress={() => {
              if (category.subcategories && category.subcategories.length > 0) {
                onCategorySelect(category);
              }
            }}
            style={styles.categoryItem}
          >
            <Surface style={[
              styles.categoryCard,
              { backgroundColor: theme.colors.surface }
            ]}>
              <View style={[styles.iconWrapper, { backgroundColor: category.background }]}>
                <Icon 
                  name={category.icon} 
                  size={28} 
                  color={category.color}
                />
              </View>
              <View style={styles.categoryContent}>
                <Text style={[styles.categoryTitle, { color: theme.colors.onSurface }]} numberOfLines={2}>
                  {category.label}
                </Text>
                <Text style={[styles.categorySubtitle, { color: theme.colors.onSurfaceVariant }]}>
                  {category.subcategories?.length || 0} sous-catégories
                </Text>
              </View>
            </Surface>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderSubcategories = () => (
    <View style={styles.subcategoriesList}>
      {selectedCategory?.subcategories?.map((subcategory) => (
        <TouchableOpacity
          key={subcategory.id}
          onPress={() => onSubcategorySelect(subcategory)}
          style={styles.subcategoryItem}
        >
          <Surface style={[styles.subcategoryCard, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.subcategoryContent}>
              <Text style={[styles.subcategoryTitle, { color: theme.colors.onSurface }]}>
                {subcategory.label}
              </Text>
              <Icon
                name="chevron-right"
                size={24}
                color={theme.colors.onSurfaceVariant}
              />
            </View>
          </Surface>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Surface style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={handleBack}
            style={styles.backButton}
          >
            <Icon
              name={selectedCategory ? "arrow-left" : "close"}
              size={24}
              color={theme.colors.primary}
            />
          </TouchableOpacity>

          <View style={styles.titleContainer}>
            <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]}>
              {selectedCategory ? selectedCategory.label : 'Catégories'}
            </Text>
            {selectedCategory && (
              <Text style={[styles.headerSubtitle, { color: theme.colors.onSurfaceVariant }]}>
                Sélectionnez une sous-catégorie
              </Text>
            )}
          </View>
        </View>
      </Surface>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {selectedCategory ? renderSubcategories() : renderMainCategories()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
    borderRadius: 20,
  },
  titleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  categoriesContainer: {
    padding: 16,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryItem: {
    width: '48%',
    marginBottom: 16,
  },
  categoryCard: {
    borderRadius: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  iconWrapper: {
    width: '100%',
    aspectRatio: 1,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryContent: {
    padding: 12,
  },
  categoryTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  categorySubtitle: {
    fontSize: 13,
  },
  subcategoriesList: {
    padding: 16,
    gap: 8,
  },
  subcategoryItem: {
    width: '100%',
  },
  subcategoryCard: {
    borderRadius: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  subcategoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  subcategoryTitle: {
    fontSize: 16,
  },
});

export default CategorySelectionScreen;
