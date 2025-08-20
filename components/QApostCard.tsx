import React, { useEffect, useState, useRef } from "react";
import { Text, View, TouchableOpacity, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Comment from "@/assets/icons/comment_duotone.svg";
import Time from "@/assets/icons/time-qa.svg";
import Button from "@/assets/icons/Arrow-Right.svg";
import { router } from "expo-router";
import { db } from "@/services/firebase";
import { getDoc, doc, Timestamp } from "firebase/firestore";

interface QaProps {
  post: string;
  timeSent: Timestamp;
  responseTo: [];
  responseFrom: [];
  postID: string;
  groupID: string | string[];
  isHome?: boolean;
}

function QApostCard({
  post,
  timeSent,
  responseFrom,
  postID,
  groupID,
  isHome,
}: QaProps) {
  let displayTime = "";
  const sentTime = timeSent?.toDate?.() ?? new Date();
  const [cloudGroupName, setCloudGroupName] = useState<string | null>(null);
  const groupNameRef = useRef(cloudGroupName)

  const now = new Date();
  const sentTimeMs = sentTime.getTime();
  const diffMs = now.getTime() - sentTimeMs; // difference in milliseconds
  const diffMin = Math.floor(diffMs / 60000);

  // fetch group name if its from Home page
useEffect(() => {
    const getCloudGroupName = async () => {
      const groupRef = doc(db, "groups", groupID.toString());
      const groupDoc = await getDoc(groupRef);
      if (groupDoc.exists()) {
        const data = groupDoc.data();
        setCloudGroupName(data.name);
        groupNameRef.current = data.name;
      }
      return null;
    };
    getCloudGroupName();
}, [groupID]);

  const delayNavigate = () => {
    const timeout = setTimeout(() => {
      if (isHome) {
        router.push({
          pathname: "/(settings)/(create_post)/(view_post)/[postId]",
          params: {
            postId: postID,
            groupId: groupID,
            passedGroupName: groupNameRef.current,
            isHome: "true",
          },
        });
      } else {
        router.push({
          pathname: "/(settings)/(create_post)/(view_post)/[postId]",
          params: {
            postId: postID,
            groupId: groupID,
          },
        });
    }}, 100);
    return () => clearTimeout(timeout);
  };

  if (diffMin < 1) {
    displayTime = "Just Now";
  } else if (diffMin === 1) {
    displayTime = `${diffMin} min ago`;
  } else if (diffMin < 60) {
    displayTime = `${diffMin} mins ago`;
  } else if (diffMin >= 1440) {
    displayTime = `${Math.floor(diffMin / 1440)} day${diffMin <= 2879 ? "" : "s"} ago`;
  } 
  
  else if (diffMin > 60) {
    const diffHours = Math.floor(diffMin / 60);
    displayTime = `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  }

  const responseCount = responseFrom?.length || 0;
  const hasResponses = responseCount > 0;


  return (
    <View className="mx-3">
      <TouchableOpacity
        activeOpacity={0.95}
        onPress={delayNavigate}
        style={{
          // ios shadows
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 3,
        }}
      >
        <View
          className="bg-white rounded-2xl overflow-hidden border border-secondary/50"
          style={{
            // android shadows
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
                    className="text-gray-800 font-poppins-semiBold text-base leading-6"
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
                      shadowOffset: { width: 0, height: 5 },
                      shadowOpacity: 0.2,
                      shadowRadius: 3,
                      elevation: 3,
                    }}
                  >
                    <Button width={20} height={20} />
                  </View>
                </View>
              </View>
            </View>

            {/* Meta Information Bar */}
            <View className="flex-row items-center justify-between mb-2">
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
                    className={`font-poppins font-medium text-sm ${
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
                <Text className="text-gray-500 font-medium font-poppins text-sm">
                  {displayTime}
                </Text>
              </View>
            </View>

            <View className="flex-row justify-between border-t border-gray-100">
              {/* Status Indicator */}
              {hasResponses && (
                <View className="mt-3 pt-3">
                  <View className="flex-row items-center">
                    <View className="rounded-full px-3 py-1 bg-green-600">
                      <Text
                        className={` ${
                          Platform.OS === "ios" ? "p-1" : ""
                        } text-white font-poppins font-semibold text-xs`}
                      >
                        ✓ Answered
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {!hasResponses && (
                <View className="mt-3 pt-3">
                  <View className="flex-row items-center">
                    <View className="rounded-full px-3 py-1 bg-orange-400">
                      <Text
                        className={` ${
                          Platform.OS === "ios" ? "p-1" : ""
                        } text-white font-semibold text-xs font-poppins`}
                      >
                        🤔 Awaiting Answer
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {cloudGroupName && isHome ? (
                <View className="mt-3 pt-3">
                  <View className="flex-row items-center">
                    <View className="rounded-full px-3 py-1 bg-secondary">
                      <Text className="text-white font-poppins font-semibold text-xs">
                        {cloudGroupName}
                      </Text>
                    </View>
                  </View>
                </View>
              ) : null}
            </View>
          </View>

          {/* Hover Effect Gradient */}
          <LinearGradient
            colors={["transparent", "rgba(79, 172, 254, 0.02)"]}
            className="absolute bottom-0 left-0 right-0 h-2"
          />
        </View>
      </TouchableOpacity>

      {/* Separator */}
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
