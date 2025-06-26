import { memo, useEffect, useState } from "react";
import { Image, Text, TouchableOpacity, View, ColorValue } from "react-native";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import avatars from "@/assets/images/avatars";
import groupImages from "@/assets/images/group_images";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

interface GroupCardProps {
  group: {
    id: string;
    name: string;
    description?: string;
    createdBy: string;
    members: string[];
    imageUrl?: string;
    type?: string;
  };
  groupType: string;
  userId: string;
}

type GradientColors = [ColorValue, ColorValue, ...ColorValue[]];

interface GroupImages {
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

const RandomGroupCard = memo(function RandomGroupCard({
  group,
  groupType,
  userId,
}: GroupCardProps) {
  const [groupCreatorName, setGroupCreatorName] = useState("");
  const [groupCreatorImage, setGroupCreatorImage] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  const { id, name, description, members = [], imageUrl, createdBy } = group;
  const isCreator = createdBy === userId;

  useEffect(() => {
    const fetchGroupCreator = async () => {
      try {
        setIsLoading(true);
        const userRef = doc(db, "users", group.createdBy.trim());
        const snapShot = await getDoc(userRef);

        if (snapShot.exists()) {
          setGroupCreatorName(snapShot.data().userName);
          setGroupCreatorImage(snapShot.data().profileImage);
        }
      } catch (error) {
        console.error("Error fetching group creator:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGroupCreator();
  }, [group.createdBy]);

  const handleGroupPress = () => {
    router.push(`/group/${id}`);
  };

  const getGroupTypeColor = (): GradientColors => {
    if (isCreator) {
      return ["#667eea" as ColorValue, "#764ba2" as ColorValue];
    }
    return ["#4facfe" as ColorValue, "#00f2fe" as ColorValue];
  };

  return (
    <View className="items-center px-4 mb-4">
      <TouchableOpacity
        onPress={handleGroupPress}
        className="w-full max-w-md"
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
                imageUrl && groupImages[imageUrl as keyof typeof groupImages]
                  ? groupImages[imageUrl as keyof typeof groupImages]
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
                  <View
                    className="relative mr-3"
                    style={{
                      shadowColor: "#667eea",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.2,
                      shadowRadius: 4,
                      elevation: 4,
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
                      {members?.length || 0}
                    </Text>
                  </View>
                  <Text className="text-blue-600 font-semibold text-xs">
                    {!members || members.length <= 1 ? "Member" : "Members"}
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
                    {groupType || "Study Group"}
                  </Text>
                </View>
              </View>

              {/* Enhanced Group Button */}
              <View className="flex-row items-center">
                <LinearGradient
                  colors={getGroupTypeColor()}
                  className="rounded-full px-4 py-2"
                >
                  <Text className="text-white font-semibold text-xs">
                    {isCreator ? "Manage" : `Join ${groupType || "Study"}`}
                  </Text>
                </LinearGradient>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
});

export default RandomGroupCard;
