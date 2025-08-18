import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Timestamp } from "firebase/firestore";
import { memo, useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Time from "../assets/icons/time_blue.svg";
import { useGroupContext } from "../store/GroupContext";

interface ScheduledCardProps {
  title?: string;
  time?: Timestamp | null;
  type: string;
  groupName: string;
  groupID: string;
  groupLink: string;
}

const ScheduledCard = ({
  title,
  time,
  type,
  groupName,
  groupID,
  groupLink,
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
        icon: "⏳",
        bgColor: "#fef3c7",
        textColor: "#92400e",
      };

    const diffTime = scheduledDate.getTime() - now.getTime();
    const diffMinutes = Math.ceil(diffTime / (1000 * 60));

    if (diffMinutes <= 0) {
      return {
        status: "live",
        icon: "🔴",
        bgColor: "#fee2e2",
        textColor: "#dc2626",
      };
    } else if (diffMinutes <= 30) {
      return {
        status: "starting soon",
        icon: "⚡",
        bgColor: "#fef3c7",
        textColor: "#d97706",
      };
    } else {
      return {
        status: "scheduled",
        icon: "📅",
        bgColor: "#e0e7ff",
        textColor: "#3730a3",
      };
    }
  };

  const { status, icon, bgColor, textColor } = getStatusInfo();

  // Get active calls from context
  const { activeCalls } = useGroupContext();
  const [hasActiveCall, setHasActiveCall] = useState(false);

  useEffect(() => {
    if (!groupID || !activeCalls) {
      setHasActiveCall(false);
      return;
    }

    // Check if there's an active call for this group
    const activeCallForGroup = activeCalls.find(
      (call) => call.groupId === groupID
    );
    setHasActiveCall(!!activeCallForGroup);
  }, [groupID, activeCalls]);

  const displayStatus = hasActiveCall ? "live" : status;
  const displayBgColor = hasActiveCall ? "#fee2e2" : bgColor;
  const displayTextColor = hasActiveCall ? "#dc2626" : textColor;

  const callTypeIcon = (
    <Ionicons
      name={type === "video" ? "videocam" : "call"}
      size={18}
      color="#3b82f6"
    />
  );

  const getSessionTypeText = () => {
    return type === "video" ? "Video Study Session" : "Audio Study Session";
  };

  return (
    <View className="mx-3 my-3 border border-secondary/50 rounded-2xl">
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => router.push({
          pathname: '/(groups)/[groupId]/live',
          params: {
            groupId: groupID,
            link: groupLink,
            isDeepLink: true,
            groupName: groupName,
          } as any,
        })}
      >
        <View
          className="bg-white rounded-2xl p-4"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
            elevation: 6,
          }}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <View className="bg-blue-50 rounded-xl p-2 mr-3">
                {callTypeIcon}
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 font-bold" numberOfLines={1}>
                  {title || getSessionTypeText()}
                </Text>
                <Text className="text-gray-500 text-xs" numberOfLines={1}>
                  {groupName}
                </Text>
              </View>
            </View>
            <View
              className="rounded-full px-2 py-1 ml-2"
              style={{ backgroundColor: displayBgColor }}
            >
              <Text
                className="text-[10px] font-bold uppercase"
                style={{ color: displayTextColor }}
              >
                {displayStatus}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center justify-between mt-3">
            <View className="flex-row items-center">
              <Time width={16} height={16} />
              <Text className="text-gray-600 text-xs ml-2">
                {formatDateTime()}
              </Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons
                name={
                  hasActiveCall
                    ? "radio-button-on"
                    : type === "video"
                    ? "videocam"
                    : "call"
                }
                size={16}
                color="#3b82f6"
              />
              <Text className="text-primary font-bold text-xs ml-1">
                {hasActiveCall ? "Join Now" : "Join"}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default memo(ScheduledCard);
