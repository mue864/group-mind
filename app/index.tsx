import "../global.css";
import { Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { auth } from "@/services/firebase";
import { onAuthStateChanged } from "firebase/auth";
import Logo from '@/assets/icons/logo/logo.svg';

const Entry = () => {
    const router = useRouter();
    useEffect(() => {

        // firebase auth
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            const timeout = setTimeout(() => {
                if (user) {
                    router.replace("/(dashboard)/(tabs)/home");
                } else {
                    router.replace("/(onboarding)/welcome");
                }
            }, 2000);

            return () => clearTimeout(timeout);
        });
        return () => unsubscribe();
    }, []);


    return (
      <View
        className="flex-1 justify-center items-center bg-white">
        <View className="gap-4">
          <View>
            <Logo width={150} height={150} />
          </View>
          <View>
            <Text className="text-3xl text-[#1C274C] font-poppins-semiBold text-center ">
              Group<Text className="text-[#84DBFF]">Mind</Text>
            </Text>
          </View>
        </View>
      </View>
    );
}
 
export default Entry;
