import { Stack } from "expo-router";
import { View } from "react-native";

const AuthLayout = () => {
    return (

        <View className="flex-1">

          <Stack
            screenOptions={{
              headerShown: false,
            }}
          ></Stack>
        </View>
    );
}
 
export default AuthLayout;