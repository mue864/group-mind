import { Timestamp } from "firebase/firestore";
import React from "react";
import { Text, View, Dimensions, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Comment from "@/assets/icons/comment_duotone.svg";
import Time from "@/assets/icons/time-qa.svg";
import HR from "@/assets/icons/hr.svg";
import Button from "@/assets/icons/Arrow-Right.svg";
import { router } from "expo-router";

interface QaProps {
  post: string;
  timeSent: Timestamp;
  responseTo: [];
  responseFrom: [];
  postID: string;
  groupID: string | string[];
}

function QApostCard({
  post,
  timeSent,
  responseTo,
  responseFrom,
  postID,
  groupID,
}: QaProps) {
  let displayTime = "";
  const deviceWidth = Dimensions.get("window").width;
  const sentTime = timeSent?.toDate?.() ?? new Date();

  const now = new Date();
  const sentTimeMs = sentTime.getTime();
  const diffMs = now.getTime() - sentTimeMs; // difference in milliseconds
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) {
    displayTime = "Just Now";
  } else if (diffMin === 1) {
    displayTime = `${diffMin} min ago`;
  } else if (diffMin < 60) {
    displayTime = `${diffMin} mins ago`;
  } else {
    const diffHours = Math.floor(diffMin / 60);
    displayTime = `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  }

  const responseCount = responseFrom?.length || 0;
  const hasResponses = responseCount > 0;

  return (
    <View className="mx-3 mb-4">
      <TouchableOpacity
        activeOpacity={0.95}
        onPress={() =>
          router.push({
            pathname: "/(settings)/(create_post)/(view_post)/[postId]",
            params: {
              postId: postID,
              groupId: groupID,
            },
          })
        }
      >
        <View
          className="bg-white rounded-2xl overflow-hidden"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          {/* Main Content Container */}
          <View className="p-4">
            {/* Question Content */}
            <View className="mb-4">
              <View className="flex-row items-start justify-between">
                <View className="flex-1 pr-3">
                  <Text
                    className="text-gray-800 font-semibold text-base leading-6"
                    numberOfLines={3}
                    ellipsizeMode="tail"
                  >
                    {post}
                  </Text>
                </View>

                {/* Action Button */}
                <View className="ml-2 mt-1">
                  <View
                    className="w-10 h-10 bg-blue-50 rounded-full items-center justify-center"
                    style={{
                      shadowColor: "#4facfe",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.15,
                      shadowRadius: 4,
                      elevation: 3,
                    }}
                  >
                    <Button width={20} height={20} />
                  </View>
                </View>
              </View>
            </View>

            {/* Meta Information Bar */}
            <View className="flex-row items-center justify-between">
              {/* Left Side - Stats */}
              <View className="flex-row items-center space-x-4">
                {/* Comment Count */}
                <View className="flex-row items-center">
                  <View
                    className={`w-8 h-8 rounded-full items-center justify-center mr-2 ${
                      hasResponses ? "bg-green-50" : "bg-gray-50"
                    }`}
                  >
                    <Comment width={16} height={16} />
                  </View>
                  <Text
                    className={`font-medium text-sm ${
                      hasResponses ? "text-green-600" : "text-gray-500"
                    }`}
                  >
                    {responseCount} {responseCount <= 1 ? "Answer" : "Answers"}
                  </Text>
                </View>
              </View>

              {/* Right Side - Time */}
              <View className="flex-row items-center">
                <View className="w-6 h-6 bg-blue-50 rounded-full items-center justify-center mr-2">
                  <Time width={14} height={14} />
                </View>
                <Text className="text-gray-500 font-medium text-sm">
                  {displayTime}
                </Text>
              </View>
            </View>

            {/* Status Indicator */}
            {hasResponses && (
              <View className="mt-3 pt-3 border-t border-gray-100">
                <View className="flex-row items-center">
                  <LinearGradient
                    colors={["#10B981", "#059669"]}
                    className="rounded-full px-3 py-1"
                  >
                    <Text className="text-white font-semibold text-xs">
                      ✓ Answered
                    </Text>
                  </LinearGradient>
                </View>
              </View>
            )}

            {!hasResponses && (
              <View className="mt-3 pt-3 border-t border-gray-100">
                <View className="flex-row items-center">
                  <LinearGradient
                    colors={["#F59E0B", "#D97706"]}
                    className="rounded-full px-3 py-1"
                  >
                    <Text className="text-white font-semibold text-xs">
                      🤔 Awaiting Answer
                    </Text>
                  </LinearGradient>
                </View>
              </View>
            )}
          </View>

          {/* Hover Effect Gradient */}
          <LinearGradient
            colors={["transparent", "rgba(79, 172, 254, 0.02)"]}
            className="absolute bottom-0 left-0 right-0 h-2"
          />
        </View>
      </TouchableOpacity>

      {/* Modern Separator */}
      <View className="mt-4 mx-4">
        <LinearGradient
          colors={["transparent", "#E5E7EB", "transparent"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="h-px"
        />
      </View>
    </View>
  );
}

export default QApostCard;
