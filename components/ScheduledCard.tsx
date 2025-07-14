import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Timestamp } from "firebase/firestore";
import { memo } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Call from "../assets/icons/Callz.svg";
import Group from "../assets/icons/groupUsers.svg";
import Time from "../assets/icons/time.svg";
import Video from "../assets/icons/Video.svg";

interface ScheduledCardProps {
  title?: string;
  time?: Timestamp | null;
  type: string;
  groupName: string;
}

const ScheduledCard = ({
  title,
  time,
  type,
  groupName,
}: ScheduledCardProps) => {
  // Enhanced time formatting
  const now = new Date();
  const isScheduled = time && time?.toDate?.() > now;
  const scheduledDate = time?.toDate();

  const formatDateTime = () => {
    if (!scheduledDate) return "Time to be announced";

    const diffTime = scheduledDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const timeString = scheduledDate.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    if (diffDays === 0) {
      return `Today at ${timeString}`;
    } else if (diffDays === 1) {
      return `Tomorrow at ${timeString}`;
    } else if (diffDays < 7) {
      const dayName = scheduledDate.toLocaleDateString("en-US", {
        weekday: "long",
      });
      return `${dayName} at ${timeString}`;
    } else {
      const dateString = scheduledDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      return `${dateString} at ${timeString}`;
    }
  };

  const getStatusInfo = () => {
    if (!scheduledDate)
      return {
        status: "pending",
        color: ["#f093fb", "#f5576c"],
        icon: "⏳",
        bgColor: "#fef3c7",
        textColor: "#92400e",
      };

    const diffTime = scheduledDate.getTime() - now.getTime();
    const diffMinutes = Math.ceil(diffTime / (1000 * 60));

    if (diffMinutes <= 0) {
      return {
        status: "live",
        color: ["#ff6b6b", "#ee5a52"],
        icon: "🔴",
        bgColor: "#fee2e2",
        textColor: "#dc2626",
      };
    } else if (diffMinutes <= 30) {
      return {
        status: "starting soon",
        color: ["#feca57", "#ff9ff3"],
        icon: "⚡",
        bgColor: "#fef3c7",
        textColor: "#d97706",
      };
    } else {
      return {
        status: "scheduled",
        color: ["#667eea", "#764ba2"],
        icon: "📅",
        bgColor: "#e0e7ff",
        textColor: "#3730a3",
      };
    }
  };

  const { status, color, icon, bgColor, textColor } = getStatusInfo();

  const callTypeIcon =
    type === "video" ? (
      <Video width={20} height={20} />
    ) : (
      <Call width={18} height={18} />
    );

  const getSessionTypeText = () => {
    return type === "video" ? "Video Study Session" : "Audio Study Session";
  };

  return (
    <View className="mx-3 mb-4">
      <TouchableOpacity
        activeOpacity={0.95}
        style={{
          transform: [{ scale: 1 }],
        }}
      >
        <View
          className="bg-white rounded-3xl overflow-hidden"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.12,
            shadowRadius: 16,
            elevation: 12,
          }}
        >
          {/* Enhanced Header with Status */}
          <LinearGradient
            colors={color}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="px-5 py-5"
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View className="bg-white/25 rounded-2xl p-3 mr-4 backdrop-blur-sm">
                  <Text className="text-white text-xl">📚</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-white font-bold text-lg mb-1">
                    {getSessionTypeText()}
                  </Text>
                  <Text className="text-white/80 text-sm">{groupName}</Text>
                </View>
              </View>

              {/* Enhanced Status Badge */}
              <View className="bg-white/25 rounded-full px-4 py-2 backdrop-blur-sm">
                <View className="flex-row items-center">
                  <Text className="text-white text-sm mr-1">{icon}</Text>
                  <Text className="text-white text-xs font-bold uppercase tracking-wide">
                    {status}
                  </Text>
                </View>
              </View>
            </View>
          </LinearGradient>

          {/* Enhanced Content Section */}
          <View className="p-5">
            {/* Session Topic with improved styling */}
            <View className="bg-blue-50 rounded-2xl p-4 mb-4 border border-blue-100">
              <View className="flex-row items-center mb-3">
                <LinearGradient
                  colors={["#3b82f6", "#6366f1"]}
                  className="rounded-xl p-3 mr-4"
                >
                  {callTypeIcon}
                </LinearGradient>
                <View className="flex-1">
                  <Text className="text-blue-600 text-xs font-bold uppercase tracking-wider mb-1">
                    Session Topic
                  </Text>
                  <Text className="text-gray-800 font-bold text-lg">
                    {title || "Study Topic"}
                  </Text>
                </View>
              </View>
            </View>

            {/* Enhanced Schedule Details */}
            <View className="bg-purple-50 rounded-2xl p-4 mb-4 border border-purple-100">
              <View className="flex-row items-center">
                <LinearGradient
                  colors={["#a855f7", "#ec4899"]}
                  className="rounded-xl p-3 mr-4"
                >
                  <Time width={20} height={20} />
                </LinearGradient>
                <View className="flex-1">
                  <Text className="text-purple-600 text-xs font-bold uppercase tracking-wider mb-1">
                    Schedule
                  </Text>
                  <Text className="text-purple-800 font-bold text-lg">
                    {formatDateTime()}
                  </Text>
                </View>
              </View>
            </View>

            {/* Enhanced Study Group Info */}
            <View className="bg-green-50 rounded-2xl p-4 mb-5 border border-green-100">
              <View className="flex-row items-center">
                <LinearGradient
                  colors={["#22c55e", "#10b981"]}
                  className="rounded-xl p-3 mr-4"
                >
                  <Group width={20} height={20} />
                </LinearGradient>
                <View className="flex-1">
                  <Text className="text-green-600 text-xs font-bold uppercase tracking-wider mb-1">
                    Study Group
                  </Text>
                  <Text className="text-green-800 font-bold text-lg">
                    {groupName}
                  </Text>
                </View>
              </View>
            </View>

            {/* Enhanced Action Buttons */}
            <View className="flex-row gap-4 mb-4">
              <TouchableOpacity className="flex-1">
                <View className="bg-gray-100 rounded-2xl py-4 px-4 border border-gray-200">
                  <View className="flex-row items-center justify-center">
                    <Ionicons
                      name="notifications-outline"
                      size={18}
                      color="#6b7280"
                    />
                    <Text className="text-gray-600 font-semibold text-sm ml-2">
                      Set Reminder
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>

              <TouchableOpacity className="flex-1">
                <LinearGradient
                  colors={
                    status === "live"
                      ? ["#ef4444", "#dc2626"]
                      : ["#667eea", "#764ba2"]
                  }
                  className="rounded-2xl py-4 px-4"
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <View className="flex-row items-center justify-center">
                    <Ionicons
                      name={
                        status === "live"
                          ? "radio-button-on"
                          : type === "video"
                          ? "videocam"
                          : "call"
                      }
                      size={18}
                      color="white"
                    />
                    <Text className="text-white font-bold text-sm ml-2">
                      {status === "live" ? "Join Now" : "Join Session"}
                    </Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Enhanced Study Tip */}
            <View className="bg-amber-50 rounded-2xl p-4 border-l-4 border-amber-300">
              <View className="flex-row items-start">
                <View className="bg-amber-100 rounded-full p-2 mr-3">
                  <Ionicons name="bulb-outline" size={16} color="#d97706" />
                </View>
                <View className="flex-1">
                  <Text className="text-amber-800 text-sm leading-5">
                    <Text className="font-bold">Study Tip:</Text> Make sure you
                    have a stable internet connection and a quiet environment
                    for the best learning experience.
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default memo(ScheduledCard);
