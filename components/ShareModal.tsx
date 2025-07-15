import File from "@/assets/icons/file.svg";
import Image from "@/assets/icons/image.svg";
import * as DocumentPicker from "expo-document-picker";
import { useState } from "react";
import {
  Alert,
  Pressable,
  Image as RNImage,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Modal } from "react-native-paper";

/**
 * Props interface for ShareModal component
 * @interface ShareModalProps
 * @property {boolean} visible - Controls whether the modal is visible
 * @property {() => void} onDismiss - Callback function called when modal is dismissed
 * @property {(fileUrl: string, fileName: string) => void} [onFileUploaded] - Optional callback when file upload completes
 */
interface ShareModalProps {
  visible: boolean;
  onDismiss: () => void;
  onFileUploaded?: (fileUrl: string, fileName: string) => void;
}

/**
 * Interface for selected file data
 * @interface SelectedFile
 * @property {string} uri - File URI from document picker
 * @property {string} name - File name
 * @property {string} type - File type ('image' or 'document')
 * @property {string} [mimeType] - MIME type of the file
 */
interface SelectedFile {
  uri: string;
  name: string;
  type: string;
  mimeType?: string;
}

/**
 * ShareModal Component
 *
 * A modal component that allows users to select and upload files to Cloudinary.
 * Supports both images and documents with preview functionality.
 *
 * Features:
 * - File selection (images and documents)
 * - File preview before upload
 * - Cloudinary integration
 * - Loading states and error handling
 * - Responsive design for mobile
 *
 * @param {ShareModalProps} props - Component props
 * @returns {JSX.Element} Modal component
 */
const ShareModal = ({
  visible,
  onDismiss,
  onFileUploaded,
}: ShareModalProps) => {
  // State for tracking selected file
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);

  // State for tracking upload progress
  const [isUploading, setIsUploading] = useState(false);

  /**
   * Uploads a file to Cloudinary
   *
   * This function handles the complete upload process:
   * 1. Creates FormData with file and configuration
   * 2. Sends POST request to Cloudinary API
   * 3. Handles success/error responses
   * 4. Calls callback with uploaded file URL
   *
   * @param {DocumentPicker.DocumentPickerAsset} file - File object from document picker
   * @returns {Promise<string | null>} Cloudinary URL on success, null on failure
   */
  const uploadToCloudinary = async (
    file: DocumentPicker.DocumentPickerAsset
  ) => {
    try {
      // Set uploading state to show loading UI
      setIsUploading(true);
      // Starting Cloudinary upload

      // Create FormData for multipart upload
      const formData = new FormData();

      // Append file data with proper typing for React Native
      formData.append("file", {
        uri: file.uri,
        type: file.mimeType || "application/octet-stream",
        name: file.name || "file",
      } as any);

      // Add Cloudinary upload preset (configured in Cloudinary dashboard)
      formData.append("upload_preset", "groupmind_uploads");

      // Optional: Organize files in a folder structure
      formData.append("folder", "groupmind-files");

      // Uploading to Cloudinary

      // Send POST request to Cloudinary upload API
      const response = await fetch(
        "https://api.cloudinary.com/v1_1/dwb9tz5ok/auto/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      // Check if upload was successful
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      // Parse response to get file URL
      const data = await response.json();
      // File uploaded to Cloudinary successfully

      // Show success message to user
      Alert.alert("Upload successful", "File uploaded successfully!");

      // Call the callback function if provided
      if (onFileUploaded) {
        onFileUploaded(data.secure_url, file.name || "Unknown file");
      }

      // Reset modal state and close modal
      setSelectedFile(null);
      onDismiss();

      return data.secure_url;
    } catch (err) {
      // Handle upload errors
      console.error("❌ Cloudinary upload error:", err);
      Alert.alert(
        "Upload failed",
        err instanceof Error ? err.message : "Failed to upload file"
      );
      return null;
    } finally {
      // Always reset uploading state
      setIsUploading(false);
    }
  };

  /**
   * Handles image file selection
   *
   * Opens document picker with image file types only.
   * Sets selectedFile state with image data for preview.
   */
  const imagePicker = async () => {
    try {
      // Open document picker for images only
      const result = await DocumentPicker.getDocumentAsync({
        type: "image/*", // Allow all image formats
        copyToCacheDirectory: true, // Copy file to app cache for processing
        multiple: false, // Single file selection only
      });

      if (!result.canceled) {
        const file = result.assets[0];
        // Image picked successfully

        // Set selected file for preview
        setSelectedFile({
          uri: file.uri,
          name: file.name || "Image",
          type: "image",
          mimeType: file.mimeType,
        });
      } else {
        // User cancelled image picking
      }
    } catch (err) {
      console.error("Image picking error:", err);
    }
  };

  /**
   * Handles document file selection
   *
   * Opens document picker with supported document types.
   * Sets selectedFile state with document data for preview.
   */
  const filePicker = async () => {
    try {
      // Open document picker for various document types
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf", // PDF files
          "application/msword", // Word documents (.doc)
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // Word documents (.docx)
          "application/vnd.ms-powerpoint", // PowerPoint (.ppt)
          "application/vnd.openxmlformats-officedocument.presentationml.presentation", // PowerPoint (.pptx)
          "application/vnd.ms-excel", // Excel (.xls)
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // Excel (.xlsx)
          "text/plain", // Text files
        ],
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (!result.canceled) {
        const file = result.assets[0];
        // File picked successfully

        // Set selected file for preview
        setSelectedFile({
          uri: file.uri,
          name: file.name || "Document",
          type: "document",
          mimeType: file.mimeType,
        });
      } else {
        // User cancelled file picking
      }
    } catch (err) {
      console.error("File picking error:", err);
    }
  };

  /**
   * Handles send button press
   *
   * Initiates file upload to Cloudinary if a file is selected.
   * Shows loading state during upload process.
   */
  const handleSend = async () => {
    if (selectedFile) {
      await uploadToCloudinary(selectedFile as any);
    }
  };

  /**
   * Handles cancel button press
   *
   * Resets modal state and closes the modal.
   * Clears any selected file data.
   */
  const handleCancel = () => {
    setSelectedFile(null);
    onDismiss();
  };

  /**
   * Determines file icon based on MIME type
   *
   * Returns appropriate icon component for different file types.
   * Used for visual representation in the UI.
   *
   * @param {string} [mimeType] - MIME type of the file
   * @returns {any} Icon component (Image or File)
   */
  const getFileIcon = (mimeType?: string) => {
    if (!mimeType) return File;

    // Check for image types
    if (mimeType.startsWith("image/")) return Image;

    // Check for specific document types
    if (mimeType.includes("pdf")) return File;
    if (mimeType.includes("word") || mimeType.includes("document")) return File;
    if (mimeType.includes("excel") || mimeType.includes("spreadsheet"))
      return File;
    if (mimeType.includes("powerpoint") || mimeType.includes("presentation"))
      return File;

    // Default to file icon
    return File;
  };

  /**
   * Formats file size in human-readable format
   *
   * Converts bytes to KB, MB, GB with appropriate units.
   *
   * @param {number} [bytes] - File size in bytes
   * @returns {string} Formatted file size string
   */
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Unknown size";
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <Modal
      visible={visible}
      onDismiss={onDismiss}
      contentContainerStyle={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
      dismissable={true}
    >
      {/* Overlay area that closes modal when tapped outside */}
      <Pressable
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
        onPress={onDismiss}
      >
        {/* Inner pressable to prevent modal from closing when tapped inside */}
        <Pressable onPress={(e) => e.stopPropagation()}>
          <View className="bg-white p-6 rounded-lg w-80 items-center flex-col justify-center">
            {/* Modal title */}
            <View className="flex items-center mb-4">
              <Text className="text-center font-inter text-gray-800 text-xl font-bold">
                {selectedFile ? "File Preview" : "Select Files"}
              </Text>
            </View>

            {/* File Preview Section */}
            {selectedFile ? (
              <View className="w-full items-center">
                {/* File Preview */}
                <View className="w-full bg-gray-50 rounded-lg p-4 mb-4">
                  {selectedFile.type === "image" ? (
                    <RNImage
                      source={{ uri: selectedFile.uri }}
                      className="w-full h-40 rounded-lg"
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="w-full h-40 bg-gray-200 rounded-lg items-center justify-center">
                      <File width={60} height={60} />
                      <Text className="text-gray-600 mt-2 text-center">
                        {selectedFile.name}
                      </Text>
                    </View>
                  )}
                </View>

                {/* File Info */}
                <View className="w-full mb-4">
                  <Text className="text-gray-800 font-semibold text-center mb-1">
                    {selectedFile.name}
                  </Text>
                  <Text className="text-gray-500 text-sm text-center">
                    {selectedFile.mimeType || "Unknown type"}
                  </Text>
                </View>

                {/* Action Buttons */}
                <View className="flex-row gap-3 w-full">
                  <TouchableOpacity
                    className="flex-1 bg-gray-300 py-3 rounded-lg items-center"
                    onPress={handleCancel}
                    disabled={isUploading}
                  >
                    <Text className="text-gray-700 font-semibold">Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className={`flex-1 py-3 rounded-lg items-center ${
                      isUploading ? "bg-gray-400" : "bg-blue-500"
                    }`}
                    onPress={handleSend}
                    disabled={isUploading}
                  >
                    <Text className="text-white font-semibold">
                      {isUploading ? "Uploading..." : "Send"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              /* File Selection Section */
              <View className="w-full">
                <Text className="text-gray-600 text-center mb-4">
                  Choose a file to upload
                </Text>

                {/* File options: Image + Other Files */}
                <View className="flex-row gap-4 justify-center">
                  {/* Image Picker Button */}
                  <TouchableOpacity
                    className="flex flex-col items-center gap-2 bg-blue-50 p-4 rounded-lg"
                    onPress={imagePicker}
                  >
                    <Image width={50} height={50} />
                    <Text className="text-blue-600 font-medium text-sm">
                      Images
                    </Text>
                  </TouchableOpacity>

                  {/* Document Picker Button */}
                  <TouchableOpacity
                    className="flex flex-col items-center gap-2 bg-green-50 p-4 rounded-lg"
                    onPress={filePicker}
                  >
                    <File width={50} height={50} />
                    <Text className="text-green-600 font-medium text-sm">
                      Documents
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default ShareModal;
