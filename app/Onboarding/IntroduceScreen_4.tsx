import { Text, View, StatusBar } from "react-native";
import { useRouter } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { useEffect } from "react";
import Rect from "@/assets/icons/introduceRect.svg";
import Devices from "@/assets/icons/devices.svg";
import Elipse from "@/assets/icons/introduceEllipse.svg";
import MiniButton from "@/components/MiniButton";
import PaginationDots from "@/components/PaginationDots";
import { Colors, Strings } from "@/constants";

const IntroduceScreen_4 = () => {
  const router = useRouter();

  const translateY = useSharedValue(-250);
  const translateX = useSharedValue(250);
  const translateElipseY = useSharedValue(250);
  const opacity = useSharedValue(0);

  const animateRect = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: opacity.value }],
    opacity: opacity.value,
  }));

  const animateElipse = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateElipseY.value },
      { scale: opacity.value },
    ],
    opacity: opacity.value,
  }));

  const animateWebCam = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 500 });
    translateY.value = withTiming(0, { duration: 1000 });
    translateX.value = withTiming(0, { duration: 1000 });
    translateElipseY.value = withTiming(0, { duration: 1000 });
  }, [opacity, translateY, translateElipseY, translateX]);
  return (
    <View className="flex-1">
      <StatusBar barStyle={"dark-content"} />

      <Animated.View className="absolute" style={animateRect}>
        <Rect width={350} height={200} />
      </Animated.View>

      <Animated.View
        className="absolute left-40 bottom-0"
        style={animateElipse}
      >
        <Elipse width={250} height={300} />
      </Animated.View>

      <Animated.View
        className="justify-center items-center pt-20 h-64"
        style={animateWebCam}
      >
        <Devices width={200} height={200} />
      </Animated.View>

      <View className="absolute bottom-40 left-10 right-10">
        <Text
          style={{ color: Colors.primary }}
          className="text-center text-3xl font-poppins-semiBold"
        >
          {Strings.introduce4Title}
        </Text>
        <Text className="text-center text-lg font-inter">
          {Strings.introduce4SubTitle}
        </Text>
      </View>

      <View className="absolute right-10 bottom-14">
        <MiniButton
          onPress={() => router.replace("/Auth/TermsScreen")}
          direction="done"
        />
      </View>

      <Animated.View className="absolute left-10  bottom-14">
        <MiniButton
          onPress={() => router.push("/Onboarding/IntroduceScreen_3")}
          direction="left"
        />
      </Animated.View>

      <View className="absolute bottom-20 left-16 right-16">
        <PaginationDots total={4} currentIndex={3} />
      </View>
    </View>
  );
};

export default IntroduceScreen_4;
