export interface ServiceCategory {
  id: string;
  label: string;
  icon: string;
  background: string;
  color: string;
  subcategories?: ServiceSubcategory[];
}

export interface ServiceSubcategory {
  id: string;
  label: string;
}

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: 'bricolage',
    label: 'Bricolage',
    icon: 'hammer-screwdriver',
    background: '#FFE0B2',
    color: '#F57C00',
    subcategories: [
      { id: 'plomberie', label: 'Plomberie' },
      { id: 'electricite', label: 'Électricité' },
      { id: 'menuiserie', label: 'Menuiserie' },
      { id: 'peinture', label: 'Peinture et décoration' },
      { id: 'renovation', label: 'Rénovation' },
      { id: 'montage_meubles', label: 'Montage de meubles' },
    ]
  },
  {
    id: 'jardinage',
    label: 'Jardinage',
    icon: 'flower',
    background: '#C8E6C9',
    color: '#43A047',
    subcategories: [
      { id: 'tonte', label: 'Tonte de pelouse' },
      { id: 'taille', label: 'Taille de haies' },
      { id: 'plantation', label: 'Plantation' },
      { id: 'potager', label: 'Potager' },
      { id: 'arrosage', label: 'Arrosage' },
    ]
  },
  {
    id: 'menage',
    label: 'Ménage',
    icon: 'broom',
    background: '#B3E5FC',
    color: '#039BE5',
    subcategories: [
      { id: 'menage_regulier', label: 'Ménage régulier' },
      { id: 'repassage', label: 'Repassage' },
      { id: 'vitres', label: 'Nettoyage vitres' },
      { id: 'grand_menage', label: 'Grand ménage' },
    ]
  },
  {
    id: 'demenagement',
    label: 'Déménagement',
    icon: 'truck',
    background: '#f4d9f9',
    color: '#4c4d96',
    subcategories: [
      { id: 'demenagement_complet', label: 'Déménagement complet' },
      { id: 'transport_meubles', label: 'Transport de meubles' },
      { id: 'emballage', label: 'Emballage' },
      { id: 'montage_meubles', label: 'Montage/démontage meubles' },
    ]
  },
  {
    id: 'garde_enfants',
    label: 'Garde d\'enfants',
    icon: 'baby-face-outline',
    background: '#FFCDD2',
    color: '#E53935',
    subcategories: [
      { id: 'garde_reguliere', label: 'Garde régulière' },
      { id: 'garde_ponctuelle', label: 'Garde ponctuelle' },
      { id: 'sortie_ecole', label: 'Sortie d\'école' },
      { id: 'aide_devoirs', label: 'Aide aux devoirs' },
    ]
  },
  {
    id: 'cours',
    label: 'Cours',
    icon: 'school',
    background: '#F0F4C3',
    color: '#C0CA33',
    subcategories: [
      { id: 'langues', label: 'Langues' },
      { id: 'musique', label: 'Musique' },
      { id: 'informatique', label: 'Informatique' },
      { id: 'soutien_scolaire', label: 'Soutien scolaire' },
    ]
  },
  {
    id: 'informatique',
    label: 'Informatique',
    icon: 'laptop',
    background: '#B2EBF2',
    color: '#00ACC1',
    subcategories: [
      { id: 'depannage', label: 'Dépannage' },
      { id: 'installation', label: 'Installation' },
      { id: 'formation', label: 'Formation' },
      { id: 'creation_site', label: 'Création de site web' },
    ]
  },
  {
    id: 'animaux',
    label: 'Animaux',
    icon: 'paw',
    background: '#FFF9C4',
    color: '#FBC02D',
    subcategories: [
      { id: 'promenade', label: 'Promenade' },
      { id: 'garde', label: 'Garde à domicile' },
      { id: 'toilettage', label: 'Toilettage' },
      { id: 'visite', label: 'Visite' },
    ]
  },
  {
    id: 'bien_etre',
    label: 'Bien-être',
    icon: 'spa',
    background: '#F8BBD0',
    color: '#E91E63',
    subcategories: [
      { id: 'massage', label: 'Massage' },
      { id: 'coiffure', label: 'Coiffure' },
      { id: 'manucure', label: 'Manucure' },
      { id: 'soins', label: 'Soins esthétiques' },
    ]
  },
  {
    id: 'transports',
    label: 'Transports',
    icon: 'car',
    background: '#B3E5FC',
    color: '#039BE5',
    subcategories: [
      { id: 'courses', label: 'Courses' },
      { id: 'accompagnement', label: 'Accompagnement' },
      { id: 'aeroport', label: 'Aéroport' },
    ]
  },
  {
    id: 'loisirs',
    label: 'Loisirs',
    icon: 'gamepad-variant',
    background: '#E1BEE7',
    color: '#8E24AA',
    subcategories: [
      { id: 'sport', label: 'Sport' },
      { id: 'musique', label: 'Musique' },
      { id: 'art', label: 'Art' },
      { id: 'jeux', label: 'Jeux' },
    ]
  },
  {
    id: 'artisanat',
    label: 'Artisanat',
    icon: 'palette',
    // marron moderne
    background: '#FDD9A2',
    color: '#AC370D',
    subcategories: [
      { id: 'couture', label: 'Couture' },
      { id: 'bijoux', label: 'Bijoux' },
      { id: 'poterie', label: 'Poterie' },
      { id: 'restauration', label: 'Restauration d\'objets' },
    ]
  },
  {
    id: 'courses',
    label: 'Courses',
    icon: 'cart',
    background: '#F0F4C3',
    color: '#C0CA33',
    subcategories: [
      { id: 'courses_alimentaires', label: 'Courses alimentaires' },
      { id: 'courses_diverses', label: 'Courses diverses' },
      { id: 'livraison', label: 'Livraison' },
    ]
  },
  {
    id: 'evenements',
    label: 'Événements',
    icon: 'party-popper',
    background: '#F6F6F6',
    color: '#FFD700',
    subcategories: [
      { id: 'animation', label: 'Animation' },
      { id: 'decoration', label: 'Décoration' },
      { id: 'photo_video', label: 'Photo/Vidéo' },
      { id: 'traiteur', label: 'Traiteur' },
    ]
  }
];
