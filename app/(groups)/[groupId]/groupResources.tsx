import Back from "@/assets/icons/Arrow_left.svg";
import HR from "@/assets/icons/hr2.svg";
import FileDownload from "@/components/FileDownload";
import SearchBar from "@/components/SearchBar";
import ShareModal from "@/components/ShareModal";
import { db } from "@/services/firebase";
import { useGroupContext } from "@/store/GroupContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import { addDoc, collection, onSnapshot, Timestamp } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Dimensions,
  StyleSheet,
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
  uploadedAt: Timestamp;
  fileSize?: number;
}

function GroupResources() {
  const { user, userInformation } = useGroupContext();
  const { groupId } = useLocalSearchParams();
  const deviceWidth = Dimensions.get("window").width;

  const [resources, setResources] = useState<Resource[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

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
        resource.uploadedBy.toLowerCase().includes(query)
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
    if (!groupId) return;

    const unsubscribe = onSnapshot(
      collection(db, "groups", groupId.toString(), "resources"),
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
  }, [groupId]);

  const handleFileUploaded = async (fileUrl: string, fileName: string) => {
    if (!user || !groupId) return;

    try {
      const resourceData = {
        name: fileName,
        url: fileUrl,
        type: getFileType(fileName),
        uploadedBy: userInformation?.userName || "Unknown User",
        uploadedAt: Timestamp.now(),
        fileSize: 0, // You can add file size calculation if needed
      };

      await addDoc(
        collection(db, "groups", groupId.toString(), "resources"),
        resourceData
      );

      Alert.alert("Success", "File uploaded successfully!");
    } catch (error) {
      console.error("Error uploading file:", error);
      Alert.alert("Error", "Failed to upload file. Please try again.");
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

  return (
    <View className="flex-1 bg-[#F5F6FA]">
      {/* Header */}
      <View className="flex flex-row items-center justify-between mx-4 mt-4 relative">
        <TouchableOpacity
          onPress={() => router.push(`/(groups)/${groupId}`)}
          activeOpacity={0.7}
        >
          <Back />
        </TouchableOpacity>

        <Text className="absolute left-1/2 -translate-x-1/2 text-2xl font-bold">
          Resources
        </Text>

        <TouchableOpacity
          onPress={() => setShowSearch(!showSearch)}
          activeOpacity={0.7}
        >
          <Text style={styles.searchButton}>{showSearch ? "✕" : "🔍"}</Text>
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
            <View key={resource.id} style={styles.resourceCard}>
              <View style={styles.resourceInfo}>
                <Text style={styles.resourceName}>{resource.name}</Text>
                <Text style={styles.resourceType}>{resource.type}</Text>
                <Text style={styles.resourceMeta}>
                  Uploaded by {resource.uploadedBy} on{" "}
                  {formatDate(resource.uploadedAt)}
                </Text>
                {resource.fileSize && (
                  <Text style={styles.resourceSize}>
                    {formatFileSize(resource.fileSize)}
                  </Text>
                )}
              </View>
              <FileDownload fileUrl={resource.url} fileName={resource.name} />
            </View>
          ))
        ) : searchQuery.trim() ? (
          <View className="flex-1 justify-center items-center p-5">
            <Text className="text-gray-400 text-base">
              No resources found for "{searchQuery}"
            </Text>
          </View>
        ) : (
          <View className="flex-1 justify-center items-center p-5">
            <Text className="text-gray-400 text-base">No resources yet</Text>
          </View>
        )}
      </View>

      {/* Upload Button */}
      <View className="p-4">
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={() => setIsModalVisible(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.uploadButtonText}>📁 Upload Resource</Text>
        </TouchableOpacity>
      </View>

      <ShareModal
        visible={isModalVisible}
        onDismiss={() => setIsModalVisible(false)}
        onFileUploaded={handleFileUploaded}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  searchButton: {
    fontSize: 20,
    color: "#4169E1",
    fontWeight: "bold",
  },
  resourceCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resourceInfo: {
    flex: 1,
  },
  resourceName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  resourceType: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 4,
  },
  resourceMeta: {
    fontSize: 12,
    color: "#9ca3af",
    marginBottom: 2,
  },
  resourceSize: {
    fontSize: 12,
    color: "#9ca3af",
  },
  uploadButton: {
    backgroundColor: "#4169E1",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  uploadButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default GroupResources;
