import React, { useState } from 'react';
import {
  View,
  Modal,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { IconButton, useTheme } from 'react-native-paper';
import Animated, {
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import ImageViewer from 'react-native-image-zoom-viewer';
import { IImageInfo } from 'react-native-image-zoom-viewer/built/image-viewer.type';

interface ImageViewerModalProps {
  visible: boolean;
  images: string[];
  initialIndex?: number;
  onClose: () => void;
}

const ImageViewerModal: React.FC<ImageViewerModalProps> = ({
  visible,
  images,
  initialIndex = 0,
  onClose,
}) => {
  const theme = useTheme();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const imageUrls: IImageInfo[] = images.map(url => ({ url }));

  return (
    <Modal
      visible={visible}
      transparent={true}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        
        <Animated.View 
          entering={FadeIn} 
          exiting={FadeOut}
          style={styles.header}
        >
          <IconButton
            icon="close"
            iconColor={theme.colors.onSurface}
            size={24}
            onPress={onClose}
          />
          <View style={styles.counter}>
            <IconButton
              icon="image"
              iconColor={theme.colors.onSurface}
              size={20}
            />
            <Animated.Text style={[styles.counterText, { color: theme.colors.onSurface }]}>
              {currentIndex + 1} / {images.length}
            </Animated.Text>
          </View>
        </Animated.View>

        <ImageViewer
          imageUrls={imageUrls}
          index={initialIndex}
          onChange={index => setCurrentIndex(index)}
          renderIndicator={() => null}
          backgroundColor="transparent"
          enableSwipeDown
          onSwipeDown={onClose}
          useNativeDriver
          saveToLocalByLongPress={false}
          renderHeader={() => null}
          renderFooter={() => null}
          renderArrowLeft={() => (
            currentIndex > 0 ? (
              <TouchableOpacity style={styles.arrowButton}>
                <IconButton
                  icon="chevron-left"
                  iconColor={theme.colors.onSurface}
                  size={32}
                />
              </TouchableOpacity>
            ) : null
          )}
          renderArrowRight={() => (
            currentIndex < images.length - 1 ? (
              <TouchableOpacity style={styles.arrowButton}>
                <IconButton
                  icon="chevron-right"
                  iconColor={theme.colors.onSurface}
                  size={32}
                />
              </TouchableOpacity>
            ) : null
          )}
        />
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingTop: 60,
    zIndex: 1,
  },
  counter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginRight: 8,
  },
  counterText: {
    fontSize: 14,
    marginLeft: 4,
  },
  arrowButton: {
    width: 50,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ImageViewerModal;
