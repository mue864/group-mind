import avatars from "@/assets/images/avatars";
import groupImages from "@/assets/images/group_images";
import { db } from "@/services/firebase";
import { useGroupContext } from "@/store/GroupContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { memo, useEffect, useState } from "react";
import { Dimensions, Image, Text, TouchableOpacity, View } from "react-native";

const { width: screenWidth } = Dimensions.get("window");

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
    return isCreator ? ["#667eea", "#764ba2"] : ["#4facfe", "#00f2fe"];
  };

  // Calculate responsive card width
  const cardWidth = Math.min(screenWidth - 32, 400); // Max width of 400px, min margin of 16px on each side

  return (
    <TouchableOpacity
      onPress={handleGroupPress}
      className="mb-6"
      activeOpacity={0.95}
      style={{ width: cardWidth }}
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
        {/* Enhanced Header Image with Overlay */}
        <View className="relative h-52">
          <Image
            source={
              imageUrl
                ? groupImages[imageUrl as keyof GroupCardImages]
                : groupImages.groupImage8
            }
            className="w-full h-full"
            resizeMode="cover"
          />

          {/* Enhanced Gradient Overlay */}
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.8)"]}
            className="absolute bottom-0 left-0 right-0 h-32"
          />

          {/* Enhanced Group Type Badge */}
          <View className="absolute top-4 right-4">
            <LinearGradient
              colors={getGroupTypeColor()}
              className="px-4 py-2 rounded-full"
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View className="flex-row items-center">
                <Text className="text-white text-sm mr-1">
                  {isCreator ? "👑" : "🎓"}
                </Text>
                <Text className="text-white text-xs font-bold">
                  {isCreator ? "Your Group" : "Joined"}
                </Text>
              </View>
            </LinearGradient>
          </View>

          {/* Enhanced Group Name Overlay */}
          <View className="absolute bottom-4 left-4 right-4">
            <Text
              className="text-white font-bold text-xl mb-1"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {name}
            </Text>
            <Text className="text-white/80 text-sm">Study Group</Text>
          </View>
        </View>

        {/* Enhanced Content Section */}
        <View className="p-5">
          {/* Enhanced Creator Info */}
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center flex-1">
              {isLoading ? (
                <View className="w-12 h-12 bg-gray-200 rounded-full mr-4 animate-pulse" />
              ) : (
                <View className="relative mr-4">
                  <View
                    style={{
                      shadowColor: "#667eea",
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 8,
                      elevation: 6,
                      borderRadius: 24,
                    }}
                  >
                    <Image
                      source={
                        groupCreatorImage
                          ? avatars[groupCreatorImage as keyof Avatars]
                          : avatars.avatar1
                      }
                      className="w-12 h-12 rounded-full border-3 border-white"
                      resizeMode="cover"
                    />
                  </View>
                  {isCreator && (
                    <View className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full border-3 border-white items-center justify-center shadow-sm">
                      <Text className="text-xs font-bold">👑</Text>
                    </View>
                  )}
                </View>
              )}

              <View className="flex-1">
                <Text className="font-bold text-gray-800 text-base mb-1">
                  {isLoading
                    ? "Loading..."
                    : groupCreatorName || "Unknown Creator"}
                </Text>
                <Text className="text-gray-500 text-sm font-medium">
                  Group Creator
                </Text>
              </View>
            </View>

            {/* Enhanced Member Count Badge */}
            <View className="bg-blue-50 rounded-full px-4 py-2 border border-blue-100">
              <View className="flex-row items-center">
                <View className="w-6 h-6 bg-blue-100 rounded-full items-center justify-center mr-2">
                  <Ionicons name="people" size={14} color="#3b82f6" />
                </View>
                <Text className="text-blue-600 font-bold text-sm">
                  {members.length}
                </Text>
              </View>
            </View>
          </View>

          {/* Enhanced Description */}
          <View className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-4 mb-4 border border-gray-100">
            <Text
              className="text-gray-700 text-sm leading-5"
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {description || "No description available for this group."}
            </Text>
          </View>

          {/* Enhanced Action Section */}
          <View className="flex-row items-center justify-between pt-4 border-t border-gray-100">
            <View className="flex-row items-center">
              <View className="flex-row items-center">
                <View className="w-8 h-8 bg-green-100 rounded-full items-center justify-center mr-3">
                  <Ionicons name="school" size={16} color="#22c55e" />
                </View>
                <Text className="text-gray-600 text-sm font-semibold">
                  Study Group
                </Text>
              </View>
            </View>

            {/* Enhanced Group Button */}
            <View className="flex-row items-center">
              <LinearGradient
                colors={getGroupTypeColor()}
                className="rounded-full px-5 py-3"
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <View className="flex-row items-center">
                  <Ionicons
                    name={isCreator ? "settings" : "add"}
                    size={16}
                    color="white"
                    style={{ marginRight: 4 }}
                  />
                  <Text className="text-white font-bold text-sm">
                    {isCreator ? "Manage" : "Join Study"}
                  </Text>
                </View>
              </LinearGradient>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default memo(GroupCard);
