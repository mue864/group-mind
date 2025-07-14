import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import React from "react";
import { Alert, Linking, Text, TouchableOpacity, View } from "react-native";

interface FileDownloadProps {
  fileUrl: string;
  fileName: string;
  fileType?: string;
}

const FileDownload: React.FC<FileDownloadProps> = ({
  fileUrl,
  fileName,
  fileType,
}) => {
  // Simple download - opens in browser
  const openInBrowser = async () => {
    try {
      const supported = await Linking.canOpenURL(fileUrl);
      if (supported) {
        await Linking.openURL(fileUrl);
      } else {
        Alert.alert("Error", "Cannot open this file type");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to open file");
    }
  };

  // Download to device (if supported)
  const downloadToDevice = async () => {
    try {
      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();

      if (isAvailable) {
        // Download file to cache
        const downloadResumable = FileSystem.createDownloadResumable(
          fileUrl,
          FileSystem.documentDirectory + fileName,
          {},
          (downloadProgress) => {
            const progress =
              downloadProgress.totalBytesWritten /
              downloadProgress.totalBytesExpectedToWrite;
            console.log(`Download progress: ${progress * 100}%`);
          }
        );

        const { uri } = await downloadResumable.downloadAsync();

        // Share the downloaded file
        await Sharing.shareAsync(uri, {
          mimeType: fileType || "application/octet-stream",
          dialogTitle: `Download ${fileName}`,
        });
      } else {
        // Fallback to browser
        openInBrowser();
      }
    } catch (error) {
      console.error("Download failed:", error);
      Alert.alert(
        "Download Failed",
        "Could not download file. Opening in browser instead."
      );
      openInBrowser();
    }
  };

  // Get file icon based on type
  const getFileIcon = () => {
    if (!fileType) return "document-outline";

    if (fileType.startsWith("image/")) return "image-outline";
    if (fileType.includes("pdf")) return "document-text-outline";
    if (fileType.includes("word") || fileType.includes("document"))
      return "document-outline";
    if (fileType.includes("excel") || fileType.includes("spreadsheet"))
      return "grid-outline";
    if (fileType.includes("powerpoint") || fileType.includes("presentation"))
      return "easel-outline";
    if (fileType.includes("video/")) return "videocam-outline";
    if (fileType.includes("audio/")) return "musical-notes-outline";

    return "document-outline";
  };

  return (
    <View className="bg-gray-50 rounded-lg p-3 mb-2">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <Ionicons
            name={getFileIcon() as any}
            size={24}
            color="#6B7280"
            style={{ marginRight: 12 }}
          />
          <View className="flex-1">
            <Text
              className="text-gray-800 font-medium text-sm"
              numberOfLines={1}
            >
              {fileName}
            </Text>
            <Text className="text-gray-500 text-xs">
              {fileType || "Unknown type"}
            </Text>
          </View>
        </View>

        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={openInBrowser}
            className="bg-blue-500 px-3 py-2 rounded-lg"
          >
            <Text className="text-white text-xs font-medium">View</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={downloadToDevice}
            className="bg-green-500 px-3 py-2 rounded-lg"
          >
            <Text className="text-white text-xs font-medium">Download</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default FileDownload;
