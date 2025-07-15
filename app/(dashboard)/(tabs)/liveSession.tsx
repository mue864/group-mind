import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const LiveSession = () => {
  const [session, setSession] = useState([]);

  const quickActions = [
    {
      title: "Test Permissions",
      description: "Check camera and microphone access",
      icon: "camera-outline" as const,
      onPress: () => router.push("/(settings)/permissionTest"),
      color: "#4169E1",
    },
    {
      title: "Test Call",
      description: "initialization prob with Expo",
      icon: "call-outline" as const,
      onPress: () => {
        // Start test call functionality
      },
      color: "#10B981",
    },
    {
      title: "Join Session",
      description: "Wont work so far",
      icon: "people-outline" as const,
      onPress: () => {
        // Join session functionality
      },
      color: "#F59E0B",
    },
  ];

  return (
    <View className="flex-1 bg-[#F5F6FA]">
      <StatusBar barStyle={"dark-content"} backgroundColor={"white"} />

      {/* Header */}
      <View className="bg-white pt-12 pb-4 px-4 border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-800">Live Sessions</Text>
        <Text className="text-gray-600 mt-1">
          Expo Go is giving me troubles with WebRTC, will implement after full
          development when app is ejected
        </Text>
      </View>

      <ScrollView
        className="flex-1 px-4 pt-4"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Quick Actions */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-800 mb-3">
            Quick Actions
          </Text>
          <View className="space-y-3">
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                onPress={action.onPress}
                className="bg-white p-4 rounded-xl shadow-sm border border-gray-100"
                activeOpacity={0.7}
              >
                <View className="flex-row items-center">
                  <View
                    className="w-12 h-12 rounded-full items-center justify-center mr-4"
                    style={{ backgroundColor: `${action.color}20` }}
                  >
                    <Ionicons
                      name={action.icon}
                      size={24}
                      color={action.color}
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-gray-800">
                      {action.title}
                    </Text>
                    <Text className="text-gray-600 text-sm mt-1">
                      {action.description}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Active Sessions */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-800 mb-3">
            Active Sessions
          </Text>
          {session.length === 0 ? (
            <View className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <View className="items-center">
                <Ionicons name="videocam-outline" size={48} color="#9CA3AF" />
                <Text className="text-gray-600 text-center mt-2">
                  No active sessions at the moment
                </Text>
              </View>
            </View>
          ) : (
            <Text className="text-gray-600">
              Active sessions will appear here
            </Text>
          )}
        </View>

        {/* Recent Sessions */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-800 mb-3">
            Recent Sessions
          </Text>
          <View className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <View className="items-center">
              <Ionicons name="time-outline" size={48} color="#9CA3AF" />
              <Text className="text-gray-600 text-center mt-2">
                No recent sessions
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default LiveSession;
