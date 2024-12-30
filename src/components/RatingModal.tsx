import React, { useState } from 'react';
import { View, StyleSheet, Modal } from 'react-native';
import { Text, Button, TextInput, useTheme } from 'react-native-paper';
import { Rating } from 'react-native-ratings';
import { theme } from '../theme/theme';

interface RatingModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
  recipientName: string;
}

const RatingModal: React.FC<RatingModalProps> = ({
  visible,
  onClose,
  onSubmit,
  recipientName,
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const theme = useTheme();

  const handleSubmit = () => {
    if (rating === 0) return;
    onSubmit(rating, comment);
    setRating(0);
    setComment('');
  };

  return (
    <Modal
      visible={visible}
      onRequestClose={onClose}
      animationType="slide"
      transparent={true}
    >
      <View style={styles.centeredView}>
        <View style={[styles.modalView, { backgroundColor: theme.colors.surface }]}>
          <Text variant="titleLarge" style={styles.title}>
            Évaluer {recipientName}
          </Text>
          
          <Rating
            type="star"
            ratingCount={5}
            imageSize={40}
            showRating
            onFinishRating={setRating}
            style={styles.rating}
            ratingColor={theme.colors.primary}
            tintColor={theme.colors.surface}
          />
          
          <TextInput
            mode="outlined"
            label="Commentaire (optionnel)"
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={4}
            style={styles.input}
          />
          
          <View style={styles.buttonContainer}>
            <Button
              mode="outlined"
              onPress={onClose}
              style={styles.button}
            >
              Annuler
            </Button>
            <Button
              mode="contained"
              onPress={handleSubmit}
              style={styles.button}
              disabled={rating === 0}
            >
              Envoyer
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    margin: 20,
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
  },
  rating: {
    paddingVertical: 16,
  },
  input: {
    width: '100%',
    marginTop: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 24,
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
});

export default RatingModal;
