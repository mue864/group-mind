import SearchBar from "@/components/SearchBar";
import ShareModal from "@/components/ShareModal";
import { useGroupContext } from "@/store/GroupContext";
import { Ionicons } from "@expo/vector-icons";
import { Timestamp } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { Alert, Linking, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

interface Resource {
  id: string;
  name: string;
  url: string;
  type: string;
  uploadedBy: string;
  uploadedByUserName: string;
  uploadedAt: Timestamp;
  fileSize?: number;
  groupId: string;
  groupName?: string;
}

const Resources = () => {
  const { getAllUserResources, user } = useGroupContext();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(
    null
  );
  const [isShareModalVisible, setIsShareModalVisible] = useState(false);

  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 1000 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: opacity.value }],
  }));

  // Fetch all user resources
  useEffect(() => {
    const fetchResources = async () => {
      try {
        setLoading(true);
        const userResources = await getAllUserResources(user?.uid);
        setResources(userResources);
      } catch (error) {
        console.error("Error fetching user resources:", error);
        Alert.alert("Error", "Failed to load resources");
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, [getAllUserResources, user?.uid]);

  // Filter resources based on search query
  const filteredResources = useMemo(() => {
    if (!searchQuery.trim()) {
      return resources;
    }

    const query = searchQuery.toLowerCase();
    return resources.filter((resource) => {
      return (
        resource.name.toLowerCase().includes(query) ||
        resource.type.toLowerCase().includes(query) ||
        resource.uploadedByUserName.toLowerCase().includes(query) ||
        (resource.groupName && resource.groupName.toLowerCase().includes(query))
      );
    });
  }, [resources, searchQuery]);

  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "pdf":
        return "document-text-outline";
      case "document":
        return "document-outline";
      case "spreadsheet":
        return "grid-outline";
      case "presentation":
        return "easel-outline";
      case "image":
        return "image-outline";
      case "video":
        return "videocam-outline";
      case "audio":
        return "musical-notes-outline";
      default:
        return "document-outline";
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (timestamp: Timestamp): string => {
    const date = timestamp.toDate();
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  const handleShare = (resource: Resource) => {
    setSelectedResource(resource);
    setIsShareModalVisible(true);
  };

  const handleDownload = async (resource: Resource) => {
    try {
      // Use Linking to open the file URL in browser
      const supported = await Linking.canOpenURL(resource.url);
      if (supported) {
        await Linking.openURL(resource.url);
      } else {
        Alert.alert("Error", "Cannot open this file type");
      }
    } catch (error) {
      console.error("Error downloading file:", error);
      Alert.alert("Error", "Failed to download file");
    }
  };

  if (loading) {
    return (
      <View className="flex-1  bg-white justify-center items-center">
        <Animated.View style={animatedStyle}>
          <View className="items-center">
            <Ionicons name="cloud-download-outline" size={60} color="#2563EB" />
          </View>
          <Text className="font-poppins-semiBold text-gray-600 mt-4">
            Loading your resources...
          </Text>
        </Animated.View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex flex-row items-center justify-between mx-4 mt-4 relative">
        <TouchableOpacity
          onPress={() => setShowSearch(!showSearch)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={showSearch ? "close" : "search"}
            size={24}
            color="#2563EB"
          />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      {showSearch && (
        <SearchBar
          placeholder="Search resources..."
          onSearch={setSearchQuery}
          onClear={() => setSearchQuery("")}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      )}

      {/* Resources List */}
      <View className="flex-1 px-4 py-2">
        {filteredResources.length > 0 ? (
          filteredResources.map((resource) => (
            <View
              key={resource.id}
              className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100"
            >
              <View className="flex-row items-center mb-3">
                <Ionicons
                  name={getFileIcon(resource.type) as any}
                  size={24}
                  color="#2563EB"
                />
                <View className="flex-1 ml-3">
                  <Text className="text-base font-poppins-semiBold text-gray-800 mb-1">
                    {resource.name}
                  </Text>
                  <Text className="text-sm font-inter text-gray-600">
                    {resource.type} • {resource.uploadedByUserName}
                  </Text>
                  {resource.groupName && (
                    <Text className="text-xs font-inter text-gray-500 mt-1">
                      From: {resource.groupName}
                    </Text>
                  )}
                </View>
              </View>

              <View className="flex-row items-center justify-between">
                <Text className="text-xs font-inter text-gray-500">
                  {formatDate(resource.uploadedAt)}
                  {resource.fileSize &&
                    ` • ${formatFileSize(resource.fileSize)}`}
                </Text>

                <View className="flex-row">
                  <TouchableOpacity
                    onPress={() => handleDownload(resource)}
                    className="mr-3 p-2"
                  >
                    <Ionicons
                      name="download-outline"
                      size={20}
                      color="#2563EB"
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleShare(resource)}
                    className="p-2"
                  >
                    <Ionicons name="share-outline" size={20} color="#2563EB" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        ) : (
          <Animated.View
            className="flex-1 justify-center items-center"
            style={animatedStyle}
          >
            <Ionicons name="cloud-outline" size={100} color="#9CA3AF" />
            <Text className="font-poppins-semiBold text-gray-500 text-center mt-4">
              {searchQuery
                ? `No resources found for "${searchQuery}"`
                : "No resources found"}
            </Text>
            <Text className="font-inter text-gray-400 text-center mt-2">
              Upload files in your groups to see them here
            </Text>
          </Animated.View>
        )}
      </View>

      {/* Share Modal */}
      {selectedResource && (
        <ShareModal
          visible={isShareModalVisible}
          onDismiss={() => {
            setIsShareModalVisible(false);
            setSelectedResource(null);
          }}
          onFileUploaded={() => {}} // Empty function since this is for sharing, not uploading
        />
      )}
    </View>
  );
};

export default Resources;
