import { Slot } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useCallback, useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import {useFonts} from 'expo-font';
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

SplashScreen.preventAutoHideAsync();


const RootLayout = () => {
  const [fontsLoaded] = useFonts({
    Inter: require("@/assets/fonts/Inter.ttf"),
    Poppins: require("@/assets/fonts/Poppins-Regular.ttf"),
    'Poppins-SemiBold': require("@/assets/fonts/Poppins-SemiBold.ttf")
  });

  const onLayoutRootView = useCallback(async () => {
    if(fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    if(fontsLoaded) {
      onLayoutRootView();
    }
  }, [fontsLoaded, onLayoutRootView]);

  if (!fontsLoaded) {
    return <ActivityIndicator size={'large'} />;
  }
  return (
    <SafeAreaView className="flex-1">
      <View onLayout={onLayoutRootView} style={{ flex: 1 }}>
        <Slot />
        <Toast />
      </View>
    </SafeAreaView>
  );
}
export default RootLayout;