import { Timestamp } from "firebase/firestore";
import { memo } from "react";
import { Text, View, TouchableOpacity } from "react-native";
import Call from "../assets/icons/Callz.svg";
import Group from "../assets/icons/groupUsers.svg";
import Time from "../assets/icons/time.svg";
import Video from "../assets/icons/Video.svg";
import ScheduleButton from "./ScheduleButton";
import { LinearGradient } from "expo-linear-gradient";

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
      return { status: "pending", color: ["#f093fb", "#f5576c"] };

    const diffTime = scheduledDate.getTime() - now.getTime();
    const diffMinutes = Math.ceil(diffTime / (1000 * 60));

    if (diffMinutes <= 0) {
      return { status: "live", color: ["#ff6b6b", "#ee5a52"] };
    } else if (diffMinutes <= 30) {
      return { status: "starting soon", color: ["#feca57", "#ff9ff3"] };
    } else {
      return { status: "scheduled", color: ["#667eea", "#764ba2"] };
    }
  };

  const { status, color } = getStatusInfo();

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
      <TouchableOpacity activeOpacity={0.95}>
        <View
          className="bg-white rounded-2xl overflow-hidden"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.08,
            shadowRadius: 8,
            elevation: 6,
          }}
        >
          {/* Header with Status */}
          <LinearGradient
            colors={color}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="px-4 py-4"
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View className="bg-white/20 rounded-xl p-2 mr-3">
                  <Text className="text-white text-lg">📚</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-white font-bold text-lg">
                    {getSessionTypeText()}
                  </Text>
                </View>
              </View>

              {/* Status Badge */}
              <View className="bg-white/20 rounded-full px-3 py-1">
                <Text className="text-white text-xs font-semibold uppercase">
                  {status}
                </Text>
              </View>
            </View>
          </LinearGradient>

          {/* Content Section */}
          <View className="p-4">
            {/* Session Topic */}
            <View className="bg-gray-100 rounded-xl p-4 mb-3">
              <View className="flex-row items-center mb-2">
                <View className="bg-blue-200 rounded-lg p-2 mr-3">
                  {callTypeIcon}
                </View>
                <View className="flex-1">
                  <Text className="text-gray-500 text-xs font-medium uppercase tracking-wide">
                    Topic
                  </Text>
                  <Text className="text-gray-800 font-semibold text-base mt-1">
                    {title || "Study Topic"}
                  </Text>
                </View>
              </View>
            </View>

            {/* Schedule Details */}
            <View className="bg-purple-100 rounded-xl p-4 mb-3">
              <View className="flex-row items-center">
                <View className="bg-purple-300 rounded-lg p-2 mr-3">
                  <Time width={18} height={18} />
                </View>
                <View className="flex-1">
                  <Text className="text-purple-600 text-xs font-medium uppercase tracking-wide">
                    Schedule
                  </Text>
                  <Text className="text-purple-800 font-semibold text-base mt-1">
                    {formatDateTime()}
                  </Text>
                </View>
              </View>
            </View>

            {/* Study Group Info */}
            <View className="bg-green-100 rounded-xl p-4 mb-4">
              <View className="flex-row items-center">
                <View className="bg-green-300 rounded-lg p-2 mr-3">
                  <Group width={18} height={18} />
                </View>
                <View className="flex-1">
                  <Text className="text-green-600 text-xs font-medium uppercase tracking-wide">
                    Study Group
                  </Text>
                  <Text className="text-green-800 font-semibold text-base mt-1">
                    {groupName}
                  </Text>
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View className="flex-row gap-3 mb-3">
              <TouchableOpacity className="flex-1">
                <LinearGradient
                  colors={["#4facfe", "#00f2fe"]}
                  className="rounded-xl py-3 px-4"
                >
                  <View className="flex-row items-center justify-center">
                    <Text className="text-white text-xs mr-1">⏰</Text>
                    <Text className="text-white font-semibold text-sm">
                      Set Reminder
                    </Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity className="flex-1">
                <LinearGradient
                  colors={
                    status === "live"
                      ? ["#ff6b6b", "#ee5a52"]
                      : ["#667eea", "#764ba2"]
                  }
                  className="rounded-xl py-3 px-4"
                >
                  <View className="flex-row items-center justify-center">
                    <Text className="text-white text-xs mr-1">
                      {status === "live"
                        ? "🔴"
                        : type === "video"
                        ? "📹"
                        : "📞"}
                    </Text>
                    <Text className="text-white font-semibold text-sm">
                      {status === "live" ? "Join Now" : "Join Session"}
                    </Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Study Tip */}
            <View className="bg-yellow-50 rounded-xl p-3 border-l-4 border-yellow-200">
              <View className="flex-row items-start">
                <Text className="text-yellow-600 text-sm mr-2">💡</Text>
                <Text className="text-yellow-700 text-xs leading-4 flex-1">
                  <Text className="font-semibold">Study Tip:</Text> Make sure
                  that you have a stable internet connection to avoid
                  inconveniences.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default memo(ScheduledCard);
