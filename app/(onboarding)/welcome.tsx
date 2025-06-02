import Bag from "@/assets/icons/briefcase.svg";
import Elipse from "@/assets/icons/ellipse.svg";
import Rectangle from "@/assets/icons/rectangle.svg";
import Button from "@/components/Button";
import { Colors, Strings } from "@/constants";
import "@/global.css";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const Welcome = () => {
  const router = useRouter();
  const opacity = useSharedValue(0);

  const animated = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: opacity.value }],
  }));

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 500 });
  });
  return (
    <View className="flex-1">
      <View className="absolute left-40">
        <Elipse width={300} height={300} />
      </View>

      <View className="absolute bottom-0 left-0">
        <Rectangle width={300} height={300} />
      </View>

      <Animated.View
        style={animated}
        className="h-64 justify-center items-center pt-20 z-10"
      >
        <Bag width={200} height={200} />
      </Animated.View>

      <View className="absolute bottom-40 left-10 right-10">
        <Text
          style={{ color: Colors.primary }}
          className="font-bold text-3xl font-poppins-semiBold text-center"
        >
          {Strings.welcomeMessage}
        </Text>
        <Text className="text-lg font-inter text-center">
          {Strings.welcomeDescription}
        </Text>
      </View>

      <View 
      className={`absolute right-14 left-14 bottom-14 h-20`}
      >
        <Button 
        onPress={() => router.replace('/(onboarding)/introduceScreen_1')}
        buttonText={Strings.getStartedButton} />
      </View>
    </View>
  );
};

export default Welcome;
