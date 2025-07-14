import Group from "@/assets/icons/groupUsers.svg";
import Clock from "@/assets/icons/time_blue.svg";
import avatars from "@/assets/images/avatars";
import { db } from "@/services/firebase";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Timestamp, doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Dimensions, Image, Text, TouchableOpacity, View } from "react-native";

interface PostCardProps {
  post: string;
  groupId: string;
  timeSent?: Timestamp | null;
  userName?: string;
  userAvatar?: string;
}

interface Avatar {
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

const { width } = Dimensions.get("window");

const PostCard = ({
  post,
  groupId,
  timeSent,
  userName,
  userAvatar,
}: PostCardProps) => {
  const [groupName, setGroupName] = useState<string>("Loading...");
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [likeCount, setLikeCount] = useState<number>(0);

  useEffect(() => {
    const fetchGroupName = async () => {
      if (!groupId) {
        setGroupName("Unknown Group");
        return;
      }

      try {
        const groupDoc = await getDoc(doc(db, "groups", groupId));
        if (groupDoc.exists()) {
          setGroupName(groupDoc.data().name || "Unnamed Group");
        } else {
          setGroupName("Unknown Group");
        }
      } catch (error) {
        console.error("Error fetching group name:", error);
        setGroupName("Error loading group");
      }
    };

    fetchGroupName();
  }, [groupId]);

  const formatDateTime = (timestamp: Timestamp | null | undefined) => {
    if (!timestamp) return { date: "", time: "" };

    const date = timestamp.toDate();
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Show relative time for recent posts
    if (diffDays === 1) {
      return {
        date: "Yesterday",
        time: date.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
      };
    } else if (diffDays < 7) {
      return {
        date: date.toLocaleDateString("en-US", { weekday: "long" }),
        time: date.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
      };
    } else {
      return {
        date: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        time: date.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
      };
    }
  };

  const { date, time } = formatDateTime(timeSent);
  const shouldTruncate = post.length > 120;
  const displayText =
    shouldTruncate && !isExpanded ? post.slice(0, 120) + "..." : post;

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
  };

  return (
    <View className="mx-4 my-3">
      {/* Enhanced Main Card Container */}
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
        {/* Enhanced Header with Gradient */}
        <LinearGradient
          colors={["#667eea", "#764ba2"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="px-6 py-5"
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <View className="bg-white/25 rounded-2xl p-3 mr-4 backdrop-blur-sm">
                <Group width={24} height={24} />
              </View>
              <Text
                className="text-white font-bold text-lg flex-1"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {groupName}
              </Text>
            </View>

            {/* Enhanced Time Badge */}
            <View className="bg-white/25 rounded-full px-4 py-2 flex-row items-center backdrop-blur-sm">
              <Clock width={16} height={16} />
              <Text className="text-white text-sm ml-2 font-semibold">
                {time}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Enhanced Content Section */}
        <View className="p-6">
          {/* Enhanced User Info */}
          <View className="flex-row items-center mb-5">
            <View
              className="relative"
              style={{
                shadowColor: "#667eea",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 6,
              }}
            >
              <Image
                source={
                  userAvatar
                    ? avatars[userAvatar as keyof Avatar]
                    : avatars.avatar1
                }
                className="w-14 h-14 rounded-full border-3 border-white"
                onError={(e) =>
                  console.log("Failed to load avatar:", e.nativeEvent.error)
                }
              />
              {/* Enhanced Online Status Indicator */}
              <View className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-3 border-white shadow-sm" />
            </View>

            <View className="ml-4 flex-1">
              <Text className="font-bold text-gray-800 text-lg mb-1">
                {userName || "Anonymous"}
              </Text>
              <Text className="text-gray-500 text-sm font-medium">{date}</Text>
            </View>
          </View>

          {/* Enhanced Post Content */}
          <View className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-5 mb-4 border border-gray-100">
            <Text className="text-gray-700 text-base leading-7 font-normal">
              {displayText}
            </Text>

            {shouldTruncate && (
              <TouchableOpacity
                onPress={() => setIsExpanded(!isExpanded)}
                className="mt-3"
              >
                <Text className="text-purple-600 font-bold text-sm">
                  {isExpanded ? "Show Less" : "Read More"}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Enhanced Interaction Bar */}
          <View className="flex-row items-center justify-between pt-4 border-t border-gray-100">
            <View className="flex-row items-center space-x-6">
              <TouchableOpacity
                className="flex-row items-center"
                onPress={handleLike}
              >
                <View
                  className={`w-10 h-10 rounded-full items-center justify-center mr-2 ${
                    isLiked ? "bg-red-100" : "bg-gray-100"
                  }`}
                >
                  <Ionicons
                    name={isLiked ? "heart" : "heart-outline"}
                    size={20}
                    color={isLiked ? "#ef4444" : "#6b7280"}
                  />
                </View>
                <Text
                  className={`text-sm font-semibold ${
                    isLiked ? "text-red-600" : "text-gray-600"
                  }`}
                >
                  {likeCount > 0 ? likeCount : ""} Like
                </Text>
              </TouchableOpacity>

              <TouchableOpacity className="flex-row items-center">
                <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-2">
                  <Ionicons
                    name="chatbubble-outline"
                    size={18}
                    color="#3b82f6"
                  />
                </View>
                <Text className="text-gray-600 text-sm font-semibold">
                  Reply
                </Text>
              </TouchableOpacity>

              <TouchableOpacity className="flex-row items-center">
                <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center mr-2">
                  <Ionicons name="share-outline" size={18} color="#22c55e" />
                </View>
                <Text className="text-gray-600 text-sm font-semibold">
                  Share
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity>
              <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center">
                <Ionicons
                  name="ellipsis-horizontal"
                  size={18}
                  color="#6b7280"
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

export default PostCard;
