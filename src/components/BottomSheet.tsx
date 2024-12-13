import React from 'react';
import { View, StyleSheet, Modal, Dimensions, Pressable } from 'react-native';
import { useTheme } from 'react-native-paper';
import NewPostScreen from '../screens/newPostScreen';
import { theme } from '../theme/theme';

interface BottomSheetProps {
  visible: boolean;
  onDismiss: () => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const BottomSheet = ({ visible, onDismiss }: BottomSheetProps) => {
  const theme = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onDismiss}
    >
      <View style={styles.modalContainer}>
        <Pressable style={styles.backdrop} onPress={onDismiss} />
        <View style={[styles.contentContainer, { backgroundColor: theme.colors.background }]}>
          <View style={[styles.handle, { backgroundColor: theme.colors.onSurfaceVariant }]} />
          <NewPostScreen isBottomSheet onDismiss={onDismiss} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: theme.colors.background,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  contentContainer: {
    height: SCREEN_HEIGHT * 0.90,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    marginBottom: 8,
  },
});

export default BottomSheet;
