import React, { useCallback } from 'react';
import { StyleSheet, Dimensions, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import NewPostScreen from '../screens/newPostScreen';

interface BottomSheetProps {
  visible: boolean;
  onDismiss: () => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MAX_TRANSLATE_Y = -SCREEN_HEIGHT * 0.90;
const DISMISS_THRESHOLD = -SCREEN_HEIGHT * 0.3;

const BottomSheet = ({ visible, onDismiss }: BottomSheetProps) => {
  const theme = useTheme();
  const translateY = useSharedValue(0);
  const context = useSharedValue({ y: 0 });

  const scrollTo = useCallback((destination: number) => {
    'worklet';
    translateY.value = withSpring(destination, { damping: 50 });
  }, []);

  const gesture = Gesture.Pan()
    .onStart(() => {
      context.value = { y: translateY.value };
    })
    .onUpdate((event) => {
      translateY.value = event.translationY + context.value.y;
      translateY.value = Math.max(translateY.value, MAX_TRANSLATE_Y);
    })
    .onEnd((event) => {
      if (translateY.value > DISMISS_THRESHOLD) {
        runOnJS(onDismiss)();
      } else {
        scrollTo(MAX_TRANSLATE_Y);
      }
    });

  const rBottomSheetStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  React.useEffect(() => {
    if (visible) {
      scrollTo(MAX_TRANSLATE_Y);
    } else {
      scrollTo(0);
    }
  }, [visible, scrollTo]);

  if (!visible) return null;

  return (
    <View style={styles.modalContainer}>
      <Animated.View style={[styles.backdrop]} />
      <GestureDetector gesture={gesture}>
        <Animated.View 
          style={[
            styles.contentContainer,
            { backgroundColor: theme.colors.background },
            rBottomSheetStyle,
          ]}
        >
          <View style={[styles.handle, { backgroundColor: theme.colors.onSurfaceVariant }]} />
          <NewPostScreen isBottomSheet onDismiss={onDismiss} />
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 100,
  },
  contentContainer: {
    height: SCREEN_HEIGHT,
    width: '100%',
    position: 'absolute',
    top: SCREEN_HEIGHT,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 8,
    zIndex: 101,
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
