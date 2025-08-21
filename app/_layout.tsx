import { GroupProvider, useGroupContext } from "@/store/GroupContext";
import { PostProvider } from "@/store/PostContext";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useCallback, useEffect } from "react";
import { ActivityIndicator, View, StatusBar } from "react-native";
import FlashMessage from "react-native-flash-message";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { DefaultTheme, Provider as PaperProvider } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

SplashScreen.preventAutoHideAsync();

// theme

const theme = {
  ...DefaultTheme,
  roundness: 12,
  colors: {
    ...DefaultTheme.colors,
    primary: "#4169E1",
  },
};

const Post = ({ children }: { children: React.ReactNode }) => {
  const { groups, loading, error } = useGroupContext();

  if (error) return;
  return (
    <PostProvider groups={groups} loading={loading}>
      {children}
    </PostProvider>
  );
};

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
            <View className="flex-1 ">
              {/* Place StatusBar OUTSIDE SafeAreaView */}
              <StatusBar barStyle="dark-content" backgroundColor="#fff" />
              <SafeAreaView className="flex-1">
                <View onLayout={onLayoutRootView} className="flex-1">
                  <Stack
                    screenOptions={({ route }) => ({
                      headerShown: false,

                      headerTitle: "",
                    })}
                  >
                    <Stack.Screen name="index" />
                  </Stack>

                  <FlashMessage position="top" />
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
