import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Timestamp } from 'firebase/firestore';

export const formatDate = (date: Date | Timestamp | number | null | undefined, formatString: string = 'PPp'): string => {
  if (!date) return '';
  
  try {
    let dateObject: Date;
    
    if (date instanceof Timestamp) {
      dateObject = date.toDate();
    } else if (date instanceof Date) {
      dateObject = date;
    } else if (typeof date === 'number') {
      dateObject = new Date(date * 1000); // Convert seconds to milliseconds
    } else {
      return '';
    }

    // Validate the date
    if (isNaN(dateObject.getTime())) {
      return '';
    }

    return format(dateObject, formatString, { locale: fr });
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

export const formatRelativeTime = (date: Date | Timestamp | number | null | undefined, addSuffix: boolean = true): string => {
  if (!date) return '';
  
  try {
    let dateObject: Date;
    
    if (date instanceof Timestamp) {
      dateObject = date.toDate();
    } else if (date instanceof Date) {
      dateObject = date;
    } else if (typeof date === 'number') {
      dateObject = new Date(date * 1000);
    } else {
      return '';
    }

    // Validate the date
    if (isNaN(dateObject.getTime())) {
      return '';
    }

    return formatDistanceToNow(dateObject, { addSuffix, locale: fr });
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return '';
  }
};

export const convertToDate = (timestamp: any): Date => {
  try {
    if (timestamp instanceof Date) {
      return timestamp;
    }
    
    if (timestamp && 'toDate' in timestamp && typeof timestamp.toDate === 'function') {
      return timestamp.toDate();
    }
    
    if (timestamp && typeof timestamp === 'object' && 'seconds' in timestamp) {
      return new Date(timestamp.seconds * 1000);
    }
    
    console.warn('Format de date invalide, utilisation de la date actuelle');
    return new Date();
  } catch (error) {
    console.error('Erreur lors de la conversion de la date:', error);
    return new Date();
  }
};
