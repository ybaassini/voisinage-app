export interface PostFormData {
  title: string;
  category: string;
  description: string;
  price?: string;
  images: any[];
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
}

export interface ProfileFormData {
  displayName: string;
  bio?: string;
  phone?: string;
  avatar?: any;
  address?: string;
}

export interface ResponseFormData {
  message: string;
  images?: any[];
}

export interface CategoryOption {
  label: string;
  value: string;
  icon?: string;
}
