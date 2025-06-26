import Group from "@/assets/icons/groupUsers.svg";
import Clock from "@/assets/icons/time_blue.svg";
import avatars from "@/assets/images/avatars";
import { db } from "@/services/firebase";
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

  return (
    <View className="mx-4 my-3">
      {/* Main Card Container */}
      <View
        className="bg-white rounded-3xl overflow-hidden"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 8,
        }}
      >
        {/* Header with Gradient */}
        <LinearGradient
          colors={["#667eea", "#764ba2"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="px-5 py-4"
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <View className="bg-white/20 rounded-2xl p-2 mr-3">
                <Group width={24} height={24} />
              </View>
              <Text
                className="text-white font-semibold text-lg flex-1"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {groupName}
              </Text>
            </View>

            {/* Time Badge */}
            <View className="bg-white/20 rounded-full px-3 py-1 flex-row items-center">
              <Clock width={14} height={14} />
              <Text className="text-white text-xs ml-1 font-medium">
                {time}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Content Section */}
        <View className="p-5">
          {/* User Info */}
          <View className="flex-row items-center mb-4">
            <View
              className="relative"
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
                  userAvatar
                    ? avatars[userAvatar as keyof Avatar]
                    : avatars.avatar1
                }
                className="w-12 h-12 rounded-full border-2 border-white"
                onError={(e) =>
                  console.log("Failed to load avatar:", e.nativeEvent.error)
                }
              />
              {/* Online Status Indicator */}
              <View className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white" />
            </View>

            <View className="ml-3 flex-1">
              <Text className="font-semibold text-gray-800 text-base">
                {userName || "Anonymous"}
              </Text>
              <Text className="text-gray-500 text-sm">{date}</Text>
            </View>
          </View>

          {/* Post Content */}
          <View className="bg-gray-50 rounded-2xl p-4 mb-3">
            <Text className="text-gray-700 text-base leading-6 font-normal">
              {displayText}
            </Text>

            {shouldTruncate && (
              <TouchableOpacity
                onPress={() => setIsExpanded(!isExpanded)}
                className="mt-2"
              >
                <Text className="text-purple-600 font-semibold text-sm">
                  {isExpanded ? "Show Less" : "Read More"}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Interaction Bar */}
          <View className="flex-row items-center justify-between pt-2 border-t border-gray-100">
            <View className="flex-row items-center space-x-4">
              <TouchableOpacity className="flex-row items-center">
                <View className="w-8 h-8 bg-blue-50 rounded-full items-center justify-center mr-1">
                  <Text className="text-blue-600 text-sm">👍</Text>
                </View>
                <Text className="text-gray-600 text-sm">Like</Text>
              </TouchableOpacity>

              <TouchableOpacity className="flex-row items-center">
                <View className="w-8 h-8 bg-green-50 rounded-full items-center justify-center mr-1">
                  <Text className="text-green-600 text-sm">💬</Text>
                </View>
                <Text className="text-gray-600 text-sm">Reply</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity>
              <View className="w-8 h-8 bg-gray-50 rounded-full items-center justify-center">
                <Text className="text-gray-600 text-sm">⋯</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

export default PostCard;
