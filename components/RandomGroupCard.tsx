import { useGroupContext } from "@/store/GroupContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { doc, onSnapshot } from "firebase/firestore";
import { memo, useEffect, useState } from "react";
import { ColorValue, Image, Text, TouchableOpacity, View } from "react-native";
import avatars from "../assets/images/avatars";
import groupImages from "../assets/images/group_images";
import { db } from "../services/firebase";

interface GroupCardProps {
  group: {
    id: string;
    name: string;
    description?: string;
    createdBy: string;
    members: string[];
    imageUrl?: string;
    type?: string;
    isPrivate?: boolean;
    profileImage?: string;
    userName?: string;
  };
  groupType: string;
  userId: string | undefined;
}

const SimpleGroupCard = memo(function SimpleGroupCard({
  group,
  groupType,
}: GroupCardProps) {
  // Fallbacks for images
  const groupImage =
    group.imageUrl && groupImages[group.imageUrl as keyof typeof groupImages]
      ? groupImages[group.imageUrl as keyof typeof groupImages]
      : groupImages.groupImage8;

  // Firebase logic for creator info
  const [groupCreatorName, setGroupCreatorName] = useState<string>("");
  const [groupCreatorImage, setGroupCreatorImage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [groupId, setGroupId] = useState<string>("");

  // FIrebase logic for group join and send request
  const { sendJoinRequest, joinGroup, user, isJoining, isSendingJoinRequest } =
    useGroupContext();
  const userID = user?.uid.toString();

  useEffect(() => {
    if (!group.createdBy) return;

    const userRef = doc(db, "users", group.createdBy.trim());
    const unsubscribe = onSnapshot(
      userRef,
      (snapShot) => {
        if (snapShot.exists()) {
          setGroupCreatorName(snapShot.data().userName);
          setGroupCreatorImage(snapShot.data().profileImage);
          setGroupId(snapShot.id);
        } else {
          setGroupCreatorName("Unknown Creator");
          setGroupCreatorImage("");
        }
        setIsLoading(false);
      },
      (error) => {
        setGroupCreatorName("Unknown Creator");
        setGroupCreatorImage("");
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [group.createdBy]);

  const creatorAvatar =
    groupCreatorImage && avatars[groupCreatorImage as keyof typeof avatars]
      ? avatars[groupCreatorImage as keyof typeof avatars]
      : avatars.avatar1;

  // In-card confirmation state
  const [showConfirm, setShowConfirm] = useState(false);

  const getGroupTypeColor = () =>
    ["#4facfe", "#00f2fe"] as [ColorValue, ColorValue];

  // Button and confirmation logic
  const isPrivate = group.isPrivate;
  const buttonText = isPrivate ? "Request to join" : "Join Group";
  const confirmTitle = isPrivate ? "Join Private Group" : "Join Group";
  const confirmMessage = isPrivate
    ? `Request to join ${group.name}?`
    : `You are about to join ${group.name}`;
  const confirmButtonText = isPrivate ? "Send Request" : "Join";

  const handleJoinPress = () => {
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    setShowConfirm(false);
    // Firebase join logic will be added here
    if (isPrivate) {
      if (!userID) return;
      sendJoinRequest(group.id, userID); // this awaits
      if (!isSendingJoinRequest) {
        // Group ID for navigation
        router.push({
          pathname: "/(groups)/[groupId]",
          params: {
            groupId: group.id,
            groupName: group.name,
          },
        });
      }
    } else {
      joinGroup(group.id);
      if (!isJoining) {
        router.push({
          pathname: "/(groups)/[groupId]",
          params: {
            groupId: group.id,
            groupName: group.name,
          },
        });
      }
    }
  };

  const handleCancel = () => {
    setShowConfirm(false);
  };

  return (
    <View className="items-center px-4 mb-4">
      <View
        className="bg-white rounded-3xl overflow-hidden"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.12,
          shadowRadius: 16,
          elevation: 12,
          maxWidth: 400,
          width: "100%",
        }}
      >
        {/* Header Image with Overlay */}
        <View className="relative h-52">
          <Image
            source={groupImage}
            className="w-full h-full"
            resizeMode="cover"
          />
          <LinearGradient
            colors={
              ["transparent", "rgba(0,0,0,0.8)"] as [ColorValue, ColorValue]
            }
            className="absolute bottom-0 left-0 right-0 h-32"
          />
          {/* Group Type Badge */}
          <View className="absolute top-4 right-4">
            <LinearGradient
              colors={getGroupTypeColor()}
              className="px-4 py-2 rounded-full"
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View className="flex-row items-center">
                <Text className="text-white text-sm mr-1">🎓</Text>
                <Text className="text-white text-xs font-bold">Join</Text>
              </View>
            </LinearGradient>
          </View>
          {/* Group Name Overlay */}
          <View className="absolute bottom-4 left-4 right-4">
            <Text
              className="text-white font-bold text-xl mb-1"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {group.name}
            </Text>
            <Text className="text-white/80 text-sm">
              {groupType || "Study Group"}
            </Text>
          </View>
        </View>
        {/* Content Section */}
        <View className="p-5">
          {/* Creator Info */}
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center flex-1">
              {isLoading ? (
                <View className="w-12 h-12 bg-gray-200 rounded-full mr-4 animate-pulse" />
              ) : (
                <View className="relative mr-4">
                  <Image
                    source={creatorAvatar}
                    className="w-12 h-12 rounded-full border-3 border-white"
                    resizeMode="cover"
                  />
                </View>
              )}
              <View className="flex-1">
                <Text className="font-bold text-gray-800 text-base mb-1">
                  {isLoading ? "Loading..." : groupCreatorName}
                </Text>
                <Text className="text-gray-500 text-sm font-medium">
                  Group Creator
                </Text>
              </View>
            </View>
            {/* Member Count Badge */}
            <View className="bg-blue-50 rounded-full px-4 py-2 border border-blue-100">
              <View className="flex-row items-center">
                <View className="w-6 h-6 bg-blue-100 rounded-full items-center justify-center mr-2">
                  <Ionicons name="people" size={14} color="#3b82f6" />
                </View>
                <Text className="text-blue-600 font-bold text-sm">
                  {group.members?.length || 0}
                </Text>
              </View>
            </View>
          </View>
          {/* Description */}
          <View className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-4 mb-4 border border-gray-100">
            <Text
              className="text-gray-700 text-sm leading-5"
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {group.description || "No description available for this group."}
            </Text>
          </View>
          {/* Action Section */}
          <View className="flex-row items-center justify-between pt-4 border-t border-gray-100">
            <View className="flex-row items-center">
              <View className="flex-row items-center">
                <View className="w-8 h-8 bg-green-100 rounded-full items-center justify-center mr-3">
                  <Ionicons name="school" size={16} color="#22c55e" />
                </View>
                <Text className="text-gray-600 text-sm font-semibold">
                  {groupType || "Study Group"}
                </Text>
              </View>
            </View>
            {/* Group Button or Confirmation UI */}
            <View className="flex-row items-center">
              {showConfirm ? (
                <View className="w-full -mx-10 bg-white rounded-xl border border-blue-200 px-4 py-5 shadow-md flex-col items-center justify-center">
                  <Text className="font-bold text-base mb-1 text-center">
                    {confirmTitle}
                  </Text>
                  <Text className="text-gray-700 text-sm mb-4 text-center">
                    {confirmMessage}
                  </Text>
                  <View className="flex-row justify-center items-center gap-3">
                    <TouchableOpacity
                      onPress={handleConfirm}
                      className="bg-blue-500 rounded-lg px-4 py-2 mx-2"
                    >
                      <Text className="text-white font-semibold text-sm">
                        {confirmButtonText}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleCancel}
                      className="bg-gray-100 rounded-lg px-4 py-2 mx-2"
                    >
                      <Text className="text-gray-700 font-semibold text-sm">
                        Cancel
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={handleJoinPress}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={getGroupTypeColor()}
                    className="rounded-full px-5 py-3"
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <View className="flex-row items-center">
                      <Ionicons
                        name="add"
                        size={16}
                        color="white"
                        style={{ marginRight: 4 }}
                      />
                      <Text className="text-white font-bold text-sm">
                        {buttonText}
                      </Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </View>
    </View>
  );
});

export default SimpleGroupCard;
