import avatars from "@/assets/images/avatars";
import groupImages from "@/assets/images/group_images";
import { db } from "@/services/firebase";
import { useGroupContext } from "@/store/GroupContext";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { memo, useEffect, useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

interface GroupCardProps {
  id: string;
  imageUrl: string;
  members: string[];
  description: string;
  name: string;
  createdBy: string;
  groupType: string;
}

interface GroupCardImages {
  groupImage1: string;
  groupImage2: string;
  groupImage3: string;
  groupImage4: string;
  groupImage5: string;
  groupImage6: string;
  groupImage7: string;
  groupImage8: string;
  groupImage9: string;
  groupImage10: string;
  groupImage11: string;
}

interface Avatars {
  avatar1: string;
  avatar2: string;
  avatar3: string;
  avatar4: string;
  avatar5: string;
  avatar6: string;
  avatar7: string;
  avatar8: string;
  avatar9: string;
}

const GroupCard = ({
  id,
  imageUrl,
  description,
  members,
  createdBy,
  name,
  groupType,
}: GroupCardProps) => {
  const { user } = useGroupContext();
  const [groupCreatorName, setGroupCreatorName] = useState("");
  const [groupCreatorImage, setGroupCreatorImage] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  const isCreator = user?.uid === createdBy;
  const router = useRouter();

  useEffect(() => {
    const retrieveCreatorImage = async () => {
      setIsLoading(true);
      try {
        const userRef = doc(db, "users", createdBy.trim());
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          setGroupCreatorName(userDoc.data().userName);
          setGroupCreatorImage(userDoc.data().profileImage);
        } else {
          console.log("User not found");
        }
      } catch (error) {
        console.error("Error fetching creator data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    retrieveCreatorImage();
  }, [createdBy]);

  const handleGroupPress = () => {
    router.push({
      pathname: `/(groups)/[groupId]`,
      params: {
        groupId: id,
        groupName: name,
      },
    });
  };

  const getMemberCountText = () => {
    const count = members.length;
    return count === 1 ? "1 Member" : `${count} Members`;
  };

  const getGroupTypeColor = () => {
    return isCreator ? ["#667eea", "#764ba2"] : ["#f093fb", "#f5576c"];
  };

  return (
    <TouchableOpacity
      onPress={handleGroupPress}
      className="mx-3 mb-4 w-96"
      activeOpacity={0.95}
    >
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
        {/* Header Image with Overlay */}
        <View className="relative h-48">
          <Image
            source={
              imageUrl
                ? groupImages[imageUrl as keyof GroupCardImages]
                : groupImages.groupImage8
            }
            className="w-full h-full"
            resizeMode="cover"
          />

          {/* Gradient Overlay */}
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.7)"]}
            className="absolute bottom-0 left-0 right-0 h-24"
          />

          {/* Group Type Badge */}
          <View className="absolute top-4 right-4">
            <LinearGradient
              colors={getGroupTypeColor()}
              className="px-3 py-1 rounded-full"
            >
              <Text className="text-white text-xs font-semibold">
                {isCreator ? "👑 Your Group" : "🎓 Joined"}
              </Text>
            </LinearGradient>
          </View>

          {/* Group Name Overlay */}
          <View className="absolute bottom-3 left-3 right-3">
            <Text
              className="text-white font-bold text-lg"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {name}
            </Text>
          </View>
        </View>

        {/* Content Section */}
        <View className="p-4">
          {/* Creator Info */}
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center flex-1">
              {isLoading ? (
                <View className="w-10 h-10 bg-gray-200 rounded-full mr-3 animate-pulse" />
              ) : (
                <View className="relative">
                  <View
                    style={{
                      shadowColor: "#667eea",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.2,
                      shadowRadius: 4,
                      elevation: 4,
                      borderRadius: 20,
                    }}
                  >
                    <Image
                      source={
                        groupCreatorImage
                          ? avatars[groupCreatorImage as keyof Avatars]
                          : avatars.avatar1
                      }
                      className="w-10 h-10 rounded-full border-2 border-white"
                      resizeMode="cover"
                    />
                  </View>
                  {isCreator && (
                    <View className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full border-2 border-white items-center justify-center">
                      <Text className="text-xs">👑</Text>
                    </View>
                  )}
                </View>
              )}

              <View className="flex-1">
                <Text className="font-semibold text-gray-800 text-sm">
                  {isLoading
                    ? "Loading..."
                    : groupCreatorName || "Unknown Creator"}
                </Text>
                <Text className="text-gray-500 text-xs">Group Creator</Text>
              </View>
            </View>

            {/* Member Count Badge */}
            <View className="bg-blue-50 rounded-full px-3 py-1">
              <View className="flex-row items-center">
                <View className="w-5 h-5 bg-blue-100 rounded-full items-center justify-center mr-1">
                  <Text className="text-blue-600 text-xs font-bold">
                    {members.length}
                  </Text>
                </View>
                <Text className="text-blue-600 font-semibold text-xs">
                  {members.length === 1 ? "Member" : "Members"}
                </Text>
              </View>
            </View>
          </View>

          {/* Description */}
          <View className="bg-gray-50 rounded-xl p-3 mb-3">
            <Text
              className="text-gray-700 text-sm leading-4"
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {description || "No description available for this group."}
            </Text>
          </View>

          {/* Action Section */}
          <View className="flex-row items-center justify-between pt-2 border-t border-gray-100">
            <View className="flex-row items-center">
              <View className="flex-row items-center">
                <View className="w-6 h-6 bg-green-50 rounded-full items-center justify-center mr-2">
                  <Text className="text-green-600 text-xs">📚</Text>
                </View>
                <Text className="text-gray-600 text-xs font-medium">
                  Study Group
                </Text>
              </View>
            </View>

            {/* Enhanced Group Button */}
            <View className="flex-row items-center">
              <LinearGradient
                colors={
                  isCreator ? ["#667eea", "#764ba2"] : ["#4facfe", "#00f2fe"]
                }
                className="rounded-full px-4 py-2"
              >
                <Text className="text-white font-semibold text-xs">
                  {isCreator ? "Manage" : "Join Study"}
                </Text>
              </LinearGradient>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default memo(GroupCard);
