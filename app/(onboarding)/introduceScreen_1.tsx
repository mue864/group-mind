import Check from "@/assets/icons/chat-check.svg";
import Elipse from "@/assets/icons/introduceEllipse.svg";
import Rect from "@/assets/icons/introduceRect.svg";
import MiniButton from "@/components/MiniButton";
import { Colors, Strings } from "@/constants";
import { useRouter } from "expo-router";
import React from "react";
import { Text, View } from "react-native";

const IntroduceScreen_1 = () => {
  const router = useRouter();

  return (
    <View className="flex-1 bg-white">
      {/* Background elements */}
      <View className="absolute -top-20 -left-10">
        <Rect width={350} height={200} />
      </View>
      <View className="absolute -bottom-20 -right-10">
        <Elipse width={280} height={320} />
      </View>
      {/* Main content */}
      <View className="flex-1 justify-center items-center px-8">
        <View className="justify-center items-center mb-16">
          <View
            className="bg-white rounded-full p-8 shadow-lg"
            style={{
              elevation: 8,
              shadowColor: Colors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
            }}
          >
            <Check width={120} height={120} />
          </View>
        </View>
        {/* Text content */}
        <View className="items-center px-6 w-full">
          <Text
            style={{
              color: Colors.primary,
              fontSize: 32,
              lineHeight: 40,
              textAlign: "center",
              fontFamily: "Poppins-SemiBold",
              marginBottom: 16,
            }}
          >
            {Strings.introduce1Title}
          </Text>
          <Text
            style={{
              fontSize: 18,
              lineHeight: 26,
              textAlign: "center",
              color: "#666",
              fontFamily: "Inter-Regular",
              paddingHorizontal: 16,
            }}
          >
            {Strings.introduce1SubTitle}
          </Text>
        </View>
      </View>
      {/* Bottom navigation */}
      <View className="absolute bottom-0 right-0 pb-safe px-8">
        <View className="flex-row items-end w-full pb-4">
          <MiniButton
            onPress={() => router.push("/(onboarding)/introduceScreen_2")}
            direction="right"
          />
        </View>
      </View>
    </View>
  );
};

export default IntroduceScreen_1;
