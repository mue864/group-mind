import { Text, View, StatusBar } from "react-native";
import { useRouter } from "expo-router";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSpring
} from "react-native-reanimated";
import { useEffect } from "react";
import Rect from "@/assets/icons/introduceRect.svg";
import Math from "@/assets/icons/math.svg"
import Elipse from "@/assets/icons/introduceEllipse.svg";
import MiniButton from "@/components/MiniButton";
import PaginationDots from "@/components/PaginationDots";
import { Colors, Strings } from "@/constants";

const IntroduceScreen_2 = () => {
    const router = useRouter();

    const translateY = useSharedValue(-250);
    const bounce = useSharedValue(0);
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

    const animateCalculator = useAnimatedStyle(() => ({
      transform: [{ translateY: bounce.value }],
    }));

    const animateButton = useAnimatedStyle(() => ({
      opacity: opacity.value,
      transform: [{ scale: opacity.value }],
    }));

    useEffect(() => {
      opacity.value = withTiming(1, { duration: 500 });
      translateY.value = withTiming(0, { duration: 1000 });
      translateElipseY.value = withTiming(0, {duration: 1000});
      bounce.value = withSpring(-20, {
        damping: 2,
        stiffness: 100,
        mass: 1,
      })
    }, [opacity, translateY, bounce, translateElipseY]);
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
          style={animateCalculator}
        >
          <Math width={200} height={200} />
        </Animated.View>

        <View className="absolute bottom-40 left-10 right-10">
          <Text
            style={{ color: Colors.primary }}
            className="text-center text-3xl font-poppins-semiBold"
          >
            {Strings.introduce2Title}
          </Text>
          <Text className="text-center text-lg font-inter">
            {Strings.introduce2SubTitle}
          </Text>
        </View>

        <View className="absolute right-10 bottom-14">
          <MiniButton
            onPress={() => router.push("/(onboarding)/introduceScreen_3")}
            direction="right"
          />
        </View>

        <Animated.View className="absolute left-10  bottom-14" style={animateButton}>
          <MiniButton
            onPress={() => router.push("/(onboarding)/introduceScreen_1")}
            direction="left"
          />
        </Animated.View>

        <View className="absolute bottom-20 left-16 right-16">
          <PaginationDots total={4} currentIndex={1} />
        </View>
      </View>
    );
}
 
export default IntroduceScreen_2;