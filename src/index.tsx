import React, { type FC, useEffect } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  interpolateColor,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

export type SwitchProps = {
  /**
   * Current state of the component
   */
  value: boolean;
  /**
   * Change of component state
   */
  onValueChange: (value: boolean) => void;
  /**
   * Inactive state of the component
   */
  disabled?: boolean;
  /**
   * Container color when component is active
   * @default 'darkblue'
   */
  activeColor?: string;
  /**
   * Container color when component is inactive
   * @default 'darkgray'
   */
  inactiveColor?: string;
  /**
   * Container color when component is active and disabled
   * @default 'blue'
   */
  disabledActiveColor?: string;
  /**
   * Container color when component is inactive and disabled
   * @default 'gray'
   */
  disabledInactiveColor?: string;
  /**
   * Should a swipe handler be end if your finger is outside the component
   * @default false
   */
  shouldCancelWhenOutside?: boolean;
  /**
   * Switch container style
   */
  containerStyle?: StyleProp<ViewStyle>;
  /**
   * Switch circle style
   */
  circleStyle?: StyleProp<ViewStyle>;
  /**
   * The width that the circle will be able to move
   * @default 'containerWidth - circleWidth - containerPaddingHorizontal * 2'
   */
  trackWidth?: number;
};
const Switch: FC<SwitchProps> = ({
  value,
  onValueChange,
  disabled,
  activeColor = 'darkblue',
  inactiveColor = 'darkgray',
  disabledActiveColor = 'blue',
  disabledInactiveColor = 'gray',
  shouldCancelWhenOutside = false,
  containerStyle,
  circleStyle,
}) => {
  const styles = StyleSheet.create({
    container: {
      width: 52,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      paddingHorizontal: 4,
    },
    circle: {
      width: 24,
      height: 24,
      backgroundColor: 'red',
      borderRadius: 12,
    },
  });
  const currentContainerStyle = StyleSheet.compose(
    styles.container,
    containerStyle
  );
  const currentCircleStyle = StyleSheet.compose(styles.circle, circleStyle);

  const containerWidth =
    (containerStyle as { width: number })?.width || styles.container.width;
  const circleWidth =
    (circleStyle as { width: number })?.width || styles.circle.width;
  const containerPaddingHorizontal =
    (containerStyle as { paddingHorizontal: number })?.paddingHorizontal ||
    styles.container.paddingHorizontal;

  const TRACK_CIRCLE_WIDTH =
    containerWidth - circleWidth - containerPaddingHorizontal * 2;

  const translateX = useSharedValue(value ? TRACK_CIRCLE_WIDTH : 0);
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });
  const animatedContainerStyle = useAnimatedStyle(() => {
    const colors = disabled
      ? [disabledInactiveColor, disabledActiveColor]
      : [inactiveColor, activeColor];
    return {
      backgroundColor: interpolateColor(
        translateX.value,
        [0, TRACK_CIRCLE_WIDTH],
        colors
      ),
    };
  });
  const tap = Gesture.Tap()
    .onEnd(() => {
      translateX.value = withTiming(value ? 0 : TRACK_CIRCLE_WIDTH);
      runOnJS(onValueChange)(!value);
    })
    .enabled(!disabled);
  const pan = Gesture.Pan()
    .onUpdate(({ translationX }) => {
      const translate = value
        ? TRACK_CIRCLE_WIDTH + translationX
        : translationX;
      const currentTranslate = () => {
        if (translate < 0) {
          return 0;
        }
        if (translate > TRACK_CIRCLE_WIDTH) {
          return TRACK_CIRCLE_WIDTH;
        }
        return translate;
      };
      translateX.value = currentTranslate();
    })
    .onEnd(({ translationX }) => {
      const translate = value
        ? TRACK_CIRCLE_WIDTH + translationX
        : translationX;
      const selectedSnapPoint =
        translate > TRACK_CIRCLE_WIDTH / 2 ? TRACK_CIRCLE_WIDTH : 0;
      translateX.value = withTiming(selectedSnapPoint, { duration: 100 });
      runOnJS(onValueChange)(!!selectedSnapPoint);
    })
    .enabled(!disabled)
    .shouldCancelWhenOutside(shouldCancelWhenOutside);

  useEffect(() => {
    const currentCircle = !value ? 0 : TRACK_CIRCLE_WIDTH;
    if (!!currentCircle !== !!translateX.value) {
      translateX.value = withTiming(currentCircle);
    }
  }, [TRACK_CIRCLE_WIDTH, translateX, value]);
  const gesture = Gesture.Race(tap, pan);
  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[animatedContainerStyle, currentContainerStyle]}>
        <Animated.View style={[animatedStyle, currentCircleStyle]} />
      </Animated.View>
    </GestureDetector>
  );
};

export default Switch;
