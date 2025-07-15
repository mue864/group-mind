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
  StyleSheet,
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
    // In a real app, you would generate a proper deep link
    // For now, we'll create a simple link that can be shared
    const baseUrl =
      Platform.OS === "ios" ? "groupmind://call" : "groupmind://call";

    return `${baseUrl}?channel=${channelName}&type=${callType}`;
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
      {/* Modal overlay */}
      <View style={styles.overlay}>
        {/* Modal container */}
        <View style={styles.container}>
          {/* Header section */}
          <View style={styles.header}>
            <Text style={styles.title}>Invite to Call</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Call information display */}
          <View style={styles.callInfo}>
            <Ionicons
              name={callType === "video" ? "videocam" : "call"}
              size={40}
              color="#4169E1"
            />
            <Text style={styles.callType}>
              {callType === "video" ? "Video" : "Audio"} Call
            </Text>
            <Text style={styles.groupName}>{groupName}</Text>
            <Text style={styles.channelName}>Channel: {channelName}</Text>
          </View>

          {/* Invitation options */}
          <View style={styles.options}>
            {/* Share call link option */}
            <TouchableOpacity
              style={styles.optionButton}
              onPress={handleShareCall}
              disabled={isSharing}
              accessibilityLabel="Share call link"
              accessibilityRole="button"
            >
              <Ionicons name="share-outline" size={24} color="#4169E1" />
              <Text style={styles.optionText}>
                {isSharing ? "Sharing..." : "Share Call Link"}
              </Text>
            </TouchableOpacity>

            {/* Copy link option */}
            <TouchableOpacity
              style={styles.optionButton}
              onPress={handleCopyLink}
              accessibilityLabel="Copy call link"
              accessibilityRole="button"
            >
              <Ionicons name="copy-outline" size={24} color="#4169E1" />
              <Text style={styles.optionText}>Copy Link</Text>
            </TouchableOpacity>

            {/* Send notifications option */}
            <TouchableOpacity
              style={styles.optionButton}
              onPress={handleSendNotification}
              accessibilityLabel="Send notifications to group members"
              accessibilityRole="button"
            >
              <Ionicons
                name="notifications-outline"
                size={24}
                color="#4169E1"
              />
              <Text style={styles.optionText}>Send Notifications</Text>
            </TouchableOpacity>
          </View>

          {/* Instructions section */}
          <View style={styles.instructions}>
            <Text style={styles.instructionsTitle}>How to join:</Text>
            <Text style={styles.instructionsText}>
              1. Share the call link with group members{"\n"}
              2. They can tap the link to join the call{"\n"}
              3. Or they can navigate to the group and join manually
            </Text>
          </View>

          {/* Close button */}
          <TouchableOpacity
            style={styles.closeButtonLarge}
            onPress={onClose}
            accessibilityLabel="Close invitation modal"
            accessibilityRole="button"
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

/**
 * Styles for the CallInvitation component
 * Clean, modern design with proper spacing and accessibility
 */
const styles = StyleSheet.create({
  // Modal overlay background
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  // Main modal container
  container: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    width: "90%",
    maxWidth: 400,
    maxHeight: "80%",
  },

  // Header section with title and close button
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  // Modal title
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },

  // Close button in header
  closeButton: {
    padding: 5,
  },

  // Call information display section
  callInfo: {
    alignItems: "center",
    marginBottom: 30,
    paddingVertical: 20,
    backgroundColor: "#f8f9fa",
    borderRadius: 15,
  },

  // Call type text (Video/Audio)
  callType: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginTop: 10,
  },

  // Group name display
  groupName: {
    fontSize: 16,
    color: "#666",
    marginTop: 5,
  },

  // Channel name display
  channelName: {
    fontSize: 12,
    color: "#999",
    marginTop: 5,
  },

  // Options section containing sharing buttons
  options: {
    marginBottom: 20,
  },

  // Individual option button
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
    marginBottom: 10,
  },

  // Option button text
  optionText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 10,
  },

  // Instructions section
  instructions: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: "#f0f8ff",
    borderRadius: 10,
  },

  // Instructions title
  instructionsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },

  // Instructions text
  instructionsText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },

  // Large close button at bottom
  closeButtonLarge: {
    backgroundColor: "#4169E1",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: "center",
  },

  // Close button text
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default CallInvitation;
