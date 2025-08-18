/**
 * CallInvitation Component
 *
 * This component provides a modal interface for inviting others to join video/audio calls.
 * It offers multiple sharing options including native sharing, link copying, and push notifications.
 *
 * Features:
 * - Native sharing integration
 * - Call link generation and copying
 * - Push notification support (placeholder)
 * - Cross-platform compatibility
 * - Clear joining instructions
 * - Responsive design
 *
 * @author GroupMind Team
 * @version 1.0.0
 */

import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  Share,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useGroupContext } from "../store/GroupContext";

/**
 * Props interface for CallInvitation component
 */
interface CallInvitationProps {
  visible: boolean; // Whether the modal is visible
  onClose: () => void; // Callback to close the modal
  channelName: string; // Channel name for the call
  callType: "audio" | "video"; // Type of call (audio or video)
  groupName?: string; // Optional group name for display
  groupId?: string; // Optional group id to include in deep link
  callId?: string; // Optional call document id (active calls)
  callDocId?: string; // Optional call doc id used by client logic
}

/**
 * CallInvitation Component - Modal for inviting others to calls
 *
 * This component provides a user-friendly interface for sharing call invitations
 * with multiple options including native sharing, link copying, and notifications.
 */
const CallInvitation: React.FC<CallInvitationProps> = ({
  visible,
  onClose,
  channelName,
  callType,
  groupName = "Group",
  groupId,
  callId,
  callDocId,
}) => {
  // Get user context for personalization
  const { user, userInformation } = useGroupContext();

  // State for tracking sharing operations
  const [isSharing, setIsSharing] = useState(false);

  /**
   * Generate a call link for sharing
   * Creates a deep link that can be used to join the call
   *
   * @returns Generated call link
   */
  const generateCallLink = (): string => {
    const baseUrl =
      Platform.OS === "ios" ? "groupmind://call" : "groupmind://call";
    const params = new URLSearchParams();
    params.set("channel", channelName);
    params.set("type", callType);
    if (groupId) params.set("groupId", groupId);
    if (callId) params.set("callId", callId);
    if (callDocId) params.set("callDocId", callDocId);
    return `${baseUrl}?${params.toString()}`;
  };

  /**
   * Share call invitation using native sharing
   * Uses the device's native share functionality
   */
  const handleShareCall = async () => {
    try {
      // Sharing call invitation
      setIsSharing(true);

      // Generate the call link
      const callLink = generateCallLink();

      // Create personalized message
      const message = `${
        userInformation?.userName || "Someone"
      } is inviting you to join a ${callType} call in ${groupName}.\n\nJoin here: ${callLink}`;

      // Use native share functionality
      const result = await Share.share({
        message,
        title: `Join ${callType} call in ${groupName}`,
        url: callLink, // iOS only
      });

      // Handle share result
      if (result.action === Share.sharedAction) {
        // Call invitation shared successfully
        Alert.alert("Success", "Call invitation shared successfully!");
      }
    } catch (error) {
      console.error("CallInvitation: Error sharing call:", error);
      Alert.alert(
        "Error",
        "Failed to share call invitation. Please try again."
      );
    } finally {
      setIsSharing(false);
    }
  };

  /**
   * Copy call link to clipboard
   * Shows the link in an alert for easy copying
   */
  const handleCopyLink = async () => {
    try {
      // Copying call link
      const callLink = generateCallLink();

      // For now, we'll just show the link
      // In a real app, you'd copy it to clipboard using Clipboard API
      Alert.alert(
        "Call Link",
        `Copy this link to invite others:\n\n${callLink}`,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Share Instead", onPress: handleShareCall },
        ]
      );
    } catch (error) {
      console.error("CallInvitation: Error copying link:", error);
      Alert.alert("Error", "Failed to copy link. Please try again.");
    }
  };

  /**
   * Send push notifications to group members
   * Placeholder for future push notification implementation
   */
  const handleSendNotification = () => {
    // Send notifications requested

    // In a real app, you would send push notifications to group members
    Alert.alert(
      "Send Notifications",
      "This would send push notifications to all group members. Feature coming soon!",
      [{ text: "OK" }]
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center">
        <View
          className="bg-white rounded-2xl p-5 w-11/12"
          style={{ maxWidth: 400, maxHeight: "80%" }}
        >
          <View className="flex-row justify-between items-center mb-5">
            <Text className="text-xl font-bold text-gray-800">
              Invite to Call
            </Text>
            <TouchableOpacity onPress={onClose} className="p-1.5">
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View className="items-center mb-7 py-5 bg-gray-50 rounded-xl">
            <Ionicons
              name={callType === "video" ? "videocam" : "call"}
              size={40}
              color="#4169E1"
            />
            <Text className="text-lg font-semibold text-gray-800 mt-2">
              {callType === "video" ? "Video" : "Audio"} Call
            </Text>
            <Text className="text-base text-gray-600 mt-1">{groupName}</Text>
          </View>

          <View className="mb-5">
            <TouchableOpacity
              className="flex-row items-center py-4 px-5 bg-gray-50 rounded-lg mb-2.5"
              onPress={handleShareCall}
              disabled={isSharing}
              accessibilityLabel="Share call link"
              accessibilityRole="button"
            >
              <Ionicons name="share-outline" size={24} color="#4169E1" />
              <Text className="text-base text-gray-800 ml-2.5">
                {isSharing ? "Sharing..." : "Share Call Link"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center py-4 px-5 bg-gray-50 rounded-lg mb-2.5"
              onPress={handleCopyLink}
              accessibilityLabel="Copy call link"
              accessibilityRole="button"
            >
              <Ionicons name="copy-outline" size={24} color="#4169E1" />
              <Text className="text-base text-gray-800 ml-2.5">Copy Link</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center py-4 px-5 bg-gray-50 rounded-lg"
              onPress={handleSendNotification}
              accessibilityLabel="Send notifications to group members"
              accessibilityRole="button"
            >
              <Ionicons
                name="notifications-outline"
                size={24}
                color="#4169E1"
              />
              <Text className="text-base text-gray-800 ml-2.5">
                Send Notifications
              </Text>
            </TouchableOpacity>
          </View>

          <View className="mb-5 p-4 bg-blue-50 rounded-lg">
            <Text className="text-base font-semibold text-gray-800 mb-2">
              How to join:
            </Text>
            <Text className="text-sm text-gray-600 leading-5">
              1. Share the call link with group members{"\n"}
              2. They can tap the link to join the call{"\n"}
              3. Or they can navigate to the group and join manually
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Converted to NativeWind classes; no StyleSheet below

export default CallInvitation;
