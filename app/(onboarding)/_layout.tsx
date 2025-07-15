import { Slot } from "expo-router";
import { View } from "react-native";
import { StatusBar } from "expo-status-bar";

const OnboardingLayout = () => {
    return (
      <View className="flex-1">
        <StatusBar style="dark" backgroundColor="#F8FAFF" translucent={false} />
        <Slot />
      </View>
    );
}
 
export default OnboardingLayout;