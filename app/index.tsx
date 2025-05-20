import "../global.css";
import { Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import  Animated, {
    useSharedValue,
    withTiming,
    useAnimatedStyle,
}  from "react-native-reanimated";
import { auth } from "@/services/firebase";
import { onAuthStateChanged } from "firebase/auth";

const Entry = () => {
    const router = useRouter();

    const opacity = useSharedValue(0);

    // Animated style
    const animatedStyle = useAnimatedStyle(() => (
        {
            opacity: opacity.value,
            transform: [{scale: opacity.value}],
        }
    ));

    useEffect(() => {
        // start animation
        opacity.value = withTiming(1, {duration: 1000});

        // firebase auth
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            const timeout = setTimeout(() => {
                if (user) {
                    router.replace("/Dashboard/home");
                } else {
                    router.replace("/Onboarding/welcome");
                }
            }, 2000);

            return () => clearTimeout(timeout);
        });
        return () => unsubscribe();
    }, []);


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
