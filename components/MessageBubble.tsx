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
  messageTimeSent: Timestamp | { seconds: number; nanoseconds: number };
  isSelf: boolean;
  isAdmin: boolean;
  isMod: boolean;
  userAvatar: string;
  userName: string;
  type: "question" | "response";
  purpose?: string;
};

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  messageTimeSent,
  userAvatar,
  userName,
  isAdmin,
  isMod,
  isSelf,
  type = "question",
  purpose = "",
}) => {
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

  const avatarImage =
    userAvatar && avatars[userAvatar as keyof Avatars]
      ? avatars[userAvatar as keyof Avatars]
      : avatars.avatar6;

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
          <Text className="text-xs text-gray-500 ml-2">
            {formatTime(messageTimeSent)}
          </Text>
        </View>

        {/* Bubble Box */}
        <View
          className={`rounded-2xl p-3 ${
            isSelf
              ? type === "question"
                ? "bg-blue-500 rounded-tr-none"
                : "bg-blue-200 rounded-tr-none"
              : type === "question"
              ? "bg-gray-100 rounded-tl-none"
              : "bg-white border border-gray-200 rounded-tl-none"
          }`}
        >
          {/* Question Label */}
          {type === "question" && (
            <View className="flex-row items-center mb-1">
              <Ionicons
                name="help-circle-outline"
                size={16}
                color={isSelf ? "rgba(255,255,255,0.8)" : Colors.primary}
              />
              <Text
                className={`text-sm ml-1 ${
                  isSelf ? "text-white/80" : "text-blue-600"
                }`}
              >
                Question
              </Text>
            </View>
          )}

          {/* Message Text */}
          <Text
            className={`text-base ${isSelf ? "text-white" : "text-gray-800"}`}
          >
            {message}
          </Text>

          {/* Response Actions */}
          {type === "response" && (
            <View className="flex-row mt-2 border-t border-gray-100 pt-2">
              <TouchableOpacity className="flex-row items-center mr-4">
                <Ionicons name="thumbs-up-outline" size={16} color="#666" />
                <Text className="text-gray-600 text-sm ml-1">Helpful</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-row items-center">
                <Ionicons
                  name="chatbubble-ellipses-outline"
                  size={16}
                  color="#666"
                />
                <Text className="text-gray-600 text-sm ml-1">Reply</Text>
              </TouchableOpacity>
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
