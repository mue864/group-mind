import { Slot, Stack } from "expo-router";
import { View } from "react-native";
import { StatusBar } from "expo-status-bar";

const OnboardingLayout = () => {
    return (
      <View className="flex-1">
        <Stack
        screenOptions={{
          headerShown: false
        }}
        >

        </Stack>
      </View>
    );
}
 
export default OnboardingLayout;