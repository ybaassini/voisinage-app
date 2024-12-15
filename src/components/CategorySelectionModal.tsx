import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Portal, Modal, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ServiceCategory, ServiceSubcategory } from '../constants/serviceCategories';
import CustomButton from './forms/CustomButton';

interface CategorySelectionModalProps {
  visible: boolean;
  onDismiss: () => void;
  selectedCategory: ServiceCategory | null;
  onCategorySelect: (category: ServiceCategory) => void;
  onSubcategorySelect: (subcategory: ServiceSubcategory) => void;
  categories: ServiceCategory[];
}

const CategorySelectionModal = ({
  visible,
  onDismiss,
  selectedCategory,
  onCategorySelect,
  onSubcategorySelect,
  categories,
}: CategorySelectionModalProps) => {
  const theme = useTheme();

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        style={styles.modalWrapper}
        contentContainerStyle={[
          styles.modalContainer,
          { backgroundColor: theme.colors.background }
        ]}
      >
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>
            {selectedCategory ? 'Choisir une sous-catégorie' : 'Choisir une catégorie'}
          </Text>
          {selectedCategory && (
            <CustomButton
              mode="text"
              onPress={() => onCategorySelect(null)}
              icon="arrow-left"
            >
              Retour
            </CustomButton>
          )}
        </View>

        <ScrollView style={styles.categoriesList}>
          {!selectedCategory ? (
            // Liste des catégories principales
            categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryItem,
                  { backgroundColor: theme.colors.surface }
                ]}
                onPress={() => onCategorySelect(category)}
              >
                <Icon name={category.icon} size={24} color={theme.colors.primary} />
                <View style={styles.categoryItemContent}>
                  <Text style={styles.categoryItemText}>{category.label}</Text>
                  {category.subcategories && (
                    <Text style={[styles.subcategoriesCount, { color: theme.colors.onSurfaceVariant }]}>
                      {category.subcategories.length} sous-catégories
                    </Text>
                  )}
                </View>
                <Icon name="chevron-right" size={24} color={theme.colors.onSurfaceVariant} />
              </TouchableOpacity>
            ))
          ) : (
            // Liste des sous-catégories
            selectedCategory.subcategories?.map((subcategory) => (
              <TouchableOpacity
                key={subcategory.id}
                style={[
                  styles.categoryItem,
                  { backgroundColor: theme.colors.surface }
                ]}
                onPress={() => onSubcategorySelect(subcategory)}
              >
                <Text style={styles.categoryItemText}>{subcategory.label}</Text>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
  modalContainer: {
    margin: 20,
    borderRadius: 16,
    padding: 16,
    maxHeight: '80%',
    elevation: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.58,
    shadowRadius: 16.00,
    zIndex: 9999,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  categoriesList: {
    flex: 1,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
  },
  categoryItemContent: {
    flex: 1,
    marginLeft: 12,
  },
  categoryItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
  subcategoriesCount: {
    fontSize: 14,
    marginTop: 2,
  },
});

export default CategorySelectionModal;
