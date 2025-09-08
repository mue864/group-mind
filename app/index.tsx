import "../global.css";
import { Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { auth } from "@/services/firebase";
import { onAuthStateChanged } from "firebase/auth";
import Logo from '@/assets/icons/logo/logo.svg';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

const Entry = () => {

  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ scale: scale.value }],
    };
  });

  const router = useRouter();

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 1000 });
    scale.value = withTiming(1, { duration: 1000 });
  }, []);

    useEffect(() => {

        // firebase auth
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            const timeout = setTimeout(() => {
                if (user?.emailVerified) {
                    router.replace("/(dashboard)/(tabs)/home");
                } else {
                    router.replace("/(auth)/verifyEmail");
                }
            }, 2000);

            return () => clearTimeout(timeout);
        });
        return () => unsubscribe();
    }, []);


    return (
      <View
        className="flex-1 justify-center items-center bg-white">
        <Animated.View className="gap-4" style={animatedStyle}>
          <View>
            <Logo width={150} height={150} />
          </View>
          <View>
            <Text className="text-3xl text-[#1C274C] font-poppins-semiBold text-center ">
              Group<Text className="text-[#84DBFF]">Mind</Text>
            </Text>
          </View>
        </Animated.View>
      </View>
    );
}
 
export default Entry;
