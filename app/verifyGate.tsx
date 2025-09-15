import Button from "@/components/Button";
import { useGroupContext } from "@/store/GroupContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback } from "react";

import { Text, View } from "react-native";

const VerifyGate = () => {
  const router = useRouter();
  const { userInformation, getCurrentUserInfo } = useGroupContext();
  const isVerified = Boolean(userInformation?.volunteerVerified);

  useFocusEffect(
    useCallback(() => {
      getCurrentUserInfo?.();
    }, [getCurrentUserInfo])
  );

  const handleStep = async () => {
    const saveData = {
      profileStep: 0,
      profilePurpose: userInformation?.purpose,
    };
    const newValue = JSON.stringify(saveData);
    try {
      await AsyncStorage.setItem("@profileStep", newValue);
      if (isVerified) {
        router.replace("/(dashboard)/(tabs)/home");
      } else {
        router.replace("/(auth)/volunteerVerify");
      }
    } catch (error) {
      console.error("Error setting profile step:", error);
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-white px-6">
      <Text className="font-poppins-semiBold text-2xl text-primary text-center mb-4">
        Verification Required
      </Text>
      <Text className="font-poppins-semibold text-md text-gray-600 text-center mb-6">
        You need to pass at least one subject MCQ to continue.
      </Text>
      <Button
        title={isVerified ? "Continue" : "Start Verification"}
        onPress={handleStep}
      />
    </View>
  );
};

export default VerifyGate;
