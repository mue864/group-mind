import { TouchableOpacity } from "react-native";
import { useRef } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  runOnJS,
} from "react-native-reanimated";
import Left from "@/assets/icons/Expand_left.svg";
import Right from "@/assets/icons/Expand_right.svg";
import Done from "@/assets/icons/Done_round.svg";

const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);

type MiniButtonProps = {
  direction: string;
  onPress: () => void;
  disabled?: boolean;
  size?: "small" | "medium" | "large";
};

const MiniButton = ({
  direction,
  onPress,
  disabled = false,
  size = "medium",
}: MiniButtonProps) => {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const shadowScale = useSharedValue(1);
  const isPressed = useRef(false);

  const sizeConfig = {
    small: { padding: 12, iconSize: 16 },
    medium: { padding: 18, iconSize: 20 },
    large: { padding: 24, iconSize: 24 },
  };

  const { padding, iconSize } = sizeConfig[size];

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotation.value}deg` }],
  }));

  const shadowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: shadowScale.value }],
    opacity: disabled ? 0.5 : 1,
  }));

  const handlePressIn = () => {
    if (disabled) return;
    isPressed.current = true;

    scale.value = withSpring(0.95, { damping: 15, stiffness: 200 });
    shadowScale.value = withSpring(0.9, { damping: 15, stiffness: 200 });

    // Add subtle rotation for visual feedback
    rotation.value = withSequence(
      withSpring(direction === "left" ? -2 : 2, {
        damping: 15,
        stiffness: 200,
      }),
      withSpring(0, { damping: 15, stiffness: 200 })
    );
  };

  const handlePressOut = () => {
    if (disabled) return;

    scale.value = withSequence(
      withSpring(1.05, { damping: 15, stiffness: 200 }),
      withSpring(1, { damping: 15, stiffness: 200 })
    );
    shadowScale.value = withSpring(1, { damping: 15, stiffness: 200 });

    if (isPressed.current) {
      setTimeout(() => {
        runOnJS(onPress)();
      }, 100);
    }
    isPressed.current = false;
  };

  const handlePress = () => {
    if (disabled) return;

    // Add a satisfying bounce animation
    scale.value = withSequence(
      withSpring(0.9, { damping: 15, stiffness: 200 }),
      withSpring(1.1, { damping: 15, stiffness: 200 }),
      withSpring(1, { damping: 15, stiffness: 200 })
    );

    setTimeout(() => {
      onPress();
    }, 200);
  };

  const getIcon = () => {
    const iconProps = { width: iconSize, height: iconSize };

    switch (direction) {
      case "left":
        return <Left {...iconProps} />;
      case "right":
        return <Right {...iconProps} />;
      default:
        return <Done {...iconProps} />;
    }
  };

  const getBackgroundColor = () => {
    if (disabled) return "#ccc";
    if (direction === "left") return "#6B7280"; // gray for back
    if (direction === "right") return "#3B82F6"; // blue for next
    return "#10B981"; // green for done
  };

  return (
    <Animated.View style={shadowStyle}>
      <AnimatedTouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={0.8}
        style={[
          animatedStyle,
          {
            backgroundColor: getBackgroundColor(),
            padding,
            borderRadius: 16,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          },
        ]}
      >
        {getIcon()}
      </AnimatedTouchableOpacity>
    </Animated.View>
  );
};

export default MiniButton;
