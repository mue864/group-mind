import PaginationDots from "@/components/PaginationDots";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Dimensions, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import IntroduceScreen_1 from "./introduceScreen_1";
import IntroduceScreen_2 from "./introduceScreen_2";
import IntroduceScreen_3 from "./introduceScreen_3";
import IntroduceScreen_4 from "./introduceScreen_4";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const screens = [
  IntroduceScreen_1,
  IntroduceScreen_2,
  IntroduceScreen_3,
  IntroduceScreen_4,
];

export default function OnboardingNavigator() {
  const [currentStep, setCurrentStep] = useState(0);
  const translateX = useSharedValue(0);
  const router = useRouter();

  const goToStep = (step) => {
    if (step >= screens.length) {
      router.replace("/(auth)/termsScreen");
      return;
    }
    if (step < 0) return;
    translateX.value = withTiming(-step * SCREEN_WIDTH, { duration: 400 });
    setCurrentStep(step);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    flexDirection: "row",
    width: SCREEN_WIDTH * screens.length,
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={{ flex: 1 }}>
      <Animated.View style={[{ flex: 1, flexDirection: "row" }, animatedStyle]}>
        {screens.map((Screen, idx) => (
          <View key={idx} style={{ width: SCREEN_WIDTH }}>
            <Screen
              onNext={() => goToStep(idx + 1)}
              onBack={() => goToStep(idx - 1)}
              isActive={currentStep === idx}
            />
          </View>
        ))}
      </Animated.View>
    </View>
  );
}
