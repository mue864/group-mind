import avatars from "@/assets/images/avatars";
import { Colors } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import { Timestamp } from "firebase/firestore";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

type Avatars = {
  avatar1: string;
  avatar2: string;
  avatar3: string;
  avatar4: string;
  avatar5: string;
  avatar6: string;
  avatar7: string;
  avatar8: string;
  avatar9: string;
};

interface MessageBubbleProps {
  message: string;
  timeSent?: Timestamp | { seconds: number; nanoseconds: number };
  messageTimeSent?: Timestamp | { seconds: number; nanoseconds: number }; // Keep for backward compatibility
  isSelf: boolean;
  isAdmin: boolean;
  isMod: boolean;
  imageUrl?: string;
  userAvatar?: string; // Keep for backward compatibility
  userName: string;
  type: "message" | "question" | "response";
  purpose?: string;
  onReply?: (messageId?: string) => void;
  onHelpful?: (messageId?: string) => void;
  messageId?: string;
  responseCount?: number;
  isHelpful?: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  timeSent,
  messageTimeSent, // Fallback for backward compatibility
  imageUrl,
  userAvatar, // Fallback for backward compatibility
  userName,
  isAdmin,
  isMod,
  isSelf,
  type = "message",
  purpose = "",
  onReply,
  onHelpful,
  messageId,
  responseCount = 0,
  isHelpful = false,
}) => {
  // Use timeSent first, then fall back to messageTimeSent for backward compatibility
  const timestamp = timeSent || messageTimeSent;

  const formatTime = (
    timestamp: Timestamp | { seconds: number; nanoseconds: number }
  ) => {
    const ts =
      "toDate" in timestamp
        ? timestamp
        : new Timestamp(timestamp.seconds, timestamp.nanoseconds);
    const date = ts.toDate();
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Use imageUrl first, then fall back to userAvatar for backward compatibility
  const avatarSource = imageUrl || userAvatar;
  const avatarImage =
    avatarSource && avatars[avatarSource as keyof Avatars]
      ? avatars[avatarSource as keyof Avatars]
      : avatars.avatar6;

  const getBubbleStyle = () => {
    switch (type) {
      case "question":
        return isSelf
          ? "bg-blue-500 rounded-tr-none"
          : "bg-purple-100 border border-purple-200 rounded-tl-none";
      case "response":
        return isSelf
          ? "bg-green-500 rounded-tr-none"
          : "bg-green-50 border border-green-200 rounded-tl-none";
      case "message":
      default:
        return isSelf
          ? "bg-blue-500 rounded-tr-none"
          : "bg-gray-100 border border-gray-200 rounded-tl-none";
    }
  };

  const getTextStyle = () => {
    switch (type) {
      case "question":
        return isSelf ? "text-white" : "text-purple-800";
      case "response":
        return isSelf ? "text-white" : "text-green-800";
      case "message":
      default:
        return isSelf ? "text-white" : "text-gray-800";
    }
  };

  const getTypeIcon = () => {
    switch (type) {
      case "question":
        return "help-circle-outline";
      case "response":
        return "chatbubble-ellipses-outline";
      case "message":
      default:
        return "chatbubble-outline";
    }
  };

  const getTypeLabel = () => {
    switch (type) {
      case "question":
        return "Question";
      case "response":
        return "Response";
      case "message":
      default:
        return null; // Don't show label for regular messages
    }
  };

  const handleReply = () => {
    if (onReply) {
      onReply(messageId);
    }
  };

  const handleHelpful = () => {
    if (onHelpful) {
      onHelpful(messageId);
    }
  };

  return (
    <View
      className={`flex-row my-2 ${
        isSelf ? "justify-end pr-2" : "justify-start pl-2"
      }`}
    >
      {/* Left Avatar */}
      {!isSelf && (
        <Image
          source={avatarImage}
          className="w-9 h-9 rounded-full mr-2"
          resizeMode="cover"
        />
      )}

      {/* Message Bubble */}
      <View className="max-w-[80%]">
        {/* Name + Role + Time */}
        <View
          className={`flex-row items-center mb-1 ${
            isSelf ? "justify-end" : ""
          }`}
        >
          <View className="flex-row items-center">
            <Text className="font-semibold text-sm mr-1.5 text-gray-800">
              {isSelf ? "You" : userName}
            </Text>
            {(isAdmin || isMod) && (
              <View
                className={`px-2 py-0.5 rounded-full ml-1 ${
                  isAdmin ? "bg-blue-100" : "bg-green-100"
                }`}
              >
                <Text
                  className={`text-xs font-medium ${
                    isAdmin ? "text-blue-800" : "text-green-800"
                  }`}
                >
                  {isAdmin ? "Admin" : "Mod"}
                </Text>
              </View>
            )}
          </View>
          {timestamp && (
            <Text className="text-xs text-gray-500 ml-2">
              {formatTime(timestamp)}
            </Text>
          )}
        </View>

        {/* Bubble Box */}
        <View className={`rounded-2xl p-3 ${getBubbleStyle()}`}>
          {/* Type Label (for questions and responses) */}
          {getTypeLabel() && (
            <View className="flex-row items-center mb-2">
              <Ionicons
                name={getTypeIcon() as any}
                size={16}
                color={
                  isSelf
                    ? "rgba(255,255,255,0.8)"
                    : type === "question"
                    ? Colors.primary || "#8B5CF6"
                    : "#059669"
                }
              />
              <Text
                className={`text-sm ml-1 font-medium ${
                  isSelf
                    ? "text-white/80"
                    : type === "question"
                    ? "text-purple-600"
                    : "text-green-600"
                }`}
              >
                {getTypeLabel()}
              </Text>
            </View>
          )}

          {/* Message Text */}
          <Text className={`text-base ${getTextStyle()}`}>{message}</Text>

          {/* Question Actions */}
          {type === "question" && !isSelf && (
            <View className="flex-row mt-3 border-t border-opacity-20 pt-2">
              <TouchableOpacity
                className="flex-row items-center mr-4"
                onPress={handleReply}
              >
                <Ionicons name="chatbubble-outline" size={16} color="#8B5CF6" />
                <Text className="text-purple-600 text-sm ml-1 font-medium">
                  Reply {responseCount > 0 ? `(${responseCount})` : ""}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Response Actions */}
          {type === "response" && !isSelf && (
            <View className="flex-row mt-3 border-t border-opacity-20 pt-2">
              <TouchableOpacity
                className="flex-row items-center mr-4"
                onPress={handleHelpful}
              >
                <Ionicons
                  name={isHelpful ? "thumbs-up" : "thumbs-up-outline"}
                  size={16}
                  color={isHelpful ? "#059669" : "#666"}
                />
                <Text
                  className={`text-sm ml-1 font-medium ${
                    isHelpful ? "text-green-600" : "text-gray-600"
                  }`}
                >
                  {isHelpful ? "Helpful!" : "Helpful"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-row items-center"
                onPress={handleReply}
              >
                <Ionicons
                  name="chatbubble-ellipses-outline"
                  size={16}
                  color="#666"
                />
                <Text className="text-gray-600 text-sm ml-1 font-medium">
                  Reply
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Purpose/Context (if provided) */}
          {purpose && (
            <View className="mt-2 pt-2 border-t border-opacity-20">
              <Text
                className={`text-xs italic ${
                  isSelf ? "text-white/70" : "text-gray-500"
                }`}
              >
                {purpose}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Right Avatar */}
      {isSelf && (
        <Image
          source={avatarImage}
          className="w-9 h-9 rounded-full ml-2"
          resizeMode="cover"
        />
      )}
    </View>
  );
};

export default MessageBubble;
