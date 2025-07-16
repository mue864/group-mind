import HR from "@/assets/icons/hr2.svg";
import SearchBar from "@/components/SearchBar";
import ShareModal from "@/components/ShareModal";
import { db } from "@/services/firebase";
import { useGroupContext } from "@/store/GroupContext";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams } from "expo-router";
import { collection, onSnapshot, Timestamp } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Dimensions,
  Linking,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

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
}

function GroupResources() {
  const { user, userInformation, saveGroupResource } = useGroupContext();
  const { groupId } = useLocalSearchParams();
  const deviceWidth = Dimensions.get("window").width;

  const [resources, setResources] = useState<Resource[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(
    null
  );
  const [isShareModalVisible, setIsShareModalVisible] = useState(false);
  const [actualGroupId, setActualGroupId] = useState<string | undefined>(
    groupId?.toString()
  );

  // Set groupId from params
  useEffect(() => {
    if (groupId) {
      setActualGroupId(groupId.toString());
    }
  }, [groupId]);

  // Fallback: get groupId from AsyncStorage if not available from params
  useEffect(() => {
    const getGroupIdFromStorage = async () => {
      if (!actualGroupId) {
        try {
          const storedGroupId = await AsyncStorage.getItem("groupID");
          if (storedGroupId) {
            setActualGroupId(storedGroupId);
          }
        } catch (error) {
          console.error("Error getting groupId from storage:", error);
        }
      }
    };
    getGroupIdFromStorage();
  }, [actualGroupId]);

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
        resource.uploadedByUserName.toLowerCase().includes(query)
      );
    });
  }, [resources, searchQuery]);

  // Fetch group name
  useEffect(() => {
    const fetchGroupName = async () => {
      try {
        const groupName = await AsyncStorage.getItem("groupName");
        if (groupName) {
          setGroupName(groupName);
        }
      } catch (error) {
        console.error("Error fetching group name:", error);
      }
    };

    fetchGroupName();
  }, [groupId]);

  // Fetch resources
  useEffect(() => {
    if (!actualGroupId) return;

    const unsubscribe = onSnapshot(
      collection(db, "groups", actualGroupId, "resources"),
      (snapshot) => {
        const resourcesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Resource[];
        setResources(resourcesData);
      },
      (error) => {
        console.error("Error fetching resources:", error);
      }
    );

    return () => unsubscribe();
  }, [actualGroupId]);

  const handleFileUploaded = async (fileUrl: string, fileName: string) => {
    if (!user || !actualGroupId) {
      return;
    }

    try {
      await saveGroupResource({
        groupId: actualGroupId,
        name: fileName,
        url: fileUrl,
        type: getFileType(fileName),
        uploadedBy: user.uid,
        uploadedByUserName: userInformation?.userName || "Unknown User",
        uploadedAt: Timestamp.now(),
        fileSize: 0, // You can add file size calculation if needed
      });

      Alert.alert("Success", "File saved to group resources!");
    } catch (error) {
      console.error("Error saving to Firestore:", error);
      Alert.alert(
        "Error",
        "File uploaded to Cloudinary but failed to save to group. Please try again."
      );
    }
  };

  const getFileType = (fileName: string): string => {
    const extension = fileName.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "pdf":
        return "PDF";
      case "doc":
      case "docx":
        return "Document";
      case "xls":
      case "xlsx":
        return "Spreadsheet";
      case "ppt":
      case "pptx":
        return "Presentation";
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return "Image";
      case "mp4":
      case "avi":
      case "mov":
        return "Video";
      case "mp3":
      case "wav":
        return "Audio";
      default:
        return "File";
    }
  };

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
      // Use the FileDownload component's functionality
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

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex flex-row items-center justify-between mx-4 mt-4 relative">
        <Text className="absolute left-1/2 -translate-x-1/2 text-2xl font-poppins-semiBold">
          Resources
        </Text>

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

      <View className="mt-2">
        <HR width={deviceWidth} height={2} />
      </View>

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
          <View className="flex-1 justify-center items-center">
            <Ionicons name="folder-open-outline" size={100} color="#9CA3AF" />
            <Text className="font-poppins-semiBold text-gray-500 text-center mt-4">
              {searchQuery
                ? `No resources found for "${searchQuery}"`
                : "No resources found"}
            </Text>
            <Text className="font-inter text-gray-400 text-center mt-2">
              Upload files to share with your group
            </Text>
          </View>
        )}
      </View>

      {/* Upload Button */}
      <View className="p-4 absolute bottom-20 left-12 right-12">
        <TouchableOpacity
          className="bg-primary rounded-xl p-4 items-center shadow-sm"
          onPress={() => {
            setIsModalVisible(true);
          }}
          activeOpacity={0.8}
        >
          <Text className="text-white text-base font-poppins-semiBold">
            📁 Upload Resource
          </Text>
        </TouchableOpacity>
      </View>

      {/* Upload Modal */}
      <ShareModal
        visible={isModalVisible}
        onDismiss={() => setIsModalVisible(false)}
        onFileUploaded={handleFileUploaded}
      />

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
}

export default GroupResources;
