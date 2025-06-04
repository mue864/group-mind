import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useCallback, useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { GroupProvider, useGroupContext } from "@/store/GroupContext";
import { MessagesProvider } from "@/store/MessagesProvider";
import { PostProvider } from "@/store/PostContext";

SplashScreen.preventAutoHideAsync();

const AppContext = ({children} : {children: React.ReactNode}) => {
  const {groups, loading, error} = useGroupContext();
  console.log(loading)
  if (error) {
    return;
  }

  return (
    <MessagesProvider groups={groups} loading={loading}>
      {children}
    </MessagesProvider>
  )
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
    <GroupProvider>
      <AppContext>
        <Post>
          <SafeAreaView className="flex-1">
            <View onLayout={onLayoutRootView} style={{ flex: 1 }}>
              <Stack
                screenOptions={({ route }) => ({
                  headerShown: route.path?.includes("(groups)") || false,
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
        </Post>
      </AppContext>
    </GroupProvider>
  );
};
export default RootLayout;
