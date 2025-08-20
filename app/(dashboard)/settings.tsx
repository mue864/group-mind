import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View, Alert } from "react-native";
import {auth} from "@/services/firebase";
import { signOut } from "firebase/auth";

const Settings = () => {

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.replace("/(auth)/signInScreen");
    } catch (err: any) {
      Alert.alert("Error", "Unable to sign you out", err.message);
    }
  }

  const settingsOptions = [
    {
      title: "Profile",
      description: "Manage your profile settings",
      icon: "person-outline",
      onPress: () => router.push("/(dashboard)/profile"),
      color: "#10B981",
    },
    {
      title: "Account",
      description: "Account and security settings",
      icon: "shield-outline",
      onPress: () =>
        router.push("/(settings)/(app_settings)/(account_settings)/"),
      color: "#F59E0B",
    },
    {
      title: "Help & Support",
      description: "Get help and contact support",
      icon: "help-circle-outline",
      onPress: () =>
        router.push("/(settings)/(app_settings)/(support)/"),
      color: "#06B6D4",
    },
  ];

  return (
    <View className="flex-1 bg-[#F5F6FA]">

      <ScrollView className="flex-1 px-4 pt-4">
        <View className="gap-3">
          {settingsOptions.map((option, index) => (
            <TouchableOpacity
              key={index}
              onPress={option.onPress}
              className="bg-white p-4 rounded-xl shadow-sm border border-gray-100"
              activeOpacity={0.7}
            >
              <View className="flex-row items-center">
                <View
                  className="w-12 h-12 rounded-full items-center justify-center mr-4"
                  style={{ backgroundColor: `${option.color}20` }}
                >
                  <Ionicons name={option.icon} size={24} color={option.color} />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-gray-800">
                    {option.title}
                  </Text>
                  <Text className="text-gray-600 text-sm mt-1">
                    {option.description}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View className="py-6">
          <TouchableOpacity
            onPress={handleSignOut}
            className="bg-red-500 p-4 rounded-xl"
            activeOpacity={0.7}
          >
            <Text className="text-white text-center font-semibold text-lg">
              Sign Out
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default Settings;
