import React from "react";
import { View, PanResponder, Animated } from "react-native";
import { useImageMovement } from "./useImageMovement";

const WIDTH = 800;

const getValue = (value: Animated.Value): number => {
  // @ts-expect-error
  return value._value;
};

const ImageViewer = () => {
  const {
    pan,
    scale,
    rotation,
    initialPanPosition,
    previousAFinger,
    previousBFinger,
    onTwoFingersStart,
    onTwoFingersStop,
    onTwoFingersContinue
  } = useImageMovement({
    imageWidth: 800,
    imageHeight: 800
  });

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,

      onPanResponderMove: (evt, gestureState) => {
        const userHasOneFinger = evt.nativeEvent.touches.length === 1;
        const userHasTwoFingers = evt.nativeEvent.touches.length === 2;

        const didUserHaveTwoFingers = getValue(previousAFinger.x) !== -1;
        const isUserPanning = !didUserHaveTwoFingers && userHasOneFinger;

        const userStartsTwoFingers =
          !didUserHaveTwoFingers && userHasTwoFingers;
        const userStopsTwoFingers = didUserHaveTwoFingers && userHasOneFinger;
        const userContinuesTwoFingers =
          didUserHaveTwoFingers && userHasTwoFingers;

        if (userStartsTwoFingers) {
          onTwoFingersStart(evt);
        }

        if (userStopsTwoFingers) {
          onTwoFingersStop(gestureState);
        }

        if (userContinuesTwoFingers) {
          onTwoFingersContinue(evt);
        }

        if (isUserPanning) {
          pan.setValue({
            x: getValue(initialPanPosition.x) + gestureState.dx,
            y: getValue(initialPanPosition.y) + gestureState.dy
          });
        }
      },
      onPanResponderTerminationRequest: () => true,
      onPanResponderRelease: () => {
        previousAFinger.setValue({ x: -1, y: -1 });
        previousBFinger.setValue({ x: -1, y: -1 });
        initialPanPosition.setValue({
          x: getValue(pan.x),
          y: getValue(pan.y)
        });
      }
    })
  ).current;

  return (
    <View {...panResponder.panHandlers}>
      <Animated.Image
        source={{ uri: `https://picsum.photos/${WIDTH}/${WIDTH}` }}
        style={[
          {
            width: WIDTH,
            height: WIDTH,
            position: "absolute",
            transform: [{ scale }, { rotate: rotation }],
            left: pan.x,
            top: pan.y
          }
        ]}
        {...panResponder.panHandlers}
      />
    </View>
  );
};

export default ImageViewer;
