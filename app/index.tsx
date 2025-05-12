import "../global.css";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import  Animated, {
    useSharedValue,
    withTiming,
    useAnimatedStyle,
}  from "react-native-reanimated";

const Entry = () => {
    const router = useRouter();

    const opacity = useSharedValue(0);

    // Animated style
    const animatedStyle = useAnimatedStyle(() => (
        {
            opacity: opacity.value,
            transform: [{scale: opacity.value}],
        }
    ))
    useEffect(() => {
        // start animation
        opacity.value = withTiming(1, {duration: 1000});

        const timeout = setTimeout(() => {
            router.navigate("/Onboarding/Welcome");
        }, 2000);

        return () => clearTimeout(timeout);
    })


    return (
        <Animated.View style={animatedStyle} className="flex-1 justify-center items-center">
          <View>
            <Text className="text-4xl text-[#1C274C] font-bold font-poppins ">
              GroupMind
            </Text>
          </View>
        </Animated.View>

    );
}
 
export default Entry;
