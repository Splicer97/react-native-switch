import React, { type FC, useEffect } from 'react';
import { StyleSheet } from 'react-native';
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
};
const Switch: FC<SwitchProps> = ({ value, onValueChange, disabled }) => {
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
  const TRACK_CIRCLE_WIDTH =
    styles.container.width -
    styles.circle.width -
    styles.container.paddingHorizontal * 2;

  const translateX = useSharedValue(value ? TRACK_CIRCLE_WIDTH : 0);
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });
  const animatedContainerStyle = useAnimatedStyle(() => {
    const colors = disabled ? ['gray', 'blue'] : ['darkgray', 'darkblue'];
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
      //если значение value false, то компонент circle первоначально находится на нуле в крайнем левом положении, если true то circle находится в крайнем правом положении и отчет нужно вести от него
      const translate = value
        ? TRACK_CIRCLE_WIDTH + translationX
        : translationX;
      //чтобы круг не уходил за границы трека, необходимо задать ему ограничение на перемещения
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
      //проверяем, в каком положении остановился компонент circle и задаем ему одно из конечных положений
      const selectedSnapPoint =
        translate > TRACK_CIRCLE_WIDTH / 2 ? TRACK_CIRCLE_WIDTH : 0;
      translateX.value = withTiming(selectedSnapPoint, { duration: 100 });
      runOnJS(onValueChange)(!!selectedSnapPoint);
    })
    .enabled(!disabled)
    .shouldCancelWhenOutside(true);

  useEffect(() => {
    const currentCircle = !value ? 0 : TRACK_CIRCLE_WIDTH;
    if (!!currentCircle !== !!translateX.value) {
      translateX.value = withTiming(currentCircle);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  const gesture = Gesture.Race(tap, pan);
  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[animatedContainerStyle, styles.container]}>
        <Animated.View style={[animatedStyle, styles.circle]} />
      </Animated.View>
    </GestureDetector>
  );
};

export default Switch;
