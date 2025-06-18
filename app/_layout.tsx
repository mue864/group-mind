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
    <PaperProvider theme={theme}>
      <GroupProvider>
          <Post>
            <SafeAreaView className="flex-1">
              <View onLayout={onLayoutRootView} style={{ flex: 1 }}>
                <Stack
                  screenOptions={({ route }) => {
  

                    return {
                      headerShown: false,
                      headerStyle: {
                        backgroundColor: "#fff",
                      },
                      headerTitle: "",
                    };
                  }}
                >
                  <Stack.Screen name="index" />
                </Stack>

                <Toast />
              </View>
            </SafeAreaView>
          </Post>
      </GroupProvider>
    </PaperProvider>
  );
};
export default RootLayout;
