import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';

interface TimeAgoProps {
  date: Date;
  style?: TextStyle;
}

const TimeAgo: React.FC<TimeAgoProps> = ({ date, style }) => {
  const getTimeAgo = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    let interval = Math.floor(seconds / 31536000); // années
    if (interval >= 1) {
      return interval === 1 ? 'il y a 1 an' : `il y a ${interval} ans`;
    }
    
    interval = Math.floor(seconds / 2592000); // mois
    if (interval >= 1) {
      return interval === 1 ? 'il y a 1 mois' : `il y a ${interval} mois`;
    }
    
    interval = Math.floor(seconds / 86400); // jours
    if (interval >= 1) {
      return interval === 1 ? 'il y a 1 jour' : `il y a ${interval} jours`;
    }
    
    interval = Math.floor(seconds / 3600); // heures
    if (interval >= 1) {
      return interval === 1 ? 'il y a 1 heure' : `il y a ${interval} heures`;
    }
    
    interval = Math.floor(seconds / 60); // minutes
    if (interval >= 1) {
      return interval === 1 ? 'il y a 1 minute' : `il y a ${interval} minutes`;
    }
    
    return seconds <= 10 ? 'à l\'instant' : `il y a ${Math.floor(seconds)} secondes`;
  };

  return (
    <Text style={[styles.text, style]}>
      {getTimeAgo(date)}
    </Text>
  );
};

const styles = StyleSheet.create({
  text: {
    fontSize: 12,
    color: '#666',
  },
});

export default TimeAgo;
