import React from 'react';
import { Text, TextStyle } from 'react-native';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface TimeAgoProps {
  date: number;
  style?: TextStyle;
}

const TimeAgo: React.FC<TimeAgoProps> = ({ date, style }) => {
  if (!date) return null;

  try {
    const dateObj = new Date(date); // Convertir le timestamp Unix en millisecondes
    const timeAgo = formatDistanceToNow(dateObj, { addSuffix: true, locale: fr });
    return <Text style={style}>{timeAgo}</Text>;
  } catch (error) {
    console.error('Erreur lors du formatage de la date:', error);
    return null;
  }
};

export default TimeAgo;
