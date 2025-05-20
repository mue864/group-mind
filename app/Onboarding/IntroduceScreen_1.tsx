import { Text, View, StatusBar } from "react-native";
import Rect from "@/assets/icons/introduceRect.svg";
import Check from "@/assets/icons/chat-check.svg";
import Elipse from "@/assets/icons/introduceEllipse.svg";
import MiniButton from "@/components/MiniButton";
import PaginationDots from "@/components/PaginationDots";
import { Colors, Strings } from "@/constants";
import Animated,
{
    useSharedValue,
    useAnimatedStyle,
    withTiming
}
from "react-native-reanimated";
import { useEffect } from "react";
import { useRouter } from "expo-router";

const IntroduceScreen_1 = () => {

    const router = useRouter();

    const translateY = useSharedValue(-250);
    const translateElipseY = useSharedValue(250);
    const translateX = useSharedValue(250);
    const opacity = useSharedValue(0);

    const animateRect = useAnimatedStyle(() => (
        {
            transform: [
                {translateY: translateY.value},
                {scale: opacity.value},

            ],
            opacity: opacity.value
        }
    ));

    const animateElipse = useAnimatedStyle(() => (
        {
            transform: [
                {translateY: translateElipseY.value},
                {scale: opacity.value}
            ],
            opacity: opacity.value
        }
    ))

    const animateCheck = useAnimatedStyle(() => ({
        transform: [
            {translateX: translateX.value},
            {scale: opacity.value}
        ],
        opacity: opacity.value
    }));

    const animateButton = useAnimatedStyle(() => (
        {
            opacity: opacity.value,
            transform: [{scale: opacity.value}]
        }
    ));

    useEffect(() => {
        opacity.value = withTiming(1, {duration: 500});
        translateY.value = withTiming(0, {duration: 1000});
        translateX.value = withTiming(0, {duration: 1000});
        translateElipseY.value = withTiming(0, {duration: 100});
    }, [opacity, translateY, translateX, translateElipseY])
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
          style={animateCheck}
        >
          <Check width={200} height={200} />
        </Animated.View>

        <View className="absolute bottom-40 left-10 right-10">
          <Text
            style={{ color: Colors.primary }}
            className="text-center text-3xl font-poppins-semiBold"
          >
            {Strings.introduce1Title}
          </Text>
          <Text className="text-center text-lg font-inter">
            {Strings.introduce1SubTitle}
          </Text>
        </View>

        <Animated.View className="absolute right-10 bottom-14" style={animateButton}>
          <MiniButton
            onPress={() => router.push("/Onboarding/introduceScreen_2")}
            direction="right"
          />
        </Animated.View>

        <View className="absolute bottom-20 left-16 right-16">
          <PaginationDots total={4} currentIndex={0} />
        </View>
      </View>
    );
}
 
export default IntroduceScreen_1;