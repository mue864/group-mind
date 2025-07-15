import Check from "@/assets/icons/chat-check.svg";
import Elipse from "@/assets/icons/introduceEllipse.svg";
import Rect from "@/assets/icons/introduceRect.svg";
import MiniButton from "@/components/MiniButton";
import { Colors, Strings } from "@/constants";
import React, { useEffect } from "react";
import { Dimensions, StatusBar, Text, View } from "react-native";
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

type IntroduceScreen1Props = {
  isActive: boolean;
  onNext: () => void;
  onBack: () => void;
};

const IntroduceScreen_1 = ({
  isActive,
  onNext,
  onBack,
}: IntroduceScreen1Props) => {
  // Animation values
  const bgProgress = useSharedValue(0);
  const iconProgress = useSharedValue(0);
  const textProgress = useSharedValue(0);
  const buttonProgress = useSharedValue(0);

  // Animate on mount
  useEffect(() => {
    if (isActive) {
      bgProgress.value = withTiming(1, { duration: 600 });
      setTimeout(() => {
        iconProgress.value = withTiming(1, { duration: 500 });
      }, 200);
      setTimeout(() => {
        textProgress.value = withTiming(1, { duration: 500 });
      }, 400);
      setTimeout(() => {
        buttonProgress.value = withTiming(1, { duration: 500 });
      }, 600);
    } else {
      // Reset for when not active
      bgProgress.value = 0;
      iconProgress.value = 0;
      textProgress.value = 0;
      buttonProgress.value = 0;
    }
  }, [isActive]);

  // Background animations
  const rectAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      bgProgress.value,
      [0, 1],
      [-SCREEN_HEIGHT * 0.3, 0],
      Extrapolate.CLAMP
    );
    const opacity = interpolate(
      bgProgress.value,
      [0, 1],
      [0, 1],
      Extrapolate.CLAMP
    );
    return {
      transform: [{ translateY }],
      opacity,
    };
  });
  const elipseAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      bgProgress.value,
      [0, 1],
      [SCREEN_HEIGHT * 0.4, 0],
      Extrapolate.CLAMP
    );
    const opacity = interpolate(
      bgProgress.value,
      [0, 1],
      [0, 1],
      Extrapolate.CLAMP
    );
    return {
      transform: [{ translateY }],
      opacity,
    };
  });

  // Icon animation
  const iconAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      iconProgress.value,
      [0, 1],
      [40, 0],
      Extrapolate.CLAMP
    );
    const opacity = interpolate(
      iconProgress.value,
      [0, 1],
      [0, 1],
      Extrapolate.CLAMP
    );
    return {
      transform: [{ translateY }],
      opacity,
    };
  });

  // Text animation
  const textAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      textProgress.value,
      [0, 1],
      [30, 0],
      Extrapolate.CLAMP
    );
    const opacity = interpolate(
      textProgress.value,
      [0, 1],
      [0, 1],
      Extrapolate.CLAMP
    );
    return {
      transform: [{ translateY }],
      opacity,
    };
  });

  // Button and pagination
  const buttonAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      buttonProgress.value,
      [0, 1],
      [30, 0],
      Extrapolate.CLAMP
    );
    const opacity = interpolate(
      buttonProgress.value,
      [0, 1],
      [0, 1],
      Extrapolate.CLAMP
    );
    return {
      transform: [{ translateY }],
      opacity,
    };
  });

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      {/* Background elements */}
      <Animated.View
        className="absolute -top-20 -left-10"
        style={rectAnimatedStyle}
      >
        <Rect width={350} height={200} />
      </Animated.View>
      <Animated.View
        className="absolute -bottom-20 -right-10"
        style={elipseAnimatedStyle}
      >
        <Elipse width={280} height={320} />
      </Animated.View>
      {/* Main content */}
      <View className="flex-1 justify-center items-center px-8">
        <Animated.View
          className="justify-center items-center mb-16"
          style={iconAnimatedStyle}
        >
          <View
            className="bg-white rounded-full p-8 shadow-lg"
            style={{
              elevation: 8,
              shadowColor: Colors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
            }}
          >
            <Check width={120} height={120} />
          </View>
        </Animated.View>
        {/* Text content */}
        <Animated.View
          className="items-center px-6 w-full"
          style={textAnimatedStyle}
        >
          <Text
            style={{
              color: Colors.primary,
              fontSize: 32,
              lineHeight: 40,
              textAlign: "center",
              fontFamily: "Poppins-SemiBold",
              marginBottom: 16,
            }}
          >
            {Strings.introduce1Title}
          </Text>
          <Text
            style={{
              fontSize: 18,
              lineHeight: 26,
              textAlign: "center",
              color: "#666",
              fontFamily: "Inter-Regular",
              paddingHorizontal: 16,
            }}
          >
            {Strings.introduce1SubTitle}
          </Text>
        </Animated.View>
      </View>
      {/* Bottom navigation */}
      <Animated.View
        className="absolute bottom-0 right-0 pb-safe px-8"
        style={buttonAnimatedStyle}
      >
        <View className="flex-row items-end w-full pb-4">
          <MiniButton onPress={onNext} direction="right" />
        </View>
      </Animated.View>
    </View>
  );
};

export default IntroduceScreen_1;
