import React from 'react';
import { Text, TextStyle } from 'react-native';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Timestamp } from 'firebase/firestore';
import { theme } from '../theme/theme';

interface TimeAgoProps {
  date: number | Date | Timestamp;
  style?: TextStyle;
}

const TimeAgo: React.FC<TimeAgoProps> = ({ date, style }) => {
  if (!date) return null;

  if (date instanceof Timestamp) {
    date = (date.seconds * 1000) + (date.nanoseconds / 1000000);
  }

  try {
    const dateObj = new Date(date);
    const timeAgo = formatDistanceToNow(dateObj, { addSuffix: true, locale: fr });
    return <Text style={[styles.timeAgoText, style]}>{' ' + timeAgo}</Text>;
  } catch (error) {
    console.error('Erreur lors du formatage de la date:', error);
    return null;
  }
};

const styles = {
  timeAgoText: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    lineHeight: 0,
    fontFamily: 'Poppins_400Regular',
  },
};

export default TimeAgo;
