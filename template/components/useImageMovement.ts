import { useRef } from "react";
import {
  Animated,
  GestureResponderEvent,
  PanResponderGestureState
} from "react-native";

const getValue = (value: Animated.Value): number => {
  // @ts-expect-error
  return value._value;
};

type FingerTouch = {
  pageX: number;
  pageY: number;
};
const computeDistanceBetween = (touchA: FingerTouch, touchB: FingerTouch) => {
  return Math.sqrt(
    Math.pow(touchA.pageX - touchB.pageX, 2) +
      Math.pow(touchA.pageY - touchB.pageY, 2)
  );
};

const convertToImageReferenceFrameCoordinates = (
  touch: FingerTouch | Animated.ValueXY,
  pan: Animated.ValueXY,
  imageWidth: number,
  imageHeight: number
) => {
  const x = "pageX" in touch ? touch.pageX : getValue(touch.x);
  const y = "pageY" in touch ? touch.pageY : getValue(touch.y);

  return {
    x: x - getValue(pan.x) - imageWidth / 2,
    y: y - getValue(pan.y) - imageHeight / 2
  };
};

export const useImageMovement = ({
  imageWidth,
  imageHeight
}: {
  imageWidth: number;
  imageHeight: number;
}) => {
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const scale = useRef(new Animated.Value(1)).current;
  const rotation = useRef(new Animated.Value(0)).current;
  const rotationString = rotation.interpolate({
    inputRange: [0, 360],
    outputRange: ["0deg", "360deg"]
  });

  const initialPanPosition = useRef(
    new Animated.ValueXY({ x: 0, y: 0 })
  ).current;

  const previousAFinger = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const previousBFinger = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  const onTwoFingersStart = (evt: GestureResponderEvent) => {
    const [touchA, touchB] = evt.nativeEvent.touches;

    previousAFinger.setValue({
      x: touchA.pageX,
      y: touchA.pageY
    });
    previousBFinger.setValue({
      x: touchB.pageX,
      y: touchB.pageY
    });
  };

  const onTwoFingersStop = (gestureState: PanResponderGestureState) => {
    previousAFinger.setValue({ x: -1, y: -1 });
    previousBFinger.setValue({ x: -1, y: -1 });
    initialPanPosition.setValue({
      x: getValue(pan.x) - gestureState.dx,
      y: getValue(pan.y) - gestureState.dy
    });
  };

  const onTwoFingersContinue = (evt: GestureResponderEvent) => {
    const [touchA, touchB] = evt.nativeEvent.touches;

    const { x: xa, y: ya } = convertToImageReferenceFrameCoordinates(
      previousAFinger,
      pan,
      imageWidth,
      imageHeight
    );
    const { x: xb, y: yb } = convertToImageReferenceFrameCoordinates(
      previousBFinger,
      pan,
      imageWidth,
      imageHeight
    );
    const { x: xap, y: yap } = convertToImageReferenceFrameCoordinates(
      touchA,
      pan,
      imageWidth,
      imageHeight
    );
    const { x: xbp, y: ybp } = convertToImageReferenceFrameCoordinates(
      touchB,
      pan,
      imageWidth,
      imageHeight
    );

    if (xa === xb && ya === yb) {
      previousAFinger.setValue({
        x: touchA.pageX,
        y: touchA.pageY
      });
      previousBFinger.setValue({
        x: touchB.pageX,
        y: touchB.pageY
      });

      return;
    }

    const computedDistanceRatio =
      computeDistanceBetween(touchA, touchB) /
      computeDistanceBetween(
        { pageX: xa, pageY: ya },
        { pageX: xb, pageY: yb }
      );

    const scaleFactor =
      computedDistanceRatio !== Infinity ? computedDistanceRatio : 1;

    let cos;
    let sin;

    if (xa === xb) {
      sin = (xap - xbp) / (yb - ya) / scaleFactor;
      cos = (yap - ybp) / (ya - yb) / scaleFactor;
    } else {
      sin =
        ((xa - xb) * (yap - ybp) - (ya - yb) * (xap - xbp)) /
        (Math.pow(xa - xb, 2) + Math.pow(ya - yb, 2)) /
        scaleFactor;
      cos =
        (xap - xbp) / (xa - xb) / scaleFactor + ((ya - yb) / (xa - xb)) * sin;
    }

    const rotationAngle = (Math.atan(sin / cos) * 180) / Math.PI;

    const xTranslation = xap - scaleFactor * xa * cos + scaleFactor * ya * sin;
    const yTranslation = yap - scaleFactor * xa * sin - scaleFactor * ya * cos;

    const newPan = {
      x: getValue(pan.x) + xTranslation,
      y: getValue(pan.y) + yTranslation
    };
    pan.setValue(newPan);

    const newScale = getValue(scale) * scaleFactor;
    scale.setValue(newScale);

    const newRotation = getValue(rotation) + rotationAngle;
    rotation.setValue(newRotation);

    previousAFinger.setValue({
      x: touchA.pageX,
      y: touchA.pageY
    });
    previousBFinger.setValue({
      x: touchB.pageX,
      y: touchB.pageY
    });
  };

  return {
    pan,
    scale,
    rotation: rotationString,

    initialPanPosition,

    previousAFinger,
    previousBFinger,

    onTwoFingersStart,
    onTwoFingersStop,
    onTwoFingersContinue
  };
};
