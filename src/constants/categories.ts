export const CATEGORIES = [
  { id: 'all', label: 'Tout', icon: 'view-grid' },
  { id: 'tools', label: 'Outils & Bricolage', icon: 'tools' },
  { id: 'services', label: 'Services', icon: 'account-wrench' },
  { id: 'sports', label: 'Sports & Loisirs', icon: 'basketball' },
  { id: 'education', label: 'Éducation & Formation', icon: 'school' },
  { id: 'gardening', label: 'Jardinage', icon: 'flower' },
  { id: 'cooking', label: 'Cuisine', icon: 'food' },
  { id: 'transport', label: 'Transport', icon: 'car' },
  { id: 'events', label: 'Événements', icon: 'calendar' },
  { id: 'childcare', label: 'Garde d\'enfants', icon: 'baby-face' },
  { id: 'pets', label: 'Animaux', icon: 'paw' },
  { id: 'tech', label: 'Informatique', icon: 'laptop' },
  { id: 'music', label: 'Musique', icon: 'music' },
  { id: 'art', label: 'Art & Création', icon: 'palette' },
  { id: 'health', label: 'Santé & Bien-être', icon: 'heart' },
  { id: 'language', label: 'Langues', icon: 'translate' },
  { id: 'housework', label: 'Tâches ménagères', icon: 'home' },
  { id: 'shopping', label: 'Courses', icon: 'cart' },
  { id: 'other', label: 'Autre', icon: 'dots-horizontal' },
] as const;

export type Category = typeof CATEGORIES[number]['id'];

export interface CategoryItem {
  id: Category;
  label: string;
  icon: string;
}

// Groupes de catégories pour une meilleure organisation
export const CATEGORY_GROUPS = {
  DAILY_LIFE: ['tools', 'housework', 'shopping', 'transport', 'gardening', 'cooking'],
  SERVICES: ['services', 'childcare', 'pets', 'tech'],
  LEISURE: ['sports', 'events', 'music', 'art'],
  LEARNING: ['education', 'language'],
  OTHER: ['other'],
} as const;
