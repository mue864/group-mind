import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useCallback, useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { GroupProvider, useGroupContext } from "@/store/GroupContext";
import { PostProvider } from "@/store/PostContext";
import {Provider as PaperProvider, DefaultTheme} from "react-native-paper";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";

SplashScreen.preventAutoHideAsync();

// theme

const theme = {
  ...DefaultTheme,
  roundness: 12,
  colors: {
    ...DefaultTheme.colors,
    primary: "#4169E1",
  }
}

const Post =({children}: {children: React.ReactNode}) => {
  const {groups, loading, error} = useGroupContext();

  if (error) return;
  return (
    <PostProvider groups={groups} loading={loading}>
      {children}
    </PostProvider>
  )
}

const RootLayout = () => {
  const [fontsLoaded] = useFonts({
    Inter: require("@/assets/fonts/Inter.ttf"),
    Poppins: require("@/assets/fonts/Poppins-Regular.ttf"),
    "Poppins-SemiBold": require("@/assets/fonts/Poppins-SemiBold.ttf"),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    if (fontsLoaded) {
      onLayoutRootView();
    }
  }, [fontsLoaded, onLayoutRootView]);

  if (!fontsLoaded) {
    return <ActivityIndicator size={"large"} />;
  }

  
  return (
    <GestureHandlerRootView>
      <PaperProvider theme={theme}>
        <GroupProvider>
          <Post>
            {/* Wrap everything in a view that sets the background color */}
            <View className="flex-1 bg-[#F5F6FA]">
              {/* Place StatusBar OUTSIDE SafeAreaView */}
              <StatusBar style="dark" translucent />

              <SafeAreaView className="flex-1">
                <View onLayout={onLayoutRootView} className="flex-1">
                  <Stack
                    screenOptions={({ route }) => ({
                      headerShown: false,
                      headerStyle: {
                        backgroundColor: "#fff",
                      },
                      headerTitle: "",
                    })}
                  >
                    <Stack.Screen name="index" />
                  </Stack>

                  <Toast />
                </View>
              </SafeAreaView>
            </View>
          </Post>
        </GroupProvider>
      </PaperProvider>
    </GestureHandlerRootView>
  );
};
export default RootLayout;
